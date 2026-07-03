// tests/e2e/cloudflare-svg-assets-qa.js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const DEFAULT_PUBLIC_URL = 'https://malnati-brickbreaker.pages.dev/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-svg-assets-qa.json';
const DEFAULT_SCREENSHOT_PATH = 'tmp/screenshots/cloudflare-svg-assets-qa.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const VISUAL_ASSET_SOURCE_PATH = 'src/constants/visualAssets.ts';
const RUNTIME_SVG_PATTERN = /['"`]((?:\/assets\/visual\/)[^'"`]+\.svg)['"`]/g;
const EXPECTED_SVG_PATHS = [
  ...new Set(
    [...readFileSync(VISUAL_ASSET_SOURCE_PATH, 'utf8').matchAll(RUNTIME_SVG_PATTERN)].map(
      (match) => match[1],
    ),
  ),
].sort();
const FORBIDDEN_RUNTIME_RASTER = /\/assets\/[^\s?]+\.(?:png|jpe?g|webp|gif)(?:\?|$)/i;
const MAX_NAVIGATION_MS = 30000;
const SERVICE_WORKER_READY_MS = 10000;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env('BRICKBREAKER_PUBLIC_URL', DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env('BRICKBREAKER_SVG_ASSETS_QA_REPORT', DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env('BRICKBREAKER_SVG_ASSETS_QA_SCREENSHOT', DEFAULT_SCREENSHOT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearOfflineState(page) {
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  });
}

async function waitForServiceWorker(page) {
  await page.evaluate(
    (timeoutMs) =>
      new Promise((resolve) => {
        if (!('serviceWorker' in navigator)) {
          resolve(false);
          return;
        }
        const timer = setTimeout(() => resolve(false), timeoutMs);
        navigator.serviceWorker.ready
          .then(() => {
            clearTimeout(timer);
            resolve(true);
          })
          .catch(() => {
            clearTimeout(timer);
            resolve(false);
          });
      }),
    SERVICE_WORKER_READY_MS,
  );
}

async function readCacheState(page) {
  return page.evaluate(async (expectedPaths) => {
    const result = { cacheNames: [], cachedExpected: [], missingExpected: [] };
    if (!('caches' in window)) return result;
    result.cacheNames = await caches.keys();
    for (const expectedPath of expectedPaths) {
      let found = false;
      for (const cacheName of result.cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(expectedPath);
        if (response) {
          found = true;
          break;
        }
      }
      if (found) result.cachedExpected.push(expectedPath);
      else result.missingExpected.push(expectedPath);
    }
    return result;
  }, EXPECTED_SVG_PATHS);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const requests = [];
  const failedRequests = [];

  page.on('request', (request) => requests.push(request.url()));
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));

  try {
    await page.setViewport(VIEWPORT);
    await page.goto(publicUrl(), { waitUntil: 'networkidle0', timeout: MAX_NAVIGATION_MS });
    await clearOfflineState(page);
    await page.reload({ waitUntil: 'networkidle0', timeout: MAX_NAVIGATION_MS });
    await waitForServiceWorker(page);
    const cacheState = await readCacheState(page);
    await page.screenshot({ path: screenshotPath(), fullPage: true });

    const responseStatuses = await page.evaluate(
      async (expectedPaths) =>
        Promise.all(
          expectedPaths.map(async (assetPath) => {
            const response = await fetch(assetPath, { cache: 'no-store' });
            return {
              assetPath,
              status: response.status,
              contentType: response.headers.get('content-type') || '',
            };
          }),
        ),
      EXPECTED_SVG_PATHS,
    );
    const externalRequests = requests.filter((requestUrl) => new URL(requestUrl).origin !== new URL(publicUrl()).origin);
    const runtimeRasterRequests = requests.filter((requestUrl) => FORBIDDEN_RUNTIME_RASTER.test(new URL(requestUrl).pathname));
    const badStatuses = responseStatuses.filter((item) => item.status < 200 || item.status >= 300 || !item.contentType.includes('image/svg+xml'));

    assert(badStatuses.length === 0, `SVGs com status/content-type inválido: ${JSON.stringify(badStatuses)}`);
    assert(externalRequests.length === 0, `Requests externos detectados: ${externalRequests.join(', ')}`);
    assert(runtimeRasterRequests.length === 0, `Raster runtime detectado: ${runtimeRasterRequests.join(', ')}`);
    assert(cacheState.missingExpected.length === 0, `SVGs ausentes do cache: ${cacheState.missingExpected.join(', ')}`);
    assert(failedRequests.length === 0, `Requests falharam: ${JSON.stringify(failedRequests)}`);

    const report = {
      ok: true,
      publicUrl: publicUrl(),
      checkedAt: new Date().toISOString(),
      expectedSvgPaths: EXPECTED_SVG_PATHS,
      responseStatuses,
      cacheState,
      externalRequests,
      runtimeRasterRequests,
      failedRequests,
      screenshotPath: screenshotPath(),
    };
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  } finally {
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
