// src/utils/localAppReset.test.ts
import {
  refreshAppAfterLocalReset,
  resetLocalAppState,
} from "./localAppReset";
import { resetScores } from "../storage/score";
import { debugLogger } from "../storage/debugLogger";
import { gameLogger } from "../storage/gameLogger";
import { collisionTracker } from "./collisionTracker";

jest.mock("../storage/score", () => ({
  resetScores: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../storage/debugLogger", () => ({
  debugLogger: { clearAllLogs: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("../storage/gameLogger", () => ({
  gameLogger: { clearAllEvents: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock("./collisionTracker", () => ({
  collisionTracker: { clearAllCollisions: jest.fn().mockResolvedValue(undefined) },
}));

function createStorageMock() {
  return {
    clear: jest.fn(),
  } as unknown as Storage;
}

describe("local app reset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("limpa armazenamentos do navegador e dados locais do jogo", async () => {
    const localStorage = createStorageMock();
    const sessionStorage = createStorageMock();
    const resetScoreStore = jest.fn().mockResolvedValue(undefined);
    const clearGameEvents = jest.fn().mockResolvedValue(undefined);
    const clearCollisions = jest.fn().mockResolvedValue(undefined);
    const clearDebugLogs = jest.fn().mockResolvedValue(undefined);

    await resetLocalAppState({
      windowRef: { localStorage, sessionStorage },
      resetScoreStore,
      clearGameEvents,
      clearCollisions,
      clearDebugLogs,
    });

    expect(localStorage.clear).toHaveBeenCalledTimes(1);
    expect(sessionStorage.clear).toHaveBeenCalledTimes(1);
    expect(resetScoreStore).toHaveBeenCalledTimes(1);
    expect(clearGameEvents).toHaveBeenCalledTimes(1);
    expect(clearCollisions).toHaveBeenCalledTimes(1);
    expect(clearDebugLogs).toHaveBeenCalledTimes(1);
  });

  it("usa limpadores padrão quando dependências de dados não são injetadas", async () => {
    const localStorage = createStorageMock();
    const sessionStorage = createStorageMock();

    await resetLocalAppState({
      windowRef: { localStorage, sessionStorage },
    });

    expect(resetScores).toHaveBeenCalledTimes(1);
    expect(gameLogger.clearAllEvents).toHaveBeenCalledTimes(1);
    expect(collisionTracker.clearAllCollisions).toHaveBeenCalledTimes(1);
    expect(debugLogger.clearAllLogs).toHaveBeenCalledTimes(1);
  });

  it("atualiza o app e volta para a rota padrão", async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const getRegistration = jest.fn().mockResolvedValue({ update });
    const replace = jest.fn();

    await refreshAppAfterLocalReset({
      windowRef: {
        location: { replace },
        navigator: {
          serviceWorker: { getRegistration },
        },
      } as unknown as Window,
    });

    expect(getRegistration).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("recarrega mesmo quando a busca de atualização falha", async () => {
    const getRegistration = jest.fn().mockRejectedValue(new Error("offline"));
    const replace = jest.fn();

    await refreshAppAfterLocalReset({
      windowRef: {
        location: { replace },
        navigator: {
          serviceWorker: { getRegistration },
        },
      } as unknown as Window,
    });

    expect(replace).toHaveBeenCalledWith("/");
  });
});
