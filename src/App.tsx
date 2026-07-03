// src/App.tsx
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Game from "./components/Game";
import { AdSlotPlaceholder } from "./components/AdSlotPlaceholder";
import { AppearanceSelector } from "./components/AppearanceSelector";
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
  getHighScores,
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
import {
  BRICKBREAKER_OFFLINE_READY_EVENT,
  BRICKBREAKER_RELOAD_GUARD_KEY,
  BRICKBREAKER_UPDATE_INSTALLED_KEY,
  BRICKBREAKER_UPDATE_PROGRESS_EVENT,
  type BrickbreakerUpdateProgressDetail,
} from "./registerServiceWorker";
import {
  BUILD_VERSION_LABEL,
  BUILD_VERSION_ARIA_LABEL,
  BUILD_VERSION_MENU_LABEL,
} from "./constants/buildVersion";
import { LOG } from "./utils/logger";
import { audioManager } from "./utils/audioManager";
import { GameQaScenario } from "./logic/GameEngine";
import { useAppearancePreference } from "./hooks/useAppearancePreference";
import { useAudioPreference } from "./hooks/useAudioPreference";

LOG("🚦 App.tsx carregado");

const FIRST_AUDIO_INTERACTION_EVENTS = [
  "click",
  "pointerup",
  "keydown",
  "touchend",
] as const;
const OFFLINE_READY_VISIBLE_MS = 2400;
const UPDATE_INSTALLED_VISIBLE_MS = 5200;
const UPDATE_PROGRESS_MIN = 0;
const UPDATE_PROGRESS_MAX = 100;
const UPDATE_PROGRESS_TITLE = "Atualizando jogo";
const UPDATE_PROGRESS_LABEL = "Progresso da atualização";
const UPDATE_INSTALLED_PREFIX = "Versão";
const UPDATE_INSTALLED_SUFFIX = "instalada";
const LATE_PHASE_STABILITY_QA_SCENARIO = "late-phase-stability";
const CINEMATIC_RIP_QA_SCENARIO = "cinematic-rip";
const LASER_FAN_QA_SCENARIO = "laser-fan";
const COUNTDOWN_FIRST_STEP_INDEX = 0;
const COUNTDOWN_NEXT_STEP_INDEX = 1;
const COUNTDOWN_TIMER_OFFSET = 1;
const SPEED_LABEL_FRACTION_DIGITS = 2;
const SPEED_LABEL_SUFFIX = "×";
const HIGH_SCORE_PANEL_ARIA_LABEL = "Recordes gerais";
const HIGH_SCORE_BEST_LABEL = "Melhor partida";
const HIGH_SCORE_EMPTY_TEXT = "Ainda sem recordes";
const HIGH_SCORE_RANK_SUFFIX = "º";
const HIGH_SCORE_KEY_SEPARATOR = "-";
const INITIAL_COUNTDOWN_OVERLAY: GameCinematicOverlayState = {
  type: "countdown",
  value: CINEMATIC_COUNTDOWN_STEPS[COUNTDOWN_FIRST_STEP_INDEX],
};

interface UpdateProgressState {
  progress: number;
}

function formatHighScoreBest(scoreValue: number) {
  return `${HIGH_SCORE_BEST_LABEL} ${scoreValue}`;
}

function formatHighScoreRank(index: number, scoreValue: number) {
  return `${index + 1}${HIGH_SCORE_RANK_SUFFIX} ${scoreValue}`;
}

