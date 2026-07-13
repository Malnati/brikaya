import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  calculateDynamicDimensions,
} from "../../constants/game";
import {
  ONBOARDING_DEMO_BALL_LAUNCH_ANGLE,
  ONBOARDING_DEMO_PHASE_BALL_START_MS,
  ONBOARDING_DEMO_PHASE_BOUNCE_MS,
  ONBOARDING_DEMO_PHASE_FADE_START_MS,
  ONBOARDING_DEMO_PHASE_SWITCH_END_MS,
  ONBOARDING_DEMO_PHASE_SWITCH_START_MS,
  ONBOARDING_DEMO_RIGHT_TRAMPOLINE_TARGET_ANGLE,
  ONBOARDING_DEMO_ELECTRIC_IMPACT_VISIBLE_MS,
  ONBOARDING_GAMEPLAY_DEMO_MS,
} from "../../constants/onboardingGameplayDemo";
import {
  DUAL_TRAMPOLINE_LEFT_START_ANGLE,
  DUAL_TRAMPOLINE_RIGHT_START_ANGLE,
  DUAL_TRAMPOLINE_WIDTH_SCALE,
} from "../../constants/turretTrampoline";
import {
  BALL_TURRET_LEFT_TRAMPOLINE_ACCENT,
  BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT,
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretTrampolines,
  type BallTurretRenderState,
  type BallTurretTrampolineRenderItem,
} from "../rendering/ballTurretRenderer";
import { ElectricEnergyBallRenderer } from "../rendering/electricEnergyBallRenderer";
import type { ElectricImpactEvent } from "../../utils/electricImpact";
import {
  buildElectricImpactSeed,
  drawElectricImpactEffects,
  type ElectricImpactEffect,
} from "../rendering/electricImpactRenderer";
import {
  calculateBallTurretPlayfieldGeometry,
  calculateRadialPaddleBounds,
  type RadialPaddleBounds,
} from "../../utils/radialGeometry";

export type OnboardingDemoSwitchDirection = "neutral" | "up" | "down";

export interface OnboardingDemoCanvasSize {
  width: number;
  height: number;
}

export interface OnboardingDemoFrame {
  elapsedMs: number;
  opacity: number;
  rightSwitchDirection: OnboardingDemoSwitchDirection;
  leftTrampolineAngle: number;
  rightTrampolineAngle: number;
  ballX: number;
  ballY: number;
  ballRadius: number;
  showImpact: boolean;
  impactOriginX: number;
  impactOriginY: number;
  isComplete: boolean;
}

