// tests/e2e/cloudflare-orientation-lock-qa.js
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";

import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/play/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-orientation-lock-qa.json";
const DEFAULT_SCREENSHOT_DIR = "tmp/screenshots/orientation-lock";
const RESPONSIVE_VIEWPORT_MATRIX_PATH = new URL(
  "./responsiveViewportMatrix.json",
  import.meta.url,
);
const CHROME_LOW_RESOURCE_ARGS = [
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-component-update",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-gpu",
  "--disable-renderer-backgrounding",
  "--disable-software-rasterizer",
  "--hide-scrollbars",
  "--mute-audio",
  "--renderer-process-limit=2",
];
const MAX_QA_DEVICE_SCALE_FACTOR = 1;
const ORIENTATION_BLOCKER_SELECTOR =
  '[data-testid="mobile-orientation-blocker"]';
const BALL_TURRET_JOYSTICK_SELECTOR = '[data-testid="ball-turret-joystick"]';
const EXPECTED_MESSAGE = "Você precisa de espaço para o joystick";
const IMMERSIVE_ROOT_CLASS = "bb-landscape-immersive";
const MENU_BUTTON_PATTERN = /menu/i;
const BROWSER_CLOSE_TIMEOUT_MS = 3000;
const BROWSER_CLOSE_TIMEOUT_MESSAGE = "browser close timeout";
const BROWSER_KILL_SIGNAL = "SIGKILL";
const BROWSER_CLOSE_SETTLE_MS = 250;
const VIEWPORTS = JSON.parse(
  readFileSync(RESPONSIVE_VIEWPORT_MATRIX_PATH, "utf8"),
).viewports;

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_ORIENTATION_LOCK_QA_REPORT || DEFAULT_REPORT_PATH;
}

