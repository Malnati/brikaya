// src/constants/assets.test.ts
import { ASSET_PATHS, COMPONENT_COLORS, RUNTIME_IMAGE_ASSET_PATHS } from "./assets";
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

const EXPECTED_RUNTIME_ASSETS = [
  sprBallPlayerDefault,
  sprPaddlePlayerDefault,
  sprComponentBasicRedNormal,
  sprComponentBasicBlueNormal,
  sprComponentBasicGreenNormal,
  sprComponentBasicYellowNormal,
  sprComponentBasicPurpleNormal,
  sprComponentMetalSteelNormal,
] as const;

const VISUAL_ASSET_PREFIX = "/assets/visual/";
const SVG_EXTENSION = ".svg";

describe("runtime game assets", () => {
  it("usa somente SVGs locais nomeados semanticamente para bola, raquete e componentes", () => {
    expect(Object.values(ASSET_PATHS)).toEqual(EXPECTED_RUNTIME_ASSETS);
    expect(RUNTIME_IMAGE_ASSET_PATHS).toEqual(EXPECTED_RUNTIME_ASSETS);
    expect(COMPONENT_COLORS).toEqual(EXPECTED_RUNTIME_ASSETS.slice(2, 7));

    for (const assetPath of RUNTIME_IMAGE_ASSET_PATHS) {
      expect(assetPath).toMatch(new RegExp(`^${VISUAL_ASSET_PREFIX}`));
      expect(assetPath).toMatch(new RegExp(`${SVG_EXTENSION}$`));
      expect(assetPath).not.toMatch(/https?:|data:|\.png|\.jpg|\.jpeg|\.webp/i);
    }
  });
});
