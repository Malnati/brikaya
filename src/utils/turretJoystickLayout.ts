export interface TurretJoystickLayoutMetrics {
  viewportWidth: number;
  viewportHeight: number;
  playfieldBottom: number;
  pointerCoarse: boolean;
  hoverNone: boolean;
}

export interface TurretJoystickLayout {
  shouldApply: boolean;
  size: number;
  knobSize: number;
  travel: number;
  marginTop: number;
  centerY: number;
  targetCenterY: number;
}

const MOBILE_PORTRAIT_MAX_WIDTH = 480;
const LOWER_HALF_CENTER_RATIO = 0.75;
const TRACKBALL_MAX_SIZE = 132;
const TRACKBALL_MIN_RESPONSIVE_SIZE = 72;
const TRACKBALL_MIN_TOUCH_SIZE = 44;
const TRACKBALL_KNOB_RATIO = 42 / TRACKBALL_MAX_SIZE;
const TRACKBALL_TRAVEL_RATIO = 36 / TRACKBALL_MAX_SIZE;
const PLAYFIELD_MIN_GAP = 12;
const VIEWPORT_BOTTOM_GAP = 8;
const ZERO = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isMobilePortraitTouch(metrics: TurretJoystickLayoutMetrics): boolean {
  const hasTouchLayout = metrics.pointerCoarse || metrics.hoverNone;

  return (
    hasTouchLayout &&
    metrics.viewportWidth <= MOBILE_PORTRAIT_MAX_WIDTH &&
    metrics.viewportWidth <= metrics.viewportHeight
  );
}

export function calculateTurretJoystickLayout(
  metrics: TurretJoystickLayoutMetrics,
): TurretJoystickLayout {
  const targetCenterY = metrics.viewportHeight * LOWER_HALF_CENTER_RATIO;

  if (!isMobilePortraitTouch(metrics)) {
    return {
      shouldApply: false,
      size: TRACKBALL_MAX_SIZE,
      knobSize: TRACKBALL_MAX_SIZE * TRACKBALL_KNOB_RATIO,
      travel: TRACKBALL_MAX_SIZE * TRACKBALL_TRAVEL_RATIO,
      marginTop: ZERO,
      centerY: targetCenterY,
      targetCenterY,
    };
  }

  const minimumTop = metrics.playfieldBottom + PLAYFIELD_MIN_GAP;
  const targetLimitedSize = Math.max(
    ZERO,
    (targetCenterY - minimumTop) * 2,
  );
  const preferredSize = clamp(
    targetLimitedSize,
    TRACKBALL_MIN_RESPONSIVE_SIZE,
    TRACKBALL_MAX_SIZE,
  );
  let top = targetCenterY - preferredSize / 2;

  if (top < minimumTop) {
    top = minimumTop;
  }

  const sizeAvailableInViewport = Math.max(
    ZERO,
    metrics.viewportHeight - VIEWPORT_BOTTOM_GAP - top,
  );
  const size = clamp(
    Math.min(preferredSize, sizeAvailableInViewport),
    TRACKBALL_MIN_TOUCH_SIZE,
    preferredSize,
  );
  const centerY = top + size / 2;

  return {
    shouldApply: true,
    size,
    knobSize: size * TRACKBALL_KNOB_RATIO,
    travel: size * TRACKBALL_TRAVEL_RATIO,
    marginTop: top - metrics.playfieldBottom,
    centerY,
    targetCenterY,
  };
}
