// tests/e2e/cloudflare-mobile-qa.js
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import {
  acceptPrivacyConsentIfPresent,
  waitForInitialCountdownToFinish,
} from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_SCREENSHOT_PATH = "tmp/screenshots/cloudflare-mobile-qa.png";
const DEFAULT_MENU_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-mobile-menu.png";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-mobile-qa.json";
const GAMEPLAY_TELEMETRY_QUERY_PARAM = "gameplayTelemetry";
const GAMEPLAY_TELEMETRY_QUERY_VALUE = "1";
const RESPONSIVE_VIEWPORT_MATRIX_PATH = new URL(
  "./responsiveViewportMatrix.json",
  import.meta.url,
);
const SOURCE_INDEX_FILE_NAME = "index.html";
const SOURCE_INDEX_PATH = resolve(process.cwd(), SOURCE_INDEX_FILE_NAME);
const PUBLIC_TITLE_PATTERN = /<title>(.*?)<\/title>/i;
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
const MIN_TOUCH_TARGET_SIZE = 44;
const MAX_INITIAL_SCORE_AFTER_OBSERVATION = 260;
const OBSERVATION_DURATION_MS = 1500;
const MENU_PAUSE_OBSERVATION_MS = 1400;
const BROWSER_CLOSE_SETTLE_MS = 250;
const BROWSER_CLOSE_TIMEOUT_MS = 3000;
const BROWSER_CLOSE_TIMEOUT_MESSAGE = "browser close timeout";
const BROWSER_KILL_SIGNAL = "SIGKILL";
const BLANK_PAGE_URL = "about:blank";
const BLANK_PAGE_WAIT_UNTIL = "domcontentloaded";
const REQUIRED_EVENT_TYPES = ["game_start"];
const REQUIRED_DATABASE_NAMES = ["BrikayaGameLog"];
const MENU_BUTTON_NAME = /menu/i;
const CLOSE_BUTTON_NAME = /fechar|×|✕/i;
const SETTINGS_ACTION_LOGS = "logs";
const SETTINGS_ACTION_COLLISIONS = "collisions";
const SETTINGS_ACTION_RESTART_GAME = "restart-game";
const SETTINGS_ACTION_RESET_SCORE = "reset-score";
const PRE_GAME_ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const AD_SLOT_SELECTOR = ".ad-slot";
const AD_SLOT_BOTTOM_SELECTOR = ".ad-slot--bottom";
const PUBLICITY_LABEL = "Publicidade";
const CINEMATIC_OVERLAY_TIMEOUT_MS = 3000;
const THEME_AUTO_OPTION_ID = "auto-by-level";
const VISUAL_THEME_PRESET_PREFIX = "preset-";
const THEME_OPTION_IDS = [
  "neon-arcade",
  "crt-high-contrast",
  "pixel-sunset",
  "ocean-night",
  "jungle-laser",
  "amber-retro",
  "cosmic-ice",
  "electric-plum",
  "lime-graphite",
  "ruby-depth",
  "real-metro-night",
  "real-auto-garage",
  "real-bio-lab",
  "real-ancient-temple",
  "real-orbital-station",
];
const IMAGE_SET_OPTION_IDS = [
  "retro-default",
  "high-contrast",
  "sunset-cabinet",
  "real-metro-tunnel",
  "real-workshop-steel",
  "real-bio-lab-glass",
  "real-temple-stone",
  "real-orbital-deck",
];
const VISUAL_THEME_PRESET_OPTION_IDS = THEME_OPTION_IDS.map(
  (themeId) => `${VISUAL_THEME_PRESET_PREFIX}${themeId}`,
);
const FONT_SET_OPTION_IDS = ["arcade-ui", "crt-mono", "block-pixel"];
const APPEARANCE_OPTION_IDS = [
  THEME_AUTO_OPTION_ID,
  ...VISUAL_THEME_PRESET_OPTION_IDS,
  ...THEME_OPTION_IDS,
  ...IMAGE_SET_OPTION_IDS,
  ...FONT_SET_OPTION_IDS,
];
const RESPONSIVE_VIEWPORT_MATRIX = JSON.parse(
  readFileSync(RESPONSIVE_VIEWPORT_MATRIX_PATH, "utf8"),
);
const EXPECTED_PUBLIC_TITLE = extractRequiredMatch(
  readFileSync(SOURCE_INDEX_PATH, "utf8"),
  PUBLIC_TITLE_PATTERN,
  "título público local",
);
const VIEWPORTS = RESPONSIVE_VIEWPORT_MATRIX.viewports;
const MOBILE_DEFAULT_VIEWPORT = viewportByScreenshotRole("mobile-default");
const CANVAS_IMAGE_MIME_TYPE = "image/png";
const SCORE_VALUE_PATTERN = /Score\s+(\d+)/;
const EVENT_HEADER_SELECTOR = ".event-header";
const EVENT_DETAILS_SELECTOR = ".event-details";
const EVENT_DETAILS_WAIT_TIMEOUT_MS = 10000;
const PADDLE_TOUCH_ZONE_SELECTOR = '[data-testid="paddle-touch-zone"]';
const CSS_INCH_PX = 96;
const MIN_PADDLE_TOUCH_ZONE_HEIGHT = CSS_INCH_PX * 3;
const BASE_PADDLE_TOUCH_ZONE_HEIGHT = CSS_INCH_PX * 2;
const PADDLE_WIDTH_MIN = 51;
const PADDLE_WIDTH_MAX = 102;
const PADDLE_WIDTH_CANVAS_RATIO = 0.17;
const PADDLE_HEIGHT_WIDTH_RATIO = 0.15;
const TOUCH_DRAG_START_RATIO = 0.2;
const TOUCH_DRAG_END_RATIO = 0.8;
const TOUCH_DRAG_SETTLE_MS = 120;
const TOUCH_DRAG_EXPECTED_MOVE_COUNT = 2;
const PADDLE_MOVE_WAIT_TIMEOUT_MS = 10000;
const PADDLE_MOVE_POLL_MS = 250;
const LOWER_CANVAS_BAND_RATIO = 0.85;
const MOBILE_PORTRAIT_CANVAS_ASPECT_MIN = 0.98;
const MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX = 18;
const RECT_TOLERANCE_PX = 2;

