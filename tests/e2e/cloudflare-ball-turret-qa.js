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
const DEFAULT_MOBILE_LANDSCAPE_SCREENSHOT_PATH =
  "docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-gameplay-mobile-landscape.png";
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
const JOYSTICK_TEST_ID = "ball-turret-joystick";
const MIN_TOUCH_TARGET_SIZE = 44;
const MIN_PORTRAIT_TRACKBALL_SIZE = 120;
const MIN_LANDSCAPE_TRACKBALL_SIZE = 104;
const ACTIVE_TRAMPOLINE_ARC_MIN_SWEEP = 0.2;
const JOYSTICK_HOLD_SAMPLE_MS = 120;
const JOYSTICK_HOLD_PROOF_MS = 360;
const JOYSTICK_CONTINUOUS_TURN_MIN_DELTA = 0.08;
const DIAGONAL_TRACKBALL_AXIS_MIN = 0.68;
const DIAGONAL_TRACKBALL_AXIS_MAX = 0.74;
const DIAGONAL_TURN_RATIO_MAX = 0.92;
const BOUNDARY_SEGMENT_COUNT = 18;
const BOUNDARY_PHASE_ONE_REBOUND_SEGMENTS = 9;
const BOUNDARY_REBOUND_COLOR_FRAGMENT = "73, 255, 199";
const BOUNDARY_LOSS_COLOR_FRAGMENT = "255, 96, 120";
const VIEWPORTS = [
  {
    name: "desktop",
    joystickPlacement: "hidden",
    screenshotPath: desktopScreenshotPath(),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  },
  {
    name: "mobile-portrait",
    joystickPlacement: "below",
    minTrackballSize: MIN_PORTRAIT_TRACKBALL_SIZE,
    screenshotPath: mobileScreenshotPath(),
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "mobile-landscape",
    joystickPlacement: "right",
    minTrackballSize: MIN_LANDSCAPE_TRACKBALL_SIZE,
    screenshotPath: mobileLandscapeScreenshotPath(),
    viewport: {
      width: 844,
      height: 390,
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

function mobileLandscapeScreenshotPath() {
  return (
    process.env.BRIKAYA_BALL_TURRET_MOBILE_LANDSCAPE_SCREENSHOT ||
    DEFAULT_MOBILE_LANDSCAPE_SCREENSHOT_PATH
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

function normalizeSignedAngle(angle) {
  return (
    ((((angle + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) -
    Math.PI
  );
}

function angularDistance(startAngle, endAngle) {
  if (!Number.isFinite(startAngle) || !Number.isFinite(endAngle)) return 0;
  return Math.abs(normalizeSignedAngle(endAngle - startAngle));
}

function isDiagonalAxis(value) {
  const absoluteValue = Math.abs(value);
  return (
    absoluteValue >= DIAGONAL_TRACKBALL_AXIS_MIN &&
    absoluteValue <= DIAGONAL_TRACKBALL_AXIS_MAX
  );
}

function isPointInsideBox(point, box) {
  const tolerance = 1;
  return (
    point.x >= box.x - tolerance &&
    point.x <= box.x + box.width + tolerance &&
    point.y >= box.y - tolerance &&
    point.y <= box.y + box.height + tolerance
  );
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
        strokeStyle: String(this.strokeStyle || ""),
        lineWidth: Number(this.lineWidth || 0),
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
      joystickTestId,
      activeTrampolineArcMinSweep,
      boundaryReboundColorFragment,
      boundaryLossColorFragment,
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
      const joystick = document.querySelector(
        `[data-testid="${joystickTestId}"]`,
      );
      const joystickRect = joystick?.getBoundingClientRect();
      const joystickStyle = joystick ? getComputedStyle(joystick) : null;
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
      const brickCenters =
        brickDraws.length > 0 ? brickDraws : fallbackBrickDraws;
      const fullRingArcs = probe.arcs.filter(
        (arc) =>
          Math.abs(arc.x - centerX) < 2 &&
          Math.abs(arc.y - centerY) < 2 &&
          Math.abs(Math.abs(arc.endAngle - arc.startAngle) - Math.PI * 2) <
            fullCircleTolerance &&
          arc.radius > Math.min(canvasWidth, canvasHeight) * 0.3,
      );
      const normalizeAngle = (angle) =>
        ((((angle + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) -
        Math.PI;
      const activeTrampolineArcs = probe.arcs.filter((arc) => {
        const sweep = Math.abs(arc.endAngle - arc.startAngle);
        const strokeStyle = String(arc.strokeStyle || "");
        const isBoundarySegment =
          strokeStyle.includes(boundaryReboundColorFragment) ||
          strokeStyle.includes(boundaryLossColorFragment);
        return (
          Math.abs(arc.x - centerX) < 2 &&
          Math.abs(arc.y - centerY) < 2 &&
          !isBoundarySegment &&
          sweep > activeTrampolineArcMinSweep &&
          sweep < Math.PI * 2 - fullCircleTolerance &&
          arc.radius > Math.min(canvasWidth, canvasHeight) * 0.3
        );
      });
      const latestActiveTrampolineArc =
        activeTrampolineArcs[activeTrampolineArcs.length - 1] || null;
      const activeTrampolineCenterAngle = latestActiveTrampolineArc
        ? normalizeAngle(
            (latestActiveTrampolineArc.startAngle +
              latestActiveTrampolineArc.endAngle) /
              2,
          )
        : null;
      const boundarySegmentArcs = probe.arcs.filter((arc) => {
        const strokeStyle = String(arc.strokeStyle || "");
        return (
          Math.abs(arc.x - centerX) < 2 &&
          Math.abs(arc.y - centerY) < 2 &&
          arc.radius > Math.min(canvasWidth, canvasHeight) * 0.3 &&
          (strokeStyle.includes(boundaryReboundColorFragment) ||
            strokeStyle.includes(boundaryLossColorFragment))
        );
      });
      const uniqueBoundarySegments = new Set(
        boundarySegmentArcs.map((arc) =>
          [
            Math.round(arc.startAngle * 1000),
            Math.round(arc.endAngle * 1000),
            String(arc.strokeStyle || "").includes(
              boundaryReboundColorFragment,
            )
              ? "rebound"
              : "loss",
          ].join(":"),
        ),
      );
      const uniqueReboundBoundarySegments = new Set(
        boundarySegmentArcs
          .filter((arc) =>
            String(arc.strokeStyle || "").includes(
              boundaryReboundColorFragment,
            ),
          )
          .map((arc) =>
            [Math.round(arc.startAngle * 1000), Math.round(arc.endAngle * 1000)]
              .join(":"),
          ),
      );
      const uniqueLossBoundarySegments = new Set(
        boundarySegmentArcs
          .filter((arc) =>
            String(arc.strokeStyle || "").includes(
              boundaryLossColorFragment,
            ),
          )
          .map((arc) =>
            [Math.round(arc.startAngle * 1000), Math.round(arc.endAngle * 1000)]
              .join(":"),
          ),
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
        joystick: joystickRect
          ? {
              exists: true,
              visible:
                joystickStyle?.display !== "none" &&
                joystickStyle?.visibility !== "hidden" &&
                joystickRect.width > 0 &&
                joystickRect.height > 0,
              width: joystickRect.width,
              height: joystickRect.height,
              x: joystickRect.x,
              y: joystickRect.y,
              hasTrackballClass:
                joystick?.classList.contains("game-turret-trackball") || false,
              trackballX:
                joystickStyle
                  ?.getPropertyValue("--bb-turret-trackball-x")
                  .trim() || "",
              trackballY:
                joystickStyle
                  ?.getPropertyValue("--bb-turret-trackball-y")
                  .trim() || "",
              trackballActive:
                joystickStyle
                  ?.getPropertyValue("--bb-turret-trackball-active")
                  .trim() || "",
            }
          : {
              exists: false,
              visible: false,
              width: 0,
              height: 0,
              x: 0,
              y: 0,
              hasTrackballClass: false,
              trackballX: "",
              trackballY: "",
              trackballActive: "",
            },
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
          activeTrampolineArcCount: activeTrampolineArcs.length,
          activeTrampolineCenterAngle,
          boundarySegmentCount: uniqueBoundarySegments.size,
          reboundBoundarySegmentCount: uniqueReboundBoundarySegments.size,
          lossBoundarySegmentCount: uniqueLossBoundarySegments.size,
        },
      };
    },
    {
      internalCopyPatternSource: INTERNAL_COPY_PATTERN.source,
      gameModeHeadingPatternSource: GAME_MODE_HEADING_PATTERN.source,
      oldTurretAimCopyPatternSource: OLD_TURRET_AIM_COPY_PATTERN.source,
      brickImagePatternSource: BRICK_IMAGE_PATTERN.source,
      fullCircleTolerance: FULL_CIRCLE_TOLERANCE,
      joystickTestId: JOYSTICK_TEST_ID,
      activeTrampolineArcMinSweep: ACTIVE_TRAMPOLINE_ARC_MIN_SWEEP,
      boundaryReboundColorFragment: BOUNDARY_REBOUND_COLOR_FRAGMENT,
      boundaryLossColorFragment: BOUNDARY_LOSS_COLOR_FRAGMENT,
    },
  );
}

function assertJoystickPlacement(config, gameplayState) {
  const { canvas, joystick } = gameplayState;

  if (config.joystickPlacement === "hidden") {
    assert(
      joystick.exists && !joystick.visible,
      `${config.name}: joystick deve existir no DOM, mas ficar oculto sem toque.`,
    );
    return;
  }

  assert(joystick.exists, `${config.name}: joystick da Torreta ausente.`);
  assert(joystick.visible, `${config.name}: joystick da Torreta invisível.`);
  assert(
    joystick.width >= MIN_TOUCH_TARGET_SIZE &&
      joystick.height >= MIN_TOUCH_TARGET_SIZE,
    `${config.name}: joystick menor que alvo mínimo de toque.`,
  );
  assert(
    joystick.hasTrackballClass,
    `${config.name}: controle da Torreta não está usando visual de trackball.`,
  );
  assert(
    joystick.width >= config.minTrackballSize &&
      joystick.height >= config.minTrackballSize,
    `${config.name}: trackball da Torreta menor que o tamanho esperado.`,
  );

  if (config.joystickPlacement === "below") {
    assert(
      joystick.y >= canvas.y + canvas.height - 1,
      `${config.name}: joystick não está abaixo do tabuleiro em portrait.`,
    );
  }

  if (config.joystickPlacement === "right") {
    assert(
      joystick.x >= canvas.x + canvas.width - 1,
      `${config.name}: joystick não está à direita do tabuleiro em landscape.`,
    );
  }
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

async function dispatchJoystickPointer(page, type, point) {
  await page.evaluate(
    ({ joystickTestId, eventType, clientPoint }) => {
      const joystick = document.querySelector(
        `[data-testid="${joystickTestId}"]`,
      );
      if (!joystick) return false;

      joystick.dispatchEvent(
        new PointerEvent(eventType, {
          bubbles: true,
          cancelable: true,
          clientX: clientPoint.x,
          clientY: clientPoint.y,
          isPrimary: true,
          pointerId: 17,
          pointerType: "touch",
        }),
      );
      return true;
    },
    {
      joystickTestId: JOYSTICK_TEST_ID,
      eventType: type,
      clientPoint: point,
    },
  );
}

async function exerciseJoystick(page) {
  const joystickHandle = await page.$(`[data-testid="${JOYSTICK_TEST_ID}"]`);
  const box = await joystickHandle?.boundingBox();
  if (!box || box.width === 0 || box.height === 0) {
    return {
      exercised: false,
      pathWithinControl: false,
      rightHoldAngularDelta: 0,
      rightUpHoldAngularDelta: 0,
      leftDownHoldAngularDelta: 0,
      leftHoldAngularDelta: 0,
      path: [],
    };
  }

  const center = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
  const right = { x: box.x + box.width * 0.95, y: box.y + box.height * 0.5 };
  const topRight = {
    x: box.x + box.width * 0.95,
    y: box.y + box.height * 0.05,
  };
  const bottomRight = {
    x: box.x + box.width * 0.95,
    y: box.y + box.height * 0.95,
  };
  const left = { x: box.x + box.width * 0.05, y: box.y + box.height * 0.5 };
  const bottomLeft = {
    x: box.x + box.width * 0.05,
    y: box.y + box.height * 0.95,
  };
  const topLeft = { x: box.x + box.width * 0.05, y: box.y + box.height * 0.05 };
  const top = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.05 };
  const bottom = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.95 };
  const path = [
    center,
    right,
    topRight,
    top,
    topLeft,
    left,
    bottomLeft,
    bottom,
    bottomRight,
    center,
  ];

  await dispatchJoystickPointer(page, "pointerdown", center);
  await dispatchJoystickPointer(page, "pointermove", right);
  const rightVisualState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_SAMPLE_MS));
  const rightStartState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_PROOF_MS));
  const rightHoldState = await readBallTurretState(page);

  await dispatchJoystickPointer(page, "pointermove", topRight);
  const topRightVisualState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_SAMPLE_MS));
  const topRightStartState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_PROOF_MS));
  const topRightHoldState = await readBallTurretState(page);

  await dispatchJoystickPointer(page, "pointermove", bottomLeft);
  const bottomLeftVisualState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_SAMPLE_MS));
  const bottomLeftStartState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_PROOF_MS));
  const bottomLeftHoldState = await readBallTurretState(page);

  await dispatchJoystickPointer(page, "pointermove", left);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_SAMPLE_MS));
  const leftStartState = await readBallTurretState(page);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_HOLD_PROOF_MS));
  const leftHoldState = await readBallTurretState(page);

  await dispatchJoystickPointer(page, "pointermove", top);
  const topVisualState = await readBallTurretState(page);
  await dispatchJoystickPointer(page, "pointermove", topLeft);
  const topLeftVisualState = await readBallTurretState(page);
  await dispatchJoystickPointer(page, "pointermove", bottom);
  const bottomVisualState = await readBallTurretState(page);
  await dispatchJoystickPointer(page, "pointermove", bottomRight);
  const bottomRightVisualState = await readBallTurretState(page);
  await dispatchJoystickPointer(page, "pointermove", center);
  await dispatchJoystickPointer(page, "pointerup", center);
  const releaseState = await readBallTurretState(page);

  return {
    exercised: true,
    pathWithinControl: path.every((point) => isPointInsideBox(point, box)),
    rightVisualX: Number(rightVisualState.joystick.trackballX),
    topVisualY: Number(topVisualState.joystick.trackballY),
    bottomVisualY: Number(bottomVisualState.joystick.trackballY),
    leftVisualX: Number(leftStartState.joystick.trackballX),
    topRightVisual: {
      x: Number(topRightVisualState.joystick.trackballX),
      y: Number(topRightVisualState.joystick.trackballY),
    },
    topLeftVisual: {
      x: Number(topLeftVisualState.joystick.trackballX),
      y: Number(topLeftVisualState.joystick.trackballY),
    },
    bottomLeftVisual: {
      x: Number(bottomLeftVisualState.joystick.trackballX),
      y: Number(bottomLeftVisualState.joystick.trackballY),
    },
    bottomRightVisual: {
      x: Number(bottomRightVisualState.joystick.trackballX),
      y: Number(bottomRightVisualState.joystick.trackballY),
    },
    releaseVisual: {
      x: Number(releaseState.joystick.trackballX),
      y: Number(releaseState.joystick.trackballY),
      active: Number(releaseState.joystick.trackballActive),
    },
    rightHoldAngularDelta: angularDistance(
      rightStartState.probe.activeTrampolineCenterAngle,
      rightHoldState.probe.activeTrampolineCenterAngle,
    ),
    rightUpHoldAngularDelta: angularDistance(
      topRightStartState.probe.activeTrampolineCenterAngle,
      topRightHoldState.probe.activeTrampolineCenterAngle,
    ),
    leftDownHoldAngularDelta: angularDistance(
      bottomLeftStartState.probe.activeTrampolineCenterAngle,
      bottomLeftHoldState.probe.activeTrampolineCenterAngle,
    ),
    leftHoldAngularDelta: angularDistance(
      leftStartState.probe.activeTrampolineCenterAngle,
      leftHoldState.probe.activeTrampolineCenterAngle,
    ),
    path,
  };
}

