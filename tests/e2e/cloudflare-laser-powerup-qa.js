// tests/e2e/cloudflare-laser-powerup-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from './browserLauncher.js';

import { classifyExternalRequests } from "./allowed-external-requests.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";
import { isAllowedQaHostname } from "./publicQaEnv.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-laser-powerup-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-laser-powerup-qa.png";
const DEFAULT_ITEM_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-laser-powerup-item.png";
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
const MAX_WAIT_FOR_LASER_MS = 30000;
const LASER_EFFECT_MIN_VISIBLE_MS = 2000;
const LASER_EFFECT_SAMPLE_DELAY_MS = 1900;
const LASER_IMMEDIATE_SCORE_MAX_MS = 300;
const LASER_EFFECT_STROKE_COLOR_FRAGMENT = "255, 248, 199";
const LASER_EFFECT_MIN_DRAW_COUNT = 9;
const LASER_EFFECT_MIN_DRAW_SPAN_MS = 1000;
const LASER_EFFECT_MIN_UNIQUE_ALPHA_COUNT = 2;
const LASER_EFFECT_MIN_UNIQUE_LINE_WIDTH_COUNT = 2;
const LASER_EFFECT_VALUE_PRECISION = 3;
const POWER_UP_BRICK_WIDTH_RATIO = 0.7;
const POWER_UP_MIN_SIZE = 24;
const POWER_UP_MAX_SIZE = 56;
const POWER_UP_SIZE_TOLERANCE_PX = 1;
const EXPECTED_QA_SCENARIO = "laser-fan";
const EXPECTED_SCORE_REASON = "laser_fan";
const EXPECTED_LASER_TARGET_COUNT = 5;
const EXPECTED_LASER_SCORE = 50;
const LEVEL_COMPLETE_EVENT_TYPE = "level_complete";
const EVENT_WINDOW_THROUGH_FIRST_LASER_SCORE =
  "through_first_laser_score_update";
const REQUIRED_EVENT_TYPES = [
  "game_start",
  "power_up",
  "brick_destroyed",
  "score_update",
];
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const CINEMATIC_OVERLAY_TIMEOUT_MS = 3000;
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
  return env("BRIKAYA_LASER_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRIKAYA_LASER_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function itemScreenshotPath() {
  return env(
    "BRIKAYA_LASER_QA_ITEM_SCREENSHOT",
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
  pageUrl.searchParams.set("gameplayTelemetry", "1");
  return pageUrl.toString();
}

function isAllowedPublishedHost(hostname) {
  return isAllowedQaHostname(hostname);
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

function eventsThroughFirstLaserScore(events) {
  const completionIndex = events.findIndex(
    (event) =>
      event.type === "score_update" &&
      event.metadata?.reason === EXPECTED_SCORE_REASON,
  );

  if (completionIndex === -1) return events;

  return events.slice(0, completionIndex + 1);
}

async function waitForCinematicOverlayToClear(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: CINEMATIC_OVERLAY_TIMEOUT_MS,
  });
}

