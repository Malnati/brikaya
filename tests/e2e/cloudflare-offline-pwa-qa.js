// tests/e2e/cloudflare-offline-pwa-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { classifyExternalRequests } from "./allowed-external-requests.js";
import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-offline-pwa-qa.json";
const DEFAULT_SCREENSHOT_PATH = "tmp/screenshots/cloudflare-offline-pwa-qa.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MAX_NAVIGATION_MS = 45000;
const SERVICE_WORKER_TIMEOUT_MS = 15000;
const SERVICE_WORKER_WAIT_STEP_MS = 250;
const OFFLINE_READY_EVENT = "brikaya-offline-ready";
const EXPECTED_CACHE_PREFIX = "brikaya-cache";
const CANVAS_SELECTOR = "canvas";
const FORBIDDEN_USER_COPY_PATTERN =
  /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA/i;
const OFFLINE_FETCH_PATHS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/visual/sprites/spr-ball-player-default.svg",
  "/assets/visual/sprites/spr-paddle-player-default.svg",
  "/assets/visual/bricks/spr-brick-basic-red-normal.svg",
  "/assets/visual/ui/ui-pwa-app-icon.svg",
  "/assets/audio/sfx-offline-ready-01.mp3",
];

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_OFFLINE_PWA_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return (
    process.env.BRIKAYA_OFFLINE_PWA_QA_SCREENSHOT ||
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
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      );
    }

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }

    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function waitForServiceWorkerControl(page) {
  return page.evaluate(
    ({ eventName, timeoutMs, waitStepMs }) =>
      new Promise((resolve) => {
        if (!("serviceWorker" in navigator)) {
          resolve({ ready: false, controlled: false, eventSeen: false });
          return;
        }

        let eventSeen = false;
        let finished = false;
        const startedAt = Date.now();

        function finish() {
          if (finished) return;
          finished = true;
          window.removeEventListener(eventName, handleOfflineReady);
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            handleControllerChange,
          );
          resolve({
            ready: true,
            controlled: Boolean(navigator.serviceWorker.controller),
            eventSeen,
          });
        }

        function handleOfflineReady() {
          eventSeen = true;
          if (navigator.serviceWorker.controller) finish();
        }

        function handleControllerChange() {
          if (eventSeen || navigator.serviceWorker.controller) finish();
        }

        async function poll() {
          try {
            await navigator.serviceWorker.ready;
          } catch {
            resolve({ ready: false, controlled: false, eventSeen });
            return;
          }

          if (navigator.serviceWorker.controller) {
            finish();
            return;
          }

          if (Date.now() - startedAt >= timeoutMs) {
            finish();
            return;
          }

          window.setTimeout(poll, waitStepMs);
        }

        window.addEventListener(eventName, handleOfflineReady, { once: true });
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleControllerChange,
          { once: true },
        );
        poll();
      }),
    {
      eventName: OFFLINE_READY_EVENT,
      timeoutMs: SERVICE_WORKER_TIMEOUT_MS,
      waitStepMs: SERVICE_WORKER_WAIT_STEP_MS,
    },
  );
}

async function readCacheNames(page) {
  return page.evaluate(async () => {
    if (!("caches" in window)) return [];
    return caches.keys();
  });
}

async function collectOfflineState(page) {
  return page.evaluate((forbiddenCopyPatternSource) => {
    const bodyText = document.body.textContent || "";
    const canvas = document.querySelector("canvas");
    const canvasRect = canvas?.getBoundingClientRect();
    const forbiddenCopyPattern = new RegExp(forbiddenCopyPatternSource, "i");

    return {
      title: document.title,
      heading: document.querySelector("h1")?.textContent || "",
      hasCanvas: Boolean(canvas),
      hasController: Boolean(navigator.serviceWorker?.controller),
      bodyHasInternalCopy: forbiddenCopyPattern.test(bodyText),
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
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
    };
  }, FORBIDDEN_USER_COPY_PATTERN.source);
}

