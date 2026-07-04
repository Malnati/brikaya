// src/components/AppearanceSelector.tsx
import {
  THEME_AUTO_OPTION_ID,
  THEME_MODE_AUTO,
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

const APPEARANCE_OPTION_TEST_ID_PREFIX = 'appearance-option';

interface AppearanceSelectorProps {
  selection: AppearanceSelection;
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
  onThemeChange: (themeId: ThemeId) => void;
  onAutomaticThemeChange: () => void;
  getOptionLabel: (option: AppearanceOption<string>) => string;
  title: string;
}

function ThemeOptionGroup({
  selection,
  onThemeChange,
  onAutomaticThemeChange,
  getOptionLabel,
  title,
}: ThemeOptionGroupProps) {
  const isAutomaticTheme = selection.themeMode === THEME_MODE_AUTO;
  const automaticThemeOption = {
    id: THEME_AUTO_OPTION_ID,
    label: THEME_AUTO_OPTION_ID,
  };

  return (
    <div className="appearance-selector__group appearance-selector__group--compact">
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        <button
          type="button"
          className={`appearance-selector__button ${isAutomaticTheme ? 'appearance-selector__button--active' : ''}`}
          data-appearance-option-id={THEME_AUTO_OPTION_ID}
          data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${THEME_AUTO_OPTION_ID}`}
          aria-pressed={isAutomaticTheme}
          onClick={onAutomaticThemeChange}
        >
          {getOptionLabel(automaticThemeOption)}
        </button>
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${!isAutomaticTheme && selection.themeId === option.id ? 'appearance-selector__button--active' : ''}`}
            data-appearance-option-id={option.id}
            data-testid={`${APPEARANCE_OPTION_TEST_ID_PREFIX}-${option.id}`}
            aria-pressed={!isAutomaticTheme && selection.themeId === option.id}
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
  onThemeChange,
  onAutomaticThemeChange,
  onImageSetChange,
  onFontSetChange,
}: AppearanceSelectorProps) {
  const { t } = useI18n();
  const getOptionLabel = <T extends string>(option: AppearanceOption<T>) =>
    t(`appearance.option.${option.id}` as TranslationKey);

  return (
    <div className="appearance-selector" aria-label={t("appearance.aria")}>
      <ThemeOptionGroup
        title={t("appearance.theme")}
        selection={selection}
        getOptionLabel={getOptionLabel}
        onThemeChange={onThemeChange}
        onAutomaticThemeChange={onAutomaticThemeChange}
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
