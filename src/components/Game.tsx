// src/components/Game.tsx
import { useRef, useLayoutEffect, useState } from "react";

import { useGameLoop } from "../hooks/useGameLoop";
import { useColorDebug } from "../hooks/useColorDebug";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  IMMERSIVE_LANDSCAPE_ROOT_CLASS,
  ROOT_ELEMENT_ID,
} from "../constants/game";
import { GameQaScenario } from "../logic/GameEngine";
import { calculateResponsiveCanvasSize } from "../utils/canvasSizing";
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import type { GameAudioSink } from "../constants/audio";
import type { LevelTransitionPayload } from "../constants/game";
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
const GAME_SURFACE_CLASS_NAME = "game-surface";
const GAME_SURFACE_IMMERSIVE_CLASS_NAME =
  "game-surface game-surface--immersive-landscape";

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
}: GameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
  const [isLandscapeImmersive, setIsLandscapeImmersive] = useState(false);

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
      setViewportCssVariables(viewportWidth, viewportHeight);
      document.documentElement.classList.toggle(
        IMMERSIVE_LANDSCAPE_ROOT_CLASS,
        nextSize.isImmersiveLandscape,
      );
      setIsLandscapeImmersive((currentValue) =>
        currentValue === nextSize.isImmersiveLandscape
          ? currentValue
          : nextSize.isImmersiveLandscape,
      );
      setCanvasSize((currentSize) => {
        if (
          currentSize.width === nextSize.width &&
          currentSize.height === nextSize.height
        ) {
          return currentSize;
        }

        return nextSize;
      });
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
  }, []);

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
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            maxWidth: "100%",
            height: "auto",
            touchAction: TOUCH_ACTION_NONE,
          }}
        />
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
