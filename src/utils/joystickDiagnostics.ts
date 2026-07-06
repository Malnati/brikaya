export const JOYSTICK_DIAGNOSTIC_MAX_SAMPLES = 2000;
const SVG_PANEL_WIDTH = 320;
const SVG_PANEL_HEIGHT = 320;
const SVG_GAP = 28;
const SVG_LABEL_Y = 20;
const SVG_INSET = 32;
const ISO_FILENAME_UNSAFE_PATTERN = /[:.]/g;

export type JoystickDiagnosticPhase = "start" | "move" | "end" | "cancel";
export type JoystickDiagnosticInputType = "pointer" | "touch";
export type JoystickDiagnosticReason =
  | "inside-joystick-circle"
  | "outside-joystick-circle"
  | "invalid-geometry";

export interface JoystickDiagnosticPoint {
  x: number;
  y: number;
}

export interface JoystickDiagnosticRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface JoystickPaddleDiagnosticSnapshot {
  x: number;
  y: number;
  width: number;
  height: number;
  radial?: {
    centerX?: number;
    centerY?: number;
    radius?: number;
    thickness?: number;
    startAngle?: number;
    centerAngle?: number;
    endAngle?: number;
  };
}

export interface JoystickDiagnosticSample {
  sequence: number;
  timestamp: number;
  phase: JoystickDiagnosticPhase;
  inputType: JoystickDiagnosticInputType;
  accepted: boolean;
  reason?: JoystickDiagnosticReason;
  clientPoint: JoystickDiagnosticPoint;
  joystick: {
    rect: JoystickDiagnosticRect;
    normalized?: JoystickDiagnosticPoint;
    visual?: JoystickDiagnosticPoint;
    radius?: number;
    distanceFromCenter?: number;
  };
  canvas: {
    rect: JoystickDiagnosticRect;
    size: { width: number; height: number };
    mappedClientPoint?: JoystickDiagnosticPoint;
    mappedCanvasPoint?: JoystickDiagnosticPoint;
  };
  paddle: JoystickPaddleDiagnosticSnapshot | null;
}

export interface JoystickDiagnosticState {
  samples: JoystickDiagnosticSample[];
  truncated: boolean;
}

export interface JoystickDiagnosticExportInput extends JoystickDiagnosticState {
  versionLabel: string;
  publicUrl: string;
  userAgent: string;
  viewport: { width: number; height: number };
  exportedAt?: string;
}

export interface JoystickDiagnosticExport {
  exportType: "brikaya-turret-joystick-diagnostic";
  exportVersion: 1;
  exportedAt: string;
  versionLabel: string;
  publicUrl: string;
  userAgent: string;
  viewport: { width: number; height: number };
  summary: {
    totalSamples: number;
    acceptedSamples: number;
    rejectedSamples: number;
    truncated: boolean;
  };
  diagnosticSvg: string;
  samples: JoystickDiagnosticSample[];
}

export function createEmptyJoystickDiagnosticState(): JoystickDiagnosticState {
  return { samples: [], truncated: false };
}

export function appendJoystickDiagnosticSample(
  state: JoystickDiagnosticState,
  sample: JoystickDiagnosticSample,
): JoystickDiagnosticState {
  const samples = [...state.samples, sample];
  const overflow = samples.length - JOYSTICK_DIAGNOSTIC_MAX_SAMPLES;

  if (overflow <= 0) {
    return { samples, truncated: state.truncated };
  }

  return {
    samples: samples.slice(overflow),
    truncated: true,
  };
}

export function buildJoystickDiagnosticExport({
  samples,
  truncated,
  versionLabel,
  publicUrl,
  userAgent,
  viewport,
  exportedAt = new Date().toISOString(),
}: JoystickDiagnosticExportInput): JoystickDiagnosticExport {
  const acceptedSamples = samples.filter((sample) => sample.accepted).length;

  return {
    exportType: "brikaya-turret-joystick-diagnostic",
    exportVersion: 1,
    exportedAt,
    versionLabel,
    publicUrl,
    userAgent,
    viewport,
    summary: {
      totalSamples: samples.length,
      acceptedSamples,
      rejectedSamples: samples.length - acceptedSamples,
      truncated,
    },
    diagnosticSvg: buildJoystickDiagnosticSvg(samples),
    samples,
  };
}

