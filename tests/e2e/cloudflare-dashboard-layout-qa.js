// tests/e2e/cloudflare-dashboard-layout-qa.js
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import {
  acceptPrivacyConsentIfPresent,
  waitForInitialCountdownToFinish,
} from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-dashboard-layout.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout.png";
const DEFAULT_DESKTOP_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout-desktop.png";
const DEFAULT_LANDSCAPE_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout-landscape.png";
const DEFAULT_TABLET_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout-tablet.png";
const DASHBOARD_QA_TRACE_ENV_KEY = "BRICKBREAKER_DASHBOARD_QA_TRACE";
const RESPONSIVE_VIEWPORT_MATRIX_PATH = new URL(
  "./responsiveViewportMatrix.json",
  import.meta.url,
);
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
const MIN_SIDE_AD_DISTANCE_PX = 150;
const MIN_BOTTOM_AD_DISTANCE_PX = 24;
const MIN_LANDSCAPE_CANVAS_HEIGHT_RATIO = 0.68;
const MIN_LANDSCAPE_CANVAS_WIDTH_RATIO = 0.96;
const MIN_IMMERSIVE_CANVAS_HEIGHT_RATIO = 0.68;
const MIN_IMMERSIVE_BOARD_AREA_USAGE_RATIO = 0.9;
const MIN_FULL_WIDTH_CANVAS_RATIO = 0.98;
const MIN_FULL_WIDTH_BOARD_RATIO = 0.95;
const MIN_MOBILE_FOCUSED_CANVAS_ASPECT_RATIO = 0.98;
const MIN_MOBILE_LANDSCAPE_FOCUSED_CANVAS_HEIGHT_RATIO = 0.94;
const MOBILE_FOCUSED_MAX_VIEWPORT_WIDTH = 480;
const MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX = 18;
const MIN_HEIGHT_CONSTRAINED_CANVAS_VIEWPORT_WIDTH_RATIO = 0.6;
const MAX_CANVAS_OVERLAP_PX = 2;
const IMMERSIVE_ROOT_CLASS = "bb-landscape-immersive";
const MAX_IMMERSIVE_SAFE_AREA_RESERVE_PX = 32;
const BROWSER_CLOSE_SETTLE_MS = 250;
const BROWSER_CLOSE_TIMEOUT_MS = 3000;
const BROWSER_CLOSE_TIMEOUT_MESSAGE = "browser close timeout";
const BROWSER_KILL_SIGNAL = "SIGKILL";
const PAGE_CLOSE_TIMEOUT_MS = 1500;
const PAGE_CLOSE_TIMEOUT_MESSAGE = "page close timeout";
const MAX_VIEWPORT_ATTEMPTS = 2;
const VIEWPORT_BROWSER_RECYCLE_INTERVAL = 4;
const RECOVERABLE_BROWSER_ERROR_PATTERNS = [
  "ERR_CERT_VERIFIER_CHANGED",
  "Navigating frame was detached",
  "Protocol error",
  "Target closed",
];
const BLANK_PAGE_URL = "about:blank";
const BLANK_PAGE_WAIT_UNTIL = "domcontentloaded";
const MENU_BUTTON_NAME = /menu/i;
const CLOSE_BUTTON_NAME = /fechar|×|✕/i;
const AD_SLOT_SELECTOR = ".ad-slot";
const AD_SLOT_SIDE_SELECTOR = ".ad-slot--side";
const AD_SLOT_BOTTOM_SELECTOR = ".ad-slot--bottom";
const PUBLICITY_LABEL = "Publicidade";
const SETTINGS_ACTION_LOGS = "logs";
const SETTINGS_ACTION_COLLISIONS = "collisions";
const SETTINGS_ACTION_RESET_SCORE = "reset-score";
const SPEED_CURRENT_LABEL = "Velocidade atual";
const LEVEL_TIME_LABEL = "Tempo da fase";
const COLLISIONS_PANEL_TITLE = "Estatísticas de Colisões";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const CINEMATIC_OVERLAY_TIMEOUT_MS = 3000;
const EVENT_HEADER_SELECTOR = ".event-header";
const EVENT_DETAILS_SELECTOR = ".event-details";
const EVENT_DETAILS_WAIT_TIMEOUT_MS = 10000;
const RESPONSIVE_VIEWPORT_MATRIX = JSON.parse(
  readFileSync(RESPONSIVE_VIEWPORT_MATRIX_PATH, "utf8"),
);
const VIEWPORTS = RESPONSIVE_VIEWPORT_MATRIX.viewports;
const OVERLAY_TARGET_VIEWPORTS = VIEWPORTS.filter(
  (viewport) => viewport.smokeOverlays,
).map((viewport) => viewport.name);
const LANDSCAPE_VIEWPORT_NAME =
  viewportByScreenshotRole("landscape-default").name;

