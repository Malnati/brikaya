// tests/e2e/cloudflare-mobile-journey-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";
import { launchBrowser, createMobilePage } from "./browserLauncher.js";
import { MOBILE_BROWSER_PROFILES } from "./mobileBrowserProfiles.js";
import {
  assertConsentScreenScrollable,
} from "./scrollHelpers.js";
import {
  clearRuntimeState,
  readGameEvents,
  scenarioUrl,
  summarizeEvents,
  waitForEventType,
} from "./gameLogHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-mobile-journey-qa.json";
const MAX_NAVIGATION_MS = 45000;
const OBSERVATION_TIMEOUT_MS = 12000;
const OBSERVATION_STEP_MS = 200;
const AD_HOLD_ASSERTION_DELAY_MS = 2200;
const LEVEL_TRANSITION_EVENT_NAME = "brikaya:level-transition";
const LANGUAGE_CHECKBOX_LABEL = "Usar região para sugerir idioma";
const ACCEPT_BUTTON_LABEL = "Aceitar e jogar";
const LANGUAGE_LOCATION_CONSENT_STORAGE_KEY =
  "brikaya-language-location-consent";
const START_MODAL_TEST_ID = "ball-turret-start-modal";
const LEFT_SWITCH_TEST_ID = "ball-turret-switch-left";
const GAME_OVER_TEXT_PATTERN = /fim de jogo|game over/i;
const GOOGLE_REPORT_ONLY_FRAME_ANCESTORS_PATTERN =
  /Framing 'https:\/\/www\.google\.com\/' violates the following report-only Content Security Policy directive: "frame-ancestors 'self'"/;

const SCENARIO_CHECKS = [
  {
    id: "paddle-collision",
    label: "colisão com raquete",
    required: ["game_start"],
    forbidden: ["game_end"],
    collisionType: "paddle",
  },
  {
    id: "metal-block",
    label: "colisão com tijolo metálico",
    required: ["game_start", "brick_destroyed"],
    forbidden: ["game_end"],
  },
  {
    id: "evasive-blocks",
    label: "colisão com tijolo evasivo",
    required: ["game_start", "brick_destroyed"],
    forbidden: ["game_end"],
  },
  {
    id: "laser-fan",
    label: "power-up laser",
    required: ["game_start", "power_up"],
    forbidden: ["game_end"],
  },
  {
    id: "single-brick-phase-clear",
    label: "transição de dificuldade fase 1→2",
    required: ["level_complete", "level_start"],
    forbidden: ["game_end"],
    expectLevel: 2,
  },
];

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_MOBILE_JOURNEY_QA_REPORT || DEFAULT_REPORT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isIgnorableConsoleProblem(text) {
  return GOOGLE_REPORT_ONLY_FRAME_ANCESTORS_PATTERN.test(text);
}

async function clearBrowserOriginState(page, targetUrl) {
  const client = await page.target().createCDPSession();
  await client.send("Storage.clearDataForOrigin", {
    origin: new URL(targetUrl).origin,
    storageTypes: "all",
  });
  await client.detach();
}

async function clickInputByLabel(page, label) {
  const didClick = await page.evaluate((labelText) => {
    const targetLabel = Array.from(document.querySelectorAll("label")).find(
      (candidate) => candidate.textContent?.includes(labelText),
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

async function waitForCanvas(page) {
  await page.waitForSelector("canvas", { timeout: MAX_NAVIGATION_MS });
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector("canvas");
      const rect = canvas?.getBoundingClientRect();
      return Boolean(rect && rect.width > 0 && rect.height > 0);
    },
    { timeout: 10000 },
  );
}

async function dismissBallTurretStartModal(page, profileLabel) {
  const switchHandle = await page.$(`[data-testid="${LEFT_SWITCH_TEST_ID}"]`);
  assert(switchHandle, `${profileLabel}: interruptor esquerdo da torreta ausente.`);

  const rect = await switchHandle.boundingBox();
  assert(rect, `${profileLabel}: interruptor esquerdo sem área tocável.`);

  const tapX = rect.x + rect.width / 2;
  const tapY = rect.y + rect.height / 2;
  await page.touchscreen.tap(tapX, tapY);
  await new Promise((resolve) => setTimeout(resolve, 180));

  await page.waitForFunction(
    (startModalTestId) => {
      const modal = document.querySelector(
        `[data-testid="${startModalTestId}"]`,
      );
      if (!modal) return true;
      const style = window.getComputedStyle(modal);
      const rect = modal.getBoundingClientRect();
      return (
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width === 0 ||
        rect.height === 0
      );
    },
    { timeout: 5000 },
    START_MODAL_TEST_ID,
  );
}

async function observeEvents(page, timeoutMs = OBSERVATION_TIMEOUT_MS) {
  const startedAt = Date.now();
  let latestSummary = {};

  while (Date.now() - startedAt < timeoutMs) {
    const events = await readGameEvents(page);
    latestSummary = summarizeEvents(events);
    await new Promise((resolve) => setTimeout(resolve, OBSERVATION_STEP_MS));
  }

  return latestSummary;
}

async function runColdLoadAndConsent(page, profile, targetUrl) {
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

  const scroll = await assertConsentScreenScrollable(page, profile.label);
  await clickInputByLabel(page, LANGUAGE_CHECKBOX_LABEL);

  const locationConsentBeforeAccept = await page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, LANGUAGE_LOCATION_CONSENT_STORAGE_KEY);
  assert(
    !locationConsentBeforeAccept,
    `${profile.label}: consentimento de região gravado antes do aceite.`,
  );

  await clickButtonByText(page, ACCEPT_BUTTON_LABEL);
  await page.waitForSelector('[data-testid="consent-screen"]', {
    hidden: true,
    timeout: MAX_NAVIGATION_MS,
  });

  const locationConsentAfterAccept = await page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, LANGUAGE_LOCATION_CONSENT_STORAGE_KEY);
  assert(
    locationConsentAfterAccept,
    `${profile.label}: consentimento de região não foi gravado.`,
  );

  await waitForCanvas(page);

  return { scroll };
}

