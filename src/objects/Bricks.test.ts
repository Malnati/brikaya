// src/objects/Bricks.test.ts
import { Bricks } from "./Bricks";
import type { DynamicGameDimensions } from "../constants/game";

jest.mock("../storage/gameLogger", () => ({
  gameLogger: {
    logBrickDestroyed: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../utils/collisionTracker", () => ({
  collisionTracker: {
    logBrickCollision: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../utils/logger", () => ({
  ERROR: jest.fn(),
  LOG: jest.fn(),
  WARN: jest.fn(),
}));

const TEST_DIMENSIONS: DynamicGameDimensions = {
  brickWidth: 50,
  brickHeight: 20,
  brickPadding: 10,
  brickOffsetTop: 30,
  brickOffsetLeft: 15,
  brickRows: 2,
  brickCols: 3,
  paddleWidth: 75,
  paddleHeight: 10,
  ballRadius: 8,
};
const FOUR_BRICK_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  brickRows: 2,
  brickCols: 2,
};

describe("Bricks laser fan helpers", () => {
  it("destrói todos os blocos ativos e retorna snapshots determinísticos", () => {
    const bricks = new Bricks(TEST_DIMENSIONS);

    const destroyed = bricks.destroyAllActive();

    expect(destroyed).toHaveLength(6);
    expect(destroyed[0]).toEqual({
      col: 0,
      row: 0,
      colorIndex: expect.any(Number),
      x: 15,
      y: 30,
      width: 50,
      height: 20,
    });
    expect(bricks.isAllDestroyed()).toBe(true);
  });

  it("retorna lista vazia quando todos os blocos já foram destruídos", () => {
    const bricks = new Bricks(TEST_DIMENSIONS);

    bricks.destroyAllActive();

    expect(bricks.destroyAllActive()).toEqual([]);
  });

  it("seleciona cinco blocos aleatórios sem destruir antes da resolução", () => {
    const bricks = new Bricks(TEST_DIMENSIONS);

    const selected = bricks.selectRandomActive(5);

    expect(selected).toHaveLength(5);
    expect(bricks.isAllDestroyed()).toBe(false);
    expect(bricks.destroySelectedActive(selected)).toHaveLength(5);
    expect(bricks.destroySelectedActive(selected)).toEqual([]);
    expect(bricks.isAllDestroyed()).toBe(false);
  });

  it("retorna todos os blocos ativos quando restam menos de cinco", () => {
    const bricks = new Bricks(FOUR_BRICK_DIMENSIONS);

    const selected = bricks.selectRandomActive(5);

    expect(selected).toHaveLength(4);
    expect(bricks.destroySelectedActive(selected)).toHaveLength(4);
    expect(bricks.isAllDestroyed()).toBe(true);
  });

  it("usa escolha aleatória sem repetir blocos selecionados", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
    const bricks = new Bricks(TEST_DIMENSIONS);

    const selected = bricks.selectRandomActive(5);
    const coordinates = selected.map((brick) => `${brick.col}:${brick.row}`);

    expect(new Set(coordinates).size).toBe(5);
    expect(coordinates).not.toEqual(["0:0", "0:1", "1:0", "1:1", "2:0"]);

    randomSpy.mockRestore();
  });
});
