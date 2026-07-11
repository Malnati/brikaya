import {
  buildNaturalBoltGeometry,
  calculateLightningFadeAlpha,
  clampProgress,
  drawNaturalBolt,
  easeCubicOut,
  lightningUnitValue,
  type NaturalBoltGeometry,
  type ViewportGeometry,
} from "./electricLightningRenderer";

export type AmbientElectricVariantId = "pulse" | "arcade" | "storm";

export interface AmbientElectricPreset {
  id: AmbientElectricVariantId;
  label: string;
  minIntervalMs: number;
  maxIntervalMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  maxActiveBolts: number;
  fractalDepth: number;
  branchCount: number;
  tertiaryBranches: boolean;
  haloLineWidth: number;
  coreLineWidth: number;
  fadeStartProgress: number;
}

export const AMBIENT_ELECTRIC_PRESETS: Record<
  AmbientElectricVariantId,
  AmbientElectricPreset
> = {
  pulse: {
    id: "pulse",
    label: "Pulse",
    minIntervalMs: 2_400,
    maxIntervalMs: 4_800,
    minDurationMs: 420,
    maxDurationMs: 760,
    maxActiveBolts: 2,
    fractalDepth: 5,
    branchCount: 2,
    tertiaryBranches: false,
    haloLineWidth: 4.2,
    coreLineWidth: 1.4,
    fadeStartProgress: 0.72,
  },
  arcade: {
    id: "arcade",
    label: "Arcade",
    minIntervalMs: 1_100,
    maxIntervalMs: 2_600,
    minDurationMs: 360,
    maxDurationMs: 680,
    maxActiveBolts: 4,
    fractalDepth: 6,
    branchCount: 3,
    tertiaryBranches: false,
    haloLineWidth: 5.2,
    coreLineWidth: 1.7,
    fadeStartProgress: 0.68,
  },
  storm: {
    id: "storm",
    label: "Storm",
    minIntervalMs: 420,
    maxIntervalMs: 1_200,
    minDurationMs: 280,
    maxDurationMs: 560,
    maxActiveBolts: 7,
    fractalDepth: 7,
    branchCount: 5,
    tertiaryBranches: true,
    haloLineWidth: 6.4,
    coreLineWidth: 2.1,
    fadeStartProgress: 0.62,
  },
};

export const DEFAULT_AMBIENT_ELECTRIC_VARIANT: AmbientElectricVariantId =
  "arcade";

const REDUCED_MAX_ACTIVE_BOLTS = 1;
const REDUCED_SPAWN_INTERVAL_MS = 4_200;

interface AmbientBolt {
  geometry: NaturalBoltGeometry;
  startedAt: number;
  durationMs: number;
  intensity: number;
  scale: number;
}

function randomBetween(
  seed: number,
  min: number,
  max: number,
  salt: number,
): number {
  return min + lightningUnitValue(seed, salt) * (max - min);
}

export class AmbientElectricBackground {
  private bolts: AmbientBolt[] = [];
  private nextSpawnAt = 0;
  private sequence = 0;
  private variant: AmbientElectricVariantId;

  constructor(
    variant: AmbientElectricVariantId = DEFAULT_AMBIENT_ELECTRIC_VARIANT,
  ) {
    this.variant = variant;
  }

  setVariant(variant: AmbientElectricVariantId): void {
    this.variant = variant;
    this.bolts = [];
    this.nextSpawnAt = 0;
  }

  getVariant(): AmbientElectricVariantId {
    return this.variant;
  }

  reset(now = Date.now()): void {
    this.bolts = [];
    this.sequence = 0;
    this.nextSpawnAt = now;
  }

  forceBolt(viewport: ViewportGeometry, now = Date.now()): void {
    this.spawnBolt(viewport, now, true);
  }

  tick(
    viewport: ViewportGeometry,
    now: number,
    reducedEffects: boolean,
  ): void {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const maxActive = reducedEffects
      ? REDUCED_MAX_ACTIVE_BOLTS
      : preset.maxActiveBolts;

    this.bolts = this.bolts.filter(
      (bolt) => now - bolt.startedAt < bolt.durationMs,
    );

    if (reducedEffects) {
      if (this.bolts.length >= maxActive) return;
      if (now < this.nextSpawnAt) return;
      this.spawnBolt(viewport, now, false);
      this.nextSpawnAt = now + REDUCED_SPAWN_INTERVAL_MS;
      return;
    }

    if (this.nextSpawnAt === 0) {
      this.nextSpawnAt = now + preset.minIntervalMs * 0.35;
    }

    while (this.bolts.length < maxActive && now >= this.nextSpawnAt) {
      this.spawnBolt(viewport, now, false);
      this.sequence += 3;
      this.nextSpawnAt =
        now +
        randomBetween(
          this.sequence,
          preset.minIntervalMs,
          preset.maxIntervalMs,
          59,
        );
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    viewport: ViewportGeometry,
    now: number,
  ): void {
    if (this.bolts.length === 0) return;

    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const previousComposite = ctx.globalCompositeOperation;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const bolt of this.bolts) {
      const progress = clampProgress((now - bolt.startedAt) / bolt.durationMs);
      const revealProgress = easeCubicOut(progress);
      const fadeAlpha =
        calculateLightningFadeAlpha(progress, preset.fadeStartProgress) *
        bolt.intensity;

      drawNaturalBolt(ctx, bolt.geometry, revealProgress, fadeAlpha, bolt.scale, {
        haloLineWidth: preset.haloLineWidth,
        coreLineWidth: preset.coreLineWidth,
      });
    }

    ctx.restore();
    ctx.globalCompositeOperation = previousComposite;
  }

  getActiveBoltCount(): number {
    return this.bolts.length;
  }

  private spawnBolt(
    viewport: ViewportGeometry,
    now: number,
    immediate: boolean,
  ): void {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    if (this.bolts.length >= preset.maxActiveBolts) return;

    this.sequence += 1;
    const seed = this.sequence * 1_009 + (immediate ? 17 : 0);
    const geometry = buildNaturalBoltGeometry(viewport, seed, {
      fractalDepth: preset.fractalDepth,
      branchCount: preset.branchCount,
      tertiaryBranches: preset.tertiaryBranches,
    });

    this.bolts.push({
      geometry,
      startedAt: now,
      durationMs: randomBetween(
        seed,
        preset.minDurationMs,
        preset.maxDurationMs,
        41,
      ),
      intensity: 0.55 + lightningUnitValue(seed, 43) * 0.45,
      scale: 0.82 + lightningUnitValue(seed, 47) * 0.36,
    });
  }
}

export function drawFullScreenElectricBackdrop(
  ctx: CanvasRenderingContext2D,
  viewport: ViewportGeometry,
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, viewport.height);
  gradient.addColorStop(0, "#04070f");
  gradient.addColorStop(0.45, "#070d18");
  gradient.addColorStop(1, "#0a1220");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}

export function resolveAmbientElectricVariant(
  search: string | null | undefined,
): AmbientElectricVariantId {
  if (search === "pulse" || search === "arcade" || search === "storm") {
    return search;
  }
  return DEFAULT_AMBIENT_ELECTRIC_VARIANT;
}

export function readLightningVariantSearchParam(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return new URLSearchParams(window.location.search).get("lightning");
  } catch {
    return null;
  }
}
