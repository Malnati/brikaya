// src/storage/debugLogger.ts
import { isRuntimeDiagnosticsEnabled } from '../utils/runtimeDiagnostics';
import { BUILD_VERSION_LABEL } from '../constants/buildVersion';

const FUNCTION_PLACEHOLDER = '[Function]';
const SYMBOL_PLACEHOLDER = '[Symbol]';
const UNDEFINED_PLACEHOLDER = '[Undefined]';
const CIRCULAR_PLACEHOLDER = '[Circular]';
const DEPTH_LIMIT_PLACEHOLDER = '[DepthLimit]';
const BIGINT_SUFFIX = 'n';
const MAX_SERIALIZATION_DEPTH = 5;
const DEFAULT_RECENT_LOG_LIMIT = 100;
const EXPORT_VERSION = '1.0';
const EMPTY_LOG_STATS = {
  totalLogs: 0,
  byLevel: {},
  byHour: {},
  errorRate: 0,
  averageLogsPerMinute: 0
};

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'log' | 'warn' | 'error';
  message: string;
  args: unknown[];
  stack?: string;
  metadata?: Record<string, unknown>;
}

class DebugLogger {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly DB_NAME = 'SystemDebugLog';
  private readonly LOGS_STORE_NAME = 'systemLogs';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;
    if (typeof window === 'undefined' || !window.indexedDB) return;

    this.initPromise = new Promise<void>((resolve) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => resolve();

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.LOGS_STORE_NAME)) {
          const logsStore = db.createObjectStore(this.LOGS_STORE_NAME, { keyPath: 'id' });
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('level', 'level', { unique: false });
          logsStore.createIndex('message', 'message', { unique: false });
        }
      };
    }).finally(() => {
      this.initPromise = null;
    });

    await this.initPromise;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private serializeLogArgument(
    value: unknown,
    visited: WeakSet<object> = new WeakSet<object>(),
    depth = 0
  ): unknown {
    if (typeof value === 'function') return FUNCTION_PLACEHOLDER;
    if (typeof value === 'symbol') return SYMBOL_PLACEHOLDER;
    if (typeof value === 'undefined') return UNDEFINED_PLACEHOLDER;
    if (typeof value === 'bigint') return `${value.toString()}${BIGINT_SUFFIX}`;
    if (value === null || typeof value !== 'object') return value;
    if (depth >= MAX_SERIALIZATION_DEPTH) return DEPTH_LIMIT_PLACEHOLDER;
    if (visited.has(value)) return CIRCULAR_PLACEHOLDER;

    visited.add(value);

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    if (Array.isArray(value)) {
      return value.map(item => this.serializeLogArgument(item, visited, depth + 1));
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        this.serializeLogArgument(item, visited, depth + 1)
      ])
    );
  }

  async log(message: string, ...args: unknown[]): Promise<void> {
    await this.storeLog('log', message, args);
  }

  async warn(message: string, ...args: unknown[]): Promise<void> {
    await this.storeLog('warn', message, args);
  }

  async error(message: string, ...args: unknown[]): Promise<void> {
    await this.storeLog('error', message, args);
  }

  private async storeLog(level: 'log' | 'warn' | 'error', message: string, args: unknown[]): Promise<void> {
    if (!this.db) return;

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      message,
      args: args.map(arg => this.serializeLogArgument(arg)),
      stack: new Error().stack,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        buildVersion: BUILD_VERSION_LABEL,
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
    } catch {}
  }

  async getAllLogs(): Promise<LogEntry[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result.sort((a, b) => a.timestamp - b.timestamp));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getLogsByLevel(level: 'log' | 'warn' | 'error'): Promise<LogEntry[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const index = store.index('level');
      const request = index.getAll(level);

      request.onsuccess = () => {
        resolve(request.result.sort((a, b) => a.timestamp - b.timestamp));
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getRecentLogs(limit: number = DEFAULT_RECENT_LOG_LIMIT): Promise<LogEntry[]> {
    if (!this.db) return [];

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
          resolve(logs.reverse());
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async searchLogs(searchTerm: string): Promise<LogEntry[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const filteredLogs = request.result.filter((log: LogEntry) =>
          log.message.toLowerCase().includes(normalizedSearchTerm) ||
          log.args.some((arg: unknown) => String(arg).toLowerCase().includes(normalizedSearchTerm))
        ).sort((a, b) => a.timestamp - b.timestamp);
        resolve(filteredLogs);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearAllLogs(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.LOGS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.LOGS_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
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
    if (allLogs.length === 0) return { ...EMPTY_LOG_STATS };

    const byLevel: Record<string, number> = {};
    const byHour: Record<number, number> = {};
    let totalErrors = 0;

    allLogs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      const hour = new Date(log.timestamp).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
      if (log.level === 'error') totalErrors++;
    });

    const timeSpan = allLogs.length > 1
      ? (allLogs[allLogs.length - 1].timestamp - allLogs[0].timestamp) / (1000 * 60)
      : 0;

    return {
      totalLogs: allLogs.length,
      byLevel,
      byHour,
      errorRate: (totalErrors / allLogs.length) * 100,
      averageLogsPerMinute: timeSpan > 0 ? allLogs.length / timeSpan : 0
    };
  }

  async exportLogData(): Promise<string> {
    const allLogs = await this.getAllLogs();
    const stats = await this.getLogStats();
    const exportData = {
      exportTimestamp: Date.now(),
      exportVersion: EXPORT_VERSION,
      buildVersion: BUILD_VERSION_LABEL,
      stats,
      logs: allLogs
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importLogData(jsonData: string): Promise<void> {
    const importData = JSON.parse(jsonData);

    if (importData.logs && Array.isArray(importData.logs)) {
      for (const logEntry of importData.logs) {
        await this.storeLog(logEntry.level, logEntry.message, logEntry.args);
      }
    }
  }
}

export async function log(message: string, ...args: unknown[]): Promise<void> {
  return debugLogger.log(message, ...args);
}

export async function warn(message: string, ...args: unknown[]): Promise<void> {
  return debugLogger.warn(message, ...args);
}

export async function error(message: string, ...args: unknown[]): Promise<void> {
  return debugLogger.error(message, ...args);
}

export const debugLogger = new DebugLogger();

if (typeof document !== 'undefined' && isRuntimeDiagnosticsEnabled()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      debugLogger.initialize();
    }, { once: true });
  } else {
    debugLogger.initialize();
  }
}
