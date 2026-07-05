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
const RIP_VIEWPORT_HEIGHT_PROPERTY = "--game-cinematic-rip-visible-height";

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
  it("centraliza o palco visual no retângulo do tabuleiro quando informado", () => {
    render(
      <GameCinematicOverlay
        state={{ type: "countdown", value: "3" }}
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
