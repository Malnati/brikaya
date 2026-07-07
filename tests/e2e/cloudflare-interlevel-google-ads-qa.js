// tests/e2e/cloudflare-interlevel-google-ads-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-interlevel-google-ads.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-interlevel-google-ads.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
const MAX_WAIT_FOR_LEVEL_MS = 30000;
const MIN_INTERLEVEL_PAUSE_MS = 1500;
const AD_HOLD_ASSERTION_DELAY_MS = 2200;
const LEVEL_TRANSITION_EVENT_NAME = "brikaya:level-transition";
const GOOGLE_REPORT_ONLY_FRAME_ANCESTORS_PATTERN =
  /Framing 'https:\/\/www\.google\.com\/' violates the following report-only Content Security Policy directive: "frame-ancestors 'self'"/;
const OFFLINE_RESOURCE_LOAD_PATTERN =
  /Failed to load resource: net::ERR_INTERNET_DISCONNECTED/;

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_INTERLEVEL_AD_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return process.env.BRIKAYA_INTERLEVEL_AD_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isIgnorableConsoleProblem(text) {
  return (
    GOOGLE_REPORT_ONLY_FRAME_ANCESTORS_PATTERN.test(text) ||
    OFFLINE_RESOURCE_LOAD_PATTERN.test(text)
  );
}

function withQaScenario(url) {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("qaScenario", "single-brick-phase3-clear");
  return pageUrl.toString();
}

async function clearGameState(page) {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();

    const names = [
      "BrikayaGameLog",
      "BrikayaCollisions",
      "SystemDebugLog",
      "brikaya",
    ];
    await Promise.all(
      names.map(
        (name) =>
          new Promise((resolveDatabaseDelete) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolveDatabaseDelete();
            request.onerror = () => resolveDatabaseDelete();
            request.onblocked = () => resolveDatabaseDelete();
          }),
      ),
    );
  });
}

async function readGameEvents(page) {
  return page.evaluate(
    async ({ dbName, storeName, dbVersion }) =>
      new Promise((resolveEvents) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveEvents([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolveEvents([]);
            return;
          }
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
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

async function waitForLevelStart(page) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion }) => {
      const events = await new Promise((resolveEvents) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveEvents([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolveEvents([]);
            return;
          }
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
          };
        };
      });
      return events.some((event) => event.type === "level_start");
    },
    { timeout: MAX_WAIT_FOR_LEVEL_MS },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
    },
  );
}

async function installLevelTransitionRecorder(page) {
  await page.evaluate((eventName) => {
    window.__BRIKAYA_LEVEL_TRANSITIONS__ = [];
    window.addEventListener(eventName, (event) => {
      window.__BRIKAYA_LEVEL_TRANSITIONS__.push(event.detail);
    });
  }, LEVEL_TRANSITION_EVENT_NAME);
}

async function waitForTransitionFinish(page, nextLevel = 4) {
  await page.waitForFunction(
    (expectedNextLevel) =>
      window.__BRIKAYA_LEVEL_TRANSITIONS__?.some(
        (event) => event.phase === "finish" && event.nextLevel === expectedNextLevel,
      ),
    { timeout: MAX_WAIT_FOR_LEVEL_MS },
    nextLevel,
  );
}

async function readTransitions(page) {
  return page.evaluate(() => window.__BRIKAYA_LEVEL_TRANSITIONS__ || []);
}

async function waitForLevelComplete(page) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion }) => {
      const events = await new Promise((resolveEvents) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolveEvents([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolveEvents([]);
            return;
          }
          const tx = db.transaction([storeName], "readonly");
          const store = tx.objectStore(storeName);
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
          };
        };
      });
      return events.some((event) => event.type === "level_complete");
    },
    { timeout: MAX_WAIT_FOR_LEVEL_MS },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
    },
  );
}

function summarizeEvents(events) {
  const byType = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
  }
  return byType;
}

function calculatePauseDeltaMs(events) {
  const levelComplete = events.find((event) => event.type === "level_complete");
  const levelStart = events.find((event) => event.type === "level_start");
  return levelComplete && levelStart
    ? levelStart.timestamp - levelComplete.timestamp
    : 0;
}

