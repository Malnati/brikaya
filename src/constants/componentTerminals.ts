// src/constants/componentTerminals.ts
import { GAME_VISUAL_ASSET_ROLES, type GameVisualAssetRole } from "../utils/visualAssetResolver";

export type ComponentShape =
  | "capacitor"
  | "resistor"
  | "chip"
  | "led-diode"
  | "inductor"
  | "shield-module";

export interface ComponentTerminalRatios {
  left: number;
  right: number;
}

const VIEWBOX_WIDTH = 96;

export const COMPONENT_TERMINAL_RATIOS: Record<ComponentShape, ComponentTerminalRatios> = {
  capacitor: { left: 31 / VIEWBOX_WIDTH, right: 65 / VIEWBOX_WIDTH },
  resistor: { left: 20 / VIEWBOX_WIDTH, right: 76 / VIEWBOX_WIDTH },
  chip: { left: 21 / VIEWBOX_WIDTH, right: 75 / VIEWBOX_WIDTH },
  "led-diode": { left: 34 / VIEWBOX_WIDTH, right: 66 / VIEWBOX_WIDTH },
  inductor: { left: 22 / VIEWBOX_WIDTH, right: 74 / VIEWBOX_WIDTH },
  "shield-module": { left: 25 / VIEWBOX_WIDTH, right: 71 / VIEWBOX_WIDTH },
};

const BRICK_ROLE_TO_COMPONENT_SHAPE: Partial<
  Record<GameVisualAssetRole, ComponentShape>
> = {
  [GAME_VISUAL_ASSET_ROLES.brickRed]: "capacitor",
  [GAME_VISUAL_ASSET_ROLES.brickBlue]: "resistor",
  [GAME_VISUAL_ASSET_ROLES.brickGreen]: "chip",
  [GAME_VISUAL_ASSET_ROLES.brickYellow]: "led-diode",
  [GAME_VISUAL_ASSET_ROLES.brickPurple]: "inductor",
  [GAME_VISUAL_ASSET_ROLES.brickMetalIntact]: "shield-module",
  [GAME_VISUAL_ASSET_ROLES.brickMetalDentedOne]: "shield-module",
  [GAME_VISUAL_ASSET_ROLES.brickMetalDentedTwo]: "shield-module",
};

export function getComponentTerminalRatios(
  assetRole: GameVisualAssetRole,
): ComponentTerminalRatios {
  const shape = BRICK_ROLE_TO_COMPONENT_SHAPE[assetRole];
  if (!shape) {
    return { left: 0, right: 1 };
  }

  return COMPONENT_TERMINAL_RATIOS[shape];
}
