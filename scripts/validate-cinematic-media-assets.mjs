// scripts/validate-cinematic-media-assets.mjs
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const CONSTANTS_PATH = 'src/constants/cinematicMedia.ts';
const SERVICE_WORKER_PATH = 'public/sw.js';
const RECEIPT_PATH =
  'docs/assets/issues/cinematic-public-domain-media/evidence/cinematic-media-license-receipt.json';
const CINEMATIC_DIR = 'public/assets/cinematics';
const RUNTIME_PREFIX = '/assets/cinematics/';
const PUBLIC_PREFIX = 'public/assets/cinematics/';
const HTTPS_URL_PATTERN = /https?:\/\//;
const EXPECTED_MEDIA = [
  {
    id: 'countdown-circle',
    runtimePath: '/assets/cinematics/countdown-circle.png',
    sourcePage: 'https://www.kenney.nl/assets/particle-pack',
    sourceArchive: 'kenney_particle-pack.zip',
    sourcePath: 'PNG (Transparent)/circle_05.png',
  },
  {
    id: 'countdown-spark',
    runtimePath: '/assets/cinematics/countdown-spark.png',
    sourcePage: 'https://www.kenney.nl/assets/particle-pack',
    sourceArchive: 'kenney_particle-pack.zip',
    sourcePath: 'PNG (Transparent)/spark_07.png',
  },
  {
    id: 'level-up-twirl',
    runtimePath: '/assets/cinematics/level-up-twirl.png',
    sourcePage: 'https://www.kenney.nl/assets/particle-pack',
    sourceArchive: 'kenney_particle-pack.zip',
    sourcePath: 'PNG (Transparent)/twirl_02.png',
  },
  {
    id: 'level-up-star',
    runtimePath: '/assets/cinematics/level-up-star.png',
    sourcePage: 'https://www.kenney.nl/assets/particle-pack',
    sourceArchive: 'kenney_particle-pack.zip',
    sourcePath: 'PNG (Transparent)/star_07.png',
  },
  {
    id: 'rip-smoke',
    runtimePath: '/assets/cinematics/rip-smoke.png',
    sourcePage: 'https://kenney.nl/assets/smoke-particles',
    sourceArchive: 'kenney_smoke-particles.zip',
    sourcePath: 'PNG/Black smoke/blackSmoke14.png',
  },
];

function fail(message) {
  throw new Error(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function validateReceipt(receipt) {
  if (receipt.licensePolicy !== 'CC0_OR_PUBLIC_DOMAIN_ONLY') {
    fail('Política de licença inválida no recibo');
  }

  if (!Array.isArray(receipt.assets)) {
    fail('Recibo não contém lista de assets');
  }

  for (const expected of EXPECTED_MEDIA) {
    const item = receipt.assets.find((asset) => asset.id === expected.id);
    if (!item) fail(`Recibo não contém ${expected.id}`);
    if (item.license !== 'CC0') fail(`${expected.id} não está marcado como CC0`);
    if (item.attributionRequired !== false) {
      fail(`${expected.id} exige atribuição no recibo`);
    }
    if (item.runtimePath !== expected.runtimePath) {
      fail(`Runtime path divergente para ${expected.id}`);
    }
    if (item.sourcePage !== expected.sourcePage) {
      fail(`Página fonte divergente para ${expected.id}`);
    }
    if (item.sourceArchive !== expected.sourceArchive) {
      fail(`Arquivo fonte divergente para ${expected.id}`);
    }
    if (item.sourcePath !== expected.sourcePath) {
      fail(`Path fonte divergente para ${expected.id}`);
    }
    const publicPath = item.runtimePath.replace(RUNTIME_PREFIX, PUBLIC_PREFIX);
    if (item.sha256 !== sha256(publicPath)) {
      fail(`SHA-256 divergente para ${expected.id}`);
    }
  }
}

function validate() {
  if (!existsSync(CONSTANTS_PATH)) fail(`${CONSTANTS_PATH} ausente`);
  if (!existsSync(SERVICE_WORKER_PATH)) fail(`${SERVICE_WORKER_PATH} ausente`);
  if (!existsSync(CINEMATIC_DIR)) fail(`${CINEMATIC_DIR} ausente`);
  if (!existsSync(RECEIPT_PATH)) fail(`${RECEIPT_PATH} ausente`);

  const constants = read(CONSTANTS_PATH);
  const serviceWorker = read(SERVICE_WORKER_PATH);
  const receipt = JSON.parse(read(RECEIPT_PATH));

  if (HTTPS_URL_PATTERN.test(constants)) {
    fail(`${CONSTANTS_PATH} contém URL externa`);
  }

  const fileNames = readdirSync(CINEMATIC_DIR).filter((name) =>
    name.endsWith('.png'),
  );
  if (fileNames.length !== EXPECTED_MEDIA.length) {
    fail(`Total de imagens ${fileNames.length}, esperado ${EXPECTED_MEDIA.length}`);
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
  }

  validateReceipt(receipt);
  console.log(`cinematic-media-assets ok: png=${EXPECTED_MEDIA.length}`);
}

validate();
