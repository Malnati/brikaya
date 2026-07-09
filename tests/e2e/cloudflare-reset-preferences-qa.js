// tests/e2e/cloudflare-reset-preferences-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from './browserLauncher.js';


const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-reset-preferences-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-reset-preferences-qa.png";
const QA_RESET_QUERY_KEY = "qaResetPreferences";
const QA_RESET_QUERY_VALUE = "1";
const IPHONE_15_VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MAX_NAVIGATION_MS = 45000;
const MENU_READY_TIMEOUT_MS = 7000;
const MENU_BUTTON_PATTERN = /menu|menú/i;
const RESET_BUTTON_PATTERN =
  /restaurar padrão|restore defaults|restaurar valores/i;
const CONSENT_COPY_PATTERN = /antes de jogar|before playing|antes de jugar/i;
const RESET_CONFIRM_COPY_PATTERN =
  /apaga pontuação|clears score|borra puntuación/i;
const INTERNAL_COPY_PATTERN =
  /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA/i;
const MENU_DRAWER_SELECTOR = "#game-settings-menu";
const PRIVACY_CONSENT_STORAGE_KEY = "brikaya-privacy-consent";
const PRIVACY_CONSENT_VERSION = "2026-07-03-offline-play";
const PRIVACY_CONSENT_SCOPE = "offline_play_privacy_base";
const LANGUAGE_LOCATION_CONSENT_STORAGE_KEY =
  "brikaya-language-location-consent";
const LANGUAGE_LOCATION_CONSENT_VERSION = "2026-07-04-language-location";
const LANGUAGE_LOCATION_CONSENT_SCOPE =
  "approximate_region_language_suggestion";
const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const LOCALE_DETECTION_STORAGE_KEY = "brikaya-locale-detection";
const THEME_STORAGE_KEY = "brikaya-theme";
const THEME_MODE_STORAGE_KEY = "brikaya-theme-mode";
const AUTO_THEME_SEQUENCE_STORAGE_KEY = "brikaya-auto-theme-sequence";
const AUTO_THEME_INDEX_STORAGE_KEY = "brikaya-auto-theme-index";
const IMAGE_SET_STORAGE_KEY = "brikaya-image-set";
const FONT_SET_STORAGE_KEY = "brikaya-font-set";
const AUDIO_STORAGE_MUTED_KEY = "brikaya-audio-muted";
const TEST_SENTINEL_STORAGE_KEY = "brikaya-reset-preferences-sentinel";
const TEST_SENTINEL_STORAGE_VALUE = "must-disappear";
const TEST_SENTINEL_LOG_MESSAGE = "reset-preferences-sentinel-log";
const TEST_SENTINEL_COLLISION_TYPE = "wall";
const SCORE_DB_NAME = "brikaya";
const SCORE_DB_VERSION = 2;
const SCORES_STORE_NAME = "scores";
const HIGH_SCORE_STORE_NAME = "highScore";
const HIGH_SCORE_KEY = "best";
const GAME_LOG_DB_NAME = "BrikayaGameLog";
const GAME_LOG_DB_VERSION = 2;
const GAME_EVENTS_STORE_NAME = "gameEvents";
const COLLISION_DB_NAME = "BrikayaCollisions";
const COLLISION_DB_VERSION = 1;
const COLLISION_STORE_NAME = "collisions";
const DEBUG_LOG_DB_NAME = "SystemDebugLog";
const DEBUG_LOG_DB_VERSION = 1;
const DEBUG_LOG_STORE_NAME = "systemLogs";
const SEEDED_SCORE = 90;
const SEEDED_HIGH_SCORE = 120;

function getPublicUrl() {
  const pageUrl = new URL(process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL);
  pageUrl.searchParams.set(QA_RESET_QUERY_KEY, QA_RESET_QUERY_VALUE);
  return pageUrl.toString();
}

function getReportPath() {
  return process.env.BRIKAYA_RESET_PREFERENCES_QA_REPORT || DEFAULT_REPORT_PATH;
}