async function prepareScenarioPage(browser, targetUrl, consoleProblems) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  page.on("console", (message) => {
    if (["error", "warn"].includes(message.type())) {
      const text = message.text();
      if (!isIgnorableConsoleProblem(text)) {
        consoleProblems.push({ type: message.type(), text });
      }
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push({ type: "pageerror", text: error.message }),
  );

  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await clearGameState(page);
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  return page;
}

async function installHeldAdStub(page) {
  await page.evaluate(() => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    window.__BRIKAYA_TEST_AD_STATE__ = {
      active: false,
      afterCalls: 0,
      beforeCalls: 0,
      configs: [],
      doneCalls: 0,
      requests: [],
    };

    window.adConfig = (config) => {
      window.__BRIKAYA_TEST_AD_STATE__.configs.push(config);
    };

    window.adBreak = (placement) => {
      const state = window.__BRIKAYA_TEST_AD_STATE__;
      state.requests.push({ type: placement.type, name: placement.name });
      state.active = true;
      placement.beforeAd?.();
      state.beforeCalls += 1;

      state.finish = () => {
        if (!state.active) return;
        state.active = false;
        placement.afterAd?.();
        state.afterCalls += 1;
        placement.adBreakDone?.({ breakStatus: "viewed" });
        state.doneCalls += 1;
      };
    };
  });
}

async function installNoFillAdStub(page) {
  await page.evaluate(() => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    window.__BRIKAYA_TEST_AD_STATE__ = {
      configs: [],
      requests: [],
      doneCalls: 0,
    };

    window.adConfig = (config) => {
      window.__BRIKAYA_TEST_AD_STATE__.configs.push(config);
    };

    window.adBreak = (placement) => {
      const state = window.__BRIKAYA_TEST_AD_STATE__;
      state.requests.push({ type: placement.type, name: placement.name });
      placement.adBreakDone?.({ breakStatus: "notReady" });
      state.doneCalls += 1;
    };
  });
}

async function installCountingAdStub(page) {
  await page.evaluate(() => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    window.__BRIKAYA_TEST_AD_STATE__ = {
      requests: [],
    };
    window.adBreak = (placement) => {
      window.__BRIKAYA_TEST_AD_STATE__.requests.push({
        type: placement.type,
        name: placement.name,
      });
    };
  });
}

async function readAdState(page) {
  return page.evaluate(() => window.__BRIKAYA_TEST_AD_STATE__ || null);
}

async function runHeldAdScenario(browser, targetUrl, consoleProblems) {
  const page = await prepareScenarioPage(browser, targetUrl, consoleProblems);
  try {
    await installLevelTransitionRecorder(page);
    await installHeldAdStub(page);
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForFunction(
      () => window.__BRIKAYA_TEST_AD_STATE__?.active === true,
      { timeout: MAX_WAIT_FOR_LEVEL_MS },
    );
    await page.screenshot({ path: screenshotPath(), fullPage: true });
    await new Promise((resolveDelay) =>
      setTimeout(resolveDelay, AD_HOLD_ASSERTION_DELAY_MS),
    );

    const heldTransitions = await readTransitions(page);
    assert(
      heldTransitions.some((event) => event.phase === "start"),
      "Transição entre fases não começou antes do anúncio simulado.",
    );
    assert(
      !heldTransitions.some((event) => event.phase === "finish"),
      "Fase seguinte iniciou antes do fim do anúncio simulado.",
    );

    await page.evaluate(() => window.__BRIKAYA_TEST_AD_STATE__.finish());
    await page.waitForSelector('[data-testid="post-ad-resume-prompt"]', {
      timeout: MAX_WAIT_FOR_LEVEL_MS,
    });
    await page.screenshot({ path: screenshotPath(), fullPage: true });

    const promptTransitions = await readTransitions(page);
    assert(
      !promptTransitions.some((event) => event.phase === "finish"),
      "Fase seguinte iniciou antes do clique na mensagem pós-publicidade.",
    );

    const promptText = await page.$eval(
      '[data-testid="post-ad-resume-prompt"]',
      (element) => element.textContent.trim(),
    );
    assert(
      promptText.includes("Fase 4") || promptText.includes("Level 4"),
      `Mensagem pós-publicidade não orientou a volta à fase 4: ${promptText}`,
    );

    await page.click('[data-testid="post-ad-resume-cta"]');
    await waitForTransitionFinish(page);

    const adState = await readAdState(page);
    const transitions = await readTransitions(page);
    const start = transitions.find((event) => event.phase === "start");
    const finish = transitions.find((event) => event.phase === "finish");
    const pauseDeltaMs = finish.timestamp - start.timestamp;

    assert(adState.requests.length === 1, "Interstitial simulado não foi chamado uma vez.");
    assert(adState.requests[0].type === "next", "Interstitial não usou tipo next.");
    assert(
      adState.requests[0].name === "brikaya_level_3_to_4",
      `Nome de placement inesperado: ${adState.requests[0].name}`,
    );
    assert(adState.beforeCalls === 1, "beforeAd não foi chamado uma vez.");
    assert(adState.afterCalls === 1, "afterAd não foi chamado uma vez.");
    assert(adState.doneCalls === 1, "adBreakDone não foi chamado uma vez.");
    assert(
      pauseDeltaMs >= AD_HOLD_ASSERTION_DELAY_MS,
      `Transição não esperou anúncio simulado: ${pauseDeltaMs}ms.`,
    );

    return {
      adState,
      pauseDeltaMs,
      transitions,
    };
  } finally {
    await page.close();
  }
}

