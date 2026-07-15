// tests/e2e/cloudflare-i18n-seo-qa.js
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import seoSnapshot from "../../scripts/generated/i18n-home-seo.json" with { type: "json" };
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";

import { gameQaUrl, publicQaUrl } from "./publicQaEnv.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH =
  "docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-public-validation.json";
const DEFAULT_SCREENSHOT_PATH =
  "docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-localized-menu.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const USER_DATA_DIR_PREFIX = "brikaya-i18n-seo-qa-";
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const PAGE_TIMEOUT_MS = 20000;
const OPTIONAL_CONSENT_TIMEOUT_MS = 5000;
const HTTP_OK = 200;
const ROOT_LOCALE = "pt-BR";
const PLAY_ROUTE_PATH = "/play/";
function seoHomeTitle(locale) {
  return seoSnapshot[locale]?.home?.title ?? seoSnapshot.en.home.title;
}

function seoDownloadsTitle(locale) {
  return seoSnapshot[locale]?.downloads?.title ?? seoSnapshot.en.downloads.title;
}

function homePathForLocale(locale) {
  return locale === ROOT_LOCALE ? "/" : `/${locale}/`;
}

function downloadsPathForLocale(locale) {
  return locale === ROOT_LOCALE ? "/downloads/" : `/${locale}/downloads/`;
}

const TESTED_LOCALE_IDS = [
    "pt-BR",
    "en",
    "es-419",
    "zh-CN",
    "ar",
    "ru",
    "nl",
    "zh-TW",
    "bn",
    "ur",
    "fa",
    "he",
    "mr",
    "gu",
    "kn",
    "ml",
    "pa",
    "el",
    "sv",
    "da",
    "no",
    "fi",
    "cs",
    "bg",
    "sr",
    "af",
    "uz",
    "my",
    "is",
    "mk",
    "ca",
    "mi",
    "so",
    "yo",
    "ha",
    "zu",
    "rw",
    "ti",
    "qu",
    "gn",
    "jv",
    "haw",
    "scn",
    "ps",
    "dv",
    "or",
    "sat",
    "awa",
    "ace",
    "bal",
    "chr",
    "tt",
    "ban",
    "fy",
    "se",
    "iu",
    "nv",
    "tpi",
    "aa",
    "ce",
    "tyv",
    "kaa",
    "sma",
    "la",
    "eo",
    "nds",
    "hsb",
    "en-AU",
    "es-MX",
    "pt-AO",
    "zh-HK",
    "ar-SA",
    "ug-CN",
    "wa"
  ];

