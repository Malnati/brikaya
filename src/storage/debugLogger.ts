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

  // Métodos para recuperar dados
  async getAllEvents(): Promise<LogEntry[]> {
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

  async getEventsByDebugId(gameId: string): Promise<LogEntry[]> {
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

  async getEventsByType(type: LogEntry['level']): Promise<LogEntry[]> {
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

  async getRecentEvents(limit: number = 100): Promise<LogEntry[]> {
    if (!this.db) {
      console.warn('⚠️ IndexedDB não inicializado');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const events: LogEntry[] = [];
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