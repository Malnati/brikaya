// src/App.test.tsx
import React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { audioManager } from "./utils/audioManager";
import {
  refreshAppAfterLocalReset,
  resetLocalAppState,
} from "./utils/localAppReset";
import {
  AUDIO_STORAGE_MUTED_VALUE,
  GAME_AUDIO_IDS,
  MUSIC_STORAGE_MUTED_KEY,
} from "./constants/audio";
import type { LevelTransitionPayload } from "./constants/game";
import {
  BRIKAYA_OFFLINE_READY_EVENT,
  BRIKAYA_UPDATE_INSTALLED_KEY,
  BRIKAYA_UPDATE_PROGRESS_EVENT,
} from "./registerServiceWorker";
import {
  LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
  PRIVACY_CONSENT_SCOPE,
  PRIVACY_CONSENT_STORAGE_KEY,
  PRIVACY_CONSENT_VERSION,
} from "./constants/privacyConsent";

interface MockGameProps {
  boardControls?: React.ReactNode;
  startBlocked?: boolean;
  paused?: boolean;
  qaScenario?: string | null;
  onBoardRectChange?: (rect: TestBoardRect) => void;
  onLevelTransition?: (payload: LevelTransitionPayload) => void;
  onGameOver?: () => Promise<void> | void;
  imageSetId?: string;
  gameMode?: string;
  joystickDiagnosticsEnabled?: boolean;
  joystickDiagnosticSamples?: unknown[];
  onJoystickDiagnosticSample?: (sample: unknown) => void;
}

interface TestBoardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MockViewportOptions {
  width: number;
  height: number;
  maxTouchPoints?: number;
}

interface MockMediaOptions {
  pointerCoarse?: boolean;
  hoverNone?: boolean;
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
const SETTINGS_ACTION_RESET_PREFERENCES_TEST_ID =
  "settings-action-reset-preferences";
const RESET_PREFERENCES_CONFIRM_TEXT =
  "Isso apaga pontuação, recordes, histórico e preferências deste aparelho. Continuar?";
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
        data-game-mode={props.gameMode}
        data-paused={
          props.paused
            ? PAUSED_TRUE_ATTRIBUTE_VALUE
            : PAUSED_FALSE_ATTRIBUTE_VALUE
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

jest.mock("./utils/localAppReset", () => ({
  refreshAppAfterLocalReset: jest.fn().mockResolvedValue(undefined),
  resetLocalAppState: jest.fn().mockResolvedValue(undefined),
}));

function mockLocalStorageValues(values: Record<string, string | null>) {
  (window.localStorage.getItem as jest.Mock).mockImplementation(
    (key: string) => values[key] ?? null,
  );
}

function mockPrivacyConsent(value: string | null) {
  mockLocalStorageValues({ [PRIVACY_CONSENT_STORAGE_KEY]: value });
}

function mockViewport({
  width,
  height,
  maxTouchPoints = 0,
}: MockViewportOptions) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height,
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: maxTouchPoints,
  });
}

function mockSystemTheme(
  prefersDark: boolean,
  { pointerCoarse = false, hoverNone = false }: MockMediaOptions = {},
) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches:
        (prefersDark && query === "(prefers-color-scheme: dark)") ||
        (pointerCoarse && query === "(pointer: coarse)") ||
        (hoverNone && query === "(hover: none)"),
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

function publishTestBoardRect(rect: TestBoardRect = TEST_BOARD_RECT) {
  act(() => {
    mockLastGameProps?.onBoardRectChange?.(rect);
  });
}

