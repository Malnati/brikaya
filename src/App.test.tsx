// src/App.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

jest.mock('./components/Game', () => ({
  __esModule: true,
  default: function MockGame() {
    return <canvas aria-label="Tabuleiro do jogo" />;
  },
}));

jest.mock('./storage/score', () => ({
  saveScore: jest.fn().mockResolvedValue(undefined),
  getTotalScore: jest.fn().mockResolvedValue(0),
  getHighScore: jest.fn().mockResolvedValue(0),
  saveHighScore: jest.fn().mockResolvedValue(undefined),
  resetScores: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./utils/logger', () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

function mockSystemTheme(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

describe('App theme selector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.clear();
  });

  it('mantém configurações no menu lateral fechado por padrão', () => {
    mockSystemTheme(true);

    render(<App />);

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reiniciar' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Tema da interface')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /zerar pontuação/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/loja|ranking|upgrades|tutorial|multiplayer|settings/i)).not.toBeInTheDocument();
  });

  it('abre menu lateral com tema, logs, colisões e zerar pontuação', async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('complementary', { name: 'Menu do jogo' })).toBeInTheDocument();
    const themeGroup = screen.getByLabelText('Tema da interface');
    expect(within(themeGroup).getByRole('button', { name: 'Claro' })).toBeInTheDocument();
    expect(within(themeGroup).getByRole('button', { name: 'Escuro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /colisões/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zerar pontuação/i })).toBeInTheDocument();
  });

  it('alterna tema, aplica no documento e persiste escolha', async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    render(<App />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    await user.click(screen.getByRole('button', { name: 'Menu' }));

    await user.click(screen.getByRole('button', { name: 'Claro' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('brickbreaker-theme', 'light');

    await user.click(screen.getByRole('button', { name: 'Escuro' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('brickbreaker-theme', 'dark');
  });

  it('fecha menu lateral com Escape', async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('complementary', { name: 'Menu do jogo' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('complementary', { name: 'Menu do jogo' })).not.toBeInTheDocument();
  });
});
