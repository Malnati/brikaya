import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SCRIPT_PATH = 'scripts/submit-yandex-indexnow.mjs';
const TEMP_ROOT = 'tmp/tests/yandex-indexnow';
const TEMP_PUBLIC_ROOT = `${TEMP_ROOT}/public`;
const TEMP_SITEMAP_PATH = `${TEMP_ROOT}/dist/sitemap.xml`;
const TEST_KEY = 'ab12cd34ef56ab78cd90ef12ab34cd56';
const CANONICAL_HOST = 'brikaya.com';
const DEFAULT_ENDPOINT = 'https://yandex.com/indexnow';

function writeText(path: string, content: string) {
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), content);
}

function writeKeyFile(key = TEST_KEY) {
  writeText(`${TEMP_PUBLIC_ROOT}/${key}.txt`, `${key}\n`);
}

function writeSitemap(urls: string[]) {
  writeText(
    TEMP_SITEMAP_PATH,
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.flatMap((url) => ['  <url>', `    <loc>${url}</loc>`, '  </url>']),
      '</urlset>',
      '',
    ].join('\n'),
  );
}

function runIndexNow(extraEnv: NodeJS.ProcessEnv = {}) {
  return execFileSync(process.execPath, [SCRIPT_PATH], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      BRIKAYA_INDEXNOW_PUBLIC_ROOT: resolve(TEMP_PUBLIC_ROOT),
      BRIKAYA_INDEXNOW_SITEMAP: resolve(TEMP_SITEMAP_PATH),
      BRIKAYA_INDEXNOW_DRY_RUN: 'true',
      ...extraEnv,
    },
    encoding: 'utf8',
  });
}

function runIndexNowFailure(extraEnv: NodeJS.ProcessEnv = {}) {
  try {
    runIndexNow(extraEnv);
    throw new Error('expected command to fail');
  } catch (error) {
    const commandError = error as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
    return `${commandError.stdout?.toString() || ''}${commandError.stderr?.toString() || ''}${commandError.message || ''}`;
  }
}

describe('submit-yandex-indexnow', () => {
  beforeEach(() => {
    rmSync(resolve(TEMP_ROOT), { recursive: true, force: true });
  });

  afterEach(() => {
    rmSync(resolve(TEMP_ROOT), { recursive: true, force: true });
  });

  it('faz dry-run com URLs canônicas do sitemap sem imprimir a chave', () => {
    writeKeyFile();
    writeSitemap(['https://brikaya.com/', 'https://brikaya.com/en/']);

    const output = runIndexNow();

    expect(output).toContain(`yandex-indexnow dry-run: host=${CANONICAL_HOST}`);
    expect(output).toContain(`endpoint=${DEFAULT_ENDPOINT}`);
    expect(output).toContain('urls=2');
    expect(output).toContain('keyLocation=https://brikaya.com/[redacted].txt');
    expect(output).not.toContain(TEST_KEY);
  });

  it('rejeita URLs fora do host canônico do Brikaya', () => {
    writeKeyFile();
    writeSitemap(['https://brikaya.com/', 'https://example.com/']);

    const output = runIndexNowFailure();

    expect(output).toContain('URL fora do host canônico');
    expect(output).not.toContain(TEST_KEY);
  });

  it('rejeita chave IndexNow inválida mesmo quando arquivo e conteúdo batem', () => {
    const invalidKey = 'abc';
    writeKeyFile(invalidKey);
    writeSitemap(['https://brikaya.com/']);

    const output = runIndexNowFailure();

    expect(output).toContain('chave IndexNow inválida');
    expect(output).not.toContain(invalidKey);
  });
});
