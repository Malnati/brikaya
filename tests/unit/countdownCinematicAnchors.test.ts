import { readFileSync } from "node:fs";

const CSS_PATH = "src/styles/index.css";
const CSS_SOURCE = readFileSync(CSS_PATH, "utf8");
const COUNTDOWN_ANIMATION_NAMES = [
  "cinematic-count-pulse",
  "cinematic-countdown-halo-pulse",
  "cinematic-media-spin",
  "cinematic-media-pulse",
];

function keyframeBody(name: string): string {
  const marker = `@keyframes ${name}`;
  const start = CSS_SOURCE.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextKeyframe = CSS_SOURCE.indexOf("@keyframes", start + marker.length);
  const body =
    nextKeyframe === -1
      ? CSS_SOURCE.slice(start)
      : CSS_SOURCE.slice(start, nextKeyframe);

  return body;
}

describe("countdown cinematic centering contract", () => {
  it("mantém a âncora de centro fora das animações do countdown", () => {
    for (const animationName of COUNTDOWN_ANIMATION_NAMES) {
      expect(keyframeBody(animationName)).not.toContain("translate(");
    }
  });

  it("declara uma camada de mídia dedicada para ancorar anel e estrela no centro", () => {
    expect(CSS_SOURCE).toContain(".game-cinematic-overlay__media-layer");
  });
});
