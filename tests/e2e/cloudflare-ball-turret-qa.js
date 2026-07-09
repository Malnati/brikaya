import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer";

import { buildPuppeteerLaunchOptions } from "./browserLauncher.js";
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
const DEFAULT_DIAGNOSTIC_SCREENSHOT_PATH =
  "docs/assets/issues/joystick-diagnostic-log/evidence/evi-joystick-diagnostic-mobile.png";
const QA_SCENARIO = "ball-turret";
const MENU_BUTTON_PATTERN = /menu/i;
const CLOSE_MENU_PATTERN = /fechar menu|close menu/i;
const GAME_MODE_HEADING_PATTERN = /modo de jogo|game mode/i;
const GAME_MODE_OPTION_PATTERN = /^(torreta|turret|clássico|classic)$/i;
const JOYSTICK_DIAGNOSTIC_TOGGLE_PATTERN =
  /registrar controle da torreta|record turret control/i;
const JOYSTICK_DIAGNOSTIC_DOWNLOAD_PATTERN =
  /baixar registro da torreta|download turret record/i;
const JOYSTICK_DIAGNOSTIC_CLEAR_PATTERN =
  /limpar registro da torreta|clear turret record/i;
const INTERNAL_COPY_PATTERN =
  /service worker|cache|runtime|localStorage|IndexedDB|Canvas|engine|build/i;
const OLD_TURRET_AIM_COPY_PATTERN = /mire|aim|reticle|crosshair|metralhadora/i;
const BRICK_IMAGE_PATTERN = /\/bricks\/|spr-brick/i;
const ORIENTATION_BLOCKER_TEST_ID = "mobile-orientation-blocker";
const ORIENTATION_BLOCKER_MESSAGE = "Você precisa de espaço para o joystick";
const FULL_CIRCLE_TOLERANCE = 0.08;
const JOYSTICK_TEST_ID = "ball-turret-joystick";
const CONTROL_TOGGLE_TEST_ID = "ball-turret-control-toggle";
const DUAL_SWITCHES_TEST_ID = "ball-turret-dual-switches";
const LEFT_SWITCH_TEST_ID = "ball-turret-switch-left";
const RIGHT_SWITCH_TEST_ID = "ball-turret-switch-right";
const START_MODAL_TEST_ID = "ball-turret-start-modal";
const START_MODAL_TITLE_PATTERN = /pronto para jogar|ready to play/i;
const JOYSTICK_DIAGNOSTIC_JOYSTICK_LAYER_TEST_ID =
  "joystick-diagnostic-joystick-layer";
const JOYSTICK_DIAGNOSTIC_PLAYFIELD_LAYER_TEST_ID =
  "joystick-diagnostic-playfield-layer";
const MIN_TOUCH_TARGET_SIZE = 44;
const SWITCH_MIN_HEIGHT = 190;
const SWITCH_COMPACT_MIN_HEIGHT = 150;
const ACTIVE_TRAMPOLINE_ARC_MIN_SWEEP = 0.2;
const JOYSTICK_SETTLE_MS = 120;
const JOYSTICK_STABILITY_PROOF_MS = 300;
const JOYSTICK_TRACKBALL_EDGE_AXIS_MIN = 0.95;
const JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN = 0.65;
const JOYSTICK_ABSOLUTE_ANGLE_TOLERANCE = 0.24;
const JOYSTICK_HOLD_MAX_ANGLE_DELTA = 0.04;
const JOYSTICK_LOWER_HALF_CENTER_RATIO = 0.75;
const JOYSTICK_LOWER_HALF_CENTER_TOLERANCE_PX = 18;
const JOYSTICK_MAX_TRACKBALL_SIZE = 132;
const JOYSTICK_MIN_RESPONSIVE_TRACKBALL_SIZE = 72;
const SWITCH_MIN_PLAYFIELD_GAP_PX = 48;
const SWITCH_MAX_EDGE_GAP_PX = 36;
const DUAL_SWITCH_HOLD_MS = 760;
const DUAL_SWITCH_DIRECTION_HOLD_MS = 120;
const DUAL_SWITCH_CENTER_HOLD_MS = 220;
const DUAL_SWITCH_EDGE_HOLD_MS = 220;
const DUAL_SWITCH_SETTLE_MS = 160;
const DUAL_SWITCH_MOVEMENT_MIN_SIN_DELTA = 0.08;
const DUAL_SWITCH_STABLE_MAX_SIN_DELTA = 0.05;
const BOUNDARY_SEGMENT_COUNT = 4;
const BOUNDARY_PHASE_ONE_REBOUND_SEGMENTS = 2;
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
    joystickPlacement: "hidden",
    switchPlacement: "portrait-edges",
    expectSecondaryJoystick: true,
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
    name: "mobile-portrait-compact",
    joystickPlacement: "hidden",
    switchPlacement: "portrait-edges",
    expectSecondaryJoystick: true,
    screenshotPath: compactMobileScreenshotPath(),
    viewport: {
      width: 480,
      height: 640,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "mobile-landscape",
    joystickPlacement: "blocked",
    orientationBlocked: true,
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

function compactMobileScreenshotPath() {
  return (
    process.env.BRIKAYA_BALL_TURRET_COMPACT_MOBILE_SCREENSHOT ||
    "docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-gameplay-mobile-compact.png"
  );
}

function mobileLandscapeScreenshotPath() {
  return (
    process.env.BRIKAYA_BALL_TURRET_MOBILE_LANDSCAPE_SCREENSHOT ||
    DEFAULT_MOBILE_LANDSCAPE_SCREENSHOT_PATH
  );
}

function diagnosticScreenshotPath() {
  return (
    process.env.BRIKAYA_JOYSTICK_DIAGNOSTIC_SCREENSHOT ||
    DEFAULT_DIAGNOSTIC_SCREENSHOT_PATH
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

function debugLog(...args) {
  if (process.env.BRIKAYA_E2E_DEBUG === "1") {
    console.log("[ball-turret-qa]", ...args);
  }
}

async function closeBrowser(browser) {
  try {
    await Promise.race([
      browser.close(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("browser-close-timeout")), 5000);
      }),
    ]);
  } catch (error) {
    debugLog("browser", String(error?.message || error));
    browser.process()?.kill("SIGKILL");
  }
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

function isEdgeAxis(value) {
  return Math.abs(value) >= JOYSTICK_TRACKBALL_EDGE_AXIS_MIN;
}

function joystickExpectedAngle(horizontalRatio, verticalRatio, canvasMetrics) {
  if (horizontalRatio === 0.5 && verticalRatio === 0.5) return null;
  return normalizeSignedAngle(
    Math.atan2(
      (verticalRatio - 0.5) * canvasMetrics.height,
      (horizontalRatio - 0.5) * canvasMetrics.width,
    ),
  );
}

function isAngleNear(actualAngle, expectedAngle) {
  return (
    Number.isFinite(actualAngle) &&
    Number.isFinite(expectedAngle) &&
    angularDistance(expectedAngle, actualAngle) <=
      JOYSTICK_ABSOLUTE_ANGLE_TOLERANCE
  );
}

function isPointInsideJoystickCircle(point, box) {
  const tolerance = 1;
  const radius = Math.min(box.width, box.height) / 2;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  return Math.hypot(point.x - centerX, point.y - centerY) <= radius + tolerance;
}

async function clickButtonByPattern(page, patternSource) {
  return page.evaluate((source) => {
    const pattern = new RegExp(source, "i");
    const control = Array.from(document.querySelectorAll("button,a")).find(
      (candidate) =>
        pattern.test(candidate.textContent || "") ||
        pattern.test(candidate.getAttribute("aria-label") || ""),
    );
    if (!control) return false;
    control.click();
    return true;
  }, patternSource);
}

async function installCanvasProbe(page) {
  await page.evaluateOnNewDocument(() => {
    const originalArc = CanvasRenderingContext2D.prototype.arc;
    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    const originalEllipse = CanvasRenderingContext2D.prototype.ellipse;
    const originalFillRect = CanvasRenderingContext2D.prototype.fillRect;

    window.__brikayaBallTurretProbe = {
      arcs: [],
      drawImages: [],
      ellipses: [],
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
        const transform = this.getTransform?.();
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        window.__brikayaBallTurretProbe?.drawImages.push({
          src,
          x,
          y,
          screenX: transform
            ? transform.a * centerX + transform.c * centerY + transform.e
            : centerX,
          screenY: transform
            ? transform.b * centerX + transform.d * centerY + transform.f
            : centerY,
          width,
          height,
        });
      }

      return originalDrawImage.call(this, image, ...args);
    };

    CanvasRenderingContext2D.prototype.ellipse = function patchedEllipse(
      x,
      y,
      radiusX,
      radiusY,
      rotation,
      startAngle,
      endAngle,
      ...rest
    ) {
      const transform = this.getTransform?.();
      window.__brikayaBallTurretProbe?.ellipses.push({
        x,
        y,
        screenX: transform
          ? transform.a * x + transform.c * y + transform.e
          : x,
        screenY: transform
          ? transform.b * x + transform.d * y + transform.f
          : y,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        endAngle,
        fillStyle: String(this.fillStyle || ""),
      });
      return originalEllipse.call(
        this,
        x,
        y,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        endAngle,
        ...rest,
      );
    };

    CanvasRenderingContext2D.prototype.fillRect = function patchedFillRect(
      x,
      y,
      width,
      height,
    ) {
      const transform = this.getTransform?.();
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      window.__brikayaBallTurretProbe?.fillRects.push({
        x,
        y,
        screenX: transform
          ? transform.a * centerX + transform.c * centerY + transform.e
          : centerX,
        screenY: transform
          ? transform.b * centerX + transform.d * centerY + transform.f
          : centerY,
        width,
        height,
      });
      return originalFillRect.call(this, x, y, width, height);
    };
  });
}

