// tests/e2e/cloudflare-consent-screen-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import {
  PRIVACY_CONSENT_STORAGE_KEY,
  acceptPrivacyConsentIfPresent,
} from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-consent-screen-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-consent-screen-qa.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MAX_NAVIGATION_MS = 45000;
const REQUIRED_CONSENT_SCOPE = "offline_play_privacy_base";
const REQUIRED_CONSENT_VERSION = "2026-07-03-offline-play";
const CONSENT_DIALOG_NAME = "Antes de jogar";
const ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const MENU_BUTTON_LABEL = "Menu";
const REVIEW_BUTTON_LABEL = "Revisar consentimento";
const REGION_LANGUAGE_TEXT = "região aproximada";
const FORBIDDEN_USER_COPY_PATTERN =
  /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA|CMP|AdSense|H5|adsbygoogle/i;
const FORBIDDEN_CONSENT_FIELDS = [
  "country",
  "ip",
  "account",
  "metrics",
  "email",
  "userId",
  "ads",
];

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_CONSENT_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotPath() {
  return (
    process.env.BRIKAYA_CONSENT_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH
  );
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clearBrowserOriginState(page, targetUrl) {
  const client = await page.target().createCDPSession();
  await client.send("Storage.clearDataForOrigin", {
    origin: new URL(targetUrl).origin,
    storageTypes: "all",
  });
  await client.detach();
}

async function clearRuntimeState(page) {
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      );
    }

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName)),
      );
    }

    window.localStorage.clear();
    window.sessionStorage.clear();

    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases
          .map((database) => database.name)
          .filter(Boolean)
          .map(
            (databaseName) =>
              new Promise((resolveDelete) => {
                const request = indexedDB.deleteDatabase(databaseName);
                request.onsuccess = resolveDelete;
                request.onerror = resolveDelete;
                request.onblocked = resolveDelete;
              }),
          ),
      );
    }
  });
}

async function clickButtonByText(page, label) {
  const didClick = await page.evaluate((buttonLabel) => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) =>
        candidate.textContent?.trim() === buttonLabel ||
        candidate.textContent?.includes(buttonLabel),
    );

    if (!button) return false;

    button.click();
    return true;
  }, label);

  assert(didClick, `Botão não encontrado: ${label}`);
}

async function collectConsentState(page) {
  return page.evaluate(
    ({ storageKey, forbiddenCopySource, acceptButtonLabel }) => {
      const forbiddenCopyPattern = new RegExp(forbiddenCopySource, "i");
      const storedValue = window.localStorage.getItem(storageKey);
      let storedRecord = null;

      try {
        storedRecord = storedValue ? JSON.parse(storedValue) : null;
      } catch {
        storedRecord = null;
      }

      const bodyText = document.body.innerText || "";
      const dialog = document.querySelector('[role="dialog"]');
      const acceptButton = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === acceptButtonLabel,
      );
      const cinematicOverlay = document.querySelector(
        '[data-testid="game-cinematic-overlay"]',
      );

      return {
        hasDialog: Boolean(dialog),
        dialogText: dialog?.textContent || "",
        hasAcceptButton: Boolean(acceptButton),
        acceptButtonText: acceptButton?.textContent?.trim() || "",
        hasCinematicOverlay: Boolean(cinematicOverlay),
        bodyHasForbiddenCopy: forbiddenCopyPattern.test(bodyText),
        storedRecord,
        storedKeys: storedRecord ? Object.keys(storedRecord) : [],
      };
    },
    {
      storageKey: PRIVACY_CONSENT_STORAGE_KEY,
      forbiddenCopySource: FORBIDDEN_USER_COPY_PATTERN.source,
      acceptButtonLabel: ACCEPT_BUTTON_LABEL,
    },
  );
}

async function run() {
  const targetUrl = publicUrl();
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(["--no-sandbox", "--disable-setuid-sandbox"]),
  });
  const page = await browser.newPage();
  const requests = [];
  const failedRequests = [];

  page.on("request", (request) => {
    requests.push(request.url());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || "unknown",
    });
  });

  try {
    await page.setViewport(VIEWPORT);
    await clearBrowserOriginState(page, targetUrl);
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await clearRuntimeState(page);
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector("canvas", { timeout: MAX_NAVIGATION_MS });

    const firstVisitState = await collectConsentState(page);
    ensureParentDirectory(screenshotPath());
    await page.screenshot({ path: screenshotPath(), fullPage: true });

    assert(firstVisitState.hasDialog, "Tela de consentimento não apareceu.");
    assert(
      firstVisitState.dialogText.includes(CONSENT_DIALOG_NAME),
      "Título da tela de consentimento ausente.",
    );
    assert(
      firstVisitState.hasAcceptButton &&
        firstVisitState.acceptButtonText === ACCEPT_BUTTON_LABEL,
      "CTA de aceite ausente.",
    );
    assert(
      firstVisitState.dialogText.includes(REGION_LANGUAGE_TEXT),
      "Texto de região para idioma ausente.",
    );
    assert(
      !firstVisitState.hasCinematicOverlay,
      "Contagem iniciou antes do aceite.",
    );
    assert(
      !firstVisitState.bodyHasForbiddenCopy,
      "Tela de consentimento expõe termo técnico interno.",
    );

    await acceptPrivacyConsentIfPresent(page);
    const acceptedState = await collectConsentState(page);

    assert(
      !acceptedState.hasDialog,
      "Tela de consentimento persistiu após aceite.",
    );
    assert(acceptedState.storedRecord, "Aceite não foi gravado no aparelho.");
    assert(
      acceptedState.storedRecord.version === REQUIRED_CONSENT_VERSION,
      "Versão de consentimento inválida.",
    );
    assert(
      acceptedState.storedRecord.scope === REQUIRED_CONSENT_SCOPE,
      "Escopo de consentimento inválido.",
    );
    assert(
      Number.isFinite(Date.parse(acceptedState.storedRecord.acceptedAt)),
      "Data de aceite inválida.",
    );
    assert(
      acceptedState.storedKeys.length === 3 &&
        acceptedState.storedKeys.every((key) =>
          ["version", "acceptedAt", "scope"].includes(key),
        ),
      `Campos extras no aceite: ${JSON.stringify(acceptedState.storedKeys)}`,
    );
    assert(
      !acceptedState.storedKeys.some((key) =>
        FORBIDDEN_CONSENT_FIELDS.includes(key),
      ),
      "Aceite contém campo não permitido.",
    );

    await page.reload({
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector("canvas", { timeout: MAX_NAVIGATION_MS });
    const savedVisitState = await collectConsentState(page);
    assert(!savedVisitState.hasDialog, "Aceite salvo reapresentou a tela.");

    await clickButtonByText(page, MENU_BUTTON_LABEL);
    await clickButtonByText(page, REVIEW_BUTTON_LABEL);
    const revokedState = await collectConsentState(page);

    assert(revokedState.hasDialog, "Tela não reapareceu após revisão.");
    assert(!revokedState.storedRecord, "Aceite permaneceu salvo após revisão.");
    assert(
      !revokedState.hasCinematicOverlay,
      "Contagem reiniciou após revogar consentimento.",
    );

    const externalRequests = requests.filter(
      (requestUrl) => new URL(requestUrl).origin !== new URL(targetUrl).origin,
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
      firstVisitState,
      acceptedState,
      savedVisitState,
      revokedState,
      externalRequests,
      failedRequests,
      screenshotPath: screenshotPath(),
    };
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
