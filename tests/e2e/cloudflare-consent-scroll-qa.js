// tests/e2e/cloudflare-consent-scroll-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { launchBrowser, createMobilePage } from "./browserLauncher.js";
import { CONSENT_SCROLL_PROFILES } from "./mobileBrowserProfiles.js";
import {
  assertConsentScreenScrollable,
  readConsentScrollMetrics,
} from "./scrollHelpers.js";
import { clearRuntimeState } from "./gameLogHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-consent-scroll-qa.json";
const MAX_NAVIGATION_MS = 45000;
const CONSENT_DIALOG_NAME = "Antes de jogar";
const ACCEPT_BUTTON_LABEL = "Aceitar e jogar";

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_CONSENT_SCROLL_QA_REPORT || DEFAULT_REPORT_PATH;
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

async function runProfile(browser, profile, targetUrl) {
  const page = await createMobilePage(browser, profile);

  try {
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
    await page.waitForSelector('[data-testid="consent-screen"]', {
      timeout: MAX_NAVIGATION_MS,
    });

    const dialogText = await page.evaluate(
      () => document.querySelector('[role="dialog"]')?.textContent || "",
    );
    assert(
      dialogText.includes(CONSENT_DIALOG_NAME),
      `${profile.label}: título de consentimento ausente.`,
    );

    const scrollResult = await assertConsentScreenScrollable(
      page,
      profile.label,
    );
    const finalMetrics = await readConsentScrollMetrics(page);

    return {
      profile: profile.name,
      label: profile.label,
      engine: profile.engine,
      viewport: profile.viewport,
      scrollResult,
      finalMetrics,
      acceptButtonLabel: ACCEPT_BUTTON_LABEL,
      ok: true,
    };
  } finally {
    await page.close();
  }
}

async function run() {
  const targetUrl = publicUrl();
  const browser = await launchBrowser();
  const profileResults = [];

  try {
    for (const profile of CONSENT_SCROLL_PROFILES) {
      profileResults.push(await runProfile(browser, profile, targetUrl));
    }

    const report = {
      ok: true,
      publicUrl: targetUrl,
      checkedAt: new Date().toISOString(),
      profiles: profileResults,
    };
    ensureParentDirectory(reportPath());
    writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  ensureParentDirectory(reportPath());
  writeFileSync(
    reportPath(),
    `${JSON.stringify(
      {
        ok: false,
        publicUrl: publicUrl(),
        error: error.message,
        checkedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
  console.error(error);
  process.exit(1);
});
