export interface LightningPoint {
  x: number;
  y: number;
}

export interface LightningStrokeStyle {
  coreColor: string;
  haloColor: string;
  shadowColor: string;
  coreLineWidth: number;
  haloLineWidth: number;
  alpha: number;
  shadowBlur: number;
}

export const ELECTRIC_LIGHTNING_CORE_COLOR = "rgba(238, 253, 255, 0.92)";
export const ELECTRIC_LIGHTNING_HALO_COLOR = "rgba(66, 224, 255, 0.34)";
export const ELECTRIC_LIGHTNING_SHADOW_COLOR = "rgba(77, 232, 255, 0.88)";

const FULL_CIRCLE = Math.PI * 2;
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 1;
const SEED_SEQUENCE_MULTIPLIER = 2_654_435_761;
const SEED_MODULO = 9_973;
const SEED_NORMALIZER = 9_973;

export function clampProgress(value: number): number {
  return Math.max(PROGRESS_MIN, Math.min(PROGRESS_MAX, value));
}

export function easeCubicOut(progress: number): number {
  const clamped = clampProgress(progress);
  return 1 - Math.pow(1 - clamped, 3);
}

export function lightningUnitValue(seed: number, salt: number): number {
  return (
    ((seed + salt * SEED_SEQUENCE_MULTIPLIER) % SEED_MODULO) / SEED_NORMALIZER
  );
}

export function calculateLightningFadeAlpha(
  progress: number,
  fadeStartProgress = 0.68,
): number {
  if (progress <= fadeStartProgress) return 1;

  const fadeProgress =
    (progress - fadeStartProgress) / (PROGRESS_MAX - fadeStartProgress);
  return clampProgress(1 - fadeProgress);
}

export function buildZigzagPoint(
  origin: LightningPoint,
  endpoint: LightningPoint,
  progress: number,
  step: number,
  seed: number,
  salt: number,
  zigzagAmplitude: number,
  scale: number,
): LightningPoint {
  const dx = endpoint.x - origin.x;
  const dy = endpoint.y - origin.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const jitter =
    step === 0 || progress >= PROGRESS_MAX
      ? 0
      : (lightningUnitValue(seed, salt) - 0.5) *
        zigzagAmplitude *
        scale *
        Math.sin(Math.PI * progress);

  return {
    x: origin.x + dx * progress + normalX * jitter,
    y: origin.y + dy * progress + normalY * jitter,
  };
}

export function strokeLightningPath(
  ctx: CanvasRenderingContext2D,
  origin: LightningPoint,
  endpoint: LightningPoint,
  travelProgress: number,
  segments: number,
  seed: number,
  salt: number,
  zigzagAmplitude: number,
  scale: number,
  style: LightningStrokeStyle,
): void {
  ctx.shadowColor = style.shadowColor;
  ctx.shadowBlur = style.shadowBlur;
  ctx.globalAlpha = style.alpha;
  ctx.strokeStyle = style.haloColor;
  ctx.lineWidth = style.haloLineWidth;
  strokePath(
    ctx,
    origin,
    endpoint,
    travelProgress,
    segments,
    seed,
    salt,
    zigzagAmplitude,
    scale,
  );

  ctx.shadowBlur = style.shadowBlur * 0.55;
  ctx.globalAlpha = style.alpha * 0.95;
  ctx.strokeStyle = style.coreColor;
  ctx.lineWidth = style.coreLineWidth;
  strokePath(
    ctx,
    origin,
    endpoint,
    travelProgress,
    segments,
    seed,
    salt,
    zigzagAmplitude,
    scale,
  );
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  origin: LightningPoint,
  endpoint: LightningPoint,
  travelProgress: number,
  segments: number,
  seed: number,
  salt: number,
  zigzagAmplitude: number,
  scale: number,
): void {
  ctx.beginPath();
  for (let step = 0; step <= segments; step += 1) {
    const pathProgress = (step / segments) * travelProgress;
    const point = buildZigzagPoint(
      origin,
      endpoint,
      pathProgress,
      step,
      seed,
      salt + step,
      zigzagAmplitude,
      scale,
    );

    if (step === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.stroke();
}

export function drawLightningPulse(
  ctx: CanvasRenderingContext2D,
  point: LightningPoint,
  radius: number,
  alpha: number,
  colors: {
    coreColor?: string;
    haloColor?: string;
    shadowColor?: string;
  } = {},
): void {
  if (radius <= 0 || alpha <= 0) return;

  const coreColor = colors.coreColor ?? ELECTRIC_LIGHTNING_CORE_COLOR;
  const haloColor = colors.haloColor ?? ELECTRIC_LIGHTNING_HALO_COLOR;
  const shadowColor = colors.shadowColor ?? ELECTRIC_LIGHTNING_SHADOW_COLOR;

  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = radius * 1.8;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = haloColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, PROGRESS_MIN, FULL_CIRCLE);
  ctx.fill();

  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * 0.36, PROGRESS_MIN, FULL_CIRCLE);
  ctx.fill();
}