async function resetCanvasProbe(page) {
  await page.evaluate(() => {
    const probe = window.__brikayaBallTurretProbe;
    if (!probe) return;

    probe.arcs = [];
    probe.drawImages = [];
    probe.ellipses = [];
    probe.fillRects = [];
  });
}

async function installJoystickDiagnosticDownloadProbe(page) {
  await page.evaluateOnNewDocument(() => {
    window.__brikayaJoystickDiagnosticDownloads = [];
    window.__brikayaJoystickDiagnosticAnchorClicks = [];

    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = originalCreateObjectURL(blob);

      if (blob?.type === "application/json") {
        const record = {
          href: url,
          type: blob.type,
          size: blob.size,
          text: null,
          parsed: null,
          error: null,
        };

        window.__brikayaJoystickDiagnosticDownloads.push(record);
        blob
          .text()
          .then((text) => {
            record.text = text;
            try {
              record.parsed = JSON.parse(text);
            } catch (error) {
              record.error = String(error?.message || error);
            }
          })
          .catch((error) => {
            record.error = String(error?.message || error);
          });
      }

      return url;
    };

    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedAnchorClick() {
      if (this.download && this.href) {
        window.__brikayaJoystickDiagnosticAnchorClicks.push({
          download: this.download,
          href: this.href,
        });
        if (
          /brikaya-(?:torreta-joystick|joystick-diagnostic)-/.test(
            this.download,
          )
        ) {
          return undefined;
        }
      }

      return originalAnchorClick.call(this);
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
      controlToggleTestId,
      dualSwitchesTestId,
      leftSwitchTestId,
      rightSwitchTestId,
      startModalTestId,
      startModalTitlePatternSource,
      orientationBlockerTestId,
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
      const startModalTitlePattern = new RegExp(
        startModalTitlePatternSource,
        "i",
      );
      const gameModeHeadingPattern = new RegExp(
        gameModeHeadingPatternSource,
        "i",
      );
      const canvas = document.querySelector("canvas");
      const canvasRect = canvas?.getBoundingClientRect();
      const joystick = document.querySelector(
        `[data-testid="${joystickTestId}"]`,
      );
      const controlToggle = document.querySelector(
        `[data-testid="${controlToggleTestId}"]`,
      );
      const dualSwitches = document.querySelector(
        `[data-testid="${dualSwitchesTestId}"]`,
      );
      const leftSwitch = document.querySelector(
        `[data-testid="${leftSwitchTestId}"]`,
      );
      const rightSwitch = document.querySelector(
        `[data-testid="${rightSwitchTestId}"]`,
      );
      const startModal = document.querySelector(
        `[data-testid="${startModalTestId}"]`,
      );
      const orientationBlocker = document.querySelector(
        `[data-testid="${orientationBlockerTestId}"]`,
      );
      const joystickRect = joystick?.getBoundingClientRect();
      const joystickStyle = joystick ? getComputedStyle(joystick) : null;
      const readControlState = (element) => {
        const rect = element?.getBoundingClientRect();
        const style = element ? getComputedStyle(element) : null;

        return rect
          ? {
              exists: true,
              visible:
                style?.display !== "none" &&
                style?.visibility !== "hidden" &&
                !element.hasAttribute("hidden") &&
                rect.width > 0 &&
                rect.height > 0,
              width: rect.width,
              height: rect.height,
              x: rect.x,
              y: rect.y,
              bottom: rect.bottom,
              text: element.textContent?.trim() || "",
              ariaLabel: element.getAttribute("aria-label") || "",
              hidden: element.hasAttribute("hidden"),
              switchDirection: element.dataset?.switchDirection || "",
            }
          : {
              exists: false,
              visible: false,
              width: 0,
              height: 0,
              x: 0,
              y: 0,
              bottom: 0,
              text: "",
              ariaLabel: "",
              hidden: false,
              switchDirection: "",
            };
      };
      const orientationBlockerRect =
        orientationBlocker?.getBoundingClientRect();
      const startModalRect = startModal?.getBoundingClientRect();
      const orientationBlockerStyle = orientationBlocker
        ? getComputedStyle(orientationBlocker)
        : null;
      const startModalStyle = startModal ? getComputedStyle(startModal) : null;
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
        ellipses: [],
        fillRects: [],
      };
      const brickDraws = probe.drawImages
        .filter((draw) => brickImagePattern.test(draw.src))
        .map((draw) => ({
          x: Number.isFinite(draw.screenX)
            ? draw.screenX
            : draw.x + draw.width / 2,
          y: Number.isFinite(draw.screenY)
            ? draw.screenY
            : draw.y + draw.height / 2,
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
          x: Number.isFinite(draw.screenX)
            ? draw.screenX
            : draw.x + draw.width / 2,
          y: Number.isFinite(draw.screenY)
            ? draw.screenY
            : draw.y + draw.height / 2,
        }));
      const fallbackEllipseBrickDraws = (probe.ellipses || [])
        .filter(
          (draw) =>
            draw.radiusX > 0 &&
            draw.radiusY > 0 &&
            draw.radiusX < canvasWidth * 0.25 &&
            draw.radiusY < canvasHeight * 0.25 &&
            Math.abs(Math.abs(draw.endAngle - draw.startAngle) - Math.PI * 2) <
              fullCircleTolerance,
        )
        .map((draw) => ({
          x: Number.isFinite(draw.screenX) ? draw.screenX : draw.x,
          y: Number.isFinite(draw.screenY) ? draw.screenY : draw.y,
        }));
      const brickCenters =
        brickDraws.length > 0
          ? brickDraws
          : fallbackBrickDraws.length > 0
            ? fallbackBrickDraws
            : fallbackEllipseBrickDraws;
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
      const activeTrampolineBySide = activeTrampolineArcs.reduce(
        (accumulator, arc) => {
          const centerAngle = normalizeAngle(
            (arc.startAngle + arc.endAngle) / 2,
          );
          const side = Math.cos(centerAngle) < 0 ? "left" : "right";
          accumulator[side] = centerAngle;
          return accumulator;
        },
        { left: null, right: null },
      );
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
            String(arc.strokeStyle || "").includes(boundaryReboundColorFragment)
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
            [
              Math.round(arc.startAngle * 1000),
              Math.round(arc.endAngle * 1000),
            ].join(":"),
          ),
      );
      const uniqueLossBoundarySegments = new Set(
        boundarySegmentArcs
          .filter((arc) =>
            String(arc.strokeStyle || "").includes(boundaryLossColorFragment),
          )
          .map((arc) =>
            [
              Math.round(arc.startAngle * 1000),
              Math.round(arc.endAngle * 1000),
            ].join(":"),
          ),
      );
      return {
        title: document.title,
        headings,
        hasGameModeHeading: headings.some((heading) =>
          gameModeHeadingPattern.test(heading),
        ),
        buttons,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        hasCanvas: Boolean(canvas),
        canvas: canvasRect
          ? {
              width: canvasRect.width,
              height: canvasRect.height,
              x: canvasRect.x,
              y: canvasRect.y,
            }
          : null,
        orientationBlocker: orientationBlockerRect
          ? {
              exists: true,
              visible:
                orientationBlockerStyle?.display !== "none" &&
                orientationBlockerStyle?.visibility !== "hidden" &&
                orientationBlockerRect.width > 0 &&
                orientationBlockerRect.height > 0,
              role: orientationBlocker.getAttribute("role") || "",
              ariaLabel: orientationBlocker.getAttribute("aria-label") || "",
              text: orientationBlocker.textContent?.trim() || "",
              width: orientationBlockerRect.width,
              height: orientationBlockerRect.height,
              x: orientationBlockerRect.x,
              y: orientationBlockerRect.y,
            }
          : {
              exists: false,
              visible: false,
              role: "",
              ariaLabel: "",
              text: "",
              width: 0,
              height: 0,
              x: 0,
              y: 0,
            },
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
              bottom: joystickRect.bottom,
              centerY: joystickRect.y + joystickRect.height / 2,
              hasTrackballClass:
                joystick?.classList.contains("game-turret-trackball") || false,
              trackballSize:
                joystickStyle
                  ?.getPropertyValue("--bb-turret-trackball-size")
                  .trim() || "",
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
              bottom: 0,
              centerY: 0,
              hasTrackballClass: false,
              trackballSize: "",
              trackballX: "",
              trackballY: "",
              trackballActive: "",
            },
        controlToggle: readControlState(controlToggle),
        dualSwitches: readControlState(dualSwitches),
        leftSwitch: readControlState(leftSwitch),
        rightSwitch: readControlState(rightSwitch),
        startModal: startModalRect
          ? {
              exists: true,
              visible:
                startModalStyle?.display !== "none" &&
                startModalStyle?.visibility !== "hidden" &&
                startModalRect.width > 0 &&
                startModalRect.height > 0,
              role: startModal.getAttribute("role") || "",
              ariaLabel: startModal.getAttribute("aria-label") || "",
              text: startModal.textContent?.trim() || "",
              hasTitle: startModalTitlePattern.test(
                startModal.textContent || "",
              ),
              x: startModalRect.x,
              y: startModalRect.y,
              width: startModalRect.width,
              height: startModalRect.height,
            }
          : {
              exists: false,
              visible: false,
              role: "",
              ariaLabel: "",
              text: "",
              hasTitle: false,
              x: 0,
              y: 0,
              width: 0,
              height: 0,
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
          leftActiveTrampolineCenterAngle: activeTrampolineBySide.left,
          rightActiveTrampolineCenterAngle: activeTrampolineBySide.right,
          hasLeftActiveTrampoline: Number.isFinite(activeTrampolineBySide.left),
          hasRightActiveTrampoline: Number.isFinite(
            activeTrampolineBySide.right,
          ),
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
      controlToggleTestId: CONTROL_TOGGLE_TEST_ID,
      dualSwitchesTestId: DUAL_SWITCHES_TEST_ID,
      leftSwitchTestId: LEFT_SWITCH_TEST_ID,
      rightSwitchTestId: RIGHT_SWITCH_TEST_ID,
      startModalTestId: START_MODAL_TEST_ID,
      startModalTitlePatternSource: START_MODAL_TITLE_PATTERN.source,
      orientationBlockerTestId: ORIENTATION_BLOCKER_TEST_ID,
      activeTrampolineArcMinSweep: ACTIVE_TRAMPOLINE_ARC_MIN_SWEEP,
      boundaryReboundColorFragment: BOUNDARY_REBOUND_COLOR_FRAGMENT,
      boundaryLossColorFragment: BOUNDARY_LOSS_COLOR_FRAGMENT,
    },
  );
}

