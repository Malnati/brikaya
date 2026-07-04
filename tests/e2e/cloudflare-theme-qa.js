// tests/e2e/cloudflare-theme-qa.js
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import {
  PRIVACY_CONSENT_STORAGE_KEY,
  acceptPrivacyConsentIfPresent,
} from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-theme-qa.json";
const DEFAULT_IPHONE15_CONTRAST_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-iphone15-contrast.png";
const DEFAULT_IPHONE15_SUNSET_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-iphone15-sunset.png";
const DEFAULT_IPHONE15_OCEAN_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-iphone15-ocean.png";
const DEFAULT_IPHONE15_RUBY_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-iphone15-ruby.png";
const DEFAULT_IPHONE15_METRO_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-iphone15-metro.png";
const DEFAULT_DESKTOP_CONTRAST_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-contrast.png";
const DEFAULT_DESKTOP_SUNSET_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-sunset.png";
const DEFAULT_DESKTOP_OCEAN_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-ocean.png";
const DEFAULT_DESKTOP_RUBY_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-ruby.png";
const DEFAULT_DESKTOP_METRO_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-metro.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CAPTURE_SCREENSHOTS_ENV_KEY = "BRICKBREAKER_THEME_QA_CAPTURE_SCREENSHOTS";
const USER_DATA_DIR_PREFIX = "brickbreaker-theme-qa-";
const RELOAD_GUARD_STORAGE_KEY = "brickbreaker-sw-controller-reload";
const RELOAD_GUARD_VALUE = "pending";
const RELOAD_GUARD_INTERVAL_MS = 100;
const RELOAD_GUARD_DURATION_MS = 8000;
const RESET_FLAG_PREFIX = "brickbreaker-theme-qa-reset";
const RESET_DONE_VALUE = "done";
const MIN_TOUCH_TARGET_SIZE = 44;
const BROWSER_CLOSE_TIMEOUT_MS = 5000;
const MENU_BUTTON_NAME = /menu/i;
const MENU_OPEN_ATTEMPTS = 3;
const MENU_OPEN_RETRY_DELAY_MS = 500;
const MENU_OPEN_WAIT_TIMEOUT_MS = 4000;
const BUTTON_FIND_TIMEOUT_MS = 10000;
const BUTTON_FIND_RETRY_DELAY_MS = 100;
const THEME_NEON_ARCADE = "neon-arcade";
const THEME_CRT_HIGH_CONTRAST = "crt-high-contrast";
const THEME_PIXEL_SUNSET = "pixel-sunset";
const THEME_OCEAN_NIGHT = "ocean-night";
const THEME_RUBY_DEPTH = "ruby-depth";
const THEME_REAL_METRO_NIGHT = "real-metro-night";
const THEME_AUTO_OPTION_ID = "auto-by-level";
const THEME_MODE_AUTO = "auto";
const THEME_MODE_MANUAL = "manual";
const IMAGE_SET_RETRO_DEFAULT = "retro-default";
const IMAGE_SET_HIGH_CONTRAST = "high-contrast";
const IMAGE_SET_SUNSET_CABINET = "sunset-cabinet";
const IMAGE_SET_REAL_METRO_TUNNEL = "real-metro-tunnel";
const FONT_SET_ARCADE_UI = "arcade-ui";
const FONT_SET_CRT_MONO = "crt-mono";
const FONT_SET_BLOCK_PIXEL = "block-pixel";
const THEME_STORAGE_KEY = "brickbreaker-theme";
const THEME_MODE_STORAGE_KEY = "brickbreaker-theme-mode";
const AUTO_THEME_SEQUENCE_STORAGE_KEY = "brickbreaker-auto-theme-sequence";
const AUTO_THEME_INDEX_STORAGE_KEY = "brickbreaker-auto-theme-index";
const IMAGE_SET_STORAGE_KEY = "brickbreaker-image-set";
const FONT_SET_STORAGE_KEY = "brickbreaker-font-set";
const APPEARANCE_STORAGE_KEYS = [
  THEME_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
  AUTO_THEME_SEQUENCE_STORAGE_KEY,
  AUTO_THEME_INDEX_STORAGE_KEY,
  IMAGE_SET_STORAGE_KEY,
  FONT_SET_STORAGE_KEY,
];
const THEME_OPTION_IDS = [
  THEME_NEON_ARCADE,
  THEME_CRT_HIGH_CONTRAST,
  THEME_PIXEL_SUNSET,
  THEME_OCEAN_NIGHT,
  "jungle-laser",
  "amber-retro",
  "cosmic-ice",
  "electric-plum",
  "lime-graphite",
  THEME_RUBY_DEPTH,
  THEME_REAL_METRO_NIGHT,
  "real-auto-garage",
  "real-bio-lab",
  "real-ancient-temple",
  "real-orbital-station",
];
const IMAGE_SET_OPTION_IDS = [
  IMAGE_SET_RETRO_DEFAULT,
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_SUNSET_CABINET,
  IMAGE_SET_REAL_METRO_TUNNEL,
  "real-workshop-steel",
  "real-bio-lab-glass",
  "real-temple-stone",
  "real-orbital-deck",
];
const FONT_SET_OPTION_IDS = [
  FONT_SET_ARCADE_UI,
  FONT_SET_CRT_MONO,
  FONT_SET_BLOCK_PIXEL,
];
const APPEARANCE_OPTION_IDS = [
  THEME_AUTO_OPTION_ID,
  ...THEME_OPTION_IDS,
  ...IMAGE_SET_OPTION_IDS,
  ...FONT_SET_OPTION_IDS,
];
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const CINEMATIC_OVERLAY_TIMEOUT_MS = 3000;
const FORBIDDEN_VISIBLE_FEATURES = [
  /loja/i,
  /ranking/i,
  /leaderboard/i,
  /upgrades/i,
  /tutorial/i,
  /multiplayer/i,
  /settings/i,
];
const FORBIDDEN_EXTERNAL_HOSTS = [
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
  /cdn\.tailwindcss\.com/i,
  /googleusercontent\.com/i,
];
const VIEWPORTS = {
  iphone15: {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  desktop: {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
};

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env("BRICKBREAKER_PUBLIC_URL", DEFAULT_PUBLIC_URL);
}

function withQaScenario(url) {
  const pageUrl = new URL(url);
  pageUrl.searchParams.set("qaScenario", "single-brick-phase-clear");
  return pageUrl.toString();
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function shouldCaptureScreenshots() {
  return ["1", "true", "yes"].includes(
    (process.env[CAPTURE_SCREENSHOTS_ENV_KEY] || "").toLowerCase(),
  );
}

function logProgress(message) {
  console.log(`cloudflare-theme-qa: ${message}`);
}

async function installInitialPageState(page, resetFlag) {
  await page.evaluateOnNewDocument(
    ({
      storageKeys,
      resetFlagKey,
      resetDoneValue,
      reloadGuardKey,
      reloadGuardValue,
      intervalMs,
      durationMs,
    }) => {
      try {
        if (sessionStorage.getItem(resetFlagKey) !== resetDoneValue) {
          for (const storageKey of storageKeys) {
            localStorage.removeItem(storageKey);
          }
          sessionStorage.setItem(resetFlagKey, resetDoneValue);
        }

        sessionStorage.setItem(reloadGuardKey, reloadGuardValue);
        const intervalId = window.setInterval(
          () => sessionStorage.setItem(reloadGuardKey, reloadGuardValue),
          intervalMs,
        );
        window.setTimeout(() => window.clearInterval(intervalId), durationMs);
      } catch {}
    },
    {
      storageKeys: APPEARANCE_STORAGE_KEYS,
      resetFlagKey: `${RESET_FLAG_PREFIX}-${resetFlag}`,
      resetDoneValue: RESET_DONE_VALUE,
      reloadGuardKey: RELOAD_GUARD_STORAGE_KEY,
      reloadGuardValue: RELOAD_GUARD_VALUE,
      intervalMs: RELOAD_GUARD_INTERVAL_MS,
      durationMs: RELOAD_GUARD_DURATION_MS,
    },
  );
}

async function resetAppearanceState(page, options = {}) {
  await page.evaluate(
    ({ storageKeys, consentStorageKey, clearConsent }) => {
      for (const storageKey of storageKeys) {
        window.localStorage.removeItem(storageKey);
      }
      if (clearConsent) window.localStorage.removeItem(consentStorageKey);
    },
    {
      storageKeys: APPEARANCE_STORAGE_KEYS,
      consentStorageKey: PRIVACY_CONSENT_STORAGE_KEY,
      clearConsent: options.includeConsent === true,
    },
  );
}

async function closeBrowser(browser) {
  let timedOut = false;
  await Promise.race([
    browser.close(),
    new Promise((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve();
      }, BROWSER_CLOSE_TIMEOUT_MS),
    ),
  ]);
  if (timedOut) {
    const browserProcess = browser.process();
    browser.disconnect();
    browserProcess?.kill("SIGTERM");
  }
}

function waitForRetryDelay() {
  return new Promise((resolve) =>
    setTimeout(resolve, BUTTON_FIND_RETRY_DELAY_MS),
  );
}

async function clickButton(page, matcher, missingMessage) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < BUTTON_FIND_TIMEOUT_MS) {
    const buttons = await page.$$("button");
    const candidates = [];
    for (const button of buttons) {
      const labels = await button.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return {
          text: node.textContent?.trim() || "",
          ariaLabel: node.getAttribute("aria-label") || "",
          title: node.getAttribute("title") || "",
          appearanceOptionId:
            node.getAttribute("data-appearance-option-id") || "",
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= window.innerHeight &&
            rect.left <= window.innerWidth &&
            style.visibility !== "hidden" &&
            style.display !== "none",
        };
      });
      candidates.push({ button, labels });
    }

    const visibleMatch = candidates.find(
      (candidate) => candidate.labels.visible && matcher(candidate.labels),
    );
    const fallbackMatch = candidates.find((candidate) =>
      matcher(candidate.labels),
    );
    const match = visibleMatch || fallbackMatch;

    if (match) {
      try {
        await match.button.evaluate((node) => {
          node.scrollIntoView({ block: "center", inline: "center" });
          node.click();
        });
        return;
      } catch {
        await waitForRetryDelay();
        continue;
      }
    }

    await waitForRetryDelay();
  }

  throw new Error(missingMessage);
}

