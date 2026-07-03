// src/registerServiceWorker.test.ts
import { registerServiceWorker } from "./registerServiceWorker";

const LOAD_EVENT_NAME = "load";
const PAGE_SHOW_EVENT_NAME = "pageshow";
const FOCUS_EVENT_NAME = "focus";
const VISIBILITY_CHANGE_EVENT_NAME = "visibilitychange";
const UPDATE_FOUND_EVENT_NAME = "updatefound";
const STATE_CHANGE_EVENT_NAME = "statechange";
const CONTROLLER_CHANGE_EVENT_NAME = "controllerchange";
const MESSAGE_EVENT_NAME = "message";
const INSTALLED_STATE = "installed";
const SKIP_WAITING_MESSAGE_TYPE = "SKIP_WAITING";
const RELOAD_CLIENT_MESSAGE_TYPE = "RELOAD_CLIENT";
const UPDATE_PROGRESS_EVENT_NAME = "brickbreaker-update-progress";
const UPDATE_INSTALLED_KEY = "brickbreaker-update-installed-version";
const SERVICE_WORKER_PATH = "/sw.js";
const SERVICE_WORKER_SCOPE = "/";
const SERVICE_WORKER_UPDATE_VIA_CACHE = "none";
const POST_REGISTRATION_UPDATE_DELAYS_MS = [1000, 3000, 10000];
const UPDATE_RELOAD_DELAY_MS = 900;
const FLUSH_PROMISES_COUNT = 3;

type Listener = (event?: Event | MessageEvent) => void;

function flushPromises() {
  return Array.from({ length: FLUSH_PROMISES_COUNT }).reduce(
    (promise) => promise.then(() => Promise.resolve()),
    Promise.resolve(),
  );
}

function emit(
  listeners: Record<string, Listener[]>,
  eventName: string,
  event?: Event | MessageEvent,
) {
  for (const listener of listeners[eventName] || []) {
    listener(event);
  }
}

function createWindowMock(readyState = "complete") {
  const windowListeners: Record<string, Listener[]> = {};
  const documentListeners: Record<string, Listener[]> = {};
  const storage = new Map<string, string>();
  const documentMock = {
    readyState,
    visibilityState: "visible",
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      documentListeners[eventName] = [
        ...(documentListeners[eventName] || []),
        listener,
      ];
    }),
  };
  const windowRef = {
    document: documentMock,
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      windowListeners[eventName] = [
        ...(windowListeners[eventName] || []),
        listener,
      ];
    }),
    dispatchEvent: jest.fn(),
    setTimeout: jest.fn(() => 1),
    sessionStorage: {
      getItem: jest.fn((key: string) => storage.get(key) || null),
      setItem: jest.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: jest.fn((key: string) => storage.delete(key)),
    },
    location: {
      reload: jest.fn(),
    },
  };

  return {
    windowRef: windowRef as unknown as Window,
    windowListeners,
    documentListeners,
    documentMock,
  };
}

function createWorkerMock() {
  const workerListeners: Record<string, Listener[]> = {};
  const worker = {
    state: "installing" as ServiceWorkerState,
    postMessage: jest.fn(),
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      workerListeners[eventName] = [
        ...(workerListeners[eventName] || []),
        listener,
      ];
    }),
  };

  return {
    worker: worker as unknown as ServiceWorker,
    workerListeners,
    setState: (state: ServiceWorkerState) => {
      worker.state = state;
    },
    postMessage: worker.postMessage,
  };
}

function createServiceWorkerMock(controller: ServiceWorker | null = null) {
  const containerListeners: Record<string, Listener[]> = {};
  const registrationListeners: Record<string, Listener[]> = {};
  const registration = {
    scope: SERVICE_WORKER_SCOPE,
    installing: null as ServiceWorker | null,
    waiting: null as ServiceWorker | null,
    update: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      registrationListeners[eventName] = [
        ...(registrationListeners[eventName] || []),
        listener,
      ];
    }),
  };
  const serviceWorker = {
    controller,
    register: jest.fn().mockResolvedValue(registration),
    ready: Promise.resolve(registration),
    addEventListener: jest.fn((eventName: string, listener: Listener) => {
      containerListeners[eventName] = [
        ...(containerListeners[eventName] || []),
        listener,
      ];
    }),
  };

  return {
    navigatorRef: { serviceWorker } as unknown as Navigator,
    serviceWorker,
    registration: registration as unknown as ServiceWorkerRegistration,
    containerListeners,
    registrationListeners,
  };
}

