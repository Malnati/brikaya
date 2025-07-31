// src/registerServiceWorker.ts

const SERVICE_WORKER_PATH = '/sw.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  });
}
