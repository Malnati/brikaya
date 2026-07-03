// tests/e2e/cloudflare-phase10-stability-qa.js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

import { buildChromeLaunchArgs } from './chromeLaunchArgs.js';
import { acceptPrivacyConsentIfPresent } from './consentHelpers.js';

const DEFAULT_PUBLIC_URL = 'https://brikaya.com/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-phase10-stability.json';
const DEFAULT_SCREENSHOT_PATH = 'tmp/screenshots/cloudflare-phase10-stability.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const GAME_LOG_DB_NAME = 'BrickBreakerGameLog';
const GAME_LOG_STORE_NAME = 'gameEvents';
const GAME_LOG_DB_VERSION = 2;
const QA_SCENARIO = 'late-phase-stability';
const EXPECTED_LEVEL = 11;
const MAX_WAIT_MS = 30000;
const SAMPLE_PLAY_MS = 1600;
const MIN_CANVAS_SIZE = 1;

function publicUrl() {
  return process.env.BRICKBREAKER_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRICKBREAKER_PHASE10_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return process.env.BRICKBREAKER_PHASE10_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function withQaScenario(url) {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set('qaScenario', QA_SCENARIO);
  return pageUrl.toString();
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

async function collectLayout(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const rect = canvas?.getBoundingClientRect();
    const scoreHudText = document.querySelector('.score-hud')?.textContent || '';
    const chips = scoreHudText.split('|').map(part => part.trim()).filter(Boolean);
    return {
      chips,
      canvas: rect ? {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      } : null,
      bodyText: document.body.textContent || '',
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
  assert(parsed.hostname === 'brikaya.com', `URL precisa ser brikaya.com: ${targetUrl}`);

  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(['--no-first-run', '--no-default-browser-check'])
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
    await page.waitForSelector('canvas', { timeout: MAX_WAIT_MS });
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForFunction(async ({ dbName, storeName, dbVersion, expectedLevel }) => {
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
      return events.some(event => event.type === 'game_start' && event.gameState?.level === expectedLevel);
    }, { timeout: MAX_WAIT_MS }, {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      expectedLevel: EXPECTED_LEVEL,
    });

    await page.waitForTimeout(SAMPLE_PLAY_MS);
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
      return events.some(event => event.type === 'collision' && event.collisionInfo?.type === 'wall');
    }, { timeout: MAX_WAIT_MS }, {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
    });

    const layout = await collectLayout(page);
    await page.screenshot({ path: outScreenshot, fullPage: true });
    const events = await readGameEvents(page);
    const byType = summarizeEvents(events);
    const gameStart = events.find(event => event.type === 'game_start');
    const wallCollision = events.find(event => event.type === 'collision' && event.collisionInfo?.type === 'wall');
    const latestEvent = events[events.length - 1] || null;
    const report = {
      url: targetUrl,
      screenshotPath: outScreenshot,
      byType,
      eventTypes: events.map(event => event.type),
      gameStart: gameStart ? {
        level: gameStart.gameState?.level,
        ballsCount: gameStart.gameState?.ballsCount,
        speedState: gameStart.gameState?.speedState,
      } : null,
      wallCollision: wallCollision ? {
        ballPosition: wallCollision.collisionInfo?.ballPosition,
        velocityAfter: wallCollision.collisionInfo?.velocityAfter,
      } : null,
      latestEvent: latestEvent ? {
        type: latestEvent.type,
        level: latestEvent.gameState?.level,
        ballsCount: latestEvent.gameState?.ballsCount,
        gameOver: latestEvent.gameState?.gameOver,
      } : null,
      layout,
      consoleProblems,
    };

    writeFileSync(outReport, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));

    assert(gameStart, 'game_start não foi registrado.');
    assert(gameStart.gameState.level === EXPECTED_LEVEL, `game_start não iniciou na fase ${EXPECTED_LEVEL}.`);
    assert(gameStart.gameState.ballsCount === 1, 'Contador inicial de bolas não é 1.');
    assert(gameStart.gameState.speedState?.level === EXPECTED_LEVEL, `speedState não está na fase ${EXPECTED_LEVEL}.`);
    assert(wallCollision, 'Colisão de parede em fase alta não foi registrada.');
    assert(wallCollision.collisionInfo.ballPosition.x >= 0, 'Colisão registrou bola à esquerda do canvas.');
    assert(wallCollision.collisionInfo.ballPosition.x <= gameStart.gameState.canvasSize.width, 'Colisão registrou bola à direita do canvas.');
    assert((byType.game_end || 0) === 0, 'game_end apareceu durante amostra de estabilidade da fase 11.');
    assert((byType.ball_lost || 0) === 0, 'ball_lost apareceu durante amostra de estabilidade da fase 11.');
    assert((byType.restart_game || 0) === 0, 'restart_game apareceu sem ação humana.');
    assert(latestEvent?.gameState?.ballsCount > 0, 'Último estado ficou sem bolas ativas.');
    assert(!latestEvent?.gameState?.gameOver, 'Último estado entrou em game over indevido.');
    assert(layout.canvas && layout.canvas.width > MIN_CANVAS_SIZE && layout.canvas.height > MIN_CANVAS_SIZE, 'Canvas não está visível.');
    assert(layout.chips.some(text => text.includes(`Fase ${EXPECTED_LEVEL}`)), `HUD não mostra Fase ${EXPECTED_LEVEL}.`);
    assert(consoleProblems.length === 0, `Console tem problemas: ${JSON.stringify(consoleProblems)}`);
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
