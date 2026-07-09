import {
  AmbientElectricBackground,
  AMBIENT_ELECTRIC_PRESETS,
  DEFAULT_AMBIENT_ELECTRIC_VARIANT,
  resolveAmbientElectricVariant,
} from "./ambientElectricBackground";
import {
  buildZigzagPoint,
  clampProgress,
  easeCubicOut,
  lightningUnitValue,
  randomEndpointAcrossCircle,
  randomPointInCircle,
} from "./electricLightningRenderer";

describe("electricLightningRenderer", () => {
  it("mantém progresso dentro de 0..1", () => {
    expect(clampProgress(-0.2)).toBe(0);
    expect(clampProgress(1.4)).toBe(1);
    expect(clampProgress(0.5)).toBe(0.5);
  });

  it("gera valores pseudo-aleatórios determinísticos", () => {
    expect(lightningUnitValue(42, 7)).toBe(lightningUnitValue(42, 7));
    expect(lightningUnitValue(42, 7)).toBeGreaterThanOrEqual(0);
    expect(lightningUnitValue(42, 7)).toBeLessThanOrEqual(1);
  });

  it("cria pontos zig-zag entre origem e destino", () => {
    const origin = { x: 100, y: 100 };
    const endpoint = { x: 300, y: 200 };
    const start = buildZigzagPoint(origin, endpoint, 0, 0, 11, 3, 5, 1);
    const end = buildZigzagPoint(origin, endpoint, 1, 7, 11, 3, 5, 1);

    expect(start.x).toBeCloseTo(origin.x, 5);
    expect(start.y).toBeCloseTo(origin.y, 5);
    expect(end.x).toBeCloseTo(endpoint.x, 5);
    expect(end.y).toBeCloseTo(endpoint.y, 5);
  });

  it("sorteia pontos dentro do círculo do playfield", () => {
    const geometry = { centerX: 400, centerY: 300, radius: 200 };
    const point = randomPointInCircle(geometry, 99, 2);
    const distance = Math.hypot(point.x - geometry.centerX, point.y - geometry.centerY);

    expect(distance).toBeLessThanOrEqual(geometry.radius);
  });

  it("calcula endpoint atravessando o círculo", () => {
    const geometry = { centerX: 400, centerY: 300, radius: 200 };
    const origin = { x: 400, y: 300 };
    const endpoint = randomEndpointAcrossCircle(geometry, origin, 55, 4);
    const distance = Math.hypot(
      endpoint.x - geometry.centerX,
      endpoint.y - geometry.centerY,
    );

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThanOrEqual(geometry.radius + 1);
  });

  it("aplica easing cúbico de saída", () => {
    expect(easeCubicOut(0)).toBe(0);
    expect(easeCubicOut(1)).toBe(1);
    expect(easeCubicOut(0.5)).toBeGreaterThan(0.5);
  });
});

describe("ambientElectricBackground", () => {
  const geometry = {
    centerX: 400,
    centerY: 300,
    radius: 210,
    componentArcStartAngle: -Math.PI,
    componentArcEndAngle: Math.PI,
    componentRingStartRadius: 60,
    componentRingEndRadius: 160,
    paddleBounds: {
      centerX: 400,
      centerY: 300,
      innerRadius: 170,
      outerRadius: 190,
      startAngle: 0,
      endAngle: Math.PI,
    },
    lossArcStartAngle: 0,
    lossArcEndAngle: Math.PI,
  };

  function createMockContext() {
    return {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      clip: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      strokeStyle: "",
      fillStyle: "",
      lineWidth: 1,
      globalAlpha: 1,
      shadowBlur: 0,
      shadowColor: "",
      globalCompositeOperation: "source-over",
      lineCap: "butt",
      lineJoin: "miter",
    } as unknown as CanvasRenderingContext2D;
  }

  it("usa Arcade como variante padrão", () => {
    expect(DEFAULT_AMBIENT_ELECTRIC_VARIANT).toBe("arcade");
    expect(resolveAmbientElectricVariant(null)).toBe("arcade");
    expect(resolveAmbientElectricVariant("storm")).toBe("storm");
  });

  it("respeita teto de raios ativos por preset", () => {
    const background = new AmbientElectricBackground("pulse");
    const circle = {
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      radius: geometry.radius,
    };

    for (let step = 0; step < 12; step += 1) {
      background.tick(circle, 1_000 + step * 50, false);
    }

    expect(background.getActiveBoltCount()).toBeLessThanOrEqual(
      AMBIENT_ELECTRIC_PRESETS.pulse.maxActiveBolts,
    );
  });

  it("reduz spawn em modo de efeitos reduzidos", () => {
    const background = new AmbientElectricBackground("storm");
    const circle = {
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      radius: geometry.radius,
    };

    background.tick(circle, 2_000, true);
    background.tick(circle, 6_500, true);

    expect(background.getActiveBoltCount()).toBeLessThanOrEqual(1);
  });

  it("desenha raios com stroke e pulse quando há bolts ativos", () => {
    const background = new AmbientElectricBackground("arcade");
    const circle = {
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      radius: geometry.radius,
    };
    const ctx = createMockContext();

    background.forceBolt(circle, 5_000);
    background.draw(ctx, geometry, 5_120, false);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.clip).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("reinicia estado ao trocar variante", () => {
    const background = new AmbientElectricBackground("arcade");
    const circle = {
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      radius: geometry.radius,
    };

    background.forceBolt(circle, 1_000);
    expect(background.getActiveBoltCount()).toBe(1);

    background.setVariant("storm");
    expect(background.getVariant()).toBe("storm");
    expect(background.getActiveBoltCount()).toBe(0);
  });
});
