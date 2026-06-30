// src/registerServiceWorker.ts
import { LOG } from './utils/logger';

const SERVICE_WORKER_PATH = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';
const LOAD_EVENT_NAME = 'load';
const SERVICE_WORKER_UNAVAILABLE_MESSAGE = 'Service Worker indisponível neste navegador.';
const SERVICE_WORKER_REGISTERED_MESSAGE = 'Service Worker registrado.';
const SERVICE_WORKER_REGISTRATION_FAILED_MESSAGE = 'Falha ao registrar Service Worker.';

if ('serviceWorker' in navigator) {
  window.addEventListener(LOAD_EVENT_NAME, () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: SERVICE_WORKER_SCOPE })
      .then(registration => {
        LOG(SERVICE_WORKER_REGISTERED_MESSAGE, registration.scope);
      })
      .catch(error => {
        LOG(SERVICE_WORKER_REGISTRATION_FAILED_MESSAGE, error);
      });
  });
} else {
  LOG(SERVICE_WORKER_UNAVAILABLE_MESSAGE);
}
