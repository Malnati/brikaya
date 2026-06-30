// src/hooks/useThemePreference.ts
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  THEME_DARK,
  THEME_LIGHT,
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
  ThemeMode,
  isThemeMode,
  resolveInitialTheme,
} from '../constants/theme';

function getStoredTheme(): ThemeMode | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function getSystemPrefersDark(): boolean {
  return window.matchMedia?.(THEME_MEDIA_QUERY).matches ?? true;
}

function applyDocumentTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

function persistTheme(theme: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

export function useThemePreference() {
  const initialTheme = useMemo(
    () => resolveInitialTheme(getStoredTheme(), getSystemPrefersDark()),
    [],
  );
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    if (storedTheme) return;

    const mediaQuery = window.matchMedia?.(THEME_MEDIA_QUERY);
    if (!mediaQuery) return;

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? THEME_DARK : THEME_LIGHT);
    };

    mediaQuery.addEventListener?.('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener?.('change', handleSystemThemeChange);
  }, []);

  const selectTheme = useCallback((nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    persistTheme(nextTheme);
  }, []);

  return { theme, selectTheme };
}
