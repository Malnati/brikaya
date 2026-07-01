// tests/e2e/cloudflare-theme-qa.js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const DEFAULT_PUBLIC_URL = 'https://malnati-brickbreaker.pages.dev/';
const DEFAULT_REPORT_PATH = 'tmp/reports/cloudflare-theme-qa.json';
const DEFAULT_IPHONE15_LIGHT_SCREENSHOT = 'tmp/screenshots/cloudflare-theme-iphone15-light.png';
const DEFAULT_IPHONE15_DARK_SCREENSHOT = 'tmp/screenshots/cloudflare-theme-iphone15-dark.png';
const DEFAULT_DESKTOP_LIGHT_SCREENSHOT = 'tmp/screenshots/cloudflare-theme-desktop-light.png';
const DEFAULT_DESKTOP_DARK_SCREENSHOT = 'tmp/screenshots/cloudflare-theme-desktop-dark.png';
const CHROME_EXECUTABLE_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIN_TOUCH_TARGET_SIZE = 44;
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';
const THEME_STORAGE_KEY = 'brickbreaker-theme';
const FORBIDDEN_VISIBLE_FEATURES = [
  /loja/i,
  /ranking/i,
  /leaderboard/i,
  /upgrades/i,
  /tutorial/i,
  /multiplayer/i,
  /settings/i,
];
const FORBIDDEN_EXTERNAL_HOSTS = [
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /cdn\.tailwindcss\.com/i,
  /googleusercontent\.com/i,
];
const VIEWPORTS = {
  iphone15: { width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  desktop: { width: 1280, height: 720, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env('BRICKBREAKER_PUBLIC_URL', DEFAULT_PUBLIC_URL);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  let closed = false;
  await Promise.race([
    browser.close().then(() => {
      closed = true;
    }),
    new Promise(resolve => setTimeout(resolve, BROWSER_CLOSE_TIMEOUT_MS))
  ]);

  if (!closed && browserProcess) {
    browserProcess.kill('SIGKILL');
  }
}

async function clickButtonByText(page, label) {
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.evaluate(node => node.textContent?.trim() || '');
    if (text === label) {
      await button.click();
      return;
    }
  }
  throw new Error(`Botão não encontrado: ${label}`);
}

async function openMenu(page) {
  await clickButtonByText(page, 'Menu');
  await page.waitForSelector('.settings-drawer', { timeout: 10000 });
}

async function collectState(page) {
  return page.evaluate(({ minTouchTargetSize, forbiddenSources }) => {
    function rectOf(element) {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      };
    }

    const buttons = Array.from(document.querySelectorAll('button')).map(button => {
      const rect = button.getBoundingClientRect();
      return {
        text: button.textContent?.trim() || '',
        width: rect.width,
        height: rect.height,
        visibleInViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
        hasTouchTarget: rect.width >= minTouchTargetSize && rect.height >= minTouchTargetSize,
        ariaPressed: button.getAttribute('aria-pressed'),
      };
    });
    const bodyText = document.body.textContent || '';
    const resourceUrls = Array.from(document.querySelectorAll('link[href], script[src], img[src]')).map(element => element.href || element.src || '');
    const forbiddenResources = resourceUrls.filter(url => forbiddenSources.some(source => new RegExp(source, 'i').test(url)));

    return {
      theme: document.documentElement.dataset.theme || '',
      storedTheme: window.localStorage.getItem('brickbreaker-theme'),
      heading: document.querySelector('h1')?.textContent || '',
      themeToggle: Boolean(document.querySelector('[aria-label="Tema da interface"]')),
      menuOpen: Boolean(document.querySelector('.settings-drawer')),
      buttons,
      bodyText,
      forbiddenResources,
      canvas: rectOf(document.querySelector('canvas')),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
      },
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  }, {
    minTouchTargetSize: MIN_TOUCH_TARGET_SIZE,
    forbiddenSources: FORBIDDEN_EXTERNAL_HOSTS.map(pattern => pattern.source),
  });
}

