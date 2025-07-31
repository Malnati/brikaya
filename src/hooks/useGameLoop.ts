// src/hooks/useGameLoop.ts
import { useEffect, RefObject } from 'react';
import { GameEngine } from '../logic/GameEngine';

export function useGameLoop(canvasRef: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine(canvasRef.current);
    engine.start();
    return () => engine.stop();
  }, [canvasRef]);
}