function getPublicUrl() {
  const publicUrl = new URL(process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL);
  if (!publicUrl.searchParams.has(GAMEPLAY_TELEMETRY_QUERY_PARAM)) {
    publicUrl.searchParams.set(
      GAMEPLAY_TELEMETRY_QUERY_PARAM,
      GAMEPLAY_TELEMETRY_QUERY_VALUE,
    );
  }

  return publicUrl.toString();
}

function getScreenshotPath() {
  return process.env.BRIKAYA_MOBILE_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
}

function getMenuScreenshotPath() {
  return (
    process.env.BRIKAYA_MOBILE_MENU_SCREENSHOT || DEFAULT_MENU_SCREENSHOT_PATH
  );
}

function getReportPath() {
  return process.env.BRIKAYA_MOBILE_QA_REPORT || DEFAULT_REPORT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractRequiredMatch(content, pattern, label) {
  const match = content.match(pattern)?.[1] || content.match(pattern)?.[0];

  if (!match) {
    throw new Error(`Não foi possível ler ${label}.`);
  }

  return match;
}

function calculateExpectedPaddleTouchZoneTop(touchZoneState) {
  const canvas = touchZoneState.canvas;
  const intrinsicCanvas = touchZoneState.intrinsicCanvas;
  const paddleWidth = Math.max(
    PADDLE_WIDTH_MIN,
    Math.min(
      PADDLE_WIDTH_MAX,
      intrinsicCanvas.width * PADDLE_WIDTH_CANVAS_RATIO,
    ),
  );
  const paddleHeight = paddleWidth * PADDLE_HEIGHT_WIDTH_RATIO;
  const paddleCenterY =
    canvas.y +
    ((intrinsicCanvas.height - paddleHeight / 2) / intrinsicCanvas.height) *
      canvas.height;

  return paddleCenterY - BASE_PADDLE_TOUCH_ZONE_HEIGHT / 2;
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

function viewportByScreenshotRole(screenshotRole) {
  const viewport = VIEWPORTS.find(
    (candidate) => candidate.screenshotRole === screenshotRole,
  );
  assert(viewport, `Viewport com screenshotRole ${screenshotRole} ausente.`);
  return viewport;
}

function puppeteerViewport(viewport) {
  return {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: Math.min(
      viewport.deviceScaleFactor,
      MAX_QA_DEVICE_SCALE_FACTOR,
    ),
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  };
}

async function clickButtonByPattern(page, pattern) {
  return page.evaluate(
    ({ source, flags }) => {
      const matcher = new RegExp(source, flags);
      const button = Array.from(document.querySelectorAll("button")).find(
        (node) =>
          matcher.test(
            node.getAttribute("aria-label") ||
              node.getAttribute("title") ||
              node.textContent ||
              "",
          ),
      );
      if (!(button instanceof HTMLElement)) return false;
      button.scrollIntoView({ block: "center", inline: "center" });
      button.click();
      return true;
    },
    { source: pattern.source, flags: pattern.flags },
  );
}

async function clickSettingsAction(page, settingsAction) {
  const selector = `[data-settings-action="${settingsAction}"]`;
  const hasAction = await page.$(selector);
  if (!hasAction) {
    const openedMenu = await clickButtonByPattern(page, MENU_BUTTON_NAME);
    assert(openedMenu, "Menu lateral não reabriu para ação interna.");
    await page.waitForSelector(".settings-drawer", {
      timeout: EVENT_DETAILS_WAIT_TIMEOUT_MS,
    });
  }
  await page.waitForSelector(selector, {
    timeout: EVENT_DETAILS_WAIT_TIMEOUT_MS,
  });

  return page.evaluate((actionSelector) => {
    const button = document.querySelector(actionSelector);
    if (!(button instanceof HTMLElement)) return false;
    button.scrollIntoView({ block: "center", inline: "nearest" });
    button.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
    return true;
  }, selector);
}

async function openFirstEventDetails(
  page,
  refreshButtonMissingMessage,
  eventMissingMessage,
) {
  let firstEventHeader = await page.$(EVENT_HEADER_SELECTOR);
  if (!firstEventHeader) {
    const refreshedLogs = await clickButtonByPattern(page, /atualizar/i);
    assert(refreshedLogs, refreshButtonMissingMessage);
    await page.waitForFunction(
      (eventHeaderSelector) =>
        Boolean(document.querySelector(eventHeaderSelector)),
      { timeout: EVENT_DETAILS_WAIT_TIMEOUT_MS },
      EVENT_HEADER_SELECTOR,
    );
    firstEventHeader = await page.$(EVENT_HEADER_SELECTOR);
  }
  assert(firstEventHeader, eventMissingMessage);
  await page.evaluate((eventHeaderSelector) => {
    const header = document.querySelector(eventHeaderSelector);
    if (header instanceof HTMLElement) {
      header.click();
    }
  }, EVENT_HEADER_SELECTOR);
  await page.waitForSelector(EVENT_DETAILS_SELECTOR, {
    timeout: EVENT_DETAILS_WAIT_TIMEOUT_MS,
  });
}

async function waitForLogDetailLabels(page, speedLabel, timeLabel) {
  await page.waitForFunction(
    ({ expectedSpeedLabel, expectedTimeLabel }) => {
      const text = document.body.textContent || "";
      return (
        text.includes(expectedSpeedLabel) && text.includes(expectedTimeLabel)
      );
    },
    { timeout: EVENT_DETAILS_WAIT_TIMEOUT_MS },
    { expectedSpeedLabel: speedLabel, expectedTimeLabel: timeLabel },
  );
}

async function readIndexedDbSummary(page) {
  return page.evaluate(
    async (requiredDatabaseNames, requiredEventTypes) => {
      const databases = indexedDB.databases ? await indexedDB.databases() : [];
      const databaseNames = databases
        .map((database) => database.name)
        .filter(Boolean);
      const eventTypes = [];

      async function readEvents() {
        return new Promise((resolve) => {
          const request = indexedDB.open("BrikayaGameLog", 2);
          request.onerror = () => resolve([]);
          request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("gameEvents")) {
              db.close();
              resolve([]);
              return;
            }

            const transaction = db.transaction(["gameEvents"], "readonly");
            const store = transaction.objectStore("gameEvents");
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
      }

      const events = await readEvents();
      events.forEach((event) => {
        if (event?.type) eventTypes.push(event.type);
      });

      return {
        databaseNames,
        eventTypes,
        hasRequiredDatabases: requiredDatabaseNames.every((name) =>
          databaseNames.includes(name),
        ),
        hasRequiredEvents: requiredEventTypes.every((type) =>
          eventTypes.includes(type),
        ),
        eventCount: events.length,
        paddleMoveCount: events.filter((event) => event?.type === "paddle_move")
          .length,
        latestPaddleMove:
          events
            .filter((event) => event?.type === "paddle_move")
            .sort((left, right) => right.timestamp - left.timestamp)[0] || null,
      };
    },
    REQUIRED_DATABASE_NAMES,
    REQUIRED_EVENT_TYPES,
  );
}

async function waitForPaddleMoveCount(page, minimumCount) {
  const deadline = Date.now() + PADDLE_MOVE_WAIT_TIMEOUT_MS;
  let summary = await readIndexedDbSummary(page);

  while (Date.now() < deadline) {
    if (summary.paddleMoveCount >= minimumCount) return summary;
    await new Promise((resolve) => setTimeout(resolve, PADDLE_MOVE_POLL_MS));
    summary = await readIndexedDbSummary(page);
  }

  throw new Error(
    `Movimentos touch da raquete insuficientes: ${summary.paddleMoveCount} < ${minimumCount}.`,
  );
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

async function gotoCleanOrigin(page, targetUrl, origin) {
  await clearOriginState(page, origin);
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
}

async function waitForCinematicOverlayToClear(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: CINEMATIC_OVERLAY_TIMEOUT_MS,
  });
}

async function acceptPreGamePromptIfVisible(page) {
  const accepted = await page.evaluate((acceptLabel) => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.trim() === acceptLabel,
    );
    if (!button) return false;
    button.click();
    return true;
  }, PRE_GAME_ACCEPT_BUTTON_LABEL);

  if (accepted) {
    await page.waitForFunction(
      (acceptLabel) => !(document.body.textContent || "").includes(acceptLabel),
      { timeout: 10000 },
      PRE_GAME_ACCEPT_BUTTON_LABEL,
    );
  }
}

