import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

import {
  LEVEL_CLEAR_PAUSE_MS,
  LASER_FAN_EFFECT_VISIBLE_MS,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  type PhaseSpeedConfig,
  type SpeedReductionSnapshot,
  type SpeedStateSnapshot,
} from "../constants/game";
import { POINTS_PER_BRICK } from "../constants/gameState";
import { GAME_AUDIO_IDS, type GameAudioSink } from "../constants/audio";
import { GameEngine } from "./GameEngine";

const mockBallInstances: any[] = [];
const mockBricksInstances: any[] = [];
let mockBricksAllDestroyed = false;
let mockBricksRows = 5;
let mockBrickActiveValue = true;
let mockDestroyedLaserBricks: Array<{
  col: number;
  row: number;
  colorIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = [];

function buildSpeedStateFromConfig(
  config: PhaseSpeedConfig,
): SpeedStateSnapshot {
  return {
    level: config.level,
    initialBrickCount: config.initialBrickCount,
    successfulBrickHits: 0,
    initialSpawnSpeed: config.initialSpawnSpeed,
    maxSpeed: config.maxSpeed,
    minSpeed: config.minSpeed,
    currentSpeed: config.initialSpawnSpeed,
    reductionPerBrick: config.reductionPerBrick,
    previousLevelMaxSpeed: config.previousLevelMaxSpeed,
    levelStartedAt: config.levelStartedAt,
    elapsedLevelMs: 0,
    minReached: false,
  };
}

jest.mock("../objects/Paddle", () => ({
  Paddle: jest.fn().mockImplementation(() => ({
    position: { x: 200, y: 580, width: 80, height: 10 },
    onKeyDown: jest.fn(),
    onKeyUp: jest.fn(),
    setPosition: jest.fn(),
    setWidthScale: jest.fn(),
    reset: jest.fn(),
    update: jest.fn(),
    draw: jest.fn(),
  })),
}));

jest.mock("../objects/Ball", () => ({
  Ball: jest.fn().mockImplementation(() => {
    let speedState: SpeedStateSnapshot = {
      level: 1,
      initialBrickCount: 1,
      successfulBrickHits: 0,
      initialSpawnSpeed: 2,
      maxSpeed: 2,
      minSpeed: 1,
      currentSpeed: 2,
      reductionPerBrick: 2,
      previousLevelMaxSpeed: 2,
      levelStartedAt: Date.now(),
      elapsedLevelMs: 0,
      minReached: false,
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
        velocity = {
          dx: config.initialSpawnSpeed,
          dy: -config.initialSpawnSpeed,
        };
      }),
      getSpeedStateSnapshot: jest.fn(() => speedState),
      getLastSpeedReduction: jest.fn(() => lastSpeedReduction),
      consumePaddleCollision: jest.fn(() => false),
      createClone: jest.fn(() => mockBall),
      multiplyVelocity: jest.fn(),
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
      },
    };

    mockBallInstances.push(mockBall);
    return mockBall;
  }),
}));

jest.mock("../objects/Bricks", () => ({
  Bricks: jest.fn().mockImplementation(() => {
    const mockBricks = {
      isAllDestroyed: jest.fn(() => mockBricksAllDestroyed),
      isBrickActive: jest.fn(() => mockBrickActiveValue),
      getRows: jest.fn(() => mockBricksRows),
      destroyAllActive: jest.fn(() => mockDestroyedLaserBricks),
      collide: jest.fn(),
      draw: jest.fn(),
    };

    mockBricksInstances.push(mockBricks);
    return mockBricks;
  }),
}));

jest.mock("../utils/assetLoader", () => ({
  AssetLoader: {
    preloadAllAssets: jest.fn().mockResolvedValue(undefined),
    getImage: jest.fn(() => null),
  },
}));

