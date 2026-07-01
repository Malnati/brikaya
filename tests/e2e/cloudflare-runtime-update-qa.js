// tests/e2e/cloudflare-runtime-update-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

const DEFAULT_PUBLIC_URL = "https://malnati-brickbreaker.pages.dev/";
const DEFAULT_MODE = "verify";
const DEFAULT_PROFILE_DIR = "tmp/browser-profiles/cloudflare-runtime-update";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-runtime-update-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-runtime-update-qa.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MODE_ENV_KEY = "BRICKBREAKER_RUNTIME_UPDATE_MODE";
const PROFILE_ENV_KEY = "BRICKBREAKER_RUNTIME_UPDATE_PROFILE";
const REPORT_ENV_KEY = "BRICKBREAKER_RUNTIME_UPDATE_REPORT";
const SCREENSHOT_ENV_KEY = "BRICKBREAKER_RUNTIME_UPDATE_SCREENSHOT";
const PUBLIC_URL_ENV_KEY = "BRICKBREAKER_PUBLIC_URL";
const SEED_MODE = "seed";
const VERIFY_MODE = "verify";
const SW_PATH = "/sw.js";
const BUILD_ID_PATTERN = /const\s+BUILD_ID\s*=\s*['"]([^'"]+)['"]/;
const BUILD_ID_PLACEHOLDER = "__BRICKBREAKER_BUILD_ID__";
const GET_VERSION_MESSAGE = "GET_VERSION";
const VERSION_MESSAGE = "VERSION";
const WAIT_TIMEOUT_MS = 60000;
const VERSION_MESSAGE_TIMEOUT_MS = 1500;
const WAIT_STEP_MS = 500;
const RETRY_ATTEMPTS = 6;
const NAVIGATION_TIMEOUT_MS = 60000;
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

function env(name, fallback) {
  return process.env[name] || fallback;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function publicUrl() {
  return env(PUBLIC_URL_ENV_KEY, DEFAULT_PUBLIC_URL);
}

function mode() {
  return env(MODE_ENV_KEY, DEFAULT_MODE);
}

function profileDir() {
  return env(PROFILE_ENV_KEY, DEFAULT_PROFILE_DIR);
}

function reportPath() {
  return env(REPORT_ENV_KEY, DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env(SCREENSHOT_ENV_KEY, DEFAULT_SCREENSHOT_PATH);
}

function isTransientNavigationError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /Execution context was destroyed|Cannot find context|Target closed|Frame was detached/i.test(
    message,
  );
}

async function waitForPageToSettle(page) {
  try {
    await page.waitForSelector("canvas", {
      timeout: VERSION_MESSAGE_TIMEOUT_MS,
    });
  } catch {}
}

function parseBuildId(source) {
  const match = source.match(BUILD_ID_PATTERN);
  return match?.[1] || null;
}

function swUrl(targetUrl) {
  const url = new URL(SW_PATH, targetUrl);
  url.searchParams.set("qaBuildCheck", String(Date.now()));
  return url.toString();
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  let closed = false;
  await Promise.race([
    browser.close().then(() => {
      closed = true;
    }),
    new Promise((resolve) => setTimeout(resolve, BROWSER_CLOSE_TIMEOUT_MS)),
  ]);

  if (!closed && browserProcess) {
    browserProcess.kill("SIGKILL");
  }
}

async function fetchLatestBuildId(page, targetUrl) {
  let lastError = null;

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt += 1) {
    try {
      const source = await page.evaluate(async (url) => {
        const response = await fetch(url, { cache: "no-store" });
        return response.text();
      }, swUrl(targetUrl));
      const buildId = parseBuildId(source);

      return {
        buildId,
        hasPlaceholder: source.includes(BUILD_ID_PLACEHOLDER),
      };
    } catch (error) {
      lastError = error;

      if (!isTransientNavigationError(error)) {
        throw error;
      }

      await waitForPageToSettle(page);
      await new Promise((resolve) => setTimeout(resolve, WAIT_STEP_MS));
    }
  }

  throw lastError;
}

async function readActiveServiceWorkerVersion(page) {
  return page.evaluate(
    ({ messageType, responseType, timeoutMs }) => {
      return new Promise((resolve) => {
        if (!navigator.serviceWorker?.controller) {
          resolve(null);
          return;
        }

        const timeout = window.setTimeout(() => {
          navigator.serviceWorker.removeEventListener("message", handleMessage);
          resolve(null);
        }, timeoutMs);

        function handleMessage(event) {
          if (event.data?.type !== responseType) {
            return;
          }

          window.clearTimeout(timeout);
          navigator.serviceWorker.removeEventListener("message", handleMessage);
          resolve({
            buildId: event.data.buildId || null,
            cacheName: event.data.cacheName || null,
          });
        }

        navigator.serviceWorker.addEventListener("message", handleMessage);
        navigator.serviceWorker.controller.postMessage({ type: messageType });
      });
    },
    {
      messageType: GET_VERSION_MESSAGE,
      responseType: VERSION_MESSAGE,
      timeoutMs: VERSION_MESSAGE_TIMEOUT_MS,
    },
  );
}

