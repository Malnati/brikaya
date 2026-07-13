import {
  PLAYFIELD_BACKDROP_BOTTOM,
  PLAYFIELD_BACKDROP_MID,
  PLAYFIELD_BACKDROP_MID_STOP,
  PLAYFIELD_BACKDROP_TOP,
} from "../../constants/playfieldBackdrop";
import {
  AmbientElectricBackground,
  AMBIENT_ELECTRIC_PRESETS,
  DEFAULT_AMBIENT_ELECTRIC_VARIANT,
  drawFullScreenElectricBackdrop,
  resolveAmbientElectricVariant,
} from "./ambientElectricBackground";
import {
  buildNaturalBoltGeometry,
  clampProgress,
  easeCubicOut,
  lightningUnitValue,
} from "./electricLightningRenderer";

describe("electricLightningRenderer", () => {
  const viewport = { width: 800, height: 600 };

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

  it("cria relâmpago natural solo→céu com ramificações", () => {
    const geometry = buildNaturalBoltGeometry(viewport, 99, {
      fractalDepth: 6,
      branchCount: 3,
      tertiaryBranches: false,
    });

    expect(geometry.origin.y).toBeGreaterThan(geometry.tip.y);
    expect(geometry.trunk.length).toBeGreaterThan(4);
    expect(geometry.branches.length).toBeGreaterThanOrEqual(3);
    expect(geometry.totalLength).toBeGreaterThan(100);
  });

  it("não produz tronco perfeitamente reto", () => {
    const geometry = buildNaturalBoltGeometry(viewport, 55, {
      fractalDepth: 6,
      branchCount: 2,
      tertiaryBranches: false,
    });
    const start = geometry.trunk[0];
    const end = geometry.trunk[geometry.trunk.length - 1];
    const mid = geometry.trunk[Math.floor(geometry.trunk.length / 2)];
    const lineDistance =
      Math.abs(
        (end.y - start.y) * mid.x -
          (end.x - start.x) * mid.y +
          end.x * start.y -
          end.y * start.x,
      ) / Math.hypot(end.x - start.x, end.y - start.y);

    expect(lineDistance).toBeGreaterThan(8);
  });

  it("aplica easing cúbico de saída", () => {
    expect(easeCubicOut(0)).toBe(0);
    expect(easeCubicOut(1)).toBe(1);
    expect(easeCubicOut(0.5)).toBeGreaterThan(0.5);
  });
});

describe("ambientElectricBackground", () => {
  const viewport = { width: 800, height: 600 };

  function createMockContext() {
    return {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      clip: jest.fn(),
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

    for (let step = 0; step < 20; step += 1) {
      background.tick(viewport, 1_000 + step * 200, false);
    }

    expect(background.getActiveBoltCount()).toBeLessThanOrEqual(
      AMBIENT_ELECTRIC_PRESETS.pulse.maxActiveBolts,
    );
  });

  it("reduz spawn em modo de efeitos reduzidos", () => {
    const background = new AmbientElectricBackground("storm");

    background.tick(viewport, 2_000, true);
    background.tick(viewport, 6_500, true);

    expect(background.getActiveBoltCount()).toBeLessThanOrEqual(1);
  });

  it("desenha raios em viewport inteiro sem clip circular", () => {
    const background = new AmbientElectricBackground("arcade");
    const ctx = createMockContext();

    background.forceBolt(viewport, 5_000);
    background.draw(ctx, viewport, 5_120);

    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.clip).not.toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it("reinicia estado ao trocar variante", () => {
    const background = new AmbientElectricBackground("arcade");

    background.forceBolt(viewport, 1_000);
    expect(background.getActiveBoltCount()).toBe(1);

    background.setVariant("storm");
    expect(background.getVariant()).toBe("storm");
    expect(background.getActiveBoltCount()).toBe(0);
  });

  it("desenha backdrop fullscreen com gradiente do playfield", () => {
    const addColorStop = jest.fn();
    const gradient = { addColorStop };
    const ctx = {
      createLinearGradient: jest.fn(() => gradient),
      fillStyle: "",
      fillRect: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    drawFullScreenElectricBackdrop(ctx, viewport);

    expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 0, viewport.height);
    expect(addColorStop).toHaveBeenNthCalledWith(1, 0, PLAYFIELD_BACKDROP_TOP);
    expect(addColorStop).toHaveBeenNthCalledWith(
      2,
      PLAYFIELD_BACKDROP_MID_STOP,
      PLAYFIELD_BACKDROP_MID,
    );
    expect(addColorStop).toHaveBeenNthCalledWith(3, 1, PLAYFIELD_BACKDROP_BOTTOM);
    expect(ctx.fillStyle).toBe(gradient);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, viewport.width, viewport.height);
  });
});
