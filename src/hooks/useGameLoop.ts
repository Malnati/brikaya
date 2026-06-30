// src/hooks/useGameLoop.ts
import { useEffect, RefObject, useCallback, useRef } from 'react';

import { GameEngine } from '../logic/GameEngine';
import { LOG, ERROR } from '../utils/logger';

interface CanvasSize {
  width: number;
  height: number;
}

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement>, 
  onScoreUpdate: (score: number) => void,
  onGameWon?: () => void,
  onGameOver?: () => void,
  canvasSize?: CanvasSize
) {
  const engineRef = useRef<GameEngine | null>(null);
  const memoizedOnScoreUpdate = useCallback(onScoreUpdate, [onScoreUpdate]);
  const memoizedOnGameWon = useCallback(onGameWon || (() => {}), [onGameWon]);
  const memoizedOnGameOver = useCallback(onGameOver || (() => {}), [onGameOver]);

  useEffect(() => {
    if (!canvasRef.current) {
      LOG('❌ canvasRef.current não está disponível');
      return undefined;
    }
    
    LOG(`🎮 Iniciando GameEngine...`);
    LOG(`🎮 Canvas ref:`, canvasRef.current);
    LOG(`🎮 Canvas size:`, canvasRef.current.width, 'x', canvasRef.current.height);
    
    try {
      engineRef.current?.stop();
      const engine = new GameEngine(canvasRef.current, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver, canvasSize);
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
  }, [canvasRef, canvasSize, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver]);
}
