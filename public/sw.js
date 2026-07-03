// public/sw.js
const BUILD_ID = "__BRICKBREAKER_BUILD_ID__";
const CACHE_PREFIX = "breakout-cache";
const CACHE_NAME = `${CACHE_PREFIX}-${BUILD_ID}`;
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/visual/bricks/spr-brick-basic-blue-high-contrast-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-blue-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-blue-sunset-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-green-high-contrast-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-green-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-green-sunset-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-purple-high-contrast-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-purple-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-purple-sunset-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-red-high-contrast-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-red-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-red-sunset-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-yellow-high-contrast-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-yellow-normal.svg",
  "/assets/visual/bricks/spr-brick-basic-yellow-sunset-normal.svg",
  "/assets/visual/powerups/spr-powerup-laser-fan-high-contrast.svg",
  "/assets/visual/powerups/spr-powerup-laser-fan-sunset.svg",
  "/assets/visual/powerups/spr-powerup-laser-fan.svg",
  "/assets/visual/powerups/spr-powerup-multiball-orb-high-contrast.svg",
  "/assets/visual/powerups/spr-powerup-multiball-orb-sunset.svg",
  "/assets/visual/powerups/spr-powerup-multiball-orb.svg",
  "/assets/visual/powerups/spr-powerup-slow-ball-high-contrast.svg",
  "/assets/visual/powerups/spr-powerup-slow-ball-sunset.svg",
  "/assets/visual/powerups/spr-powerup-slow-ball.svg",
  "/assets/visual/powerups/spr-powerup-wide-paddle-high-contrast.svg",
  "/assets/visual/powerups/spr-powerup-wide-paddle-sunset.svg",
  "/assets/visual/powerups/spr-powerup-wide-paddle.svg",
  "/assets/visual/sprites/spr-ball-player-default.svg",
  "/assets/visual/sprites/spr-ball-player-high-contrast-default.svg",
  "/assets/visual/sprites/spr-ball-player-sunset-default.svg",
  "/assets/visual/sprites/spr-paddle-player-default.svg",
  "/assets/visual/sprites/spr-paddle-player-high-contrast-default.svg",
  "/assets/visual/sprites/spr-paddle-player-sunset-default.svg",
  "/assets/visual/ui/ui-app-browser-favicon.svg",
  "/assets/visual/ui/ui-pwa-app-icon.svg",
  "/assets/visual/vfx/vfx-countdown-circle-high-contrast-overlay.svg",
  "/assets/visual/vfx/vfx-countdown-circle-overlay.svg",
  "/assets/visual/vfx/vfx-countdown-circle-sunset-overlay.svg",
  "/assets/visual/vfx/vfx-countdown-spark-high-contrast-overlay.svg",
  "/assets/visual/vfx/vfx-countdown-spark-overlay.svg",
  "/assets/visual/vfx/vfx-countdown-spark-sunset-overlay.svg",
  "/assets/visual/vfx/vfx-game-over-rip-high-contrast-smoke.svg",
  "/assets/visual/vfx/vfx-game-over-rip-smoke.svg",
  "/assets/visual/vfx/vfx-game-over-rip-sunset-smoke.svg",
  "/assets/visual/vfx/vfx-level-up-star-high-contrast-overlay.svg",
  "/assets/visual/vfx/vfx-level-up-star-overlay.svg",
  "/assets/visual/vfx/vfx-level-up-star-sunset-overlay.svg",
  "/assets/visual/vfx/vfx-level-up-twirl-high-contrast-overlay.svg",
  "/assets/visual/vfx/vfx-level-up-twirl-overlay.svg",
  "/assets/visual/vfx/vfx-level-up-twirl-sunset-overlay.svg",
  "/assets/audio/bgm-gameplay-intense-layer-01.mp3",
  "/assets/audio/bgm-gameplay-loop-main-01.mp3",
  "/assets/audio/bgm-menu-loop-main-01.mp3",
  "/assets/audio/sfx-ball-lost-01.mp3",
  "/assets/audio/sfx-ball-lost-02.mp3",
  "/assets/audio/sfx-brick-break-blue-01.mp3",
  "/assets/audio/sfx-brick-break-blue-02.mp3",
  "/assets/audio/sfx-brick-break-blue-03.mp3",
  "/assets/audio/sfx-brick-break-green-01.mp3",
  "/assets/audio/sfx-brick-break-green-02.mp3",
  "/assets/audio/sfx-brick-break-green-03.mp3",
  "/assets/audio/sfx-brick-break-purple-01.mp3",
  "/assets/audio/sfx-brick-break-purple-02.mp3",
  "/assets/audio/sfx-brick-break-purple-03.mp3",
  "/assets/audio/sfx-brick-break-red-01.mp3",
  "/assets/audio/sfx-brick-break-red-02.mp3",
  "/assets/audio/sfx-brick-break-red-03.mp3",
  "/assets/audio/sfx-brick-break-yellow-01.mp3",
  "/assets/audio/sfx-brick-break-yellow-02.mp3",
  "/assets/audio/sfx-brick-break-yellow-03.mp3",
  "/assets/audio/sfx-brick-hit-01.mp3",
  "/assets/audio/sfx-brick-hit-02.mp3",
  "/assets/audio/sfx-brick-hit-03.mp3",
  "/assets/audio/sfx-brick-hit-04.mp3",
  "/assets/audio/sfx-brick-hit-05.mp3",
  "/assets/audio/sfx-button-press-01.mp3",
  "/assets/audio/sfx-button-press-02.mp3",
  "/assets/audio/sfx-button-press-03.mp3",
  "/assets/audio/sfx-button-press-04.mp3",
  "/assets/audio/sfx-ceiling-hit-01.mp3",
  "/assets/audio/sfx-ceiling-hit-02.mp3",
  "/assets/audio/sfx-ceiling-hit-03.mp3",
  "/assets/audio/sfx-ceiling-hit-04.mp3",
  "/assets/audio/sfx-combo-large-01.mp3",
  "/assets/audio/sfx-combo-large-02.mp3",
  "/assets/audio/sfx-combo-small-01.mp3",
  "/assets/audio/sfx-combo-small-02.mp3",
  "/assets/audio/sfx-error-soft-01.mp3",
  "/assets/audio/sfx-error-soft-02.mp3",
  "/assets/audio/sfx-game-over-01.mp3",
  "/assets/audio/sfx-game-start-01.mp3",
  "/assets/audio/sfx-game-start-02.mp3",
  "/assets/audio/sfx-highscore-new-01.mp3",
  "/assets/audio/sfx-highscore-new-02.mp3",
  "/assets/audio/sfx-level-complete-01.mp3",
  "/assets/audio/sfx-level-complete-02.mp3",
  "/assets/audio/sfx-level-start-01.mp3",
  "/assets/audio/sfx-level-start-02.mp3",
  "/assets/audio/sfx-level-toast-in-01.mp3",
  "/assets/audio/sfx-level-toast-in-02.mp3",
  "/assets/audio/sfx-offline-ready-01.mp3",
  "/assets/audio/sfx-paddle-hit-center-01.mp3",
  "/assets/audio/sfx-paddle-hit-center-02.mp3",
  "/assets/audio/sfx-paddle-hit-center-03.mp3",
  "/assets/audio/sfx-paddle-hit-center-04.mp3",
  "/assets/audio/sfx-paddle-hit-edge-01.mp3",
  "/assets/audio/sfx-paddle-hit-edge-02.mp3",
  "/assets/audio/sfx-paddle-hit-edge-03.mp3",
  "/assets/audio/sfx-paddle-hit-edge-04.mp3",
  "/assets/audio/sfx-panel-close-01.mp3",
  "/assets/audio/sfx-panel-close-02.mp3",
  "/assets/audio/sfx-panel-open-01.mp3",
  "/assets/audio/sfx-panel-open-02.mp3",
  "/assets/audio/sfx-powerup-activate-laser-fan-01.mp3",
  "/assets/audio/sfx-powerup-activate-multiball-01.mp3",
  "/assets/audio/sfx-powerup-activate-multiball-02.mp3",
  "/assets/audio/sfx-powerup-activate-slow-ball-01.mp3",
  "/assets/audio/sfx-powerup-activate-slow-ball-02.mp3",
  "/assets/audio/sfx-powerup-activate-wide-paddle-01.mp3",
  "/assets/audio/sfx-powerup-activate-wide-paddle-02.mp3",
  "/assets/audio/sfx-powerup-collect-01.mp3",
  "/assets/audio/sfx-powerup-collect-02.mp3",
  "/assets/audio/sfx-powerup-collect-03.mp3",
  "/assets/audio/sfx-powerup-expire-01.mp3",
  "/assets/audio/sfx-powerup-expire-02.mp3",
  "/assets/audio/sfx-powerup-spawn-01.mp3",
  "/assets/audio/sfx-powerup-spawn-02.mp3",
  "/assets/audio/sfx-powerup-spawn-03.mp3",
  "/assets/audio/sfx-reset-score-01.mp3",
  "/assets/audio/sfx-restart-01.mp3",
  "/assets/audio/sfx-restart-02.mp3",
  "/assets/audio/sfx-score-tick-01.mp3",
  "/assets/audio/sfx-score-tick-02.mp3",
  "/assets/audio/sfx-score-tick-03.mp3",
  "/assets/audio/sfx-theme-toggle-01.mp3",
  "/assets/audio/sfx-theme-toggle-02.mp3",
  "/assets/audio/sfx-wall-hit-01.mp3",
  "/assets/audio/sfx-wall-hit-02.mp3",
  "/assets/audio/sfx-wall-hit-03.mp3",
  "/assets/audio/sfx-wall-hit-04.mp3",
  "/assets/audio/sfx-wall-hit-05.mp3",
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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
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
