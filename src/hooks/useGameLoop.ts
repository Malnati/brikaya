// src/hooks/useGameLoop.ts
import { useEffect, RefObject, useCallback } from 'react';
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
  // Memoizar as funções para evitar recriações desnecessárias
  const memoizedOnScoreUpdate = useCallback(onScoreUpdate, []);
  const memoizedOnGameWon = useCallback(onGameWon || (() => {}), [onGameWon]);
  const memoizedOnGameOver = useCallback(onGameOver || (() => {}), [onGameOver]);

  useEffect(() => {
    if (!canvasRef.current) {
      LOG('❌ canvasRef.current não está disponível');
      return;
    }
    
    LOG(`🎮 Iniciando GameEngine...`);
    LOG(`🎮 Canvas ref:`, canvasRef.current);
    LOG(`🎮 Canvas size:`, canvasRef.current.width, 'x', canvasRef.current.height);
    
    try {
      const engine = new GameEngine(canvasRef.current, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver, canvasSize);
      LOG(`🎮 GameEngine criado com sucesso, chamando start()...`);
      engine.start();
      LOG(`🎮 engine.start() chamado`);
    } catch (error) {
      ERROR('❌ Erro ao criar/iniciar GameEngine:', error);
    }
    
    return () => {
      LOG(`🛑 Parando GameEngine...`);
      // engine.stop();
    };
  }, [canvasRef, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver]); // Removido canvasSize das dependências
}
