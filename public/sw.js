// public/sw.js
const BUILD_ID = "__BRIKAYA_BUILD_ID__";
const CACHE_PREFIX = "brikaya-cache";
const CACHE_NAME = `${CACHE_PREFIX}-${BUILD_ID}`;
const ASSET_CACHE_NAME = "brikaya-asset-cache-v1";
const ASSET_MANIFEST_URL = "/asset-cache-manifest.json";
const CORE_PRECACHE_URLS = [
  "/",
  "/index.html",
  "/downloads/",
  "/manifest.webmanifest",
  ASSET_MANIFEST_URL,
];
const PRECACHE_URLS = [...CORE_PRECACHE_URLS];
const GET_METHOD = "GET";
const DOCUMENT_DESTINATION = "document";
const INDEX_URL = "/index.html";
const SERVICE_WORKER_URL = "/sw.js";
const WINDOW_CLIENT_TYPE = "window";
const SKIP_WAITING_MESSAGE = "SKIP_WAITING";
const GET_VERSION_MESSAGE = "GET_VERSION";
const VERSION_MESSAGE = "VERSION";
const RELOAD_CLIENT_MESSAGE = "RELOAD_CLIENT";
const RUNTIME_ASSET_PREFIXES = ["/assets/visual/", "/assets/audio/"];
const ASSET_HASH_SEARCH_PARAM = "bbAssetHash";
const ASSET_CACHE_STATUS_HEADER = "X-Brikaya-Asset-Cache";
const ASSET_CACHE_HIT_STATUS = "hit";
const ASSET_CACHE_MISS_STATUS = "miss";
const ASSET_CACHE_MIGRATED_STATUS = "migrated";
const SHA_256_ALGORITHM = "SHA-256";
const SHA_PREFIX = "sha256-";
const HEX_RADIX = 16;
const HEX_PAD_LENGTH = 2;
const BYTE_MASK = 0xff;
const EMPTY_MANIFEST = { assetsByPath: {} };
const EMPTY_COUNT = 0;
const COUNT_INCREMENT = 1;

let assetManifestPromise = null;

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

function isRuntimeAssetRequest(request) {
  if (!isSameOriginRequest(request)) return false;
  const requestUrl = new URL(request.url);
  return RUNTIME_ASSET_PREFIXES.some((prefix) =>
    requestUrl.pathname.startsWith(prefix),
  );
}

function assetPathFromRequest(request) {
  return new URL(request.url).pathname;
}

function versionedAssetRequest(path, hash) {
  const assetUrl = new URL(path, self.location.origin);
  if (hash) {
    assetUrl.searchParams.set(ASSET_HASH_SEARCH_PARAM, hash);
  }
  return new Request(assetUrl.toString());
}

function cloneResponseWithAssetCacheStatus(response, status) {
  const headers = new Headers(response.headers);
  headers.set(ASSET_CACHE_STATUS_HEADER, status);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function hashBuffer(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) =>
    (byte & BYTE_MASK).toString(HEX_RADIX).padStart(HEX_PAD_LENGTH, "0"),
  ).join("");
}

async function hashResponse(response) {
  const buffer = await response.arrayBuffer();
  const digest = await self.crypto.subtle.digest(SHA_256_ALGORITHM, buffer);
  return `${SHA_PREFIX}${hashBuffer(digest)}`;
}

async function responseMatchesHash(response, expectedHash) {
  if (!expectedHash) return true;
  if (!self.crypto?.subtle) return false;

  try {
    return (await hashResponse(response.clone())) === expectedHash;
  } catch {
    return false;
  }
}

async function readAssetManifest() {
  const shellCache = await caches.open(CACHE_NAME);
  const cachedManifest = await shellCache.match(ASSET_MANIFEST_URL);
  if (cachedManifest) return cachedManifest.json();

  const networkManifest = await fetch(ASSET_MANIFEST_URL, { cache: "no-store" });
  if (!networkManifest.ok) return EMPTY_MANIFEST;

  await shellCache.put(ASSET_MANIFEST_URL, networkManifest.clone());
  return networkManifest.json();
}

