// tests/e2e/cloudflare-location-language-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from './browserLauncher.js';


const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH =
  "docs/assets/issues/location-consent-auto-locale/evidence/evi-location-consent-auto-locale-location-flow-report.json";
const DEFAULT_SCREENSHOT_PATH =
  "docs/assets/issues/location-consent-auto-locale/evidence/evi-location-consent-auto-locale-location-overlay.png";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const BERLIN_GEOLOCATION = {
  latitude: 52.52,
  longitude: 13.405,
};
const MAX_NAVIGATION_MS = 45000;
const LANGUAGE_LOCATION_CONSENT_STORAGE_KEY =
  "brikaya-language-location-consent";
const LOCALE_DETECTION_STORAGE_KEY = "brikaya-locale-detection";
const LANGUAGE_CHECKBOX_LABEL = "Usar região para sugerir idioma";
const ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const LANGUAGE_DETECTION_OVERLAY_SELECTOR =
  '[data-testid="language-detection-overlay"]';
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const EXPECTED_LOCALE = "de";
const EXPECTED_PATH = "/de/";
const FORBIDDEN_STORED_PATTERN = /latitude|longitude|52\.52|13\.405/i;
const REPORT_JSON_SPACES = 2;

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return (
    process.env.BRIKAYA_LOCATION_LANGUAGE_QA_REPORT || DEFAULT_REPORT_PATH
  );
}

function screenshotPath() {
  return (
    process.env.BRIKAYA_LOCATION_LANGUAGE_QA_SCREENSHOT ||
    DEFAULT_SCREENSHOT_PATH
  );
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearOriginState(page, targetUrl) {
  const client = await page.target().createCDPSession();
  await client.send("Storage.clearDataForOrigin", {
    origin: new URL(targetUrl).origin,
    storageTypes: "all",
  });
  await client.detach();
}

async function clickInputByLabel(page, label) {
  const didClick = await page.evaluate((labelText) => {
    const labels = Array.from(document.querySelectorAll("label"));
    const targetLabel = labels.find((candidate) =>
      candidate.textContent?.includes(labelText),
    );
    const input = targetLabel?.querySelector("input");
    if (!input) return false;

    input.click();
    return true;
  }, label);

  assert(didClick, `Opção não encontrada: ${label}`);
}

async function clickButtonByText(page, label) {
  const didClick = await page.evaluate((buttonLabel) => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.trim() === buttonLabel,
    );
    if (!button) return false;

    button.click();
    return true;
  }, label);

  assert(didClick, `Botão não encontrado: ${label}`);
}

async function run() {
  const targetUrl = publicUrl();
  const origin = new URL(targetUrl).origin;
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions({ extraArgs: ["--no-sandbox", "--disable-setuid-sandbox"] }));
  const page = await browser.newPage();
  const requests = [];
  const failedRequests = [];

  page.on("request", (request) => requests.push(request.url()));
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || "unknown",
    }),
  );

  try {
    await browser
      .defaultBrowserContext()
      .overridePermissions(origin, ["geolocation"]);
    await page.setGeolocation(BERLIN_GEOLOCATION);
    await page.setViewport(VIEWPORT);
    await clearOriginState(page, targetUrl);
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector("canvas", { timeout: MAX_NAVIGATION_MS });
    await clickInputByLabel(page, LANGUAGE_CHECKBOX_LABEL);
    await clickButtonByText(page, ACCEPT_BUTTON_LABEL);
    await page.waitForSelector(LANGUAGE_DETECTION_OVERLAY_SELECTOR, {
      timeout: MAX_NAVIGATION_MS,
    });
    ensureParentDirectory(screenshotPath());
    await page.screenshot({ path: screenshotPath(), fullPage: true });
    await page.waitForSelector(LANGUAGE_DETECTION_OVERLAY_SELECTOR, {
      hidden: true,
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForFunction(
      (expectedLocale, expectedPath) =>
        document.documentElement.lang === expectedLocale &&
        window.location.pathname === expectedPath,
      { timeout: MAX_NAVIGATION_MS },
      EXPECTED_LOCALE,
      EXPECTED_PATH,
    );

    const runtimeState = await page.evaluate(
      ({ locationConsentKey, detectionKey }) => {
        const locationConsent = window.localStorage.getItem(locationConsentKey);
        const localeDetection = window.localStorage.getItem(detectionKey);
        return {
          lang: document.documentElement.lang,
          path: window.location.pathname,
          locationConsent: locationConsent ? JSON.parse(locationConsent) : null,
          localeDetection: localeDetection ? JSON.parse(localeDetection) : null,
          storageSnapshot: JSON.stringify(window.localStorage),
        };
      },
      {
        locationConsentKey: LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
        detectionKey: LOCALE_DETECTION_STORAGE_KEY,
      },
    );

    assert(
      runtimeState.lang === EXPECTED_LOCALE,
      "Idioma por região incorreto.",
    );
    assert(runtimeState.path === EXPECTED_PATH, "Rota por região incorreta.");
    assert(
      runtimeState.locationConsent,
      "Consentimento de região não gravado.",
    );
    assert(
      runtimeState.localeDetection?.source === "location",
      "Origem não é região.",
    );
    assert(
      runtimeState.localeDetection?.locale === EXPECTED_LOCALE,
      "Locale detectado incorreto.",
    );
    assert(
      !FORBIDDEN_STORED_PATTERN.test(JSON.stringify(runtimeState)),
      "Coordenada apareceu em armazenamento local.",
    );

    const externalRequests = requests.filter(
      (requestUrl) => new URL(requestUrl).origin !== origin,
    );
    assert(
      externalRequests.length === 0,
      `Requests externos detectados: ${externalRequests.join(", ")}`,
    );
    assert(
      failedRequests.length === 0,
      `Requests falharam: ${JSON.stringify(failedRequests)}`,
    );

    const report = {
      ok: true,
      publicUrl: targetUrl,
      checkedAt: new Date().toISOString(),
      expectedLocale: EXPECTED_LOCALE,
      expectedPath: EXPECTED_PATH,
      runtimeState,
      externalRequests,
      failedRequests,
      screenshotPath: screenshotPath(),
    };
    ensureParentDirectory(reportPath());
    writeFileSync(
      reportPath(),
      `${JSON.stringify(report, null, REPORT_JSON_SPACES)}\n`,
    );
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
