import { drawElectricEdgesPreset } from "./electric-palette-electric-edge.mjs";
import { ElectricEnergyBallPreview } from "./electric-palette-energy-ball.mjs";

const SHIELD_PERIMETER_POINTS = [
  [34, 8],
  [62, 8],
  [69, 15],
  [69, 33],
  [62, 40],
  [34, 40],
  [27, 33],
  [27, 15],
];

const CAPACITOR_LEFT_PLATE = [
  [36, 8],
  [41, 10.5],
  [41, 34.5],
  [36, 40],
  [31, 37.5],
  [31, 13.5],
];

const CAPACITOR_RIGHT_PLATE = [
  [60, 8],
  [65, 10.5],
  [65, 34.5],
  [60, 40],
  [55, 37.5],
  [55, 13.5],
];

export const COMPONENT_ENERGY_PRESETS = {
  "spr-component-basic-yellow-normal": {
    colorTheme: "red",
    shape: "led-diode",
    ballOnTop: true,
    center: { x: 48, y: 24 },
    radius: 11,
    outlineStroke: "#d8f7ff",
    terminalColor: "#d8f7ff",
    terminalWidth: 2.2,
    clipPaths: [],
    fillPaths: [{ type: "rect", x: 62, y: 12, w: 4, h: 24, fill: "#ff8a9a" }],
    outlinePaths: [
      { type: "polygon", points: [[35, 12], [58, 24], [35, 36]] },
      { type: "rect", x: 62, y: 12, w: 4, h: 24 },
    ],
    terminalStubs: [
      { x1: 24, y1: 24, x2: 34, y2: 24 },
      { x1: 62, y1: 24, x2: 72, y2: 24 },
    ],
    detailPaths: [
      { type: "line", x1: 55, y1: 10, x2: 66, y2: 3, color: "#d8f7ff", opacity: 0.65, width: 2.2 },
      { type: "line", x1: 60, y1: 15, x2: 73, y2: 11, color: "#d8f7ff", opacity: 0.65, width: 2.2 },
      { type: "line", x1: 64, y1: 3, x2: 66, y2: 3, color: "#d8f7ff", opacity: 0.65, width: 2.2 },
      { type: "line", x1: 65, y1: 6, x2: 64, y2: 3, color: "#d8f7ff", opacity: 0.65, width: 2.2 },
      { type: "line", x1: 71, y1: 10, x2: 73, y2: 11, color: "#d8f7ff", opacity: 0.65, width: 2.2 },
      { type: "line", x1: 73, y1: 11, x2: 71, y2: 13, color: "#d8f7ff", opacity: 0.65, width: 2.2 },
    ],
  },
  "spr-component-metal-steel-dented-one": {
    renderMode: "electric-edges",
    electricTheme: "yellow",
    shape: "shield-module",
    terminalWidth: 3,
    interiorFill: {
      type: "polygon",
      points: SHIELD_PERIMETER_POINTS,
      fill: "rgba(5, 40, 54, 0.55)",
    },
    perimeterPaths: [{ type: "polygon", points: SHIELD_PERIMETER_POINTS }],
    terminalStubs: [
      { x1: 25, y1: 17, x2: 30, y2: 17 },
      { x1: 25, y1: 24, x2: 30, y2: 24 },
      { x1: 25, y1: 31, x2: 30, y2: 31 },
      { x1: 66, y1: 17, x2: 71, y2: 17 },
      { x1: 66, y1: 24, x2: 71, y2: 24 },
      { x1: 66, y1: 31, x2: 71, y2: 31 },
    ],
    detailPaths: [
      { type: "line", x1: 37, y1: 16, x2: 59, y2: 16 },
      { type: "line", x1: 34, y1: 24, x2: 62, y2: 24 },
      { type: "line", x1: 37, y1: 32, x2: 55, y2: 32 },
      { type: "polyline", points: [[42, 13], [47, 20], [44, 25], [51, 34]] },
    ],
  },
  "spr-component-basic-purple-normal": {
    renderMode: "electric-edges",
    electricTheme: "purple",
    shape: "capacitor",
    terminalWidth: 2.2,
    interiorFills: [
      { type: "polygon", points: CAPACITOR_LEFT_PLATE, fill: "rgba(20, 8, 40, 0.55)" },
      { type: "polygon", points: CAPACITOR_RIGHT_PLATE, fill: "rgba(20, 8, 40, 0.55)" },
    ],
    perimeterPaths: [
      { type: "polygon", points: CAPACITOR_LEFT_PLATE },
      { type: "polygon", points: CAPACITOR_RIGHT_PLATE },
    ],
    terminalStubs: [
      { x1: 24, y1: 24, x2: 31, y2: 24 },
      { x1: 65, y1: 24, x2: 72, y2: 24 },
    ],
    detailPaths: [
      { type: "line", x1: 46, y1: 10, x2: 46, y2: 38 },
      { type: "line", x1: 50, y1: 10, x2: 50, y2: 38 },
    ],
  },
  "spr-component-metal-steel-dented-two": {
    colorTheme: "green",
    shape: "shield-module",
    center: { x: 48, y: 24 },
    radius: 10,
    outlineStroke: "#d8f7ff",
    terminalColor: "#64f5d6",
    terminalWidth: 3,
    clipPaths: [
      {
        type: "polygon",
        points: SHIELD_PERIMETER_POINTS,
      },
    ],
    terminalStubs: [
      { x1: 25, y1: 17, x2: 30, y2: 17 },
      { x1: 25, y1: 24, x2: 30, y2: 24 },
      { x1: 25, y1: 31, x2: 30, y2: 31 },
      { x1: 66, y1: 17, x2: 71, y2: 17 },
      { x1: 66, y1: 24, x2: 71, y2: 24 },
      { x1: 66, y1: 31, x2: 71, y2: 31 },
    ],
    detailPaths: [
      { type: "line", x1: 37, y1: 16, x2: 59, y2: 16 },
      { type: "line", x1: 34, y1: 24, x2: 62, y2: 24 },
      { type: "line", x1: 37, y1: 32, x2: 55, y2: 32 },
      { type: "line", x1: 42, y1: 13, x2: 47, y2: 20 },
      { type: "line", x1: 47, y1: 20, x2: 44, y2: 25 },
      { type: "line", x1: 44, y1: 25, x2: 51, y2: 34 },
      { type: "line", x1: 57, y1: 12, x2: 53, y2: 19 },
      { type: "line", x1: 53, y1: 19, x2: 58, y2: 25 },
      { type: "line", x1: 58, y1: 25, x2: 52, y2: 36 },
    ],
  },
};

