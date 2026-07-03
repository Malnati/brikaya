// src/hooks/useAppearancePreference.test.tsx
import { act, renderHook } from '@testing-library/react';

import { useAppearancePreference } from './useAppearancePreference';

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-image-set');
  document.documentElement.removeAttribute('data-font-set');
});

describe('useAppearancePreference', () => {
  it('aplica padrão neon/retro/arcade', () => {
    const { result } = renderHook(() => useAppearancePreference());
    expect(result.current.selection).toEqual({
      themeId: 'neon-arcade',
      imageSetId: 'retro-default',
      fontSetId: 'arcade-ui',
    });
    expect(document.documentElement.dataset.theme).toBe('neon-arcade');
    expect(document.documentElement.dataset.imageSet).toBe('retro-default');
    expect(document.documentElement.dataset.fontSet).toBe('arcade-ui');
  });

  it('persiste escolhas válidas', () => {
    const { result } = renderHook(() => useAppearancePreference());
    act(() => result.current.selectTheme('pixel-sunset'));
    act(() => result.current.selectImageSet('sunset-cabinet'));
    act(() => result.current.selectFontSet('block-pixel'));

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'brickbreaker-theme',
      'pixel-sunset',
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'brickbreaker-image-set',
      'sunset-cabinet',
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'brickbreaker-font-set',
      'block-pixel',
    );
    expect(document.documentElement.dataset.theme).toBe('pixel-sunset');
    expect(document.documentElement.dataset.imageSet).toBe('sunset-cabinet');
    expect(document.documentElement.dataset.fontSet).toBe('block-pixel');
  });

  it('migra valor antigo escuro', () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) =>
      key === 'brickbreaker-theme' ? 'dark' : null,
    );
    const { result } = renderHook(() => useAppearancePreference());
    expect(result.current.selection.themeId).toBe('neon-arcade');
  });
});