async function collectLayoutState(page) {
  return page.evaluate(
    (
      minTouchTargetSize,
      scoreValuePatternSource,
      adSlotSelector,
      adSlotBottomSelector,
      publicityLabel,
    ) => {
      const scoreValuePattern = new RegExp(scoreValuePatternSource);
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      };
      const buttons = Array.from(document.querySelectorAll("button")).map(
        (button) => {
          const rect = button.getBoundingClientRect();
          return {
            text: button.textContent?.trim() || "",
            ariaLabel: button.getAttribute("aria-label") || "",
            title: button.getAttribute("title") || "",
            settingsAction: button.getAttribute("data-settings-action") || "",
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              right: rect.right,
              bottom: rect.bottom,
            },
            visibleInViewport:
              rect.left >= 0 &&
              rect.top >= 0 &&
              rect.right <= window.innerWidth &&
              rect.bottom <= window.innerHeight,
            hasTouchTarget:
              rect.width >= minTouchTargetSize &&
              rect.height >= minTouchTargetSize,
            inDrawer: Boolean(button.closest(".settings-drawer")),
          };
        },
      );
      const canvasRect = document
        .querySelector("canvas")
        ?.getBoundingClientRect();
      const dashboardLayoutRect = document
        .querySelector(".dashboard-layout")
        ?.getBoundingClientRect();
      const scoreHudElement = document.querySelector(".score-hud");
      const scoreHudRect = scoreHudElement?.getBoundingClientRect();
      const scoreHudDisplay = scoreHudElement
        ? getComputedStyle(scoreHudElement).display
        : "none";
      const scoreHudText = scoreHudElement?.textContent || "";
      const buildVersionElement = document.querySelector(
        ".build-version-badge",
      );
      const buildVersionRect = buildVersionElement?.getBoundingClientRect();
      const bottomSlotRect = document
        .querySelector(adSlotBottomSelector)
        ?.getBoundingClientRect();
      const publicityLabelPattern = new RegExp(`\\b${publicityLabel}\\b`);
      const scoreValue = Number(
        scoreHudText.match(scoreValuePattern)?.[1] || 0,
      );

      return {
        title: document.title,
        heading: document.querySelector("h1")?.textContent || "",
        gameOverVisible: Boolean(document.querySelector(".game-over-message")),
        viewport,
        buttons,
        buildVersion: buildVersionElement
          ? {
              text: buildVersionElement.textContent?.trim() || "",
              ariaLabel: buildVersionElement.getAttribute("aria-label") || "",
              rect: buildVersionRect
                ? {
                    x: buildVersionRect.x,
                    y: buildVersionRect.y,
                    width: buildVersionRect.width,
                    height: buildVersionRect.height,
                    right: buildVersionRect.right,
                    bottom: buildVersionRect.bottom,
                  }
                : null,
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
        dashboardLayout: dashboardLayoutRect
          ? {
              x: dashboardLayoutRect.x,
              y: dashboardLayoutRect.y,
              width: dashboardLayoutRect.width,
              height: dashboardLayoutRect.height,
              right: dashboardLayoutRect.right,
              bottom: dashboardLayoutRect.bottom,
            }
          : null,
        scoreHud: scoreHudRect
          ? {
              x: scoreHudRect.x,
              y: scoreHudRect.y,
              width: scoreHudRect.width,
              height: scoreHudRect.height,
              right: scoreHudRect.right,
              bottom: scoreHudRect.bottom,
            }
          : null,
        scoreHudDisplay,
        scoreHudVisible:
          scoreHudDisplay !== "none" &&
          Boolean(scoreHudRect) &&
          scoreHudRect.width > 0 &&
          scoreHudRect.height > 0,
        scoreHudText,
        bottomSlot: bottomSlotRect
          ? {
              x: bottomSlotRect.x,
              y: bottomSlotRect.y,
              width: bottomSlotRect.width,
              height: bottomSlotRect.height,
              right: bottomSlotRect.right,
              bottom: bottomSlotRect.bottom,
            }
          : null,
        adSlotCount: document.querySelectorAll(adSlotSelector).length,
        publicityTextPresent: publicityLabelPattern.test(
          document.body.textContent || "",
        ),
        scoreValue,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth,
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    },
    MIN_TOUCH_TARGET_SIZE,
    SCORE_VALUE_PATTERN.source,
    AD_SLOT_SELECTOR,
    AD_SLOT_BOTTOM_SELECTOR,
    PUBLICITY_LABEL,
  );
}

