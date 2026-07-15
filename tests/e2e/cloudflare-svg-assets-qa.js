// tests/e2e/cloudflare-svg-assets-qa.js
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";
import { classifyExternalRequests } from "./allowed-external-requests.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/play/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-svg-assets-qa.json";
const DEFAULT_SCREENSHOT_PATH = "tmp/screenshots/cloudflare-svg-assets-qa.png";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const VISUAL_ASSET_SOURCE_PATH = "src/constants/visualAssets.ts";
const RUNTIME_SVG_PATTERN = /['"`]((?:\/assets\/visual\/)[^'"`]+\.svg)['"`]/g;
const ASSET_MANIFEST_PATH = "/asset-cache-manifest.json";
const ASSET_HASH_SEARCH_PARAM = "bbAssetHash";
const ASSET_CACHE_STATUS_HEADER = "x-brikaya-asset-cache";
const EXPECTED_SVG_PATHS = [
  ...new Set(
    [
      ...readFileSync(VISUAL_ASSET_SOURCE_PATH, "utf8").matchAll(
        RUNTIME_SVG_PATTERN,
      ),
    ].map((match) => match[1]),
  ),
].sort();
const FORBIDDEN_RUNTIME_RASTER =
  /\/assets\/[^\s?]+\.(?:png|jpe?g|webp|gif)(?:\?|$)/i;
const MAX_NAVIGATION_MS = 30000;
const SERVICE_WORKER_READY_MS = 10000;
const OFFLINE_FAILURE_PATTERN = /net::ERR_INTERNET_DISCONNECTED/i;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRIKAYA_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env("BRIKAYA_SVG_ASSETS_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRIKAYA_SVG_ASSETS_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function waitForControlledServiceWorker(page) {
  return page.evaluate(
    (timeoutMs) =>
      new Promise((resolve) => {
        if (!("serviceWorker" in navigator)) {
          resolve(false);
          return;
        }

        const done = (controlled) => {
          clearTimeout(timer);
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            handleControllerChange,
          );
          resolve(controlled);
        };
        const handleControllerChange = () =>
          done(Boolean(navigator.serviceWorker.controller));
        const timer = setTimeout(
          () => done(Boolean(navigator.serviceWorker.controller)),
          timeoutMs,
        );

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleControllerChange,
        );
        navigator.serviceWorker.ready
          .then(() => {
            if (navigator.serviceWorker.controller) done(true);
          })
          .catch(() => done(false));
      }),
    SERVICE_WORKER_READY_MS,
  );
}

async function fetchExpectedSvgs(page) {
  return page.evaluate(
    async ({ expectedPaths, cacheStatusHeader }) =>
      Promise.all(
        expectedPaths.map(async (assetPath) => {
          const response = await fetch(assetPath, { cache: "no-store" });
          return {
            assetPath,
            status: response.status,
            contentType: response.headers.get("content-type") || "",
            assetCacheStatus: response.headers.get(cacheStatusHeader) || "",
          };
        }),
      ),
    {
      expectedPaths: EXPECTED_SVG_PATHS,
      cacheStatusHeader: ASSET_CACHE_STATUS_HEADER,
    },
  );
}

async function readCacheState(page) {
  return page.evaluate(
    async ({ expectedPaths, manifestPath, hashSearchParam }) => {
      const result = {
        cacheNames: [],
        cachedExpected: [],
        missingExpected: [],
        manifestAssets: 0,
      };
      if (!("caches" in window)) return result;
      result.cacheNames = await caches.keys();

      let manifest = { assetsByPath: {} };
      try {
        const manifestResponse = await fetch(manifestPath, {
          cache: "no-store",
        });
        manifest = await manifestResponse.json();
        result.manifestAssets = Array.isArray(manifest.assets)
          ? manifest.assets.length
          : Object.keys(manifest.assetsByPath || {}).length;
      } catch {}

      for (const expectedPath of expectedPaths) {
        const hash = manifest.assetsByPath?.[expectedPath]?.hash || "";
        const candidateUrls = [
          new URL(expectedPath, location.origin).toString(),
        ];
        if (hash) {
          const versionedUrl = new URL(expectedPath, location.origin);
          versionedUrl.searchParams.set(hashSearchParam, hash);
          candidateUrls.unshift(versionedUrl.toString());
        }

        let found = false;
        for (const cacheName of result.cacheNames) {
          const cache = await caches.open(cacheName);
          for (const candidateUrl of candidateUrls) {
            const response = await cache.match(candidateUrl);
            if (response) {
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (found) result.cachedExpected.push(expectedPath);
        else result.missingExpected.push(expectedPath);
      }
      return result;
    },
    {
      expectedPaths: EXPECTED_SVG_PATHS,
      manifestPath: ASSET_MANIFEST_PATH,
      hashSearchParam: ASSET_HASH_SEARCH_PARAM,
    },
  );
}

async function run() {
  const browser = await puppeteer.launch(
    buildPuppeteerLaunchOptions({
      extraArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
    }),
  );
  const page = await browser.newPage();
  const requests = [];
  const failedRequests = [];

  page.on("request", (request) => requests.push(request.url()));
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || "unknown",
    }),
  );

  try {
    await page.setViewport(VIEWPORT);
    await page.goto(publicUrl(), {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await clearOfflineState(page);
    await page.reload({
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await acceptPrivacyConsentIfPresent(page);
    const controlled = await waitForControlledServiceWorker(page);
    const onlineResponseStatuses = await fetchExpectedSvgs(page);
    const cacheState = await readCacheState(page);
    ensureParentDirectory(screenshotPath());
    await page.screenshot({ path: screenshotPath(), fullPage: true });

    await page.setOfflineMode(true);
    const offlineResponseStatuses = await fetchExpectedSvgs(page);
    await page.setOfflineMode(false);

    const { allowedExternalRequests, unexpectedExternalRequests } =
      classifyExternalRequests(requests, publicUrl());
    const runtimeRasterRequests = requests.filter((requestUrl) =>
      FORBIDDEN_RUNTIME_RASTER.test(new URL(requestUrl).pathname),
    );
    const badOnlineStatuses = onlineResponseStatuses.filter(
      (item) =>
        item.status < 200 ||
        item.status >= 300 ||
        !item.contentType.includes("image/svg+xml"),
    );
    const badOfflineStatuses = offlineResponseStatuses.filter(
      (item) =>
        item.status < 200 ||
        item.status >= 300 ||
        !item.contentType.includes("image/svg+xml"),
    );
    const unexpectedFailedRequests = failedRequests.filter(
      (request) => !OFFLINE_FAILURE_PATTERN.test(request.failure),
    );

    assert(controlled, "Service worker não controlou a página de QA.");
    assert(
      badOnlineStatuses.length === 0,
      `SVGs online com status/content-type inválido: ${JSON.stringify(badOnlineStatuses)}`,
    );
    assert(
      badOfflineStatuses.length === 0,
      `SVGs offline com status/content-type inválido: ${JSON.stringify(badOfflineStatuses)}`,
    );
    assert(
      unexpectedExternalRequests.length === 0,
      `Requests externos inesperados detectados: ${unexpectedExternalRequests.join(", ")}`,
    );
    assert(
      runtimeRasterRequests.length === 0,
      `Raster runtime detectado: ${runtimeRasterRequests.join(", ")}`,
    );
    assert(
      cacheState.missingExpected.length === 0,
      `SVGs ausentes do cache lazy: ${cacheState.missingExpected.join(", ")}`,
    );
    assert(
      unexpectedFailedRequests.length === 0,
      `Requests falharam: ${JSON.stringify(unexpectedFailedRequests)}`,
    );

    const report = {
      ok: true,
      publicUrl: publicUrl(),
      checkedAt: new Date().toISOString(),
      expectedSvgPaths: EXPECTED_SVG_PATHS,
      controlled,
      onlineResponseStatuses,
      offlineResponseStatuses,
      cacheState,
      allowedExternalRequests,
      unexpectedExternalRequests,
      runtimeRasterRequests,
      failedRequests,
      screenshotPath: screenshotPath(),
    };
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await page.setOfflineMode(false).catch(() => {});
    await browser.close();
  }
}

run().catch((error) => {
  ensureParentDirectory(reportPath());
  writeFileSync(
    reportPath(),
    `${JSON.stringify({ ok: false, publicUrl: publicUrl(), error: error.message, checkedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  console.error(error);
  process.exit(1);
});
