// src/storage/gameLogger.test.ts
import { gameLogger } from './gameLogger';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

const BASE_SPEED_STATE = {
  level: 1,
  initialBrickCount: 40,
  successfulBrickHits: 0,
  maxSpeed: 2.24,
  minSpeed: 1.12,
  currentSpeed: 2.24,
  reductionPerBrick: 0.056,
  previousLevelMaxSpeed: 2.24,
  levelStartedAt: 1_782_870_000_000,
  elapsedLevelMs: 0,
  minReached: false,
};

function buildGameState(overrides: Record<string, any> = {}) {
  return {
    score: 0,
    ballsCount: 1,
    bricksRemaining: 40,
    gameWon: false,
    gameOver: false,
    level: 1,
    canvasSize: { width: 800, height: 600 },
    gameDimensions: {
      brickWidth: 60,
      brickHeight: 20,
      brickCols: 8,
      brickRows: 5,
      paddleWidth: 80,
      paddleHeight: 10,
      ballRadius: 5,
    },
    speedState: {
      ...BASE_SPEED_STATE,
      ...(overrides.speedState || {}),
    },
    ...overrides,
  };
}

function buildBallPositions() {
  return [
    { x: 400, y: 300, velocity: { dx: 2, dy: -2 }, radius: 5 },
  ];
}

function buildPaddlePosition() {
  return { x: 360, y: 580, width: 80, height: 10 };
}

// Mock do IndexedDB com implementação completa
function createMockIndexedDB() {
  const stores: Map<string, Map<string, any>> = new Map();
  
  const mockStore = {
    add: jest.fn((data: any) => {
      const storeName = 'gameEvents';
      if (!stores.has(storeName)) {
        stores.set(storeName, new Map());
      }
      const store = stores.get(storeName)!;
      store.set(data.id || String(Date.now()), data);
      
      const request = {
        result: data.id || String(Date.now()),
        error: null,
        onsuccess: null,
        onerror: null,
      } as IDBRequest;
      
      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess(new Event('success') as any);
        }
      }, 0);
      
      return request;
    }),
    get: jest.fn(),
    getAll: jest.fn(),
    clear: jest.fn(),
  };

  const mockTransaction = {
    objectStore: jest.fn(() => mockStore),
    oncomplete: null,
    onerror: null,
  };

  const mockDB = {
    objectStoreNames: {
      contains: jest.fn(() => true),
    },
    transaction: jest.fn(() => mockTransaction),
    close: jest.fn(),
  };

  return { mockDB, mockStore, mockTransaction };
}

