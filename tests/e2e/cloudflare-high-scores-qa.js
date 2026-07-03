// tests/e2e/cloudflare-high-scores-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

const DEFAULT_PUBLIC_URL = "https://malnati-brickbreaker.pages.dev/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-high-scores-qa.json";
const DEFAULT_SCREENSHOT_PATH = "tmp/screenshots/cloudflare-high-scores-qa.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const QA_SCENARIO_PARAM_NAME = "qaScenario";
const STABLE_QA_SCENARIO = "late-phase-stability";
const IPHONE_15_VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MAX_NAVIGATION_MS = 45000;
const DB_NAME = "breakout";
const DB_VERSION = 2;
const SCORES_STORE_NAME = "scores";
const HIGH_SCORE_STORE_NAME = "highScore";
const HIGH_SCORE_KEY = "best";
const SEEDED_SCORES = [20, 0, 120, 80, -5, 40];
const SEEDED_HIGH_SCORE = 120;
const EXPECTED_RANKS = ["1º 120", "2º 80", "3º 40", "4º 20"];
const MENU_BUTTON_PATTERN = /menu/i;
const MENU_DRAWER_SELECTOR = "#game-settings-menu";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const MENU_READY_TIMEOUT_MS = 7000;
const INTERNAL_COPY_PATTERN = /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA/i;

function getPublicUrl() {
  const pageUrl = new URL(process.env.BRICKBREAKER_PUBLIC_URL || DEFAULT_PUBLIC_URL);
  pageUrl.searchParams.set(QA_SCENARIO_PARAM_NAME, STABLE_QA_SCENARIO);
  return pageUrl.toString();
}

function getReportPath() {
  return process.env.BRICKBREAKER_HIGH_SCORES_QA_REPORT || DEFAULT_REPORT_PATH;
}

function getScreenshotPath() {
  return (
    process.env.BRICKBREAKER_HIGH_SCORES_QA_SCREENSHOT ||
    DEFAULT_SCREENSHOT_PATH
  );
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearRuntimeState(page) {
  await page.evaluate(async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();

    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases
          .map((database) => database.name)
          .filter(Boolean)
          .map(
            (databaseName) =>
              new Promise((resolve) => {
                const request = indexedDB.deleteDatabase(databaseName);
                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
                request.onblocked = () => resolve(false);
              }),
          ),
      );
    }
  });
}

async function seedScores(page) {
  await page.evaluate(
    ({
      dbName,
      dbVersion,
      scoresStoreName,
      highScoreStoreName,
      highScoreKey,
      scores,
      highScore,
    }) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(scoresStoreName)) {
            db.createObjectStore(scoresStoreName, { autoIncrement: true });
          }
          if (!db.objectStoreNames.contains(highScoreStoreName)) {
            db.createObjectStore(highScoreStoreName);
          }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(
            [scoresStoreName, highScoreStoreName],
            "readwrite",
          );
          const scoreStore = tx.objectStore(scoresStoreName);
          scoreStore.clear();
          const highScoreStore = tx.objectStore(highScoreStoreName);
          highScoreStore.clear();
          scores.forEach((score) => scoreStore.add(score));
          highScoreStore.put(highScore, highScoreKey);
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
    {
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      scoresStoreName: SCORES_STORE_NAME,
      highScoreStoreName: HIGH_SCORE_STORE_NAME,
      highScoreKey: HIGH_SCORE_KEY,
      scores: SEEDED_SCORES,
      highScore: SEEDED_HIGH_SCORE,
    },
  );
}

async function clickMenu(page) {
  await page.waitForFunction(
    (patternSource) =>
      Array.from(document.querySelectorAll("button")).some((button) =>
        new RegExp(patternSource, "i").test(button.textContent || ""),
      ),
    { timeout: MENU_READY_TIMEOUT_MS },
    MENU_BUTTON_PATTERN.source,
  );

  const buttons = await page.$$("button");
  for (const button of buttons) {
    const text = await button.evaluate((node) => node.textContent || "");
    if (MENU_BUTTON_PATTERN.test(text)) {
      await button.click();
      await page.waitForSelector(MENU_DRAWER_SELECTOR, {
        timeout: MENU_READY_TIMEOUT_MS,
      });
      return;
    }
  }
  throw new Error("Botão Menu não encontrado.");
}

