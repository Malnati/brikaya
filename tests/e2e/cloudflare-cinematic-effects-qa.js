// tests/e2e/cloudflare-cinematic-effects-qa.js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

import { buildChromeLaunchArgs } from './chromeLaunchArgs.js';
import { seedPrivacyConsent } from './consentHelpers.js';

const DEFAULT_PUBLIC_URL = 'https://brikaya.com/';
const DEFAULT_REPORT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-effects.json';
const DEFAULT_COUNTDOWN_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-countdown.png';
const DEFAULT_COUNTDOWN_LANDSCAPE_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-countdown-landscape.png';
const DEFAULT_LEVEL_UP_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-level-up.png';
const DEFAULT_RIP_SCREENSHOT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/evi-cinematic-public-domain-media-cloudflare-cinematic-rip.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RESPONSIVE_VIEWPORT_MATRIX_PATH = new URL(
  './responsiveViewportMatrix.json',
  import.meta.url,
);
const RESPONSIVE_VIEWPORT_MATRIX = JSON.parse(
  readFileSync(RESPONSIVE_VIEWPORT_MATRIX_PATH, 'utf8'),
);
const VIEWPORT_NAME_IPHONE_PORTRAIT = 'iphone-17-default';
const VIEWPORT_NAME_IPHONE_LANDSCAPE = 'iphone-17-default-landscape';
const VIEWPORT_NAME_IPAD_PORTRAIT = 'ipad-11-a16-air-default';
const VIEWPORT_NAME_DESKTOP = 'desktop-laptop';
const RIP_VIEWPORT_NAMES = [
  VIEWPORT_NAME_IPHONE_PORTRAIT,
  VIEWPORT_NAME_IPHONE_LANDSCAPE,
  VIEWPORT_NAME_IPAD_PORTRAIT,
  VIEWPORT_NAME_DESKTOP,
];
const RIP_SCREENSHOT_VIEWPORT_SUFFIXES = new Map([
  [VIEWPORT_NAME_IPHONE_LANDSCAPE, 'iphone-land'],
  [VIEWPORT_NAME_IPAD_PORTRAIT, 'ipad'],
  [VIEWPORT_NAME_DESKTOP, 'desktop'],
]);
const RIP_SCREENSHOT_SHORT_STEM = 'evi-cinematic-rip';
const SEMANTIC_FILE_STEM_MAX_LENGTH = 64;
const VIEWPORT = viewportByName(VIEWPORT_NAME_IPHONE_PORTRAIT);
const COUNTDOWN_PORTRAIT_BOTTOM_INSET_PX = 104;
const COUNTDOWN_MAX_DURATION_MS = 2000;
const RIP_MAX_DURATION_MS = 2000;
const RIP_OBSERVATION_BUFFER_MS = 300;
const MAX_WAIT_MS = 30000;
const COUNTDOWN_SELECTOR = '[data-cinematic-type="countdown"]';
const LEVEL_UP_SELECTOR = '[data-cinematic-type="levelUp"]';
const RIP_SELECTOR = '[data-cinematic-type="rip"]';
const CINEMATIC_STAGE_SELECTOR = '[data-testid="game-cinematic-stage"]';
const CANVAS_SELECTOR = 'canvas';
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
const MAX_STAGE_OFFSET_PX = 3;
const MAX_MEDIA_CENTER_OFFSET_PX = 4;
const MAX_MEDIA_OVERFLOW_PX = 2;
const MAX_CONTENT_CENTER_OFFSET_PX = 4;
const MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX = 8;
const MAX_RIP_VIEWPORT_CENTER_OFFSET_PX = 8;
const MIN_RIP_STAGE_VIEWPORT_COVERAGE_RATIO = 0.96;
const RIP_SAFE_AREA_PX = 12;
const MAX_QA_DEVICE_SCALE_FACTOR = 1;
const NAVIGATION_TIMEOUT_MS = 60000;
const SERVICE_WORKER_READY_TIMEOUT_MS = 10000;
const MEDIA_READY_TIMEOUT_MS = 5000;
const CACHE_READY_TIMEOUT_MS = 7000;
const CACHE_READY_POLL_MS = 250;
const TITLE_SELECTOR = '.game-cinematic-overlay__title';
const DETAIL_SELECTOR = '.game-cinematic-overlay__detail';
const CONTENT_SELECTOR = '[data-testid="game-cinematic-content"]';
const COUNTDOWN_COUNT_SELECTOR = '[data-testid="game-cinematic-countdown-count"]';
const COUNTDOWN_HALO_SELECTOR = '[data-testid="game-cinematic-countdown-halo"]';
const COUNTDOWN_COMPOSITION_SELECTOR =
  '[data-testid="game-cinematic-countdown-composition"]';
