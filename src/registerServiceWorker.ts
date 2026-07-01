// src/registerServiceWorker.ts
import { LOG } from "./utils/logger";

const SERVICE_WORKER_PATH = "/sw.js";
const SERVICE_WORKER_SCOPE = "/";
const LOAD_EVENT_NAME = "load";
const PAGE_SHOW_EVENT_NAME = "pageshow";
const FOCUS_EVENT_NAME = "focus";
const VISIBILITY_CHANGE_EVENT_NAME = "visibilitychange";
const UPDATE_FOUND_EVENT_NAME = "updatefound";
const STATE_CHANGE_EVENT_NAME = "statechange";
const CONTROLLER_CHANGE_EVENT_NAME = "controllerchange";
const INSTALLED_STATE = "installed";
const VISIBLE_STATE = "visible";
const SKIP_WAITING_MESSAGE_TYPE = "SKIP_WAITING";
const RELOAD_CLIENT_MESSAGE_TYPE = "RELOAD_CLIENT";
const RELOAD_GUARD_KEY = "brickbreaker-sw-controller-reload";
const RELOAD_GUARD_VALUE = "pending";
const RELOAD_GUARD_RESET_DELAY_MS = 1000;
const SERVICE_WORKER_UNAVAILABLE_MESSAGE =
  "Service Worker indisponível neste navegador.";
const SERVICE_WORKER_REGISTERED_MESSAGE = "Service Worker registrado.";
const SERVICE_WORKER_REGISTRATION_FAILED_MESSAGE =
  "Falha ao registrar Service Worker.";
const SERVICE_WORKER_UPDATE_FAILED_MESSAGE =
  "Falha ao verificar atualização do Service Worker.";

const boundUpdateRegistrations = new WeakSet<ServiceWorkerRegistration>();
const boundControllerContainers = new WeakSet<ServiceWorkerContainer>();

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
    return windowRef.sessionStorage.getItem(RELOAD_GUARD_KEY);
  } catch {
    return null;
  }
}

function setReloadGuard(windowRef: Window) {
  try {
    windowRef.sessionStorage.setItem(RELOAD_GUARD_KEY, RELOAD_GUARD_VALUE);
  } catch {}
}

function clearReloadGuard(windowRef: Window) {
  try {
    windowRef.sessionStorage.removeItem(RELOAD_GUARD_KEY);
  } catch {}
}

function requestUpdate(
  registration: ServiceWorkerRegistration,
  log: RegisterServiceWorkerOptions["log"],
) {
  registration.update().catch((error) => {
    log?.(SERVICE_WORKER_UPDATE_FAILED_MESSAGE, error);
  });
}

function postSkipWaiting(worker: ServiceWorker | null) {
  worker?.postMessage({ type: SKIP_WAITING_MESSAGE_TYPE });
}

function handleInstalledWorker(
  registration: ServiceWorkerRegistration,
  serviceWorker: ServiceWorkerContainer,
) {
  const hasActiveController = Boolean(serviceWorker.controller);

  if (!hasActiveController) {
    return;
  }

  postSkipWaiting(registration.waiting || registration.installing);
}

function bindInstalledWorkerListener(
  registration: ServiceWorkerRegistration,
  serviceWorker: ServiceWorkerContainer,
) {
  registration.addEventListener(UPDATE_FOUND_EVENT_NAME, () => {
    const newWorker = registration.installing;

    if (!newWorker) {
      return;
    }

    newWorker.addEventListener(STATE_CHANGE_EVENT_NAME, () => {
      if (newWorker.state === INSTALLED_STATE) {
        handleInstalledWorker(registration, serviceWorker);
      }
    });
  });
}

function bindRuntimeUpdateChecks(
  windowRef: Window,
  registration: ServiceWorkerRegistration,
  log: RegisterServiceWorkerOptions["log"],
) {
  if (boundUpdateRegistrations.has(registration)) {
    return;
  }

  boundUpdateRegistrations.add(registration);
  const checkForUpdate = () => requestUpdate(registration, log);

  windowRef.addEventListener(PAGE_SHOW_EVENT_NAME, checkForUpdate);
  windowRef.addEventListener(FOCUS_EVENT_NAME, checkForUpdate);
  windowRef.document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, () => {
    if (windowRef.document.visibilityState === VISIBLE_STATE) {
      checkForUpdate();
    }
  });
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
    if (
      !shouldReloadOnControllerChange ||
      getReloadGuard(windowRef) === RELOAD_GUARD_VALUE
    ) {
      return;
    }

    setReloadGuard(windowRef);
    reloadPage();
  });

  serviceWorker.addEventListener("message", (event) => {
    if (
      event.data?.type === RELOAD_CLIENT_MESSAGE_TYPE &&
      getReloadGuard(windowRef) !== RELOAD_GUARD_VALUE
    ) {
      setReloadGuard(windowRef);
      reloadPage();
    }
  });
}

export function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {},
) {
  const windowRef = options.windowRef || window;
  const navigatorRef = options.navigatorRef || navigator;
  const log = options.log || LOG;
  const reloadPage = options.reloadPage || (() => windowRef.location.reload());

  if (!hasServiceWorker(navigatorRef)) {
    log(SERVICE_WORKER_UNAVAILABLE_MESSAGE);
    return;
  }

  const serviceWorker = navigatorRef.serviceWorker;
  const hadControllerAtRegistration = Boolean(serviceWorker.controller);

  runAfterLoad(windowRef, () => {
    serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: SERVICE_WORKER_SCOPE })
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
        bindInstalledWorkerListener(registration, serviceWorker);
        bindRuntimeUpdateChecks(windowRef, registration, log);
        handleInstalledWorker(registration, serviceWorker);
        requestUpdate(registration, log);
      })
      .catch((error) => {
        log(SERVICE_WORKER_REGISTRATION_FAILED_MESSAGE, error);
      });
  });
}
