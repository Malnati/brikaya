// src/App.tsx
import { useState, useCallback, useEffect } from 'react';
import Game from './components/Game';
import { saveScore, getTotalScore, resetScores } from './storage/score';

export default function App() {
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameWon = useCallback(async () => {
    setGameWon(true);
    await saveScore(score);
    const total = await getTotalScore();
    setTotalScore(total);
  }, [score]);

  const handleGameOver = useCallback(async () => {
    setGameOver(true);
    await saveScore(score);
    const total = await getTotalScore();
    setTotalScore(total);
  }, [score]);

  useEffect(() => {
    getTotalScore().then(setTotalScore);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setGameWon(false);
    setGameOver(false);
    setGameKey(prev => prev + 1);
  }, []);

  const handleResetScores = useCallback(async () => {
    await resetScores();
    setTotalScore(0);
  }, []);

  return (
    <div className="app-container">
      <h1>Breakout</h1>
      <div className="game-info">
        <p>Score: {score}</p>
        <p>Total: {totalScore}</p>
        {gameWon && (
          <div className="victory-message">
            <h2>🎉 Parabéns! Você venceu! 🎉</h2>
            <p>Pontuação final: {score}</p>
          </div>
        )}
        {gameOver && (
          <div className="game-over-message">
            <h2>💥 Fim de Jogo! 💥</h2>
            <p>Pontuação final: {score}</p>
          </div>
        )}
        <button onClick={handleRestart} className="restart-button">
          {gameWon || gameOver ? 'Jogar Novamente' : 'Restart Game'}
        </button>
        <button onClick={handleResetScores} className="restart-button">
          Resetar Pontuação
        </button>
      </div>
      <Game key={gameKey} onScoreUpdate={handleScoreUpdate} onGameWon={handleGameWon} onGameOver={handleGameOver} />
    </div>
  );
}
