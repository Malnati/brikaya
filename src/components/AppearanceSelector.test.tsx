// src/components/AppearanceSelector.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppearanceSelector } from './AppearanceSelector';

const INITIAL_SELECTION = {
  themeId: 'neon-arcade',
  themeMode: 'auto',
  autoThemeSequence: [
    'neon-arcade',
    'crt-high-contrast',
    'pixel-sunset',
    'ocean-night',
    'jungle-laser',
    'amber-retro',
    'cosmic-ice',
    'electric-plum',
    'lime-graphite',
    'ruby-depth',
  ],
  autoThemeIndex: 0,
  imageSetId: 'retro-default',
  fontSetId: 'arcade-ui',
} as const;
const AUTO_THEME_TEST_ID = 'appearance-option-auto-by-level';
const PIXEL_SUNSET_TEST_ID = 'appearance-option-pixel-sunset';
const PIXEL_SUNSET_OPTION_ID = 'pixel-sunset';
const MANUAL_SELECTION = {
  ...INITIAL_SELECTION,
  themeId: PIXEL_SUNSET_OPTION_ID,
  themeMode: 'manual',
} as const;

describe('AppearanceSelector', () => {
  it('mostra escolhas de aparência com texto de usuário', async () => {
    const onThemeChange = jest.fn();
    const onAutomaticThemeChange = jest.fn();
    const onImageSetChange = jest.fn();
    const onFontSetChange = jest.fn();

    render(
      <AppearanceSelector
        selection={INITIAL_SELECTION}
        onThemeChange={onThemeChange}
        onAutomaticThemeChange={onAutomaticThemeChange}
        onImageSetChange={onImageSetChange}
        onFontSetChange={onFontSetChange}
      />,
    );

    expect(screen.getByText('Tema visual')).toBeInTheDocument();
    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByText('Fonte')).toBeInTheDocument();
    expect(screen.getByTestId(AUTO_THEME_TEST_ID)).toHaveAttribute(
      'data-appearance-option-id',
      'auto-by-level',
    );
    expect(screen.getByTestId(PIXEL_SUNSET_TEST_ID)).toHaveAttribute(
      'data-appearance-option-id',
      PIXEL_SUNSET_OPTION_ID,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Automático por fase' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pôr do sol pixelado' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cabine pôr do sol' }));
    await userEvent.click(screen.getByRole('button', { name: 'Blocos pixelados' }));

    expect(onAutomaticThemeChange).toHaveBeenCalledTimes(1);
    expect(onThemeChange).toHaveBeenCalledWith('pixel-sunset');
    expect(onImageSetChange).toHaveBeenCalledWith('sunset-cabinet');
    expect(onFontSetChange).toHaveBeenCalledWith('block-pixel');
  });

  it('marca modo automático e tema manual sem dois ativos simultâneos', () => {
    const props = {
      selection: INITIAL_SELECTION,
      onThemeChange: jest.fn(),
      onAutomaticThemeChange: jest.fn(),
      onImageSetChange: jest.fn(),
      onFontSetChange: jest.fn(),
    };
    const { rerender } = render(<AppearanceSelector {...props} />);

    expect(screen.getByTestId(AUTO_THEME_TEST_ID)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId(PIXEL_SUNSET_TEST_ID)).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    rerender(
      <AppearanceSelector {...props} selection={MANUAL_SELECTION} />,
    );

    expect(screen.getByTestId(AUTO_THEME_TEST_ID)).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId(PIXEL_SUNSET_TEST_ID)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