function getScreenshotPath() {
  return (
    process.env.BRIKAYA_RESET_PREFERENCES_QA_SCREENSHOT ||
    DEFAULT_SCREENSHOT_PATH
  );
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function writeStore(page, databaseConfig, rows) {
  await page.evaluate(
    ({ config, seedRows }) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(config.dbName, config.dbVersion);
        request.onupgradeneeded = () => {
          const db = request.result;
          for (const storeConfig of config.stores) {
            if (db.objectStoreNames.contains(storeConfig.name)) continue;
            db.createObjectStore(storeConfig.name, storeConfig.options);
          }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(
            config.stores.map((storeConfig) => storeConfig.name),
            "readwrite",
          );

          for (const storeConfig of config.stores) {
            tx.objectStore(storeConfig.name).clear();
          }

          for (const row of seedRows) {
            const store = tx.objectStore(row.storeName);
            if (row.key === undefined) {
              store.add(row.value);
            } else {
              store.put(row.value, row.key);
            }
          }

          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
    {
      config: databaseConfig,
      seedRows: rows,
    },
  );
}

async function seedLocalState(page) {
  await page.evaluate(
    ({
      privacyKey,
      privacyVersion,
      privacyScope,
      locationKey,
      locationVersion,
      locationScope,
      localeKey,
      localeSourceKey,
      localeDetectionKey,
      themeKey,
      themeModeKey,
      autoThemeSequenceKey,
      autoThemeIndexKey,
      imageSetKey,
      fontSetKey,
      audioMutedKey,
      sentinelKey,
      sentinelValue,
    }) => {
      const acceptedAt = new Date().toISOString();
      window.localStorage.setItem(
        privacyKey,
        JSON.stringify({ version: privacyVersion, acceptedAt, scope: privacyScope }),
      );
      window.localStorage.setItem(
        locationKey,
        JSON.stringify({ version: locationVersion, acceptedAt, scope: locationScope }),
      );
      window.localStorage.setItem(localeKey, "es-419");
      window.localStorage.setItem(localeSourceKey, "manual");
      window.localStorage.setItem(localeDetectionKey, sentinelValue);
      window.localStorage.setItem(themeKey, "pixel-sunset");
      window.localStorage.setItem(themeModeKey, "manual");
      window.localStorage.setItem(autoThemeSequenceKey, "[\"pixel-sunset\"]");
      window.localStorage.setItem(autoThemeIndexKey, "0");
      window.localStorage.setItem(imageSetKey, "sunset-cabinet");
      window.localStorage.setItem(fontSetKey, "block-pixel");
      window.localStorage.setItem(audioMutedKey, "0");
      window.localStorage.setItem(sentinelKey, sentinelValue);
    },
    {
      privacyKey: PRIVACY_CONSENT_STORAGE_KEY,
      privacyVersion: PRIVACY_CONSENT_VERSION,
      privacyScope: PRIVACY_CONSENT_SCOPE,
      locationKey: LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
      locationVersion: LANGUAGE_LOCATION_CONSENT_VERSION,
      locationScope: LANGUAGE_LOCATION_CONSENT_SCOPE,
      localeKey: LOCALE_STORAGE_KEY,
      localeSourceKey: LOCALE_SOURCE_STORAGE_KEY,
      localeDetectionKey: LOCALE_DETECTION_STORAGE_KEY,
      themeKey: THEME_STORAGE_KEY,
      themeModeKey: THEME_MODE_STORAGE_KEY,
      autoThemeSequenceKey: AUTO_THEME_SEQUENCE_STORAGE_KEY,
      autoThemeIndexKey: AUTO_THEME_INDEX_STORAGE_KEY,
      imageSetKey: IMAGE_SET_STORAGE_KEY,
      fontSetKey: FONT_SET_STORAGE_KEY,
      audioMutedKey: AUDIO_STORAGE_MUTED_KEY,
      sentinelKey: TEST_SENTINEL_STORAGE_KEY,
      sentinelValue: TEST_SENTINEL_STORAGE_VALUE,
    },
  );

  await writeStore(
    page,
    {
      dbName: SCORE_DB_NAME,
      dbVersion: SCORE_DB_VERSION,
      stores: [
        { name: SCORES_STORE_NAME, options: { autoIncrement: true } },
        { name: HIGH_SCORE_STORE_NAME, options: {} },
      ],
    },
    [
      { storeName: SCORES_STORE_NAME, value: SEEDED_SCORE },
      {
        storeName: HIGH_SCORE_STORE_NAME,
        key: HIGH_SCORE_KEY,
        value: SEEDED_HIGH_SCORE,
      },
    ],
  );

  await writeStore(
    page,
    {
      dbName: GAME_LOG_DB_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      stores: [{ name: GAME_EVENTS_STORE_NAME, options: { keyPath: "id" } }],
    },
    [
      {
        storeName: GAME_EVENTS_STORE_NAME,
        value: { id: "reset-sentinel-event", timestamp: Date.now() },
      },
    ],
  );

  await writeStore(
    page,
    {
      dbName: COLLISION_DB_NAME,
      dbVersion: COLLISION_DB_VERSION,
      stores: [{ name: COLLISION_STORE_NAME, options: { keyPath: "id" } }],
    },
    [
      {
        storeName: COLLISION_STORE_NAME,
        value: {
          id: "reset-sentinel-collision",
          timestamp: Date.now(),
          type: TEST_SENTINEL_COLLISION_TYPE,
        },
      },
    ],
  );

  await writeStore(
    page,
    {
      dbName: DEBUG_LOG_DB_NAME,
      dbVersion: DEBUG_LOG_DB_VERSION,
      stores: [{ name: DEBUG_LOG_STORE_NAME, options: { keyPath: "id" } }],
    },
    [
      {
        storeName: DEBUG_LOG_STORE_NAME,
        value: {
          id: "reset-sentinel-debug",
          timestamp: Date.now(),
          level: "log",
          message: TEST_SENTINEL_LOG_MESSAGE,
          args: [],
        },
      },
    ],
  );
}

async function clearPublishedAppCache(page) {
  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
  });
}

