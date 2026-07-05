import { useEffect, useState } from "react";

export interface MobileOrientationLockMetrics {
  width: number;
  height: number;
  pointerCoarse: boolean;
  hoverNone: boolean;
  maxTouchPoints: number;
}

export interface MobileOrientationLockState {
  isTouchDevice: boolean;
  isLandscape: boolean;
  isBlocked: boolean;
}

const POINTER_COARSE_MEDIA_QUERY = "(pointer: coarse)";
const HOVER_NONE_MEDIA_QUERY = "(hover: none)";
const RESIZE_EVENT_NAME = "resize";
const ORIENTATION_CHANGE_EVENT_NAME = "orientationchange";
const MEDIA_QUERY_CHANGE_EVENT_NAME = "change";

const DEFAULT_ORIENTATION_LOCK_STATE: MobileOrientationLockState = {
  isTouchDevice: false,
  isLandscape: false,
  isBlocked: false,
};

function statesAreEqual(
  firstState: MobileOrientationLockState,
  secondState: MobileOrientationLockState,
) {
  return (
    firstState.isTouchDevice === secondState.isTouchDevice &&
    firstState.isLandscape === secondState.isLandscape &&
    firstState.isBlocked === secondState.isBlocked
  );
}

function readMediaQueryMatches(query: string) {
  return window.matchMedia?.(query).matches || false;
}

function readViewportMetrics(): MobileOrientationLockMetrics {
  const visualViewport = window.visualViewport;

  return {
    width: visualViewport?.width || window.innerWidth,
    height: visualViewport?.height || window.innerHeight,
    pointerCoarse: readMediaQueryMatches(POINTER_COARSE_MEDIA_QUERY),
    hoverNone: readMediaQueryMatches(HOVER_NONE_MEDIA_QUERY),
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
}

export function resolveMobileOrientationLockState(
  metrics: MobileOrientationLockMetrics,
): MobileOrientationLockState {
  const isTouchDevice =
    metrics.pointerCoarse || metrics.hoverNone || metrics.maxTouchPoints > 0;
  const isLandscape = metrics.width > metrics.height;

  return {
    isTouchDevice,
    isLandscape,
    isBlocked: isTouchDevice && isLandscape,
  };
}

function readMobileOrientationLockState() {
  if (typeof window === "undefined") return DEFAULT_ORIENTATION_LOCK_STATE;

  return resolveMobileOrientationLockState(readViewportMetrics());
}

export function useMobileOrientationLock(): MobileOrientationLockState {
  const [state, setState] = useState(readMobileOrientationLockState);

  useEffect(() => {
    const pointerQuery = window.matchMedia?.(POINTER_COARSE_MEDIA_QUERY);
    const hoverQuery = window.matchMedia?.(HOVER_NONE_MEDIA_QUERY);
    const updateState = () => {
      const nextState = readMobileOrientationLockState();
      setState((currentState) =>
        statesAreEqual(currentState, nextState) ? currentState : nextState,
      );
    };

    updateState();
    window.addEventListener(RESIZE_EVENT_NAME, updateState);
    window.addEventListener(ORIENTATION_CHANGE_EVENT_NAME, updateState);
    window.visualViewport?.addEventListener(RESIZE_EVENT_NAME, updateState);
    pointerQuery?.addEventListener?.(MEDIA_QUERY_CHANGE_EVENT_NAME, updateState);
    hoverQuery?.addEventListener?.(MEDIA_QUERY_CHANGE_EVENT_NAME, updateState);

    return () => {
      window.removeEventListener(RESIZE_EVENT_NAME, updateState);
      window.removeEventListener(ORIENTATION_CHANGE_EVENT_NAME, updateState);
      window.visualViewport?.removeEventListener(
        RESIZE_EVENT_NAME,
        updateState,
      );
      pointerQuery?.removeEventListener?.(
        MEDIA_QUERY_CHANGE_EVENT_NAME,
        updateState,
      );
      hoverQuery?.removeEventListener?.(
        MEDIA_QUERY_CHANGE_EVENT_NAME,
        updateState,
      );
    };
  }, []);

  return state;
}
