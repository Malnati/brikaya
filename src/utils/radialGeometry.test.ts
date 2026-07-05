// src/utils/radialGeometry.test.ts
import type { DynamicGameDimensions } from "../constants/game";

import {
  calculateBallTurretPlayfieldGeometry,
  calculatePaddleAngleFromCanvasPoint,
  calculatePaddleAngleFromCanvasX,
  calculateRadialBrickSegment,
  calculateRadialPaddleBounds,
  calculateRadialPlayfieldGeometry,
  isCircleIntersectingRadialSegment,
} from "./radialGeometry";

const TEST_CANVAS_WIDTH = 480;
const TEST_CANVAS_HEIGHT = 480;
const TEST_DIMENSIONS: DynamicGameDimensions = {
  brickWidth: 60,
  brickHeight: 20,
  brickPadding: 8,
  brickOffsetTop: 24,
  brickOffsetLeft: 16,
  brickCols: 5,
  brickRows: 3,
  paddleWidth: 80,
  paddleHeight: 12,
  ballRadius: 9,
};
const FULL_CIRCLE_TURRET_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  brickCols: TEST_DIMENSIONS.brickCols * 2,
};

describe("radialGeometry", () => {
  it("calcula arena circular centralizada e tijolo no arco superior", () => {
    const geometry = calculateRadialPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      TEST_DIMENSIONS,
    );
    const segment = calculateRadialBrickSegment(
      geometry,
      TEST_DIMENSIONS,
      2,
      0,
    );

    expect(geometry.centerX).toBe(TEST_CANVAS_WIDTH / 2);
    expect(geometry.centerY).toBe(TEST_CANVAS_HEIGHT / 2);
    expect(segment.centerY).toBeLessThan(geometry.centerY);
    expect(segment.bounds.width).toBeGreaterThan(0);
    expect(segment.bounds.height).toBeGreaterThan(0);
  });

  it("usa o raio máximo do centro até a borda superior do canvas", () => {
    const geometry = calculateRadialPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      TEST_DIMENSIONS,
    );

    expect(geometry.radius).toBe(TEST_CANVAS_HEIGHT / 2);
    expect(geometry.centerY - geometry.radius).toBe(0);
    expect(geometry.centerY + geometry.radius).toBe(TEST_CANVAS_HEIGHT);
  });

  it("calcula tijolos da torreta em toda a circunferência", () => {
    const classicGeometry = calculateRadialPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      TEST_DIMENSIONS,
    );
    const turretGeometry = calculateBallTurretPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      FULL_CIRCLE_TURRET_DIMENSIONS,
    );
    const classicSegment = calculateRadialBrickSegment(
      classicGeometry,
      TEST_DIMENSIONS,
      2,
      0,
    );
    const turretSegments = Array.from(
      { length: FULL_CIRCLE_TURRET_DIMENSIONS.brickCols },
      (_, col) =>
        calculateRadialBrickSegment(
          turretGeometry,
          FULL_CIRCLE_TURRET_DIMENSIONS,
          col,
          0,
        ),
    );

    expect(classicSegment.centerY).toBeLessThan(classicGeometry.centerY);
    expect(turretGeometry.brickArcStartAngle).toBeCloseTo(-Math.PI);
    expect(turretGeometry.brickArcEndAngle).toBeCloseTo(Math.PI);
    expect(
      turretSegments.some((segment) => segment.centerX < turretGeometry.centerX),
    ).toBe(true);
    expect(
      turretSegments.some((segment) => segment.centerX > turretGeometry.centerX),
    ).toBe(true);
    expect(
      turretSegments.some((segment) => segment.centerY < turretGeometry.centerY),
    ).toBe(true);
    expect(
      turretSegments.some((segment) => segment.centerY > turretGeometry.centerY),
    ).toBe(true);
  });

  it("mantém segmento ativo da cama elástica navegável em 360 graus", () => {
    const turretGeometry = calculateBallTurretPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      FULL_CIRCLE_TURRET_DIMENSIONS,
    );
    const wrappedPaddle = calculateRadialPaddleBounds(
      turretGeometry,
      FULL_CIRCLE_TURRET_DIMENSIONS,
      Math.PI * 1.25,
      1,
    );
    const topAngle = calculatePaddleAngleFromCanvasPoint(
      turretGeometry.centerX,
      turretGeometry.centerY - turretGeometry.paddleRadius,
      wrappedPaddle,
    );

    expect(wrappedPaddle.radial.centerAngle).toBeCloseTo(-Math.PI * 0.75);
    expect(wrappedPaddle.radial.lossIsFullCircle).toBe(true);
    expect(topAngle).toBeCloseTo(-Math.PI / 2);
  });

  it("detecta colisão circular dentro de segmento radial", () => {
    const geometry = calculateRadialPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      TEST_DIMENSIONS,
    );
    const segment = calculateRadialBrickSegment(
      geometry,
      TEST_DIMENSIONS,
      1,
      1,
    );

    expect(
      isCircleIntersectingRadialSegment(
        {
          x: segment.centerX,
          y: segment.centerY,
          radius: TEST_DIMENSIONS.ballRadius,
        },
        segment,
        geometry,
      ),
    ).toBe(true);
    expect(
      isCircleIntersectingRadialSegment(
        {
          x: geometry.centerX,
          y: geometry.centerY,
          radius: TEST_DIMENSIONS.ballRadius,
        },
        segment,
        geometry,
      ),
    ).toBe(false);
  });

  it("mapeia toque horizontal para raquete em arco inferior", () => {
    const geometry = calculateRadialPlayfieldGeometry(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      TEST_DIMENSIONS,
    );
    const paddle = calculateRadialPaddleBounds(
      geometry,
      TEST_DIMENSIONS,
      Math.PI / 2,
      1,
    );
    const leftAngle = calculatePaddleAngleFromCanvasX(
      0,
      TEST_CANVAS_WIDTH,
      paddle,
    );
    const rightAngle = calculatePaddleAngleFromCanvasX(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_WIDTH,
      paddle,
    );

    expect(leftAngle).toBeGreaterThan(paddle.radial.centerAngle);
    expect(rightAngle).toBeLessThan(paddle.radial.centerAngle);
  });
});
