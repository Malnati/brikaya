// src/utils/visualAssetResolver.test.ts
import {
  GAME_VISUAL_ASSET_ROLES,
  getRuntimeVisualAssetPathsForImageSet,
  resolveGameVisualAssetPath,
} from './visualAssetResolver';

const SVG_PATTERN = /^\/assets\/visual\/.+\.svg$/;
const RUNTIME_VISUAL_ROLE_COUNT = 18;

describe('visual asset resolver', () => {
  it('resolve paths SVG por papel no conjunto padrão', () => {
    expect(
      resolveGameVisualAssetPath(
        'retro-default',
        GAME_VISUAL_ASSET_ROLES.ball,
      ),
    ).toBe('/assets/visual/sprites/spr-ball-player-default.svg');
    expect(
      resolveGameVisualAssetPath(
        'retro-default',
        GAME_VISUAL_ASSET_ROLES.paddle,
      ),
    ).toBe('/assets/visual/sprites/spr-paddle-player-default.svg');
    expect(
      resolveGameVisualAssetPath(
        'retro-default',
        GAME_VISUAL_ASSET_ROLES.brickRed,
      ),
    ).toBe('/assets/visual/bricks/spr-brick-basic-red-normal.svg');
  });

  it('resolve variantes SVG alto contraste', () => {
    expect(
      resolveGameVisualAssetPath(
        'high-contrast',
        GAME_VISUAL_ASSET_ROLES.ball,
      ),
    ).toBe(
      '/assets/visual/sprites/spr-ball-player-high-contrast-default.svg',
    );
    expect(
      resolveGameVisualAssetPath(
        'high-contrast',
        GAME_VISUAL_ASSET_ROLES.paddle,
      ),
    ).toBe(
      '/assets/visual/sprites/spr-paddle-player-high-contrast-default.svg',
    );
    expect(
      resolveGameVisualAssetPath(
        'high-contrast',
        GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay,
      ),
    ).toBe(
      '/assets/visual/vfx/vfx-level-up-star-high-contrast-overlay.svg',
    );
  });

  it('resolve variantes SVG sunset', () => {
    expect(
      resolveGameVisualAssetPath(
        'sunset-cabinet',
        GAME_VISUAL_ASSET_ROLES.ball,
      ),
    ).toBe('/assets/visual/sprites/spr-ball-player-sunset-default.svg');
    expect(
      resolveGameVisualAssetPath(
        'sunset-cabinet',
        GAME_VISUAL_ASSET_ROLES.paddle,
      ),
    ).toBe('/assets/visual/sprites/spr-paddle-player-sunset-default.svg');
    expect(
      resolveGameVisualAssetPath(
        'sunset-cabinet',
        GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke,
      ),
    ).toBe('/assets/visual/vfx/vfx-game-over-rip-sunset-smoke.svg');
  });

  it('lista somente SVGs sem repetição por conjunto', () => {
    for (const imageSetId of [
      'retro-default',
      'high-contrast',
      'sunset-cabinet',
    ] as const) {
      const paths = getRuntimeVisualAssetPathsForImageSet(imageSetId);
      expect(paths).toHaveLength(RUNTIME_VISUAL_ROLE_COUNT);
      expect(new Set(paths).size).toBe(paths.length);
      expect(paths.every((path) => SVG_PATTERN.test(path))).toBe(true);
    }
  });
});
