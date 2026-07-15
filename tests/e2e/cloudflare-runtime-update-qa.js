// tests/e2e/cloudflare-runtime-update-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";

import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";
import { assertAllowedQaHostname } from "./publicQaEnv.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/play/";
const DEFAULT_MODE = "verify";
const DEFAULT_PROFILE_DIR = "tmp/browser-profiles/cloudflare-runtime-update";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-runtime-update-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-runtime-update-qa.png";
const MODE_ENV_KEY = "BRIKAYA_RUNTIME_UPDATE_MODE";
const PROFILE_ENV_KEY = "BRIKAYA_RUNTIME_UPDATE_PROFILE";
const REPORT_ENV_KEY = "BRIKAYA_RUNTIME_UPDATE_REPORT";
const SCREENSHOT_ENV_KEY = "BRIKAYA_RUNTIME_UPDATE_SCREENSHOT";
const PUBLIC_URL_ENV_KEY = "BRIKAYA_PUBLIC_URL";
const SEED_MODE = "seed";
const VERIFY_MODE = "verify";
const SW_PATH = "/sw.js";
const SERVICE_WORKER_SCOPE = "/";
const SERVICE_WORKER_UPDATE_VIA_CACHE = "none";
const SERVICE_WORKER_UPDATE_CACHE_BUST_PARAM = "qaRuntimeUpdate";
const BUILD_ID_PATTERN = /const\s+BUILD_ID\s*=\s*['"]([^'"]+)['"]/;
const BUILD_ID_PLACEHOLDER = "__BRIKAYA_BUILD_ID__";
const GET_VERSION_MESSAGE = "GET_VERSION";
const VERSION_MESSAGE = "VERSION";
const SKIP_WAITING_MESSAGE = "SKIP_WAITING";
const WAIT_TIMEOUT_MS = 60000;
const VERSION_MESSAGE_TIMEOUT_MS = 1500;
const UPDATE_UI_SETTLE_TIMEOUT_MS = 8000;
const UPDATE_UI_SETTLE_STEP_MS = 250;
const WAIT_STEP_MS = 500;
const UPDATE_TRIGGER_INTERVAL_MS = 3000;
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
const LAZY_ASSET_PROBE_PATHS = [
  "/assets/visual/sprites/spr-ball-player-default.svg",
  "/assets/visual/components/spr-component-basic-red-normal.svg",
  "/assets/audio/sfx-offline-ready-01.mp3",
];
const ASSET_CACHE_STATUS_HEADER = "x-brikaya-asset-cache";
const ASSET_CACHE_MISS_STATUS = "miss";
const UPDATE_PROGRESS_TEXT = "Atualizando jogo";
const UPDATE_INSTALLED_PATTERN = /Versão v\d+ instalada/;
const DEFAULT_UPDATE_UI_STATE = Object.freeze({
  hasProgressMessage: false,
  hasInstalledMessage: false,
  progressValue: null,
});
const TRANSIENT_NAVIGATION_ERROR_TEXTS = [
  "Execution context was destroyed",
  "Cannot find context with specified id",
  "Most likely the page has been closed",
];