const FULL_CIRCLE = Math.PI * 2;
const BOUNCE_DEFLECTION_RATIO = 0.5;
const MAX_BOUNCE_ANGLE = Math.PI / 3;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(value: number): number {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function readPhaseProgress(
  elapsedMs: number,
  startMs: number,
  endMs: number,
): number {
  if (elapsedMs <= startMs) return 0;
  if (elapsedMs >= endMs) return 1;
  return (elapsedMs - startMs) / (endMs - startMs);
}

function readImpactPosition(
  centerX: number,
  centerY: number,
  paddleRadius: number,
): { x: number; y: number } {
  const impactRadius = paddleRadius * 0.92;
  return {
    x: centerX + Math.cos(ONBOARDING_DEMO_BALL_LAUNCH_ANGLE) * impactRadius,
    y: centerY + Math.sin(ONBOARDING_DEMO_BALL_LAUNCH_ANGLE) * impactRadius,
  };
}

function readBallPosition(
  elapsedMs: number,
  centerX: number,
  centerY: number,
  paddleRadius: number,
  rightTrampolineAngle: number,
): { x: number; y: number } {
  const outboundProgress = easeInOutCubic(
    readPhaseProgress(
      elapsedMs,
      ONBOARDING_DEMO_PHASE_BALL_START_MS,
      ONBOARDING_DEMO_PHASE_BOUNCE_MS,
    ),
  );
  const impact = readImpactPosition(centerX, centerY, paddleRadius);
  const inboundProgress = easeInOutCubic(
    readPhaseProgress(
      elapsedMs,
      ONBOARDING_DEMO_PHASE_BOUNCE_MS,
      ONBOARDING_DEMO_PHASE_FADE_START_MS,
    ),
  );

  if (elapsedMs < ONBOARDING_DEMO_PHASE_BOUNCE_MS) {
    const travelRadius = paddleRadius * 0.92 * outboundProgress;
    return {
      x: centerX + Math.cos(ONBOARDING_DEMO_BALL_LAUNCH_ANGLE) * travelRadius,
      y: centerY + Math.sin(ONBOARDING_DEMO_BALL_LAUNCH_ANGLE) * travelRadius,
    };
  }

  const inwardAngle =
    rightTrampolineAngle +
    Math.PI +
    (BOUNCE_DEFLECTION_RATIO - 0.5) * 2 * MAX_BOUNCE_ANGLE;
  const reboundRadius = paddleRadius * 0.42 * inboundProgress;

  return {
    x: impact.x + Math.cos(inwardAngle) * reboundRadius,
    y: impact.y + Math.sin(inwardAngle) * reboundRadius,
  };
}

export function buildOnboardingDemoFrame(
  elapsedMs: number,
  canvasSize: OnboardingDemoCanvasSize,
): OnboardingDemoFrame {
  const dimensions = calculateDynamicDimensions(
    canvasSize.width,
    canvasSize.height,
  );
  const geometry = calculateBallTurretPlayfieldGeometry(
    canvasSize.width,
    canvasSize.height,
    dimensions,
  );
  const switchProgress = easeInOutCubic(
    readPhaseProgress(
      elapsedMs,
      ONBOARDING_DEMO_PHASE_SWITCH_START_MS,
      ONBOARDING_DEMO_PHASE_SWITCH_END_MS,
    ),
  );
  const rightTrampolineAngle =
    DUAL_TRAMPOLINE_RIGHT_START_ANGLE +
    (ONBOARDING_DEMO_RIGHT_TRAMPOLINE_TARGET_ANGLE -
      DUAL_TRAMPOLINE_RIGHT_START_ANGLE) *
      switchProgress;
  const rightSwitchDirection: OnboardingDemoSwitchDirection =
    elapsedMs < ONBOARDING_DEMO_PHASE_SWITCH_START_MS
      ? "neutral"
      : elapsedMs < ONBOARDING_DEMO_PHASE_SWITCH_END_MS
        ? "down"
        : "neutral";
  const { x: ballX, y: ballY } = readBallPosition(
    elapsedMs,
    geometry.centerX,
    geometry.centerY,
    geometry.paddleRadius,
    rightTrampolineAngle,
  );
  const impactPosition = readImpactPosition(
    geometry.centerX,
    geometry.centerY,
    geometry.paddleRadius,
  );
  const fadeProgress = readPhaseProgress(
    elapsedMs,
    ONBOARDING_DEMO_PHASE_FADE_START_MS,
    ONBOARDING_GAMEPLAY_DEMO_MS,
  );

  return {
    elapsedMs,
    opacity: 1 - easeInOutCubic(fadeProgress),
    rightSwitchDirection,
    leftTrampolineAngle: DUAL_TRAMPOLINE_LEFT_START_ANGLE,
    rightTrampolineAngle,
    ballX,
    ballY,
    ballRadius: dimensions.ballRadius,
    showImpact:
      elapsedMs >= ONBOARDING_DEMO_PHASE_BOUNCE_MS &&
      elapsedMs < ONBOARDING_DEMO_PHASE_FADE_START_MS + 200,
    impactOriginX: impactPosition.x,
    impactOriginY: impactPosition.y,
    isComplete: elapsedMs >= ONBOARDING_GAMEPLAY_DEMO_MS,
  };
}

function createRenderState(
  canvasSize: OnboardingDemoCanvasSize,
  paddlePosition: RadialPaddleBounds,
  reducedEffects: boolean,
): BallTurretRenderState {
  const dimensions = calculateDynamicDimensions(
    canvasSize.width,
    canvasSize.height,
  );
  const geometry = calculateBallTurretPlayfieldGeometry(
    canvasSize.width,
    canvasSize.height,
    dimensions,
  );

  return {
    canvasSize,
    geometry,
    level: 1,
    reducedEffects,
    paddlePosition,
  };
}

function readTrampolineItems(
  canvasSize: OnboardingDemoCanvasSize,
  frame: OnboardingDemoFrame,
): BallTurretTrampolineRenderItem[] {
  const dimensions = calculateDynamicDimensions(
    canvasSize.width,
    canvasSize.height,
  );
  const geometry = calculateBallTurretPlayfieldGeometry(
    canvasSize.width,
    canvasSize.height,
    dimensions,
  );

  return [
    {
      paddlePosition: calculateRadialPaddleBounds(
        geometry,
        dimensions,
        frame.leftTrampolineAngle,
        DUAL_TRAMPOLINE_WIDTH_SCALE,
      ),
      accentColor: BALL_TURRET_LEFT_TRAMPOLINE_ACCENT,
    },
    {
      paddlePosition: calculateRadialPaddleBounds(
        geometry,
        dimensions,
        frame.rightTrampolineAngle,
        DUAL_TRAMPOLINE_WIDTH_SCALE,
      ),
      accentColor: BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT,
    },
  ];
}

function createImpactEffect(
  frame: OnboardingDemoFrame,
  now: number,
): ElectricImpactEffect {
  const impact: ElectricImpactEvent = {
    kind: "radial-wall",
    origin: { x: frame.impactOriginX, y: frame.impactOriginY },
    endpoints: [
      {
        x: frame.impactOriginX - 28,
        y: frame.impactOriginY - 18,
      },
      {
        x: frame.impactOriginX + 24,
        y: frame.impactOriginY + 20,
      },
    ],
  };

  return {
    ...impact,
    endpoints: [
      { ...impact.endpoints[0] },
      { ...impact.endpoints[1] },
    ],
    startedAt: now,
    durationMs: ONBOARDING_DEMO_ELECTRIC_IMPACT_VISIBLE_MS,
    seed: buildElectricImpactSeed(impact),
  };
}

export function renderOnboardingGameplayDemoFrame(
  ctx: CanvasRenderingContext2D,
  frame: OnboardingDemoFrame,
  canvasSize: OnboardingDemoCanvasSize,
  now: number,
  reducedEffects: boolean,
): void {
  const dimensions = calculateDynamicDimensions(
    canvasSize.width,
    canvasSize.height,
  );
  const geometry = calculateBallTurretPlayfieldGeometry(
    canvasSize.width,
    canvasSize.height,
    dimensions,
  );
  const leftPaddle = calculateRadialPaddleBounds(
    geometry,
    dimensions,
    frame.leftTrampolineAngle,
    DUAL_TRAMPOLINE_WIDTH_SCALE,
  );
  const renderState = createRenderState(canvasSize, leftPaddle, reducedEffects);
  const trampolines = readTrampolineItems(canvasSize, frame);

  ctx.save();
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.globalAlpha = frame.opacity;

  drawBallTurretBackdrop(ctx, renderState);
  drawBallTurretTrampolines(ctx, renderState, trampolines);

  const ballRenderer = new ElectricEnergyBallRenderer(
    frame.ballX,
    frame.ballY,
    frame.ballRadius,
    "cyan",
  );
  ballRenderer.draw(ctx, now, reducedEffects);

  if (frame.showImpact) {
    const impact = createImpactEffect(frame, now);
    drawElectricImpactEffects(ctx, [impact], now, reducedEffects, 1);
  }

  drawBallTurretGlassOverlay(ctx, renderState);
  ctx.restore();
}

export function readDefaultOnboardingDemoCanvasSize(): OnboardingDemoCanvasSize {
  return {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  };
}

export function normalizeDualTrampolineAngle(angle: number): number {
  return ((angle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
}
