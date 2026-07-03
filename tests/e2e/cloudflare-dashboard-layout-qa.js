// tests/e2e/cloudflare-dashboard-layout-qa.js
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";

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
const RESPONSIVE_VIEWPORT_MATRIX_PATH = new URL(
  "./responsiveViewportMatrix.json",
  import.meta.url,
);
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIN_TOUCH_TARGET_SIZE = 44;
const MIN_SIDE_AD_DISTANCE_PX = 150;
const MIN_BOTTOM_AD_DISTANCE_PX = 24;
const MIN_LANDSCAPE_CANVAS_HEIGHT_RATIO = 0.68;
const MIN_LANDSCAPE_CANVAS_WIDTH_RATIO = 0.96;
const MIN_IMMERSIVE_CANVAS_HEIGHT_RATIO = 0.68;
const MIN_IMMERSIVE_BOARD_AREA_USAGE_RATIO = 0.9;
const MIN_FULL_WIDTH_CANVAS_RATIO = 0.98;
const MIN_FULL_WIDTH_BOARD_RATIO = 0.95;
const MIN_HEIGHT_CONSTRAINED_CANVAS_VIEWPORT_WIDTH_RATIO = 0.6;
const MAX_CANVAS_OVERLAP_PX = 2;
const IMMERSIVE_ROOT_CLASS = "bb-landscape-immersive";
const MAX_IMMERSIVE_SAFE_AREA_RESERVE_PX = 32;
const MENU_BUTTON_NAME = /menu/i;
const LOGS_BUTTON_NAME = /logs/i;
const COLLISIONS_BUTTON_NAME = /colisões/i;
const CLOSE_BUTTON_NAME = /fechar|×|✕/i;
const SPEED_CURRENT_LABEL = "Velocidade atual";
const LEVEL_TIME_LABEL = "Tempo da fase";
const SPEED_REDUCTIONS_LABEL = "Reduções aplicadas";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const CINEMATIC_OVERLAY_TIMEOUT_MS = 3000;
const RESPONSIVE_VIEWPORT_MATRIX = JSON.parse(
  readFileSync(RESPONSIVE_VIEWPORT_MATRIX_PATH, "utf8"),
);
const VIEWPORTS = RESPONSIVE_VIEWPORT_MATRIX.viewports;
const OVERLAY_TARGET_VIEWPORTS = VIEWPORTS.filter(
  (viewport) => viewport.smokeOverlays,
).map((viewport) => viewport.name);
const LANDSCAPE_VIEWPORT_NAME = viewportByScreenshotRole("landscape-default")
  .name;

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
    deviceScaleFactor: viewport.deviceScaleFactor,
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
      const topControls = rectOf(
        document.querySelector(".dashboard-primary-controls"),
      );
      const boardControls = rectOf(
        document.querySelector(".game-board-controls"),
      );
      const sideSlot = rectOf(document.querySelector(".ad-slot--side"));
      const bottomSlot = rectOf(document.querySelector(".ad-slot--bottom"));
      const sideSlotStyle = getComputedStyle(
        document.querySelector(".ad-slot--side"),
      );
      const bottomSlotStyle = getComputedStyle(
        document.querySelector(".ad-slot--bottom"),
      );
      const buttons = Array.from(document.querySelectorAll("button")).map(
        (button) => {
          const rect = button.getBoundingClientRect();
          return {
            text: button.textContent?.trim() || "",
            ariaLabel: button.getAttribute("aria-label") || "",
            title: button.getAttribute("title") || "",
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
        sideSlotStyle.display !== "none" &&
        sideSlot.width > 0 &&
        sideSlot.height > 0;
      const bottomSlotVisible =
        Boolean(bottomSlot) &&
        bottomSlotStyle.display !== "none" &&
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
        topControls,
        boardControls,
        buttons,
        sideSlot,
        bottomSlot,
        sideSlotVisible,
        bottomSlotVisible,
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
    },
  );
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
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
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
  const buttons = await page.$$("button");
  for (const button of buttons) {
    const label = await button.evaluate(
      (node) =>
        node.getAttribute("aria-label") ||
        node.getAttribute("title") ||
        node.textContent ||
        "",
    );
    if (pattern.test(label)) {
      await button.click();
      return true;
    }
  }

  return false;
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
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(["--no-first-run", "--no-default-browser-check"]),
  });

  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (["error", "warn"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) =>
      consoleProblems.push({ type: "pageerror", text: error.message }),
    );

    const results = [];
    for (const viewport of VIEWPORTS) {
      await setQaViewport(page, viewport);
      await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
      await clearOfflineState(page);
      await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector("canvas", { timeout: 30000 });
      await waitForCinematicOverlayToClear(page);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const state = await collectLayoutState(page, viewport.name);
      results.push(state);

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
      assert(
        !isImmersiveLandscape || state.canvas.bottom <= state.viewport.height,
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
      const mainButtons = state.buttons.filter((button) => !button.inDrawer);
      const audioIcon = mainButtons.find((button) =>
        ["Som", "Sem som"].includes(button.ariaLabel),
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
        restartIcon,
        `${viewport.name}: ícone Reiniciar/Jogar de novo ausente na tela principal.`,
      );
      for (const button of [audioIcon, restartIcon]) {
        assert(
          button.bottom <= state.canvas.y,
          `${viewport.name}: ícone ${button.ariaLabel} não ficou no topo da tela.`,
        );
      }
      assert(
        !state.buttons.some((button) => LOGS_BUTTON_NAME.test(button.text)),
        `${viewport.name}: logs apareceu fora do menu.`,
      );
      assert(
        !state.buttons.some((button) =>
          COLLISIONS_BUTTON_NAME.test(button.text),
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
        !state.buttons.some((button) => /zerar pontuação/i.test(button.text)),
        `${viewport.name}: zerar pontuação apareceu fora do menu.`,
      );
      if (state.sideSlotVisible) {
        assert(
          state.sideAdDistance >= MIN_SIDE_AD_DISTANCE_PX,
          `${viewport.name}: slot lateral perto demais do tabuleiro.`,
        );
      }
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
        const availableBoardHeight =
          state.dashboardLayout ? state.dashboardLayout.height : 0;
        assert(
          availableBoardHeight > 0 &&
            state.canvas.height / availableBoardHeight >=
              MIN_IMMERSIVE_BOARD_AREA_USAGE_RATIO,
          `${viewport.name}: canvas não usa 90% da área útil do tabuleiro.`,
        );
        assert(
          !rectsIntersect(state.canvas, state.header, MAX_CANVAS_OVERLAP_PX),
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
        const openedMenuForLogs = await clickButtonByPattern(
          page,
          MENU_BUTTON_NAME,
        );
        assert(
          openedMenuForLogs,
          `${viewport.name}: não abriu menu para logs.`,
        );
        await page.waitForSelector(".settings-drawer", { timeout: 10000 });
        const menuOverlayState = await collectOverlayLayoutState(page);
        assert(
          !menuOverlayState.hasHorizontalOverflow,
          `${viewport.name}: menu gerou overflow horizontal ${menuOverlayState.scrollWidth} > ${menuOverlayState.viewportWidth}.`,
        );
        const openedLogs = await clickButtonByPattern(page, LOGS_BUTTON_NAME);
        assert(openedLogs, `${viewport.name}: não abriu painel de logs.`);
        await page.waitForFunction(
          () => document.body.textContent?.includes("Visualizador de Logs"),
          { timeout: 10000 },
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        let firstEventHeader = await page.$(".event-header");
        if (!firstEventHeader) {
          const refreshedLogs = await clickButtonByPattern(page, /atualizar/i);
          assert(
            refreshedLogs,
            `${viewport.name}: logs abriu sem botão Atualizar disponível.`,
          );
          await page.waitForFunction(
            () => Boolean(document.querySelector(".event-header")),
            { timeout: 10000 },
          );
          firstEventHeader = await page.$(".event-header");
        }
        if (firstEventHeader) {
          await firstEventHeader.click();
        }
        await page.waitForFunction(
          ({ speedLabel, timeLabel }) => {
            const text = document.body.textContent || "";
            return text.includes(speedLabel) && text.includes(timeLabel);
          },
          { timeout: 10000 },
          { speedLabel: SPEED_CURRENT_LABEL, timeLabel: LEVEL_TIME_LABEL },
        );
        const logsOverlayState = await collectOverlayLayoutState(page);
        assert(
          !logsOverlayState.hasHorizontalOverflow,
          `${viewport.name}: logs gerou overflow horizontal ${logsOverlayState.scrollWidth} > ${logsOverlayState.viewportWidth}.`,
        );
        const closedLogs = await clickButtonByPattern(page, CLOSE_BUTTON_NAME);
        assert(closedLogs, `${viewport.name}: não fechou painel de logs.`);

        const openedMenuForCollisions = await clickButtonByPattern(
          page,
          MENU_BUTTON_NAME,
        );
        assert(
          openedMenuForCollisions,
          `${viewport.name}: não abriu menu para colisões.`,
        );
        await page.waitForSelector(".settings-drawer", { timeout: 10000 });
        const openedCollisions = await clickButtonByPattern(
          page,
          COLLISIONS_BUTTON_NAME,
        );
        assert(
          openedCollisions,
          `${viewport.name}: não abriu painel de colisões.`,
        );
        await page.waitForFunction(
          ({ speedLabel, reductionsLabel }) => {
            const text = document.body.textContent || "";
            return text.includes(speedLabel) && text.includes(reductionsLabel);
          },
          { timeout: 10000 },
          {
            speedLabel: SPEED_CURRENT_LABEL,
            reductionsLabel: SPEED_REDUCTIONS_LABEL,
          },
        );
        const collisionsOverlayState = await collectOverlayLayoutState(page);
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
      }
    }

    const portraitViewport = viewportByScreenshotRole("mobile-default");
    const desktopViewport = viewportByScreenshotRole("desktop-default");
    const tabletViewport = viewportByScreenshotRole("tablet-default");
    const landscapeViewport = viewportByScreenshotRole("landscape-default");
    await setQaViewport(page, portraitViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await waitForCinematicOverlayToClear(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });
    await setQaViewport(page, tabletViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await waitForCinematicOverlayToClear(page);
    await page.screenshot({ path: outTabletScreenshot, fullPage: true });
    await setQaViewport(page, desktopViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await waitForCinematicOverlayToClear(page);
    await page.screenshot({ path: outDesktopScreenshot, fullPage: true });
    await setQaViewport(page, landscapeViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForCinematicOverlayToClear(page);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await page.screenshot({ path: outLandscapeScreenshot, fullPage: true });
    await setQaViewport(page, portraitViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    const orientationStartedAt = Date.now();
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForCinematicOverlayToClear(page);
    const beforeOrientationEvents = await waitForEventTypeSince(
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
    const afterOrientationEvents = await readEventCountsSince(
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
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

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
