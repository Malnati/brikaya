// src/constants/visualAssets.test.ts
import {
  sprComponentMetalSteelDentedOne,
  sprComponentMetalSteelDentedTwo,
  sprComponentMetalSteelHighContrastDentedOne,
  sprComponentMetalSteelHighContrastDentedTwo,
  sprComponentMetalSteelSunsetDentedOne,
  sprComponentMetalSteelSunsetDentedTwo,
  VISUAL_ASSET_CATALOG,
  VISUAL_ASSET_PATHS,
} from "./visualAssets";

const METAL_DENT_BRICK_PATH_PATTERN =
  /^\/assets\/visual\/components\/spr-component-metal-steel.*\.svg$/;
const METAL_DENTED_ASSETS = [
  {
    variableName: "sprComponentMetalSteelDentedOne",
    path: sprComponentMetalSteelDentedOne,
    semanticRole: "component-metal-steel-dented-one",
    state: "damaged",
  },
  {
    variableName: "sprComponentMetalSteelDentedTwo",
    path: sprComponentMetalSteelDentedTwo,
    semanticRole: "component-metal-steel-dented-two",
    state: "critical",
  },
  {
    variableName: "sprComponentMetalSteelHighContrastDentedOne",
    path: sprComponentMetalSteelHighContrastDentedOne,
    semanticRole: "component-metal-steel-high-contrast-dented-one",
    state: "damaged",
  },
  {
    variableName: "sprComponentMetalSteelHighContrastDentedTwo",
    path: sprComponentMetalSteelHighContrastDentedTwo,
    semanticRole: "component-metal-steel-high-contrast-dented-two",
    state: "critical",
  },
  {
    variableName: "sprComponentMetalSteelSunsetDentedOne",
    path: sprComponentMetalSteelSunsetDentedOne,
    semanticRole: "component-metal-steel-sunset-dented-one",
    state: "damaged",
  },
  {
    variableName: "sprComponentMetalSteelSunsetDentedTwo",
    path: sprComponentMetalSteelSunsetDentedTwo,
    semanticRole: "component-metal-steel-sunset-dented-two",
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
        group: "component",
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
