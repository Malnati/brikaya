// src/storage/debugLogger.ts

console.log('📦 DebugLogger.ts carregado');

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'log' | 'warn' | 'error';
  message: string;
  args: any[];
  stack?: string;
  metadata?: Record<string, any>;
}

interface DebugEvent {
  id: string;
  timestamp: number;
  type: 'game_start' | 'game_end' | 'score_update' | 'ball_lost' | 'ball_added' | 'brick_destroyed' | 'brick_added' | 'paddle_move' | 'collision' | 'power_up' | 'level_complete' | 'game_state_change' | 'restart_game';
  gameState: {
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
  };
  ballPositions: Array<{
    x: number;
    y: number;
    velocity: { dx: number; dy: number };
    radius: number;
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
    collisionAngle?: number; // Ângulo da colisão
    velocityBefore?: { dx: number; dy: number };
    velocityAfter?: { dx: number; dy: number };
  };
  metadata?: Record<string, any>;
}

class DebugLogger {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'BrickBreakerDebugLog';
  private readonly STORE_NAME = 'gameEvents';
  private readonly LOGS_STORE_NAME = 'appLogs';
  private readonly DB_VERSION = 3; // Incrementado para nova versão com logs
  private currentDebugId: string | null = null;
  private gameStartTime: number | null = null;

  constructor() {
    console.log('🏗️ DebugLogger constructor chamado');
  }

  async initialize(): Promise<void> {
    console.log('🏗️ DebugLogger.initialize() chamado - INÍCIO');
    console.log('🏗️ this:', this);
    console.log('🏗️ DB_NAME:', this.DB_NAME);
    console.log('🏗️ DB_VERSION:', this.DB_VERSION);
    
    // Verificar se IndexedDB está disponível
    if (!window.indexedDB) {
      console.error('❌ IndexedDB não está disponível neste navegador');
      throw new Error('IndexedDB não está disponível');
    }
    
    console.log('✅ IndexedDB está disponível');
    
    return new Promise((resolve, reject) => {
      console.log('🗄️ Abrindo IndexedDB:', this.DB_NAME, 'versão:', this.DB_VERSION);
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB para DebugLogger:', request.error);
        console.error('❌ Código do erro:', request.error?.code);
        console.error('❌ Nome do erro:', request.error?.name);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ DebugLogger IndexedDB inicializado com sucesso');
        console.log('🗄️ Database:', this.db);
        console.log('🗄️ Object stores:', this.db.objectStoreNames);
        console.log('🗄️ Version:', this.db.version);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        console.log('🔄 Upgrade necessário do IndexedDB...');
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('🗄️ Versão antiga:', event.oldVersion);
        console.log('🗄️ Versão nova:', event.newVersion);
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          console.log('🏗️ Criando object store:', this.STORE_NAME);
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('gameId', 'gameId', { unique: false });
          store.createIndex('gameStartTime', 'gameStartTime', { unique: false });
          console.log('✅ Store de eventos do jogo criada no IndexedDB');
        } else {
          console.log('✅ Object store já existe:', this.STORE_NAME);
        }

        // Criar store para logs gerais da aplicação
        if (!db.objectStoreNames.contains(this.LOGS_STORE_NAME)) {
          console.log('🏗️ Criando object store para logs:', this.LOGS_STORE_NAME);
          const logsStore = db.createObjectStore(this.LOGS_STORE_NAME, { keyPath: 'id' });
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('level', 'level', { unique: false });
          logsStore.createIndex('message', 'message', { unique: false });
          console.log('✅ Store de logs criada no IndexedDB');
        } else {
          console.log('✅ Object store de logs já existe:', this.LOGS_STORE_NAME);
        }
      };
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDebugId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  async logEvent(event: Omit<DebugEvent, 'id' | 'timestamp'>): Promise<void> {
    console.log('📝 logEvent chamado - INÍCIO');
    console.log('📝 event.type:', event.type);
    console.log('📝 this.db:', this.db);
    console.log('📝 this:', this);
    
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado, pulando registro de evento');
      return;
    }

    const gameEvent: DebugEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    };

    console.log('📝 Evento preparado:', gameEvent.id, gameEvent.type);

