// tests/e2e/cloudflare-evasive-blocks-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-evasive-blocks-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-evasive-blocks-qa.png";
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
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
};
const GAME_LOG_DB_NAME = "BrickBreakerGameLog";
const GAME_LOG_STORE_NAME = "gameEvents";
const GAME_LOG_DB_VERSION = 2;
const EXPECTED_QA_SCENARIO = "evasive-blocks";
const EXPECTED_HOSTNAME = "brikaya.com";
const PAGES_PREVIEW_HOST_SUFFIX = ".pages.dev";
const EVENT_COLLISION = "collision";
const COLLISION_TARGET_BRICK = "brick";
const EXPECTED_INITIAL_SCORE = 0;
const EXPECTED_INITIAL_BRICKS_REMAINING = 3;
const MAX_WAIT_FOR_COLLISION_MS = 30000;
const POLL_INTERVAL_MS = 500;
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
  return env("BRICKBREAKER_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env("BRICKBREAKER_EVASIVE_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRICKBREAKER_EVASIVE_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
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

function isAllowedPublishedHost(hostname) {
  return (
    hostname === EXPECTED_HOSTNAME || hostname.endsWith(PAGES_PREVIEW_HOST_SUFFIX)
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

function isBrickCollision(event) {
  return (
    event.type === EVENT_COLLISION &&
    (!event.collisionInfo || event.collisionInfo?.type === COLLISION_TARGET_BRICK)
  );
}

function summarizeEvents(events) {
  return events.reduce((summary, event) => {
    summary[event.type] = (summary[event.type] || 0) + 1;
    return summary;
  }, {});
}

function compactEvent(event, index) {
  return {
    index,
    type: event.type,
    score: event.gameState?.score ?? null,
    bricksRemaining: event.gameState?.bricksRemaining ?? null,
    collisionType: event.collisionInfo?.type ?? null,
  };
}

async function waitForBrickCollision(page) {
  const start = Date.now();
  let latestEvents = [];
  while (Date.now() - start < MAX_WAIT_FOR_COLLISION_MS) {
    latestEvents = await readGameEvents(page);
    if (latestEvents.some(isBrickCollision)) return latestEvents;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(
    `No brick collision detected after ${MAX_WAIT_FOR_COLLISION_MS}ms; events=${JSON.stringify(
      summarizeEvents(latestEvents),
    )}`,
  );
}

function isEvasiveFirstCollision(event) {
  return (
    isBrickCollision(event) &&
    event.gameState?.score === EXPECTED_INITIAL_SCORE &&
    event.gameState?.bricksRemaining === EXPECTED_INITIAL_BRICKS_REMAINING
  );
}

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(CHROME_LOW_RESOURCE_ARGS),
  });
  const page = await browser.newPage();
  const pageUrl = withQaScenario(publicUrl());
  const origin = new URL(pageUrl).origin;
  const consoleProblems = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleProblems.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    consoleProblems.push({ type: "pageerror", text: error.message });
  });

  try {
    assert(
      isAllowedPublishedHost(new URL(pageUrl).hostname),
      `Unexpected host for public QA: ${pageUrl}`,
    );
    await page.setViewport(VIEWPORT);
    await clearOriginState(page, origin);
    await page.goto(pageUrl, { waitUntil: "networkidle0" });
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForSelector("canvas", { timeout: MAX_WAIT_FOR_COLLISION_MS });

    const events = await waitForBrickCollision(page);
    const firstCollisionIndex = events.findIndex(isBrickCollision);
    const evasiveCollisionIndex = events.findIndex(isEvasiveFirstCollision);

    ensureParentDirectory(screenshotPath());
    await page.screenshot({ path: screenshotPath(), fullPage: true });

    const report = {
      publicUrl: pageUrl,
      qaScenario: EXPECTED_QA_SCENARIO,
      eventSummary: summarizeEvents(events),
      firstCollisionIndex,
      evasiveCollisionIndex,
      recentEvents: events.map(compactEvent).slice(-25),
      consoleProblems,
      screenshot: screenshotPath(),
    };
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);

    assert(firstCollisionIndex >= 0, "Expected brick collision event");
    assert(
      evasiveCollisionIndex >= 0,
      "Expected first evasive collision without score update or brick loss",
    );
    assert(consoleProblems.length === 0, "Console problems detected");
    console.log(`cloudflare-evasive-blocks-qa ok: ${reportPath()}`);
  } finally {
    await closeBrowser(browser);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
