// scripts/validate-svg-assets.mjs
import { existsSync, readFileSync } from 'node:fs';

const VISUAL_ASSET_SOURCE_PATH = 'src/constants/visualAssets.ts';
const FAVICON_RUNTIME_PATH = '/assets/visual/ui/ui-app-browser-favicon.svg';
const PWA_ICON_RUNTIME_PATH = '/assets/visual/ui/ui-pwa-app-icon.svg';
const RUNTIME_SVG_PATTERN = /'((?:\/assets\/visual\/)[^']+\.svg)'/g;
const EXPECTED_VISUAL_RUNTIME_PATHS = [
  ...new Set(
    [...readFileSync(VISUAL_ASSET_SOURCE_PATH, 'utf8').matchAll(RUNTIME_SVG_PATTERN)].map(
      (match) => match[1],
    ),
  ),
].sort();
const EXPECTED_REFERENCES = {
  'index.html': [FAVICON_RUNTIME_PATH],
  [VISUAL_ASSET_SOURCE_PATH]: EXPECTED_VISUAL_RUNTIME_PATHS,
  'public/sw.js': EXPECTED_VISUAL_RUNTIME_PATHS,
  'public/manifest.webmanifest': [PWA_ICON_RUNTIME_PATH],
};
const EXPECTED_SVG_ASSETS = EXPECTED_VISUAL_RUNTIME_PATHS.map(
  (runtimePath) => `public${runtimePath}`,
);
const DISALLOWED_SVG_PATTERNS = [
  { pattern: /<script\b/i, label: '<script>' },
  { pattern: /<image\b/i, label: '<image>' },
  { pattern: /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i, label: 'external url' },
  { pattern: /data:/i, label: 'data uri' },
  { pattern: /@font-face/i, label: 'external font hook' },
];
const DISALLOWED_RUNTIME_RASTER_PATTERN = /\/assets\/(?!visual\/vfx\/)[^"'`\s)]*\.(?:png|jpe?g|webp|gif)|\/favicon\.ico/i;

function fail(message) {
  throw new Error(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

for (const assetPath of EXPECTED_SVG_ASSETS) {
  if (!existsSync(assetPath)) fail(`${assetPath} ausente`);
  const source = read(assetPath);
  if (!source.includes('<svg')) fail(`${assetPath} não contém <svg`);
  if (!/viewBox=["'][^"']+["']/.test(source)) {
    fail(`${assetPath} não contém viewBox`);
  }
  for (const rule of DISALLOWED_SVG_PATTERNS) {
    if (rule.pattern.test(source)) fail(`${assetPath} contém ${rule.label}`);
  }
}

for (const [sourceFile, expectedPaths] of Object.entries(EXPECTED_REFERENCES)) {
  if (!existsSync(sourceFile)) fail(`${sourceFile} ausente`);
  const source = read(sourceFile);
  if (DISALLOWED_RUNTIME_RASTER_PATTERN.test(source)) {
    fail(`${sourceFile} referencia imagem raster runtime`);
  }
  for (const runtimePath of expectedPaths) {
    if (!source.includes(runtimePath)) fail(`${sourceFile} não referencia ${runtimePath}`);
  }
}

console.log(`svg-assets ok: svg=${EXPECTED_SVG_ASSETS.length}`);
