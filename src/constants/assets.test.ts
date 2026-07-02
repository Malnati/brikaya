// src/constants/assets.test.ts
import { ASSET_PATHS, BRICK_COLORS, RUNTIME_IMAGE_ASSET_PATHS } from './assets';

const EXPECTED_RUNTIME_ASSETS = [
  '/assets/ball.svg',
  '/assets/paddle.svg',
  '/assets/bricks/brick-red.svg',
  '/assets/bricks/brick-blue.svg',
  '/assets/bricks/brick-green.svg',
  '/assets/bricks/brick-yellow.svg',
  '/assets/bricks/brick-purple.svg',
] as const;

describe('runtime game assets', () => {
  it('usa somente SVGs locais para bola, raquete e tijolos', () => {
    expect(Object.values(ASSET_PATHS)).toEqual(EXPECTED_RUNTIME_ASSETS);
    expect(RUNTIME_IMAGE_ASSET_PATHS).toEqual(EXPECTED_RUNTIME_ASSETS);
    expect(BRICK_COLORS).toEqual(EXPECTED_RUNTIME_ASSETS.slice(2));

    for (const assetPath of RUNTIME_IMAGE_ASSET_PATHS) {
      expect(assetPath).toMatch(/^\/assets\//);
      expect(assetPath).toMatch(/\.svg$/);
      expect(assetPath).not.toMatch(/https?:|data:|\.png|\.jpg|\.jpeg|\.webp/i);
    }
  });
});
