// tests/unit/canvasSizing.test.ts
import { calculateResponsiveCanvasSize } from "../../src/utils/canvasSizing";

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
    expect(size.width).toBeGreaterThanOrEqual(420);
    expect(size.height).toBeGreaterThanOrEqual(280);
    expect(size.height).toBeLessThan(372);
  });

  it("usa quase toda a largura útil no portrait mobile", () => {
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
    expect(size.width).toBeGreaterThanOrEqual(359);
    expect(size.height).toBeGreaterThan(239);
  });

  it("usa quase toda a largura útil no desktop sem toque", () => {
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
    expect(size.width).toBeGreaterThanOrEqual(1153);
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
    expect(size.height).toBeGreaterThanOrEqual(300);
    expect(size.height).toBeLessThan(398);
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
});
