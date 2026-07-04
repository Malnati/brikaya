// src/utils/radialGeometry.ts
import type { DynamicGameDimensions } from "../constants/game";

const CENTER_RATIO = 0.5;
const PLAYFIELD_RADIUS_RATIO = 0.47;
const PLAYFIELD_RADIUS_INSET = 6;
const MIN_PLAYFIELD_RADIUS = 96;
const BRICK_ARC_START_ANGLE = (-Math.PI * 5) / 6;
const BRICK_ARC_END_ANGLE = -Math.PI / 6;
const BRICK_RING_START_RADIUS_RATIO = 0.28;
const BRICK_RING_END_RADIUS_RATIO = 0.74;
const BRICK_RADIAL_GAP_RATIO = 0.18;
const BRICK_MAX_ANGLE_GAP = 0.03;
const BRICK_ANGLE_GAP_RATIO = 0.14;
const PADDLE_RADIUS_RATIO = 0.9;
const PADDLE_MIN_ARC = 0.32;
const PADDLE_MAX_ARC = 0.88;
const PADDLE_THICKNESS_RATIO = 1.65;
const PADDLE_MOVEMENT_START_ANGLE = Math.PI * 0.08;
const PADDLE_MOVEMENT_END_ANGLE = Math.PI * 0.92;
const LOSS_ARC_START_ANGLE = Math.PI * 0.16;
const LOSS_ARC_END_ANGLE = Math.PI * 0.84;
const FULL_CIRCLE = Math.PI * 2;
const MIN_RADIUS_FOR_ANGLE_EXPANSION = 1;

export interface CartesianPoint {
  x: number;
  y: number;
}

export interface CircleBounds extends CartesianPoint {
  radius: number;
}

export interface RectBounds extends CartesianPoint {
  width: number;
  height: number;
}

export interface RadialPlayfieldGeometry {
  centerX: number;
  centerY: number;
  radius: number;
  brickArcStartAngle: number;
  brickArcEndAngle: number;
  brickRingStartRadius: number;
  brickRingEndRadius: number;
  paddleRadius: number;
  lossArcStartAngle: number;
  lossArcEndAngle: number;
}

export interface RadialBrickSegment {
  centerX: number;
  centerY: number;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  bounds: RectBounds;
}

export interface RadialPaddleBounds extends RectBounds {
  radial: {
    centerX: number;
    centerY: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    centerAngle: number;
    thickness: number;
    movementStartAngle: number;
    movementEndAngle: number;
    lossStartAngle: number;
    lossEndAngle: number;
  };
}

export function calculateRadialPlayfieldGeometry(
  canvasWidth: number,
  canvasHeight: number,
  _dimensions: DynamicGameDimensions,
): RadialPlayfieldGeometry {
  const radius = Math.max(
    MIN_PLAYFIELD_RADIUS,
    Math.min(canvasWidth, canvasHeight) * PLAYFIELD_RADIUS_RATIO -
      PLAYFIELD_RADIUS_INSET,
  );

  return {
    centerX: canvasWidth * CENTER_RATIO,
    centerY: canvasHeight * CENTER_RATIO,
    radius,
    brickArcStartAngle: BRICK_ARC_START_ANGLE,
    brickArcEndAngle: BRICK_ARC_END_ANGLE,
    brickRingStartRadius: radius * BRICK_RING_START_RADIUS_RATIO,
    brickRingEndRadius: radius * BRICK_RING_END_RADIUS_RATIO,
    paddleRadius: radius * PADDLE_RADIUS_RATIO,
    lossArcStartAngle: LOSS_ARC_START_ANGLE,
    lossArcEndAngle: LOSS_ARC_END_ANGLE,
  };
}

export function calculateRadialPaddleBounds(
  geometry: RadialPlayfieldGeometry,
  dimensions: DynamicGameDimensions,
  centerAngle: number,
  widthScale: number,
): RadialPaddleBounds {
  const arcWidth = Math.max(
    PADDLE_MIN_ARC,
    Math.min(
      PADDLE_MAX_ARC,
      (dimensions.paddleWidth * widthScale) / geometry.paddleRadius,
    ),
  );
  const halfArcWidth = arcWidth * CENTER_RATIO;
  const movementStartAngle = PADDLE_MOVEMENT_START_ANGLE + halfArcWidth;
  const movementEndAngle = PADDLE_MOVEMENT_END_ANGLE - halfArcWidth;
  const clampedCenterAngle = Math.max(
    movementStartAngle,
    Math.min(movementEndAngle, centerAngle),
  );
  const thickness = dimensions.paddleHeight * PADDLE_THICKNESS_RATIO;
  const centerX =
    geometry.centerX + Math.cos(clampedCenterAngle) * geometry.paddleRadius;
  const centerY =
    geometry.centerY + Math.sin(clampedCenterAngle) * geometry.paddleRadius;
  const chordWidth =
    Math.sin(arcWidth * CENTER_RATIO) * geometry.paddleRadius * 2;

  return {
    x: centerX - chordWidth * CENTER_RATIO,
    y: centerY - thickness * CENTER_RATIO,
    width: chordWidth,
    height: thickness,
    radial: {
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      radius: geometry.paddleRadius,
      startAngle: clampedCenterAngle - halfArcWidth,
      endAngle: clampedCenterAngle + halfArcWidth,
      centerAngle: clampedCenterAngle,
      thickness,
      movementStartAngle,
      movementEndAngle,
      lossStartAngle: geometry.lossArcStartAngle,
      lossEndAngle: geometry.lossArcEndAngle,
    },
  };
}