const RIP_COMPOSITION_SELECTOR = '[data-testid="game-cinematic-rip-composition"]';
const CINEMATIC_COMPOSITION_SELECTOR = `${COUNTDOWN_COMPOSITION_SELECTOR}, ${RIP_COMPOSITION_SELECTOR}`;
const VIEWPORT_TOP_INSET_PARAM = 'qaViewportTopInset';
const VIEWPORT_BOTTOM_INSET_PARAM = 'qaViewportBottomInset';
const VIEWPORT_LEFT_INSET_PARAM = 'qaViewportLeftInset';
const VIEWPORT_RIGHT_INSET_PARAM = 'qaViewportRightInset';
const RIP_BROWSER_CHROME_INSET_PARAM = VIEWPORT_BOTTOM_INSET_PARAM;
const RIP_MOBILE_BROWSER_CHROME_BOTTOM_INSET_PX = 104;
const FILE_NAME_EXTENSION_PATTERN = /[^/]+(\.[^.]+)$/;
const COUNTDOWN_VIEWPORT_CONFIGS = [
  {
    viewportName: VIEWPORT_NAME_IPHONE_PORTRAIT,
    screenshotPath: DEFAULT_COUNTDOWN_SCREENSHOT_PATH,
    searchParams: {
      [VIEWPORT_BOTTOM_INSET_PARAM]: COUNTDOWN_PORTRAIT_BOTTOM_INSET_PX,
    },
  },
  {
    viewportName: VIEWPORT_NAME_IPHONE_LANDSCAPE,
    screenshotPath: DEFAULT_COUNTDOWN_LANDSCAPE_SCREENSHOT_PATH,
    searchParams: {},
  },
];

function viewportByName(name) {
  const viewport = RESPONSIVE_VIEWPORT_MATRIX.viewports.find(
    (candidate) => candidate.name === name,
  );
  assert(viewport, `Viewport ausente na matriz responsiva: ${name}`);
  return viewport;
}

function puppeteerViewport(viewport) {
  return {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: Math.min(
      viewport.deviceScaleFactor,
      MAX_QA_DEVICE_SCALE_FACTOR,
    ),
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  };
}

function screenshotPathForViewport(basePath, viewportName, index) {
  if (index === 0) return basePath;
  const viewportSuffix =
    RIP_SCREENSHOT_VIEWPORT_SUFFIXES.get(viewportName) || viewportName;

  return basePath.replace(FILE_NAME_EXTENSION_PATTERN, (fileName, extension) => {
    const baseStem = fileName.slice(0, -extension.length);
    const uniqueStem = `${baseStem}-${viewportSuffix}`;
    const stem = uniqueStem.length <= SEMANTIC_FILE_STEM_MAX_LENGTH
      ? uniqueStem
      : `${RIP_SCREENSHOT_SHORT_STEM}-${viewportSuffix}`;

    return `${stem}${extension}`;
  });
}

function env(name, fallback) {
  return process.env[name] || fallback;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function scenarioUrl(baseUrl, scenario, searchParams = {}) {
  const url = new URL(baseUrl);
  url.searchParams.set('qaScenario', scenario);
  for (const [name, value] of Object.entries(searchParams)) {
    url.searchParams.set(name, String(value));
  }
  return url.toString();
}

function ripScenarioUrl(baseUrl, viewportName) {
  if (viewportName !== VIEWPORT_NAME_IPHONE_PORTRAIT) {
    return scenarioUrl(baseUrl, CINEMATIC_RIP_QA_SCENARIO);
  }

  return scenarioUrl(baseUrl, CINEMATIC_RIP_QA_SCENARIO, {
    [RIP_BROWSER_CHROME_INSET_PARAM]: RIP_MOBILE_BROWSER_CHROME_BOTTOM_INSET_PX,
  });
}

function countdownScenarioUrl(baseUrl, config) {
  return scenarioUrl(baseUrl, SINGLE_BRICK_QA_SCENARIO, config.searchParams);
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

async function waitForServiceWorkerControl(page) {
  await page.evaluate(async (timeoutMs) => {
    if (!('serviceWorker' in navigator)) return;

    await navigator.serviceWorker.ready;

    if (navigator.serviceWorker.controller) return;

    await new Promise((resolve) => {
      const timeout = window.setTimeout(resolve, timeoutMs);
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
    });
  }, SERVICE_WORKER_READY_TIMEOUT_MS);
}

async function prepareControlledPage(page, publicUrl) {
  await page.goto(publicUrl, {
    waitUntil: 'domcontentloaded',
    timeout: NAVIGATION_TIMEOUT_MS,
  });
  await clearOfflineState(page);
  await page.goto(publicUrl, {
    waitUntil: 'domcontentloaded',
    timeout: NAVIGATION_TIMEOUT_MS,
  });
  await waitForServiceWorkerControl(page);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS });
  await waitForServiceWorkerControl(page);
}