async function runNoFillScenario(browser, targetUrl, consoleProblems) {
  const page = await prepareScenarioPage(browser, targetUrl, consoleProblems);
  try {
    await installLevelTransitionRecorder(page);
    await installNoFillAdStub(page);
    await acceptPrivacyConsentIfPresent(page);
    await waitForTransitionFinish(page);

    const adState = await readAdState(page);
    const transitions = await readTransitions(page);
    const promptVisible = await page.$('[data-testid="post-ad-resume-prompt"]');
    const start = transitions.find((event) => event.phase === "start");
    const finish = transitions.find((event) => event.phase === "finish");
    const pauseDeltaMs = finish.timestamp - start.timestamp;

    assert(adState.requests.length === 1, "No-fill não chamou adBreak uma vez.");
    assert(adState.requests[0].type === "next", "No-fill não usou tipo next.");
    assert(adState.doneCalls === 1, "No-fill não retornou adBreakDone.");
    assert(!promptVisible, "No-fill mostrou mensagem pós-publicidade.");
    assert(
      pauseDeltaMs >= MIN_INTERLEVEL_PAUSE_MS,
      `Pausa mínima no no-fill curta demais: ${pauseDeltaMs}ms.`,
    );

    return {
      adState,
      pauseDeltaMs,
      transitions,
    };
  } finally {
    await page.close();
  }
}

async function runOfflineScenario(browser, targetUrl, consoleProblems) {
  const page = await prepareScenarioPage(browser, targetUrl, consoleProblems);
  try {
    await installLevelTransitionRecorder(page);
    await installCountingAdStub(page);
    await page.setOfflineMode(true);
    await acceptPrivacyConsentIfPresent(page);
    await waitForTransitionFinish(page);

    const adState = await readAdState(page);
    const transitions = await readTransitions(page);
    const promptVisible = await page.$('[data-testid="post-ad-resume-prompt"]');
    const start = transitions.find((event) => event.phase === "start");
    const finish = transitions.find((event) => event.phase === "finish");
    const pauseDeltaMs = finish.timestamp - start.timestamp;

    assert(adState.requests.length === 0, "Offline chamou adBreak.");
    assert(!promptVisible, "Offline mostrou mensagem pós-publicidade.");
    assert(
      pauseDeltaMs >= MIN_INTERLEVEL_PAUSE_MS,
      `Pausa mínima offline curta demais: ${pauseDeltaMs}ms.`,
    );

    return {
      adState,
      pauseDeltaMs,
      transitions,
    };
  } finally {
    await page.setOfflineMode(false).catch(() => {});
    await page.close();
  }
}

async function runNoConsentScenario(browser, targetUrl, consoleProblems) {
  const page = await prepareScenarioPage(browser, targetUrl, consoleProblems);
  try {
    await installLevelTransitionRecorder(page);
    await installCountingAdStub(page);
    await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));

    const adState = await readAdState(page);
    const transitions = await readTransitions(page);
    const dialogText = await page.$eval('[role="dialog"]', (element) =>
      element.textContent.trim(),
    );

    assert(adState.requests.length === 0, "Sem consentimento chamou adBreak.");
    assert(transitions.length === 0, "Sem consentimento iniciou transição.");
    assert(
      dialogText.includes("Antes de jogar") || dialogText.includes("Before playing"),
      "Tela de consentimento não permaneceu visível.",
    );

    return {
      adState,
      dialogVisible: true,
      transitions,
    };
  } finally {
    await page.close();
  }
}

async function run() {
  const targetUrl = withQaScenario(publicUrl());
  const outReport = reportPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(screenshotPath());

  const parsed = new URL(targetUrl);
  assert(parsed.hostname === "brikaya.com", `URL precisa ser brikaya.com: ${targetUrl}`);

  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(["--no-first-run", "--no-default-browser-check"]),
  });

  try {
    const report = {
      url: targetUrl,
      screenshotPath: screenshotPath(),
      heldAd: await runHeldAdScenario(browser, targetUrl, consoleProblems),
      noFill: await runNoFillScenario(browser, targetUrl, consoleProblems),
      offline: await runOfflineScenario(browser, targetUrl, consoleProblems),
      noConsent: await runNoConsentScenario(browser, targetUrl, consoleProblems),
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
