import {
  findEventsByType,
  GAME_LOG_DB_NAME,
  GAME_LOG_DB_VERSION,
  GAME_LOG_STORE_NAME,
  getLevelComplete,
  readGameEvents,
  summarizeEvents,
} from "./gameLogHelpers.js";

export const PADDLE_COLLISION_TYPE = "paddle";
export const COMPONENT_COLLISION_TYPE = "component";
export const LEVEL_TRANSITION_EVENT_NAME = "brikaya:level-transition";
export const OBSERVATION_STEP_MS = 200;
export const PADDLE_COLLISION_TIMEOUT_MS = 15000;
export const COMPONENT_COLLISION_TIMEOUT_MS = 20000;
export const POWER_UP_TIMEOUT_MS = 20000;
export const PHASE_TRANSITION_TIMEOUT_MS = 30000;
export const AD_HOLD_ASSERTION_DELAY_MS = 2200;
export const SPEED_TOLERANCE = 0.0001;
export const MIN_SPEED_DIVISOR = 3;

export function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

export function roundSpeedValue(speed) {
  return Math.round(speed * 1000) / 1000;
}

export async function waitForPaddleCollision(page, timeoutMs = PADDLE_COLLISION_TIMEOUT_MS) {
  const startedAt = Date.now();
  let lastEvents = [];

  while (Date.now() - startedAt < timeoutMs) {
    lastEvents = await readGameEvents(page);
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

export function assertPaddleCollisionPhysics(paddleCollision, profileLabel) {
  assertCondition(
    paddleCollision,
    `${profileLabel}: colisão com raquete não registrada.`,
  );

  const velocityBefore = paddleCollision.collisionInfo.velocityBefore;
  const velocityAfter = paddleCollision.collisionInfo.velocityAfter;
  assertCondition(
    velocityBefore && velocityAfter,
    `${profileLabel}: colisão com raquete sem telemetria de velocidade.`,
  );

  const usedRectangularPhysics =
    velocityBefore.dy > 0 && velocityAfter.dy < 0;
  const usedRadialPhysics =
    velocityBefore.dx !== velocityAfter.dx ||
    velocityBefore.dy !== velocityAfter.dy;

  assertCondition(
    usedRectangularPhysics || usedRadialPhysics,
    `${profileLabel}: colisão com raquete não alterou a trajetória da bolinha.`,
  );
}

export async function waitForComponentCollisions(page, expectedCount, timeoutMs = COMPONENT_COLLISION_TIMEOUT_MS) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion, count, collisionType }) => {
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
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
          };
        };
      });

      return (
        events.filter(
          (event) =>
            event.type === "collision" &&
            event.collisionInfo?.type === collisionType,
        ).length >= count
      );
    },
    { timeout: timeoutMs },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      count: expectedCount,
      collisionType: COMPONENT_COLLISION_TYPE,
    },
  );

  const events = await readGameEvents(page);
  return findEventsByType(
    events,
    "collision",
    (event) => event.collisionInfo?.type === COMPONENT_COLLISION_TYPE,
  );
}

export async function waitForPowerUpAction(
  page,
  powerUpType,
  action,
  timeoutMs = POWER_UP_TIMEOUT_MS,
) {
  await page.waitForFunction(
    async ({ dbName, storeName, dbVersion, expectedType, expectedAction }) => {
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
          allRequest.onerror = () => {
            db.close();
            resolveEvents([]);
          };
          allRequest.onsuccess = () => {
            db.close();
            resolveEvents(allRequest.result || []);
          };
        };
      });

      return events.some(
        (event) =>
          event.type === "power_up" &&
          event.metadata?.powerUpType === expectedType &&
          event.metadata?.action === expectedAction,
      );
    },
    { timeout: timeoutMs },
    {
      dbName: GAME_LOG_DB_NAME,
      storeName: GAME_LOG_STORE_NAME,
      dbVersion: GAME_LOG_DB_VERSION,
      expectedType: powerUpType,
      expectedAction: action,
    },
  );

  const events = await readGameEvents(page);
  return findEventsByType(
    events,
    "power_up",
    (event) =>
      event.metadata?.powerUpType === powerUpType &&
      event.metadata?.action === action,
  ).at(-1);
}