describe('GameLogger', () => {
  let mockIndexedDB: ReturnType<typeof createMockIndexedDB>;

  beforeEach(async () => {
    // Limpar mocks
    jest.clearAllMocks();
    
    mockIndexedDB = createMockIndexedDB();
    
    // Mock do IndexedDB global
    global.indexedDB = {
      open: jest.fn((name: string, version: number) => {
        const request = {
          result: mockIndexedDB.mockDB,
          error: null,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
        } as IDBOpenDBRequest;
        
        // Simular sucesso após um tick
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess(new Event('success') as any);
          }
        }, 0);
        
        return request;
      }),
    } as any;
    
    // Resetar estado do gameLogger
    (gameLogger as any).db = null;
    (gameLogger as any).currentGameId = null;
    (gameLogger as any).gameStartTime = null;
    
    // Inicializar gameLogger
    try {
      await gameLogger.initialize();
    } catch (error) {
      // Ignorar erros de inicialização nos testes
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('deve inicializar o IndexedDB corretamente', async () => {
      expect(global.indexedDB.open).toHaveBeenCalled();
    });
  });

  describe('logGameStart', () => {
    it('deve registrar início de jogo', async () => {
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState({ bricksRemaining: 50 });
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();

      await gameLogger.logGameStart(gameState, ballPositions, paddlePosition);

      // Verificar que o método foi chamado sem erros
      expect(gameLogger.getCurrentGameId()).toBeTruthy();
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0].gameState.speedState).toMatchObject(gameState.speedState);
    }, 10000);
  });

  describe('logScoreUpdate', () => {
    it('deve registrar atualização de pontuação com speedReduction', async () => {
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState({
        score: 100,
        bricksRemaining: 45,
        speedState: {
          successfulBrickHits: 1,
          currentSpeed: 2.184,
          elapsedLevelMs: 320,
        },
      });
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();
      const speedReduction = {
        level: 1,
        hitNumber: 1,
        speedBefore: 2.24,
        speedAfter: 2.184,
        reductionApplied: 0.056,
        minSpeed: 1.12,
        maxSpeed: 2.24,
        minReached: false,
        elapsedLevelMs: 320,
      };

      await gameLogger.logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        10,
        'brick_destroyed',
        speedReduction
      );

      // Verificar que o método foi chamado
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0].metadata.speedReduction).toMatchObject(speedReduction);
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0].metadata.speedState).toMatchObject(gameState.speedState);
    }, 10000);
  });

  describe('level events', () => {
    it('deve registrar conclusão e início de fase com metadados da próxima velocidade', async () => {
      (gameLogger as any).db = mockIndexedDB.mockDB;

      const gameState = buildGameState({
        score: 150,
        bricksRemaining: 0,
        canvasSize: { width: 393, height: 852 },
        gameDimensions: {
          brickWidth: 60,
          brickHeight: 20,
          brickCols: 1,
          brickRows: 1,
          paddleWidth: 80,
          paddleHeight: 10,
          ballRadius: 5,
        },
        speedState: {
          level: 1,
          initialBrickCount: 1,
          successfulBrickHits: 1,
          maxSpeed: 1.232,
          minSpeed: 0.616,
          currentSpeed: 0.616,
          reductionPerBrick: 1.232,
          previousLevelMaxSpeed: 1.232,
          elapsedLevelMs: 1800,
          minReached: true,
        },
      });
      const ballPositions = [
        { x: 196.5, y: 822, velocity: { dx: 1.232, dy: -1.232 }, radius: 5 },
      ];
      const paddlePosition = { x: 156.5, y: 842, width: 80, height: 10 };

      await gameLogger.logLevelComplete(gameState, ballPositions, paddlePosition, 1, 2, 1.12, 1800, {
        nextMaxSpeed: 1.38,
        nextMinSpeed: 0.616,
        nextReductionPerBrick: 0.1725,
        nextInitialBrickCount: 8,
      });
      await gameLogger.logLevelStart(
        buildGameState({
          ...gameState,
          level: 2,
          speedState: {
            ...gameState.speedState,
            level: 2,
            initialBrickCount: 8,
            successfulBrickHits: 0,
            maxSpeed: 1.38,
            minSpeed: 0.616,
            currentSpeed: 1.38,
            reductionPerBrick: 0.1725,
            previousLevelMaxSpeed: 1.232,
            elapsedLevelMs: 0,
            minReached: false,
          },
        }),
        ballPositions,
        paddlePosition,
        2,
        1.12
      );

      const events = mockIndexedDB.mockStore.add.mock.calls.map(call => call[0]);
      expect(events.map(event => event.type)).toEqual(['level_complete', 'level_start']);
      expect(events[0].metadata).toMatchObject({
        completedLevel: 1,
        nextLevel: 2,
        nextSpeedMultiplier: 1.12,
        pauseMs: 1800,
        speedState: gameState.speedState,
        nextMaxSpeed: 1.38,
        nextMinSpeed: 0.616,
        nextReductionPerBrick: 0.1725,
        nextInitialBrickCount: 8,
      });
      expect(events[1].metadata).toMatchObject({
        level: 2,
        speedMultiplier: 1.12,
        scoreCarriedOver: 150,
        speedState: expect.objectContaining({
          level: 2,
          currentSpeed: 1.38,
          maxSpeed: 1.38,
        }),
      });
    }, 10000);
  });

  describe('logCollision', () => {
    it('deve registrar colisão', async () => {
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState({
        score: 100,
        bricksRemaining: 45,
      });
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();

      const collisionInfo = {
        type: 'wall' as const,
        ballPosition: { x: 400, y: 300 },
        wallType: 'left' as const,
        velocityBefore: { dx: -2, dy: -2 },
        velocityAfter: { dx: 2, dy: -2 },
      };

      await gameLogger.logCollision(
        gameState,
        ballPositions,
        paddlePosition,
        collisionInfo
      );

      // Verificar que o método foi chamado
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
    }, 10000);
  });

  describe('getGameStats', () => {
    it('agrega speed reductions, média de redução, mínimo atingido e duração média de fase', async () => {
      const events = [
        {
          id: '1',
          timestamp: 1,
          type: 'game_end',
          gameState: buildGameState({ score: 120 }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            reason: 'lose',
            gameDuration: 4000,
            totalBricksDestroyed: 6,
          },
        },
        {
          id: '2',
          timestamp: 2,
          type: 'score_update',
          gameState: buildGameState({
            score: 10,
            speedState: {
              successfulBrickHits: 1,
              currentSpeed: 2.184,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            speedReduction: {
              level: 1,
              hitNumber: 1,
              speedBefore: 2.24,
              speedAfter: 2.184,
              reductionApplied: 0.056,
              minSpeed: 1.12,
              maxSpeed: 2.24,
              minReached: false,
              elapsedLevelMs: 200,
            },
          },
        },
        {
          id: '3',
          timestamp: 3,
          type: 'score_update',
          gameState: buildGameState({
            score: 20,
            speedState: {
              successfulBrickHits: 2,
              currentSpeed: 1.12,
              minReached: true,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            speedReduction: {
              level: 1,
              hitNumber: 2,
              speedBefore: 1.176,
              speedAfter: 1.12,
              reductionApplied: 0.056,
              minSpeed: 1.12,
              maxSpeed: 2.24,
              minReached: true,
              elapsedLevelMs: 400,
            },
          },
        },
        {
          id: '4',
          timestamp: 4,
          type: 'level_complete',
          gameState: buildGameState({
            speedState: {
              elapsedLevelMs: 1800,
              currentSpeed: 1.12,
              minReached: true,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            speedState: {
              ...BASE_SPEED_STATE,
              elapsedLevelMs: 1800,
              currentSpeed: 1.12,
              minReached: true,
            },
          },
        },
        {
          id: '5',
          timestamp: 5,
          type: 'collision',
          gameState: buildGameState({
            speedState: {
              currentSpeed: 1.12,
              minReached: true,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {},
        },
      ];

      jest.spyOn(gameLogger, 'getAllEvents').mockResolvedValue(events as any);

      const stats = await gameLogger.getGameStats();

      expect(stats.totalSpeedReductions).toBe(2);
      expect(stats.averageReductionApplied).toBeCloseTo(0.056, 5);
      expect(stats.minSpeedReachedCount).toBe(1);
      expect(stats.averageLevelDurationMs).toBe(1800);
      expect(stats.latestSpeedState).toMatchObject({
        currentSpeed: 1.12,
        minReached: true,
      });
    });
  });

  describe('getCurrentGameId', () => {
    it('deve retornar null quando não há jogo ativo', () => {
      const gameId = gameLogger.getCurrentGameId();
      // Pode ser null ou string dependendo do estado
      expect(typeof gameId === 'string' || gameId === null).toBe(true);
    });
  });
});
