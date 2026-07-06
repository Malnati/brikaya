// src/components/Game.tsx
import { useRef, useLayoutEffect, useState, useCallback, useMemo } from "react";

import { useGameLoop } from "../hooks/useGameLoop";
import { useColorDebug } from "../hooks/useColorDebug";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  ROOT_ELEMENT_ID,
  calculateDynamicDimensions,
} from "../constants/game";
import { GameQaScenario } from "../logic/GameEngine";
import { calculateResponsiveCanvasSize } from "../utils/canvasSizing";
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import type { GameAudioSink } from "../constants/audio";
import type { JoystickDiagnosticSample } from "../utils/joystickDiagnostics";
import { calculateTurretJoystickLayout } from "../utils/turretJoystickLayout";
import type { LevelTransitionPayload } from "../constants/game";
import {
  GAME_MODE_BALL_TURRET,
  GAME_MODE_CLASSIC,
  type GameMode,
} from "../constants/gameMode";
import type { ReactNode } from "react";

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
  onGameOver?: () => void;
  onLevelTransition?: (payload: LevelTransitionPayload) => void;
  onLevelChange?: (level: number) => void;
  qaScenario?: GameQaScenario | null;
  audioSink?: GameAudioSink;
  boardControls?: ReactNode;
  startBlocked?: boolean;
  imageSetId?: ImageSetId;
  paused?: boolean;
  gameMode?: GameMode;
  onBoardRectChange?: (rect: GameBoardRect) => void;
  joystickDiagnosticsEnabled?: boolean;
  joystickDiagnosticSamples?: readonly JoystickDiagnosticSample[];
  onJoystickDiagnosticSample?: (sample: JoystickDiagnosticSample) => void;
}

export interface GameBoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PendingBoardRectTarget {
  width: number;
  height: number;
}

const RESIZE_EVENT_NAME = "resize";
const ORIENTATION_CHANGE_EVENT_NAME = "orientationchange";
const VISUAL_VIEWPORT_SCROLL_EVENT_NAME = "scroll";
const TOUCH_ACTION_NONE = "none";
const POINTER_COARSE_MEDIA_QUERY = "(pointer: coarse)";
const HOVER_NONE_MEDIA_QUERY = "(hover: none)";
const VISUAL_VIEWPORT_WIDTH_CSS_VAR = "--bb-visual-viewport-width";
const VISUAL_VIEWPORT_HEIGHT_CSS_VAR = "--bb-visual-viewport-height";
const TURRET_JOYSTICK_OFFSET_CSS_VAR = "--bb-turret-joystick-offset";
const TURRET_JOYSTICK_CENTER_Y_CSS_VAR = "--bb-turret-joystick-center-y";
const TURRET_TRACKBALL_SIZE_CSS_VAR = "--bb-turret-trackball-size";
const TURRET_TRACKBALL_KNOB_SIZE_CSS_VAR = "--bb-turret-trackball-knob-size";
const TURRET_TRACKBALL_TRAVEL_CSS_VAR = "--bb-turret-trackball-travel";
const PIXEL_UNIT = "px";
const PERCENT_UNIT = "%";
const PERCENT_FACTOR = 100;
const PADDLE_TOUCH_ZONE_TOP_OFFSET = "1in";
const PADDLE_TOUCH_ZONE_HEIGHT = "3in";
const PADDLE_TOUCH_ZONE_TEST_ID = "paddle-touch-zone";
const BALL_TURRET_JOYSTICK_TEST_ID = "ball-turret-joystick";
const BALL_TURRET_JOYSTICK_LABEL = "Controle da Torreta";
const GAME_SURFACE_CLASS_NAME = "game-surface";
const GAME_SURFACE_BALL_TURRET_CLASS_NAME = "game-surface--ball-turret";
const GAME_BOARD_INPUT_LAYOUT_CLASS_NAME = "game-board-input-layout";
const GAME_BOARD_PLAYFIELD_CLASS_NAME = "game-board-playfield";
const PADDLE_TOUCH_ZONE_CLASS_NAME = "game-paddle-touch-zone";
const BALL_TURRET_JOYSTICK_CLASS_NAME =
  "game-turret-joystick game-turret-trackball";
