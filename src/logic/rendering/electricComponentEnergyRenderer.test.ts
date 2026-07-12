import {
  COMPONENT_ENERGY_PRESETS,
  drawComponentEnergyPreview,
  ElectricComponentEnergyPreview,
  getComponentEnergyPresetId,
} from "./electricComponentEnergyRenderer";

describe("electricComponentEnergyRenderer", () => {
  function createMockContext() {
    return {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      rect: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      clip: jest.fn(),
      arc: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      canvas: { width: 96, height: 48 },
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      lineCap: "round",
      lineJoin: "round",
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      shadowColor: "",
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D;
  }

  it("resolve presetId a partir do basename do path", () => {
    expect(
      getComponentEnergyPresetId(
        "/assets/visual/components/spr-component-basic-yellow-normal.svg",
      ),
    ).toBe("spr-component-basic-yellow-normal");
    expect(
      getComponentEnergyPresetId(
        "/assets/visual/components/spr-component-basic-yellow-sunset-normal.svg",
      ),
    ).toBeNull();
  });

  it("expõe os quatro presets autorizados", () => {
    expect(Object.keys(COMPONENT_ENERGY_PRESETS).sort()).toEqual([
      "spr-component-basic-purple-normal",
      "spr-component-basic-yellow-normal",
      "spr-component-metal-steel-dented-one",
      "spr-component-metal-steel-dented-two",
    ]);
  });

  it("desenha preview sem lançar em canvas mock", () => {
    const ctx = createMockContext();
    const preview = new ElectricComponentEnergyPreview("spr-component-basic-yellow-normal");

    expect(() =>
      drawComponentEnergyPreview(
        ctx,
        preview,
        1_700_000_000_000,
        { x: 10, y: 20, width: 96, height: 48 },
        false,
      ),
    ).not.toThrow();
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });
});
