// src/components/Game.test.tsx
import { render, screen } from "@testing-library/react";

import Game from "./Game";
import { useGameLoop } from "../hooks/useGameLoop";

jest.mock("../hooks/useGameLoop", () => ({
  useGameLoop: jest.fn(),
}));

jest.mock("../hooks/useColorDebug", () => ({
  useColorDebug: jest.fn(),
}));

describe("Game", () => {
  it("renderiza controles principais fora do quadro do jogo", () => {
    const { container } = render(
      <Game
        onScoreUpdate={jest.fn()}
        boardControls={
          <div
            className="game-corner-controls"
            aria-label="Controles principais"
          >
            <button type="button">Som</button>
          </div>
        }
      />,
    );

    const boardFrame = container.querySelector(".game-board-frame");
    const controlsFrame = container.querySelector(".game-board-controls");
    const controls = screen.getByLabelText("Controles principais");

    expect(boardFrame).toBeInTheDocument();
    expect(controlsFrame).toBeInTheDocument();
    expect(boardFrame).not.toContainElement(controls);
    expect(controlsFrame).toContainElement(controls);
    expect(controlsFrame?.previousElementSibling).toBe(boardFrame);
  });

  it("propaga bloqueio de início para o loop do jogo", () => {
    render(
      <Game
        onScoreUpdate={jest.fn()}
        startBlocked
      />,
    );

    expect(useGameLoop).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      undefined,
      undefined,
      expect.any(Object),
      undefined,
      undefined,
      undefined,
      undefined,
      true,
      "retro-default",
    );
  });
});