export function calculatePaddleAngleFromCanvasX(
  canvasX: number,
  _canvasWidth: number,
  paddleBounds: RadialPaddleBounds,
): number {
  const clampedCosine = Math.max(
    -1,
    Math.min(
      1,
      (canvasX - paddleBounds.radial.centerX) / paddleBounds.radial.radius,
    ),
  );
  const angle = Math.acos(clampedCosine);

  return Math.max(
    paddleBounds.radial.movementStartAngle,
    Math.min(paddleBounds.radial.movementEndAngle, angle),
  );
}

export function calculateRadialBrickSegment(
  geometry: RadialPlayfieldGeometry,
  dimensions: DynamicGameDimensions,
  col: number,
  row: number,
  rows: number = dimensions.brickRows,
): RadialBrickSegment {
  const arcSpan = geometry.brickArcEndAngle - geometry.brickArcStartAngle;
  const angleStep = arcSpan / dimensions.brickCols;
  const angleGap = Math.min(
    BRICK_MAX_ANGLE_GAP,
    Math.abs(angleStep) * BRICK_ANGLE_GAP_RATIO,
  );
  const startAngle = geometry.brickArcStartAngle + col * angleStep + angleGap;
  const endAngle =
    geometry.brickArcStartAngle + (col + 1) * angleStep - angleGap;
  const ringSpan =
    (geometry.brickRingEndRadius - geometry.brickRingStartRadius) / rows;
  const radialGap = Math.min(
    dimensions.brickPadding,
    ringSpan * BRICK_RADIAL_GAP_RATIO,
  );
  const innerRadius =
    geometry.brickRingStartRadius + row * ringSpan + radialGap;
  const outerRadius =
    geometry.brickRingStartRadius + (row + 1) * ringSpan - radialGap;
  const midAngle = (startAngle + endAngle) * CENTER_RATIO;
  const midRadius = (innerRadius + outerRadius) * CENTER_RATIO;

  return {
    centerX: geometry.centerX + Math.cos(midAngle) * midRadius,
    centerY: geometry.centerY + Math.sin(midAngle) * midRadius,
    startAngle,
    endAngle,
    innerRadius,
    outerRadius,
    bounds: calculateRadialSegmentBounds(
      geometry,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
    ),
  };
}

export function isCircleIntersectingRadialSegment(
  circle: CircleBounds,
  segment: RadialBrickSegment,
  geometry: RadialPlayfieldGeometry,
): boolean {
  const polar = toPolar(circle, geometry);
  const angleExpansion =
    circle.radius / Math.max(MIN_RADIUS_FOR_ANGLE_EXPANSION, polar.radius);

  return (
    polar.radius + circle.radius >= segment.innerRadius &&
    polar.radius - circle.radius <= segment.outerRadius &&
    isAngleBetween(
      polar.angle,
      segment.startAngle - angleExpansion,
      segment.endAngle + angleExpansion,
    )
  );
}

export function isAngleBetween(
  angle: number,
  startAngle: number,
  endAngle: number,
): boolean {
  const normalizedAngle = normalizeAngle(angle);
  const normalizedStart = normalizeAngle(startAngle);
  const normalizedEnd = normalizeAngle(endAngle);

  if (normalizedStart <= normalizedEnd) {
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
  }

  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

export function normalizeAngle(angle: number): number {
  return ((angle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
}

export function toPolar(
  point: CartesianPoint,
  geometry: RadialPlayfieldGeometry,
) {
  const dx = point.x - geometry.centerX;
  const dy = point.y - geometry.centerY;

  return {
    angle: Math.atan2(dy, dx),
    radius: Math.sqrt(dx * dx + dy * dy),
  };
}

export function isRadialPaddleBounds(
  value: RectBounds,
): value is RadialPaddleBounds {
  return "radial" in value;
}

function calculateRadialSegmentBounds(
  geometry: RadialPlayfieldGeometry,
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
): RectBounds {
  const points = [
    pointFromPolar(geometry, startAngle, innerRadius),
    pointFromPolar(geometry, startAngle, outerRadius),
    pointFromPolar(geometry, endAngle, innerRadius),
    pointFromPolar(geometry, endAngle, outerRadius),
    pointFromPolar(geometry, (startAngle + endAngle) * CENTER_RATIO, innerRadius),
    pointFromPolar(geometry, (startAngle + endAngle) * CENTER_RATIO, outerRadius),
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function pointFromPolar(
  geometry: RadialPlayfieldGeometry,
  angle: number,
  radius: number,
): CartesianPoint {
  return {
    x: geometry.centerX + Math.cos(angle) * radius,
    y: geometry.centerY + Math.sin(angle) * radius,
  };
}
