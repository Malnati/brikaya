// src/hooks/useGameLoop.ts
import { useEffect, RefObject, useCallback } from 'react';
import { GameEngine } from '../logic/GameEngine';

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
  // Memoizar as funções para evitar recriações desnecessárias
  const memoizedOnScoreUpdate = useCallback(onScoreUpdate, []);
  const memoizedOnGameWon = useCallback(onGameWon || (() => {}), [onGameWon]);
  const memoizedOnGameOver = useCallback(onGameOver || (() => {}), [onGameOver]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    console.log(`🎮 Iniciando GameEngine...`);
    const engine = new GameEngine(canvasRef.current, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver, canvasSize);
    engine.start();
    
    return () => {
      console.log(`🛑 Parando GameEngine...`);
      engine.stop();
    };
  }, [canvasRef, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver]); // Removido canvasSize das dependências
}
