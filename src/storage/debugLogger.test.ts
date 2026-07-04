// src/storage/debugLogger.test.ts
import { jest } from '@jest/globals';

function hasUnsafeValue(value: unknown, visited = new Set<unknown>()): boolean {
  if (typeof value === 'function' || typeof value === 'symbol') {
    return true;
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  if (visited.has(value)) {
    return true;
  }

  visited.add(value);
  return Array.isArray(value)
    ? value.some(item => hasUnsafeValue(item, visited))
    : Object.values(value as Record<string, unknown>).some(item => hasUnsafeValue(item, visited));
}

function createDebugIndexedDbMock() {
  const storedEntries: any[] = [];
    const mockStore = {
      add: jest.fn((entry: any) => {
        if (hasUnsafeValue(entry.args)) {
          throw new DOMException('Value could not be cloned.', 'DataCloneError');
        }

      storedEntries.push(entry);
      const request = {
        onsuccess: null,
        onerror: null,
        error: null,
      } as IDBRequest;

      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess(new Event('success') as any);
        }
      }, 0);

        return request;
      }),
      clear: jest.fn(() => {
        const request = {
          onsuccess: null,
          onerror: null,
          error: null,
        } as IDBRequest;

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess(new Event('success') as any);
          }
        }, 0);

        return request;
      }),
    };
  const mockDb = {
    objectStoreNames: {
      contains: jest.fn(() => true),
    },
    transaction: jest.fn(() => ({
      objectStore: jest.fn(() => mockStore),
    })),
  };

  return { mockDb, mockStore, storedEntries };
}

describe('DebugLogger', () => {
  let warnSpy: jest.SpiedFunction<typeof console.warn>;
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.resetModules();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('serializa argumentos não clonáveis antes de gravar no IndexedDB', async () => {
    const indexedDbMock = createDebugIndexedDbMock();
    const circular: Record<string, unknown> = { label: 'circular' };
    circular.self = circular;
    Object.defineProperty(global, 'indexedDB', {
      configurable: true,
      value: {
        open: jest.fn(() => ({
          result: indexedDbMock.mockDb,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
          error: null,
        })),
      },
    });
    const { debugLogger } = await import('./debugLogger');
    (debugLogger as any).db = indexedDbMock.mockDb;

    await debugLogger.log('teste seguro', () => 'não clonável', circular);

    expect(indexedDbMock.mockStore.add).toHaveBeenCalledTimes(1);
    expect(indexedDbMock.storedEntries[0].args).toEqual([
      '[Function]',
      { label: 'circular', self: '[Circular]' },
    ]);
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Falha ao armazenar log no IndexedDB:'),
      expect.anything(),
    );
  });

  it('inicializa antes de limpar logs quando o banco ainda não está pronto', async () => {
    const indexedDbMock = createDebugIndexedDbMock();
    const { debugLogger } = await import('./debugLogger');
    (debugLogger as any).db = null;
    const initializeSpy = jest
      .spyOn(debugLogger as any, 'initialize')
      .mockImplementation(async () => {
        (debugLogger as any).db = indexedDbMock.mockDb;
      });

    await debugLogger.clearAllLogs();

    expect(initializeSpy).toHaveBeenCalledTimes(1);
    expect(indexedDbMock.mockStore.clear).toHaveBeenCalledTimes(1);
  });
});
