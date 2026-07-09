// tests/e2e/cloudflare-theme-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import puppeteer from "puppeteer";

import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-theme-qa.json";
const DEFAULT_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-theme-fixed-default.png";
const DEFAULT_MENU_SCREENSHOT_PATH =
  "tmp/screenshots/cloudflare-theme-fixed-default-menu.png";
const THEME_STORAGE_KEY = "brikaya-theme";
const THEME_MODE_STORAGE_KEY = "brikaya-theme-mode";
const IMAGE_SET_STORAGE_KEY = "brikaya-image-set";
const FONT_SET_STORAGE_KEY = "brikaya-font-set";
const EXPECTED_THEME = "neon-arcade";
const EXPECTED_THEME_MODE = "manual";
const EXPECTED_IMAGE_SET = "retro-default";
const EXPECTED_FONT_SET = "arcade-ui";
const MENU_BUTTON_NAME = /menu/i;
const CLOSE_BUTTON_NAME = /fechar|×|✕/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

async function openMenu(page) {
  const opened = await page.evaluate((menuButtonPatternSource) => {
    const menuButtonPattern = new RegExp(menuButtonPatternSource, "i");
    const buttons = Array.from(document.querySelectorAll("button"));
    const menuButton = buttons.find((button) =>
      menuButtonPattern.test(
        button.textContent || button.getAttribute("aria-label") || "",
      ),
    );
    if (!menuButton) return false;
    menuButton.click();
    return true;
  }, MENU_BUTTON_NAME.source);
  assert(opened, "Botão Menu não encontrado.");
  await page.waitForSelector(".settings-drawer", { timeout: 10000 });
}

async function closeMenu(page) {
  await page.evaluate((closeButtonPatternSource) => {
    const closeButtonPattern = new RegExp(closeButtonPatternSource, "i");
    const buttons = Array.from(document.querySelectorAll("button"));
    buttons
      .find((button) =>
        closeButtonPattern.test(
          button.textContent || button.getAttribute("aria-label") || "",
        ),
      )
      ?.click();
  }, CLOSE_BUTTON_NAME.source);
}

async function collectAppearanceState(page) {
  return page.evaluate(
    ({ themeKey, themeModeKey, imageSetKey, fontSetKey }) => {
      const drawer = document.querySelector(".settings-drawer");
      return {
        documentTheme: document.documentElement.dataset.theme || "",
        documentImageSet: document.documentElement.dataset.imageSet || "",
        documentFontSet: document.documentElement.dataset.fontSet || "",
        storedTheme: window.localStorage.getItem(themeKey),
        storedThemeMode: window.localStorage.getItem(themeModeKey),
        storedImageSet: window.localStorage.getItem(imageSetKey),
        storedFontSet: window.localStorage.getItem(fontSetKey),
        drawerText: drawer?.textContent || "",
        appearanceOptionIds: Array.from(
          drawer?.querySelectorAll("[data-appearance-option-id]") || [],
        ).map(
          (option) => option.getAttribute("data-appearance-option-id") || "",
        ),
      };
    },
    {
      themeKey: THEME_STORAGE_KEY,
      themeModeKey: THEME_MODE_STORAGE_KEY,
      imageSetKey: IMAGE_SET_STORAGE_KEY,
      fontSetKey: FONT_SET_STORAGE_KEY,
    },
  );
}

function assertFixedAppearance(state) {
  assert(
    state.documentTheme === EXPECTED_THEME,
    `Tema do documento deveria ser ${EXPECTED_THEME}, recebeu ${state.documentTheme}.`,
  );
  assert(
    state.documentImageSet === EXPECTED_IMAGE_SET,
    `Conjunto visual deveria ser ${EXPECTED_IMAGE_SET}, recebeu ${state.documentImageSet}.`,
  );
  assert(
    state.documentFontSet === EXPECTED_FONT_SET,
    `Fonte deveria ser ${EXPECTED_FONT_SET}, recebeu ${state.documentFontSet}.`,
  );
  assert(
    state.storedTheme === EXPECTED_THEME,
    `Tema salvo deveria ser ${EXPECTED_THEME}, recebeu ${state.storedTheme}.`,
  );
  assert(
    state.storedThemeMode === EXPECTED_THEME_MODE,
    `Modo de tema salvo deveria ser ${EXPECTED_THEME_MODE}, recebeu ${state.storedThemeMode}.`,
  );
  assert(
    state.storedImageSet === EXPECTED_IMAGE_SET,
    `Conjunto salvo deveria ser ${EXPECTED_IMAGE_SET}, recebeu ${state.storedImageSet}.`,
  );
  assert(
    state.storedFontSet === EXPECTED_FONT_SET,
    `Fonte salva deveria ser ${EXPECTED_FONT_SET}, recebeu ${state.storedFontSet}.`,
  );
}

function assertAppearanceHidden(state) {
  assert(
    !state.drawerText.includes("Aparência"),
    "Menu ainda mostra seção Aparência.",
  );
  assert(
    state.appearanceOptionIds.length === 0,
    `Menu ainda mostra opções de aparência: ${state.appearanceOptionIds.join(", ")}`,
  );
  for (const hiddenLabel of [
    "Automático por fase",
    "Pôr do sol pixelado",
    "CRT alto contraste",
    "Alto contraste",
    "Blocos pixelados",
  ]) {
    assert(
      !state.drawerText.includes(hiddenLabel),
      `Menu ainda mostra opção oculta: ${hiddenLabel}.`,
    );
  }
}

async function main() {
  const publicUrl = process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
  const reportPath = process.env.BRIKAYA_THEME_QA_REPORT || DEFAULT_REPORT_PATH;
  const screenshotPath =
    process.env.BRIKAYA_THEME_QA_SCREENSHOT || DEFAULT_SCREENSHOT_PATH;
  const menuScreenshotPath =
    process.env.BRIKAYA_THEME_QA_MENU_SCREENSHOT ||
    DEFAULT_MENU_SCREENSHOT_PATH;

  ensureParentDirectory(reportPath);
  ensureParentDirectory(screenshotPath);
  ensureParentDirectory(menuScreenshotPath);

  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions());

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
    });
    await page.goto(publicUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await acceptPrivacyConsentIfPresent(page);
    await page.waitForFunction(
      (theme) => document.documentElement.dataset.theme === theme,
      { timeout: 10000 },
      EXPECTED_THEME,
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await openMenu(page);
    await page.screenshot({ path: menuScreenshotPath, fullPage: true });
    const state = await collectAppearanceState(page);
    assertFixedAppearance(state);
    assertAppearanceHidden(state);
    await closeMenu(page);

    const report = {
      publicUrl,
      checkedAt: new Date().toISOString(),
      expected: {
        theme: EXPECTED_THEME,
        themeMode: EXPECTED_THEME_MODE,
        imageSet: EXPECTED_IMAGE_SET,
        fontSet: EXPECTED_FONT_SET,
        appearanceControlsVisible: false,
      },
      state,
      screenshots: {
        game: screenshotPath,
        menu: menuScreenshotPath,
      },
    };
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`cloudflare-theme-qa ok: ${reportPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
