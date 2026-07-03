// src/registerServiceWorker.ts
import { LOG } from "./utils/logger";

const SERVICE_WORKER_PATH = "/sw.js";
const SERVICE_WORKER_SCOPE = "/";
const SERVICE_WORKER_UPDATE_VIA_CACHE = "none";
const LOAD_EVENT_NAME = "load";
const PAGE_SHOW_EVENT_NAME = "pageshow";
const FOCUS_EVENT_NAME = "focus";
const VISIBILITY_CHANGE_EVENT_NAME = "visibilitychange";
const UPDATE_FOUND_EVENT_NAME = "updatefound";
const STATE_CHANGE_EVENT_NAME = "statechange";
const CONTROLLER_CHANGE_EVENT_NAME = "controllerchange";
const MESSAGE_EVENT_NAME = "message";
const INSTALLING_STATE = "installing";
const INSTALLED_STATE = "installed";
const ACTIVATED_STATE = "activated";
const VISIBLE_STATE = "visible";
const SKIP_WAITING_MESSAGE_TYPE = "SKIP_WAITING";
const RELOAD_CLIENT_MESSAGE_TYPE = "RELOAD_CLIENT";
export const BRICKBREAKER_OFFLINE_READY_EVENT = "brickbreaker-offline-ready";
export const BRICKBREAKER_UPDATE_PROGRESS_EVENT =
  "brickbreaker-update-progress";
export const BRICKBREAKER_UPDATE_INSTALLED_KEY =
  "brickbreaker-update-installed-version";
export const BRICKBREAKER_RELOAD_GUARD_KEY =
  "brickbreaker-sw-controller-reload";
const RELOAD_GUARD_VALUE = "pending";
const RELOAD_GUARD_RESET_DELAY_MS = 1000;
const UPDATE_RELOAD_DELAY_MS = 900;
const POST_REGISTRATION_UPDATE_DELAYS_MS = [1000, 3000, 10000];
const SERVICE_WORKER_UNAVAILABLE_MESSAGE =
  "Service Worker indisponível neste navegador.";
const SERVICE_WORKER_REGISTERED_MESSAGE = "Service Worker registrado.";
const SERVICE_WORKER_REGISTRATION_FAILED_MESSAGE =
  "Falha ao registrar Service Worker.";
const SERVICE_WORKER_UPDATE_FAILED_MESSAGE =
  "Falha ao verificar atualização do Service Worker.";
const UPDATE_PROGRESS_FOUND = 32;
const UPDATE_PROGRESS_INSTALLING = 55;
const UPDATE_PROGRESS_INSTALLED = 84;
const UPDATE_PROGRESS_ACTIVATED = 96;
const UPDATE_PROGRESS_RELOADING = 100;
const UPDATE_STAGE_FOUND = "found";
const UPDATE_STAGE_INSTALLING = "installing";
const UPDATE_STAGE_INSTALLED = "installed";
const UPDATE_STAGE_ACTIVATED = "activated";
const UPDATE_STAGE_RELOADING = "reloading";

const boundUpdateRegistrations = new WeakSet<ServiceWorkerRegistration>();
const boundControllerContainers = new WeakSet<ServiceWorkerContainer>();
const boundInstallingWorkers = new WeakSet<ServiceWorker>();

export interface BrickbreakerUpdateProgressDetail {
  stage: string;
  progress: number;
}

interface RegisterServiceWorkerOptions {
  windowRef?: Window;
  navigatorRef?: Navigator;
  reloadPage?: () => void;
  log?: (message: string, ...args: unknown[]) => void;
}

function hasServiceWorker(
  navigatorRef: Navigator,
): navigatorRef is Navigator & { serviceWorker: ServiceWorkerContainer } {
  return "serviceWorker" in navigatorRef;
}

function runAfterLoad(windowRef: Window, callback: () => void) {
  if (windowRef.document.readyState === "complete") {
    callback();
    return;
  }

  windowRef.addEventListener(LOAD_EVENT_NAME, callback, { once: true });
}

function getReloadGuard(windowRef: Window) {
  try {
    return windowRef.sessionStorage.getItem(BRICKBREAKER_RELOAD_GUARD_KEY);
  } catch {
    return null;
  }
}

