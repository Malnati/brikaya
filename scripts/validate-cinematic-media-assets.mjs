// scripts/validate-cinematic-media-assets.mjs
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const CONSTANTS_PATH = 'src/constants/cinematicMedia.ts';
const VISUAL_ASSETS_PATH = 'src/constants/visualAssets.ts';
const SERVICE_WORKER_PATH = 'public/sw.js';
const CINEMATIC_DIR = 'public/assets/visual/vfx';
const PUBLIC_PREFIX = 'public';
const SVG_EXTENSION = '.svg';
const RUNTIME_VISUAL_PATH_PREFIX = '/assets/visual/';
const RUNTIME_VISUAL_VFX_PREFIX = '/assets/visual/vfx/';
const HTTPS_URL_PATTERN = /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i;
const ASSET_MANIFEST_RUNTIME_PATH = '/asset-cache-manifest.json';
const ASSET_CACHE_NAME_TOKEN = 'ASSET_CACHE_NAME';
const DISALLOWED_SVG_PATTERNS = [/<script\b/i, /<image\b/i, /data:/i, /@font-face/i];
const EXPECTED_MEDIA = [
  {
    id: 'countdown-circle',
    runtimePath: '/assets/visual/vfx/vfx-countdown-circle-overlay.svg',
  },
  {
    id: 'countdown-spark',
    runtimePath: '/assets/visual/vfx/vfx-countdown-spark-overlay.svg',
  },
  {
    id: 'level-up-twirl',
    runtimePath: '/assets/visual/vfx/vfx-level-up-twirl-overlay.svg',
  },
  {
    id: 'level-up-star',
    runtimePath: '/assets/visual/vfx/vfx-level-up-star-overlay.svg',
  },
  {
    id: 'rip-smoke',
    runtimePath: '/assets/visual/vfx/vfx-game-over-rip-smoke.svg',
  },
];

function fail(message) {
  throw new Error(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function validateSvg(path) {
  const source = read(path);
  if (!source.includes('<svg')) fail(`${path} não contém <svg`);
  if (!/viewBox=["'][^"']+["']/.test(source)) fail(`${path} não contém viewBox`);
  if (HTTPS_URL_PATTERN.test(source)) fail(`${path} contém URL externa`);
  for (const pattern of DISALLOWED_SVG_PATTERNS) {
    if (pattern.test(source)) fail(`${path} contém padrão SVG proibido`);
  }
}

function validateLazyAssetServiceWorker(serviceWorker) {
  if (!serviceWorker.includes(ASSET_MANIFEST_RUNTIME_PATH)) {
    fail(`${SERVICE_WORKER_PATH} não referencia ${ASSET_MANIFEST_RUNTIME_PATH}`);
  }
  if (!serviceWorker.includes(RUNTIME_VISUAL_PATH_PREFIX)) {
    fail(`${SERVICE_WORKER_PATH} não trata ${RUNTIME_VISUAL_PATH_PREFIX} sob demanda`);
  }
  if (!serviceWorker.includes(ASSET_CACHE_NAME_TOKEN)) {
    fail(`${SERVICE_WORKER_PATH} não declara cache estável de assets`);
  }
}

function validate() {
  if (!existsSync(CONSTANTS_PATH)) fail(`${CONSTANTS_PATH} ausente`);
  if (!existsSync(VISUAL_ASSETS_PATH)) fail(`${VISUAL_ASSETS_PATH} ausente`);
  if (!existsSync(SERVICE_WORKER_PATH)) fail(`${SERVICE_WORKER_PATH} ausente`);
  if (!existsSync(CINEMATIC_DIR)) fail(`${CINEMATIC_DIR} ausente`);

  const constants = read(CONSTANTS_PATH);
  const visualAssets = read(VISUAL_ASSETS_PATH);
  const serviceWorker = read(SERVICE_WORKER_PATH);

  if (HTTPS_URL_PATTERN.test(constants)) {
    fail(`${CONSTANTS_PATH} contém URL externa`);
  }
  if (HTTPS_URL_PATTERN.test(visualAssets)) {
    fail(`${VISUAL_ASSETS_PATH} contém URL externa`);
  }
  validateLazyAssetServiceWorker(serviceWorker);

  const fileNames = readdirSync(CINEMATIC_DIR).filter((name) =>
    name.endsWith(SVG_EXTENSION),
  );
  if (fileNames.length < EXPECTED_MEDIA.length) {
    fail(
      `Total de SVGs ${fileNames.length}, mínimo esperado ${EXPECTED_MEDIA.length}`,
    );
  }

  for (const expected of EXPECTED_MEDIA) {
    const publicPath = `${PUBLIC_PREFIX}${expected.runtimePath}`;
    if (!existsSync(publicPath)) fail(`${publicPath} ausente`);
    if (!visualAssets.includes(expected.runtimePath)) {
      fail(`${VISUAL_ASSETS_PATH} não referencia ${expected.runtimePath}`);
    }
    validateSvg(publicPath);
  }

  for (const fileName of fileNames) {
    const runtimePath = `${RUNTIME_VISUAL_VFX_PREFIX}${fileName}`;
    const publicPath = `${CINEMATIC_DIR}/${fileName}`;
    if (!visualAssets.includes(runtimePath)) {
      fail(`${VISUAL_ASSETS_PATH} não referencia ${runtimePath}`);
    }
    validateSvg(publicPath);
  }

  console.log(`cinematic-media-assets ok: svg=${fileNames.length}`);
}

validate();