function env(name, fallback) {
  return process.env[name] || fallback;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isTransientNavigationError(error) {
  const message = String(error?.message || error || "");

  return TRANSIENT_NAVIGATION_ERROR_TEXTS.some((text) =>
    message.includes(text),
  );
}

function publicUrl() {
  return env(PUBLIC_URL_ENV_KEY, DEFAULT_PUBLIC_URL);
}

function assertCanonicalUrl(targetUrl) {
  assertAllowedQaHostname(targetUrl);
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

async function fetchLatestBuildId(_page, targetUrl) {
  let lastError = null;

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(swUrl(targetUrl), {
        headers: { "Cache-Control": "no-cache" },
      });
      const source = await response.text();
      const buildId = parseBuildId(source);

      return {
        buildId,
        hasPlaceholder: source.includes(BUILD_ID_PLACEHOLDER),
      };
    } catch (error) {
      lastError = error;
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

async function collectUpdateUiState(page) {
  return page.evaluate(
    ({ progressText, installedPatternSource }) => {
      const bodyText = document.body.textContent || "";
      const progressBar = document.querySelector(
        '[role="progressbar"][aria-label="Progresso da atualização"]',
      );
      const installedPattern = new RegExp(installedPatternSource);

      return {
        hasProgressMessage: bodyText.includes(progressText),
        hasInstalledMessage: installedPattern.test(bodyText),
        progressValue: progressBar?.getAttribute("aria-valuenow") || null,
      };
    },
    {
      progressText: UPDATE_PROGRESS_TEXT,
      installedPatternSource: UPDATE_INSTALLED_PATTERN.source,
    },
  );
}

async function waitForUpdateUiState(page, shouldExpectInstalled) {
  const startedAt = Date.now();
  let lastState = await collectUpdateUiStateSafely(page);

  while (
    shouldExpectInstalled &&
    !lastState.hasInstalledMessage &&
    Date.now() - startedAt < UPDATE_UI_SETTLE_TIMEOUT_MS
  ) {
    await page.waitForTimeout(UPDATE_UI_SETTLE_STEP_MS);
    lastState = await collectUpdateUiStateSafely(page, lastState);
  }

  return lastState;
}

async function collectUpdateUiStateSafely(
  page,
  fallbackState = DEFAULT_UPDATE_UI_STATE,
) {
  try {
    await page.waitForSelector("body", {
      timeout: VERSION_MESSAGE_TIMEOUT_MS,
    });
    return await collectUpdateUiState(page);
  } catch (error) {
    if (!isTransientNavigationError(error)) {
      throw error;
    }

    return fallbackState;
  }
}

async function readCacheNames(page) {
  return page.evaluate(async () => {
    if (typeof caches === "undefined") {
      return [];
    }

    return caches.keys();
  });
}

async function fetchLazyAssetProbe(page) {
  return page.evaluate(
    async ({ paths, cacheStatusHeader }) =>
      Promise.all(
        paths.map(async (path) => {
          const response = await fetch(path, { cache: "no-store" });

          return {
            path,
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get("content-type") || "",
            assetCacheStatus: response.headers.get(cacheStatusHeader) || "",
          };
        }),
      ),
    {
      paths: LAZY_ASSET_PROBE_PATHS,
      cacheStatusHeader: ASSET_CACHE_STATUS_HEADER,
    },
  );
}

async function openGame(page, targetUrl) {
  await page.setViewport(VIEWPORT);
  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: NAVIGATION_TIMEOUT_MS,
  });
  await page.waitForSelector("canvas", { timeout: NAVIGATION_TIMEOUT_MS });
  await acceptPrivacyConsentIfPresent(page);
  await page.evaluate(() => navigator.serviceWorker?.ready || null);
}

async function triggerRuntimeUpdateCheck(page) {
  try {
    await page.evaluate(
      async ({
        cacheBustParam,
        scope,
        skipWaitingMessage,
        swPath,
        updateViaCache,
      }) => {
        try {
          window.dispatchEvent(new Event("focus"));
        } catch {}
        try {
          const pageShowEvent =
            typeof PageTransitionEvent === "function"
              ? new PageTransitionEvent("pageshow")
              : new Event("pageshow");
          window.dispatchEvent(pageShowEvent);
        } catch {}
        try {
          document.dispatchEvent(new Event("visibilitychange"));
        } catch {}

        const registration =
          await navigator.serviceWorker?.getRegistration(scope);
        await registration?.update().catch(() => {});
        registration?.waiting?.postMessage({ type: skipWaitingMessage });

        if (!registration?.installing && !registration?.waiting) {
          const cacheBustUrl = new URL(swPath, window.location.origin);
          cacheBustUrl.searchParams.set(cacheBustParam, String(Date.now()));
          const refreshedRegistration = await navigator.serviceWorker
            .register(`${cacheBustUrl.pathname}${cacheBustUrl.search}`, {
              scope,
              updateViaCache,
            })
            .catch(() => null);
          const pendingWorker =
            refreshedRegistration?.waiting || refreshedRegistration?.installing;
          pendingWorker?.postMessage({ type: skipWaitingMessage });
        }
      },
      {
        cacheBustParam: SERVICE_WORKER_UPDATE_CACHE_BUST_PARAM,
        scope: SERVICE_WORKER_SCOPE,
        skipWaitingMessage: SKIP_WAITING_MESSAGE,
        swPath: SW_PATH,
        updateViaCache: SERVICE_WORKER_UPDATE_VIA_CACHE,
      },
    );
  } catch {}
}

async function waitForActiveBuild(page, expectedBuildId) {
  const startedAt = Date.now();
  let lastUpdateTriggerAt = 0;
  let lastVersion = null;
  let lastState = null;

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    try {
      await page.waitForSelector("canvas", {
        timeout: VERSION_MESSAGE_TIMEOUT_MS,
      });
      if (Date.now() - lastUpdateTriggerAt >= UPDATE_TRIGGER_INTERVAL_MS) {
        await triggerRuntimeUpdateCheck(page);
        lastUpdateTriggerAt = Date.now();
      }
      lastVersion = await readActiveServiceWorkerVersion(page);
      lastState = await collectRuntimeState(page);

      if (lastVersion?.buildId === expectedBuildId) {
        return { version: lastVersion, state: lastState };
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, WAIT_STEP_MS));
  }

  try {
    await page.reload({
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    await page.waitForSelector("canvas", {
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    await acceptPrivacyConsentIfPresent(page);
    lastVersion = await readActiveServiceWorkerVersion(page);
    lastState = await collectRuntimeState(page);

    if (lastVersion?.buildId === expectedBuildId) {
      return { version: lastVersion, state: lastState };
    }
  } catch {}

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
  assertCanonicalUrl(targetUrl);
  const browser = await puppeteer.launch(
    buildPuppeteerLaunchOptions({
      userDataDir: profileDir(),
      extraArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
    }),
  );
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
    const shouldExpectInstalledMessage =
      Boolean(activeBeforeWait?.buildId) &&
      activeBeforeWait?.buildId !== latest.buildId;
    const updateUiState = await waitForUpdateUiState(
      page,
      shouldExpectInstalledMessage,
    );
    const staleCacheNamesBefore = cacheNamesBeforeWait.filter((cacheName) => {
      return (
        cacheName.startsWith("brikaya-cache") &&
        cacheName !== activeAfterWait?.cacheName
      );
    });
    const staleCacheNamesAfter = cacheNamesAfterWait.filter((cacheName) => {
      return (
        cacheName.startsWith("brikaya-cache") &&
        cacheName !== activeAfterWait?.cacheName
      );
    });
    const lazyAssetProbe = await fetchLazyAssetProbe(page);
    const shouldRequireLazyAssetCacheHit =
      selectedMode === VERIFY_MODE &&
      staleCacheNamesBefore.length > 0 &&
      activeBeforeWait?.buildId !== latest.buildId;
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
      staleCacheNamesBefore,
      staleCacheNamesAfter,
      lazyAssetProbe,
      updateUiState,
      shouldRequireLazyAssetCacheHit,
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
      if (
        staleCacheNamesBefore.length > 0 &&
        activeBeforeWait?.buildId !== latest.buildId
      ) {
        assert(
          staleCacheNamesAfter.length === 0,
          `Caches antigos não foram removidos: ${staleCacheNamesAfter.join(", ")}`,
        );
      }

      assert(
        lazyAssetProbe.every((item) => item.ok),
        `Probe lazy de assets falhou: ${JSON.stringify(lazyAssetProbe)}`,
      );
      if (shouldRequireLazyAssetCacheHit) {
        const missedProbeAssets = lazyAssetProbe.filter(
          (item) => item.assetCacheStatus === ASSET_CACHE_MISS_STATUS,
        );
        assert(
          missedProbeAssets.length === 0,
          `Assets cacheados foram baixados novamente após update: ${JSON.stringify(missedProbeAssets)}`,
        );
      }
      if (shouldExpectInstalledMessage) {
        assert(
          updateUiState.hasInstalledMessage,
          `Confirmação visual de versão instalada ausente: ${JSON.stringify(updateUiState)}`,
        );
      }
      assert(
        verifyState.hasCanvas,
        "Canvas não renderizou após atualização automática.",
      );
      assert(
        !verifyState.viewport.scrollWidth ||
          verifyState.viewport.scrollWidth <= verifyState.viewport.width,
        "Atualização automática gerou overflow horizontal.",
      );
      assert(
        consoleProblems.length === 0,
        `Console reportou warnings/errors durante QA runtime: ${consoleProblems.map((problem) => problem.text).join(" | ")}`,
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
