import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import {
  LEVEL_CLEAR_PAUSE_MS,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  type PhaseSpeedConfig,
  type SpeedReductionSnapshot,
  type SpeedStateSnapshot
} from '../constants/game';
import { POINTS_PER_BRICK } from '../constants/gameState';
import { GameEngine } from './GameEngine';

const mockBallInstances: any[] = [];
const mockBricksInstances: any[] = [];
let mockBricksAllDestroyed = false;
let mockBricksRows = 5;
let mockBrickActiveValue = true;

function buildSpeedStateFromConfig(config: PhaseSpeedConfig): SpeedStateSnapshot {
  return {
    level: config.level,
    initialBrickCount: config.initialBrickCount,
    successfulBrickHits: 0,
    maxSpeed: config.maxSpeed,
    minSpeed: config.minSpeed,
    currentSpeed: config.maxSpeed,
    reductionPerBrick: config.reductionPerBrick,
    previousLevelMaxSpeed: config.previousLevelMaxSpeed,
    levelStartedAt: config.levelStartedAt,
    elapsedLevelMs: 0,
    minReached: false
  };
}

jest.mock('../objects/Paddle', () => ({
  Paddle: jest.fn().mockImplementation(() => ({
    position: { x: 200, y: 580, width: 80, height: 10 },
    onKeyDown: jest.fn(),
    onKeyUp: jest.fn(),
    setPosition: jest.fn(),
    reset: jest.fn(),
    update: jest.fn(),
    draw: jest.fn()
  }))
}));

jest.mock('../objects/Ball', () => ({
  Ball: jest.fn().mockImplementation(() => {
    let speedState: SpeedStateSnapshot = {
      level: 1,
      initialBrickCount: 1,
      successfulBrickHits: 0,
      maxSpeed: 2,
      minSpeed: 1,
      currentSpeed: 2,
      reductionPerBrick: 2,
      previousLevelMaxSpeed: 2,
      levelStartedAt: Date.now(),
      elapsedLevelMs: 0,
      minReached: false
    };
    let lastSpeedReduction: SpeedReductionSnapshot | null = null;
    let velocity = { dx: 2, dy: -2 };
    const position = { x: 400, y: 300, radius: 5 };

    const mockBall = {
      position,
      getVelocity: jest.fn(() => velocity),
      update: jest.fn().mockResolvedValue(true),
      draw: jest.fn(),
      applyPhaseSpeedConfig: jest.fn((config: PhaseSpeedConfig) => {
        speedState = buildSpeedStateFromConfig(config);
        lastSpeedReduction = null;
        velocity = { dx: config.maxSpeed, dy: -config.maxSpeed };
      }),
      getSpeedStateSnapshot: jest.fn(() => speedState),
      getLastSpeedReduction: jest.fn(() => lastSpeedReduction),
      consumePaddleCollision: jest.fn(() => false),
      setPosition: jest.fn((x: number, y: number) => {
        mockBall.position.x = x;
        mockBall.position.y = y;
      }),
      setDirection: jest.fn(),
      __setSpeedState: (partial: Partial<SpeedStateSnapshot>) => {
        speedState = { ...speedState, ...partial };
      },
      __setLastSpeedReduction: (snapshot: SpeedReductionSnapshot | null) => {
        lastSpeedReduction = snapshot;
      }
    };

    mockBallInstances.push(mockBall);
    return mockBall;
  })
}));

jest.mock('../objects/Bricks', () => ({
  Bricks: jest.fn().mockImplementation(() => {
    const mockBricks = {
      isAllDestroyed: jest.fn(() => mockBricksAllDestroyed),
      isBrickActive: jest.fn(() => mockBrickActiveValue),
      getRows: jest.fn(() => mockBricksRows),
      collide: jest.fn(),
      draw: jest.fn()
    };

    mockBricksInstances.push(mockBricks);
    return mockBricks;
  })
}));

jest.mock('../utils/assetLoader', () => ({
  AssetLoader: {
    preloadAllAssets: jest.fn().mockResolvedValue(undefined),
    getImage: jest.fn(() => null)
  }
}));

