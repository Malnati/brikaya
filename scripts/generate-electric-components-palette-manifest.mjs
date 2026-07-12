#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(
  repoRoot,
  "docs/assets/issues/electric-components-palette/proposals/palette-manifest.json",
);

function inferElectricShape(filename) {
  if (filename.includes("metal-steel")) return "shield-module";
  if (filename.includes("-red-")) return "square-inductor";
  if (filename.includes("-blue-")) return "transistor";
  if (filename.includes("-green-")) return "chip";
  if (filename.includes("-yellow-")) return "led-diode";
  if (filename.includes("-purple-")) return "capacitor";
  return "component";
}

function listSvgFiles(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  return fs
    .readdirSync(absoluteDir)
    .filter((file) => file.endsWith(".svg"))
    .sort()
    .map((file) => ({
      id: file.replace(/\.svg$/, ""),
      path: `/${relativeDir.replace(/^public\/assets/, "assets")}/${file}`,
    }));
}

const componentFiles = listSvgFiles("public/assets/visual/components");
const vfxExisting = listSvgFiles("public/assets/visual/vfx").filter((entry) =>
  entry.id.includes("countdown-spark"),
);
const spriteElectric = listSvgFiles("public/assets/visual/sprites").filter(
  (entry) => entry.id === "spr-ball-player-default",
);

const vfxNew = [
  {
    id: "vfx-ambient-electric-lightning-pulse-backdrop",
    path: "/assets/visual/vfx/vfx-ambient-electric-lightning-pulse-backdrop.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "ambient-electric-lightning-pulse",
    state: "backdrop",
  },
  {
    id: "vfx-ambient-electric-lightning-arcade-backdrop",
    path: "/assets/visual/vfx/vfx-ambient-electric-lightning-arcade-backdrop.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "ambient-electric-lightning-arcade",
    state: "backdrop",
  },
  {
    id: "vfx-ambient-electric-lightning-storm-backdrop",
    path: "/assets/visual/vfx/vfx-ambient-electric-lightning-storm-backdrop.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "ambient-electric-lightning-storm",
    state: "backdrop",
  },
  {
    id: "vfx-electric-impact-component-burst",
    path: "/assets/visual/vfx/vfx-electric-impact-component-burst.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "electric-impact-component",
    state: "burst",
  },
  {
    id: "vfx-electric-impact-wall-burst",
    path: "/assets/visual/vfx/vfx-electric-impact-wall-burst.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "electric-impact-wall",
    state: "burst",
  },
  {
    id: "vfx-electric-impact-ceiling-burst",
    path: "/assets/visual/vfx/vfx-electric-impact-ceiling-burst.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "electric-impact-ceiling",
    state: "burst",
  },
  {
    id: "vfx-electric-impact-radial-wall-burst",
    path: "/assets/visual/vfx/vfx-electric-impact-radial-wall-burst.svg",
    runtime: "canvas-procedural",
    status: "novo",
    semanticRole: "electric-impact-radial-wall",
    state: "burst",
  },
];

const colorTokens = [
  { id: "clr-electric-lightning-core", value: "#eefdff", usage: "Núcleo de raio e impacto" },
  { id: "clr-electric-lightning-halo", value: "rgba(66,224,255,0.34)", usage: "Halo de raio e impacto" },
  { id: "clr-electric-lightning-shadow", value: "rgba(77,232,255,0.88)", usage: "Brilho de raio e impacto" },
  { id: "clr-electric-energy-ball-fallback", value: "#7df9ff", usage: "Fallback da bola de energia" },
];

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  policy: "svg-first-authoring-canvas-procedural-runtime",
  families: {
    circuitComponents: componentFiles.map((entry) => ({
      ...entry,
      group: "component",
      runtime: "svg",
      status: "catalogado",
      electricShape: inferElectricShape(entry.id),
    })),
    sprites: spriteElectric.map((entry) => ({
      ...entry,
      group: "sprite",
      runtime: "canvas-procedural",
      status: "catalogado",
      semanticRole: "electric-energy-ball",
      logicalLayers: ["outer-halo", "core", "orbit-arcs", "cyan-shell", "fallback-fill"],
    })),
    vfxExisting: vfxExisting.map((entry) => ({
      ...entry,
      group: "vfx",
      runtime: "svg-css",
      status: "catalogado",
      semanticRole: "countdown-spark",
      state: "overlay",
    })),
    vfxNew,
    colorTokens,
  },
  acceptance: {
    circuitBasicFamily: false,
    circuitMetalFamily: false,
    electricEnergyBall: false,
    countdownSparkVariants: false,
    ambientLightningVariants: false,
    electricImpactBursts: false,
    defaultAmbientVariant: "arcade",
    unifiedColorPalette: false,
  },
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifesto gerado: ${outputPath}`);
console.log(`Componentes: ${componentFiles.length}`);
console.log(`VFX novos: ${vfxNew.length}`);