export async function collectLevelToastState(page) {
  return page.evaluate(() => {
    const toast = document.querySelector('[data-testid="level-toast"]');
    const canvas = document.querySelector("canvas");
    const toastRect = toast?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();

    return {
      text: toast?.textContent?.trim() ?? "",
      toast: toastRect
        ? { width: toastRect.width, height: toastRect.height }
        : null,
      canvas: canvasRect
        ? { width: canvasRect.width, height: canvasRect.height }
        : null,
    };
  });
}

export async function assertPhaseTransition(page, events, profileLabel, options = {}) {
  const { fromLevel = 1, toLevel = 2, expectedSpeedMultiplier = 1.12 } = options;

  await page.waitForSelector('[data-testid="level-toast"]', {
    timeout: PHASE_TRANSITION_TIMEOUT_MS,
  });
  await page.waitForFunction(
    (expectedLevel) => {
      const text =
        document.querySelector('[data-testid="level-toast"]')?.textContent ?? "";
      return (
        text.includes(`Fase ${expectedLevel}`) ||
        text.includes(`Level ${expectedLevel}`)
      );
    },
    { timeout: PHASE_TRANSITION_TIMEOUT_MS },
    toLevel,
  );

  const toastState = await collectLevelToastState(page);
  assertCondition(
    toastState.text.includes(`Fase ${toLevel}`) ||
      toastState.text.includes(`Level ${toLevel}`),
    `${profileLabel}: toast não informou fase ${toLevel}.`,
  );
  assertCondition(
    toastState.text.includes(`${expectedSpeedMultiplier}×`),
    `${profileLabel}: toast não informou velocidade ${expectedSpeedMultiplier}×.`,
  );
  assertCondition(
    toastState.toast && toastState.canvas,
    `${profileLabel}: toast ou canvas ausente.`,
  );
  assertCondition(
    toastState.toast.width >= toastState.canvas.width,
    `${profileLabel}: overlay de fase não cobriu a largura do tabuleiro.`,
  );
  assertCondition(
    toastState.toast.height >= toastState.canvas.height,
    `${profileLabel}: overlay de fase não cobriu a altura do tabuleiro.`,
  );

  const levelComplete = getLevelComplete(events, fromLevel);
  const levelStart = findEventsByType(
    events,
    "level_start",
    (event) => event.metadata?.level === toLevel,
  ).at(-1);
  const levelCompleteSpeedState = levelComplete?.metadata?.speedState ?? null;
  const levelStartSpeedState = levelStart?.metadata?.speedState ?? null;

  assertCondition(
    levelComplete?.metadata?.nextLevel === toLevel,
    `${profileLabel}: level_complete não registrou próxima fase ${toLevel}.`,
  );
  assertCondition(
    levelComplete?.metadata?.nextSpeedMultiplier === expectedSpeedMultiplier,
    `${profileLabel}: level_complete não registrou velocidade ${expectedSpeedMultiplier}.`,
  );
  assertCondition(levelCompleteSpeedState, `${profileLabel}: speedState ausente em level_complete.`);
  assertCondition(
    Math.abs(levelCompleteSpeedState.initialSpawnSpeed - levelCompleteSpeedState.maxSpeed) <=
      SPEED_TOLERANCE,
    `${profileLabel}: initialSpawnSpeed divergiu do maxSpeed da fase ${fromLevel}.`,
  );
  assertCondition(
    Math.abs(
      levelCompleteSpeedState.minSpeed -
        levelCompleteSpeedState.maxSpeed / MIN_SPEED_DIVISOR,
    ) <= SPEED_TOLERANCE,
    `${profileLabel}: minSpeed da fase ${fromLevel} inválido.`,
  );
  assertCondition(
    levelStart?.metadata?.level === toLevel,
    `${profileLabel}: level_start não registrou fase ${toLevel}.`,
  );
  assertCondition(levelStartSpeedState, `${profileLabel}: speedState ausente em level_start.`);
  assertCondition(
    levelComplete?.metadata?.nextInitialComponentCount ===
      levelStartSpeedState.initialComponentCount,
    `${profileLabel}: level_complete não antecipou blocos da fase ${toLevel}.`,
  );
  assertCondition(
    levelStart?.gameState?.componentsRemaining === levelStartSpeedState.initialComponentCount,
    `${profileLabel}: fase ${toLevel} não iniciou com todos os blocos esperados.`,
  );
  assertCondition(
    levelStart?.gameState?.gameDimensions?.componentRows >
      levelComplete?.gameState?.gameDimensions?.componentRows,
    `${profileLabel}: fase ${toLevel} não aumentou linhas de componentes.`,
  );
  assertCondition(
    levelStartSpeedState.initialComponentCount > levelCompleteSpeedState.initialComponentCount,
    `${profileLabel}: fase ${toLevel} não aumentou quantidade inicial de blocos.`,
  );

  return {
    toastState,
    levelComplete,
    levelStart,
    levelCompleteSpeedState,
    levelStartSpeedState,
  };
}