async function clickButtonByPattern(page, pattern) {
  const clicked = await page.evaluate((patternSource) => {
    const buttonPattern = new RegExp(patternSource, "i");
    const targetButton = Array.from(document.querySelectorAll("button")).find(
      (button) => buttonPattern.test(button.textContent || ""),
    );
    if (!targetButton) return false;
    targetButton.click();
    return true;
  }, pattern.source);

  assert(clicked, `Botão não encontrado: ${pattern.source}`);
}

async function openMenu(page) {
  await page.waitForFunction(
    (patternSource) =>
      Array.from(document.querySelectorAll("button")).some((button) =>
        new RegExp(patternSource, "i").test(button.textContent || ""),
      ),
    { timeout: MENU_READY_TIMEOUT_MS },
    MENU_BUTTON_PATTERN.source,
  );
  await clickButtonByPattern(page, MENU_BUTTON_PATTERN);
  await page.waitForSelector(MENU_DRAWER_SELECTOR, {
    timeout: MENU_READY_TIMEOUT_MS,
  });
}

async function clickResetAndAccept(page) {
  let confirmMessage = "";
  page.once("dialog", async (dialog) => {
    confirmMessage = dialog.message();
    await dialog.accept();
  });

  await clickButtonByPattern(page, RESET_BUTTON_PATTERN);
  await page.waitForNavigation({
    waitUntil: "networkidle2",
    timeout: MAX_NAVIGATION_MS,
  });

  return confirmMessage;
}

async function countStore(page, config) {
  return page.evaluate(
    ({ dbName, dbVersion, storeName }) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(storeName, "readonly");
          const countRequest = tx.objectStore(storeName).count();
          countRequest.onsuccess = () => {
            db.close();
            resolve(countRequest.result);
          };
          countRequest.onerror = () => {
            db.close();
            reject(countRequest.error);
          };
        };
      }),
    config,
  );
}

