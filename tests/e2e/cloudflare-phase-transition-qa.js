// tests/e2e/cloudflare-phase-transition-qa.js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const DEFAULT_PUBLIC_URL = 'https://malnati-brickbreaker.pages.dev/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-phase-transition.json';
const DEFAULT_SCREENSHOT_PATH = 'tmp/screenshots/cloudflare-phase-transition.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const GAME_LOG_DB_NAME = 'BrickBreakerGameLog';
const GAME_LOG_STORE_NAME = 'gameEvents';
const GAME_LOG_DB_VERSION = 2;
const MAX_WAIT_FOR_LEVEL_MS = 30000;
const MIN_LEVEL_PAUSE_MS = 1500;
const SPEED_TOLERANCE = 0.0001;
const REQUIRED_EVENT_TYPES = ['game_start', 'brick_destroyed', 'score_update', 'level_complete', 'level_start'];

function publicUrl() {
  return process.env.BRICKBREAKER_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRICKBREAKER_PHASE_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return process.env.BRICKBREAKER_PHASE_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function withQaScenario(url) {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set('qaScenario', 'single-brick-phase-clear');
  return pageUrl.toString();
}

async function clearGameDatabases(page) {
  await page.evaluate(async () => {
    const names = ['BrickBreakerGameLog', 'BrickBreakerCollisions', 'SystemDebugLog', 'breakout'];
    await Promise.all(names.map(name => new Promise(resolve => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    })));
  });
}

async function clearOfflineState(page) {
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }
  });
}

async function readGameEvents(page) {
  return page.evaluate(async ({ dbName, storeName, dbVersion }) => new Promise(resolve => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onerror = () => resolve([]);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.close();
        resolve([]);
        return;
      }
      const tx = db.transaction([storeName], 'readonly');
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
  }), { dbName: GAME_LOG_DB_NAME, storeName: GAME_LOG_STORE_NAME, dbVersion: GAME_LOG_DB_VERSION });
}

function summarizeEvents(events) {
  const byType = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
  }
  return byType;
}

async function collectToastState(page) {
  return page.evaluate(() => {
    const toast = document.querySelector('[data-testid="level-toast"]');
    const canvas = document.querySelector('canvas');
    const toastRect = toast?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    return {
      text: toast?.textContent?.trim() || '',
      toast: toastRect ? {
        x: toastRect.x,
        y: toastRect.y,
        width: toastRect.width,
        height: toastRect.height,
        right: toastRect.right,
        bottom: toastRect.bottom,
      } : null,
      canvas: canvasRect ? {
        x: canvasRect.x,
        y: canvasRect.y,
        width: canvasRect.width,
        height: canvasRect.height,
        right: canvasRect.right,
        bottom: canvasRect.bottom,
      } : null,
    };
  });
}

