// src/storage/gameLogger.ts
import {
  LevelTransitionPayload,
  SpeedReductionSnapshot,
  SpeedStateSnapshot
} from '../constants/game';

import { LOG, ERROR, WARN } from '../utils/logger';

LOG('📦 GameLogger.ts carregado');

export type GameEventType =
  | 'game_start'
  | 'game_end'
  | 'score_update'
  | 'ball_lost'
  | 'ball_added'
  | 'brick_destroyed'
  | 'brick_added'
  | 'paddle_move'
  | 'collision'
  | 'power_up'
  | 'level_complete'
  | 'level_start'
  | 'game_state_change'
  | 'restart_game';

export interface LoggedGameState {
  score: number;
  ballsCount: number;
  bricksRemaining: number;
  gameWon: boolean;
  gameOver: boolean;
  level: number;
  canvasSize: { width: number; height: number };
  gameDimensions: {
    brickWidth: number;
    brickHeight: number;
    brickCols: number;
    brickRows: number;
    paddleWidth: number;
    paddleHeight: number;
    ballRadius: number;
  };
  speedState: SpeedStateSnapshot;
}

export interface LoggedBallPosition {
  x: number;
  y: number;
  velocity: { dx: number; dy: number };
  radius: number;
}

export interface LoggedPaddlePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  gameState: LoggedGameState;
  ballPositions: LoggedBallPosition[];
  paddlePosition: LoggedPaddlePosition;
  collisionInfo?: {
    type: 'wall' | 'paddle' | 'brick' | 'ceiling';
    ballPosition: { x: number; y: number };
    targetPosition?: { x: number; y: number; width?: number; height?: number };
    brickIndex?: { col: number; row: number };
    brickColorIndex?: number;
    wallType?: 'left' | 'right';
    hitPosition?: number; // Para colisão com paddle (0-1)
    collisionAngle?: number; // Ângulo da colisão
    velocityBefore?: { dx: number; dy: number };
    velocityAfter?: { dx: number; dy: number };
  };
  metadata?: Record<string, unknown>;
}

export interface GameStatsSummary {
  totalGames: number;
  totalEvents: number;
  byType: Record<string, number>;
  averageScore: number;
  gamesWon: number;
  gamesLost: number;
  averageGameDuration: number;
  totalBricksDestroyed: number;
  totalCollisions: number;
  averageBallsPerGame: number;
  latestSpeedState: SpeedStateSnapshot | null;
  totalSpeedReductions: number;
  averageReductionApplied: number;
  minSpeedReachedCount: number;
  averageLevelDurationMs: number;
}

class GameLogger {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'BrickBreakerGameLog';
  private readonly STORE_NAME = 'gameEvents';
  private readonly DB_VERSION = 2; // Incrementado para nova versão
  private currentGameId: string | null = null;
  private gameStartTime: number | null = null;

  constructor() {
    LOG('🏗️ GameLogger constructor chamado');
  }

