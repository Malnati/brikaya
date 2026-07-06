// scripts/materialize-public-env-artifacts.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import {
  CodexEnvError,
  REDACTED_KEY_LOCATION,
  readProjectEnv,
  sanitizeOutput,
} from './load-project-env.mjs';

const INDEXNOW_KEY = 'BRIKAYA_INDEXNOW_KEY';
const GOOGLE_ADSENSE_PUBLISHER_ID = 'BRIKAYA_GOOGLE_ADSENSE_PUBLISHER_ID';
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const GOOGLE_ADSENSE_PUBLISHER_ID_PATTERN = /^pub-\d{16}$/;
const DIST_DIR = 'dist';

function removeStaleIndexNowFiles(distDir, key) {
  if (!existsSync(distDir)) {
    return;
  }

  for (const fileName of readdirSync(distDir)) {
    if (extname(fileName).toLowerCase() !== '.txt') {
      continue;
    }
    const keyFromName = basename(fileName, '.txt');
    if (keyFromName === key || !INDEXNOW_KEY_PATTERN.test(keyFromName)) {
      continue;
    }
    const filePath = resolve(distDir, fileName);
    const content = readFileSync(filePath, 'utf8').trim();
    if (content === keyFromName) {
      unlinkSync(filePath);
    }
  }
}

function run() {
  const envValues = readProjectEnv();
  const key = envValues[INDEXNOW_KEY];
  const publisherId = envValues[GOOGLE_ADSENSE_PUBLISHER_ID];
  if (!key) {
    throw new CodexEnvError(`${INDEXNOW_KEY} ausente no .env local`);
  }
  if (!INDEXNOW_KEY_PATTERN.test(key)) {
    throw new CodexEnvError(`${INDEXNOW_KEY} inválida no .env local`);
  }

  const distDir = resolve(process.cwd(), DIST_DIR);
  mkdirSync(distDir, { recursive: true });
  removeStaleIndexNowFiles(distDir, key);
  writeFileSync(resolve(distDir, `${key}.txt`), `${key}\n`);

  if (publisherId) {
    if (!GOOGLE_ADSENSE_PUBLISHER_ID_PATTERN.test(publisherId)) {
      throw new CodexEnvError(`${GOOGLE_ADSENSE_PUBLISHER_ID} inválida no .env local`);
    }
    writeFileSync(
      resolve(distDir, 'ads.txt'),
      `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    );
  }

  console.log(
    sanitizeOutput(
      `codex-env materialized: artifact=IndexNow keyLocation=${REDACTED_KEY_LOCATION} artifact=AdsTxt present=${Boolean(publisherId)}`,
      envValues,
    ),
  );
}

try {
  run();
} catch (error) {
  console.error(sanitizeOutput(error.message || String(error), readProjectEnv()));
  process.exit(1);
}
