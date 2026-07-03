// tests/e2e/cloudflare-laser-powerup-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-laser-powerup-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-laser-powerup-qa.png";
const DEFAULT_ITEM_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-laser-powerup-item.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const GAME_LOG_DB_NAME = "BrickBreakerGameLog";
const GAME_LOG_STORE_NAME = "gameEvents";
const GAME_LOG_DB_VERSION = 2;
const MAX_WAIT_FOR_LASER_MS = 30000;
const LASER_EFFECT_MIN_VISIBLE_MS = 2000;
const LASER_EFFECT_SAMPLE_DELAY_MS = 1900;
const LASER_EFFECT_CENTER_X_RATIO = 0.5;
const LASER_EFFECT_CENTER_Y_RATIO = 0.78;
const LASER_EFFECT_MIN_PIXEL_BRIGHTNESS = 180;
const LASER_EFFECT_STROKE_COLOR_FRAGMENT = "245, 247, 255";
const LASER_EFFECT_MIN_ALPHA = 0.8;
const LASER_EFFECT_MAX_ALPHA = 0.84;
const LASER_EFFECT_MIN_DRAW_COUNT = 9;
const POWER_UP_BRICK_WIDTH_RATIO = 0.7;
const POWER_UP_MIN_SIZE = 24;
const POWER_UP_MAX_SIZE = 56;
const POWER_UP_SIZE_TOLERANCE_PX = 1;
const EXPECTED_QA_SCENARIO = "laser-fan";
const EXPECTED_SCORE_REASON = "laser_fan";
const EXPECTED_MIN_SCORE = 10;
const REQUIRED_EVENT_TYPES = [
  "game_start",
  "power_up",
  "brick_destroyed",
  "score_update",
  "level_complete",
];
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const CINEMATIC_OVERLAY_TIMEOUT_MS = 3000;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRICKBREAKER_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env("BRICKBREAKER_LASER_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRICKBREAKER_LASER_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function itemScreenshotPath() {
  return env(
    "BRICKBREAKER_LASER_QA_ITEM_SCREENSHOT",
    DEFAULT_ITEM_SCREENSHOT_PATH,
  );
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

async function clearGameDatabases(page) {
  await page.evaluate(async () => {
    const names = [
      "BrickBreakerGameLog",
      "BrickBreakerCollisions",
      "SystemDebugLog",
      "breakout",
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

async function waitForCinematicOverlayToClear(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: CINEMATIC_OVERLAY_TIMEOUT_MS,
  });
}

async function installPowerUpDrawProbe(page) {
  await page.evaluateOnNewDocument(() => {
    window.__brickbreakerPowerUpDraws = [];
    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function drawImageProbe(
      image,
      ...args
    ) {
      const source = image?.currentSrc || image?.src || "";
      if (String(source).includes("/assets/visual/powerups/")) {
        const width = args.length >= 8 ? args[6] : args[2];
        const height = args.length >= 8 ? args[7] : args[3];
        window.__brickbreakerPowerUpDraws.push({
          source,
          width,
          height,
          timestamp: Date.now(),
        });
      }

      return originalDrawImage.call(this, image, ...args);
    };
  });
}

async function installLaserDrawProbe(page) {
  await page.evaluateOnNewDocument(
    ({ colorFragment, minAlpha, maxAlpha, xRatio, yRatio }) => {
      window.__brickbreakerLaserFanDraws = [];
      const originalStroke = CanvasRenderingContext2D.prototype.stroke;
      CanvasRenderingContext2D.prototype.stroke = function laserStrokeProbe(
        ...args
      ) {
        const strokeStyle = String(this.strokeStyle);
        const alpha = this.globalAlpha;
        const isLaserStroke =
          strokeStyle.includes(colorFragment) &&
          alpha >= minAlpha &&
          alpha <= maxAlpha;
        const result = originalStroke.apply(this, args);
        if (isLaserStroke) {
          const sampleX = Math.floor(this.canvas.width * xRatio);
          const sampleY = Math.floor(this.canvas.height * yRatio);
          const [red, green, blue, alphaChannel] = this.getImageData(
            sampleX,
            sampleY,
            1,
            1,
          ).data;
          window.__brickbreakerLaserFanDraws.push({
            strokeStyle,
            alpha,
            lineWidth: this.lineWidth,
            pixel: {
              red,
              green,
              blue,
              alpha: alphaChannel,
              brightness: red + green + blue,
            },
            timestamp: Date.now(),
          });
        }

        return result;
      };
    },
    {
      colorFragment: LASER_EFFECT_STROKE_COLOR_FRAGMENT,
      minAlpha: LASER_EFFECT_MIN_ALPHA,
      maxAlpha: LASER_EFFECT_MAX_ALPHA,
      xRatio: LASER_EFFECT_CENTER_X_RATIO,
      yRatio: LASER_EFFECT_CENTER_Y_RATIO,
    },
  );
}

async function waitForPowerUpDraw(page) {
  await page.waitForFunction(
    () => (window.__brickbreakerPowerUpDraws || []).length > 0,
    { timeout: MAX_WAIT_FOR_LASER_MS },
  );

  return page.evaluate(() => (window.__brickbreakerPowerUpDraws || [])[0]);
}

async function waitForLaserDrawSample(page) {
  await page.waitForFunction(
    (minDrawCount) =>
      (window.__brickbreakerLaserFanDraws || []).length >= minDrawCount,
    { timeout: MAX_WAIT_FOR_LASER_MS },
    LASER_EFFECT_MIN_DRAW_COUNT,
  );

  return page.evaluate(() => {
    const draws = window.__brickbreakerLaserFanDraws || [];
    const first = draws[0] || null;
    const last = draws[draws.length - 1] || null;
    return {
      first,
      last,
      count: draws.length,
      spanMs: first && last ? last.timestamp - first.timestamp : 0,
    };
  });
}

async function expectedPowerUpSize(page) {
  return page.evaluate(
    ({ minSize, maxSize, ratio }) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return null;
      const canvasWidth = canvas.width;
      const availableWidth = canvasWidth - 60;
      const minBrickWidth = 40;
      const maxBrickWidth = 120;
      let brickCols = Math.floor(availableWidth / (minBrickWidth + 10));
      brickCols = Math.max(3, Math.min(8, brickCols));
      const brickWidth = Math.max(
        minBrickWidth,
        Math.min(
          maxBrickWidth,
          (availableWidth - (brickCols - 1) * 10) / brickCols,
        ),
      );

      return Math.min(maxSize, Math.max(minSize, brickWidth * ratio));
    },
    {
      minSize: POWER_UP_MIN_SIZE,
      maxSize: POWER_UP_MAX_SIZE,
      ratio: POWER_UP_BRICK_WIDTH_RATIO,
    },
  );
}

async function waitForLaserCompletion(page) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion, reason }) => {
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

      return events.some(
        (event) =>
          event.type === "score_update" && event.metadata?.reason === reason,
      );
    },
    { timeout: MAX_WAIT_FOR_LASER_MS },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      reason: EXPECTED_SCORE_REASON,
    },
  );
}