function traceClipPath(ctx, pathDef) {
  if (pathDef.type === "polygon") {
    const [first, ...rest] = pathDef.points;
    ctx.moveTo(first[0], first[1]);
    for (const [x, y] of rest) ctx.lineTo(x, y);
    ctx.closePath();
    return;
  }
  if (pathDef.type === "rect") {
    ctx.rect(pathDef.x, pathDef.y, pathDef.w, pathDef.h);
  }
}

function drawDetailPath(ctx, pathDef, defaultColor, defaultWidth, defaultOpacity = 0.52) {
  if (pathDef.type !== "line") return;
  ctx.strokeStyle = pathDef.color ?? defaultColor;
  ctx.lineWidth = pathDef.width ?? defaultWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = pathDef.opacity ?? defaultOpacity;
  ctx.beginPath();
  ctx.moveTo(pathDef.x1, pathDef.y1);
  ctx.lineTo(pathDef.x2, pathDef.y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawTerminals(ctx, preset) {
  ctx.save();
  ctx.strokeStyle = preset.terminalColor;
  ctx.lineWidth = preset.terminalWidth;
  ctx.lineCap = "round";
  for (const stub of preset.terminalStubs) {
    ctx.beginPath();
    ctx.moveTo(stub.x1, stub.y1);
    ctx.lineTo(stub.x2, stub.y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStaticLayers(ctx, preset) {
  ctx.save();
  for (const pathDef of preset.fillPaths ?? []) {
    ctx.fillStyle = pathDef.fill ?? preset.outlineStroke;
    ctx.beginPath();
    traceClipPath(ctx, pathDef);
    ctx.fill();
  }

  ctx.strokeStyle = preset.outlineStroke;
  ctx.lineWidth = preset.shape === "led-diode" ? 2.4 : 2.2;
  ctx.lineJoin = "round";
  const outlinePaths = preset.outlinePaths ?? preset.clipPaths;
  for (const pathDef of outlinePaths) {
    ctx.beginPath();
    traceClipPath(ctx, pathDef);
    ctx.stroke();
  }
  for (const pathDef of preset.detailPaths ?? []) {
    drawDetailPath(ctx, pathDef, "#052836", 2, 0.52);
  }
  ctx.restore();
}

function drawEnergyBall(ctx, preset, now) {
  ctx.save();
  if (preset.clipPaths.length > 0) {
    ctx.beginPath();
    for (const pathDef of preset.clipPaths) {
      traceClipPath(ctx, pathDef);
    }
    ctx.clip();
  }
  this.energyBall.draw(ctx, now);
  ctx.restore();
}

export class ElectricComponentEnergyPreview {
  constructor(componentId) {
    this.preset = COMPONENT_ENERGY_PRESETS[componentId];
    if (!this.preset) {
      throw new Error(`Unknown component energy preset: ${componentId}`);
    }
    if (this.preset.renderMode !== "electric-edges") {
      this.energyBall = new ElectricEnergyBallPreview(
        this.preset.center.x,
        this.preset.center.y,
        this.preset.radius,
        this.preset.colorTheme,
      );
    }
  }

  draw(ctx, now = Date.now()) {
    const preset = this.preset;
    ctx.fillStyle = "#080816";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (preset.renderMode === "electric-edges") {
      drawElectricEdgesPreset(ctx, preset, now);
      return;
    }

    drawTerminals(ctx, preset);

    if (preset.ballOnTop) {
      drawStaticLayers(ctx, preset);
      drawEnergyBall.call(this, ctx, preset, now);
      return;
    }

    drawEnergyBall.call(this, ctx, preset, now);
    drawStaticLayers(ctx, preset);
  }
}

export function isAnimatedCircuitComponent(componentId) {
  return Object.prototype.hasOwnProperty.call(COMPONENT_ENERGY_PRESETS, componentId);
}
