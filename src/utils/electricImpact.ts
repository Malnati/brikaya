import type { RectBounds } from "./radialGeometry";

export interface ElectricImpactPoint {
  x: number;
  y: number;
}

export type ElectricImpactKind =
  | "component"
  | "wall"
  | "ceiling"
  | "radial-wall";

export interface ElectricImpactEvent {
  kind: ElectricImpactKind;
  origin: ElectricImpactPoint;
  endpoints: [ElectricImpactPoint, ElectricImpactPoint];
  bounds?: RectBounds;
  seed?: number;
}

export type ElectricImpactHandler = (event: ElectricImpactEvent) => void;
