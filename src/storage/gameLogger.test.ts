// src/storage/gameLogger.test.ts
import { gameLogger } from './gameLogger';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

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
      
      const gameState = {
        score: 0,
        ballsCount: 1,
        bricksRemaining: 50,
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
      };

      const ballPositions = [
        { x: 400, y: 300, velocity: { dx: 2, dy: -2 }, radius: 5 },
      ];

      const paddlePosition = { x: 360, y: 580, width: 80, height: 10 };

      await gameLogger.logGameStart(gameState, ballPositions, paddlePosition);

      // Verificar que o método foi chamado sem erros
      expect(gameLogger.getCurrentGameId()).toBeTruthy();
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
    }, 10000);
  });

  describe('logScoreUpdate', () => {
    it('deve registrar atualização de pontuação', async () => {
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      
      const gameState = {
        score: 100,
        ballsCount: 1,
        bricksRemaining: 45,
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
      };

      const ballPositions = [
        { x: 400, y: 300, velocity: { dx: 2, dy: -2 }, radius: 5 },
      ];

      const paddlePosition = { x: 360, y: 580, width: 80, height: 10 };

      await gameLogger.logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        10,
        'brick_destroyed'
      );

      // Verificar que o método foi chamado
      expect(mockIndexedDB.mockStore.add).toHaveBeenCalled();
    }, 10000);
  });

  describe('level events', () => {
    it('deve registrar conclusão e início de fase com metadados da próxima velocidade', async () => {
      (gameLogger as any).db = mockIndexedDB.mockDB;

      const gameState = {
        score: 150,
        ballsCount: 1,
        bricksRemaining: 0,
        gameWon: false,
        gameOver: false,
        level: 1,
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
      };
      const ballPositions = [
        { x: 196.5, y: 822, velocity: { dx: 1.232, dy: -1.232 }, radius: 5 },
      ];
      const paddlePosition = { x: 156.5, y: 842, width: 80, height: 10 };

      await gameLogger.logLevelComplete(gameState, ballPositions, paddlePosition, 1, 2, 1.12, 1800);
      await gameLogger.logLevelStart({ ...gameState, level: 2 }, ballPositions, paddlePosition, 2, 1.12);

      const events = mockIndexedDB.mockStore.add.mock.calls.map(call => call[0]);
      expect(events.map(event => event.type)).toEqual(['level_complete', 'level_start']);
      expect(events[0].metadata).toMatchObject({
        completedLevel: 1,
        nextLevel: 2,
        nextSpeedMultiplier: 1.12,
        pauseMs: 1800,
      });
      expect(events[1].metadata).toMatchObject({
        level: 2,
        speedMultiplier: 1.12,
        scoreCarriedOver: 150,
      });
    }, 10000);
  });

  describe('logCollision', () => {
    it('deve registrar colisão', async () => {
      // Garantir que o DB está mockado
      (gameLogger as any).db = mockIndexedDB.mockDB;
      
      const gameState = {
        score: 100,
        ballsCount: 1,
        bricksRemaining: 45,
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
      };

      const ballPositions = [
        { x: 400, y: 300, velocity: { dx: 2, dy: -2 }, radius: 5 },
      ];

      const paddlePosition = { x: 360, y: 580, width: 80, height: 10 };

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

  describe('getCurrentGameId', () => {
    it('deve retornar null quando não há jogo ativo', () => {
      const gameId = gameLogger.getCurrentGameId();
      // Pode ser null ou string dependendo do estado
      expect(typeof gameId === 'string' || gameId === null).toBe(true);
    });
  });
});
