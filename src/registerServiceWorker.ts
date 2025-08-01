// src/registerServiceWorker.ts
import { LOG } from './utils/logger';
// const SERVICE_WORKER_PATH = '/sw.js';

// Temporariamente desabilitado para debug
LOG('🚦 registerServiceWorker.ts carregado');

// Desregistrar service worker existente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      LOG('🗑️ Service Worker desregistrado:', registration);
    }
  });
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register(SERVICE_WORKER_PATH);
//   });
// }