async function collectLayoutState(page) {
  return page.evaluate(() => {
    function rectOf(element) {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      };
    }

    return {
      canvas: rectOf(document.querySelector("canvas")),
      scoreText: document.querySelector(".score-hud")?.textContent || "",
      levelToastText:
        document.querySelector('[data-testid="level-toast"]')?.textContent ||
        "",
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > window.innerWidth,
    };
  });
}

async function sampleLaserEffectPixel(page) {
  return page.evaluate(
    ({ xRatio, yRatio }) => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return null;
      const context = canvas.getContext("2d");
      if (!context) return null;
      const x = Math.floor(canvas.width * xRatio);
      const y = Math.floor(canvas.height * yRatio);
      const [red, green, blue, alpha] = context.getImageData(x, y, 1, 1).data;

      return {
        red,
        green,
        blue,
        alpha,
        brightness: red + green + blue,
      };
    },
    {
      xRatio: LASER_EFFECT_CENTER_X_RATIO,
      yRatio: LASER_EFFECT_CENTER_Y_RATIO,
    },
  );
}

async function run() {
  const targetUrl = withQaScenario(publicUrl());
  const parsed = new URL(targetUrl);
  assert(
    parsed.hostname === "brikaya.com",
    `URL precisa ser brikaya.com: ${targetUrl}`,
  );

  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  const outItemScreenshot = itemScreenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);
  ensureParentDirectory(outItemScreenshot);

  const consoleProblems = [];
  const externalRequests = [];
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(["--no-first-run", "--no-default-browser-check"]),
  });

  try {
    const page = await browser.newPage();
    await installPowerUpDrawProbe(page);
    await installLaserDrawProbe(page);
    await page.setViewport(VIEWPORT);
    page.on("console", (message) => {
      if (["error", "warn"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) =>
      consoleProblems.push({ type: "pageerror", text: error.message }),
    );
    page.on("request", (request) => {
      const requestUrl = new URL(request.url());
      if (
        requestUrl.protocol !== "data:" &&
        requestUrl.protocol !== "blob:" &&
        requestUrl.hostname !== parsed.hostname
      ) {
        externalRequests.push(request.url());
      }
    });

    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await clearGameDatabases(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForCinematicOverlayToClear(page);
    const firstPowerUpDraw = await waitForPowerUpDraw(page);
    const targetPowerUpSize = await expectedPowerUpSize(page);
    await new Promise((resolve) => setTimeout(resolve, 120));
    await page.screenshot({ path: outItemScreenshot, fullPage: true });

    const laserDrawWindow = await waitForLaserDrawSample(page);
    const laserEffectPixel =
      laserDrawWindow.last?.pixel || (await sampleLaserEffectPixel(page));
    await waitForLaserCompletion(page);
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
        return events.some((event) => event.type === "level_complete");
      },
      { timeout: MAX_WAIT_FOR_LASER_MS },
      {
        dbName: GAME_LOG_DB_NAME,
        storeName: GAME_LOG_STORE_NAME,
        dbVersion: GAME_LOG_DB_VERSION,
      },
    );

    const layoutState = await collectLayoutState(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });
    const events = await readGameEvents(page);
    const byType = summarizeEvents(events);
    const scoreEvents = events.filter((event) => event.type === "score_update");
    const laserScoreEvents = scoreEvents.filter(
      (event) => event.metadata?.reason === EXPECTED_SCORE_REASON,
    );
    const laserScoreEvent = laserScoreEvents[0] || null;
    const activatedPowerUpEvents = events.filter(
      (event) =>
        event.type === "power_up" &&
        event.metadata?.powerUpType === "laser_fan" &&
        event.metadata?.action === "activate",
    );
    const levelCompleteEvents = events.filter(
      (event) => event.type === "level_complete",
    );
    const report = {
      url: targetUrl,
      screenshotPath: outScreenshot,
      itemScreenshotPath: outItemScreenshot,
      byType,
      eventTypes: events.map((event) => event.type),
      laserScoreEvent: laserScoreEvent?.metadata || null,
      laserScoreEvents: laserScoreEvents.length,
      activatedPowerUpEvents: activatedPowerUpEvents.length,
      levelCompleteEvents: levelCompleteEvents.length,
      laserEffect: {
        minVisibleMs: LASER_EFFECT_MIN_VISIBLE_MS,
        sampleDelayMs: LASER_EFFECT_SAMPLE_DELAY_MS,
        pixel: laserEffectPixel,
        drawWindow: laserDrawWindow,
      },
      powerUpItem: {
        draw: firstPowerUpDraw,
        expectedSize: targetPowerUpSize,
        tolerancePx: POWER_UP_SIZE_TOLERANCE_PX,
      },
      layoutState,
      externalRequests,
      consoleProblems,
    };
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    for (const type of REQUIRED_EVENT_TYPES) {
      assert(
        report.eventTypes.includes(type),
        `Evento obrigatório ausente: ${type}`,
      );
    }
    assert(
      laserScoreEvents.length === 1,
      "Laser gerou score_update duplicado ou ausente.",
    );
    assert(
      activatedPowerUpEvents.length === 1,
      "Laser não registrou ativação de power_up.",
    );
    assert(
      (laserScoreEvent?.metadata?.pointsAdded || 0) >= EXPECTED_MIN_SCORE,
      "Laser não somou pontos suficientes.",
    );
    assert(
      laserScoreEvent?.metadata?.bricksRemaining === 0,
      "Laser não removeu todos os blocos.",
    );
    assert(
      levelCompleteEvents.length === 1,
      "Laser disparou level_complete duplicado ou ausente.",
    );
    assert(laserEffectPixel, "Laser não gerou amostra visual no canvas.");
    assert(
      report.laserEffect.drawWindow.count >= LASER_EFFECT_MIN_DRAW_COUNT,
      "Laser não desenhou o leque visual mínimo.",
    );
    assert(firstPowerUpDraw, "Item especial não foi desenhado no canvas.");
    assert(targetPowerUpSize, "Tamanho esperado do item especial não foi calculado.");
    assert(
      Math.abs(firstPowerUpDraw.width - targetPowerUpSize) <=
        POWER_UP_SIZE_TOLERANCE_PX,
      "Item especial não respeitou largura proporcional ao bloco.",
    );
    assert(
      Math.abs(firstPowerUpDraw.height - targetPowerUpSize) <=
        POWER_UP_SIZE_TOLERANCE_PX,
      "Item especial não respeitou altura proporcional ao bloco.",
    );
    assert(
      laserEffectPixel.brightness >= LASER_EFFECT_MIN_PIXEL_BRIGHTNESS,
      `Laser não permaneceu visualmente ativo por pelo menos ${LASER_EFFECT_MIN_VISIBLE_MS}ms.`,
    );
    assert((byType.restart_game || 0) === 0, "Laser registrou restart_game.");
    assert((byType.game_start || 0) === 1, "Laser gerou game_start extra.");
    assert(
      !layoutState.hasHorizontalOverflow,
      "Laser gerou overflow horizontal.",
    );
    assert(externalRequests.length === 0, "Laser gerou request externo.");
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
