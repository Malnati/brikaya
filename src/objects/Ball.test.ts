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

jest.mock('../utils/assetLoader', () => ({
  AssetLoader: {
    getImage: jest.fn(() => null),
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
const INITIAL_BRICK_COUNT = DIMENSIONS.brickCols * DIMENSIONS.brickRows;

function buildPhaseSpeedConfig(level: number): PhaseSpeedConfig {
  const maxSpeed = calculateLevelMaxSpeed(CANVAS_WIDTH, level);
  return {
    level,
    initialBrickCount: INITIAL_BRICK_COUNT,
    initialSpawnSpeed: calculateLevelInitialSpawnSpeed(CANVAS_WIDTH, level),
    maxSpeed,
    minSpeed: calculateLevelMinSpeed(CANVAS_WIDTH, level),
    reductionPerBrick: calculateSpeedReductionPerBrick(maxSpeed, INITIAL_BRICK_COUNT),
    previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(CANVAS_WIDTH, level),
    levelStartedAt: Date.now() - 1000,
  };
}

describe('Ball', () => {
  it('aplica multiplicador ao resetar para uma nova fase', () => {
    const multiplier = calculateLevelSpeedMultiplier(2);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);

    ball.resetForLevel(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, multiplier);

    const expectedSpeed = calculateInitialBallSpeed(CANVAS_WIDTH) * multiplier;
    expect(ball.position).toEqual({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, radius: DIMENSIONS.ballRadius });
    expect(ball.getVelocity().dx).toBeCloseTo(expectedSpeed, 5);
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
});
