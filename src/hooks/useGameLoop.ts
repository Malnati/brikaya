// src/hooks/useGameLoop.ts
import { useEffect, RefObject } from 'react';
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
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine(canvasRef.current, onScoreUpdate, onGameWon, onGameOver, canvasSize);
    engine.start(); // agora é async, mas não precisa await
    return () => engine.stop();
  }, [canvasRef, onScoreUpdate, onGameWon, onGameOver, canvasSize]);
}
