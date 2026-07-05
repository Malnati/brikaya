// src/logic/rendering/ballTurretRenderer.ts
import { calculateBallTurretBoundarySegments } from "../../utils/radialGeometry";
import type {
  RadialPaddleBounds,
  RadialPlayfieldGeometry,
} from "../../utils/radialGeometry";

const FULL_CIRCLE = Math.PI * 2;
const HALF = 0.5;
const GLASS_EDGE_WIDTH_RATIO = 0.028;
const INNER_RING_RATIO = 0.78;
const HORIZON_Y_OFFSET_RATIO = 0.1;
const HORIZON_RADIUS_X_RATIO = 0.72;
const HORIZON_RADIUS_Y_RATIO = 0.18;
const TRAMPOLINE_FALLBACK_ARC_WIDTH = 0.46;
const TRAMPOLINE_FRAME_WIDTH_RATIO = 1.18;
const TRAMPOLINE_FABRIC_WIDTH_RATIO = 0.66;
const TRAMPOLINE_HIGHLIGHT_WIDTH_RATIO = 0.2;
const TRAMPOLINE_SPRING_COUNT = 7;
const TRAMPOLINE_FULL_RING_SPRING_COUNT = 24;
const TRAMPOLINE_SPRING_INSET_RATIO = 0.72;
const TRAMPOLINE_SHADOW_BLUR_RATIO = 0.08;
const GLASS_HIGHLIGHT_OFFSET_RATIO = 0.28;
const GLASS_HIGHLIGHT_RADIUS_RATIO = 0.34;
const GLASS_HIGHLIGHT_ALPHA = 0.28;
const VIGNETTE_INNER_RATIO = 0.54;
const VIGNETTE_OUTER_RATIO = 1;
const BOUNDARY_SEGMENT_GAP_RADIANS = 0.018;
const BOUNDARY_SEGMENT_LINE_WIDTH_RATIO = 0.024;
const BOUNDARY_REBOUND_STROKE = "rgba(73, 255, 199, 0.92)";
const BOUNDARY_LOSS_STROKE = "rgba(255, 96, 120, 0.82)";
const BOUNDARY_REBOUND_SHADOW = "rgba(73, 255, 199, 0.48)";
const BOUNDARY_LOSS_SHADOW = "rgba(255, 96, 120, 0.36)";

export interface BallTurretCanvasSize {
  width: number;
  height: number;
}

export interface BallTurretRenderState {
  canvasSize: BallTurretCanvasSize;
  geometry: RadialPlayfieldGeometry;
  level: number;
  paddlePosition: Partial<RadialPaddleBounds> & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface TrampolineBounds {
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  thickness: number;
}

function createRadialFill(
  ctx: CanvasRenderingContext2D,
  geometry: RadialPlayfieldGeometry,
  innerColor: string,
  outerColor: string,
): CanvasGradient | string {
  if (typeof ctx.createRadialGradient !== "function") return outerColor;

  const gradient = ctx.createRadialGradient(
    geometry.centerX,
    geometry.centerY,
    geometry.radius * 0.08,
    geometry.centerX,
    geometry.centerY,
    geometry.radius,
  );
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(1, outerColor);
  return gradient;
}

function readTrampolineBounds(state: BallTurretRenderState): TrampolineBounds {
  const radial = state.paddlePosition.radial;
  if (radial) {
    return {
      centerX: radial.centerX,
      centerY: radial.centerY,
      radius: radial.radius,
      startAngle: radial.startAngle,
      endAngle: radial.endAngle,
      centerAngle: radial.centerAngle,
      thickness: radial.thickness,
    };
  }

  const fallbackX = state.paddlePosition.x + state.paddlePosition.width * HALF;
  const fallbackY = state.paddlePosition.y + state.paddlePosition.height * HALF;
  const centerAngle = Math.atan2(
    fallbackY - state.geometry.centerY,
    fallbackX - state.geometry.centerX,
  );
  const radius = Math.hypot(
    fallbackX - state.geometry.centerX,
    fallbackY - state.geometry.centerY,
  );
  const halfArcWidth = TRAMPOLINE_FALLBACK_ARC_WIDTH * HALF;

  return {
    centerX: state.geometry.centerX,
    centerY: state.geometry.centerY,
    radius,
    startAngle: centerAngle - halfArcWidth,
    endAngle: centerAngle + halfArcWidth,
    centerAngle,
    thickness: state.paddlePosition.height,
  };
}

function pointOnArc(bounds: TrampolineBounds, radius: number, angle: number) {
  return {
    x: bounds.centerX + Math.cos(angle) * radius,
    y: bounds.centerY + Math.sin(angle) * radius,
  };
}

function drawBoundarySegments(
  ctx: CanvasRenderingContext2D,
  state: BallTurretRenderState,
) {
  const { geometry, level } = state;
  const lineWidth = Math.max(
    4,
    geometry.radius * BOUNDARY_SEGMENT_LINE_WIDTH_RATIO,
  );
  const radius = geometry.radius - lineWidth * HALF;

  ctx.save();
  ctx.lineCap = "butt";
  ctx.lineWidth = lineWidth;

  calculateBallTurretBoundarySegments(level).forEach((segment) => {
    ctx.strokeStyle = segment.rebounds
      ? BOUNDARY_REBOUND_STROKE
      : BOUNDARY_LOSS_STROKE;
    ctx.shadowColor = segment.rebounds
      ? BOUNDARY_REBOUND_SHADOW
      : BOUNDARY_LOSS_SHADOW;
    ctx.shadowBlur = Math.max(3, lineWidth * 1.4);
    ctx.beginPath();
    ctx.arc(
      geometry.centerX,
      geometry.centerY,
      radius,
      segment.startAngle + BOUNDARY_SEGMENT_GAP_RADIANS,
      segment.endAngle - BOUNDARY_SEGMENT_GAP_RADIANS,
    );
    ctx.stroke();
  });

  ctx.restore();
}

export function drawBallTurretBackdrop(
  ctx: CanvasRenderingContext2D,
  state: BallTurretRenderState,
): void {
  const { geometry, canvasSize } = state;

  ctx.save();
  ctx.fillStyle = createRadialFill(
    ctx,
    geometry,
    "rgba(22, 54, 88, 0.96)",
    "rgba(2, 8, 20, 0.98)",
  );
  ctx.beginPath();
  ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, FULL_CIRCLE);
  ctx.fill();

