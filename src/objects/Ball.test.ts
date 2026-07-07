// src/objects/Ball.test.ts
import { describe, expect, it, jest } from '@jest/globals';

import { Ball } from './Ball';
import {
  calculateInitialBallSpeed,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  DynamicGameDimensions,
  MAX_LEVEL_SPEED_MULTIPLIER,
  PhaseSpeedConfig
} from '../constants/game';
import {
  calculateBallTurretBoundarySegments,
  calculateBallTurretPlayfieldGeometry,
  calculateRadialPaddleBounds,
  calculateRadialPlayfieldGeometry,
} from '../utils/radialGeometry';

jest.mock('../utils/assetLoader', () => ({
  AssetLoader: {
    getOrLoadImage: jest.fn(() => null),
  },
}));

jest.mock('../utils/collisionTracker', () => ({
  collisionTracker: {
    logWallCollision: jest.fn().mockResolvedValue(undefined),
    logCeilingCollision: jest.fn().mockResolvedValue(undefined),
    logPaddleCollision: jest.fn().mockResolvedValue(undefined),
    logBallLost: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../storage/gameLogger', () => ({
  gameLogger: {
    logCollision: jest.fn().mockResolvedValue(undefined),
    logBallLost: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../utils/logger', () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
}));

const DIMENSIONS: DynamicGameDimensions = {
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

const CANVAS_WIDTH = 393;
const CANVAS_HEIGHT = 852;
const PHASE_ONE = 1;
const PHASE_TWO = 2;
const LATE_PHASE = 11;
const INITIAL_BRICK_COUNT = DIMENSIONS.brickCols * DIMENSIONS.brickRows;
const CENTER_DIVISOR = 2;
const RADIAL_PADDLE_TEST_INSET = 1;
const CARTESIAN_TO_BALL_DIRECTION_OFFSET = Math.PI / 2;

function buildPhaseSpeedConfig(level: number): PhaseSpeedConfig {
  const maxSpeed = calculateLevelMaxSpeed(CANVAS_WIDTH, level);
  const minSpeed = calculateLevelMinSpeed(CANVAS_WIDTH, level);
  return {
    level,
    initialBrickCount: INITIAL_BRICK_COUNT,
    initialSpawnSpeed: calculateLevelInitialSpawnSpeed(CANVAS_WIDTH, level),
    maxSpeed,
    minSpeed,
    reductionPerBrick: calculateSpeedReductionPerBrick(maxSpeed, INITIAL_BRICK_COUNT, minSpeed),
    previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(CANVAS_WIDTH, level),
    levelStartedAt: Date.now() - 1000,
  };
}

function createGameState(ball: Ball, level: number = PHASE_ONE) {
  return {
    score: 0,
    ballsCount: 1,
    bricksRemaining: INITIAL_BRICK_COUNT,
    gameWon: false,
    gameOver: false,
    level,
    canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    gameDimensions: DIMENSIONS,
    speedState: ball.getSpeedStateSnapshot(),
  };
}

function placeBallAtTurretBoundary(
  ball: Ball,
  geometry: ReturnType<typeof calculateBallTurretPlayfieldGeometry>,
  angle: number,
) {
  const boundaryRadius = geometry.radius - DIMENSIONS.ballRadius - 1;

  ball.setPosition(
    geometry.centerX + Math.cos(angle) * boundaryRadius,
    geometry.centerY + Math.sin(angle) * boundaryRadius,
  );
  ball.setDirection(angle + CARTESIAN_TO_BALL_DIRECTION_OFFSET);
}

describe('Ball', () => {
  it('aplica multiplicador ao resetar para uma nova fase', () => {
    const multiplier = calculateLevelSpeedMultiplier(2);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);

    ball.resetForLevel(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, multiplier);

    const expectedSpeed = calculateInitialBallSpeed(CANVAS_WIDTH) * multiplier;
    expect(ball.position).toEqual({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, radius: DIMENSIONS.ballRadius });
    expect(ball.getVelocity().dx).toBeCloseTo(0, 5);
    expect(ball.getVelocity().dy).toBeCloseTo(-expectedSpeed, 5);
  });

  it('respeita teto de velocidade da progressão de fases', () => {
    expect(calculateLevelSpeedMultiplier(99)).toBe(MAX_LEVEL_SPEED_MULTIPLIER);
  });

  it('inicia fase 1 com a nova base como máxima e spawn inicial', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
    expect(config.initialSpawnSpeed).toBe(config.maxSpeed);
    expect(config.maxSpeed).toBe(calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE));
    expect(ball.getSpeedStateSnapshot()).toMatchObject({
      level: PHASE_ONE,
      maxSpeed: config.maxSpeed,
      minSpeed: config.minSpeed,
      currentSpeed: config.maxSpeed,
      initialBrickCount: INITIAL_BRICK_COUNT,
      successfulBrickHits: 0,
    });
  });

  it('inicia fase 2 na máxima derivada da nova base da fase 1', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_TWO);

    ball.applyPhaseSpeedConfig(config);

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
    expect(config.initialSpawnSpeed).toBe(config.maxSpeed);
  });

  it('reduz velocidade por constante fixa ao acertar bloco', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);
    ball.registerBrickHit();

    expect(ball.getCurrentSpeedMagnitude()).toBeCloseTo(
      config.initialSpawnSpeed - config.reductionPerBrick,
      5
    );
    expect(ball.getLastSpeedReduction()?.level).toBe(PHASE_ONE);
    expect(ball.getLastSpeedReduction()?.hitNumber).toBe(1);
    expect(ball.getLastSpeedReduction()?.speedBefore).toBeCloseTo(config.initialSpawnSpeed, 5);
    expect(ball.getLastSpeedReduction()?.speedAfter).toBeCloseTo(
      config.initialSpawnSpeed - config.reductionPerBrick,
      5
    );
    expect(ball.getLastSpeedReduction()?.reductionApplied).toBeCloseTo(
      config.reductionPerBrick,
      5
    );
    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThan(config.minSpeed);
  });

  it('reduz gradualmente e só alcança o mínimo ao consumir todos os blocos iniciais', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    for (let hit = 0; hit < INITIAL_BRICK_COUNT - 1; hit += 1) {
      ball.registerBrickHit();
    }

    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThan(config.minSpeed);
    expect(ball.getLastSpeedReduction()?.minReached).toBe(false);

    ball.registerBrickHit();

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.minSpeed);
    expect(ball.getLastSpeedReduction()?.minReached).toBe(true);
  });

  it('não deixa múltiplos hits passarem da velocidade mínima', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    for (let hit = 0; hit < INITIAL_BRICK_COUNT * 4; hit += 1) {
      ball.registerBrickHit();
    }

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.minSpeed);
    expect(ball.getLastSpeedReduction()?.minReached).toBe(true);
  });

  it('mantém magnitude clampada na faixa da fase ao bater na raquete', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
    (ball as any).setPosition(150, 400);
    (ball as any).handlePaddleCollision({ x: 100, y: 430, width: 100, height: 12 });

    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThanOrEqual(config.minSpeed);
    expect(ball.getCurrentSpeedMagnitude()).toBeLessThanOrEqual(config.maxSpeed);
    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
  });

  it('mantém módulo válido ao inverter direção no teto', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);
    ball.registerBrickHit();
    const speedBeforeBounce = ball.getCurrentSpeedMagnitude();

    ball.bounceY();

    expect(ball.getCurrentSpeedMagnitude()).toBeCloseTo(speedBeforeBounce, 5);
    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThanOrEqual(config.minSpeed);
  });


  it('mantém deslocamento equivalente entre 60Hz e 120Hz', () => {
    const oneFrame60Hz = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const twoFrames120Hz = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);
    const bricks = { collide: jest.fn(() => false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    oneFrame60Hz.applyPhaseSpeedConfig(config);
    twoFrames120Hz.applyPhaseSpeedConfig(config);

    oneFrame60Hz.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(oneFrame60Hz),
      undefined,
      1,
    );
    twoFrames120Hz.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(twoFrames120Hz),
      undefined,
      0.5,
    );
    twoFrames120Hz.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(twoFrames120Hz),
      undefined,
      0.5,
    );

    expect(twoFrames120Hz.position.y).toBeCloseTo(oneFrame60Hz.position.y, 5);
  });

  it('não move a bola quando frameScale é zero', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);
    const bricks = { collide: jest.fn(() => false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    ball.applyPhaseSpeedConfig(config);
    const before = ball.position;

    ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
      undefined,
      0,
    );

    expect(ball.position).toEqual(before);
  });

  it('mantém a bolinha dentro do canvas ao bater na parede em alta velocidade', async () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(LATE_PHASE);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    ball.applyPhaseSpeedConfig(config);
    ball.setPosition(CANVAS_WIDTH - DIMENSIONS.ballRadius - 1, 120);
    ball.setDirection(Math.PI / 2);

    await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      {
        score: 0,
        ballsCount: 1,
        bricksRemaining: INITIAL_BRICK_COUNT,
        gameWon: false,
        gameOver: false,
        level: LATE_PHASE,
        canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        gameDimensions: DIMENSIONS,
        speedState: ball.getSpeedStateSnapshot(),
      }
    );

    expect(ball.position.x).toBeLessThanOrEqual(CANVAS_WIDTH - DIMENSIONS.ballRadius);
    expect(ball.position.x).toBeGreaterThanOrEqual(DIMENSIONS.ballRadius);
    expect(ball.getVelocity().dx).toBeLessThan(0);
  });

  it('rebate na raquete em arco na borda radial inferior', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const paddle = {
      position: calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI / 2, 1),
    };
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX,
      geometry.centerY + geometry.radius - DIMENSIONS.ballRadius - 1,
    );
    ball.setDirection(Math.PI);

    const inPlay = await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dy).toBeLessThan(0);
  });

  it('rebate na banda visual da raquete radial antes da borda externa', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const paddlePosition = calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const targetRadius =
      paddlePosition.radial.radius -
      paddlePosition.radial.thickness / CENTER_DIVISOR -
      DIMENSIONS.ballRadius -
      RADIAL_PADDLE_TEST_INSET;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX,
      geometry.centerY + targetRadius,
    );
    ball.setDirection(Math.PI);

    const inPlay = await ball.update(
      { position: paddlePosition },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dy).toBeLessThan(0);
  });

  it('perde a bolinha no arco inferior quando a raquete radial não cobre a saída', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const sidePaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI * 0.22, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX,
      geometry.centerY + geometry.radius - DIMENSIONS.ballRadius - 1,
    );
    ball.setDirection(Math.PI);

    const inPlay = await ball.update(
      { position: sidePaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(false);
  });

  it('reflete na parede circular fora do arco de perda', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const paddle = {
      position: calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI / 2, 1),
    };
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX + geometry.radius - DIMENSIONS.ballRadius - 1,
      geometry.centerY,
    );
    ball.setDirection(Math.PI / 2);

    const inPlay = await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dx).toBeLessThan(0);
  });

  it('na torreta rebate a bolinha nas partes ativas da borda', async () => {
    const geometry = calculateBallTurretPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const topPaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, -Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, 1, undefined, geometry);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const bottomReboundSegment = calculateBallTurretBoundarySegments(PHASE_ONE)[0];
    const bottomReboundAngle =
      (bottomReboundSegment.startAngle + bottomReboundSegment.endAngle) / 2;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    placeBallAtTurretBoundary(ball, geometry, bottomReboundAngle);

    const inPlay = await ball.update(
      { position: topPaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dy).toBeLessThan(0);
  });

  it('na torreta perde a bolinha nas partes inativas da borda', async () => {
    const geometry = calculateBallTurretPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const topPaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, -Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, 1, undefined, geometry);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const inactiveSegment = calculateBallTurretBoundarySegments(PHASE_ONE)[1];
    const inactiveAngle =
      (inactiveSegment.startAngle + inactiveSegment.endAngle) / 2;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    placeBallAtTurretBoundary(ball, geometry, inactiveAngle);

    const inPlay = await ball.update(
      { position: topPaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(false);
  });

  it('na fase 10 da torreta não mantém partes da borda rebatendo', async () => {
    const geometry = calculateBallTurretPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const topPaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, -Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, 1, undefined, geometry);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const bottomSegment = calculateBallTurretBoundarySegments(PHASE_ONE)[0];
    const bottomAngle = (bottomSegment.startAngle + bottomSegment.endAngle) / 2;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(10));
    placeBallAtTurretBoundary(ball, geometry, bottomAngle);

    const inPlay = await ball.update(
      { position: topPaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball, 10),
    );

    expect(inPlay).toBe(false);
  });
});