async function overlaySnapshot(page, selector) {
  return page.evaluate(({ targetSelector, stageSelector, canvasSelector, titleSelector, detailSelector, contentSelector, countSelector, haloSelector, compositionSelector, topInsetParam, bottomInsetParam, leftInsetParam, rightInsetParam }) => {
    const overlay = document.querySelector(targetSelector);
    const stage = overlay?.querySelector(stageSelector);
    const canvas = document.querySelector(canvasSelector);
    const content = overlay?.querySelector(contentSelector);
    const count = overlay?.querySelector(countSelector);
    const halo = overlay?.querySelector(haloSelector);
    const composition = overlay?.querySelector(compositionSelector);
    const title = overlay?.querySelector(titleSelector);
    const detail = overlay?.querySelector(detailSelector);
    function rectOf(element) {
      const rect = element?.getBoundingClientRect();
      return rect ? {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        centerX: rect.x + rect.width / 2,
        centerY: rect.y + rect.height / 2,
      } : null;
    }
    const visualViewport = window.visualViewport;
    const viewportWidth = visualViewport?.width || window.innerWidth;
    const viewportHeight = visualViewport?.height || window.innerHeight;
    const viewportOffsetX = visualViewport?.offsetLeft || 0;
    const viewportOffsetY = visualViewport?.offsetTop || 0;
    const searchParams = new URLSearchParams(window.location.search);
    const inset = (paramName) => {
      const parsed = Number(searchParams.get(paramName) || 0);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    };
    const browserChromeTopInset = inset(topInsetParam);
    const browserChromeBottomInset = inset(bottomInsetParam);
    const browserChromeLeftInset = inset(leftInsetParam);
    const browserChromeRightInset = inset(rightInsetParam);
    const usableViewportWidth = Math.max(0, viewportWidth - browserChromeLeftInset - browserChromeRightInset);
    const usableViewportHeight = Math.max(0, viewportHeight - browserChromeTopInset - browserChromeBottomInset);
    const usableViewportX = viewportOffsetX + browserChromeLeftInset;
    const usableViewportY = viewportOffsetY + browserChromeTopInset;

    return {
      text: overlay?.textContent?.trim() || '',
      type: overlay?.getAttribute('data-cinematic-type') || '',
      rect: rectOf(overlay),
      stageRect: rectOf(stage),
      canvasRect: rectOf(canvas),
      contentRect: rectOf(content),
      compositionRect: rectOf(composition),
      countdownCountRect: rectOf(count),
      countdownHaloRect: rectOf(halo),
      titleRect: rectOf(title),
      detailRect: rectOf(detail),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      visualViewport: {
        x: viewportOffsetX,
        y: viewportOffsetY,
        width: viewportWidth,
        height: viewportHeight,
        centerX: viewportOffsetX + viewportWidth / 2,
        centerY: viewportOffsetY + viewportHeight / 2,
        right: viewportOffsetX + viewportWidth,
        bottom: viewportOffsetY + viewportHeight,
      },
      usableVisualViewport: {
        x: usableViewportX,
        y: usableViewportY,
        width: usableViewportWidth,
        height: usableViewportHeight,
        centerX: usableViewportX + usableViewportWidth / 2,
        centerY: usableViewportY + usableViewportHeight / 2,
        right: usableViewportX + usableViewportWidth,
        bottom: usableViewportY + usableViewportHeight,
        browserChromeTopInset,
        browserChromeBottomInset,
        browserChromeLeftInset,
        browserChromeRightInset,
      },
      hasBodyScroll:
        document.documentElement.scrollHeight > window.innerHeight ||
        document.body.scrollHeight > window.innerHeight,
      media: [...(overlay?.querySelectorAll('img[data-cinematic-media]') || [])].map((item) => ({
        id: item.getAttribute('data-cinematic-media') || '',
        src: item.getAttribute('src') || '',
        ariaHidden: item.getAttribute('aria-hidden') || '',
        alt: item.getAttribute('alt') || '',
        rect: rectOf(item),
      })),
    };
  }, {
    targetSelector: selector,
    stageSelector: CINEMATIC_STAGE_SELECTOR,
    canvasSelector: CANVAS_SELECTOR,
    titleSelector: TITLE_SELECTOR,
    detailSelector: DETAIL_SELECTOR,
    contentSelector: CONTENT_SELECTOR,
    countSelector: COUNTDOWN_COUNT_SELECTOR,
    haloSelector: COUNTDOWN_HALO_SELECTOR,
    compositionSelector: CINEMATIC_COMPOSITION_SELECTOR,
    topInsetParam: VIEWPORT_TOP_INSET_PARAM,
    bottomInsetParam: VIEWPORT_BOTTOM_INSET_PARAM,
    leftInsetParam: VIEWPORT_LEFT_INSET_PARAM,
    rightInsetParam: VIEWPORT_RIGHT_INSET_PARAM,
  });
}

async function waitForCinematicMediaReady(page, selector) {
  await page.waitForFunction(
    (targetSelector) =>
      [...document.querySelectorAll(`${targetSelector} img[data-cinematic-media]`)].every((image) => {
        const rect = image.getBoundingClientRect();
        return image.complete && image.naturalWidth > 0 && rect.width > 0 && rect.height > 0;
      }),
    { timeout: MEDIA_READY_TIMEOUT_MS },
    selector,
  );
}

