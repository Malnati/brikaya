// src/hooks/useGameModePreference.ts
import { useCallback, useState } from "react";

import {
  GAME_MODE_STORAGE_KEY,
  resolveGameMode,
  type GameMode,
} from "../constants/gameMode";

function readStoredGameMode(): GameMode {
  try {
    return resolveGameMode(window.localStorage.getItem(GAME_MODE_STORAGE_KEY));
  } catch {
    return resolveGameMode(null);
  }
}

function writeStoredGameMode(gameMode: GameMode): void {
  try {
    window.localStorage.setItem(GAME_MODE_STORAGE_KEY, gameMode);
  } catch {
    return;
  }
}

export function useGameModePreference() {
  const [gameMode, setGameMode] = useState<GameMode>(readStoredGameMode);

  const selectGameMode = useCallback((nextGameMode: GameMode) => {
    setGameMode(nextGameMode);
    writeStoredGameMode(nextGameMode);
  }, []);

  return { gameMode, selectGameMode };
}
