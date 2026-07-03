// tests/e2e/cloudflare-theme-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

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
const DEFAULT_DESKTOP_CONTRAST_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-contrast.png";
const DEFAULT_DESKTOP_SUNSET_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-sunset.png";
const DEFAULT_DESKTOP_OCEAN_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-ocean.png";
const DEFAULT_DESKTOP_RUBY_SCREENSHOT =
  "tmp/screenshots/cloudflare-theme-desktop-ruby.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MIN_TOUCH_TARGET_SIZE = 44;
const BROWSER_CLOSE_SETTLE_MS = 250;
const MENU_BUTTON_NAME = /menu/i;
const MENU_OPEN_ATTEMPTS = 3;
const MENU_OPEN_RETRY_DELAY_MS = 500;
const MENU_OPEN_WAIT_TIMEOUT_MS = 4000;
const THEME_NEON_ARCADE = "neon-arcade";
const THEME_CRT_HIGH_CONTRAST = "crt-high-contrast";
const THEME_PIXEL_SUNSET = "pixel-sunset";
const THEME_OCEAN_NIGHT = "ocean-night";
const THEME_RUBY_DEPTH = "ruby-depth";
const IMAGE_SET_RETRO_DEFAULT = "retro-default";
const IMAGE_SET_HIGH_CONTRAST = "high-contrast";
const IMAGE_SET_SUNSET_CABINET = "sunset-cabinet";
const FONT_SET_ARCADE_UI = "arcade-ui";
const FONT_SET_CRT_MONO = "crt-mono";
const FONT_SET_BLOCK_PIXEL = "block-pixel";
const THEME_STORAGE_KEY = "brickbreaker-theme";
const IMAGE_SET_STORAGE_KEY = "brickbreaker-image-set";
const FONT_SET_STORAGE_KEY = "brickbreaker-font-set";
const APPEARANCE_STORAGE_KEYS = [
  THEME_STORAGE_KEY,
  IMAGE_SET_STORAGE_KEY,
  FONT_SET_STORAGE_KEY,
];
const THEME_BUTTON_LABELS = [
  "Neon Arcade",
  "CRT alto contraste",
  "Pixel Sunset",
  "Oceano noturno",
  "Selva laser",
  "Âmbar retrô",
  "Gelo cósmico",
  "Ameixa elétrica",
  "Lima grafite",
  "Rubi profundo",
];
const APPEARANCE_BUTTON_LABELS = [
  ...THEME_BUTTON_LABELS,
  "Retro padrão",
  "Alto contraste",
  "Cabine Sunset",
  "Arcade",
  "CRT mono",
  "Blocos pixel",
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

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function closeBrowser(browser) {
  const browserProcess = browser.process();
  browser.disconnect();
  browserProcess?.kill("SIGKILL");
  await new Promise((resolve) => setTimeout(resolve, BROWSER_CLOSE_SETTLE_MS));
}

async function clickButtonByText(page, label) {
  const buttons = await page.$$("button");
  for (const button of buttons) {
    const text = await button.evaluate(
      (node) => node.textContent?.trim() || "",
    );
    if (text === label) {
      await button.evaluate((node) => {
        node.scrollIntoView({ block: "center", inline: "center" });
        node.click();
      });
      return;
    }
  }
  throw new Error(`Botão não encontrado: ${label}`);
}

async function clickButtonByPattern(page, pattern) {
  const buttons = await page.$$("button");
  const candidates = [];
  for (const button of buttons) {
    const labels = await button.evaluate((node) => ({
      text: node.textContent || "",
      ariaLabel: node.getAttribute("aria-label") || "",
      title: node.getAttribute("title") || "",
    }));
    candidates.push({ button, labels });
  }

  const accessibleMatch = candidates.find(
    ({ labels }) => pattern.test(labels.ariaLabel) || pattern.test(labels.title),
  );
  const textMatch = candidates.find(({ labels }) => pattern.test(labels.text));
  const match = accessibleMatch || textMatch;
  if (!match) throw new Error(`Botão não encontrado: ${pattern}`);

  await match.button.evaluate((node) => {
    node.scrollIntoView({ block: "center", inline: "center" });
    node.click();
  });
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
          buttons: Array.from(group.querySelectorAll("button")).map(
            (button) => button.textContent?.trim() || "",
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
    assert(state.appearanceSelector, `${viewportName}: seletor de aparência ausente.`);
    for (const label of APPEARANCE_BUTTON_LABELS) {
      assert(
        state.buttons.some((button) => button.text === label),
        `${viewportName}: botão ${label} ausente.`,
      );
    }
    const themeGroup = state.appearanceGroups.find(
      (group) => group.title === "Tema visual",
    );
    assert(themeGroup, `${viewportName}: grupo Tema visual ausente.`);
    assert(
      themeGroup.buttons.length === THEME_BUTTON_LABELS.length,
      `${viewportName}: Tema visual deveria ter ${THEME_BUTTON_LABELS.length} botões, recebeu ${themeGroup.buttons.length}.`,
    );
    for (const label of THEME_BUTTON_LABELS) {
      assert(
        themeGroup.buttons.includes(label),
        `${viewportName}: tema ${label} ausente no grupo Tema visual.`,
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
      state.buttons.some((button) => /logs/i.test(button.text)),
      `${viewportName}: logs inacessível no menu.`,
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
    for (const label of APPEARANCE_BUTTON_LABELS) {
      assert(
        !state.buttons.some((button) => button.text === label),
        `${viewportName}: botão ${label} apareceu fora do menu.`,
      );
    }
    assert(
      !state.buttons.some((button) =>
        /reiniciar|jogar de novo/i.test(button.text),
      ),
      `${viewportName}: reiniciar apareceu fora do menu.`,
    );
    assert(
      !state.buttons.some((button) => /logs/i.test(button.text)),
      `${viewportName}: logs apareceu fora do menu.`,
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

async function validateViewport(
  page,
  targetUrl,
  viewportName,
  viewport,
  screenshots,
) {
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);
  await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate((storageKeys) => {
    for (const storageKey of storageKeys) window.localStorage.removeItem(storageKey);
  }, APPEARANCE_STORAGE_KEYS);
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await acceptPrivacyConsentIfPresent(page);
  await waitForCinematicOverlayToClear(page);

  const initialState = await collectState(page);
  assertBaseState(initialState, `${viewportName}/inicial`);
  assert(
    initialState.theme === THEME_NEON_ARCADE,
    `${viewportName}: tema inicial sem preferência salva deveria ser Neon Arcade.`,
  );

  assert(
    initialState.imageSet === IMAGE_SET_RETRO_DEFAULT,
    `${viewportName}: conjunto visual inicial não é Retro padrão.`,
  );
  assert(
    initialState.fontSet === FONT_SET_ARCADE_UI,
    `${viewportName}: fonte inicial não é Arcade.`,
  );

  await openMenu(page);
  await clickButtonByText(page, "CRT alto contraste");
  await clickButtonByText(page, "Alto contraste");
  await clickButtonByText(page, "CRT mono");
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
  await page.screenshot({ path: screenshots.contrast, fullPage: true });

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
  await clickButtonByText(page, "Pixel Sunset");
  await clickButtonByText(page, "Cabine Sunset");
  await clickButtonByText(page, "Blocos pixel");
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
    `${viewportName}: tema Pixel Sunset não aplicado.`,
  );
  assert(
    sunsetState.imageSet === IMAGE_SET_SUNSET_CABINET,
    `${viewportName}: imagens Cabine Sunset não aplicadas.`,
  );
  assert(
    sunsetState.fontSet === FONT_SET_BLOCK_PIXEL,
    `${viewportName}: fonte Blocos pixel não aplicada.`,
  );
  assert(
    sunsetState.storedTheme === THEME_PIXEL_SUNSET &&
      sunsetState.storedImageSet === IMAGE_SET_SUNSET_CABINET &&
      sunsetState.storedFontSet === FONT_SET_BLOCK_PIXEL,
    `${viewportName}: aparência Pixel Sunset não persistida.`,
  );
  await page.screenshot({ path: screenshots.sunset, fullPage: true });

  await clickButtonByText(page, "Oceano noturno");
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
  await page.screenshot({ path: screenshots.ocean, fullPage: true });

  await clickButtonByText(page, "Rubi profundo");
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
  await page.screenshot({ path: screenshots.ruby, fullPage: true });

  return {
    initialState,
    contrastState,
    reloadedContrastState,
    sunsetState,
    oceanState,
    rubyState,
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
    },
  };
  [
    reportPath,
    ...Object.values(screenshotPaths).flatMap((paths) => Object.values(paths)),
  ].forEach(ensureParentDirectory);

  const consoleProblems = [];
  const externalRequests = [];
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_EXECUTABLE_PATH,
    args: buildChromeLaunchArgs(["--no-first-run", "--no-default-browser-check"]),
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
      ),
      desktop: await validateViewport(
        page,
        targetUrl,
        "desktop",
        VIEWPORTS.desktop,
        screenshotPaths.desktop,
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
      screenshotPaths,
      results,
      externalRequests: [...new Set(externalRequests)],
      consoleProblems,
    };
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await closeBrowser(browser);
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
