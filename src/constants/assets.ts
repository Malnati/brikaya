// src/constants/assets.ts

export const ASSET_PATHS = {
  BALL: '/assets/ballGrey.png',
  PADDLE: '/assets/paddle.png',
  BRICK_RED: '/assets/brick_red.png',
  BRICK_BLUE: '/assets/brick_blue.png',
  BRICK_GREEN: '/assets/brick_green.png',
  BRICK_YELLOW: '/assets/brick_yellow.png',
  BRICK_PURPLE: '/assets/brick_purple.png'
} as const;

export const BALL_IMAGE_SIZE = {
  WIDTH: 16,
  HEIGHT: 16
} as const;

export const PADDLE_IMAGE_SIZE = {
  WIDTH: 75,
  HEIGHT: 10
} as const;

export const BRICK_IMAGE_SIZE = {
  WIDTH: 32,
  HEIGHT: 16
} as const;

export const BRICK_COLORS = [
  ASSET_PATHS.BRICK_RED,
  ASSET_PATHS.BRICK_BLUE,
  ASSET_PATHS.BRICK_GREEN,
  ASSET_PATHS.BRICK_YELLOW,
  ASSET_PATHS.BRICK_PURPLE
] as const;