function assertBaseState(state, viewportName, expectMenuOpen = false) {
  assert(state.heading.includes('Breakout'), `${viewportName}: heading Breakout ausente.`);
  assert(state.buttons.some(button => button.text === 'Menu'), `${viewportName}: botão Menu ausente.`);
  if (expectMenuOpen) {
    assert(state.menuOpen, `${viewportName}: menu lateral fechado.`);
    assert(state.themeToggle, `${viewportName}: seletor de tema ausente.`);
    assert(state.buttons.some(button => button.text === 'Claro'), `${viewportName}: botão Claro ausente.`);
    assert(state.buttons.some(button => button.text === 'Escuro'), `${viewportName}: botão Escuro ausente.`);
    assert(state.buttons.some(button => /logs/i.test(button.text)), `${viewportName}: logs inacessível no menu.`);
    assert(state.buttons.some(button => /colisões/i.test(button.text)), `${viewportName}: colisões inacessível no menu.`);
    assert(state.buttons.some(button => /zerar pontuação/i.test(button.text)), `${viewportName}: zerar pontuação inacessível no menu.`);
  } else {
    assert(!state.themeToggle, `${viewportName}: seletor de tema apareceu fora do menu.`);
    assert(!state.buttons.some(button => button.text === 'Claro'), `${viewportName}: botão Claro apareceu fora do menu.`);
    assert(!state.buttons.some(button => button.text === 'Escuro'), `${viewportName}: botão Escuro apareceu fora do menu.`);
    assert(!state.buttons.some(button => /logs/i.test(button.text)), `${viewportName}: logs apareceu fora do menu.`);
    assert(!state.buttons.some(button => /colisões/i.test(button.text)), `${viewportName}: colisões apareceu fora do menu.`);
    assert(!state.buttons.some(button => /zerar pontuação/i.test(button.text)), `${viewportName}: zerar pontuação apareceu fora do menu.`);
  }
  assert(state.buttons.every(button => button.hasTouchTarget), `${viewportName}: botão menor que 44px: ${state.buttons.filter(button => !button.hasTouchTarget).map(button => button.text).join(', ')}.`);
  assert(state.buttons.every(button => button.visibleInViewport), `${viewportName}: botão cortado: ${state.buttons.filter(button => !button.visibleInViewport).map(button => button.text).join(', ')}.`);
  assert(!state.hasHorizontalOverflow, `${viewportName}: overflow horizontal.`);
  assert(state.canvas, `${viewportName}: canvas ausente.`);
  assert(state.canvas.right <= state.viewport.width, `${viewportName}: canvas excede largura.`);
  assert(state.canvas.bottom <= state.viewport.height, `${viewportName}: canvas excede altura.`);
  for (const forbiddenFeature of FORBIDDEN_VISIBLE_FEATURES) {
    assert(!forbiddenFeature.test(state.bodyText), `${viewportName}: funcionalidade fora de escopo visível: ${forbiddenFeature}.`);
  }
  assert(state.forbiddenResources.length === 0, `${viewportName}: recurso externo proibido no DOM: ${state.forbiddenResources.join(', ')}`);
}

