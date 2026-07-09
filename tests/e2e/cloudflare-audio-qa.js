// tests/e2e/cloudflare-audio-qa.js
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

import { buildPuppeteerLaunchOptions } from './browserLauncher.js';
import { acceptPrivacyConsentIfPresent } from './consentHelpers.js';
import { assertAllowedQaHostname } from './publicQaEnv.js';

const DEFAULT_PUBLIC_URL = 'https://brikaya.com/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-audio-qa.json';
const DEFAULT_SCREENSHOT_PATH = 'docs/assets/issues/audio-cc0-integration/evidence/evi-audio-cc0-integration-cloudflare-audio-control.png';
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const AUDIO_EVENT_IDS_PATTERN = /export const AUDIO_EVENT_IDS = (\[[\s\S]*?\]) as const;/;
const AUDIO_CATALOG_START = 'export const AUDIO_CATALOG = ';
const AUDIO_CATALOG_END = '\n} satisfies Record<AudioId, AudioCatalogEntry>;';
const AUDIO_FILE_PATTERN = /^.*\.mp3$/;
const AUDIO_DIR = 'public/assets/audio';
const AUDIO_QA_SCENARIO = 'audio-event-tour';
const SILENT_AUDIO_ID = 'sfx-ad-placeholder-none';
const AUDIO_OFF_LABEL = 'Sem som';
const AUDIO_ON_LABEL = 'Som';
const AUDIO_OFF_ICON = '×';
const AUDIO_ON_ICON = '♪';
const MUSIC_OFF_LABEL = 'Sem música';
const MUSIC_ON_LABEL = 'Música';
const MUSIC_OFF_ICON = '×';
const MUSIC_ON_ICON = '♫';
const AUDIO_TOGGLE_SELECTOR = 'button[aria-label="Sem som"], button[aria-label="Som"]';
const MUSIC_TOGGLE_SELECTOR = 'button[aria-label="Sem música"], button[aria-label="Música"]';
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const WAIT_FOR_OVERLAY_TIMEOUT_MS = 5000;
const AUDIO_TOGGLE_TIMEOUT_MS = 10000;
const AUDIO_TOUR_SETTLE_MS = 1200;
const MIN_CACHED_AUDIO_PATHS = 1;
const IOS_CHROME_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1';
const ANDROID_CHROME_USER_AGENT = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const VIEWPORTS = [
  {
    name: 'chrome-desktop-macos',
    viewport: { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    userAgent: null,
    touch: false,
  },
  {
    name: 'chrome-android-emulated',
    viewport: { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true },
    userAgent: ANDROID_CHROME_USER_AGENT,
    touch: true,
  },
  {
    name: 'chrome-iphone-emulated',
    viewport: { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    userAgent: IOS_CHROME_USER_AGENT,
    touch: true,
  },
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

function expectedAudioIds() {
  const source = readFileSync('src/constants/audio.ts', 'utf8');
  const match = source.match(AUDIO_EVENT_IDS_PATTERN);
  assert(match, 'AUDIO_EVENT_IDS não encontrado.');
  return JSON.parse(match[1]);
}

function expectedLatencySensitiveAudioPaths() {
  const source = readFileSync('src/constants/audio.ts', 'utf8');
  const catalogStart = source.indexOf(AUDIO_CATALOG_START);
  assert(catalogStart >= 0, 'AUDIO_CATALOG não encontrado.');
  const objectStart = source.indexOf('{', catalogStart);
  const objectEnd = source.indexOf(AUDIO_CATALOG_END, objectStart);
  assert(objectStart >= 0 && objectEnd >= 0, 'AUDIO_CATALOG sem bloco parseável.');
  const catalog = JSON.parse(source.slice(objectStart, objectEnd + 2));
  return Object.values(catalog)
    .filter(entry => (
      entry.id !== SILENT_AUDIO_ID &&
      entry.type !== 'music' &&
      entry.volume > 0 &&
      entry.files.length > 0
    ))
    .flatMap(entry => entry.files)
    .sort();
}

function expectedAudioPaths() {
  return readdirSync(AUDIO_DIR)
    .filter(fileName => AUDIO_FILE_PATTERN.test(fileName))
    .sort()
    .map(fileName => `/assets/audio/${fileName}`);
}

function scenarioUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.searchParams.set('qaScenario', AUDIO_QA_SCENARIO);
  return url.toString();
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  let closed = false;
  await Promise.race([
    browser.close().then(() => {
      closed = true;
    }),
    new Promise(resolve => setTimeout(resolve, BROWSER_CLOSE_TIMEOUT_MS)),
  ]);

  if (!closed && browserProcess) {
    browserProcess.kill('SIGKILL');
  }
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
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function waitForCinematicOverlayToClear(page) {
  await page.waitForFunction(
    selector => !document.querySelector(selector),
    { timeout: WAIT_FOR_OVERLAY_TIMEOUT_MS },
    CINEMATIC_OVERLAY_SELECTOR,
  ).catch(() => undefined);
}

async function readAudioToggleState(page, expectedPaths) {
  return page.evaluate(async paths => {
    const audioState = window.__brikayaAudioState?.() || { events: [] };
    const soundButton = Array.from(document.querySelectorAll('button'))
      .map(button => ({
        text: button.textContent?.trim() || '',
        ariaLabel: button.getAttribute('aria-label') || '',
        title: button.getAttribute('title') || '',
        ariaPressed: button.getAttribute('aria-pressed') || '',
      }))
      .find(button => /^(Som|Sem som)$/.test(button.ariaLabel)) || null;
    const musicButton = Array.from(document.querySelectorAll('button'))
      .map(button => ({
        text: button.textContent?.trim() || '',
        ariaLabel: button.getAttribute('aria-label') || '',
        title: button.getAttribute('title') || '',
        ariaPressed: button.getAttribute('aria-pressed') || '',
      }))
      .find(button => /^(Música|Sem música)$/.test(button.ariaLabel)) || null;
    const cacheNames = 'caches' in window ? await caches.keys() : [];
    const cachedAudioPaths = [];
    if ('caches' in window) {
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        for (const request of requests) {
          const url = new URL(request.url);
          if (paths.includes(url.pathname)) cachedAudioPaths.push(url.pathname);
        }
      }
    }
    return {
      title: document.title,
      heading: document.querySelector('h1')?.textContent || '',
      soundButton,
      musicButton,
      audioState,
      cacheNames,
      cachedAudioPaths: [...new Set(cachedAudioPaths)].sort(),
    };
  }, expectedPaths);
}

async function waitForSoundButton(page, ariaLabel) {
  await page.waitForFunction(
    (selector, expectedLabel) => {
      const button = Array.from(document.querySelectorAll(selector))
        .find(node => node.getAttribute('aria-label') === expectedLabel);
      return Boolean(button);
    },
    { timeout: AUDIO_TOGGLE_TIMEOUT_MS },
    AUDIO_TOGGLE_SELECTOR,
    ariaLabel,
  );
}

async function waitForMusicButton(page, ariaLabel) {
  await page.waitForFunction(
    (selector, expectedLabel) => {
      const button = Array.from(document.querySelectorAll(selector))
        .find(node => node.getAttribute('aria-label') === expectedLabel);
      return Boolean(button);
    },
    { timeout: AUDIO_TOGGLE_TIMEOUT_MS },
    MUSIC_TOGGLE_SELECTOR,
    ariaLabel,
  );
}

async function activateSoundButton(page, ariaLabel, touch) {
  await waitForSoundButton(page, ariaLabel);
  const selector = `button[aria-label="${ariaLabel}"]`;
  if (touch) {
    await page.tap(selector);
    return;
  }
  await page.click(selector);
}

async function activateMusicButton(page, ariaLabel, touch) {
  await waitForMusicButton(page, ariaLabel);
  const selector = `button[aria-label="${ariaLabel}"]`;
  if (touch) {
    await page.tap(selector);
    return;
  }
  await page.click(selector);
}

async function runViewportQa(page, targetUrl, config, audioPaths, latencySensitiveAudioPaths) {
  await page.setViewport(config.viewport);
  if (config.userAgent) await page.setUserAgent(config.userAgent);
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  await clearOfflineState(page);
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('canvas', { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await page.waitForFunction(() => Boolean(window.__brikayaRunAudioTour), { timeout: 30000 });
  await waitForCinematicOverlayToClear(page);

  const initial = await readAudioToggleState(page, audioPaths);
  assert(initial.heading.includes('Brikaya'), `${config.name}: tela Brikaya não carregou.`);
  assert(initial.soundButton, `${config.name}: controle de som não visível.`);
  assert(initial.musicButton, `${config.name}: controle de música não visível.`);
  assert(initial.soundButton.ariaLabel === AUDIO_OFF_LABEL, `${config.name}: estado inicial não é Sem som.`);
  assert(initial.soundButton.text === AUDIO_OFF_ICON, `${config.name}: ícone inicial não é ×.`);
  assert(initial.soundButton.ariaPressed === 'false', `${config.name}: aria-pressed inicial inválido.`);
  assert(initial.musicButton.ariaLabel === MUSIC_ON_LABEL, `${config.name}: estado inicial da música não é Música.`);
  assert(initial.musicButton.text === MUSIC_ON_ICON, `${config.name}: ícone inicial da música não é ♫.`);
  assert(initial.musicButton.ariaPressed === 'true', `${config.name}: aria-pressed inicial da música inválido.`);
  assert(initial.audioState.muted === true, `${config.name}: estado QA inicial não está mudo.`);
  assert(initial.audioState.musicMuted === false, `${config.name}: música iniciou pausada indevidamente.`);

  await activateSoundButton(page, AUDIO_OFF_LABEL, config.touch);
  await page.waitForFunction(() => {
    const state = window.__brikayaAudioState?.();
    const button = Array.from(document.querySelectorAll('button'))
      .find(node => node.getAttribute('aria-label') === 'Som');
    return Boolean(
      state?.unlocked &&
      state?.muted === false &&
      state?.latencySensitiveEffectsReady === true &&
      button?.textContent?.trim() === '♪'
    );
  }, { timeout: AUDIO_TOGGLE_TIMEOUT_MS });
  const enabled = await readAudioToggleState(page, audioPaths);
  assert(enabled.soundButton?.ariaLabel === AUDIO_ON_LABEL, `${config.name}: botão não mudou para Som.`);
  assert(enabled.soundButton?.text === AUDIO_ON_ICON, `${config.name}: ícone ligado não é ♪.`);
  assert(enabled.soundButton?.ariaPressed === 'true', `${config.name}: aria-pressed ligado inválido.`);
  assert(enabled.audioState.unlocked === true, `${config.name}: áudio não ficou unlocked.`);
  assert(enabled.audioState.muted === false, `${config.name}: áudio não ficou ativo.`);
  assert(enabled.audioState.contextState === 'running', `${config.name}: AudioContext não está running.`);
  assert(enabled.audioState.lastUnlockResult?.unlocked === true, `${config.name}: último unlock não marcou sucesso.`);
  assert(enabled.audioState.latencySensitiveEffectsReady === true, `${config.name}: efeitos instantâneos não ficaram prontos após ligar som.`);
  const missingLatencySensitivePaths = latencySensitiveAudioPaths.filter(path => (
    !enabled.audioState.loadedPaths?.includes(path)
  ));
  assert(
    missingLatencySensitivePaths.length === 0,
    `${config.name}: efeitos instantâneos ausentes do preload: ${missingLatencySensitivePaths.join(', ')}`,
  );

  await activateMusicButton(page, MUSIC_ON_LABEL, config.touch);
  await page.waitForFunction(() => {
    const state = window.__brikayaAudioState?.();
    const button = Array.from(document.querySelectorAll('button'))
      .find(node => node.getAttribute('aria-label') === 'Sem música');
    return Boolean(state?.muted === false && state?.musicMuted === true && button?.textContent?.trim() === '×');
  }, { timeout: AUDIO_TOGGLE_TIMEOUT_MS });
  const musicDisabled = await readAudioToggleState(page, audioPaths);
  assert(musicDisabled.soundButton?.ariaLabel === AUDIO_ON_LABEL, `${config.name}: pausar música desligou som geral.`);
  assert(musicDisabled.musicButton?.ariaLabel === MUSIC_OFF_LABEL, `${config.name}: botão não mudou para Sem música.`);
  assert(musicDisabled.musicButton?.text === MUSIC_OFF_ICON, `${config.name}: ícone de música pausada não é ×.`);
  assert(musicDisabled.audioState.muted === false, `${config.name}: som geral foi mutado ao pausar música.`);
  assert(musicDisabled.audioState.musicMuted === true, `${config.name}: estado QA não pausou música.`);

  await activateMusicButton(page, MUSIC_OFF_LABEL, config.touch);
  await page.waitForFunction(() => {
    const state = window.__brikayaAudioState?.();
    const button = Array.from(document.querySelectorAll('button'))
      .find(node => node.getAttribute('aria-label') === 'Música');
    return Boolean(state?.muted === false && state?.musicMuted === false && button?.textContent?.trim() === '♫');
  }, { timeout: AUDIO_TOGGLE_TIMEOUT_MS });
  const musicEnabled = await readAudioToggleState(page, audioPaths);
  assert(musicEnabled.musicButton?.ariaLabel === MUSIC_ON_LABEL, `${config.name}: botão não voltou para Música.`);
  assert(musicEnabled.musicButton?.text === MUSIC_ON_ICON, `${config.name}: ícone de música ativa não é ♫.`);
  assert(musicEnabled.audioState.musicMuted === false, `${config.name}: música não voltou a ficar ativa.`);

  await activateSoundButton(page, AUDIO_ON_LABEL, config.touch);
  await page.waitForFunction(() => {
    const state = window.__brikayaAudioState?.();
    const button = Array.from(document.querySelectorAll('button'))
      .find(node => node.getAttribute('aria-label') === 'Sem som');
    return Boolean(state?.muted === true && button?.textContent?.trim() === '×');
  }, { timeout: AUDIO_TOGGLE_TIMEOUT_MS });
  const disabled = await readAudioToggleState(page, audioPaths);
  assert(disabled.soundButton?.ariaLabel === AUDIO_OFF_LABEL, `${config.name}: botão não voltou para Sem som.`);
  assert(disabled.soundButton?.text === AUDIO_OFF_ICON, `${config.name}: ícone desligado não voltou para ×.`);
  assert(disabled.soundButton?.ariaPressed === 'false', `${config.name}: aria-pressed desligado inválido.`);
  assert(disabled.audioState.muted === true, `${config.name}: estado QA final não voltou para mudo.`);

  await activateSoundButton(page, AUDIO_OFF_LABEL, config.touch);
  await page.waitForFunction(() => {
    const state = window.__brikayaAudioState?.();
    const button = Array.from(document.querySelectorAll('button'))
      .find(node => node.getAttribute('aria-label') === 'Som');
    return Boolean(state?.unlocked && state?.muted === false && button?.textContent?.trim() === '♪');
  }, { timeout: AUDIO_TOGGLE_TIMEOUT_MS });
  await page.evaluate(() => window.__brikayaRunAudioTour());
  await page.waitForTimeout(AUDIO_TOUR_SETTLE_MS);
  const reenabled = await readAudioToggleState(page, audioPaths);
  assert(reenabled.audioState.unlocked === true, `${config.name}: áudio não continuou unlocked no tour.`);
  assert(reenabled.audioState.muted === false, `${config.name}: áudio não continuou ativo no tour.`);

  return { viewport: config.name, initial, enabled, disabled, reenabled };
}

async function run() {
  const publicUrl = env('BRIKAYA_PUBLIC_URL', DEFAULT_PUBLIC_URL);
  const targetUrl = scenarioUrl(publicUrl);
  const parsed = new URL(publicUrl);
  assertAllowedQaHostname(publicUrl);

  const reportPath = env('BRIKAYA_AUDIO_QA_REPORT', DEFAULT_REPORT_PATH);
  const screenshotPath = env('BRIKAYA_AUDIO_QA_SCREENSHOT', DEFAULT_SCREENSHOT_PATH);
  ensureParentDirectory(reportPath);
  ensureParentDirectory(screenshotPath);

  const ids = expectedAudioIds();
  const audioPaths = expectedAudioPaths();
  const latencySensitiveAudioPaths = expectedLatencySensitiveAudioPaths();
  const audioPathSet = new Set(audioPaths);
  const externalAudioRequests = [];
  const sameOriginAudioRequests = [];

  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions({ extraArgs: ['--no-sandbox', '--disable-setuid-sandbox'] }));

  try {
    const viewportResults = [];
    for (const viewportConfig of VIEWPORTS) {
      const page = await browser.newPage();
      page.on('request', request => {
        const requestUrl = new URL(request.url());
        if (!requestUrl.pathname.endsWith('.mp3')) return;
        if (requestUrl.origin === parsed.origin) {
          sameOriginAudioRequests.push(requestUrl.pathname);
          return;
        }
        externalAudioRequests.push(request.url());
      });
      try {
        viewportResults.push(await runViewportQa(page, targetUrl, viewportConfig, audioPaths, latencySensitiveAudioPaths));
        if (viewportConfig.name === VIEWPORTS[VIEWPORTS.length - 1].name) {
          await page.screenshot({ path: screenshotPath, fullPage: true });
        }
      } finally {
        await page.close();
      }
    }

    const emittedIds = new Set(viewportResults.flatMap(result => result.reenabled.audioState.events.map(event => event.id)));
    const cachedAudioPaths = [...new Set(viewportResults.flatMap(result => result.reenabled.cachedAudioPaths))].sort();
    const cacheNames = [...new Set(viewportResults.flatMap(result => result.reenabled.cacheNames))].sort();
    const missingIds = ids.filter(id => !emittedIds.has(id));
    const requestedAudioPaths = [...new Set(sameOriginAudioRequests)].sort();
    const uncachedRequestedAudioPaths = requestedAudioPaths.filter(path => !cachedAudioPaths.includes(path));
    const unknownSameOriginAudioRequests = sameOriginAudioRequests.filter(path => !audioPathSet.has(path));

    assert(missingIds.length === 0, `IDs de áudio não emitidos: ${missingIds.join(', ')}`);
    assert(externalAudioRequests.length === 0, `Requests externos de áudio: ${externalAudioRequests.join(', ')}`);
    assert(unknownSameOriginAudioRequests.length === 0, `Requests de áudio fora do manifesto: ${unknownSameOriginAudioRequests.join(', ')}`);
    assert(cachedAudioPaths.length >= MIN_CACHED_AUDIO_PATHS, 'Nenhum áudio foi cacheado após primeiro uso.');
    assert(uncachedRequestedAudioPaths.length === 0, `Áudios usados não encontrados no cache: ${uncachedRequestedAudioPaths.join(', ')}`);

    const report = {
      publicUrl,
      targetUrl,
      screenshotPath,
      browserMatrix: VIEWPORTS.map(viewport => viewport.name),
      viewportResults,
      expectedAudioIds: ids,
      emittedAudioIds: [...emittedIds].sort(),
      localAudioPaths: audioPaths,
      latencySensitiveAudioPaths,
      sameOriginAudioRequests: requestedAudioPaths,
      externalAudioRequests,
      cachedAudioPaths,
      cacheNames,
    };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`cloudflare-audio-qa ok: ${reportPath}`);
  } finally {
    await closeBrowser(browser);
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
