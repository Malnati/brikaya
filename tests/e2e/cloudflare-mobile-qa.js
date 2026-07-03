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
const RESPONSIVE_VIEWPORT_MATRIX_PATH = new URL(
  "./responsiveViewportMatrix.json",
  import.meta.url,
);
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIN_TOUCH_TARGET_SIZE = 44;
const MAX_INITIAL_SCORE_AFTER_OBSERVATION = 260;
const OBSERVATION_DURATION_MS = 1500;
const MENU_PAUSE_OBSERVATION_MS = 1400;
const BROWSER_CLOSE_SETTLE_MS = 250;
const REQUIRED_EVENT_TYPES = ["game_start"];
const REQUIRED_DATABASE_NAMES = ["BrickBreakerGameLog"];
const MENU_BUTTON_NAME = /menu/i;
const LOGS_BUTTON_NAME = /logs/i;
const COLLISIONS_BUTTON_NAME = /colisões/i;
const CLOSE_BUTTON_NAME = /fechar|×|✕/i;
const SPEED_CURRENT_LABEL = "Velocidade atual";
const LEVEL_TIME_LABEL = "Tempo da fase";
const SPEED_REDUCTIONS_LABEL = "Reduções aplicadas";
const RESPONSIVE_VIEWPORT_MATRIX = JSON.parse(
  readFileSync(RESPONSIVE_VIEWPORT_MATRIX_PATH, "utf8"),
);
const VIEWPORTS = RESPONSIVE_VIEWPORT_MATRIX.viewports;
const MOBILE_DEFAULT_VIEWPORT = viewportByScreenshotRole("mobile-default");
const CANVAS_IMAGE_MIME_TYPE = "image/png";
const SCORE_VALUE_PATTERN = /Score\s+(\d+)/;
const EVENT_HEADER_SELECTOR = ".event-header";
const EVENT_DETAILS_SELECTOR = ".event-details";
const EVENT_DETAILS_WAIT_TIMEOUT_MS = 10000;

function getPublicUrl() {
  return process.env.BRICKBREAKER_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function getScreenshotPath() {
  return (
    process.env.BRICKBREAKER_MOBILE_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH
  );
}

function getMenuScreenshotPath() {
  return (
    process.env.BRICKBREAKER_MOBILE_MENU_SCREENSHOT ||
    DEFAULT_MENU_SCREENSHOT_PATH
  );
}

function getReportPath() {
  return process.env.BRICKBREAKER_MOBILE_QA_REPORT || DEFAULT_REPORT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  browser.disconnect();
  browserProcess?.kill("SIGKILL");
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
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  };
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
      };
    },
    REQUIRED_DATABASE_NAMES,
    REQUIRED_EVENT_TYPES,
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

async function collectLayoutState(page) {
  return page.evaluate((minTouchTargetSize, scoreValuePatternSource) => {
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
    const scoreHudRect = document
      .querySelector(".score-hud")
      ?.getBoundingClientRect();
    const scoreHudText =
      document.querySelector(".score-hud")?.textContent || "";
    const buildVersionElement = document.querySelector(".build-version-badge");
    const buildVersionRect = buildVersionElement?.getBoundingClientRect();
    const bottomSlotRect = document
      .querySelector(".ad-slot--bottom")
      ?.getBoundingClientRect();
    const scoreValue = Number(scoreHudText.match(scoreValuePattern)?.[1] || 0);

    return {
      title: document.title,
      heading: document.querySelector("h1")?.textContent || "",
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
      scoreValue,
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > window.innerWidth,
      bodyOverflow: getComputedStyle(document.body).overflow,
    };
  }, MIN_TOUCH_TARGET_SIZE, SCORE_VALUE_PATTERN.source);
}

