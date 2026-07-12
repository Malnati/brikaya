export const ELECTRIC_LIGHTNING_CORE_COLOR = "rgba(238, 253, 255, 0.92)";
export const ELECTRIC_LIGHTNING_HALO_COLOR = "rgba(66, 224, 255, 0.34)";
export const ELECTRIC_LIGHTNING_SHADOW_COLOR = "rgba(77, 232, 255, 0.88)";

const FULL_CIRCLE = Math.PI * 2;
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 1;
const SEED_SEQUENCE_MULTIPLIER = 2_654_435_761;
const SEED_MODULO = 9_973;
const SEED_NORMALIZER = 9_973;

export function clampProgress(value) {
  return Math.max(PROGRESS_MIN, Math.min(PROGRESS_MAX, value));
}

export function easeCubicOut(progress) {
  const clamped = clampProgress(progress);
  return 1 - Math.pow(1 - clamped, 3);
}

export function lightningUnitValue(seed, salt) {
  return (
    ((seed + salt * SEED_SEQUENCE_MULTIPLIER) % SEED_MODULO) / SEED_NORMALIZER
  );
}

export function calculateLightningFadeAlpha(progress, fadeStartProgress = 0.68) {
  if (progress <= fadeStartProgress) return 1;
  const fadeProgress =
    (progress - fadeStartProgress) / (PROGRESS_MAX - fadeStartProgress);
  return clampProgress(1 - fadeProgress);
}

export function buildZigzagPoint(
  origin,
  endpoint,
  progress,
  step,
  seed,
  salt,
  zigzagAmplitude,
  scale,
) {
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

export function randomPointInCircle(geometry, seed, salt) {
  const angle = lightningUnitValue(seed, salt) * FULL_CIRCLE;
  const distance =
    Math.sqrt(lightningUnitValue(seed, salt + 1)) * geometry.radius * 0.92;
  return {
    x: geometry.centerX + Math.cos(angle) * distance,
    y: geometry.centerY + Math.sin(angle) * distance,
  };
}

export function randomEndpointAcrossCircle(geometry, origin, seed, salt) {
  const angle = lightningUnitValue(seed, salt) * FULL_CIRCLE;
  const edgeDistance =
    geometry.radius * (0.72 + lightningUnitValue(seed, salt + 1) * 0.24);
  return {
    x: geometry.centerX + Math.cos(angle) * edgeDistance,
    y: geometry.centerY + Math.sin(angle) * edgeDistance,
  };
}

export function strokeLightningPath(
  ctx,
  origin,
  endpoint,
  travelProgress,
  segments,
  seed,
  endpointIndex,
  zigzagAmplitude,
  scale,
) {
  ctx.beginPath();
  for (let step = 0; step <= segments; step += 1) {
    const pathProgress = (step / segments) * travelProgress;
    const point = buildZigzagPoint(
      origin,
      endpoint,
      pathProgress,
      step,
      seed,
      endpointIndex * 17 + step,
      zigzagAmplitude,
      scale,
    );
    if (step === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

export function drawLightningPulse(ctx, point, radius, alpha, style) {
  if (radius <= 0 || alpha <= 0) return;
  ctx.shadowColor = style.shadowColor;
  ctx.shadowBlur = radius * 1.8;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = style.haloColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, PROGRESS_MIN, FULL_CIRCLE);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = style.coreColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * 0.36, PROGRESS_MIN, FULL_CIRCLE);
  ctx.fill();
}

export function drawLightningSideBranches(
  ctx,
  origin,
  endpoint,
  travelProgress,
  fadeAlpha,
  seed,
  endpointIndex,
  branchCount,
  scale,
  options = {},
) {
  const {
    sideBranchStartProgress = 0.22,
    sideBranchLengthRatio = 0.16,
    sideBranchAngle = Math.PI / 3.2,
    coreLineWidth = 1.85,
    haloLineWidth = 4.8,
  } = options;
  if (branchCount === 0 || travelProgress < sideBranchStartProgress) return;

  const dx = endpoint.x - origin.x;
  const dy = endpoint.y - origin.y;
  const baseAngle = Math.atan2(dy, dx);
  const distance = Math.hypot(dx, dy);
  ctx.strokeStyle = ELECTRIC_LIGHTNING_CORE_COLOR;
  ctx.lineWidth = Math.max(1, coreLineWidth * scale * 0.62);
  ctx.shadowBlur = haloLineWidth * scale;
  ctx.globalAlpha = fadeAlpha * 0.56;

  for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
    const salt = endpointIndex * 101 + branchIndex * 29;
    const startProgress =
      (0.28 + lightningUnitValue(seed, salt) * 0.46) * travelProgress;
    const branchLength =
      distance *
      sideBranchLengthRatio *
      (0.62 + lightningUnitValue(seed, salt + 1) * 0.54);
    const branchDirection =
      baseAngle +
      (branchIndex % 2 === 0 ? -1 : 1) *
        sideBranchAngle *
        (0.72 + lightningUnitValue(seed, salt + 2) * 0.5);
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