async function runViewport(page, baseUrl, config) {
  await page.setViewport(config.viewport);
  await page.goto(scenarioUrl(baseUrl), {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await acceptPrivacyConsentIfPresent(page);
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector("canvas");
      const rect = canvas?.getBoundingClientRect();
      return Boolean(rect && rect.width > 0 && rect.height > 0);
    },
    { timeout: 10000 },
  );
  await page.waitForFunction(
    (fullCircleTolerance) => {
      const canvas = document.querySelector("canvas");
      const canvasWidth = canvas?.width || 0;
      const canvasHeight = canvas?.height || 0;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      return (window.__brikayaBallTurretProbe?.arcs || []).some(
        (arc) =>
          Math.abs(arc.x - centerX) < 2 &&
          Math.abs(arc.y - centerY) < 2 &&
          Math.abs(Math.abs(arc.endAngle - arc.startAngle) - Math.PI * 2) <
            fullCircleTolerance &&
          arc.radius > Math.min(canvasWidth, canvasHeight) * 0.3,
      );
    },
    { timeout: 5000 },
    FULL_CIRCLE_TOLERANCE,
  );

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
    gameplayState.probe.boundarySegmentCount === BOUNDARY_SEGMENT_COUNT &&
      gameplayState.probe.reboundBoundarySegmentCount ===
        BOUNDARY_PHASE_ONE_REBOUND_SEGMENTS &&
      gameplayState.probe.lossBoundarySegmentCount ===
        BOUNDARY_SEGMENT_COUNT - BOUNDARY_PHASE_ONE_REBOUND_SEGMENTS,
    `${config.name}: borda da Torreta não mostra 50% de segmentos rebatedores em cor distinta.`,
  );
  assert(
    gameplayState.probe.brickDrawCount > 0 &&
      gameplayState.probe.brickQuadrants.left &&
      gameplayState.probe.brickQuadrants.right &&
      gameplayState.probe.brickQuadrants.top &&
      gameplayState.probe.brickQuadrants.bottom,
    `${config.name}: blocos da Torreta não cobrem quatro quadrantes.`,
  );
  assertJoystickPlacement(config, gameplayState);

  ensureParentDirectory(config.screenshotPath);
  await page.screenshot({ path: config.screenshotPath, fullPage: true });

  await exerciseTrampoline(page);
  const joystickExercise = await exerciseJoystick(page);
  assert(
    config.joystickPlacement === "hidden" || joystickExercise.exercised,
    `${config.name}: joystick visível não respondeu ao exercício.`,
  );
  assert(
    config.joystickPlacement === "hidden" || joystickExercise.pathWithinControl,
    `${config.name}: joystick exigiu arraste fora do controle.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      joystickExercise.rightVisualX > 0.6,
    `${config.name}: trackball não exibiu pressão visual à direita.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      joystickExercise.leftVisualX < -0.6,
    `${config.name}: trackball não exibiu pressão visual à esquerda.`,
  );
  assert(
    config.joystickPlacement === "hidden" || joystickExercise.topVisualY < -0.6,
    `${config.name}: trackball não exibiu profundidade visual para cima.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      joystickExercise.bottomVisualY > 0.6,
    `${config.name}: trackball não exibiu profundidade visual para baixo.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (isDiagonalAxis(joystickExercise.topRightVisual.x) &&
        isDiagonalAxis(joystickExercise.topRightVisual.y) &&
        joystickExercise.topRightVisual.x > 0 &&
        joystickExercise.topRightVisual.y < 0),
    `${config.name}: trackball não normalizou diagonal superior direita.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (isDiagonalAxis(joystickExercise.topLeftVisual.x) &&
        isDiagonalAxis(joystickExercise.topLeftVisual.y) &&
        joystickExercise.topLeftVisual.x < 0 &&
        joystickExercise.topLeftVisual.y < 0),
    `${config.name}: trackball não normalizou diagonal superior esquerda.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (isDiagonalAxis(joystickExercise.bottomLeftVisual.x) &&
        isDiagonalAxis(joystickExercise.bottomLeftVisual.y) &&
        joystickExercise.bottomLeftVisual.x < 0 &&
        joystickExercise.bottomLeftVisual.y > 0),
    `${config.name}: trackball não normalizou diagonal inferior esquerda.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (isDiagonalAxis(joystickExercise.bottomRightVisual.x) &&
        isDiagonalAxis(joystickExercise.bottomRightVisual.y) &&
        joystickExercise.bottomRightVisual.x > 0 &&
        joystickExercise.bottomRightVisual.y > 0),
    `${config.name}: trackball não normalizou diagonal inferior direita.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (joystickExercise.releaseVisual.x === 0 &&
        joystickExercise.releaseVisual.y === 0 &&
        joystickExercise.releaseVisual.active === 0),
    `${config.name}: trackball não resetou visualmente ao soltar.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      joystickExercise.rightHoldAngularDelta >
        JOYSTICK_CONTINUOUS_TURN_MIN_DELTA,
    `${config.name}: joystick à direita não girou a cama elástica continuamente.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (joystickExercise.rightUpHoldAngularDelta >
        JOYSTICK_CONTINUOUS_TURN_MIN_DELTA &&
        joystickExercise.rightUpHoldAngularDelta <
          joystickExercise.rightHoldAngularDelta * DIAGONAL_TURN_RATIO_MAX),
    `${config.name}: diagonal superior direita não girou com intensidade normalizada.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      (joystickExercise.leftDownHoldAngularDelta >
        JOYSTICK_CONTINUOUS_TURN_MIN_DELTA &&
        joystickExercise.leftDownHoldAngularDelta <
          joystickExercise.leftHoldAngularDelta * DIAGONAL_TURN_RATIO_MAX),
    `${config.name}: diagonal inferior esquerda não mudou rumo com intensidade normalizada.`,
  );
  assert(
    config.joystickPlacement === "hidden" ||
      joystickExercise.leftHoldAngularDelta >
        JOYSTICK_CONTINUOUS_TURN_MIN_DELTA,
    `${config.name}: joystick à esquerda não girou a cama elástica continuamente.`,
  );
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

  return {
    name: config.name,
    joystickPlacement: config.joystickPlacement,
    joystickExercise,
    menuState,
    gameplayState,
    postExerciseState,
  };
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
      mobileLandscape: mobileLandscapeScreenshotPath(),
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