const JOYSTICK_DIAGNOSTIC_JOYSTICK_LAYER_TEST_ID =
  "joystick-diagnostic-joystick-layer";
const JOYSTICK_DIAGNOSTIC_PLAYFIELD_LAYER_TEST_ID =
  "joystick-diagnostic-playfield-layer";
const JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE = 100;

function readPixelValue(value: string): number {
  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getRootPadding() {
  const rootElement = document.getElementById(ROOT_ELEMENT_ID);
  if (!rootElement) return { inline: 0, block: 0 };

  const rootStyle = getComputedStyle(rootElement);
  return {
    inline:
      readPixelValue(rootStyle.paddingLeft) +
      readPixelValue(rootStyle.paddingRight),
    block:
      readPixelValue(rootStyle.paddingTop) +
      readPixelValue(rootStyle.paddingBottom),
  };
}

function setViewportCssVariables(width: number, height: number) {
  document.documentElement.style.setProperty(
    VISUAL_VIEWPORT_WIDTH_CSS_VAR,
    `${width}${PIXEL_UNIT}`,
  );
  document.documentElement.style.setProperty(
    VISUAL_VIEWPORT_HEIGHT_CSS_VAR,
    `${height}${PIXEL_UNIT}`,
  );
}

function clearViewportCssVariables() {
  document.documentElement.style.removeProperty(VISUAL_VIEWPORT_WIDTH_CSS_VAR);
  document.documentElement.style.removeProperty(VISUAL_VIEWPORT_HEIGHT_CSS_VAR);
}

function readBoardRect(canvas: HTMLCanvasElement): GameBoardRect {
  const rect = canvas.getBoundingClientRect();
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}

function removeTurretJoystickLayoutStyles(joystick: HTMLElement) {
  joystick.style.removeProperty(TURRET_JOYSTICK_OFFSET_CSS_VAR);
  joystick.style.removeProperty(TURRET_JOYSTICK_CENTER_Y_CSS_VAR);
  joystick.style.removeProperty(TURRET_TRACKBALL_SIZE_CSS_VAR);
  joystick.style.removeProperty(TURRET_TRACKBALL_KNOB_SIZE_CSS_VAR);
  joystick.style.removeProperty(TURRET_TRACKBALL_TRAVEL_CSS_VAR);
}

function setTurretJoystickLayoutStyles(
  joystick: HTMLElement,
  layout: ReturnType<typeof calculateTurretJoystickLayout>,
) {
  if (!layout.shouldApply) {
    removeTurretJoystickLayoutStyles(joystick);
    return;
  }

  joystick.style.setProperty(
    TURRET_JOYSTICK_OFFSET_CSS_VAR,
    `${layout.marginTop}${PIXEL_UNIT}`,
  );
  joystick.style.setProperty(
    TURRET_JOYSTICK_CENTER_Y_CSS_VAR,
    `${layout.centerY}${PIXEL_UNIT}`,
  );
  joystick.style.setProperty(
    TURRET_TRACKBALL_SIZE_CSS_VAR,
    `${layout.size}${PIXEL_UNIT}`,
  );
  joystick.style.setProperty(
    TURRET_TRACKBALL_KNOB_SIZE_CSS_VAR,
    `${layout.knobSize}${PIXEL_UNIT}`,
  );
  joystick.style.setProperty(
    TURRET_TRACKBALL_TRAVEL_CSS_VAR,
    `${layout.travel}${PIXEL_UNIT}`,
  );
}


function renderJoystickDiagnosticPolyline(
  samples: readonly JoystickDiagnosticSample[],
  getPoint: (sample: JoystickDiagnosticSample) => { x: number; y: number } | null,
) {
  const points = samples
    .filter((sample) => sample.accepted)
    .map(getPoint)
    .filter((point): point is { x: number; y: number } => point !== null)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  if (!points) return null;

  return <polyline className="joystick-diagnostic-layer__line" points={points} />;
}

function renderJoystickDiagnosticPoints(
  samples: readonly JoystickDiagnosticSample[],
  getPoint: (sample: JoystickDiagnosticSample) => { x: number; y: number } | null,
) {
  return samples.map((sample) => {
    const point = getPoint(sample);
    if (!point) return null;

    return (
      <circle
        key={sample.sequence}
        className={
          sample.accepted
            ? "joystick-diagnostic-layer__point joystick-diagnostic-layer__point--accepted"
            : "joystick-diagnostic-layer__point joystick-diagnostic-layer__point--rejected"
        }
        cx={point.x}
        cy={point.y}
        r="2.2"
      />
    );
  });
}

function renderJoystickDiagnosticLayer(
  samples: readonly JoystickDiagnosticSample[],
  testId: string,
  className: string,
  getPoint: (sample: JoystickDiagnosticSample) => { x: number; y: number } | null,
) {
  if (samples.length === 0) return null;

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-testid={testId}
      viewBox={`0 0 ${JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE} ${JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE}`}
      preserveAspectRatio="none"
    >
      {renderJoystickDiagnosticPolyline(samples, getPoint)}
      {renderJoystickDiagnosticPoints(samples, getPoint)}
    </svg>
  );
}