async function collectDebugMessages(page) {
  return page.evaluate(
    ({ dbName, dbVersion, storeName }) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(storeName, "readonly");
          const getAllRequest = tx.objectStore(storeName).getAll();
          getAllRequest.onsuccess = () => {
            db.close();
            resolve(getAllRequest.result.map((row) => row.message || ""));
          };
          getAllRequest.onerror = () => {
            db.close();
            reject(getAllRequest.error);
          };
        };
      }),
    {
      dbName: DEBUG_LOG_DB_NAME,
      dbVersion: DEBUG_LOG_DB_VERSION,
      storeName: DEBUG_LOG_STORE_NAME,
    },
  );
}

async function collectResetState(page) {
  const storageState = await page.evaluate(
    ({
      privacyKey,
      locationKey,
      localeKey,
      localeSourceKey,
      localeDetectionKey,
      themeKey,
      themeModeKey,
      imageSetKey,
      fontSetKey,
      audioMutedKey,
      sentinelKey,
      consentPatternSource,
      internalCopyPatternSource,
    }) => {
      const consentPattern = new RegExp(consentPatternSource, "i");
      const internalCopyPattern = new RegExp(internalCopyPatternSource, "i");
      const bodyText = document.body.textContent || "";

      return {
        privacyConsent: window.localStorage.getItem(privacyKey),
        languageLocationConsent: window.localStorage.getItem(locationKey),
        locale: window.localStorage.getItem(localeKey),
        localeSource: window.localStorage.getItem(localeSourceKey),
        localeDetection: window.localStorage.getItem(localeDetectionKey),
        theme: window.localStorage.getItem(themeKey),
        themeMode: window.localStorage.getItem(themeModeKey),
        imageSet: window.localStorage.getItem(imageSetKey),
        fontSet: window.localStorage.getItem(fontSetKey),
        audioMuted: window.localStorage.getItem(audioMutedKey),
        sentinel: window.localStorage.getItem(sentinelKey),
        hasConsentScreen: consentPattern.test(bodyText),
        bodyHasInternalCopy: internalCopyPattern.test(bodyText),
        path: window.location.pathname,
      };
    },
    {
      privacyKey: PRIVACY_CONSENT_STORAGE_KEY,
      locationKey: LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
      localeKey: LOCALE_STORAGE_KEY,
      localeSourceKey: LOCALE_SOURCE_STORAGE_KEY,
      localeDetectionKey: LOCALE_DETECTION_STORAGE_KEY,
      themeKey: THEME_STORAGE_KEY,
      themeModeKey: THEME_MODE_STORAGE_KEY,
      imageSetKey: IMAGE_SET_STORAGE_KEY,
      fontSetKey: FONT_SET_STORAGE_KEY,
      audioMutedKey: AUDIO_STORAGE_MUTED_KEY,
      sentinelKey: TEST_SENTINEL_STORAGE_KEY,
      consentPatternSource: CONSENT_COPY_PATTERN.source,
      internalCopyPatternSource: INTERNAL_COPY_PATTERN.source,
    },
  );
  const scoreCount = await countStore(page, {
    dbName: SCORE_DB_NAME,
    dbVersion: SCORE_DB_VERSION,
    storeName: SCORES_STORE_NAME,
  });
  const highScoreCount = await countStore(page, {
    dbName: SCORE_DB_NAME,
    dbVersion: SCORE_DB_VERSION,
    storeName: HIGH_SCORE_STORE_NAME,
  });
  const gameEventCount = await countStore(page, {
    dbName: GAME_LOG_DB_NAME,
    dbVersion: GAME_LOG_DB_VERSION,
    storeName: GAME_EVENTS_STORE_NAME,
  });
  const collisionCount = await countStore(page, {
    dbName: COLLISION_DB_NAME,
    dbVersion: COLLISION_DB_VERSION,
    storeName: COLLISION_STORE_NAME,
  });
  const debugMessages = await collectDebugMessages(page);

  return {
    storageState,
    scoreCount,
    highScoreCount,
    gameEventCount,
    collisionCount,
    debugMessages,
  };
}

