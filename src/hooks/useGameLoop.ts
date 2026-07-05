// src/hooks/useGameLoop.ts
import { useEffect, RefObject, useRef } from "react";

import { GameEngine, GameQaScenario } from "../logic/GameEngine";
import { LOG, ERROR } from "../utils/logger";
import { LevelTransitionPayload } from "../constants/game";
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import type { GameAudioSink } from "../constants/audio";
import { GAME_MODE_CLASSIC, type GameMode } from "../constants/gameMode";

interface CanvasSize {
  width: number;
  height: number;
}

interface GameLoopCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
  onGameOver?: () => void;
  onLevelTransition?: (payload: LevelTransitionPayload) => void;
  onLevelChange?: (level: number) => void;
}

const TOUCH_START_EVENT_NAME = "touchstart";
const TOUCH_MOVE_EVENT_NAME = "touchmove";
const TOUCH_END_EVENT_NAME = "touchend";
const TOUCH_CANCEL_EVENT_NAME = "touchcancel";
const TOUCH_LISTENER_OPTIONS = { passive: false } as const;

function readTouchClientPoint(event: TouchEvent) {
  const touch = event.touches[0] ?? event.changedTouches[0] ?? null;

  if (!touch) return null;

  return { x: touch.clientX, y: touch.clientY };
}

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement>,
  onScoreUpdate: (score: number) => void,
  onGameWon?: () => void,
  onGameOver?: () => void,
  canvasSize?: CanvasSize,
  onLevelTransition?: (payload: LevelTransitionPayload) => void,
  qaScenario?: GameQaScenario | null,
  audioSink?: GameAudioSink,
  onLevelChange?: (level: number) => void,
  startBlocked = false,
  imageSetId: ImageSetId = IMAGE_SET_RETRO_DEFAULT,
  paused = false,
  gameMode: GameMode = GAME_MODE_CLASSIC,
  paddleTouchZoneRef?: RefObject<HTMLElement>,
) {
  const engineRef = useRef<GameEngine | null>(null);
  const callbacksRef = useRef<GameLoopCallbacks>({
    onScoreUpdate,
    onGameWon,
    onGameOver,
    onLevelTransition,
    onLevelChange,
  });

  useEffect(() => {
    callbacksRef.current = {
      onScoreUpdate,
      onGameWon,
      onGameOver,
      onLevelTransition,
      onLevelChange,
    };
  }, [onScoreUpdate, onGameWon, onGameOver, onLevelTransition, onLevelChange]);

  useEffect(() => {
    if (startBlocked) {
      LOG("⏳ Início do GameEngine aguardando contagem inicial");
      return undefined;
    }

    if (!canvasRef.current) {
      LOG("❌ canvasRef.current não está disponível");
      return undefined;
    }

    LOG(`🎮 Iniciando GameEngine...`);
    LOG(`🎮 Canvas ref:`, canvasRef.current);
    LOG(
      `🎮 Canvas size:`,
      canvasRef.current.width,
      "x",
      canvasRef.current.height,
    );

    try {
      const engine = new GameEngine(
        canvasRef.current,
        (score) => callbacksRef.current.onScoreUpdate(score),
        () => callbacksRef.current.onGameWon?.(),
        () => callbacksRef.current.onGameOver?.(),
        canvasSize,
        (payload) => callbacksRef.current.onLevelTransition?.(payload),
        qaScenario,
        audioSink,
        (level) => callbacksRef.current.onLevelChange?.(level),
        imageSetId,
        gameMode,
      );
      engineRef.current = engine;
      LOG(`🎮 GameEngine criado com sucesso, chamando start()...`);
      void engine.start();
      LOG(`🎮 engine.start() chamado`);
    } catch (error) {
      ERROR("❌ Erro ao criar/iniciar GameEngine:", error);
    }

    return () => {
      LOG(`🛑 Parando GameEngine...`);
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [audioSink, canvasRef, gameMode, qaScenario, startBlocked]);

  useEffect(() => {
    engineRef.current?.setImageSet(imageSetId);
  }, [imageSetId]);

  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused, startBlocked]);

  useEffect(() => {
    if (!canvasSize) return;
    engineRef.current?.resize(canvasSize);
  }, [canvasSize]);

  useEffect(() => {
    const paddleTouchZone = paddleTouchZoneRef?.current;
    if (!paddleTouchZone) return undefined;

    const handleTouchStart = (event: TouchEvent) => {
      const point = readTouchClientPoint(event);
      if (point === null) return;

      event.preventDefault();
      engineRef.current?.startPaddleDrag(point.x, point.y);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const point = readTouchClientPoint(event);
      if (point === null) return;

      event.preventDefault();
      engineRef.current?.movePaddleDrag(point.x, point.y);
    };
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      engineRef.current?.endPaddleDrag();
    };

    paddleTouchZone.addEventListener(
      TOUCH_START_EVENT_NAME,
      handleTouchStart,
      TOUCH_LISTENER_OPTIONS,
    );
    paddleTouchZone.addEventListener(
      TOUCH_MOVE_EVENT_NAME,
      handleTouchMove,
      TOUCH_LISTENER_OPTIONS,
    );
    paddleTouchZone.addEventListener(
      TOUCH_END_EVENT_NAME,
      handleTouchEnd,
      TOUCH_LISTENER_OPTIONS,
    );
    paddleTouchZone.addEventListener(
      TOUCH_CANCEL_EVENT_NAME,
      handleTouchEnd,
      TOUCH_LISTENER_OPTIONS,
    );

    return () => {
      paddleTouchZone.removeEventListener(
        TOUCH_START_EVENT_NAME,
        handleTouchStart,
      );
      paddleTouchZone.removeEventListener(
        TOUCH_MOVE_EVENT_NAME,
        handleTouchMove,
      );
      paddleTouchZone.removeEventListener(TOUCH_END_EVENT_NAME, handleTouchEnd);
      paddleTouchZone.removeEventListener(
        TOUCH_CANCEL_EVENT_NAME,
        handleTouchEnd,
      );
    };
  }, [paddleTouchZoneRef]);
}
