// tests/e2e/cloudflare-gameplay-basic-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";
import { buildPuppeteerLaunchOptions } from './browserLauncher.js';

import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-gameplay-basic-qa.json";
const DEFAULT_SCREENSHOT_PATH = "tmp/screenshots/cloudflare-gameplay-basic-qa.png";
const VIEWPORT = {
  width: 393,
  height: 852,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};
const MAX_NAVIGATION_MS = 45000;
const OBSERVATION_TIMEOUT_MS = 7000;
const OBSERVATION_STEP_MS = 200;
const PADDLE_COLLISION_TIMEOUT_MS = 10000;
const MIN_TOUCH_TARGET_SIZE = 44;
const REQUIRED_EVENT_TYPES = ["game_start", "brick_destroyed", "score_update"];
const FORBIDDEN_EVENT_TYPES = ["restart_game", "game_end"];
const SCORE_PROGRESS_QA_SCENARIO = "single-brick-phase-clear";
const PADDLE_COLLISION_QA_SCENARIO = "paddle-collision";
const PADDLE_COLLISION_TYPE = "paddle";
const REQUIRED_BUTTON_PATTERNS = [/menu/i, /reiniciar/i];
const SCORE_TEXT_PATTERN = /Score\s+(\d+)/;
const CANVAS_SELECTOR = "canvas";
const INTERNAL_COPY_PATTERN =
  /service worker|cache|runtime|dataset|localStorage|IndexedDB|PWA/i;

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return (
    process.env.BRIKAYA_GAMEPLAY_BASIC_QA_REPORT || DEFAULT_REPORT_PATH
  );
}

function screenshotPath() {
  return (
    process.env.BRIKAYA_GAMEPLAY_BASIC_QA_SCREENSHOT ||
    DEFAULT_SCREENSHOT_PATH
  );
}

function scenarioUrl(baseUrl, scenario) {
  const url = new URL(baseUrl);
  url.searchParams.set("qaScenario", scenario);

  return url.toString();
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
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
              new Promise((resolve) => {
                const request = indexedDB.deleteDatabase(databaseName);
                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
                request.onblocked = () => resolve(false);
              }),
          ),
      );
    }
  });
}

async function readEvents(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
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
            const events = allRequest.result || [];
            db.close();
            resolve(events);
          };
        };
      }),
  );
}

async function collectGameplayState(page) {
  return page.evaluate(
    ({ minTouchTargetSize, internalCopyPatternSource, scorePatternSource }) => {
      const internalCopyPattern = new RegExp(internalCopyPatternSource, "i");
      const scorePattern = new RegExp(scorePatternSource);
      const canvas = document.querySelector("canvas");
      const canvasRect = canvas?.getBoundingClientRect();
      const scoreHud = document.querySelector(".score-hud");
      const scoreHudText = scoreHud?.textContent || "";
      const score = Number(scoreHudText.match(scorePattern)?.[1] || 0);
      const buttons = Array.from(document.querySelectorAll("button")).map(
        (button) => {
          const rect = button.getBoundingClientRect();
          return {
            text: button.textContent?.trim() || "",
            ariaLabel: button.getAttribute("aria-label") || "",
            title: button.getAttribute("title") || "",
            width: rect.width,
            height: rect.height,
            visibleInViewport:
              rect.left >= 0 &&
              rect.top >= 0 &&
              rect.right <= window.innerWidth &&
              rect.bottom <= window.innerHeight,
            hasTouchTarget:
              rect.width >= minTouchTargetSize && rect.height >= minTouchTargetSize,
          };
        },
      );

      return {
        title: document.title,
        heading: document.querySelector("h1")?.textContent || "",
        hasCanvas: Boolean(canvas),
        canvas: canvasRect
          ? {
              x: canvasRect.x,
              y: canvasRect.y,
              width: canvasRect.width,
              height: canvasRect.height,
              right: canvasRect.right,
              bottom: canvasRect.bottom,
            }
          : null,
        scoreHudText,
        score,
        buttons,
        bodyHasInternalCopy: internalCopyPattern.test(
          document.body.textContent || "",
        ),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
        },
      };
    },
    {
      minTouchTargetSize: MIN_TOUCH_TARGET_SIZE,
      internalCopyPatternSource: INTERNAL_COPY_PATTERN.source,
      scorePatternSource: SCORE_TEXT_PATTERN.source,
    },
  );
}

