// tests/e2e/cloudflare-no-score-reset-after-component.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/play/";
const DEFAULT_REPORT_PATH =
  "tmp/reports/cloudflare-no-score-reset-after-component.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-no-score-reset-after-component.png";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MAX_WAIT_FOR_SCORE_MS = 30000;
const INITIAL_POSITION_TOLERANCE_PX = 1;
const SPEED_TOLERANCE = 0.0001;
const SPEED_PRECISION_FACTOR = 1000;
const EXPECTED_MIN_SPEED_DIVISOR = 3;
const GAME_LOG_DB_NAME = "BrikayaGameLog";
const GAME_LOG_STORE_NAME = "gameEvents";
const GAME_LOG_DB_VERSION = 2;

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_NO_RESET_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return process.env.BRIKAYA_NO_RESET_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function roundSpeedValue(speed) {
  return Math.round(speed * SPEED_PRECISION_FACTOR) / SPEED_PRECISION_FACTOR;
}

async function readGameEvents(page) {
  return page.evaluate(
    async ({ dbName, storeName, dbVersion }) =>
      new Promise((resolve) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolve([]);
        request.onblocked = () => resolve([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolve([]);
            return;
          }
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolve([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolve(allRequest.result || []);
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

async function clearGameDatabases(page) {
  await page.evaluate(async () => {
    const names = [
      "BrikayaGameLog",
      "BrikayaCollisions",
      "SystemDebugLog",
      "brikaya",
    ];
    await Promise.all(
      names.map(
        (name) =>
          new Promise((resolve) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          }),
      ),
    );
  });
}

async function clearOfflineState(page) {
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
  });
}

function summarizeEvents(events) {
  const byType = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
  }
  return byType;
}

async function run() {
  const url = publicUrl();
  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);

  const consoleProblems = [];
  const browser = await puppeteer.launch(
    buildPuppeteerLaunchOptions({
      extraArgs: ["--no-first-run", "--no-default-browser-check"],
    }),
  );

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    page.on("console", (message) => {
      if (["error", "warn"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) =>
      consoleProblems.push({ type: "pageerror", text: error.message }),
    );

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await clearGameDatabases(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForFunction(
      async ({ dbName, storeName, dbVersion }) => {
        const events = await new Promise((resolve) => {
          const request = indexedDB.open(dbName, dbVersion);
          request.onerror = () => resolve([]);
          request.onblocked = () => resolve([]);
          request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
              db.close();
              resolve([]);
              return;
            }
            const tx = db.transaction([storeName], "readonly");
            const store = tx.objectStore(storeName);
            const allRequest = store.getAll();
            allRequest.onerror = () => {
              db.close();
              resolve([]);
            };
            allRequest.onsuccess = () => {
              db.close();
              resolve(allRequest.result || []);
            };
          };
        });
        return events.some((event) => event.type === "game_start");
      },
      { timeout: MAX_WAIT_FOR_SCORE_MS },
      {
        dbName: GAME_LOG_DB_NAME,
        storeName: GAME_LOG_STORE_NAME,
        dbVersion: GAME_LOG_DB_VERSION,
      },
    );

    const startEvents = await readGameEvents(page);
    const startBall =
      startEvents.find((event) => event.type === "game_start")
        ?.ballPositions?.[0] || null;
    assert(
      startBall,
      "Não foi possível capturar a posição inicial da bolinha no app publicado.",
    );

    await page.waitForFunction(
      async ({ dbName, storeName, dbVersion }) => {
        const events = await new Promise((resolve) => {
          const request = indexedDB.open(dbName, dbVersion);
          request.onerror = () => resolve([]);
          request.onblocked = () => resolve([]);
          request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
              db.close();
              resolve([]);
              return;
            }
            const tx = db.transaction([storeName], "readonly");
            const store = tx.objectStore(storeName);
            const allRequest = store.getAll();
            allRequest.onerror = () => {
              db.close();
              resolve([]);
            };
            allRequest.onsuccess = () => {
              db.close();
              resolve(allRequest.result || []);
            };
          };
        });
        return events.some((event) => event.type === "score_update");
      },
      { timeout: MAX_WAIT_FOR_SCORE_MS },
      {
        dbName: GAME_LOG_DB_NAME,
        storeName: GAME_LOG_STORE_NAME,
        dbVersion: GAME_LOG_DB_VERSION,
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    const events = await readGameEvents(page);
    const byType = summarizeEvents(events);
    const scoreEvents = events.filter((event) => event.type === "score_update");
    const scoreEventWithSpeedReduction =
      scoreEvents.find((event) => event.metadata?.speedReduction) || null;
    const scoreSpeedReduction =
      scoreEventWithSpeedReduction?.metadata?.speedReduction || null;
    const scoreSpeedState =
      scoreEventWithSpeedReduction?.metadata?.speedState || null;
    const expectedFirstLevelSpawnSpeed = scoreSpeedReduction
      ? scoreSpeedReduction.maxSpeed
      : null;
    const expectedReductionPerComponent = scoreSpeedState
      ? roundSpeedValue(
          (scoreSpeedState.maxSpeed - scoreSpeedState.minSpeed) /
            scoreSpeedState.initialComponentCount,
        )
      : null;
    const lastBall = events[events.length - 1]?.ballPositions?.[0] || null;
    const restartedToInitialPosition =
      Boolean(lastBall) &&
      Math.abs(lastBall.x - startBall.x) <= INITIAL_POSITION_TOLERANCE_PX &&
      Math.abs(lastBall.y - startBall.y) <= INITIAL_POSITION_TOLERANCE_PX;

    await page.screenshot({ path: outScreenshot, fullPage: true });
    const report = {
      url,
      byType,
      eventTypes: events.map((event) => event.type),
      startBall,
      lastBall,
      restartedToInitialPosition,
      scoreEvents: scoreEvents.length,
      scoreSpeedReduction,
      scoreSpeedState,
      expectedReductionPerBrick,
      expectedFirstLevelSpawnSpeed,
      consoleProblems,
      screenshotPath: outScreenshot,
    };
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    assert(
      scoreEvents.length > 0,
      "Nenhum score_update foi observado no app publicado.",
    );
    assert(
      scoreSpeedReduction,
      "score_update não registrou metadata.speedReduction.",
    );
    assert(scoreSpeedState, "score_update não registrou metadata.speedState.");
    assert(
      Math.abs(
        scoreSpeedReduction.speedBefore - expectedFirstLevelSpawnSpeed,
      ) <= SPEED_TOLERANCE,
      `Fase 1 não começou na nova máxima inicial: speedBefore=${scoreSpeedReduction.speedBefore}, esperado=${expectedFirstLevelSpawnSpeed}.`,
    );
    assert(
      Math.abs(
        scoreSpeedReduction.speedBefore - scoreSpeedReduction.maxSpeed,
      ) <= SPEED_TOLERANCE,
      "Fase 1 não iniciou em currentSpeed === maxSpeed.",
    );
    assert(
      scoreSpeedReduction.speedAfter + SPEED_TOLERANCE >=
        scoreSpeedReduction.minSpeed,
      "speedAfter ficou abaixo do minSpeed.",
    );
    assert(
      Math.abs(
        scoreSpeedState.minSpeed -
          scoreSpeedState.maxSpeed / EXPECTED_MIN_SPEED_DIVISOR,
      ) <= SPEED_TOLERANCE,
      "minSpeed da Fase 1 não usou maxSpeed / 3.",
    );
    assert(
      Math.abs(
        scoreSpeedReduction.reductionApplied - expectedReductionPerBrick,
      ) <= SPEED_TOLERANCE,
      "Redução por bloco não distribuiu a faixa maxSpeed-minSpeed pela quantidade inicial de blocos.",
    );
    if (scoreSpeedState.initialComponentCount > 1) {
      assert(
        scoreSpeedReduction.speedAfter > scoreSpeedReduction.minSpeed,
        "Primeira colisão em fase normal chegou ao minSpeed de uma vez.",
      );
    }
    if (!scoreSpeedReduction.minReached) {
      assert(
        scoreSpeedReduction.speedBefore > scoreSpeedReduction.speedAfter,
        "speedBefore não ficou acima de speedAfter antes do mínimo.",
      );
    }
    assert(
      (byType.game_start || 0) === 1,
      `Motor reiniciou após pontuar: game_start=${byType.game_start || 0}.`,
    );
    assert(
      (byType.restart_game || 0) === 0,
      `Restart sem ação humana após pontuar: restart_game=${byType.restart_game || 0}.`,
    );
    assert(
      !restartedToInitialPosition,
      "Bolinha voltou à posição inicial após colisão com componente.",
    );
    assert(
      consoleProblems.length === 0,
      `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`,
    );
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