jest.mock("../storage/gameLogger", () => ({
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
    logBallAdded: jest.fn().mockResolvedValue(undefined),
    logBrickDestroyed: jest.fn().mockResolvedValue(undefined),
    logCollision: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

describe("GameEngine", () => {
  let canvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let onScoreUpdate: jest.MockedFunction<(score: number) => void>;
  let onGameWon: jest.MockedFunction<() => void>;
  let onGameOver: jest.MockedFunction<() => void>;
  let onLevelTransition: jest.MockedFunction<(payload: any) => void>;
  let onLevelChange: jest.MockedFunction<(level: number) => void>;

  beforeEach(() => {
    mockBallInstances.length = 0;
    mockBricksInstances.length = 0;
    mockBricksAllDestroyed = false;
    mockBricksRows = 5;
    mockBrickActiveValue = true;
    mockDestroyedLaserBricks = [];
    jest.clearAllMocks();

    canvas = document.createElement("canvas");
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
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      globalAlpha: 1,
      font: "",
      textAlign: "left",
    } as unknown as CanvasRenderingContext2D;
    jest.spyOn(canvas, "getContext").mockReturnValue(mockContext);

    onScoreUpdate = jest.fn();
    onGameWon = jest.fn();
    onGameOver = jest.fn();
    onLevelTransition = jest.fn();
    onLevelChange = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("inicializa estado com speedState na fase 1", () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const gameState = (engine as any).getCurrentGameState();

    expect(gameState.speedState).toMatchObject({
      level: 1,
      successfulBrickHits: 0,
      currentSpeed: calculateLevelInitialSpawnSpeed(canvas.width, 1),
      initialSpawnSpeed: calculateLevelInitialSpawnSpeed(canvas.width, 1),
      maxSpeed: calculateLevelMaxSpeed(canvas.width, 1),
      minSpeed: calculateLevelMinSpeed(canvas.width, 1),
      previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(canvas.width, 1),
    });
    expect(gameState.speedState.initialBrickCount).toBe(
      gameState.bricksRemaining,
    );
    expect(gameState.speedState.elapsedLevelMs).toBeGreaterThanOrEqual(0);
  });

  it("lança erro sem contexto 2D", () => {
    const canvasWithoutContext = document.createElement("canvas");
    jest.spyOn(canvasWithoutContext, "getContext").mockReturnValue(null);

    expect(() => {
      new GameEngine(
        canvasWithoutContext,
        onScoreUpdate,
        onGameWon,
        onGameOver,
      );
    }).toThrow("No 2D context");
  });

  it("inicia o jogo e registra game_start com speedState", async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const preloadSpy = jest
      .spyOn(engine as any, "preloadAssets")
      .mockResolvedValue(undefined);
    const loopSpy = jest
      .spyOn(engine as any, "loop")
      .mockImplementation(async () => undefined);
    const mockGameLogger = require("../storage/gameLogger").gameLogger;

    await engine.start();

    expect(preloadSpy).toHaveBeenCalled();
    expect(mockGameLogger.logGameStart).toHaveBeenCalled();
    expect(mockGameLogger.logGameStart.mock.calls[0][0]).toHaveProperty(
      "speedState",
    );
    expect(loopSpy).toHaveBeenCalled();
  });

  it("notifica o nível inicial para manter HUD alinhado em fases avançadas", async () => {
    const engine = new (GameEngine as any)(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      "late-phase-stability",
      undefined,
      onLevelChange,
    );
    jest.spyOn(engine as any, "preloadAssets").mockResolvedValue(undefined);
    jest.spyOn(engine as any, "loop").mockImplementation(async () => undefined);

    await engine.start();

    expect(onLevelChange).toHaveBeenCalledWith(11);
  });

  it("para o jogo corretamente", () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, "cancelAnimationFrame");
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    engine.stop();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it("instrui reinício pelo ícone da tela principal no fim de jogo", async () => {
    const requestAnimationFrameSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(0);
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    (engine as any).assetsLoaded = true;
    (engine as any).gameOver = true;
    (engine as any).isStopped = false;

    await (engine as any).loop();

    expect(mockContext.fillText).toHaveBeenCalledWith(
      "Use ↻ para jogar novamente",
      canvas.width / 2,
      canvas.height / 2 + 40,
    );
    expect(mockContext.fillText).not.toHaveBeenCalledWith(
      expect.stringContaining("menu"),
      expect.any(Number),
      expect.any(Number),
    );
    requestAnimationFrameSpy.mockRestore();
  });

  it("reduz currentSpeed no score_update após destruir tijolo", async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const mockGameLogger = require("../storage/gameLogger").gameLogger;
    const ball = mockBallInstances[0];
    const initialState = (engine as any).getCurrentGameState().speedState;
    const reducedSpeed = Math.max(
      initialState.minSpeed,
      initialState.currentSpeed - initialState.reductionPerBrick,
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
      elapsedLevelMs: 250,
    };

    ball.__setSpeedState({
      currentSpeed: reducedSpeed,
      successfulBrickHits: 1,
      elapsedLevelMs: 250,
      minReached: speedReduction.minReached,
    });
    ball.__setLastSpeedReduction(speedReduction);

    await (engine as any).onBrickDestroyed();

    expect(onScoreUpdate).toHaveBeenCalledWith(POINTS_PER_BRICK);
    expect(mockGameLogger.logScoreUpdate).toHaveBeenCalled();
    expect(
      mockGameLogger.logScoreUpdate.mock.calls[0][0].speedState.currentSpeed,
    ).toBe(reducedSpeed);
    expect(mockGameLogger.logScoreUpdate.mock.calls[0][5]).toMatchObject(
      speedReduction,
    );
  });

  it("recalcula payload e reinicia speedState ao entrar na fase 2", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-30T12:00:00Z"));
    mockBricksAllDestroyed = true;

    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      onLevelTransition,
    );
    const mockGameLogger = require("../storage/gameLogger").gameLogger;
    const beforeState = (engine as any).getCurrentGameState().speedState;

    await (engine as any).onBrickDestroyed();

    const payload = onLevelTransition.mock.calls[0][0];
    const expectedNextLevel = 2;
    const expectedNextMaxSpeed = calculateLevelMaxSpeed(
      canvas.width,
      expectedNextLevel,
    );
    const expectedNextMinSpeed = calculateLevelMinSpeed(
      canvas.width,
      expectedNextLevel,
    );
    const expectedNextInitialBrickCount = beforeState.initialBrickCount;
    const expectedNextReductionPerBrick = calculateSpeedReductionPerBrick(
      expectedNextMaxSpeed,
      expectedNextInitialBrickCount,
      expectedNextMinSpeed,
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
      nextInitialBrickCount: expectedNextInitialBrickCount,
    });
    expect((engine as any).getCurrentGameState().level).toBe(1);

    jest.setSystemTime(new Date("2026-06-30T12:00:02Z"));
    await jest.advanceTimersByTimeAsync(LEVEL_CLEAR_PAUSE_MS);

    const afterState = (engine as any).getCurrentGameState();
    expect(afterState.level).toBe(2);
    expect(afterState.speedState.level).toBe(2);
    expect(afterState.speedState.currentSpeed).toBe(
      afterState.speedState.maxSpeed,
    );
    expect(afterState.speedState.minSpeed).toBe(
      calculateLevelMaxSpeed(canvas.width, expectedNextLevel) / 4,
    );
    expect(afterState.speedState.reductionPerBrick).toBe(
      calculateSpeedReductionPerBrick(
        afterState.speedState.maxSpeed,
        afterState.speedState.initialBrickCount,
        afterState.speedState.minSpeed,
      ),
    );
    expect(afterState.speedState.initialBrickCount).toBe(
      afterState.bricksRemaining,
    );
    expect(afterState.speedState.levelStartedAt).toBeGreaterThan(
      beforeState.levelStartedAt,
    );
    expect(mockGameLogger.logLevelStart).toHaveBeenCalled();
    expect(
      mockGameLogger.logLevelStart.mock.calls[0][0].speedState,
    ).toMatchObject({
      currentSpeed: expectedNextMaxSpeed,
      initialSpawnSpeed: expectedNextMaxSpeed,
      maxSpeed: expectedNextMaxSpeed,
      minSpeed: expectedNextMinSpeed,
    });
  });

  it("retorna gameState com speedState e telemetria inicial da fase", () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const gameState = (engine as any).getCurrentGameState();

    expect(gameState).toHaveProperty("speedState");
    expect(gameState.speedState.initialBrickCount).toBe(
      gameState.bricksRemaining,
    );
    expect(gameState.speedState.successfulBrickHits).toBe(0);
    expect(gameState.speedState.elapsedLevelMs).toBeGreaterThanOrEqual(0);
  });

  it("mantém contador de hits da fase mesmo quando o hit vem de bolas diferentes", async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const mockGameLogger = require("../storage/gameLogger").gameLogger;
    const ball = mockBallInstances[0];
    const initialState = (engine as any).getCurrentGameState().speedState;

    ball.__setSpeedState({
      successfulBrickHits: 1,
      currentSpeed: initialState.maxSpeed - 1,
    });
    ball.__setLastSpeedReduction({
      level: 1,
      hitNumber: 1,
      speedBefore: initialState.maxSpeed,
      speedAfter: initialState.maxSpeed - 1,
      reductionApplied: 1,
      minSpeed: initialState.minSpeed,
      maxSpeed: initialState.maxSpeed,
      minReached: false,
      elapsedLevelMs: 200,
    });
    await (engine as any).onBrickDestroyed(0);

    ball.__setSpeedState({
      successfulBrickHits: 1,
      currentSpeed: initialState.maxSpeed - 2,
    });
    ball.__setLastSpeedReduction({
      level: 1,
      hitNumber: 1,
      speedBefore: initialState.maxSpeed - 1,
      speedAfter: initialState.maxSpeed - 2,
      reductionApplied: 1,
      minSpeed: initialState.minSpeed,
      maxSpeed: initialState.maxSpeed,
      minReached: false,
      elapsedLevelMs: 400,
    });
    await (engine as any).onBrickDestroyed(1);

    expect(
      mockGameLogger.logScoreUpdate.mock.calls[1][0].speedState
        .successfulBrickHits,
    ).toBe(2);
    expect(mockGameLogger.logScoreUpdate.mock.calls[1][5]).toMatchObject({
      hitNumber: 2,
      speedAfter: initialState.maxSpeed - 2,
    });
  });

  it.each([
    ["multiball", GAME_AUDIO_IDS.POWERUP_ACTIVATE_MULTIBALL],
    ["wide_paddle", GAME_AUDIO_IDS.POWERUP_ACTIVATE_WIDE_PADDLE],
    ["slow_ball", GAME_AUDIO_IDS.POWERUP_ACTIVATE_SLOW_BALL],
    ["laser_fan", GAME_AUDIO_IDS.POWERUP_ACTIVATE_LASER_FAN],
  ] as const)(
    "toca SFX específico ao ativar %s",
    (powerUpType, expectedAudioId) => {
      const playAudio = jest.fn();
      const audioSink: GameAudioSink = {
        playAudio,
        startGameplayMusic: jest.fn(),
        startMenuMusic: jest.fn(),
        setHighIntensity: jest.fn(),
      };
      const engine = new GameEngine(
        canvas,
        onScoreUpdate,
        onGameWon,
        onGameOver,
        undefined,
        undefined,
        undefined,
        audioSink,
      );

      (engine as any).activatePowerUp(powerUpType);

      expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.POWERUP_COLLECT);
      expect(playAudio).toHaveBeenCalledWith(expectedAudioId);
      engine.stop();
    },
  );

  it("registra bolas adicionadas ao ativar multiball", () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const mockGameLogger = require("../storage/gameLogger").gameLogger;

    (engine as any).activatePowerUp("multiball");

    expect((engine as any).getCurrentGameState().ballsCount).toBe(3);
    expect(mockGameLogger.logBallAdded).toHaveBeenCalledTimes(2);
    expect(mockGameLogger.logBallAdded.mock.calls[1][0].ballsCount).toBe(3);
  });

  it("ativa laser em leque destruindo todos os blocos e iniciando transição uma vez", async () => {
    jest.useFakeTimers();
    mockDestroyedLaserBricks = [
      { col: 0, row: 0, colorIndex: 0, x: 10, y: 20, width: 50, height: 20 },
      { col: 1, row: 0, colorIndex: 1, x: 70, y: 20, width: 50, height: 20 },
      { col: 2, row: 0, colorIndex: 2, x: 130, y: 20, width: 50, height: 20 },
    ];
    mockBricksAllDestroyed = true;
    mockBrickActiveValue = false;
    const playAudio = jest.fn();
    const audioSink: GameAudioSink = {
      playAudio,
      startGameplayMusic: jest.fn(),
      startMenuMusic: jest.fn(),
      setHighIntensity: jest.fn(),
    };
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      onLevelTransition,
      undefined,
      audioSink,
    );
    const mockGameLogger = require("../storage/gameLogger").gameLogger;

    await (engine as any).activatePowerUp("laser_fan");

    expect(mockBricksInstances[0].destroyAllActive).toHaveBeenCalledTimes(1);
    expect(onScoreUpdate).toHaveBeenCalledWith(POINTS_PER_BRICK * 3);
    expect(mockGameLogger.logScoreUpdate).toHaveBeenCalledTimes(1);
    expect(mockGameLogger.logLevelComplete).toHaveBeenCalledTimes(1);
    expect(onLevelTransition).toHaveBeenCalledTimes(1);
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.POWERUP_COLLECT);
    expect(playAudio).toHaveBeenCalledWith(
      GAME_AUDIO_IDS.POWERUP_ACTIVATE_LASER_FAN,
    );
    expect(LASER_FAN_EFFECT_VISIBLE_MS).toBeGreaterThanOrEqual(2000);
    expect((engine as any).laserFanEffectUntil - Date.now()).toBeGreaterThanOrEqual(
      2000,
    );
    jest.advanceTimersByTime(1999);
    expect((engine as any).laserFanEffectUntil).toBeGreaterThan(Date.now());
    jest.advanceTimersByTime(1);
    expect((engine as any).laserFanEffectUntil).toBe(0);
    expect(mockGameLogger.logRestartGame).not.toHaveBeenCalled();
    expect(mockGameLogger.logGameStart).not.toHaveBeenCalled();
  });

  it("limita laser em leque a dois spawns por fase e continua outros power-ups", () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    expect((engine as any).selectNextPowerUpType()).toBe("multiball");
    expect((engine as any).selectNextPowerUpType()).toBe("wide_paddle");
    expect((engine as any).selectNextPowerUpType()).toBe("slow_ball");
    expect((engine as any).selectNextPowerUpType()).toBe("laser_fan");
    expect((engine as any).selectNextPowerUpType()).toBe("multiball");
    expect((engine as any).selectNextPowerUpType()).toBe("wide_paddle");
    expect((engine as any).selectNextPowerUpType()).toBe("slow_ball");
    expect((engine as any).selectNextPowerUpType()).toBe("laser_fan");
    expect((engine as any).selectNextPowerUpType()).toBe("multiball");
    expect((engine as any).selectNextPowerUpType()).toBe("wide_paddle");
    expect((engine as any).selectNextPowerUpType()).toBe("slow_ball");
    expect((engine as any).selectNextPowerUpType()).toBe("multiball");

    (engine as any).resetLaserFanSpawnCounterForLevel();

    expect((engine as any).selectNextPowerUpType()).toBe("wide_paddle");
    expect((engine as any).selectNextPowerUpType()).toBe("slow_ball");
    expect((engine as any).selectNextPowerUpType()).toBe("laser_fan");
  });
});