async function readJoystickDiagnosticState(page) {
  return page.evaluate(
    ({
      joystickLayerTestId,
      playfieldLayerTestId,
      togglePatternSource,
      downloadPatternSource,
      clearPatternSource,
    }) => {
      const togglePattern = new RegExp(togglePatternSource, "i");
      const downloadPattern = new RegExp(downloadPatternSource, "i");
      const clearPattern = new RegExp(clearPatternSource, "i");
      const joystickLayer = document.querySelector(
        `[data-testid="${joystickLayerTestId}"]`,
      );
      const playfieldLayer = document.querySelector(
        `[data-testid="${playfieldLayerTestId}"]`,
      );
      const controls = Array.from(document.querySelectorAll("button,a,label"));
      const toggleControl = controls.find((control) =>
        togglePattern.test(control.textContent || ""),
      );
      const downloadControl = controls.find(
        (control) =>
          downloadPattern.test(control.textContent || "") ||
          downloadPattern.test(control.getAttribute("aria-label") || ""),
      );
      const clearControl = controls.find(
        (control) =>
          clearPattern.test(control.textContent || "") ||
          clearPattern.test(control.getAttribute("aria-label") || ""),
      );
      const readLayer = (layer) => {
        const rect = layer?.getBoundingClientRect();
        return {
          exists: Boolean(layer),
          visible: Boolean(
            layer &&
            rect &&
            rect.width > 0 &&
            rect.height > 0 &&
            getComputedStyle(layer).display !== "none" &&
            getComputedStyle(layer).visibility !== "hidden",
          ),
          pointCount: layer?.querySelectorAll("circle").length || 0,
          lineCount: layer?.querySelectorAll("polyline").length || 0,
        };
      };

      return {
        joystickLayer: readLayer(joystickLayer),
        playfieldLayer: readLayer(playfieldLayer),
        toggleExists: Boolean(toggleControl),
        downloadExists: Boolean(downloadControl),
        clearExists: Boolean(clearControl),
        downloadButtonDisabled: downloadControl
          ? downloadControl.tagName.toLowerCase() === "button"
            ? Boolean(downloadControl.disabled)
            : false
          : null,
      };
    },
    {
      joystickLayerTestId: JOYSTICK_DIAGNOSTIC_JOYSTICK_LAYER_TEST_ID,
      playfieldLayerTestId: JOYSTICK_DIAGNOSTIC_PLAYFIELD_LAYER_TEST_ID,
      togglePatternSource: JOYSTICK_DIAGNOSTIC_TOGGLE_PATTERN.source,
      downloadPatternSource: JOYSTICK_DIAGNOSTIC_DOWNLOAD_PATTERN.source,
      clearPatternSource: JOYSTICK_DIAGNOSTIC_CLEAR_PATTERN.source,
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
    assert(
      joystick.y >= canvas.y + canvas.height + JOYSTICK_MIN_PLAYFIELD_GAP - 1,
      `${config.name}: joystick ficou próximo demais da área do jogo.`,
    );
  }

  if (config.expectLowerHalfCenter) {
    const expectedCenterY =
      gameplayState.viewport.height * JOYSTICK_LOWER_HALF_CENTER_RATIO;
    assert(
      Math.abs(joystick.centerY - expectedCenterY) <=
        JOYSTICK_LOWER_HALF_CENTER_TOLERANCE_PX,
      `${config.name}: centro do joystick não ficou no meio da metade inferior da tela.`,
    );
  }

  if (config.expectJoystickShrink) {
    assert(
      joystick.width < JOYSTICK_MAX_TRACKBALL_SIZE &&
        joystick.height < JOYSTICK_MAX_TRACKBALL_SIZE,
      `${config.name}: joystick não reduziu quando disputou espaço com o jogo.`,
    );
    assert(
      joystick.bottom <= gameplayState.viewport.height,
      `${config.name}: joystick reduzido saiu da viewport.`,
    );
  }

  if (config.joystickPlacement === "right") {
    assert(
      joystick.x >= canvas.x + canvas.width - 1,
      `${config.name}: joystick não está à direita do tabuleiro em landscape.`,
    );
  }
}

function assertDefaultSwitchControls(config, gameplayState) {
  const {
    canvas,
    viewport,
    controlToggle,
    dualSwitches,
    leftSwitch,
    rightSwitch,
  } = gameplayState;

  assert(
    controlToggle.exists && controlToggle.visible,
    `${config.name}: setinha para trocar controle ausente.`,
  );
  assert(
    controlToggle.text.includes("Joystick"),
    `${config.name}: setinha não indica troca para joystick.`,
  );
  assert(
    dualSwitches.exists && dualSwitches.visible,
    `${config.name}: interruptores devem aparecer por padrão.`,
  );
  assert(
    leftSwitch.exists &&
      leftSwitch.visible &&
      rightSwitch.exists &&
      rightSwitch.visible,
    `${config.name}: interruptores esquerdo/direito não estão visíveis.`,
  );
  assert(
    leftSwitch.width >= MIN_TOUCH_TARGET_SIZE &&
      leftSwitch.height >= MIN_TOUCH_TARGET_SIZE &&
      rightSwitch.width >= MIN_TOUCH_TARGET_SIZE &&
      rightSwitch.height >= MIN_TOUCH_TARGET_SIZE,
    `${config.name}: interruptores menores que alvo mínimo de toque.`,
  );
  const expectedSwitchHeight = config.name.includes("compact")
    ? SWITCH_COMPACT_MIN_HEIGHT
    : SWITCH_MIN_HEIGHT;
  assert(
    leftSwitch.height >= expectedSwitchHeight &&
      rightSwitch.height >= expectedSwitchHeight,
    `${config.name}: interruptores não ganharam altura suficiente.`,
  );
  assert(
    gameplayState.joystick.exists && !gameplayState.joystick.visible,
    `${config.name}: joystick deve ficar oculto por padrão.`,
  );
  assert(
    gameplayState.probe.hasLeftActiveTrampoline &&
      gameplayState.probe.hasRightActiveTrampoline,
    `${config.name}: duas camas elásticas não aparecem no primeiro estado.`,
  );
  assert(
    gameplayState.startModal.exists &&
      gameplayState.startModal.visible &&
      gameplayState.startModal.role === "dialog" &&
      gameplayState.startModal.hasTitle,
    `${config.name}: modal inicial legível da Torreta não apareceu.`,
  );

  if (config.switchPlacement === "portrait-edges") {
    const canvasBottom = canvas.y + canvas.height;
    const leftGap = leftSwitch.x;
    const rightGap = viewport.width - (rightSwitch.x + rightSwitch.width);

    assert(
      leftSwitch.y >= canvasBottom + SWITCH_MIN_PLAYFIELD_GAP_PX - 1 &&
        rightSwitch.y >= canvasBottom + SWITCH_MIN_PLAYFIELD_GAP_PX - 1,
      `${config.name}: interruptores não respeitam 0,5in abaixo do jogo.`,
    );
    assert(
      leftGap <= SWITCH_MAX_EDGE_GAP_PX && rightGap <= SWITCH_MAX_EDGE_GAP_PX,
      `${config.name}: interruptores não ficaram próximos das bordas laterais.`,
    );
    assert(
      rightSwitch.x - (leftSwitch.x + leftSwitch.width) >=
        viewport.width * 0.45,
      `${config.name}: interruptores ficaram próximos demais entre si.`,
    );
  }
}

async function setJoystickDiagnosticsEnabled(page, config) {
  debugLog(config.name, "validando registro oculto");
  const menuOpened = await clickButtonByPattern(
    page,
    MENU_BUTTON_PATTERN.source,
  );
  assert(menuOpened, `${config.name}: botão Menu não encontrado.`);
  await page.waitForFunction(
    () => Boolean(document.querySelector("#game-settings-menu")),
    { timeout: 5000 },
  );

  const initialState = await readJoystickDiagnosticState(page);
  const bodyHasDiagnosticCopy = await page.evaluate((togglePatternSource) => {
    const togglePattern = new RegExp(togglePatternSource, "i");
    return togglePattern.test(document.body.textContent || "");
  }, JOYSTICK_DIAGNOSTIC_TOGGLE_PATTERN.source);

  assert(
    !initialState.toggleExists &&
      !initialState.downloadExists &&
      !initialState.clearExists,
    `${config.name}: menu expôs controles internos do registro da Torreta.`,
  );
  assert(
    initialState.downloadButtonDisabled === null,
    `${config.name}: download interno da Torreta deve ficar oculto.`,
  );
  assert(
    !bodyHasDiagnosticCopy,
    `${config.name}: texto de registro da Torreta ficou visível.`,
  );

  const closeClicked = await clickButtonByPattern(
    page,
    CLOSE_MENU_PATTERN.source,
  );
  assert(closeClicked, `${config.name}: botão de fechar menu não encontrado.`);
  await page.waitForFunction(
    () => !document.querySelector("#game-settings-menu"),
    { timeout: 5000 },
  );

  return {
    defaultEnabled: false,
    controlsHidden: true,
    enabledForExercise: false,
  };
}

async function waitForOrientationBlocker(page, config) {
  debugLog(config.name, "aguardando bloqueio de orientação");
  await page.waitForFunction(
    ({ blockerTestId, expectedMessage }) => {
      const blocker = document.querySelector(
        `[data-testid="${blockerTestId}"]`,
      );
      const rect = blocker?.getBoundingClientRect();
      return Boolean(
        blocker &&
        rect &&
        rect.width >= window.innerWidth * 0.98 &&
        rect.height >= window.innerHeight * 0.98 &&
        blocker.getAttribute("role") === "alertdialog" &&
        blocker.getAttribute("aria-label") === expectedMessage &&
        blocker.textContent?.includes(expectedMessage),
      );
    },
    { timeout: 10000 },
    {
      blockerTestId: ORIENTATION_BLOCKER_TEST_ID,
      expectedMessage: ORIENTATION_BLOCKER_MESSAGE,
    },
  );

  debugLog(config.name, "lendo estado bloqueado");
  const blockedState = await readBallTurretState(page);
  assert(
    blockedState.hasCanvas,
    `${config.name}: canvas ausente sob bloqueio.`,
  );
  assert(
    blockedState.orientationBlocker.exists &&
      blockedState.orientationBlocker.visible,
    `${config.name}: bloqueio portrait não ficou visível.`,
  );
  assert(
    blockedState.orientationBlocker.text.includes(ORIENTATION_BLOCKER_MESSAGE),
    `${config.name}: mensagem de bloqueio portrait incorreta.`,
  );
  assert(
    blockedState.orientationBlocker.role === "alertdialog",
    `${config.name}: bloqueio portrait sem role alertdialog.`,
  );
  assert(
    blockedState.orientationBlocker.width >=
      blockedState.viewport.width * 0.98 &&
      blockedState.orientationBlocker.height >=
        blockedState.viewport.height * 0.98,
    `${config.name}: bloqueio portrait não cobre a tela.`,
  );
  assert(
    !blockedState.bodyHasInternalCopy,
    `${config.name}: cópia pública expõe detalhe técnico durante bloqueio.`,
  );
  assert(
    !blockedState.bodyHasOldAimCopy,
    `${config.name}: cópia pública ainda fala em mira/metralhadora durante bloqueio.`,
  );

  ensureParentDirectory(config.screenshotPath);
  debugLog(config.name, "capturando screenshot de orientação");
  await page.screenshot({ path: config.screenshotPath, fullPage: true });
  debugLog(config.name, "screenshot de orientação capturado");

  return {
    name: config.name,
    joystickPlacement: config.joystickPlacement,
    orientationBlocked: true,
    joystickExercise: {
      exercised: false,
      skippedReason: "mobile landscape bloqueado por portrait obrigatório",
    },
    dualSwitchExercise: {
      exercised: false,
      skippedReason: "mobile landscape bloqueado por portrait obrigatório",
    },
    menuState: null,
    gameplayState: blockedState,
    postExerciseState: blockedState,
  };
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

async function readJoystickHitTarget(page, point) {
  return page.evaluate(
    ({ clientPoint, joystickTestId }) => {
      const target = document.elementFromPoint(clientPoint.x, clientPoint.y);
      const joystick = document.querySelector(
        `[data-testid="${joystickTestId}"]`,
      );
      const targetTestId =
        target instanceof Element ? target.getAttribute("data-testid") : "";
      return {
        hitsJoystick: Boolean(target && joystick && joystick.contains(target)),
        tagName: target?.tagName || "",
        className: String(target?.className || ""),
        testId: targetTestId || "",
      };
    },
    {
      clientPoint: point,
      joystickTestId: JOYSTICK_TEST_ID,
    },
  );
}

async function dispatchJoystickTouch(touchClient, type, point) {
  const touchTypeByPointerType = {
    pointerdown: "touchStart",
    pointermove: "touchMove",
    pointerup: "touchEnd",
    pointercancel: "touchCancel",
  };
  const touchType = touchTypeByPointerType[type];
  if (!touchType) {
    throw new Error(`Evento de toque do joystick não suportado: ${type}`);
  }

  const touchPoints =
    touchType === "touchEnd" || touchType === "touchCancel"
      ? []
      : [
          {
            x: point.x,
            y: point.y,
            id: 17,
            radiusX: 1,
            radiusY: 1,
            force: 1,
          },
        ];

  await touchClient.send("Input.dispatchTouchEvent", {
    type: touchType,
    touchPoints,
  });
}

async function exerciseJoystick(page) {
  const joystickHandle = await page.$(`[data-testid="${JOYSTICK_TEST_ID}"]`);
  const box = await joystickHandle?.boundingBox();
  if (!box || box.width === 0 || box.height === 0) {
    return {
      exercised: false,
      pathWithinControl: false,
      angleChecks: {},
      holdStableAngleDelta: 0,
      outsideIgnoredCheck: {
        angleUnchanged: false,
        visualUnchanged: false,
        outsideAngleRejected: false,
        beforeVisual: { x: 0, y: 0 },
        afterVisual: { x: 0, y: 0 },
      },
      releaseVisual: { x: 0, y: 0, active: 0 },
      hitTarget: {
        hitsJoystick: false,
        tagName: "",
        className: "",
        testId: "",
      },
      path: [],
    };
  }

  const canvasMetrics = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    return {
      width: canvas?.width || 1,
      height: canvas?.height || 1,
    };
  });
  const pointAt = (horizontalRatio, verticalRatio) => ({
    x: box.x + box.width * horizontalRatio,
    y: box.y + box.height * verticalRatio,
    horizontalRatio,
    verticalRatio,
    expectedAngle: joystickExpectedAngle(
      horizontalRatio,
      verticalRatio,
      canvasMetrics,
    ),
  });
  const center = pointAt(0.5, 0.5);
  const right = pointAt(1, 0.5);
  const topRight = pointAt(0.85, 0.15);
  const bottomRight = pointAt(0.85, 0.85);
  const left = pointAt(0, 0.5);
  const bottomLeft = pointAt(0.15, 0.85);
  const topLeft = pointAt(0.15, 0.15);
  const top = pointAt(0.5, 0);
  const bottom = pointAt(0.5, 1);
  const lowerLeftArc = pointAt(0.2, 0.9);
  const outsideCircleInsideBox = {
    x: box.x,
    y: box.y + box.height,
    expectedAngle: joystickExpectedAngle(0, 1, canvasMetrics),
  };
  const outsideTopRight = {
    x: box.x + box.width * 1.35,
    y: box.y - box.height * 0.35,
    expectedAngle: joystickExpectedAngle(1, 0, canvasMetrics),
  };
  const path = [
    center,
    right,
    topRight,
    top,
    topLeft,
    left,
    bottomLeft,
    bottom,
    lowerLeftArc,
    bottomRight,
    center,
  ];
  const hitTarget = await readJoystickHitTarget(page, lowerLeftArc);
  const touchClient = await page.target().createCDPSession();

  const moveAndRead = async (point) => {
    await dispatchJoystickTouch(touchClient, "pointermove", point);
    await new Promise((resolve) => setTimeout(resolve, JOYSTICK_SETTLE_MS));
    const state = await readBallTurretState(page);
    return {
      actualAngle: state.probe.activeTrampolineCenterAngle,
      expectedAngle: point.expectedAngle,
      angleMatches: isAngleNear(
        state.probe.activeTrampolineCenterAngle,
        point.expectedAngle,
      ),
      visual: {
        x: Number(state.joystick.trackballX),
        y: Number(state.joystick.trackballY),
      },
    };
  };

  await dispatchJoystickTouch(touchClient, "pointerdown", center);
  await new Promise((resolve) => setTimeout(resolve, JOYSTICK_SETTLE_MS));

  const rightCheck = await moveAndRead(right);
  await new Promise((resolve) =>
    setTimeout(resolve, JOYSTICK_STABILITY_PROOF_MS),
  );
  const rightHoldState = await readBallTurretState(page);
  const topRightCheck = await moveAndRead(topRight);
  const bottomLeftCheck = await moveAndRead(bottomLeft);
  const leftCheck = await moveAndRead(left);
  const topCheck = await moveAndRead(top);
  const topLeftCheck = await moveAndRead(topLeft);
  const bottomCheck = await moveAndRead(bottom);
  const lowerLeftArcCheck = await moveAndRead(lowerLeftArc);
  const outsideCircleInsideBoxCheck = await moveAndRead(outsideCircleInsideBox);
  const outsideCircleInsideBoxIgnoredCheck = {
    angleUnchanged:
      angularDistance(
        lowerLeftArcCheck.actualAngle,
        outsideCircleInsideBoxCheck.actualAngle,
      ) <= JOYSTICK_HOLD_MAX_ANGLE_DELTA,
    visualUnchanged:
      lowerLeftArcCheck.visual.x === outsideCircleInsideBoxCheck.visual.x &&
      lowerLeftArcCheck.visual.y === outsideCircleInsideBoxCheck.visual.y,
    outsideAngleRejected: !outsideCircleInsideBoxCheck.angleMatches,
    beforeVisual: lowerLeftArcCheck.visual,
    afterVisual: outsideCircleInsideBoxCheck.visual,
    expectedIgnoredAngle: outsideCircleInsideBoxCheck.expectedAngle,
    actualAngleAfterIgnoredMove: outsideCircleInsideBoxCheck.actualAngle,
  };
  const bottomRightCheck = await moveAndRead(bottomRight);
  const outsideCheck = await moveAndRead(outsideTopRight);
  const outsideIgnoredCheck = {
    angleUnchanged:
      angularDistance(bottomRightCheck.actualAngle, outsideCheck.actualAngle) <=
      JOYSTICK_HOLD_MAX_ANGLE_DELTA,
    visualUnchanged:
      bottomRightCheck.visual.x === outsideCheck.visual.x &&
      bottomRightCheck.visual.y === outsideCheck.visual.y,
    outsideAngleRejected: !outsideCheck.angleMatches,
    beforeVisual: bottomRightCheck.visual,
    afterVisual: outsideCheck.visual,
    expectedIgnoredAngle: outsideCheck.expectedAngle,
    actualAngleAfterIgnoredMove: outsideCheck.actualAngle,
  };
  await dispatchJoystickTouch(touchClient, "pointermove", center);
  await dispatchJoystickTouch(touchClient, "pointerup", center);
  const releaseState = await readBallTurretState(page);

  return {
    exercised: true,
    hitTarget,
    pathWithinControl: path.every((point) =>
      isPointInsideJoystickCircle(point, box),
    ),
    angleChecks: {
      right: rightCheck,
      topRight: topRightCheck,
      bottomLeft: bottomLeftCheck,
      left: leftCheck,
      top: topCheck,
      topLeft: topLeftCheck,
      bottom: bottomCheck,
      lowerLeftArc: lowerLeftArcCheck,
      bottomRight: bottomRightCheck,
    },
    holdStableAngleDelta: angularDistance(
      rightCheck.actualAngle,
      rightHoldState.probe.activeTrampolineCenterAngle,
    ),
    outsideIgnoredCheck,
    outsideCircleInsideBoxIgnoredCheck,
    rightVisualX: rightCheck.visual.x,
    topVisualY: topCheck.visual.y,
    bottomVisualY: bottomCheck.visual.y,
    leftVisualX: leftCheck.visual.x,
    topRightVisual: topRightCheck.visual,
    topLeftVisual: topLeftCheck.visual,
    bottomLeftVisual: bottomLeftCheck.visual,
    bottomRightVisual: bottomRightCheck.visual,
    releaseVisual: {
      x: Number(releaseState.joystick.trackballX),
      y: Number(releaseState.joystick.trackballY),
      active: Number(releaseState.joystick.trackballActive),
    },
    path,
  };
}

