// tests/e2e/cloudflare-cinematic-effects-qa.js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

import { buildChromeLaunchArgs } from './chromeLaunchArgs.js';

const DEFAULT_PUBLIC_URL = 'https://brikaya.com/';
const DEFAULT_REPORT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-effects.json';
const DEFAULT_COUNTDOWN_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-countdown.png';
const DEFAULT_LEVEL_UP_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-level-up.png';
const DEFAULT_RIP_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-rip.png';
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
const REQUIRED_LEVEL_AUDIO_IDS = ['sfx-score-tick', 'sfx-level-toast-in'];
const REQUIRED_RIP_AUDIO_IDS = ['sfx-game-over'];
const REQUIRED_COUNTDOWN_MEDIA = ['countdown-circle', 'countdown-spark'];
const REQUIRED_LEVEL_UP_MEDIA = ['level-up-twirl', 'level-up-star'];
const REQUIRED_RIP_MEDIA = ['rip-smoke'];
const REQUIRED_CINEMATIC_MEDIA_PATHS = [
  '/assets/visual/vfx/vfx-countdown-circle-overlay.svg',
  '/assets/visual/vfx/vfx-countdown-spark-overlay.svg',
  '/assets/visual/vfx/vfx-level-up-star-overlay.svg',
  '/assets/visual/vfx/vfx-level-up-twirl-overlay.svg',
  '/assets/visual/vfx/vfx-game-over-rip-smoke.svg',
];
const ASSET_MANIFEST_PATH = '/asset-cache-manifest.json';
const ASSET_HASH_SEARCH_PARAM = 'bbAssetHash';
const MEDIA_EXTENSION_PATTERN = /\.(gif|jpe?g|mp3|mp4|ogg|png|webm|webp|wav)(\?|$)/i;
const CANONICAL_HOST = 'brikaya.com';

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
      media: [...(overlay?.querySelectorAll('img[data-cinematic-media]') || [])].map((item) => ({
        id: item.getAttribute('data-cinematic-media') || '',
        src: item.getAttribute('src') || '',
        ariaHidden: item.getAttribute('aria-hidden') || '',
        alt: item.getAttribute('alt') || '',
      })),
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

function assertMedia(snapshot, requiredIds, label) {
  const mediaIds = snapshot.media.map(item => item.id).sort();
  for (const requiredId of requiredIds) {
    assert(mediaIds.includes(requiredId), `${label}: mídia ausente ${requiredId}.`);
  }
  for (const item of snapshot.media) {
    assert(item.src.startsWith('/assets/visual/vfx/'), `${label}: mídia fora de /assets/visual/vfx/: ${item.src}`);
    assert(item.ariaHidden === 'true', `${label}: mídia decorativa sem aria-hidden=true: ${item.id}`);
    assert(item.alt === '', `${label}: mídia decorativa sem alt vazio: ${item.id}`);
  }
}

async function cachedCinematicPaths(page) {
  return page.evaluate(async ({ paths, manifestPath, hashSearchParam }) => {
    if (!('serviceWorker' in navigator) || !('caches' in window)) return [];
    await navigator.serviceWorker.ready;

    let manifest = { assetsByPath: {} };
    try {
      const manifestResponse = await fetch(manifestPath, { cache: 'no-store' });
      manifest = await manifestResponse.json();
    } catch {}

    const matches = await Promise.all(paths.map(async (path) => {
      const hash = manifest.assetsByPath?.[path]?.hash || '';
      const candidates = [new URL(path, location.origin).toString()];
      if (hash) {
        const versionedUrl = new URL(path, location.origin);
        versionedUrl.searchParams.set(hashSearchParam, hash);
        candidates.unshift(versionedUrl.toString());
      }
      const response = await Promise.any(
        candidates.map(async (candidateUrl) => {
          const cachedResponse = await caches.match(candidateUrl);
          if (!cachedResponse) throw new Error('cache miss');
          return cachedResponse;
        }),
      ).catch(() => null);
      return response ? path : null;
    }));
    return matches.filter(Boolean);
  }, {
    paths: REQUIRED_CINEMATIC_MEDIA_PATHS,
    manifestPath: ASSET_MANIFEST_PATH,
    hashSearchParam: ASSET_HASH_SEARCH_PARAM,
  });
}

async function run() {
  const publicUrl = env('BRICKBREAKER_PUBLIC_URL', DEFAULT_PUBLIC_URL);
  const parsed = new URL(publicUrl);
  assert(parsed.hostname === CANONICAL_HOST, `URL precisa ser brikaya.com: ${publicUrl}`);

  const reportPath = env('BRICKBREAKER_CINEMATIC_QA_REPORT', DEFAULT_REPORT_PATH);
  const countdownScreenshotPath = env(
    'BRICKBREAKER_CINEMATIC_COUNTDOWN_SCREENSHOT',
    DEFAULT_COUNTDOWN_SCREENSHOT_PATH,
  );
  const levelUpScreenshotPath = env(
    'BRICKBREAKER_CINEMATIC_LEVEL_SCREENSHOT',
    DEFAULT_LEVEL_UP_SCREENSHOT_PATH,
  );
  const ripScreenshotPath = env(
    'BRICKBREAKER_CINEMATIC_RIP_SCREENSHOT',
    DEFAULT_RIP_SCREENSHOT_PATH,
  );
  ensureParentDirectory(reportPath);
  ensureParentDirectory(countdownScreenshotPath);
  ensureParentDirectory(levelUpScreenshotPath);
  ensureParentDirectory(ripScreenshotPath);

  const externalAudioRequests = [];
  const externalMediaRequests = [];
  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(['--no-first-run', '--no-default-browser-check']),
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    page.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname.endsWith('.mp3') && requestUrl.origin !== parsed.origin) {
        externalAudioRequests.push(request.url());
      }
      if (MEDIA_EXTENSION_PATTERN.test(requestUrl.pathname) && requestUrl.origin !== parsed.origin) {
        externalMediaRequests.push(request.url());
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
    await page.screenshot({ path: countdownScreenshotPath, fullPage: true });
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
    const cachedPaths = await cachedCinematicPaths(page);
    const countdownAfterLevel = await page.$(COUNTDOWN_SELECTOR);

    const ripPage = await browser.newPage();
    await ripPage.setViewport(VIEWPORT);
    ripPage.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname.endsWith('.mp3') && requestUrl.origin !== parsed.origin) {
        externalAudioRequests.push(request.url());
      }
      if (MEDIA_EXTENSION_PATTERN.test(requestUrl.pathname) && requestUrl.origin !== parsed.origin) {
        externalMediaRequests.push(request.url());
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
    assertMedia(countdownState, REQUIRED_COUNTDOWN_MEDIA, 'countdown');
    assertMedia(levelUpState, REQUIRED_LEVEL_UP_MEDIA, 'level-up');
    assertMedia(ripState, REQUIRED_RIP_MEDIA, 'rip');
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
    assert(externalMediaRequests.length === 0, `Requests externos de mídia: ${externalMediaRequests.join(', ')}`);
    for (const path of REQUIRED_CINEMATIC_MEDIA_PATHS) {
      assert(cachedPaths.includes(path), `Mídia cinematográfica fora do cache PWA: ${path}`);
    }
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
      cachedPaths,
      countdownScreenshotPath,
      levelUpScreenshotPath,
      ripScreenshotPath,
      externalAudioRequests,
      externalMediaRequests,
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
