// src/App.test.tsx
import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { audioManager } from "./utils/audioManager";
import { GAME_AUDIO_IDS } from "./constants/audio";
import type { LevelTransitionPayload } from "./constants/game";
import {
  BRICKBREAKER_UPDATE_INSTALLED_KEY,
  BRICKBREAKER_UPDATE_PROGRESS_EVENT,
} from "./registerServiceWorker";
import {
  PRIVACY_CONSENT_SCOPE,
  PRIVACY_CONSENT_STORAGE_KEY,
  PRIVACY_CONSENT_VERSION,
} from "./constants/privacyConsent";

interface MockGameProps {
  boardControls?: React.ReactNode;
  startBlocked?: boolean;
  paused?: boolean;
  onBoardRectChange?: (rect: TestBoardRect) => void;
  onLevelTransition?: (payload: LevelTransitionPayload) => void;
  onGameOver?: () => Promise<void> | void;
  imageSetId?: string;
}

interface TestBoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
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
const SETTINGS_ACTION_LOGS_TEST_ID = "settings-action-logs";
const SETTINGS_ACTION_COLLISIONS_TEST_ID = "settings-action-collisions";
const SETTINGS_ACTION_RESET_SCORE_TEST_ID = "settings-action-reset-score";
const COUNTDOWN_STEP_MS = 600;
const COUNTDOWN_TOTAL_MS = 1800;
const LEVEL_UP_OVERLAY_VISIBLE_MS = 1200;
const RIP_VISIBLE_MS = 1800;
const UPDATE_TEST_PROGRESS = 64;
const DATA_PAUSED_ATTRIBUTE = "data-paused";
const PAUSED_TRUE_ATTRIBUTE_VALUE = "true";
const PAUSED_FALSE_ATTRIBUTE_VALUE = "false";
const TEST_BOARD_RECT = {
  x: 13,
  y: 111,
  width: 367,
  height: 245,
};
const STAGE_TEST_ID = "game-cinematic-stage";
const VALID_PRIVACY_CONSENT_RECORD = JSON.stringify({
  version: PRIVACY_CONSENT_VERSION,
  acceptedAt: "2026-07-03T00:00:00.000Z",
  scope: PRIVACY_CONSENT_SCOPE,
});

let mockLastGameProps: MockGameProps | null = null;