async function collectDrawerState(page) {
  return page.evaluate(() => {
    const drawer = document.querySelector(".settings-drawer");
    const drawerRect = drawer?.getBoundingClientRect();

    return {
      text: drawer?.textContent || "",
      appearanceOptionIds: Array.from(
        drawer?.querySelectorAll("[data-appearance-option-id]") || [],
      ).map((option) => option.getAttribute("data-appearance-option-id") || ""),
      settingsActions: Array.from(
        drawer?.querySelectorAll("[data-settings-action]") || [],
      ).map((option) => option.getAttribute("data-settings-action") || ""),
      drawer: drawerRect
        ? {
            x: drawerRect.x,
            y: drawerRect.y,
            width: drawerRect.width,
            height: drawerRect.height,
            right: drawerRect.right,
            bottom: drawerRect.bottom,
          }
        : null,
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > window.innerWidth,
    };
  });
}

async function collectMenuPauseState(page) {
  const before = await page.evaluate(
    (canvasImageMimeType, scoreValuePatternSource) => {
      const scoreValuePattern = new RegExp(scoreValuePatternSource);
      const scoreHudText =
        document.querySelector(".score-hud")?.textContent || "";
      const canvas = document.querySelector("canvas");

      return {
        scoreHudText,
        scoreValue: Number(scoreHudText.match(scoreValuePattern)?.[1] || 0),
        canvasFrame: canvas?.toDataURL(canvasImageMimeType) || "",
      };
    },
    CANVAS_IMAGE_MIME_TYPE,
    SCORE_VALUE_PATTERN.source,
  );

  await new Promise((resolve) =>
    setTimeout(resolve, MENU_PAUSE_OBSERVATION_MS),
  );

  const after = await page.evaluate(
    (canvasImageMimeType, scoreValuePatternSource) => {
      const scoreValuePattern = new RegExp(scoreValuePatternSource);
      const scoreHudText =
        document.querySelector(".score-hud")?.textContent || "";
      const canvas = document.querySelector("canvas");

      return {
        scoreHudText,
        scoreValue: Number(scoreHudText.match(scoreValuePattern)?.[1] || 0),
        canvasFrame: canvas?.toDataURL(canvasImageMimeType) || "",
      };
    },
    CANVAS_IMAGE_MIME_TYPE,
    SCORE_VALUE_PATTERN.source,
  );

  return {
    beforeScoreHudText: before.scoreHudText,
    afterScoreHudText: after.scoreHudText,
    beforeScoreValue: before.scoreValue,
    afterScoreValue: after.scoreValue,
    beforeFrameLength: before.canvasFrame.length,
    afterFrameLength: after.canvasFrame.length,
    scoreStable: before.scoreValue === after.scoreValue,
    canvasFrameStable: before.canvasFrame === after.canvasFrame,
  };
}