  async initialize(): Promise<void> {
    LOG('🏗️ GameLogger.initialize() chamado - INÍCIO');
    LOG('🏗️ this:', this);
    LOG('🏗️ DB_NAME:', this.DB_NAME);
    LOG('🏗️ DB_VERSION:', this.DB_VERSION);

    // Verificar se IndexedDB está disponível
    if (!window.indexedDB) {
      ERROR('❌ IndexedDB não está disponível neste navegador');
      throw new Error('IndexedDB não está disponível');
    }

    LOG('✅ IndexedDB está disponível');

    return new Promise((resolve, reject) => {
      LOG('🗄️ Abrindo IndexedDB:', this.DB_NAME, 'versão:', this.DB_VERSION);
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        ERROR('❌ Erro ao abrir IndexedDB para GameLogger:', request.error);
        ERROR('❌ Código do erro:', request.error?.code);
        ERROR('❌ Nome do erro:', request.error?.name);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        LOG('✅ GameLogger IndexedDB inicializado com sucesso');
        LOG('🗄️ Database:', this.db);
        LOG('🗄️ Object stores:', this.db.objectStoreNames);
        LOG('🗄️ Version:', this.db.version);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        LOG('🔄 Upgrade necessário do IndexedDB...');
        const db = (event.target as IDBOpenDBRequest).result;
        LOG('🗄️ Versão antiga:', event.oldVersion);
        LOG('🗄️ Versão nova:', event.newVersion);

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          LOG('🏗️ Criando object store:', this.STORE_NAME);
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('gameId', 'gameId', { unique: false });
          store.createIndex('gameStartTime', 'gameStartTime', { unique: false });
          LOG('✅ Store de eventos do jogo criada no IndexedDB');
        } else {
          LOG('✅ Object store já existe:', this.STORE_NAME);
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

  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  private getTotalBricks(gameState: LoggedGameState): number {
    return gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows;
  }

  async logEvent(event: Omit<GameEvent, 'id' | 'timestamp'>): Promise<void> {
    LOG('📝 logEvent chamado - INÍCIO');
    LOG('📝 event.type:', event.type);
    LOG('📝 this.db:', this.db);
    LOG('📝 this:', this);

    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado, pulando registro de evento');
      return;
    }

    const gameEvent: GameEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    };

    LOG('📝 Evento preparado:', gameEvent.id, gameEvent.type);

    return new Promise((resolve, reject) => {
      LOG('🗄️ Iniciando transação no IndexedDB...');
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const eventToStore = {
        ...gameEvent,
        gameId: this.currentGameId,
        gameStartTime: this.gameStartTime
      };

      LOG('📝 Adicionando evento ao store:', eventToStore.id);
      const request = store.add(eventToStore);

      request.onsuccess = () => {
        LOG(`📊 Evento registrado com sucesso: ${gameEvent.type} (ID: ${gameEvent.id})`);
        // Log detalhado do conteúdo registrado
        LOG('📦 Conteúdo registrado no IndexDB:', JSON.stringify(eventToStore, null, 2));
        resolve();
      };

      request.onerror = () => {
        ERROR('❌ Erro ao registrar evento:', request.error);
        ERROR('❌ Detalhes do erro:', request.error?.message);
        reject(request.error);
      };
    });
  }

  // Métodos específicos para diferentes tipos de eventos
  async logGameStart(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition']
  ): Promise<void> {
    LOG('🎮 logGameStart chamado');
    LOG('🎮 gameState:', gameState);
    LOG('🎮 ballPositions:', ballPositions);
    LOG('🎮 paddlePosition:', paddlePosition);

    this.currentGameId = this.generateGameId();
    this.gameStartTime = Date.now();

    await this.logEvent({
      type: 'game_start',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        gameId: this.currentGameId,
        gameStartTime: this.gameStartTime
      }
    });
  }

  async logGameEnd(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    reason: 'win' | 'lose'
  ): Promise<void> {
    const gameDuration = this.gameStartTime ? Date.now() - this.gameStartTime : 0;

    await this.logEvent({
      type: 'game_end',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        reason,
        gameId: this.currentGameId,
        gameDuration,
        finalScore: gameState.score,
        totalBricksDestroyed: this.getTotalBricks(gameState) - gameState.bricksRemaining,
        speedState: gameState.speedState
      }
    });