function setReloadGuard(windowRef: Window) {
  try {
    windowRef.sessionStorage.setItem(
      BRICKBREAKER_RELOAD_GUARD_KEY,
      RELOAD_GUARD_VALUE,
    );
  } catch {}
}

function clearReloadGuard(windowRef: Window) {
  try {
    windowRef.sessionStorage.removeItem(BRICKBREAKER_RELOAD_GUARD_KEY);
  } catch {}
}

function markInstalledVersion(windowRef: Window) {
  try {
    windowRef.sessionStorage.setItem(
      BRICKBREAKER_UPDATE_INSTALLED_KEY,
      RELOAD_GUARD_VALUE,
    );
  } catch {}
}

function dispatchUpdateProgress(
  windowRef: Window,
  detail: BrickbreakerUpdateProgressDetail,
) {
  windowRef.dispatchEvent(
    new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, { detail }),
  );
}

function requestUpdate(
  windowRef: Window,
  registration: ServiceWorkerRegistration,
  serviceWorker: ServiceWorkerContainer,
  log: RegisterServiceWorkerOptions["log"],
) {
  registration
    .update()
    .then(() => handleInstalledWorker(windowRef, registration, serviceWorker))
    .catch((error) => {
      log?.(SERVICE_WORKER_UPDATE_FAILED_MESSAGE, error);
    });
}

function dispatchOfflineReady(windowRef: Window) {
  windowRef.dispatchEvent(new CustomEvent(BRICKBREAKER_OFFLINE_READY_EVENT));
}

function postSkipWaiting(worker: ServiceWorker) {
  worker.postMessage({ type: SKIP_WAITING_MESSAGE_TYPE });
}

function postSkipWaitingWhenInstalled(
  windowRef: Window,
  worker: ServiceWorker | null,
  serviceWorker: ServiceWorkerContainer,
) {
  const hasActiveController = Boolean(serviceWorker.controller);

  if (!hasActiveController || !worker) {
    return;
  }

  dispatchUpdateProgress(windowRef, {
    stage: UPDATE_STAGE_FOUND,
    progress: UPDATE_PROGRESS_FOUND,
  });
  postSkipWaiting(worker);

  if (worker.state === INSTALLED_STATE) {
    dispatchUpdateProgress(windowRef, {
      stage: UPDATE_STAGE_INSTALLED,
      progress: UPDATE_PROGRESS_INSTALLED,
    });
    return;
  }

  if (boundInstallingWorkers.has(worker)) {
    return;
  }

  boundInstallingWorkers.add(worker);
  worker.addEventListener(STATE_CHANGE_EVENT_NAME, () => {
    if (worker.state === INSTALLING_STATE) {
      dispatchUpdateProgress(windowRef, {
        stage: UPDATE_STAGE_INSTALLING,
        progress: UPDATE_PROGRESS_INSTALLING,
      });
    }

    if (worker.state === INSTALLED_STATE) {
      dispatchUpdateProgress(windowRef, {
        stage: UPDATE_STAGE_INSTALLED,
        progress: UPDATE_PROGRESS_INSTALLED,
      });
      postSkipWaiting(worker);
    }

    if (worker.state === ACTIVATED_STATE) {
      dispatchUpdateProgress(windowRef, {
        stage: UPDATE_STAGE_ACTIVATED,
        progress: UPDATE_PROGRESS_ACTIVATED,
      });
    }
  });
}

function handleInstalledWorker(
  windowRef: Window,
  registration: ServiceWorkerRegistration,
  serviceWorker: ServiceWorkerContainer,
) {
  postSkipWaitingWhenInstalled(
    windowRef,
    registration.waiting || registration.installing,
    serviceWorker,
  );
}

function bindInstalledWorkerListener(
  windowRef: Window,
  registration: ServiceWorkerRegistration,
  serviceWorker: ServiceWorkerContainer,
) {
  registration.addEventListener(UPDATE_FOUND_EVENT_NAME, () => {
    postSkipWaitingWhenInstalled(
      windowRef,
      registration.installing,
      serviceWorker,
    );
  });
}