async function collectDrawerState(page) {
  return page.evaluate(() => {
    const drawer = document.querySelector(".settings-drawer");
    const drawerRect = drawer?.getBoundingClientRect();

    return {
      text: drawer?.textContent || "",
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

async function run() {
  const publicUrl = getPublicUrl();
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
    args: buildChromeLaunchArgs(["--no-first-run", "--no-default-browser-check"]),
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

    await page.goto(publicUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await clearOfflineState(page);
    await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await new Promise((resolve) =>
      setTimeout(resolve, OBSERVATION_DURATION_MS),
    );

    const layoutState = await collectLayoutState(page);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    assert(
      layoutState.title === "Brikaya",
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
    const restartIcon = mainButtons.find(
      (button) =>
        /reiniciar|jogar de novo/i.test(button.ariaLabel) &&
        button.text === "↻",
    );
    assert(audioIcon, "Ícone de som não encontrado no canto principal.");
    assert(
      audioIcon.ariaLabel === "Sem som" && audioIcon.text === "×",
      "Estado inicial do som não começou mudo.",
    );
    assert(
      restartIcon,
      "Ícone Reiniciar/Jogar de novo não encontrado no canto principal.",
    );
    assert(
      layoutState.canvas,
      "Canvas ausente para validar posição dos ícones.",
    );
    for (const button of [audioIcon, restartIcon]) {
      assert(
        button.rect.bottom <= layoutState.canvas.y,
        `Ícone ${button.ariaLabel} não ficou no topo da tela.`,
      );
      if (layoutState.bottomSlot) {
        assert(
          button.rect.bottom <= layoutState.bottomSlot.y,
          `Ícone ${button.ariaLabel} invadiu a área de publicidade.`,
        );
      }
    }
    assert(
      !layoutState.buttons.some((button) => LOGS_BUTTON_NAME.test(button.text)),
      "Logs aparece fora do menu lateral.",
    );
    assert(
      !layoutState.buttons.some((button) =>
        COLLISIONS_BUTTON_NAME.test(button.text),
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
      !layoutState.buttons.some((button) =>
        /zerar pontuação/i.test(button.text),
      ),
      "Zerar pontuação aparece fora do menu lateral.",
    );

    await waitForInitialCountdownToFinish(page);
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
      !/Reiniciar|Jogar de novo/.test(menuState.text),
      "Menu lateral ainda mostra ação Reiniciar/Jogar de novo.",
    );
    assert(/Versão v\d+/.test(menuState.text), "Menu lateral sem versão vN.");
    assert(
      menuState.text.includes("Aparência"),
      "Menu lateral sem seção Aparência.",
    );
    for (const label of [
      "Tema visual",
      "Imagens",
      "Fonte",
      "Neon Arcade",
      "CRT alto contraste",
      "Pixel Sunset",
      "Retro padrão",
      "Alto contraste",
      "Cabine Sunset",
      "Arcade",
      "CRT mono",
      "Blocos pixel",
    ]) {
      assert(menuState.text.includes(label), `Menu lateral sem ${label}.`);
    }
    assert(menuState.text.includes("Logs"), "Menu lateral sem opção Logs.");
    assert(
      menuState.text.includes("Colisões"),
      "Menu lateral sem opção Colisões.",
    );
    assert(
      menuState.text.includes("Zerar pontuação"),
      "Menu lateral sem opção Zerar pontuação.",
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
    const openedLogs = await clickButtonByPattern(page, LOGS_BUTTON_NAME);
    assert(openedLogs, "Botão de logs não encontrado.");
    await page.waitForFunction(
      () => document.body.textContent?.includes("Visualizador de Logs"),
      { timeout: 10000 },
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    await openFirstEventDetails(
      page,
      "Painel de logs abriu sem botão Atualizar disponível.",
      "Nenhum evento disponível no painel de logs.",
    );
    await waitForLogDetailLabels(page, SPEED_CURRENT_LABEL, LEVEL_TIME_LABEL);
    const indexedDbSummary = await readIndexedDbSummary(page);
    const logsState = await collectLayoutState(page);

    const closedLogs = await clickButtonByPattern(page, CLOSE_BUTTON_NAME);
    assert(closedLogs, "Não foi possível fechar o painel de logs.");

    await waitForInitialCountdownToFinish(page);
    const openedMenuForCollisions = await clickButtonByPattern(
      page,
      MENU_BUTTON_NAME,
    );
    assert(openedMenuForCollisions, "Menu lateral não reabriu para colisões.");
    await page.waitForSelector(".settings-drawer", { timeout: 10000 });
    const openedCollisions = await clickButtonByPattern(
      page,
      COLLISIONS_BUTTON_NAME,
    );
    assert(openedCollisions, "Botão de colisões não encontrado.");
    await page.waitForFunction(
      () => document.body.textContent?.includes("Estatísticas de Colisões"),
      { timeout: 10000 },
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
    const statsState = await collectLayoutState(page);

    const report = {
      publicUrl,
      viewportMatrixPath: "tests/e2e/responsiveViewportMatrix.json",
      viewportName: MOBILE_DEFAULT_VIEWPORT.name,
      screenshotPath,
      menuScreenshotPath,
      layoutState,
      menuState,
      menuPauseState,
      logsState,
      statsState,
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
      !logsState.hasHorizontalOverflow,
      "Tela de logs tem overflow horizontal.",
    );
    assert(
      logsState.buttons
        .filter((button) => button.visibleInViewport)
        .every((button) => button.hasTouchTarget),
      `Botão visível em logs menor que alvo touch mínimo: ${logsState.buttons
        .filter((button) => button.visibleInViewport && !button.hasTouchTarget)
        .map((button) => button.text)
        .join(", ")}`,
    );
    assert(
      !statsState.hasHorizontalOverflow,
      "Tela de estatísticas tem overflow horizontal.",
    );
    assert(
      statsState.buttons
        .filter((button) => button.visibleInViewport)
        .every((button) => button.hasTouchTarget),
      `Botão visível em estatísticas menor que alvo touch mínimo: ${statsState.buttons
        .filter((button) => button.visibleInViewport && !button.hasTouchTarget)
        .map((button) => button.text)
        .join(", ")}`,
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

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
