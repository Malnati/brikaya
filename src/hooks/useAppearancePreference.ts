// src/hooks/useAppearancePreference.ts
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  APPEARANCE_STORAGE_KEYS,
  THEME_MODE_AUTO,
  THEME_MODE_MANUAL,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
  createAutoThemeSequence,
  resolveNextAutoThemeState,
  resolveAppearanceSelection,
} from '../constants/appearance';

function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function writeStoredAutoThemeState(selection: AppearanceSelection) {
  writeStoredValue(APPEARANCE_STORAGE_KEYS.theme, selection.themeId);
  writeStoredValue(APPEARANCE_STORAGE_KEYS.themeMode, selection.themeMode);
  writeStoredValue(
    APPEARANCE_STORAGE_KEYS.autoThemeSequence,
    JSON.stringify(selection.autoThemeSequence),
  );
  writeStoredValue(
    APPEARANCE_STORAGE_KEYS.autoThemeIndex,
    String(selection.autoThemeIndex),
  );
}

function readInitialSelection(): AppearanceSelection {
  const storedAutoThemeSequence = readStoredValue(
    APPEARANCE_STORAGE_KEYS.autoThemeSequence,
  );
  const selection = resolveAppearanceSelection({
    themeId: readStoredValue(APPEARANCE_STORAGE_KEYS.theme),
    themeMode: readStoredValue(APPEARANCE_STORAGE_KEYS.themeMode),
    autoThemeSequence: storedAutoThemeSequence,
    autoThemeIndex: readStoredValue(APPEARANCE_STORAGE_KEYS.autoThemeIndex),
    imageSetId: readStoredValue(APPEARANCE_STORAGE_KEYS.imageSet),
    fontSetId: readStoredValue(APPEARANCE_STORAGE_KEYS.fontSet),
  });

  if (
    selection.themeMode === THEME_MODE_AUTO &&
    storedAutoThemeSequence === null
  ) {
    return {
      ...selection,
      autoThemeSequence: createAutoThemeSequence(selection.themeId),
      autoThemeIndex: 0,
    };
  }

  return selection;
}

function applyAppearance(selection: AppearanceSelection) {
  document.documentElement.dataset.theme = selection.themeId;
  document.documentElement.dataset.imageSet = selection.imageSetId;
  document.documentElement.dataset.fontSet = selection.fontSetId;
}

export function useAppearancePreference() {
  const initialSelection = useMemo(readInitialSelection, []);
  const [selection, setSelection] =
    useState<AppearanceSelection>(initialSelection);

  useEffect(() => {
    applyAppearance(selection);
  }, [selection]);

  const selectTheme = useCallback((themeId: ThemeId) => {
    setSelection((current) => {
      const nextSelection: AppearanceSelection = {
        ...current,
        themeId,
        themeMode: THEME_MODE_MANUAL,
      };
      writeStoredAutoThemeState(nextSelection);
      return nextSelection;
    });
  }, []);

  const selectAutomaticTheme = useCallback(() => {
    setSelection((current) => {
      const nextSelection: AppearanceSelection = {
        ...current,
        themeMode: THEME_MODE_AUTO,
        autoThemeSequence: createAutoThemeSequence(current.themeId),
        autoThemeIndex: 0,
      };
      writeStoredAutoThemeState(nextSelection);
      return nextSelection;
    });
  }, []);

  const advanceAutoTheme = useCallback(() => {
    setSelection((current) => {
      if (current.themeMode !== THEME_MODE_AUTO) return current;

      const autoThemeState = resolveNextAutoThemeState({
        currentThemeId: current.themeId,
        autoThemeSequence: current.autoThemeSequence,
        autoThemeIndex: current.autoThemeIndex,
      });
      const nextSelection = {
        ...current,
        ...autoThemeState,
      };
      writeStoredAutoThemeState(nextSelection);
      return nextSelection;
    });
  }, []);

  const selectImageSet = useCallback((imageSetId: ImageSetId) => {
    setSelection((current) => ({ ...current, imageSetId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.imageSet, imageSetId);
  }, []);

  const selectFontSet = useCallback((fontSetId: FontSetId) => {
    setSelection((current) => ({ ...current, fontSetId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.fontSet, fontSetId);
  }, []);

  return {
    selection,
    selectTheme,
    selectAutomaticTheme,
    advanceAutoTheme,
    selectImageSet,
    selectFontSet,
  };
}
