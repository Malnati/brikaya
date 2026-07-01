// src/hooks/useGameLoop.ts
import { useEffect, RefObject, useRef } from 'react';

import { GameEngine, GameQaScenario } from '../logic/GameEngine';
import { LOG, ERROR } from '../utils/logger';
import { LevelTransitionPayload } from '../constants/game';
import type { GameAudioSink } from '../constants/audio';

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

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement>,
  onScoreUpdate: (score: number) => void,
  onGameWon?: () => void,
  onGameOver?: () => void,
  canvasSize?: CanvasSize,
  onLevelTransition?: (payload: LevelTransitionPayload) => void,
  qaScenario?: GameQaScenario | null,
  audioSink?: GameAudioSink,
  onLevelChange?: (level: number) => void
) {
  const engineRef = useRef<GameEngine | null>(null);
  const callbacksRef = useRef<GameLoopCallbacks>({ onScoreUpdate, onGameWon, onGameOver, onLevelTransition, onLevelChange });

  useEffect(() => {
    callbacksRef.current = { onScoreUpdate, onGameWon, onGameOver, onLevelTransition, onLevelChange };
  }, [onScoreUpdate, onGameWon, onGameOver, onLevelTransition, onLevelChange]);

  useEffect(() => {
    if (!canvasRef.current) {
      LOG('❌ canvasRef.current não está disponível');
      return undefined;
    }

    LOG(`🎮 Iniciando GameEngine...`);
    LOG(`🎮 Canvas ref:`, canvasRef.current);
    LOG(`🎮 Canvas size:`, canvasRef.current.width, 'x', canvasRef.current.height);

    try {
      const engine = new GameEngine(
        canvasRef.current,
        score => callbacksRef.current.onScoreUpdate(score),
        () => callbacksRef.current.onGameWon?.(),
        () => callbacksRef.current.onGameOver?.(),
        canvasSize,
        payload => callbacksRef.current.onLevelTransition?.(payload),
        qaScenario,
        audioSink,
        level => callbacksRef.current.onLevelChange?.(level)
      );
      engineRef.current = engine;
      LOG(`🎮 GameEngine criado com sucesso, chamando start()...`);
      void engine.start();
      LOG(`🎮 engine.start() chamado`);
    } catch (error) {
      ERROR('❌ Erro ao criar/iniciar GameEngine:', error);
    }

    return () => {
      LOG(`🛑 Parando GameEngine...`);
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [audioSink, canvasRef, qaScenario]);

  useEffect(() => {
    if (!canvasSize) return;
    engineRef.current?.resize(canvasSize);
  }, [canvasSize]);
}
