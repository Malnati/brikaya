// src/objects/Bricks.test.ts
import { Bricks } from "./Bricks";
import type { DynamicGameDimensions } from "../constants/game";

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
});
