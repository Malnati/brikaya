// src/logic/GameEngine.test.ts
import { GameEngine } from "./GameEngine";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock dos módulos
jest.mock("../objects/Paddle");
jest.mock("../objects/Ball");
jest.mock("../objects/Bricks");
jest.mock("../utils/assetLoader");
jest.mock("../storage/gameLogger");
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

  beforeEach(() => {
    // Criar canvas mock
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    // Mock callbacks
    onScoreUpdate = jest.fn();
    onGameWon = jest.fn();
    onGameOver = jest.fn();

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
      expect(onScoreUpdate).toHaveBeenCalledWith(0);
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
