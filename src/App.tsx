// src/App.tsx
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Game from "./components/Game";
import { AdSlotPlaceholder } from "./components/AdSlotPlaceholder";
import { ThemeToggle } from "./components/ThemeToggle";
import { AudioToggle } from "./components/AudioToggle";
import { CollisionStats } from "./components/CollisionStats";
import GameLogViewer from "./components/GameLogViewer";
import {
  GameCinematicOverlay,
  type GameCinematicOverlayState,
} from "./components/GameCinematicOverlay";
import {
  saveScore,
  getTotalScore,
  resetScores,
  getHighScore,
  saveHighScore,
} from "./storage/score";
import {
  CINEMATIC_COUNTDOWN_STEP_MS,
  CINEMATIC_COUNTDOWN_STEPS,
  CINEMATIC_COUNTDOWN_TOTAL_MS,
  CINEMATIC_RIP_VISIBLE_MS,
  LEVEL_UP_OVERLAY_VISIBLE_MS,
  LevelTransitionPayload,
} from "./constants/game";
import {
  AUDIO_QA_SCENARIO,
  GAMEPLAY_MUSIC_AUDIO_ID,
  GAME_AUDIO_IDS,
  MENU_MUSIC_AUDIO_ID,
  type GameAudioSink,
} from "./constants/audio";
import { BRICKBREAKER_OFFLINE_READY_EVENT } from "./registerServiceWorker";
import {
  BUILD_VERSION_ARIA_LABEL,
  BUILD_VERSION_MENU_LABEL,
} from "./constants/buildVersion";
import { LOG } from "./utils/logger";
import { audioManager } from "./utils/audioManager";
import { GameQaScenario } from "./logic/GameEngine";
import { useThemePreference } from "./hooks/useThemePreference";
import { useAudioPreference } from "./hooks/useAudioPreference";

LOG("🚦 App.tsx carregado");

const FIRST_AUDIO_INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
] as const;
const OFFLINE_READY_VISIBLE_MS = 2400;
const LATE_PHASE_STABILITY_QA_SCENARIO = "late-phase-stability";
const CINEMATIC_RIP_QA_SCENARIO = "cinematic-rip";
const LASER_FAN_QA_SCENARIO = "laser-fan";
const COUNTDOWN_FIRST_STEP_INDEX = 0;
const COUNTDOWN_NEXT_STEP_INDEX = 1;
const COUNTDOWN_TIMER_OFFSET = 1;
const SPEED_LABEL_FRACTION_DIGITS = 2;
const SPEED_LABEL_SUFFIX = "×";
const INITIAL_COUNTDOWN_OVERLAY: GameCinematicOverlayState = {
  type: "countdown",
  value: CINEMATIC_COUNTDOWN_STEPS[COUNTDOWN_FIRST_STEP_INDEX],
};

