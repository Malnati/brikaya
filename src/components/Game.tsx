// src/components/Game.tsx
import { useRef, useEffect, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useColorDebug } from '../hooks/useColorDebug';
import { CollisionStats } from './CollisionStats';
import { GameLogViewer } from './GameLogViewer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT, MAX_CANVAS_WIDTH, MAX_CANVAS_HEIGHT } from '../constants/game';

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
  onGameOver?: () => void;
}

export default function Game({ onScoreUpdate, onGameWon, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [showCollisionStats, setShowCollisionStats] = useState(false);
  const [showGameLogs, setShowGameLogs] = useState(false);
  
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
  useColorDebug(canvasRef);

  return (
    <div className="game-container">
      <div className="game-controls">
        <button 
          onClick={() => setShowCollisionStats(true)}
          className="stats-button"
          title="Ver estatísticas de colisões"
        >
          📊 Colisões
        </button>
        <button 
          onClick={() => setShowGameLogs(true)}
          className="stats-button"
          title="Ver logs detalhados do jogo"
        >
          📋 Logs do Jogo
        </button>
      </div>
      
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
      
      <CollisionStats 
        isVisible={showCollisionStats}
        onClose={() => setShowCollisionStats(false)}
      />
      
      <GameLogViewer 
        isVisible={showGameLogs}
        onClose={() => setShowGameLogs(false)}
      />
      
      <style>{`
        .game-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
          gap: 10px;
        }
        
        .stats-button {
          background: #333;
          color: white;
          border: 1px solid #555;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
        }
        
        .stats-button:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