async function exerciseInput(page) {
  const canvasHandle = await page.$(CANVAS_SELECTOR);
  const canvasBox = await canvasHandle?.boundingBox();

  if (!canvasBox) return;

  await page.mouse.move(canvasBox.x + canvasBox.width * 0.25, canvasBox.y + canvasBox.height * 0.9);
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.75, canvasBox.y + canvasBox.height * 0.9);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
}

async function waitForGameplayProgress(page) {
  const startedAt = Date.now();
  let lastState = await collectGameplayState(page);
  let lastEvents = await readEvents(page);

  while (Date.now() - startedAt < OBSERVATION_TIMEOUT_MS) {
    await exerciseInput(page);
    lastState = await collectGameplayState(page);
    lastEvents = await readEvents(page);
    const eventTypes = lastEvents.map((event) => event?.type).filter(Boolean);
    const hasRequiredEvents = REQUIRED_EVENT_TYPES.every((eventType) =>
      eventTypes.includes(eventType),
    );

    if (lastState.score > 0 && hasRequiredEvents) {
      return { state: lastState, events: lastEvents };
    }

    await new Promise((resolve) => setTimeout(resolve, OBSERVATION_STEP_MS));
  }

  return { state: lastState, events: lastEvents };
}

async function waitForPaddleCollision(page) {
  const startedAt = Date.now();
  let lastEvents = await readEvents(page);

  while (Date.now() - startedAt < PADDLE_COLLISION_TIMEOUT_MS) {
    lastEvents = await readEvents(page);
    const paddleCollision = lastEvents.find(
      (event) =>
        event?.type === "collision" &&
        event?.collisionInfo?.type === PADDLE_COLLISION_TYPE,
    );

    if (paddleCollision) {
      return { events: lastEvents, paddleCollision };
    }

    await new Promise((resolve) => setTimeout(resolve, OBSERVATION_STEP_MS));
  }

  return { events: lastEvents, paddleCollision: null };
}

function summarizeEvents(events) {
  return events.reduce((summary, event) => {
    const eventType = event?.type;
    if (!eventType) return summary;
    summary[eventType] = (summary[eventType] || 0) + 1;
    return summary;
  }, {});
}

