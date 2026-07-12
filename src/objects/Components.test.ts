// src/objects/Components.test.ts
import { Components } from "./Components";
import type { DynamicGameDimensions } from "../constants/game";
import { GAME_VISUAL_ASSET_ROLES } from "../utils/visualAssetResolver";
import { AssetLoader } from "../utils/assetLoader";
import {
  calculateRadialComponentSegment,
  calculateRadialPlayfieldGeometry,
} from "../utils/radialGeometry";
import { getComponentTerminalRatios } from "../constants/componentTerminals";
import * as electricComponentEnergyRenderer from "../logic/rendering/electricComponentEnergyRenderer";

jest.mock("../storage/gameLogger", () => ({
  gameLogger: {
    logComponentDestroyed: jest.fn().mockResolvedValue(undefined),
    logCollision: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../utils/collisionTracker", () => ({
  collisionTracker: {
    logComponentCollision: jest.fn().mockResolvedValue(undefined),
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
const FIRST_COMPONENT_METAL_RANDOM_VALUES = [
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
    registerComponentHit: jest.fn(),
    getVelocity: jest.fn(() => ({ dx: 0, dy: -2 })),
    getSpeedStateSnapshot: jest.fn(() => ({
      level: 1,
      initialComponentCount: 6,
      successfulComponentHits: 0,
      initialSpawnSpeed: 2,
      maxSpeed: 2,
      minSpeed: 1,
      currentSpeed: 2,
      reductionPerComponent: 0.1,
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

async function separateAndTouchComponent(
  components: Components,
  ball: ReturnType<typeof createBall>,
) {
  ball.position.y = BRICK_SEPARATION_Y;
  await components.collide(ball);
  ball.position.y = BRICK_TOUCH_Y;
  return components.collide(ball);
}

const TEST_DIMENSIONS: DynamicGameDimensions = {
  componentWidth: 50,
  componentHeight: 20,
  componentPadding: 10,
  componentOffsetTop: 30,
  componentOffsetLeft: 15,
  componentRows: 2,
  componentCols: 3,
  paddleWidth: 75,
  paddleHeight: 10,
  ballRadius: 8,
};
const FOUR_BRICK_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  componentRows: 2,
  componentCols: 2,
};
const THREE_BRICK_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  componentRows: 3,
  componentCols: 1,
};
const ONE_BRICK_DIMENSIONS: DynamicGameDimensions = {
  ...TEST_DIMENSIONS,
  componentRows: 1,
  componentCols: 1,
};

describe("Components laser fan helpers", () => {
  it("destrói todos os blocos ativos e retorna snapshots determinísticos", () => {
    const components = new Components(TEST_DIMENSIONS);

    const destroyed = components.destroyAllActive();

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
    expect(components.isAllDestroyed()).toBe(true);
  });

  it("retorna lista vazia quando todos os blocos já foram destruídos", () => {
    const components = new Components(TEST_DIMENSIONS);

    components.destroyAllActive();

    expect(components.destroyAllActive()).toEqual([]);
  });

  it("seleciona cinco blocos aleatórios sem destruir antes da resolução", () => {
    const components = new Components(TEST_DIMENSIONS);

    const selected = components.selectRandomActive(5);

    expect(selected).toHaveLength(5);
    expect(components.isAllDestroyed()).toBe(false);
    expect(components.destroySelectedActive(selected)).toHaveLength(5);
    expect(components.destroySelectedActive(selected)).toEqual([]);
    expect(components.isAllDestroyed()).toBe(false);
  });

  it("retorna todos os blocos ativos quando restam menos de cinco", () => {
    const components = new Components(FOUR_BRICK_DIMENSIONS);

    const selected = components.selectRandomActive(5);

    expect(selected).toHaveLength(4);
    expect(components.destroySelectedActive(selected)).toHaveLength(4);
    expect(components.isAllDestroyed()).toBe(true);
  });

  it("usa escolha aleatória sem repetir blocos selecionados", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
    const components = new Components(TEST_DIMENSIONS);

    const selected = components.selectRandomActive(5);
    const coordinates = selected.map((component) => `${component.col}:${component.row}`);

    expect(new Set(coordinates).size).toBe(5);
    expect(coordinates).not.toEqual(["0:0", "0:1", "1:0", "1:1", "2:0"]);

    randomSpy.mockRestore();
  });

  it("destrói bloco comum no primeiro toque", async () => {
    const onComponentDestroyed = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      onComponentDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
    );
    const ball = createBall();

    await components.collide(ball);

    expect(components.isComponentActive(0, 0)).toBe(false);
    expect(ball.bounceY).toHaveBeenCalledTimes(1);
    expect(ball.registerComponentHit).toHaveBeenCalledTimes(1);
    expect(onComponentDestroyed).toHaveBeenCalledTimes(1);
  });

  it("emite corrente elétrica do impacto para os dois terminais do componente retangular", async () => {
    const onElectricImpact = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      undefined,
      onElectricImpact,
    );
    const ball = createBall();

    await components.collide(ball);

    expect(onElectricImpact).toHaveBeenCalledTimes(1);
    expect(onElectricImpact).toHaveBeenCalledWith({
      kind: "component",
      origin: { x: 40, y: BRICK_TOUCH_Y },
      endpoints: [
        { x: TEST_DIMENSIONS.componentOffsetLeft, y: BRICK_TOUCH_Y },
        {
          x: TEST_DIMENSIONS.componentOffsetLeft + TEST_DIMENSIONS.componentWidth,
          y: BRICK_TOUCH_Y,
        },
      ],
      bounds: {
        x: TEST_DIMENSIONS.componentOffsetLeft,
        y: TEST_DIMENSIONS.componentOffsetTop,
        width: TEST_DIMENSIONS.componentWidth,
        height: TEST_DIMENSIONS.componentHeight,
      },
    });
  });

  it("usa segmento radial para colisão quando a arena circular está ativa", async () => {
    const geometry = calculateRadialPlayfieldGeometry(480, 480, TEST_DIMENSIONS);
    const segment = calculateRadialComponentSegment(geometry, TEST_DIMENSIONS, 0, 0);
    const onComponentDestroyed = jest.fn();
    const radialBounce = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      onComponentDestroyed,
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
      bounceFromRadialComponent: radialBounce,
    };

    await components.collide(ball);

    expect(components.isComponentActive(0, 0)).toBe(false);
    expect(radialBounce).toHaveBeenCalledWith(segment.centerX, segment.centerY);
    expect(ball.bounceY).not.toHaveBeenCalled();
    expect(onComponentDestroyed).toHaveBeenCalledTimes(1);
  });

  it("emite corrente elétrica para os terminais tangenciais do componente radial", async () => {
    const geometry = calculateRadialPlayfieldGeometry(480, 480, TEST_DIMENSIONS);
    const segment = calculateRadialComponentSegment(geometry, TEST_DIMENSIONS, 0, 0);
    const onElectricImpact = jest.fn();
    const radialBounce = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      geometry,
      onElectricImpact,
    );
    const ball = {
      ...createBall(),
      position: {
        x: segment.centerX,
        y: segment.centerY,
        radius: TEST_DIMENSIONS.ballRadius,
      },
      bounceFromRadialComponent: radialBounce,
    };

    await components.collide(ball);

    expect(onElectricImpact).toHaveBeenCalledTimes(1);
    const impact = onElectricImpact.mock.calls[0][0];
    expect(impact.kind).toBe("component");
    expect(impact.origin).toEqual({ x: segment.centerX, y: segment.centerY });
    expect(impact.endpoints).toHaveLength(2);
    expect(impact.endpoints[0]).not.toEqual(impact.endpoints[1]);
    expect(
      Math.hypot(
        impact.endpoints[0].x - segment.centerX,
        impact.endpoints[0].y - segment.centerY,
      ),
    ).toBeGreaterThan(0);
    expect(
      Math.hypot(
        impact.endpoints[1].x - segment.centerX,
        impact.endpoints[1].y - segment.centerY,
      ),
    ).toBeGreaterThan(0);
  });

  it("inclina componentes radiais pela tangente do aro sem recorte de célula", () => {
    const geometry = calculateRadialPlayfieldGeometry(480, 480, TEST_DIMENSIONS);
    const segment = calculateRadialComponentSegment(geometry, TEST_DIMENSIONS, 0, 0);
    const angularWidth = Math.abs(segment.endAngle - segment.startAngle);
    const tangentSpan = segment.centerRadius * angularWidth;
    const radialSpan = segment.outerRadius - segment.innerRadius;
    const expectedWidth =
      Math.max(1, Math.min(segment.bounds.width, tangentSpan)) *
      RADIAL_COMPONENT_WIDTH_RATIO;
    const expectedHeight =
      Math.max(1, radialSpan) * RADIAL_COMPONENT_HEIGHT_RATIO;
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      geometry,
    );
    const ctx = createRadialCanvasContext();

    components.draw(ctx);

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
    const firstSegment = calculateRadialComponentSegment(
      geometry,
      TEST_DIMENSIONS,
      0,
      0,
    );
    const secondSegment = calculateRadialComponentSegment(
      geometry,
      TEST_DIMENSIONS,
      1,
      0,
    );
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
      geometry,
    );
    const ctx = createRadialCanvasContext();
    const angularWidth = Math.abs(firstSegment.endAngle - firstSegment.startAngle);
    const tangentSpan = firstSegment.centerRadius * angularWidth;
    const expectedWidth =
      Math.max(1, Math.min(firstSegment.bounds.width, tangentSpan)) *
      RADIAL_COMPONENT_WIDTH_RATIO;
    const capacitorTerminals = getComponentTerminalRatios(
      GAME_VISUAL_ASSET_ROLES.componentPurple,
    );
    const transistorTerminals = getComponentTerminalRatios(
      GAME_VISUAL_ASSET_ROLES.componentBlue,
    );
    const expectedRightOffset =
      (capacitorTerminals.right - 0.5) * expectedWidth;
    const expectedLeftOffset =
      (transistorTerminals.left - 0.5) * expectedWidth;
    const edgeOffset = expectedWidth / 2;

    components.draw(ctx);

    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(
      TEST_DIMENSIONS.componentRows * (TEST_DIMENSIONS.componentCols - 1),
    );
    const firstTraceStart = (ctx.moveTo as jest.Mock).mock.calls[0];
    const firstTraceEnd = (ctx.lineTo as jest.Mock).mock.calls[0];
    const firstTraceStartDistance = Math.hypot(
      firstTraceStart[0] - firstSegment.centerX,
      firstTraceStart[1] - firstSegment.centerY,
    );
    const firstTraceEndDistance = Math.hypot(
      firstTraceEnd[0] - secondSegment.centerX,
      firstTraceEnd[1] - secondSegment.centerY,
    );
    expect(firstTraceStartDistance).toBeGreaterThan(0);
    expect(firstTraceEndDistance).toBeGreaterThan(0);
    expect(firstTraceStartDistance).toBeLessThan(edgeOffset);
    expect(firstTraceEndDistance).toBeLessThan(edgeOffset);
    expect(Math.abs(firstTraceStartDistance - Math.abs(expectedRightOffset))).toBeLessThan(
      edgeOffset * 0.3,
    );
    expect(Math.abs(firstTraceEndDistance - Math.abs(expectedLeftOffset))).toBeLessThan(
      edgeOffset * 0.3,
    );
    expect(
      (ctx.stroke as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan((ctx.drawImage as jest.Mock).mock.invocationCallOrder[0]);
  });

  it("mantém bloco metálico ativo até o terceiro toque", async () => {
    const onComponentDestroyed = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      onComponentDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_COMPONENT_METAL_RANDOM_VALUES),
    );
    const ball = createBall();

    expect(components.isComponentMetal(0, 0)).toBe(true);
    expect(components.getComponentHitsRemaining(0, 0)).toBe(3);

    await components.collide(ball);

    expect(components.isComponentActive(0, 0)).toBe(true);
    expect(components.getComponentHitsRemaining(0, 0)).toBe(2);
    expect(ball.registerComponentHit).not.toHaveBeenCalled();
    expect(onComponentDestroyed).not.toHaveBeenCalled();
    expect(components.isAllDestroyed()).toBe(false);

    await components.collide(ball);

    expect(components.isComponentActive(0, 0)).toBe(true);
    expect(components.getComponentHitsRemaining(0, 0)).toBe(2);
    expect(ball.bounceY).toHaveBeenCalledTimes(1);
    expect(ball.registerComponentHit).not.toHaveBeenCalled();
    expect(onComponentDestroyed).not.toHaveBeenCalled();

    await separateAndTouchComponent(components, ball);

    expect(components.isComponentActive(0, 0)).toBe(true);
    expect(components.getComponentHitsRemaining(0, 0)).toBe(1);
    expect(ball.registerComponentHit).not.toHaveBeenCalled();
    expect(onComponentDestroyed).not.toHaveBeenCalled();

    await separateAndTouchComponent(components, ball);

    expect(components.isComponentActive(0, 0)).toBe(false);
    expect(components.getComponentHitsRemaining(0, 0)).toBe(0);
    expect(ball.bounceY).toHaveBeenCalledTimes(3);
    expect(ball.registerComponentHit).toHaveBeenCalledTimes(1);
    expect(onComponentDestroyed).toHaveBeenCalledTimes(1);
  });

  it("emite corrente em bloco metálico sem repetir enquanto a bolinha ainda toca o mesmo componente", async () => {
    const onElectricImpact = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_COMPONENT_METAL_RANDOM_VALUES),
      undefined,
      onElectricImpact,
    );
    const ball = createBall();

    await components.collide(ball);
    await components.collide(ball);

    expect(components.isComponentActive(0, 0)).toBe(true);
    expect(onElectricImpact).toHaveBeenCalledTimes(1);

    await separateAndTouchComponent(components, ball);

    expect(onElectricImpact).toHaveBeenCalledTimes(2);
  });

  it("amolda apenas o bloco metálico atingido a cada colisão", async () => {
    const resolveAssetPath = jest.fn((role: string) => `/assets/${role}.svg`);
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      resolveAssetPath,
      createRandom(FIRST_TWO_BRICKS_METAL_RANDOM_VALUES),
    );
    const ball = createBall();

    components.draw(createCanvasContext());

    expect(components.isComponentMetal(0, 0)).toBe(true);
    expect(components.isComponentMetal(0, 1)).toBe(true);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalIntact,
    );

    resolveAssetPath.mockClear();
    await components.collide(ball);
    components.draw(createCanvasContext());

    expect(components.getComponentHitsRemaining(0, 0)).toBe(2);
    expect(components.getComponentHitsRemaining(0, 1)).toBe(3);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalDentedOne,
    );
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalIntact,
    );
    expect(resolveAssetPath).not.toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalDentedTwo,
    );

    resolveAssetPath.mockClear();
    await separateAndTouchComponent(components, ball);
    components.draw(createCanvasContext());

    expect(components.getComponentHitsRemaining(0, 0)).toBe(1);
    expect(components.getComponentHitsRemaining(0, 1)).toBe(3);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalDentedTwo,
    );
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalIntact,
    );
    expect(components.isComponentActive(0, 1)).toBe(true);

    ball.position.y = BRICK_SEPARATION_Y;
    await components.collide(ball);
    ball.position.y = SECOND_ROW_BRICK_TOUCH_Y;
    await components.collide(ball);
    resolveAssetPath.mockClear();
    components.draw(createCanvasContext());

    expect(components.getComponentHitsRemaining(0, 1)).toBe(2);
    expect(resolveAssetPath).toHaveBeenCalledWith(
      GAME_VISUAL_ASSET_ROLES.componentMetalDentedOne,
    );
  });

  it("marca três blocos desviantes aleatórios por grade", () => {
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES),
    );

    expect(components.getEvasiveComponentSnapshots()).toEqual([
      expect.objectContaining({ col: 0, row: 0 }),
      expect.objectContaining({ col: 0, row: 1 }),
      expect.objectContaining({ col: 1, row: 0 }),
    ]);
    expect(components.isComponentEvasive(-1, 0)).toBe(false);
    expect(components.hasComponentEvaded(0, 99)).toBe(false);
  });

  it("reserva três blocos desviantes mesmo quando o sorteio tentaria metalizar a grade inteira", () => {
    const components = new Components(
      THREE_BRICK_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(THREE_BRICKS_FORCE_METAL_RANDOM_VALUES),
    );

    expect(components.getEvasiveComponentSnapshots()).toHaveLength(3);
    expect(components.isComponentEvasive(0, 0)).toBe(true);
    expect(components.isComponentEvasive(0, 1)).toBe(true);
    expect(components.isComponentEvasive(0, 2)).toBe(true);
    expect(components.isComponentMetal(0, 0)).toBe(false);
    expect(components.isComponentMetal(0, 1)).toBe(false);
    expect(components.isComponentMetal(0, 2)).toBe(false);
  });

  it("permite bloco metálico quando a grade não comporta blocos desviantes", () => {
    const components = new Components(
      ONE_BRICK_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom([0, 0.25]),
    );

    expect(components.getEvasiveComponentSnapshots()).toEqual([]);
    expect(components.isComponentMetal(0, 0)).toBe(true);
    expect(components.getComponentHitsRemaining(0, 0)).toBe(3);
  });

  it("faz o bloco desviante rebater sem destruir nem pontuar na primeira colisão", async () => {
    const onComponentDestroyed = jest.fn();
    const components = new Components(
      TEST_DIMENSIONS,
      onComponentDestroyed,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES),
    );
    const ball = createBall();

    expect(components.isComponentEvasive(0, 0)).toBe(true);

    await components.collide(ball);

    expect(components.isComponentActive(0, 0)).toBe(true);
    expect(components.hasComponentEvaded(0, 0)).toBe(true);
    expect(ball.bounceY).toHaveBeenCalledTimes(1);
    expect(ball.registerComponentHit).not.toHaveBeenCalled();
    expect(onComponentDestroyed).not.toHaveBeenCalled();

    await separateAndTouchComponent(components, ball);

    expect(components.isComponentActive(0, 0)).toBe(false);
    expect(ball.bounceY).toHaveBeenCalledTimes(2);
    expect(ball.registerComponentHit).toHaveBeenCalledTimes(1);
    expect(onComponentDestroyed).toHaveBeenCalledTimes(1);
  });

  it("mantém bloco desviante visualmente estável após a evasão", async () => {
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(FIRST_THREE_BRICKS_EVASIVE_RANDOM_VALUES),
    );
    const ball = createBall();
    const ctx = createAnimatedCanvasContext();

    await components.collide(ball);
    components.draw(ctx);

    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.scale).not.toHaveBeenCalled();
    expect(ctx.restore).not.toHaveBeenCalled();
    expect(ctx.globalAlpha).toBe(1);
  });

  it("desenha fallback sólido quando asset do bloco não está disponível", () => {
    (AssetLoader.getOrLoadImage as jest.Mock).mockReturnValueOnce(null);
    const components = new Components(
      TEST_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
    );
    const ctx = createCanvasContext();

    components.draw(ctx);

    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it("usa renderer procedural em vez de drawImage para preset yellow-normal", () => {
    const drawPreviewSpy = jest
      .spyOn(electricComponentEnergyRenderer, "drawComponentEnergyPreview")
      .mockImplementation(() => undefined);
    const presetSpy = jest
      .spyOn(electricComponentEnergyRenderer, "getComponentEnergyPresetId")
      .mockReturnValue("spr-component-basic-yellow-normal");

    const components = new Components(
      ONE_BRICK_DIMENSIONS,
      undefined,
      undefined,
      undefined,
      undefined,
      createRandom(BASIC_BRICK_RANDOM_VALUES),
    );
    const ctx = createAnimatedCanvasContext();

    components.draw(ctx);

    expect(drawPreviewSpy).toHaveBeenCalled();
    expect(ctx.drawImage).not.toHaveBeenCalled();

    drawPreviewSpy.mockRestore();
    presetSpy.mockRestore();
  });
});