async function runTorretaStart(page, profile) {
  await page.goto(scenarioUrl(publicUrl(), "ball-turret"), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);

  const startModalVisible = await page.evaluate((startModalTestId) => {
    const modal = document.querySelector(`[data-testid="${startModalTestId}"]`);
    const rect = modal?.getBoundingClientRect();
    const style = modal ? window.getComputedStyle(modal) : null;
    return Boolean(
      modal &&
        style?.display !== "none" &&
        style?.visibility !== "hidden" &&
        rect &&
        rect.width > 0 &&
        rect.height > 0,
    );
  }, START_MODAL_TEST_ID);

  assert(
    startModalVisible,
    `${profile.label}: modal inicial da torreta não apareceu.`,
  );

  await dismissBallTurretStartModal(page, profile.label);

  const events = await readGameEvents(page);
  const summary = summarizeEvents(events);
  assert(
    (summary.game_start || 0) >= 1,
    `${profile.label}: jogo da torreta não iniciou (${JSON.stringify(summary)}).`,
  );

  return { eventSummary: summary };
}

async function runTorretaLose(page, profile) {
  await page.goto(scenarioUrl(publicUrl(), "ball-turret-lose"), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);
  await dismissBallTurretStartModal(page, profile.label);

  await waitForEventType(page, "game_end", 15000);
  const gameOverVisible = await page.evaluate((patternSource) => {
    const pattern = new RegExp(patternSource, "i");
    const canvas = document.querySelector("canvas");
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return false;
    return pattern.test(document.body.innerText || "");
  }, GAME_OVER_TEXT_PATTERN.source);

  const events = await readGameEvents(page);
  const summary = summarizeEvents(events);
  assert(
    (summary.game_end || 0) >= 1,
    `${profile.label}: derrota não registrada (${JSON.stringify(summary)}).`,
  );
  assert(
    gameOverVisible,
    `${profile.label}: tela de fim de jogo não ficou visível.`,
  );

  return { eventSummary: summary, gameOverVisible };
}

async function installLevelTransitionRecorder(page) {
  await page.evaluate((eventName) => {
    window.__BRIKAYA_LEVEL_TRANSITIONS__ = [];
    window.addEventListener(eventName, (event) => {
      window.__BRIKAYA_LEVEL_TRANSITIONS__.push(event.detail);
    });
  }, LEVEL_TRANSITION_EVENT_NAME);
}

async function installHeldAdStub(page) {
  await page.evaluate(() => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    window.__BRIKAYA_TEST_AD_STATE__ = {
      active: false,
      afterCalls: 0,
      beforeCalls: 0,
      configs: [],
      doneCalls: 0,
      requests: [],
    };

    window.adConfig = (config) => {
      window.__BRIKAYA_TEST_AD_STATE__.configs.push(config);
    };

    window.adBreak = (placement) => {
      const state = window.__BRIKAYA_TEST_AD_STATE__;
      state.requests.push({ type: placement.type, name: placement.name });
      state.active = true;
      placement.beforeAd?.();
      state.beforeCalls += 1;

      state.finish = () => {
        if (!state.active) return;
        state.active = false;
        placement.afterAd?.();
        state.afterCalls += 1;
        placement.adBreakDone?.({ breakStatus: "viewed" });
        state.doneCalls += 1;
      };
    };
  });
}