async function run() {
  const targetUrl = publicUrl();
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions({ extraArgs: ["--no-sandbox", "--disable-setuid-sandbox"] }));
  const page = await browser.newPage();
  const requests = [];
  const failedRequests = [];
  const consoleProblems = [];

  page.on("request", (request) => requests.push(request.url()));
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || "unknown",
    });
  });
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleProblems.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    consoleProblems.push({ type: "pageerror", text: error.message });
  });

  try {
    await page.setViewport(VIEWPORT);
    const progressUrl = scenarioUrl(targetUrl, SCORE_PROGRESS_QA_SCENARIO);
    await page.goto(progressUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await clearRuntimeState(page);
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector(CANVAS_SELECTOR, { timeout: MAX_NAVIGATION_MS });
    await acceptPrivacyConsentIfPresent(page);

    const { state, events } = await waitForGameplayProgress(page);
    const eventSummary = summarizeEvents(events);
    const eventTypes = Object.keys(eventSummary);
    const visibleButtons = state.buttons.filter((button) => button.visibleInViewport);
    let externalRequests = requests.filter(
      (requestUrl) => new URL(requestUrl).origin !== new URL(targetUrl).origin,
    );

    await page.screenshot({ path: screenshotPath(), fullPage: true });

    assert(state.hasCanvas, "Canvas não apareceu no gameplay básico.");
    assert(state.canvas?.width > 0 && state.canvas?.height > 0, "Canvas sem área útil.");
    assert(state.score > 0, `Score não avançou: ${state.scoreHudText}`);
    assert(
      REQUIRED_EVENT_TYPES.every((eventType) => eventTypes.includes(eventType)),
      `Eventos obrigatórios ausentes: ${JSON.stringify(eventSummary)}`,
    );
    assert(
      FORBIDDEN_EVENT_TYPES.every((eventType) => !eventTypes.includes(eventType)),
      `Evento proibido no fluxo básico: ${JSON.stringify(eventSummary)}`,
    );
    assert(
      REQUIRED_BUTTON_PATTERNS.every((pattern) =>
        visibleButtons.some((button) =>
          pattern.test(`${button.text} ${button.ariaLabel} ${button.title}`),
        ),
      ),
      `Controles básicos ausentes: ${JSON.stringify(visibleButtons)}`,
    );
    assert(
      visibleButtons.every((button) => button.hasTouchTarget),
      `Botão visível menor que 44px: ${JSON.stringify(visibleButtons)}`,
    );
    assert(!state.bodyHasInternalCopy, "Interface expõe termo técnico interno.");
    assert(externalRequests.length === 0, `Requests externos: ${externalRequests.join(", ")}`);
    assert(failedRequests.length === 0, `Requests falharam: ${JSON.stringify(failedRequests)}`);
    assert(consoleProblems.length === 0, `Console com problemas: ${JSON.stringify(consoleProblems)}`);

    await clearRuntimeState(page);
    await page.goto(scenarioUrl(targetUrl, PADDLE_COLLISION_QA_SCENARIO), {
      waitUntil: "networkidle0",
      timeout: MAX_NAVIGATION_MS,
    });
    await page.waitForSelector(CANVAS_SELECTOR, { timeout: MAX_NAVIGATION_MS });
    await acceptPrivacyConsentIfPresent(page);
    const paddleRegression = await waitForPaddleCollision(page);
    const paddleEventSummary = summarizeEvents(paddleRegression.events);
    const paddleCollision = paddleRegression.paddleCollision;
    assert(paddleCollision, `Colisão com raquete não registrada: ${JSON.stringify(paddleEventSummary)}`);
    assert(
      paddleCollision.collisionInfo.velocityBefore.dy > 0,
      `Bolinha não estava saindo antes da raquete: ${JSON.stringify(paddleCollision.collisionInfo.velocityBefore)}`,
    );
    assert(
      paddleCollision.collisionInfo.velocityAfter.dy < 0,
      `Bolinha não voltou após raquete: ${JSON.stringify(paddleCollision.collisionInfo.velocityAfter)}`,
    );
    assert(
      (paddleEventSummary.ball_lost || 0) === 0,
      `Bolinha perdida apesar da raquete: ${JSON.stringify(paddleEventSummary)}`,
    );
    assert(
      (paddleEventSummary.game_end || 0) === 0,
      `Fim de jogo apesar da raquete: ${JSON.stringify(paddleEventSummary)}`,
    );
    externalRequests = requests.filter(
      (requestUrl) => new URL(requestUrl).origin !== new URL(targetUrl).origin,
    );
    assert(externalRequests.length === 0, `Requests externos: ${externalRequests.join(", ")}`);
    assert(failedRequests.length === 0, `Requests falharam: ${JSON.stringify(failedRequests)}`);
    assert(consoleProblems.length === 0, `Console com problemas: ${JSON.stringify(consoleProblems)}`);

    const report = {
      ok: true,
      publicUrl: targetUrl,
      progressUrl,
      checkedAt: new Date().toISOString(),
      state,
      eventSummary,
      eventTypes,
      externalRequests,
      failedRequests,
      consoleProblems,
      paddleCollisionRegression: {
        eventSummary: paddleEventSummary,
        collisionInfo: paddleCollision.collisionInfo,
      },
      screenshotPath: screenshotPath(),
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
