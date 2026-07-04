// src/utils/canvasSizing.ts
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  IMMERSIVE_LANDSCAPE_CANVAS_INSET,
  IMMERSIVE_LANDSCAPE_MAX_VIEWPORT_HEIGHT,
  IMMERSIVE_LANDSCAPE_MAX_VIEWPORT_WIDTH,
  IMMERSIVE_LANDSCAPE_MIN_CANVAS_HEIGHT,
  IMMERSIVE_LANDSCAPE_MIN_CANVAS_WIDTH,
  IMMERSIVE_LANDSCAPE_UI_RESERVED_BLOCK,
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
  immersiveUiReservedBlock?: number;
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
const MOBILE_LANDSCAPE_FOCUSED_MAX_HEIGHT = 500;
const MOBILE_LANDSCAPE_FOCUSED_UI_RESERVED_BLOCK = 0;

function resolveViewportWidth(metrics: ResponsiveCanvasMetrics): number {
  return metrics.visualViewportWidth || metrics.viewportWidth;
}

function resolveViewportHeight(metrics: ResponsiveCanvasMetrics): number {
  return metrics.visualViewportHeight || metrics.viewportHeight;
}

function isImmersiveLandscape(metrics: ResponsiveCanvasMetrics): boolean {
  const viewportWidth = resolveViewportWidth(metrics);
  const viewportHeight = resolveViewportHeight(metrics);
  const hasMobilePointer = metrics.pointerCoarse || metrics.hoverNone;

  return (
    hasMobilePointer &&
    viewportWidth > viewportHeight &&
    viewportHeight <= IMMERSIVE_LANDSCAPE_MAX_VIEWPORT_HEIGHT &&
    viewportWidth <= IMMERSIVE_LANDSCAPE_MAX_VIEWPORT_WIDTH
  );
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
  const isLandscapeImmersive = isImmersiveLandscape(metrics);
  const isPortraitFocused =
    !isLandscapeImmersive && isMobilePortraitFocused(metrics);
  const isLandscapeFocused =
    isLandscapeImmersive &&
    resolveViewportHeight(metrics) <= MOBILE_LANDSCAPE_FOCUSED_MAX_HEIGHT;
  const minCanvasWidth = isLandscapeImmersive
    ? IMMERSIVE_LANDSCAPE_MIN_CANVAS_WIDTH
    : MIN_CANVAS_WIDTH;
  const minCanvasHeight = isLandscapeImmersive
    ? IMMERSIVE_LANDSCAPE_MIN_CANVAS_HEIGHT
    : MIN_CANVAS_HEIGHT;
  const viewportWidth = resolveViewportWidth(metrics);
  const viewportHeight = resolveViewportHeight(metrics);
  const immersiveUiReservedBlock = isLandscapeFocused
    ? MOBILE_LANDSCAPE_FOCUSED_UI_RESERVED_BLOCK
    : (metrics.immersiveUiReservedBlock ??
      IMMERSIVE_LANDSCAPE_UI_RESERVED_BLOCK);
  const responsiveUiReservedBlock = isPortraitFocused
    ? MOBILE_PORTRAIT_FOCUSED_UI_RESERVED_BLOCK
    : RESPONSIVE_CANVAS_UI_RESERVED_BLOCK;
  const responsiveContainerHeight = Math.max(
    minCanvasHeight,
    viewportHeight - metrics.rootPaddingBlock - responsiveUiReservedBlock,
  );
  const containerWidth = isLandscapeImmersive
    ? Math.max(
        minCanvasWidth,
        metrics.containerWidth,
        viewportWidth -
          metrics.rootPaddingInline -
          IMMERSIVE_LANDSCAPE_CANVAS_INSET,
      )
    : Math.max(minCanvasWidth, metrics.containerWidth);
  const containerHeight = isLandscapeImmersive
    ? Math.max(
        minCanvasHeight,
        metrics.containerHeight,
        viewportHeight -
          metrics.rootPaddingBlock -
          IMMERSIVE_LANDSCAPE_CANVAS_INSET -
          immersiveUiReservedBlock,
      )
    : responsiveContainerHeight;

  let newWidth = isPortraitFocused
    ? Math.min(containerWidth, containerHeight)
    : containerWidth;
  let newHeight = isLandscapeImmersive
    ? containerHeight
    : isPortraitFocused
      ? newWidth
      : containerWidth / ASPECT_RATIO;

  if (
    !isLandscapeImmersive &&
    !isPortraitFocused &&
    newHeight > containerHeight
  ) {
    newHeight = containerHeight;
    newWidth = containerHeight * ASPECT_RATIO;
  }

  newWidth = Math.max(minCanvasWidth, newWidth);
  newHeight = Math.max(minCanvasHeight, newHeight);

  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight),
    isImmersiveLandscape: isLandscapeImmersive,
  };
}
