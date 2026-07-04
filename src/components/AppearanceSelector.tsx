// src/components/AppearanceSelector.tsx
import {
  THEME_AUTO_OPTION_ID,
  THEME_MODE_AUTO,
  FONT_SET_OPTIONS,
  IMAGE_SET_OPTIONS,
  THEME_OPTIONS,
  VISUAL_THEME_PRESET_OPTIONS,
  resolveVisualThemePresetForSelection,
  type AppearanceOption,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
  type VisualThemePresetId,
} from "../constants/appearance";
import { useI18n, type TranslationKey } from "../i18n";

const APPEARANCE_OPTION_TEST_ID_PREFIX = "appearance-option";

interface AppearanceSelectorProps {
  selection: AppearanceSelection;
  onVisualThemePresetChange: (visualThemePresetId: VisualThemePresetId) => void;
  onThemeChange: (themeId: ThemeId) => void;
  onAutomaticThemeChange: () => void;
  onImageSetChange: (imageSetId: ImageSetId) => void;
  onFontSetChange: (fontSetId: FontSetId) => void;
}

interface AppearanceOptionGroupProps<T extends string> {
  title: string;
  options: readonly AppearanceOption<T>[];
  compact?: boolean;
  selectedId: T;
  onChange: (id: T) => void;
  getOptionLabel: (option: AppearanceOption<T>) => string;
}

function AppearanceOptionGroup<T extends string>({
  title,
  options,
  selectedId,
  onChange,
  getOptionLabel,
  compact = false,
}: AppearanceOptionGroupProps<T>) {
  return (
    <div
      className={
        compact
          ? "appearance-selector__group appearance-selector__group--compact"
          : "appearance-selector__group"
      }
    >
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${selectedId === option.id ? "appearance-selector__button--active" : ""}`}
            data-appearance-option-id={option.id}
            data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${option.id}`}
            aria-pressed={selectedId === option.id}
            onClick={() => onChange(option.id)}
          >
            {getOptionLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ThemeOptionGroupProps {
  selection: AppearanceSelection;
  onVisualThemePresetChange: (visualThemePresetId: VisualThemePresetId) => void;
  onThemeChange: (themeId: ThemeId) => void;
  onAutomaticThemeChange: () => void;
  getOptionLabel: (option: AppearanceOption<string>) => string;
  getPresetLabel: (option: AppearanceOption<string>) => string;
  title: string;
}

function VisualThemePresetGroup({
  selection,
  onVisualThemePresetChange,
  onAutomaticThemeChange,
  getPresetLabel,
  title,
}: Pick<
  ThemeOptionGroupProps,
  | "selection"
  | "onVisualThemePresetChange"
  | "onAutomaticThemeChange"
  | "getPresetLabel"
  | "title"
>) {
  const isAutomaticTheme = selection.themeMode === THEME_MODE_AUTO;
  const automaticThemeOption = {
    id: THEME_AUTO_OPTION_ID,
    label: THEME_AUTO_OPTION_ID,
  };
  const selectedVisualThemePreset = resolveVisualThemePresetForSelection({
    themeId: selection.themeId,
    imageSetId: selection.imageSetId,
  });

  return (
    <div className="appearance-selector__group appearance-selector__group--compact">
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        <button
          type="button"
          className={`appearance-selector__button ${isAutomaticTheme ? "appearance-selector__button--active" : ""}`}
          data-appearance-option-id={THEME_AUTO_OPTION_ID}
          data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${THEME_AUTO_OPTION_ID}`}
          aria-pressed={isAutomaticTheme}
          onClick={onAutomaticThemeChange}
        >
          {getPresetLabel(automaticThemeOption)}
        </button>
        {VISUAL_THEME_PRESET_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${!isAutomaticTheme && selectedVisualThemePreset?.id === option.id ? "appearance-selector__button--active" : ""}`}
            data-appearance-option-id={option.id}
            data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${option.id}`}
            aria-pressed={
              !isAutomaticTheme && selectedVisualThemePreset?.id === option.id
            }
            onClick={() => onVisualThemePresetChange(option.id)}
          >
            {getPresetLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ThemeOptionGroup({
  selection,
  onThemeChange,
  getOptionLabel,
  title,
}: Pick<
  ThemeOptionGroupProps,
  "selection" | "onThemeChange" | "getOptionLabel" | "title"
>) {
  return (
    <div className="appearance-selector__group appearance-selector__group--compact">
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${selection.themeId === option.id ? "appearance-selector__button--active" : ""}`}
            data-appearance-option-id={option.id}
            data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${option.id}`}
            aria-pressed={selection.themeId === option.id}
            onClick={() => onThemeChange(option.id)}
          >
            {getOptionLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppearanceSelector({
  selection,
  onVisualThemePresetChange,
  onThemeChange,
  onAutomaticThemeChange,
  onImageSetChange,
  onFontSetChange,
}: AppearanceSelectorProps) {
  const { t } = useI18n();
  const getOptionLabel = <T extends string>(option: AppearanceOption<T>) =>
    t(`appearance.option.${option.id}` as TranslationKey);
  const getPresetLabel = (option: AppearanceOption<string>) =>
    t(`appearance.preset.${option.id}` as TranslationKey);

  return (
    <div className="appearance-selector" aria-label={t("appearance.aria")}>
      <VisualThemePresetGroup
        title={t("appearance.presets")}
        selection={selection}
        getPresetLabel={getPresetLabel}
        onVisualThemePresetChange={onVisualThemePresetChange}
        onAutomaticThemeChange={onAutomaticThemeChange}
      />
      <ThemeOptionGroup
        title={t("appearance.colors")}
        selection={selection}
        getOptionLabel={getOptionLabel}
        onThemeChange={onThemeChange}
      />
      <AppearanceOptionGroup
        title={t("appearance.images")}
        options={IMAGE_SET_OPTIONS}
        selectedId={selection.imageSetId}
        getOptionLabel={getOptionLabel}
        onChange={onImageSetChange}
      />
      <AppearanceOptionGroup
        title={t("appearance.font")}
        options={FONT_SET_OPTIONS}
        selectedId={selection.fontSetId}
        getOptionLabel={getOptionLabel}
        onChange={onFontSetChange}
      />
    </div>
  );
}