async function clickAppearanceOptionById(page, optionId) {
  await clickButton(
    page,
    (labels) => labels.appearanceOptionId === optionId,
    `Opção de aparência não encontrada: ${optionId}`,
  );
}

async function clickButtonByPattern(page, pattern) {
  await clickButton(
    page,
    (labels) =>
      pattern.test(labels.text) ||
      pattern.test(labels.ariaLabel) ||
      pattern.test(labels.title),
    `Botão não encontrado: ${pattern}`,
  );
}
async function openMenu(page) {
  for (let attempt = 1; attempt <= MENU_OPEN_ATTEMPTS; attempt += 1) {
    if (await page.$(".settings-drawer")) return;
    await clickButtonByPattern(page, MENU_BUTTON_NAME);
    try {
      await page.waitForSelector(".settings-drawer", {
        timeout: MENU_OPEN_WAIT_TIMEOUT_MS,
      });
      return;
    } catch (error) {
      if (attempt === MENU_OPEN_ATTEMPTS) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, MENU_OPEN_RETRY_DELAY_MS),
      );
    }
  }
}

async function waitForCinematicOverlayToClear(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: CINEMATIC_OVERLAY_TIMEOUT_MS,
  });
}

async function collectState(page) {
  return page.evaluate(
    ({ minTouchTargetSize, forbiddenSources }) => {
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

      const buttons = Array.from(document.querySelectorAll("button")).map(
        (button) => {
          const rect = button.getBoundingClientRect();
          return {
            text: button.textContent?.trim() || "",
            ariaLabel: button.getAttribute("aria-label") || "",
            title: button.getAttribute("title") || "",
            appearanceOptionId:
              button.getAttribute("data-appearance-option-id") || "",
            width: rect.width,
            height: rect.height,
            visibleInViewport:
              rect.left >= 0 &&
              rect.top >= 0 &&
              rect.right <= window.innerWidth &&
              rect.bottom <= window.innerHeight,
            hasTouchTarget:
              rect.width >= minTouchTargetSize &&
              rect.height >= minTouchTargetSize,
            ariaPressed: button.getAttribute("aria-pressed"),
            inDrawer: Boolean(button.closest(".settings-drawer")),
          };
        },
      );
      const bodyText = document.body.textContent || "";
      const resourceUrls = Array.from(
        document.querySelectorAll("link[href], script[src], img[src]"),
      ).map((element) => element.href || element.src || "");
      const forbiddenResources = resourceUrls.filter((url) =>
        forbiddenSources.some((source) => new RegExp(source, "i").test(url)),
      );

      return {
        theme: document.documentElement.dataset.theme || "",
        storedTheme: window.localStorage.getItem("brickbreaker-theme"),
        storedThemeMode: window.localStorage.getItem(
          "brickbreaker-theme-mode",
        ),
        storedAutoThemeSequence: window.localStorage.getItem(
          "brickbreaker-auto-theme-sequence",
        ),
        storedAutoThemeIndex: window.localStorage.getItem(
          "brickbreaker-auto-theme-index",
        ),
        heading: document.querySelector("h1")?.textContent || "",
        imageSet: document.documentElement.dataset.imageSet || "",
        fontSet: document.documentElement.dataset.fontSet || "",
        storedImageSet: window.localStorage.getItem("brickbreaker-image-set"),
        storedFontSet: window.localStorage.getItem("brickbreaker-font-set"),
        appearanceSelector: Boolean(
          document.querySelector('[aria-label="Aparência do jogo"]'),
        ),
        appearanceGroups: Array.from(
          document.querySelectorAll(".appearance-selector__group"),
        ).map((group) => ({
          title: group.querySelector("h4")?.textContent?.trim() || "",
          optionIds: Array.from(
            group.querySelectorAll("[data-appearance-option-id]"),
          ).map(
            (button) => button.getAttribute("data-appearance-option-id") || "",
          ),
        })),
        menuOpen: Boolean(document.querySelector(".settings-drawer")),
        buttons,
        bodyText,
        forbiddenResources,
        canvas: rectOf(document.querySelector("canvas")),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
        },
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth,
      };
    },
    {
      minTouchTargetSize: MIN_TOUCH_TARGET_SIZE,
      forbiddenSources: FORBIDDEN_EXTERNAL_HOSTS.map(
        (pattern) => pattern.source,
      ),
    },
  );
}

