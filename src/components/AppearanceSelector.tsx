// src/components/AppearanceSelector.tsx
import {
  IMAGE_SET_OPTIONS,
  VISUAL_THEME_PRESET_OPTIONS,
  resolveVisualThemePresetForSelection,
  type AppearanceOption,
  type AppearanceSelection,
  type ImageSetId,
  type VisualThemePresetId,
} from "../constants/appearance";
import { useI18n, type TranslationKey } from "../i18n";

const APPEARANCE_OPTION_TEST_ID_PREFIX = "appearance-option";
const VISIBLE_VISUAL_THEME_PRESET_OPTIONS = [
  VISUAL_THEME_PRESET_OPTIONS[0],
] as const;
const VISIBLE_IMAGE_SET_OPTIONS: readonly AppearanceOption<ImageSetId>[] = [
  IMAGE_SET_OPTIONS[0],
];

interface AppearanceSelectorProps {
  selection: AppearanceSelection;
  onVisualThemePresetChange: (visualThemePresetId: VisualThemePresetId) => void;
  onImageSetChange: (imageSetId: ImageSetId) => void;
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

interface VisualThemePresetGroupProps {
  selection: AppearanceSelection;
  onVisualThemePresetChange: (visualThemePresetId: VisualThemePresetId) => void;
  getPresetLabel: (option: AppearanceOption<string>) => string;
  title: string;
}

function VisualThemePresetGroup({
  selection,
  onVisualThemePresetChange,
  getPresetLabel,
  title,
}: Pick<
  VisualThemePresetGroupProps,
  | "selection"
  | "onVisualThemePresetChange"
  | "getPresetLabel"
  | "title"
>) {
  const selectedVisualThemePreset = resolveVisualThemePresetForSelection({
    themeId: selection.themeId,
    imageSetId: selection.imageSetId,
  });

  return (
    <div className="appearance-selector__group appearance-selector__group--compact">
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        {VISIBLE_VISUAL_THEME_PRESET_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${selectedVisualThemePreset?.id === option.id ? "appearance-selector__button--active" : ""}`}
            data-appearance-option-id={option.id}
            data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${option.id}`}
            aria-pressed={selectedVisualThemePreset?.id === option.id}
            onClick={() => onVisualThemePresetChange(option.id)}
          >
            {getPresetLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppearanceSelector({
  selection,
  onVisualThemePresetChange,
  onImageSetChange,
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
      />
      <AppearanceOptionGroup
        title={t("appearance.images")}
        options={VISIBLE_IMAGE_SET_OPTIONS}
        selectedId={selection.imageSetId}
        getOptionLabel={getOptionLabel}
        onChange={onImageSetChange}
      />
    </div>
  );
}
