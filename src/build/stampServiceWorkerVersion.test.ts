// src/build/stampServiceWorkerVersion.test.ts
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SCRIPT_PATH = 'scripts/stamp-service-worker-version.mjs';
const TEMP_SW_FILE = 'tmp/tests/stamp-service-worker-version/sw.js';
const PLACEHOLDER = '__BRIKAYA_BUILD_ID__';
const BUILD_VERSION_PLACEHOLDER = '__BRIKAYA_BUILD_VERSION__';
const BUILD_ID = 'qa-build-123';
const UNSAFE_BUILD_ID = 'qa/build 123';
const BUILD_VERSION_LABEL = 'v42';

function writeTempServiceWorker() {
  const swFilePath = resolve(TEMP_SW_FILE);
  mkdirSync(dirname(swFilePath), { recursive: true });
  writeFileSync(swFilePath, [
    '// dist/sw.js',
    `const BUILD_ID = '${PLACEHOLDER}';`,
    `const BUILD_VERSION = '${BUILD_VERSION_PLACEHOLDER}';`,
    'const CACHE_PREFIX = \'brikaya-cache\';',
    'const CACHE_NAME = `${CACHE_PREFIX}-${BUILD_ID}`;',
    'event.source.postMessage({ type: \'VERSION\', buildId: BUILD_ID, buildVersion: BUILD_VERSION });',
  ].join('\n'));
  return swFilePath;
}

describe('stamp-service-worker-version', () => {
  beforeEach(() => {
    rmSync(resolve('tmp/tests/stamp-service-worker-version'), { recursive: true, force: true });
  });

  afterEach(() => {
    rmSync(resolve('tmp/tests/stamp-service-worker-version'), { recursive: true, force: true });
  });

  it('carimba o BUILD_ID e mantém CACHE_NAME derivado da versão', () => {
    const swFilePath = writeTempServiceWorker();
    const output = execFileSync(process.execPath, [SCRIPT_PATH], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BRIKAYA_SW_FILE: swFilePath,
        BRIKAYA_BUILD_ID: UNSAFE_BUILD_ID,
        BRIKAYA_BUILD_VERSION: BUILD_VERSION_LABEL,
      },
      encoding: 'utf8',
    });
    const stampedSource = readFileSync(swFilePath, 'utf8');

    expect(output).toContain(BUILD_ID);
    expect(output).toContain(BUILD_VERSION_LABEL);
    expect(stampedSource).toContain(`const BUILD_ID = '${BUILD_ID}';`);
    expect(stampedSource).toContain(`const BUILD_VERSION = '${BUILD_VERSION_LABEL}';`);
    expect(stampedSource).toContain('const CACHE_NAME = `${CACHE_PREFIX}-${BUILD_ID}`;');
    expect(stampedSource).toContain('buildVersion: BUILD_VERSION');
    expect(stampedSource).not.toContain(PLACEHOLDER);
    expect(stampedSource).not.toContain(BUILD_VERSION_PLACEHOLDER);
  });
});
