// src/registerServiceWorker.ts

const SERVICE_WORKER_PATH = '/sw.js';

// Temporariamente desabilitado para debug
console.log('🚦 registerServiceWorker.ts carregado');

// Desregistrar service worker existente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🗑️ Service Worker desregistrado:', registration);
    }
  });
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register(SERVICE_WORKER_PATH);
//   });
// }