const TESTED_LOCALES = TESTED_LOCALE_IDS.map((locale) => ({
  locale,
  path: homePathForLocale(locale),
  title: seoHomeTitle(locale),
}));
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
  "ar",
  "ru",
  "tr",
  "nl",
  "pl",
  "uk",
  "ms",
  "zh-TW",
  "pt-PT",
  "es-ES",
  "en-GB",
  "fr-CA",
  "bn",
  "ur",
  "fa",
  "he",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "el",
  "sv",
  "da",
  "no",
  "fi",
  "cs",
  "ro",
  "hu",
  "bg",
  "sk",
  "sl",
  "hr",
  "sr",
  "lt",
  "lv",
  "et",
  "sw",
  "af",
  "am",
  "ka",
  "hy",
  "az",
  "kk",
  "uz",
  "ne",
  "si",
  "km",
  "lo",
  "my",
  "is",
  "ga",
  "cy",
  "mt",
  "sq",
  "mk",
  "bs",
  "mn",
  "tg",
  "ky",
  "tk",
  "be",
  "lb",
  "eu",
  "ca",
  "gl",
  "oc",
  "br",
  "mi",
  "sm",
  "to",
  "fj",
  "mg",
  "so",
  "yo",
  "ig",
  "ha",
  "zu",
  "xh",
  "st",
  "tn",
  "ts",
  "ss",
  "ve",
  "nso",
  "rw",
  "rn",
  "ln",
  "lg",
  "ak",
  "ee",
  "tw",
  "sn",
  "ny",
  "wo",
  "ff",
  "om",
  "ti",
  "qu",
  "ay",
  "gn",
  "nah",
  "ht",
  "pap",
  "jv",
  "su",
  "ceb",
  "ilo",
  "war",
  "haw",
  "co",
  "sc",
  "fur",
  "rm",
  "lad",
  "ast",
  "vec",
  "lmo",
  "pms",
  "nap",
  "scn",
  "sco",
  "ps",
  "sd",
  "ks",
  "dv",
  "ckb",
  "ug",
  "yi",
  "bo",
  "dz",
  "ku",
  "or",
  "as",
  "sa",
  "mai",
  "bho",
  "doi",
  "mni",
  "kok",
  "sat",
  "lus",
  "brx",
  "raj",
  "hne",
  "awa",
  "ace",
  "bal",
  "chr",
  "crh",
  "tt",
  "ba",
  "cv",
  "sah",
  "os",
  "ab",
  "ady",
  "kab",
  "tet",
  "bug",
  "min",
  "ban",
  "mad",
  "bjn",
  "hil",
  "pam",
  "bcl",
  "gor",
  "mak",
  "sas",
  "fy",
  "fo",
  "gd",
  "gv",
  "kw",
  "se",
  "kl",
  "iu",
  "cr",
  "oj",
  "lkt",
  "nv",
  "ik",
  "ch",
  "mh",
  "ty",
  "bi",
  "na",
  "gil",
  "niu",
  "rar",
  "pau",
  "tpi",
  "ho",
  "aa",
  "av",
  "ce",
  "kv",
  "udm",
  "myv",
  "mdf",
  "mhr",
  "mrj",
  "tyv",
  "alt",
  "krc",
  "kum",
  "lez",
  "inh",
  "kbd",
  "xal",
  "nog",
  "kaa",
  "kjh",
  "gag",
  "rom",
  "sma",
  "smj",
  "la",
  "eo",
  "ia",
  "ie",
  "io",
  "vo",
  "an",
  "mwl",
  "ext",
  "bar",
  "hsb",
  "dsb",
  "nds",
  "frr",
  "stq",
  "ksh",
  "pcd",
  "wa",
  "li",
  "vls",
  "zea",
  "frp",
  "arp",
  "en-AU",
  "en-CA",
  "en-NZ",
  "en-ZA",
  "es-MX",
  "es-AR",
  "es-CO",
  "es-CL",
  "es-PE",
  "pt-AO",
  "pt-MZ",
  "fr-BE",
  "fr-CH",
  "de-AT",
  "de-CH",
  "it-CH",
  "zh-HK",
  "ar-SA",
  "ar-EG",
  "fa-AF",
  "ps-AF",
  "sd-IN",
  "ks-IN",
  "ug-CN",
  "yi-001",
  "mus",
];
const TESTED_DOWNLOADS_LOCALE_IDS = [
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
    "ar",
    "ru",
    "tr",
    "nl",
    "pl",
    "uk",
    "ms",
    "zh-TW",
    "pt-PT",
    "es-ES",
    "en-GB",
    "fr-CA",
    "bn",
    "ur",
    "fa",
    "he",
    "ta",
    "te",
    "mr",
    "gu",
    "kn",
    "ml",
    "pa",
    "el",
    "sv",
    "da",
    "no",
    "fi",
    "cs",
    "bg",
    "sr",
    "af",
    "uz",
    "my",
    "is",
    "mk",
    "ca",
    "mi",
    "so",
    "yo",
    "ha",
    "zu",
    "rw",
    "ti",
    "qu",
    "gn",
    "jv",
    "haw",
    "scn",
    "ps",
    "dv",
    "or",
    "sat",
    "awa",
    "ace",
    "bal",
    "chr",
    "tt",
    "ban",
    "fy",
    "se",
    "iu",
    "nv",
    "tpi",
    "aa",
    "ce",
    "tyv",
    "kaa",
    "sma",
    "en-AU",
    "es-MX",
    "pt-AO",
    "zh-HK",
    "ar-SA",
    "ug-CN"
  ];

const TESTED_DOWNLOADS_LOCALES = TESTED_DOWNLOADS_LOCALE_IDS.map((locale) => ({
  locale,
  path: downloadsPathForLocale(locale),
  title: seoDownloadsTitle(locale),
}));
const LANGUAGE_SELECT_SELECTOR = "#game-language-select";
const MENU_BUTTON_SELECTOR = ".dashboard-menu-button";
const CONSENT_BUTTON_SELECTOR = ".consent-screen__button";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const LANGUAGE_DETECTION_OVERLAY_SELECTOR =
  '[data-testid="language-detection-overlay"]';
