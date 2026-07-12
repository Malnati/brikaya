import type { ElectricImpactEvent } from "../../utils/electricImpact";
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
  strokeLightningPath,
  type LightningPoint,
} from "./electricLightningRenderer";

export interface ElectricImpactEffect extends ElectricImpactEvent {
  startedAt: number;
  durationMs: number;
  seed: number;
}

const ELECTRIC_IMPACT_TRAVEL_COMPLETE_PROGRESS = 0.82;
const ELECTRIC_IMPACT_FULL_BRANCH_SEGMENTS = 7;
const ELECTRIC_IMPACT_REDUCED_BRANCH_SEGMENTS = 3;
const ELECTRIC_IMPACT_FULL_SIDE_BRANCHES = 2;
const ELECTRIC_IMPACT_REDUCED_SIDE_BRANCHES = 0;
const ELECTRIC_IMPACT_ZIGZAG_AMPLITUDE = 5.2;
const ELECTRIC_IMPACT_LINE_WIDTH = 1.85;
const ELECTRIC_IMPACT_HALO_LINE_WIDTH = 4.8;
const ELECTRIC_IMPACT_ORIGIN_PULSE_RADIUS = 7.5;
const ELECTRIC_IMPACT_ENDPOINT_PULSE_RADIUS = 4.8;
const ELECTRIC_IMPACT_ENDPOINT_START_PROGRESS = 0.86;
const ELECTRIC_IMPACT_SEED_ENDPOINT_MULTIPLIER = 97;
const ELECTRIC_IMPACT_SEED_SEQUENCE_MULTIPLIER = 2_654_435_761;

export function buildElectricImpactSeed(impact: ElectricImpactEvent): number {
  const endpointScore = impact.endpoints.reduce(
    (score, endpoint, index) =>
      score +
      (endpoint.x * (index + 1) + endpoint.y * (index + 3)) *
        ELECTRIC_IMPACT_SEED_ENDPOINT_MULTIPLIER,
    0,
  );

  return Math.abs(
    Math.round(
      impact.origin.x * 31 +
        impact.origin.y * 17 +
        endpointScore +
        impact.kind.length * 53,
    ),
  );
}

export function drawElectricImpactEffects(
  ctx: CanvasRenderingContext2D,
  effects: ElectricImpactEffect[],
  now: number,
  reducedEffects: boolean,
  scale: number,
): ElectricImpactEffect[] {
  const activeEffects = effects.filter(
    (effect) => now - effect.startedAt <= effect.durationMs,
  );
  if (activeEffects.length === 0) return activeEffects;

  ctx.save();
  try {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "lighter";

    for (const effect of activeEffects) {
      const progress = clampProgress(
        (now - effect.startedAt) / effect.durationMs,
      );
      drawElectricImpactEffect(ctx, effect, progress, reducedEffects, scale);
    }
  } finally {
    ctx.restore();
  }

  return activeEffects;
}

function drawElectricImpactEffect(
  ctx: CanvasRenderingContext2D,
  effect: ElectricImpactEffect,
  progress: number,
  reducedEffects: boolean,
  scale: number,
): void {
  const travelProgress = easeCubicOut(
    clampProgress(progress / ELECTRIC_IMPACT_TRAVEL_COMPLETE_PROGRESS),
  );
  const fadeAlpha = calculateLightningFadeAlpha(progress);

  drawLightningPulse(
    ctx,
    effect.origin,
    ELECTRIC_IMPACT_ORIGIN_PULSE_RADIUS * scale,
    fadeAlpha * 0.72,
  );

  effect.endpoints.forEach((endpoint, endpointIndex) => {
    drawElectricImpactBranch(
      ctx,
      effect,
      endpoint,
      endpointIndex,
      travelProgress,
      fadeAlpha,
      reducedEffects,
      scale,
    );
    drawElectricImpactEndpointPulse(
      ctx,
      endpoint,
      progress,
      fadeAlpha,
      scale,
    );
  });
}