function isMobilePortraitFocusedState(state) {
  return (
    state.viewport.width <= MOBILE_FOCUSED_MAX_VIEWPORT_WIDTH &&
    state.viewport.width <= state.viewport.height
  );
}

function isMobileLandscapeFocusedViewport(viewport) {
  return viewport.category === "mobile" && viewport.orientation === "landscape";
}

function publicUrl() {
  return process.env.BRICKBREAKER_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRICKBREAKER_DASHBOARD_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return (
    process.env.BRICKBREAKER_DASHBOARD_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH
  );
}

function desktopScreenshotPath() {
  return (
    process.env.BRICKBREAKER_DASHBOARD_DESKTOP_SCREENSHOT ||
    DEFAULT_DESKTOP_SCREENSHOT_PATH
  );
}

function landscapeScreenshotPath() {
  return (
    process.env.BRICKBREAKER_DASHBOARD_LANDSCAPE_SCREENSHOT ||
    DEFAULT_LANDSCAPE_SCREENSHOT_PATH
  );
}

function tabletScreenshotPath() {
  return (
    process.env.BRICKBREAKER_DASHBOARD_TABLET_SCREENSHOT ||
    DEFAULT_TABLET_SCREENSHOT_PATH
  );
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function trace(message) {
  const tracePath = process.env[DASHBOARD_QA_TRACE_ENV_KEY];
  if (!tracePath) return;
  ensureParentDirectory(tracePath);
  writeFileSync(tracePath, `${new Date().toISOString()} ${message}\n`, {
    flag: "a",
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function closePage(page) {
  if (page.isClosed()) return;
  try {
    await Promise.race([
      page.close({ runBeforeUnload: false }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(PAGE_CLOSE_TIMEOUT_MESSAGE)),
          PAGE_CLOSE_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch {
    return;
  }
}

async function createQaPage(browser, consoleProblems) {
  const page = await browser.newPage();
  page.on("console", (message) => {
    if (["error", "warn"].includes(message.type())) {
      consoleProblems.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push({ type: "pageerror", text: error.message }),
  );
  return page;
}

function isRecoverableBrowserError(error) {
  const message = error?.message || "";
  return RECOVERABLE_BROWSER_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

function launchQaBrowser() {
  return puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs([
      "--no-first-run",
      "--no-default-browser-check",
      ...CHROME_LOW_RESOURCE_ARGS,
    ]),
  });
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

async function setQaViewport(page, viewport) {
  await page.setViewport(puppeteerViewport(viewport));
}

function rectsIntersect(firstRect, secondRect, tolerancePx = 0) {
  if (!firstRect || !secondRect) return false;

  return !(
    firstRect.right <= secondRect.x + tolerancePx ||
    secondRect.right <= firstRect.x + tolerancePx ||
    firstRect.bottom <= secondRect.y + tolerancePx ||
    secondRect.bottom <= firstRect.y + tolerancePx
  );
}

function describeButton(button) {
  return button.ariaLabel || button.title || button.text || "botão";
}

async function collectLayoutState(page, viewportName) {
  return page.evaluate(
    ({
      minTouchTargetSize,
      minSideAdDistance,
      minBottomAdDistance,
      viewportName,
      immersiveRootClass,
      adSlotSelector,
      adSlotSideSelector,
      adSlotBottomSelector,
      publicityLabel,
    }) => {
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
      function displayOf(element) {
        return element ? getComputedStyle(element).display : "none";
      }

      const viewport = {
        name: viewportName,
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        bodyScrollWidth: document.body.scrollWidth,
        bodyScrollHeight: document.body.scrollHeight,
      };
      const rootElement = document.getElementById("root");
      const rootRect = rectOf(rootElement);
      const appShell = rectOf(document.querySelector(".app-shell"));
      const dashboard = rectOf(document.querySelector(".game-dashboard"));
      const buildVersionElement = document.querySelector(
        ".build-version-badge",
      );
      const buildVersion = rectOf(buildVersionElement);
      const dashboardLayout = rectOf(
        document.querySelector(".dashboard-layout"),
      );
      const playColumn = rectOf(document.querySelector(".play-column"));
      const gameSurface = rectOf(document.querySelector(".game-surface"));
      const boardFrame = rectOf(document.querySelector(".game-board-frame"));
      const canvas = rectOf(document.querySelector("canvas"));
      const header = rectOf(document.querySelector(".dashboard-header"));
      const titleGroupElement = document.querySelector(
        ".dashboard-title-group",
      );
      const titleGroup = rectOf(titleGroupElement);
      const titleGroupDisplay = titleGroupElement
        ? getComputedStyle(titleGroupElement).display
        : "";
      const scoreHudElement = document.querySelector(".score-hud");
      const scoreHud = rectOf(scoreHudElement);
      const scoreHudDisplay = displayOf(scoreHudElement);
      const topControls = rectOf(
        document.querySelector(".dashboard-primary-controls"),
      );
      const boardControls = rectOf(
        document.querySelector(".game-board-controls"),
      );
      const sideSlotElement = document.querySelector(adSlotSideSelector);
      const bottomSlotElement = document.querySelector(adSlotBottomSelector);
      const sideSlot = rectOf(sideSlotElement);
      const bottomSlot = rectOf(bottomSlotElement);
      const sideSlotDisplay = displayOf(sideSlotElement);
      const bottomSlotDisplay = displayOf(bottomSlotElement);
      const publicityLabelPattern = new RegExp(`\\b${publicityLabel}\\b`);
      const buttons = Array.from(document.querySelectorAll("button")).map(
        (button) => {
          const rect = button.getBoundingClientRect();
          return {
            text: button.textContent?.trim() || "",
            ariaLabel: button.getAttribute("aria-label") || "",
            title: button.getAttribute("title") || "",
            settingsAction: button.getAttribute("data-settings-action") || "",
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
            right: rect.right,
            bottom: rect.bottom,
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
      const hasHorizontalOverflow =
        document.documentElement.scrollWidth > window.innerWidth;
      const sideSlotVisible =
        Boolean(sideSlot) &&
        sideSlotDisplay !== "none" &&
        sideSlot.width > 0 &&
        sideSlot.height > 0;
      const bottomSlotVisible =
        Boolean(bottomSlot) &&
        bottomSlotDisplay !== "none" &&
        bottomSlot.width > 0 &&
        bottomSlot.height > 0;
      const sideAdDistance =
        sideSlotVisible && canvas ? sideSlot.x - canvas.right : null;
      const bottomAdDistance =
        bottomSlotVisible && canvas ? bottomSlot.y - canvas.bottom : null;

      return {
        viewport,
        root: rootRect,
        appShell,
        dashboard,
        dashboardLayout,
        playColumn,
        gameSurface,
        boardFrame,
        buildVersion: buildVersionElement
          ? {
              text: buildVersionElement.textContent?.trim() || "",
              ariaLabel: buildVersionElement.getAttribute("aria-label") || "",
              rect: buildVersion,
            }
          : null,
        isLandscapeImmersive:
          document.documentElement.classList.contains(immersiveRootClass),
        heading: document.querySelector("h1")?.textContent || "",
        scoreHudText: scoreHudElement?.textContent?.trim() || "",
        canvas,
        header,
        titleGroup,
        titleGroupVisible:
          Boolean(titleGroup) &&
          titleGroupDisplay !== "none" &&
          titleGroup.width > 0 &&
          titleGroup.height > 0,
        scoreHud,
        scoreHudDisplay,
        scoreHudVisible:
          scoreHudDisplay !== "none" &&
          Boolean(scoreHud) &&
          scoreHud.width > 0 &&
          scoreHud.height > 0,
        topControls,
        boardControls,
        buttons,
        sideSlot,
        bottomSlot,
        sideSlotVisible,
        bottomSlotVisible,
        adSlotCount: document.querySelectorAll(adSlotSelector).length,
        publicityTextPresent: publicityLabelPattern.test(
          document.body.textContent || "",
        ),
        sideAdDistance,
        bottomAdDistance,
        minSideAdDistance,
        minBottomAdDistance,
        hasHorizontalOverflow,
      };
    },
    {
      minTouchTargetSize: MIN_TOUCH_TARGET_SIZE,
      minSideAdDistance: MIN_SIDE_AD_DISTANCE_PX,
      minBottomAdDistance: MIN_BOTTOM_AD_DISTANCE_PX,
      viewportName,
      immersiveRootClass: IMMERSIVE_ROOT_CLASS,
      adSlotSelector: AD_SLOT_SELECTOR,
      adSlotSideSelector: AD_SLOT_SIDE_SELECTOR,
      adSlotBottomSelector: AD_SLOT_BOTTOM_SELECTOR,
      publicityLabel: PUBLICITY_LABEL,
    },
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
  void origin;
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
}

async function readEventCountsSince(page, minTimestamp) {
  return page.evaluate(async (timestamp) => {
    async function readEvents() {
      return new Promise((resolve) => {
        const request = indexedDB.open("BrickBreakerGameLog", 2);
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

    const events = (await readEvents()).filter(
      (event) => event.timestamp >= timestamp,
    );
    const byType = events.reduce((accumulator, event) => {
      accumulator[event.type] = (accumulator[event.type] || 0) + 1;
      return accumulator;
    }, {});

    return {
      count: events.length,
      byType,
    };
  }, minTimestamp);
}

async function waitForEventTypeSince(page, minTimestamp, eventType) {
  const timeoutAt = Date.now() + 10000;

  while (Date.now() < timeoutAt) {
    const summary = await readEventCountsSince(page, minTimestamp);
    if ((summary.byType[eventType] || 0) > 0) {
      return summary;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Evento ${eventType} não apareceu no prazo esperado.`);
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
  return page.evaluate((action) => {
    const button = document.querySelector(`[data-settings-action="${action}"]`);
    if (!(button instanceof HTMLElement)) return false;
    button.scrollIntoView({ block: "center", inline: "center" });
    button.click();
    return true;
  }, settingsAction);
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

async function collectOverlayLayoutState(page) {
  return page.evaluate(() => ({
    hasHorizontalOverflow:
      document.documentElement.scrollWidth > window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
}

async function waitForCinematicOverlayToClear(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: CINEMATIC_OVERLAY_TIMEOUT_MS,
  });
}

async function run() {
  const targetUrl = publicUrl();
  const parsed = new URL(targetUrl);
  assert(
    parsed.hostname === "brikaya.com",
    `URL precisa ser brikaya.com: ${targetUrl}`,
  );

  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  const outDesktopScreenshot = desktopScreenshotPath();
  const outLandscapeScreenshot = landscapeScreenshotPath();
  const outTabletScreenshot = tabletScreenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);
  ensureParentDirectory(outDesktopScreenshot);
  ensureParentDirectory(outLandscapeScreenshot);
  ensureParentDirectory(outTabletScreenshot);

  const consoleProblems = [];
  let browser = await launchQaBrowser();

  try {
    const cleanupPage = await browser.newPage();
    try {
      await clearOriginState(cleanupPage, parsed.origin);
    } finally {
      await closePage(cleanupPage);
    }

    const results = [];
    trace("loop:start");
    for (const [viewportIndex, viewport] of VIEWPORTS.entries()) {
      trace(`viewport:start:${viewport.name}`);
      let viewportComplete = false;
      for (
        let attempt = 1;
        attempt <= MAX_VIEWPORT_ATTEMPTS && !viewportComplete;
        attempt += 1
      ) {
        const page = await createQaPage(browser, consoleProblems);
        try {
          await setQaViewport(page, viewport);
          await gotoCleanOrigin(page, targetUrl, parsed.origin);
          await page.waitForSelector("canvas", { timeout: 30000 });
          await acceptPrivacyConsentIfPresent(page);
          await waitForCinematicOverlayToClear(page);
          await new Promise((resolve) => setTimeout(resolve, 600));
          const state = await collectLayoutState(page, viewport.name);
          results.push(state);
          trace(`viewport:state:${viewport.name}`);

          assert(
            state.heading.includes("Brikaya"),
            `${viewport.name}: heading ausente.`,
          );
          assert(
            !state.hasHorizontalOverflow,
            `${viewport.name}: overflow horizontal ${state.viewport.scrollWidth} > ${state.viewport.width}.`,
          );
          assert(state.canvas, `${viewport.name}: canvas ausente.`);
          assert(
            state.canvas.x >= 0 && state.canvas.right <= state.viewport.width,
            `${viewport.name}: canvas excede viewport.`,
          );
          assert(
            state.canvas.y >= 0 && state.canvas.bottom <= state.viewport.height,
            `${viewport.name}: canvas excede altura visível.`,
          );
          const isImmersiveLandscape = state.isLandscapeImmersive;
          const isMobilePortraitFocused = isMobilePortraitFocusedState(state);
          const isMobileLandscapeFocused =
            isMobileLandscapeFocusedViewport(viewport);
          const usesMobileControlsBottom =
            isMobilePortraitFocused || isMobileLandscapeFocused;
          assert(
            !isImmersiveLandscape ||
              state.canvas.bottom <= state.viewport.height,
            `${viewport.name}: canvas não fica inteiro visível no modo imersivo.`,
          );
          if (!isImmersiveLandscape) {
            const hasFullWidthCanvas =
              state.dashboardLayout &&
              state.canvas.width / state.dashboardLayout.width >=
                MIN_FULL_WIDTH_CANVAS_RATIO;
            const hasHeightConstrainedPlayableCanvas =
              state.canvas.width / state.viewport.width >=
              MIN_HEIGHT_CONSTRAINED_CANVAS_VIEWPORT_WIDTH_RATIO;
            assert(
              hasFullWidthCanvas || hasHeightConstrainedPlayableCanvas,
              `${viewport.name}: canvas não tem largura jogável no viewport.`,
            );
            assert(
              state.dashboardLayout &&
                state.boardFrame &&
                state.boardFrame.width / state.dashboardLayout.width >=
                  MIN_FULL_WIDTH_BOARD_RATIO,
              `${viewport.name}: quadro do jogo não ocupa 95% da largura útil do dashboard.`,
            );
          }
          if (isMobilePortraitFocused) {
            assert(
              state.canvas.height / state.canvas.width >=
                MIN_MOBILE_FOCUSED_CANVAS_ASPECT_RATIO,
              `${viewport.name}: canvas mobile portrait não ficou quadrado.`,
            );
          }
          if (isMobileLandscapeFocused) {
            assert(
              state.canvas.height / state.viewport.height >=
                MIN_MOBILE_LANDSCAPE_FOCUSED_CANVAS_HEIGHT_RATIO,
              `${viewport.name}: canvas mobile landscape não usa altura full-height.`,
            );
          }
          assert(
            state.header && state.scoreHud && state.topControls,
            `${viewport.name}: header/HUD/controles ausentes.`,
          );
          assert(
            state.header.height <= Math.max(96, state.viewport.height * 0.2),
            `${viewport.name}: header alto demais para HUD compacto.`,
          );
          assert(
            state.scoreHudText.includes("Fase"),
            `${viewport.name}: fase ausente no HUD único.`,
          );
          assert(
            state.scoreHudText.includes("Score"),
            `${viewport.name}: score ausente no HUD único.`,
          );
          assert(
            state.scoreHudText.includes("Total"),
            `${viewport.name}: total ausente no HUD único.`,
          );
          assert(
            state.scoreHudText.includes("Recorde"),
            `${viewport.name}: recorde ausente no HUD único.`,
          );
          assert(
            state.scoreHudText.split("|").length === 4,
            `${viewport.name}: HUD não usa badge único com quatro segmentos.`,
          );
          assert(
            state.buttons.every((button) => button.hasTouchTarget),
            `${viewport.name}: botão menor que 44px: ${state.buttons
              .filter((button) => !button.hasTouchTarget)
              .map((button) => button.text)
              .join(", ")}.`,
          );
          assert(
            !isImmersiveLandscape ||
              state.buttons.every((button) => button.visibleInViewport),
            `${viewport.name}: botão cortado no modo imersivo: ${state.buttons
              .filter((button) => !button.visibleInViewport)
              .map((button) => button.text)
              .join(", ")}.`,
          );
          assert(
            state.buttons.some((button) => MENU_BUTTON_NAME.test(button.text)),
            `${viewport.name}: menu inacessível.`,
          );
          const mainButtons = state.buttons.filter(
            (button) => !button.inDrawer,
          );
          const audioIcon = mainButtons.find((button) =>
            ["Som", "Sem som"].includes(button.ariaLabel),
          );
          const musicIcon = mainButtons.find((button) =>
            ["Música", "Sem música"].includes(button.ariaLabel),
          );
          const restartIcon = mainButtons.find(
            (button) =>
              /reiniciar|jogar de novo/i.test(button.ariaLabel) &&
              button.text === "↻",
          );
          assert(
            audioIcon,
            `${viewport.name}: ícone de som ausente na tela principal.`,
          );
          assert(
            audioIcon.ariaLabel === "Sem som" && audioIcon.text === "×",
            `${viewport.name}: estado inicial do som não começou mudo.`,
          );
          assert(
            musicIcon,
            `${viewport.name}: ícone de música ausente na tela principal.`,
          );
          assert(
            musicIcon.ariaLabel === "Música" && musicIcon.text === "♫",
            `${viewport.name}: estado inicial da música não começou ativo.`,
          );
          assert(
            restartIcon,
            `${viewport.name}: ícone Reiniciar/Jogar de novo ausente na tela principal.`,
          );
          if (usesMobileControlsBottom) {
            assert(
              state.topControls &&
                state.topControls.x <= MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX &&
                state.topControls.bottom >=
                  state.viewport.height - MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX,
              `${viewport.name}: controles principais não ficaram na base esquerda.`,
            );
            const menuButton = mainButtons.find((button) =>
              MENU_BUTTON_NAME.test(button.text),
            );
            assert(
              menuButton &&
                menuButton.right >=
                  state.viewport.width - MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX &&
                menuButton.y <= MOBILE_FIXED_CONTROL_EDGE_OFFSET_PX,
              `${viewport.name}: menu não ficou no canto superior direito.`,
            );
            assert(
              !state.scoreHudVisible,
              `${viewport.name}: HUD deveria ficar oculto no mobile.`,
            );
          } else {
            for (const button of [audioIcon, musicIcon, restartIcon]) {
              assert(
                button.bottom <= state.canvas.y,
                `${viewport.name}: ícone ${button.ariaLabel} não ficou no topo da tela.`,
              );
            }
          }
          assert(
            !state.buttons.some(
              (button) => button.settingsAction === SETTINGS_ACTION_LOGS,
            ),
            `${viewport.name}: histórico apareceu fora do menu.`,
          );
          assert(
            !state.buttons.some(
              (button) => button.settingsAction === SETTINGS_ACTION_COLLISIONS,
            ),
            `${viewport.name}: colisões apareceu fora do menu.`,
          );
          assert(
            !state.buttons.some((button) =>
              /reiniciar|jogar de novo/i.test(button.text),
            ),
            `${viewport.name}: reiniciar apareceu fora do menu.`,
          );
          assert(
            !state.buttons.some(
              (button) => button.settingsAction === SETTINGS_ACTION_RESET_SCORE,
            ),
            `${viewport.name}: zerar pontuação apareceu fora do menu.`,
          );
          if (state.sideSlotVisible) {
            assert(
              state.sideAdDistance >= MIN_SIDE_AD_DISTANCE_PX,
              `${viewport.name}: slot lateral perto demais do tabuleiro.`,
            );
          }
          assert(
            state.adSlotCount === 0,
            `${viewport.name}: publicidade não deve renderizar slots.`,
          );
          assert(
            !state.publicityTextPresent,
            `${viewport.name}: texto Publicidade apareceu sem anúncio real.`,
          );
          if (state.viewport.width < 1120) {
            assert(
              !state.sideSlotVisible,
              `${viewport.name}: slot lateral apareceu sem espaço.`,
            );
          }
          if (state.bottomSlotVisible) {
            assert(
              state.bottomAdDistance >= MIN_BOTTOM_AD_DISTANCE_PX ||
                state.viewport.height < 500,
              `${viewport.name}: slot inferior perto demais do tabuleiro.`,
            );
          }
          if (isImmersiveLandscape) {
            assert(
              state.isLandscapeImmersive,
              `${viewport.name}: classe imersiva não foi aplicada.`,
            );
            assert(
              state.root &&
                state.appShell &&
                state.dashboard &&
                state.root.height >= state.viewport.height - 1 &&
                state.appShell.height >=
                  state.viewport.height - MAX_IMMERSIVE_SAFE_AREA_RESERVE_PX &&
                state.dashboard.height >=
                  state.viewport.height - MAX_IMMERSIVE_SAFE_AREA_RESERVE_PX,
              `${viewport.name}: shell imersivo não ocupa a viewport inteira.`,
            );
            assert(
              state.viewport.scrollHeight <= state.viewport.height + 1 &&
                state.viewport.bodyScrollHeight <= state.viewport.height + 1,
              `${viewport.name}: modo imersivo gerou scroll vertical.`,
            );
            assert(
              state.canvas.height / state.viewport.height >=
                MIN_IMMERSIVE_CANVAS_HEIGHT_RATIO,
              `${viewport.name}: canvas não usa altura suficiente em landscape.`,
            );
            assert(
              state.canvas.width / state.viewport.width >=
                MIN_LANDSCAPE_CANVAS_WIDTH_RATIO,
              `${viewport.name}: canvas não usa largura suficiente em landscape.`,
            );
            const availableBoardHeight = state.dashboardLayout
              ? state.dashboardLayout.height
              : 0;
            assert(
              availableBoardHeight > 0 &&
                state.canvas.height / availableBoardHeight >=
                  MIN_IMMERSIVE_BOARD_AREA_USAGE_RATIO,
              `${viewport.name}: canvas não usa 90% da área útil do tabuleiro.`,
            );
            if (!isMobileLandscapeFocused) {
              assert(
                !rectsIntersect(
                  state.canvas,
                  state.header,
                  MAX_CANVAS_OVERLAP_PX,
                ),
                `${viewport.name}: HUD sobrepôs o canvas.`,
              );
              assert(
                !rectsIntersect(
                  state.canvas,
                  state.scoreHud,
                  MAX_CANVAS_OVERLAP_PX,
                ),
                `${viewport.name}: pontuação/fase sobrepôs o canvas.`,
              );
              assert(
                !state.boardControls ||
                  !rectsIntersect(
                    state.canvas,
                    state.boardControls,
                    MAX_CANVAS_OVERLAP_PX,
                  ),
                `${viewport.name}: controles principais antigos sobrepuseram o canvas.`,
              );
              const canvasOverlappingButtons = state.buttons
                .filter((button) => !button.inDrawer)
                .filter((button) =>
                  rectsIntersect(state.canvas, button, MAX_CANVAS_OVERLAP_PX),
                );
              assert(
                canvasOverlappingButtons.length === 0,
                `${viewport.name}: botões sobrepostos ao canvas: ${canvasOverlappingButtons
                  .map(describeButton)
                  .join(", ")}.`,
              );
            }
            assert(
              !state.titleGroupVisible,
              `${viewport.name}: título/eyebrow continuam ocupando espaço.`,
            );
            assert(
              !state.bottomSlotVisible && !state.sideSlotVisible,
              `${viewport.name}: anúncios continuam visíveis no modo imersivo.`,
            );
          }

          if (OVERLAY_TARGET_VIEWPORTS.includes(viewport.name)) {
            trace(`overlay:start:${viewport.name}`);
            await waitForInitialCountdownToFinish(page);
            const openedMenuForLogs = await clickButtonByPattern(
              page,
              MENU_BUTTON_NAME,
            );
            assert(
              openedMenuForLogs,
              `${viewport.name}: não abriu menu para histórico.`,
            );
            await page.waitForSelector(".settings-drawer", { timeout: 10000 });
            const menuOverlayState = await collectOverlayLayoutState(page);
            assert(
              !menuOverlayState.hasHorizontalOverflow,
              `${viewport.name}: menu gerou overflow horizontal ${menuOverlayState.scrollWidth} > ${menuOverlayState.viewportWidth}.`,
            );
            const openedLogs = await clickSettingsAction(
              page,
              SETTINGS_ACTION_LOGS,
            );
            assert(
              openedLogs,
              `${viewport.name}: não abriu painel de histórico.`,
            );
            await page.waitForFunction(
              () => document.body.textContent?.includes("Histórico do jogo"),
              { timeout: 10000 },
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            await openFirstEventDetails(
              page,
              `${viewport.name}: histórico abriu sem botão Atualizar disponível.`,
              `${viewport.name}: nenhum evento disponível no painel de histórico.`,
            );
            await waitForLogDetailLabels(
              page,
              SPEED_CURRENT_LABEL,
              LEVEL_TIME_LABEL,
            );
            const historyOverlayState = await collectOverlayLayoutState(page);
            assert(
              !historyOverlayState.hasHorizontalOverflow,
              `${viewport.name}: histórico gerou overflow horizontal ${historyOverlayState.scrollWidth} > ${historyOverlayState.viewportWidth}.`,
            );
            const closedLogs = await clickButtonByPattern(
              page,
              CLOSE_BUTTON_NAME,
            );
            assert(
              closedLogs,
              `${viewport.name}: não fechou painel de histórico.`,
            );

            await waitForInitialCountdownToFinish(page);
            const openedMenuForCollisions = await clickButtonByPattern(
              page,
              MENU_BUTTON_NAME,
            );
            assert(
              openedMenuForCollisions,
              `${viewport.name}: não abriu menu para colisões.`,
            );
            await page.waitForSelector(".settings-drawer", { timeout: 10000 });
            const openedCollisions = await clickSettingsAction(
              page,
              SETTINGS_ACTION_COLLISIONS,
            );
            assert(
              openedCollisions,
              `${viewport.name}: não abriu painel de colisões.`,
            );
            await page.waitForFunction(
              ({ panelTitle }) => {
                const text = document.body.textContent || "";
                return text.includes(panelTitle);
              },
              { timeout: 10000 },
              {
                panelTitle: COLLISIONS_PANEL_TITLE,
              },
            );
            const collisionsOverlayState =
              await collectOverlayLayoutState(page);
            assert(
              !collisionsOverlayState.hasHorizontalOverflow,
              `${viewport.name}: colisões gerou overflow horizontal ${collisionsOverlayState.scrollWidth} > ${collisionsOverlayState.viewportWidth}.`,
            );
            const closedCollisions = await clickButtonByPattern(
              page,
              CLOSE_BUTTON_NAME,
            );
            assert(
              closedCollisions,
              `${viewport.name}: não fechou painel de colisões.`,
            );
            trace(`overlay:end:${viewport.name}`);
          }
          viewportComplete = true;
          trace(`viewport:end:${viewport.name}`);
        } catch (error) {
          if (
            attempt < MAX_VIEWPORT_ATTEMPTS &&
            isRecoverableBrowserError(error)
          ) {
            trace(`viewport:retry:${viewport.name}:${attempt}`);
            await closeBrowser(browser);
            browser = await launchQaBrowser();
            continue;
          }
          throw error;
        } finally {
          await closePage(page);
        }
      }
      if (
        (viewportIndex + 1) % VIEWPORT_BROWSER_RECYCLE_INTERVAL === 0 &&
        viewportIndex + 1 < VIEWPORTS.length
      ) {
        await closeBrowser(browser);
        browser = await launchQaBrowser();
      }
    }
    trace("loop:end");

    const portraitViewport = viewportByScreenshotRole("mobile-default");
    const desktopViewport = viewportByScreenshotRole("desktop-default");
    const tabletViewport = viewportByScreenshotRole("tablet-default");
    const landscapeViewport = viewportByScreenshotRole("landscape-default");
    let beforeOrientationEvents;
    let afterOrientationEvents;
    {
      const page = await createQaPage(browser, consoleProblems);
      try {
        trace("screenshots:portrait:start");
        await setQaViewport(page, portraitViewport);
        await gotoCleanOrigin(page, targetUrl, parsed.origin);
        await page.waitForSelector("canvas", { timeout: 30000 });
        await acceptPrivacyConsentIfPresent(page);
        await waitForCinematicOverlayToClear(page);
        await page.screenshot({ path: outScreenshot });
        trace("screenshots:tablet:start");
        await setQaViewport(page, tabletViewport);
        await gotoCleanOrigin(page, targetUrl, parsed.origin);
        await page.waitForSelector("canvas", { timeout: 30000 });
        await acceptPrivacyConsentIfPresent(page);
        await waitForCinematicOverlayToClear(page);
        await page.screenshot({ path: outTabletScreenshot });
        trace("screenshots:desktop:start");
        await setQaViewport(page, desktopViewport);
        await gotoCleanOrigin(page, targetUrl, parsed.origin);
        await page.waitForSelector("canvas", { timeout: 30000 });
        await acceptPrivacyConsentIfPresent(page);
        await waitForCinematicOverlayToClear(page);
        await page.screenshot({ path: outDesktopScreenshot });
        trace("screenshots:landscape:start");
        await setQaViewport(page, landscapeViewport);
        await gotoCleanOrigin(page, targetUrl, parsed.origin);
        await page.waitForSelector("canvas", { timeout: 30000 });
        await acceptPrivacyConsentIfPresent(page);
        await waitForCinematicOverlayToClear(page);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await page.screenshot({ path: outLandscapeScreenshot });
        trace("orientation:start");
        await setQaViewport(page, portraitViewport);
        const orientationStartedAt = Date.now();
        await gotoCleanOrigin(page, targetUrl, parsed.origin);
        await page.waitForSelector("canvas", { timeout: 30000 });
        await acceptPrivacyConsentIfPresent(page);
        await waitForCinematicOverlayToClear(page);
        beforeOrientationEvents = await waitForEventTypeSince(
          page,
          orientationStartedAt,
          "game_start",
        );
        await setQaViewport(page, landscapeViewport);
        await page.waitForFunction(
          ({ minHeightRatio, minWidthRatio, immersiveRootClass }) => {
            const canvas = document.querySelector("canvas");
            if (!canvas) return false;
            const rect = canvas.getBoundingClientRect();
            return (
              document.documentElement.classList.contains(immersiveRootClass) &&
              rect.height / window.innerHeight >= minHeightRatio &&
              rect.width / window.innerWidth >= minWidthRatio
            );
          },
          { timeout: 10000 },
          {
            minHeightRatio: MIN_IMMERSIVE_CANVAS_HEIGHT_RATIO,
            minWidthRatio: MIN_LANDSCAPE_CANVAS_WIDTH_RATIO,
            immersiveRootClass: IMMERSIVE_ROOT_CLASS,
          },
        );
        await new Promise((resolve) => setTimeout(resolve, 800));
        afterOrientationEvents = await readEventCountsSince(
          page,
          orientationStartedAt,
        );
        assert(
          (afterOrientationEvents.byType.game_start || 0) ===
            (beforeOrientationEvents.byType.game_start || 0),
          "Rotação para landscape registrou novo game_start.",
        );
        assert(
          (afterOrientationEvents.byType.restart_game || 0) ===
            (beforeOrientationEvents.byType.restart_game || 0),
          "Rotação para landscape registrou restart_game.",
        );
      } finally {
        await closePage(page);
      }
    }

    const report = {
      url: targetUrl,
      viewportMatrixPath: "tests/e2e/responsiveViewportMatrix.json",
      screenshotPath: outScreenshot,
      tabletScreenshotPath: outTabletScreenshot,
      desktopScreenshotPath: outDesktopScreenshot,
      landscapeScreenshotPath: outLandscapeScreenshot,
      results,
      orientationEvents: {
        before: beforeOrientationEvents,
        after: afterOrientationEvents,
      },
      consoleProblems,
    };
    trace("report:write");
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

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
    console.error(error.stack || error.message);
    process.exit(1);
  });