function angleVerticalValue(angle) {
  return Number.isFinite(angle) ? Math.sin(angle) : Number.NaN;
}

function movedUp(beforeAngle, afterAngle) {
  return (
    Number.isFinite(beforeAngle) &&
    Number.isFinite(afterAngle) &&
    angleVerticalValue(afterAngle) <
      angleVerticalValue(beforeAngle) - DUAL_SWITCH_MOVEMENT_MIN_SIN_DELTA
  );
}

function movedDown(beforeAngle, afterAngle) {
  return (
    Number.isFinite(beforeAngle) &&
    Number.isFinite(afterAngle) &&
    angleVerticalValue(afterAngle) >
      angleVerticalValue(beforeAngle) + DUAL_SWITCH_MOVEMENT_MIN_SIN_DELTA
  );
}

function stayedVerticallyStable(beforeAngle, afterAngle) {
  return (
    Number.isFinite(beforeAngle) &&
    Number.isFinite(afterAngle) &&
    Math.abs(
      angleVerticalValue(afterAngle) - angleVerticalValue(beforeAngle),
    ) <= DUAL_SWITCH_STABLE_MAX_SIN_DELTA
  );
}

async function readSwitchHitTarget(page, switchTestId, point) {
  return page.evaluate(
    ({ testId, clientPoint }) => {
      const target = document.elementFromPoint(clientPoint.x, clientPoint.y);
      const switchElement = document.querySelector(`[data-testid="${testId}"]`);
      const targetTestId =
        target instanceof Element ? target.getAttribute("data-testid") : "";

      return {
        hitsSwitch: Boolean(
          target && switchElement && switchElement.contains(target),
        ),
        tagName: target?.tagName || "",
        className: String(target?.className || ""),
        testId: targetTestId || "",
      };
    },
    {
      testId: switchTestId,
      clientPoint: point,
    },
  );
}

