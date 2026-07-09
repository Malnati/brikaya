// src/constants/assets.ts
import {
  sprBallPlayerDefault,
  sprComponentBasicBlueNormal,
  sprComponentBasicGreenNormal,
  sprComponentBasicPurpleNormal,
  sprComponentMetalSteelNormal,
  sprComponentBasicRedNormal,
  sprComponentBasicYellowNormal,
  sprPaddlePlayerDefault,
} from "./visualAssets";

export const ASSET_PATHS = {
  BALL: sprBallPlayerDefault,
  PADDLE: sprPaddlePlayerDefault,
  COMPONENT_RED: sprComponentBasicRedNormal,
  COMPONENT_BLUE: sprComponentBasicBlueNormal,
  COMPONENT_GREEN: sprComponentBasicGreenNormal,
  COMPONENT_YELLOW: sprComponentBasicYellowNormal,
  COMPONENT_PURPLE: sprComponentBasicPurpleNormal,
  COMPONENT_METAL: sprComponentMetalSteelNormal,
} as const;

export const RUNTIME_IMAGE_ASSET_PATHS = Object.values(ASSET_PATHS);

export const BALL_IMAGE_SIZE = {
  WIDTH: 16,
  HEIGHT: 16,
} as const;

export const PADDLE_IMAGE_SIZE = {
  WIDTH: 75,
  HEIGHT: 10,
} as const;

export const COMPONENT_IMAGE_SIZE = {
  WIDTH: 32,
  HEIGHT: 16,
} as const;

export const COMPONENT_COLORS = [
  ASSET_PATHS.COMPONENT_RED,
  ASSET_PATHS.COMPONENT_BLUE,
  ASSET_PATHS.COMPONENT_GREEN,
  ASSET_PATHS.COMPONENT_YELLOW,
  ASSET_PATHS.COMPONENT_PURPLE,
] as const;