function readJoystickDiagnosticPoint(sample: JoystickDiagnosticSample) {
  const normalized = sample.joystick.normalized;
  if (!normalized) return null;

  return {
    x: normalized.x * JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE,
    y: normalized.y * JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE,
  };
}

function readPlayfieldDiagnosticPoint(sample: JoystickDiagnosticSample) {
  const mappedCanvasPoint = sample.canvas.mappedCanvasPoint;
  if (!mappedCanvasPoint) return null;

  const canvasWidth = sample.canvas.size.width || 1;
  const canvasHeight = sample.canvas.size.height || 1;

  return {
    x: (mappedCanvasPoint.x / canvasWidth) * JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE,
    y: (mappedCanvasPoint.y / canvasHeight) * JOYSTICK_DIAGNOSTIC_VIEWBOX_SIZE,
  };
}

export default function Game({
  onScoreUpdate,
  onGameWon,
  onGameOver,
  onLevelTransition,
  onLevelChange,
  qaScenario,
  audioSink,
  boardControls,
  startBlocked = false,
  imageSetId = IMAGE_SET_RETRO_DEFAULT,
  paused = false,
  gameMode = GAME_MODE_CLASSIC,
  onBoardRectChange,
  joystickDiagnosticsEnabled = false,
  joystickDiagnosticSamples = [],
  onJoystickDiagnosticSample,
}: GameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paddleTouchZoneRef = useRef<HTMLDivElement>(null);
  const ballTurretJoystickRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
  const canvasSizeRef = useRef(canvasSize);
  const pendingBoardRectTargetRef = useRef<PendingBoardRectTarget | null>(null);
  const isBallTurretMode = gameMode === GAME_MODE_BALL_TURRET;
  const shouldRenderJoystickDiagnostics =
    isBallTurretMode && joystickDiagnosticsEnabled && joystickDiagnosticSamples.length > 0;
  const paddleTouchZoneCenterPercent = useMemo(() => {
    const dimensions = calculateDynamicDimensions(
      canvasSize.width,
      canvasSize.height,
    );
    const paddleCenterY = canvasSize.height - dimensions.paddleHeight / 2;

    return (paddleCenterY / canvasSize.height) * PERCENT_FACTOR;
  }, [canvasSize.height, canvasSize.width]);
  const publishBoardRect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onBoardRectChange) return;

    onBoardRectChange(readBoardRect(canvas));
  }, [onBoardRectChange]);
  const updateTurretJoystickLayout = useCallback(() => {
    const joystick = ballTurretJoystickRef.current;
    if (!joystick) return;

    const canvas = canvasRef.current;
    if (!isBallTurretMode || !canvas) {
      removeTurretJoystickLayoutStyles(joystick);
      return;
    }

    const visualViewport = window.visualViewport;
    const viewportWidth = visualViewport?.width || window.innerWidth;
    const viewportHeight = visualViewport?.height || window.innerHeight;
    const layout = calculateTurretJoystickLayout({
      viewportWidth,
      viewportHeight,
      playfieldBottom: canvas.getBoundingClientRect().bottom,
      pointerCoarse:
        window.matchMedia?.(POINTER_COARSE_MEDIA_QUERY).matches ||
        navigator.maxTouchPoints > 0,
      hoverNone: window.matchMedia?.(HOVER_NONE_MEDIA_QUERY).matches || false,
    });

    setTurretJoystickLayoutStyles(joystick, layout);
  }, [isBallTurretMode]);

  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      const container = surfaceRef.current;
      if (!container) return;
      const visualViewport = window.visualViewport;
      const viewportWidth = visualViewport?.width || window.innerWidth;
      const viewportHeight = visualViewport?.height || window.innerHeight;
      const rootPadding = getRootPadding();
      const nextSize = calculateResponsiveCanvasSize({
        containerWidth: container.clientWidth,
        containerHeight: container.clientHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        visualViewportWidth: visualViewport?.width,
        visualViewportHeight: visualViewport?.height,
        rootPaddingInline: rootPadding.inline,
        rootPaddingBlock: rootPadding.block,
        pointerCoarse:
          window.matchMedia?.(POINTER_COARSE_MEDIA_QUERY).matches ||
          navigator.maxTouchPoints > 0,
        hoverNone: window.matchMedia?.(HOVER_NONE_MEDIA_QUERY).matches || false,
      });
      const shouldWaitForSizedCanvas =
        canvasSizeRef.current.width !== nextSize.width ||
        canvasSizeRef.current.height !== nextSize.height;
      setViewportCssVariables(viewportWidth, viewportHeight);
      setCanvasSize((currentSize) => {
        if (
          currentSize.width === nextSize.width &&
          currentSize.height === nextSize.height
        ) {
          return currentSize;
        }

        return nextSize;
      });
      if (shouldWaitForSizedCanvas) {
        pendingBoardRectTargetRef.current = {
          width: nextSize.width,
          height: nextSize.height,
        };
      } else {
        pendingBoardRectTargetRef.current = null;
        publishBoardRect();
      }
    };

    updateCanvasSize();
    window.addEventListener(RESIZE_EVENT_NAME, updateCanvasSize);
    window.addEventListener(ORIENTATION_CHANGE_EVENT_NAME, updateCanvasSize);
    window.visualViewport?.addEventListener(
      RESIZE_EVENT_NAME,
      updateCanvasSize,
    );
    window.visualViewport?.addEventListener(
      VISUAL_VIEWPORT_SCROLL_EVENT_NAME,
      updateCanvasSize,
    );

    return () => {
      window.removeEventListener(RESIZE_EVENT_NAME, updateCanvasSize);
      window.removeEventListener(
        ORIENTATION_CHANGE_EVENT_NAME,
        updateCanvasSize,
      );
      window.visualViewport?.removeEventListener(
        RESIZE_EVENT_NAME,
        updateCanvasSize,
      );
      window.visualViewport?.removeEventListener(
        VISUAL_VIEWPORT_SCROLL_EVENT_NAME,
        updateCanvasSize,
      );
      clearViewportCssVariables();
    };
  }, [publishBoardRect]);

  useLayoutEffect(() => {
    updateTurretJoystickLayout();
    window.addEventListener(RESIZE_EVENT_NAME, updateTurretJoystickLayout);
    window.addEventListener(
      ORIENTATION_CHANGE_EVENT_NAME,
      updateTurretJoystickLayout,
    );
    window.visualViewport?.addEventListener(
      RESIZE_EVENT_NAME,
      updateTurretJoystickLayout,
    );
    window.visualViewport?.addEventListener(
      VISUAL_VIEWPORT_SCROLL_EVENT_NAME,
      updateTurretJoystickLayout,
    );

    return () => {
      window.removeEventListener(RESIZE_EVENT_NAME, updateTurretJoystickLayout);
      window.removeEventListener(
        ORIENTATION_CHANGE_EVENT_NAME,
        updateTurretJoystickLayout,
      );
      window.visualViewport?.removeEventListener(
        RESIZE_EVENT_NAME,
        updateTurretJoystickLayout,
      );
      window.visualViewport?.removeEventListener(
        VISUAL_VIEWPORT_SCROLL_EVENT_NAME,
        updateTurretJoystickLayout,
      );
      const joystick = ballTurretJoystickRef.current;
      if (joystick) removeTurretJoystickLayoutStyles(joystick);
    };
  }, [canvasSize, updateTurretJoystickLayout]);

  useLayoutEffect(() => {
    canvasSizeRef.current = canvasSize;
    const pendingBoardRectTarget = pendingBoardRectTargetRef.current;
    if (pendingBoardRectTarget) {
      if (
        pendingBoardRectTarget.width !== canvasSize.width ||
        pendingBoardRectTarget.height !== canvasSize.height
      ) {
        return;
      }

      pendingBoardRectTargetRef.current = null;
    }

    publishBoardRect();
  }, [canvasSize, publishBoardRect]);

  useGameLoop(
    canvasRef,
    onScoreUpdate,
    onGameWon,
    onGameOver,
    canvasSize,
    onLevelTransition,
    qaScenario,
    audioSink,
    onLevelChange,
    startBlocked,
    imageSetId,
    paused,
    gameMode,
    paddleTouchZoneRef,
    ballTurretJoystickRef,
    joystickDiagnosticsEnabled,
    onJoystickDiagnosticSample,
  );
  useColorDebug(canvasRef);

  const surfaceClassName = [
    GAME_SURFACE_CLASS_NAME,
    isBallTurretMode ? GAME_SURFACE_BALL_TURRET_CLASS_NAME : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={surfaceClassName} ref={surfaceRef}>
      <div className={GAME_BOARD_INPUT_LAYOUT_CLASS_NAME}>
        <div className="game-board-frame">
          <div
            className={GAME_BOARD_PLAYFIELD_CLASS_NAME}
            style={{
              width: `${canvasSize.width}px`,
              maxWidth: isBallTurretMode
                ? "var(--bb-ball-turret-playfield-max-width, 100%)"
                : "100%",
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              style={{
                width: "100%",
                height: "auto",
                touchAction: TOUCH_ACTION_NONE,
              }}
            />
            <div
              ref={paddleTouchZoneRef}
              className={PADDLE_TOUCH_ZONE_CLASS_NAME}
              data-testid={PADDLE_TOUCH_ZONE_TEST_ID}
              aria-hidden="true"
              style={{
                top: `calc(${paddleTouchZoneCenterPercent}${PERCENT_UNIT} - ${PADDLE_TOUCH_ZONE_TOP_OFFSET})`,
                height: PADDLE_TOUCH_ZONE_HEIGHT,
                transform: "none",
              }}
            />
            {shouldRenderJoystickDiagnostics &&
              renderJoystickDiagnosticLayer(
                joystickDiagnosticSamples,
                JOYSTICK_DIAGNOSTIC_PLAYFIELD_LAYER_TEST_ID,
                "joystick-diagnostic-layer joystick-diagnostic-layer--playfield",
                readPlayfieldDiagnosticPoint,
              )}
          </div>
        </div>
        {isBallTurretMode && (
          <div
            ref={ballTurretJoystickRef}
            className={BALL_TURRET_JOYSTICK_CLASS_NAME}
            data-testid={BALL_TURRET_JOYSTICK_TEST_ID}
            aria-label={BALL_TURRET_JOYSTICK_LABEL}
          >
            <span className="game-turret-joystick-pad" aria-hidden="true">
              <span className="game-turret-joystick-knob" />
            </span>
            {shouldRenderJoystickDiagnostics &&
              renderJoystickDiagnosticLayer(
                joystickDiagnosticSamples,
                JOYSTICK_DIAGNOSTIC_JOYSTICK_LAYER_TEST_ID,
                "joystick-diagnostic-layer joystick-diagnostic-layer--joystick",
                readJoystickDiagnosticPoint,
              )}
          </div>
        )}
      </div>
      {boardControls && (
        <div
          className="game-board-controls"
          style={{
            width: `${canvasSize.width}px`,
            maxWidth: "100%",
          }}
        >
          {boardControls}
        </div>
      )}
    </div>
  );
}