async function waitForCinematicOverlayToClear(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: MENU_READY_TIMEOUT_MS,
  });
}

async function collectHighScoreState(page) {
  return page.evaluate((internalCopyPatternSource) => {
    const internalCopyPattern = new RegExp(internalCopyPatternSource, "i");
    const drawer = document.querySelector("#game-settings-menu");
    const panel = document.querySelector(".high-scores-panel");
    const ranks = Array.from(
      document.querySelectorAll(".high-scores-panel__list li"),
    ).map((item) => item.textContent?.trim() || "");
    const bestText =
      document.querySelector(".high-scores-panel__best")?.textContent?.trim() ||
      "";
    const drawerText = drawer?.textContent || "";

    return {
      hasDrawer: Boolean(drawer),
      hasPanel: Boolean(panel),
      bestText,
      ranks,
      drawerText,
      bodyHasInternalCopy: internalCopyPattern.test(document.body.textContent || ""),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
    };
  }, INTERNAL_COPY_PATTERN.source);
}

async function scrollHighScorePanelIntoView(page) {
  await page.evaluate(() => {
    document
      .querySelector(".high-scores-panel")
      ?.scrollIntoView({ block: "center" });
  });
}

function externalRequestsFor(targetUrl, requests) {
  const targetOrigin = new URL(targetUrl).origin;
  return requests.filter((requestUrl) => {
    if (requestUrl.startsWith("data:") || requestUrl.startsWith("blob:")) {
      return false;
    }
    return new URL(requestUrl).origin !== targetOrigin;
  });
}

async function run() {
  const targetUrl = getPublicUrl();
  const reportFilePath = getReportPath();
  const screenshotFilePath = getScreenshotPath();
  const requests = [];
  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    page.on("request", (request) => requests.push(request.url()));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) => {
      consoleProblems.push({ type: "pageerror", text: error.message });
    });
    await page.setViewport(IPHONE_15_VIEWPORT);
    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: MAX_NAVIGATION_MS,
    });
    await clearRuntimeState(page);
    await seedScores(page);
    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: MAX_NAVIGATION_MS,
    });
    await waitForCinematicOverlayToClear(page);
    await clickMenu(page);
    const state = await collectHighScoreState(page);
    await scrollHighScorePanelIntoView(page);
    ensureParentDirectory(screenshotFilePath);
    await page.screenshot({ path: screenshotFilePath, fullPage: true });

    const externalRequests = externalRequestsFor(targetUrl, requests);
    const report = {
      url: targetUrl,
      screenshotPath: screenshotFilePath,
      seededScores: SEEDED_SCORES,
      expectedRanks: EXPECTED_RANKS,
      state,
      externalRequests,
      consoleProblems,
    };

    ensureParentDirectory(reportFilePath);
    writeFileSync(reportFilePath, JSON.stringify(report, null, 2));

    assert(state.hasDrawer, "Menu lateral não abriu.");
    assert(state.hasPanel, "Painel de recordes não apareceu no menu.");
    assert(
      state.bestText === `Melhor partida ${SEEDED_HIGH_SCORE}`,
      "Melhor partida não refletiu recorde salvo.",
    );
    assert(
      JSON.stringify(state.ranks) === JSON.stringify(EXPECTED_RANKS),
      "Ranking local não está ordenado como esperado.",
    );
    assert(
      !state.bodyHasInternalCopy,
      "Interface expõe cópia técnica para usuário final.",
    );
    assert(externalRequests.length === 0, "Recordes geraram requests externos.");
    assert(consoleProblems.length === 0, "Console publicado contém erros/warnings.");

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
