// public/sw.js
const BUILD_ID = "__BRICKBREAKER_BUILD_ID__";
const CACHE_PREFIX = "breakout-cache";
const CACHE_NAME = `${CACHE_PREFIX}-${BUILD_ID}`;
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon.svg",
  "/assets/ball.svg",
  "/assets/paddle.svg",
  "/assets/bricks/brick-blue.svg",
  "/assets/bricks/brick-green.svg",
  "/assets/bricks/brick-purple.svg",
  "/assets/bricks/brick-red.svg",
  "/assets/bricks/brick-yellow.svg",
  "/assets/cinematics/countdown-circle.svg",
  "/assets/cinematics/countdown-spark.svg",
  "/assets/cinematics/level-up-star.svg",
  "/assets/cinematics/level-up-twirl.svg",
  "/assets/cinematics/rip-smoke.svg",
  "/assets/powerups/multiball.svg",
  "/assets/powerups/wide-paddle.svg",
  "/assets/powerups/slow-ball.svg",
  "/assets/powerups/laser-fan.svg",
  "/assets/audio/music_gameplay_loop-01.mp3",
  "/assets/audio/music_high_intensity_layer-01.mp3",
  "/assets/audio/music_menu_loop-01.mp3",
  "/assets/audio/sfx_ball_lost-01.mp3",
  "/assets/audio/sfx_ball_lost-02.mp3",
  "/assets/audio/sfx_brick_break_blue-01.mp3",
  "/assets/audio/sfx_brick_break_blue-02.mp3",
  "/assets/audio/sfx_brick_break_blue-03.mp3",
  "/assets/audio/sfx_brick_break_green-01.mp3",
  "/assets/audio/sfx_brick_break_green-02.mp3",
  "/assets/audio/sfx_brick_break_green-03.mp3",
  "/assets/audio/sfx_brick_break_purple-01.mp3",
  "/assets/audio/sfx_brick_break_purple-02.mp3",
  "/assets/audio/sfx_brick_break_purple-03.mp3",
  "/assets/audio/sfx_brick_break_red-01.mp3",
  "/assets/audio/sfx_brick_break_red-02.mp3",
  "/assets/audio/sfx_brick_break_red-03.mp3",
  "/assets/audio/sfx_brick_break_yellow-01.mp3",
  "/assets/audio/sfx_brick_break_yellow-02.mp3",
  "/assets/audio/sfx_brick_break_yellow-03.mp3",
  "/assets/audio/sfx_brick_hit-01.mp3",
  "/assets/audio/sfx_brick_hit-02.mp3",
  "/assets/audio/sfx_brick_hit-03.mp3",
  "/assets/audio/sfx_brick_hit-04.mp3",
  "/assets/audio/sfx_brick_hit-05.mp3",
  "/assets/audio/sfx_button_press-01.mp3",
  "/assets/audio/sfx_button_press-02.mp3",
  "/assets/audio/sfx_button_press-03.mp3",
  "/assets/audio/sfx_button_press-04.mp3",
  "/assets/audio/sfx_ceiling_hit-01.mp3",
  "/assets/audio/sfx_ceiling_hit-02.mp3",
  "/assets/audio/sfx_ceiling_hit-03.mp3",
  "/assets/audio/sfx_ceiling_hit-04.mp3",
  "/assets/audio/sfx_combo_large-01.mp3",
  "/assets/audio/sfx_combo_large-02.mp3",
  "/assets/audio/sfx_combo_small-01.mp3",
  "/assets/audio/sfx_combo_small-02.mp3",
  "/assets/audio/sfx_error_soft-01.mp3",
  "/assets/audio/sfx_error_soft-02.mp3",
  "/assets/audio/sfx_game_over-01.mp3",
  "/assets/audio/sfx_game_start-01.mp3",
  "/assets/audio/sfx_game_start-02.mp3",
  "/assets/audio/sfx_highscore_new-01.mp3",
  "/assets/audio/sfx_highscore_new-02.mp3",
  "/assets/audio/sfx_level_complete-01.mp3",
  "/assets/audio/sfx_level_complete-02.mp3",
  "/assets/audio/sfx_level_start-01.mp3",
  "/assets/audio/sfx_level_start-02.mp3",
  "/assets/audio/sfx_level_toast_in-01.mp3",
  "/assets/audio/sfx_level_toast_in-02.mp3",
  "/assets/audio/sfx_offline_ready-01.mp3",
  "/assets/audio/sfx_paddle_hit_center-01.mp3",
  "/assets/audio/sfx_paddle_hit_center-02.mp3",
  "/assets/audio/sfx_paddle_hit_center-03.mp3",
  "/assets/audio/sfx_paddle_hit_center-04.mp3",
  "/assets/audio/sfx_paddle_hit_edge-01.mp3",
  "/assets/audio/sfx_paddle_hit_edge-02.mp3",
  "/assets/audio/sfx_paddle_hit_edge-03.mp3",
  "/assets/audio/sfx_paddle_hit_edge-04.mp3",
  "/assets/audio/sfx_panel_close-01.mp3",
  "/assets/audio/sfx_panel_close-02.mp3",
  "/assets/audio/sfx_panel_open-01.mp3",
  "/assets/audio/sfx_panel_open-02.mp3",
  "/assets/audio/sfx_powerup_activate_multiball-01.mp3",
  "/assets/audio/sfx_powerup_activate_multiball-02.mp3",
  "/assets/audio/sfx_powerup_activate_slow_ball-01.mp3",
  "/assets/audio/sfx_powerup_activate_slow_ball-02.mp3",
  "/assets/audio/sfx_powerup_activate_laser_fan-01.mp3",
  "/assets/audio/sfx_powerup_activate_wide_paddle-01.mp3",
  "/assets/audio/sfx_powerup_activate_wide_paddle-02.mp3",
  "/assets/audio/sfx_powerup_collect-01.mp3",
  "/assets/audio/sfx_powerup_collect-02.mp3",
  "/assets/audio/sfx_powerup_collect-03.mp3",
  "/assets/audio/sfx_powerup_expire-01.mp3",
  "/assets/audio/sfx_powerup_expire-02.mp3",
  "/assets/audio/sfx_powerup_spawn-01.mp3",
  "/assets/audio/sfx_powerup_spawn-02.mp3",
  "/assets/audio/sfx_powerup_spawn-03.mp3",
  "/assets/audio/sfx_reset_score-01.mp3",
  "/assets/audio/sfx_restart-01.mp3",
  "/assets/audio/sfx_restart-02.mp3",
  "/assets/audio/sfx_score_tick-01.mp3",
  "/assets/audio/sfx_score_tick-02.mp3",
  "/assets/audio/sfx_score_tick-03.mp3",
  "/assets/audio/sfx_theme_toggle-01.mp3",
  "/assets/audio/sfx_theme_toggle-02.mp3",
  "/assets/audio/sfx_wall_hit-01.mp3",
  "/assets/audio/sfx_wall_hit-02.mp3",
  "/assets/audio/sfx_wall_hit-03.mp3",
  "/assets/audio/sfx_wall_hit-04.mp3",
  "/assets/audio/sfx_wall_hit-05.mp3",
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
