// src/utils/radialGeometry.ts
import type { DynamicGameDimensions } from "../constants/game";

const CENTER_RATIO = 0.5;
const BRICK_ARC_START_ANGLE = (-Math.PI * 5) / 6;
const BRICK_ARC_END_ANGLE = -Math.PI / 6;
const BALL_TURRET_BRICK_ARC_START_ANGLE = -Math.PI;
const BALL_TURRET_BRICK_ARC_END_ANGLE = Math.PI;
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
const FULL_CIRCLE_EPSILON = 0.000001;
const MIN_RADIUS_FOR_ANGLE_EXPANSION = 1;
export const BALL_TURRET_BOUNDARY_SEGMENT_COUNT = 18;
export const BALL_TURRET_INITIAL_REBOUND_SEGMENT_COUNT = 9;
export const BALL_TURRET_REBOUND_ZERO_LEVEL = 10;
const BALL_TURRET_BOUNDARY_START_ANGLE =
  Math.PI / 2 - FULL_CIRCLE / BALL_TURRET_BOUNDARY_SEGMENT_COUNT / 2;

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
  paddleMovementStartAngle: number;
  paddleMovementEndAngle: number;
  lossArcStartAngle: number;
  lossArcEndAngle: number;
  lossIsFullCircle: boolean;
  trampolineIsFullRing: boolean;
}

export interface RadialBrickSegment {
  centerX: number;
  centerY: number;
  centerAngle: number;
  centerRadius: number;
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
    lossIsFullCircle: boolean;
  };
}

export interface BallTurretBoundarySegment {
  index: number;
  startAngle: number;
  endAngle: number;
  rebounds: boolean;
}

export function calculateRadialPlayfieldGeometry(
  canvasWidth: number,
  canvasHeight: number,
  _dimensions: DynamicGameDimensions,
): RadialPlayfieldGeometry {
  const radius = canvasHeight * CENTER_RATIO;

  return {
    centerX: canvasWidth * CENTER_RATIO,
    centerY: canvasHeight * CENTER_RATIO,
    radius,
    brickArcStartAngle: BRICK_ARC_START_ANGLE,
    brickArcEndAngle: BRICK_ARC_END_ANGLE,
    brickRingStartRadius: radius * BRICK_RING_START_RADIUS_RATIO,
    brickRingEndRadius: radius * BRICK_RING_END_RADIUS_RATIO,
    paddleRadius: radius * PADDLE_RADIUS_RATIO,
    paddleMovementStartAngle: PADDLE_MOVEMENT_START_ANGLE,
    paddleMovementEndAngle: PADDLE_MOVEMENT_END_ANGLE,
    lossArcStartAngle: LOSS_ARC_START_ANGLE,
    lossArcEndAngle: LOSS_ARC_END_ANGLE,
    lossIsFullCircle: false,
    trampolineIsFullRing: false,
  };
}

