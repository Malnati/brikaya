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
  it("renderiza mídias locais CC0 no countdown sem remover a contagem textual", () => {
    const { container } = render(
      <GameCinematicOverlay state={{ type: "countdown", value: "3" }} />,
    );

    expect(screen.getByTestId("game-cinematic-overlay")).toHaveTextContent("3");
    expectDecorativeMedia(container, "countdown-circle", COUNTDOWN_CIRCLE_PATH);
    expectDecorativeMedia(container, "countdown-spark", COUNTDOWN_SPARK_PATH);
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
});
