// src/objects/Bricks.test.ts
import { Bricks } from "./Bricks";
import type { DynamicGameDimensions } from "../constants/game";
import { GAME_VISUAL_ASSET_ROLES } from "../utils/visualAssetResolver";
import { AssetLoader } from "../utils/assetLoader";
import {
  calculateRadialBrickSegment,
  calculateRadialPlayfieldGeometry,
} from "../utils/radialGeometry";

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

jest.mock("../utils/assetLoader", () => ({
  AssetLoader: {
    getOrLoadImage: jest.fn(() => ({})),
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
const FIRST_TWO_BRICKS_METAL_RANDOM_VALUES = [
  0, 0, 0, 0, 0, 0, 0.5, 0.99, 0.99, 0.99, 0.99, 0.99,
];
const FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES = [
  0, 0, 0, 0, 0, 0, 0, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99, 0.99,
  0.99,
];
const THREE_BRICKS_FORCE_METAL_RANDOM_VALUES = [0, 0, 0, 0.99, 0, 0, 0, 0];
const BRICK_TOUCH_Y = 40;
const SECOND_ROW_BRICK_TOUCH_Y = 70;
const BRICK_SEPARATION_Y = 0;
const RADIAL_COMPONENT_WIDTH_RATIO = 1.72;
const RADIAL_COMPONENT_HEIGHT_RATIO = 1.44;

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

function createCanvasContext() {
  return {
    drawImage: jest.fn(),
    fillRect: jest.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function createAnimatedCanvasContext() {
  return {
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

function createRadialCanvasContext() {
  return {
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    clip: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
  } as unknown as CanvasRenderingContext2D;
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
const THREE_BRICK_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  brickRows: 3,
  brickCols: 1,
};
const ONE_BRICK_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  brickRows: 1,
  brickCols: 1,
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

  it("usa segmento radial para colisão quando a arena circular está ativa", async () => {
    const geometry = calculateRadialPlayfieldGeometry(480, 480, TEST_DIMENSIONS);
    const segment = calculateRadialBrickSegment(geometry, TEST_DIMENSIONS, 0, 0);
    const onBrickDestroyed = jest.fn();
    const radialBounce = jest.fn();
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      onBrickDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      geometry,
    );
    const ball = {
      ...createBall(),
      position: {
        x: segment.centerX,
        y: segment.centerY,
        radius: TEST_DIMENSIONS.ballRadius,
      },
      bounceFromRadialBrick: radialBounce,
    };

    await bricks.collide(ball);

    expect(bricks.isBrickActive(0, 0)).toBe(false);
    expect(radialBounce).toHaveBeenCalledWith(segment.centerX, segment.centerY);
    expect(ball.bounceY).not.toHaveBeenCalled();
    expect(onBrickDestroyed).toHaveBeenCalledTimes(1);
  });

  it("inclina componentes radiais pela tangente do aro sem recorte de célula", () => {
    const geometry = calculateRadialPlayfieldGeometry(480, 480, TEST_DIMENSIONS);
    const segment = calculateRadialBrickSegment(geometry, TEST_DIMENSIONS, 0, 0);
    const angularWidth = Math.abs(segment.endAngle - segment.startAngle);
    const tangentSpan = segment.centerRadius * angularWidth;
    const radialSpan = segment.outerRadius - segment.innerRadius;
    const expectedWidth =
      Math.max(1, Math.min(segment.bounds.width, tangentSpan)) *
      RADIAL_COMPONENT_WIDTH_RATIO;
    const expectedHeight =
      Math.max(1, radialSpan) * RADIAL_COMPONENT_HEIGHT_RATIO;
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      geometry,
    );
    const ctx = createRadialCanvasContext();

    bricks.draw(ctx);

    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalledWith(
      segment.centerX,
      segment.centerY,
    );
    expect(ctx.rotate).toHaveBeenCalledWith(segment.centerAngle + Math.PI / 2);
    expect(ctx.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      -expectedWidth / 2,
      -expectedHeight / 2,
      expectedWidth,
      expectedHeight,
    );
    expect(expectedWidth).toBeGreaterThan(segment.bounds.width);
    expect(expectedHeight).toBeGreaterThan(radialSpan);
    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.clip).not.toHaveBeenCalled();
  });

  it("desenha trilhas de circuito dos aros antes dos componentes", () => {
    const geometry = calculateRadialPlayfieldGeometry(480, 480, TEST_DIMENSIONS);
    const firstSegment = calculateRadialBrickSegment(
      geometry,
      TEST_DIMENSIONS,
      0,
      0,
    );
    const secondSegment = calculateRadialBrickSegment(
      geometry,
      TEST_DIMENSIONS,
      1,
      0,
    );
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      geometry,
    );
    const ctx = createRadialCanvasContext();

    bricks.draw(ctx);

    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(
      TEST_DIMENSIONS.brickRows * (TEST_DIMENSIONS.brickCols - 1),
    );
    const firstTraceStart = (ctx.moveTo as jest.Mock).mock.calls[0];
    const firstTraceEnd = (ctx.lineTo as jest.Mock).mock.calls[0];
    expect(
      Math.hypot(
        firstTraceStart[0] - firstSegment.centerX,
        firstTraceStart[1] - firstSegment.centerY,
      ),
    ).toBeGreaterThan(0);
    expect(
      Math.hypot(
        firstTraceEnd[0] - secondSegment.centerX,
        firstTraceEnd[1] - secondSegment.centerY,
      ),
    ).toBeGreaterThan(0);
    expect(
      (ctx.stroke as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan((ctx.drawImage as jest.Mock).mock.invocationCallOrder[0]);
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

  it("amolda apenas o bloco metálico atingido a cada colisão", async () => {
    const resolveAssetPath = jest.fn((role: string) => `/assets/${role}.svg`);
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      resolveAssetPath,
      createRandom(FIRST_TWO_BRICKS_METAL_RANDOM_VALUES),
    );
    const ball = createBall();

    bricks.draw(createCanvasContext());

    expect(bricks.isBrickMetal(0, 0)).toBe(true);
    expect(bricks.isBrickMetal(0, 1)).toBe(true);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalIntact,
    );

    resolveAssetPath.mockClear();
    await bricks.collide(ball);
    bricks.draw(createCanvasContext());

    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(2);
    expect(bricks.getBrickHitsRemaining(0, 1)).toBe(3);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalDentedOne,
    );
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalIntact,
    );
    expect(resolveAssetPath).not.toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalDentedTwo,
    );

    resolveAssetPath.mockClear();
    await separateAndTouchBrick(bricks, ball);
    bricks.draw(createCanvasContext());

    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(1);
    expect(bricks.getBrickHitsRemaining(0, 1)).toBe(3);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalDentedTwo,
    );
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalIntact,
    );
    expect(bricks.isBrickActive(0, 1)).toBe(true);

    ball.position.y = BRICK_SEPARATION_Y;
    await bricks.collide(ball);
    ball.position.y = SECOND_ROW_BRICK_TOUCH_Y;
    await bricks.collide(ball);
    resolveAssetPath.mockClear();
    bricks.draw(createCanvasContext());

    expect(bricks.getBrickHitsRemaining(0, 1)).toBe(2);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.brickMetalDentedOne,
    );
  });

  it("marca três blocos desviantes aleatórios por grade", () => {
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES),
    );

    expect(bricks.getEvasiveBrickSnapshots()).toEqual([
      expect.objectContaining({ col: 0, row: 0 }),
      expect.objectContaining({ col: 0, row: 1 }),
      expect.objectContaining({ col: 1, row: 0 }),
    ]);
    expect(bricks.isBrickEvasive(-1, 0)).toBe(false);
    expect(bricks.hasBrickEvaded(0, 99)).toBe(false);
  });

  it("reserva três blocos desviantes mesmo quando o sorteio tentaria metalizar a grade inteira", () => {
    const bricks = new Bricks(
      THREE_BRICK_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(THREE_BRICKS_FORCE_METAL_RANDOM_VALUES),
    );

    expect(bricks.getEvasiveBrickSnapshots()).toHaveLength(3);
    expect(bricks.isBrickEvasive(0, 0)).toBe(true);
    expect(bricks.isBrickEvasive(0, 1)).toBe(true);
    expect(bricks.isBrickEvasive(0, 2)).toBe(true);
    expect(bricks.isBrickMetal(0, 0)).toBe(false);
    expect(bricks.isBrickMetal(0, 1)).toBe(false);
    expect(bricks.isBrickMetal(0, 2)).toBe(false);
  });

  it("permite bloco metálico quando a grade não comporta blocos desviantes", () => {
    const bricks = new Bricks(
      ONE_BRICK_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom([0, 0.25]),
    );

    expect(bricks.getEvasiveBrickSnapshots()).toEqual([]);
    expect(bricks.isBrickMetal(0, 0)).toBe(true);
    expect(bricks.getBrickHitsRemaining(0, 0)).toBe(3);
  });

  it("faz o bloco desviante rebater sem destruir nem pontuar na primeira colisão", async () => {
    const onBrickDestroyed = jest.fn();
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      onBrickDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES),
    );
    const ball = createBall();

    expect(bricks.isBrickEvasive(0, 0)).toBe(true);

    await bricks.collide(ball);

    expect(bricks.isBrickActive(0, 0)).toBe(true);
    expect(bricks.hasBrickEvaded(0, 0)).toBe(true);
    expect(ball.bounceY).toHaveBeenCalledTimes(1);
    expect(ball.registerBrickHit).not.toHaveBeenCalled();
    expect(onBrickDestroyed).not.toHaveBeenCalled();

    await separateAndTouchBrick(bricks, ball);

    expect(bricks.isBrickActive(0, 0)).toBe(false);
    expect(ball.bounceY).toHaveBeenCalledTimes(2);
    expect(ball.registerBrickHit).toHaveBeenCalledTimes(1);
    expect(onBrickDestroyed).toHaveBeenCalledTimes(1);
  });

  it("mantém bloco desviante visualmente estável após a evasão", async () => {
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES),
    );
    const ball = createBall();
    const ctx = createAnimatedCanvasContext();

    await bricks.collide(ball);
    bricks.draw(ctx);

    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.scale).not.toHaveBeenCalled();
    expect(ctx.restore).not.toHaveBeenCalled();
    expect(ctx.globalAlpha).toBe(1);
  });

  it("desenha fallback sólido quando asset do bloco não está disponível", () => {
    (AssetLoader.getOrLoadImage as jest.Mock).mockReturnValueOnce(null);
    const bricks = new Bricks(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
    );
    const ctx = createCanvasContext();

    bricks.draw(ctx);

    expect(ctx.fillRect).toHaveBeenCalled();
  });
});