async function collectPaddleTouchZoneState(page) {
  return page.evaluate((selector) => {
    const touchZone = document.querySelector(selector);
    const canvas = document.querySelector("canvas");
    const touchZoneRect = touchZone?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    const touchZoneStyle =
      touchZone instanceof HTMLElement ? getComputedStyle(touchZone) : null;

    return {
      exists: Boolean(touchZone),
      rect: touchZoneRect
        ? {
            x: touchZoneRect.x,
            y: touchZoneRect.y,
            width: touchZoneRect.width,
            height: touchZoneRect.height,
            right: touchZoneRect.right,
            bottom: touchZoneRect.bottom,
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
      intrinsicCanvas:
        canvas instanceof HTMLCanvasElement
          ? {
              width: canvas.width,
              height: canvas.height,
            }
          : null,
      display: touchZoneStyle?.display || "",
      pointerEvents: touchZoneStyle?.pointerEvents || "",
      touchAction: touchZoneStyle?.touchAction || "",
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }, PADDLE_TOUCH_ZONE_SELECTOR);
}

async function dispatchPaddleTouchDrag(page, touchZoneState) {
  const rect = touchZoneState.rect;
  const viewport = touchZoneState.viewport;
  const startX = rect.x + rect.width * TOUCH_DRAG_START_RATIO;
  const endX = rect.x + rect.width * TOUCH_DRAG_END_RATIO;
  const rawY = rect.y + rect.height / 2;
  const y = Math.max(
    RECT_TOLERANCE_PX,
    Math.min(rawY, viewport.height - RECT_TOLERANCE_PX),
  );
  const client = await page.target().createCDPSession();

  try {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: startX, y }],
    });
    await new Promise((resolve) => setTimeout(resolve, TOUCH_DRAG_SETTLE_MS));
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: endX, y }],
    });
    await new Promise((resolve) => setTimeout(resolve, TOUCH_DRAG_SETTLE_MS));
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  } finally {
    await client.detach();
  }

  return { startX, endX, y };
}