function assertBaseState(state, viewportName, expectMenuOpen = false) {
  const allowsVerticalScroll = viewportName.startsWith("desktop");
  const buttonsThatMustBeVisible =
    expectMenuOpen && !allowsVerticalScroll
      ? state.buttons.filter((button) => !button.inDrawer)
      : state.buttons;
  assert(
    state.heading.includes("Brikaya"),
    `${viewportName}: heading Brikaya ausente.`,
  );
  assert(
    state.buttons.some((button) => button.text === "Menu"),
    `${viewportName}: botão Menu ausente.`,
  );
  assert(
    state.buttons.some(
      (button) =>
        !button.inDrawer &&
        /^(Som|Sem som)$/.test(button.ariaLabel) &&
        /^[♪×]$/.test(button.text),
    ),
    `${viewportName}: ícone de som ausente na tela principal.`,
  );
  assert(
    state.buttons.some(
      (button) =>
        !button.inDrawer &&
        /reiniciar|jogar de novo/i.test(button.ariaLabel) &&
        button.text === "↻",
    ),
    `${viewportName}: ícone Reiniciar/Jogar de novo ausente na tela principal.`,
  );
  if (expectMenuOpen) {
    assert(state.menuOpen, `${viewportName}: menu lateral fechado.`);
    assert(
      state.appearanceSelector,
      `${viewportName}: seletor de aparência ausente.`,
    );
    for (const optionId of APPEARANCE_OPTION_IDS) {
      assert(
        state.buttons.some((button) => button.appearanceOptionId === optionId),
        `${viewportName}: opção de aparência ${optionId} ausente.`,
      );
    }
    const themeGroup = state.appearanceGroups.find(
      (group) => group.title === "Tema visual",
    );
    assert(themeGroup, `${viewportName}: grupo Tema visual ausente.`);
    assert(
      themeGroup.optionIds.length === THEME_OPTION_IDS.length + 1,
      `${viewportName}: Tema visual deveria ter ${THEME_OPTION_IDS.length + 1} botões, recebeu ${themeGroup.optionIds.length}.`,
    );
    assert(
      themeGroup.optionIds.includes(THEME_AUTO_OPTION_ID),
      `${viewportName}: opção automática ausente no grupo Tema visual.`,
    );
    for (const optionId of THEME_OPTION_IDS) {
      assert(
        themeGroup.optionIds.includes(optionId),
        `${viewportName}: tema ${optionId} ausente no grupo Tema visual.`,
      );
    }
    for (const heading of ["Aparência", "Tema visual", "Imagens", "Fonte"]) {
      assert(
        state.bodyText.includes(heading),
        `${viewportName}: seção ${heading} ausente.`,
      );
    }
    assert(
      !state.buttons.some(
        (button) =>
          button.inDrawer && /reiniciar|jogar de novo/i.test(button.text),
      ),
      `${viewportName}: reiniciar ainda aparece no menu.`,
    );
    assert(
      !/Partida/.test(state.bodyText),
      `${viewportName}: seção Partida ainda aparece no menu.`,
    );
    assert(
      state.buttons.some((button) => /histórico/i.test(button.text)),
      `${viewportName}: histórico inacessível no menu.`,
    );
    assert(
      state.buttons.some((button) => /colisões/i.test(button.text)),
      `${viewportName}: colisões inacessível no menu.`,
    );
    assert(
      state.buttons.some((button) => /zerar pontuação/i.test(button.text)),
      `${viewportName}: zerar pontuação inacessível no menu.`,
    );
  } else {
    assert(
      !state.appearanceSelector,
      `${viewportName}: seletor de aparência apareceu fora do menu.`,
    );
    for (const optionId of APPEARANCE_OPTION_IDS) {
      assert(
        !state.buttons.some((button) => button.appearanceOptionId === optionId),
        `${viewportName}: opção de aparência ${optionId} apareceu fora do menu.`,
      );
    }
    assert(
      !state.buttons.some((button) =>
        /reiniciar|jogar de novo/i.test(button.text),
      ),
      `${viewportName}: reiniciar apareceu fora do menu.`,
    );
    assert(
      !state.buttons.some((button) => /histórico/i.test(button.text)),
      `${viewportName}: histórico apareceu fora do menu.`,
    );
    assert(
      !state.buttons.some((button) => /colisões/i.test(button.text)),
      `${viewportName}: colisões apareceu fora do menu.`,
    );
    assert(
      !state.buttons.some((button) => /zerar pontuação/i.test(button.text)),
      `${viewportName}: zerar pontuação apareceu fora do menu.`,
    );
  }
  assert(
    state.buttons.every((button) => button.hasTouchTarget),
    `${viewportName}: botão menor que 44px: ${state.buttons
      .filter((button) => !button.hasTouchTarget)
      .map((button) => button.text)
      .join(", ")}.`,
  );
  assert(
    allowsVerticalScroll ||
      buttonsThatMustBeVisible.every((button) => button.visibleInViewport),
    `${viewportName}: botão cortado: ${state.buttons
      .filter((button) => !button.visibleInViewport)
      .map((button) => button.text)
      .join(", ")}.`,
  );
  assert(!state.hasHorizontalOverflow, `${viewportName}: overflow horizontal.`);
  assert(state.canvas, `${viewportName}: canvas ausente.`);
  assert(
    state.canvas.right <= state.viewport.width,
    `${viewportName}: canvas excede largura.`,
  );
  assert(
    allowsVerticalScroll || state.canvas.bottom <= state.viewport.height,
    `${viewportName}: canvas excede altura sem scroll permitido.`,
  );
  for (const forbiddenFeature of FORBIDDEN_VISIBLE_FEATURES) {
    assert(
      !forbiddenFeature.test(state.bodyText),
      `${viewportName}: funcionalidade fora de escopo visível: ${forbiddenFeature}.`,
    );
  }
  assert(
    state.forbiddenResources.length === 0,
    `${viewportName}: recurso externo proibido no DOM: ${state.forbiddenResources.join(", ")}`,
  );
}

