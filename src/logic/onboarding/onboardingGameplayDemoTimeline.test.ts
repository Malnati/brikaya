import {
  ONBOARDING_DEMO_PHASE_SWITCH_END_MS,
  ONBOARDING_DEMO_PHASE_SWITCH_START_MS,
  ONBOARDING_DEMO_RIGHT_TRAMPOLINE_TARGET_ANGLE,
} from "../../constants/onboardingGameplayDemo";
import {
  DUAL_TRAMPOLINE_RIGHT_START_ANGLE,
} from "../../constants/turretTrampoline";
import {
  buildOnboardingDemoFrame,
  readDefaultOnboardingDemoCanvasSize,
} from "./onboardingGameplayDemoTimeline";

describe("onboardingGameplayDemoTimeline", () => {
  const canvasSize = readDefaultOnboardingDemoCanvasSize();

  function readDistanceFromCenter(frame: ReturnType<typeof buildOnboardingDemoFrame>) {
    return Math.hypot(
      frame.ballX - canvasSize.width / 2,
      frame.ballY - canvasSize.height / 2,
    );
  }

  it("mantém o interruptor direito neutro antes da fase de movimento", () => {
    const frame = buildOnboardingDemoFrame(300, canvasSize);

    expect(frame.rightSwitchDirection).toBe("neutral");
    expect(frame.rightTrampolineAngle).toBe(DUAL_TRAMPOLINE_RIGHT_START_ANGLE);
  });

  it("move a cama direita quando o interruptor desce", () => {
    const midSwitchFrame = buildOnboardingDemoFrame(
      (ONBOARDING_DEMO_PHASE_SWITCH_START_MS +
        ONBOARDING_DEMO_PHASE_SWITCH_END_MS) /
        2,
      canvasSize,
    );
    const endSwitchFrame = buildOnboardingDemoFrame(
      ONBOARDING_DEMO_PHASE_SWITCH_END_MS,
      canvasSize,
    );

    expect(midSwitchFrame.rightSwitchDirection).toBe("down");
    expect(midSwitchFrame.rightTrampolineAngle).toBeGreaterThan(
      DUAL_TRAMPOLINE_RIGHT_START_ANGLE,
    );
    expect(endSwitchFrame.rightTrampolineAngle).toBeCloseTo(
      ONBOARDING_DEMO_RIGHT_TRAMPOLINE_TARGET_ANGLE,
      2,
    );
  });

  it("reposiciona a bolinha do centro para a borda e depois rebate", () => {
    const centerFrame = buildOnboardingDemoFrame(0, canvasSize);
    const nearImpactFrame = buildOnboardingDemoFrame(2550, canvasSize);
    const reboundFrame = buildOnboardingDemoFrame(3100, canvasSize);

    const centerDistance = readDistanceFromCenter(centerFrame);
    const nearImpactDistance = readDistanceFromCenter(nearImpactFrame);
    const reboundDistance = readDistanceFromCenter(reboundFrame);

    expect(centerDistance).toBeLessThan(4);
    expect(nearImpactDistance).toBeGreaterThan(centerDistance);
    expect(reboundDistance).toBeLessThan(nearImpactDistance);
  });

  it("marca a timeline como completa no fim da duração", () => {
    const frame = buildOnboardingDemoFrame(5000, canvasSize);

    expect(frame.isComplete).toBe(true);
    expect(frame.opacity).toBeLessThan(0.2);
  });

  it("fade começa em 4500ms", () => {
    const beforeFadeFrame = buildOnboardingDemoFrame(4400, canvasSize);
    const afterFadeStartFrame = buildOnboardingDemoFrame(4600, canvasSize);

    expect(beforeFadeFrame.opacity).toBeCloseTo(1, 1);
    expect(afterFadeStartFrame.opacity).toBeLessThan(1);
  });
});