function externalRequestsFor(targetUrl, requests) {
  const targetOrigin = new URL(targetUrl).origin;
  return requests.filter((requestUrl) => {
    if (requestUrl.startsWith("data:") || requestUrl.startsWith("blob:")) {
      return false;
    }
    return new URL(requestUrl).origin !== targetOrigin;
  });
}

async function run() {
  const targetUrl = getPublicUrl();
  const reportFilePath = getReportPath();
  const screenshotFilePath = getScreenshotPath();
  const requests = [];
  const consoleProblems = [];
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions({ extraArgs: ["--no-sandbox", "--disable-setuid-sandbox"] }));

  try {
    const page = await browser.newPage();
    page.on("request", (request) => requests.push(request.url()));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) => {
      consoleProblems.push({ type: "pageerror", text: error.message });
    });
    await page.setCacheEnabled(false);
    await page.setViewport(IPHONE_15_VIEWPORT);
    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: MAX_NAVIGATION_MS,
    });
    await clearPublishedAppCache(page);
    await seedLocalState(page);
    await page.goto(targetUrl, {
      waitUntil: "networkidle2",
      timeout: MAX_NAVIGATION_MS,
    });
    await openMenu(page);
    const confirmMessage = await clickResetAndAccept(page);
    const state = await collectResetState(page);

    ensureParentDirectory(screenshotFilePath);
    await page.screenshot({ path: screenshotFilePath, fullPage: true });

    const externalRequests = externalRequestsFor(targetUrl, requests);
    const report = {
      url: targetUrl,
      screenshotPath: screenshotFilePath,
      confirmMessage,
      state,
      externalRequests,
      consoleProblems,
    };

    ensureParentDirectory(reportFilePath);
    writeFileSync(reportFilePath, JSON.stringify(report, null, 2));

    assert(
      RESET_CONFIRM_COPY_PATTERN.test(confirmMessage),
      "Confirmação de restauração não apareceu.",
    );
    assert(state.storageState.hasConsentScreen, "Tela inicial não voltou.");
    assert(state.storageState.privacyConsent === null, "Consentimento persistiu.");
    assert(
      state.storageState.languageLocationConsent === null,
      "Consentimento de região persistiu.",
    );
    assert(state.storageState.locale === null, "Idioma manual persistiu.");
    assert(state.storageState.localeSource === null, "Origem de idioma persistiu.");
    assert(
      state.storageState.localeDetection === null,
      "Detecção de idioma persistiu.",
    );
    assert(state.storageState.theme === null, "Tema persistiu.");
    assert(state.storageState.themeMode === null, "Modo de tema persistiu.");
    assert(state.storageState.imageSet === null, "Conjunto de imagem persistiu.");
    assert(state.storageState.fontSet === null, "Fonte persistiu.");
    assert(state.storageState.sentinel === null, "Sentinela local persistiu.");
    assert(state.scoreCount === 0, "Pontuações persistiram.");
    assert(state.highScoreCount === 0, "Recordes persistiram.");
    assert(state.gameEventCount === 0, "Histórico de eventos persistiu.");
    assert(state.collisionCount === 0, "Estatísticas de colisão persistiram.");
    assert(
      !state.debugMessages.includes(TEST_SENTINEL_LOG_MESSAGE),
      "Histórico técnico anterior persistiu.",
    );
    assert(
      !state.storageState.bodyHasInternalCopy,
      "Interface expõe cópia técnica para usuário final.",
    );
    assert(externalRequests.length === 0, "Reset gerou requests externos.");
    assert(consoleProblems.length === 0, "Console publicado contém erros/warnings.");

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
