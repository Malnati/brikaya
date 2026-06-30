// src/components/ThemeToggle.tsx
import { THEME_DARK, THEME_LIGHT, ThemeMode } from '../constants/theme';

interface ThemeToggleProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: THEME_LIGHT, label: 'Claro' },
  { value: THEME_DARK, label: 'Escuro' },
];

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="theme-toggle" aria-label="Tema da interface">
      {THEME_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          className={`theme-toggle__button ${theme === option.value ? 'theme-toggle__button--active' : ''}`}
          aria-pressed={theme === option.value}
          onClick={() => onThemeChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