export function calculateBallTurretPlayfieldGeometry(
  canvasWidth: number,
  canvasHeight: number,
  dimensions: DynamicGameDimensions,
): RadialPlayfieldGeometry {
  const geometry = calculateRadialPlayfieldGeometry(
    canvasWidth,
    canvasHeight,
    dimensions,
  );

  return {
    ...geometry,
    brickArcStartAngle: BALL_TURRET_BRICK_ARC_START_ANGLE,
    brickArcEndAngle: BALL_TURRET_BRICK_ARC_END_ANGLE,
    paddleMovementStartAngle: -Math.PI,
    paddleMovementEndAngle: Math.PI,
    lossArcStartAngle: -Math.PI,
    lossArcEndAngle: Math.PI,
    lossIsFullCircle: true,
    trampolineIsFullRing: true,
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
  const movementIsFullCircle = isFullAngleRange(
    geometry.paddleMovementStartAngle,
    geometry.paddleMovementEndAngle,
  );
  const movementStartAngle = movementIsFullCircle
    ? geometry.paddleMovementStartAngle
    : geometry.paddleMovementStartAngle + halfArcWidth;
  const movementEndAngle = movementIsFullCircle
    ? geometry.paddleMovementEndAngle
    : geometry.paddleMovementEndAngle - halfArcWidth;
  const clampedCenterAngle = movementIsFullCircle
    ? normalizeSignedAngle(centerAngle)
    : Math.max(movementStartAngle, Math.min(movementEndAngle, centerAngle));
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
      lossIsFullCircle: geometry.lossIsFullCircle,
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

export function calculatePaddleAngleFromCanvasPoint(
  canvasX: number,
  canvasY: number,
  paddleBounds: RadialPaddleBounds,
): number {
  const angle = Math.atan2(
    canvasY - paddleBounds.radial.centerY,
    canvasX - paddleBounds.radial.centerX,
  );

  if (
    isFullAngleRange(
      paddleBounds.radial.movementStartAngle,
      paddleBounds.radial.movementEndAngle,
    )
  ) {
    return normalizeSignedAngle(angle);
  }

  return Math.max(
    paddleBounds.radial.movementStartAngle,
    Math.min(paddleBounds.radial.movementEndAngle, angle),
  );
}

export function calculateBallTurretReboundSegmentCount(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));

  return Math.max(
    0,
    Math.min(
      BALL_TURRET_INITIAL_REBOUND_SEGMENT_COUNT,
      BALL_TURRET_REBOUND_ZERO_LEVEL - safeLevel,
    ),
  );
}

export function calculateBallTurretBoundarySegments(
  level: number,
): BallTurretBoundarySegment[] {
  const reboundIndexes = calculateBallTurretReboundSegmentIndexes(level);
  const segmentSpan = FULL_CIRCLE / BALL_TURRET_BOUNDARY_SEGMENT_COUNT;

  return Array.from(
    { length: BALL_TURRET_BOUNDARY_SEGMENT_COUNT },
    (_, index) => {
      const startAngle = BALL_TURRET_BOUNDARY_START_ANGLE + index * segmentSpan;

      return {
        index,
        startAngle,
        endAngle: startAngle + segmentSpan,
        rebounds: reboundIndexes.has(index),
      };
    },
  );
}

export function isBallTurretBoundarySegmentRebounding(
  angle: number,
  level: number,
): boolean {
  const normalizedOffset = normalizeAngle(
    angle - BALL_TURRET_BOUNDARY_START_ANGLE,
  );
  const segmentSpan = FULL_CIRCLE / BALL_TURRET_BOUNDARY_SEGMENT_COUNT;
  const index = Math.min(
    BALL_TURRET_BOUNDARY_SEGMENT_COUNT - 1,
    Math.floor(normalizedOffset / segmentSpan),
  );

  return calculateBallTurretReboundSegmentIndexes(level).has(index);
}

function calculateBallTurretReboundSegmentIndexes(level: number): Set<number> {
  const reboundSegmentCount = calculateBallTurretReboundSegmentCount(level);

  return new Set(
    Array.from({ length: reboundSegmentCount }, (_, index) =>
      Math.floor(
        (index * BALL_TURRET_BOUNDARY_SEGMENT_COUNT) / reboundSegmentCount,
      ),
    ),
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
    centerAngle: midAngle,
    centerRadius: midRadius,
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
    return (
      normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd
    );
  }

  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

export function normalizeAngle(angle: number): number {
  return ((angle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
}

function normalizeSignedAngle(angle: number): number {
  const normalizedAngle = normalizeAngle(angle);

  return normalizedAngle > Math.PI
    ? normalizedAngle - FULL_CIRCLE
    : normalizedAngle;
}

function isFullAngleRange(startAngle: number, endAngle: number): boolean {
  return Math.abs(endAngle - startAngle) >= FULL_CIRCLE - FULL_CIRCLE_EPSILON;
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
    pointFromPolar(
      geometry,
      (startAngle + endAngle) * CENTER_RATIO,
      innerRadius,
    ),
    pointFromPolar(
      geometry,
      (startAngle + endAngle) * CENTER_RATIO,
      outerRadius,
    ),
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
