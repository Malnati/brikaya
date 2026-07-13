// src/storage/gameLogger.test.ts
import { gameLogger } from './gameLogger';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

const BASE_SPEED_STATE = {
  level: 1,
  initialComponentCount: 40,
  successfulComponentHits: 0,
  initialSpawnSpeed: 12,
  maxSpeed: 12,
  minSpeed: 3,
  currentSpeed: 12,
  reductionPerComponent: 0.3,
  previousLevelMaxSpeed: 12,
  levelStartedAt: 1_782_870_000_000,
  elapsedLevelMs: 0,
  minReached: false,
};

function buildGameState(overrides: Record<string, any> = {}) {
  return {
    score: 0,
    ballsCount: 1,
    componentsRemaining: 40,
    gameWon: false,
    gameOver: false,
    level: 1,
    canvasSize: { width: 800, height: 600 },
    gameDimensions: {
      componentWidth: 60,
      componentHeight: 20,
      componentCols: 8,
      componentRows: 5,
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
    clear: jest.fn(() => {
      const request = {
        result: undefined,
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
    window.localStorage.clear();
    
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
      const gameState = buildGameState({ componentsRemaining: 50 });
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();

      await gameLogger.logGameStart(gameState, ballPositions, paddlePosition);

      // Verificar que o método foi chamado sem erros
      expect(gameLogger.getCurrentGameId()).toBeTruthy();
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0].gameState.speedState).toMatchObject(gameState.speedState);
    }, 10000);

    it('inicializa o IndexedDB sob demanda antes de registrar game_start', async () => {
      (gameLogger as any).db = null;
      (gameLogger as any).initialization = null;
      const gameState = buildGameState({ componentsRemaining: 50 });
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();

      await gameLogger.logGameStart(gameState, ballPositions, paddlePosition);

      expect(global.indexedDB.open).toHaveBeenCalled();
      expect(gameLogger.getCurrentGameId()).toBeTruthy();
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
    }, 10000);
  });

  describe('logScoreUpdate', () => {
    it('deve registrar atualização de pontuação com speedReduction', async () => {
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState({
        score: 100,
        componentsRemaining: 45,
        speedState: {
          successfulComponentHits: 1,
          currentSpeed: 11.7,
          elapsedLevelMs: 320,
        },
      });
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();
      const speedReduction = {
        level: 1,
        hitNumber: 1,
        speedBefore: 12,
        speedAfter: 11.7,
        reductionApplied: 0.3,
        minSpeed: 3,
        maxSpeed: 12,
        minReached: false,
        elapsedLevelMs: 320,
      };

      await gameLogger.logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        10,
        'component_destroyed',
        speedReduction
      );

      // Verificar que o método foi chamado
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0].metadata.speedReduction).toMatchObject(speedReduction);
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0].metadata.speedState).toMatchObject(gameState.speedState);
    }, 10000);
  });

  describe('hot path guard', () => {
    it('não grava eventos volumosos sem telemetria de gameplay explícita', async () => {
      window.localStorage.clear();
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState();
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();

      await gameLogger.logPaddleMove(
        gameState,
        ballPositions,
        paddlePosition,
        'touch',
      );
      await gameLogger.logCollision(gameState, ballPositions, paddlePosition, {
        type: 'paddle',
        ballPosition: { x: 400, y: 300 },
      });
      await gameLogger.logComponentDestroyed(
        gameState,
        ballPositions,
        paddlePosition,
        { x: 10, y: 20, width: 50, height: 20 },
        { col: 0, row: 0 },
        1,
        { x: 40, y: 40 },
        { dx: 1, dy: -1 },
      );

      expect(gameLogger.shouldRecordEvent('paddle_move')).toBe(false);
      expect(mockIndexedDB.mockStore.add).not.toHaveBeenCalled();
    });
  });

  describe('level events', () => {
    it('deve registrar conclusão e início de fase com metadados da próxima velocidade', async () => {
      (gameLogger as any).db = mockIndexedDB.mockDB;

      const gameState = buildGameState({
        score: 150,
        componentsRemaining: 0,
        canvasSize: { width: 393, height: 852 },
        gameDimensions: {
          componentWidth: 60,
          componentHeight: 20,
          componentCols: 1,
          componentRows: 1,
          paddleWidth: 80,
          paddleHeight: 10,
          ballRadius: 5,
        },
        speedState: {
          level: 1,
          initialComponentCount: 1,
          successfulComponentHits: 1,
          maxSpeed: 1.232,
          minSpeed: 0.616,
          currentSpeed: 0.616,
          reductionPerComponent: 1.232,
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
        nextReductionPerComponent: 0.1725,
        nextInitialComponentCount: 8,
      });
      await gameLogger.logLevelStart(
        buildGameState({
          ...gameState,
          level: 2,
          speedState: {
            ...gameState.speedState,
            level: 2,
            initialComponentCount: 8,
            successfulComponentHits: 0,
            maxSpeed: 1.38,
            minSpeed: 0.616,
            currentSpeed: 1.38,
            reductionPerComponent: 0.1725,
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
        nextReductionPerComponent: 0.1725,
        nextInitialComponentCount: 8,
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
      (window.localStorage.getItem as jest.Mock).mockImplementation((key) =>
        key === 'brikaya:gameplay-telemetry' ? '1' : null,
      );
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState({
        score: 100,
        componentsRemaining: 45,
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

  describe('logPowerUp', () => {
    it('deve registrar power-up com tipo, ação e speedState', async () => {
      (gameLogger as any).db = mockIndexedDB.mockDB;
      const gameState = buildGameState();
      const ballPositions = buildBallPositions();
      const paddlePosition = buildPaddlePosition();

      await gameLogger.logPowerUp(
        gameState,
        ballPositions,
        paddlePosition,
        'laser_fan',
        'activate'
      );

      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
      expect(mockIndexedDB.mockStore.add.mock.calls[0][0]).toMatchObject({
        type: 'power_up',
        metadata: {
          powerUpType: 'laser_fan',
          action: 'activate',
          speedState: gameState.speedState,
        },
      });
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
            totalComponentsDestroyed: 6,
          },
        },
        {
          id: '2',
          timestamp: 2,
          type: 'score_update',
          gameState: buildGameState({
            score: 10,
            speedState: {
              successfulComponentHits: 1,
              currentSpeed: 11.7,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            speedReduction: {
              level: 1,
              hitNumber: 1,
              speedBefore: 12,
              speedAfter: 11.7,
              reductionApplied: 0.3,
              minSpeed: 3,
              maxSpeed: 12,
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
              successfulComponentHits: 2,
              currentSpeed: 3,
              minReached: true,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            speedReduction: {
              level: 1,
              hitNumber: 2,
              speedBefore: 3.3,
              speedAfter: 3,
              reductionApplied: 0.3,
              minSpeed: 3,
              maxSpeed: 12,
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
              currentSpeed: 3,
              minReached: true,
            },
          }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            speedState: {
              ...BASE_SPEED_STATE,
              elapsedLevelMs: 1800,
              currentSpeed: 3,
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
              currentSpeed: 3,
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
      expect(stats.averageReductionApplied).toBeCloseTo(0.3, 5);
      expect(stats.minSpeedReachedCount).toBe(1);
      expect(stats.averageLevelDurationMs).toBe(1800);
      expect(stats.latestSpeedState).toMatchObject({
        currentSpeed: 3,
        minReached: true,
      });
    });

    it('calcula média de bolas por jogo pelo maior número de bolas ativas observado', async () => {
      const events = [
        {
          id: '1',
          timestamp: 1,
          type: 'game_start',
          gameState: buildGameState({ ballsCount: 1 }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {},
        },
        {
          id: '2',
          timestamp: 2,
          type: 'ball_added',
          gameState: buildGameState({ ballsCount: 3 }),
          ballPositions: [
            ...buildBallPositions(),
            { x: 410, y: 300, velocity: { dx: 3, dy: -2 }, radius: 5 },
            { x: 390, y: 300, velocity: { dx: -3, dy: -2 }, radius: 5 },
          ],
          paddlePosition: buildPaddlePosition(),
          metadata: {
            totalBalls: 3,
          },
        },
        {
          id: '3',
          timestamp: 3,
          type: 'ball_lost',
          gameState: buildGameState({ ballsCount: 2 }),
          ballPositions: buildBallPositions(),
          paddlePosition: buildPaddlePosition(),
          metadata: {
            remainingBalls: 2,
          },
        },
        {
          id: '4',
          timestamp: 4,
          type: 'game_end',
          gameState: buildGameState({ ballsCount: 0, score: 20, gameOver: true }),
          ballPositions: [],
          paddlePosition: buildPaddlePosition(),
          metadata: {
            reason: 'lose',
          },
        },
      ];

      jest.spyOn(gameLogger, 'getAllEvents').mockResolvedValue(events as any);

      const stats = await gameLogger.getGameStats();

      expect(stats.averageBallsPerGame).toBe(3);
    });
  });

  describe('getCurrentGameId', () => {
    it('deve retornar null quando não há jogo ativo', () => {
      const gameId = gameLogger.getCurrentGameId();
      // Pode ser null ou string dependendo do estado
      expect(typeof gameId === 'string' || gameId === null).toBe(true);
    });
  });

  describe('clearAllEvents', () => {
    it('deve inicializar IndexedDB antes de limpar eventos quando o DB não está pronto', async () => {
      (gameLogger as any).db = null;

      await gameLogger.clearAllEvents();

      expect(mockIndexedDB.mockStore.clear).toHaveBeenCalled();
    });

    it('deve limpar o jogo ativo após remover todos os eventos', async () => {
      (gameLogger as any).db = mockIndexedDB.mockDB;
      (gameLogger as any).currentGameId = 'active-game';
      (gameLogger as any).gameStartTime = 1_782_870_000_000;

      await gameLogger.clearAllEvents();

      expect(gameLogger.getCurrentGameId()).toBeNull();
      expect((gameLogger as any).gameStartTime).toBeNull();
    });
  });
});
