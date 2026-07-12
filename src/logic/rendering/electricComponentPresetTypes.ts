// src/logic/rendering/electricComponentPresetTypes.ts
export interface ElectricSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
}

export interface InteriorFillDef {
  type: "polygon";
  points: [number, number][];
  fill: string;
}

export interface LineDetailPath {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  opacity?: number;
  width?: number;
}

export interface PolylineDetailPath {
  type: "polyline";
  points: [number, number][];
}

export type DetailPathDef = LineDetailPath | PolylineDetailPath;

export interface ElectricEdgesPreset {
  renderMode: "electric-edges";
  electricTheme: "yellow" | "purple";
  shape: string;
  terminalWidth: number;
  interiorFill?: InteriorFillDef;
  interiorFills?: InteriorFillDef[];
  perimeterPaths: { type: "polygon"; points: [number, number][] }[];
  terminalStubs: { x1: number; y1: number; x2: number; y2: number }[];
  detailPaths: DetailPathDef[];
}