async function installPowerUpDrawProbe(page) {
  await page.evaluateOnNewDocument(() => {
    window.__brikayaPowerUpDraws = [];
    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function drawImageProbe(
      image,
      ...args
    ) {
      const source = image?.currentSrc || image?.src || "";
      if (String(source).includes("/assets/visual/powerups/")) {
        const width = args.length >= 8 ? args[6] : args[2];
        const height = args.length >= 8 ? args[7] : args[3];
        window.__brikayaPowerUpDraws.push({
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
    ({ colorFragment, valuePrecision }) => {
      window.__brikayaLaserFanDraws = [];
      window.__brikayaLaserFanPath = null;
      const originalMoveTo = CanvasRenderingContext2D.prototype.moveTo;
      const originalLineTo = CanvasRenderingContext2D.prototype.lineTo;
      const originalStroke = CanvasRenderingContext2D.prototype.stroke;

      CanvasRenderingContext2D.prototype.moveTo = function laserMoveProbe(
        x,
        y,
        ...args
      ) {
        window.__brikayaLaserFanPath = {
          startX: x,
          startY: y,
          endX: x,
          endY: y,
        };

        return originalMoveTo.call(this, x, y, ...args);
      };

      CanvasRenderingContext2D.prototype.lineTo = function laserLineProbe(
        x,
        y,
        ...args
      ) {
        window.__brikayaLaserFanPath = {
          ...(window.__brikayaLaserFanPath || {}),
          endX: x,
          endY: y,
        };

        return originalLineTo.call(this, x, y, ...args);
      };

      CanvasRenderingContext2D.prototype.stroke = function laserStrokeProbe(
        ...args
      ) {
        const strokeStyle = String(this.strokeStyle);
        const alpha = this.globalAlpha;
        const isLaserStroke = strokeStyle.includes(colorFragment);
        const result = originalStroke.apply(this, args);
        if (isLaserStroke) {
          window.__brikayaLaserFanDraws.push({
            strokeStyle,
            alpha,
            lineWidth: this.lineWidth,
            roundedAlpha: Number(alpha.toFixed(valuePrecision)),
            roundedLineWidth: Number(this.lineWidth.toFixed(valuePrecision)),
            path: window.__brikayaLaserFanPath || null,
            timestamp: Date.now(),
          });
        }

        return result;
      };
    },
    {
      colorFragment: LASER_EFFECT_STROKE_COLOR_FRAGMENT,
      valuePrecision: LASER_EFFECT_VALUE_PRECISION,
    },
  );
}

async function waitForPowerUpDraw(page) {
  await page.waitForFunction(
    () => (window.__brikayaPowerUpDraws || []).length > 0,
    { timeout: MAX_WAIT_FOR_LASER_MS },
  );

  return page.evaluate(() => (window.__brikayaPowerUpDraws || [])[0]);
}

async function waitForLaserDrawSample(page, screenshotPath) {
  await page.waitForFunction(
    (minDrawCount) =>
      (window.__brikayaLaserFanDraws || []).length >= minDrawCount,
    { timeout: MAX_WAIT_FOR_LASER_MS },
    LASER_EFFECT_MIN_DRAW_COUNT,
  );
  if (screenshotPath) {
    await page.screenshot({ path: screenshotPath });
  }
  await new Promise((resolve) =>
    setTimeout(resolve, LASER_EFFECT_SAMPLE_DELAY_MS),
  );

  return page.evaluate(() => {
    const draws = window.__brikayaLaserFanDraws || [];
    const first = draws[0] || null;
    const last = draws[draws.length - 1] || null;
    const uniqueAlphaCount = new Set(draws.map((draw) => draw.roundedAlpha))
      .size;
    const uniqueLineWidthCount = new Set(
      draws.map((draw) => draw.roundedLineWidth),
    ).size;
    const uniqueTargetPathCount = new Set(
      draws.map((draw) =>
        draw.path
          ? `${Math.round(draw.path.startX)}:${Math.round(draw.path.startY)}`
          : "missing",
      ),
    ).size;
    return {
      first,
      last,
      count: draws.length,
      uniqueAlphaCount,
      uniqueLineWidthCount,
      uniqueTargetPathCount,
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

async function run() {
  const targetUrl = withQaScenario(publicUrl());
  const parsed = new URL(targetUrl);
  assert(
    isAllowedPublishedHost(parsed.hostname),
    `URL publicada inválida: ${targetUrl}`,
  );

  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  const outItemScreenshot = itemScreenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);
  ensureParentDirectory(outItemScreenshot);

  const consoleProblems = [];
  const externalRequests = [];
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions({ extraArgs: [
      "--no-first-run",
      "--no-default-browser-check",
      ...CHROME_LOW_RESOURCE_ARGS,
    ] }));

  try {
    const page = await browser.newPage();
    await installPowerUpDrawProbe(page);
    await installLaserDrawProbe(page);
    await page.setViewport(qaViewport());
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

    await clearOriginState(page, parsed.origin);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await waitForCinematicOverlayToClear(page);
    const firstPowerUpDraw = await waitForPowerUpDraw(page);
    const targetPowerUpSize = await expectedPowerUpSize(page);
    await new Promise((resolve) => setTimeout(resolve, 120));
    await page.screenshot({ path: outItemScreenshot });

    const laserDrawWindow = await waitForLaserDrawSample(page, outScreenshot);
    await waitForLaserCompletion(page);

    const layoutState = await collectLayoutState(page);
    const events = await readGameEvents(page);
    const {
      allowedExternalRequests,
      unexpectedExternalRequests,
    } = classifyExternalRequests(externalRequests, targetUrl);
    const proofEvents = eventsThroughFirstLaserScore(events);
    const byType = summarizeEvents(proofEvents);
    const allByType = summarizeEvents(events);
    const scoreEvents = proofEvents.filter(
      (event) => event.type === "score_update",
    );
    const laserScoreEvents = scoreEvents.filter(
      (event) => event.metadata?.reason === EXPECTED_SCORE_REASON,
    );
    const laserScoreEvent = laserScoreEvents[0] || null;
    const activatedPowerUpEvents = proofEvents.filter(
      (event) =>
        event.type === "power_up" &&
        event.metadata?.powerUpType === "laser_fan" &&
        event.metadata?.action === "activate",
    );
    const activatedPowerUpEvent = activatedPowerUpEvents[0] || null;
    const brickDestroyedEvents = events.filter(
      (event) => event.type === "brick_destroyed",
    );
    const activatedPowerUpIndex = activatedPowerUpEvent
      ? events.indexOf(activatedPowerUpEvent)
      : -1;
    const firstBrickDestroyedEvent =
      events
        .slice(Math.max(0, activatedPowerUpIndex + 1))
        .find((event) => event.type === "brick_destroyed") || null;
    const levelCompleteEvents = events.filter(
      (event) => event.type === LEVEL_COMPLETE_EVENT_TYPE,
    );
    const scoreDelayMs =
      laserScoreEvent && activatedPowerUpEvent
        ? laserScoreEvent.timestamp - activatedPowerUpEvent.timestamp
        : null;
    const firstBrickDelayMs =
      firstBrickDestroyedEvent && activatedPowerUpEvent
        ? firstBrickDestroyedEvent.timestamp - activatedPowerUpEvent.timestamp
        : null;
    const report = {
      url: targetUrl,
      screenshotPath: outScreenshot,
      itemScreenshotPath: outItemScreenshot,
      byType,
      allByType,
      eventTypes: proofEvents.map((event) => event.type),
      allEventTypes: events.map((event) => event.type),
      eventWindow: EVENT_WINDOW_THROUGH_FIRST_LASER_SCORE,
      laserScoreEvent: laserScoreEvent?.metadata || null,
      laserScoreTiming: {
        activateTimestamp: activatedPowerUpEvent?.timestamp || null,
        scoreTimestamp: laserScoreEvent?.timestamp || null,
        firstBrickDestroyedTimestamp: firstBrickDestroyedEvent?.timestamp || null,
        scoreDelayMs,
        firstBrickDelayMs,
        immediateThresholdMs: LASER_IMMEDIATE_SCORE_MAX_MS,
      },
      laserScoreEvents: laserScoreEvents.length,
      activatedPowerUpEvents: activatedPowerUpEvents.length,
      levelCompleteEvents: levelCompleteEvents.length,
      laserEffect: {
        minVisibleMs: LASER_EFFECT_MIN_VISIBLE_MS,
        sampleDelayMs: LASER_EFFECT_SAMPLE_DELAY_MS,
        drawWindow: laserDrawWindow,
      },
      powerUpItem: {
        draw: firstPowerUpDraw,
        expectedSize: targetPowerUpSize,
        tolerancePx: POWER_UP_SIZE_TOLERANCE_PX,
      },
      layoutState,
      externalRequests,
      allowedExternalRequests,
      unexpectedExternalRequests,
      consoleProblems,
    };
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    for (const type of REQUIRED_EVENT_TYPES) {
      assert(
        report.allEventTypes.includes(type),
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
      laserScoreEvent?.metadata?.pointsAdded === EXPECTED_LASER_SCORE,
      "Laser não somou a pontuação dos cinco blocos.",
    );
    assert(
      Number.isFinite(scoreDelayMs) &&
        scoreDelayMs >= 0 &&
        scoreDelayMs <= LASER_IMMEDIATE_SCORE_MAX_MS,
      "Laser aguardou a animação antes de pontuar.",
    );
    assert(
      Number.isFinite(firstBrickDelayMs) &&
        firstBrickDelayMs >= 0 &&
        firstBrickDelayMs <= LASER_IMMEDIATE_SCORE_MAX_MS,
      "Laser aguardou a animação antes de destruir os blocos.",
    );
    assert(
      (allByType.brick_destroyed || 0) >= EXPECTED_LASER_TARGET_COUNT,
      "Laser não registrou os cinco blocos destruídos.",
    );
    assert(
      levelCompleteEvents.length === 0,
      "Laser completou a fase removendo mais do que cinco blocos.",
    );
    assert(
      report.laserEffect.drawWindow.count >= LASER_EFFECT_MIN_DRAW_COUNT,
      "Laser não desenhou rachaduras visuais suficientes.",
    );
    assert(
      report.laserEffect.drawWindow.spanMs >= LASER_EFFECT_MIN_DRAW_SPAN_MS,
      "Laser não permaneceu animado pelo intervalo mínimo.",
    );
    assert(
      report.laserEffect.drawWindow.uniqueAlphaCount >=
        LASER_EFFECT_MIN_UNIQUE_ALPHA_COUNT,
      "Laser não variou transparência entre frames.",
    );
    assert(
      report.laserEffect.drawWindow.uniqueLineWidthCount >=
        LASER_EFFECT_MIN_UNIQUE_LINE_WIDTH_COUNT,
      "Laser não variou espessura entre frames.",
    );
    assert(
      report.laserEffect.drawWindow.uniqueTargetPathCount >=
        EXPECTED_LASER_TARGET_COUNT,
      "Laser não animou cinco blocos distintos.",
    );
    assert(firstPowerUpDraw, "Item especial não foi desenhado no canvas.");
    assert(
      targetPowerUpSize,
      "Tamanho esperado do item especial não foi calculado.",
    );
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
    assert((byType.restart_game || 0) === 0, "Laser registrou restart_game.");
    assert((byType.game_start || 0) === 1, "Laser gerou game_start extra.");
    assert(
      !layoutState.hasHorizontalOverflow,
      "Laser gerou overflow horizontal.",
    );
    assert(
      unexpectedExternalRequests.length === 0,
      `Laser gerou request externo inesperado: ${unexpectedExternalRequests.join(", ")}`,
    );
    assert(
      consoleProblems.length === 0,
      `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`,
    );
  } finally {
    await closeBrowser(browser);
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
