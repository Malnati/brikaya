// src/components/AppearanceSelector.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppearanceSelector } from './AppearanceSelector';

const INITIAL_SELECTION = {
  themeId: 'neon-arcade',
  imageSetId: 'retro-default',
  fontSetId: 'arcade-ui',
} as const;

describe('AppearanceSelector', () => {
  it('mostra escolhas de aparência com texto de usuário', async () => {
    const onThemeChange = jest.fn();
    const onImageSetChange = jest.fn();
    const onFontSetChange = jest.fn();

    render(
      <AppearanceSelector
        selection={INITIAL_SELECTION}
        onThemeChange={onThemeChange}
        onImageSetChange={onImageSetChange}
        onFontSetChange={onFontSetChange}
      />,
    );

    expect(screen.getByText('Tema visual')).toBeInTheDocument();
    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByText('Fonte')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pôr do sol pixelado' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cabine pôr do sol' }));
    await userEvent.click(screen.getByRole('button', { name: 'Blocos pixelados' }));

    expect(onThemeChange).toHaveBeenCalledWith('pixel-sunset');
    expect(onImageSetChange).toHaveBeenCalledWith('sunset-cabinet');
    expect(onFontSetChange).toHaveBeenCalledWith('block-pixel');
  });
});
