// src/App.tsx
import { useState, useCallback } from 'react';
import Game from './components/Game';

export default function App() {
  const [score, setScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameWon = useCallback(() => {
    setGameWon(true);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setGameWon(false);
    setGameKey(prev => prev + 1);
  }, []);

  return (
    <div className="app-container">
      <h1>Breakout</h1>
      <div className="game-info">
        <p>Score: {score}</p>
        {gameWon && (
          <div className="victory-message">
            <h2>🎉 Parabéns! Você venceu! 🎉</h2>
            <p>Pontuação final: {score}</p>
          </div>
        )}
        <button onClick={handleRestart} className="restart-button">
          {gameWon ? 'Jogar Novamente' : 'Restart Game'}
        </button>
      </div>
      <Game key={gameKey} onScoreUpdate={handleScoreUpdate} onGameWon={handleGameWon} />
    </div>
  );
}
