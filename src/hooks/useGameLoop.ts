// src/hooks/useGameLoop.ts
import { useEffect, RefObject } from 'react';
import { GameEngine } from '../logic/GameEngine';

export function useGameLoop(
  canvasRef: RefObject<HTMLCanvasElement>, 
  onScoreUpdate: (score: number) => void,
  onGameWon?: () => void
) {
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine(canvasRef.current, onScoreUpdate, onGameWon);
    engine.start();
    return () => engine.stop();
  }, [canvasRef, onScoreUpdate, onGameWon]);
}
