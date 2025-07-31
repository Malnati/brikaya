// src/storage/gameLogger.ts

interface GameEvent {
  id: string;
  timestamp: number;
  type: 'game_start' | 'game_end' | 'score_update' | 'ball_lost' | 'ball_added' | 'brick_destroyed' | 'brick_added' | 'paddle_move' | 'collision' | 'power_up' | 'level_complete';
  gameState: {
    score: number;
    ballsCount: number;
    bricksRemaining: number;
    gameWon: boolean;
    gameOver: boolean;
    level: number;
  };
  ballPositions: Array<{
    x: number;
    y: number;
    velocity: { dx: number; dy: number };
  }>;
  paddlePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  collisionInfo?: {
    type: 'wall' | 'paddle' | 'brick' | 'ceiling';
    ballPosition: { x: number; y: number };
    targetPosition?: { x: number; y: number; width?: number; height?: number };
    brickIndex?: { col: number; row: number };
    brickColorIndex?: number;
    wallType?: 'left' | 'right';
    hitPosition?: number; // Para colisão com paddle (0-1)
  };
  metadata?: Record<string, any>;
}

class GameLogger {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'BrickBreakerGameLog';
  private readonly STORE_NAME = 'gameEvents';
  private readonly DB_VERSION = 1;
  private currentGameId: string | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB para GameLogger:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ GameLogger IndexedDB inicializado');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('gameId', 'gameId', { unique: false });
          console.log('🏗️ Store de eventos do jogo criada no IndexedDB');
        }
      };
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateGameId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  async logEvent(event: Omit<GameEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado, pulando registro de evento');
      return;
    }

    const gameEvent: GameEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add({
        ...gameEvent,
        gameId: this.currentGameId
      });

      request.onsuccess = () => {
        console.log(`📊 Evento registrado: ${gameEvent.type} (ID: ${gameEvent.id})`);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao registrar evento:', request.error);
        reject(request.error);
      };
    });
  }

  // Métodos específicos para diferentes tipos de eventos
  async logGameStart(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition']): Promise<void> {
    this.currentGameId = this.generateGameId();
    await this.logEvent({
      type: 'game_start',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { gameId: this.currentGameId }
    });
  }

  async logGameEnd(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], reason: 'win' | 'lose'): Promise<void> {
    await this.logEvent({
      type: 'game_end',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { reason, gameId: this.currentGameId }
    });
    this.currentGameId = null;
  }

  async logScoreUpdate(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], pointsAdded: number, reason: string): Promise<void> {
    await this.logEvent({
      type: 'score_update',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { pointsAdded, reason }
    });
  }

  async logBallLost(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], lostBallPosition: { x: number; y: number }): Promise<void> {
    await this.logEvent({
      type: 'ball_lost',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { lostBallPosition }
    });
  }

  async logBallAdded(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], newBallPosition: { x: number; y: number }): Promise<void> {
    await this.logEvent({
      type: 'ball_added',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { newBallPosition }
    });
  }

  async logBrickDestroyed(
    gameState: GameEvent['gameState'], 
    ballPositions: GameEvent['ballPositions'], 
    paddlePosition: GameEvent['paddlePosition'],
    brickPosition: { x: number; y: number; width: number; height: number },
    brickIndex: { col: number; row: number },
    brickColorIndex: number,
    ballPosition: { x: number; y: number }
  ): Promise<void> {
    await this.logEvent({
      type: 'brick_destroyed',
      gameState,
      ballPositions,
      paddlePosition,
      collisionInfo: {
        type: 'brick',
        ballPosition,
        targetPosition: brickPosition,
        brickIndex,
        brickColorIndex
      }
    });
  }

  async logBrickAdded(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], rowAdded: number): Promise<void> {
    await this.logEvent({
      type: 'brick_added',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { rowAdded }
    });
  }

  async logPaddleMove(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], direction: 'left' | 'right'): Promise<void> {
    await this.logEvent({
      type: 'paddle_move',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { direction }
    });
  }

  async logCollision(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    collisionInfo: GameEvent['collisionInfo']
  ): Promise<void> {
    await this.logEvent({
      type: 'collision',
      gameState,
      ballPositions,
      paddlePosition,
      collisionInfo
    });
  }

  async logLevelComplete(gameState: GameEvent['gameState'], ballPositions: GameEvent['ballPositions'], paddlePosition: GameEvent['paddlePosition'], level: number): Promise<void> {
    await this.logEvent({
      type: 'level_complete',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { level }
    });
  }

  // Métodos para recuperar dados
  async getAllEvents(): Promise<GameEvent[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const events = request.result.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`📊 Total de eventos recuperados: ${events.length}`);
        resolve(events);
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar eventos:', request.error);
        reject(request.error);
      };
    });
  }

  async getEventsByGameId(gameId: string): Promise<GameEvent[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('gameId');
      const request = index.getAll(gameId);

      request.onsuccess = () => {
        const events = request.result.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`📊 Eventos do jogo ${gameId}: ${events.length}`);
        resolve(events);
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar eventos por gameId:', request.error);
        reject(request.error);
      };
    });
  }

  async getEventsByType(type: GameEvent['type']): Promise<GameEvent[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const events = request.result.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`📊 Eventos do tipo ${type}: ${events.length}`);
        resolve(events);
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar eventos por tipo:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecentEvents(limit: number = 100): Promise<GameEvent[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const events: GameEvent[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          events.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          console.log(`📊 Últimos ${events.length} eventos recuperados`);
          resolve(events.reverse());
        }
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar eventos recentes:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllEvents(): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Todos os eventos foram removidos do IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao limpar eventos:', request.error);
        reject(request.error);
      };
    });
  }

  async getGameStats(): Promise<{
    totalGames: number;
    totalEvents: number;
    byType: Record<string, number>;
    averageScore: number;
    gamesWon: number;
    gamesLost: number;
  }> {
    const allEvents = await this.getAllEvents();
    const gameEndEvents = allEvents.filter(e => e.type === 'game_end');
    
    const byType: Record<string, number> = {};
    let totalScore = 0;
    let gamesWon = 0;
    let gamesLost = 0;

    allEvents.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
    });

    gameEndEvents.forEach(event => {
      totalScore += event.gameState.score;
      if (event.metadata?.reason === 'win') {
        gamesWon++;
      } else if (event.metadata?.reason === 'lose') {
        gamesLost++;
      }
    });

    return {
      totalGames: gameEndEvents.length,
      totalEvents: allEvents.length,
      byType,
      averageScore: gameEndEvents.length > 0 ? totalScore / gameEndEvents.length : 0,
      gamesWon,
      gamesLost
    };
  }
}

// Instância singleton
export const gameLogger = new GameLogger();

// Inicializar automaticamente
gameLogger.initialize().catch(error => {
  console.error('❌ Falha ao inicializar GameLogger:', error);
}); 