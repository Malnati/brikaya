// tests/e2e/browserLauncher.js
import { existsSync } from "node:fs";

import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";

const DEFAULT_LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox"];

const CHROME_EXECUTABLE_CANDIDATES = [
  process.env.BRIKAYA_CHROME_EXECUTABLE,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

export function resolveChromeExecutablePath() {
  for (const candidate of CHROME_EXECUTABLE_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export function buildPuppeteerLaunchOptions(options = {}) {
  const executablePath = resolveChromeExecutablePath();
  const launchOptions = {
    headless: options.headless ?? "new",
    args: buildChromeLaunchArgs([
      ...DEFAULT_LAUNCH_ARGS,
      ...(options.extraArgs ?? []),
    ]),
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
  }

  if (options.userDataDir) {
    launchOptions.userDataDir = options.userDataDir;
  }

  return launchOptions;
}

export async function launchBrowser(options = {}) {
  return puppeteer.launch(buildPuppeteerLaunchOptions(options));
}

export async function createMobilePage(browser, profile) {
  const page = await browser.newPage();

  if (profile.userAgent) {
    await page.setUserAgent(profile.userAgent);
  }

  await page.setViewport(profile.viewport);

  if (profile.locale) {
    await page.setExtraHTTPHeaders({
      "Accept-Language": profile.locale,
    });
  }

  return page;
}