function createDeferredPromise() {
  let resolvePromise: () => void = () => {};
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolve: resolvePromise };
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
    (refreshAppAfterLocalReset as jest.Mock).mockResolvedValue(undefined);
    (resetLocalAppState as jest.Mock).mockResolvedValue(undefined);
    mockLastGameProps = null;
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
    mockViewport({ width: 1024, height: 768, maxTouchPoints: 0 });
    mockPrivacyConsent(VALID_PRIVACY_CONSENT_RECORD);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("mantém configurações no menu lateral fechado por padrão", async () => {
    mockSystemTheme(true);

    await renderApp();

    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sem som" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Música" })).toBeInTheDocument();
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

  it("bloqueia telefone em landscape com mensagem fixa sobre o jogo", async () => {
    mockViewport({ width: 852, height: 393, maxTouchPoints: 5 });
    mockSystemTheme(true, { pointerCoarse: true, hoverNone: true });

    await renderApp();

    expect(
      screen.getByRole("alertdialog", {
        name: "Você precisa de espaço para o joystick",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mobile-orientation-blocker")).toHaveTextContent(
      "Você precisa de espaço para o joystick",
    );
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_TRUE_ATTRIBUTE_VALUE,
    );
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-start-blocked",
      "true",
    );
  });

  it("remove bloqueio quando telefone volta para portrait sem reiniciar o jogo", async () => {
    mockViewport({ width: 852, height: 393, maxTouchPoints: 5 });
    mockSystemTheme(true, { pointerCoarse: true, hoverNone: true });

    await renderApp();

    expect(
      screen.getByTestId("mobile-orientation-blocker"),
    ).toBeInTheDocument();

    act(() => {
      mockViewport({ width: 393, height: 852, maxTouchPoints: 5 });
      window.dispatchEvent(new Event("resize"));
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId("mobile-orientation-blocker"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_FALSE_ATTRIBUTE_VALUE,
    );
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-start-blocked",
      "true",
    );
  });

  it("bloqueia tablet touch em landscape", async () => {
    mockViewport({ width: 1180, height: 820, maxTouchPoints: 5 });
    mockSystemTheme(true, { pointerCoarse: true, hoverNone: true });

    await renderApp();

    expect(
      screen.getByRole("alertdialog", {
        name: "Você precisa de espaço para o joystick",
      }),
    ).toBeInTheDocument();
  });

  it("não bloqueia desktop landscape sem toque", async () => {
    mockViewport({ width: 1440, height: 900, maxTouchPoints: 0 });
    mockSystemTheme(true);

    await renderApp();

    expect(
      screen.queryByText("Você precisa de espaço para o joystick"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_FALSE_ATTRIBUTE_VALUE,
    );
  });

  it("mantém bloqueio acima do menu em mobile landscape", async () => {
    mockViewport({ width: 393, height: 852, maxTouchPoints: 5 });
    mockSystemTheme(true, { pointerCoarse: true, hoverNone: true });
    const user = userEvent.setup();

    await renderApp();
    await user.click(screen.getByRole("button", { name: "Menu" }));

    act(() => {
      mockViewport({ width: 852, height: 393, maxTouchPoints: 5 });
      window.dispatchEvent(new Event("resize"));
    });

    expect(
      screen.getByRole("complementary", { name: "Menu do jogo" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mobile-orientation-blocker")).toHaveTextContent(
      "Você precisa de espaço para o joystick",
    );
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_TRUE_ATTRIBUTE_VALUE,
    );
  });

  it("exige consentimento antes da primeira contagem", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);
    mockPrivacyConsent(null);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderApp();
    publishTestBoardRect();

    expect(
      screen.getByRole("dialog", { name: "Antes de jogar" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("game-cinematic-overlay"),
    ).not.toBeInTheDocument();
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
    expect(
      screen.queryByRole("dialog", { name: "Antes de jogar" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("language-detection-overlay")).toHaveTextContent(
      "Preparando idioma",
    );
    expect(
      screen.getByRole("progressbar", {
        name: "Progresso do preparo do idioma",
      }),
    ).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_TRUE_ATTRIBUTE_VALUE,
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(
      screen.queryByTestId("language-detection-overlay"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      DATA_PAUSED_ATTRIBUTE,
      PAUSED_FALSE_ATTRIBUTE_VALUE,
    );
  });

  it("não reapresenta consentimento quando existe aceite salvo", async () => {
    mockSystemTheme(true);

    await renderApp();
    publishTestBoardRect();

    expect(
      screen.queryByRole("dialog", { name: "Antes de jogar" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
  });

  it("revoga consentimento pelo menu e pausa o jogo", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    expect(
      within(drawer).getByRole("heading", { name: "Privacidade" }),
    ).toBeInTheDocument();

    await user.click(
      within(drawer).getByRole("button", { name: "Revisar consentimento" }),
    );

    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      PRIVACY_CONSENT_STORAGE_KEY,
    );
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
    );
    expect(
      screen.queryByRole("complementary", { name: "Menu do jogo" }),
    ).not.toBeInTheDocument();
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
        new CustomEvent(BRIKAYA_UPDATE_PROGRESS_EVENT, {
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
        new CustomEvent(BRIKAYA_UPDATE_PROGRESS_EVENT, {
          detail: { progress: UPDATE_TEST_PROGRESS },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(BRIKAYA_UPDATE_PROGRESS_EVENT, {
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
        new CustomEvent(BRIKAYA_UPDATE_PROGRESS_EVENT, {
          detail: { progress: UPDATE_TEST_PROGRESS },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(BRIKAYA_UPDATE_PROGRESS_EVENT, {
          detail: { progress: 100, stage: "reloading" },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(BRIKAYA_UPDATE_PROGRESS_EVENT, {
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
    window.sessionStorage.setItem(BRIKAYA_UPDATE_INSTALLED_KEY, "pending");

    await renderApp();

    expect(screen.getByText("Versão v0 instalada")).toBeInTheDocument();
    expect(
      window.sessionStorage.getItem(BRIKAYA_UPDATE_INSTALLED_KEY),
    ).toBeNull();
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.UPDATE_INSTALLED);
  });

  it("usa Torreta por padrão e não oferece seleção de modo", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    await renderApp();

    expect(mockLastGameProps?.gameMode).toBe("ball-turret");
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-game-mode",
      "ball-turret",
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const drawer = screen.getByRole("complementary", { name: "Menu do jogo" });
    expect(
      within(drawer).queryByRole("heading", { name: "Modo de jogo" }),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).queryByRole("button", { name: "Clássico" }),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).queryByRole("button", { name: "Torreta" }),
    ).not.toBeInTheDocument();
  });

  it("ignora preferência antiga de modo clássico salvo", async () => {
    mockSystemTheme(true);
    mockLocalStorageValues({
      [PRIVACY_CONSENT_STORAGE_KEY]: VALID_PRIVACY_CONSENT_RECORD,
      "brikaya-game-mode": "classic",
    });

    await renderApp();

    expect(mockLastGameProps?.gameMode).toBe("ball-turret");
    expect(screen.getByTestId("mock-game")).toHaveAttribute(
      "data-game-mode",
      "ball-turret",
    );
  });

  it("força modo torreta no cenário de QA", async () => {
    mockSystemTheme(true);
    window.history.replaceState(null, "", "/?qaScenario=ball-turret");

    await renderApp();

    expect(mockLastGameProps?.qaScenario).toBe("ball-turret");
    expect(mockLastGameProps?.gameMode).toBe("ball-turret");
  });

  it("abre menu lateral sem seção Aparência, logs ou diagnóstico", async () => {
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
    expect(
      within(drawer).queryByRole("heading", { name: "Aparência" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Aparência do jogo"),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).queryByRole("button", { name: "Automático por fase" }),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).queryByRole("button", { name: "Arcade neon" }),
    ).not.toBeInTheDocument();
    expect(
      within(drawer).queryByRole("button", { name: "Retrô padrão" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /histórico|logs/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(SETTINGS_ACTION_LOGS_TEST_ID)).toBeNull();
    expect(
      screen.queryByRole("checkbox", { name: "Registrar controle da Torreta" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Baixar registro da Torreta" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Limpar registro da Torreta" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Nenhum registro ainda")).not.toBeInTheDocument();
    expect(mockLastGameProps?.joystickDiagnosticsEnabled).toBe(false);
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
    expect(
      screen.getByRole("button", { name: /restaurar padrão/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(SETTINGS_ACTION_RESET_PREFERENCES_TEST_ID),
    ).toHaveAttribute("data-settings-action", "reset-preferences");
  });

  it("encaminha cenário de QA de blocos desviantes para o jogo", async () => {
    mockSystemTheme(true);
    window.history.replaceState(null, "", "/?qaScenario=evasive-blocks");

    await renderApp();

    expect(mockLastGameProps?.qaScenario).toBe("evasive-blocks");
  });

  it("encaminha cenário de QA de colisão da raquete para o jogo", async () => {
    mockSystemTheme(true);
    window.history.replaceState(null, "", "/?qaScenario=paddle-collision");

    await renderApp();

    expect(mockLastGameProps?.qaScenario).toBe("paddle-collision");
  });

  it("confirma, limpa dados locais e atualiza o app ao restaurar padrão", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const playAudio = jest
      .spyOn(audioManager, "play")
      .mockResolvedValue(undefined);

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(
      screen.getByTestId(SETTINGS_ACTION_RESET_PREFERENCES_TEST_ID),
    );

    expect(confirmSpy).toHaveBeenCalledWith(RESET_PREFERENCES_CONFIRM_TEXT);
    await waitFor(() => expect(resetLocalAppState).toHaveBeenCalledTimes(1));
    expect(refreshAppAfterLocalReset).toHaveBeenCalledTimes(1);
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.RESET_SCORE);
  });

  it("bloqueia restauração padrão repetida enquanto a limpeza está em andamento", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const resetDeferred = createDeferredPromise();
    (resetLocalAppState as jest.Mock).mockReturnValueOnce(
      resetDeferred.promise,
    );

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));
    const resetButton = screen.getByTestId(
      SETTINGS_ACTION_RESET_PREFERENCES_TEST_ID,
    );

    await user.click(resetButton);
    await user.click(resetButton);

    expect(resetButton).toBeDisabled();
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(resetLocalAppState).toHaveBeenCalledTimes(1);

    await act(async () => {
      resetDeferred.resolve();
      await resetDeferred.promise;
    });
    await waitFor(() =>
      expect(refreshAppAfterLocalReset).toHaveBeenCalledTimes(1),
    );
  });

  it("mostra erro quando não consegue restaurar padrão", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const playAudio = jest
      .spyOn(audioManager, "play")
      .mockResolvedValue(undefined);
    (resetLocalAppState as jest.Mock).mockRejectedValueOnce(
      new Error("reset-failed"),
    );

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(
      screen.getByTestId(SETTINGS_ACTION_RESET_PREFERENCES_TEST_ID),
    );

    expect(refreshAppAfterLocalReset).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Não foi possível restaurar o padrão."),
    ).toBeInTheDocument();
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.RESET_SCORE);
    expect(playAudio).toHaveBeenCalledWith(GAME_AUDIO_IDS.ERROR_SOFT);
  });

  it("não limpa dados locais quando restauração padrão é cancelada", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(false);

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(
      screen.getByTestId(SETTINGS_ACTION_RESET_PREFERENCES_TEST_ID),
    );

    expect(resetLocalAppState).not.toHaveBeenCalled();
    expect(refreshAppAfterLocalReset).not.toHaveBeenCalled();
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
    expect(
      within(drawer).getByRole("heading", { name: "Recordes" }),
    ).toBeInTheDocument();
    expect(within(drawer).getByText("Melhor partida 120")).toBeInTheDocument();
    expect(within(drawer).getByText("1º 120")).toBeInTheDocument();
    expect(within(drawer).getByText("2º 80")).toBeInTheDocument();
    expect(within(drawer).getByText("3º 40")).toBeInTheDocument();
  });

  it("normaliza aparência antiga e não exibe controles de tema", async () => {
    mockSystemTheme(true);
    mockLocalStorageValues({
      [PRIVACY_CONSENT_STORAGE_KEY]: VALID_PRIVACY_CONSENT_RECORD,
      "brikaya-theme": "pixel-sunset",
      "brikaya-theme-mode": "auto",
      "brikaya-image-set": "sunset-cabinet",
      "brikaya-font-set": "block-pixel",
    });
    const user = userEvent.setup();

    await renderApp();

    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
    expect(mockLastGameProps?.imageSetId).toBe("retro-default");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme",
      "neon-arcade",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "manual",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-image-set",
      "retro-default",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-font-set",
      "arcade-ui",
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));

    expect(screen.queryByTestId("appearance-option-pixel-sunset")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Automático por fase" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Alto contraste" }),
    ).not.toBeInTheDocument();
  });

  it("mostra controles principais como ícones discretos", async () => {
    mockSystemTheme(true);

    await renderApp();

    const audioButton = screen.getByRole("button", { name: "Sem som" });
    const musicButton = screen.getByRole("button", { name: "Música" });
    const restartButton = screen.getByRole("button", { name: "Reiniciar" });

    expect(audioButton).toHaveTextContent("×");
    expect(audioButton).not.toHaveTextContent("Sem som");
    expect(musicButton).toHaveTextContent("♫");
    expect(musicButton).not.toHaveTextContent("Música");
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
    expect(within(topControls).getByRole("button", { name: "Música" })).toBe(
      screen.getByRole("button", { name: "Música" }),
    );
    expect(within(topControls).getByRole("button", { name: "Reiniciar" })).toBe(
      screen.getByRole("button", { name: "Reiniciar" }),
    );
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

  it("alterna música sem desligar o controle geral de som", async () => {
    mockSystemTheme(true);
    const user = userEvent.setup();

    jest.spyOn(audioManager, "unlock").mockResolvedValue(true);
    const playMusic = jest
      .spyOn(audioManager, "playMusic")
      .mockResolvedValue(undefined);
    const setMusicMuted = jest.spyOn(audioManager, "setMusicMuted");

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Sem som" }));
    expect(await screen.findByRole("button", { name: "Som" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Música" }));

    const musicOffButton = await screen.findByRole("button", {
      name: "Sem música",
    });
    expect(screen.getByRole("button", { name: "Som" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(musicOffButton).toHaveAttribute("aria-pressed", "false");
    expect(musicOffButton).toHaveTextContent("×");
    expect(setMusicMuted).toHaveBeenLastCalledWith(true);

    await user.click(musicOffButton);

    const musicOnButton = await screen.findByRole("button", { name: "Música" });
    expect(musicOnButton).toHaveAttribute("aria-pressed", "true");
    expect(musicOnButton).toHaveTextContent("♫");
    expect(setMusicMuted).toHaveBeenLastCalledWith(false);
    expect(playMusic).toHaveBeenCalled();
  });

  it("mantém música pausada ao ligar som quando a preferência foi salva", async () => {
    mockSystemTheme(true);
    mockLocalStorageValues({
      [PRIVACY_CONSENT_STORAGE_KEY]: VALID_PRIVACY_CONSENT_RECORD,
      [MUSIC_STORAGE_MUTED_KEY]: AUDIO_STORAGE_MUTED_VALUE,
    });
    const user = userEvent.setup();

    jest.spyOn(audioManager, "unlock").mockResolvedValue(true);
    const playMusic = jest
      .spyOn(audioManager, "playMusic")
      .mockResolvedValue(undefined);

    await renderApp();

    await user.click(screen.getByRole("button", { name: "Sem som" }));

    expect(await screen.findByRole("button", { name: "Som" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Sem música" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(playMusic).not.toHaveBeenCalled();
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
    expect(
      screen.queryByRole("button", { name: "Som" }),
    ).not.toBeInTheDocument();
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
    expect(
      screen.queryByTestId("game-cinematic-overlay"),
    ).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_STEP_MS);
    });
    expect(
      screen.queryByTestId("game-cinematic-overlay"),
    ).not.toBeInTheDocument();

    publishTestBoardRect();
    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
    expect(screen.getByTestId(STAGE_TEST_ID)).not.toHaveStyle({
      left: `${TEST_BOARD_RECT.x}px`,
      top: `${TEST_BOARD_RECT.y}px`,
      width: `${TEST_BOARD_RECT.width}px`,
      height: `${TEST_BOARD_RECT.height}px`,
    });

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
  it("oculta o aviso offline durante a contagem inicial", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_STEP_MS);
    });
    publishTestBoardRect();

    act(() => {
      window.dispatchEvent(new Event(BRIKAYA_OFFLINE_READY_EVENT));
    });

    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
    expect(
      screen.queryByText("Pronto para jogar offline"),
    ).not.toBeInTheDocument();
  });

  it("mostra mensagem de subida de fase sem reiniciar countdown", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();
    publishTestBoardRect();

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_TOTAL_MS);
    });
    const initialTheme = document.documentElement.dataset.theme;
    act(() => {
      mockLastGameProps?.onLevelTransition?.(TEST_LEVEL_TRANSITION_PAYLOAD);
    });

    expect(screen.getByTestId("level-toast")).toHaveTextContent(
      "Subindo de nível",
    );
    expect(screen.getByTestId("level-toast")).toHaveTextContent("Fase 2");
    expect(screen.queryByText("3")).not.toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe(initialTheme);
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "auto",
    );

    act(() => {
      jest.advanceTimersByTime(LEVEL_UP_OVERLAY_VISIBLE_MS);
    });
    expect(screen.queryByTestId("level-toast")).not.toBeInTheDocument();
  });

  it("mantém tema padrão durante subida de fase", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();
    publishTestBoardRect();

    act(() => {
      jest.advanceTimersByTime(COUNTDOWN_TOTAL_MS);
      mockLastGameProps?.onLevelTransition?.(TEST_LEVEL_TRANSITION_PAYLOAD);
    });

    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "manual",
    );
    expect(screen.getByTestId("level-toast")).toHaveTextContent("Fase 2");
  });

  it("ancora mensagem de subida de fase no tabuleiro informado pelo jogo", async () => {
    jest.useFakeTimers();
    mockSystemTheme(true);

    await renderApp();
    publishTestBoardRect();

    act(() => {
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
    publishTestBoardRect();

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
