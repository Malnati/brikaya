// src/utils/collisionTracker.ts

import { LOG, ERROR, WARN } from './logger';

interface CollisionEvent {
  id: string;
  timestamp: number;
  type: 'wall' | 'paddle' | 'brick' | 'ceiling' | 'ball_lost';
  ballPosition: { x: number; y: number };
  ballVelocity: { dx: number; dy: number };
  targetInfo?: {
    type: string;
    position?: { x: number; y: number; width?: number; height?: number };
    brickIndex?: { col: number; row: number };
  };
  gameState: {
    score: number;
    ballsCount: number;
    bricksRemaining: number;
  };
  metadata?: Record<string, any>;
}

class CollisionTracker {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'BrickBreakerCollisions';
  private readonly STORE_NAME = 'collisions';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        ERROR('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        LOG('✅ IndexedDB inicializado para rastreamento de colisões');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          LOG('🏗️ Store de colisões criada no IndexedDB');
        }
      };
    });
  }

  async logCollision(event: Omit<CollisionEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado, pulando registro de colisão');
      return;
    }

    const collisionEvent: CollisionEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(collisionEvent);

      request.onsuccess = () => {
        LOG(`📊 Colisão registrada: ${collisionEvent.type} (ID: ${collisionEvent.id}) - Pos: (${Math.round(collisionEvent.ballPosition.x)}, ${Math.round(collisionEvent.ballPosition.y)})`);
        resolve();
      };

      request.onerror = () => {
        ERROR('❌ Erro ao registrar colisão:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllCollisions(): Promise<CollisionEvent[]> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const collisions = request.result.sort((a, b) => a.timestamp - b.timestamp);
        LOG(`📊 Total de colisões recuperadas: ${collisions.length}`);
        resolve(collisions);
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar colisões:', request.error);
        reject(request.error);
      };
    });
  }

  async getCollisionsByType(type: CollisionEvent['type']): Promise<CollisionEvent[]> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const collisions = request.result.sort((a, b) => a.timestamp - b.timestamp);
        LOG(`📊 Colisões do tipo ${type}: ${collisions.length}`);
        resolve(collisions);
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar colisões por tipo:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecentCollisions(limit: number = 50): Promise<CollisionEvent[]> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const collisions: CollisionEvent[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          collisions.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          LOG(`📊 Últimas ${collisions.length} colisões recuperadas`);
          resolve(collisions.reverse());
        }
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar colisões recentes:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllCollisions(): Promise<void> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        LOG('🗑️ Todas as colisões foram removidas do IndexedDB');
        resolve();
      };

      request.onerror = () => {
        ERROR('❌ Erro ao limpar colisões:', request.error);
        reject(request.error);
      };
    });
  }

  async getCollisionStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    recentActivity: { lastMinute: number; last5Minutes: number; lastHour: number };
  }> {
    const allCollisions = await this.getAllCollisions();
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const fiveMinutes = 5 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;

    const byType: Record<string, number> = {};
    let lastMinute = 0;
    let last5Minutes = 0;
    let lastHour = 0;

    allCollisions.forEach(collision => {
      // Contagem por tipo
      byType[collision.type] = (byType[collision.type] || 0) + 1;

      // Atividade recente
      const timeDiff = now - collision.timestamp;
      if (timeDiff <= oneMinute) lastMinute++;
      if (timeDiff <= fiveMinutes) last5Minutes++;
      if (timeDiff <= oneHour) lastHour++;
    });

    return {
      total: allCollisions.length,
      byType,
      recentActivity: { lastMinute, last5Minutes, lastHour }
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de conveniência para tipos específicos de colisão
  async logWallCollision(
    ballPosition: { x: number; y: number },
    ballVelocity: { dx: number; dy: number },
    gameState: CollisionEvent['gameState'],
    wallType: 'left' | 'right'
  ): Promise<void> {
    await this.logCollision({
      type: 'wall',
      ballPosition,
      ballVelocity,
      gameState,
      targetInfo: { type: wallType },
      metadata: { wallType }
    });
  }

  async logPaddleCollision(
    ballPosition: { x: number; y: number },
    ballVelocity: { dx: number; dy: number },
    gameState: CollisionEvent['gameState'],
    paddlePosition: { x: number; y: number; width: number; height: number },
    hitPosition: number
  ): Promise<void> {
    await this.logCollision({
      type: 'paddle',
      ballPosition,
      ballVelocity,
      gameState,
      targetInfo: {
        type: 'paddle',
        position: paddlePosition
      },
      metadata: { hitPosition }
    });
  }

  async logBrickCollision(
    ballPosition: { x: number; y: number },
    ballVelocity: { dx: number; dy: number },
    gameState: CollisionEvent['gameState'],
    brickPosition: { x: number; y: number; width: number; height: number },
    brickIndex: { col: number; row: number },
    brickColorIndex: number
  ): Promise<void> {
    await this.logCollision({
      type: 'brick',
      ballPosition,
      ballVelocity,
      gameState,
      targetInfo: {
        type: 'brick',
        position: brickPosition,
        brickIndex
      },
      metadata: { brickColorIndex }
    });
  }

  async logCeilingCollision(
    ballPosition: { x: number; y: number },
    ballVelocity: { dx: number; dy: number },
    gameState: CollisionEvent['gameState']
  ): Promise<void> {
    await this.logCollision({
      type: 'ceiling',
      ballPosition,
      ballVelocity,
      gameState,
      targetInfo: { type: 'ceiling' }
    });
  }

  async logBallLost(
    ballPosition: { x: number; y: number },
    ballVelocity: { dx: number; dy: number },
    gameState: CollisionEvent['gameState'],
    paddlePosition: { x: number; y: number; width: number; height: number }
  ): Promise<void> {
    await this.logCollision({
      type: 'ball_lost',
      ballPosition,
      ballVelocity,
      gameState,
      targetInfo: {
        type: 'paddle',
        position: paddlePosition
      },
      metadata: { reason: 'ball_passed_paddle' }
    });
  }
}

// Instância singleton
export const collisionTracker = new CollisionTracker();

// Inicializar automaticamente
collisionTracker.initialize().catch(error => {
  ERROR('❌ Falha ao inicializar CollisionTracker:', error);
}); 