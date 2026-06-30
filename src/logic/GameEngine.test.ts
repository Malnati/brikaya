// src/logic/GameEngine.test.ts
import { GameEngine } from "./GameEngine";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock dos módulos
jest.mock("../objects/Paddle", () => ({
  Paddle: jest.fn().mockImplementation(() => ({
    position: { x: 200, y: 580, width: 80, height: 10 },
    onKeyDown: jest.fn(),
    onKeyUp: jest.fn(),
    setPosition: jest.fn(),
    reset: jest.fn(),
    update: jest.fn(),
    draw: jest.fn(),
  })),
}));

jest.mock("../objects/Ball", () => ({
  Ball: jest.fn().mockImplementation(() => ({
    position: { x: 400, y: 300, radius: 5 },
    getVelocity: jest.fn(() => ({ dx: 2, dy: -2 })),
    update: jest.fn(),
    draw: jest.fn(),
  })),
}));

jest.mock("../objects/Bricks", () => ({
  Bricks: jest.fn().mockImplementation(() => ({
    isAllDestroyed: jest.fn(() => false),
    isBrickActive: jest.fn(() => true),
    getRows: jest.fn(() => 5),
    collide: jest.fn(),
    draw: jest.fn(),
  })),
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
  let onScoreUpdate: jest.MockedFunction<(score: number) => void>;
  let onGameWon: jest.MockedFunction<() => void>;
  let onGameOver: jest.MockedFunction<() => void>;
  let onLevelTransition: jest.MockedFunction<(payload: any) => void>;

  beforeEach(() => {
    // Criar canvas mock
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    // Mock callbacks
    onScoreUpdate = jest.fn();
    onGameWon = jest.fn();
    onGameOver = jest.fn();
    onLevelTransition = jest.fn();

    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("deve inicializar com estado correto", () => {
      const engine = new GameEngine(
        canvas,
        onScoreUpdate,
        onGameWon,
        onGameOver,
      );

      expect(engine).toBeDefined();
      // O construtor não chama onScoreUpdate, apenas inicializa o score como 0
    });

    it("deve lançar erro quando não houver contexto 2D", () => {
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

    it("deve usar tamanho customizado quando fornecido", () => {
      const customSize = { width: 1024, height: 768 };
      const engine = new GameEngine(
        canvas,
        onScoreUpdate,
        onGameWon,
        onGameOver,
        customSize,
      );

      expect(engine).toBeDefined();
    });
  });

  describe("game lifecycle", () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    });

    it("deve iniciar o jogo corretamente", async () => {
      // Mock do preloadAssets para não esperar realmente
      const preloadSpy = jest.spyOn(engine as any, "preloadAssets");
      preloadSpy.mockResolvedValue(undefined);

      // Mock do gameLogger
      const mockGameLogger = require("../storage/gameLogger").gameLogger;
      mockGameLogger.getCurrentGameId = jest.fn().mockReturnValue(null);
      mockGameLogger.logGameStart = jest.fn().mockResolvedValue(undefined);
      mockGameLogger["db"] = {}; // Simular DB inicializado

      await engine.start();

      expect(preloadSpy).toHaveBeenCalled();
      expect(mockGameLogger.logGameStart).toHaveBeenCalled();
    });

    it("deve parar o jogo corretamente", () => {
      const cancelAnimationFrameSpy = jest.spyOn(
        window,
        "cancelAnimationFrame",
      );

      engine.stop();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });
  });

  describe("score management", () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    });

    it("deve atualizar score quando tijolo é destruído", async () => {
      // Mock do gameLogger
      const mockGameLogger = require("../storage/gameLogger").gameLogger;
      mockGameLogger.logScoreUpdate = jest.fn().mockResolvedValue(undefined);

      // Acessar método privado via reflection
      const onBrickDestroyed = (engine as any).onBrickDestroyed.bind(engine);

      await onBrickDestroyed();

      expect(onScoreUpdate).toHaveBeenCalled();
      expect(mockGameLogger.logScoreUpdate).toHaveBeenCalled();
    });

    it("deve pausar e preparar próxima fase quando último tijolo é destruído", async () => {
      jest.useFakeTimers();
      const mockGameLogger = require("../storage/gameLogger").gameLogger;
      mockGameLogger.logScoreUpdate = jest.fn().mockResolvedValue(undefined);
      mockGameLogger.logLevelComplete = jest.fn().mockResolvedValue(undefined);
      mockGameLogger.logLevelStart = jest.fn().mockResolvedValue(undefined);

      const mockBricks = require("../objects/Bricks").Bricks;
      mockBricks.mockImplementation(() => ({
        isAllDestroyed: jest.fn(() => true),
        isBrickActive: jest.fn(() => false),
        getRows: jest.fn(() => 1),
        collide: jest.fn(),
        draw: jest.fn(),
      }));

      engine = new GameEngine(
        canvas,
        onScoreUpdate,
        onGameWon,
        onGameOver,
        undefined,
        onLevelTransition,
      );

      const onBrickDestroyed = (engine as any).onBrickDestroyed.bind(engine);
      await onBrickDestroyed();

      expect(onGameWon).not.toHaveBeenCalled();
      expect(mockGameLogger.logGameEnd).not.toHaveBeenCalled();
      expect(mockGameLogger.logLevelComplete).toHaveBeenCalled();
      expect(onLevelTransition).toHaveBeenCalledWith({
        currentLevel: 1,
        nextLevel: 2,
        nextSpeedMultiplier: 1.12,
        pauseMs: 1800,
      });
      expect((engine as any).getCurrentGameState().level).toBe(1);

      await jest.advanceTimersByTimeAsync(1800);

      expect((engine as any).getCurrentGameState().level).toBe(2);
      expect(mockGameLogger.logLevelStart).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe("game state", () => {
    let engine: GameEngine;

    beforeEach(() => {
      engine = new GameEngine(canvas, onScoreUpdate, onGameWon, onGameOver);
    });

    it("deve retornar estado atual do jogo", () => {
      const gameState = (engine as any).getCurrentGameState();

      expect(gameState).toHaveProperty("score");
      expect(gameState).toHaveProperty("ballsCount");
      expect(gameState).toHaveProperty("bricksRemaining");
      expect(gameState).toHaveProperty("gameWon");
      expect(gameState).toHaveProperty("gameOver");
      expect(gameState).toHaveProperty("level");
      expect(gameState).toHaveProperty("canvasSize");
      expect(gameState).toHaveProperty("gameDimensions");
    });

    it("deve retornar posições das bolinhas", () => {
      const ballPositions = (engine as any).getBallPositions();

      expect(Array.isArray(ballPositions)).toBe(true);
      ballPositions.forEach((pos) => {
        expect(pos).toHaveProperty("x");
        expect(pos).toHaveProperty("y");
        expect(pos).toHaveProperty("velocity");
        expect(pos).toHaveProperty("radius");
      });
    });

    it("deve contar tijolos restantes corretamente", () => {
      const remainingBricks = (engine as any).getRemainingBricksCount();

      expect(typeof remainingBricks).toBe("number");
      expect(remainingBricks).toBeGreaterThanOrEqual(0);
    });
  });
});
