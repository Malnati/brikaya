import { render, waitFor } from "@testing-library/react";

import { OnboardingGameplayDemoOverlay } from "./OnboardingGameplayDemoOverlay";
import { ONBOARDING_GAMEPLAY_DEMO_MS } from "../constants/onboardingGameplayDemo";

describe("OnboardingGameplayDemoOverlay", () => {
  let animationFrameCount = 0;

  beforeEach(() => {
    animationFrameCount = 0;
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrameCount += 1;
      const timestamp =
        animationFrameCount === 1 ? 0 : ONBOARDING_GAMEPLAY_DEMO_MS;
      callback(timestamp);
      return animationFrameCount;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: jest.fn(() => ({
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillRect: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn(),
        })),
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        lineCap: "butt",
        globalAlpha: 1,
        translate: jest.fn(),
        ellipse: jest.fn(),
      })),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: jest.fn(() => ({
        width: 480,
        height: 320,
        top: 0,
        left: 0,
        right: 480,
        bottom: 320,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      })),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renderiza canvas e interruptores da demonstração", () => {
    const { getByTestId } = render(
      <OnboardingGameplayDemoOverlay onComplete={jest.fn()} />,
    );

    expect(getByTestId("onboarding-gameplay-demo-overlay")).toBeInTheDocument();
    expect(getByTestId("onboarding-gameplay-demo-canvas")).toBeInTheDocument();
    expect(getByTestId("onboarding-gameplay-demo-switches")).toBeInTheDocument();
    expect(getByTestId("onboarding-gameplay-demo-switch-right")).toBeInTheDocument();
  });

  it("chama onComplete ao final da animação", async () => {
    const onComplete = jest.fn();

    render(<OnboardingGameplayDemoOverlay onComplete={onComplete} />);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
