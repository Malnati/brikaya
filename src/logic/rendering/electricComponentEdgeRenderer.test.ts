import {
  getFlowingEdgeTravelProgress,
  PURPLE_ELECTRIC_EDGE_STYLE,
  YELLOW_ELECTRIC_EDGE_STYLE,
  drawElectricEdgesPreset,
} from "./electricComponentEdgeRenderer";

describe("electricComponentEdgeRenderer", () => {
  function createMockContext() {
    return {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      lineCap: "round",
      lineJoin: "round",
      globalAlpha: 1,
      shadowColor: "",
      shadowBlur: 0,
    } as unknown as CanvasRenderingContext2D;
  }

  it("mantém progresso de perímetro monotônico ao longo do tempo", () => {
    const samples = [0, 1, 2, 3].map((edgeIndex) =>
      getFlowingEdgeTravelProgress(1_000, edgeIndex, 4),
    );
    const later = [0, 1, 2, 3].map((edgeIndex) =>
      getFlowingEdgeTravelProgress(2_000, edgeIndex, 4),
    );

    expect(samples.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(later.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(later[0]).not.toBe(samples[0]);
  });

  it("resolve tema roxo no preset de capacitor", () => {
    const ctx = createMockContext();
    const preset = {
      renderMode: "electric-edges" as const,
      electricTheme: "purple" as const,
      shape: "capacitor",
      terminalWidth: 2.2,
      interiorFills: [
        {
          type: "polygon" as const,
          points: [
            [36, 8],
            [41, 10.5],
            [41, 34.5],
            [36, 40],
          ],
          fill: "rgba(20, 8, 40, 0.55)",
        },
      ],
      perimeterPaths: [
        {
          type: "polygon" as const,
          points: [
            [36, 8],
            [41, 10.5],
            [41, 34.5],
            [36, 40],
          ],
        },
      ],
      terminalStubs: [{ x1: 24, y1: 24, x2: 31, y2: 24 }],
      detailPaths: [{ type: "line" as const, x1: 46, y1: 10, x2: 46, y2: 38 }],
    };

    expect(() => drawElectricEdgesPreset(ctx, preset, 500, false)).not.toThrow();
    expect(PURPLE_ELECTRIC_EDGE_STYLE.coreColor).toContain("244");
    expect(YELLOW_ELECTRIC_EDGE_STYLE.coreColor).toContain("255");
  });
});
