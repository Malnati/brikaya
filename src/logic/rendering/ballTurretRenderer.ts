// src/logic/rendering/ballTurretRenderer.ts
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
const RETICLE_RADIUS_RATIO = 0.075;
const RETICLE_MIN_RADIUS = 12;
const RETICLE_MAX_RADIUS = 24;
const RETICLE_LINE_WIDTH = 1.8;
const BARREL_BASE_RADIUS_RATIO = 0.18;
const BARREL_TIP_INSET_RATIO = 0.14;
const BARREL_LINE_WIDTH_RATIO = 0.025;
const TRACE_LINE_WIDTH_RATIO = 0.012;
const GLASS_HIGHLIGHT_OFFSET_RATIO = 0.28;
const GLASS_HIGHLIGHT_RADIUS_RATIO = 0.34;
const GLASS_HIGHLIGHT_ALPHA = 0.28;
const VIGNETTE_INNER_RATIO = 0.54;
const VIGNETTE_OUTER_RATIO = 1;
const CROSSHAIR_TICK_RATIO = 0.55;
const CROSSHAIR_GAP_RATIO = 0.28;

export interface BallTurretCanvasSize {
  width: number;
  height: number;
}

export interface BallTurretRenderState {
  canvasSize: BallTurretCanvasSize;
  geometry: RadialPlayfieldGeometry;
  paddlePosition: Partial<RadialPaddleBounds> & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AimPoint {
  x: number;
  y: number;
  angle: number;
  radius: number;
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

function readAimPoint(state: BallTurretRenderState): AimPoint {
  const radial = state.paddlePosition.radial;
  if (radial) {
    return {
      x: radial.centerX + Math.cos(radial.centerAngle) * radial.radius,
      y: radial.centerY + Math.sin(radial.centerAngle) * radial.radius,
      angle: radial.centerAngle,
      radius: radial.radius,
    };
  }

  const fallbackX = state.paddlePosition.x + state.paddlePosition.width * HALF;
  const fallbackY = state.paddlePosition.y + state.paddlePosition.height * HALF;
  return {
    x: fallbackX,
    y: fallbackY,
    angle: Math.atan2(
      fallbackY - state.geometry.centerY,
      fallbackX - state.geometry.centerX,
    ),
    radius: Math.hypot(
      fallbackX - state.geometry.centerX,
      fallbackY - state.geometry.centerY,
    ),
  };
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

export function drawBallTurretReticle(
  ctx: CanvasRenderingContext2D,
  state: BallTurretRenderState,
): void {
  const aim = readAimPoint(state);
  const { geometry } = state;
  const reticleRadius = Math.min(
    RETICLE_MAX_RADIUS,
    Math.max(RETICLE_MIN_RADIUS, geometry.radius * RETICLE_RADIUS_RATIO),
  );
  const barrelBaseRadius = geometry.radius * BARREL_BASE_RADIUS_RATIO;
  const barrelTipRadius = geometry.radius * (1 - BARREL_TIP_INSET_RATIO);
  const baseX = geometry.centerX + Math.cos(aim.angle) * barrelBaseRadius;
  const baseY = geometry.centerY + Math.sin(aim.angle) * barrelBaseRadius;
  const tipX = geometry.centerX + Math.cos(aim.angle) * barrelTipRadius;
  const tipY = geometry.centerY + Math.sin(aim.angle) * barrelTipRadius;

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(20, 31, 41, 0.92)";
  ctx.lineWidth = Math.max(4, geometry.radius * BARREL_LINE_WIDTH_RATIO);
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(125, 249, 255, 0.44)";
  ctx.lineWidth = Math.max(1.4, geometry.radius * TRACE_LINE_WIDTH_RATIO);
  ctx.beginPath();
  ctx.moveTo(geometry.centerX, geometry.centerY);
  ctx.lineTo(aim.x, aim.y);
  ctx.stroke();

  ctx.strokeStyle = "rgba(248, 251, 255, 0.92)";
  ctx.lineWidth = RETICLE_LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(aim.x, aim.y, reticleRadius, 0, FULL_CIRCLE);
  ctx.stroke();

  const gap = reticleRadius * CROSSHAIR_GAP_RATIO;
  const tick = reticleRadius * CROSSHAIR_TICK_RATIO;
  ctx.beginPath();
  ctx.moveTo(aim.x - reticleRadius - tick, aim.y);
  ctx.lineTo(aim.x - gap, aim.y);
  ctx.moveTo(aim.x + gap, aim.y);
  ctx.lineTo(aim.x + reticleRadius + tick, aim.y);
  ctx.moveTo(aim.x, aim.y - reticleRadius - tick);
  ctx.lineTo(aim.x, aim.y - gap);
  ctx.moveTo(aim.x, aim.y + gap);
  ctx.lineTo(aim.x, aim.y + reticleRadius + tick);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 245, 184, 0.84)";
  ctx.beginPath();
  ctx.arc(aim.x, aim.y, Math.max(2, reticleRadius * 0.12), 0, FULL_CIRCLE);
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
