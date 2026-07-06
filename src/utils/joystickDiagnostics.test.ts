import {
  JOYSTICK_DIAGNOSTIC_MAX_SAMPLES,
  appendJoystickDiagnosticSample,
  buildJoystickDiagnosticExport,
  createEmptyJoystickDiagnosticState,
} from "./joystickDiagnostics";

const BASE_SAMPLE = {
  sequence: 1,
  timestamp: 1782870000000,
  phase: "move" as const,
  inputType: "pointer" as const,
  accepted: true,
  clientPoint: { x: 150, y: 300 },
  joystick: {
    rect: { x: 100, y: 200, width: 100, height: 100 },
    normalized: { x: 0.5, y: 1 },
    visual: { x: 0, y: 1 },
    radius: 50,
    distanceFromCenter: 50,
  },
  canvas: {
    rect: { x: 20, y: 40, width: 400, height: 300 },
    size: { width: 800, height: 600 },
    mappedClientPoint: { x: 220, y: 340 },
    mappedCanvasPoint: { x: 400, y: 600 },
  },
  paddle: {
    x: 360,
    y: 520,
    width: 80,
    height: 12,
    radial: {
      centerX: 400,
      centerY: 300,
      radius: 238,
      thickness: 12,
      startAngle: 1.4,
      centerAngle: 1.57,
      endAngle: 1.74,
    },
  },
};

describe("joystickDiagnostics", () => {
  it("mantém amostras recentes e marca truncamento quando passa do limite", () => {
    let state = createEmptyJoystickDiagnosticState();

    for (let index = 0; index < JOYSTICK_DIAGNOSTIC_MAX_SAMPLES + 2; index++) {
      state = appendJoystickDiagnosticSample(state, {
        ...BASE_SAMPLE,
        sequence: index + 1,
      });
    }

    expect(state.truncated).toBe(true);
    expect(state.samples).toHaveLength(JOYSTICK_DIAGNOSTIC_MAX_SAMPLES);
    expect(state.samples[0].sequence).toBe(3);
  });

  it("exporta JSON diagnóstico com resumo e SVG desenhado", () => {
    const exportData = buildJoystickDiagnosticExport({
      samples: [
        BASE_SAMPLE,
        { ...BASE_SAMPLE, sequence: 2, accepted: false, phase: "move" },
      ],
      truncated: false,
      versionLabel: "v30",
      publicUrl: "https://brikaya.com/?qaScenario=ball-turret",
      userAgent: "jest",
      viewport: { width: 390, height: 844 },
      exportedAt: "2026-07-06T01:30:00.000Z",
    });

    expect(exportData.summary).toMatchObject({
      totalSamples: 2,
      acceptedSamples: 1,
      rejectedSamples: 1,
      truncated: false,
    });
    expect(exportData.diagnosticSvg).toContain("<svg");
    expect(exportData.diagnosticSvg).toContain("Joystick");
    expect(exportData.diagnosticSvg).toContain("Cama elástica");
    expect(JSON.stringify(exportData.samples[0])).toContain("mappedCanvasPoint");
  });
});
