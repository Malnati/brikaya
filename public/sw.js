// public/sw.js
const CACHE_NAME = 'breakout-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/sw.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/ballGrey.png',
  '/assets/paddle.png',
  '/assets/brick_blue.png',
  '/assets/brick_green.png',
  '/assets/brick_purple.png',
  '/assets/brick_red.png',
  '/assets/brick_yellow.png'
];
const GET_METHOD = 'GET';
const DOCUMENT_DESTINATION = 'document';
const INDEX_URL = '/index.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== GET_METHOD) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        const requestUrl = new URL(event.request.url);
        const shouldCacheResponse =
          requestUrl.origin === self.location.origin && networkResponse.ok;

        if (shouldCacheResponse) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }

        return networkResponse;
      }).catch(() => {
        if (event.request.destination === DOCUMENT_DESTINATION) {
          return caches.match(INDEX_URL);
        }
      });
    })
  );
});
