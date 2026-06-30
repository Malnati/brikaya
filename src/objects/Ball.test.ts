// src/objects/Ball.test.ts
import { describe, expect, it, jest } from '@jest/globals';

import { Ball } from './Ball';
import { calculateInitialBallSpeed, calculateLevelSpeedMultiplier, DynamicGameDimensions, MAX_LEVEL_SPEED_MULTIPLIER } from '../constants/game';

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

describe('Ball', () => {
  it('aplica multiplicador ao resetar para uma nova fase', () => {
    const canvasWidth = 393;
    const canvasHeight = 852;
    const multiplier = calculateLevelSpeedMultiplier(2);
    const ball = new Ball(canvasWidth, canvasHeight, DIMENSIONS);

    ball.resetForLevel(canvasWidth, canvasHeight, DIMENSIONS, multiplier);

    const expectedSpeed = calculateInitialBallSpeed(canvasWidth) * multiplier;
    expect(ball.position).toEqual({ x: canvasWidth / 2, y: canvasHeight - 30, radius: DIMENSIONS.ballRadius });
    expect(ball.getVelocity().dx).toBeCloseTo(expectedSpeed, 5);
    expect(ball.getVelocity().dy).toBeCloseTo(-expectedSpeed, 5);
  });

  it('respeita teto de velocidade da progressão de fases', () => {
    expect(calculateLevelSpeedMultiplier(99)).toBe(MAX_LEVEL_SPEED_MULTIPLIER);
  });
});