async function holdSwitch(
  page,
  switchTestId,
  verticalRatio,
  holdMs = DUAL_SWITCH_HOLD_MS,
) {
  const switchHandle = await page.$(`[data-testid="${switchTestId}"]`);
  const box = await switchHandle?.boundingBox();
  if (!box || box.width === 0 || box.height === 0) {
    return {
      exercised: false,
      hitTarget: {
        hitsSwitch: false,
        tagName: "",
        className: "",
        testId: "",
      },
    };
  }

  const point = {
    x: box.x + box.width / 2,
    y: box.y + box.height * verticalRatio,
  };
  const hitTarget = await readSwitchHitTarget(page, switchTestId, point);

  await switchHandle.evaluate(
    (element, { clientPoint, holdMs }) =>
      new Promise((resolve) => {
        const pointerId = 31;
        const dispatchPointer = (type) => {
          element.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              clientX: clientPoint.x,
              clientY: clientPoint.y,
              pointerId,
              pointerType: "mouse",
              isPrimary: true,
            }),
          );
        };

        dispatchPointer("pointerdown");
        window.setTimeout(() => {
          dispatchPointer("pointerup");
          resolve(undefined);
        }, holdMs);
      }),
    { clientPoint: point, holdMs },
  );
  await new Promise((resolve) => setTimeout(resolve, DUAL_SWITCH_SETTLE_MS));

  return {
    exercised: true,
    hitTarget,
  };
}

