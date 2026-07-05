// src/components/GameCinematicOverlay.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";

import { GameCinematicOverlay } from "./GameCinematicOverlay";

const COUNTDOWN_CIRCLE_PATH = "/assets/visual/vfx/vfx-countdown-circle-overlay.svg";
const COUNTDOWN_SPARK_PATH = "/assets/visual/vfx/vfx-countdown-spark-overlay.svg";
const LEVEL_UP_TWIRL_PATH = "/assets/visual/vfx/vfx-level-up-twirl-overlay.svg";
const LEVEL_UP_STAR_PATH = "/assets/visual/vfx/vfx-level-up-star-overlay.svg";
const RIP_SMOKE_PATH = "/assets/visual/vfx/vfx-game-over-rip-smoke.svg";
const HIGH_CONTRAST_LEVEL_UP_STAR_PATH =
  "/assets/visual/vfx/vfx-level-up-star-high-contrast-overlay.svg";
const TEST_BOARD_RECT = {
  x: 13,
  y: 111,
  width: 367,
  height: 245,
};
const STAGE_TEST_ID = "game-cinematic-stage";
const COUNTDOWN_COMPOSITION_TEST_ID = "game-cinematic-countdown-composition";
const RIP_COMPOSITION_TEST_ID = "game-cinematic-rip-composition";
const VISIBLE_TOP_PROPERTY = "--game-cinematic-visible-top";
const VISIBLE_HEIGHT_PROPERTY = "--game-cinematic-visible-height";
const RIP_VIEWPORT_HEIGHT_PROPERTY = "--game-cinematic-rip-visible-height";
const COUNTDOWN_HALO_TEST_ID = "game-cinematic-countdown-halo";
const COUNTDOWN_COUNT_TEST_ID = "game-cinematic-countdown-count";

function styleText(element: Element | null): string {
  return element?.getAttribute("style") || "";
}

function expectCenteredAnchor(element: Element | null) {
  expect(element).toBeInTheDocument();
  expect(element).toHaveStyle({
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  });
}

function setLocationSearch(search: string) {
  window.history.replaceState({}, "", `/${search}`);
}

function resetLocationSearch() {
  window.history.replaceState({}, "", "/");
}

function mockMatchMedia(matchesQuery: (query: string) => boolean) {
  const originalMatchMedia = window.matchMedia;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: matchesQuery(query),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  return () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  };
}

function mockMobileLandscapeBrowser() {
  return mockMatchMedia((query) =>
    query.includes("pointer: coarse") &&
    query.includes("orientation: landscape") &&
    query.includes("max-height: 600px"),
  );
}

function mockMobilePortraitBrowser() {
  return mockMatchMedia((query) =>
    query.includes("pointer: coarse") &&
    query.includes("max-width: 600px"),
  );
}

function mockVisualViewport({
  offsetTop = 0,
  offsetLeft = 0,
  width = 667,
  height = 500,
}: {
  offsetTop?: number;
  offsetLeft?: number;
  width?: number;
  height?: number;
}) {
  const originalVisualViewport = window.visualViewport;
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: {
      offsetTop,
      offsetLeft,
      width,
      height,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  });

  return () => {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: originalVisualViewport,
    });
  };
}

function mockWindowSize({ width, height }: { width: number; height: number }) {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });

  return () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: originalInnerHeight,
    });
  };
}

function expectDecorativeMedia(container: HTMLElement, name: string, path: string) {
  const media = container.querySelector(
    `img[data-cinematic-media="${name}"]`,
  );
  expect(media).toBeInTheDocument();
  expect(media).toHaveAttribute("src", path);
  expect(media).toHaveAttribute("alt", "");
  expect(media).toHaveAttribute("aria-hidden", "true");
}

