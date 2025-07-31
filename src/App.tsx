// src/App.tsx
import { useState, useCallback } from 'react';
import Game from './components/Game';

export default function App() {
  const [score, setScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setGameKey(prev => prev + 1);
  }, []);

  return (
    <div className="app-container">
      <h1>Breakout</h1>
      <div className="game-info">
        <p>Score: {score}</p>
        <button onClick={handleRestart} className="restart-button">
          Restart Game
        </button>
      </div>
      <Game key={gameKey} onScoreUpdate={handleScoreUpdate} />
    </div>
  );
}