const PRE_GAME_ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const MENU_OPEN_ATTEMPTS = 3;
const MENU_OPEN_RETRY_TIMEOUT_MS = 5000;
const CHINESE_MENU_TEXT = "隐私";
const ROOT_CANONICAL = "https://brikaya.com/";
const RTL_LOCALES = new Set(["ar", "ur", "fa", "he", "ps", "sd", "ks", "dv", "ckb", "ug", "yi", "bal", "ar-SA", "ar-EG", "fa-AF", "ps-AF", "sd-IN", "ks-IN", "ug-CN", "yi-001"]);
const BROWSER_AUTO_LANGUAGE = "es-MX";
const BROWSER_AUTO_LANGUAGES = ["es-MX", "en-US"];
const BROWSER_AUTO_EXPECTED_LOCALE = "es-MX";
const BROWSER_AUTO_EXPECTED_PATH = "/es-MX/play/";
const TIME_ZONE_AUTO_LANGUAGE = "eo-EO";
const TIME_ZONE_AUTO_LANGUAGES = ["eo-EO"];
const TIME_ZONE_AUTO_VALUE = "Europe/Berlin";
const TIME_ZONE_AUTO_EXPECTED_LOCALE = "de";
const TIME_ZONE_AUTO_EXPECTED_PATH = "/de/play/";
const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const MANUAL_LOCALE_SOURCE = "manual";
const SITEMAP_PATH = "/sitemap.xml";
const ROBOTS_PATH = "/robots.txt";
const STATIC_PUBLIC_PATHS = [
  "/about/",
  "/legal/",
  "/privacy/",
  "/terms/",
  "/user-agreement/",
  "/license/",
  "/data-deletion/",
  "/cookies/",
  "/support/",
];
const LEGAL_HREFLANG_SAMPLE_LOCALES = [
  "en-US",
  "pt-BR",
  "es-419",
  "fr",
  "zh-CN",
  "zh-TW",
  "ar",
];
const TESTED_LEGAL_PAGES = [
  {
    locale: "en-US",
    path: "/privacy/",
    routePath: "/privacy/",
    title: "Privacy policy — Brikaya",
    bodySnippet: "Privacy policy",
  },
  {
    locale: "pt-BR",
    path: "/pt-BR/privacy/",
    routePath: "/privacy/",
    title: "Política de privacidade — Brikaya",
    bodySnippet: "Política de Privacidade",
  },
  {
    locale: "es-419",
    path: "/es-419/terms/",
    routePath: "/terms/",
    title: "Condiciones de uso — Brikaya",
    bodySnippet: "Condiciones de uso",
  },
  {
    locale: "fr",
    path: "/fr/legal/",
    routePath: "/legal/",
    title: "Mentions légales — Brikaya",
    bodySnippet: "Légal",
  },
  {
    locale: "zh-CN",
    path: "/zh-CN/data-deletion/",
    routePath: "/data-deletion/",
    title: "数据删除 — Brikaya",
    bodySnippet: "数据",
  },
  {
    locale: "zh-TW",
    path: "/zh-TW/legal/",
    routePath: "/legal/",
    title: "法律 — Brikaya",
    bodySnippet: "法律",
  },
  {
    locale: "ar",
    path: "/ar/privacy/",
    routePath: "/privacy/",
    title: "سياسة الخصوصية — Brikaya",
    bodySnippet: "الخصوصية",
  },
];
const REPORT_JSON_SPACES = 2;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRIKAYA_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function siteOriginUrl() {
  const parsed = new URL(publicQaUrl());
  return `${parsed.protocol}//${parsed.host}/`;
}

function playAppUrl() {
  return gameQaUrl();
}

function reportPath() {
  return env("BRIKAYA_I18N_SEO_QA_REPORT", DEFAULT_REPORT_PATH);
}

