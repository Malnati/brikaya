// src/hooks/useAppearancePreference.ts
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  APPEARANCE_STORAGE_KEYS,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
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

function readInitialSelection(): AppearanceSelection {
  return resolveAppearanceSelection({
    themeId: readStoredValue(APPEARANCE_STORAGE_KEYS.theme),
    imageSetId: readStoredValue(APPEARANCE_STORAGE_KEYS.imageSet),
    fontSetId: readStoredValue(APPEARANCE_STORAGE_KEYS.fontSet),
  });
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
    setSelection((current) => ({ ...current, themeId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.theme, themeId);
  }, []);

  const selectImageSet = useCallback((imageSetId: ImageSetId) => {
    setSelection((current) => ({ ...current, imageSetId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.imageSet, imageSetId);
  }, []);

  const selectFontSet = useCallback((fontSetId: FontSetId) => {
    setSelection((current) => ({ ...current, fontSetId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.fontSet, fontSetId);
  }, []);

  return { selection, selectTheme, selectImageSet, selectFontSet };
}
