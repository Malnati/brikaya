// src/hooks/useThemePreference.ts
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  THEME_STORAGE_KEY,
  ThemeMode,
  isThemeMode,
  resolveInitialTheme,
} from "../constants/theme";

function getStoredTheme(): ThemeMode | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
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
    () => resolveInitialTheme(getStoredTheme(), false),
    [],
  );
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  const selectTheme = useCallback((nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    persistTheme(nextTheme);
  }, []);

  return { theme, selectTheme };
}
