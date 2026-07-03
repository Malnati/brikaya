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

const TEST_BOARD_RECT = {
  x: 13,
  y: 111,
  width: 367,
  height: 245,
  bottom: 356,
  left: 13,
  right: 380,
  top: 111,
  toJSON: jest.fn(),
} as unknown as DOMRect;

describe("Game", () => {
  beforeEach(() => {
    jest.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
      TEST_BOARD_RECT,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
      false,
      expect.anything(),
    );
  });

  it("propaga pausa para o loop do jogo", () => {
    render(
      <Game
        onScoreUpdate={jest.fn()}
        {...({ paused: true } as { paused: boolean })}
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
      false,
      "retro-default",
      true,
      expect.anything(),
    );
  });

  it("renderiza faixa sensível invisível sobre a linha da raquete", () => {
    render(<Game onScoreUpdate={jest.fn()} />);

    const touchZone = screen.getByTestId("paddle-touch-zone");

    expect(touchZone).toBeInTheDocument();
    expect(touchZone).toHaveAttribute("aria-hidden", "true");
    expect(touchZone).toHaveStyle({ height: "2in" });
    expect(touchZone).toHaveClass("game-paddle-touch-zone");
  });

  it("publica o retângulo real do canvas para efeitos visuais", () => {
    const onBoardRectChange = jest.fn();

    render(
      <Game
        onScoreUpdate={jest.fn()}
        onBoardRectChange={onBoardRectChange}
      />,
    );

    expect(onBoardRectChange).toHaveBeenCalledWith({
      x: TEST_BOARD_RECT.x,
      y: TEST_BOARD_RECT.y,
      width: TEST_BOARD_RECT.width,
      height: TEST_BOARD_RECT.height,
    });
  });
});
