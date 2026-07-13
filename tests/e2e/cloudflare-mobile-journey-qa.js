// tests/e2e/cloudflare-mobile-journey-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  ACCEPT_BUTTON_LABELS,
  LOCATION_CHECKBOX_LABELS,
  waitForConsentScreen,
} from "./consentSelectors.js";
import {
  acceptPrivacyConsentIfPresent,
  acceptPrivacyConsentIfPresentForScenario,
  clickButtonByText,
  clickInputByLabel,
  LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
  waitForStartupSequenceToFinish,
} from "./consentHelpers.js";
import { launchBrowser, createMobilePage } from "./browserLauncher.js";
import { JOURNEY_PROFILES } from "./mobileBrowserProfiles.js";
import {
  assertConsentScreenScrollable,
  simulateTouchScrollOnConsent,
} from "./scrollHelpers.js";
import {
  clearGameLog,
  clearRuntimeState,
  GAME_LOG_DB_NAME,
  GAME_LOG_DB_VERSION,
  GAME_LOG_STORE_NAME,
  readGameEvents,
  scenarioUrl,
  summarizeEvents,
  summarizeEventsThroughPowerUpActivation,
  summarizeEventsUntilEventCount,
  summarizeEventsUntilFirstEvent,
  waitForEventType,
  withGameplayTelemetry,
} from "./gameLogHelpers.js";
import {
  AD_HOLD_ASSERTION_DELAY_MS,
  assertCondition,
  assertPaddleCollisionPhysics,
  assertPhaseTransition,
  collectLevelToastState,
  completeHeldAd,
  installHeldAdStub,
  installLevelTransitionRecorder,
  LEVEL_TRANSITION_EVENT_NAME,
  observeEvents,
  PADDLE_COLLISION_TIMEOUT_MS,
  COMPONENT_COLLISION_TIMEOUT_MS,
  PHASE_TRANSITION_TIMEOUT_MS,
  waitForComponentCollisions,
  waitForPaddleCollision,
  waitForPowerUpAction,
} from "./journeyAssertionHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-mobile-journey-qa.json";
const MAX_NAVIGATION_MS = 45000;
const OBSERVATION_TIMEOUT_MS = 12000;
const SCENARIO_GAME_START_TIMEOUT_MS = 60000;
const SCENARIO_PADDLE_COLLISION_TIMEOUT_MS = 30000;
const START_MODAL_TEST_ID = "ball-turret-start-modal";
const LEFT_SWITCH_TEST_ID = "ball-turret-switch-left";
const TURRET_START_TITLES = ["Pronto para jogar", "Ready to play"];
const GAME_OVER_TEXT_PATTERN = /fim de jogo|game over/i;
const GOOGLE_REPORT_ONLY_FRAME_ANCESTORS_PATTERN =
  /Framing 'https:\/\/www\.google\.com\/' violates the following report-only Content Security Policy directive: "frame-ancestors 'self'"/;
const EXPECTED_EVASIVE_BLOCK_COUNT = 3;

const SCENARIO_MATRIX = [
  // paddle-collision: coberto por cloudflare-gameplay-basic-qa.js no CI local.
  {
    id: "metal-component",
    label: "colisão com componente metálico",
    kind: "metal-component",
  },
  {
    id: "evasive-components",
    label: "colisão com componente evasivo",
    kind: "evasive-components",
  },
  {
    id: "laser-fan",
    label: "power-up laser",
    kind: "power-up",
    powerUpType: "laser_fan",
    sideEffect: "component_destroyed",
  },
  {
    id: "multiball-power-up",
    label: "power-up multiball",
    kind: "power-up",
    powerUpType: "multiball",
    sideEffect: "ball_added",
  },
  {
    id: "wide-paddle-power-up",
    label: "power-up raquete ampla",
    kind: "power-up",
    powerUpType: "wide_paddle",
  },
  {
    id: "slow-ball-power-up",
    label: "power-up bola lenta",
    kind: "power-up",
    powerUpType: "slow_ball",
  },
  {
    id: "single-component-phase-clear",
    label: "transição de dificuldade fase 1→2",
    kind: "phase-transition",
  },
];

function publicUrl() {
  return withGameplayTelemetry(
    process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL,
  );
}