export async function installLevelTransitionRecorder(page) {
  await page.evaluate((eventName) => {
    window.__BRIKAYA_LEVEL_TRANSITIONS__ = [];
    window.addEventListener(eventName, (event) => {
      window.__BRIKAYA_LEVEL_TRANSITIONS__.push(event.detail);
    });
  }, LEVEL_TRANSITION_EVENT_NAME);
}

export async function installHeldAdStub(page) {
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

export async function completeHeldAd(page, profileLabel) {
  const adState = await page.evaluate(() => window.__BRIKAYA_TEST_AD_STATE__ || null);
  assertCondition(adState?.active, `${profileLabel}: anúncio simulado não ficou ativo.`);

  await page.evaluate(() => {
    window.__BRIKAYA_TEST_AD_STATE__?.finish?.();
  });

  await page.waitForSelector('[data-testid="post-ad-resume-prompt"]', {
    timeout: PHASE_TRANSITION_TIMEOUT_MS,
  });

  const promptText = await page.$eval(
    '[data-testid="post-ad-resume-prompt"]',
    (element) => element.textContent.trim(),
  );
  assertCondition(
    promptText.includes("Fase 4") || promptText.includes("Level 4"),
    `${profileLabel}: mensagem pós-publicidade não orientou volta à fase 4.`,
  );

  await page.click('[data-testid="post-ad-resume-cta"]');

  await page.waitForFunction(
    (eventName) => {
      const transitions = window.__BRIKAYA_LEVEL_TRANSITIONS__ || [];
      return transitions.some((event) => event.phase === "finish");
    },
    { timeout: PHASE_TRANSITION_TIMEOUT_MS },
    LEVEL_TRANSITION_EVENT_NAME,
  );

  return {
    promptText,
    adState: await page.evaluate(() => window.__BRIKAYA_TEST_AD_STATE__ || null),
    transitions: await page.evaluate(
      () => window.__BRIKAYA_LEVEL_TRANSITIONS__ || [],
    ),
  };
}

export async function observeEvents(page, timeoutMs, stepMs = OBSERVATION_STEP_MS) {
  const startedAt = Date.now();
  let latestSummary = {};

  while (Date.now() - startedAt < timeoutMs) {
    const events = await readGameEvents(page);
    latestSummary = summarizeEvents(events);
    await new Promise((resolve) => setTimeout(resolve, stepMs));
  }

  return latestSummary;
}
