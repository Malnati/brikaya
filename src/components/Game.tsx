// src/components/Game.tsx
import { useRef, useLayoutEffect, useState } from "react";

import { useGameLoop } from "../hooks/useGameLoop";
import { useColorDebug } from "../hooks/useColorDebug";
import { LevelToast } from "./LevelToast";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MIN_CANVAS_WIDTH,
  MIN_CANVAS_HEIGHT,
  MAX_CANVAS_WIDTH,
  MAX_CANVAS_HEIGHT,
  LevelTransitionPayload,
} from "../constants/game";
import { GameQaScenario } from "../logic/GameEngine";
import type { GameAudioSink } from "../constants/audio";
import type { ReactNode } from "react";

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
  onGameOver?: () => void;
  onLevelTransition?: (payload: LevelTransitionPayload) => void;
  onLevelChange?: (level: number) => void;
  levelToastPayload: LevelTransitionPayload | null;
  isLevelToastVisible: boolean;
  qaScenario?: GameQaScenario | null;
  audioSink?: GameAudioSink;
  boardControls?: ReactNode;
}

const CANVAS_CONTAINER_HORIZONTAL_INSET = 16;
const AVAILABLE_CANVAS_HEIGHT_RATIO = 0.42;
const COMPACT_LANDSCAPE_MAX_HEIGHT = 500;
const COMPACT_LANDSCAPE_CANVAS_INSET = 8;
const COMPACT_LANDSCAPE_MIN_CANVAS_WIDTH = 240;
const COMPACT_LANDSCAPE_MIN_CANVAS_HEIGHT = 160;
const RESIZE_EVENT_NAME = "resize";
const ORIENTATION_CHANGE_EVENT_NAME = "orientationchange";
const TOUCH_ACTION_NONE = "none";

export default function Game({
  onScoreUpdate,
  onGameWon,
  onGameOver,
  onLevelTransition,
  onLevelChange,
  levelToastPayload,
  isLevelToastVisible,
  qaScenario,
  audioSink,
  boardControls,
}: GameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  useLayoutEffect(() => {
    const updateCanvasSize = () => {
      const container = surfaceRef.current;
      if (!container) return;
      const isCompactLandscape =
        window.innerHeight < COMPACT_LANDSCAPE_MAX_HEIGHT &&
        window.innerWidth > window.innerHeight;
      const minCanvasWidth = isCompactLandscape
        ? COMPACT_LANDSCAPE_MIN_CANVAS_WIDTH
        : MIN_CANVAS_WIDTH;
      const minCanvasHeight = isCompactLandscape
        ? COMPACT_LANDSCAPE_MIN_CANVAS_HEIGHT
        : MIN_CANVAS_HEIGHT;

      const canvasInset = isCompactLandscape
        ? COMPACT_LANDSCAPE_CANVAS_INSET
        : CANVAS_CONTAINER_HORIZONTAL_INSET;
      const containerWidth = Math.max(
        minCanvasWidth,
        container.clientWidth - canvasInset,
      );
      const containerHeight = Math.max(
        minCanvasHeight,
        isCompactLandscape
          ? container.clientHeight - canvasInset
          : window.innerHeight * AVAILABLE_CANVAS_HEIGHT_RATIO,
      );
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

      let newWidth = containerWidth;
      let newHeight = containerWidth / aspectRatio;

      if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
      }

      newWidth = Math.max(minCanvasWidth, Math.min(MAX_CANVAS_WIDTH, newWidth));
      newHeight = Math.max(
        minCanvasHeight,
        Math.min(MAX_CANVAS_HEIGHT, newHeight),
      );

      const nextSize = {
        width: Math.floor(newWidth),
        height: Math.floor(newHeight),
      };
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

    return () => {
      window.removeEventListener(RESIZE_EVENT_NAME, updateCanvasSize);
      window.removeEventListener(
        ORIENTATION_CHANGE_EVENT_NAME,
        updateCanvasSize,
      );
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
  );
  useColorDebug(canvasRef);

  return (
    <div className="game-surface" ref={surfaceRef}>
      <div className="game-board-frame">
        <LevelToast payload={levelToastPayload} visible={isLevelToastVisible} />
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
