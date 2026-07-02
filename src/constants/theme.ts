// src/constants/theme.ts
export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";
export const THEME_STORAGE_KEY = "brickbreaker-theme";

export type ThemeMode = typeof THEME_LIGHT | typeof THEME_DARK;

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === THEME_LIGHT || value === THEME_DARK;
}

export function resolveInitialTheme(
  storedTheme: unknown,
  _prefersDark: boolean,
): ThemeMode {
  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return THEME_DARK;
}
