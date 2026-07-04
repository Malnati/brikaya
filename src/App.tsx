// src/App.tsx
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
} from "react";
import Game, { type GameBoardRect } from "./components/Game";
import { AppearanceSelector } from "./components/AppearanceSelector";
import { AudioToggle } from "./components/AudioToggle";
import { MusicToggle } from "./components/MusicToggle";
import { ConsentScreen } from "./components/ConsentScreen";
import { LanguageDetectionOverlay } from "./components/LanguageDetectionOverlay";
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
  BRIKAYA_OFFLINE_READY_EVENT,
  BRIKAYA_RELOAD_GUARD_KEY,
  BRIKAYA_UPDATE_INSTALLED_KEY,
  BRIKAYA_UPDATE_PROGRESS_EVENT,
  type BrikayaUpdateProgressDetail,
} from "./registerServiceWorker";
import { BUILD_VERSION_LABEL } from "./constants/buildVersion";
import { LOG } from "./utils/logger";
import { audioManager } from "./utils/audioManager";
import {
  refreshAppAfterLocalReset,
  resetLocalAppState,
} from "./utils/localAppReset";
import { GameQaScenario } from "./logic/GameEngine";
import { useAppearancePreference } from "./hooks/useAppearancePreference";
import { useAudioPreference } from "./hooks/useAudioPreference";
import { useLanguageLocationConsent } from "./hooks/useLanguageLocationConsent";
import { usePrivacyConsent } from "./hooks/usePrivacyConsent";
import {
  SUPPORTED_LOCALES,
  useI18n,
  type AppLocale,
  type TranslationKey,
} from "./i18n";
import { requestLocaleFromDeviceLocation } from "./i18n/locationLocale";

LOG("🚦 App.tsx carregado");

const FIRST_AUDIO_INTERACTION_EVENTS = [
  "click",
  "pointerup",
  "keydown",
  "touchend",
] as const;
const OFFLINE_READY_VISIBLE_MS = 2400;
const LANGUAGE_DETECTION_VISIBLE_MS = 2000;
const UPDATE_INSTALLED_VISIBLE_MS = 5200;
const UPDATE_PROGRESS_MIN = 0;
const UPDATE_PROGRESS_MAX = 100;
const UPDATE_PROGRESS_COMPLETE = 100;
const UPDATE_PROGRESS_COMPLETE_STAGE = "reloading";
const LATE_PHASE_STABILITY_QA_SCENARIO = "late-phase-stability";
const CINEMATIC_RIP_QA_SCENARIO = "cinematic-rip";
const PADDLE_COLLISION_QA_SCENARIO = "paddle-collision";
const LASER_FAN_QA_SCENARIO = "laser-fan";
const METAL_BLOCK_QA_SCENARIO = "metal-block";
const EVASIVE_BLOCKS_QA_SCENARIO = "evasive-blocks";
const COUNTDOWN_FIRST_STEP_INDEX = 0;
const COUNTDOWN_NEXT_STEP_INDEX = 1;
const COUNTDOWN_TIMER_OFFSET = 1;
const SPEED_LABEL_FRACTION_DIGITS = 2;
const SPEED_LABEL_SUFFIX = "×";
const HIGH_SCORE_KEY_SEPARATOR = "-";
const LANGUAGE_SELECT_ID = "game-language-select";
const SETTINGS_ACTION_LOGS = "logs";
const SETTINGS_ACTION_COLLISIONS = "collisions";
const SETTINGS_ACTION_RESET_SCORE = "reset-score";
const SETTINGS_ACTION_RESET_PREFERENCES = "reset-preferences";
const INITIAL_COUNTDOWN_OVERLAY: GameCinematicOverlayState = {
  type: "countdown",
  value: CINEMATIC_COUNTDOWN_STEPS[COUNTDOWN_FIRST_STEP_INDEX],
};

interface UpdateProgressState {
  progress: number;
}

