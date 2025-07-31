// src/App.tsx
import { useState, useCallback, useEffect } from 'react';
import Game from './components/Game';
import GameLogViewer from './components/GameLogViewer';
import { saveScore, getTotalScore, resetScores } from './storage/score';

export default function App() {
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

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

  const toggleLogs = useCallback(() => {
    setShowLogs(prev => !prev);
  }, []);

  if (showLogs) {
    return (
      <div className="app-container">
        <div className="game-info">
          <h1>📊 Logs do BrickBreaker</h1>
          <button onClick={toggleLogs} className="restart-button">
            ← Voltar ao Jogo
          </button>
        </div>
        <GameLogViewer />
      </div>
    );
  }

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
      </div>
      <div className="game-container">
        <Game key={gameKey} onScoreUpdate={handleScoreUpdate} onGameWon={handleGameWon} onGameOver={handleGameOver} />
      </div>
      <div className="game-info">
        <button onClick={handleRestart} className="restart-button">
          {gameWon || gameOver ? 'Jogar Novamente' : 'Restart Game'}
        </button>
        <button onClick={handleResetScores} className="restart-button">
          Resetar Pontuação
        </button>
        <button onClick={toggleLogs} className="restart-button">
          📊 Ver Logs
        </button>
      </div>
    </div>
  );
}
