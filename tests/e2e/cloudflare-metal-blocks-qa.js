// tests/e2e/cloudflare-metal-blocks-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from './browserLauncher.js';

import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";
import { assertAllowedQaHostname } from "./publicQaEnv.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-metal-blocks-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-metal-blocks-qa.png";
const CHROME_LOW_RESOURCE_ARGS = [
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-component-update",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-gpu",
  "--disable-renderer-backgrounding",
  "--disable-software-rasterizer",
  "--hide-scrollbars",
  "--mute-audio",
  "--renderer-process-limit=2",
];
const MAX_QA_DEVICE_SCALE_FACTOR = 1;
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
const MAX_WAIT_FOR_METAL_BLOCK_MS = 45000;
const POST_DESTROY_SETTLE_MS = 500;
const MIN_DISTINCT_TOUCH_INTERVAL_MS = 100;
const EXPECTED_QA_SCENARIO = "metal-block";
const EVENT_GAME_START = "game_start";
const EVENT_COLLISION = "collision";
const EVENT_BRICK_DESTROYED = "brick_destroyed";
const EVENT_SCORE_UPDATE = "score_update";
const EVENT_LEVEL_COMPLETE = "level_complete";
const EVENT_LEVEL_START = "level_start";
const EVENT_RESTART_GAME = "restart_game";
const COLLISION_TARGET_BRICK = "brick";
const REQUIRED_EVENT_TYPES = [
  EVENT_GAME_START,
  EVENT_COLLISION,
  EVENT_BRICK_DESTROYED,
  EVENT_SCORE_UPDATE,
  EVENT_LEVEL_COMPLETE,
  EVENT_LEVEL_START,
];
const REQUIRED_PRE_DESTROY_COLLISIONS = 2;
const EXPECTED_DENTED_ONE_ASSET =
  "/assets/visual/bricks/spr-brick-metal-steel-dented-one.svg";
const EXPECTED_DENTED_TWO_ASSET =
  "/assets/visual/bricks/spr-brick-metal-steel-dented-two.svg";
const EXPECTED_VISUAL_DAMAGE_ASSETS = [
  EXPECTED_DENTED_ONE_ASSET,
  EXPECTED_DENTED_TWO_ASSET,
];
const EXPECTED_INITIAL_SCORE = 0;
const EXPECTED_SCORE_POINTS = 10;
const EXPECTED_INITIAL_BRICKS_REMAINING = 1;
const EXPECTED_SUCCESSFUL_HITS_BEFORE_DESTROY = 0;
const EXPECTED_GAME_START_COUNT = 1;
const BROWSER_CLOSE_SETTLE_MS = 500;
const BROWSER_CLOSE_TIMEOUT_MS = 3000;
const BROWSER_CLOSE_TIMEOUT_MESSAGE = "browser close timeout";
const BROWSER_KILL_SIGNAL = "SIGKILL";
const BLANK_PAGE_URL = "about:blank";
const BLANK_PAGE_WAIT_UNTIL = "domcontentloaded";

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRIKAYA_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env("BRIKAYA_METAL_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRIKAYA_METAL_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function withQaScenario(url) {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("qaScenario", EXPECTED_QA_SCENARIO);
  return pageUrl.toString();
}

function qaViewport() {
  return {
    ...VIEWPORT,
    deviceScaleFactor: Math.min(
      VIEWPORT.deviceScaleFactor,
      MAX_QA_DEVICE_SCALE_FACTOR,
    ),
  };
}

