// scripts/validate-svg-assets.mjs
import { existsSync, readFileSync } from 'node:fs';

const EXPECTED_FAVICON_RUNTIME_PATHS = ['/favicon.svg'];
const EXPECTED_CORE_RUNTIME_PATHS = [
  '/assets/ball.svg',
  '/assets/paddle.svg',
  '/assets/bricks/brick-red.svg',
  '/assets/bricks/brick-blue.svg',
  '/assets/bricks/brick-green.svg',
  '/assets/bricks/brick-yellow.svg',
  '/assets/bricks/brick-purple.svg',
];
const EXPECTED_CINEMATIC_RUNTIME_PATHS = [
  '/assets/cinematics/countdown-circle.svg',
  '/assets/cinematics/countdown-spark.svg',
  '/assets/cinematics/level-up-star.svg',
  '/assets/cinematics/level-up-twirl.svg',
  '/assets/cinematics/rip-smoke.svg',
];
const EXPECTED_POWER_UP_RUNTIME_PATHS = [
  '/assets/powerups/multiball.svg',
  '/assets/powerups/wide-paddle.svg',
  '/assets/powerups/slow-ball.svg',
  '/assets/powerups/laser-fan.svg',
];
const EXPECTED_ICON_RUNTIME_PATHS = ['/icons/icon.svg'];
const EXPECTED_REFERENCES = {
  'index.html': EXPECTED_FAVICON_RUNTIME_PATHS,
  'src/constants/assets.ts': EXPECTED_CORE_RUNTIME_PATHS,
  'src/constants/cinematicMedia.ts': EXPECTED_CINEMATIC_RUNTIME_PATHS,
  'src/constants/powerUps.ts': EXPECTED_POWER_UP_RUNTIME_PATHS,
  'public/sw.js': [
    ...EXPECTED_FAVICON_RUNTIME_PATHS,
    ...EXPECTED_ICON_RUNTIME_PATHS,
    ...EXPECTED_CORE_RUNTIME_PATHS,
    ...EXPECTED_CINEMATIC_RUNTIME_PATHS,
    ...EXPECTED_POWER_UP_RUNTIME_PATHS,
  ],
  'public/manifest.webmanifest': EXPECTED_ICON_RUNTIME_PATHS,
};
const EXPECTED_SVG_ASSETS = Object.values(EXPECTED_REFERENCES)
  .flat()
  .filter((path, index, paths) => paths.indexOf(path) === index)
  .map((path) => `public${path}`);
const DISALLOWED_SVG_PATTERNS = [
  { pattern: /<script\b/i, label: '<script>' },
  { pattern: /<image\b/i, label: '<image>' },
  { pattern: /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i, label: 'external url' },
  { pattern: /data:/i, label: 'data uri' },
  { pattern: /@font-face/i, label: 'external font hook' },
];
const DISALLOWED_RUNTIME_RASTER_PATTERN = /\/(?:assets|icons)\/(?!issues\/)[^"'`\s)]*\.(?:png|jpe?g|webp|gif)|\/favicon\.ico/i;

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
