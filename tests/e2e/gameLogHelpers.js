// tests/e2e/gameLogHelpers.js
export const GAME_LOG_DB_NAME = "BrikayaGameLog";
export const GAME_LOG_STORE_NAME = "gameEvents";
export const GAME_LOG_DB_VERSION = 2;
export const GAMEPLAY_TELEMETRY_QUERY_PARAM = "gameplayTelemetry";
export const GAMEPLAY_TELEMETRY_QUERY_VALUE = "1";

export async function readGameEvents(page) {
  return page.evaluate(
    async ({ dbName, storeName, dbVersion }) =>
      new Promise((resolveEvents) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveEvents([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolveEvents([]);
            return;
          }
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
          };
        };
      }),
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
    },
  );
}

export function summarizeEvents(events) {
  const byType = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
  }
  return byType;
}

export function summarizeEventsThroughPowerUpActivation(events, powerUpType) {
  const activationIndex = events.findIndex(
    (event) =>
      event.type === "power_up" &&
      event.metadata?.powerUpType === powerUpType &&
      event.metadata?.action === "activate",
  );

  if (activationIndex === -1) {
    return summarizeEvents(events);
  }

  return summarizeEvents(events.slice(0, activationIndex + 1));
}

export function summarizeEventsUntilFirstEvent(
  events,
  eventType,
  predicate = () => true,
) {
  const eventIndex = events.findIndex(
    (event) => event.type === eventType && predicate(event),
  );

  if (eventIndex === -1) {
    return summarizeEvents(events);
  }

  return summarizeEvents(events.slice(0, eventIndex + 1));
}

export function summarizeEventsUntilEventCount(events, eventType, expectedCount) {
  let seen = 0;
  let lastIndex = -1;

  for (let index = 0; index < events.length; index += 1) {
    if (events[index].type !== eventType) continue;
    seen += 1;
    lastIndex = index;
    if (seen >= expectedCount) break;
  }

  if (lastIndex === -1) {
    return summarizeEvents(events);
  }

  return summarizeEvents(events.slice(0, lastIndex + 1));
}

export function findEventsByType(events, type, predicate = () => true) {
  return events.filter((event) => event.type === type && predicate(event));
}

export function getLastLevelStart(events) {
  return findEventsByType(events, "level_start").at(-1) ?? null;
}

export function getLevelComplete(events, level) {
  return (
    findEventsByType(
      events,
      "level_complete",
      (event) => event.metadata?.completedLevel === level,
    ).at(-1) ?? null
  );
}

export async function waitForEventType(page, eventType, timeoutMs = 15000) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion, expectedType }) => {
      const events = await new Promise((resolveEvents) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveEvents([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolveEvents([]);
            return;
          }
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
          };
        };
      });

      return events.some((event) => event.type === expectedType);
    },
    { timeout: timeoutMs },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      expectedType: eventType,
    },
  );
}

export async function waitForGameLogReady(page, timeoutMs = 5000) {
  await page.waitForFunction(
    async ({ dbName, dbVersion, storeName }) => {
      const hasStore = await new Promise((resolveReady) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveReady(false);
        request.onsuccess = () => {
          const db = request.result;
          const ready = db.objectStoreNames.contains(storeName);
          db.close();
          resolveReady(ready);
        };
      });
      return hasStore;
    },
    { timeout: timeoutMs },
    {
      dbName: GAME_LOG_DB_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      storeName: GAME_LOG_STORE_NAME,
    },
  );
}

export async function clearGameLog(page) {
  await page.evaluate(
    async ({ dbName }) =>
      new Promise((resolveDelete) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = resolveDelete;
        request.onerror = resolveDelete;
        request.onblocked = resolveDelete;
      }),
    { dbName: GAME_LOG_DB_NAME },
  );
}

export async function clearGameLogEvents(page) {
  // Limpa eventos sem deleteDatabase: apagar o DB com conexões abertas do
  // GameLogger anterior pode ficar onblocked e corromper cenários seguintes.
  await page.evaluate(
    async ({ dbName, storeName, dbVersion }) =>
      new Promise((resolveClear) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveClear();
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolveClear();
            return;
          }

          const tx = db.transaction([storeName], "readwrite");
          const clearRequest = tx.objectStore(storeName).clear();
          clearRequest.onsuccess = () => {
            db.close();
            resolveClear();
          };
          clearRequest.onerror = () => {
            db.close();
            resolveClear();
          };
        };
      }),
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
    },
  );
}

export async function clearRuntimeState(page) {
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      );
    }

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName)),
      );
    }

    window.localStorage.clear();
    window.sessionStorage.clear();

    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases
          .map((database) => database.name)
          .filter(Boolean)
          .map(
            (databaseName) =>
              new Promise((resolveDelete) => {
                const request = indexedDB.deleteDatabase(databaseName);
                request.onsuccess = resolveDelete;
                request.onerror = resolveDelete;
                request.onblocked = resolveDelete;
              }),
          ),
      );
    }
  });
}

export function withGameplayTelemetry(url) {
  const nextUrl = new URL(url);
  if (!nextUrl.searchParams.has(GAMEPLAY_TELEMETRY_QUERY_PARAM)) {
    nextUrl.searchParams.set(
      GAMEPLAY_TELEMETRY_QUERY_PARAM,
      GAMEPLAY_TELEMETRY_QUERY_VALUE,
    );
  }
  return nextUrl.toString();
}

export function scenarioUrl(baseUrl, scenario) {
  const url = new URL(withGameplayTelemetry(baseUrl));
  url.searchParams.set("qaScenario", scenario);
  return url.toString();
}
