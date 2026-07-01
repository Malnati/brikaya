// public/sw.js
const BUILD_ID = "__BRICKBREAKER_BUILD_ID__";
const CACHE_PREFIX = "breakout-cache";
const CACHE_NAME = `${CACHE_PREFIX}-${BUILD_ID}`;
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/assets/ballGrey.png",
  "/assets/paddle.png",
  "/assets/brick_blue.png",
  "/assets/brick_green.png",
  "/assets/brick_purple.png",
  "/assets/brick_red.png",
  "/assets/brick_yellow.png",
];
const GET_METHOD = "GET";
const DOCUMENT_DESTINATION = "document";
const INDEX_URL = "/index.html";
const SERVICE_WORKER_URL = "/sw.js";
const WINDOW_CLIENT_TYPE = "window";
const SKIP_WAITING_MESSAGE = "SKIP_WAITING";
const GET_VERSION_MESSAGE = "GET_VERSION";
const VERSION_MESSAGE = "VERSION";
const RELOAD_CLIENT_MESSAGE = "RELOAD_CLIENT";

function isSameOriginRequest(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isServiceWorkerRequest(request) {
  const requestUrl = new URL(request.url);
  return (
    requestUrl.origin === self.location.origin &&
    requestUrl.pathname === SERVICE_WORKER_URL
  );
}

async function deleteOldCaches() {
  const cacheNames = await caches.keys();
  const oldCacheNames = cacheNames.filter((cacheName) => {
    return cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME;
  });

  await Promise.all(oldCacheNames.map((cacheName) => caches.delete(cacheName)));
  return oldCacheNames.length > 0;
}

async function reloadSameOriginClients() {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: WINDOW_CLIENT_TYPE,
  });

  await Promise.all(
    clients.map((client) => {
      const clientUrl = new URL(client.url);

      if (clientUrl.origin !== self.location.origin) {
        return undefined;
      }

      if (typeof client.navigate === "function") {
        return client.navigate(client.url);
      }

      client.postMessage({ type: RELOAD_CLIENT_MESSAGE, buildId: BUILD_ID });
      return undefined;
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const hadOldCache = await deleteOldCaches();
      await self.clients.claim();

      if (hadOldCache) {
        await reloadSameOriginClients();
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  const messageType = event.data?.type;

  if (messageType === SKIP_WAITING_MESSAGE) {
    self.skipWaiting();
    return;
  }

  if (messageType === GET_VERSION_MESSAGE && event.source) {
    event.source.postMessage({
      type: VERSION_MESSAGE,
      buildId: BUILD_ID,
      cacheName: CACHE_NAME,
    });
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== GET_METHOD) {
    return;
  }

  if (isServiceWorkerRequest(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const shouldCacheResponse =
            isSameOriginRequest(event.request) && networkResponse.ok;

          if (shouldCacheResponse) {
            const responseClone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
          }

          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === DOCUMENT_DESTINATION) {
            return caches.match(INDEX_URL);
          }
        });
    }),
  );
});
