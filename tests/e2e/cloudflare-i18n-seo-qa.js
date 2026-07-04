// tests/e2e/cloudflare-i18n-seo-qa.js
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH =
  "docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-public-validation.json";
const DEFAULT_SCREENSHOT_PATH =
  "docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-localized-menu.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const USER_DATA_DIR_PREFIX = "brickbreaker-i18n-seo-qa-";
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const PAGE_TIMEOUT_MS = 20000;
const OPTIONAL_CONSENT_TIMEOUT_MS = 5000;
const HTTP_OK = 200;
const ROOT_LOCALE = "pt-BR";
const TESTED_LOCALES = [
  { locale: "pt-BR", path: "/", title: "Brikaya — arcade de quebrar blocos" },
  { locale: "en", path: "/en/", title: "Brikaya — block breaker arcade" },
  {
    locale: "es-419",
    path: "/es-419/",
    title: "Brikaya — arcade de romper bloques",
  },
  { locale: "zh-CN", path: "/zh-CN/", title: "Brikaya — 打砖块街机" },
];
const ALL_HREFLANG_LOCALES = [
  "pt-BR",
  "en",
  "es-419",
  "en-IN",
  "hi-IN",
  "de",
  "fr",
  "it",
  "ja",
  "ko",
  "id",
  "vi",
  "fil",
  "th",
  "zh-CN",
];
const LANGUAGE_SELECT_SELECTOR = "#game-language-select";
const MENU_BUTTON_SELECTOR = ".dashboard-menu-button";
const CONSENT_BUTTON_SELECTOR = ".consent-screen__button";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const PRE_GAME_ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const MENU_OPEN_ATTEMPTS = 3;
const MENU_OPEN_RETRY_TIMEOUT_MS = 5000;
const CHINESE_MENU_TEXT = "隐私";
const ROOT_CANONICAL = "https://brikaya.com/";
const BROWSER_AUTO_LANGUAGE = "es-MX";
const BROWSER_AUTO_LANGUAGES = ["es-MX", "en-US"];
const BROWSER_AUTO_EXPECTED_LOCALE = "es-419";
const BROWSER_AUTO_EXPECTED_PATH = "/es-419/";
const TIME_ZONE_AUTO_LANGUAGE = "nl-NL";
const TIME_ZONE_AUTO_LANGUAGES = ["nl-NL"];
const TIME_ZONE_AUTO_VALUE = "Europe/Berlin";
const TIME_ZONE_AUTO_EXPECTED_LOCALE = "de";
const TIME_ZONE_AUTO_EXPECTED_PATH = "/de/";
const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const MANUAL_LOCALE_SOURCE = "manual";
const SITEMAP_PATH = "/sitemap.xml";
const ROBOTS_PATH = "/robots.txt";
const REPORT_JSON_SPACES = 2;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRICKBREAKER_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function reportPath() {
  return env("BRICKBREAKER_I18N_SEO_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRICKBREAKER_I18N_SEO_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalFor(baseUrl, locale, path) {
  return locale === ROOT_LOCALE ? ROOT_CANONICAL : new URL(path, baseUrl).href;
}

async function fetchText(url) {
  const response = await fetch(url);
  const body = await response.text();
  return { status: response.status, body };
}

async function validateHtml(baseUrl, item) {
  const url = new URL(item.path, baseUrl).href;
  const { status, body } = await fetchText(url);
  const canonical = canonicalFor(baseUrl, item.locale, item.path);

  assert(status === HTTP_OK, `${url} status=${status}`);
  assert(
    body.includes(`<html lang="${item.locale}">`),
    `${url} sem lang ${item.locale}`,
  );
  assert(
    body.includes(`<link rel="canonical" href="${canonical}" />`),
    `${url} canonical incorreto`,
  );
  assert(
    body.includes(`<title>${item.title}</title>`),
    `${url} title incorreto`,
  );
  assert(!body.includes(".pages.dev"), `${url} contém pages.dev`);
  assert(!body.includes('href="./assets/'), `${url} tem href asset relativo`);
  assert(!body.includes('src="./assets/'), `${url} tem src asset relativo`);
  for (const locale of ALL_HREFLANG_LOCALES) {
    assert(
      body.includes(`hreflang="${locale}"`),
      `${url} sem hreflang ${locale}`,
    );
  }
  assert(body.includes('hreflang="x-default"'), `${url} sem x-default`);

  return { url, status, canonical, locale: item.locale };
}

async function validateSitemapAndRobots(baseUrl) {
  const sitemapUrl = new URL(SITEMAP_PATH, baseUrl).href;
  const robotsUrl = new URL(ROBOTS_PATH, baseUrl).href;
  const sitemap = await fetchText(sitemapUrl);
  const robots = await fetchText(robotsUrl);

  assert(sitemap.status === HTTP_OK, `sitemap status=${sitemap.status}`);
  assert(robots.status === HTTP_OK, `robots status=${robots.status}`);
  for (const locale of ALL_HREFLANG_LOCALES) {
    const path = locale === ROOT_LOCALE ? "/" : `/${locale}/`;
    assert(
      sitemap.body.includes(`<loc>${new URL(path, baseUrl).href}</loc>`),
      `sitemap sem ${locale}`,
    );
  }
  assert(robots.body.includes(`Sitemap: ${sitemapUrl}`), "robots sem sitemap");

  return {
    sitemapUrl,
    robotsUrl,
    sitemapStatus: sitemap.status,
    robotsStatus: robots.status,
  };
}

async function closeBrowser(browser) {
  let timedOut = false;
  await Promise.race([
    browser.close(),
    new Promise((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve();
      }, BROWSER_CLOSE_TIMEOUT_MS),
    ),
  ]);
  if (timedOut) {
    const browserProcess = browser.process();
    browser.disconnect();
    browserProcess?.kill("SIGTERM");
  }
}

