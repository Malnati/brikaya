// src/App.tsx
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Game from './components/Game';
import { AdSlotPlaceholder } from './components/AdSlotPlaceholder';
import { saveScore, getTotalScore, resetScores } from './storage/score';
import { LEVEL_TOAST_EXIT_MS, LEVEL_TOAST_VISIBLE_MS, LevelTransitionPayload } from './constants/game';
import { LOG } from './utils/logger';
import { GameQaScenario } from './logic/GameEngine';

LOG('🚦 App.tsx carregado');

export default function App() {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [levelToastPayload, setLevelToastPayload] = useState<LevelTransitionPayload | null>(null);
  const [isLevelToastVisible, setIsLevelToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const levelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qaScenario = useMemo<GameQaScenario | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('qaScenario') === 'single-brick-phase-clear'
      ? 'single-brick-phase-clear'
      : null;
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    scoreRef.current = newScore;
    setScore(newScore);
  }, []);

  const handleGameWon = useCallback(async () => {
    setGameWon(true);
    await saveScore(scoreRef.current);
    const total = await getTotalScore();
    setTotalScore(total);
  }, []);

  const handleGameOver = useCallback(async () => {
    setGameOver(true);
    await saveScore(scoreRef.current);
    const total = await getTotalScore();
    setTotalScore(total);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (levelTimerRef.current) clearTimeout(levelTimerRef.current);
    if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);
  }, []);

  useEffect(() => {
    getTotalScore().then(setTotalScore);
  }, []);

  const handleRestart = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setGameWon(false);
    setGameOver(false);
    setLevel(1);
    setLevelToastPayload(null);
    setIsLevelToastVisible(false);
    setGameKey(prev => prev + 1);
  }, []);

  const handleResetScores = useCallback(async () => {
    await resetScores();
    setTotalScore(0);
  }, []);

  const handleLevelTransition = useCallback((payload: LevelTransitionPayload) => {
    setLevelToastPayload(payload);
    setIsLevelToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (levelTimerRef.current) clearTimeout(levelTimerRef.current);
    if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);

    toastTimerRef.current = setTimeout(() => {
      setIsLevelToastVisible(false);
    }, LEVEL_TOAST_VISIBLE_MS);

    levelTimerRef.current = setTimeout(() => {
      setLevel(payload.nextLevel);
    }, payload.pauseMs);

    hideToastTimerRef.current = setTimeout(() => {
      setLevelToastPayload(null);
    }, payload.pauseMs + LEVEL_TOAST_EXIT_MS);
  }, []);

  return (
    <main className="app-shell">
      <section className="game-dashboard" aria-label="Jogo Breakout">
        <header className="dashboard-header">
          <div className="dashboard-title-group">
            <p className="dashboard-eyebrow">Arcade offline</p>
            <h1>Breakout</h1>
          </div>
          <div className="score-strip" aria-label="Painel de pontuação">
            <span className="score-chip">Fase {level}</span>
            <span className="score-chip">Score {score}</span>
            <span className="score-chip">Total {totalScore}</span>
          </div>
        </header>

        <div className="dashboard-layout">
          <div className="play-column">
            <div className="game-container">
              <Game
                key={gameKey}
                onScoreUpdate={handleScoreUpdate}
                onGameWon={handleGameWon}
                onGameOver={handleGameOver}
                onLevelTransition={handleLevelTransition}
                levelToastPayload={levelToastPayload}
                isLevelToastVisible={isLevelToastVisible}
                qaScenario={qaScenario}
              />
            </div>
            <div className="dashboard-actions" aria-label="Ações principais">
              <button type="button" onClick={handleRestart} className="dashboard-button dashboard-button--primary">
                <span aria-hidden="true" className="button-icon">↻</span>
                {gameWon || gameOver ? 'Jogar de novo' : 'Reiniciar'}
              </button>
              <button type="button" onClick={handleResetScores} className="dashboard-button dashboard-button--secondary">
                <span aria-hidden="true" className="button-icon">0</span>
                Zerar pontuação
              </button>
            </div>
            <AdSlotPlaceholder variant="bottom" />
          </div>
          <AdSlotPlaceholder variant="side" />
        </div>

        <div className="game-status-region" aria-live="polite">
        {gameWon && (
          <div className="victory-message">
            <h2>Fase concluída</h2>
            <p>Pontuação final: {score}</p>
          </div>
        )}
        {gameOver && (
          <div className="game-over-message">
            <h2>Fim de jogo</h2>
            <p>Pontuação final: {score}</p>
          </div>
        )}
        </div>
      </section>
    </main>
  );
}
