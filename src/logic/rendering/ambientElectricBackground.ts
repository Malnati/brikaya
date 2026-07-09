import type { RadialPlayfieldGeometry } from "../../utils/radialGeometry";
import {
  ELECTRIC_LIGHTNING_CORE_COLOR,
  ELECTRIC_LIGHTNING_HALO_COLOR,
  ELECTRIC_LIGHTNING_SHADOW_COLOR,
  buildZigzagPoint,
  calculateLightningFadeAlpha,
  clampProgress,
  drawLightningPulse,
  drawLightningSideBranches,
  easeCubicOut,
  lightningUnitValue,
  randomEndpointAcrossCircle,
  randomPointInCircle,
  strokeLightningPath,
  type CircleGeometry,
  type LightningPoint,
} from "./electricLightningRenderer";

export type AmbientElectricVariantId = "pulse" | "arcade" | "storm";

export interface AmbientElectricPreset {
  id: AmbientElectricVariantId;
  label: string;
  minActiveBolts: number;
  maxActiveBolts: number;
  minSpawnIntervalMs: number;
  maxSpawnIntervalMs: number;
  minAlpha: number;
  maxAlpha: number;
  minDurationMs: number;
  maxDurationMs: number;
  minBranchCount: number;
  maxBranchCount: number;
  zigzagAmplitude: number;
  travelCompleteProgress: number;
}

export const AMBIENT_ELECTRIC_PRESETS: Record<
  AmbientElectricVariantId,
  AmbientElectricPreset
> = {
  pulse: {
    id: "pulse",
    label: "Pulse",
    minActiveBolts: 1,
    maxActiveBolts: 2,
    minSpawnIntervalMs: 2500,
    maxSpawnIntervalMs: 4000,
    minAlpha: 0.12,
    maxAlpha: 0.3,
    minDurationMs: 320,
    maxDurationMs: 520,
    minBranchCount: 0,
    maxBranchCount: 1,
    zigzagAmplitude: 4.2,
    travelCompleteProgress: 0.84,
  },
  arcade: {
    id: "arcade",
    label: "Arcade",
    minActiveBolts: 2,
    maxActiveBolts: 4,
    minSpawnIntervalMs: 1200,
    maxSpawnIntervalMs: 2500,
    minAlpha: 0.22,
    maxAlpha: 0.5,
    minDurationMs: 360,
    maxDurationMs: 580,
    minBranchCount: 0,
    maxBranchCount: 2,
    zigzagAmplitude: 5.2,
    travelCompleteProgress: 0.82,
  },
  storm: {
    id: "storm",
    label: "Storm",
    minActiveBolts: 4,
    maxActiveBolts: 6,
    minSpawnIntervalMs: 600,
    maxSpawnIntervalMs: 1500,
    minAlpha: 0.35,
    maxAlpha: 0.72,
    minDurationMs: 280,
    maxDurationMs: 680,
    minBranchCount: 1,
    maxBranchCount: 2,
    zigzagAmplitude: 6.4,
    travelCompleteProgress: 0.8,
  },
};

export const DEFAULT_AMBIENT_ELECTRIC_VARIANT: AmbientElectricVariantId = "arcade";

const FULL_BRANCH_SEGMENTS = 7;
const REDUCED_BRANCH_SEGMENTS = 3;
const ORIGIN_PULSE_RADIUS = 7.5;
const ENDPOINT_PULSE_RADIUS = 4.8;
const ENDPOINT_START_PROGRESS = 0.86;
const CORE_LINE_WIDTH = 1.85;
const HALO_LINE_WIDTH = 4.8;
const REDUCED_MAX_ACTIVE_BOLTS = 1;
const REDUCED_SPAWN_INTERVAL_MS = 4000;

interface AmbientBolt {
  origin: LightningPoint;
  endpoint: LightningPoint;
  seed: number;
  startedAt: number;
  durationMs: number;
  intensity: number;
  branchCount: number;
  segments: number;
}

export class AmbientElectricBackground {
  private bolts: AmbientBolt[] = [];
  private nextSpawnAt = 0;
  private sequence = 0;
  private variant: AmbientElectricVariantId;

