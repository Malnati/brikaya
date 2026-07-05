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
  calculateDynamicDimensions,
  calculateLevelInitialSpawnSpeed,
  calculateLevelBrickRows,
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
import { calculatePowerUpSize } from "../constants/powerUps";
import { GameEngine } from "./GameEngine";
import {
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretTrampoline,
} from "./rendering/ballTurretRenderer";

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
    position: {
      x: 200,
      y: 580,
      width: 80,
      height: 10,
      radial: {
        centerX: 400,
        centerY: 300,
        radius: 250,
        startAngle: 1.2,
        endAngle: 1.9,
        centerAngle: 1.55,
        thickness: 16,
        movementStartAngle: 0.2,
        movementEndAngle: 2.9,
        lossStartAngle: 0.5,
        lossEndAngle: 2.64,
        lossIsFullCircle: false,
      },
    },
    onKeyDown: jest.fn(),
    onKeyUp: jest.fn(),
    setPosition: jest.fn(),
    setPositionFromPoint: jest.fn(),
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
      selectRandomActive: jest.fn(() => mockDestroyedLaserBricks),
      destroySelectedActive: jest.fn(() => mockDestroyedLaserBricks),
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
    preloadImageSet: jest.fn().mockResolvedValue(undefined),
    getOrLoadImage: jest.fn(() => null),
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
    logPowerUp: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

