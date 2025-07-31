// src/components/Game.tsx
import { useRef, useEffect, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useColorDebug } from '../hooks/useColorDebug';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT, MAX_CANVAS_WIDTH, MAX_CANVAS_HEIGHT } from '../constants/game';

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
  onGameOver?: () => void;
}

export default function Game({ onScoreUpdate, onGameWon, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  
  // Responsividade do canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container) return;
      
      const containerWidth = container.clientWidth - 40; // Padding
      const containerHeight = window.innerHeight * 0.6; // 60% da altura da tela
      
      // Calcular proporção do canvas original
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      
      let newWidth = containerWidth;
      let newHeight = containerWidth / aspectRatio;
      
      // Se a altura calculada for maior que o disponível, ajustar pela altura
      if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
      }
      
      // Aplicar limites mínimo e máximo
      newWidth = Math.max(MIN_CANVAS_WIDTH, Math.min(MAX_CANVAS_WIDTH, newWidth));
      newHeight = Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, newHeight));
      
      setCanvasSize({ width: newWidth, height: newHeight });
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, []);
  
  useGameLoop(canvasRef, onScoreUpdate, onGameWon, onGameOver, canvasSize);
  
  // Debug de cores (apenas em desenvolvimento)
  const { manualCheck } = useColorDebug(canvasRef);

  return (
    <div className="game-container">
      <canvas 
        ref={canvasRef} 
        width={canvasSize.width} 
        height={canvasSize.height}
        style={{
          maxWidth: '100%',
          height: 'auto',
          touchAction: 'none' // Previne zoom e scroll no touch
        }}
      />
    </div>
  );
}
