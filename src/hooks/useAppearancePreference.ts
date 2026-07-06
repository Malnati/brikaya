// src/hooks/useAppearancePreference.ts
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  APPEARANCE_STORAGE_KEYS,
  DEFAULT_APPEARANCE_SELECTION,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
  type VisualThemePresetId,
} from "../constants/appearance";

function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function writeStoredFixedAppearance() {
  const selection = DEFAULT_APPEARANCE_SELECTION;
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
  writeStoredValue(APPEARANCE_STORAGE_KEYS.imageSet, selection.imageSetId);
  writeStoredValue(APPEARANCE_STORAGE_KEYS.fontSet, selection.fontSetId);
}

function applyAppearance(selection: AppearanceSelection) {
  document.documentElement.dataset.theme = selection.themeId;
  document.documentElement.dataset.imageSet = selection.imageSetId;
  document.documentElement.dataset.fontSet = selection.fontSetId;
}

export function useAppearancePreference() {
  const initialSelection = useMemo(() => DEFAULT_APPEARANCE_SELECTION, []);
  const [selection, setSelection] =
    useState<AppearanceSelection>(initialSelection);

  useEffect(() => {
    applyAppearance(selection);
    writeStoredFixedAppearance();
  }, [selection]);

  const resetFixedAppearance = useCallback(() => {
    setSelection(DEFAULT_APPEARANCE_SELECTION);
    writeStoredFixedAppearance();
  }, []);

  const selectTheme = useCallback(
    (_themeId: ThemeId) => resetFixedAppearance(),
    [resetFixedAppearance],
  );

  const selectVisualThemePreset = useCallback(
    (_visualThemePresetId: VisualThemePresetId) => resetFixedAppearance(),
    [resetFixedAppearance],
  );

  const selectAutomaticTheme = useCallback(
    () => resetFixedAppearance(),
    [resetFixedAppearance],
  );

  const advanceAutoTheme = useCallback(
    () => resetFixedAppearance(),
    [resetFixedAppearance],
  );

  const selectImageSet = useCallback(
    (_imageSetId: ImageSetId) => resetFixedAppearance(),
    [resetFixedAppearance],
  );

  const selectFontSet = useCallback(
    (_fontSetId: FontSetId) => resetFixedAppearance(),
    [resetFixedAppearance],
  );

  return {
    selection,
    selectTheme,
    selectVisualThemePreset,
    selectAutomaticTheme,
    advanceAutoTheme,
    selectImageSet,
    selectFontSet,
  };
}
