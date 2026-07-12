export interface LightningPoint {
  x: number;
  y: number;
}

export interface ViewportGeometry {
  width: number;
  height: number;
}

export interface NaturalBoltBranch {
  points: LightningPoint[];
  lineWidthScale: number;
  alphaScale: number;
}

export interface NaturalBoltGeometry {
  trunk: LightningPoint[];
  branches: NaturalBoltBranch[];
  origin: LightningPoint;
  tip: LightningPoint;
  totalLength: number;
  seed: number;
}

export const ELECTRIC_LIGHTNING_CORE_COLOR = "rgba(238, 253, 255, 0.92)";
export const ELECTRIC_LIGHTNING_HALO_COLOR = "rgba(66, 224, 255, 0.34)";
export const ELECTRIC_LIGHTNING_SHADOW_COLOR = "rgba(77, 232, 255, 0.88)";

const SEED_SEQUENCE_MULTIPLIER = 2_654_435_761;
const SEED_MODULO = 9_973;
const SEED_NORMALIZER = 9_973;
const FULL_CIRCLE = Math.PI * 2;
const PROGRESS_MAX = 1;

export function clampProgress(value: number): number {
  return Math.max(0, Math.min(PROGRESS_MAX, value));
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
  endpointIndex: number,
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
      endpointIndex * 17 + step,
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

export function drawLightningSideBranches(
  ctx: CanvasRenderingContext2D,
  origin: LightningPoint,
  endpoint: LightningPoint,
  travelProgress: number,
  fadeAlpha: number,
  seed: number,
  endpointIndex: number,
  branchCount: number,
  scale: number,
  options: {
    sideBranchStartProgress?: number;
    sideBranchLengthRatio?: number;
    sideBranchAngle?: number;
    coreLineWidth?: number;
    haloLineWidth?: number;
  } = {},
): void {
  const {
    sideBranchStartProgress = 0.22,
    sideBranchLengthRatio = 0.16,
    sideBranchAngle = Math.PI / 3.2,
    coreLineWidth = 1.85,
    haloLineWidth = 4.8,
  } = options;

  if (branchCount === 0 || travelProgress < sideBranchStartProgress) {
    return;
  }

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

function perpendicularOffset(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  magnitude: number,
): LightningPoint {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.max(1, Math.hypot(dx, dy));
  return {
    x: -dy / length * magnitude,
    y: dx / length * magnitude,
  };
}

function buildFractalPath(
  start: LightningPoint,
  end: LightningPoint,
  depth: number,
  displacement: number,
  seed: number,
  salt: number,
): LightningPoint[] {
  if (depth <= 0) {
    return [start, end];
  }

  const mid = {
    x: (start.x + end.x) * 0.5,
    y: (start.y + end.y) * 0.5,
  };
  const jitter =
    (lightningUnitValue(seed, salt) - 0.5) * 2 * displacement;
  const normal = perpendicularOffset(start.x, start.y, end.x, end.y, jitter);
  const displaced = { x: mid.x + normal.x, y: mid.y + normal.y };

  const left = buildFractalPath(
    start,
    displaced,
    depth - 1,
    displacement * 0.58,
    seed,
    salt + 11,
  );
  const right = buildFractalPath(
    displaced,
    end,
    depth - 1,
    displacement * 0.58,
    seed,
    salt + 23,
  );

  return [...left, ...right.slice(1)];
}

function computePathLength(points: LightningPoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const current = points[index];
    total += Math.hypot(current.x - prev.x, current.y - prev.y);
  }
  return total;
}

function buildBranchPath(
  start: LightningPoint,
  direction: number,
  length: number,
  depth: number,
  displacement: number,
  seed: number,
  salt: number,
): LightningPoint[] {
  const end = {
    x: start.x + Math.cos(direction) * length,
    y: start.y + Math.sin(direction) * length,
  };
  return buildFractalPath(start, end, depth, displacement, seed, salt);
}

export function buildNaturalBoltGeometry(
  viewport: ViewportGeometry,
  seed: number,
  options: {
    fractalDepth: number;
    branchCount: number;
    tertiaryBranches: boolean;
  },
): NaturalBoltGeometry {
  const origin = {
    x: viewport.width * (0.04 + lightningUnitValue(seed, 3) * 0.92),
    y: viewport.height * (0.78 + lightningUnitValue(seed, 5) * 0.18),
  };
  const tip = {
    x:
      origin.x +
      viewport.width * (lightningUnitValue(seed, 7) - 0.5) * 0.42,
    y: viewport.height * (0.04 + lightningUnitValue(seed, 9) * 0.28),
  };

  const span = Math.hypot(tip.x - origin.x, tip.y - origin.y);
  const displacement = Math.max(18, span * 0.14);
  const trunk = buildFractalPath(
    origin,
    tip,
    options.fractalDepth,
    displacement,
    seed,
    17,
  );

  const branches: NaturalBoltBranch[] = [];
  for (let branchIndex = 0; branchIndex < options.branchCount; branchIndex += 1) {
    const branchSalt = 101 + branchIndex * 37;
    const nodeIndex = Math.floor(
      (0.28 + lightningUnitValue(seed, branchSalt) * 0.45) *
        (trunk.length - 1),
    );
    const node = trunk[Math.min(nodeIndex, trunk.length - 1)];
    const mainAngle = Math.atan2(tip.y - origin.y, tip.x - origin.x);
    const branchAngle =
      mainAngle +
      (branchIndex % 2 === 0 ? -1 : 1) *
        (0.45 + lightningUnitValue(seed, branchSalt + 1) * 0.85);
    const branchLength =
      span * (0.12 + lightningUnitValue(seed, branchSalt + 2) * 0.22);
    const branchDepth = Math.max(1, options.fractalDepth - 2);
    const branchPoints = buildBranchPath(
      node,
      branchAngle,
      branchLength,
      branchDepth,
      displacement * 0.45,
      seed,
      branchSalt + 3,
    );
    branches.push({
      points: branchPoints,
      lineWidthScale: 0.55 + lightningUnitValue(seed, branchSalt + 4) * 0.25,
      alphaScale: 0.5 + lightningUnitValue(seed, branchSalt + 5) * 0.35,
    });

    if (options.tertiaryBranches && branchPoints.length > 2) {
      const tertiarySalt = branchSalt + 50;
      const tertiaryNode =
        branchPoints[Math.floor(branchPoints.length * 0.55)] ?? node;
      const tertiaryAngle =
        branchAngle +
        (branchIndex % 2 === 0 ? 1 : -1) *
          (0.35 + lightningUnitValue(seed, tertiarySalt) * 0.5);
      branches.push({
        points: buildBranchPath(
          tertiaryNode,
          tertiaryAngle,
          branchLength * 0.42,
          1,
          displacement * 0.22,
          seed,
          tertiarySalt + 1,
        ),
        lineWidthScale: 0.35,
        alphaScale: 0.38,
      });
    }
  }

  return {
    trunk,
    branches,
    origin,
    tip,
    totalLength: computePathLength(trunk),
    seed,
  };
}

function drawPartialPath(
  ctx: CanvasRenderingContext2D,
  points: LightningPoint[],
  revealLength: number,
): void {
  if (points.length < 2 || revealLength <= 0) return;

  let remaining = revealLength;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const current = points[index];
    const segmentLength = Math.hypot(current.x - prev.x, current.y - prev.y);
    if (remaining >= segmentLength) {
      ctx.lineTo(current.x, current.y);
      remaining -= segmentLength;
      continue;
    }

    const ratio = remaining / Math.max(segmentLength, 1);
    ctx.lineTo(
      prev.x + (current.x - prev.x) * ratio,
      prev.y + (current.y - prev.y) * ratio,
    );
    break;
  }

  ctx.stroke();
}