function reportPath() {
  return process.env.BRIKAYA_MOBILE_JOURNEY_QA_REPORT || DEFAULT_REPORT_PATH;
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

const MANIFEST_FETCH_FAILURE_PATTERN =
  /Manifest fetch from .*manifest\.webmanifest failed/i;
const RESOURCE_404_PATTERN =
  /Failed to load resource: the server responded with a status of 404/i;
const VITE_BUNDLE_PATH_PATTERN = /\/assets\/index-[^/\s?]+\.(?:js|css)/i;
const BUNDLE_MIME_FAILURE_PATTERN =
  /Failed to load module script|not a supported stylesheet MIME type/i;

function isIgnorableConsoleProblem(text) {
  if (BUNDLE_MIME_FAILURE_PATTERN.test(text)) {
    return false;
  }

  if (RESOURCE_404_PATTERN.test(text)) {
    if (VITE_BUNDLE_PATH_PATTERN.test(text)) {
      return false;
    }
    return true;
  }

  return (
    GOOGLE_REPORT_ONLY_FRAME_ANCESTORS_PATTERN.test(text) ||
    MANIFEST_FETCH_FAILURE_PATTERN.test(text)
  );
}

async function clearBrowserOriginState(page, targetUrl) {
  const client = await page.target().createCDPSession();
  await client.send("Storage.clearDataForOrigin", {
    origin: new URL(targetUrl).origin,
    storageTypes: "all",
  });
  await client.detach();
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

async function dismissBallTurretStartModalIfVisible(page, profileLabel) {
  const isVisible = await page.evaluate((startModalTestId) => {
    const modal = document.querySelector(
      `[data-testid="${startModalTestId}"]`,
    );
    if (!modal) return false;
    const style = window.getComputedStyle(modal);
    const rect = modal.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }, START_MODAL_TEST_ID);

  if (!isVisible) return;

  await dismissBallTurretStartModal(page, profileLabel);
}

async function dismissBallTurretStartModal(page, profileLabel) {
  const switchHandle = await page.$(`[data-testid="${LEFT_SWITCH_TEST_ID}"]`);
  assertCondition(
    switchHandle,
    `${profileLabel}: interruptor esquerdo da torreta ausente.`,
  );

  const rect = await switchHandle.boundingBox();
  assertCondition(
    rect,
    `${profileLabel}: interruptor esquerdo sem área tocável.`,
  );

  const point = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height * 0.25,
  };

  await switchHandle.evaluate(
    (element, clientPoint) =>
      new Promise((resolve) => {
        const pointerId = 41;
        const dispatchPointer = (type) => {
          element.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              clientX: clientPoint.x,
              clientY: clientPoint.y,
              pointerId,
              pointerType: "touch",
              isPrimary: true,
            }),
          );
        };

        dispatchPointer("pointerdown");
        window.setTimeout(() => {
          dispatchPointer("pointerup");
          resolve(undefined);
        }, 180);
      }),
    point,
  );
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 220));

  await page.waitForFunction(
    (startModalTestId) => {
      const modal = document.querySelector(
        `[data-testid="${startModalTestId}"]`,
      );
      if (!modal) return true;
      const style = window.getComputedStyle(modal);
      const modalRect = modal.getBoundingClientRect();
      return (
        style.display === "none" ||
        style.visibility === "hidden" ||
        modalRect.width === 0 ||
        modalRect.height === 0
      );
    },
    { timeout: 10000 },
    START_MODAL_TEST_ID,
  );
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

  await waitForConsentScreen(page, MAX_NAVIGATION_MS);

  const scroll = await assertConsentScreenScrollable(page, profile.label);
  const touchScroll = await simulateTouchScrollOnConsent(page);
  await clickInputByLabel(page, LOCATION_CHECKBOX_LABELS);

  const locationConsentBeforeAccept = await page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, LANGUAGE_LOCATION_CONSENT_STORAGE_KEY);
  assertCondition(
    !locationConsentBeforeAccept,
    `${profile.label}: consentimento de região gravado antes do aceite.`,
  );

  await clickButtonByText(page, ACCEPT_BUTTON_LABELS);
  await waitForStartupSequenceToFinish(page);
  await page.waitForSelector('.consent-screen, [data-testid="consent-screen"]', {
    hidden: true,
    timeout: MAX_NAVIGATION_MS,
  });

  const locationConsentAfterAccept = await page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, LANGUAGE_LOCATION_CONSENT_STORAGE_KEY);
  assertCondition(
    locationConsentAfterAccept,
    `${profile.label}: consentimento de região não foi gravado.`,
  );

  await waitForCanvas(page);

  return { scroll, touchScroll };
}

