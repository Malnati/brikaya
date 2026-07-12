import { lightningUnitValue, strokeLightningPath } from "./electricLightningRenderer";

export const YELLOW_ELECTRIC_EDGE_STYLE = {
  coreColor: "rgba(255, 248, 216, 0.92)",
  haloColor: "rgba(255, 213, 79, 0.42)",
  shadowColor: "rgba(255, 193, 7, 0.88)",
};

export const PURPLE_ELECTRIC_EDGE_STYLE = {
  coreColor: "rgba(244, 228, 255, 0.92)",
  haloColor: "rgba(184, 115, 255, 0.42)",
  shadowColor: "rgba(156, 64, 255, 0.88)",
};

const EDGE_THEMES = {
  yellow: YELLOW_ELECTRIC_EDGE_STYLE,
  purple: PURPLE_ELECTRIC_EDGE_STYLE,
};

const EDGE_CYCLE_MS = 2400;
const EDGE_PERIMETER_CYCLE_MS = 3200;
const EDGE_SEGMENTS = 5;
const EDGE_ZIGZAG_AMPLITUDE = 1.5;
const EDGE_SCALE = 1;
const EDGE_HALO_LINE_WIDTH = 4.2;
const EDGE_CORE_LINE_WIDTH = 2;

function resolveStyle(themeName: "yellow" | "purple") {
  return EDGE_THEMES[themeName] ?? YELLOW_ELECTRIC_EDGE_STYLE;
}

function getOscillatingTravelProgress(now: number, seed: number): number {
  const phase = (now / EDGE_CYCLE_MS + lightningUnitValue(seed, 0) * 0.35) % 1;
  return 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2));
}

export function getFlowingEdgeTravelProgress(now: number, edgeIndex: number, edgeCount: number): number {
  const globalPhase = (now / EDGE_PERIMETER_CYCLE_MS) % 1;
  return (globalPhase + edgeIndex / edgeCount) % 1;
}

function drawDualStrokeElectric(
  ctx: CanvasRenderingContext2D,
  origin: { x: number; y: number },
  endpoint: { x: number; y: number },
  travelProgress: number,
  seed: number,
  endpointIndex: number,
  style: typeof YELLOW_ELECTRIC_EDGE_STYLE,
  lineWidthScale = 1,
  reducedEffects = false,
) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = style.haloColor;
  ctx.lineWidth = EDGE_HALO_LINE_WIDTH * lineWidthScale;
  ctx.shadowColor = style.shadowColor;
  ctx.shadowBlur = reducedEffects ? 0 : 6 * lineWidthScale;
  ctx.globalAlpha = 0.75;
  strokeLightningPath(
    ctx,
    origin,
    endpoint,
    travelProgress,
    EDGE_SEGMENTS,
    seed,
    endpointIndex,
    EDGE_ZIGZAG_AMPLITUDE,
    EDGE_SCALE,
  );

  ctx.strokeStyle = style.coreColor;
  ctx.lineWidth = EDGE_CORE_LINE_WIDTH * lineWidthScale;
  ctx.shadowBlur = reducedEffects ? 0 : 3 * lineWidthScale;
  ctx.globalAlpha = 0.92;
  strokeLightningPath(
    ctx,
    origin,
    endpoint,
    travelProgress,
    EDGE_SEGMENTS,
    seed,
    endpointIndex + 1000,
    EDGE_ZIGZAG_AMPLITUDE * 0.7,
    EDGE_SCALE,
  );

  ctx.restore();
}

function drawAnimatedElectricSegment(
  ctx: CanvasRenderingContext2D,
  segment,
  now,
  seed,
  styleOrTheme: "yellow" | "purple" = "yellow",
  options: { travelProgress?: number; reducedEffects?: boolean } = {},
) {
  const style = typeof styleOrTheme === "string" ? resolveStyle(styleOrTheme) : styleOrTheme;
  const origin = { x: segment.x1, y: segment.y1 };
  const endpoint = { x: segment.x2, y: segment.y2 };
  const travelProgress =
    options.travelProgress ?? getOscillatingTravelProgress(now, seed);
  const widthScale = segment.width ? segment.width / 2.2 : 1;
  drawDualStrokeElectric(ctx, origin, endpoint, travelProgress, seed, seed, style, widthScale, options.reducedEffects ?? false);
}

