// src/App.test.tsx
import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import type { LevelTransitionPayload } from "./constants/game";

interface MockGameProps {
  boardControls?: React.ReactNode;
  startBlocked?: boolean;
  onLevelTransition?: (payload: LevelTransitionPayload) => void;
  onGameOver?: () => Promise<void> | void;
}

const TEST_LEVEL_TRANSITION_PAYLOAD: LevelTransitionPayload = {
  currentLevel: 1,
  nextLevel: 2,
  nextSpeedMultiplier: 1.12,
  pauseMs: 1800,
  nextMaxSpeed: 6.72,
  nextMinSpeed: 1.68,
  nextReductionPerBrick: 0.336,
  nextInitialBrickCount: 15,
};
const COUNTDOWN_STEP_MS = 600;
const COUNTDOWN_TOTAL_MS = 1800;
const LEVEL_UP_OVERLAY_VISIBLE_MS = 1200;
const RIP_VISIBLE_MS = 1800;

let mockLastGameProps: MockGameProps | null = null;

jest.mock("./components/Game", () => ({
  __esModule: true,
  default: function MockGame(props: MockGameProps) {
    mockLastGameProps = props;
    return (
      <div data-testid="mock-game" data-start-blocked={props.startBlocked}>
        <canvas aria-label="Tabuleiro do jogo" />
        {props.boardControls}
      </div>
    );
  },
}));

jest.mock("./storage/score", () => ({
  saveScore: jest.fn().mockResolvedValue(undefined),
  getTotalScore: jest.fn().mockResolvedValue(0),
  getHighScore: jest.fn().mockResolvedValue(0),
  saveHighScore: jest.fn().mockResolvedValue(undefined),
  resetScores: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("./utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

function mockSystemTheme(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === "(prefers-color-scheme: dark)",
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

async function renderApp() {
  const result = render(<App />);
  await act(async () => {});
  return result;
}

describe("App theme selector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLastGameProps = null;
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("mantém configurações no menu lateral fechado por padrão", async () => {
    mockSystemTheme(true);

    await renderApp();

    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Som" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reiniciar" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Tema da interface"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /zerar pontuação/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /loja|ranking|upgrades|tutorial|multiplayer|settings/i,
      ),
    ).not.toBeInTheDocument();
  });

  it("exibe a versão de build discreta no shell", async () => {
    mockSystemTheme(true);

    await renderApp();

    const version = screen.getByText(/^v\d+$/);
    expect(version).toHaveClass("build-version-badge");
    expect(version).toHaveAccessibleName("Versão do build v0");
  });

  it("abre menu lateral com tema, logs, colisões e zerar pontuação", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    expect(drawer).toBeInTheDocument();
    expect(
      within(drawer).queryByRole("button", { name: "Reiniciar" }),
    ).not.toBeInTheDocument();
    expect(within(drawer).queryByText("Partida")).not.toBeInTheDocument();
    const themeGroup = screen.getByLabelText("Tema da interface");
    expect(
      within(themeGroup).getByRole("button", { name: "Claro" }),
    ).toBeInTheDocument();
    expect(
      within(themeGroup).getByRole("button", { name: "Escuro" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logs/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /colisões/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zerar pontuação/i }),
    ).toBeInTheDocument();
  });

  it("alterna tema, aplica no documento e persiste escolha", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.click(screen.getByRole("button", { name: "Menu" }));

    await user.click(screen.getByRole("button", { name: "Claro" }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brickbreaker-theme",
      "light",
    );

    await user.click(screen.getByRole("button", { name: "Escuro" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brickbreaker-theme",
      "dark",
    );
  });

  it("mostra controles principais como ícones discretos", async () => {
    mockSystemTheme(true);

    await renderApp();

    const audioButton = screen.getByRole("button", { name: "Som" });
    const restartButton = screen.getByRole("button", { name: "Reiniciar" });

    expect(audioButton).toHaveTextContent("♪");
    expect(audioButton).not.toHaveTextContent("Som");
    expect(restartButton).toHaveTextContent("↻");
    expect(restartButton).not.toHaveTextContent("Reiniciar");
  });

  it("alterna som preservando estado acessível no ícone", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    const audioButton = screen.getByRole("button", { name: "Som" });
    expect(audioButton).toHaveAttribute("aria-pressed", "true");

    await user.click(audioButton);

    const mutedButton = screen.getByRole("button", { name: "Sem som" });
    expect(mutedButton).toHaveAttribute("aria-pressed", "false");
    expect(mutedButton).toHaveTextContent("×");
  });

  it("fecha menu lateral com Escape", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(
      screen.getByRole("complementary", { name: "Menu do jogo" }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("complementary", { name: "Menu do jogo" }),
    ).not.toBeInTheDocument();
  });

  it("bloqueia a primeira partida até a contagem inicial terminar", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();

    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-start-blocked",
      "true",
    );
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_STEP_MS);
    });
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("2");

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_STEP_MS);
    });
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("1");

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_STEP_MS);
    });
    expect(
      screen.queryByTestId("game-cinematic-overlay"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-start-blocked",
      "false",
    );
  });

  it("mostra mensagem de subida de fase sem reiniciar countdown", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_TOTAL_MS);
    });
    act(() => {
      mockLastGameProps?.onLevelTransition?.(TEST_LEVEL_TRANSITION_PAYLOAD);
    });

    expect(screen.getByTestId("level-toast")).toHaveTextContent(
      "Subindo de nível",
    );
    expect(screen.getByTestId("level-toast")).toHaveTextContent("Fase 2");
    expect(screen.queryByText("3")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(LEVEL_UP_OVERLAY_VISIBLE_MS);
    });
    expect(screen.queryByTestId("level-toast")).not.toBeInTheDocument();
  });

  it("mostra RIP por tempo curto e reinicia sem nova contagem", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_TOTAL_MS);
    });
    await act(async () => {
      await mockLastGameProps?.onGameOver?.();
    });

    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent(
      "RIP",
    );

    act(() => {
      jest.advanceTimersByTime(RIP_VISIBLE_MS);
    });

    expect(
      screen.queryByTestId("game-cinematic-overlay"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Fase 1")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});
