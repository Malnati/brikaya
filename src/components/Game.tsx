// src/components/Game.tsx
import React, { useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGameLoop(canvasRef);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
}
