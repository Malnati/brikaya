// public/sw.js

const CACHE_NAME = 'breakout-cache';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/sw.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/components/Game.tsx',
  '/src/hooks/useGameLoop.ts',
  '/src/logic/GameEngine.ts',
  '/src/objects/Ball.ts',
  '/src/objects/Paddle.ts',
  '/src/objects/Bricks.ts',
  '/src/registerServiceWorker.ts'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