jest.mock("./rendering/ballTurretRenderer", () => ({
  drawBallTurretBackdrop: jest.fn(),
  drawBallTurretGlassOverlay: jest.fn(),
  drawBallTurretTrampoline: jest.fn(),
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

  it("mantém render clássico sem camada torreta", async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    (engine as any).assetsLoaded = true;
    (engine as any).isStopped = false;

    await (engine as any).loop();

    expect(drawBallTurretBackdrop).not.toHaveBeenCalled();
    expect(drawBallTurretTrampoline).not.toHaveBeenCalled();
    expect(drawBallTurretGlassOverlay).not.toHaveBeenCalled();
    expect((engine as any).paddle.draw).toHaveBeenCalled();
  });

  it("renderiza camada torreta no modo ball-turret", async () => {
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "ball-turret",
    );

    (engine as any).assetsLoaded = true;
    (engine as any).isStopped = false;

    await (engine as any).loop();

    expect(drawBallTurretBackdrop).toHaveBeenCalledWith(
      mockContext,
      expect.objectContaining({
        canvasSize: expect.objectContaining({
          width: canvas.width,
          height: canvas.height,
        }),
        geometry: expect.any(Object),
        paddlePosition: expect.any(Object),
      }),
    );
    const turretGeometry = (drawBallTurretBackdrop as jest.Mock).mock
      .calls[0][1].geometry;
    expect(turretGeometry.brickArcStartAngle).toBeCloseTo(-Math.PI);
    expect(turretGeometry.brickArcEndAngle).toBeCloseTo(Math.PI);
    expect(drawBallTurretTrampoline).toHaveBeenCalled();
    expect(drawBallTurretGlassOverlay).toHaveBeenCalled();
    expect((engine as any).paddle.draw).not.toHaveBeenCalled();
  });

  it("usa dobro de colunas e posiciona bola inicial na borda inferior da torreta", () => {
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "ball-turret",
    );
    const baseDimensions = calculateDynamicDimensions(
      canvas.width,
      canvas.height,
    );
    const dimensions = (engine as any).dimensions;
    const geometry = (engine as any).radialGeometry;
    const ball = mockBallInstances[0];

    expect(dimensions.brickCols).toBe(baseDimensions.brickCols * 2);
    expect(ball.setPosition).toHaveBeenCalled();
    const [spawnX, spawnY] = ball.setPosition.mock.calls[0];
    expect(
      Math.hypot(spawnX - geometry.centerX, spawnY - geometry.centerY),
    ).toBeCloseTo(geometry.radius - ball.position.radius - 1, 1);
    expect(spawnX).toBeCloseTo(geometry.centerX, 5);
    expect(spawnY).toBeGreaterThan(geometry.centerY);
    expect(ball.setDirection).toHaveBeenCalledWith(0);
  });

  it("spawna power-up da torreta no centro com movimento radial até a borda", () => {
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
      undefined,
      undefined,
      "ball-turret",
    );
    const geometry = (engine as any).radialGeometry;

    (engine as any).destroyedBricksSincePowerUp = 4;
    (engine as any).maybeSpawnPowerUp();

    const powerUp = (engine as any).activePowerUp;
    expect(powerUp.getPosition()).toEqual({
      x: geometry.centerX,
      y: geometry.centerY,
    });

    powerUp.update();
    const movedPosition = powerUp.getPosition();
    expect(
      Math.hypot(
        movedPosition.x - geometry.centerX,
        movedPosition.y - geometry.centerY,
      ),
    ).toBeGreaterThan(0);
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.POWERUP_SPAWN);
  });

  it("move a raquete pelo início do arraste touch na faixa sensível", () => {
    jest.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 100,
      width: 400,
    } as DOMRect);
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    engine.startPaddleDrag(300);

    expect((engine as any).paddle.setPosition).toHaveBeenCalledWith(400);
  });

  it("move o segmento ativo da torreta pelo ponto completo do canvas", () => {
    jest.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      width: 400,
      height: 300,
    } as DOMRect);
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "ball-turret",
    );

    engine.startPaddleDrag(300, 200);

    expect((engine as any).paddle.setPositionFromPoint).toHaveBeenCalledWith(
      400,
      300,
    );
    expect((engine as any).paddle.setPosition).not.toHaveBeenCalled();
  });

  it("rotaciona continuamente o segmento ativo da torreta pelo joystick", () => {
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "ball-turret",
    );
    const geometry = (engine as any).radialGeometry;
    (engine as any).paddle.position.radial.centerAngle = Math.PI / 2;

    (engine as any).setBallTurretJoystickTurn(1);
    (engine as any).applyBallTurretJoystickTurn(250);

    const [x, y] = (engine as any).paddle.setPositionFromPoint.mock.calls[0];
    expect(x).toBeCloseTo(
      geometry.centerX + Math.cos(Math.PI / 4) * geometry.radius,
    );
    expect(y).toBeCloseTo(
      geometry.centerY + Math.sin(Math.PI / 4) * geometry.radius,
    );
    expect((engine as any).paddle.setPosition).not.toHaveBeenCalled();
  });

  it("para giro da torreta quando o joystick volta ao centro", () => {
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "ball-turret",
    );

    (engine as any).setBallTurretJoystickTurn(1);
    (engine as any).setBallTurretJoystickTurn(0);
    (engine as any).applyBallTurretJoystickTurn(250);

    expect((engine as any).paddle.setPositionFromPoint).not.toHaveBeenCalled();
  });

  it("ignora giro do joystick fora do modo torreta", () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    (engine as any).setBallTurretJoystickTurn(1);
    (engine as any).applyBallTurretJoystickTurn(250);

    expect((engine as any).paddle.setPositionFromPoint).not.toHaveBeenCalled();
    expect((engine as any).paddle.setPosition).not.toHaveBeenCalled();
  });

  it("ignora movimento touch sem arraste ativo", () => {
    jest.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 100,
      width: 400,
    } as DOMRect);
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    engine.movePaddleDrag(300);

    expect((engine as any).paddle.setPosition).not.toHaveBeenCalled();
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

  it("pausa o loop sem avançar física e retoma animação", async () => {
    const requestAnimationFrameSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(0);
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);

    expect(typeof (engine as any).setPaused).toBe("function");

    (engine as any).assetsLoaded = true;
    (engine as any).isStopped = false;
    (engine as any).setPaused(true);

    await (engine as any).loop();

    expect(mockContext.clearRect).not.toHaveBeenCalled();
    expect(mockBallInstances[0].update).not.toHaveBeenCalled();

    (engine as any).setPaused(false);

    expect(requestAnimationFrameSpy).toHaveBeenCalledWith(expect.any(Function));
    requestAnimationFrameSpy.mockRestore();
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
    const expectedNextBrickRows = calculateLevelBrickRows(
      (engine as any).baseBrickRows,
      (engine as any).maxBrickRows,
      expectedNextLevel,
    );
    const expectedNextInitialBrickCount =
      (engine as any).dimensions.brickCols * expectedNextBrickRows;
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
      calculateLevelMinSpeed(canvas.width, expectedNextLevel),
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
    expect(afterState.gameDimensions.brickRows).toBe(expectedNextBrickRows);
    expect(afterState.gameDimensions.brickRows).toBeGreaterThan(
      beforeState.initialBrickCount / (engine as any).dimensions.brickCols,
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
    "toca SFX específico e registra power_up ao ativar %s",
    async (powerUpType, expectedAudioId) => {
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
      const mockGameLogger = require("../storage/gameLogger").gameLogger;

      await (engine as any).activatePowerUp(powerUpType);

      expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.POWERUP_COLLECT);
      expect(playAudio).toHaveBeenCalledWith(expectedAudioId);
      expect(mockGameLogger.logPowerUp).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Array),
        expect.any(Object),
        powerUpType,
        "activate",
      );
      engine.stop();
    },
  );

  it("registra bolas adicionadas ao ativar multiball", async () => {
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const mockGameLogger = require("../storage/gameLogger").gameLogger;

    await (engine as any).activatePowerUp("multiball");

    expect((engine as any).getCurrentGameState().ballsCount).toBe(3);
    expect(mockGameLogger.logBallAdded).toHaveBeenCalledTimes(2);
    expect(mockGameLogger.logBallAdded.mock.calls[1][0].ballsCount).toBe(3);
  });

  it("ativa laser escolhendo cinco blocos e destruindo ao fim da animação", async () => {
    jest.useFakeTimers();
    mockDestroyedLaserBricks = [
      { col: 0, row: 0, colorIndex: 0, x: 10, y: 20, width: 50, height: 20 },
      { col: 1, row: 0, colorIndex: 1, x: 70, y: 20, width: 50, height: 20 },
      { col: 2, row: 0, colorIndex: 2, x: 130, y: 20, width: 50, height: 20 },
      { col: 3, row: 0, colorIndex: 3, x: 190, y: 20, width: 50, height: 20 },
      { col: 4, row: 0, colorIndex: 4, x: 250, y: 20, width: 50, height: 20 },
    ];
    mockBricksAllDestroyed = false;
    mockBrickActiveValue = true;
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

    expect(mockBricksInstances[0].selectRandomActive).toHaveBeenCalledWith(5);
    expect(mockBricksInstances[0].destroySelectedActive).not.toHaveBeenCalled();
    expect(onScoreUpdate).not.toHaveBeenCalled();
    expect(mockGameLogger.logScoreUpdate).not.toHaveBeenCalled();
    expect(mockGameLogger.logLevelComplete).not.toHaveBeenCalled();
    expect(onLevelTransition).not.toHaveBeenCalled();
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.POWERUP_COLLECT);
    expect(playAudio).toHaveBeenCalledWith(
      GAME_AUDIO_IDS.POWERUP_ACTIVATE_LASER_FAN,
    );
    expect((engine as any).laserFanEffectStartedAt).toBeGreaterThan(0);
    expect((engine as any).laserFanEffectTargets).toHaveLength(5);
    expect((engine as any).laserFanEffectTargets[0]).toEqual(
      expect.objectContaining({ col: 0, row: 0, x: 35, y: 30, index: 0 }),
    );
    expect(LASER_FAN_EFFECT_VISIBLE_MS).toBeGreaterThanOrEqual(2000);
    expect(
      (engine as any).laserFanEffectUntil - Date.now(),
    ).toBeGreaterThanOrEqual(2000);
    jest.advanceTimersByTime(LASER_FAN_EFFECT_VISIBLE_MS - 1);
    expect((engine as any).laserFanEffectUntil).toBeGreaterThan(Date.now());
    expect(mockBricksInstances[0].destroySelectedActive).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(mockBricksInstances[0].destroySelectedActive).toHaveBeenCalledWith(
      mockDestroyedLaserBricks,
    );
    expect(onScoreUpdate).toHaveBeenCalledWith(POINTS_PER_BRICK * 5);
    expect(mockGameLogger.logScoreUpdate).toHaveBeenCalledTimes(1);
    expect(mockGameLogger.logLevelComplete).not.toHaveBeenCalled();
    expect(onLevelTransition).not.toHaveBeenCalled();
    expect((engine as any).laserFanEffectStartedAt).toBe(0);
    expect((engine as any).laserFanEffectUntil).toBe(0);
    expect((engine as any).laserFanEffectTargets).toEqual([]);
    expect(mockGameLogger.logRestartGame).not.toHaveBeenCalled();
    expect(mockGameLogger.logGameStart).not.toHaveBeenCalled();
  });

  it("completa fase quando os blocos aleatórios do laser esgotam o tabuleiro", async () => {
    jest.useFakeTimers();
    mockDestroyedLaserBricks = [
      { col: 0, row: 0, colorIndex: 0, x: 10, y: 20, width: 50, height: 20 },
      { col: 1, row: 0, colorIndex: 1, x: 70, y: 20, width: 50, height: 20 },
      { col: 2, row: 0, colorIndex: 2, x: 130, y: 20, width: 50, height: 20 },
      { col: 3, row: 0, colorIndex: 3, x: 190, y: 20, width: 50, height: 20 },
    ];
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

    await (engine as any).activatePowerUp("laser_fan");
    await jest.advanceTimersByTimeAsync(LASER_FAN_EFFECT_VISIBLE_MS);

    expect(mockBricksInstances[0].selectRandomActive).toHaveBeenCalledWith(5);
    expect(mockBricksInstances[0].destroySelectedActive).toHaveBeenCalledWith(
      mockDestroyedLaserBricks,
    );
    expect(onScoreUpdate).toHaveBeenCalledWith(POINTS_PER_BRICK * 4);
    expect(mockGameLogger.logScoreUpdate).toHaveBeenCalledTimes(1);
    expect(mockGameLogger.logLevelComplete).toHaveBeenCalledTimes(1);
    expect(onLevelTransition).toHaveBeenCalledTimes(1);
  });

  it("desenha rachaduras e brilho por bloco no lugar do leque antigo", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-04T00:00:00.000Z"));
    const engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    const strokeLineWidths: number[] = [];
    const laserTargets = [
      { col: 0, row: 0, colorIndex: 0, x: 10, y: 20, width: 50, height: 20 },
      { col: 1, row: 0, colorIndex: 1, x: 70, y: 20, width: 50, height: 20 },
    ];
    (mockContext.stroke as jest.Mock).mockImplementation(() => {
      strokeLineWidths.push(Number(mockContext.lineWidth.toFixed(3)));
    });

    (engine as any).showLaserFanEffect(laserTargets);

    jest.advanceTimersByTime(650);
    (engine as any).drawLaserFanEffect();
    const firstFrameMove = [...(mockContext.moveTo as jest.Mock).mock.calls[0]];

    (mockContext.lineTo as jest.Mock).mockClear();
    (mockContext.arc as jest.Mock).mockClear();

    jest.advanceTimersByTime(450);
    (engine as any).drawLaserFanEffect();

    expect(firstFrameMove[0]).toBeLessThan(70);
    expect((mockContext.lineTo as jest.Mock).mock.calls.length).toBeGreaterThan(
      0,
    );
    expect((mockContext.arc as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    expect(new Set(strokeLineWidths).size).toBeGreaterThan(1);
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

  it("cria power-up de QA com tamanho proporcional ao bloco atual", () => {
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      onLevelTransition,
      "laser-fan",
    );
    const dimensions = (engine as any).dimensions;

    expect((engine as any).activePowerUp.size).toBe(
      calculatePowerUpSize(dimensions),
    );
  });

  it("posiciona bola de QA de fase única na primeira linha", () => {
    const { Bricks } = require("../objects/Bricks");

    new (GameEngine as any)(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      "single-brick-phase-clear",
    );

    const dimensions = (Bricks as jest.Mock).mock.calls[0][0];
    const ball = mockBallInstances[0];

    expect(ball.setPosition).toHaveBeenCalledWith(
      dimensions.brickOffsetLeft + dimensions.brickWidth / 2,
      dimensions.brickOffsetTop +
        dimensions.brickHeight +
        ball.position.radius -
        1,
    );
    expect(ball.setDirection).toHaveBeenCalledWith(0);
  });

  it("configura cenário de QA com três blocos desviantes", () => {
    const { Bricks } = require("../objects/Bricks");

    new (GameEngine as any)(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      undefined,
      "evasive-blocks",
    );

    const dimensions = (Bricks as jest.Mock).mock.calls[0][0];
    const random = (Bricks as jest.Mock).mock.calls[0][5];

    expect(dimensions).toMatchObject({
      brickCols: 1,
      brickRows: 3,
    });
    expect(typeof random).toBe("function");
    expect([
      random(),
      random(),
      random(),
      random(),
      random(),
      random(),
    ]).toEqual([0, 0, 0, 0, 0.99, 0.99]);
    expect(mockBallInstances[0].setPosition).toHaveBeenCalledWith(
      dimensions.brickOffsetLeft + dimensions.brickWidth / 2,
      dimensions.brickOffsetTop +
        2 * (dimensions.brickHeight + dimensions.brickPadding) +
        dimensions.brickHeight +
        mockBallInstances[0].position.radius -
        1,
    );
  });

  it("mantém power-up de QA visível antes da coleta para captura publicada", () => {
    const engine = new GameEngine(
      canvas,
      onScoreUpdate,
      onGameWon,
      onGameOver,
      undefined,
      onLevelTransition,
      "laser-fan",
    );

    for (let frame = 0; frame < 20; frame += 1) {
      (engine as any).updatePowerUp();
    }

    expect((engine as any).activePowerUp).not.toBeNull();
  });
});
