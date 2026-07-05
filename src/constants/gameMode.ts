// src/constants/gameMode.ts
export const GAME_MODE_CLASSIC = "classic";
export const GAME_MODE_BALL_TURRET = "ball-turret";
export const GAME_MODE_STORAGE_KEY = "brikaya-game-mode";

export const GAME_MODES = [GAME_MODE_CLASSIC, GAME_MODE_BALL_TURRET] as const;

export type GameMode = (typeof GAME_MODES)[number];

export function isGameMode(value: unknown): value is GameMode {
  return typeof value === "string" && GAME_MODES.includes(value as GameMode);
}

export function resolveGameMode(value: unknown): GameMode {
  return isGameMode(value) ? value : GAME_MODE_CLASSIC;
}