    this.currentGameId = null;
    this.gameStartTime = null;
  }

  async logScoreUpdate(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    pointsAdded: number,
    reason: string,
    speedReduction?: SpeedReductionSnapshot | null
  ): Promise<void> {
    await this.logEvent({
      type: 'score_update',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        pointsAdded,
        reason,
        newTotalScore: gameState.score,
        bricksRemaining: gameState.bricksRemaining,
        speedReduction: speedReduction ?? undefined,
        speedState: gameState.speedState
      }
    });
  }

  async logBallLost(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    lostBallPosition: { x: number; y: number },
    lostBallVelocity: { dx: number; dy: number }
  ): Promise<void> {
    await this.logEvent({
      type: 'ball_lost',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        lostBallPosition,
        lostBallVelocity,
        remainingBalls: gameState.ballsCount - 1,
        gameProgress: {
          bricksDestroyed: this.getTotalBricks(gameState) - gameState.bricksRemaining,
          totalBricks: this.getTotalBricks(gameState),
          percentageComplete: ((this.getTotalBricks(gameState) - gameState.bricksRemaining) / this.getTotalBricks(gameState)) * 100
        },
        speedState: gameState.speedState
      }
    });
  }

  async logBallAdded(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    newBallPosition: { x: number; y: number }
  ): Promise<void> {
    await this.logEvent({
      type: 'ball_added',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        newBallPosition,
        totalBalls: gameState.ballsCount,
        speedState: gameState.speedState
      }
    });
  }

  async logBrickDestroyed(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    brickPosition: { x: number; y: number; width: number; height: number },
    brickIndex: { col: number; row: number },
    brickColorIndex: number,
    ballPosition: { x: number; y: number },
    ballVelocityBefore: { dx: number; dy: number },
    ballVelocityAfter?: { dx: number; dy: number },
    speedReduction?: SpeedReductionSnapshot | null
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
        brickColorIndex,
        velocityBefore: ballVelocityBefore,
        velocityAfter: ballVelocityAfter ?? ballVelocityBefore
      },
      metadata: {
        brickColorIndex,
        brickPosition: brickIndex,
        remainingBricks: gameState.bricksRemaining,
        speedReduction: speedReduction ?? undefined,
        speedState: gameState.speedState,
        gameProgress: {
          bricksDestroyed: this.getTotalBricks(gameState) - gameState.bricksRemaining,
          totalBricks: this.getTotalBricks(gameState),
          percentageComplete: ((this.getTotalBricks(gameState) - gameState.bricksRemaining) / this.getTotalBricks(gameState)) * 100
        }
      }
    });
  }

  async logBrickAdded(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    rowAdded: number
  ): Promise<void> {
    await this.logEvent({
      type: 'brick_added',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        rowAdded,
        newTotalBricks: gameState.bricksRemaining + gameState.gameDimensions.brickCols,
        speedState: gameState.speedState
      }
    });
  }

  async logPaddleMove(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    direction: 'left' | 'right' | 'touch',
    previousPosition?: { x: number; y: number }
  ): Promise<void> {
    await this.logEvent({
      type: 'paddle_move',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        direction,
        previousPosition,
        movementDistance: previousPosition ? Math.abs(paddlePosition.x - previousPosition.x) : 0,
        paddleCenter: paddlePosition.x + paddlePosition.width / 2,
        speedState: gameState.speedState
      }
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
      collisionInfo,
      metadata: {
        speedState: gameState.speedState
      }
    });
  }

  async logLevelComplete(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    completedLevel: number,
    nextLevel: number,
    nextSpeedMultiplier: number,
    pauseMs: number,
    levelTransitionPayload?: Pick<
      LevelTransitionPayload,
      'nextMaxSpeed' | 'nextMinSpeed' | 'nextReductionPerBrick' | 'nextInitialBrickCount'
    >
  ): Promise<void> {
    await this.logEvent({
      type: 'level_complete',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        completedLevel,
        nextLevel,
        nextSpeedMultiplier,
        pauseMs,
        levelScore: gameState.score,
        levelDuration: this.gameStartTime ? Date.now() - this.gameStartTime : 0,
        speedState: gameState.speedState,
        nextMaxSpeed: levelTransitionPayload?.nextMaxSpeed,
        nextMinSpeed: levelTransitionPayload?.nextMinSpeed,
        nextReductionPerBrick: levelTransitionPayload?.nextReductionPerBrick,
        nextInitialBrickCount: levelTransitionPayload?.nextInitialBrickCount
      }
    });
  }

  async logLevelStart(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    level: number,
    speedMultiplier: number
  ): Promise<void> {
    await this.logEvent({
      type: 'level_start',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        level,
        speedMultiplier,
        scoreCarriedOver: gameState.score,
        speedState: gameState.speedState
      }
    });
  }

  async logGameStateChange(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition'],
    changeType: 'game_won' | 'game_over' | 'ball_count_change' | 'brick_count_change'
  ): Promise<void> {
    await this.logEvent({
      type: 'game_state_change',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        changeType,
        previousState: {
          gameWon: !gameState.gameWon,
          gameOver: !gameState.gameOver
        },
        speedState: gameState.speedState
      }
    });
  }

  async logRestartGame(
    gameState: GameEvent['gameState'],
    ballPositions: GameEvent['ballPositions'],
    paddlePosition: GameEvent['paddlePosition']
  ): Promise<void> {
    await this.logEvent({
      type: 'restart_game',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        previousGameId: this.currentGameId,
        restartTime: Date.now(),
        speedState: gameState.speedState
      }
    });
  }

  // Métodos para recuperar dados
  async getAllEvents(): Promise<GameEvent[]> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const events = request.result.sort((a, b) => a.timestamp - b.timestamp);
        LOG(`📊 Total de eventos recuperados: ${events.length}`);
        resolve(events);
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar eventos:', request.error);
        reject(request.error);
      };
    });
  }

  async getEventsByGameId(gameId: string): Promise<GameEvent[]> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('gameId');
      const request = index.getAll(gameId);

      request.onsuccess = () => {
        const events = request.result.sort((a, b) => a.timestamp - b.timestamp);
        LOG(`📊 Eventos do jogo ${gameId}: ${events.length}`);
        resolve(events);
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar eventos por gameId:', request.error);
        reject(request.error);
      };
    });
  }

  async getEventsByType(type: GameEvent['type']): Promise<GameEvent[]> {
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
        const events = request.result.sort((a, b) => a.timestamp - b.timestamp);
        LOG(`📊 Eventos do tipo ${type}: ${events.length}`);
        resolve(events);
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar eventos por tipo:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecentEvents(limit: number = 100): Promise<GameEvent[]> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
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
          LOG(`📊 Últimos ${events.length} eventos recuperados`);
          resolve(events.reverse());
        }
      };

      request.onerror = () => {
        ERROR('❌ Erro ao recuperar eventos recentes:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllEvents(): Promise<void> {
    if (!this.db) {
      WARN('⚠️ IndexedDB não inicializado');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        LOG('🗑️ Todos os eventos foram removidos do IndexedDB');
        resolve();
      };

      request.onerror = () => {
        ERROR('❌ Erro ao limpar eventos:', request.error);
        reject(request.error);
      };
    });
  }

  async getGameStats(): Promise<GameStatsSummary> {
    const allEvents = await this.getAllEvents();
    const gameEndEvents = allEvents.filter(e => e.type === 'game_end');
    const collisionEvents = allEvents.filter(e => e.type === 'collision');
    const speedReductionEvents = allEvents.filter(
      event => Boolean(event.metadata?.speedReduction)
    );
    const levelCompleteEvents = allEvents.filter(e => e.type === 'level_complete');

    const byType: Record<string, number> = {};
    let totalScore = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let totalGameDuration = 0;
    let totalBricksDestroyed = 0;
    let totalReductionApplied = 0;
    let minSpeedReachedCount = 0;
    let totalLevelDurationMs = 0;

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
      if (event.metadata?.gameDuration) {
        totalGameDuration += Number(event.metadata.gameDuration);
      }
      if (event.metadata?.totalBricksDestroyed) {
        totalBricksDestroyed += Number(event.metadata.totalBricksDestroyed);
      }
    });

    speedReductionEvents.forEach(event => {
      const speedReduction = event.metadata?.speedReduction as SpeedReductionSnapshot | undefined;
      if (!speedReduction) {
        return;
      }

      totalReductionApplied += speedReduction.reductionApplied;
      if (speedReduction.minReached) {
        minSpeedReachedCount++;
      }
    });

    levelCompleteEvents.forEach(event => {
      const speedState = event.metadata?.speedState as SpeedStateSnapshot | undefined;
      if (speedState) {
        totalLevelDurationMs += speedState.elapsedLevelMs;
      }
    });

    const latestSpeedState = [...allEvents]
      .reverse()
      .find(event => event.gameState?.speedState)?.gameState.speedState ?? null;
    const peakBallsByGame: number[] = [];
    let currentPeakBalls = 0;

    [...allEvents]
      .sort((firstEvent, secondEvent) => firstEvent.timestamp - secondEvent.timestamp)
      .forEach(event => {
        if (event.type === 'game_start') {
          if (currentPeakBalls > 0) {
            peakBallsByGame.push(currentPeakBalls);
          }
          currentPeakBalls = event.gameState.ballsCount;
          return;
        }

        currentPeakBalls = Math.max(currentPeakBalls, event.gameState.ballsCount);

        if (event.type === 'game_end' && currentPeakBalls > 0) {
          peakBallsByGame.push(currentPeakBalls);
          currentPeakBalls = 0;
        }
      });

    if (currentPeakBalls > 0) {
      peakBallsByGame.push(currentPeakBalls);
    }
    const totalPeakBalls = peakBallsByGame.reduce((total, peakBalls) => total + peakBalls, 0);

    return {
      totalGames: gameEndEvents.length,
      totalEvents: allEvents.length,
      byType,
      averageScore: gameEndEvents.length > 0 ? totalScore / gameEndEvents.length : 0,
      gamesWon,
      gamesLost,
      averageGameDuration: gameEndEvents.length > 0 ? totalGameDuration / gameEndEvents.length : 0,
      totalBricksDestroyed,
      totalCollisions: collisionEvents.length,
      averageBallsPerGame: peakBallsByGame.length > 0 ? totalPeakBalls / peakBallsByGame.length : 0,
      latestSpeedState,
      totalSpeedReductions: speedReductionEvents.length,
      averageReductionApplied: speedReductionEvents.length > 0 ? totalReductionApplied / speedReductionEvents.length : 0,
      minSpeedReachedCount,
      averageLevelDurationMs: levelCompleteEvents.length > 0 ? totalLevelDurationMs / levelCompleteEvents.length : 0
    };
  }

  // Método para exportar dados em JSON
  async exportGameData(): Promise<string> {
    const allEvents = await this.getAllEvents();
    const stats = await this.getGameStats();

    const exportData = {
      exportTimestamp: Date.now(),
      exportVersion: '2.1',
      stats,
      events: allEvents
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Método para importar dados em JSON
  async importGameData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);

      if (importData.events && Array.isArray(importData.events)) {
        for (const event of importData.events) {
          await this.logEvent(event);
        }
        LOG(`📊 Importados ${importData.events.length} eventos`);
      }
    } catch (error) {
      ERROR('❌ Erro ao importar dados:', error);
      throw error;
    }
  }
}

// Instância singleton
export const gameLogger = new GameLogger();

LOG('📦 Instância do GameLogger criada');

// Inicializar automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
  LOG('📦 DOM ainda carregando, aguardando DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    LOG('🚀 Inicializando GameLogger (DOMContentLoaded)...');
    gameLogger.initialize().then(() => {
      LOG('✅ GameLogger inicializado com sucesso!');
    }).catch(error => {
      ERROR('❌ Falha ao inicializar GameLogger:', error);
    });
  });
} else {
  // DOM já está pronto
  LOG('🚀 Inicializando GameLogger (DOM já pronto)...');
  gameLogger.initialize().then(() => {
    LOG('✅ GameLogger inicializado com sucesso!');
  }).catch(error => {
    ERROR('❌ Falha ao inicializar GameLogger:', error);
  });
}
