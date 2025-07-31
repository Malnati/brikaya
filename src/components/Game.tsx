// src/components/Game.tsx
import { useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/game';

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
}

export default function Game({ onScoreUpdate, onGameWon }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGameLoop(canvasRef, onScoreUpdate, onGameWon);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
}
