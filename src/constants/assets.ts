// src/constants/assets.ts

export const ASSET_PATHS = {
  BALL: '/assets/ball.svg',
  PADDLE: '/assets/paddle.svg',
  BRICK_RED: '/assets/bricks/brick-red.svg',
  BRICK_BLUE: '/assets/bricks/brick-blue.svg',
  BRICK_GREEN: '/assets/bricks/brick-green.svg',
  BRICK_YELLOW: '/assets/bricks/brick-yellow.svg',
  BRICK_PURPLE: '/assets/bricks/brick-purple.svg'
} as const;

export const RUNTIME_IMAGE_ASSET_PATHS = Object.values(ASSET_PATHS);

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
