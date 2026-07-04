// src/components/AppearanceSelector.tsx
import {
  FONT_SET_OPTIONS,
  IMAGE_SET_OPTIONS,
  THEME_OPTIONS,
  type AppearanceOption,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
} from '../constants/appearance';
import { useI18n, type TranslationKey } from '../i18n';

interface AppearanceSelectorProps {
  selection: AppearanceSelection;
  onThemeChange: (themeId: ThemeId) => void;
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
          ? 'appearance-selector__group appearance-selector__group--compact'
          : 'appearance-selector__group'
      }
    >
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${selectedId === option.id ? 'appearance-selector__button--active' : ''}`}
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

export function AppearanceSelector({
  selection,
  onThemeChange,
  onImageSetChange,
  onFontSetChange,
}: AppearanceSelectorProps) {
  const { t } = useI18n();
  const getOptionLabel = <T extends string>(option: AppearanceOption<T>) =>
    t(`appearance.option.${option.id}` as TranslationKey);

  return (
    <div className="appearance-selector" aria-label={t("appearance.aria")}>
      <AppearanceOptionGroup
        title={t("appearance.theme")}
        options={THEME_OPTIONS}
        selectedId={selection.themeId}
        compact
        getOptionLabel={getOptionLabel}
        onChange={onThemeChange}
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
