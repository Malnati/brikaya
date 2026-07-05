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
const JOYSTICK_DEFAULT_VECTOR = "0";
const JOYSTICK_ACTIVE_VECTOR = "1";

function readTouchClientPoint(event: TouchEvent) {
  const touch = event.touches[0] ?? event.changedTouches[0] ?? null;

  if (!touch) return null;

  return { x: touch.clientX, y: touch.clientY };
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

function readMirroredTrackballInput(
  clientX: number,
  clientY: number,
  joystick: HTMLElement,
  canvas: HTMLCanvasElement,
) {
  const joystickRect = joystick.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  if (
    !Number.isFinite(joystickRect.width) ||
    !Number.isFinite(joystickRect.height) ||
    joystickRect.width <= 0 ||
    joystickRect.height <= 0 ||
    !Number.isFinite(canvasRect.left) ||
    !Number.isFinite(canvasRect.top) ||
    !Number.isFinite(canvasRect.width) ||
    !Number.isFinite(canvasRect.height)
  ) {
    return null;
  }

  const joystickRight = joystickRect.left + joystickRect.width;
  const joystickBottom = joystickRect.top + joystickRect.height;
  const isInsideJoystick =
    clientX >= joystickRect.left &&
    clientX <= joystickRight &&
    clientY >= joystickRect.top &&
    clientY <= joystickBottom;

  if (!isInsideJoystick) {
    return { kind: "outside" as const };
  }

  const normalizedX = (clientX - joystickRect.left) / joystickRect.width;
  const normalizedY = (clientY - joystickRect.top) / joystickRect.height;

  return {
    kind: "inside" as const,
    mappedClientX: canvasRect.left + normalizedX * canvasRect.width,
    mappedClientY: canvasRect.top + normalizedY * canvasRect.height,
    visualX: normalizedX * 2 - 1,
    visualY: normalizedY * 2 - 1,
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

    const applyJoystickInput = (
      clientX: number,
      clientY: number,
      phase: "start" | "move",
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resetTrackballVisualVector(joystick);
        return false;
      }

      const input = readMirroredTrackballInput(
        clientX,
        clientY,
        joystick,
        canvas,
      );
      if (!input) {
        resetTrackballVisualVector(joystick);
        return false;
      }

      if (input.kind === "outside") {
        return false;
      }

      setTrackballVisualVector(joystick, input.visualX, input.visualY, true);
      if (phase === "start") {
        engineRef.current?.startPaddleDrag(
          input.mappedClientX,
          input.mappedClientY,
        );
        return true;
      }

      engineRef.current?.movePaddleDrag(
        input.mappedClientX,
        input.mappedClientY,
      );
      return true;
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

    const resetJoystickInput = (shouldEndDrag: boolean) => {
      const wasDraggingJoystick = isDraggingJoystick;
      isDraggingJoystick = false;
      activeInputType = null;
      resetTrackballVisualVector(joystick);
      if (shouldEndDrag && wasDraggingJoystick) {
        engineRef.current?.endPaddleDrag();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const didApply = applyJoystickInput(event.clientX, event.clientY, "start");
      if (!didApply) return;

      isDraggingJoystick = true;
      activeInputType = "pointer";
      event.preventDefault();
      safeSetPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingJoystick || activeInputType !== "pointer") return;

      event.preventDefault();
      applyJoystickInput(event.clientX, event.clientY, "move");
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!isDraggingJoystick || activeInputType !== "pointer") return;

      event.preventDefault();
      safeReleasePointerCapture(event.pointerId);
      resetJoystickInput(true);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const point = readTouchClientPoint(event);
      if (!point) return;
      const didApply = applyJoystickInput(point.x, point.y, "start");
      if (!didApply) return;

      isDraggingJoystick = true;
      activeInputType = "touch";
      event.preventDefault();
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDraggingJoystick || activeInputType !== "touch") return;
      const point = readTouchClientPoint(event);
      if (!point) return;

      event.preventDefault();
      applyJoystickInput(point.x, point.y, "move");
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isDraggingJoystick || activeInputType !== "touch") return;

      event.preventDefault();
      resetJoystickInput(true);
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
      resetJoystickInput(false);
    };
  }, [ballTurretJoystickRef, canvasRef, gameMode]);
}
