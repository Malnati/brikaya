#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const VFX_SPECS = [
  {
    id: "vfx-ambient-electric-lightning-pulse-backdrop",
    label: "Raio ambiente Pulse",
    variant: "pulse",
    viewBox: "0 0 320 320",
    body: `<rect width="320" height="320" fill="#080816"/><path d="M48 280 L92 180 L76 220 L148 96 L118 176 L248 40" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="8" stroke-linecap="round"/><path d="M48 280 L92 180 L76 220 L148 96 L118 176 L248 40" fill="none" stroke="#eefdff" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`,
  },
  {
    id: "vfx-ambient-electric-lightning-arcade-backdrop",
    label: "Raio ambiente Arcade",
    variant: "arcade",
    viewBox: "0 0 320 320",
    body: `<rect width="320" height="320" fill="#080816"/><path d="M32 260 L88 168 L72 204 L156 88 L124 152 L288 24" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="9" stroke-linecap="round"/><path d="M32 260 L88 168 L72 204 L156 88 L124 152 L288 24" fill="none" stroke="#eefdff" stroke-width="3" stroke-linecap="round"/><path d="M156 88 L176 120 L196 96" fill="none" stroke="#eefdff" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>`,
  },
  {
    id: "vfx-ambient-electric-lightning-storm-backdrop",
    label: "Raio ambiente Storm",
    variant: "storm",
    viewBox: "0 0 320 320",
    body: `<rect width="320" height="320" fill="#080816"/><path d="M24 288 L72 196 L56 236 L140 72 L108 148 L300 16" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="10" stroke-linecap="round"/><path d="M24 288 L72 196 L56 236 L140 72 L108 148 L300 16" fill="none" stroke="#eefdff" stroke-width="3.4" stroke-linecap="round"/><path d="M140 72 L168 108 L188 84" fill="none" stroke="#eefdff" stroke-width="2" stroke-linecap="round"/><path d="M200 240 L228 208 L246 224" fill="none" stroke="#eefdff" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`,
  },
  {
    id: "vfx-electric-impact-component-burst",
    label: "Impacto elétrico em bloco",
    variant: "component",
    viewBox: "0 0 96 96",
    body: `<rect width="96" height="96" fill="#080816"/><path d="M48 72 L48 24 M48 48 L22 34 M48 48 L74 34" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="5" stroke-linecap="round"/><path d="M48 72 L48 24 M48 48 L22 34 M48 48 L74 34" fill="none" stroke="#eefdff" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="72" r="7" fill="rgba(66,224,255,0.34)"/><circle cx="48" cy="72" r="3" fill="#eefdff"/>`,
  },
  {
    id: "vfx-electric-impact-wall-burst",
    label: "Impacto elétrico parede lateral",
    variant: "wall",
    viewBox: "0 0 96 96",
    body: `<rect width="96" height="96" fill="#080816"/><path d="M8 48 L48 48 L48 24 M48 48 L48 72" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="5" stroke-linecap="round"/><path d="M8 48 L48 48 L48 24 M48 48 L48 72" fill="none" stroke="#eefdff" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="48" r="6" fill="rgba(66,224,255,0.34)"/><circle cx="8" cy="48" r="2.5" fill="#eefdff"/>`,
  },
  {
    id: "vfx-electric-impact-ceiling-burst",
    label: "Impacto elétrico teto",
    variant: "ceiling",
    viewBox: "0 0 96 96",
    body: `<rect width="96" height="96" fill="#080816"/><path d="M48 8 L48 48 L28 48 M48 48 L68 48" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="5" stroke-linecap="round"/><path d="M48 8 L48 48 L28 48 M48 48 L68 48" fill="none" stroke="#eefdff" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="8" r="6" fill="rgba(66,224,255,0.34)"/><circle cx="48" cy="8" r="2.5" fill="#eefdff"/>`,
  },
  {
    id: "vfx-electric-impact-radial-wall-burst",
    label: "Impacto elétrico parede radial",
    variant: "radial-wall",
    viewBox: "0 0 96 96",
    body: `<rect width="96" height="96" fill="#080816"/><path d="M72 48 L48 48 L36 28 M48 48 L36 68" fill="none" stroke="rgba(66,224,255,0.34)" stroke-width="5" stroke-linecap="round"/><path d="M72 48 L48 48 L36 28 M48 48 L36 68" fill="none" stroke="#eefdff" stroke-width="2" stroke-linecap="round"/><circle cx="72" cy="48" r="6" fill="rgba(66,224,255,0.34)"/><circle cx="72" cy="48" r="2.5" fill="#eefdff"/>`,
  },
];

function buildSvg(spec) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${spec.viewBox}" role="img" aria-label="${spec.label}">\n  ${spec.body}\n</svg>\n`;
}

const authoringDir = path.join(
  repoRoot,
  "docs/assets/issues/electric-components-palette/proposals/authoring",
);
const publicVfxDir = path.join(repoRoot, "public/assets/visual/vfx");

fs.mkdirSync(authoringDir, { recursive: true });
fs.mkdirSync(publicVfxDir, { recursive: true });

for (const spec of VFX_SPECS) {
  const svg = buildSvg(spec);
  const codexPath = path.join(authoringDir, `codex-${spec.id}.svg`);
  const publicPath = path.join(publicVfxDir, `${spec.id}.svg`);
  fs.writeFileSync(codexPath, svg);
  fs.writeFileSync(publicPath, svg);
  console.log(`SVG: ${spec.id}`);
}