  ctx.strokeStyle = "rgba(125, 249, 255, 0.16)";
  ctx.lineWidth = Math.max(1, geometry.radius * 0.006);
  for (let ring = 1; ring <= 3; ring += 1) {
    ctx.beginPath();
    ctx.arc(
      geometry.centerX,
      geometry.centerY,
      geometry.radius * (0.24 + ring * 0.16),
      0,
      FULL_CIRCLE,
    );
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = Math.max(1, geometry.radius * 0.005);
  ctx.beginPath();
  ctx.ellipse?.(
    geometry.centerX,
    geometry.centerY + geometry.radius * HORIZON_Y_OFFSET_RATIO,
    geometry.radius * HORIZON_RADIUS_X_RATIO,
    geometry.radius * HORIZON_RADIUS_Y_RATIO,
    0,
    Math.PI,
    FULL_CIRCLE,
  );
  if (typeof ctx.ellipse !== "function") {
    ctx.arc(
      geometry.centerX,
      geometry.centerY + geometry.radius * HORIZON_Y_OFFSET_RATIO,
      geometry.radius * HORIZON_RADIUS_X_RATIO,
      Math.PI,
      FULL_CIRCLE,
    );
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(1, 5, 12, 0.2)";
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.restore();
}

export function drawBallTurretTrampoline(
  ctx: CanvasRenderingContext2D,
  state: BallTurretRenderState,
): void {
  const trampoline = readTrampolineBounds(state);
  const frameWidth = Math.max(
    8,
    trampoline.thickness * TRAMPOLINE_FRAME_WIDTH_RATIO,
  );
  const fabricWidth = Math.max(
    5,
    trampoline.thickness * TRAMPOLINE_FABRIC_WIDTH_RATIO,
  );
  const highlightWidth = Math.max(
    1.4,
    trampoline.thickness * TRAMPOLINE_HIGHLIGHT_WIDTH_RATIO,
  );
  const springInnerRadius =
    trampoline.radius - trampoline.thickness * TRAMPOLINE_SPRING_INSET_RATIO;
  const springOuterRadius =
    trampoline.radius + trampoline.thickness * TRAMPOLINE_SPRING_INSET_RATIO;

  ctx.save();
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0, 212, 255, 0.5)";
  ctx.shadowBlur = Math.max(
    8,
    trampoline.thickness * TRAMPOLINE_SHADOW_BLUR_RATIO,
  );
  ctx.strokeStyle = "rgba(16, 24, 34, 0.94)";
  ctx.lineWidth = frameWidth;
  ctx.beginPath();
  ctx.arc(
    trampoline.centerX,
    trampoline.centerY,
    trampoline.radius,
    0,
    FULL_CIRCLE,
  );
  ctx.stroke();

  ctx.shadowBlur = Math.max(5, trampoline.thickness * 0.34);
  ctx.strokeStyle = "rgba(16, 215, 232, 0.44)";
  ctx.lineWidth = fabricWidth;
  ctx.beginPath();
  ctx.arc(
    trampoline.centerX,
    trampoline.centerY,
    trampoline.radius,
    0,
    FULL_CIRCLE,
  );
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(248, 251, 255, 0.34)";
  ctx.lineWidth = highlightWidth;
  ctx.beginPath();
  ctx.arc(
    trampoline.centerX,
    trampoline.centerY,
    trampoline.radius - fabricWidth * 0.22,
    0,
    FULL_CIRCLE,
  );
  ctx.stroke();

  ctx.shadowBlur = Math.max(5, trampoline.thickness * 0.42);
  ctx.strokeStyle = "rgba(16, 24, 34, 0.98)";
  ctx.lineWidth = frameWidth * 0.82;
  ctx.beginPath();
  ctx.arc(
    trampoline.centerX,
    trampoline.centerY,
    trampoline.radius,
    trampoline.startAngle,
    trampoline.endAngle,
  );
  ctx.stroke();

  ctx.shadowBlur = Math.max(5, trampoline.thickness * 0.42);
  ctx.strokeStyle = "rgba(16, 215, 232, 0.94)";
  ctx.lineWidth = fabricWidth;
  ctx.beginPath();
  ctx.arc(
    trampoline.centerX,
    trampoline.centerY,
    trampoline.radius,
    trampoline.startAngle,
    trampoline.endAngle,
  );
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(248, 251, 255, 0.82)";
  ctx.lineWidth = highlightWidth;
  ctx.beginPath();
  ctx.arc(
    trampoline.centerX,
    trampoline.centerY,
    trampoline.radius - fabricWidth * 0.22,
    trampoline.startAngle,
    trampoline.endAngle,
  );
  ctx.stroke();

  ctx.strokeStyle = "rgba(227, 248, 255, 0.58)";
  ctx.lineWidth = Math.max(1, highlightWidth * 0.7);
  for (let index = 0; index < TRAMPOLINE_FULL_RING_SPRING_COUNT; index += 1) {
    const angle = (FULL_CIRCLE / TRAMPOLINE_FULL_RING_SPRING_COUNT) * index;
    const outer = pointOnArc(trampoline, springOuterRadius, angle);
    const inner = pointOnArc(trampoline, springInnerRadius, angle);

    ctx.beginPath();
    ctx.moveTo(outer.x, outer.y);
    ctx.lineTo(inner.x, inner.y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 245, 184, 0.82)";
  ctx.lineWidth = Math.max(1.2, highlightWidth * 0.9);
  for (let index = 0; index < TRAMPOLINE_SPRING_COUNT; index += 1) {
    const ratio = index / Math.max(1, TRAMPOLINE_SPRING_COUNT - 1);
    const angle =
      trampoline.startAngle +
      (trampoline.endAngle - trampoline.startAngle) * ratio;
    const outer = pointOnArc(trampoline, springOuterRadius, angle);
    const inner = pointOnArc(trampoline, springInnerRadius, angle);

    ctx.beginPath();
    ctx.moveTo(outer.x, outer.y);
    ctx.lineTo(inner.x, inner.y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 245, 184, 0.9)";
  const center = pointOnArc(
    trampoline,
    trampoline.radius,
    trampoline.centerAngle,
  );
  ctx.beginPath();
  ctx.arc(
    center.x,
    center.y,
    Math.max(2.4, highlightWidth * 1.35),
    0,
    FULL_CIRCLE,
  );
  ctx.fill();
  ctx.restore();
}

export function drawBallTurretGlassOverlay(
  ctx: CanvasRenderingContext2D,
  state: BallTurretRenderState,
): void {
  const { geometry } = state;

  ctx.save();
  ctx.strokeStyle = "rgba(202, 230, 255, 0.54)";
  ctx.lineWidth = Math.max(3, geometry.radius * GLASS_EDGE_WIDTH_RATIO);
  ctx.beginPath();
  ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, FULL_CIRCLE);
  ctx.stroke();

  drawBoundarySegments(ctx, state);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = Math.max(1, geometry.radius * 0.008);
  ctx.beginPath();
  ctx.arc(
    geometry.centerX,
    geometry.centerY,
    geometry.radius * INNER_RING_RATIO,
    0,
    FULL_CIRCLE,
  );
  ctx.stroke();

  ctx.globalAlpha = GLASS_HIGHLIGHT_ALPHA;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.lineWidth = Math.max(2, geometry.radius * 0.014);
  ctx.beginPath();
  ctx.arc(
    geometry.centerX - geometry.radius * GLASS_HIGHLIGHT_OFFSET_RATIO,
    geometry.centerY - geometry.radius * GLASS_HIGHLIGHT_OFFSET_RATIO,
    geometry.radius * GLASS_HIGHLIGHT_RADIUS_RATIO,
    Math.PI * 1.12,
    Math.PI * 1.82,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = createRadialFill(
    ctx,
    geometry,
    "rgba(255,255,255,0)",
    "rgba(0,0,0,0.46)",
  );
  ctx.beginPath();
  ctx.arc(
    geometry.centerX,
    geometry.centerY,
    geometry.radius * VIGNETTE_OUTER_RATIO,
    0,
    FULL_CIRCLE,
  );
  ctx.arc(
    geometry.centerX,
    geometry.centerY,
    geometry.radius * VIGNETTE_INNER_RATIO,
    0,
    FULL_CIRCLE,
    true,
  );
  ctx.fill();
  ctx.restore();
}