function parseStoredAutoThemeSequence(state, viewportName) {
  try {
    const sequence = JSON.parse(state.storedAutoThemeSequence || "[]");
    assert(
      Array.isArray(sequence),
      `${viewportName}: sequência automática salva não é lista.`,
    );
    return sequence;
  } catch {
    throw new Error(
      `${viewportName}: sequência automática salva não é JSON válido.`,
    );
  }
}

async function validateAutomaticThemeProgression(page, targetUrl, viewportName) {
  await resetAppearanceState(page, { includeConsent: true });
  await page.goto(withQaScenario(targetUrl), {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await page.waitForSelector("canvas", { timeout: 30000 });

  const automaticInitialState = await collectState(page);
  assert(
    automaticInitialState.theme === THEME_NEON_ARCADE,
    `${viewportName}: tema automático inicial deveria começar em Arcade neon.`,
  );
  await acceptPrivacyConsentIfPresent(page);
  await page.waitForSelector('[data-testid="level-toast"]', {
    timeout: 30000,
  });
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="level-toast"]')
        ?.textContent?.includes("Fase 2"),
    { timeout: 30000 },
  );
  await page.waitForFunction(
    (initialTheme) => document.documentElement.dataset.theme !== initialTheme,
    { timeout: 10000 },
    automaticInitialState.theme,
  );

  const automaticLevelState = await collectState(page);
  const storedSequence = parseStoredAutoThemeSequence(
    automaticLevelState,
    viewportName,
  );
  assert(
    automaticLevelState.theme !== automaticInitialState.theme,
    `${viewportName}: tema automático não mudou na nova fase.`,
  );
  assert(
    automaticLevelState.storedTheme === automaticLevelState.theme,
    `${viewportName}: tema automático corrente não foi persistido.`,
  );
  assert(
    automaticLevelState.storedThemeMode === THEME_MODE_AUTO,
    `${viewportName}: modo automático não foi persistido.`,
  );
  assert(
    storedSequence.length === THEME_OPTION_IDS.length,
    `${viewportName}: sequência automática deveria cobrir todos os temas.`,
  );
  assert(
    new Set(storedSequence).size === THEME_OPTION_IDS.length,
    `${viewportName}: sequência automática contém tema repetido.`,
  );
  assert(
    automaticLevelState.storedAutoThemeIndex === "1",
    `${viewportName}: índice automático deveria avançar para 1 na Fase 2.`,
  );

  return { automaticInitialState, automaticLevelState };
}