async function validateViewport(page, targetUrl, viewportName, viewport, screenshots) {
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(storageKey => window.localStorage.removeItem(storageKey), THEME_STORAGE_KEY);
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('canvas', { timeout: 30000 });

  const initialState = await collectState(page);
  assertBaseState(initialState, `${viewportName}/inicial`);
  assert(initialState.theme === DARK_THEME, `${viewportName}: tema inicial deveria seguir sistema escuro.`);

  await openMenu(page);
  await clickButtonByText(page, 'Claro');
  await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, {}, LIGHT_THEME);
  const lightState = await collectState(page);
  assertBaseState(lightState, `${viewportName}/claro`, true);
  assert(lightState.theme === LIGHT_THEME, `${viewportName}: tema claro não aplicado.`);
  assert(lightState.storedTheme === LIGHT_THEME, `${viewportName}: tema claro não persistido.`);
  await page.screenshot({ path: screenshots.light, fullPage: true });

  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('canvas', { timeout: 30000 });
  const reloadedLightState = await collectState(page);
  assertBaseState(reloadedLightState, `${viewportName}/claro-reload`);
  assert(reloadedLightState.theme === LIGHT_THEME, `${viewportName}: tema claro não persistiu após reload.`);

  await openMenu(page);
  await clickButtonByText(page, 'Escuro');
  await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, {}, DARK_THEME);
  const darkState = await collectState(page);
  assertBaseState(darkState, `${viewportName}/escuro`, true);
  assert(darkState.theme === DARK_THEME, `${viewportName}: tema escuro não aplicado.`);
  assert(darkState.storedTheme === DARK_THEME, `${viewportName}: tema escuro não persistido.`);
  await page.screenshot({ path: screenshots.dark, fullPage: true });

  return { initialState, lightState, reloadedLightState, darkState };
}

async function run() {
  const targetUrl = publicUrl();
  const parsed = new URL(targetUrl);
  assert(parsed.hostname.endsWith('.pages.dev'), `URL precisa ser Cloudflare Pages: ${targetUrl}`);

  const reportPath = env('BRICKBREAKER_THEME_QA_REPORT', DEFAULT_REPORT_PATH);
  const screenshotPaths = {
    iphone15: {
      light: env('BRICKBREAKER_THEME_QA_IPHONE15_LIGHT_SCREENSHOT', DEFAULT_IPHONE15_LIGHT_SCREENSHOT),
      dark: env('BRICKBREAKER_THEME_QA_IPHONE15_DARK_SCREENSHOT', DEFAULT_IPHONE15_DARK_SCREENSHOT),
    },
    desktop: {
      light: env('BRICKBREAKER_THEME_QA_DESKTOP_LIGHT_SCREENSHOT', DEFAULT_DESKTOP_LIGHT_SCREENSHOT),
      dark: env('BRICKBREAKER_THEME_QA_DESKTOP_DARK_SCREENSHOT', DEFAULT_DESKTOP_DARK_SCREENSHOT),
    },
  };
  [reportPath, ...Object.values(screenshotPaths).flatMap(paths => [paths.light, paths.dark])].forEach(ensureParentDirectory);

  const consoleProblems = [];
  const externalRequests = [];
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_EXECUTABLE_PATH,
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', message => {
      if (['error', 'warn'].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', error => consoleProblems.push({ type: 'pageerror', text: error.message }));
    page.on('request', request => {
      const requestUrl = new URL(request.url());
      if (requestUrl.hostname !== parsed.hostname) {
        externalRequests.push(request.url());
      }
    });

    const results = {
      iphone15: await validateViewport(page, targetUrl, 'iphone15', VIEWPORTS.iphone15, screenshotPaths.iphone15),
      desktop: await validateViewport(page, targetUrl, 'desktop', VIEWPORTS.desktop, screenshotPaths.desktop),
    };

    const forbiddenExternalRequests = externalRequests.filter(url => FORBIDDEN_EXTERNAL_HOSTS.some(pattern => pattern.test(url)));
    assert(forbiddenExternalRequests.length === 0, `Requisições externas proibidas: ${forbiddenExternalRequests.join(', ')}`);
    assert(externalRequests.length === 0, `Requisições a terceiros não permitidas: ${[...new Set(externalRequests)].join(', ')}`);
    assert(consoleProblems.length === 0, `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`);

    const report = {
      url: targetUrl,
      screenshotPaths,
      results,
      externalRequests: [...new Set(externalRequests)],
      consoleProblems,
    };
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await closeBrowser(browser);
  }
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