    return new Promise((resolve, reject) => {
      console.log('🗄️ Iniciando transação no IndexedDB...');
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const eventToStore = {
        ...gameEvent,
        gameId: this.currentDebugId,
        gameStartTime: this.gameStartTime
      };
      
      console.log('📝 Adicionando evento ao store:', eventToStore.id);
      const request = store.add(eventToStore);

      request.onsuccess = () => {
        console.log(`📊 Evento registrado com sucesso: ${gameEvent.type} (ID: ${gameEvent.id})`);
        // Log detalhado do conteúdo registrado
        console.log('📦 Conteúdo registrado no IndexDB:', JSON.stringify(eventToStore, null, 2));
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao registrar evento:', request.error);
        console.error('❌ Detalhes do erro:', request.error?.message);
        reject(request.error);
      };
    });
  }

  // Funções para logs gerais da aplicação
  async log(message: string, ...args: any[]): Promise<void> {
    await this.storeLog('log', message, args);
  }

  async warn(message: string, ...args: any[]): Promise<void> {
    await this.storeLog('warn', message, args);
  }

  async error(message: string, ...args: any[]): Promise<void> {
    await this.storeLog('error', message, args);
  }

  private async storeLog(level: 'log' | 'warn' | 'error', message: string, args: any[]): Promise<void> {
    if (!this.db) {
      // Se o IndexedDB não estiver inicializado, apenas retorna sem erro
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      message,
      args,
      stack: new Error().stack,
      metadata: {
        gameId: this.currentDebugId,
        gameStartTime: this.gameStartTime,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    try {
      const transaction = this.db.transaction([this.LOGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.add(logEntry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      // Silenciosamente ignora erros de armazenamento de logs para evitar loops infinitos
      console.warn('Falha ao armazenar log no IndexedDB:', error);
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  async logDebugStart(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition']
  ): Promise<void> {
    console.log('🎮 logDebugStart chamado');
    console.log('🎮 gameState:', gameState);
    console.log('🎮 ballPositions:', ballPositions);
    console.log('🎮 paddlePosition:', paddlePosition);
    
    this.currentDebugId = this.generateDebugId();
    this.gameStartTime = Date.now();
    
    await this.logEvent({
      type: 'game_start',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: {
        gameId: this.currentDebugId,
        gameStartTime: this.gameStartTime
      }
    });
  }

  async logDebugEnd(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
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
        gameId: this.currentDebugId,
        gameDuration,
        finalScore: gameState.score,
        totalBricksDestroyed: gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows - gameState.bricksRemaining
      }
    });
    
    this.currentDebugId = null;
    this.gameStartTime = null;
  }

  async logScoreUpdate(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
    pointsAdded: number, 
    reason: string
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
        bricksRemaining: gameState.bricksRemaining
      }
    });
  }

  async logBallLost(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
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
          bricksDestroyed: gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows - gameState.bricksRemaining,
          totalBricks: gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows,
          percentageComplete: ((gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows - gameState.bricksRemaining) / (gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows)) * 100
        }
      }
    });
  }

  async logBallAdded(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
    newBallPosition: { x: number; y: number }
  ): Promise<void> {
    await this.logEvent({
      type: 'ball_added',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { 
        newBallPosition,
        totalBalls: gameState.ballsCount
      }
    });
  }

  async logBrickDestroyed(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'],
    brickPosition: { x: number; y: number; width: number; height: number },
    brickIndex: { col: number; row: number },
    brickColorIndex: number,
    ballPosition: { x: number; y: number },
    ballVelocity: { dx: number; dy: number }
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
        velocityBefore: ballVelocity
      },
      metadata: {
        brickColorIndex,
        brickPosition: brickIndex,
        remainingBricks: gameState.bricksRemaining - 1,
        gameProgress: {
          bricksDestroyed: gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows - gameState.bricksRemaining + 1,
          totalBricks: gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows,
          percentageComplete: ((gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows - gameState.bricksRemaining + 1) / (gameState.gameDimensions.brickCols * gameState.gameDimensions.brickRows)) * 100
        }
      }
    });
  }

  async logBrickAdded(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
    rowAdded: number
  ): Promise<void> {
    await this.logEvent({
      type: 'brick_added',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { 
        rowAdded,
        newTotalBricks: gameState.bricksRemaining + gameState.gameDimensions.brickCols
      }
    });
  }

  async logPaddleMove(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
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
        paddleCenter: paddlePosition.x + paddlePosition.width / 2
      }
    });
  }

  async logCollision(
    gameState: DebugEvent['gameState'],
    ballPositions: DebugEvent['ballPositions'],
    paddlePosition: DebugEvent['paddlePosition'],
    collisionInfo: DebugEvent['collisionInfo']
  ): Promise<void> {
    await this.logEvent({
      type: 'collision',
      gameState,
      ballPositions,
      paddlePosition,
      collisionInfo
    });
  }

  async logLevelComplete(
    gameState: DebugEvent['gameState'], 
    ballPositions: DebugEvent['ballPositions'], 
    paddlePosition: DebugEvent['paddlePosition'], 
    level: number
  ): Promise<void> {
    await this.logEvent({
      type: 'level_complete',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { 
        level,
        levelScore: gameState.score,
        levelDuration: this.gameStartTime ? Date.now() - this.gameStartTime : 0
      }
    });
  }

  async logDebugStateChange(
    gameState: DebugEvent['gameState'],
    ballPositions: DebugEvent['ballPositions'],
    paddlePosition: DebugEvent['paddlePosition'],
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
        }
      }
    });
  }

  async logRestartDebug(
    gameState: DebugEvent['gameState'],
    ballPositions: DebugEvent['ballPositions'],
    paddlePosition: DebugEvent['paddlePosition']
  ): Promise<void> {
    await this.logEvent({
      type: 'restart_game',
      gameState,
      ballPositions,
      paddlePosition,
      metadata: { 
        previousDebugId: this.currentDebugId,
        restartTime: Date.now()
      }
    });
  }

  // Métodos para recuperar dados
  async getAllEvents(): Promise<DebugEvent[]> {
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

  async getEventsByDebugId(gameId: string): Promise<DebugEvent[]> {
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

  async getEventsByType(type: DebugEvent['type']): Promise<DebugEvent[]> {
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

  async getRecentEvents(limit: number = 100): Promise<DebugEvent[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const events: DebugEvent[] = [];
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

  async getDebugStats(): Promise<{
    totalDebugs: number;
    totalEvents: number;
    byType: Record<string, number>;
    averageScore: number;
    gamesWon: number;
    gamesLost: number;
    averageDebugDuration: number;
    totalBricksDestroyed: number;
    totalCollisions: number;
    averageBallsPerDebug: number;
    logStats: {
      totalLogs: number;
      byLevel: Record<string, number>;
      errorRate: number;
      averageLogsPerMinute: number;
    };
  }> {
    const allEvents = await this.getAllEvents();
    const gameEndEvents = allEvents.filter(e => e.type === 'game_end');
    const gameStartEvents = allEvents.filter(e => e.type === 'game_start');
    const collisionEvents = allEvents.filter(e => e.type === 'collision');
    // const brickDestroyedEvents = allEvents.filter(e => e.type === 'brick_destroyed');
    
    const byType: Record<string, number> = {};
    let totalScore = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let totalDebugDuration = 0;
    let totalBricksDestroyed = 0;

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
        totalDebugDuration += event.metadata.gameDuration;
      }
      if (event.metadata?.totalBricksDestroyed) {
        totalBricksDestroyed += event.metadata.totalBricksDestroyed;
      }
    });

    // Obter estatísticas dos logs
    const logStats = await this.getLogStats();

    return {
      totalDebugs: gameEndEvents.length,
      totalEvents: allEvents.length,
      byType,
      averageScore: gameEndEvents.length > 0 ? totalScore / gameEndEvents.length : 0,
      gamesWon,
      gamesLost,
      averageDebugDuration: gameEndEvents.length > 0 ? totalDebugDuration / gameEndEvents.length : 0,
      totalBricksDestroyed,
      totalCollisions: collisionEvents.length,
      averageBallsPerDebug: gameStartEvents.length > 0 ? allEvents.filter(e => e.type === 'ball_lost').length / gameStartEvents.length : 0,
      logStats: {
        totalLogs: logStats.totalLogs,
        byLevel: logStats.byLevel,
        errorRate: logStats.errorRate,
        averageLogsPerMinute: logStats.averageLogsPerMinute
      }
    };
  }

  // Método para exportar dados em JSON
  async exportDebugData(): Promise<string> {
    const allEvents = await this.getAllEvents();
    const allLogs = await this.getAllLogs();
    const stats = await this.getDebugStats();
    
    const exportData = {
      exportTimestamp: Date.now(),
      exportVersion: '3.0',
      stats,
      events: allEvents,
      logs: allLogs
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Método para importar dados em JSON
  async importDebugData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.events && Array.isArray(importData.events)) {
        for (const event of importData.events) {
          await this.logEvent(event);
        }
        console.log(`📊 Importados ${importData.events.length} eventos`);
      }

      if (importData.logs && Array.isArray(importData.logs)) {
        for (const log of importData.logs) {
          await this.storeLog(log.level, log.message, log.args);
        }
        console.log(`📊 Importados ${importData.logs.length} logs`);
      }
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      throw error;
    }
  }

  // Métodos para gerenciar logs gerais da aplicação
  async getAllLogs(): Promise<LogEntry[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const logs = request.result.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`📊 Total de logs recuperados: ${logs.length}`);
        resolve(logs);
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar logs:', request.error);
        reject(request.error);
      };
    });
  }

  async getLogsByLevel(level: 'log' | 'warn' | 'error'): Promise<LogEntry[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const index = store.index('level');
      const request = index.getAll(level);

      request.onsuccess = () => {
        const logs = request.result.sort((a, b) => a.timestamp - b.timestamp);
        console.log(`📊 Logs do nível ${level}: ${logs.length}`);
        resolve(logs);
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar logs por nível:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecentLogs(limit: number = 100): Promise<LogEntry[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const logs: LogEntry[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          logs.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          console.log(`📊 Últimos ${logs.length} logs recuperados`);
          resolve(logs.reverse());
        }
      };

      request.onerror = () => {
        console.error('❌ Erro ao recuperar logs recentes:', request.error);
        reject(request.error);
      };
    });
  }

  async searchLogs(searchTerm: string): Promise<LogEntry[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const allLogs = request.result;
        const filteredLogs = allLogs.filter(log => 
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.args.some((arg: any) => 
            typeof arg === 'string' && arg.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ).sort((a, b) => a.timestamp - b.timestamp);
        
        console.log(`📊 Logs encontrados para "${searchTerm}": ${filteredLogs.length}`);
        resolve(filteredLogs);
      };

      request.onerror = () => {
        console.error('❌ Erro ao buscar logs:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllLogs(): Promise<void> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Todos os logs foram removidos do IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao limpar logs:', request.error);
        reject(request.error);
      };
    });
  }

  async getLogStats(): Promise<{
    totalLogs: number;
    byLevel: Record<string, number>;
    byHour: Record<number, number>;
    errorRate: number;
    averageLogsPerMinute: number;
  }> {
    const allLogs = await this.getAllLogs();
    const byLevel: Record<string, number> = {};
    const byHour: Record<number, number> = {};
    
    let totalErrors = 0;
    let totalWarns = 0;
    let totalLogs = 0;

    allLogs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      
      const hour = new Date(log.timestamp).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;

      if (log.level === 'error') totalErrors++;
      else if (log.level === 'warn') totalWarns++;
      else totalLogs++;
    });

    const totalEntries = allLogs.length;
    const timeSpan = totalEntries > 1 ? 
      (allLogs[allLogs.length - 1].timestamp - allLogs[0].timestamp) / (1000 * 60) : 0;

    return {
      totalLogs: totalEntries,
      byLevel,
      byHour,
      errorRate: totalEntries > 0 ? (totalErrors / totalEntries) * 100 : 0,
      averageLogsPerMinute: timeSpan > 0 ? totalEntries / timeSpan : 0
    };
  }

  async exportLogData(): Promise<string> {
    const allLogs = await this.getAllLogs();
    const stats = await this.getLogStats();
    
    const exportData = {
      exportTimestamp: Date.now(),
      exportVersion: '1.0',
      stats,
      logs: allLogs
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importLogData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.logs && Array.isArray(importData.logs)) {
        for (const log of importData.logs) {
          await this.storeLog(log.level, log.message, log.args);
        }
        console.log(`📊 Importados ${importData.logs.length} logs`);
      }
    } catch (error) {
      console.error('❌ Erro ao importar logs:', error);
      throw error;
    }
  }

}

// Funções estáticas para serem chamadas diretamente pelo logger.ts
export async function log(message: string, ...args: any[]): Promise<void> {
  return gameLogger.log(message, ...args);
}

export async function warn(message: string, ...args: any[]): Promise<void> {
  return gameLogger.warn(message, ...args);
}

export async function error(message: string, ...args: any[]): Promise<void> {
  return gameLogger.error(message, ...args);
}

// Instância singleton
export const gameLogger = new DebugLogger();

console.log('📦 Instância do DebugLogger criada');

// Inicializar automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
  console.log('📦 DOM ainda carregando, aguardando DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando DebugLogger (DOMContentLoaded)...');
    gameLogger.initialize().then(() => {
      console.log('✅ DebugLogger inicializado com sucesso!');
    }).catch(error => {
      console.error('❌ Falha ao inicializar DebugLogger:', error);
    });
  });
} else {
  // DOM já está pronto
  console.log('🚀 Inicializando DebugLogger (DOM já pronto)...');
  gameLogger.initialize().then(() => {
    console.log('✅ DebugLogger inicializado com sucesso!');
  }).catch(error => {
    console.error('❌ Falha ao inicializar DebugLogger:', error);
  });
} 