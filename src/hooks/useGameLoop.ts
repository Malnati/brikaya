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
const TRACKBALL_VECTOR_X_CSS_VAR = "--bb-turret-trackball-x";
const TRACKBALL_VECTOR_Y_CSS_VAR = "--bb-turret-trackball-y";
const TRACKBALL_ACTIVE_CSS_VAR = "--bb-turret-trackball-active";
const JOYSTICK_DEADZONE = 0.15;
const JOYSTICK_DEFAULT_VECTOR = "0";
const JOYSTICK_ACTIVE_VECTOR = "1";

function readTouchClientPoint(event: TouchEvent) {
  const touch = event.touches[0] ?? event.changedTouches[0] ?? null;

  if (!touch) return null;

  return { x: touch.clientX, y: touch.clientY };
}

function clampJoystickAxis(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function setTrackballVisualVector(
  joystick: HTMLElement,
  vectorX: number,
  vectorY: number,
  active: boolean,
) {
  joystick.style.setProperty(TRACKBALL_VECTOR_X_CSS_VAR, String(vectorX));
  joystick.style.setProperty(TRACKBALL_VECTOR_Y_CSS_VAR, String(vectorY));
  joystick.style.setProperty(
    TRACKBALL_ACTIVE_CSS_VAR,
    active ? JOYSTICK_ACTIVE_VECTOR : JOYSTICK_DEFAULT_VECTOR,
  );
}

function resetTrackballVisualVector(joystick: HTMLElement) {
  setTrackballVisualVector(joystick, 0, 0, false);
}

function readTrackballInput(
  clientX: number,
  clientY: number,
  joystick: HTMLElement,
) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = Math.max(1, Math.min(rect.width, rect.height) / 2);
  const rawX = (clientX - centerX) / radius;
  const rawY = (clientY - centerY) / radius;
  const magnitude = Math.hypot(rawX, rawY);

  if (!Number.isFinite(magnitude)) {
    return null;
  }

  const visualX = clampJoystickAxis(magnitude > 1 ? rawX / magnitude : rawX);
  const visualY = clampJoystickAxis(magnitude > 1 ? rawY / magnitude : rawY);
  const turnInput = Math.abs(visualX) < JOYSTICK_DEADZONE ? 0 : visualX;

  return {
    turnInput,
    visualX,
    visualY,
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
    let activeInputType: "pointer" | "touch" | null = null;

    const applyJoystickInput = (clientX: number, clientY: number) => {
      const input = readTrackballInput(clientX, clientY, joystick);
      if (!input) {
        resetTrackballVisualVector(joystick);
        engineRef.current?.setBallTurretJoystickTurn(0);
        return;
      }

      setTrackballVisualVector(joystick, input.visualX, input.visualY, true);
      engineRef.current?.setBallTurretJoystickTurn(input.turnInput);
    };

    const safeSetPointerCapture = (pointerId: number) => {
      try {
        joystick.setPointerCapture?.(pointerId);
      } catch {
        // Captura é opcional; o trackball precisa continuar responsivo.
      }
    };

    const safeReleasePointerCapture = (pointerId: number) => {
      try {
        joystick.releasePointerCapture?.(pointerId);
      } catch {
        // Alguns navegadores não mantêm captura após gestos touch sintetizados.
      }
    };

    const resetJoystickInput = () => {
      isDraggingJoystick = false;
      activeInputType = null;
      resetTrackballVisualVector(joystick);
      engineRef.current?.setBallTurretJoystickTurn(0);
    };

    const handlePointerDown = (event: PointerEvent) => {
      isDraggingJoystick = true;
      activeInputType = "pointer";
      event.preventDefault();
      safeSetPointerCapture(event.pointerId);
      applyJoystickInput(event.clientX, event.clientY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingJoystick || activeInputType !== "pointer") return;

      event.preventDefault();
      applyJoystickInput(event.clientX, event.clientY);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!isDraggingJoystick || activeInputType !== "pointer") return;

      event.preventDefault();
      safeReleasePointerCapture(event.pointerId);
      resetJoystickInput();
    };

    const handleTouchStart = (event: TouchEvent) => {
      const point = readTouchClientPoint(event);
      if (!point) return;

      isDraggingJoystick = true;
      activeInputType = "touch";
      event.preventDefault();
      applyJoystickInput(point.x, point.y);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDraggingJoystick || activeInputType !== "touch") return;
      const point = readTouchClientPoint(event);
      if (!point) return;

      event.preventDefault();
      applyJoystickInput(point.x, point.y);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isDraggingJoystick || activeInputType !== "touch") return;

      event.preventDefault();
      resetJoystickInput();
    };

    resetTrackballVisualVector(joystick);
    joystick.addEventListener(POINTER_DOWN_EVENT_NAME, handlePointerDown);
    joystick.addEventListener(POINTER_MOVE_EVENT_NAME, handlePointerMove);
    joystick.addEventListener(POINTER_UP_EVENT_NAME, handlePointerEnd);
    joystick.addEventListener(POINTER_CANCEL_EVENT_NAME, handlePointerEnd);
    joystick.addEventListener(
      TOUCH_START_EVENT_NAME,
      handleTouchStart,
      TOUCH_LISTENER_OPTIONS,
    );
    joystick.addEventListener(
      TOUCH_MOVE_EVENT_NAME,
      handleTouchMove,
      TOUCH_LISTENER_OPTIONS,
    );
    joystick.addEventListener(
      TOUCH_END_EVENT_NAME,
      handleTouchEnd,
      TOUCH_LISTENER_OPTIONS,
    );
    joystick.addEventListener(
      TOUCH_CANCEL_EVENT_NAME,
      handleTouchEnd,
      TOUCH_LISTENER_OPTIONS,
    );

    return () => {
      joystick.removeEventListener(POINTER_DOWN_EVENT_NAME, handlePointerDown);
      joystick.removeEventListener(POINTER_MOVE_EVENT_NAME, handlePointerMove);
      joystick.removeEventListener(POINTER_UP_EVENT_NAME, handlePointerEnd);
      joystick.removeEventListener(POINTER_CANCEL_EVENT_NAME, handlePointerEnd);
      joystick.removeEventListener(TOUCH_START_EVENT_NAME, handleTouchStart);
      joystick.removeEventListener(TOUCH_MOVE_EVENT_NAME, handleTouchMove);
      joystick.removeEventListener(TOUCH_END_EVENT_NAME, handleTouchEnd);
      joystick.removeEventListener(TOUCH_CANCEL_EVENT_NAME, handleTouchEnd);
      resetJoystickInput();
    };
  }, [ballTurretJoystickRef, gameMode]);
}