async function validateManualThemeLock(page, targetUrl, viewportName) {
  await resetAppearanceState(page, { includeConsent: true });
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCinematicOverlayToClear(page);
  await openMenu(page);
  await clickAppearanceOptionById(page, THEME_PIXEL_SUNSET);
  await page.waitForFunction(
    (theme) => document.documentElement.dataset.theme === theme,
    {},
    THEME_PIXEL_SUNSET,
  );

  const manualInitialState = await collectState(page);
  assert(
    manualInitialState.storedThemeMode === THEME_MODE_MANUAL,
    `${viewportName}: escolha manual não persistiu antes da fase.`,
  );

  await page.goto(withQaScenario(targetUrl), {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await page.waitForSelector('[data-testid="level-toast"]', {
    timeout: 30000,
  });
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="level-toast"]')
        ?.textContent?.includes("Fase 2"),
    { timeout: 30000 },
  );

  const manualLevelState = await collectState(page);
  assert(
    manualLevelState.theme === THEME_PIXEL_SUNSET,
    `${viewportName}: tema manual mudou automaticamente na Fase 2.`,
  );
  assert(
    manualLevelState.storedTheme === THEME_PIXEL_SUNSET &&
      manualLevelState.storedThemeMode === THEME_MODE_MANUAL,
    `${viewportName}: tema manual não permaneceu persistido na Fase 2.`,
  );

  return { manualInitialState, manualLevelState };
}