async function audioIds(page) {
  return page.evaluate(() => {
    const state = window.__brikayaAudioState?.() || { events: [] };
    return [...new Set((state.events || []).map(event => event.id))].sort();
  });
}

function assertFullViewport(snapshot, label) {
  assert(snapshot.rect, `${label}: overlay ausente.`);
  assert(snapshot.rect.width >= snapshot.viewport.width * 0.96, `${label}: largura não cobre viewport.`);
  assert(snapshot.rect.height >= snapshot.viewport.height * 0.96, `${label}: altura não cobre viewport.`);
}

function assertBoardAnchoring(snapshot, label) {
  assert(snapshot.stageRect, `${label}: palco cinematográfico ausente.`);
  assert(snapshot.canvasRect, `${label}: canvas ausente para comparar ancoragem.`);
  assert(snapshot.contentRect, `${label}: conteúdo textual sem retângulo visual.`);
  assert(Math.abs(snapshot.stageRect.x - snapshot.canvasRect.x) <= MAX_STAGE_OFFSET_PX, `${label}: palco desalinhado no eixo X.`);
  assert(Math.abs(snapshot.stageRect.y - snapshot.canvasRect.y) <= MAX_STAGE_OFFSET_PX, `${label}: palco desalinhado no eixo Y.`);
  assert(Math.abs(snapshot.stageRect.width - snapshot.canvasRect.width) <= MAX_STAGE_OFFSET_PX, `${label}: largura do palco difere do canvas.`);
  assert(Math.abs(snapshot.stageRect.height - snapshot.canvasRect.height) <= MAX_STAGE_OFFSET_PX, `${label}: altura do palco difere do canvas.`);
  assert(Math.abs(snapshot.contentRect.centerX - snapshot.canvasRect.centerX) <= MAX_CONTENT_CENTER_OFFSET_PX, `${label}: conteúdo textual descentralizado no eixo X.`);
  assert(Math.abs(snapshot.contentRect.centerY - snapshot.canvasRect.centerY) <= MAX_CONTENT_CENTER_OFFSET_PX, `${label}: conteúdo textual descentralizado no eixo Y.`);

  if (snapshot.compositionRect) {
    assert(Math.abs(snapshot.compositionRect.centerX - snapshot.canvasRect.centerX) <= MAX_CONTENT_CENTER_OFFSET_PX, `${label}: composição visual descentralizada no eixo X.`);
    assert(Math.abs(snapshot.compositionRect.centerY - snapshot.canvasRect.centerY) <= MAX_CONTENT_CENTER_OFFSET_PX, `${label}: composição visual descentralizada no eixo Y.`);
    assert(snapshot.compositionRect.x >= snapshot.canvasRect.x - MAX_MEDIA_OVERFLOW_PX, `${label}: composição visual saiu pela esquerda do canvas.`);
    assert(snapshot.compositionRect.y >= snapshot.canvasRect.y - MAX_MEDIA_OVERFLOW_PX, `${label}: composição visual saiu pelo topo do canvas.`);
    assert(snapshot.compositionRect.right <= snapshot.canvasRect.right + MAX_MEDIA_OVERFLOW_PX, `${label}: composição visual saiu pela direita do canvas.`);
    assert(snapshot.compositionRect.bottom <= snapshot.canvasRect.bottom + MAX_MEDIA_OVERFLOW_PX, `${label}: composição visual saiu pelo rodapé do canvas.`);
  }

  for (const item of snapshot.media) {
    assert(item.rect, `${label}: mídia sem retângulo visual ${item.id}.`);
    assert(item.rect.width > 0, `${label}: mídia sem largura visual ${item.id}.`);
    assert(item.rect.height > 0, `${label}: mídia sem altura visual ${item.id}.`);
    assert(Math.abs(item.rect.centerX - snapshot.canvasRect.centerX) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: mídia ${item.id} descentralizada no eixo X.`);
    assert(Math.abs(item.rect.centerY - snapshot.canvasRect.centerY) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: mídia ${item.id} descentralizada no eixo Y.`);
    assert(item.rect.x >= snapshot.canvasRect.x - MAX_MEDIA_OVERFLOW_PX, `${label}: mídia ${item.id} saiu pela esquerda do canvas.`);
    assert(item.rect.y >= snapshot.canvasRect.y - MAX_MEDIA_OVERFLOW_PX, `${label}: mídia ${item.id} saiu pelo topo do canvas.`);
    assert(item.rect.right <= snapshot.canvasRect.right + MAX_MEDIA_OVERFLOW_PX, `${label}: mídia ${item.id} saiu pela direita do canvas.`);
    assert(item.rect.bottom <= snapshot.canvasRect.bottom + MAX_MEDIA_OVERFLOW_PX, `${label}: mídia ${item.id} saiu pelo rodapé do canvas.`);
  }
}