async function getAssetManifest() {
  if (!assetManifestPromise) {
    assetManifestPromise = readAssetManifest().catch(() => EMPTY_MANIFEST);
  }
  return assetManifestPromise;
}

async function oldShellCacheNames() {
  const cacheNames = await caches.keys();
  return cacheNames.filter((cacheName) => {
    return cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME;
  });
}

async function migrateLegacyAssets() {
  const manifest = await getAssetManifest();
  const assets = Array.isArray(manifest.assets)
    ? manifest.assets
    : Object.values(manifest.assetsByPath || {});
  const oldCacheNames = await oldShellCacheNames();
  if (assets.length === EMPTY_COUNT || oldCacheNames.length === EMPTY_COUNT) {
    return EMPTY_COUNT;
  }

  const assetCache = await caches.open(ASSET_CACHE_NAME);
  let migratedCount = EMPTY_COUNT;

  for (const asset of assets) {
    const versionedRequest = versionedAssetRequest(asset.path, asset.hash);
    const existingAsset = await assetCache.match(versionedRequest);
    if (existingAsset) continue;

    for (const cacheName of oldCacheNames) {
      const cache = await caches.open(cacheName);
      const legacyResponse = await cache.match(asset.path);
      if (
        !legacyResponse ||
        !(await responseMatchesHash(legacyResponse, asset.hash))
      ) {
        continue;
      }

      await assetCache.put(versionedRequest, legacyResponse.clone());
      migratedCount += COUNT_INCREMENT;
      break;
    }
  }

  return migratedCount;
}

async function deleteOldCaches() {
  const oldCacheNames = await oldShellCacheNames();
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

      client.postMessage({ type: RELOAD_CLIENT_MESSAGE, buildId: BUILD_ID });
      return undefined;
    }),
  );
}

async function findMatchingCachedAsset(path, versionedRequest, expectedHash) {
  const assetCache = await caches.open(ASSET_CACHE_NAME);
  const versionedResponse = await assetCache.match(versionedRequest);
  if (
    versionedResponse &&
    (await responseMatchesHash(versionedResponse, expectedHash))
  ) {
    return cloneResponseWithAssetCacheStatus(
      versionedResponse,
      ASSET_CACHE_HIT_STATUS,
    );
  }

  const cacheNames = await caches.keys();
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(path);
    if (
      !cachedResponse ||
      !(await responseMatchesHash(cachedResponse, expectedHash))
    ) {
      continue;
    }

    await assetCache.put(versionedRequest, cachedResponse.clone());
    return cloneResponseWithAssetCacheStatus(
      cachedResponse,
      cacheName === ASSET_CACHE_NAME
        ? ASSET_CACHE_HIT_STATUS
        : ASSET_CACHE_MIGRATED_STATUS,
    );
  }

  return null;
}

async function fetchAndCacheAsset(versionedRequest, expectedHash) {
  const networkResponse = await fetch(versionedRequest);
  if (
    networkResponse.ok &&
    (await responseMatchesHash(networkResponse.clone(), expectedHash))
  ) {
    const assetCache = await caches.open(ASSET_CACHE_NAME);
    await assetCache.put(versionedRequest, networkResponse.clone());
  }

  return cloneResponseWithAssetCacheStatus(
    networkResponse,
    ASSET_CACHE_MISS_STATUS,
  );
}

async function handleRuntimeAssetRequest(request) {
  const manifest = await getAssetManifest();
  const path = assetPathFromRequest(request);
  const assetMetadata = manifest.assetsByPath?.[path] || null;
  const expectedHash = assetMetadata?.hash || null;
  const versionedRequest = versionedAssetRequest(path, expectedHash);
  const cachedAsset = await findMatchingCachedAsset(
    path,
    versionedRequest,
    expectedHash,
  );

  if (cachedAsset) return cachedAsset;

  return fetchAndCacheAsset(versionedRequest, expectedHash);
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
      await migrateLegacyAssets();
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
      assetCacheName: ASSET_CACHE_NAME,
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

  if (isRuntimeAssetRequest(event.request)) {
    event.respondWith(handleRuntimeAssetRequest(event.request));
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