export default function App() {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [cinematicOverlay, setCinematicOverlay] =
    useState<GameCinematicOverlayState>(INITIAL_COUNTDOWN_OVERLAY);
  const [isInitialCountdownActive, setIsInitialCountdownActive] =
    useState(true);
  const [isCinematicRipScenarioConsumed, setIsCinematicRipScenarioConsumed] =
    useState(false);
  const [isOfflineReadyVisible, setIsOfflineReadyVisible] = useState(false);
  const { theme, selectTheme } = useThemePreference();
  const { isAudioMuted, toggleAudio } = useAudioPreference();
  const levelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cinematicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ripTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offlineReadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCollisionStats, setShowCollisionStats] = useState(false);
  const [showGameLogs, setShowGameLogs] = useState(false);
  const qaScenario = useMemo<GameQaScenario | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const scenario = searchParams.get("qaScenario");
    if (scenario === "single-brick-phase-clear")
      return "single-brick-phase-clear";
    if (scenario === LATE_PHASE_STABILITY_QA_SCENARIO)
      return LATE_PHASE_STABILITY_QA_SCENARIO;
    if (scenario === CINEMATIC_RIP_QA_SCENARIO)
      return CINEMATIC_RIP_QA_SCENARIO;
    if (scenario === LASER_FAN_QA_SCENARIO) return LASER_FAN_QA_SCENARIO;
    if (scenario === AUDIO_QA_SCENARIO) return AUDIO_QA_SCENARIO;
    return null;
  }, []);
  const audioSink = useMemo<GameAudioSink>(
    () => ({
      playAudio: (id) => {
        void audioManager.play(id);
      },
      startGameplayMusic: () => {
        void audioManager.playMusic(GAMEPLAY_MUSIC_AUDIO_ID);
      },
      startMenuMusic: () => {
        void audioManager.playMusic(MENU_MUSIC_AUDIO_ID);
      },
      setHighIntensity: (active) => {
        void audioManager.setHighIntensity(active);
      },
    }),
    [],
  );
  const effectiveQaScenario = useMemo<GameQaScenario | null>(() => {
    if (
      qaScenario === CINEMATIC_RIP_QA_SCENARIO &&
      isCinematicRipScenarioConsumed
    )
      return null;

    return qaScenario;
  }, [isCinematicRipScenarioConsumed, qaScenario]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    scoreRef.current = newScore;
    setScore(newScore);
  }, []);

  const persistFinalScore = useCallback(async () => {
    try {
      const finalScore = scoreRef.current;
      await saveScore(finalScore);
      const previousHighScore = await getHighScore();
      if (finalScore > previousHighScore) {
        await saveHighScore(finalScore);
        setHighScore(finalScore);
        audioSink.playAudio(GAME_AUDIO_IDS.HIGHSCORE_NEW);
      }
      const total = await getTotalScore();
      setTotalScore(total);
    } catch {
      audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT);
    }
  }, [audioSink]);

  const resetGameState = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setGameWon(false);
    setGameOver(false);
    setLevel(1);
    setCinematicOverlay(null);
    setGameKey((prev) => prev + 1);
    setIsMenuOpen(false);
  }, []);

  const handleGameWon = useCallback(async () => {
    setGameWon(true);
    await persistFinalScore();
    audioSink.startMenuMusic();
  }, [audioSink, persistFinalScore]);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setCinematicOverlay({ type: "rip" });
    if (ripTimerRef.current) clearTimeout(ripTimerRef.current);
    ripTimerRef.current = setTimeout(() => {
      if (qaScenario === CINEMATIC_RIP_QA_SCENARIO) {
        setIsCinematicRipScenarioConsumed(true);
      }
      resetGameState();
    }, CINEMATIC_RIP_VISIBLE_MS);
    void persistFinalScore();
  }, [persistFinalScore, qaScenario, resetGameState]);

  useEffect(
    () => () => {
      if (levelTimerRef.current) clearTimeout(levelTimerRef.current);
      if (cinematicTimerRef.current) clearTimeout(cinematicTimerRef.current);
      if (ripTimerRef.current) clearTimeout(ripTimerRef.current);
      for (const countdownTimer of countdownTimerRefs.current) {
        clearTimeout(countdownTimer);
      }
      if (offlineReadyTimerRef.current)
        clearTimeout(offlineReadyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    getTotalScore()
      .then(setTotalScore)
      .catch(() => audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT));
    getHighScore()
      .then(setHighScore)
      .catch(() => audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT));
  }, [audioSink]);

  useEffect(() => {
    audioManager.exposeQaApi();
    if (qaScenario === AUDIO_QA_SCENARIO) {
      void audioManager.runQaTour();
    }
  }, [qaScenario]);

  useEffect(() => {
    if (!isInitialCountdownActive) return undefined;

    audioSink.playAudio(GAME_AUDIO_IDS.COUNTDOWN_TICK);
    const timers = CINEMATIC_COUNTDOWN_STEPS.slice(
      COUNTDOWN_NEXT_STEP_INDEX,
    ).map((step, index) =>
      setTimeout(
        () => {
          audioSink.playAudio(GAME_AUDIO_IDS.COUNTDOWN_TICK);
          setCinematicOverlay({ type: "countdown", value: step });
        },
        (index + COUNTDOWN_TIMER_OFFSET) * CINEMATIC_COUNTDOWN_STEP_MS,
      ),
    );

    timers.push(
      setTimeout(() => {
        setCinematicOverlay(null);
        setIsInitialCountdownActive(false);
      }, CINEMATIC_COUNTDOWN_TOTAL_MS),
    );
    countdownTimerRefs.current = timers;

    return () => {
      for (const countdownTimer of timers) {
        clearTimeout(countdownTimer);
      }
      countdownTimerRefs.current = [];
    };
  }, [audioSink, isInitialCountdownActive]);

  useEffect(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.AD_PLACEHOLDER_NONE);
  }, [audioSink]);

  useEffect(() => {
    if (isAudioMuted) return undefined;

    const unlockAudio = () => {
      void audioManager.unlock().then((unlocked) => {
        if (unlocked) {
          void audioManager.playMusic(GAMEPLAY_MUSIC_AUDIO_ID);
        }
      });
    };

    for (const eventName of FIRST_AUDIO_INTERACTION_EVENTS) {
      window.addEventListener(eventName, unlockAudio, {
        once: true,
        passive: true,
      });
    }

    return () => {
      for (const eventName of FIRST_AUDIO_INTERACTION_EVENTS) {
        window.removeEventListener(eventName, unlockAudio);
      }
    };
  }, [isAudioMuted]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        audioSink.playAudio(GAME_AUDIO_IDS.PANEL_CLOSE);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audioSink, isMenuOpen]);

  useEffect(() => {
    const showOfflineReady = () => {
      setIsOfflineReadyVisible(true);
      audioSink.playAudio(GAME_AUDIO_IDS.OFFLINE_READY);
      if (offlineReadyTimerRef.current)
        clearTimeout(offlineReadyTimerRef.current);
      offlineReadyTimerRef.current = setTimeout(() => {
        setIsOfflineReadyVisible(false);
      }, OFFLINE_READY_VISIBLE_MS);
    };

    window.addEventListener(BRICKBREAKER_OFFLINE_READY_EVENT, showOfflineReady);
    return () =>
      window.removeEventListener(
        BRICKBREAKER_OFFLINE_READY_EVENT,
        showOfflineReady,
      );
  }, [audioSink]);

  const handleRestart = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.RESTART);
    if (ripTimerRef.current) clearTimeout(ripTimerRef.current);
    resetGameState();
  }, [audioSink, resetGameState]);

  const handleResetScores = useCallback(async () => {
    audioSink.playAudio(GAME_AUDIO_IDS.RESET_SCORE);
    try {
      await resetScores();
      setTotalScore(0);
      setHighScore(0);
      setIsMenuOpen(false);
    } catch {
      audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT);
    }
  }, [audioSink]);

  const handleOpenMenu = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    setIsMenuOpen(true);
  }, [audioSink]);

  const handleCloseMenu = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.PANEL_CLOSE);
    setIsMenuOpen(false);
  }, [audioSink]);

  const handleOpenLogs = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.PANEL_OPEN);
    setShowGameLogs(true);
    setIsMenuOpen(false);
  }, [audioSink]);

  const handleCloseLogs = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.PANEL_CLOSE);
    setShowGameLogs(false);
  }, [audioSink]);

  const handleOpenCollisionStats = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.PANEL_OPEN);
    setShowCollisionStats(true);
    setIsMenuOpen(false);
  }, [audioSink]);

  const handleCloseCollisionStats = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.PANEL_CLOSE);
    setShowCollisionStats(false);
  }, [audioSink]);

  const handleThemeChange = useCallback(
    (nextTheme: Parameters<typeof selectTheme>[0]) => {
      audioSink.playAudio(GAME_AUDIO_IDS.THEME_TOGGLE);
      selectTheme(nextTheme);
    },
    [audioSink, selectTheme],
  );

  const handleAudioToggle = useCallback(async () => {
    if (!isAudioMuted) {
      audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    }
    await toggleAudio();
    if (isAudioMuted) {
      audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
      audioSink.startGameplayMusic();
    }
  }, [audioSink, isAudioMuted, toggleAudio]);

  const handleLevelTransition = useCallback(
    (payload: LevelTransitionPayload) => {
      audioSink.playAudio(GAME_AUDIO_IDS.LEVEL_UP_OVERLAY);
      setCinematicOverlay({
        type: "levelUp",
        nextLevel: payload.nextLevel,
        speedLabel: `${payload.nextSpeedMultiplier.toFixed(
          SPEED_LABEL_FRACTION_DIGITS,
        )}${SPEED_LABEL_SUFFIX}`,
      });
      if (levelTimerRef.current) clearTimeout(levelTimerRef.current);
      if (cinematicTimerRef.current) clearTimeout(cinematicTimerRef.current);

      cinematicTimerRef.current = setTimeout(() => {
        setCinematicOverlay(null);
      }, LEVEL_UP_OVERLAY_VISIBLE_MS);

      levelTimerRef.current = setTimeout(() => {
        setLevel(payload.nextLevel);
      }, payload.pauseMs);
    },
    [audioSink],
  );

  const handleLevelChange = useCallback((nextLevel: number) => {
    setLevel(nextLevel);
  }, []);

  const restartLabel = gameWon || gameOver ? "Jogar de novo" : "Reiniciar";

  return (
    <main className="app-shell">
      <section className="game-dashboard" aria-label="Jogo Breakout">
        <header className="dashboard-header">
          <div className="dashboard-title-group">
            <p className="dashboard-eyebrow">Arcade clássico</p>
            <h1>Breakout</h1>
          </div>
          <div className="dashboard-header-controls">
            <div className="score-strip" aria-label="Painel de pontuação">
              <span className="score-chip">Fase {level}</span>
              <span className="score-chip">Score {score}</span>
              <span className="score-chip">Total {totalScore}</span>
              <span className="score-chip">Recorde {highScore}</span>
            </div>
            <button
              type="button"
              className="dashboard-menu-button"
              aria-expanded={isMenuOpen}
              aria-controls="game-settings-menu"
              onClick={handleOpenMenu}
            >
              Menu
            </button>
          </div>
        </header>

        {isMenuOpen && (
          <>
            <button
              type="button"
              className="settings-drawer-backdrop"
              aria-label="Fechar menu"
              onClick={handleCloseMenu}
            />
            <aside
              id="game-settings-menu"
              className="settings-drawer"
              aria-label="Menu do jogo"
            >
              <div className="settings-drawer__header">
                <h2>Menu</h2>
                <button
                  type="button"
                  className="settings-drawer__close"
                  aria-label="Fechar menu"
                  onClick={handleCloseMenu}
                >
                  ×
                </button>
              </div>
              <p
                className="settings-drawer__version"
                aria-label={BUILD_VERSION_ARIA_LABEL}
              >
                {BUILD_VERSION_MENU_LABEL}
              </p>
              <div className="settings-drawer__section">
                <h3>Tema</h3>
                <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
              </div>
              <div className="settings-drawer__section">
                <h3>Ferramentas</h3>
                <button
                  type="button"
                  onClick={handleOpenLogs}
                  className="dashboard-button dashboard-button--secondary"
                >
                  <span aria-hidden="true" className="button-icon">
                    ≡
                  </span>
                  Logs
                </button>
                <button
                  type="button"
                  onClick={handleOpenCollisionStats}
                  className="dashboard-button dashboard-button--secondary"
                >
                  <span aria-hidden="true" className="button-icon">
                    ◈
                  </span>
                  Colisões
                </button>
                <button
                  type="button"
                  onClick={handleResetScores}
                  className="dashboard-button dashboard-button--secondary"
                >
                  <span aria-hidden="true" className="button-icon">
                    0
                  </span>
                  Zerar pontuação
                </button>
              </div>
            </aside>
          </>
        )}

        <div className="dashboard-layout">
          <div className="play-column">
            <div className="game-container">
              <Game
                key={gameKey}
                onScoreUpdate={handleScoreUpdate}
                onGameWon={handleGameWon}
                onGameOver={handleGameOver}
                onLevelTransition={handleLevelTransition}
                onLevelChange={handleLevelChange}
                qaScenario={effectiveQaScenario}
                audioSink={audioSink}
                startBlocked={isInitialCountdownActive}
                boardControls={
                  <div
                    className="game-corner-controls"
                    aria-label="Controles principais"
                  >
                    <AudioToggle
                      muted={isAudioMuted}
                      onToggle={handleAudioToggle}
                      iconOnly
                      className="game-icon-control game-icon-control--audio"
                    />
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="dashboard-button dashboard-button--primary game-icon-control game-icon-control--restart"
                      aria-label={restartLabel}
                      title={restartLabel}
                    >
                      <span aria-hidden="true" className="button-icon">
                        ↻
                      </span>
                    </button>
                  </div>
                }
              />
            </div>
            <AdSlotPlaceholder variant="bottom" />
          </div>
          <AdSlotPlaceholder variant="side" />
        </div>

        <div className="game-status-region" aria-live="polite">
          {isOfflineReadyVisible && (
            <div className="offline-ready-message">
              <p>Pronto para jogar offline</p>
            </div>
          )}
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
      <CollisionStats
        isVisible={showCollisionStats}
        onClose={handleCloseCollisionStats}
      />
      <GameLogViewer isVisible={showGameLogs} onClose={handleCloseLogs} />
      <GameCinematicOverlay state={cinematicOverlay} />
    </main>
  );
}