async function exerciseDualSwitches(page) {
  await page.waitForFunction(
    ({ dualSwitchesTestId, leftSwitchTestId, rightSwitchTestId }) => {
      const dualSwitches = document.querySelector(
        `[data-testid="${dualSwitchesTestId}"]`,
      );
      const leftSwitch = document.querySelector(
        `[data-testid="${leftSwitchTestId}"]`,
      );
      const rightSwitch = document.querySelector(
        `[data-testid="${rightSwitchTestId}"]`,
      );
      const visible = (element) => {
        const rect = element?.getBoundingClientRect();
        const style = element ? getComputedStyle(element) : null;
        return Boolean(
          element &&
          rect &&
          rect.width > 0 &&
          rect.height > 0 &&
          !element.hasAttribute("hidden") &&
          style?.display !== "none" &&
          style?.visibility !== "hidden",
        );
      };

      return (
        visible(dualSwitches) && visible(leftSwitch) && visible(rightSwitch)
      );
    },
    { timeout: 5000 },
    {
      dualSwitchesTestId: DUAL_SWITCHES_TEST_ID,
      leftSwitchTestId: LEFT_SWITCH_TEST_ID,
      rightSwitchTestId: RIGHT_SWITCH_TEST_ID,
    },
  );

  await resetCanvasProbe(page);
  await new Promise((resolve) => setTimeout(resolve, DUAL_SWITCH_SETTLE_MS));
  const initialState = await readBallTurretState(page);

  await resetCanvasProbe(page);
  const leftSwitchCenterExercise = await holdSwitch(
    page,
    LEFT_SWITCH_TEST_ID,
    0.48,
    DUAL_SWITCH_CENTER_HOLD_MS,
  );
  const afterLeftCenterState = await readBallTurretState(page);

  await resetCanvasProbe(page);
  const leftSwitchExercise = await holdSwitch(
    page,
    LEFT_SWITCH_TEST_ID,
    0.08,
    DUAL_SWITCH_EDGE_HOLD_MS,
  );
  const afterLeftState = await readBallTurretState(page);

  await resetCanvasProbe(page);
  const rightSwitchExercise = await holdSwitch(
    page,
    RIGHT_SWITCH_TEST_ID,
    0.92,
    DUAL_SWITCH_EDGE_HOLD_MS,
  );
  const afterRightState = await readBallTurretState(page);

  const initialLeftAngle = initialState.probe.leftActiveTrampolineCenterAngle;
  const initialRightAngle = initialState.probe.rightActiveTrampolineCenterAngle;
  const afterLeftCenterLeftAngle =
    afterLeftCenterState.probe.leftActiveTrampolineCenterAngle;
  const afterLeftCenterRightAngle =
    afterLeftCenterState.probe.rightActiveTrampolineCenterAngle;
  const afterLeftLeftAngle =
    afterLeftState.probe.leftActiveTrampolineCenterAngle;
  const afterLeftRightAngle =
    afterLeftState.probe.rightActiveTrampolineCenterAngle;
  const afterRightLeftAngle =
    afterRightState.probe.leftActiveTrampolineCenterAngle;
  const afterRightRightAngle =
    afterRightState.probe.rightActiveTrampolineCenterAngle;

  return {
    exercised: true,
    controlsVisible:
      initialState.controlToggle.visible &&
      initialState.dualSwitches.visible &&
      initialState.leftSwitch.visible &&
      initialState.rightSwitch.visible,
    joystickHidden:
      initialState.joystick.exists && !initialState.joystick.visible,
    twoTrampolinesVisible:
      initialState.probe.hasLeftActiveTrampoline &&
      initialState.probe.hasRightActiveTrampoline,
    leftSwitchCenterExercise,
    leftSwitchExercise,
    rightSwitchExercise,
    leftSwitchCenterBarelyMoved:
      stayedVerticallyStable(initialLeftAngle, afterLeftCenterLeftAngle) &&
      stayedVerticallyStable(initialRightAngle, afterLeftCenterRightAngle),
    leftSwitchMovedOnlyLeft:
      movedUp(afterLeftCenterLeftAngle, afterLeftLeftAngle) &&
      stayedVerticallyStable(afterLeftCenterRightAngle, afterLeftRightAngle),
    rightSwitchMovedOnlyRight:
      movedDown(afterLeftRightAngle, afterRightRightAngle) &&
      stayedVerticallyStable(afterLeftLeftAngle, afterRightLeftAngle),
    angles: {
      initialLeftAngle,
      initialRightAngle,
      afterLeftCenterLeftAngle,
      afterLeftCenterRightAngle,
      afterLeftLeftAngle,
      afterLeftRightAngle,
      afterRightLeftAngle,
      afterRightRightAngle,
    },
  };
}