async function validateViewport(
  page,
  targetUrl,
  viewportName,
  viewport,
  screenshots,
  captureScreenshots,
) {
  await installInitialPageState(page, viewportName);
  logProgress(`${viewportName}: carregar página com aparência limpa`);
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCinematicOverlayToClear(page);

  logProgress(`${viewportName}: validar estado inicial`);
  const initialState = await collectState(page);
  assertBaseState(initialState, `${viewportName}/inicial`);
  assert(
    initialState.theme === THEME_NEON_ARCADE,
    `${viewportName}: tema inicial sem preferência salva deveria ser Arcade neon.`,
  );

  assert(
    initialState.imageSet === IMAGE_SET_RETRO_DEFAULT,
    `${viewportName}: conjunto visual inicial não é Retrô padrão.`,
  );
  assert(
    initialState.fontSet === FONT_SET_ARCADE_UI,
    `${viewportName}: fonte inicial não é Arcade.`,
  );

  logProgress(`${viewportName}: validar tema automático por fase`);
  const automaticProgressionState = await validateAutomaticThemeProgression(
    page,
    targetUrl,
    viewportName,
  );
  logProgress(`${viewportName}: validar tema manual fixo por fase`);
  const manualThemeLockState = await validateManualThemeLock(
    page,
    targetUrl,
    viewportName,
  );
  await resetAppearanceState(page);
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCinematicOverlayToClear(page);

  await openMenu(page);
  logProgress(`${viewportName}: aplicar CRT alto contraste`);
  await clickAppearanceOptionById(page, THEME_CRT_HIGH_CONTRAST);
  await clickAppearanceOptionById(page, IMAGE_SET_HIGH_CONTRAST);
  await clickAppearanceOptionById(page, FONT_SET_CRT_MONO);
  await page.waitForFunction(
    ({ theme, imageSet, fontSet }) =>
      document.documentElement.dataset.theme === theme &&
      document.documentElement.dataset.imageSet === imageSet &&
      document.documentElement.dataset.fontSet === fontSet,
    {},
    {
      theme: THEME_CRT_HIGH_CONTRAST,
      imageSet: IMAGE_SET_HIGH_CONTRAST,
      fontSet: FONT_SET_CRT_MONO,
    },
  );
  const contrastState = await collectState(page);
  assertBaseState(contrastState, `${viewportName}/crt-alto-contraste`, true);
  assert(
    contrastState.theme === THEME_CRT_HIGH_CONTRAST,
    `${viewportName}: tema CRT alto contraste não aplicado.`,
  );
  assert(
    contrastState.imageSet === IMAGE_SET_HIGH_CONTRAST,
    `${viewportName}: imagens de alto contraste não aplicadas.`,
  );
  assert(
    contrastState.fontSet === FONT_SET_CRT_MONO,
    `${viewportName}: fonte CRT mono não aplicada.`,
  );
  assert(
    contrastState.storedTheme === THEME_CRT_HIGH_CONTRAST &&
      contrastState.storedImageSet === IMAGE_SET_HIGH_CONTRAST &&
      contrastState.storedFontSet === FONT_SET_CRT_MONO,
    `${viewportName}: aparência CRT alto contraste não persistida.`,
  );
  if (captureScreenshots) {
    await page.screenshot({ path: screenshots.contrast, fullPage: true });
  }

  logProgress(`${viewportName}: validar persistência CRT`);
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCinematicOverlayToClear(page);
  const reloadedContrastState = await collectState(page);
  assertBaseState(reloadedContrastState, `${viewportName}/crt-reload`);
  assert(
    reloadedContrastState.theme === THEME_CRT_HIGH_CONTRAST &&
      reloadedContrastState.imageSet === IMAGE_SET_HIGH_CONTRAST &&
      reloadedContrastState.fontSet === FONT_SET_CRT_MONO,
    `${viewportName}: aparência CRT alto contraste não persistiu após reload.`,
  );

  await openMenu(page);
  logProgress(`${viewportName}: aplicar Pôr do sol pixelado`);
  await clickAppearanceOptionById(page, THEME_PIXEL_SUNSET);
  await clickAppearanceOptionById(page, IMAGE_SET_SUNSET_CABINET);
  await clickAppearanceOptionById(page, FONT_SET_BLOCK_PIXEL);
  await page.waitForFunction(
    ({ theme, imageSet, fontSet }) =>
      document.documentElement.dataset.theme === theme &&
      document.documentElement.dataset.imageSet === imageSet &&
      document.documentElement.dataset.fontSet === fontSet,
    {},
    {
      theme: THEME_PIXEL_SUNSET,
      imageSet: IMAGE_SET_SUNSET_CABINET,
      fontSet: FONT_SET_BLOCK_PIXEL,
    },
  );
  const sunsetState = await collectState(page);
  assertBaseState(sunsetState, `${viewportName}/pixel-sunset`, true);
  assert(
    sunsetState.theme === THEME_PIXEL_SUNSET,
    `${viewportName}: tema Pôr do sol pixelado não aplicado.`,
  );
  assert(
    sunsetState.imageSet === IMAGE_SET_SUNSET_CABINET,
    `${viewportName}: imagens Cabine pôr do sol não aplicadas.`,
  );
  assert(
    sunsetState.fontSet === FONT_SET_BLOCK_PIXEL,
    `${viewportName}: fonte Blocos pixelados não aplicada.`,
  );
  assert(
    sunsetState.storedTheme === THEME_PIXEL_SUNSET &&
      sunsetState.storedImageSet === IMAGE_SET_SUNSET_CABINET &&
      sunsetState.storedFontSet === FONT_SET_BLOCK_PIXEL,
    `${viewportName}: aparência Pôr do sol pixelado não persistida.`,
  );
  if (captureScreenshots) {
    await page.screenshot({ path: screenshots.sunset, fullPage: true });
  }

  logProgress(`${viewportName}: aplicar Oceano noturno`);
  await clickAppearanceOptionById(page, THEME_OCEAN_NIGHT);
  await page.waitForFunction(
    (theme) => document.documentElement.dataset.theme === theme,
    {},
    THEME_OCEAN_NIGHT,
  );
  const oceanState = await collectState(page);
  assertBaseState(oceanState, `${viewportName}/oceano-noturno`, true);
  assert(
    oceanState.theme === THEME_OCEAN_NIGHT &&
      oceanState.storedTheme === THEME_OCEAN_NIGHT,
    `${viewportName}: tema Oceano noturno não aplicado/persistido.`,
  );
  if (captureScreenshots) {
    await page.screenshot({ path: screenshots.ocean, fullPage: true });
  }

  logProgress(`${viewportName}: aplicar Rubi profundo`);
  await clickAppearanceOptionById(page, THEME_RUBY_DEPTH);
  await page.waitForFunction(
    (theme) => document.documentElement.dataset.theme === theme,
    {},
    THEME_RUBY_DEPTH,
  );
  const rubyState = await collectState(page);
  assertBaseState(rubyState, `${viewportName}/rubi-profundo`, true);
  assert(
    rubyState.theme === THEME_RUBY_DEPTH &&
      rubyState.storedTheme === THEME_RUBY_DEPTH,
    `${viewportName}: tema Rubi profundo não aplicado/persistido.`,
  );
  if (captureScreenshots) {
    await page.screenshot({ path: screenshots.ruby, fullPage: true });
  }

  logProgress(`${viewportName}: aplicar Metrô noturno realista`);
  await clickAppearanceOptionById(page, THEME_REAL_METRO_NIGHT);
  await clickAppearanceOptionById(page, IMAGE_SET_REAL_METRO_TUNNEL);
  await page.waitForFunction(
    ({ theme, imageSet }) =>
      document.documentElement.dataset.theme === theme &&
      document.documentElement.dataset.imageSet === imageSet,
    {},
    {
      theme: THEME_REAL_METRO_NIGHT,
      imageSet: IMAGE_SET_REAL_METRO_TUNNEL,
    },
  );
  const metroState = await collectState(page);
  assertBaseState(metroState, `${viewportName}/metro-noturno-realista`, true);
  assert(
    metroState.theme === THEME_REAL_METRO_NIGHT &&
      metroState.imageSet === IMAGE_SET_REAL_METRO_TUNNEL &&
      metroState.storedTheme === THEME_REAL_METRO_NIGHT &&
      metroState.storedImageSet === IMAGE_SET_REAL_METRO_TUNNEL,
    `${viewportName}: tema/conjunto Metrô noturno realista não aplicado/persistido.`,
  );
  if (captureScreenshots) {
    await page.screenshot({ path: screenshots.metro, fullPage: true });
  }

  return {
    initialState,
    contrastState,
    reloadedContrastState,
    sunsetState,
    oceanState,
    rubyState,
    metroState,
    automaticProgressionState,
    manualThemeLockState,
  };
}

