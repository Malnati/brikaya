// src/components/Game.test.tsx
import { render, screen } from "@testing-library/react";

import Game from "./Game";

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
        levelToastPayload={null}
        isLevelToastVisible={false}
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
});