async function exerciseSecondaryJoystick(page, config) {
  if (!config.expectSecondaryJoystick) {
    return {
      exercised: false,
      skippedReason: "joystick secundário não exigido neste viewport",
    };
  }

  await page.click(`[data-testid="${CONTROL_TOGGLE_TEST_ID}"]`);
  await page.waitForFunction(
    ({ joystickTestId, dualSwitchesTestId }) => {
      const joystick = document.querySelector(
        `[data-testid="${joystickTestId}"]`,
      );
      const dualSwitches = document.querySelector(
        `[data-testid="${dualSwitchesTestId}"]`,
      );
      const joystickRect = joystick?.getBoundingClientRect();
      const joystickStyle = joystick ? getComputedStyle(joystick) : null;
      return Boolean(
        joystick &&
        joystickRect &&
        joystickRect.width > 0 &&
        joystickRect.height > 0 &&
        joystickStyle?.display !== "none" &&
        !joystick.classList.contains("game-turret-joystick--hidden") &&
        dualSwitches?.hasAttribute("hidden"),
      );
    },
    { timeout: 5000 },
    {
      joystickTestId: JOYSTICK_TEST_ID,
      dualSwitchesTestId: DUAL_SWITCHES_TEST_ID,
    },
  );

  await resetCanvasProbe(page);
  const joystickExercise = await exerciseJoystick(page);

  await page.click(`[data-testid="${CONTROL_TOGGLE_TEST_ID}"]`);
  await page.waitForFunction(
    ({ joystickTestId, dualSwitchesTestId }) => {
      const joystick = document.querySelector(
        `[data-testid="${joystickTestId}"]`,
      );
      const dualSwitches = document.querySelector(
        `[data-testid="${dualSwitchesTestId}"]`,
      );
      return Boolean(
        joystick?.classList.contains("game-turret-joystick--hidden") &&
        dualSwitches &&
        !dualSwitches.hasAttribute("hidden"),
      );
    },
    { timeout: 5000 },
    {
      joystickTestId: JOYSTICK_TEST_ID,
      dualSwitchesTestId: DUAL_SWITCHES_TEST_ID,
    },
  );

  return joystickExercise;
}

async function downloadJoystickDiagnostics(page, config) {
  debugLog(config.name, "validando botão de download do registro");
  const diagnosticBeforeDownload = await readJoystickDiagnosticState(page);
  assert(
    diagnosticBeforeDownload.downloadButtonDisabled === false,
    `${config.name}: download do registro não ficou habilitado após exercício.`,
  );

  const clickedDownload = await clickButtonByPattern(
    page,
    JOYSTICK_DIAGNOSTIC_DOWNLOAD_PATTERN.source,
  );
  debugLog(config.name, "download clicado");
  assert(
    clickedDownload,
    `${config.name}: botão de baixar registro da Torreta não encontrado.`,
  );
  await page.waitForFunction(
    () =>
      (window.__brikayaJoystickDiagnosticDownloads || []).some(
        (record) => record.parsed?.summary?.totalSamples > 0,
      ),
    { timeout: 5000 },
  );

  const exportProof = await page.evaluate(() => {
    const downloads = window.__brikayaJoystickDiagnosticDownloads || [];
    const anchorClicks = window.__brikayaJoystickDiagnosticAnchorClicks || [];
    const record = downloads.find(
      (candidate) => candidate.parsed?.summary?.totalSamples > 0,
    );
    const anchorClick = record
      ? anchorClicks.find((candidate) => candidate.href === record.href) || null
      : null;
    const parsed = record?.parsed || null;
    const firstSample = parsed?.samples?.[0] || null;

    return {
      downloadName: anchorClick?.download || "",
      mimeType: record?.type || "",
      size: record?.size || 0,
      totalSamples: parsed?.summary?.totalSamples || 0,
      acceptedSamples: parsed?.summary?.acceptedSamples || 0,
      rejectedSamples: parsed?.summary?.rejectedSamples || 0,
      hasMappedCanvasPoint: Boolean(firstSample?.canvas?.mappedCanvasPoint),
      hasJoystickPoint: Boolean(firstSample?.joystick?.normalized),
      hasPaddleSnapshot:
        parsed?.samples?.some((sample) => sample.paddle) || false,
      diagnosticSvgHasJoystick:
        typeof parsed?.diagnosticSvg === "string" &&
        parsed.diagnosticSvg.includes("Joystick"),
      diagnosticSvgHasTrampoline:
        typeof parsed?.diagnosticSvg === "string" &&
        parsed.diagnosticSvg.includes("Cama elástica"),
    };
  });
  debugLog(config.name, "prova de download", exportProof);

  assert(
    /brikaya-(?:torreta-joystick|joystick-diagnostic)-/.test(
      exportProof.downloadName,
    ),
    `${config.name}: nome do arquivo de registro inesperado.`,
  );
  assert(
    exportProof.mimeType === "application/json",
    `${config.name}: registro da Torreta não foi gerado como JSON.`,
  );
  assert(
    exportProof.totalSamples > 0 &&
      exportProof.acceptedSamples > 0 &&
      exportProof.rejectedSamples > 0,
    `${config.name}: registro não cobre pontos aceitos e rejeitados.`,
  );
  assert(
    exportProof.hasMappedCanvasPoint &&
      exportProof.hasJoystickPoint &&
      exportProof.hasPaddleSnapshot,
    `${config.name}: registro não inclui joystick, área do jogo e cama elástica.`,
  );
  assert(
    exportProof.diagnosticSvgHasJoystick &&
      exportProof.diagnosticSvgHasTrampoline,
    `${config.name}: registro desenhado não inclui joystick e cama elástica.`,
  );

  return {
    beforeDownload: diagnosticBeforeDownload,
    exportProof,
  };
}