async function clearOriginState(page, origin) {
  await page.goto(BLANK_PAGE_URL, { waitUntil: BLANK_PAGE_WAIT_UNTIL });
  const client = await page.target().createCDPSession();
  try {
    await client.send("Storage.clearDataForOrigin", {
      origin,
      storageTypes: "all",
    });
  } finally {
    await client.detach();
  }
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  try {
    await Promise.race([
      browser.close(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(BROWSER_CLOSE_TIMEOUT_MESSAGE)),
          BROWSER_CLOSE_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch {
    browser.disconnect();
  }
  if (
    browserProcess &&
    browserProcess.exitCode === null &&
    !browserProcess.killed
  ) {
    browserProcess.kill(BROWSER_KILL_SIGNAL);
  }
  await new Promise((resolve) => setTimeout(resolve, BROWSER_CLOSE_SETTLE_MS));
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

function summarizeEvents(events) {
  return events.reduce((accumulator, event) => {
    accumulator[event.type] = (accumulator[event.type] || 0) + 1;
    return accumulator;
  }, {});
}

function isBrickCollision(event) {
  return (
    event.type === EVENT_COLLISION &&
    event.collisionInfo?.type === COLLISION_TARGET_BRICK
  );
}

function summarizeEvent(event, index) {
  return {
    index,
    type: event.type,
    timestamp: event.timestamp,
    score: event.gameState?.score ?? null,
    bricksRemaining: event.gameState?.bricksRemaining ?? null,
    successfulBrickHits:
      event.metadata?.speedState?.successfulBrickHits ??
      event.gameState?.speedState?.successfulBrickHits ??
      null,
    pointsAdded: event.metadata?.pointsAdded ?? null,
    reason: event.metadata?.reason ?? null,
    brickIndex: event.collisionInfo?.brickIndex ?? event.metadata?.brickIndex,
  };
}

async function waitForEventType(page, eventType) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion, expectedType }) => {
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
      return events.some((event) => event.type === expectedType);
    },
    { timeout: MAX_WAIT_FOR_METAL_BLOCK_MS },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      expectedType: eventType,
    },
  );
}

async function waitForBrickCollisionCount(page, expectedCount) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion, count, collisionType }) => {
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
      return (
        events.filter(
          (event) =>
            event.type === "collision" &&
            event.collisionInfo?.type === collisionType,
        ).length >= count
      );
    },
    { timeout: MAX_WAIT_FOR_METAL_BLOCK_MS },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      count: expectedCount,
      collisionType: COLLISION_TARGET_BRICK,
    },
  );
}

async function waitForMetalDamageAssets(page) {
  await page.waitForFunction(
    ({ expectedAssets }) => {
      const resourcePaths = performance
        .getEntriesByType("resource")
        .map((entry) => new URL(entry.name).pathname);

      return expectedAssets.every((assetPath) =>
        resourcePaths.includes(assetPath),
      );
    },
    { timeout: MAX_WAIT_FOR_METAL_BLOCK_MS },
    { expectedAssets: EXPECTED_VISUAL_DAMAGE_ASSETS },
  );
}