function assertCountdownViewportCentering(snapshot, label) {
  const viewport = snapshot.usableVisualViewport || snapshot.visualViewport;

  assert(snapshot.stageRect, `${label}: palco cinematográfico ausente.`);
  assert(snapshot.contentRect, `${label}: conteúdo textual sem retângulo visual.`);
  assert(snapshot.compositionRect, `${label}: composição visual ausente.`);
  assert(snapshot.countdownCountRect, `${label}: número da contagem sem retângulo visual.`);
  assert(snapshot.countdownHaloRect, `${label}: halo da contagem sem retângulo visual.`);
  assert(snapshot.stageRect.width >= viewport.width * MIN_RIP_STAGE_VIEWPORT_COVERAGE_RATIO, `${label}: palco não cobre a largura da viewport.`);
  assert(snapshot.stageRect.height >= viewport.height * MIN_RIP_STAGE_VIEWPORT_COVERAGE_RATIO, `${label}: palco não cobre a altura da viewport.`);
  assert(Math.abs(snapshot.stageRect.centerX - viewport.centerX) <= MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX, `${label}: palco fora do centro X da viewport.`);
  assert(Math.abs(snapshot.stageRect.centerY - viewport.centerY) <= MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX, `${label}: palco fora do centro Y da viewport.`);
  assert(Math.abs(snapshot.compositionRect.centerX - viewport.centerX) <= MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX, `${label}: composição fora do centro X da viewport.`);
  assert(Math.abs(snapshot.compositionRect.centerY - viewport.centerY) <= MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX, `${label}: composição fora do centro Y da viewport.`);
  assert(Math.abs(snapshot.contentRect.centerX - viewport.centerX) <= MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX, `${label}: conteúdo fora do centro X da viewport.`);
  assert(Math.abs(snapshot.contentRect.centerY - viewport.centerY) <= MAX_COUNTDOWN_VIEWPORT_CENTER_OFFSET_PX, `${label}: conteúdo fora do centro Y da viewport.`);
  assert(Math.abs(snapshot.countdownCountRect.centerX - viewport.centerX) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: número fora do centro X da área visível.`);
  assert(Math.abs(snapshot.countdownCountRect.centerY - viewport.centerY) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: número fora do centro Y da área visível.`);
  assert(Math.abs(snapshot.countdownHaloRect.centerX - viewport.centerX) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: halo fora do centro X da área visível.`);
  assert(Math.abs(snapshot.countdownHaloRect.centerY - viewport.centerY) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: halo fora do centro Y da área visível.`);
  assertRectInsideVisualViewport(snapshot.compositionRect, viewport, `${label}: composição countdown`);
  assertRectInsideVisualViewport(snapshot.countdownHaloRect, viewport, `${label}: halo countdown`);

  for (const item of snapshot.media) {
    assert(item.rect, `${label}: mídia sem retângulo visual ${item.id}.`);
    assert(Math.abs(item.rect.centerX - viewport.centerX) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: mídia ${item.id} fora do centro X da viewport.`);
    assert(Math.abs(item.rect.centerY - viewport.centerY) <= MAX_MEDIA_CENTER_OFFSET_PX, `${label}: mídia ${item.id} fora do centro Y da viewport.`);
    assertRectInsideVisualViewport(item.rect, viewport, `${label}: mídia ${item.id}`);
  }
}

function assertRectInsideVisualViewport(rect, viewport, label) {
  assert(rect, `${label}: elemento visual ausente.`);
  assert(rect.x >= viewport.x + RIP_SAFE_AREA_PX, `${label}: saiu pela esquerda da viewport.`);
  assert(rect.y >= viewport.y + RIP_SAFE_AREA_PX, `${label}: saiu pelo topo da viewport.`);
  assert(rect.right <= viewport.right - RIP_SAFE_AREA_PX, `${label}: saiu pela direita da viewport.`);
  assert(rect.bottom <= viewport.bottom - RIP_SAFE_AREA_PX, `${label}: saiu pelo rodapé da viewport.`);
}

function assertRipViewportCentering(snapshot, label) {
  const viewport = snapshot.usableVisualViewport || snapshot.visualViewport;

  assert(snapshot.stageRect, `${label}: palco do RIP ausente.`);
  assert(snapshot.contentRect, `${label}: bloco textual do RIP ausente.`);
  assert(snapshot.compositionRect, `${label}: composição visual do RIP ausente.`);
  assert(snapshot.stageRect.width >= viewport.width * MIN_RIP_STAGE_VIEWPORT_COVERAGE_RATIO, `${label}: palco do RIP não cobre a largura da viewport.`);
  assert(snapshot.stageRect.height >= viewport.height * MIN_RIP_STAGE_VIEWPORT_COVERAGE_RATIO, `${label}: palco do RIP não cobre a altura da viewport.`);
  assert(Math.abs(snapshot.stageRect.centerX - viewport.centerX) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: palco do RIP fora do centro X da viewport.`);
  assert(Math.abs(snapshot.stageRect.centerY - viewport.centerY) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: palco do RIP fora do centro Y da viewport.`);
  assert(Math.abs(snapshot.compositionRect.centerX - viewport.centerX) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: composição do RIP fora do centro X da viewport.`);
  assert(Math.abs(snapshot.compositionRect.centerY - viewport.centerY) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: composição do RIP fora do centro Y da viewport.`);
  assert(Math.abs(snapshot.contentRect.centerX - viewport.centerX) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: texto do RIP fora do centro X da viewport.`);
  assert(Math.abs(snapshot.contentRect.centerY - viewport.centerY) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: texto do RIP fora do centro Y da viewport.`);
  assertRectInsideVisualViewport(snapshot.compositionRect, viewport, `${label}: composição RIP`);
  assertRectInsideVisualViewport(snapshot.titleRect, viewport, `${label}: título RIP`);
  assertRectInsideVisualViewport(snapshot.detailRect, viewport, `${label}: detalhe RIP`);

  for (const item of snapshot.media) {
    assert(item.rect, `${label}: mídia sem retângulo visual ${item.id}.`);
    assert(Math.abs(item.rect.centerX - viewport.centerX) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: mídia ${item.id} fora do centro X da viewport.`);
    assert(Math.abs(item.rect.centerY - viewport.centerY) <= MAX_RIP_VIEWPORT_CENTER_OFFSET_PX, `${label}: mídia ${item.id} fora do centro Y da viewport.`);
    assertRectInsideVisualViewport(item.rect, viewport, `${label}: mídia ${item.id}`);
  }
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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


async function requestCinematicPathsThroughServiceWorker(page, missingPaths) {
  if (missingPaths.length === 0) return;

  await page.evaluate(async ({ paths }) => {
    if (!('serviceWorker' in navigator)) return;
    await navigator.serviceWorker.ready;
    await Promise.all(paths.map(async (path) => {
      const response = await fetch(path, { cache: 'reload' });
      if (!response.ok) throw new Error(`asset fetch failed: ${path}`);
    }));
  }, { paths: missingPaths });
}

async function waitForCachedCinematicPaths(page) {
  const deadline = Date.now() + CACHE_READY_TIMEOUT_MS;
  let cachedPaths = [];

  do {
    cachedPaths = await cachedCinematicPaths(page);
    const missingPaths = REQUIRED_CINEMATIC_MEDIA_PATHS.filter(path => !cachedPaths.includes(path));
    if (missingPaths.length === 0) return cachedPaths;
    await requestCinematicPathsThroughServiceWorker(page, missingPaths);
    await delay(CACHE_READY_POLL_MS);
  } while (Date.now() < deadline);

  return cachedPaths;
}

async function run() {
  const publicUrl = env('BRIKAYA_PUBLIC_URL', DEFAULT_PUBLIC_URL);
  const parsed = new URL(publicUrl);
  assert(parsed.hostname === CANONICAL_HOST, `URL precisa ser brikaya.com: ${publicUrl}`);

  const reportPath = env('BRIKAYA_CINEMATIC_QA_REPORT', DEFAULT_REPORT_PATH);
  const countdownScreenshotPath = env(
    'BRIKAYA_CINEMATIC_COUNTDOWN_SCREENSHOT',
    DEFAULT_COUNTDOWN_SCREENSHOT_PATH,
  );
  const countdownLandscapeScreenshotPath = env(
    'BRIKAYA_CINEMATIC_COUNTDOWN_LANDSCAPE_SCREENSHOT',
    DEFAULT_COUNTDOWN_LANDSCAPE_SCREENSHOT_PATH,
  );
  const levelUpScreenshotPath = env(
    'BRIKAYA_CINEMATIC_LEVEL_SCREENSHOT',
    DEFAULT_LEVEL_UP_SCREENSHOT_PATH,
  );
  const ripScreenshotPath = env(
    'BRIKAYA_CINEMATIC_RIP_SCREENSHOT',
    DEFAULT_RIP_SCREENSHOT_PATH,
  );
  ensureParentDirectory(reportPath);
  ensureParentDirectory(countdownScreenshotPath);
  ensureParentDirectory(countdownLandscapeScreenshotPath);
  ensureParentDirectory(levelUpScreenshotPath);
  ensureParentDirectory(ripScreenshotPath);
  const countdownViewportConfigs = COUNTDOWN_VIEWPORT_CONFIGS.map((config) => ({
    ...config,
    screenshotPath:
      config.viewportName === VIEWPORT_NAME_IPHONE_LANDSCAPE
        ? countdownLandscapeScreenshotPath
        : countdownScreenshotPath,
  }));

  const externalAudioRequests = [];
  const externalMediaRequests = [];
  const consoleProblems = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(['--no-first-run', '--no-default-browser-check']),
  });

  try {
    const attachDiagnostics = (targetPage) => {
      targetPage.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.pathname.endsWith('.mp3') && requestUrl.origin !== parsed.origin) {
        externalAudioRequests.push(request.url());
      }
      if (MEDIA_EXTENSION_PATTERN.test(requestUrl.pathname) && requestUrl.origin !== parsed.origin) {
        externalMediaRequests.push(request.url());
      }
      });
      targetPage.on('console', message => {
      if (['error', 'warn'].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
      });
      targetPage.on('pageerror', error => consoleProblems.push({ type: 'pageerror', text: error.message }));
    };

    const page = await browser.newPage();
    await page.setViewport(puppeteerViewport(VIEWPORT));
    attachDiagnostics(page);

    await prepareControlledPage(page, publicUrl);
    await seedPrivacyConsent(page);
    const primaryCountdownConfig = countdownViewportConfigs[0];
    await page.goto(countdownScenarioUrl(publicUrl, primaryCountdownConfig), {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    await waitForServiceWorkerControl(page);
    await page.waitForSelector(COUNTDOWN_SELECTOR, { timeout: 5000 });
    await waitForCinematicMediaReady(page, COUNTDOWN_SELECTOR);
    const countdownStartedAt = Date.now();
    const countdownState = await overlaySnapshot(page, COUNTDOWN_SELECTOR);
    await page.screenshot({ path: primaryCountdownConfig.screenshotPath, fullPage: true });
    await page.waitForSelector(COUNTDOWN_SELECTOR, {
      hidden: true,
      timeout: COUNTDOWN_MAX_DURATION_MS + 900,
    });
    const countdownDurationMs = Date.now() - countdownStartedAt;
    await page.waitForSelector(LEVEL_UP_SELECTOR, { timeout: MAX_WAIT_MS });
    await waitForCinematicMediaReady(page, LEVEL_UP_SELECTOR);
    const levelUpState = await overlaySnapshot(page, LEVEL_UP_SELECTOR);
    await page.screenshot({ path: levelUpScreenshotPath, fullPage: true });
    await page.waitForSelector(LEVEL_UP_SELECTOR, {
      hidden: true,
      timeout: 10000,
    });
    const levelAudioIds = await audioIds(page);
    const countdownAfterLevel = await page.$(COUNTDOWN_SELECTOR);
    const countdownResults = [
      {
        viewportName: primaryCountdownConfig.viewportName,
        viewport: viewportByName(primaryCountdownConfig.viewportName),
        countdownState,
        countdownDurationMs,
        countdownScreenshotPath: primaryCountdownConfig.screenshotPath,
      },
    ];

    for (const config of countdownViewportConfigs.slice(1)) {
      const countdownPage = await browser.newPage();
      await countdownPage.setViewport(puppeteerViewport(viewportByName(config.viewportName)));
      attachDiagnostics(countdownPage);
      await countdownPage.goto(publicUrl, {
        waitUntil: 'domcontentloaded',
        timeout: NAVIGATION_TIMEOUT_MS,
      });
      await waitForServiceWorkerControl(countdownPage);
      await seedPrivacyConsent(countdownPage);
      await countdownPage.goto(countdownScenarioUrl(publicUrl, config), {
        waitUntil: 'domcontentloaded',
        timeout: NAVIGATION_TIMEOUT_MS,
      });
      await waitForServiceWorkerControl(countdownPage);
      await countdownPage.waitForSelector(COUNTDOWN_SELECTOR, { timeout: 5000 });
      await waitForCinematicMediaReady(countdownPage, COUNTDOWN_SELECTOR);
      const secondaryCountdownStartedAt = Date.now();
      const secondaryCountdownState = await overlaySnapshot(countdownPage, COUNTDOWN_SELECTOR);
      ensureParentDirectory(config.screenshotPath);
      await countdownPage.screenshot({ path: config.screenshotPath, fullPage: true });
      await countdownPage.waitForSelector(COUNTDOWN_SELECTOR, {
        hidden: true,
        timeout: COUNTDOWN_MAX_DURATION_MS + 900,
      });
      const secondaryCountdownDurationMs = Date.now() - secondaryCountdownStartedAt;
      await countdownPage.close({ runBeforeUnload: false });
      countdownResults.push({
        viewportName: config.viewportName,
        viewport: viewportByName(config.viewportName),
        countdownState: secondaryCountdownState,
        countdownDurationMs: secondaryCountdownDurationMs,
        countdownScreenshotPath: config.screenshotPath,
      });
    }

    const ripResults = [];

    for (const [index, viewportName] of RIP_VIEWPORT_NAMES.entries()) {
      const viewport = viewportByName(viewportName);
      const ripPage = await browser.newPage();
      await ripPage.setViewport(puppeteerViewport(viewport));
      attachDiagnostics(ripPage);

      await ripPage.goto(ripScenarioUrl(publicUrl, viewportName), {
        waitUntil: 'domcontentloaded',
        timeout: NAVIGATION_TIMEOUT_MS,
      });
      await waitForServiceWorkerControl(ripPage);
      await ripPage.waitForSelector(COUNTDOWN_SELECTOR, { timeout: 5000 });
      await waitForCinematicMediaReady(ripPage, COUNTDOWN_SELECTOR);
      await ripPage.waitForSelector(COUNTDOWN_SELECTOR, {
        hidden: true,
        timeout: COUNTDOWN_MAX_DURATION_MS + 900,
      });
      await ripPage.waitForSelector(RIP_SELECTOR, { timeout: MAX_WAIT_MS });
      await waitForCinematicMediaReady(ripPage, RIP_SELECTOR);
      const ripStartedAt = Date.now();
      const ripState = await overlaySnapshot(ripPage, RIP_SELECTOR);
      const viewportRipScreenshotPath = screenshotPathForViewport(
        ripScreenshotPath,
        viewportName,
        index,
      );
      ensureParentDirectory(viewportRipScreenshotPath);
      await Promise.all([
        ripPage.screenshot({ path: viewportRipScreenshotPath, fullPage: true }),
        ripPage.waitForSelector(RIP_SELECTOR, {
          hidden: true,
          timeout: RIP_MAX_DURATION_MS + RIP_OBSERVATION_BUFFER_MS,
        }),
      ]);
      const ripDurationMs = Date.now() - ripStartedAt;
      const ripAfterTimeoutState = await overlaySnapshot(ripPage, RIP_SELECTOR);
      const countdownAfterRip = await ripPage.$(COUNTDOWN_SELECTOR);
      const ripAudioIds = await audioIds(ripPage);
      await ripPage.close({ runBeforeUnload: false });
      ripResults.push({
        viewport,
        viewportName,
        ripState,
        ripDurationMs,
        ripAfterTimeoutState,
        countdownAfterRip: Boolean(countdownAfterRip),
        ripAudioIds,
        ripScreenshotPath: viewportRipScreenshotPath,
      });
    }

    const primaryRipResult = ripResults[0];
    const ripState = primaryRipResult.ripState;
    const ripDurationMs = primaryRipResult.ripDurationMs;
    const ripAudioIds = primaryRipResult.ripAudioIds;
    const countdownAfterRip = primaryRipResult.countdownAfterRip;
    const ripAfterTimeoutState = primaryRipResult.ripAfterTimeoutState;
    const cachedPaths = await waitForCachedCinematicPaths(page);

    assertFullViewport(levelUpState, 'level-up');
    assertFullViewport(ripState, 'rip');
    assertBoardAnchoring(levelUpState, 'level-up');
    assertMedia(levelUpState, REQUIRED_LEVEL_UP_MEDIA, 'level-up');
    for (const result of countdownResults) {
      const label = `countdown/${result.viewportName}`;
      assertFullViewport(result.countdownState, label);
      assertCountdownViewportCentering(result.countdownState, label);
      assertMedia(result.countdownState, REQUIRED_COUNTDOWN_MEDIA, label);
      assert(result.countdownDurationMs <= COUNTDOWN_MAX_DURATION_MS + 900, `${label}: demorou demais: ${result.countdownDurationMs}ms.`);
      assert(/3|2|1/.test(result.countdownState.text), `${label}: não mostrou 3, 2 ou 1.`);
    }
    assert(levelUpState.text.includes('Subindo de nível'), 'Level-up não informou subida de nível.');
    assert(levelUpState.text.includes('Fase 2'), 'Level-up não informou fase 2.');
    assert(!countdownAfterLevel, 'Countdown reapareceu entre fases.');
    for (const id of REQUIRED_LEVEL_AUDIO_IDS) {
      assert(levelAudioIds.includes(id), `Áudio ausente no level-up/countdown: ${id}`);
    }

    for (const result of ripResults) {
      const label = `rip/${result.viewportName}`;
      assertFullViewport(result.ripState, label);
      assertRipViewportCentering(result.ripState, label);
      assertMedia(result.ripState, REQUIRED_RIP_MEDIA, label);
      assert(result.ripDurationMs <= RIP_MAX_DURATION_MS + RIP_OBSERVATION_BUFFER_MS, `${label}: RIP demorou demais: ${result.ripDurationMs}ms.`);
      assert(result.ripState.text.includes('RIP'), `${label}: RIP não ficou visível.`);
      assert(!result.ripAfterTimeoutState.rect, `${label}: RIP permaneceu visível após o limite.`);
      for (const id of REQUIRED_RIP_AUDIO_IDS) {
        assert(result.ripAudioIds.includes(id), `${label}: áudio ausente no RIP: ${id}`);
      }
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
      countdownResults,
      levelUpState,
      ripState,
      ripResults,
      levelAudioIds,
      ripAudioIds,
      cachedPaths,
      countdownScreenshotPath,
      countdownLandscapeScreenshotPath,
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