export default function App() {
  const { locale, setLocale, setLocaleFromLocation, t } = useI18n();
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highScores, setHighScores] = useState<number[]>([]);
  const [gameKey, setGameKey] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const { hasPrivacyConsent, acceptPrivacyConsent, revokePrivacyConsent } =
    usePrivacyConsent();
  const {
    hasLanguageLocationConsent,
    acceptLanguageLocationConsent,
    revokeLanguageLocationConsent,
  } = useLanguageLocationConsent();
  const shouldStartWithLanguageDetection =
    hasPrivacyConsent && hasLanguageLocationConsent;
  const [cinematicOverlay, setCinematicOverlay] =
    useState<GameCinematicOverlayState>(
      hasPrivacyConsent && !shouldStartWithLanguageDetection
        ? INITIAL_COUNTDOWN_OVERLAY
        : null,
    );
  const [boardRect, setBoardRect] = useState<GameBoardRect | null>(null);
  const [isInitialCountdownActive, setIsInitialCountdownActive] = useState(
    hasPrivacyConsent && !shouldStartWithLanguageDetection,
  );
  const [isLanguageDetectionVisible, setIsLanguageDetectionVisible] = useState(
    shouldStartWithLanguageDetection,
  );
  const [isCinematicRipScenarioConsumed, setIsCinematicRipScenarioConsumed] =
    useState(false);
  const [isOfflineReadyVisible, setIsOfflineReadyVisible] = useState(false);
  const [updateProgress, setUpdateProgress] =
    useState<UpdateProgressState | null>(null);
  const [isUpdateInstalledVisible, setIsUpdateInstalledVisible] =
    useState(false);
  const [isResetPreferencesErrorVisible, setIsResetPreferencesErrorVisible] =
    useState(false);
  const [isResetPreferencesBusy, setIsResetPreferencesBusy] = useState(false);
  const {
    selection,
    selectTheme,
    selectVisualThemePreset,
    selectAutomaticTheme,
    advanceAutoTheme,
    selectImageSet,
    selectFontSet,
  } = useAppearancePreference();
  const { isAudioMuted, isMusicMuted, toggleAudio, toggleMusic } =
    useAudioPreference();
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
  const languageDetectionTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const languageDetectionStartedRef = useRef(false);
  const languageDetectionRunIdRef = useRef(0);
  const updateProgressSoundPlayedRef = useRef(false);
  const updateInstalledSoundPlayedRef = useRef(false);
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
    if (scenario === PADDLE_COLLISION_QA_SCENARIO)
      return PADDLE_COLLISION_QA_SCENARIO;
    if (scenario === LASER_FAN_QA_SCENARIO) return LASER_FAN_QA_SCENARIO;
    if (scenario === METAL_BLOCK_QA_SCENARIO) return METAL_BLOCK_QA_SCENARIO;
    if (scenario === EVASIVE_BLOCKS_QA_SCENARIO)
      return EVASIVE_BLOCKS_QA_SCENARIO;
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
  const handleBoardRectChange = useCallback((nextRect: GameBoardRect) => {
    setBoardRect((currentRect) => {
      if (
        currentRect &&
        currentRect.x === nextRect.x &&
        currentRect.y === nextRect.y &&
        currentRect.width === nextRect.width &&
        currentRect.height === nextRect.height
      ) {
        return currentRect;
      }

      return nextRect;
    });
  }, []);
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
      if (languageDetectionTimerRef.current)
        clearTimeout(languageDetectionTimerRef.current);
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
    if (isAudioMuted || isMusicMuted) return undefined;
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
  }, [isAudioMuted, isMusicMuted]);

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

    window.addEventListener(BRIKAYA_OFFLINE_READY_EVENT, showOfflineReady);
    return () =>
      window.removeEventListener(
        BRIKAYA_OFFLINE_READY_EVENT,
        showOfflineReady,
      );
  }, [audioSink]);

  useEffect(() => {
    const handleUpdateProgress = (event: Event) => {
      const detail = (event as CustomEvent<BrikayaUpdateProgressDetail>)
        .detail;
      const progress = Math.min(
        UPDATE_PROGRESS_MAX,
        Math.max(UPDATE_PROGRESS_MIN, detail?.progress ?? UPDATE_PROGRESS_MIN),
      );

      setIsUpdateInstalledVisible(false);
      setUpdateProgress({ progress });
      if (!updateProgressSoundPlayedRef.current) {
        updateProgressSoundPlayedRef.current = true;
        audioSink.playAudio(GAME_AUDIO_IDS.UPDATE_PROGRESS);
      }
      if (
        !updateInstalledSoundPlayedRef.current &&
        (progress >= UPDATE_PROGRESS_COMPLETE ||
          detail?.stage === UPDATE_PROGRESS_COMPLETE_STAGE)
      ) {
        updateInstalledSoundPlayedRef.current = true;
        audioSink.playAudio(GAME_AUDIO_IDS.UPDATE_INSTALLED);
      }
    };

    window.addEventListener(
      BRIKAYA_UPDATE_PROGRESS_EVENT,
      handleUpdateProgress,
    );
    return () =>
      window.removeEventListener(
        BRIKAYA_UPDATE_PROGRESS_EVENT,
        handleUpdateProgress,
      );
  }, [audioSink]);

  useEffect(() => {
    let shouldShowInstalledVersion = false;

    try {
      shouldShowInstalledVersion =
        window.sessionStorage.getItem(BRIKAYA_UPDATE_INSTALLED_KEY) !==
          null ||
        window.sessionStorage.getItem(BRIKAYA_RELOAD_GUARD_KEY) !== null;

      if (shouldShowInstalledVersion) {
        window.sessionStorage.removeItem(BRIKAYA_UPDATE_INSTALLED_KEY);
        window.sessionStorage.removeItem(BRIKAYA_RELOAD_GUARD_KEY);
      }
    } catch {
      return;
    }

    if (!shouldShowInstalledVersion) return;

    setUpdateProgress(null);
    setIsUpdateInstalledVisible(true);
    audioSink.playAudio(GAME_AUDIO_IDS.UPDATE_INSTALLED);
    if (updateInstalledTimerRef.current)
      clearTimeout(updateInstalledTimerRef.current);
    updateInstalledTimerRef.current = setTimeout(() => {
      setIsUpdateInstalledVisible(false);
      updateProgressSoundPlayedRef.current = false;
      updateInstalledSoundPlayedRef.current = false;
    }, UPDATE_INSTALLED_VISIBLE_MS);
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
      setHighScores([]);
      setIsMenuOpen(false);
    } catch {
      audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT);
    }
  }, [audioSink]);

  const handleResetPreferences = useCallback(async () => {
    if (isResetPreferencesBusy) return;
    if (!window.confirm(t("menu.resetPreferencesConfirm"))) return;

    audioSink.playAudio(GAME_AUDIO_IDS.RESET_SCORE);
    setIsResetPreferencesErrorVisible(false);
    setIsResetPreferencesBusy(true);

    try {
      await resetLocalAppState();
      await refreshAppAfterLocalReset();
    } catch {
      setIsResetPreferencesErrorVisible(true);
      audioSink.playAudio(GAME_AUDIO_IDS.ERROR_SOFT);
    } finally {
      setIsResetPreferencesBusy(false);
    }
  }, [audioSink, isResetPreferencesBusy, t]);

  const handleOpenMenu = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    setIsMenuOpen(true);
  }, [audioSink]);

  const handleCloseMenu = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.PANEL_CLOSE);
    setIsMenuOpen(false);
  }, [audioSink]);

  const startInitialCountdown = useCallback(() => {
    setCinematicOverlay(INITIAL_COUNTDOWN_OVERLAY);
    setIsInitialCountdownActive(true);
    setIsMenuOpen(false);
  }, []);

  const runLanguageDetection = useCallback(
    async (allowLanguageLocation: boolean) => {
      languageDetectionStartedRef.current = true;
      languageDetectionRunIdRef.current += 1;
      const currentRunId = languageDetectionRunIdRef.current;
      if (languageDetectionTimerRef.current)
        clearTimeout(languageDetectionTimerRef.current);

      setIsLanguageDetectionVisible(true);

      const visibleDelay = new Promise<void>((resolve) => {
        languageDetectionTimerRef.current = setTimeout(() => {
          languageDetectionTimerRef.current = null;
          resolve();
        }, LANGUAGE_DETECTION_VISIBLE_MS);
      });
      const locationLocale = allowLanguageLocation
        ? await requestLocaleFromDeviceLocation()
        : null;

      await visibleDelay;

      if (currentRunId !== languageDetectionRunIdRef.current) return;
      if (locationLocale) setLocaleFromLocation(locationLocale);
      setIsLanguageDetectionVisible(false);
      startInitialCountdown();
    },
    [setLocaleFromLocation, startInitialCountdown],
  );

  useEffect(() => {
    if (!shouldStartWithLanguageDetection) return;
    if (languageDetectionStartedRef.current) return;

    void runLanguageDetection(true);
  }, [runLanguageDetection, shouldStartWithLanguageDetection]);

  const handleAcceptPrivacyConsent = useCallback(
    (allowLanguageLocation: boolean) => {
      audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
      acceptPrivacyConsent();
      if (allowLanguageLocation) {
        acceptLanguageLocationConsent();
      } else {
        revokeLanguageLocationConsent();
      }
      void runLanguageDetection(allowLanguageLocation);
    },
    [
      acceptLanguageLocationConsent,
      acceptPrivacyConsent,
      audioSink,
      revokeLanguageLocationConsent,
      runLanguageDetection,
    ],
  );

  const handleReviewPrivacyConsent = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    revokePrivacyConsent();
    revokeLanguageLocationConsent();
    languageDetectionRunIdRef.current += 1;
    if (languageDetectionTimerRef.current)
      clearTimeout(languageDetectionTimerRef.current);
    setCinematicOverlay(null);
    setIsInitialCountdownActive(false);
    setIsLanguageDetectionVisible(false);
    setIsMenuOpen(false);
  }, [audioSink, revokeLanguageLocationConsent, revokePrivacyConsent]);

  const handleUseLanguageLocation = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    acceptLanguageLocationConsent();
    setIsMenuOpen(false);
    void runLanguageDetection(true);
  }, [acceptLanguageLocationConsent, audioSink, runLanguageDetection]);

  const handleDisableLanguageLocation = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    revokeLanguageLocationConsent();
  }, [audioSink, revokeLanguageLocationConsent]);

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

  const handleVisualThemePresetChange = useCallback(
    (nextPreset: Parameters<typeof selectVisualThemePreset>[0]) => {
      audioSink.playAudio(GAME_AUDIO_IDS.THEME_TOGGLE);
      selectVisualThemePreset(nextPreset);
    },
    [audioSink, selectVisualThemePreset],
  );

  const handleAutomaticThemeChange = useCallback(() => {
    audioSink.playAudio(GAME_AUDIO_IDS.THEME_TOGGLE);
    selectAutomaticTheme();
  }, [audioSink, selectAutomaticTheme]);

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

  const handleLocaleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
      setLocale(event.target.value as AppLocale);
    },
    [audioSink, setLocale],
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
      if (!isMusicMuted) {
        audioSink.startGameplayMusic();
      }
    }
  }, [audioSink, isAudioMuted, isMusicMuted, toggleAudio]);

  const handleMusicToggle = useCallback(async () => {
    audioSink.playAudio(GAME_AUDIO_IDS.BUTTON_PRESS);
    const result = toggleMusic();
    if (!result.muted && !isAudioMuted) {
      const unlocked = await audioManager.unlock();
      if (unlocked) audioSink.startGameplayMusic();
    }
  }, [audioSink, isAudioMuted, toggleMusic]);

  const handleLevelTransition = useCallback(
    (payload: LevelTransitionPayload) => {
      advanceAutoTheme();
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
    [advanceAutoTheme, audioSink],
  );

  const handleLevelChange = useCallback((nextLevel: number) => {
    setLevel(nextLevel);
  }, []);

  const restartLabel =
    gameWon || gameOver ? t("controls.playAgain") : t("controls.restart");

  return (
    <main className="app-shell">
      <section className="game-dashboard" aria-label={t("app.dashboardAria")}>
        <header className="dashboard-header">
          <div className="dashboard-title-group">
            <p className="dashboard-eyebrow">{t("app.eyebrow")}</p>
            <h1>Brikaya</h1>
          </div>
          <div
            className="dashboard-primary-controls"
            aria-label={t("controls.primaryAria")}
          >
            <AudioToggle
              muted={isAudioMuted}
              onToggle={handleAudioToggle}
              iconOnly
              className="game-icon-control game-icon-control--audio"
            />
            <MusicToggle
              muted={isMusicMuted}
              onToggle={handleMusicToggle}
              iconOnly
              className="game-icon-control game-icon-control--music"
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
          <div className="score-hud" aria-label={t("hud.aria")}>
            <span className="score-hud__segment">
              {t("hud.level", { level })}
            </span>
            <span className="score-hud__separator" aria-hidden="true">
              |
            </span>
            <span className="score-hud__segment">
              {t("hud.score", { score })}
            </span>
            <span className="score-hud__separator" aria-hidden="true">
              |
            </span>
            <span className="score-hud__segment">
              {t("hud.total", { total: totalScore })}
            </span>
            <span className="score-hud__separator" aria-hidden="true">
              |
            </span>
            <span className="score-hud__segment">
              {t("hud.highScore", { score: highScore })}
            </span>
          </div>
          <div className="dashboard-header-controls">
            <button
              type="button"
              className="dashboard-menu-button"
              aria-expanded={isMenuOpen}
              aria-controls="game-settings-menu"
              onClick={handleOpenMenu}
            >
              {t("controls.menu")}
            </button>
          </div>
        </header>

        {isMenuOpen && (
          <>
            <button
              type="button"
              className="settings-drawer-backdrop"
              aria-label={t("controls.closeMenu")}
              onClick={handleCloseMenu}
            />
            <aside
              id="game-settings-menu"
              className="settings-drawer"
              aria-label={t("menu.gameAria")}
            >
              <div className="settings-drawer__header">
                <h2>{t("controls.menu")}</h2>
                <button
                  type="button"
                  className="settings-drawer__close"
                  aria-label={t("controls.closeMenu")}
                  onClick={handleCloseMenu}
                >
                  ×
                </button>
              </div>
              <p
                className="settings-drawer__version"
                aria-label={t("menu.versionAria", {
                  version: BUILD_VERSION_LABEL,
                })}
              >
                {t("menu.version", { version: BUILD_VERSION_LABEL })}
              </p>
              <div className="settings-drawer__section">
                <h3>{t("language.title")}</h3>
                <label
                  className="language-selector"
                  htmlFor={LANGUAGE_SELECT_ID}
                >
                  <span>{t("language.aria")}</span>
                  <select
                    id={LANGUAGE_SELECT_ID}
                    value={locale}
                    onChange={handleLocaleChange}
                    aria-label={t("language.aria")}
                  >
                    {SUPPORTED_LOCALES.map((supportedLocale) => (
                      <option key={supportedLocale} value={supportedLocale}>
                        {t(
                          `language.option.${supportedLocale}` as TranslationKey,
                        )}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="settings-drawer__section">
                <h3>{t("menu.appearance")}</h3>
                <AppearanceSelector
                  selection={selection}
                  onVisualThemePresetChange={handleVisualThemePresetChange}
                  onThemeChange={handleThemeChange}
                  onAutomaticThemeChange={handleAutomaticThemeChange}
                  onImageSetChange={handleImageSetChange}
                  onFontSetChange={handleFontSetChange}
                />
              </div>
              <div
                className="settings-drawer__section high-scores-panel"
                aria-label={t("highScores.panelAria")}
              >
                <h3>{t("menu.highScores")}</h3>
                <p className="high-scores-panel__best">
                  {t("highScores.best", { score: highScore })}
                </p>
                {highScores.length > 0 ? (
                  <ol className="high-scores-panel__list">
                    {highScores.map((scoreValue, index) => (
                      <li
                        key={`${scoreValue}${HIGH_SCORE_KEY_SEPARATOR}${index}`}
                      >
                        {t("highScores.rank", {
                          rank: index + 1,
                          score: scoreValue,
                        })}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="high-scores-panel__empty">
                    {t("highScores.empty")}
                  </p>
                )}
              </div>
              <div className="settings-drawer__section">
                <h3>{t("menu.privacy")}</h3>
                <p className="settings-drawer__hint">
                  {hasLanguageLocationConsent
                    ? t("language.regionEnabled")
                    : t("language.regionDisabled")}
                </p>
                <button
                  type="button"
                  onClick={
                    hasLanguageLocationConsent
                      ? handleDisableLanguageLocation
                      : handleUseLanguageLocation
                  }
                  className="dashboard-button dashboard-button--secondary"
                >
                  <span aria-hidden="true" className="button-icon">
                    ◎
                  </span>
                  {hasLanguageLocationConsent
                    ? t("language.disableRegion")
                    : t("language.reviewRegion")}
                </button>
                <a className="settings-drawer__link" href="/privacy/">
                  {t("menu.privacyPolicy")}
                </a>
                <a className="settings-drawer__link" href="/terms/">
                  {t("menu.terms")}
                </a>
                <button
                  type="button"
                  onClick={handleReviewPrivacyConsent}
                  className="dashboard-button dashboard-button--secondary"
                >
                  <span aria-hidden="true" className="button-icon">
                    ✓
                  </span>
                  {t("menu.reviewConsent")}
                </button>
              </div>
              <div className="settings-drawer__section">
                <h3>{t("menu.tools")}</h3>
                <button
                  type="button"
                  onClick={handleOpenLogs}
                  className="dashboard-button dashboard-button--secondary"
                  data-settings-action={SETTINGS_ACTION_LOGS}
                  data-testid={`settings-action-${SETTINGS_ACTION_LOGS}`}
                >
                  <span aria-hidden="true" className="button-icon">
                    ≡
                  </span>
                  {t("menu.logs")}
                </button>
                <button
                  type="button"
                  onClick={handleOpenCollisionStats}
                  className="dashboard-button dashboard-button--secondary"
                  data-settings-action={SETTINGS_ACTION_COLLISIONS}
                  data-testid={`settings-action-${SETTINGS_ACTION_COLLISIONS}`}
                >
                  <span aria-hidden="true" className="button-icon">
                    ◈
                  </span>
                  {t("menu.collisions")}
                </button>
                <button
                  type="button"
                  onClick={handleResetScores}
                  className="dashboard-button dashboard-button--secondary"
                  data-settings-action={SETTINGS_ACTION_RESET_SCORE}
                  data-testid={`settings-action-${SETTINGS_ACTION_RESET_SCORE}`}
                >
                  <span aria-hidden="true" className="button-icon">
                    0
                  </span>
                  {t("menu.resetScores")}
                </button>
                <button
                  type="button"
                  onClick={handleResetPreferences}
                  className="dashboard-button dashboard-button--secondary"
                  disabled={isResetPreferencesBusy}
                  data-settings-action={SETTINGS_ACTION_RESET_PREFERENCES}
                  data-testid={`settings-action-${SETTINGS_ACTION_RESET_PREFERENCES}`}
                >
                  <span aria-hidden="true" className="button-icon">
                    ↺
                  </span>
                  {t("menu.resetPreferences")}
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
                startBlocked={
                  !hasPrivacyConsent ||
                  isLanguageDetectionVisible ||
                  isInitialCountdownActive
                }
                imageSetId={selection.imageSetId}
                paused={
                  isMenuOpen || !hasPrivacyConsent || isLanguageDetectionVisible
                }
                onBoardRectChange={handleBoardRectChange}
              />
            </div>
          </div>
        </div>

        <div className="game-status-region" aria-live="polite">
          {updateProgress && (
            <div className="app-update-message">
              <p>{t("status.updateTitle")}</p>
              <div
                className="app-update-message__track"
                role="progressbar"
                aria-label={t("status.updateProgress")}
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
                {t("status.versionInstalled", {
                  version: BUILD_VERSION_LABEL,
                })}
              </p>
            </div>
          )}
          {isResetPreferencesErrorVisible && (
            <div className="app-update-message">
              <p>{t("menu.resetPreferencesError")}</p>
            </div>
          )}
          {isOfflineReadyVisible && (
            <div className="offline-ready-message">
              <p>{t("status.offlineReady")}</p>
            </div>
          )}
          {gameWon && (
            <div className="victory-message">
              <h2>{t("status.levelComplete")}</h2>
              <p>{t("status.finalScore", { score })}</p>
            </div>
          )}
          {gameOver && (
            <div className="game-over-message">
              <h2>{t("status.gameOver")}</h2>
              <p>{t("status.finalScore", { score })}</p>
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
        boardRect={boardRect}
      />
      {isLanguageDetectionVisible && <LanguageDetectionOverlay />}
      {!hasPrivacyConsent && (
        <ConsentScreen onAccept={handleAcceptPrivacyConsent} />
      )}
    </main>
  );
}