export default function App() {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScores, setHighScores] = useState<number[]>([]);
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
  const [updateProgress, setUpdateProgress] =
    useState<UpdateProgressState | null>(null);
  const [isUpdateInstalledVisible, setIsUpdateInstalledVisible] =
    useState(false);
  const { selection, selectTheme, selectImageSet, selectFontSet } = useAppearancePreference();
  const { isAudioMuted, toggleAudio } = useAudioPreference();
  const levelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cinematicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ripTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offlineReadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const updateInstalledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
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

  const refreshScoreSummary = useCallback(async () => {
    const [total, best, rankedScores] = await Promise.all([
      getTotalScore(),
      getHighScore(),
      getHighScores(),
    ]);
    setTotalScore(total);
    setHighScore(best);
    setHighScores(rankedScores);
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
      await refreshScoreSummary();
    } catch {
      audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT);
    }
  }, [audioSink, refreshScoreSummary]);

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
      if (updateInstalledTimerRef.current)
        clearTimeout(updateInstalledTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    void refreshScoreSummary().catch(() =>
      audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT),
    );
  }, [audioSink, refreshScoreSummary]);

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
    let didAttemptUnlock = false;

    const unlockAudio = () => {
      if (didAttemptUnlock) return;
      didAttemptUnlock = true;
      void audioManager.unlock().then((unlocked) => {
        if (unlocked) {
          void audioManager.playMusic(GAMEPLAY_MUSIC_AUDIO_ID);
        }
      });
    };

    for (const eventName of FIRST_AUDIO_INTERACTION_EVENTS) {
      window.addEventListener(eventName, unlockAudio, {
        once: true,
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

  useEffect(() => {
    const handleUpdateProgress = (event: Event) => {
      const detail = (event as CustomEvent<BrickbreakerUpdateProgressDetail>)
        .detail;
      const progress = Math.min(
        UPDATE_PROGRESS_MAX,
        Math.max(UPDATE_PROGRESS_MIN, detail?.progress ?? UPDATE_PROGRESS_MIN),
      );

      setIsUpdateInstalledVisible(false);
      setUpdateProgress({ progress });
    };

    window.addEventListener(
      BRICKBREAKER_UPDATE_PROGRESS_EVENT,
      handleUpdateProgress,
    );
    return () =>
      window.removeEventListener(
        BRICKBREAKER_UPDATE_PROGRESS_EVENT,
        handleUpdateProgress,
      );
  }, []);

  useEffect(() => {
    let shouldShowInstalledVersion = false;

    try {
      shouldShowInstalledVersion =
        window.sessionStorage.getItem(BRICKBREAKER_UPDATE_INSTALLED_KEY) !==
          null ||
        window.sessionStorage.getItem(BRICKBREAKER_RELOAD_GUARD_KEY) !== null;

      if (shouldShowInstalledVersion) {
        window.sessionStorage.removeItem(BRICKBREAKER_UPDATE_INSTALLED_KEY);
        window.sessionStorage.removeItem(BRICKBREAKER_RELOAD_GUARD_KEY);
      }
    } catch {
      return;
    }

    if (!shouldShowInstalledVersion) return;

    setUpdateProgress(null);
    setIsUpdateInstalledVisible(true);
    if (updateInstalledTimerRef.current)
      clearTimeout(updateInstalledTimerRef.current);
    updateInstalledTimerRef.current = setTimeout(() => {
      setIsUpdateInstalledVisible(false);
    }, UPDATE_INSTALLED_VISIBLE_MS);
  }, []);

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
      setHighScores([]);
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

  const handleImageSetChange = useCallback(
    (nextImageSet: Parameters<typeof selectImageSet>[0]) => {
      audioSink.playAudio(GAME_AUDIO_IDS.THEME_TOGGLE);
      selectImageSet(nextImageSet);
    },
    [audioSink, selectImageSet],
  );

  const handleFontSetChange = useCallback(
    (nextFontSet: Parameters<typeof selectFontSet>[0]) => {
      audioSink.playAudio(GAME_AUDIO_IDS.THEME_TOGGLE);
      selectFontSet(nextFontSet);
    },
    [audioSink, selectFontSet],
  );

  const handleAudioToggle = useCallback(async () => {
    if (!isAudioMuted) {
      audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
      await toggleAudio();
      return;
    }

    const result = await toggleAudio();
    if (result.changed && !result.muted && result.unlocked) {
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
      <section className="game-dashboard" aria-label="Jogo Brikaya">
        <header className="dashboard-header">
          <div className="dashboard-title-group">
            <p className="dashboard-eyebrow">Arcade clássico</p>
            <h1>Brikaya</h1>
          </div>
          <div
            className="dashboard-primary-controls"
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
          <div className="score-hud" aria-label="Painel de pontuação">
            <span className="score-hud__segment">Fase {level}</span>
            <span className="score-hud__separator" aria-hidden="true">
              |
            </span>
            <span className="score-hud__segment">Score {score}</span>
            <span className="score-hud__separator" aria-hidden="true">
              |
            </span>
            <span className="score-hud__segment">Total {totalScore}</span>
            <span className="score-hud__separator" aria-hidden="true">
              |
            </span>
            <span className="score-hud__segment">Recorde {highScore}</span>
          </div>
          <div className="dashboard-header-controls">
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
                <h3>Aparência</h3>
                <AppearanceSelector
                  selection={selection}
                  onThemeChange={handleThemeChange}
                  onImageSetChange={handleImageSetChange}
                  onFontSetChange={handleFontSetChange}
                />
              </div>
              <div
                className="settings-drawer__section high-scores-panel"
                aria-label={HIGH_SCORE_PANEL_ARIA_LABEL}
              >
                <h3>Recordes</h3>
                <p className="high-scores-panel__best">
                  {formatHighScoreBest(highScore)}
                </p>
                {highScores.length > 0 ? (
                  <ol className="high-scores-panel__list">
                    {highScores.map((scoreValue, index) => (
                      <li
                        key={`${scoreValue}${HIGH_SCORE_KEY_SEPARATOR}${index}`}
                      >
                        {formatHighScoreRank(index, scoreValue)}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="high-scores-panel__empty">
                    {HIGH_SCORE_EMPTY_TEXT}
                  </p>
                )}
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
                imageSetId={selection.imageSetId}
              />
            </div>
            <AdSlotPlaceholder variant="bottom" />
          </div>
          <AdSlotPlaceholder variant="side" />
        </div>

        <div className="game-status-region" aria-live="polite">
          {updateProgress && (
            <div className="app-update-message">
              <p>{UPDATE_PROGRESS_TITLE}</p>
              <div
                className="app-update-message__track"
                role="progressbar"
                aria-label={UPDATE_PROGRESS_LABEL}
                aria-valuemin={UPDATE_PROGRESS_MIN}
                aria-valuemax={UPDATE_PROGRESS_MAX}
                aria-valuenow={updateProgress.progress}
              >
                <span
                  className="app-update-message__bar"
                  style={{ width: `${updateProgress.progress}%` }}
                />
              </div>
            </div>
          )}
          {isUpdateInstalledVisible && (
            <div className="update-installed-message">
              <p>
                {UPDATE_INSTALLED_PREFIX} {BUILD_VERSION_LABEL}{" "}
                {UPDATE_INSTALLED_SUFFIX}
              </p>
            </div>
          )}
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
      <GameCinematicOverlay
        state={cinematicOverlay}
        imageSetId={selection.imageSetId}
      />
    </main>
  );
}
