import {
  resolveMobileOrientationLockState,
  type MobileOrientationLockMetrics,
} from "./useMobileOrientationLock";

function metrics(
  overrides: Partial<MobileOrientationLockMetrics>,
): MobileOrientationLockMetrics {
  return {
    width: 393,
    height: 852,
    pointerCoarse: false,
    hoverNone: false,
    maxTouchPoints: 0,
    ...overrides,
  };
}

describe("resolveMobileOrientationLockState", () => {
  it("bloqueia telefone em landscape", () => {
    expect(
      resolveMobileOrientationLockState(
        metrics({
          width: 852,
          height: 393,
          pointerCoarse: true,
          hoverNone: true,
          maxTouchPoints: 5,
        }),
      ),
    ).toEqual({
      isTouchDevice: true,
      isLandscape: true,
      isBlocked: true,
    });
  });

  it("não bloqueia telefone em portrait", () => {
    expect(
      resolveMobileOrientationLockState(
        metrics({
          width: 393,
          height: 852,
          pointerCoarse: true,
          hoverNone: true,
          maxTouchPoints: 5,
        }),
      ).isBlocked,
    ).toBe(false);
  });

  it("bloqueia tablet touch em landscape", () => {
    expect(
      resolveMobileOrientationLockState(
        metrics({
          width: 1180,
          height: 820,
          pointerCoarse: true,
          hoverNone: true,
          maxTouchPoints: 5,
        }),
      ).isBlocked,
    ).toBe(true);
  });

  it("não bloqueia desktop landscape sem toque", () => {
    expect(
      resolveMobileOrientationLockState(
        metrics({
          width: 1440,
          height: 900,
          pointerCoarse: false,
          hoverNone: false,
          maxTouchPoints: 0,
        }),
      ).isBlocked,
    ).toBe(false);
  });
});