async function collectRuntimeState(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const rect = canvas?.getBoundingClientRect();

    return {
      title: document.querySelector("h1")?.textContent || "",
      hasCanvas: Boolean(canvas),
      canvas: rect
        ? {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          }
        : null,
      hasController: Boolean(navigator.serviceWorker?.controller),
      cacheNames: typeof caches !== "undefined" ? [] : [],
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
    };
  });
}

async function readCacheNames(page) {
  return page.evaluate(async () => {
    if (typeof caches === "undefined") {
      return [];
    }

    return caches.keys();
  });
}

async function openGame(page, targetUrl) {
  await page.setViewport(VIEWPORT);
  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: NAVIGATION_TIMEOUT_MS,
  });
  await page.waitForSelector("canvas", { timeout: NAVIGATION_TIMEOUT_MS });
  await page.evaluate(() => navigator.serviceWorker?.ready || null);
}

async function waitForActiveBuild(page, expectedBuildId) {
  const startedAt = Date.now();
  let lastVersion = null;
  let lastState = null;

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    try {
      await page.waitForSelector("canvas", {
        timeout: VERSION_MESSAGE_TIMEOUT_MS,
      });
      lastVersion = await readActiveServiceWorkerVersion(page);
      lastState = await collectRuntimeState(page);

      if (lastVersion?.buildId === expectedBuildId) {
        return { version: lastVersion, state: lastState };
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, WAIT_STEP_MS));
  }

  throw new Error(
    `Service Worker ativo não chegou ao BUILD_ID esperado. esperado=${expectedBuildId} último=${JSON.stringify(lastVersion)} estado=${JSON.stringify(lastState)}`,
  );
}

async function run() {
  const selectedMode = mode();
  assert(
    [SEED_MODE, VERIFY_MODE].includes(selectedMode),
    `Modo inválido: ${selectedMode}`,
  );

  const targetUrl = publicUrl();
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir: profileDir(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const consoleProblems = [];
  const navigationEvents = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleProblems.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      navigationEvents.push(frame.url());
    }
  });

  try {
    await openGame(page, targetUrl);
    const latest = await fetchLatestBuildId(page, targetUrl);
    const activeBeforeWait = await readActiveServiceWorkerVersion(page);
    const seedState = await collectRuntimeState(page);
    const cacheNamesBeforeWait = await readCacheNames(page);

    let activeAfterWait = activeBeforeWait;
    let verifyState = seedState;

    if (selectedMode === VERIFY_MODE) {
      assert(latest.buildId, "BUILD_ID publicado ausente em /sw.js.");
      assert(
        !latest.hasPlaceholder,
        "BUILD_ID publicado ainda contém placeholder.",
      );
      const active = await waitForActiveBuild(page, latest.buildId);
      activeAfterWait = active.version;
      verifyState = active.state;
    }

    const cacheNamesAfterWait = await readCacheNames(page);
    const result = {
      mode: selectedMode,
      url: targetUrl,
      profileDir: profileDir(),
      latest,
      activeBeforeWait,
      activeAfterWait,
      seedState,
      verifyState,
      cacheNamesBeforeWait,
      cacheNamesAfterWait,
      navigationEvents,
      consoleProblems,
      screenshotPath: screenshotPath(),
    };

    if (selectedMode === VERIFY_MODE) {
      assert(
        activeAfterWait?.buildId === latest.buildId,
        "Service Worker ativo não usa o BUILD_ID publicado.",
      );
      assert(
        cacheNamesAfterWait.includes(activeAfterWait.cacheName),
        "Cache ativo não encontrado após atualização.",
      );
      assert(
        verifyState.hasCanvas,
        "Canvas não renderizou após atualização automática.",
      );
      assert(
        !verifyState.viewport.scrollWidth ||
          verifyState.viewport.scrollWidth <= verifyState.viewport.width,
        "Atualização automática gerou overflow horizontal.",
      );
    }

    ensureParentDirectory(screenshotPath());
    await page.screenshot({ path: screenshotPath(), fullPage: true });
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await closeBrowser(browser);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