describe("GameCinematicOverlay media", () => {
  afterEach(() => {
    resetLocationSearch();
  });
  it("centraliza a subida de fase no retângulo do tabuleiro quando informado", () => {
    render(
      <GameCinematicOverlay
        state={{ type: "levelUp", nextLevel: 2, speedLabel: "1.12×" }}
        boardRect={TEST_BOARD_RECT}
      />,
    );

    expect(screen.getByTestId(STAGE_TEST_ID)).toHaveStyle({
      left: `${TEST_BOARD_RECT.x}px`,
      top: `${TEST_BOARD_RECT.y}px`,
      width: `${TEST_BOARD_RECT.width}px`,
      height: `${TEST_BOARD_RECT.height}px`,
    });
  });

  it("mantém o countdown fora do retângulo do tabuleiro e respeita inset inferior explícito de QA", () => {
    setLocationSearch("?qaViewportBottomInset=104");

    render(
      <GameCinematicOverlay
        state={{ type: "countdown", value: "3" }}
        boardRect={TEST_BOARD_RECT}
      />,
    );

    const stage = screen.getByTestId(STAGE_TEST_ID);

    expect(stage).not.toHaveStyle({ left: `${TEST_BOARD_RECT.x}px` });
    expect(stage).not.toHaveStyle({ top: `${TEST_BOARD_RECT.y}px` });
    expect(stage.style.getPropertyValue(VISIBLE_HEIGHT_PROPERTY)).toBeTruthy();
    expect(stage.style.getPropertyValue(VISIBLE_HEIGHT_PROPERTY)).toBe(
      "664px",
    );
    expect(stage.style.height).toBe("664px");
  });

  it("respeita inset superior explícito de QA no countdown landscape", () => {
    setLocationSearch("?qaViewportTopInset=180&qaViewportBottomInset=0");

    render(<GameCinematicOverlay state={{ type: "countdown", value: "2" }} />);

    const stage = screen.getByTestId(STAGE_TEST_ID);

    expect(stage.style.getPropertyValue(VISIBLE_TOP_PROPERTY)).toBe("180px");
    expect(stage.style.top).toBe("180px");
    expect(stage.style.getPropertyValue(VISIBLE_HEIGHT_PROPERTY)).toBe(
      "588px",
    );
    expect(stage.style.height).toBe("588px");
  });

  it("não aplica deslocamento superior fixo em landscape quando o viewport visual já é a área útil", () => {
    const restoreMatchMedia = mockMobileLandscapeBrowser();
    const restoreVisualViewport = mockVisualViewport({
      offsetTop: 0,
      width: 667,
      height: 500,
    });

    try {
      render(<GameCinematicOverlay state={{ type: "countdown", value: "2" }} />);

      const stage = screen.getByTestId(STAGE_TEST_ID);

      expect(stage.style.getPropertyValue(VISIBLE_TOP_PROPERTY)).toBe("0px");
      expect(stage.style.top).toBe("0px");
      expect(stage.style.getPropertyValue(VISIBLE_HEIGHT_PROPERTY)).toBe("500px");
      expect(stage.style.height).toBe("500px");
    } finally {
      restoreVisualViewport();
      restoreMatchMedia();
    }
  });

  it("não reserva automaticamente o topo do Safari mobile landscape: centraliza na tela inteira", () => {
    const restoreMatchMedia = mockMobileLandscapeBrowser();
    const restoreWindowSize = mockWindowSize({ width: 874, height: 402 });

    try {
      render(<GameCinematicOverlay state={{ type: "countdown", value: "1" }} />);

      const stage = screen.getByTestId(STAGE_TEST_ID);

      expect(stage.style.getPropertyValue(VISIBLE_TOP_PROPERTY)).toBe("0px");
      expect(stage.style.top).toBe("0px");
      expect(stage.style.getPropertyValue(VISIBLE_HEIGHT_PROPERTY)).toBe("402px");
      expect(stage.style.height).toBe("402px");
    } finally {
      restoreWindowSize();
      restoreMatchMedia();
    }
  });

  it("não reserva automaticamente a barra inferior mobile portrait: centraliza na tela inteira", () => {
    const restoreMatchMedia = mockMobilePortraitBrowser();
    const restoreWindowSize = mockWindowSize({ width: 393, height: 852 });

    try {
      render(<GameCinematicOverlay state={{ type: "countdown", value: "1" }} />);

      const stage = screen.getByTestId(STAGE_TEST_ID);

      expect(stage.style.getPropertyValue(VISIBLE_TOP_PROPERTY)).toBe("0px");
      expect(stage.style.top).toBe("0px");
      expect(stage.style.getPropertyValue(VISIBLE_HEIGHT_PROPERTY)).toBe(
        "852px",
      );
      expect(stage.style.height).toBe("852px");
    } finally {
      restoreWindowSize();
      restoreMatchMedia();
    }
  });

  it("renderiza mídias locais CC0 no countdown sem remover a contagem textual", () => {
    const { container } = render(
      <GameCinematicOverlay state={{ type: "countdown", value: "3" }} />,
    );

    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
    expectDecorativeMedia(container, "countdown-circle", COUNTDOWN_CIRCLE_PATH);
    expectDecorativeMedia(container, "countdown-spark", COUNTDOWN_SPARK_PATH);
  });

  it("agrupa número e mídias do countdown em uma composição visual única", () => {
    const { container } = render(
      <GameCinematicOverlay state={{ type: "countdown", value: "3" }} />,
    );
    const composition = screen.getByTestId(COUNTDOWN_COMPOSITION_TEST_ID);

    expect(composition).toHaveTextContent("3");
    expect(composition).toContainElement(
      container.querySelector('img[data-cinematic-media="countdown-circle"]'),
    );
    expect(composition).toContainElement(
      container.querySelector('img[data-cinematic-media="countdown-spark"]'),
    );
    expect(composition).toContainElement(screen.getByTestId(COUNTDOWN_HALO_TEST_ID));
    expect(composition).toContainElement(screen.getByTestId(COUNTDOWN_COUNT_TEST_ID));
  });

  it("usa a mesma origem de centro para halo, anel, faísca e número do countdown", () => {
    const { container } = render(
      <GameCinematicOverlay state={{ type: "countdown", value: "1" }} />,
    );
    const composition = screen.getByTestId(COUNTDOWN_COMPOSITION_TEST_ID);
    const halo = screen.getByTestId(COUNTDOWN_HALO_TEST_ID);
    const count = screen.getByTestId(COUNTDOWN_COUNT_TEST_ID);
    const circle = container.querySelector('img[data-cinematic-media="countdown-circle"]');
    const spark = container.querySelector('img[data-cinematic-media="countdown-spark"]');
    const circleLayer = container.querySelector(
      '[data-cinematic-media-layer="countdown-circle"]',
    );
    const sparkLayer = container.querySelector(
      '[data-cinematic-media-layer="countdown-spark"]',
    );

    for (const layer of [halo, circleLayer, sparkLayer]) expectCenteredAnchor(layer);
    expect(count).toBeInTheDocument();
    expect(styleText(count)).not.toContain("transform");
    expect(styleText(count)).not.toContain("0.1em");
    expect(styleText(circle)).not.toContain("translate");
    expect(styleText(spark)).not.toContain("translate");
    expect(circleLayer).toContainElement(circle);
    expect(sparkLayer).toContainElement(spark);
    expect(composition).toContainElement(halo);
    expect(composition).toContainElement(count);
  });

  it("renderiza mídias locais CC0 na subida de fase sem remover mensagem essencial", () => {
    const { container } = render(
      <GameCinematicOverlay
        state={{ type: "levelUp", nextLevel: 2, speedLabel: "1.12×" }}
      />,
    );

    expect(screen.getByTestId("level-toast")).toHaveTextContent(
      "Subindo de nível",
    );
    expect(screen.getByTestId("level-toast")).toHaveTextContent("Fase 2");
    expectDecorativeMedia(container, "level-up-twirl", LEVEL_UP_TWIRL_PATH);
    expectDecorativeMedia(container, "level-up-star", LEVEL_UP_STAR_PATH);
  });

  it("troca mídia de efeito quando o conjunto de imagens muda", () => {
    const { container } = render(
      <GameCinematicOverlay
        state={{ type: "levelUp", nextLevel: 2, speedLabel: "1.12×" }}
        imageSetId="high-contrast"
      />,
    );

    expectDecorativeMedia(
      container,
      "level-up-star",
      HIGH_CONTRAST_LEVEL_UP_STAR_PATH,
    );
  });

  it("renderiza mídia local CC0 no RIP sem remover mensagem essencial", () => {
    const { container } = render(<GameCinematicOverlay state={{ type: "rip" }} />);

    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent(
      "RIP",
    );
    expectDecorativeMedia(container, "rip-smoke", RIP_SMOKE_PATH);
  });

  it("agrupa texto e fumaça RIP em uma composição visual única", () => {
    const { container } = render(<GameCinematicOverlay state={{ type: "rip" }} />);
    const composition = screen.getByTestId(RIP_COMPOSITION_TEST_ID);

    expect(composition).toHaveTextContent("RIP");
    expect(composition).toContainElement(
      container.querySelector('img[data-cinematic-media="rip-smoke"]'),
    );
  });

  it("mantém o RIP centralizado na viewport mesmo quando o tabuleiro informa retângulo", () => {
    render(
      <GameCinematicOverlay state={{ type: "rip" }} boardRect={TEST_BOARD_RECT} />,
    );

    const stage = screen.getByTestId(STAGE_TEST_ID);

    expect(stage).not.toHaveStyle({ left: `${TEST_BOARD_RECT.x}px` });
    expect(stage).not.toHaveStyle({ top: `${TEST_BOARD_RECT.y}px` });
    expect(stage).not.toHaveStyle({ width: `${TEST_BOARD_RECT.width}px` });
    expect(stage).not.toHaveStyle({ height: `${TEST_BOARD_RECT.height}px` });
    expect(stage.style.getPropertyValue(RIP_VIEWPORT_HEIGHT_PROPERTY)).toBeTruthy();
  });
});
