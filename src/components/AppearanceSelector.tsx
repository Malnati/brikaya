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

interface AppearanceSelectorProps {
  selection: AppearanceSelection;
  onThemeChange: (themeId: ThemeId) => void;
  onImageSetChange: (imageSetId: ImageSetId) => void;
  onFontSetChange: (fontSetId: FontSetId) => void;
}

interface AppearanceOptionGroupProps<T extends string> {
  title: string;
  options: readonly AppearanceOption<T>[];
  selectedId: T;
  onChange: (id: T) => void;
}

function AppearanceOptionGroup<T extends string>({
  title,
  options,
  selectedId,
  onChange,
}: AppearanceOptionGroupProps<T>) {
  return (
    <div className="appearance-selector__group">
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
            {option.label}
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
  return (
    <div className="appearance-selector" aria-label="Aparência do jogo">
      <AppearanceOptionGroup
        title="Tema visual"
        options={THEME_OPTIONS}
        selectedId={selection.themeId}
        onChange={onThemeChange}
      />
      <AppearanceOptionGroup
        title="Imagens"
        options={IMAGE_SET_OPTIONS}
        selectedId={selection.imageSetId}
        onChange={onImageSetChange}
      />
      <AppearanceOptionGroup
        title="Fonte"
        options={FONT_SET_OPTIONS}
        selectedId={selection.fontSetId}
        onChange={onFontSetChange}
      />
    </div>
  );
}