function bindRuntimeUpdateChecks(
  windowRef: Window,
  registration: ServiceWorkerRegistration,
  serviceWorker: ServiceWorkerContainer,
  log: RegisterServiceWorkerOptions["log"],
) {
  if (boundUpdateRegistrations.has(registration)) {
    return;
  }

  boundUpdateRegistrations.add(registration);
  const checkForUpdate = () =>
    requestUpdate(windowRef, registration, serviceWorker, log);

  windowRef.addEventListener(PAGE_SHOW_EVENT_NAME, checkForUpdate);
  windowRef.addEventListener(FOCUS_EVENT_NAME, checkForUpdate);
  windowRef.document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, () => {
    if (windowRef.document.visibilityState === VISIBLE_STATE) {
      checkForUpdate();
    }
  });

  for (const delayMs of POST_REGISTRATION_UPDATE_DELAYS_MS) {
    windowRef.setTimeout(checkForUpdate, delayMs);
  }
}

function reloadAfterUpdate(windowRef: Window, reloadPage: () => void) {
  if (getReloadGuard(windowRef) === RELOAD_GUARD_VALUE) {
    return;
  }

  setReloadGuard(windowRef);
  markInstalledVersion(windowRef);
  dispatchUpdateProgress(windowRef, {
    stage: UPDATE_STAGE_RELOADING,
    progress: UPDATE_PROGRESS_RELOADING,
  });
  windowRef.setTimeout(reloadPage, UPDATE_RELOAD_DELAY_MS);
}

function bindControllerReload(
  windowRef: Window,
  serviceWorker: ServiceWorkerContainer,
  reloadPage: () => void,
  shouldReloadOnControllerChange: boolean,
) {
  if (boundControllerContainers.has(serviceWorker)) {
    return;
  }

  boundControllerContainers.add(serviceWorker);
  serviceWorker.addEventListener(CONTROLLER_CHANGE_EVENT_NAME, () => {
    if (!shouldReloadOnControllerChange) {
      return;
    }

    reloadAfterUpdate(windowRef, reloadPage);
  });

  serviceWorker.addEventListener(MESSAGE_EVENT_NAME, (event) => {
    if (event.data?.type === RELOAD_CLIENT_MESSAGE_TYPE) {
      reloadAfterUpdate(windowRef, reloadPage);
    }
  });
}

export function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {},
) {
  const windowRef = options.windowRef || window;
  const navigatorRef = options.navigatorRef || navigator;
  const log = options.log || LOG;
  const reloadPage =
    options.reloadPage || (() => windowRef.location.reload());

  if (!hasServiceWorker(navigatorRef)) {
    log(SERVICE_WORKER_UNAVAILABLE_MESSAGE);
    return;
  }

  const serviceWorker = navigatorRef.serviceWorker;
  const hadControllerAtRegistration = Boolean(serviceWorker.controller);

  runAfterLoad(windowRef, () => {
    serviceWorker
      .register(SERVICE_WORKER_PATH, {
        scope: SERVICE_WORKER_SCOPE,
        updateViaCache: SERVICE_WORKER_UPDATE_VIA_CACHE,
      })
      .then((registration) => {
        log(SERVICE_WORKER_REGISTERED_MESSAGE, registration.scope);
        windowRef.setTimeout(
          () => clearReloadGuard(windowRef),
          RELOAD_GUARD_RESET_DELAY_MS,
        );
        bindControllerReload(
          windowRef,
          serviceWorker,
          reloadPage,
          hadControllerAtRegistration,
        );
        bindInstalledWorkerListener(windowRef, registration, serviceWorker);
        bindRuntimeUpdateChecks(windowRef, registration, serviceWorker, log);
        handleInstalledWorker(windowRef, registration, serviceWorker);
        requestUpdate(windowRef, registration, serviceWorker, log);
        serviceWorker.ready
          .then(() => dispatchOfflineReady(windowRef))
          .catch((error) => log?.(SERVICE_WORKER_UPDATE_FAILED_MESSAGE, error));
      })
      .catch((error) => {
        log(SERVICE_WORKER_REGISTRATION_FAILED_MESSAGE, error);
      });
  });
}
