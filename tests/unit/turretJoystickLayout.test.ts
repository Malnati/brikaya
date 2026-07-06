import { calculateTurretJoystickLayout } from "../../src/utils/turretJoystickLayout";

const MAX_TRACKBALL_SIZE = 132;
const MIN_RESPONSIVE_TRACKBALL_SIZE = 72;
const KNOB_RATIO = 42 / 132;
const TRAVEL_RATIO = 36 / 132;

function mobilePortraitMetrics(
  overrides: Partial<
    Parameters<typeof calculateTurretJoystickLayout>[0]
  > = {},
) {
  return {
    viewportWidth: 390,
    viewportHeight: 844,
    playfieldBottom: 390,
    pointerCoarse: true,
    hoverNone: true,
    ...overrides,
  };
}

describe("calculateTurretJoystickLayout", () => {
  it("centraliza o joystick no meio da metade inferior quando há espaço", () => {
    const layout = calculateTurretJoystickLayout(mobilePortraitMetrics());

    expect(layout.shouldApply).toBe(true);
    expect(layout.size).toBe(MAX_TRACKBALL_SIZE);
    expect(layout.centerY).toBeCloseTo(844 * 0.75, 5);
    expect(layout.marginTop).toBeCloseTo(
      844 * 0.75 - 390 - MAX_TRACKBALL_SIZE / 2,
      5,
    );
    expect(layout.knobSize).toBeCloseTo(MAX_TRACKBALL_SIZE * KNOB_RATIO, 5);
    expect(layout.travel).toBeCloseTo(MAX_TRACKBALL_SIZE * TRAVEL_RATIO, 5);
  });

  it("reduz o joystick quando ele disputaria espaço com o tabuleiro", () => {
    const layout = calculateTurretJoystickLayout(
      mobilePortraitMetrics({
        viewportWidth: 480,
        viewportHeight: 640,
        playfieldBottom: 480,
      }),
    );

    expect(layout.shouldApply).toBe(true);
    expect(layout.size).toBe(MIN_RESPONSIVE_TRACKBALL_SIZE);
    expect(layout.size).toBeLessThan(MAX_TRACKBALL_SIZE);
    expect(layout.marginTop).toBeGreaterThanOrEqual(12);
    expect(layout.centerY - layout.size / 2).toBeGreaterThanOrEqual(480 + 12);
    expect(layout.centerY + layout.size / 2).toBeLessThanOrEqual(640 - 8);
  });

  it("não aplica âncora mobile em desktop ou landscape", () => {
    expect(
      calculateTurretJoystickLayout(
        mobilePortraitMetrics({
          viewportWidth: 900,
          viewportHeight: 640,
          playfieldBottom: 360,
          pointerCoarse: false,
          hoverNone: false,
        }),
      ).shouldApply,
    ).toBe(false);

    expect(
      calculateTurretJoystickLayout(
        mobilePortraitMetrics({
          viewportWidth: 844,
          viewportHeight: 390,
          playfieldBottom: 300,
        }),
      ).shouldApply,
    ).toBe(false);
  });
});
