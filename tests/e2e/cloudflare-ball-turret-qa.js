import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildChromeLaunchArgs } from "./chromeLaunchArgs.js";
import { acceptPrivacyConsentIfPresent } from "./consentHelpers.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/";
const DEFAULT_REPORT_PATH =
  "docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-public-qa.json";
const DEFAULT_DESKTOP_SCREENSHOT_PATH =
  "docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-gameplay-desktop.png";
const DEFAULT_MOBILE_SCREENSHOT_PATH =
  "docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-gameplay-mobile.png";
const DEFAULT_MENU_SCREENSHOT_PATH =
  "docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-menu.png";
const CHROME_EXECUTABLE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const QA_SCENARIO = "ball-turret";
const MENU_BUTTON_PATTERN = /menu/i;
const GAME_MODE_HEADING_PATTERN = /modo de jogo|game mode/i;
const TURRET_BUTTON_PATTERN = /torreta|turret/i;
const CLASSIC_BUTTON_PATTERN = /clássico|classic/i;
const INTERNAL_COPY_PATTERN =
  /service worker|cache|runtime|localStorage|IndexedDB|Canvas|engine|build/i;
const OLD_TURRET_AIM_COPY_PATTERN = /mire|aim|reticle|crosshair|metralhadora/i;
const BRICK_IMAGE_PATTERN = /\/bricks\/|spr-brick/i;
const FULL_CIRCLE_TOLERANCE = 0.08;
const VIEWPORTS = [
  {
    name: "desktop",
    screenshotPath: desktopScreenshotPath(),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  },
  {
    name: "mobile",
    screenshotPath: mobileScreenshotPath(),
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  },
];

function publicUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

function reportPath() {
  return process.env.BRIKAYA_BALL_TURRET_QA_REPORT || DEFAULT_REPORT_PATH;
}

function menuScreenshotPath() {
  return (
    process.env.BRIKAYA_BALL_TURRET_MENU_SCREENSHOT ||
    DEFAULT_MENU_SCREENSHOT_PATH
  );
}

function desktopScreenshotPath() {
  return (
    process.env.BRIKAYA_BALL_TURRET_DESKTOP_SCREENSHOT ||
    DEFAULT_DESKTOP_SCREENSHOT_PATH
  );
}

function mobileScreenshotPath() {
  return (
    process.env.BRIKAYA_BALL_TURRET_MOBILE_SCREENSHOT ||
    DEFAULT_MOBILE_SCREENSHOT_PATH
  );
}

function scenarioUrl(baseUrl) {
  const url = new URL(baseUrl);
  url.searchParams.set("qaScenario", QA_SCENARIO);
  return url.toString();
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function clickButtonByPattern(page, patternSource) {
  return page.evaluate((source) => {
    const pattern = new RegExp(source, "i");
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) =>
        pattern.test(candidate.textContent || "") ||
        pattern.test(candidate.getAttribute("aria-label") || ""),
    );
    if (!button) return false;
    button.click();
    return true;
  }, patternSource);
}

async function installCanvasProbe(page) {
  await page.evaluateOnNewDocument(() => {
    const originalArc = CanvasRenderingContext2D.prototype.arc;
    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;

    window.__brikayaBallTurretProbe = {
      arcs: [],
      drawImages: [],
      fillRects: [],
    };

    CanvasRenderingContext2D.prototype.arc = function patchedArc(
      x,
      y,
      radius,
      startAngle,
      endAngle,
      ...rest
    ) {
      window.__brikayaBallTurretProbe?.arcs.push({
        x,
        y,
        radius,
        startAngle,
        endAngle,
      });
      return originalArc.call(
        this,
        x,
        y,
        radius,
        startAngle,
        endAngle,
        ...rest,
      );
    };

    CanvasRenderingContext2D.prototype.drawImage = function patchedDrawImage(
      image,
      ...args
    ) {
      const drawArgs = Array.from(args);
      const targetOffset = drawArgs.length >= 8 ? 4 : 0;
      const x = Number(drawArgs[targetOffset]);
      const y = Number(drawArgs[targetOffset + 1]);
      const width = Number(drawArgs[targetOffset + 2] ?? image?.width ?? 0);
      const height = Number(drawArgs[targetOffset + 3] ?? image?.height ?? 0);
      const src = image?.currentSrc || image?.src || "";

      if (Number.isFinite(x) && Number.isFinite(y)) {
        window.__brikayaBallTurretProbe?.drawImages.push({
          src,
          x,
          y,
          width,
          height,
        });
      }

      return originalDrawImage.call(this, image, ...args);
    };

    CanvasRenderingContext2D.prototype.fillRect = function patchedFillRect(
      x,
      y,
      width,
      height,
    ) {
      window.__brikayaBallTurretProbe?.fillRects.push({
        x,
        y,
        width,
        height,
      });
      return originalFillRect.call(this, x, y, width, height);
    };
  });
}