export function drawLightningSideBranches(
  ctx: CanvasRenderingContext2D,
  origin: LightningPoint,
  endpoint: LightningPoint,
  travelProgress: number,
  branchCount: number,
  seed: number,
  salt: number,
  fadeAlpha: number,
  scale: number,
  options: {
    branchStartProgress?: number;
    branchLengthRatio?: number;
    branchAngle?: number;
    coreColor?: string;
    coreLineWidth?: number;
    shadowBlur?: number;
  } = {},
): void {
  if (branchCount === 0 || travelProgress < (options.branchStartProgress ?? 0.22)) {
    return;
  }

  const dx = endpoint.x - origin.x;
  const dy = endpoint.y - origin.y;
  const baseAngle = Math.atan2(dy, dx);
  const distance = Math.hypot(dx, dy);
  const branchLengthRatio = options.branchLengthRatio ?? 0.16;
  const branchAngle = options.branchAngle ?? Math.PI / 3.2;

  ctx.strokeStyle = options.coreColor ?? ELECTRIC_LIGHTNING_CORE_COLOR;
  ctx.lineWidth = options.coreLineWidth ?? Math.max(1, 1.15 * scale * 0.62);
  ctx.shadowBlur = options.shadowBlur ?? 4.8 * scale;
  ctx.globalAlpha = fadeAlpha * 0.56;

  for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
    const branchSalt = salt + branchIndex * 29;
    const startProgress =
      (0.28 + lightningUnitValue(seed, branchSalt) * 0.46) * travelProgress;
    const branchLength =
      distance *
      branchLengthRatio *
      (0.62 + lightningUnitValue(seed, branchSalt + 1) * 0.54);
    const branchDirection =
      baseAngle +
      (branchIndex % 2 === 0 ? -1 : 1) *
        branchAngle *
        (0.72 + lightningUnitValue(seed, branchSalt + 2) * 0.5);
    const branchStart = {
      x: origin.x + dx * startProgress,
      y: origin.y + dy * startProgress,
    };

    ctx.beginPath();
    ctx.moveTo(branchStart.x, branchStart.y);
    ctx.lineTo(
      branchStart.x + Math.cos(branchDirection) * branchLength,
      branchStart.y + Math.sin(branchDirection) * branchLength,
    );
    ctx.stroke();
  }
}

export interface CircleGeometry {
  centerX: number;
  centerY: number;
  radius: number;
}

export function randomPointInCircle(
  geometry: CircleGeometry,
  seed: number,
  salt: number,
  edgeBias = 0.42,
): LightningPoint {
  const unitA = lightningUnitValue(seed, salt);
  const unitB = lightningUnitValue(seed, salt + 1);
  const unitC = lightningUnitValue(seed, salt + 2);
  const angle = unitA * FULL_CIRCLE;
  const radiusRatio = edgeBias + (1 - edgeBias) * unitB;
  const distance = geometry.radius * radiusRatio * (0.35 + unitC * 0.65);

  return {
    x: geometry.centerX + Math.cos(angle) * distance,
    y: geometry.centerY + Math.sin(angle) * distance,
  };
}

export function randomEndpointAcrossCircle(
  geometry: CircleGeometry,
  origin: LightningPoint,
  seed: number,
  salt: number,
): LightningPoint {
  const angle = lightningUnitValue(seed, salt + 3) * FULL_CIRCLE;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const oc = {
    x: origin.x - geometry.centerX,
    y: origin.y - geometry.centerY,
  };
  const b = 2 * (oc.x * direction.x + oc.y * direction.y);
  const c =
    oc.x * oc.x + oc.y * oc.y - geometry.radius * geometry.radius;
  const discriminant = b * b - 4 * c;

  if (discriminant < 0) {
    return {
      x: origin.x + direction.x * geometry.radius,
      y: origin.y + direction.y * geometry.radius,
    };
  }

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b + sqrtDisc) / 2;
  const t2 = (-b - sqrtDisc) / 2;
  const positiveTs = [t1, t2].filter((value) => value > 1);
  const travelDistance =
    positiveTs.length > 0
      ? Math.min(...positiveTs)
      : Math.max(t1, t2, geometry.radius * 0.5);

  return {
    x: origin.x + direction.x * travelDistance,
    y: origin.y + direction.y * travelDistance,
  };
}