function screenshotPath() {
  return env("BRIKAYA_I18N_SEO_QA_SCREENSHOT", DEFAULT_SCREENSHOT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function canonicalFor(baseUrl, locale, path) {
  return locale === ROOT_LOCALE && path === "/" ? ROOT_CANONICAL : new URL(path, baseUrl).href;
}

function legalPathFor(locale, routePath) {
  return locale === "en-US" ? routePath : `/${locale}${routePath}`;
}

function htmlLangPattern(locale) {
  const direction = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  return new RegExp(`<html lang="${locale}"(?: dir="${direction}")?>`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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
    htmlLangPattern(item.locale).test(body),
    `${url} sem lang ${item.locale}`,
  );
  assert(
    body.includes(`<link rel="canonical" href="${canonical}" />`),
    `${url} canonical incorreto`,
  );
  assert(
    body.includes(`<title>${escapeHtml(item.title)}</title>`),
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

async function validateLegalHtml(baseUrl, item) {
  const url = new URL(item.path, baseUrl).href;
  const { status, body } = await fetchText(url);
  const canonical = new URL(item.path, baseUrl).href;

  assert(status === HTTP_OK, `${url} status=${status}`);
  assert(
    htmlLangPattern(item.locale).test(body),
    `${url} sem lang ${item.locale}`,
  );
  assert(
    body.includes(`<link rel="canonical" href="${canonical}" />`),
    `${url} canonical legal incorreto`,
  );
  assert(
    body.includes(`<title>${escapeHtml(item.title)}</title>`),
    `${url} title legal incorreto`,
  );
  assert(body.includes(item.bodySnippet), `${url} sem trecho legal esperado`);
  assert(!body.includes(".pages.dev"), `${url} contém pages.dev`);
  assert(!body.includes('href="./assets/'), `${url} tem href asset relativo`);
  assert(!body.includes('src="./assets/'), `${url} tem src asset relativo`);

  for (const locale of LEGAL_HREFLANG_SAMPLE_LOCALES) {
    assert(
      body.includes(`hreflang="${locale}"`),
      `${url} sem hreflang legal ${locale}`,
    );
    assert(
      body.includes(
        `href="${new URL(legalPathFor(locale, item.routePath), baseUrl).href}"`,
      ),
      `${url} sem href legal ${locale}`,
    );
  }
  assert(body.includes('hreflang="x-default"'), `${url} sem x-default legal`);
  assert(!body.includes('hreflang="en-AU"'), `${url} contém variante en-AU legal`);
  assert(!body.includes('hreflang="fr-CA"'), `${url} contém variante fr-CA legal`);

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
    const playPath =
      locale === ROOT_LOCALE ? PLAY_ROUTE_PATH : `/${locale}${PLAY_ROUTE_PATH}`;
    assert(
      sitemap.body.includes(`<loc>${new URL(playPath, baseUrl).href}</loc>`),
      `sitemap sem play ${locale}`,
    );
    const downloadsPath =
      locale === ROOT_LOCALE ? "/downloads/" : `/${locale}/downloads/`;
    assert(
      sitemap.body.includes(
        `<loc>${new URL(downloadsPath, baseUrl).href}</loc>`,
      ),
      `sitemap sem downloads ${locale}`,
    );
  }
  for (const path of STATIC_PUBLIC_PATHS) {
    assert(
      sitemap.body.includes(`<loc>${new URL(path, baseUrl).href}</loc>`),
      `sitemap sem ${path}`,
    );
  }
  for (const path of ["/how-to-play/", "/faq/", "/updates/"]) {
    assert(
      sitemap.body.includes(`<loc>${new URL(path, baseUrl).href}</loc>`),
      `sitemap sem editorial ${path}`,
    );
    assert(
      sitemap.body.includes(
        `<loc>${new URL(`/pt-BR${path}`, baseUrl).href}</loc>`,
      ),
      `sitemap sem editorial pt-BR ${path}`,
    );
    assert(
      !sitemap.body.includes(`<loc>${new URL(`/fr${path}`, baseUrl).href}</loc>`),
      `sitemap contém editorial thin fr${path}`,
    );
  }
  for (const item of TESTED_LEGAL_PAGES) {
    assert(
      sitemap.body.includes(`<loc>${new URL(item.path, baseUrl).href}</loc>`),
      `sitemap sem legal ${item.path}`,
    );
  }
  assert(
    !sitemap.body.includes(`<loc>${new URL("/en-AU/privacy/", baseUrl).href}</loc>`),
    "sitemap contém variante legal en-AU",
  );
  assert(
    !sitemap.body.includes(`<loc>${new URL("/fr-CA/privacy/", baseUrl).href}</loc>`),
    "sitemap contém variante legal fr-CA",
  );
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
    .waitForSelector(LANGUAGE_DETECTION_OVERLAY_SELECTOR, {
      hidden: true,
      timeout: PAGE_TIMEOUT_MS,
    })
    .catch(() => null);
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
  const baseUrl = siteOriginUrl();
  const playUrl = playAppUrl();
  const htmlResults = [];
  for (const item of [...TESTED_LOCALES, ...TESTED_DOWNLOADS_LOCALES]) {
    htmlResults.push(await validateHtml(baseUrl, item));
  }
  const legalResults = [];
  for (const item of TESTED_LEGAL_PAGES) {
    legalResults.push(await validateLegalHtml(baseUrl, item));
  }
  const sitemapRobots = await validateSitemapAndRobots(baseUrl);
  const runtime = await validateRuntimeLanguageSwitch(
    playUrl,
    screenshotPath(),
  );
  const browserLocaleRuntime = await validateRuntimeBrowserLocale(playUrl);
  const timeZoneLocaleRuntime = await validateRuntimeTimeZoneLocale(playUrl);
  const report = {
    checkedAt: new Date().toISOString(),
    baseUrl,
    playUrl,
    localesChecked: TESTED_LOCALES.map((item) => item.locale),
    downloadsLocalesChecked: TESTED_DOWNLOADS_LOCALES.map((item) => item.locale),
    legalLocalesChecked: TESTED_LEGAL_PAGES.map((item) => item.locale),
    hreflangLocales: ALL_HREFLANG_LOCALES,
    htmlResults,
    legalResults,
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
