// scripts/capture-menu-version-screenshot.mjs
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer";

import { buildPuppeteerLaunchOptions } from "../tests/e2e/browserLauncher.js";
import { acceptPrivacyConsentIfPresent } from "../tests/e2e/consentHelpers.js";

const PUBLIC_URL = process.env.BRIKAYA_PUBLIC_URL || "http://127.0.0.1:7979/";
const OUTPUT_PATH =
  process.env.BRIKAYA_MENU_VERSION_SCREENSHOT ||
  "docs/assets/issues/menu-version-vn-fix/evidence/evi-menu-version-v146.png";

async function run() {
  mkdirSync("docs/assets/issues/menu-version-vn-fix/evidence", {
    recursive: true,
  });

  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions());
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(PUBLIC_URL, { waitUntil: "networkidle0", timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await page.click(".dashboard-menu-button");
    await page.waitForSelector(".settings-drawer__version");
    await page.screenshot({ path: OUTPUT_PATH, fullPage: false });
    console.log(`Screenshot salvo em ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

run();
