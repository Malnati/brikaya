// tests/e2e/cloudflare-mobile-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

const DEFAULT_PUBLIC_URL = "https://malnati-brickbreaker.pages.dev/";
const DEFAULT_SCREENSHOT_PATH = "tmp/screenshots/cloudflare-mobile-qa.png";
const DEFAULT_MENU_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-mobile-menu.png";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-mobile-qa.json";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const IPHONE_15_VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MIN_TOUCH_TARGET_SIZE = 44;
const MAX_INITIAL_SCORE_AFTER_OBSERVATION = 260;
const OBSERVATION_DURATION_MS = 1500;
const REQUIRED_EVENT_TYPES = ["game_start"];
const REQUIRED_DATABASE_NAMES = ["BrickBreakerGameLog"];
const MENU_BUTTON_NAME = /menu/i;
const LOGS_BUTTON_NAME = /logs/i;
const COLLISIONS_BUTTON_NAME = /colisões/i;
const CLOSE_BUTTON_NAME = /fechar|×|✕/i;
const SPEED_CURRENT_LABEL = "Velocidade atual";
const LEVEL_TIME_LABEL = "Tempo da fase";
const SPEED_REDUCTIONS_LABEL = "Reduções aplicadas";

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
  });
}

async function collectLayoutState(page) {
  return page.evaluate((minTouchTargetSize) => {
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
    const buildVersionElement = document.querySelector(".build-version-badge");
    const buildVersionRect = buildVersionElement?.getBoundingClientRect();
    const bottomSlotRect = document
      .querySelector(".ad-slot--bottom")
      ?.getBoundingClientRect();
    const scoreText =
      Array.from(document.querySelectorAll("p"))
        .map((element) => element.textContent || "")
        .find((text) => text.includes("Score")) || "";
    const scoreValue = Number(scoreText.replace(/[^0-9]/g, "") || 0);

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
  }, MIN_TOUCH_TARGET_SIZE);
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
    args: ["--no-first-run", "--no-default-browser-check"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(IPHONE_15_VIEWPORT);
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
    await new Promise((resolve) =>
      setTimeout(resolve, OBSERVATION_DURATION_MS),
    );

    const layoutState = await collectLayoutState(page);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    assert(
      layoutState.title === "Breakout",
      "Título inesperado no app publicado.",
    );
    assert(
      layoutState.heading.includes("Breakout"),
      "Tela inicial sem heading Breakout.",
    );
    assert(layoutState.canvas, "Canvas não encontrado.");
    assert(
      !layoutState.hasHorizontalOverflow,
      `Há overflow horizontal: scrollWidth ${layoutState.viewport.scrollWidth} > viewport ${layoutState.viewport.width}.`,
    );
    assert(
      layoutState.canvas.right <= layoutState.viewport.width,
      "Canvas excede a largura do iPhone 15.",
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
    const audioIcon = mainButtons.find(
      (button) => button.ariaLabel === "Som" && button.text === "♪",
    );
    const restartIcon = mainButtons.find(
      (button) =>
        /reiniciar|jogar de novo/i.test(button.ariaLabel) &&
        button.text === "↻",
    );
    assert(audioIcon, "Ícone Som não encontrado no canto principal.");
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
        button.rect.y >= layoutState.canvas.bottom,
        `Ícone ${button.ariaLabel} ficou sobre o quadro do jogo.`,
      );
      assert(
        button.rect.x >= layoutState.canvas.x &&
          button.rect.right <= layoutState.canvas.right,
        `Ícone ${button.ariaLabel} saiu da largura do quadro do jogo.`,
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

    const openedMenuForScreenshot = await clickButtonByPattern(
      page,
      MENU_BUTTON_NAME,
    );
    assert(openedMenuForScreenshot, "Menu lateral não abriu.");
    await page.waitForSelector(".settings-drawer", { timeout: 10000 });
    const menuState = await collectDrawerState(page);
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
    assert(menuState.text.includes("Tema"), "Menu lateral sem seção Tema.");
    assert(
      menuState.text.includes("Claro") && menuState.text.includes("Escuro"),
      "Menu lateral sem controles de tema.",
    );
    assert(menuState.text.includes("Logs"), "Menu lateral sem opção Logs.");
    assert(
      menuState.text.includes("Colisões"),
      "Menu lateral sem opção Colisões.",
    );
    assert(
      menuState.text.includes("Zerar pontuação"),
      "Menu lateral sem opção Zerar pontuação.",
    );
    const openedLogs = await clickButtonByPattern(page, LOGS_BUTTON_NAME);
    assert(openedLogs, "Botão de logs não encontrado.");
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
        "Painel de logs abriu sem botão Atualizar disponível.",
      );
      await page.waitForFunction(
        () => Boolean(document.querySelector(".event-header")),
        { timeout: 10000 },
      );
      firstEventHeader = await page.$(".event-header");
    }
    assert(firstEventHeader, "Nenhum evento disponível no painel de logs.");
    await firstEventHeader.click();
    await page.waitForFunction(
      ({ speedLabel, timeLabel }) => {
        const text = document.body.textContent || "";
        return text.includes(speedLabel) && text.includes(timeLabel);
      },
      { timeout: 10000 },
      { speedLabel: SPEED_CURRENT_LABEL, timeLabel: LEVEL_TIME_LABEL },
    );
    const indexedDbSummary = await readIndexedDbSummary(page);
    const logsState = await collectLayoutState(page);

    const closedLogs = await clickButtonByPattern(page, CLOSE_BUTTON_NAME);
    assert(closedLogs, "Não foi possível fechar o painel de logs.");

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
      screenshotPath,
      menuScreenshotPath,
      layoutState,
      menuState,
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
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