function drawElectricImpactBranch(
  ctx: CanvasRenderingContext2D,
  effect: ElectricImpactEffect,
  endpoint: LightningPoint,
  endpointIndex: number,
  travelProgress: number,
  fadeAlpha: number,
  reducedEffects: boolean,
  scale: number,
): void {
  const segments = reducedEffects
    ? ELECTRIC_IMPACT_REDUCED_BRANCH_SEGMENTS
    : ELECTRIC_IMPACT_FULL_BRANCH_SEGMENTS;
  const haloWidth = ELECTRIC_IMPACT_HALO_LINE_WIDTH * scale;
  const coreWidth = ELECTRIC_IMPACT_LINE_WIDTH * scale;

  ctx.shadowColor = ELECTRIC_LIGHTNING_SHADOW_COLOR;
  ctx.shadowBlur = reducedEffects ? haloWidth : haloWidth * 1.7;
  ctx.globalAlpha = fadeAlpha;
  ctx.strokeStyle = ELECTRIC_LIGHTNING_HALO_COLOR;
  ctx.lineWidth = haloWidth;
  strokeLightningPath(
    ctx,
    effect.origin,
    endpoint,
    travelProgress,
    segments,
    effect.seed,
    endpointIndex,
    ELECTRIC_IMPACT_ZIGZAG_AMPLITUDE,
    scale,
  );

  ctx.shadowBlur = reducedEffects ? coreWidth : coreWidth * 2.2;
  ctx.globalAlpha = fadeAlpha * 0.95;
  ctx.strokeStyle = ELECTRIC_LIGHTNING_CORE_COLOR;
  ctx.lineWidth = coreWidth;
  strokeLightningPath(
    ctx,
    effect.origin,
    endpoint,
    travelProgress,
    segments,
    effect.seed,
    endpointIndex,
    ELECTRIC_IMPACT_ZIGZAG_AMPLITUDE,
    scale,
  );

  drawLightningSideBranches(
    ctx,
    effect.origin,
    endpoint,
    travelProgress,
    fadeAlpha,
    effect.seed,
    endpointIndex,
    reducedEffects
      ? ELECTRIC_IMPACT_REDUCED_SIDE_BRANCHES
      : ELECTRIC_IMPACT_FULL_SIDE_BRANCHES,
    scale,
    {
      coreLineWidth: ELECTRIC_IMPACT_LINE_WIDTH,
      haloLineWidth: ELECTRIC_IMPACT_HALO_LINE_WIDTH,
    },
  );
}

function drawElectricImpactEndpointPulse(
  ctx: CanvasRenderingContext2D,
  endpoint: LightningPoint,
  progress: number,
  fadeAlpha: number,
  scale: number,
): void {
  if (progress < ELECTRIC_IMPACT_ENDPOINT_START_PROGRESS) return;

  const endpointProgress = clampProgress(
    (progress - ELECTRIC_IMPACT_ENDPOINT_START_PROGRESS) /
      (1 - ELECTRIC_IMPACT_ENDPOINT_START_PROGRESS),
  );
  drawLightningPulse(
    ctx,
    endpoint,
    ELECTRIC_IMPACT_ENDPOINT_PULSE_RADIUS * scale * endpointProgress,
    fadeAlpha * endpointProgress,
  );
}

export function nextElectricImpactSeed(
  impact: ElectricImpactEvent,
  sequence: number,
): number {
  return Math.abs(
    (impact.seed ?? buildElectricImpactSeed(impact)) +
      sequence * ELECTRIC_IMPACT_SEED_SEQUENCE_MULTIPLIER,
  );
}

export function electricImpactUnitValue(seed: number, salt: number): number {
  return lightningUnitValue(seed, salt);
}

export function buildZigzagImpactPoint(
  origin: LightningPoint,
  endpoint: LightningPoint,
  progress: number,
  step: number,
  seed: number,
  endpointIndex: number,
  scale: number,
): LightningPoint {
  return buildZigzagPoint(
    origin,
    endpoint,
    progress,
    step,
    seed,
    endpointIndex * 17 + step,
    ELECTRIC_IMPACT_ZIGZAG_AMPLITUDE,
    scale,
  );
}
