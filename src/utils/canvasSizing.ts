// src/utils/canvasSizing.ts
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MIN_CANVAS_HEIGHT,
  MIN_CANVAS_WIDTH,
  RESPONSIVE_CANVAS_UI_RESERVED_BLOCK,
} from "../constants/game";

export interface ResponsiveCanvasMetrics {
  containerWidth: number;
  containerHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  visualViewportWidth?: number;
  visualViewportHeight?: number;
  rootPaddingInline: number;
  rootPaddingBlock: number;
  pointerCoarse: boolean;
  hoverNone: boolean;
}

export interface ResponsiveCanvasSize {
  width: number;
  height: number;
  isImmersiveLandscape: boolean;
}

const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT;
const MOBILE_PORTRAIT_FOCUSED_MAX_WIDTH = 480;
const MOBILE_PORTRAIT_FOCUSED_UI_RESERVED_BLOCK = 0;

function resolveViewportWidth(metrics: ResponsiveCanvasMetrics): number {
  return metrics.visualViewportWidth || metrics.viewportWidth;
}

function resolveViewportHeight(metrics: ResponsiveCanvasMetrics): number {
  return metrics.visualViewportHeight || metrics.viewportHeight;
}

function isMobilePortraitFocused(metrics: ResponsiveCanvasMetrics): boolean {
  const viewportWidth = resolveViewportWidth(metrics);
  const viewportHeight = resolveViewportHeight(metrics);
  const hasMobilePointer = metrics.pointerCoarse || metrics.hoverNone;

  return (
    hasMobilePointer &&
    viewportWidth <= MOBILE_PORTRAIT_FOCUSED_MAX_WIDTH &&
    viewportWidth <= viewportHeight
  );
}

export function calculateResponsiveCanvasSize(
  metrics: ResponsiveCanvasMetrics,
): ResponsiveCanvasSize {
  const isPortraitFocused = isMobilePortraitFocused(metrics);
  const viewportHeight = resolveViewportHeight(metrics);
  const responsiveUiReservedBlock = isPortraitFocused
    ? MOBILE_PORTRAIT_FOCUSED_UI_RESERVED_BLOCK
    : RESPONSIVE_CANVAS_UI_RESERVED_BLOCK;
  const responsiveContainerHeight = Math.max(
    MIN_CANVAS_HEIGHT,
    viewportHeight - metrics.rootPaddingBlock - responsiveUiReservedBlock,
  );
  const containerWidth = Math.max(MIN_CANVAS_WIDTH, metrics.containerWidth);
  const containerHeight = responsiveContainerHeight;

  let newWidth = isPortraitFocused
    ? Math.min(containerWidth, containerHeight)
    : containerWidth;
  let newHeight = isPortraitFocused ? newWidth : containerWidth / ASPECT_RATIO;

  if (!isPortraitFocused && newHeight > containerHeight) {
    newHeight = containerHeight;
    newWidth = containerHeight * ASPECT_RATIO;
  }

  newWidth = Math.max(MIN_CANVAS_WIDTH, newWidth);
  newHeight = Math.max(MIN_CANVAS_HEIGHT, newHeight);

  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight),
    isImmersiveLandscape: false,
  };
}