  constructor(variant: AmbientElectricVariantId = DEFAULT_AMBIENT_ELECTRIC_VARIANT) {
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

  forceBolt(geometry: CircleGeometry, now = Date.now()): void {
    this.spawnBolt(geometry, now, true);
  }

  tick(geometry: CircleGeometry, now: number, reducedEffects: boolean): void {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const maxActive = reducedEffects ? REDUCED_MAX_ACTIVE_BOLTS : preset.maxActiveBolts;

    this.bolts = this.bolts.filter((bolt) => now - bolt.startedAt <= bolt.durationMs);

    if (reducedEffects) {
      if (this.bolts.length >= maxActive) return;
      if (now < this.nextSpawnAt) return;
      this.spawnBolt(geometry, now, false, true);
      this.nextSpawnAt = now + REDUCED_SPAWN_INTERVAL_MS;
      return;
    }

    while (this.bolts.length < preset.minActiveBolts && this.bolts.length < maxActive) {
      this.spawnBolt(geometry, now, true);
    }

    if (this.bolts.length >= maxActive) return;
    if (now < this.nextSpawnAt) return;

    this.spawnBolt(geometry, now, false);
    const interval =
      preset.minSpawnIntervalMs +
      lightningUnitValue(this.sequence, 41) *
        (preset.maxSpawnIntervalMs - preset.minSpawnIntervalMs);
    this.nextSpawnAt = now + interval;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    geometry: RadialPlayfieldGeometry,
    now: number,
    reducedEffects: boolean,
  ): void {
    if (this.bolts.length === 0) return;

    const circle: CircleGeometry = {
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      radius: geometry.radius,
    };
    const scale = 1;

    ctx.save();
    try {
      ctx.beginPath();
      ctx.arc(
        geometry.centerX,
        geometry.centerY,
        geometry.radius,
        0,
        Math.PI * 2,
      );
      ctx.clip();

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";

      for (const bolt of this.bolts) {
        const progress = clampProgress((now - bolt.startedAt) / bolt.durationMs);
        this.drawBolt(ctx, bolt, progress, reducedEffects, scale);
      }
    } finally {
      ctx.restore();
    }
  }

  getActiveBoltCount(): number {
    return this.bolts.length;
  }

  private drawBolt(
    ctx: CanvasRenderingContext2D,
    bolt: AmbientBolt,
    progress: number,
    reducedEffects: boolean,
    scale: number,
  ): void {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const travelProgress = easeCubicOut(
      clampProgress(progress / preset.travelCompleteProgress),
    );
    const fadeAlpha =
      calculateLightningFadeAlpha(progress) *
      (preset.minAlpha +
        (preset.maxAlpha - preset.minAlpha) * bolt.intensity);

    drawLightningPulse(
      ctx,
      bolt.origin,
      ORIGIN_PULSE_RADIUS * scale,
      fadeAlpha * 0.72,
    );

    const segments = reducedEffects ? REDUCED_BRANCH_SEGMENTS : bolt.segments;
    const haloWidth = HALO_LINE_WIDTH * scale * (0.75 + bolt.intensity * 0.35);
    const coreWidth = CORE_LINE_WIDTH * scale * (0.8 + bolt.intensity * 0.4);

    strokeLightningPath(
      ctx,
      bolt.origin,
      bolt.endpoint,
      travelProgress,
      segments,
      bolt.seed,
      17,
      bolt.intensity * preset.zigzagAmplitude,
      scale,
      {
        coreColor: ELECTRIC_LIGHTNING_CORE_COLOR,
        haloColor: ELECTRIC_LIGHTNING_HALO_COLOR,
        shadowColor: ELECTRIC_LIGHTNING_SHADOW_COLOR,
        coreLineWidth: coreWidth,
        haloLineWidth: haloWidth,
        alpha: fadeAlpha,
        shadowBlur: reducedEffects ? haloWidth : haloWidth * 1.7,
      },
    );

    if (!reducedEffects && bolt.branchCount > 0) {
      drawLightningSideBranches(
        ctx,
        bolt.origin,
        bolt.endpoint,
        travelProgress,
        bolt.branchCount,
        bolt.seed,
        101,
        fadeAlpha,
        scale,
      );
    }

    if (progress >= ENDPOINT_START_PROGRESS) {
      const endpointProgress = clampProgress(
        (progress - ENDPOINT_START_PROGRESS) /
          (1 - ENDPOINT_START_PROGRESS),
      );
      drawLightningPulse(
        ctx,
        bolt.endpoint,
        ENDPOINT_PULSE_RADIUS * scale * endpointProgress,
        fadeAlpha * endpointProgress,
      );
    }
  }

  private spawnBolt(
    geometry: CircleGeometry,
    now: number,
    immediate = false,
    reducedEffects = false,
  ): void {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const maxActive = reducedEffects ? REDUCED_MAX_ACTIVE_BOLTS : preset.maxActiveBolts;
    if (this.bolts.length >= maxActive) return;

    this.sequence += 1;
    const seed = this.sequence * 1_009 + (immediate ? 17 : 0);
    const origin = randomPointInCircle(geometry, seed, 3);
    const endpoint = randomEndpointAcrossCircle(geometry, origin, seed, 7);
    const intensity = lightningUnitValue(seed, 11);
    const branchCount = reducedEffects
      ? 0
      : Math.round(
          preset.minBranchCount +
            lightningUnitValue(seed, 13) *
              (preset.maxBranchCount - preset.minBranchCount),
        );
    const durationMs = Math.round(
      preset.minDurationMs +
        lightningUnitValue(seed, 19) * (preset.maxDurationMs - preset.minDurationMs),
    );
    const segments = Math.round(
      5 + lightningUnitValue(seed, 23) * (FULL_BRANCH_SEGMENTS - 5),
    );

    this.bolts.push({
      origin,
      endpoint,
      seed,
      startedAt: now,
      durationMs,
      intensity,
      branchCount,
      segments,
    });
  }
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
