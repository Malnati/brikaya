// tests/e2e/cloudflare-dashboard-layout-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

const DEFAULT_PUBLIC_URL = "https://malnati-brickbreaker.pages.dev/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-dashboard-layout.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout.png";
const DEFAULT_DESKTOP_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout-desktop.png";
const DEFAULT_LANDSCAPE_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-dashboard-layout-landscape.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIN_TOUCH_TARGET_SIZE = 44;
const MIN_SIDE_AD_DISTANCE_PX = 150;
const MIN_BOTTOM_AD_DISTANCE_PX = 24;
const LANDSCAPE_VIEWPORT_NAME = "iphone-15-landscape";
const MIN_LANDSCAPE_CANVAS_HEIGHT_RATIO = 0.68;
const MIN_LANDSCAPE_CANVAS_WIDTH_RATIO = 0.48;
const MIN_IMMERSIVE_CANVAS_HEIGHT_RATIO = 0.68;
const MIN_IMMERSIVE_BOARD_AREA_USAGE_RATIO = 0.9;
const MIN_FULL_WIDTH_CANVAS_RATIO = 0.96;
const MIN_FULL_WIDTH_BOARD_RATIO = 0.95;
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
const OVERLAY_TARGET_VIEWPORTS = ["iphone-15", "desktop"];
const VIEWPORTS = [
  {
    name: "iphone-se",
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iphone-12-14",
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iphone-15",
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iphone-pro-max",
    width: 430,
    height: 932,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iphone-15-landscape",
    width: 852,
    height: 393,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "tablet",
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "desktop",
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
];

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

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
      const scoreStrip = rectOf(document.querySelector(".score-strip"));
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
        chips: Array.from(document.querySelectorAll(".score-chip")).map(
          (chip) => chip.textContent?.trim() || "",
        ),
        canvas,
        header,
        titleGroup,
        titleGroupVisible:
          Boolean(titleGroup) &&
          titleGroupDisplay !== "none" &&
          titleGroup.width > 0 &&
          titleGroup.height > 0,
        scoreStrip,
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
    const text = await button.evaluate((node) => node.textContent || "");
    if (pattern.test(text)) {
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
    parsed.hostname.endsWith(".pages.dev"),
    `URL precisa ser Cloudflare Pages: ${targetUrl}`,
  );

  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  const outDesktopScreenshot = desktopScreenshotPath();
  const outLandscapeScreenshot = landscapeScreenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);
  ensureParentDirectory(outDesktopScreenshot);
  ensureParentDirectory(outLandscapeScreenshot);

  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ["--no-first-run", "--no-default-browser-check"],
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
      await page.setViewport(viewport);
      await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
      await clearOfflineState(page);
      await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector("canvas", { timeout: 30000 });
      await waitForCinematicOverlayToClear(page);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const state = await collectLayoutState(page, viewport.name);
      results.push(state);

      assert(
        state.heading.includes("Breakout"),
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
        viewport.name !== LANDSCAPE_VIEWPORT_NAME ||
          state.canvas.bottom <= state.viewport.height,
        `${viewport.name}: canvas não fica inteiro visível no modo imersivo.`,
      );
      if (viewport.name !== LANDSCAPE_VIEWPORT_NAME) {
        assert(
          state.dashboardLayout &&
            state.canvas.width / state.dashboardLayout.width >=
              MIN_FULL_WIDTH_CANVAS_RATIO,
          `${viewport.name}: canvas não ocupa 96% da largura útil do dashboard.`,
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
        state.header && state.scoreStrip,
        `${viewport.name}: header/chips ausentes.`,
      );
      assert(
        state.header.height <= Math.max(96, state.viewport.height * 0.2),
        `${viewport.name}: header alto demais para HUD compacto.`,
      );
      assert(
        state.chips.some((text) => text.includes("Fase")),
        `${viewport.name}: chip de fase ausente.`,
      );
      assert(
        state.chips.some((text) => text.includes("Score")),
        `${viewport.name}: chip de score ausente.`,
      );
      assert(
        state.chips.some((text) => text.includes("Total")),
        `${viewport.name}: chip de total ausente.`,
      );
      assert(
        state.buttons.every((button) => button.hasTouchTarget),
        `${viewport.name}: botão menor que 44px: ${state.buttons
          .filter((button) => !button.hasTouchTarget)
          .map((button) => button.text)
          .join(", ")}.`,
      );
      assert(
        viewport.name !== LANDSCAPE_VIEWPORT_NAME ||
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
      const audioIcon = mainButtons.find(
        (button) => button.ariaLabel === "Som" && button.text === "♪",
      );
      const restartIcon = mainButtons.find(
        (button) =>
          /reiniciar|jogar de novo/i.test(button.ariaLabel) &&
          button.text === "↻",
      );
      assert(
        audioIcon,
        `${viewport.name}: ícone Som ausente na tela principal.`,
      );
      assert(
        restartIcon,
        `${viewport.name}: ícone Reiniciar/Jogar de novo ausente na tela principal.`,
      );
      for (const button of [audioIcon, restartIcon]) {
        if (viewport.name !== LANDSCAPE_VIEWPORT_NAME) {
          assert(
            button.y >= state.canvas.bottom,
            `${viewport.name}: ícone ${button.ariaLabel} ficou sobre o quadro do jogo.`,
          );
        }
        assert(
          button.x >= state.canvas.x && button.right <= state.canvas.right,
          `${viewport.name}: ícone ${button.ariaLabel} saiu da largura do quadro do jogo.`,
        );
        if (state.bottomSlotVisible) {
          assert(
            button.bottom <= state.bottomSlot.y,
            `${viewport.name}: ícone ${button.ariaLabel} invadiu a publicidade.`,
          );
        }
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
      if (viewport.name === LANDSCAPE_VIEWPORT_NAME) {
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
          state.dashboardLayout && state.boardControls
            ? state.dashboardLayout.height - state.boardControls.height
            : 0;
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
            state.scoreStrip,
            MAX_CANVAS_OVERLAP_PX,
          ),
          `${viewport.name}: pontuação/fase sobrepôs o canvas.`,
        );
        assert(
          !rectsIntersect(
            state.canvas,
            state.boardControls,
            MAX_CANVAS_OVERLAP_PX,
          ),
          `${viewport.name}: controles principais sobrepuseram o canvas.`,
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

    const portraitViewport = VIEWPORTS.find(
      (viewport) => viewport.name === "iphone-15",
    );
    const landscapeViewport = VIEWPORTS.find(
      (viewport) => viewport.name === LANDSCAPE_VIEWPORT_NAME,
    );
    await page.setViewport(portraitViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await waitForCinematicOverlayToClear(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });
    await page.setViewport(
      VIEWPORTS.find((viewport) => viewport.name === "desktop"),
    );
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await waitForCinematicOverlayToClear(page);
    await page.screenshot({ path: outDesktopScreenshot, fullPage: true });
    await page.setViewport(landscapeViewport);
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForCinematicOverlayToClear(page);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await page.screenshot({ path: outLandscapeScreenshot, fullPage: true });
    await page.setViewport(portraitViewport);
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
    await page.setViewport(landscapeViewport);
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
      screenshotPath: outScreenshot,
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
