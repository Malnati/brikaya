// tests/unit/canvasSizing.test.ts
import { calculateResponsiveCanvasSize } from "../../src/utils/canvasSizing";

const DESKTOP_COMPACT_AVAILABLE_HEIGHT = 572;
const DESKTOP_COMPACT_MIN_RECOVERED_WIDTH = 850;
const DESKTOP_AVAILABLE_HEIGHT = 524;
const IPAD_PRO_LANDSCAPE_AVAILABLE_HEIGHT = 638;
const MOBILE_LANDSCAPE_FOCUSED_MIN_HEIGHT = 376;
const MOBILE_LANDSCAPE_VISUAL_VIEWPORT_MIN_HEIGHT = 400;
const TABLET_LANDSCAPE_RESERVED_MAX_HEIGHT = 700;

describe("calculateResponsiveCanvasSize", () => {
  it("usa visualViewport quase inteiro em mobile landscape imersivo", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 320,
      containerHeight: 180,
      viewportWidth: 852,
      viewportHeight: 393,
      visualViewportWidth: 852,
      visualViewportHeight: 393,
      rootPaddingInline: 12,
      rootPaddingBlock: 8,
      pointerCoarse: true,
      hoverNone: true,
    });

    expect(size.isImmersiveLandscape).toBe(true);
    expect(size.width).toBeGreaterThanOrEqual(818);
    expect(size.height).toBeGreaterThanOrEqual(
      MOBILE_LANDSCAPE_FOCUSED_MIN_HEIGHT,
    );
  });

  it("usa a altura real reservada ao tabuleiro no landscape imersivo", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 840,
      containerHeight: 337,
      viewportWidth: 852,
      viewportHeight: 393,
      visualViewportWidth: 852,
      visualViewportHeight: 393,
      rootPaddingInline: 12,
      rootPaddingBlock: 8,
      pointerCoarse: true,
      hoverNone: true,
    });

    expect(size.isImmersiveLandscape).toBe(true);
    expect(size.height / 337).toBeGreaterThanOrEqual(0.9);
  });

  it("usa canvas quadrado e quase toda a largura útil no portrait mobile", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 390,
      containerHeight: 760,
      viewportWidth: 393,
      viewportHeight: 852,
      visualViewportWidth: 393,
      visualViewportHeight: 852,
      rootPaddingInline: 12,
      rootPaddingBlock: 12,
      pointerCoarse: true,
      hoverNone: true,
    });

    expect(size.isImmersiveLandscape).toBe(false);
    expect(size.width).toBe(390);
    expect(size.height).toBe(390);
  });

  it("preserva o canvas inteiro visível no desktop sem toque", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 1214,
      containerHeight: 640,
      viewportWidth: 1280,
      viewportHeight: 720,
      visualViewportWidth: 1280,
      visualViewportHeight: 720,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: false,
      hoverNone: false,
    });

    expect(size.isImmersiveLandscape).toBe(false);
    expect(size.height).toBeLessThanOrEqual(DESKTOP_AVAILABLE_HEIGHT);
  });

  it("ativa modo imersivo por visualViewport quando barras do navegador mudam o tamanho interno", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 420,
      containerHeight: 220,
      viewportWidth: 932,
      viewportHeight: 640,
      visualViewportWidth: 932,
      visualViewportHeight: 430,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: true,
      hoverNone: true,
    });

    expect(size.isImmersiveLandscape).toBe(true);
    expect(size.height).toBeGreaterThanOrEqual(
      MOBILE_LANDSCAPE_VISUAL_VIEWPORT_MIN_HEIGHT,
    );
  });

  it("ativa modo imersivo em tablet landscape com toque", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 720,
      containerHeight: 420,
      viewportWidth: 1024,
      viewportHeight: 768,
      visualViewportWidth: 1024,
      visualViewportHeight: 768,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: true,
      hoverNone: true,
    });

    expect(size.isImmersiveLandscape).toBe(true);
    expect(size.height).toBeGreaterThanOrEqual(640);
    expect(size.height).toBeLessThanOrEqual(
      TABLET_LANDSCAPE_RESERVED_MAX_HEIGHT,
    );
  });

  it("não ativa modo imersivo em desktop landscape sem toque", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 1100,
      containerHeight: 640,
      viewportWidth: 1280,
      viewportHeight: 720,
      visualViewportWidth: 1280,
      visualViewportHeight: 720,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: false,
      hoverNone: false,
    });

    expect(size.isImmersiveLandscape).toBe(false);
  });

  it("limita o canvas pela altura útil do desktop compacto", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 1300,
      containerHeight: 867,
      viewportWidth: 1366,
      viewportHeight: 768,
      visualViewportWidth: 1366,
      visualViewportHeight: 768,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: false,
      hoverNone: false,
    });

    expect(size.isImmersiveLandscape).toBe(false);
    expect(size.height).toBeLessThanOrEqual(DESKTOP_COMPACT_AVAILABLE_HEIGHT);
  });

  it("não usa a altura corrente encolhida como limite recursivo no desktop compacto", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 1300,
      containerHeight: 328,
      viewportWidth: 1366,
      viewportHeight: 768,
      visualViewportWidth: 1366,
      visualViewportHeight: 768,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: false,
      hoverNone: false,
    });

    expect(size.isImmersiveLandscape).toBe(false);
    expect(size.height).toBe(DESKTOP_COMPACT_AVAILABLE_HEIGHT);
    expect(size.width).toBeGreaterThanOrEqual(
      DESKTOP_COMPACT_MIN_RECOVERED_WIDTH,
    );
  });

  it("limita iPad Pro 11 landscape fora do modo imersivo pela altura útil", () => {
    const size = calculateResponsiveCanvasSize({
      containerWidth: 1144,
      containerHeight: 763,
      viewportWidth: 1210,
      viewportHeight: 834,
      visualViewportWidth: 1210,
      visualViewportHeight: 834,
      rootPaddingInline: 16,
      rootPaddingBlock: 16,
      pointerCoarse: true,
      hoverNone: true,
    });

    expect(size.isImmersiveLandscape).toBe(false);
    expect(size.height).toBeLessThanOrEqual(
      IPAD_PRO_LANDSCAPE_AVAILABLE_HEIGHT,
    );
  });
});