jest.mock("./components/Game", () => ({
  __esModule: true,
  default: function MockGame(props: MockGameProps) {
    mockLastGameProps = props;
    return (
      <div
        data-testid="mock-game"
        data-start-blocked={props.startBlocked}
        data-paused={
          props.paused ? PAUSED_TRUE_ATTRIBUTE_VALUE : PAUSED_FALSE_ATTRIBUTE_VALUE
        }
      >
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
  getHighScores: jest.fn().mockResolvedValue([]),
  saveHighScore: jest.fn().mockResolvedValue(undefined),
  resetScores: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("./utils/logger", () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
  WARN: jest.fn(),
}));

function mockPrivacyConsent(value: string | null) {
  (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) =>
    key === PRIVACY_CONSENT_STORAGE_KEY ? value : null,
  );
}

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
    const scoreStorage = jest.requireMock("./storage/score") as {
      getTotalScore: jest.Mock;
      getHighScore: jest.Mock;
      getHighScores: jest.Mock;
      saveScore: jest.Mock;
      saveHighScore: jest.Mock;
      resetScores: jest.Mock;
    };
    scoreStorage.saveScore.mockResolvedValue(undefined);
    scoreStorage.getTotalScore.mockResolvedValue(0);
    scoreStorage.getHighScore.mockResolvedValue(0);
    scoreStorage.getHighScores.mockResolvedValue([]);
    scoreStorage.saveHighScore.mockResolvedValue(undefined);
    scoreStorage.resetScores.mockResolvedValue(undefined);
    mockLastGameProps = null;
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockPrivacyConsent(VALID_PRIVACY_CONSENT_RECORD);
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
    expect(screen.queryByLabelText("Publicidade")).not.toBeInTheDocument();
    expect(screen.queryByText("Publicidade")).not.toBeInTheDocument();
  });

  it("exige consentimento antes da primeira contagem", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);
    mockPrivacyConsent(null);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderApp();

    expect(
      screen.getByRole("dialog", { name: "Antes de jogar" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("game-cinematic-overlay")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-start-blocked",
      "true",
    );
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_TRUE_ATTRIBUTE_VALUE,
    );

    await user.click(screen.getByRole("button", { name: "Aceitar e jogar" }));

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      PRIVACY_CONSENT_STORAGE_KEY,
      expect.stringContaining(PRIVACY_CONSENT_SCOPE),
    );
    expect(screen.queryByRole("dialog", { name: "Antes de jogar" })).not.toBeInTheDocument();
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_FALSE_ATTRIBUTE_VALUE,
    );
  });

  it("não reapresenta consentimento quando existe aceite salvo", async () => {
    mockSystemTheme(true);

    await renderApp();

    expect(screen.queryByRole("dialog", { name: "Antes de jogar" })).not.toBeInTheDocument();
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
  });

  it("revoga consentimento pelo menu e pausa o jogo", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    expect(within(drawer).getByRole("heading", { name: "Privacidade" })).toBeInTheDocument();

    await user.click(
      within(drawer).getByRole("button", { name: "Revisar consentimento" }),
    );

    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      PRIVACY_CONSENT_STORAGE_KEY,
    );
    expect(screen.queryByRole("complementary", { name: "Menu do jogo" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Antes de jogar" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_TRUE_ATTRIBUTE_VALUE,
    );
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-start-blocked",
      "true",
    );
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

  it("mostra progresso visual durante atualização do jogo", async () => {
    mockSystemTheme(true);

    await renderApp();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, {
          detail: { progress: UPDATE_TEST_PROGRESS },
        }),
      );
    });

    expect(screen.getByText("Atualizando jogo")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Progresso da atualização" }),
    ).toHaveAttribute("aria-valuenow", String(UPDATE_TEST_PROGRESS));
    expect(
      document.querySelector(".app-update-message__bar"),
    ).toBeInTheDocument();
  });

  it("toca som de início da atualização uma vez por ciclo", async () => {
    mockSystemTheme(true);
    const playAudio = jest
      .spyOn(audioManager, "play")
      .mockResolvedValue(undefined);

    await renderApp();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, {
          detail: { progress: UPDATE_TEST_PROGRESS },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, {
          detail: { progress: UPDATE_TEST_PROGRESS + 1 },
        }),
      );
    });

    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.UPDATE_PROGRESS);
    expect(
      playAudio.mock.calls.filter(
        ([audioId]) => audioId === GAME_AUDIO_IDS.UPDATE_PROGRESS,
      ),
    ).toHaveLength(1);
    expect(playAudio).not.toHaveBeenCalledWith(GAME_AUDIO_IDS.UPDATE_INSTALLED);
  });

  it("toca som de conclusão quando update chega ao reload", async () => {
    mockSystemTheme(true);
    const playAudio = jest
      .spyOn(audioManager, "play")
      .mockResolvedValue(undefined);

    await renderApp();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, {
          detail: { progress: UPDATE_TEST_PROGRESS },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, {
          detail: { progress: 100, stage: "reloading" },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(BRICKBREAKER_UPDATE_PROGRESS_EVENT, {
          detail: { progress: 100, stage: "reloading" },
        }),
      );
    });

    expect(
      playAudio.mock.calls.filter(
        ([audioId]) => audioId === GAME_AUDIO_IDS.UPDATE_PROGRESS,
      ),
    ).toHaveLength(1);
    expect(
      playAudio.mock.calls.filter(
        ([audioId]) => audioId === GAME_AUDIO_IDS.UPDATE_INSTALLED,
      ),
    ).toHaveLength(1);
  });

  it("confirma a versão instalada após atualização", async () => {
    mockSystemTheme(true);
    const playAudio = jest
      .spyOn(audioManager, "play")
      .mockResolvedValue(undefined);
    window.sessionStorage.setItem(BRICKBREAKER_UPDATE_INSTALLED_KEY, "pending");

    await renderApp();

    expect(screen.getByText("Versão v0 instalada")).toBeInTheDocument();
    expect(
      window.sessionStorage.getItem(BRICKBREAKER_UPDATE_INSTALLED_KEY),
    ).toBeNull();
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.UPDATE_INSTALLED);
  });

  it("abre menu lateral com aparência, histórico, colisões e zerar pontuação", async () => {
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
      within(appearanceGroup).getByRole("button", { name: "Arcade neon" }),
    ).toBeInTheDocument();
    expect(
      within(appearanceGroup).getByRole("button", { name: "Retrô padrão" }),
    ).toBeInTheDocument();
    expect(
      within(appearanceGroup).getByRole("button", { name: "Arcade" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /histórico/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId(SETTINGS_ACTION_LOGS_TEST_ID)).toHaveAttribute(
      "data-settings-action",
      "logs",
    );
    expect(
      screen.getByRole("button", { name: /colisões/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(SETTINGS_ACTION_COLLISIONS_TEST_ID),
    ).toHaveAttribute("data-settings-action", "collisions");
    expect(
      screen.getByRole("button", { name: /zerar pontuação/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(SETTINGS_ACTION_RESET_SCORE_TEST_ID),
    ).toHaveAttribute("data-settings-action", "reset-score");
  });

  it("pausa a partida enquanto o menu lateral está aberto", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_FALSE_ATTRIBUTE_VALUE,
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));

    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_TRUE_ATTRIBUTE_VALUE,
    );

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    await user.click(
      within(drawer).getByRole("button", { name: "Fechar menu" }),
    );

    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_FALSE_ATTRIBUTE_VALUE,
    );
  });


  it("mostra recordes gerais locais no menu", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();
    const scoreStorage = jest.requireMock("./storage/score") as {
      getHighScore: jest.Mock;
      getHighScores: jest.Mock;
    };
    scoreStorage.getHighScore.mockResolvedValue(120);
    scoreStorage.getHighScores.mockResolvedValue([120, 80, 40]);

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    expect(within(drawer).getByRole("heading", { name: "Recordes" })).toBeInTheDocument();
    expect(within(drawer).getByText("Melhor partida 120")).toBeInTheDocument();
    expect(within(drawer).getByText("1º 120")).toBeInTheDocument();
    expect(within(drawer).getByText("2º 80")).toBeInTheDocument();
    expect(within(drawer).getByText("3º 40")).toBeInTheDocument();
  });

  it("alterna aparência, aplica no documento e persiste escolha", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
    expect(mockLastGameProps?.imageSetId).toBe("retro-default");
    await user.click(screen.getByRole("button", { name: "Menu" }));

    await user.click(screen.getByRole("button", { name: "CRT alto contraste" }));
    await user.click(screen.getByRole("button", { name: "Alto contraste" }));
    await user.click(screen.getByRole("button", { name: "CRT mono" }));

    expect(document.documentElement.dataset.theme).toBe("crt-high-contrast");
    expect(document.documentElement.dataset.imageSet).toBe("high-contrast");
    expect(document.documentElement.dataset.fontSet).toBe("crt-mono");
    expect(mockLastGameProps?.imageSetId).toBe("high-contrast");
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

    await user.click(screen.getByRole("button", { name: "Pôr do sol pixelado" }));

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

  it("ancora mensagem de subida de fase no tabuleiro informado pelo jogo", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();

    act(() => {
      mockLastGameProps?.onBoardRectChange?.(TEST_BOARD_RECT);
      jest.advanceTimersByTime(COUNTDOWN_TOTAL_MS);
      mockLastGameProps?.onLevelTransition?.(TEST_LEVEL_TRANSITION_PAYLOAD);
    });

    expect(screen.getByTestId(STAGE_TEST_ID)).toHaveStyle({
      left: `${TEST_BOARD_RECT.x}px`,
      top: `${TEST_BOARD_RECT.y}px`,
      width: `${TEST_BOARD_RECT.width}px`,
      height: `${TEST_BOARD_RECT.height}px`,
    });
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