export function drawLightningPulse(
  ctx: CanvasRenderingContext2D,
  point: LightningPoint,
  radius: number,
  alpha: number,
): void {
  if (radius <= 0 || alpha <= 0) return;

  ctx.shadowColor = ELECTRIC_LIGHTNING_SHADOW_COLOR;
  ctx.shadowBlur = radius * 1.8;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ELECTRIC_LIGHTNING_HALO_COLOR;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, FULL_CIRCLE);
  ctx.fill();

  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = ELECTRIC_LIGHTNING_CORE_COLOR;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * 0.36, 0, FULL_CIRCLE);
  ctx.fill();
}

export function drawNaturalBolt(
  ctx: CanvasRenderingContext2D,
  geometry: NaturalBoltGeometry,
  revealProgress: number,
  fadeAlpha: number,
  scale: number,
  options: {
    haloLineWidth: number;
    coreLineWidth: number;
  },
): void {
  const revealLength = geometry.totalLength * clampProgress(revealProgress);
  const haloWidth = options.haloLineWidth * scale;
  const coreWidth = options.coreLineWidth * scale;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const drawStrokeLayer = (
    strokeStyle: string,
    lineWidth: number,
    shadowBlur: number,
    alpha: number,
    points: LightningPoint[],
    length: number,
  ) => {
    ctx.shadowColor = ELECTRIC_LIGHTNING_SHADOW_COLOR;
    ctx.shadowBlur = shadowBlur;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    drawPartialPath(ctx, points, length);
  };

  drawStrokeLayer(
    ELECTRIC_LIGHTNING_HALO_COLOR,
    haloWidth,
    haloWidth * 1.7,
    fadeAlpha,
    geometry.trunk,
    revealLength,
  );
  drawStrokeLayer(
    ELECTRIC_LIGHTNING_CORE_COLOR,
    coreWidth,
    coreWidth * 2.2,
    fadeAlpha * 0.95,
    geometry.trunk,
    revealLength,
  );

  const branchReveal = clampProgress(revealProgress * 1.08);
  for (const branch of geometry.branches) {
    const branchLength = computePathLength(branch.points) * branchReveal;
    drawStrokeLayer(
      ELECTRIC_LIGHTNING_HALO_COLOR,
      haloWidth * branch.lineWidthScale,
      haloWidth,
      fadeAlpha * branch.alphaScale * 0.85,
      branch.points,
      branchLength,
    );
    drawStrokeLayer(
      ELECTRIC_LIGHTNING_CORE_COLOR,
      coreWidth * branch.lineWidthScale,
      coreWidth * 1.4,
      fadeAlpha * branch.alphaScale * 0.8,
      branch.points,
      branchLength,
    );
  }

  drawLightningPulse(
    ctx,
    geometry.origin,
    8.5 * scale,
    fadeAlpha * 0.75,
  );

  if (revealProgress >= 0.86) {
    const tipProgress = clampProgress((revealProgress - 0.86) / 0.14);
    drawLightningPulse(
      ctx,
      geometry.tip,
      5.2 * scale * tipProgress,
      fadeAlpha * tipProgress,
    );
  }
}