describe("registerServiceWorker", () => {
  it("registra o Service Worker quando a janela já carregou", async () => {
    const { windowRef } = createWindowMock();
    const { navigatorRef, serviceWorker, registration } =
      createServiceWorkerMock();
    const log = jest.fn();

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log,
      reloadPage: jest.fn(),
    });
    await flushPromises();

    expect(serviceWorker.register).toHaveBeenCalledWith(SERVICE_WORKER_PATH, {
      scope: SERVICE_WORKER_SCOPE,
      updateViaCache: SERVICE_WORKER_UPDATE_VIA_CACHE,
    });
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  it("aguarda o evento load antes de registrar quando a janela ainda está carregando", async () => {
    const { windowRef, windowListeners } = createWindowMock("loading");
    const { navigatorRef, serviceWorker } = createServiceWorkerMock();

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage: jest.fn(),
    });
    expect(serviceWorker.register).not.toHaveBeenCalled();

    emit(windowListeners, LOAD_EVENT_NAME, new Event(LOAD_EVENT_NAME));
    await flushPromises();

    expect(serviceWorker.register).toHaveBeenCalledWith(SERVICE_WORKER_PATH, {
      scope: SERVICE_WORKER_SCOPE,
      updateViaCache: SERVICE_WORKER_UPDATE_VIA_CACHE,
    });
  });

  it("verifica atualização ao abrir, focar e voltar a ficar visível", async () => {
    const { windowRef, windowListeners, documentListeners } =
      createWindowMock();
    const { navigatorRef, registration } = createServiceWorkerMock();

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage: jest.fn(),
    });
    await flushPromises();

    emit(
      windowListeners,
      PAGE_SHOW_EVENT_NAME,
      new Event(PAGE_SHOW_EVENT_NAME),
    );
    emit(windowListeners, FOCUS_EVENT_NAME, new Event(FOCUS_EVENT_NAME));
    emit(
      documentListeners,
      VISIBILITY_CHANGE_EVENT_NAME,
      new Event(VISIBILITY_CHANGE_EVENT_NAME),
    );

    expect(registration.update).toHaveBeenCalledTimes(4);
  });

  it("agenda checagens após registro para cobrir abertura com cache antigo", async () => {
    const { windowRef } = createWindowMock();
    const { navigatorRef } = createServiceWorkerMock();

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage: jest.fn(),
    });
    await flushPromises();

    for (const delayMs of POST_REGISTRATION_UPDATE_DELAYS_MS) {
      expect(windowRef.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        delayMs,
      );
    }
  });

  it("envia SKIP_WAITING quando uma nova versão instala com controlador ativo", async () => {
    const { windowRef } = createWindowMock();
    const activeController = createWorkerMock().worker;
    const { navigatorRef, registration, registrationListeners } =
      createServiceWorkerMock(activeController);
    const newWorker = createWorkerMock();
    (registration as unknown as { installing: ServiceWorker }).installing =
      newWorker.worker;

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage: jest.fn(),
    });
    await flushPromises();

    emit(
      registrationListeners,
      UPDATE_FOUND_EVENT_NAME,
      new Event(UPDATE_FOUND_EVENT_NAME),
    );
    expect(windowRef.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_PROGRESS_EVENT_NAME,
        detail: expect.objectContaining({ progress: 32 }),
      }),
    );
    newWorker.setState(INSTALLED_STATE);
    emit(
      newWorker.workerListeners,
      STATE_CHANGE_EVENT_NAME,
      new Event(STATE_CHANGE_EVENT_NAME),
    );

    expect(newWorker.postMessage).toHaveBeenCalledWith({
      type: SKIP_WAITING_MESSAGE_TYPE,
    });
    expect(windowRef.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_PROGRESS_EVENT_NAME,
        detail: expect.objectContaining({ progress: 84 }),
      }),
    );
  });

  it("acompanha worker já instalando quando o registro resolve", async () => {
    const { windowRef } = createWindowMock();
    const activeController = createWorkerMock().worker;
    const { navigatorRef, registration } =
      createServiceWorkerMock(activeController);
    const newWorker = createWorkerMock();
    (registration as unknown as { installing: ServiceWorker }).installing =
      newWorker.worker;

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage: jest.fn(),
    });
    await flushPromises();

    expect(newWorker.postMessage).toHaveBeenCalledWith({
      type: SKIP_WAITING_MESSAGE_TYPE,
    });

    newWorker.postMessage.mockClear();
    newWorker.setState(INSTALLED_STATE);
    emit(
      newWorker.workerListeners,
      STATE_CHANGE_EVENT_NAME,
      new Event(STATE_CHANGE_EVENT_NAME),
    );

    expect(newWorker.postMessage).toHaveBeenCalledWith({
      type: SKIP_WAITING_MESSAGE_TYPE,
    });
  });

  it("ativa worker já em espera quando update resolve com nova versão", async () => {
    const { windowRef } = createWindowMock();
    const activeController = createWorkerMock().worker;
    const { navigatorRef, registration } =
      createServiceWorkerMock(activeController);
    const newWorker = createWorkerMock();
    newWorker.setState(INSTALLED_STATE);
    (registration as unknown as { update: jest.Mock }).update.mockImplementation(
      () => {
        (registration as unknown as { waiting: ServiceWorker }).waiting =
          newWorker.worker;
        return Promise.resolve(registration);
      },
    );

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage: jest.fn(),
    });
    await flushPromises();

    expect(newWorker.postMessage).toHaveBeenCalledWith({
      type: SKIP_WAITING_MESSAGE_TYPE,
    });
  });

  it("recarrega uma única vez quando o controlador muda após versão existente", async () => {
    const reloadPage = jest.fn();
    const { windowRef } = createWindowMock();
    const activeController = createWorkerMock().worker;
    const { navigatorRef, containerListeners } =
      createServiceWorkerMock(activeController);

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage,
    });
    await flushPromises();

    emit(
      containerListeners,
      CONTROLLER_CHANGE_EVENT_NAME,
      new Event(CONTROLLER_CHANGE_EVENT_NAME),
    );
    emit(
      containerListeners,
      CONTROLLER_CHANGE_EVENT_NAME,
      new Event(CONTROLLER_CHANGE_EVENT_NAME),
    );

    expect(windowRef.sessionStorage.setItem).toHaveBeenCalledWith(
      UPDATE_INSTALLED_KEY,
      "pending",
    );
    expect(windowRef.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: UPDATE_PROGRESS_EVENT_NAME,
        detail: expect.objectContaining({ progress: 100 }),
      }),
    );
    const delayedReload = jest
      .mocked(windowRef.setTimeout)
      .mock.calls.find((call) => call[1] === UPDATE_RELOAD_DELAY_MS)?.[0] as
      | (() => void)
      | undefined;

    delayedReload?.();
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("recarrega com progresso quando o Service Worker pede reload", async () => {
    const reloadPage = jest.fn();
    const { windowRef } = createWindowMock();
    const activeController = createWorkerMock().worker;
    const { navigatorRef, containerListeners } =
      createServiceWorkerMock(activeController);

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage,
    });
    await flushPromises();

    emit(
      containerListeners,
      MESSAGE_EVENT_NAME,
      new MessageEvent(MESSAGE_EVENT_NAME, {
        data: { type: RELOAD_CLIENT_MESSAGE_TYPE },
      }),
    );

    const delayedReload = jest
      .mocked(windowRef.setTimeout)
      .mock.calls.find((call) => call[1] === UPDATE_RELOAD_DELAY_MS)?.[0] as
      | (() => void)
      | undefined;

    delayedReload?.();
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("não recarrega no primeiro controle do Service Worker", async () => {
    const reloadPage = jest.fn();
    const { windowRef } = createWindowMock();
    const { navigatorRef, containerListeners } = createServiceWorkerMock();

    registerServiceWorker({
      windowRef,
      navigatorRef,
      log: jest.fn(),
      reloadPage,
    });
    await flushPromises();

    emit(
      containerListeners,
      CONTROLLER_CHANGE_EVENT_NAME,
      new Event(CONTROLLER_CHANGE_EVENT_NAME),
    );

    expect(reloadPage).not.toHaveBeenCalled();
  });

  it("não quebra quando o navegador não suporta Service Worker", () => {
    const log = jest.fn();
    const { windowRef } = createWindowMock();

    expect(() =>
      registerServiceWorker({
        windowRef,
        navigatorRef: {} as Navigator,
        log,
        reloadPage: jest.fn(),
      }),
    ).not.toThrow();
    expect(log).toHaveBeenCalledWith(
      "Service Worker indisponível neste navegador.",
    );
  });
});
