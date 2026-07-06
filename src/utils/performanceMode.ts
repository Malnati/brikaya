import { MOBILE_CANVAS_WIDTH_THRESHOLD } from "../constants/game";

const COARSE_POINTER_QUERY = "(pointer: coarse)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_VIEWPORT_WIDTH_THRESHOLD = 700;
const FULL_EFFECTS_QUERY_PARAM = "fullEffects";

function readSearchParam(name: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function matchesMedia(query: string): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;

  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function isFullEffectsForced(): boolean {
  return readSearchParam(FULL_EFFECTS_QUERY_PARAM) === "1";
}

export function shouldUseReducedCanvasEffects(canvasWidth?: number): boolean {
  if (isFullEffectsForced()) return false;

  if (
    typeof canvasWidth === "number" &&
    Number.isFinite(canvasWidth) &&
    canvasWidth <= MOBILE_CANVAS_WIDTH_THRESHOLD
  ) {
    return true;
  }

  if (matchesMedia(REDUCED_MOTION_QUERY)) return true;

  return (
    matchesMedia(COARSE_POINTER_QUERY) &&
    typeof window !== "undefined" &&
    window.innerWidth <= MOBILE_VIEWPORT_WIDTH_THRESHOLD
  );
}