async function acceptPreGamePromptIfVisible(page) {
  const accepted = await page.evaluate((acceptLabel) => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.trim() === acceptLabel,
    );
    if (!button) return false;
    button.click();
    return true;
  }, PRE_GAME_ACCEPT_BUTTON_LABEL);

  if (accepted) {
    await page.waitForFunction(
      (acceptLabel) => !(document.body.textContent || "").includes(acceptLabel),
      { timeout: PAGE_TIMEOUT_MS },
      PRE_GAME_ACCEPT_BUTTON_LABEL,
    );
  }
}

async function waitForCinematicOverlayToClear(page) {
  await page
    .waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
      hidden: true,
      timeout: PAGE_TIMEOUT_MS,
    })
    .catch(() => null);
}

async function openMenuAndWaitForLanguageSelector(page) {
  for (let attempt = 0; attempt < MENU_OPEN_ATTEMPTS; attempt += 1) {
    await waitForCinematicOverlayToClear(page);
    await page.waitForSelector(MENU_BUTTON_SELECTOR, {
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.click(MENU_BUTTON_SELECTOR);
    const selector = await page
      .waitForSelector(LANGUAGE_SELECT_SELECTOR, {
        timeout: MENU_OPEN_RETRY_TIMEOUT_MS,
      })
      .catch(() => null);
    if (selector) return;
  }

  throw new Error("Menu de idioma não abriu no app publicado.");
}

async function validateRuntimeLanguageSwitch(baseUrl, outputScreenshotPath) {
  const userDataDir = mkdtempSync(`${tmpdir()}/${USER_DATA_DIR_PREFIX}`);
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 852,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    const consentButton = await page
      .waitForSelector(CONSENT_BUTTON_SELECTOR, {
        timeout: OPTIONAL_CONSENT_TIMEOUT_MS,
      })
      .catch(() => null);
    if (consentButton) {
      await consentButton.click();
      await waitForCinematicOverlayToClear(page);
    }
    await acceptPreGamePromptIfVisible(page);
    await openMenuAndWaitForLanguageSelector(page);
    await page.select(LANGUAGE_SELECT_SELECTOR, "zh-CN");
    await page.waitForFunction(
      () => document.documentElement.lang === "zh-CN",
      { timeout: PAGE_TIMEOUT_MS },
    );
    await page.waitForFunction(
      (text) => document.body.textContent?.includes(text),
      { timeout: PAGE_TIMEOUT_MS },
      CHINESE_MENU_TEXT,
    );
    ensureParentDirectory(outputScreenshotPath);
    await page.screenshot({ path: outputScreenshotPath, fullPage: true });
    const runtimeState = await page.evaluate(
      (localeKey, sourceKey) => ({
        lang: document.documentElement.lang,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        path: window.location.pathname,
        visibleChinese: document.body.textContent?.includes("隐私") || false,
        storedLocale: window.localStorage.getItem(localeKey),
        storedSource: window.localStorage.getItem(sourceKey),
      }),
      LOCALE_STORAGE_KEY,
      LOCALE_SOURCE_STORAGE_KEY,
    );
    assert(
      runtimeState.storedLocale === "zh-CN",
      "preferência manual não persistiu locale",
    );
    assert(
      runtimeState.storedSource === MANUAL_LOCALE_SOURCE,
      "preferência manual não persistiu origem",
    );
    await page.reload({ waitUntil: "networkidle2", timeout: PAGE_TIMEOUT_MS });
    await page.waitForFunction(
      () => document.documentElement.lang === "zh-CN",
      { timeout: PAGE_TIMEOUT_MS },
    );
    const reloadedState = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      path: window.location.pathname,
    }));

    return { ...runtimeState, reloadedState };
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function validateRuntimeBrowserLocale(baseUrl) {
  const userDataDir = mkdtempSync(`${tmpdir()}/${USER_DATA_DIR_PREFIX}`);
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(
      (languages, language) => {
        Object.defineProperty(window.navigator, "languages", {
          configurable: true,
          get: () => languages,
        });
        Object.defineProperty(window.navigator, "language", {
          configurable: true,
          get: () => language,
        });
        localStorage.clear();
        sessionStorage.clear();
      },
      BROWSER_AUTO_LANGUAGES,
      BROWSER_AUTO_LANGUAGE,
    );
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.waitForFunction(
      (locale) => document.documentElement.lang === locale,
      { timeout: PAGE_TIMEOUT_MS },
      BROWSER_AUTO_EXPECTED_LOCALE,
    );
    await page.waitForFunction(
      (path) => window.location.pathname === path,
      { timeout: PAGE_TIMEOUT_MS },
      BROWSER_AUTO_EXPECTED_PATH,
    );

    const runtimeState = await page.evaluate(
      (localeKey, sourceKey) => ({
        lang: document.documentElement.lang,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        path: window.location.pathname,
        storedLocale: window.localStorage.getItem(localeKey),
        storedSource: window.localStorage.getItem(sourceKey),
      }),
      LOCALE_STORAGE_KEY,
      LOCALE_SOURCE_STORAGE_KEY,
    );
    assert(
      runtimeState.canonical ===
        new URL(BROWSER_AUTO_EXPECTED_PATH, baseUrl).href,
      "canonical não acompanhou idioma automático do navegador",
    );
    assert(
      runtimeState.storedLocale === null,
      "detecção automática por idioma não deve salvar locale manual",
    );
    assert(
      runtimeState.storedSource === null,
      "detecção automática por idioma não deve salvar origem manual",
    );

    return runtimeState;
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function validateRuntimeTimeZoneLocale(baseUrl) {
  const userDataDir = mkdtempSync(`${tmpdir()}/${USER_DATA_DIR_PREFIX}`);
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });

  try {
    const page = await browser.newPage();
    await page.emulateTimezone(TIME_ZONE_AUTO_VALUE);
    await page.evaluateOnNewDocument(
      (languages, language) => {
        Object.defineProperty(window.navigator, "languages", {
          configurable: true,
          get: () => languages,
        });
        Object.defineProperty(window.navigator, "language", {
          configurable: true,
          get: () => language,
        });
        localStorage.clear();
        sessionStorage.clear();
      },
      TIME_ZONE_AUTO_LANGUAGES,
      TIME_ZONE_AUTO_LANGUAGE,
    );
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.waitForFunction(
      (locale) => document.documentElement.lang === locale,
      { timeout: PAGE_TIMEOUT_MS },
      TIME_ZONE_AUTO_EXPECTED_LOCALE,
    );
    await page.waitForFunction(
      (path) => window.location.pathname === path,
      { timeout: PAGE_TIMEOUT_MS },
      TIME_ZONE_AUTO_EXPECTED_PATH,
    );

    const runtimeState = await page.evaluate(
      (storageKey) => ({
        lang: document.documentElement.lang,
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        path: window.location.pathname,
        storedLocale: window.localStorage.getItem(storageKey),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      LOCALE_STORAGE_KEY,
    );
    assert(
      runtimeState.canonical ===
        new URL(TIME_ZONE_AUTO_EXPECTED_PATH, baseUrl).href,
      "canonical não acompanhou fuso horário automático do navegador",
    );
    assert(
      runtimeState.storedLocale === null,
      "detecção automática por fuso não deve salvar preferência manual",
    );

    return runtimeState;
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

async function run() {
  const baseUrl = publicUrl();
  const htmlResults = [];
  for (const item of TESTED_LOCALES) {
    htmlResults.push(await validateHtml(baseUrl, item));
  }
  const sitemapRobots = await validateSitemapAndRobots(baseUrl);
  const runtime = await validateRuntimeLanguageSwitch(
    baseUrl,
    screenshotPath(),
  );
  const browserLocaleRuntime = await validateRuntimeBrowserLocale(baseUrl);
  const timeZoneLocaleRuntime = await validateRuntimeTimeZoneLocale(baseUrl);
  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    localesChecked: TESTED_LOCALES.map((item) => item.locale),
    hreflangLocales: ALL_HREFLANG_LOCALES,
    htmlResults,
    sitemapRobots,
    runtime,
    browserLocaleRuntime,
    timeZoneLocaleRuntime,
    screenshot: screenshotPath(),
  };

  ensureParentDirectory(reportPath());
  writeFileSync(
    reportPath(),
    `${JSON.stringify(report, null, REPORT_JSON_SPACES)}\n`,
  );
  console.log(`cloudflare-i18n-seo-qa ok: report=${reportPath()}`);
}

run().catch((error) => {
  console.error("cloudflare-i18n-seo-qa failed", error);
  process.exitCode = 1;
});