async function run() {
  const targetUrl = publicUrl();
  const parsed = new URL(targetUrl);
  assert(
    parsed.hostname === "brikaya.com",
    `URL precisa ser brikaya.com: ${targetUrl}`,
  );

  const reportPath = env("BRICKBREAKER_THEME_QA_REPORT", DEFAULT_REPORT_PATH);
  const captureScreenshots = shouldCaptureScreenshots();
  const screenshotPaths = {
    iphone15: {
      contrast: env(
        "BRICKBREAKER_THEME_QA_IPHONE15_CONTRAST_SCREENSHOT",
        DEFAULT_IPHONE15_CONTRAST_SCREENSHOT,
      ),
      sunset: env(
        "BRICKBREAKER_THEME_QA_IPHONE15_SUNSET_SCREENSHOT",
        DEFAULT_IPHONE15_SUNSET_SCREENSHOT,
      ),
      ocean: env(
        "BRICKBREAKER_THEME_QA_IPHONE15_OCEAN_SCREENSHOT",
        DEFAULT_IPHONE15_OCEAN_SCREENSHOT,
      ),
      ruby: env(
        "BRICKBREAKER_THEME_QA_IPHONE15_RUBY_SCREENSHOT",
        DEFAULT_IPHONE15_RUBY_SCREENSHOT,
      ),
      metro: env(
        "BRICKBREAKER_THEME_QA_IPHONE15_METRO_SCREENSHOT",
        DEFAULT_IPHONE15_METRO_SCREENSHOT,
      ),
    },
    desktop: {
      contrast: env(
        "BRICKBREAKER_THEME_QA_DESKTOP_CONTRAST_SCREENSHOT",
        DEFAULT_DESKTOP_CONTRAST_SCREENSHOT,
      ),
      sunset: env(
        "BRICKBREAKER_THEME_QA_DESKTOP_SUNSET_SCREENSHOT",
        DEFAULT_DESKTOP_SUNSET_SCREENSHOT,
      ),
      ocean: env(
        "BRICKBREAKER_THEME_QA_DESKTOP_OCEAN_SCREENSHOT",
        DEFAULT_DESKTOP_OCEAN_SCREENSHOT,
      ),
      ruby: env(
        "BRICKBREAKER_THEME_QA_DESKTOP_RUBY_SCREENSHOT",
        DEFAULT_DESKTOP_RUBY_SCREENSHOT,
      ),
      metro: env(
        "BRICKBREAKER_THEME_QA_DESKTOP_METRO_SCREENSHOT",
        DEFAULT_DESKTOP_METRO_SCREENSHOT,
      ),
    },
  };
  [
    reportPath,
    ...(captureScreenshots
      ? Object.values(screenshotPaths).flatMap((paths) => Object.values(paths))
      : []),
  ].forEach(ensureParentDirectory);

  const consoleProblems = [];
  const externalRequests = [];
  const userDataDir = mkdtempSync(join(tmpdir(), USER_DATA_DIR_PREFIX));
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    userDataDir,
    args: buildChromeLaunchArgs([
      "--no-first-run",
      "--no-default-browser-check",
    ]),
  });

  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      if (["error", "warn"].includes(message.type())) {
        consoleProblems.push({ type: message.type(), text: message.text() });
      }
    });
    page.on("pageerror", (error) =>
      consoleProblems.push({ type: "pageerror", text: error.message }),
    );
    page.on("request", (request) => {
      const requestUrl = new URL(request.url());
      if (requestUrl.hostname !== parsed.hostname) {
        externalRequests.push(request.url());
      }
    });

    const results = {
      iphone15: await validateViewport(
        page,
        targetUrl,
        "iphone15",
        VIEWPORTS.iphone15,
        screenshotPaths.iphone15,
        captureScreenshots,
      ),
      desktop: await validateViewport(
        page,
        targetUrl,
        "desktop",
        VIEWPORTS.desktop,
        screenshotPaths.desktop,
        captureScreenshots,
      ),
    };

    const forbiddenExternalRequests = externalRequests.filter((url) =>
      FORBIDDEN_EXTERNAL_HOSTS.some((pattern) => pattern.test(url)),
    );
    assert(
      forbiddenExternalRequests.length === 0,
      `Requisições externas proibidas: ${forbiddenExternalRequests.join(", ")}`,
    );
    assert(
      externalRequests.length === 0,
      `Requisições a terceiros não permitidas: ${[...new Set(externalRequests)].join(", ")}`,
    );
    assert(
      consoleProblems.length === 0,
      `Console publicou warnings/errors: ${JSON.stringify(consoleProblems.slice(0, 5))}`,
    );

    const report = {
      url: targetUrl,
      captureScreenshots,
      screenshotPaths,
      results,
      externalRequests: [...new Set(externalRequests)],
      consoleProblems,
    };
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify(
        {
          url: report.url,
          captureScreenshots: report.captureScreenshots,
          screenshotPaths: report.screenshotPaths,
          externalRequests: report.externalRequests,
          consoleProblems: report.consoleProblems,
          validatedViewports: Object.keys(report.results),
        },
        null,
        2,
      ),
    );
  } finally {
    await closeBrowser(browser);
    rmSync(userDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
