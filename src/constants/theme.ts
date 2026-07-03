// src/constants/theme.ts
import {
  APPEARANCE_STORAGE_KEYS,
  LEGACY_THEME_DARK,
  LEGACY_THEME_LIGHT,
  THEME_CRT_HIGH_CONTRAST,
  THEME_NEON_ARCADE,
  isThemeId,
  migrateStoredThemeId,
  type ThemeId,
} from './appearance';

export const THEME_LIGHT = THEME_CRT_HIGH_CONTRAST;
export const THEME_DARK = THEME_NEON_ARCADE;
export const THEME_STORAGE_KEY = APPEARANCE_STORAGE_KEYS.theme;

export type ThemeMode = ThemeId;

export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    isThemeId(value) ||
    value === LEGACY_THEME_LIGHT ||
    value === LEGACY_THEME_DARK
  );
}

export function resolveInitialTheme(
  storedTheme: unknown,
  _prefersDark: boolean,
): ThemeMode {
  return migrateStoredThemeId(storedTheme) ?? THEME_NEON_ARCADE;
}