async function runViewport(page, baseUrl, config) {
  debugLog(config.name, "iniciando viewport");
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

  if (config.orientationBlocked) {
    debugLog(config.name, "validando bloqueio de orientação");
    return waitForOrientationBlocker(page, config);
  }

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
  assertDefaultSwitchControls(config, gameplayState);

  const diagnosticToggleState =
    config.name === "mobile-portrait"
      ? await setJoystickDiagnosticsEnabled(page, config)
      : null;

  debugLog(config.name, "exercitando interruptores duplos");
  const dualSwitchExercise = await exerciseDualSwitches(page);
  assert(
    dualSwitchExercise.controlsVisible,
    `${config.name}: interruptores não ficaram visíveis por padrão.`,
  );
  assert(
    dualSwitchExercise.joystickHidden,
    `${config.name}: joystick não foi ocultado ao trocar para interruptores.`,
  );
  assert(
    dualSwitchExercise.twoTrampolinesVisible,
    `${config.name}: duas camas elásticas não foram desenhadas no modo interruptor.`,
  );
  assert(
    dualSwitchExercise.leftSwitchCenterExercise.exercised,
    `${config.name}: interruptor esquerdo não foi exercitado perto do centro.`,
  );
  assert(
    dualSwitchExercise.leftSwitchExercise.exercised,
    `${config.name}: interruptor esquerdo não foi exercitado na borda.`,
  );
  assert(
    dualSwitchExercise.rightSwitchExercise.exercised,
    `${config.name}: interruptor direito não foi exercitado.`,
  );
  assert(
    dualSwitchExercise.leftSwitchCenterBarelyMoved,
    `${config.name}: interruptor esquerdo perto do centro deveria quase parar a cama elástica.`,
  );
  assert(
    dualSwitchExercise.leftSwitchMovedOnlyLeft,
    `${config.name}: interruptor esquerdo na borda não acelerou somente a cama elástica esquerda para cima.`,
  );
  assert(
    dualSwitchExercise.rightSwitchMovedOnlyRight,
    `${config.name}: interruptor direito não moveu somente a cama elástica direita para baixo.`,
  );

  ensureParentDirectory(config.screenshotPath);
  await page.screenshot({ path: config.screenshotPath, fullPage: true });

  await exerciseTrampoline(page);
  debugLog(config.name, "validando joystick secundário");
  const joystickExercise = await exerciseSecondaryJoystick(page, config);
  assert(
    !config.expectSecondaryJoystick || joystickExercise.exercised,
    `${config.name}: joystick secundário não respondeu após tocar na setinha.`,
  );
  assert(
    !config.expectSecondaryJoystick || joystickExercise.hitTarget.hitsJoystick,
    `${config.name}: zona invisível do campo cobriu o joystick; alvo real=${joystickExercise.hitTarget?.tagName || "n/a"}.${joystickExercise.hitTarget?.className || "n/a"} data-testid=${joystickExercise.hitTarget?.testId || "n/a"}.`,
  );
  assert(
    !config.expectSecondaryJoystick || joystickExercise.pathWithinControl,
    `${config.name}: joystick exigiu arraste fora do círculo visual do controle.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      joystickExercise.rightVisualX > JOYSTICK_TRACKBALL_EDGE_AXIS_MIN,
    `${config.name}: trackball não exibiu posição visual à direita.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      joystickExercise.leftVisualX < -JOYSTICK_TRACKBALL_EDGE_AXIS_MIN,
    `${config.name}: trackball não exibiu posição visual à esquerda.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      joystickExercise.topVisualY < -JOYSTICK_TRACKBALL_EDGE_AXIS_MIN,
    `${config.name}: trackball não exibiu posição visual no topo.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      joystickExercise.bottomVisualY > JOYSTICK_TRACKBALL_EDGE_AXIS_MIN,
    `${config.name}: trackball não exibiu posição visual na base.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (Math.abs(joystickExercise.topRightVisual.x) >=
        JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        Math.abs(joystickExercise.topRightVisual.y) >=
          JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        joystickExercise.topRightVisual.x > 0 &&
        joystickExercise.topRightVisual.y < 0),
    `${config.name}: trackball não alcançou canto superior direito.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (Math.abs(joystickExercise.topLeftVisual.x) >=
        JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        Math.abs(joystickExercise.topLeftVisual.y) >=
          JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        joystickExercise.topLeftVisual.x < 0 &&
        joystickExercise.topLeftVisual.y < 0),
    `${config.name}: trackball não alcançou canto superior esquerdo.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (Math.abs(joystickExercise.bottomLeftVisual.x) >=
        JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        Math.abs(joystickExercise.bottomLeftVisual.y) >=
          JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        joystickExercise.bottomLeftVisual.x < 0 &&
        joystickExercise.bottomLeftVisual.y > 0),
    `${config.name}: trackball não alcançou canto inferior esquerdo.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (Math.abs(joystickExercise.bottomRightVisual.x) >=
        JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        Math.abs(joystickExercise.bottomRightVisual.y) >=
          JOYSTICK_TRACKBALL_DIAGONAL_AXIS_MIN &&
        joystickExercise.bottomRightVisual.x > 0 &&
        joystickExercise.bottomRightVisual.y > 0),
    `${config.name}: trackball não alcançou canto inferior direito.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      Object.entries(joystickExercise.angleChecks).every(
        ([, check]) => check.angleMatches,
      ),
    `${config.name}: joystick não espelhou todos os pontos absolutos no campo.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      joystickExercise.holdStableAngleDelta <= JOYSTICK_HOLD_MAX_ANGLE_DELTA,
    `${config.name}: joystick continuou girando após segurar ponto absoluto.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (joystickExercise.outsideIgnoredCheck.angleUnchanged &&
        joystickExercise.outsideIgnoredCheck.visualUnchanged &&
        joystickExercise.outsideIgnoredCheck.outsideAngleRejected),
    `${config.name}: joystick aceitou movimento fora da área do controle.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (joystickExercise.outsideCircleInsideBoxIgnoredCheck.angleUnchanged &&
        joystickExercise.outsideCircleInsideBoxIgnoredCheck.visualUnchanged),
    `${config.name}: joystick aceitou movimento fora do círculo visual do controle.`,
  );
  assert(
    !config.expectSecondaryJoystick ||
      (joystickExercise.releaseVisual.x === 0 &&
        joystickExercise.releaseVisual.y === 0 &&
        joystickExercise.releaseVisual.active === 0),
    `${config.name}: trackball não resetou visualmente ao soltar.`,
  );

  const diagnosticOverlayState =
    config.name === "mobile-portrait"
      ? await readJoystickDiagnosticState(page)
      : null;
  if (config.name === "mobile-portrait") {
    debugLog(config.name, "validando camadas de registro ocultas");
    assert(
      !diagnosticOverlayState.joystickLayer.visible &&
        diagnosticOverlayState.joystickLayer.pointCount === 0 &&
        diagnosticOverlayState.joystickLayer.lineCount === 0,
      `${config.name}: registro interno apareceu sobre o joystick mesmo oculto no menu.`,
    );
    assert(
      !diagnosticOverlayState.playfieldLayer.visible &&
        diagnosticOverlayState.playfieldLayer.pointCount === 0 &&
        diagnosticOverlayState.playfieldLayer.lineCount === 0,
      `${config.name}: registro interno apareceu na área do jogo mesmo oculto no menu.`,
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 120));
  const postExerciseState = await readBallTurretState(page);
  assert(
    !postExerciseState.startModal.visible,
    `${config.name}: modal inicial continuou visível após interação.`,
  );
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
    () => Boolean(document.querySelector("#game-settings-menu")),
    { timeout: 5000 },
  );

  const menuState = await readBallTurretState(page);
  assert(
    !menuState.hasGameModeHeading,
    `${config.name}: menu ainda expõe seletor de modo.`,
  );
  assert(
    !menuState.buttons.some((button) =>
      GAME_MODE_OPTION_PATTERN.test(button.text.trim()),
    ),
    `${config.name}: menu ainda expõe botão de modo antigo.`,
  );
  const menuDiagnosticState = await readJoystickDiagnosticState(page);
  assert(
    !menuDiagnosticState.toggleExists &&
      !menuDiagnosticState.downloadExists &&
      !menuDiagnosticState.clearExists,
    `${config.name}: menu ainda expõe controles internos de registro.`,
  );
  if (config.name === "desktop") {
    ensureParentDirectory(menuScreenshotPath());
    await page.screenshot({ path: menuScreenshotPath(), fullPage: true });
  }
  const joystickDiagnosticDownload = null;
  debugLog(config.name, "viewport concluído");

  return {
    name: config.name,
    joystickPlacement: config.joystickPlacement,
    joystickExercise,
    dualSwitchExercise,
    diagnosticToggleState,
    diagnosticOverlayState,
    joystickDiagnosticDownload,
    menuState,
    gameplayState,
    postExerciseState,
  };
}

async function run() {
  const baseUrl = publicUrl();
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions());
  const results = [];

  try {
    for (const viewportConfig of VIEWPORTS) {
      const page = await browser.newPage();
      page.setDefaultTimeout(60000);
      await installCanvasProbe(page);
      await installJoystickDiagnosticDownloadProbe(page);
      results.push(await runViewport(page, baseUrl, viewportConfig));
      debugLog(viewportConfig.name, "fechando página");
      await page.close();
      debugLog(viewportConfig.name, "página fechada");
    }
  } finally {
    debugLog("browser", "fechando navegador");
    await closeBrowser(browser);
    debugLog("browser", "navegador fechado");
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
      joystickDiagnostic: null,
    },
  };
  ensureParentDirectory(reportPath());
  writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`ball-turret qa ok: ${reportPath()}`);
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
