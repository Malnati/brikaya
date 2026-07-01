// tests/e2e/cloudflare-audio-qa.js
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const DEFAULT_PUBLIC_URL = 'https://malnati-brickbreaker.pages.dev/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-audio-qa.json';
const DEFAULT_SCREENSHOT_PATH = 'docs/assets/issues/audio-cc0-integration/evidence/cloudflare-audio-control.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const AUDIO_EVENT_IDS_PATTERN = /export const AUDIO_EVENT_IDS = (\[[\s\S]*?\]) as const;/;
const AUDIO_FILE_PATTERN = /^.*\.mp3$/;
const AUDIO_DIR = 'public/assets/audio';
const AUDIO_QA_SCENARIO = 'audio-event-tour';
const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false };

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

async function run() {
  const publicUrl = env('BRICKBREAKER_PUBLIC_URL', DEFAULT_PUBLIC_URL);
  const targetUrl = scenarioUrl(publicUrl);
  const parsed = new URL(publicUrl);
  assert(parsed.hostname.endsWith('.pages.dev'), `URL precisa ser Cloudflare Pages: ${publicUrl}`);

  const reportPath = env('BRICKBREAKER_AUDIO_QA_REPORT', DEFAULT_REPORT_PATH);
  const screenshotPath = env('BRICKBREAKER_AUDIO_QA_SCREENSHOT', DEFAULT_SCREENSHOT_PATH);
  ensureParentDirectory(reportPath);
  ensureParentDirectory(screenshotPath);

  const ids = expectedAudioIds();
  const audioPaths = expectedAudioPaths();
  const audioPathSet = new Set(audioPaths);
  const externalAudioRequests = [];
  const sameOriginAudioRequests = [];

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    page.on('request', request => {
      const requestUrl = new URL(request.url());
      if (!requestUrl.pathname.endsWith('.mp3')) return;
      if (requestUrl.origin === parsed.origin) {
        sameOriginAudioRequests.push(requestUrl.pathname);
        return;
      }
      externalAudioRequests.push(request.url());
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.mouse.click(16, 16);
    await page.waitForFunction(() => Boolean(window.__brickbreakerRunAudioTour), { timeout: 30000 });
    await page.evaluate(() => window.__brickbreakerRunAudioTour());
    await page.waitForTimeout(1200);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const state = await page.evaluate(async expectedPaths => {
      const audioState = window.__brickbreakerAudioState?.() || { events: [] };
      const cacheNames = 'caches' in window ? await caches.keys() : [];
      const cachedAudioPaths = [];
      if ('caches' in window) {
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          for (const request of requests) {
            const url = new URL(request.url);
            if (expectedPaths.includes(url.pathname)) cachedAudioPaths.push(url.pathname);
          }
        }
      }
      return {
        title: document.title,
        heading: document.querySelector('h1')?.textContent || '',
        soundButton: Array.from(document.querySelectorAll('button')).map(button => button.textContent?.trim() || '').find(text => /som/i.test(text)) || '',
        audioEvents: audioState.events || [],
        cacheNames,
        cachedAudioPaths: [...new Set(cachedAudioPaths)].sort(),
      };
    }, audioPaths);

    const emittedIds = new Set(state.audioEvents.map(event => event.id));
    const missingIds = ids.filter(id => !emittedIds.has(id));
    const uncachedAudioPaths = audioPaths.filter(path => !state.cachedAudioPaths.includes(path));
    const unknownSameOriginAudioRequests = sameOriginAudioRequests.filter(path => !audioPathSet.has(path));

    assert(state.heading.includes('Breakout'), 'Tela Breakout não carregou.');
    assert(/som/i.test(state.soundButton), 'Controle de som não visível.');
    assert(missingIds.length === 0, `IDs de áudio não emitidos: ${missingIds.join(', ')}`);
    assert(externalAudioRequests.length === 0, `Requests externos de áudio: ${externalAudioRequests.join(', ')}`);
    assert(unknownSameOriginAudioRequests.length === 0, `Requests de áudio fora do manifesto: ${unknownSameOriginAudioRequests.join(', ')}`);
    assert(uncachedAudioPaths.length === 0, `Áudios não encontrados no cache: ${uncachedAudioPaths.join(', ')}`);

    const report = {
      targetUrl,
      screenshotPath,
      expectedAudioIds: ids,
      emittedAudioIds: [...emittedIds].sort(),
      localAudioPaths: audioPaths,
      sameOriginAudioRequests: [...new Set(sameOriginAudioRequests)].sort(),
      externalAudioRequests,
      cachedAudioPaths: state.cachedAudioPaths,
      cacheNames: state.cacheNames,
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
