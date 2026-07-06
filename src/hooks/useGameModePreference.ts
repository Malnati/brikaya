// src/hooks/useGameModePreference.ts
import { useCallback, useState } from "react";

import {
  GAME_MODE_BALL_TURRET,
  GAME_MODE_STORAGE_KEY,
  type GameMode,
} from "../constants/gameMode";

function writeForcedGameMode(): void {
  try {
    window.localStorage.setItem(GAME_MODE_STORAGE_KEY, GAME_MODE_BALL_TURRET);
  } catch {
    return;
  }
}

export function useGameModePreference() {
  const [gameMode, setGameMode] = useState<GameMode>(GAME_MODE_BALL_TURRET);

  const selectGameMode = useCallback(() => {
    setGameMode(GAME_MODE_BALL_TURRET);
    writeForcedGameMode();
  }, []);

  return { gameMode, selectGameMode };
}
