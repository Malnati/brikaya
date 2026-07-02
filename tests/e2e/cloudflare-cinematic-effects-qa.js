// tests/e2e/cloudflare-cinematic-effects-qa.js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const DEFAULT_PUBLIC_URL = 'https://malnati-brickbreaker.pages.dev/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-cinematic-effects.json';
const DEFAULT_LEVEL_UP_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-round-effects/evidence/cloudflare-cinematic-level-up.png';
const DEFAULT_RIP_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-round-effects/evidence/cloudflare-cinematic-rip.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const COUNTDOWN_MAX_DURATION_MS = 2000;
const RIP_MAX_DURATION_MS = 2000;
const RIP_OBSERVATION_BUFFER_MS = 300;
const MAX_WAIT_MS = 30000;
const COUNTDOWN_SELECTOR = '[data-cinematic-type="countdown"]';
const LEVEL_UP_SELECTOR = '[data-cinematic-type="levelUp"]';
const RIP_SELECTOR = '[data-cinematic-type="rip"]';
const SINGLE_BRICK_QA_SCENARIO = 'single-brick-phase-clear';
const CINEMATIC_RIP_QA_SCENARIO = 'cinematic-rip';
const REQUIRED_LEVEL_AUDIO_IDS = ['sfx_score_tick', 'sfx_level_toast_in'];
const REQUIRED_RIP_AUDIO_IDS = ['sfx_game_over'];
const PAGES_DEV_HOST_SUFFIX = '.pages.dev';

