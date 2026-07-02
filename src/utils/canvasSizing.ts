// src/utils/canvasSizing.ts
import {
  AVAILABLE_CANVAS_HEIGHT_RATIO,
  CANVAS_CONTAINER_HORIZONTAL_INSET,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  IMMERSIVE_LANDSCAPE_CANVAS_INSET,
  IMMERSIVE_LANDSCAPE_MAX_VIEWPORT_HEIGHT,
  IMMERSIVE_LANDSCAPE_MAX_VIEWPORT_WIDTH,
  IMMERSIVE_LANDSCAPE_MIN_CANVAS_HEIGHT,
  IMMERSIVE_LANDSCAPE_MIN_CANVAS_WIDTH,
  IMMERSIVE_LANDSCAPE_UI_RESERVED_BLOCK,
  MAX_CANVAS_HEIGHT,
  MAX_CANVAS_WIDTH,
  MIN_CANVAS_HEIGHT,
  MIN_CANVAS_WIDTH,
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

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

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

export function calculateResponsiveCanvasSize(
  metrics: ResponsiveCanvasMetrics,
): ResponsiveCanvasSize {
  const isLandscapeImmersive = isImmersiveLandscape(metrics);
  const minCanvasWidth = isLandscapeImmersive
    ? IMMERSIVE_LANDSCAPE_MIN_CANVAS_WIDTH
    : MIN_CANVAS_WIDTH;
  const minCanvasHeight = isLandscapeImmersive
    ? IMMERSIVE_LANDSCAPE_MIN_CANVAS_HEIGHT
    : MIN_CANVAS_HEIGHT;
  const viewportWidth = resolveViewportWidth(metrics);
  const viewportHeight = resolveViewportHeight(metrics);
  const immersiveUiReservedBlock =
    metrics.immersiveUiReservedBlock ?? IMMERSIVE_LANDSCAPE_UI_RESERVED_BLOCK;
  const containerWidth = isLandscapeImmersive
    ? Math.max(
        minCanvasWidth,
        viewportWidth -
          metrics.rootPaddingInline -
          IMMERSIVE_LANDSCAPE_CANVAS_INSET,
      )
    : Math.max(
        minCanvasWidth,
        metrics.containerWidth - CANVAS_CONTAINER_HORIZONTAL_INSET,
      );
  const containerHeight = isLandscapeImmersive
    ? Math.max(
        minCanvasHeight,
        viewportHeight -
          metrics.rootPaddingBlock -
          IMMERSIVE_LANDSCAPE_CANVAS_INSET -
          immersiveUiReservedBlock,
      )
    : Math.max(
        minCanvasHeight,
        viewportHeight * AVAILABLE_CANVAS_HEIGHT_RATIO,
      );

  let newWidth = containerWidth;
  let newHeight = containerWidth / ASPECT_RATIO;

  if (newHeight > containerHeight) {
    newHeight = containerHeight;
    newWidth = containerHeight * ASPECT_RATIO;
  }

  if (!isLandscapeImmersive) {
    newWidth = clamp(newWidth, minCanvasWidth, MAX_CANVAS_WIDTH);
    newHeight = clamp(newHeight, minCanvasHeight, MAX_CANVAS_HEIGHT);
  }

  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight),
    isImmersiveLandscape: isLandscapeImmersive,
  };
}