jest.mock('../storage/gameLogger', () => ({
  gameLogger: {
    db: {},
    getCurrentGameId: jest.fn(() => null),
    logGameStart: jest.fn().mockResolvedValue(undefined),
    logGameEnd: jest.fn().mockResolvedValue(undefined),
    logScoreUpdate: jest.fn().mockResolvedValue(undefined),
    logLevelComplete: jest.fn().mockResolvedValue(undefined),
    logLevelStart: jest.fn().mockResolvedValue(undefined),
    logGameStateChange: jest.fn().mockResolvedValue(undefined),
    logRestartGame: jest.fn().mockResolvedValue(undefined),
    logCollision: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../utils/logger', () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn()
}));

describe('GameEngine', () => {
  let canvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let onScoreUpdate: jest.MockedFunction<(score: number) => void>;
  let onGameWon: jest.MockedFunction<() => void>;
  let onGameOver: jest.MockedFunction<() => void>;
  let onLevelTransition: jest.MockedFunction<(payload: any) => void>;

  beforeEach(() => {
    mockBallInstances.length = 0;
    mockBricksInstances.length = 0;
    mockBricksAllDestroyed = false;
    mockBricksRows = 5;
    mockBrickActiveValue = true;
    jest.clearAllMocks();

    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    mockContext = {
      clearRect: jest.fn(),
      fillText: jest.fn(),
      drawImage: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn(),
      fillStyle: '',
      font: '',
      textAlign: 'left'
    } as unknown as CanvasRenderingContext2D;
    jest.spyOn(canvas, 'getContext').mockReturnValue(mockContext);

    onScoreUpdate = jest.fn();
    onGameWon = jest.fn();
    onGameOver = jest.fn();
    onLevelTransition = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('inicializa estado com speedState na fase 1', () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const gameState = (engine as any).getCurrentGameState();

    expect(gameState.speedState).toMatchObject({
      level: 1,
      successfulBrickHits: 0,
      currentSpeed: calculateLevelMaxSpeed(canvas.width, 1),
      maxSpeed: calculateLevelMaxSpeed(canvas.width, 1),
      minSpeed: calculateLevelMinSpeed(canvas.width, 1),
      previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(canvas.width, 1)
    });
    expect(gameState.speedState.initialBrickCount).toBe(gameState.bricksRemaining);
    expect(gameState.speedState.elapsedLevelMs).toBeGreaterThanOrEqual(0);
  });

  it('lança erro sem contexto 2D', () => {
    const canvasWithoutContext = document.createElement('canvas');
    jest.spyOn(canvasWithoutContext, 'getContext').mockReturnValue(null);

    expect(() => {
      new GameEngine(canvasWithoutContext, onScoreUpdate, onGameWon, onGameOver);
    }).toThrow('No 2D context');
  });

  it('inicia o jogo e registra game_start com speedState', async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const preloadSpy = jest.spyOn(engine as any, 'preloadAssets').mockResolvedValue(undefined);
    const loopSpy = jest.spyOn(engine as any, 'loop').mockImplementation(async () => undefined);
    const mockGameLogger = require('../storage/gameLogger').gameLogger;

    await engine.start();

    expect(preloadSpy).toHaveBeenCalled();
    expect(mockGameLogger.logGameStart).toHaveBeenCalled();
    expect(mockGameLogger.logGameStart.mock.calls[0][0]).toHaveProperty('speedState');
    expect(loopSpy).toHaveBeenCalled();
  });

  it('para o jogo corretamente', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    engine.stop();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('reduz currentSpeed no score_update após destruir tijolo', async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const mockGameLogger = require('../storage/gameLogger').gameLogger;
    const ball = mockBallInstances[0];
    const initialState = (engine as any).getCurrentGameState().speedState;
    const reducedSpeed = Math.max(
      initialState.minSpeed,
      initialState.currentSpeed - initialState.reductionPerBrick
    );
    const speedReduction: SpeedReductionSnapshot = {
      level: 1,
      hitNumber: 1,
      speedBefore: initialState.currentSpeed,
      speedAfter: reducedSpeed,
      reductionApplied: initialState.currentSpeed - reducedSpeed,
      minSpeed: initialState.minSpeed,
      maxSpeed: initialState.maxSpeed,
      minReached: reducedSpeed <= initialState.minSpeed,
      elapsedLevelMs: 250
    };

    ball.__setSpeedState({
      currentSpeed: reducedSpeed,
      successfulBrickHits: 1,
      elapsedLevelMs: 250,
      minReached: speedReduction.minReached
    });
    ball.__setLastSpeedReduction(speedReduction);

    await (engine as any).onBrickDestroyed();

    expect(onScoreUpdate).toHaveBeenCalledWith(POINTS_PER_BRICK);
    expect(mockGameLogger.logScoreUpdate).toHaveBeenCalled();
    expect(mockGameLogger.logScoreUpdate.mock.calls[0][0].speedState.currentSpeed).toBe(reducedSpeed);
    expect(mockGameLogger.logScoreUpdate.mock.calls[0][5]).toMatchObject(speedReduction);
  });

  it('recalcula payload e reinicia speedState ao entrar na fase 2', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-30T12:00:00Z'));
    mockBricksAllDestroyed = true;

    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      onLevelTransition
    );
    const mockGameLogger = require('../storage/gameLogger').gameLogger;
    const beforeState = (engine as any).getCurrentGameState().speedState;

    await (engine as any).onBrickDestroyed();

    const payload = onLevelTransition.mock.calls[0][0];
    const expectedNextLevel = 2;
    const expectedNextMaxSpeed = calculateLevelMaxSpeed(canvas.width, expectedNextLevel);
    const expectedNextMinSpeed = calculateLevelMinSpeed(canvas.width, expectedNextLevel);
    const expectedNextInitialBrickCount = beforeState.initialBrickCount;
    const expectedNextReductionPerBrick = calculateSpeedReductionPerBrick(
      expectedNextMaxSpeed,
      expectedNextInitialBrickCount
    );

    expect(mockGameLogger.logLevelComplete).toHaveBeenCalled();
    expect(payload).toMatchObject({
      currentLevel: 1,
      nextLevel: expectedNextLevel,
      nextSpeedMultiplier: calculateLevelSpeedMultiplier(expectedNextLevel),
      pauseMs: LEVEL_CLEAR_PAUSE_MS,
      nextMaxSpeed: expectedNextMaxSpeed,
      nextMinSpeed: expectedNextMinSpeed,
      nextReductionPerBrick: expectedNextReductionPerBrick,
      nextInitialBrickCount: expectedNextInitialBrickCount
    });
    expect((engine as any).getCurrentGameState().level).toBe(1);

    jest.setSystemTime(new Date('2026-06-30T12:00:02Z'));
    await jest.advanceTimersByTimeAsync(LEVEL_CLEAR_PAUSE_MS);

    const afterState = (engine as any).getCurrentGameState();
    expect(afterState.level).toBe(2);
    expect(afterState.speedState.level).toBe(2);
    expect(afterState.speedState.currentSpeed).toBe(afterState.speedState.maxSpeed);
    expect(afterState.speedState.initialBrickCount).toBe(afterState.bricksRemaining);
    expect(afterState.speedState.levelStartedAt).toBeGreaterThan(beforeState.levelStartedAt);
    expect(mockGameLogger.logLevelStart).toHaveBeenCalled();
    expect(mockGameLogger.logLevelStart.mock.calls[0][0].speedState).toMatchObject({
      currentSpeed: expectedNextMaxSpeed,
      maxSpeed: expectedNextMaxSpeed,
      minSpeed: expectedNextMinSpeed
    });
  });

  it('retorna gameState com speedState e telemetria inicial da fase', () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const gameState = (engine as any).getCurrentGameState();

    expect(gameState).toHaveProperty('speedState');
    expect(gameState.speedState.initialBrickCount).toBe(gameState.bricksRemaining);
    expect(gameState.speedState.successfulBrickHits).toBe(0);
    expect(gameState.speedState.elapsedLevelMs).toBeGreaterThanOrEqual(0);
  });
});
