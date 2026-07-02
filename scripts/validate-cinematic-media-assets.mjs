// scripts/validate-cinematic-media-assets.mjs
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const CONSTANTS_PATH = 'src/constants/cinematicMedia.ts';
const SERVICE_WORKER_PATH = 'public/sw.js';
const CINEMATIC_DIR = 'public/assets/cinematics';
const RUNTIME_PREFIX = '/assets/cinematics/';
const PUBLIC_PREFIX = 'public/assets/cinematics/';
const HTTPS_URL_PATTERN = /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i;
const DISALLOWED_SVG_PATTERNS = [/<script\b/i, /<image\b/i, /data:/i, /@font-face/i];
const EXPECTED_MEDIA = [
  {
    id: 'countdown-circle',
    runtimePath: '/assets/cinematics/countdown-circle.svg',
  },
  {
    id: 'countdown-spark',
    runtimePath: '/assets/cinematics/countdown-spark.svg',
  },
  {
    id: 'level-up-twirl',
    runtimePath: '/assets/cinematics/level-up-twirl.svg',
  },
  {
    id: 'level-up-star',
    runtimePath: '/assets/cinematics/level-up-star.svg',
  },
  {
    id: 'rip-smoke',
    runtimePath: '/assets/cinematics/rip-smoke.svg',
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

function validate() {
  if (!existsSync(CONSTANTS_PATH)) fail(`${CONSTANTS_PATH} ausente`);
  if (!existsSync(SERVICE_WORKER_PATH)) fail(`${SERVICE_WORKER_PATH} ausente`);
  if (!existsSync(CINEMATIC_DIR)) fail(`${CINEMATIC_DIR} ausente`);

  const constants = read(CONSTANTS_PATH);
  const serviceWorker = read(SERVICE_WORKER_PATH);

  if (HTTPS_URL_PATTERN.test(constants)) {
    fail(`${CONSTANTS_PATH} contém URL externa`);
  }

  const fileNames = readdirSync(CINEMATIC_DIR).filter((name) =>
    name.endsWith('.svg'),
  );
  if (fileNames.length !== EXPECTED_MEDIA.length) {
    fail(`Total de SVGs ${fileNames.length}, esperado ${EXPECTED_MEDIA.length}`);
  }

  for (const expected of EXPECTED_MEDIA) {
    const publicPath = expected.runtimePath.replace(RUNTIME_PREFIX, PUBLIC_PREFIX);
    if (!existsSync(publicPath)) fail(`${publicPath} ausente`);
    if (!constants.includes(expected.runtimePath)) {
      fail(`${CONSTANTS_PATH} não referencia ${expected.runtimePath}`);
    }
    if (!serviceWorker.includes(expected.runtimePath)) {
      fail(`${SERVICE_WORKER_PATH} não precacheia ${expected.runtimePath}`);
    }
    validateSvg(publicPath);
  }

  console.log(`cinematic-media-assets ok: svg=${EXPECTED_MEDIA.length}`);
}

validate();
