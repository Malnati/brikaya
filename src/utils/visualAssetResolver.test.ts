// src/utils/visualAssetResolver.test.ts
import { IMAGE_SET_IDS } from "../constants/appearance";

import {
  GAME_VISUAL_ASSET_ROLES,
  getRuntimeVisualAssetPathsForImageSet,
  resolveGameVisualAssetPath,
} from "./visualAssetResolver";

const SVG_PATTERN = /^\/assets\/visual\/.+\.svg$/;
const RUNTIME_VISUAL_ROLE_COUNT = 18;
const EXPECTED_IMAGE_SET_IDS = [
  "retro-default",
  "high-contrast",
  "sunset-cabinet",
  "real-metro-tunnel",
  "real-workshop-steel",
  "real-bio-lab-glass",
  "real-temple-stone",
  "real-orbital-deck",
] as const;

describe("visual asset resolver", () => {
  it("resolve paths SVG por papel no conjunto padrão", () => {
    expect(
      resolveGameVisualAssetPath("retro-default", GAME_VISUAL_ASSET_ROLES.ball),
    ).toBe("/assets/visual/sprites/spr-ball-player-default.svg");
    expect(
      resolveGameVisualAssetPath(
        "retro-default",
        GAME_VISUAL_ASSET_ROLES.paddle,
      ),
    ).toBe("/assets/visual/sprites/spr-paddle-player-default.svg");
    expect(
      resolveGameVisualAssetPath(
        "retro-default",
        GAME_VISUAL_ASSET_ROLES.brickRed,
      ),
    ).toBe("/assets/visual/bricks/spr-brick-basic-red-normal.svg");
  });

  it("resolve variantes SVG alto contraste e sunset", () => {
    expect(
      resolveGameVisualAssetPath(
        "high-contrast",
        GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay,
      ),
    ).toBe("/assets/visual/vfx/vfx-level-up-star-high-contrast-overlay.svg");
    expect(
      resolveGameVisualAssetPath(
        "sunset-cabinet",
        GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke,
      ),
    ).toBe("/assets/visual/vfx/vfx-game-over-rip-sunset-smoke.svg");
  });

  it("resolve cinco conjuntos realistas diferentes", () => {
    expect(IMAGE_SET_IDS).toEqual(EXPECTED_IMAGE_SET_IDS);
    expect(
      resolveGameVisualAssetPath(
        "real-metro-tunnel",
        GAME_VISUAL_ASSET_ROLES.ball,
      ),
    ).toBe("/assets/visual/sprites/spr-ball-player-metro-real-default.svg");
    expect(
      resolveGameVisualAssetPath(
        "real-workshop-steel",
        GAME_VISUAL_ASSET_ROLES.paddle,
      ),
    ).toBe("/assets/visual/sprites/spr-paddle-player-garage-real-default.svg");
    expect(
      resolveGameVisualAssetPath(
        "real-bio-lab-glass",
        GAME_VISUAL_ASSET_ROLES.brickBlue,
      ),
    ).toBe("/assets/visual/bricks/spr-brick-basic-blue-lab-real-normal.svg");
    expect(
      resolveGameVisualAssetPath(
        "real-temple-stone",
        GAME_VISUAL_ASSET_ROLES.powerupLaserFan,
      ),
    ).toBe("/assets/visual/powerups/spr-powerup-laser-fan-temple-real.svg");
    expect(
      resolveGameVisualAssetPath(
        "real-orbital-deck",
        GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay,
      ),
    ).toBe("/assets/visual/vfx/vfx-countdown-circle-orbital-real-overlay.svg");
  });

  it("lista somente SVGs sem repetição por conjunto", () => {
    for (const imageSetId of EXPECTED_IMAGE_SET_IDS) {
      const paths = getRuntimeVisualAssetPathsForImageSet(imageSetId);
      expect(paths).toHaveLength(RUNTIME_VISUAL_ROLE_COUNT);
      expect(new Set(paths).size).toBe(paths.length);
      expect(paths.every((path) => SVG_PATTERN.test(path))).toBe(true);
    }
  });
});