async function runTorretaStart(page, profile) {
  await page.goto(scenarioUrl(publicUrl(), "ball-turret"), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);

  await page.waitForFunction(
    (startModalTestId) => {
      const modal = document.querySelector(
        `[data-testid="${startModalTestId}"]`,
      );
      if (!modal) return false;
      const style = window.getComputedStyle(modal);
      const rect = modal.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    },
    { timeout: 15000 },
    START_MODAL_TEST_ID,
  );

  const startModalCopy = await page.$eval(
    `[data-testid="${START_MODAL_TEST_ID}"]`,
    (modal) => {
      const strong = modal.querySelector("strong");
      return (
        strong?.textContent?.trim() ||
        modal.getAttribute("aria-label")?.trim() ||
        ""
      );
    },
  );
  assertCondition(
    TURRET_START_TITLES.some((title) => startModalCopy.includes(title)),
    `${profile.label}: modal inicial da torreta sem título esperado.`,
  );

  await dismissBallTurretStartModal(page, profile.label);

  await waitForEventType(page, "game_start", 15000);
  const events = await readGameEvents(page);
  const summary = summarizeEvents(events);
  assertCondition(
    (summary.game_start || 0) >= 1,
    `${profile.label}: jogo da torreta não iniciou (${JSON.stringify(summary)}).`,
  );

  return { eventSummary: summary, startModalCopy };
}

async function waitForRipCinematicVisible(page, timeoutMs) {
  return page
    .waitForFunction(
      () => {
        const overlay = document.querySelector(
          '[data-testid="game-cinematic-overlay"][data-cinematic-type="rip"]',
        );
        const ripComposition = document.querySelector(
          '[data-testid="game-cinematic-rip-composition"]',
        );
        const overlayRect = overlay?.getBoundingClientRect();
        const ripRect = ripComposition?.getBoundingClientRect();
        return Boolean(
          overlayRect &&
            ripRect &&
            overlayRect.width > 0 &&
            overlayRect.height > 0 &&
            ripRect.width > 0 &&
            ripRect.height > 0,
        );
      },
      { timeout: timeoutMs },
    )
    .then(() => true)
    .catch(() => false);
}

async function runTorretaLose(page, profile) {
  await page.goto(scenarioUrl(publicUrl(), "ball-turret-lose"), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);
  await dismissBallTurretStartModal(page, profile.label);

  const ripVisiblePromise = waitForRipCinematicVisible(page, 25000);
  await waitForEventType(page, "game_end", 20000);
  const ripVisible = await ripVisiblePromise;

  const gameOverVisible = await page.evaluate((patternSource) => {
    const pattern = new RegExp(patternSource, "i");
    return pattern.test(document.body.innerText || "");
  }, GAME_OVER_TEXT_PATTERN.source);

  const events = await readGameEvents(page);
  const summary = summarizeEvents(events);
  assertCondition(
    (summary.game_end || 0) >= 1,
    `${profile.label}: derrota não registrada (${JSON.stringify(summary)}).`,
  );
  assertCondition(ripVisible, `${profile.label}: cinemática RIP não ficou visível.`);
  assertCondition(
    gameOverVisible,
    `${profile.label}: tela de fim de jogo não ficou visível.`,
  );

  return { eventSummary: summary, ripVisible, gameOverVisible };
}

