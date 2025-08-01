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
    if (!canvasRef.current) {
      console.log('❌ canvasRef.current não está disponível');
      return;
    }
    
    console.log(`🎮 Iniciando GameEngine...`);
    console.log(`🎮 Canvas ref:`, canvasRef.current);
    console.log(`🎮 Canvas size:`, canvasRef.current.width, 'x', canvasRef.current.height);
    
    try {
      const engine = new GameEngine(canvasRef.current, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver, canvasSize);
      console.log(`🎮 GameEngine criado com sucesso, chamando start()...`);
      engine.start();
      console.log(`🎮 engine.start() chamado`);
    } catch (error) {
      console.error('❌ Erro ao criar/iniciar GameEngine:', error);
    }
    
    return () => {
      console.log(`🛑 Parando GameEngine...`);
      // engine.stop();
    };
  }, [canvasRef, memoizedOnScoreUpdate, memoizedOnGameWon, memoizedOnGameOver]); // Removido canvasSize das dependências
}