async function runFirstAd(page, profile) {
  await installLevelTransitionRecorder(page);
  await installHeldAdStub(page);
  await page.goto(scenarioUrl(publicUrl(), "single-brick-phase3-clear"), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);

  await page.waitForFunction(
    () => window.__BRIKAYA_TEST_AD_STATE__?.active === true,
    { timeout: 30000 },
  );
  await new Promise((resolve) => setTimeout(resolve, AD_HOLD_ASSERTION_DELAY_MS));

  const transitions = await page.evaluate(
    () => window.__BRIKAYA_LEVEL_TRANSITIONS__ || [],
  );
  const adState = await page.evaluate(
    () => window.__BRIKAYA_TEST_AD_STATE__ || null,
  );
  const events = await readGameEvents(page);
  const summary = summarizeEvents(events);

  assert(
    transitions.some(
      (event) => event.phase === "start" && event.fromLevel === 3,
    ),
    `${profile.label}: transição 3→4 não iniciou.`,
  );
  assert(
    (adState?.requests?.length || 0) >= 1,
    `${profile.label}: primeiro anúncio entre fases não foi solicitado.`,
  );
  assert(
    (summary.level_complete || 0) >= 1,
    `${profile.label}: fase 3 não concluiu antes do anúncio.`,
  );

  if (adState?.active) {
    await page.evaluate(() => {
      window.__BRIKAYA_TEST_AD_STATE__?.finish?.();
    });
  }

  return {
    eventSummary: summary,
    transitions,
    adRequests: adState?.requests || [],
    adDoneCalls: adState?.doneCalls || 0,
  };
}

async function runScenarioCheck(page, profile, scenarioCheck) {
  await page.goto(scenarioUrl(publicUrl(), scenarioCheck.id), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);

  if (scenarioCheck.id === "ball-turret" || scenarioCheck.id === "ball-turret-lose") {
    await dismissBallTurretStartModal(page, profile.label);
  }

  const summary = await observeEvents(page);

  for (const requiredType of scenarioCheck.required) {
    assert(
      (summary[requiredType] || 0) >= 1,
      `${profile.label} [${scenarioCheck.label}]: evento ${requiredType} ausente (${JSON.stringify(summary)}).`,
    );
  }

  for (const forbiddenType of scenarioCheck.forbidden) {
    assert(
      (summary[forbiddenType] || 0) === 0,
      `${profile.label} [${scenarioCheck.label}]: evento inesperado ${forbiddenType} (${JSON.stringify(summary)}).`,
    );
  }

  if (scenarioCheck.expectLevel) {
    const events = await readGameEvents(page);
    const levelStart = events
      .filter((event) => event.type === "level_start")
      .at(-1);
    assert(
      levelStart?.level === scenarioCheck.expectLevel,
      `${profile.label} [${scenarioCheck.label}]: fase ${scenarioCheck.expectLevel} não iniciou.`,
    );
  }

  return { scenario: scenarioCheck.id, eventSummary: summary };
}

async function runProfile(browser, profile, targetUrl, consoleProblems) {
  const page = await createMobilePage(browser, profile);

  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" && !isIgnorableConsoleProblem(text)) {
      consoleProblems.push({ profile: profile.name, text });
    }
  });

  try {
    const coldLoad = await runColdLoadAndConsent(page, profile, targetUrl);
    const torretaStart = await runTorretaStart(page, profile);
    const torretaLose = await runTorretaLose(page, profile);
    const firstAd = await runFirstAd(page, profile);

    const scenarioResults = [];
    for (const scenarioCheck of SCENARIO_CHECKS) {
      scenarioResults.push(await runScenarioCheck(page, profile, scenarioCheck));
    }

    return {
      profile: profile.name,
      label: profile.label,
      engine: profile.engine,
      ok: true,
      coldLoad,
      torretaStart,
      torretaLose,
      firstAd,
      scenarioResults,
    };
  } finally {
    await page.close();
  }
}

async function run() {
  const targetUrl = publicUrl();
  const browser = await launchBrowser();
  const consoleProblems = [];
  const profileResults = [];

  try {
    for (const profile of MOBILE_BROWSER_PROFILES) {
      profileResults.push(
        await runProfile(browser, profile, targetUrl, consoleProblems),
      );
    }

    assert(
      consoleProblems.length === 0,
      `Console com problemas: ${JSON.stringify(consoleProblems)}`,
    );

    const report = {
      ok: true,
      publicUrl: targetUrl,
      checkedAt: new Date().toISOString(),
      profiles: profileResults,
      consoleProblems,
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
