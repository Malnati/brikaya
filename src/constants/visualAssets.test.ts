// src/constants/visualAssets.test.ts
import {
  sprBrickMetalSteelDentedOne,
  sprBrickMetalSteelDentedTwo,
  sprBrickMetalSteelHighContrastDentedOne,
  sprBrickMetalSteelHighContrastDentedTwo,
  sprBrickMetalSteelSunsetDentedOne,
  sprBrickMetalSteelSunsetDentedTwo,
  VISUAL_ASSET_CATALOG,
  VISUAL_ASSET_PATHS,
} from "./visualAssets";

const METAL_DENT_BRICK_PATH_PATTERN =
  /^\/assets\/visual\/bricks\/spr-brick-metal-steel.*\.svg$/;
const METAL_DENTED_ASSETS = [
  {
    variableName: "sprBrickMetalSteelDentedOne",
    path: sprBrickMetalSteelDentedOne,
    semanticRole: "brick-metal-steel-dented-one",
    state: "damaged",
  },
  {
    variableName: "sprBrickMetalSteelDentedTwo",
    path: sprBrickMetalSteelDentedTwo,
    semanticRole: "brick-metal-steel-dented-two",
    state: "critical",
  },
  {
    variableName: "sprBrickMetalSteelHighContrastDentedOne",
    path: sprBrickMetalSteelHighContrastDentedOne,
    semanticRole: "brick-metal-steel-high-contrast-dented-one",
    state: "damaged",
  },
  {
    variableName: "sprBrickMetalSteelHighContrastDentedTwo",
    path: sprBrickMetalSteelHighContrastDentedTwo,
    semanticRole: "brick-metal-steel-high-contrast-dented-two",
    state: "critical",
  },
  {
    variableName: "sprBrickMetalSteelSunsetDentedOne",
    path: sprBrickMetalSteelSunsetDentedOne,
    semanticRole: "brick-metal-steel-sunset-dented-one",
    state: "damaged",
  },
  {
    variableName: "sprBrickMetalSteelSunsetDentedTwo",
    path: sprBrickMetalSteelSunsetDentedTwo,
    semanticRole: "brick-metal-steel-sunset-dented-two",
    state: "critical",
  },
] as const;

describe("visual assets metálicos amassados", () => {
  it("mantém cada estado amassado no mapa de paths e no catálogo visual", () => {
    for (const expectedAsset of METAL_DENTED_ASSETS) {
      const assetKey =
        expectedAsset.variableName as keyof typeof VISUAL_ASSET_PATHS;
      const catalogEntry = VISUAL_ASSET_CATALOG.find(
        (entry) => entry.variableName === expectedAsset.variableName,
      );

      expect(VISUAL_ASSET_PATHS[assetKey]).toBe(expectedAsset.path);
      expect(expectedAsset.path).toMatch(METAL_DENT_BRICK_PATH_PATTERN);
      expect(catalogEntry).toMatchObject({
        variableName: expectedAsset.variableName,
        path: expectedAsset.path,
        group: "brick",
        semanticRole: expectedAsset.semanticRole,
        state: expectedAsset.state,
        width: 48,
        height: 20,
      });
    }
    expect(new Set(METAL_DENTED_ASSETS.map((asset) => asset.path)).size).toBe(
      METAL_DENTED_ASSETS.length,
    );
  });
});
