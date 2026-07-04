// src/utils/collisionTracker.test.ts
import { collisionTracker } from "./collisionTracker";
import { WARN } from "./logger";

jest.mock("./logger", () => ({
  ERROR: jest.fn(),
  LOG: jest.fn(),
  WARN: jest.fn(),
}));

function createClearIndexedDbMock() {
  const mockStore = {
    clear: jest.fn(() => {
      const request = {
        onsuccess: null,
        onerror: null,
        error: null,
      } as IDBRequest;

      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess(new Event("success") as any);
        }
      }, 0);

      return request;
    }),
  };
  const mockDb = {
    transaction: jest.fn(() => ({
      objectStore: jest.fn(() => mockStore),
    })),
  };

  return { mockDb, mockStore };
}

describe("collisionTracker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (collisionTracker as any).db = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (collisionTracker as any).db = null;
  });

  it("inicializa antes de limpar colisões quando o banco ainda não está pronto", async () => {
    const indexedDbMock = createClearIndexedDbMock();
    const initializeSpy = jest
      .spyOn(collisionTracker as any, "initialize")
      .mockImplementation(async () => {
        (collisionTracker as any).db = indexedDbMock.mockDb;
      });

    await collisionTracker.clearAllCollisions();

    expect(initializeSpy).toHaveBeenCalledTimes(1);
    expect(indexedDbMock.mockStore.clear).toHaveBeenCalledTimes(1);
  });

  it("avisa e encerra quando inicialização não entrega banco", async () => {
    const initializeSpy = jest
      .spyOn(collisionTracker as any, "initialize")
      .mockResolvedValue(undefined);

    await collisionTracker.clearAllCollisions();

    expect(initializeSpy).toHaveBeenCalledTimes(1);
    expect(WARN).toHaveBeenCalledWith("⚠️ IndexedDB não inicializado");
  });
});
