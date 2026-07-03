// src/constants/assets.ts
import {
  sprBallPlayerDefault,
  sprBrickBasicBlueNormal,
  sprBrickBasicGreenNormal,
  sprBrickBasicPurpleNormal,
  sprBrickBasicRedNormal,
  sprBrickBasicYellowNormal,
  sprPaddlePlayerDefault,
} from './visualAssets';

export const ASSET_PATHS = {
  BALL: sprBallPlayerDefault,
  PADDLE: sprPaddlePlayerDefault,
  BRICK_RED: sprBrickBasicRedNormal,
  BRICK_BLUE: sprBrickBasicBlueNormal,
  BRICK_GREEN: sprBrickBasicGreenNormal,
  BRICK_YELLOW: sprBrickBasicYellowNormal,
  BRICK_PURPLE: sprBrickBasicPurpleNormal,
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

export const BRICK_IMAGE_SIZE = {
  WIDTH: 32,
  HEIGHT: 16,
} as const;

export const BRICK_COLORS = [
  ASSET_PATHS.BRICK_RED,
  ASSET_PATHS.BRICK_BLUE,
  ASSET_PATHS.BRICK_GREEN,
  ASSET_PATHS.BRICK_YELLOW,
  ASSET_PATHS.BRICK_PURPLE,
] as const;