async function runFirstAd(page, profile) {
  await page.goto(scenarioUrl(publicUrl(), "single-component-phase3-clear"), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await installLevelTransitionRecorder(page);
  await installHeldAdStub(page);
  await acceptPrivacyConsentIfPresent(page);
  await waitForCanvas(page);

  await page.waitForFunction(
    () => window.__BRIKAYA_TEST_AD_STATE__?.active === true,
    { timeout: 30000 },
  );
  await new Promise((resolveDelay) =>
    setTimeout(resolveDelay, AD_HOLD_ASSERTION_DELAY_MS),
  );

  const transitionsBeforeFinish = await page.evaluate(
    () => window.__BRIKAYA_LEVEL_TRANSITIONS__ || [],
  );
  const adStateBeforeFinish = await page.evaluate(
    () => window.__BRIKAYA_TEST_AD_STATE__ || null,
  );
  const eventsBeforeFinish = await readGameEvents(page);
  const summaryBeforeFinish = summarizeEvents(eventsBeforeFinish);

  assertCondition(
    transitionsBeforeFinish.some(
      (event) => event.phase === "start" && event.currentLevel === 3,
    ),
    `${profile.label}: transição 3→4 não iniciou.`,
  );
  assertCondition(
    !transitionsBeforeFinish.some((event) => event.phase === "finish"),
    `${profile.label}: fase seguinte iniciou antes do fim do anúncio.`,
  );
  assertCondition(
    (adStateBeforeFinish?.requests?.length || 0) >= 1,
    `${profile.label}: primeiro anúncio entre fases não foi solicitado.`,
  );
  assertCondition(
    adStateBeforeFinish?.requests?.[0]?.name === "brikaya_level_3_to_4",
    `${profile.label}: placement do anúncio inesperado.`,
  );
  assertCondition(
    (summaryBeforeFinish.level_complete || 0) >= 1,
    `${profile.label}: fase 3 não concluiu antes do anúncio.`,
  );

  const completion = await completeHeldAd(page, profile.label);
  const events = await readGameEvents(page);
  const summary = summarizeEvents(events);
  const levelStart = events.filter((event) => event.type === "level_start").at(-1);

  assertCondition(
    levelStart?.metadata?.level === 4,
    `${profile.label}: fase 4 não iniciou após anúncio.`,
  );
  assertCondition(
    completion.adState?.doneCalls === 1,
    `${profile.label}: adBreakDone não foi chamado uma vez.`,
  );

  return {
    eventSummary: summary,
    transitions: completion.transitions,
    adRequests: completion.adState?.requests || [],
    promptText: completion.promptText,
  };
}

async function assertNoGameEnd(summary, profileLabel, scenarioLabel) {
  assertCondition(
    (summary.game_end || 0) === 0,
    `${profileLabel} [${scenarioLabel}]: fim de jogo inesperado (${JSON.stringify(summary)}).`,
  );
}

async function prepareScenarioPage(page, profile, scenarioId) {
  await clearGameLog(page);
  await page.goto(scenarioUrl(publicUrl(), scenarioId), {
    waitUntil: "domcontentloaded",
    timeout: MAX_NAVIGATION_MS,
  });
  await acceptPrivacyConsentIfPresentForScenario(page);
  await waitForCanvas(page);
  await dismissBallTurretStartModalIfVisible(page, profile.label);
  await waitForEventType(page, "game_start", SCENARIO_GAME_START_TIMEOUT_MS);
}

async function runScenarioCheck(page, profile, scenarioCheck) {
  await prepareScenarioPage(page, profile, scenarioCheck.id);

  if (scenarioCheck.dismissTurretModal) {
    await dismissBallTurretStartModal(page, profile.label);
  }

  let details = {};

  if (scenarioCheck.kind === "paddle-collision") {
    let paddleCollision = null;
    let eventsAtCollision = [];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (attempt > 0) {
        await prepareScenarioPage(page, profile, scenarioCheck.id);
      }

      const observation = await waitForPaddleCollision(
        page,
        SCENARIO_PADDLE_COLLISION_TIMEOUT_MS,
      );
      paddleCollision = observation.paddleCollision;
      eventsAtCollision = observation.events;

      if (paddleCollision) break;
    }

    assertPaddleCollisionPhysics(paddleCollision, profile.label);
    const summaryAtCollision = summarizeEvents(eventsAtCollision);
    assertCondition(
      (summaryAtCollision.game_start || 0) >= 1,
      `${profile.label} [${scenarioCheck.label}]: game_start ausente.`,
    );
    await assertNoGameEnd(
      summaryAtCollision,
      profile.label,
      scenarioCheck.label,
    );
    details = {
      collisionInfo: paddleCollision.collisionInfo,
      eventSummary: summaryAtCollision,
    };
  } else if (scenarioCheck.kind === "metal-component") {
    await waitForComponentCollisions(page, 1);
    await waitForEventType(page, "component_destroyed", OBSERVATION_TIMEOUT_MS);
    const events = await readGameEvents(page);
    const fullSummary = summarizeEvents(events);
    const summaryAtDestroy = summarizeEventsUntilFirstEvent(
      events,
      "component_destroyed",
    );
    assertCondition(
      (fullSummary.component_destroyed || 0) >= 1,
      `${profile.label} [${scenarioCheck.label}]: component_destroyed ausente.`,
    );
    await assertNoGameEnd(summaryAtDestroy, profile.label, scenarioCheck.label);
    details = { eventSummary: fullSummary };
  } else if (scenarioCheck.kind === "evasive-components") {
    await waitForComponentCollisions(page, EXPECTED_EVASIVE_BLOCK_COUNT);
    await page.waitForFunction(
      async ({ dbName, storeName, dbVersion, expectedCount }) => {
        const events = await new Promise((resolveEvents) => {
          const request = indexedDB.open(dbName, dbVersion);
          request.onerror = () => resolveEvents([]);
          request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
              db.close();
              resolveEvents([]);
              return;
            }
            const tx = db.transaction([storeName], "readonly");
            const store = tx.objectStore(storeName);
            const allRequest = store.getAll();
            allRequest.onsuccess = () => {
              db.close();
              resolveEvents(allRequest.result || []);
            };
            allRequest.onerror = () => {
              db.close();
              resolveEvents([]);
            };
          };
        });

        return (
          events.filter((event) => event.type === "component_destroyed").length >=
          expectedCount
        );
      },
      { timeout: COMPONENT_COLLISION_TIMEOUT_MS },
      {
        dbName: GAME_LOG_DB_NAME,
        storeName: GAME_LOG_STORE_NAME,
        dbVersion: GAME_LOG_DB_VERSION,
        expectedCount: EXPECTED_EVASIVE_BLOCK_COUNT,
      },
    );
    await waitForEventType(page, "level_complete", COMPONENT_COLLISION_TIMEOUT_MS).catch(
      () => undefined,
    );
    await waitForEventType(page, "level_start", COMPONENT_COLLISION_TIMEOUT_MS).catch(
      () => undefined,
    );
    const events = await readGameEvents(page);
    const fullSummary = summarizeEvents(events);
    const summaryAtDestroy = summarizeEventsUntilEventCount(
      events,
      "component_destroyed",
      EXPECTED_EVASIVE_BLOCK_COUNT,
    );
    assertCondition(
      (fullSummary.component_destroyed || 0) >= EXPECTED_EVASIVE_BLOCK_COUNT,
      `${profile.label} [${scenarioCheck.label}]: blocos evasivos insuficientes.`,
    );
    await assertNoGameEnd(summaryAtDestroy, profile.label, scenarioCheck.label);
    details = { eventSummary: fullSummary };
  } else if (scenarioCheck.kind === "power-up") {
    const activation = await waitForPowerUpAction(
      page,
      scenarioCheck.powerUpType,
      "activate",
    );
    const events = await readGameEvents(page);
    const fullSummary = summarizeEvents(events);
    const activationSummary = summarizeEventsThroughPowerUpActivation(
      events,
      scenarioCheck.powerUpType,
    );
    assertCondition(
      (fullSummary.game_start || 0) >= 1,
      `${profile.label} [${scenarioCheck.label}]: game_start ausente.`,
    );
    assertCondition(
      activation?.metadata?.powerUpType === scenarioCheck.powerUpType,
      `${profile.label} [${scenarioCheck.label}]: power-up incorreto.`,
    );

    if (scenarioCheck.sideEffect === "component_destroyed") {
      assertCondition(
        (fullSummary.component_destroyed || 0) >= 1,
        `${profile.label} [${scenarioCheck.label}]: component_destroyed ausente.`,
      );
    }

    if (scenarioCheck.sideEffect === "ball_added") {
      assertCondition(
        (fullSummary.ball_added || 0) >= 1,
        `${profile.label} [${scenarioCheck.label}]: ball_added ausente.`,
      );
    }

    if (scenarioCheck.powerUpType === "slow_ball") {
      assertCondition(
        activation?.metadata?.speedState,
        `${profile.label} [${scenarioCheck.label}]: speedState ausente após slow_ball.`,
      );
    }

    await assertNoGameEnd(activationSummary, profile.label, scenarioCheck.label);
    details = {
      eventSummary: fullSummary,
      activationEventSummary: activationSummary,
      powerUpMetadata: activation?.metadata ?? null,
    };
  } else if (scenarioCheck.kind === "phase-transition") {
    await waitForEventType(page, "level_complete", PHASE_TRANSITION_TIMEOUT_MS);
    await page.waitForSelector('[data-testid="level-toast"]', {
      timeout: PHASE_TRANSITION_TIMEOUT_MS,
    });
    const toastState = await collectLevelToastState(page);
    await waitForEventType(page, "level_start", PHASE_TRANSITION_TIMEOUT_MS);
    const events = await readGameEvents(page);
    const phaseDetails = await assertPhaseTransition(page, events, profile.label, {
      fromLevel: 1,
      toLevel: 2,
      expectedSpeedMultiplier: 1.12,
      initialToastState: toastState,
    });
    const summary = summarizeEvents(events);
    details = { eventSummary: summary, phaseTransition: phaseDetails };
  } else {
    const summary = await observeEvents(page, OBSERVATION_TIMEOUT_MS);
    details = { eventSummary: summary };
  }

  return { scenario: scenarioCheck.id, ...details };
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
    for (const scenarioCheck of SCENARIO_MATRIX) {
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
    for (const profile of JOURNEY_PROFILES) {
      profileResults.push(
        await runProfile(browser, profile, targetUrl, consoleProblems),
      );
    }

    assertCondition(
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