export function drawAnimatedElectricPolyline(ctx: CanvasRenderingContext2D, points: number[][], now: number, seed: number, styleOrTheme: "yellow" | "purple", reducedEffects: boolean) {
  if (!points || points.length < 2) return;
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];
    drawAnimatedElectricSegment(
      ctx,
      { x1, y1, x2, y2, width: 2.5 },
      now,
      seed + index * 13,
      styleOrTheme,
      { reducedEffects },
    );
  }
}

export function drawAnimatedElectricPolygon(ctx, points, now, seed, styleOrTheme = "yellow") {
  if (!points || points.length < 2) return;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    drawAnimatedElectricSegment(
      ctx,
      { x1, y1, x2, y2, width: 2.2 },
      now,
      seed + index * 17,
      styleOrTheme,
    );
  }
}

export function drawFlowingElectricPolygon(ctx: CanvasRenderingContext2D, points: number[][], now: number, seed: number, styleOrTheme: "yellow" | "purple", reducedEffects: boolean) {
  if (!points || points.length < 2) return;
  const style = typeof styleOrTheme === "string" ? resolveStyle(styleOrTheme) : styleOrTheme;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    const travelProgress = getFlowingEdgeTravelProgress(now, index, points.length);
    const origin = { x: x1, y: y1 };
    const endpoint = { x: x2, y: y2 };
    drawDualStrokeElectric(
      ctx,
      origin,
      endpoint,
      travelProgress,
      seed + index * 17,
      seed + index * 17,
      style,
      1,
      reducedEffects,
    );
  }
}

export function drawElectricEdgesPreset(ctx: CanvasRenderingContext2D, preset: Record<string, unknown>, now: number, reducedEffects = false) {
  const theme = preset.electricTheme ?? "yellow";
  const baseSeed = 42;

  const interiorFills =
    preset.interiorFills ?? (preset.interiorFill ? [preset.interiorFill] : []);
  for (const fillDef of interiorFills) {
    ctx.save();
    ctx.fillStyle = fillDef.fill;
    ctx.beginPath();
    if (fillDef.type === "polygon") {
      const [first, ...rest] = fillDef.points;
      ctx.moveTo(first[0], first[1]);
      for (const [x, y] of rest) ctx.lineTo(x, y);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  }

  for (let pathIndex = 0; pathIndex < (preset.perimeterPaths ?? []).length; pathIndex += 1) {
    const pathDef = preset.perimeterPaths[pathIndex];
    if (pathDef.type === "polygon") {
      drawFlowingElectricPolygon(ctx, pathDef.points, now, baseSeed + pathIndex * 100, theme, reducedEffects);
    }
  }

  for (let stubIndex = 0; stubIndex < (preset.terminalStubs ?? []).length; stubIndex += 1) {
    const stub = preset.terminalStubs[stubIndex];
    drawAnimatedElectricSegment(
      ctx,
      {
        x1: stub.x1,
        y1: stub.y1,
        x2: stub.x2,
        y2: stub.y2,
        width: preset.terminalWidth ?? 3,
      },
      now,
      baseSeed + 500 + stubIndex * 23,
      theme,
      { reducedEffects },
    );
  }

  for (let detailIndex = 0; detailIndex < (preset.detailPaths ?? []).length; detailIndex += 1) {
    const pathDef = preset.detailPaths[detailIndex];
    if (pathDef.type === "line") {
      drawAnimatedElectricSegment(ctx, pathDef, now, baseSeed + 700 + detailIndex * 31, theme, { reducedEffects });
    } else if (pathDef.type === "polyline") {
      drawAnimatedElectricPolyline(ctx, pathDef.points, now, baseSeed + 700 + detailIndex * 31, theme, reducedEffects);
    }
  }
}
