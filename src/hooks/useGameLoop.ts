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
import {
  GAME_MODE_BALL_TURRET,
  GAME_MODE_CLASSIC,
  type GameMode,
} from "../constants/gameMode";

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
const POINTER_DOWN_EVENT_NAME = "pointerdown";
const POINTER_MOVE_EVENT_NAME = "pointermove";
const POINTER_UP_EVENT_NAME = "pointerup";
const POINTER_CANCEL_EVENT_NAME = "pointercancel";
const JOYSTICK_VECTOR_X_CSS_VAR = "--bb-turret-joystick-x";
const JOYSTICK_VECTOR_Y_CSS_VAR = "--bb-turret-joystick-y";
const JOYSTICK_DEADZONE = 0.15;
const JOYSTICK_DEFAULT_VECTOR = "0";

function readTouchClientPoint(event: TouchEvent) {
  const touch = event.touches[0] ?? event.changedTouches[0] ?? null;

  if (!touch) return null;

  return { x: touch.clientX, y: touch.clientY };
}

function clampJoystickAxis(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function setJoystickVisualVector(
  joystick: HTMLElement,
  vectorX: number,
  vectorY: number,
) {
  joystick.style.setProperty(JOYSTICK_VECTOR_X_CSS_VAR, String(vectorX));
  joystick.style.setProperty(JOYSTICK_VECTOR_Y_CSS_VAR, String(vectorY));
}

function resetJoystickVisualVector(joystick: HTMLElement) {
  joystick.style.setProperty(
    JOYSTICK_VECTOR_X_CSS_VAR,
    JOYSTICK_DEFAULT_VECTOR,
  );
  joystick.style.setProperty(
    JOYSTICK_VECTOR_Y_CSS_VAR,
    JOYSTICK_DEFAULT_VECTOR,
  );
}

function readJoystickVector(event: PointerEvent, joystick: HTMLElement) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = Math.max(1, Math.min(rect.width, rect.height) / 2);
  const rawX = (event.clientX - centerX) / radius;
  const rawY = (event.clientY - centerY) / radius;
  const magnitude = Math.hypot(rawX, rawY);

  if (!Number.isFinite(magnitude) || magnitude < JOYSTICK_DEADZONE) {
    return null;
  }

  return {
    engineX: rawX / magnitude,
    engineY: rawY / magnitude,
    visualX: clampJoystickAxis(rawX),
    visualY: clampJoystickAxis(rawY),
  };
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
  ballTurretJoystickRef?: RefObject<HTMLElement>,
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

  useEffect(() => {
    const joystick = ballTurretJoystickRef?.current;
    if (!joystick || gameMode !== GAME_MODE_BALL_TURRET) return undefined;

    let isDraggingJoystick = false;

    const applyJoystickVector = (event: PointerEvent) => {
      const vector = readJoystickVector(event, joystick);
      if (!vector) {
        resetJoystickVisualVector(joystick);
        return;
      }

      setJoystickVisualVector(joystick, vector.visualX, vector.visualY);
      engineRef.current?.setBallTurretControlVector(
        vector.engineX,
        vector.engineY,
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      isDraggingJoystick = true;
      event.preventDefault();
      joystick.setPointerCapture?.(event.pointerId);
      applyJoystickVector(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingJoystick) return;

      event.preventDefault();
      applyJoystickVector(event);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!isDraggingJoystick) return;

      isDraggingJoystick = false;
      event.preventDefault();
      joystick.releasePointerCapture?.(event.pointerId);
      resetJoystickVisualVector(joystick);
    };

    resetJoystickVisualVector(joystick);
    joystick.addEventListener(POINTER_DOWN_EVENT_NAME, handlePointerDown);
    joystick.addEventListener(POINTER_MOVE_EVENT_NAME, handlePointerMove);
    joystick.addEventListener(POINTER_UP_EVENT_NAME, handlePointerEnd);
    joystick.addEventListener(POINTER_CANCEL_EVENT_NAME, handlePointerEnd);

    return () => {
      joystick.removeEventListener(POINTER_DOWN_EVENT_NAME, handlePointerDown);
      joystick.removeEventListener(POINTER_MOVE_EVENT_NAME, handlePointerMove);
      joystick.removeEventListener(POINTER_UP_EVENT_NAME, handlePointerEnd);
      joystick.removeEventListener(POINTER_CANCEL_EVENT_NAME, handlePointerEnd);
      resetJoystickVisualVector(joystick);
    };
  }, [ballTurretJoystickRef, gameMode]);
}