async function readBallTurretState(page) {
  return page.evaluate(
    ({
      internalCopyPatternSource,
      gameModeHeadingPatternSource,
      oldTurretAimCopyPatternSource,
      brickImagePatternSource,
      fullCircleTolerance,
    }) => {
      const internalCopyPattern = new RegExp(internalCopyPatternSource, "i");
      const oldTurretAimCopyPattern = new RegExp(
        oldTurretAimCopyPatternSource,
        "i",
      );
      const brickImagePattern = new RegExp(brickImagePatternSource, "i");
      const gameModeHeadingPattern = new RegExp(
        gameModeHeadingPatternSource,
        "i",
      );
      const canvas = document.querySelector("canvas");
      const canvasRect = canvas?.getBoundingClientRect();
      const canvasWidth = canvas?.width || 0;
      const canvasHeight = canvas?.height || 0;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const scoreHud = document.querySelector(".score-hud");
      const headings = Array.from(document.querySelectorAll("h1,h2,h3")).map(
        (heading) => heading.textContent?.trim() || "",
      );
      const buttons = Array.from(document.querySelectorAll("button")).map(
        (button) => ({
          text: button.textContent?.trim() || "",
          ariaLabel: button.getAttribute("aria-label") || "",
          ariaPressed: button.getAttribute("aria-pressed"),
        }),
      );
      const probe = window.__brikayaBallTurretProbe || {
        arcs: [],
        drawImages: [],
        fillRects: [],
      };
      const brickDraws = probe.drawImages
        .filter((draw) => brickImagePattern.test(draw.src))
        .map((draw) => ({
          x: draw.x + draw.width / 2,
          y: draw.y + draw.height / 2,
        }));
      const fallbackBrickDraws = probe.fillRects
        .filter(
          (draw) =>
            draw.width > 0 &&
            draw.height > 0 &&
            draw.width < canvasWidth * 0.5 &&
            draw.height < canvasHeight * 0.5,
        )
        .map((draw) => ({
          x: draw.x + draw.width / 2,
          y: draw.y + draw.height / 2,
        }));
      const brickCenters = brickDraws.length > 0 ? brickDraws : fallbackBrickDraws;
      const fullRingArcs = probe.arcs.filter(
        (arc) =>
          Math.abs(arc.x - centerX) < 2 &&
          Math.abs(arc.y - centerY) < 2 &&
          Math.abs(
            Math.abs(arc.endAngle - arc.startAngle) - Math.PI * 2,
          ) < fullCircleTolerance &&
          arc.radius > Math.min(canvasWidth, canvasHeight) * 0.3,
      );

      return {
        title: document.title,
        headings,
        hasGameModeHeading: headings.some((heading) =>
          gameModeHeadingPattern.test(heading),
        ),
        buttons,
        hasCanvas: Boolean(canvas),
        canvas: canvasRect
          ? {
              width: canvasRect.width,
              height: canvasRect.height,
              x: canvasRect.x,
              y: canvasRect.y,
            }
          : null,
        scoreHudText: scoreHud?.textContent || "",
        bodyHasInternalCopy: internalCopyPattern.test(
          document.body.textContent || "",
        ),
        bodyHasOldAimCopy: oldTurretAimCopyPattern.test(
          document.body.textContent || "",
        ),
        probe: {
          brickDrawCount: brickCenters.length,
          brickQuadrants: {
            left: brickCenters.some((point) => point.x < centerX),
            right: brickCenters.some((point) => point.x > centerX),
            top: brickCenters.some((point) => point.y < centerY),
            bottom: brickCenters.some((point) => point.y > centerY),
          },
          fullRingArcCount: fullRingArcs.length,
        },
      };
    },
    {
      internalCopyPatternSource: INTERNAL_COPY_PATTERN.source,
      gameModeHeadingPatternSource: GAME_MODE_HEADING_PATTERN.source,
      oldTurretAimCopyPatternSource: OLD_TURRET_AIM_COPY_PATTERN.source,
      brickImagePatternSource: BRICK_IMAGE_PATTERN.source,
      fullCircleTolerance: FULL_CIRCLE_TOLERANCE,
    },
  );
}

async function exerciseTrampoline(page) {
  const canvasHandle = await page.$("canvas");
  const box = await canvasHandle?.boundingBox();
  if (!box) return;

  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.move(box.x + box.width * 0.28, box.y + box.height * 0.72);
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.72);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowRight");
}

