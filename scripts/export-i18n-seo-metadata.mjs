// scripts/export-i18n-seo-metadata.mjs
import { spawnSync } from 'node:child_process';

const JEST_BIN = 'node_modules/jest/bin/jest.js';
const TEST_PATH = 'tests/unit/export-i18n-seo-metadata.test.ts';

const result = spawnSync(
  process.execPath,
  [JEST_BIN, TEST_PATH, '--runInBand', '--silent'],
  { stdio: 'inherit', cwd: process.cwd() },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('export-i18n-seo-metadata ok');