async function readLoadedMetalDamageAssets(page) {
  return page.evaluate(
    ({ expectedAssets }) => {
      const resourcePaths = performance
        .getEntriesByType("resource")
        .map((entry) => new URL(entry.name).pathname);

      return expectedAssets.filter((assetPath) =>
        resourcePaths.includes(assetPath),
      );
    },
    { expectedAssets: EXPECTED_VISUAL_DAMAGE_ASSETS },
  );
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
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions({ extraArgs: [
      "--no-first-run",
      "--no-default-browser-check",
      ...CHROME_LOW_RESOURCE_ARGS,
    ] }));

  try {
    const page = await browser.newPage();
    await page.setViewport(qaViewport());
    page.on("console", (message) => {
      if (["error", "warn"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) =>
      consoleProblems.push({ type: "pageerror", text: error.message }),
    );

    await clearOriginState(page, parsed.origin);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await waitForEventType(page, EVENT_GAME_START);
    await waitForBrickCollisionCount(page, REQUIRED_PRE_DESTROY_COLLISIONS);
    await waitForMetalDamageAssets(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });
    const loadedMetalDamageAssets = await readLoadedMetalDamageAssets(page);
    await waitForEventType(page, EVENT_LEVEL_START);
    await new Promise((resolve) => setTimeout(resolve, POST_DESTROY_SETTLE_MS));

    const events = await readGameEvents(page);
    const byType = summarizeEvents(events);
    const eventTypes = events.map((event) => event.type);
    const brickCollisionEntries = events
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => isBrickCollision(event));
    const brickDestroyedEntry = events
      .map((event, index) => ({ event, index }))
      .find(({ event }) => event.type === EVENT_BRICK_DESTROYED);
    const scoreUpdateEntry = events
      .map((event, index) => ({ event, index }))
      .find(({ event }) => event.type === EVENT_SCORE_UPDATE);
    const preDestroyCollisionEntries = brickDestroyedEntry
      ? brickCollisionEntries.filter(
          ({ index }) => index < brickDestroyedEntry.index,
        )
      : [];

    const report = {
      url: targetUrl,
      screenshotPath: outScreenshot,
      byType,
      eventTypes,
      brickCollisions: brickCollisionEntries.map(({ event, index }) =>
        summarizeEvent(event, index),
      ),
      preDestroyBrickCollisions: preDestroyCollisionEntries.map(
        ({ event, index }) => summarizeEvent(event, index),
      ),
      firstBrickDestroyed: brickDestroyedEntry
        ? summarizeEvent(brickDestroyedEntry.event, brickDestroyedEntry.index)
        : null,
      firstScoreUpdate: scoreUpdateEntry
        ? summarizeEvent(scoreUpdateEntry.event, scoreUpdateEntry.index)
        : null,
      loadedMetalDamageAssets,
      consoleProblems,
    };
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    for (const type of REQUIRED_EVENT_TYPES) {
      assert(eventTypes.includes(type), `Evento obrigatório ausente: ${type}`);
    }
    assert(
      (byType[EVENT_GAME_START] || 0) === EXPECTED_GAME_START_COUNT,
      `Motor reiniciou durante bloco metálico: game_start=${byType[EVENT_GAME_START] || 0}.`,
    );
    assert(
      (byType[EVENT_RESTART_GAME] || 0) === 0,
      "restart_game apareceu sem ação humana.",
    );
    assert(
      brickCollisionEntries.length >= REQUIRED_PRE_DESTROY_COLLISIONS,
      "Bloco metálico não registrou dois toques antes da destruição.",
    );
    assert(brickDestroyedEntry, "Bloco metálico não foi destruído.");
    assert(scoreUpdateEntry, "Pontuação não foi registrada após destruição.");
    assert(
      preDestroyCollisionEntries.length >= REQUIRED_PRE_DESTROY_COLLISIONS,
      "Menos de dois toques foram registrados antes da destruição.",
    );
    for (const expectedAsset of EXPECTED_VISUAL_DAMAGE_ASSETS) {
      assert(
        loadedMetalDamageAssets.includes(expectedAsset),
        `Asset de amassado metálico não carregou: ${expectedAsset}`,
      );
    }
    const firstPreDestroyCollision = preDestroyCollisionEntries[0]?.event;
    const secondPreDestroyCollision = preDestroyCollisionEntries[1]?.event;
    assert(
      secondPreDestroyCollision.timestamp -
        firstPreDestroyCollision.timestamp >=
        MIN_DISTINCT_TOUCH_INTERVAL_MS,
      "Toques parciais em bloco metálico foram registrados no mesmo contato físico.",
    );
    assert(
      brickDestroyedEntry.event.timestamp -
        secondPreDestroyCollision.timestamp >=
        MIN_DISTINCT_TOUCH_INTERVAL_MS,
      "Destruição do bloco metálico ocorreu sem novo contato físico.",
    );

    for (const { event } of preDestroyCollisionEntries.slice(
      0,
      REQUIRED_PRE_DESTROY_COLLISIONS,
    )) {
      assert(
        event.gameState?.score === EXPECTED_INITIAL_SCORE,
        "Toque parcial em bloco metálico alterou a pontuação.",
      );
      assert(
        event.gameState?.bricksRemaining === EXPECTED_INITIAL_BRICKS_REMAINING,
        "Toque parcial em bloco metálico reduziu blocos restantes.",
      );
      assert(
        event.metadata?.speedState?.successfulBrickHits ===
          EXPECTED_SUCCESSFUL_HITS_BEFORE_DESTROY,
        "Toque parcial em bloco metálico reduziu velocidade/progresso de acerto.",
      );
    }
    assert(
      scoreUpdateEntry.index > brickDestroyedEntry.index,
      "score_update veio antes de brick_destroyed.",
    );
    assert(
      scoreUpdateEntry.event.metadata?.pointsAdded === EXPECTED_SCORE_POINTS,
      "score_update não pontuou somente na destruição.",
    );
    assert(
      consoleProblems.length === 0,
      `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`,
    );
  } finally {
    await closeBrowser(browser);
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