function env(name, fallback) {
  return process.env[name] || fallback;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function scenarioUrl(baseUrl, scenario) {
  const url = new URL(baseUrl);
  url.searchParams.set('qaScenario', scenario);
  return url.toString();
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

async function overlaySnapshot(page, selector) {
  return page.evaluate((targetSelector) => {
    const overlay = document.querySelector(targetSelector);
    const rect = overlay?.getBoundingClientRect();
    return {
      text: overlay?.textContent?.trim() || '',
      type: overlay?.getAttribute('data-cinematic-type') || '',
      rect: rect ? {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      } : null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      hasBodyScroll:
        document.documentElement.scrollHeight > window.innerHeight ||
        document.body.scrollHeight > window.innerHeight,
    };
  }, selector);
}

async function audioIds(page) {
  return page.evaluate(() => {
    const state = window.__brickbreakerAudioState?.() || { events: [] };
    return [...new Set((state.events || []).map(event => event.id))].sort();
  });
}

function assertFullViewport(snapshot, label) {
  assert(snapshot.rect, `${label}: overlay ausente.`);
  assert(snapshot.rect.width >= snapshot.viewport.width * 0.96, `${label}: largura não cobre viewport.`);
  assert(snapshot.rect.height >= snapshot.viewport.height * 0.96, `${label}: altura não cobre viewport.`);
}

async function run() {
  const publicUrl = env('BRICKBREAKER_PUBLIC_URL', DEFAULT_PUBLIC_URL);
  const parsed = new URL(publicUrl);
  assert(parsed.hostname.endsWith(PAGES_DEV_HOST_SUFFIX), `URL precisa ser Cloudflare Pages: ${publicUrl}`);

  const reportPath = env('BRICKBREAKER_CINEMATIC_QA_REPORT', DEFAULT_REPORT_PATH);
  const levelUpScreenshotPath = env(
    'BRICKBREAKER_CINEMATIC_LEVEL_SCREENSHOT',
    DEFAULT_LEVEL_UP_SCREENSHOT_PATH,
  );
  const ripScreenshotPath = env(
    'BRICKBREAKER_CINEMATIC_RIP_SCREENSHOT',
    DEFAULT_RIP_SCREENSHOT_PATH,
  );
  ensureParentDirectory(reportPath);
  ensureParentDirectory(levelUpScreenshotPath);
  ensureParentDirectory(ripScreenshotPath);

  const externalAudioRequests = [];
  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    page.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname.endsWith('.mp3') && requestUrl.origin !== parsed.origin) {
        externalAudioRequests.push(request.url());
      }
    });
    page.on('console', message => {
      if (['error', 'warn'].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', error => consoleProblems.push({ type: 'pageerror', text: error.message }));

    await page.goto(scenarioUrl(publicUrl, SINGLE_BRICK_QA_SCENARIO), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await clearOfflineState(page);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector(COUNTDOWN_SELECTOR, { timeout: 5000 });
    const countdownStartedAt = Date.now();
    const countdownState = await overlaySnapshot(page, COUNTDOWN_SELECTOR);
    await page.waitForSelector(COUNTDOWN_SELECTOR, {
      hidden: true,
      timeout: COUNTDOWN_MAX_DURATION_MS + 900,
    });
    const countdownDurationMs = Date.now() - countdownStartedAt;
    await page.waitForSelector(LEVEL_UP_SELECTOR, { timeout: MAX_WAIT_MS });
    const levelUpState = await overlaySnapshot(page, LEVEL_UP_SELECTOR);
    await page.screenshot({ path: levelUpScreenshotPath, fullPage: true });
    await page.waitForSelector(LEVEL_UP_SELECTOR, {
      hidden: true,
      timeout: 10000,
    });
    const levelAudioIds = await audioIds(page);
    const countdownAfterLevel = await page.$(COUNTDOWN_SELECTOR);

    const ripPage = await browser.newPage();
    await ripPage.setViewport(VIEWPORT);
    ripPage.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname.endsWith('.mp3') && requestUrl.origin !== parsed.origin) {
        externalAudioRequests.push(request.url());
      }
    });
    ripPage.on('console', message => {
      if (['error', 'warn'].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    ripPage.on('pageerror', error => consoleProblems.push({ type: 'pageerror', text: error.message }));

    await ripPage.goto(scenarioUrl(publicUrl, CINEMATIC_RIP_QA_SCENARIO), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await ripPage.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await ripPage.waitForSelector(COUNTDOWN_SELECTOR, { timeout: 5000 });
    await ripPage.waitForSelector(COUNTDOWN_SELECTOR, {
      hidden: true,
      timeout: COUNTDOWN_MAX_DURATION_MS + 900,
    });
    await ripPage.waitForSelector(RIP_SELECTOR, { timeout: MAX_WAIT_MS });
    const ripStartedAt = Date.now();
    const ripState = await overlaySnapshot(ripPage, RIP_SELECTOR);
    await Promise.all([
      ripPage.screenshot({ path: ripScreenshotPath, fullPage: true }),
      ripPage.waitForSelector(RIP_SELECTOR, {
        hidden: true,
        timeout: RIP_MAX_DURATION_MS + RIP_OBSERVATION_BUFFER_MS,
      }),
    ]);
    const ripDurationMs = Date.now() - ripStartedAt;
    const ripAfterTimeoutState = await overlaySnapshot(ripPage, RIP_SELECTOR);
    const countdownAfterRip = await ripPage.$(COUNTDOWN_SELECTOR);
    const ripAudioIds = await audioIds(ripPage);

    assertFullViewport(countdownState, 'countdown');
    assertFullViewport(levelUpState, 'level-up');
    assertFullViewport(ripState, 'rip');
    assert(countdownDurationMs <= COUNTDOWN_MAX_DURATION_MS + 900, `Countdown demorou demais: ${countdownDurationMs}ms.`);
    assert(ripDurationMs <= RIP_MAX_DURATION_MS + RIP_OBSERVATION_BUFFER_MS, `RIP demorou demais: ${ripDurationMs}ms.`);
    assert(/3|2|1/.test(countdownState.text), 'Countdown não mostrou 3, 2 ou 1.');
    assert(levelUpState.text.includes('Subindo de nível'), 'Level-up não informou subida de nível.');
    assert(levelUpState.text.includes('Fase 2'), 'Level-up não informou fase 2.');
    assert(ripState.text.includes('RIP'), 'RIP não ficou visível.');
    assert(!ripAfterTimeoutState.rect, 'RIP permaneceu visível após o limite.');
    assert(!countdownAfterLevel, 'Countdown reapareceu entre fases.');
    assert(!countdownAfterRip, 'Countdown reapareceu após RIP.');
    for (const id of REQUIRED_LEVEL_AUDIO_IDS) {
      assert(levelAudioIds.includes(id), `Áudio ausente no level-up/countdown: ${id}`);
    }
    for (const id of REQUIRED_RIP_AUDIO_IDS) {
      assert(ripAudioIds.includes(id), `Áudio ausente no RIP: ${id}`);
    }
    assert(externalAudioRequests.length === 0, `Requests externos de áudio: ${externalAudioRequests.join(', ')}`);
    assert(consoleProblems.length === 0, `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`);

    const report = {
      levelTargetUrl: scenarioUrl(publicUrl, SINGLE_BRICK_QA_SCENARIO),
      ripTargetUrl: scenarioUrl(publicUrl, CINEMATIC_RIP_QA_SCENARIO),
      countdownDurationMs,
      ripDurationMs,
      countdownState,
      levelUpState,
      ripState,
      levelAudioIds,
      ripAudioIds,
      levelUpScreenshotPath,
      ripScreenshotPath,
      externalAudioRequests,
      consoleProblems,
    };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`cloudflare-cinematic-effects-qa ok: ${reportPath}`);
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