async function runViewport(page, baseUrl, config) {
  await page.setViewport(config.viewport);
  await page.goto(scenarioUrl(baseUrl), {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await acceptPrivacyConsentIfPresent(page);
  await exerciseTrampoline(page);

  const menuOpened = await clickButtonByPattern(
    page,
    MENU_BUTTON_PATTERN.source,
  );
  assert(menuOpened, `${config.name}: botão Menu não encontrado.`);
  await page.waitForFunction(
    (source) => {
      const pattern = new RegExp(source, "i");
      return Array.from(document.querySelectorAll("h2,h3")).some((heading) =>
        pattern.test(heading.textContent || ""),
      );
    },
    { timeout: 5000 },
    GAME_MODE_HEADING_PATTERN.source,
  );

  const menuState = await readBallTurretState(page);
  assert(
    menuState.hasGameModeHeading,
    `${config.name}: seletor de modo ausente.`,
  );
  assert(
    menuState.buttons.some((button) => TURRET_BUTTON_PATTERN.test(button.text)),
    `${config.name}: botão Torreta ausente.`,
  );
  assert(
    menuState.buttons.some((button) =>
      CLASSIC_BUTTON_PATTERN.test(button.text),
    ),
    `${config.name}: botão Clássico ausente.`,
  );
  if (config.name === "desktop") {
    ensureParentDirectory(menuScreenshotPath());
    await page.screenshot({ path: menuScreenshotPath(), fullPage: true });
  }

  await clickButtonByPattern(page, TURRET_BUTTON_PATTERN.source);
  await page.waitForSelector("aside.settings-drawer", {
    hidden: true,
    timeout: 5000,
  });
  await new Promise((resolve) => setTimeout(resolve, 180));

  const gameplayState = await readBallTurretState(page);
  assert(gameplayState.hasCanvas, `${config.name}: canvas ausente.`);
  assert(
    gameplayState.canvas?.width > 0 && gameplayState.canvas?.height > 0,
    `${config.name}: canvas sem tamanho visível.`,
  );
  assert(
    /fase|level/i.test(gameplayState.scoreHudText),
    `${config.name}: HUD de fase não visível.`,
  );
  assert(
    !gameplayState.bodyHasInternalCopy,
    `${config.name}: cópia pública expõe detalhe técnico.`,
  );
  assert(
    !gameplayState.bodyHasOldAimCopy,
    `${config.name}: cópia pública ainda fala em mira/metralhadora.`,
  );
  assert(
    gameplayState.probe.fullRingArcCount > 0,
    `${config.name}: cama elástica/anel 360° não foi desenhado.`,
  );
  assert(
    gameplayState.probe.brickDrawCount > 0 &&
      gameplayState.probe.brickQuadrants.left &&
      gameplayState.probe.brickQuadrants.right &&
      gameplayState.probe.brickQuadrants.top &&
      gameplayState.probe.brickQuadrants.bottom,
    `${config.name}: blocos da Torreta não cobrem quatro quadrantes.`,
  );

  ensureParentDirectory(config.screenshotPath);
  await page.screenshot({ path: config.screenshotPath, fullPage: true });

  await exerciseTrampoline(page);
  await new Promise((resolve) => setTimeout(resolve, 120));
  const postExerciseState = await readBallTurretState(page);
  assert(
    !postExerciseState.bodyHasInternalCopy,
    `${config.name}: cópia pública expõe detalhe técnico após controle.`,
  );
  assert(
    !postExerciseState.bodyHasOldAimCopy,
    `${config.name}: cópia pública ainda fala em mira/metralhadora após controle.`,
  );

  return { name: config.name, menuState, gameplayState, postExerciseState };
}

async function run() {
  const baseUrl = publicUrl();
  const browser = await puppeteer.launch({
    executablePath: CHROME_EXECUTABLE_PATH,
    headless: "new",
    args: buildChromeLaunchArgs([]),
  });
  const results = [];

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    await installCanvasProbe(page);
    for (const viewportConfig of VIEWPORTS) {
      results.push(await runViewport(page, baseUrl, viewportConfig));
    }
  } finally {
    await browser.close();
  }

  const report = {
    checkedAt: new Date().toISOString(),
    publicUrl: scenarioUrl(baseUrl),
    qaScenario: QA_SCENARIO,
    results,
    screenshots: {
      menu: menuScreenshotPath(),
      desktop: desktopScreenshotPath(),
      mobile: mobileScreenshotPath(),
    },
  };
  ensureParentDirectory(reportPath());
  writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`ball-turret qa ok: ${reportPath()}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
