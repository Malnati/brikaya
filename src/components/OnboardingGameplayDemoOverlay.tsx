// src/components/OnboardingGameplayDemoOverlay.tsx
import { useEffect, useRef } from "react";

import { ONBOARDING_GAMEPLAY_DEMO_MS } from "../constants/onboardingGameplayDemo";
import {
  buildOnboardingDemoFrame,
  renderOnboardingGameplayDemoFrame,
  type OnboardingDemoCanvasSize,
} from "../logic/onboarding/onboardingGameplayDemoTimeline";
import { useI18n } from "../i18n";
import { shouldUseReducedCanvasEffects } from "../utils/performanceMode";

interface OnboardingGameplayDemoOverlayProps {
  onComplete: () => void;
}

const OVERLAY_CLASS_NAME = "onboarding-gameplay-demo-overlay";
const STAGE_CLASS_NAME = "onboarding-gameplay-demo-overlay__stage";
const CANVAS_CLASS_NAME = "onboarding-gameplay-demo-overlay__canvas";
const SWITCHES_CLASS_NAME = "game-turret-dual-switches";
const SWITCH_CLASS_NAME = "game-turret-switch";
const SWITCH_LEFT_CLASS_NAME = "game-turret-switch--left";
const SWITCH_RIGHT_CLASS_NAME = "game-turret-switch--right";
const SWITCH_UP_CLASS_NAME = "game-turret-switch__up";
const SWITCH_THUMB_CLASS_NAME = "game-turret-switch__thumb";
const SWITCH_DOWN_CLASS_NAME = "game-turret-switch__down";
const TEST_ID = "onboarding-gameplay-demo-overlay";
const CANVAS_TEST_ID = "onboarding-gameplay-demo-canvas";
const SWITCHES_TEST_ID = "onboarding-gameplay-demo-switches";
const RIGHT_SWITCH_TEST_ID = "onboarding-gameplay-demo-switch-right";

function readCanvasSize(canvas: HTMLCanvasElement): OnboardingDemoCanvasSize {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  return { width, height };
}

function readSwitchDirectionAttribute(
  direction: "neutral" | "up" | "down",
): "up" | "down" | undefined {
  if (direction === "neutral") return undefined;
  return direction;
}

export function OnboardingGameplayDemoOverlay({
  onComplete,
}: OnboardingGameplayDemoOverlayProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const switchDirectionRef = useRef<"neutral" | "up" | "down">("neutral");
  const rightSwitchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    completedRef.current = false;
    startedAtRef.current = null;

    const renderFrame = (timestamp: number) => {
      if (startedAtRef.current === null) startedAtRef.current = timestamp;

      const elapsedMs = timestamp - startedAtRef.current;
      const canvasSize = readCanvasSize(canvas);
      const frame = buildOnboardingDemoFrame(elapsedMs, canvasSize);
      const context = canvas.getContext("2d");

      if (context) {
        renderOnboardingGameplayDemoFrame(
          context,
          frame,
          canvasSize,
          timestamp,
          shouldUseReducedCanvasEffects(canvasSize.width),
        );
      }

      if (switchDirectionRef.current !== frame.rightSwitchDirection) {
        switchDirectionRef.current = frame.rightSwitchDirection;
        const rightSwitch = rightSwitchRef.current;
        if (rightSwitch) {
          const direction = readSwitchDirectionAttribute(
            frame.rightSwitchDirection,
          );
          if (direction) {
            rightSwitch.setAttribute("data-switch-direction", direction);
          } else {
            rightSwitch.removeAttribute("data-switch-direction");
          }
        }
      }

      if (frame.isComplete) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  return (
    <div
      className={OVERLAY_CLASS_NAME}
      role="status"
      aria-live="polite"
      aria-label={t("onboarding.demoTitle")}
      data-testid={TEST_ID}
    >
      <div className={STAGE_CLASS_NAME}>
        <p className="onboarding-gameplay-demo-overlay__eyebrow">Brikaya</p>
        <h2 className="onboarding-gameplay-demo-overlay__title">
          {t("onboarding.demoTitle")}
        </h2>
        <p className="onboarding-gameplay-demo-overlay__description">
          {t("onboarding.demoDescription")}
        </p>
        <div className="onboarding-gameplay-demo-overlay__playfield">
          <div
            className={SWITCHES_CLASS_NAME}
            data-testid={SWITCHES_TEST_ID}
            aria-hidden="true"
          >
            <div
              className={`${SWITCH_CLASS_NAME} ${SWITCH_LEFT_CLASS_NAME}`}
              aria-hidden="true"
            >
              <span className={SWITCH_UP_CLASS_NAME}>▲</span>
              <span className={SWITCH_THUMB_CLASS_NAME} />
              <span className={SWITCH_DOWN_CLASS_NAME}>▼</span>
            </div>
            <canvas
              ref={canvasRef}
              className={CANVAS_CLASS_NAME}
              data-testid={CANVAS_TEST_ID}
              aria-hidden="true"
            />
            <div
              ref={rightSwitchRef}
              className={`${SWITCH_CLASS_NAME} ${SWITCH_RIGHT_CLASS_NAME}`}
              data-testid={RIGHT_SWITCH_TEST_ID}
              aria-hidden="true"
            >
              <span className={SWITCH_UP_CLASS_NAME}>▲</span>
              <span className={SWITCH_THUMB_CLASS_NAME} />
              <span className={SWITCH_DOWN_CLASS_NAME}>▼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ONBOARDING_GAMEPLAY_DEMO_DURATION_MS = ONBOARDING_GAMEPLAY_DEMO_MS;
