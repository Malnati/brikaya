// tests/e2e/cloudflare-phase-transition-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";
import { assertAllowedQaHostname } from "./publicQaEnv.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-phase-transition.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-phase-transition.png";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const GAME_LOG_DB_NAME = "BrikayaGameLog";
const GAME_LOG_STORE_NAME = "gameEvents";
const GAME_LOG_DB_VERSION = 2;
const MAX_WAIT_FOR_LEVEL_MS = 30000;
const MIN_LEVEL_PAUSE_MS = 1500;
const SPEED_TOLERANCE = 0.0001;
const SPEED_PRECISION_FACTOR = 1000;
const MIN_SPEED_DIVISOR = 3;
const REQUIRED_EVENT_TYPES = [
  "game_start",
  "component_destroyed",
  "score_update",
  "level_complete",
  "level_start",
];

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_PHASE_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return process.env.BRIKAYA_PHASE_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
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

function withQaScenario(url) {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("qaScenario", "single-component-phase-clear");
  return pageUrl.toString();
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

async function readGameEvents(page) {
  return page.evaluate(
    async ({ dbName, storeName, dbVersion }) =>
      new Promise((resolve) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolve([]);
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

function summarizeEvents(events) {
  const byType = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
  }
  return byType;
}

async function collectToastState(page) {
  return page.evaluate(() => {
    const toast = document.querySelector('[data-testid="level-toast"]');
    const canvas = document.querySelector("canvas");
    const toastRect = toast?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    return {
      text: toast?.textContent?.trim() || "",
      toast: toastRect
        ? {
            x: toastRect.x,
            y: toastRect.y,
            width: toastRect.width,
            height: toastRect.height,
            right: toastRect.right,
            bottom: toastRect.bottom,
          }
        : null,
      canvas: canvasRect
        ? {
            x: canvasRect.x,
            y: canvasRect.y,
            width: canvasRect.width,
            height: canvasRect.height,
            right: canvasRect.right,
            bottom: canvasRect.bottom,
          }
        : null,
    };
  });
}

async function run() {
  const targetUrl = withQaScenario(publicUrl());
  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);

  const parsed = new URL(targetUrl);
  assertAllowedQaHostname(targetUrl);

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

    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await clearGameDatabases(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForSelector('[data-testid="level-toast"]', {
      timeout: MAX_WAIT_FOR_LEVEL_MS,
    });
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-testid="level-toast"]')
          ?.textContent?.includes("Fase 2"),
      { timeout: MAX_WAIT_FOR_LEVEL_MS },
    );

    const toastVisibleState = await collectToastState(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });

    await page.waitForFunction(
      async ({ dbName, storeName, dbVersion }) => {
        const events = await new Promise((resolve) => {
          const request = indexedDB.open(dbName, dbVersion);
          request.onerror = () => resolve([]);
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
        return events.some((event) => event.type === "level_start");
      },
      { timeout: MAX_WAIT_FOR_LEVEL_MS },
      {
        dbName: GAME_LOG_DB_NAME,
        storeName: GAME_LOG_STORE_NAME,
        dbVersion: GAME_LOG_DB_VERSION,
      },
    );

    await page.waitForFunction(
      () => !document.querySelector('[data-testid="level-toast"]'),
      { timeout: 10000 },
    );

    const events = await readGameEvents(page);
    const byType = summarizeEvents(events);
    const eventTypes = events.map((event) => event.type);
    const levelComplete = events.find(
      (event) => event.type === "level_complete",
    );
    const levelStart = events.find((event) => event.type === "level_start");
    const pauseDeltaMs =
      levelComplete && levelStart
        ? levelStart.timestamp - levelComplete.timestamp
        : 0;
    const finalLayout = await collectToastState(page);
    const levelCompleteSpeedState = levelComplete?.metadata?.speedState || null;
    const levelStartSpeedState = levelStart?.metadata?.speedState || null;
    const expectedLevelStartReductionPerComponent = levelStartSpeedState
      ? roundSpeedValue(
          (levelStartSpeedState.maxSpeed - levelStartSpeedState.minSpeed) /
            levelStartSpeedState.initialComponentCount,
        )
      : null;

    const report = {
      url: targetUrl,
      screenshotPath: outScreenshot,
      byType,
      eventTypes,
      levelCompleteMetadata: levelComplete?.metadata || null,
      levelStartMetadata: levelStart?.metadata || null,
      levelCompleteSpeedState,
      levelStartSpeedState,
      expectedLevelStartReductionPerComponent,
      pauseDeltaMs,
      toastVisibleState,
      finalLayout,
      consoleProblems,
    };
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    for (const type of REQUIRED_EVENT_TYPES) {
      assert(eventTypes.includes(type), `Evento obrigatório ausente: ${type}`);
    }
    assert(
      (byType.restart_game || 0) === 0,
      "restart_game apareceu sem ação humana.",
    );
    assert(
      toastVisibleState.text.includes("Fase 2"),
      "Toast não informou Fase 2.",
    );
    assert(
      toastVisibleState.text.includes("1.12×"),
      "Toast não informou velocidade 1.12×.",
    );
    assert(
      toastVisibleState.toast && toastVisibleState.canvas,
      "Toast ou canvas não encontrado.",
    );
    assert(
      toastVisibleState.toast.width >= toastVisibleState.canvas.width,
      "Overlay de fase não cobriu a largura do tabuleiro.",
    );
    assert(
      toastVisibleState.toast.height >= toastVisibleState.canvas.height,
      "Overlay de fase não cobriu a altura do tabuleiro.",
    );
    assert(
      levelComplete?.metadata?.nextLevel === 2,
      "level_complete não registrou próxima fase 2.",
    );
    assert(
      levelComplete?.metadata?.nextSpeedMultiplier === 1.12,
      "level_complete não registrou velocidade 1.12.",
    );
    assert(
      levelCompleteSpeedState,
      "level_complete não registrou metadata.speedState.",
    );
    assert(
      Math.abs(
        levelCompleteSpeedState.initialSpawnSpeed -
          levelCompleteSpeedState.maxSpeed,
      ) <= SPEED_TOLERANCE,
      "Fase 1 não iniciou com initialSpawnSpeed igual ao maxSpeed da nova base.",
    );
    assert(
      Math.abs(
        levelCompleteSpeedState.minSpeed -
          levelCompleteSpeedState.maxSpeed / MIN_SPEED_DIVISOR,
      ) <= SPEED_TOLERANCE,
      `minSpeed da Fase 1 não usou maxSpeed / ${MIN_SPEED_DIVISOR}.`,
    );
    assert(
      levelStart?.metadata?.level === 2,
      "level_start não registrou fase 2.",
    );
    assert(
      levelStartSpeedState,
      "level_start não registrou metadata.speedState.",
    );
    assert(
      levelComplete?.metadata?.nextInitialComponentCount ===
        levelStartSpeedState.initialComponentCount,
      "level_complete não antecipou a quantidade inicial de blocos da Fase 2.",
    );
    assert(
      levelStart?.gameState?.componentsRemaining ===
        levelStartSpeedState.initialComponentCount,
      "Fase 2 não iniciou com todos os blocos esperados.",
    );
    assert(
      levelStart?.gameState?.gameDimensions?.componentRows >
        levelComplete?.gameState?.gameDimensions?.componentRows,
      "Fase 2 não aumentou as linhas de componentes.",
    );
    assert(
      levelStartSpeedState.initialComponentCount >
        levelCompleteSpeedState.initialComponentCount,
      "Fase 2 não aumentou a quantidade inicial de blocos.",
    );
    assert(
      Math.abs(
        levelStartSpeedState.currentSpeed - levelStartSpeedState.maxSpeed,
      ) <= SPEED_TOLERANCE,
      "Fase 2 não iniciou em currentSpeed === maxSpeed.",
    );
    assert(
      Math.abs(
        levelStartSpeedState.initialSpawnSpeed - levelStartSpeedState.maxSpeed,
      ) <= SPEED_TOLERANCE,
      "Fase 2 não iniciou em initialSpawnSpeed === maxSpeed.",
    );
    assert(
      Math.abs(
        levelStartSpeedState.minSpeed -
          levelStartSpeedState.maxSpeed / MIN_SPEED_DIVISOR,
      ) <= SPEED_TOLERANCE,
      `minSpeed da Fase 2 não deriva da própria maxSpeed / ${MIN_SPEED_DIVISOR}.`,
    );
    assert(
      levelStartSpeedState.minSpeed > levelCompleteSpeedState.minSpeed,
      "minSpeed da Fase 2 não ficou acima do mínimo da Fase 1.",
    );
    assert(
      levelComplete?.metadata?.nextReductionPerComponent > 0,
      "nextReductionPerComponent ausente em level_complete.",
    );
    assert(
      Math.abs(
        levelComplete.metadata.nextReductionPerComponent -
          expectedLevelStartReductionPerComponent,
      ) <= SPEED_TOLERANCE,
      "nextReductionPerComponent não distribuiu a faixa maxSpeed-minSpeed pelos blocos da Fase 2.",
    );
    assert(
      Math.abs(
        levelStartSpeedState.reductionPerComponent -
          expectedLevelStartReductionPerComponent,
      ) <= SPEED_TOLERANCE,
      "level_start não registrou reductionPerComponent gradual da Fase 2.",
    );
    assert(
      pauseDeltaMs >= MIN_LEVEL_PAUSE_MS,
      `Pausa curta demais: ${pauseDeltaMs}ms.`,
    );
    assert(finalLayout.text === "", "Toast permaneceu após a pausa.");
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
