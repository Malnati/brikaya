// src/components/Game.tsx
import { useRef, useLayoutEffect, useState, useCallback, useMemo } from "react";

import { useGameLoop } from "../hooks/useGameLoop";
import { useColorDebug } from "../hooks/useColorDebug";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  IMMERSIVE_LANDSCAPE_ROOT_CLASS,
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
import type { LevelTransitionPayload } from "../constants/game";
import { GAME_MODE_CLASSIC, type GameMode } from "../constants/gameMode";
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
  isLandscapeImmersive: boolean;
}

const RESIZE_EVENT_NAME = "resize";
const ORIENTATION_CHANGE_EVENT_NAME = "orientationchange";
const VISUAL_VIEWPORT_SCROLL_EVENT_NAME = "scroll";
const TOUCH_ACTION_NONE = "none";
const POINTER_COARSE_MEDIA_QUERY = "(pointer: coarse)";
const HOVER_NONE_MEDIA_QUERY = "(hover: none)";
const VISUAL_VIEWPORT_WIDTH_CSS_VAR = "--bb-visual-viewport-width";
const VISUAL_VIEWPORT_HEIGHT_CSS_VAR = "--bb-visual-viewport-height";
const PIXEL_UNIT = "px";
const PERCENT_UNIT = "%";
const PERCENT_FACTOR = 100;
const PADDLE_TOUCH_ZONE_TOP_OFFSET = "1in";
const PADDLE_TOUCH_ZONE_HEIGHT = "3in";
const PADDLE_TOUCH_ZONE_TEST_ID = "paddle-touch-zone";
const GAME_SURFACE_CLASS_NAME = "game-surface";
const GAME_SURFACE_IMMERSIVE_CLASS_NAME =
  "game-surface game-surface--immersive-landscape";
const GAME_BOARD_PLAYFIELD_CLASS_NAME = "game-board-playfield";
const PADDLE_TOUCH_ZONE_CLASS_NAME = "game-paddle-touch-zone";

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

function clearImmersiveViewportState() {
  document.documentElement.classList.remove(IMMERSIVE_LANDSCAPE_ROOT_CLASS);
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
}: GameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paddleTouchZoneRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
  const [isLandscapeImmersive, setIsLandscapeImmersive] = useState(false);
  const canvasSizeRef = useRef(canvasSize);
  const isLandscapeImmersiveRef = useRef(isLandscapeImmersive);
  const pendingBoardRectTargetRef = useRef<PendingBoardRectTarget | null>(null);
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
      const shouldWaitForSurfaceMode =
        isLandscapeImmersiveRef.current !== nextSize.isImmersiveLandscape;
      setViewportCssVariables(viewportWidth, viewportHeight);
      document.documentElement.classList.toggle(
        IMMERSIVE_LANDSCAPE_ROOT_CLASS,
        nextSize.isImmersiveLandscape,
      );
      setIsLandscapeImmersive((currentValue) => {
        if (currentValue === nextSize.isImmersiveLandscape) {
          return currentValue;
        }

        return nextSize.isImmersiveLandscape;
      });
      setCanvasSize((currentSize) => {
        if (
          currentSize.width === nextSize.width &&
          currentSize.height === nextSize.height
        ) {
          return currentSize;
        }

        return nextSize;
      });
      if (shouldWaitForSizedCanvas || shouldWaitForSurfaceMode) {
        pendingBoardRectTargetRef.current = {
          width: nextSize.width,
          height: nextSize.height,
          isLandscapeImmersive: nextSize.isImmersiveLandscape,
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
      clearImmersiveViewportState();
    };
  }, [publishBoardRect]);

  useLayoutEffect(() => {
    canvasSizeRef.current = canvasSize;
    isLandscapeImmersiveRef.current = isLandscapeImmersive;
    const pendingBoardRectTarget = pendingBoardRectTargetRef.current;
    if (pendingBoardRectTarget) {
      if (
        pendingBoardRectTarget.width !== canvasSize.width ||
        pendingBoardRectTarget.height !== canvasSize.height ||
        pendingBoardRectTarget.isLandscapeImmersive !== isLandscapeImmersive
      ) {
        return;
      }

      pendingBoardRectTargetRef.current = null;
    }

    publishBoardRect();
  }, [canvasSize, isLandscapeImmersive, publishBoardRect]);

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
  );
  useColorDebug(canvasRef);

  return (
    <div
      className={
        isLandscapeImmersive
          ? GAME_SURFACE_IMMERSIVE_CLASS_NAME
          : GAME_SURFACE_CLASS_NAME
      }
      ref={surfaceRef}
    >
      <div className="game-board-frame">
        <div
          className={GAME_BOARD_PLAYFIELD_CLASS_NAME}
          style={{
            width: `${canvasSize.width}px`,
            maxWidth: "100%",
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
        </div>
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
