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
const EXPECTED_PADDLE_TOUCH_ZONE_HEIGHT = "3in";
const EXPECTED_PADDLE_TOUCH_ZONE_TOP_OFFSET = "- 96px";
const EXPECTED_PADDLE_TOUCH_ZONE_TRANSFORM = "none";
const BALL_TURRET_JOYSTICK_TEST_ID = "ball-turret-joystick";
const BALL_TURRET_JOYSTICK_LABEL = "Controle da Torreta";

describe("Game", () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect")
      .mockReturnValue(TEST_BOARD_RECT);
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
    const inputLayout = container.querySelector(".game-board-input-layout");
    const controlsFrame = container.querySelector(".game-board-controls");
    const controls = screen.getByLabelText("Controles principais");

    expect(boardFrame).toBeInTheDocument();
    expect(inputLayout).toContainElement(boardFrame);
    expect(controlsFrame).toBeInTheDocument();
    expect(boardFrame).not.toContainElement(controls);
    expect(controlsFrame).toContainElement(controls);
    expect(controlsFrame?.previousElementSibling).toBe(inputLayout);
  });

  it("propaga bloqueio de início para o loop do jogo", () => {
    render(<Game onScoreUpdate={jest.fn()} startBlocked />);

    expect(useGameLoop).toHaveBeenLastCalledWith(
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
      "classic",
      expect.anything(),
      expect.anything(),
      false,
      undefined,
    );
  });

  it("propaga pausa para o loop do jogo", () => {
    render(
      <Game
        onScoreUpdate={jest.fn()}
        {...({ paused: true } as { paused: boolean })}
      />,
    );

    expect(useGameLoop).toHaveBeenLastCalledWith(
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
      "classic",
      expect.anything(),
      expect.anything(),
      false,
      undefined,
    );
  });

  it("propaga modo torreta para o loop do jogo", () => {
    render(<Game onScoreUpdate={jest.fn()} gameMode="ball-turret" />);

    expect(useGameLoop).toHaveBeenLastCalledWith(
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
      false,
      "ball-turret",
      expect.anything(),
      expect.anything(),
      false,
      undefined,
    );
  });

  it("renderiza joystick touch da torreta fora do playfield", () => {
    const { container } = render(
      <Game onScoreUpdate={jest.fn()} gameMode="ball-turret" />,
    );

    const joystick = screen.getByTestId(BALL_TURRET_JOYSTICK_TEST_ID);
    const playfield = container.querySelector(".game-board-playfield");
    const inputLayout = container.querySelector(".game-board-input-layout");

    expect(joystick).toBeInTheDocument();
    expect(joystick).toHaveAttribute("aria-label", BALL_TURRET_JOYSTICK_LABEL);
    expect(joystick).toHaveClass("game-turret-joystick");
    expect(joystick).toHaveClass("game-turret-trackball");
    expect(playfield).not.toContainElement(joystick);
    expect(inputLayout).toContainElement(joystick);
  });


  it("renderiza trilhas diagnósticas do joystick e da cama elástica quando ligadas", () => {
    render(
      <Game
        onScoreUpdate={jest.fn()}
        gameMode="ball-turret"
        joystickDiagnosticsEnabled
        joystickDiagnosticSamples={[
          {
            sequence: 1,
            timestamp: 1782870000000,
            phase: "move",
            inputType: "pointer",
            accepted: true,
            clientPoint: { x: 150, y: 300 },
            joystick: {
              rect: { x: 100, y: 200, width: 100, height: 100 },
              normalized: { x: 0.5, y: 1 },
              visual: { x: 0, y: 1 },
              radius: 50,
              distanceFromCenter: 50,
            },
            canvas: {
              rect: { x: 20, y: 40, width: 400, height: 300 },
              size: { width: 800, height: 600 },
              mappedClientPoint: { x: 220, y: 340 },
              mappedCanvasPoint: { x: 400, y: 600 },
            },
            paddle: {
              x: 360,
              y: 520,
              width: 80,
              height: 12,
              radial: { centerAngle: 1.57 },
            },
          },
          {
            sequence: 2,
            timestamp: 1782870000100,
            phase: "move",
            inputType: "pointer",
            accepted: false,
            reason: "outside-joystick-circle",
            clientPoint: { x: 90, y: 310 },
            joystick: {
              rect: { x: 100, y: 200, width: 100, height: 100 },
              normalized: { x: -0.1, y: 1.1 },
              visual: { x: -1.2, y: 1.2 },
              radius: 50,
              distanceFromCenter: 72,
            },
            canvas: {
              rect: { x: 20, y: 40, width: 400, height: 300 },
              size: { width: 800, height: 600 },
              mappedClientPoint: { x: -20, y: 370 },
              mappedCanvasPoint: { x: -80, y: 660 },
            },
            paddle: null,
          },
        ]}
      />,
    );

    const joystickLayer = screen.getByTestId("joystick-diagnostic-joystick-layer");
    const playfieldLayer = screen.getByTestId("joystick-diagnostic-playfield-layer");

    expect(joystickLayer).toBeInTheDocument();
    expect(playfieldLayer).toBeInTheDocument();
    expect(
      joystickLayer.querySelector(".joystick-diagnostic-layer__point--rejected"),
    ).toBeInTheDocument();
    expect(
      playfieldLayer.querySelector(".joystick-diagnostic-layer__point--rejected"),
    ).toBeInTheDocument();
  });

  it("não renderiza trilhas diagnósticas quando o registro está desligado", () => {
    render(
      <Game
        onScoreUpdate={jest.fn()}
        gameMode="ball-turret"
        joystickDiagnosticsEnabled={false}
        joystickDiagnosticSamples={[]}
      />,
    );

    expect(
      screen.queryByTestId("joystick-diagnostic-joystick-layer"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("joystick-diagnostic-playfield-layer"),
    ).not.toBeInTheDocument();
  });

  it("não renderiza joystick no modo clássico", () => {
    render(<Game onScoreUpdate={jest.fn()} />);

    expect(
      screen.queryByTestId(BALL_TURRET_JOYSTICK_TEST_ID),
    ).not.toBeInTheDocument();
  });

  it("renderiza faixa sensível invisível sobre a linha da raquete", () => {
    render(<Game onScoreUpdate={jest.fn()} />);

    const touchZone = screen.getByTestId("paddle-touch-zone");

    expect(touchZone).toBeInTheDocument();
    expect(touchZone).toHaveAttribute("aria-hidden", "true");
    expect(touchZone.style.height).toBe(EXPECTED_PADDLE_TOUCH_ZONE_HEIGHT);
    expect(touchZone.style.top).toContain(
      EXPECTED_PADDLE_TOUCH_ZONE_TOP_OFFSET,
    );
    expect(touchZone.style.transform).toBe(
      EXPECTED_PADDLE_TOUCH_ZONE_TRANSFORM,
    );
    expect(touchZone).toHaveClass("game-paddle-touch-zone");
  });

  it("publica o retângulo real do canvas para efeitos visuais", () => {
    const onBoardRectChange = jest.fn();

    render(
      <Game onScoreUpdate={jest.fn()} onBoardRectChange={onBoardRectChange} />,
    );

    expect(onBoardRectChange).toHaveBeenCalledWith({
      x: TEST_BOARD_RECT.x,
      y: TEST_BOARD_RECT.y,
      width: TEST_BOARD_RECT.width,
      height: TEST_BOARD_RECT.height,
    });
  });

  it("aguarda o tamanho responsivo antes de publicar o retângulo inicial", () => {
    (
      HTMLCanvasElement.prototype.getBoundingClientRect as jest.Mock
    ).mockImplementation(function readSizedCanvasRect(this: HTMLCanvasElement) {
      return {
        x: TEST_BOARD_RECT.x,
        y: TEST_BOARD_RECT.y,
        width: this.width,
        height: this.height,
        bottom: TEST_BOARD_RECT.y + this.height,
        left: TEST_BOARD_RECT.x,
        right: TEST_BOARD_RECT.x + this.width,
        top: TEST_BOARD_RECT.y,
        toJSON: jest.fn(),
      } as unknown as DOMRect;
    });
    const onBoardRectChange = jest.fn();

    render(
      <Game onScoreUpdate={jest.fn()} onBoardRectChange={onBoardRectChange} />,
    );

    expect(onBoardRectChange).not.toHaveBeenCalledWith({
      x: TEST_BOARD_RECT.x,
      y: TEST_BOARD_RECT.y,
      width: 480,
      height: 320,
    });
    expect(onBoardRectChange).toHaveBeenLastCalledWith({
      x: TEST_BOARD_RECT.x,
      y: TEST_BOARD_RECT.y,
      width: 320,
      height: 240,
    });
  });
});