async function run() {
  const targetUrl = withQaScenario(publicUrl());
  const outReport = reportPath();
  const outScreenshot = screenshotPath();
  ensureParentDirectory(outReport);
  ensureParentDirectory(outScreenshot);

  const parsed = new URL(targetUrl);
  assert(parsed.hostname.endsWith('.pages.dev'), `URL precisa ser Cloudflare Pages: ${targetUrl}`);

  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ['--no-first-run', '--no-default-browser-check']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    page.on('console', message => {
      if (['error', 'warn'].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', error => consoleProblems.push({ type: 'pageerror', text: error.message }));

    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await clearOfflineState(page);
    await clearGameDatabases(page);
    await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForSelector('[data-testid="level-toast"]', { timeout: MAX_WAIT_FOR_LEVEL_MS });
    await page.waitForFunction(() => document.querySelector('[data-testid="level-toast"]')?.textContent?.includes('Fase 2'), { timeout: MAX_WAIT_FOR_LEVEL_MS });

    const toastVisibleState = await collectToastState(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });

    await page.waitForFunction(async ({ dbName, storeName, dbVersion }) => {
      const events = await new Promise(resolve => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => resolve([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolve([]);
            return;
          }
          const tx = db.transaction([storeName], 'readonly');
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
      });
      return events.some(event => event.type === 'level_start');
    }, { timeout: MAX_WAIT_FOR_LEVEL_MS }, { dbName: GAME_LOG_DB_NAME, storeName: GAME_LOG_STORE_NAME, dbVersion: GAME_LOG_DB_VERSION });

    await page.waitForFunction(() => !document.querySelector('[data-testid="level-toast"]'), { timeout: 10000 });

    const events = await readGameEvents(page);
    const byType = summarizeEvents(events);
    const eventTypes = events.map(event => event.type);
    const levelComplete = events.find(event => event.type === 'level_complete');
    const levelStart = events.find(event => event.type === 'level_start');
    const pauseDeltaMs = levelComplete && levelStart ? levelStart.timestamp - levelComplete.timestamp : 0;
    const finalLayout = await collectToastState(page);
    const levelCompleteSpeedState = levelComplete?.metadata?.speedState || null;
    const levelStartSpeedState = levelStart?.metadata?.speedState || null;

    const report = {
      url: targetUrl,
      screenshotPath: outScreenshot,
      byType,
      eventTypes,
      levelCompleteMetadata: levelComplete?.metadata || null,
      levelStartMetadata: levelStart?.metadata || null,
      levelCompleteSpeedState,
      levelStartSpeedState,
      pauseDeltaMs,
      toastVisibleState,
      finalLayout,
      consoleProblems,
    };
    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    for (const type of REQUIRED_EVENT_TYPES) {
      assert(eventTypes.includes(type), `Evento obrigatório ausente: ${type}`);
    }
    assert((byType.restart_game || 0) === 0, 'restart_game apareceu sem ação humana.');
    assert(toastVisibleState.text.includes('Fase 2'), 'Toast não informou Fase 2.');
    assert(toastVisibleState.text.includes('1.12×'), 'Toast não informou velocidade 1.12×.');
    assert(toastVisibleState.toast && toastVisibleState.canvas, 'Toast ou canvas não encontrado.');
    assert(toastVisibleState.toast.y >= toastVisibleState.canvas.y, 'Toast ficou acima do quadro do canvas.');
    assert(toastVisibleState.toast.bottom < toastVisibleState.canvas.y + toastVisibleState.canvas.height * 0.45, 'Toast cobriu área baixa do tabuleiro.');
    assert(levelComplete?.metadata?.nextLevel === 2, 'level_complete não registrou próxima fase 2.');
    assert(levelComplete?.metadata?.nextSpeedMultiplier === 1.12, 'level_complete não registrou velocidade 1.12.');
    assert(levelCompleteSpeedState, 'level_complete não registrou metadata.speedState.');
    assert(Math.abs(levelCompleteSpeedState.initialSpawnSpeed - (levelCompleteSpeedState.maxSpeed * 3)) <= SPEED_TOLERANCE, 'Fase 1 não registrou initialSpawnSpeed 3x no level_complete.');
    assert(Math.abs(levelCompleteSpeedState.minSpeed - (levelCompleteSpeedState.maxSpeed / 2)) <= SPEED_TOLERANCE, 'minSpeed da Fase 1 foi afetado pelo override 3x.');
    assert(levelStart?.metadata?.level === 2, 'level_start não registrou fase 2.');
    assert(levelStartSpeedState, 'level_start não registrou metadata.speedState.');
    assert(Math.abs(levelStartSpeedState.currentSpeed - levelStartSpeedState.maxSpeed) <= SPEED_TOLERANCE, 'Fase 2 não iniciou em currentSpeed === maxSpeed.');
    assert(Math.abs(levelStartSpeedState.initialSpawnSpeed - levelStartSpeedState.maxSpeed) <= SPEED_TOLERANCE, 'Fase 2 herdou indevidamente o override 3x.');
    assert(Math.abs(levelStartSpeedState.minSpeed - (levelCompleteSpeedState.maxSpeed / 2)) <= SPEED_TOLERANCE, 'minSpeed da Fase 2 não deriva da maxSpeed da Fase 1 / 2.');
    assert(levelComplete?.metadata?.nextReductionPerBrick > 0, 'nextReductionPerBrick ausente em level_complete.');
    assert(pauseDeltaMs >= MIN_LEVEL_PAUSE_MS, `Pausa curta demais: ${pauseDeltaMs}ms.`);
    assert(finalLayout.text === '', 'Toast permaneceu após a pausa.');
    assert(consoleProblems.length === 0, `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`);
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