export function createJoystickDiagnosticDownloadName(date = new Date()) {
  return `brikaya-torreta-joystick-${date
    .toISOString()
    .replace(ISO_FILENAME_UNSAFE_PATTERN, "-")}.json`;
}

export function buildJoystickDiagnosticSvg(
  samples: readonly JoystickDiagnosticSample[],
): string {
  const playfieldX = SVG_PANEL_WIDTH + SVG_GAP;
  const width = SVG_PANEL_WIDTH * 2 + SVG_GAP;
  const height = SVG_PANEL_HEIGHT;
  const joystickPoints = samples
    .filter((sample) => sample.joystick.normalized)
    .map((sample) => {
      const normalized = sample.joystick.normalized!;
      return {
        x: SVG_INSET + normalized.x * (SVG_PANEL_WIDTH - SVG_INSET * 2),
        y: SVG_INSET + normalized.y * (SVG_PANEL_HEIGHT - SVG_INSET * 2),
        accepted: sample.accepted,
      };
    });
  const paddlePoints = samples
    .filter((sample) => sample.canvas.mappedCanvasPoint)
    .map((sample) => {
      const canvasPoint = sample.canvas.mappedCanvasPoint!;
      const canvasWidth = sample.canvas.size.width || 1;
      const canvasHeight = sample.canvas.size.height || 1;
      return {
        x:
          playfieldX +
          SVG_INSET +
          (canvasPoint.x / canvasWidth) * (SVG_PANEL_WIDTH - SVG_INSET * 2),
        y:
          SVG_INSET +
          (canvasPoint.y / canvasHeight) * (SVG_PANEL_HEIGHT - SVG_INSET * 2),
        accepted: sample.accepted,
      };
    });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagnóstico do joystick da Torreta">`,
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#06101f"/>`,
    `<text x="${SVG_INSET}" y="${SVG_LABEL_Y}" fill="#7df9ff" font-size="14" font-family="monospace">Joystick</text>`,
    `<text x="${playfieldX + SVG_INSET}" y="${SVG_LABEL_Y}" fill="#75f0a1" font-size="14" font-family="monospace">Cama elástica</text>`,
    `<circle cx="${SVG_PANEL_WIDTH / 2}" cy="${SVG_PANEL_HEIGHT / 2}" r="${(SVG_PANEL_WIDTH - SVG_INSET * 2) / 2}" fill="none" stroke="#00d4ff" stroke-width="2" opacity="0.8"/>`,
    `<rect x="${playfieldX + SVG_INSET}" y="${SVG_INSET}" width="${SVG_PANEL_WIDTH - SVG_INSET * 2}" height="${SVG_PANEL_HEIGHT - SVG_INSET * 2}" fill="none" stroke="#75f0a1" stroke-width="2" opacity="0.8"/>`,
    renderPolyline(joystickPoints, "#00d4ff"),
    renderPolyline(paddlePoints, "#75f0a1"),
    ...joystickPoints.map((point) => renderPoint(point, "#00d4ff")),
    ...paddlePoints.map((point) => renderPoint(point, "#75f0a1")),
    `</svg>`,
  ].join("");
}

function renderPolyline(
  points: readonly { x: number; y: number; accepted: boolean }[],
  color: string,
) {
  const acceptedPoints = points.filter((point) => point.accepted);
  if (acceptedPoints.length < 2) return "";

  return `<polyline points="${acceptedPoints
    .map((point) => `${formatSvgNumber(point.x)},${formatSvgNumber(point.y)}`)
    .join(" ")}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>`;
}

function renderPoint(
  point: { x: number; y: number; accepted: boolean },
  acceptedColor: string,
) {
  const color = point.accepted ? acceptedColor : "#ffbf5a";
  return `<circle cx="${formatSvgNumber(point.x)}" cy="${formatSvgNumber(
    point.y,
  )}" r="4" fill="${color}" opacity="0.92"/>`;
}

function formatSvgNumber(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(3)) : 0;
}
