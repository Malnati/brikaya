import { Paddle } from "./Paddle";
import type { DynamicGameDimensions } from "../constants/game";

jest.mock("../utils/assetLoader", () => ({
  AssetLoader: {
    getOrLoadImage: jest.fn(() => null),
  },
}));

const DIMENSIONS: DynamicGameDimensions = {
  brickWidth: 50,
  brickHeight: 20,
  brickPadding: 8,
  brickOffsetTop: 30,
  brickOffsetLeft: 16,
  brickRows: 2,
  brickCols: 3,
  paddleWidth: 75,
  paddleHeight: 10,
  ballRadius: 8,
};

describe("Paddle", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("move sem agendar telemetria por tecla ou toque", () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout");
    const paddle = new Paddle(393, 852, DIMENSIONS);

    paddle.onKeyDown({ key: "ArrowLeft" } as KeyboardEvent);
    paddle.setPosition(120);
    paddle.setPositionFromPoint(120, 420);

    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });
});