function screenshotDir() {
  return (
    process.env.BRIKAYA_ORIENTATION_LOCK_QA_SCREENSHOT_DIR ||
    DEFAULT_SCREENSHOT_DIR
  );
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function viewportByName(name) {
  const viewport = VIEWPORTS.find((candidate) => candidate.name === name);
  assert(viewport, `Viewport ${name} ausente.`);
  return viewport;
}

function viewportByRole(role) {
  const viewport = VIEWPORTS.find(
    (candidate) => candidate.screenshotRole === role,
  );
  assert(viewport, `Viewport com screenshotRole ${role} ausente.`);
  return viewport;
}

function puppeteerViewport(viewport) {
  return {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: Math.min(
      viewport.deviceScaleFactor,
      MAX_QA_DEVICE_SCALE_FACTOR,
    ),
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
  };
}

function screenshotPath(name) {
  return `${screenshotDir()}/evi-${name}.png`;
}

function withQuery(targetUrl, params = {}) {
  const url = new URL(targetUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function launchQaBrowser() {
  return puppeteer.launch(
    buildPuppeteerLaunchOptions({
      extraArgs: [
        "--no-first-run",
        "--no-default-browser-check",
        ...CHROME_LOW_RESOURCE_ARGS,
      ],
    }),
  );
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  try {
    await Promise.race([
      browser.close(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(BROWSER_CLOSE_TIMEOUT_MESSAGE)),
          BROWSER_CLOSE_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch {
    browser.disconnect();
  }
  if (
    browserProcess &&
    browserProcess.exitCode === null &&
    !browserProcess.killed
  ) {
    browserProcess.kill(BROWSER_KILL_SIGNAL);
  }
  await new Promise((resolve) => setTimeout(resolve, BROWSER_CLOSE_SETTLE_MS));
}

async function clearOriginState(page, origin) {
  const client = await page.target().createCDPSession();
  try {
    await client.send("Storage.clearDataForOrigin", {
      origin,
      storageTypes: "all",
    });
  } finally {
    await client.detach();
  }
}

async function gotoCleanOrigin(page, targetUrl, origin) {
  await clearOriginState(page, origin);
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
}

async function createQaPage(browser, consoleProblems) {
  const page = await browser.newPage();
  page.on("console", (message) => {
    if (["error", "warn"].includes(message.type())) {
      consoleProblems.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push({ type: "pageerror", text: error.message }),
  );
  return page;
}

async function collectState(page, label) {
  return page.evaluate(
    ({ blockerSelector, immersiveRootClass, label }) => {
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

      const blocker = document.querySelector(blockerSelector);
      const blockerStyle = blocker ? getComputedStyle(blocker) : null;
      const canvas = document.querySelector("canvas");

      return {
        label,
        url: window.location.href,
        title: document.title,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
        },
        maxTouchPoints: navigator.maxTouchPoints || 0,
        pointerCoarse:
          window.matchMedia?.("(pointer: coarse)").matches || false,
        hoverNone: window.matchMedia?.("(hover: none)").matches || false,
        heading: document.querySelector("h1")?.textContent || "",
        blocker: blocker
          ? {
              text: blocker.textContent?.trim() || "",
              ariaLabel: blocker.getAttribute("aria-label") || "",
              role: blocker.getAttribute("role") || "",
              rect: rectOf(blocker),
              display: blockerStyle?.display || "",
              pointerEvents: blockerStyle?.pointerEvents || "",
            }
          : null,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth,
        hasLandscapeImmersiveClass:
          document.documentElement.classList.contains(immersiveRootClass),
        canvas: rectOf(canvas),
        hasBallTurretJoystick: Boolean(
          document.querySelector('[data-testid="ball-turret-joystick"]'),
        ),
      };
    },
    {
      blockerSelector: ORIENTATION_BLOCKER_SELECTOR,
      immersiveRootClass: IMMERSIVE_ROOT_CLASS,
      label,
    },
  );
}

function assertBlockerVisible(state) {
  assert(state.blocker, `${state.label}: bloqueio portrait ausente.`);
  assert(
    state.blocker.text.includes(EXPECTED_MESSAGE),
    `${state.label}: mensagem incorreta: ${state.blocker.text}`,
  );
  assert(
    state.blocker.ariaLabel === EXPECTED_MESSAGE,
    `${state.label}: aria-label incorreto.`,
  );
  assert(
    state.blocker.role === "alertdialog",
    `${state.label}: role de alerta ausente.`,
  );
  assert(
    state.blocker.pointerEvents !== "none",
    `${state.label}: overlay não bloqueia toque.`,
  );
  assert(
    state.blocker.rect &&
      state.blocker.rect.width >= state.viewport.width - 2 &&
      state.blocker.rect.height >= state.viewport.height - 2,
    `${state.label}: overlay não cobre viewport inteira.`,
  );
  assert(
    !state.hasLandscapeImmersiveClass,
    `${state.label}: modo landscape imersivo ainda foi aplicado.`,
  );
  assert(
    !state.hasHorizontalOverflow,
    `${state.label}: overlay gerou overflow horizontal.`,
  );
}

function assertBlockerAbsent(state) {
  assert(
    !state.blocker,
    `${state.label}: bloqueio portrait apareceu indevido.`,
  );
  assert(
    !state.hasHorizontalOverflow,
    `${state.label}: houve overflow horizontal.`,
  );
}

async function clickMenu(page) {
  const clicked = await page.evaluate(
    ({ source, flags }) => {
      const matcher = new RegExp(source, flags);
      const button = Array.from(document.querySelectorAll("button")).find(
        (candidate) =>
          matcher.test(
            candidate.textContent || candidate.getAttribute("aria-label") || "",
          ),
      );
      if (!(button instanceof HTMLElement)) return false;
      button.click();
      return true;
    },
    { source: MENU_BUTTON_PATTERN.source, flags: MENU_BUTTON_PATTERN.flags },
  );
  assert(clicked, "Botão Menu não foi encontrado.");
}

async function readEventCountsSince(page, minTimestamp) {
  return page.evaluate(async (timestamp) => {
    async function readEvents() {
      return new Promise((resolve) => {
        const request = indexedDB.open("BrikayaGameLog", 2);
        request.onerror = () => resolve([]);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("gameEvents")) {
            db.close();
            resolve([]);
            return;
          }

          const transaction = db.transaction(["gameEvents"], "readonly");
          const store = transaction.objectStore("gameEvents");
          const allRequest = store.getAll();
          allRequest.onerror = () => {
            db.close();
            resolve([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolve(allRequest.result || []);
          };
        };
      });
    }

    const events = (await readEvents()).filter(
      (event) => event.timestamp >= timestamp,
    );
    const byType = events.reduce((accumulator, event) => {
      accumulator[event.type] = (accumulator[event.type] || 0) + 1;
      return accumulator;
    }, {});

    return { count: events.length, byType };
  }, minTimestamp);
}

async function waitForBlocker(page) {
  await page.waitForSelector(ORIENTATION_BLOCKER_SELECTOR, {
    timeout: 10000,
  });
}

async function waitForNoBlocker(page) {
  await page.waitForSelector(ORIENTATION_BLOCKER_SELECTOR, {
    hidden: true,
    timeout: 10000,
  });
}

async function run() {
  const targetUrl = publicUrl();
  const parsed = new URL(targetUrl);
  const outReportPath = reportPath();
  ensureParentDirectory(outReportPath);
  mkdirSync(resolve(screenshotDir()), { recursive: true });

  const mobilePortrait = viewportByRole("mobile-default");
  const mobileLandscape = viewportByRole("landscape-default");
  const tabletPortrait = viewportByRole("tablet-default");
  const tabletLandscape = viewportByName("ipad-11-a16-air-default-landscape");
  const desktopLandscape = viewportByRole("desktop-default");
  const consoleProblems = [];
  const results = [];
  const screenshots = {};
  const browser = await launchQaBrowser();

  try {
    const page = await createQaPage(browser, consoleProblems);
    await page.setViewport(puppeteerViewport(mobilePortrait));
    await gotoCleanOrigin(page, targetUrl, parsed.origin);
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await waitForNoBlocker(page);
    const mobilePortraitState = await collectState(page, "mobile portrait");
    assertBlockerAbsent(mobilePortraitState);
    results.push(mobilePortraitState);
    screenshots.mobilePortrait = screenshotPath("mobile-portrait");
    await page.screenshot({ path: screenshots.mobilePortrait });

    const orientationStartedAt = Date.now();
    await page.setViewport(puppeteerViewport(mobileLandscape));
    await waitForBlocker(page);
    const mobileLandscapeState = await collectState(page, "mobile landscape");
    assertBlockerVisible(mobileLandscapeState);
    results.push(mobileLandscapeState);
    screenshots.mobileLandscape = screenshotPath("mobile-landscape-blocked");
    await page.screenshot({ path: screenshots.mobileLandscape });
    await page.mouse.click(
      Math.round(mobileLandscape.width / 2),
      Math.round(mobileLandscape.height / 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const landscapeEvents = await readEventCountsSince(
      page,
      orientationStartedAt,
    );
    assert(
      (landscapeEvents.byType.game_start || 0) === 0,
      "Rotação para landscape registrou novo game_start.",
    );
    assert(
      (landscapeEvents.byType.restart_game || 0) === 0,
      "Rotação para landscape registrou restart_game.",
    );

    await page.setViewport(puppeteerViewport(mobilePortrait));
    await waitForNoBlocker(page);
    const mobileReturnState = await collectState(
      page,
      "mobile return portrait",
    );
    assertBlockerAbsent(mobileReturnState);
    results.push(mobileReturnState);
    screenshots.mobileReturn = screenshotPath("mobile-return-portrait");
    await page.screenshot({ path: screenshots.mobileReturn });
    const returnEvents = await readEventCountsSince(page, orientationStartedAt);
    assert(
      (returnEvents.byType.game_start || 0) === 0,
      "Retorno para portrait registrou novo game_start.",
    );
    assert(
      (returnEvents.byType.restart_game || 0) === 0,
      "Retorno para portrait registrou restart_game.",
    );

    await page.setViewport(puppeteerViewport(tabletPortrait));
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForNoBlocker(page);
    const tabletPortraitState = await collectState(page, "tablet portrait");
    assertBlockerAbsent(tabletPortraitState);
    results.push(tabletPortraitState);
    screenshots.tabletPortrait = screenshotPath("tablet-portrait");
    await page.screenshot({ path: screenshots.tabletPortrait });

    await page.setViewport(puppeteerViewport(tabletLandscape));
    await waitForBlocker(page);
    const tabletLandscapeState = await collectState(page, "tablet landscape");
    assertBlockerVisible(tabletLandscapeState);
    results.push(tabletLandscapeState);
    screenshots.tabletLandscape = screenshotPath("tablet-landscape-blocked");
    await page.screenshot({ path: screenshots.tabletLandscape });

    await page.setViewport(puppeteerViewport(desktopLandscape));
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForNoBlocker(page);
    const desktopLandscapeState = await collectState(page, "desktop landscape");
    assertBlockerAbsent(desktopLandscapeState);
    results.push(desktopLandscapeState);
    screenshots.desktopLandscape = screenshotPath("desktop-landscape");
    await page.screenshot({ path: screenshots.desktopLandscape });

    await page.setViewport(puppeteerViewport(mobilePortrait));
    await page.goto(withQuery(targetUrl, { qaScenario: "ball-turret" }), {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForSelector(BALL_TURRET_JOYSTICK_SELECTOR, {
      timeout: 10000,
    });
    await page.setViewport(puppeteerViewport(mobileLandscape));
    await waitForBlocker(page);
    const ballTurretLandscapeState = await collectState(
      page,
      "ball turret mobile landscape",
    );
    assertBlockerVisible(ballTurretLandscapeState);
    assert(
      ballTurretLandscapeState.hasBallTurretJoystick,
      "Modo torreta não expôs joystick para validar o bloqueio.",
    );
    results.push(ballTurretLandscapeState);
    screenshots.ballTurretLandscape = screenshotPath(
      "ball-turret-mobile-landscape-blocked",
    );
    await page.screenshot({ path: screenshots.ballTurretLandscape });

    await page.setViewport(puppeteerViewport(mobilePortrait));
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("canvas", { timeout: 30000 });
    await waitForNoBlocker(page);
    await clickMenu(page);
    await page.waitForSelector(".settings-drawer", { timeout: 10000 });
    await page.setViewport(puppeteerViewport(mobileLandscape));
    await waitForBlocker(page);
    const menuLandscapeState = await collectState(
      page,
      "menu mobile landscape",
    );
    assertBlockerVisible(menuLandscapeState);
    results.push(menuLandscapeState);
    screenshots.menuLandscape = screenshotPath("menu-mobile-landscape-blocked");
    await page.screenshot({ path: screenshots.menuLandscape });

    const relevantConsoleProblems = consoleProblems.filter(
      (problem) => !/favicon|manifest/i.test(problem.text),
    );
    assert(
      relevantConsoleProblems.length === 0,
      `Console com problemas: ${JSON.stringify(relevantConsoleProblems)}`,
    );

    const report = {
      url: targetUrl,
      generatedAt: new Date().toISOString(),
      expectedMessage: EXPECTED_MESSAGE,
      screenshots,
      results,
      orientationEvents: {
        landscape: landscapeEvents,
        return: returnEvents,
      },
      consoleProblems,
    };
    writeFileSync(outReportPath, JSON.stringify(report, null, 2));
    console.log(`cloudflare-orientation-lock-qa ok: ${outReportPath}`);
  } finally {
    await closeBrowser(browser);
  }
}

run().catch((error) => {
  console.error("cloudflare-orientation-lock-qa failed", error);
  process.exitCode = 1;
});
