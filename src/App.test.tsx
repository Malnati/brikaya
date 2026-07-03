// src/App.test.tsx
import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { audioManager } from "./utils/audioManager";
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
    expect(screen.getByRole("button", { name: "Sem som" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reiniciar" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Aparência do jogo"),
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

  it("mantém versão visível apenas dentro do menu", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    expect(screen.queryByText(/^Versão v\d+$/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    const version = within(drawer).getByText(/^Versão v\d+$/);
    expect(version).toHaveClass("settings-drawer__version");
    expect(version).toHaveAccessibleName("Versão do jogo v0");
    expect(screen.queryByText(/^v\d+$/)).not.toBeInTheDocument();
  });

  it("abre menu lateral com aparência, logs, colisões e zerar pontuação", async () => {
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
    const appearanceGroup = screen.getByLabelText("Aparência do jogo");
    expect(within(appearanceGroup).getByText("Tema visual")).toBeInTheDocument();
    expect(within(appearanceGroup).getByText("Imagens")).toBeInTheDocument();
    expect(within(appearanceGroup).getByText("Fonte")).toBeInTheDocument();
    expect(
      within(appearanceGroup).getByRole("button", { name: "Neon Arcade" }),
    ).toBeInTheDocument();
    expect(
      within(appearanceGroup).getByRole("button", { name: "Retro padrão" }),
    ).toBeInTheDocument();
    expect(
      within(appearanceGroup).getByRole("button", { name: "Arcade" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logs/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /colisões/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zerar pontuação/i }),
    ).toBeInTheDocument();
  });

  it("alterna aparência, aplica no documento e persiste escolha", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
    await user.click(screen.getByRole("button", { name: "Menu" }));

    await user.click(screen.getByRole("button", { name: "CRT alto contraste" }));
    await user.click(screen.getByRole("button", { name: "Alto contraste" }));
    await user.click(screen.getByRole("button", { name: "CRT mono" }));

    expect(document.documentElement.dataset.theme).toBe("crt-high-contrast");
    expect(document.documentElement.dataset.imageSet).toBe("high-contrast");
    expect(document.documentElement.dataset.fontSet).toBe("crt-mono");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brickbreaker-theme",
      "crt-high-contrast",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brickbreaker-image-set",
      "high-contrast",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brickbreaker-font-set",
      "crt-mono",
    );

    await user.click(screen.getByRole("button", { name: "Pixel Sunset" }));

    expect(document.documentElement.dataset.theme).toBe("pixel-sunset");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brickbreaker-theme",
      "pixel-sunset",
    );
  });

  it("mostra controles principais como ícones discretos", async () => {
    mockSystemTheme(true);

    await renderApp();

    const audioButton = screen.getByRole("button", { name: "Sem som" });
    const restartButton = screen.getByRole("button", { name: "Reiniciar" });

    expect(audioButton).toHaveTextContent("×");
    expect(audioButton).not.toHaveTextContent("Sem som");
    expect(restartButton).toHaveTextContent("↻");
    expect(restartButton).not.toHaveTextContent("Reiniciar");
  });

  it("centraliza um único badge de pontuação no topo com controles principais", async () => {
    mockSystemTheme(true);

    const { container } = await renderApp();

    const scoreHud = screen.getByLabelText("Painel de pontuação");
    const topControls = screen.getByLabelText("Controles principais");

    expect(scoreHud).toHaveClass("score-hud");
    expect(scoreHud).toHaveTextContent("Fase 1");
    expect(scoreHud).toHaveTextContent("Score 0");
    expect(scoreHud).toHaveTextContent("Total 0");
    expect(scoreHud).toHaveTextContent("Recorde 0");
    expect(container.querySelectorAll(".score-chip")).toHaveLength(0);
    expect(container.querySelectorAll(".score-hud")).toHaveLength(1);
    expect(topControls).toHaveClass("dashboard-primary-controls");
    expect(within(topControls).getByRole("button", { name: "Sem som" })).toBe(
      screen.getByRole("button", { name: "Sem som" }),
    );
    expect(
      within(topControls).getByRole("button", { name: "Reiniciar" }),
    ).toBe(screen.getByRole("button", { name: "Reiniciar" }));
    expect(mockLastGameProps?.boardControls).toBeUndefined();
  });

  it("alterna som preservando estado acessível no ícone", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    jest.spyOn(audioManager, "unlock").mockResolvedValue(true);
    const playMusic = jest
      .spyOn(audioManager, "playMusic")
      .mockResolvedValue(undefined);

    await renderApp();

    const mutedButton = screen.getByRole("button", { name: "Sem som" });
    expect(mutedButton).toHaveAttribute("aria-pressed", "false");
    expect(mutedButton).toHaveTextContent("×");

    await user.click(mutedButton);

    const audioButton = await screen.findByRole("button", { name: "Som" });
    expect(audioButton).toHaveAttribute("aria-pressed", "true");
    expect(audioButton).toHaveTextContent("♪");
    expect(playMusic).toHaveBeenCalled();
  });

  it("mantém ícone mudo quando o desbloqueio de áudio falha", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    jest.spyOn(audioManager, "unlock").mockResolvedValue(false);
    const playMusic = jest
      .spyOn(audioManager, "playMusic")
      .mockResolvedValue(undefined);

    await renderApp();

    const mutedButton = screen.getByRole("button", { name: "Sem som" });
    await user.click(mutedButton);

    expect(screen.getByRole("button", { name: "Sem som" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByRole("button", { name: "Som" })).not.toBeInTheDocument();
    expect(playMusic).not.toHaveBeenCalled();
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
