// src/objects/Bricks.test.ts
import { Bricks } from "./Bricks";
import type { DynamicGameDimensions } from "../constants/game";

jest.mock("../storage/gameLogger", () => ({
  gameLogger: {
    logBrickDestroyed: jest.fn().mockResolvedValue(undefined),
    logCollision: jest.fn().mockResolvedValue(undefined),
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

const BASIC_BRICK_RANDOM_VALUES = [0, 0, 0, 0, 0, 0, 0];
const FIRST_BRICK_METAL_RANDOM_VALUES = [
  0, 0, 0, 0, 0, 0, 0.25, 0.99, 0.99, 0.99, 0.99, 0.99,
];
const BRICK_TOUCH_Y = 40;
const BRICK_SEPARATION_Y = 0;

function createRandom(values: number[]) {
  let index = 0;
  return () => values[index++] ?? 0;
}

function createBall() {
  return {
    position: { x: 40, y: BRICK_TOUCH_Y, radius: 5 },
    bounceY: jest.fn(),
    registerBrickHit: jest.fn(),
    getVelocity: jest.fn(() => ({ dx: 0, dy: -2 })),
    getSpeedStateSnapshot: jest.fn(() => ({
      level: 1,
      initialBrickCount: 6,
      successfulBrickHits: 0,
      initialSpawnSpeed: 2,
      maxSpeed: 2,
      minSpeed: 1,
      currentSpeed: 2,
      reductionPerBrick: 0.1,
      previousLevelMaxSpeed: 2,
      levelStartedAt: 0,
      elapsedLevelMs: 0,
      minReached: false,
    })),
    getLastSpeedReduction: jest.fn(() => null),
  };
}

async function separateAndTouchBrick(
  bricks: Bricks,
  ball: ReturnType<typeof createBall>,
) {
  ball.position.y = BRICK_SEPARATION_Y;
  await bricks.collide(ball);
  ball.position.y = BRICK_TOUCH_Y;
  return bricks.collide(ball);
}

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

  it("destrói bloco comum no primeiro toque", async () => {
    const onBrickDestroyed = jest.fn();
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      onBrickDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
    );
    const ball = createBall();

    await bricks.collide(ball);

    expect(bricks.isBrickActive(0, 0)).toBe(false);
    expect(ball.bounceY).toHaveBeenCalledTimes(1);
    expect(ball.registerBrickHit).toHaveBeenCalledTimes(1);
    expect(onBrickDestroyed).toHaveBeenCalledTimes(1);
  });

  it("mantém bloco metálico ativo até o terceiro toque", async () => {
    const onBrickDestroyed = jest.fn();
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      onBrickDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_BRICK_METAL_RANDOM_VALUES),
    );
    const ball = createBall();

    expect(bricks.isBrickMetal(0, 0)).toBe(true);
    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(3);

    await bricks.collide(ball);

    expect(bricks.isBrickActive(0, 0)).toBe(true);
    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(2);
    expect(ball.registerBrickHit).not.toHaveBeenCalled();
    expect(onBrickDestroyed).not.toHaveBeenCalled();
    expect(bricks.isAllDestroyed()).toBe(false);

    await bricks.collide(ball);

    expect(bricks.isBrickActive(0, 0)).toBe(true);
    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(2);
    expect(ball.bounceY).toHaveBeenCalledTimes(1);
    expect(ball.registerBrickHit).not.toHaveBeenCalled();
    expect(onBrickDestroyed).not.toHaveBeenCalled();

    await separateAndTouchBrick(bricks, ball);

    expect(bricks.isBrickActive(0, 0)).toBe(true);
    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(1);
    expect(ball.registerBrickHit).not.toHaveBeenCalled();
    expect(onBrickDestroyed).not.toHaveBeenCalled();

    await separateAndTouchBrick(bricks, ball);

    expect(bricks.isBrickActive(0, 0)).toBe(false);
    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(0);
    expect(ball.bounceY).toHaveBeenCalledTimes(3);
    expect(ball.registerBrickHit).toHaveBeenCalledTimes(1);
    expect(onBrickDestroyed).toHaveBeenCalledTimes(1);
  });
});
