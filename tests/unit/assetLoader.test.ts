// tests/unit/assetLoader.test.ts
import { AssetLoader } from "../../src/utils/assetLoader";

const TEST_ASSET_PATH = "/assets/visual/sprites/test-lazy-loader.svg";
const LOAD_DELAY_MS = 0;

const originalImage = global.Image;

class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  srcValue = "";

  set src(value: string) {
    this.srcValue = value;
    window.setTimeout(() => this.onload?.(), LOAD_DELAY_MS);
  }

  get src() {
    return this.srcValue;
  }
}

describe("AssetLoader lazy loading", () => {
  beforeEach(() => {
    Object.defineProperty(global, "Image", {
      configurable: true,
      value: MockImage,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "Image", {
      configurable: true,
      value: originalImage,
    });
  });

  it("inicia o carregamento sob demanda e reutiliza a imagem carregada", async () => {
    expect(AssetLoader.getOrLoadImage(TEST_ASSET_PATH)).toBeNull();

    const loadedImage = await AssetLoader.preloadImage(TEST_ASSET_PATH);

    expect(loadedImage).toBeInstanceOf(MockImage);
    expect(AssetLoader.getOrLoadImage(TEST_ASSET_PATH)).toBe(loadedImage);
  });
});