async function fetchOfflinePaths(page) {
  return page.evaluate(async (paths) =>
    Promise.all(
      paths.map(async (path) => {
        try {
          const response = await fetch(path);
          return {
            path,
            ok: response.ok,
            status: response.status,
            contentType: response.headers.get("content-type") || "",
          };
        } catch (error) {
          return {
            path,
            ok: false,
            status: 0,
            contentType: "",
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    ),
  OFFLINE_FETCH_PATHS);
}

async function run() {
  const targetUrl = publicUrl();
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });
  const page = await browser.newPage();
  const allRequests = [];
  const failedRequests = [];
  let offlineStarted = false;

  page.on("request", (request) => {
    allRequests.push({ url: request.url(), offline: offlineStarted });
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      offline: offlineStarted,
      failure: request.failure()?.errorText || "unknown",
    });
  });

  try {
    await page.setViewport(VIEWPORT);
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await clearRuntimeState(page);
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector(CANVAS_SELECTOR, { timeout: MAX_NAVIGATION_MS });
    await acceptPrivacyConsentIfPresent(page);

    const serviceWorkerState = await waitForServiceWorkerControl(page);
    const cacheNamesBeforeOffline = await readCacheNames(page);
    assert(serviceWorkerState.ready, "Service Worker não ficou pronto.");
    assert(
      serviceWorkerState.controlled,
      "Página não ficou controlada para uso sem internet.",
    );
    assert(
      cacheNamesBeforeOffline.some((cacheName) =>
        cacheName.startsWith(EXPECTED_CACHE_PREFIX),
      ),
      `Cache offline esperado ausente: ${JSON.stringify(cacheNamesBeforeOffline)}`,
    );

    offlineStarted = true;
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: "domcontentloaded", timeout: MAX_NAVIGATION_MS });
    await page.waitForSelector(CANVAS_SELECTOR, { timeout: MAX_NAVIGATION_MS });
    await acceptPrivacyConsentIfPresent(page);

    const offlineFetchChecks = await fetchOfflinePaths(page);
    const offlineState = await collectOfflineState(page);
    const cacheNamesAfterOffline = await readCacheNames(page);
    ensureParentDirectory(screenshotPath());
    await page.screenshot({ path: screenshotPath(), fullPage: true });

    const failedOfflineFetches = offlineFetchChecks.filter((item) => !item.ok);
    const offlineRequestFailures = failedRequests.filter((request) => request.offline);
    const publicOrigin = new URL(targetUrl).origin;
    const sameOriginOfflineRequestFailures = offlineRequestFailures.filter(
      (request) => new URL(request.url).origin === publicOrigin,
    );
    const externalRequests = allRequests.filter(
      (request) =>
        request.offline && new URL(request.url).origin !== publicOrigin,
    );
    const {
      allowedExternalRequests,
      unexpectedExternalRequests,
    } = classifyExternalRequests(
      externalRequests.map((request) => request.url),
      targetUrl,
    );
    const {
      allowedExternalRequests: allowedOfflineRequestFailures,
      unexpectedExternalRequests: unexpectedOfflineRequestFailures,
    } = classifyExternalRequests(
      offlineRequestFailures.map((request) => request.url),
      targetUrl,
    );

    assert(offlineState.hasCanvas, "Canvas ausente após recarregar sem internet.");
    assert(
      offlineState.hasController,
      "Controle offline ausente após recarregar sem internet.",
    );
    assert(
      !offlineState.bodyHasInternalCopy,
      "Texto final expõe termo técnico interno.",
    );
    assert(
      failedOfflineFetches.length === 0,
      `Arquivos essenciais falharam offline: ${JSON.stringify(failedOfflineFetches)}`,
    );
    assert(
      sameOriginOfflineRequestFailures.length === 0,
      `Requests próprios falharam sem internet: ${JSON.stringify(sameOriginOfflineRequestFailures)}`,
    );
    assert(
      unexpectedOfflineRequestFailures.length === 0,
      `Requests externos inesperados falharam sem internet: ${JSON.stringify(unexpectedOfflineRequestFailures)}`,
    );
    assert(
      unexpectedExternalRequests.length === 0,
      `Requests externos inesperados detectados: ${unexpectedExternalRequests.join(", ")}`,
    );

    const report = {
      ok: true,
      publicUrl: targetUrl,
      checkedAt: new Date().toISOString(),
      serviceWorkerState,
      cacheNamesBeforeOffline,
      cacheNamesAfterOffline,
      offlineFetchChecks,
      offlineState,
      externalRequests,
      allowedExternalRequests,
      unexpectedExternalRequests,
      allowedOfflineRequestFailures,
      unexpectedOfflineRequestFailures,
      failedRequests,
      screenshotPath: screenshotPath(),
    };
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await page.setOfflineMode(false).catch(() => undefined);
    await browser.close();
  }
}

run().catch((error) => {
  ensureParentDirectory(reportPath());
  writeFileSync(
    reportPath(),
    `${JSON.stringify(
      {
        ok: false,
        publicUrl: publicUrl(),
        error: error.message,
        checkedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  console.error(error);
  process.exit(1);
});