async function run() {
  const publicUrl = getPublicUrl();
  const parsed = new URL(publicUrl);
  const screenshotPath = getScreenshotPath();
  const menuScreenshotPath = getMenuScreenshotPath();
  const reportPath = getReportPath();
  ensureParentDirectory(screenshotPath);
  ensureParentDirectory(menuScreenshotPath);
  ensureParentDirectory(reportPath);

  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs([
      "--no-first-run",
      "--no-default-browser-check",
      ...CHROME_LOW_RESOURCE_ARGS,
    ]),
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(puppeteerViewport(MOBILE_DEFAULT_VIEWPORT));
    page.on("console", (message) => {
      if (["error", "warn"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) =>
      consoleProblems.push({ type: "pageerror", text: error.message }),
    );

    await gotoCleanOrigin(page, publicUrl, parsed.origin);
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await new Promise((resolve) =>
      setTimeout(resolve, OBSERVATION_DURATION_MS),
    );
    await waitForCinematicOverlayToClear(page);
    await acceptPreGamePromptIfVisible(page);

    const layoutState = await collectLayoutState(page);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    assert(
      layoutState.title === EXPECTED_PUBLIC_TITLE,
      "Título inesperado no app publicado.",
    );
    assert(
      layoutState.heading.includes("Brikaya"),
      "Tela inicial sem heading Brikaya.",
    );
    assert(layoutState.canvas, "Canvas não encontrado.");
    assert(
      !layoutState.hasHorizontalOverflow,
      `Há overflow horizontal: scrollWidth ${layoutState.viewport.scrollWidth} > viewport ${layoutState.viewport.width}.`,
    );
    assert(
      layoutState.canvas.right <= layoutState.viewport.width,
      "Canvas excede a largura do mobile default.",
    );
    assert(
      layoutState.dashboardLayout &&
        layoutState.canvas.width / layoutState.dashboardLayout.width >= 0.98,
      "Canvas não ocupa largura full-width no mobile default.",
    );
    assert(
      layoutState.canvas.height / layoutState.canvas.width >=
        MOBILE_PORTRAIT_CANVAS_ASPECT_MIN,
      "Canvas mobile portrait não ficou quadrado para maximizar a área útil.",
    );
    assert(layoutState.scoreHud, "HUD único de pontuação não encontrado.");
    assert(
      layoutState.scoreHudText.includes("Fase") &&
        layoutState.scoreHudText.includes("Score") &&
        layoutState.scoreHudText.includes("Total") &&
        layoutState.scoreHudText.includes("Recorde") &&
        layoutState.scoreHudText.split("|").length === 4,
      "HUD de pontuação não contém Fase | Score | Total | Recorde.",
    );
    assert(
      !layoutState.scoreHudVisible,
      "HUD deve ficar oculto na tela principal mobile.",
    );
    assert(
      layoutState.buttons.every((button) => button.visibleInViewport),
      `Botão fora da viewport: ${layoutState.buttons
        .filter((button) => !button.visibleInViewport)
        .map((button) => button.text)
        .join(", ")}`,
    );
    assert(
      layoutState.buttons.every((button) => button.hasTouchTarget),
      `Botão menor que alvo touch mínimo: ${layoutState.buttons
        .filter((button) => !button.hasTouchTarget)
        .map((button) => button.text)
        .join(", ")}`,
    );
    assert(
      layoutState.scoreValue <= MAX_INITIAL_SCORE_AFTER_OBSERVATION,
      `Jogo rápido demais no início: score ${layoutState.scoreValue}.`,
    );
    const mainButtons = layoutState.buttons.filter(
      (button) => !button.inDrawer,
    );
    assert(
      layoutState.buttons.some((button) => MENU_BUTTON_NAME.test(button.text)),
      "Botão Menu não encontrado no HUD compacto.",
    );
    const audioIcon = mainButtons.find((button) =>
      ["Som", "Sem som"].includes(button.ariaLabel),
    );
    const musicIcon = mainButtons.find((button) =>
      ["Música", "Sem música"].includes(button.ariaLabel),
    );
    assert(audioIcon, "Ícone de som não encontrado no canto principal.");
    assert(
      audioIcon.ariaLabel === "Sem som" && audioIcon.text === "×",
      "Estado inicial do som não começou mudo.",
    );
    assert(musicIcon, "Ícone de música não encontrado no canto principal.");
    assert(
      musicIcon.ariaLabel === "Música" && musicIcon.text === "♫",
      "Estado inicial da música não começou ativo.",
    );
    assert(
      layoutState.canvas,
      "Canvas ausente para validar posição dos ícones.",
    );
    assert(
      layoutState.adSlotCount === 0,
      `Publicidade não deve renderizar slots, mas encontrou ${layoutState.adSlotCount}.`,
    );
    assert(
      !layoutState.publicityTextPresent,
      "Texto Publicidade não deve aparecer enquanto não há anúncio real.",
    );
    const primaryControlsCenterX =
      (Math.min(audioIcon.rect.x, musicIcon.rect.x) +
        Math.max(audioIcon.rect.right, musicIcon.rect.right)) /
      2;
    assert(
      audioIcon.rect.bottom >=
        layoutState.viewport.height - MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX &&
        musicIcon.rect.bottom >=
          layoutState.viewport.height - MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX &&
        Math.abs(primaryControlsCenterX - layoutState.viewport.width / 2) <=
          MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX * 2,
      "Ícones de som/música não ficaram centralizados na base.",
    );
    const menuButton = mainButtons.find((button) =>
      MENU_BUTTON_NAME.test(button.text),
    );
    assert(
      menuButton &&
        menuButton.rect.right >=
          layoutState.viewport.width - MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX &&
        menuButton.rect.y <= MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX,
      "Menu não ficou no canto superior direito.",
    );
    if (layoutState.bottomSlot) {
      for (const button of [audioIcon, musicIcon]) {
        assert(
          button.rect.bottom <= layoutState.bottomSlot.y,
          `Ícone ${button.ariaLabel} invadiu a área de publicidade.`,
        );
      }
    }
    assert(
      !layoutState.buttons.some(
        (button) => button.settingsAction === SETTINGS_ACTION_LOGS,
      ),
      "Logs aparece fora do menu lateral.",
    );
    assert(
      !layoutState.buttons.some(
        (button) => button.settingsAction === SETTINGS_ACTION_COLLISIONS,
      ),
      "Colisões aparece fora do menu lateral.",
    );
    assert(
      !layoutState.buttons.some((button) =>
        /reiniciar|jogar de novo/i.test(button.text),
      ),
      "Reiniciar aparece fora do menu lateral.",
    );
    assert(
      !layoutState.buttons.some(
        (button) => button.settingsAction === SETTINGS_ACTION_RESET_SCORE,
      ),
      "Zerar pontuação aparece fora do menu lateral.",
    );

    await waitForInitialCountdownToFinish(page);
    const paddleTouchZoneState = await collectPaddleTouchZoneState(page);
    assert(paddleTouchZoneState.exists, "Faixa touch da raquete ausente.");
    assert(paddleTouchZoneState.rect, "Faixa touch da raquete sem retângulo.");
    assert(paddleTouchZoneState.canvas, "Canvas ausente na validação touch.");
    assert(
      paddleTouchZoneState.intrinsicCanvas,
      "Canvas sem dimensão interna na validação touch.",
    );
    assert(
      paddleTouchZoneState.display !== "none",
      "Faixa touch da raquete não ficou ativa em mobile.",
    );
    assert(
      paddleTouchZoneState.pointerEvents !== "none",
      "Faixa touch da raquete não recebe eventos em mobile.",
    );
    assert(
      paddleTouchZoneState.rect.height >= MIN_PADDLE_TOUCH_ZONE_HEIGHT,
      `Faixa touch menor que 3in: ${paddleTouchZoneState.rect.height}px.`,
    );
    const expectedPaddleTouchZoneTop =
      calculateExpectedPaddleTouchZoneTop(paddleTouchZoneState);
    assert(
      Math.abs(paddleTouchZoneState.rect.y - expectedPaddleTouchZoneTop) <=
        RECT_TOLERANCE_PX,
      `Faixa touch moveu no topo: ${paddleTouchZoneState.rect.y}px != ${expectedPaddleTouchZoneTop}px.`,
    );
    assert(
      Math.abs(
        paddleTouchZoneState.rect.width - paddleTouchZoneState.canvas.width,
      ) <= RECT_TOLERANCE_PX,
      "Faixa touch não acompanha a largura inteira do tabuleiro.",
    );
    assert(
      paddleTouchZoneState.rect.y + paddleTouchZoneState.rect.height / 2 >=
        paddleTouchZoneState.canvas.y +
          paddleTouchZoneState.canvas.height * LOWER_CANVAS_BAND_RATIO,
      "Faixa touch não está alinhada à região inferior da raquete.",
    );
    const beforeTouchSummary = await readIndexedDbSummary(page);
    const touchDragState = await dispatchPaddleTouchDrag(
      page,
      paddleTouchZoneState,
    );
    await new Promise((resolve) => setTimeout(resolve, TOUCH_DRAG_SETTLE_MS));
    const afterTouchSummary = await readIndexedDbSummary(page);
    const afterTouchLayout = await collectLayoutState(page);

    assert(
      touchDragState.endX - touchDragState.startX > RECT_TOLERANCE_PX,
      "Arraste touch não percorreu distância suficiente.",
    );
    assert(
      afterTouchSummary.eventTypes.includes("game_start"),
      "Arraste touch perdeu o registro de início do jogo.",
    );
    assert(
      !afterTouchLayout.gameOverVisible,
      "Jogo entrou em fim de jogo logo após o primeiro controle touch.",
    );
    const openedMenuForScreenshot = await clickButtonByPattern(
      page,
      MENU_BUTTON_NAME,
    );
    assert(openedMenuForScreenshot, "Menu lateral não abriu.");
    await page.waitForSelector(".settings-drawer", { timeout: 10000 });
    const menuState = await collectDrawerState(page);
    const menuPauseState = await collectMenuPauseState(page);
    await page.screenshot({ path: menuScreenshotPath, fullPage: true });
    assert(menuState.drawer, "Drawer do menu não encontrado.");
    assert(
      !menuState.hasHorizontalOverflow,
      "Menu lateral gerou overflow horizontal.",
    );
    assert(
      !menuState.text.includes("Partida"),
      "Menu lateral ainda mostra seção Partida.",
    );
    assert(
      /Reiniciar|Jogar de novo/.test(menuState.text),
      "Menu lateral não mostra ação Reiniciar/Jogar de novo.",
    );
    assert(/Versão v\d+/.test(menuState.text), "Menu lateral sem versão vN.");
    assert(
      !menuState.text.includes("Aparência"),
      "Menu lateral ainda mostra seção Aparência.",
    );
    assert(
      menuState.appearanceOptionIds.length === 0,
      "Menu lateral ainda mostra opções de aparência.",
    );
    for (const action of [
      SETTINGS_ACTION_RESTART_GAME,
      SETTINGS_ACTION_RESET_SCORE,
    ]) {
      assert(
        menuState.settingsActions.includes(action),
        `Menu lateral sem ação ${action}.`,
      );
    }
    assert(
      !menuState.settingsActions.includes(SETTINGS_ACTION_COLLISIONS),
      "Menu lateral ainda mostra ação de colisões.",
    );
    assert(
      !/Colisões|Collisions|Estatísticas de Colisões/i.test(menuState.text),
      "Menu lateral ainda mostra texto de colisões.",
    );
    assert(
      !menuState.settingsActions.includes(SETTINGS_ACTION_LOGS),
      "Menu lateral ainda mostra ação de logs.",
    );
    assert(
      !/Histórico|Logs|Game history|Game logs/i.test(menuState.text),
      "Menu lateral ainda mostra texto de logs.",
    );
    assert(
      menuPauseState.scoreStable,
      `Score mudou com menu aberto: ${menuPauseState.beforeScoreHudText} ` +
        `-> ${menuPauseState.afterScoreHudText}.`,
    );
    assert(
      menuPauseState.canvasFrameStable,
      "Canvas continuou renderizando com menu aberto.",
    );
    const indexedDbSummary = await readIndexedDbSummary(page);
    const historyState = null;

    const report = {
      publicUrl,
      viewportMatrixPath: "tests/e2e/responsiveViewportMatrix.json",
      viewportName: MOBILE_DEFAULT_VIEWPORT.name,
      screenshotPath,
      menuScreenshotPath,
      layoutState,
      paddleTouchZoneState,
      touchDragState,
      beforeTouchSummary,
      afterTouchSummary,
      menuState,
      menuPauseState,
      historyState,
      indexedDbSummary,
      consoleProblems,
    };
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    assert(
      indexedDbSummary.hasRequiredDatabases,
      "IndexedDB esperado não foi criado no app publicado.",
    );
    assert(
      indexedDbSummary.hasRequiredEvents,
      `Eventos obrigatórios ausentes: ${REQUIRED_EVENT_TYPES.join(", ")}.`,
    );
    assert(
      consoleProblems.length === 0,
      `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`,
    );

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await closeBrowser(browser);
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
