// src/components/Game.tsx
import { useRef, useEffect, useState } from 'react';

import { useGameLoop } from '../hooks/useGameLoop';
import { useColorDebug } from '../hooks/useColorDebug';
import { CollisionStats } from './CollisionStats';
import GameLogViewer from './GameLogViewer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_CANVAS_WIDTH, MIN_CANVAS_HEIGHT, MAX_CANVAS_WIDTH, MAX_CANVAS_HEIGHT } from '../constants/game';

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onGameWon?: () => void;
  onGameOver?: () => void;
}

const CANVAS_CONTAINER_HORIZONTAL_INSET = 16;
const AVAILABLE_CANVAS_HEIGHT_RATIO = 0.42;
const RESIZE_EVENT_NAME = 'resize';
const ORIENTATION_CHANGE_EVENT_NAME = 'orientationchange';
const TOUCH_ACTION_NONE = 'none';

export default function Game({ onScoreUpdate, onGameWon, onGameOver }: GameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [showCollisionStats, setShowCollisionStats] = useState(false);
  const [showGameLogs, setShowGameLogs] = useState(false);
  
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = surfaceRef.current;
      if (!container) return;
      
      const containerWidth = Math.max(MIN_CANVAS_WIDTH, container.clientWidth - CANVAS_CONTAINER_HORIZONTAL_INSET);
      const containerHeight = Math.max(MIN_CANVAS_HEIGHT, window.innerHeight * AVAILABLE_CANVAS_HEIGHT_RATIO);
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      
      let newWidth = containerWidth;
      let newHeight = containerWidth / aspectRatio;
      
      if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
      }
      
      newWidth = Math.max(MIN_CANVAS_WIDTH, Math.min(MAX_CANVAS_WIDTH, newWidth));
      newHeight = Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, newHeight));
      
      const nextSize = { width: Math.floor(newWidth), height: Math.floor(newHeight) };
      setCanvasSize(currentSize => {
        if (currentSize.width === nextSize.width && currentSize.height === nextSize.height) {
          return currentSize;
        }

        return nextSize;
      });
    };
    
    updateCanvasSize();
    window.addEventListener(RESIZE_EVENT_NAME, updateCanvasSize);
    window.addEventListener(ORIENTATION_CHANGE_EVENT_NAME, updateCanvasSize);
    
    return () => {
      window.removeEventListener(RESIZE_EVENT_NAME, updateCanvasSize);
      window.removeEventListener(ORIENTATION_CHANGE_EVENT_NAME, updateCanvasSize);
    };
  }, []);
  
  useGameLoop(canvasRef, onScoreUpdate, onGameWon, onGameOver, canvasSize);
  useColorDebug(canvasRef);

  return (
    <div className="game-surface" ref={surfaceRef}>
      <div className="game-controls" aria-label="Ferramentas do jogo">
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
          touchAction: TOUCH_ACTION_NONE
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
        .game-surface {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .game-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          width: 100%;
          max-width: 100%;
          margin-bottom: 8px;
          gap: 8px;
          box-sizing: border-box;
        }
        
        .stats-button {
          background: #333;
          color: white;
          border: 1px solid #555;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          min-height: 44px;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .stats-button:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
