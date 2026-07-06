import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const TEMP_ROOT = resolve(process.cwd(), 'tmp/tests/codex-env-governance');
const REGISTER_SCRIPT = resolve(process.cwd(), 'scripts/register-codex-env-value.mjs');
const VALIDATE_SCRIPT = resolve(process.cwd(), 'scripts/validate-codex-env.mjs');
const MATERIALIZE_SCRIPT = resolve(process.cwd(), 'scripts/materialize-public-env-artifacts.mjs');
const INDEXNOW_SCRIPT = resolve(process.cwd(), 'scripts/submit-yandex-indexnow.mjs');
const TEST_INDEXNOW_KEY = '0123456789abcdef0123456789abcdef';
const TEST_TOKEN = 'unit-test-token-that-must-not-leak';

function writeText(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  if (basename(path) === '.env') {
    chmodSync(path, 0o600);
  }
}

function writeRegistry(requiredNames = ['BRIKAYA_INDEXNOW_KEY']) {
  writeText(
    resolve(TEMP_ROOT, 'config/codex-env.registry.json'),
    JSON.stringify(
      {
        version: 1,
        entries: [
          {
            name: 'BRIKAYA_INDEXNOW_KEY',
            classification: 'public-generated',
            required: requiredNames.includes('BRIKAYA_INDEXNOW_KEY'),
            source: 'IndexNow verification key',
            commands: ['npm run indexnow:yandex'],
          },
          {
            name: 'CLOUDFLARE_API_TOKEN',
            classification: 'secret',
            required: requiredNames.includes('CLOUDFLARE_API_TOKEN'),
            source: 'Cloudflare API',
            commands: ['make cloudflare-deploy'],
          },
        ],
      },
      null,
      2,
    ),
  );
}

function writeEnvExample(names = ['BRIKAYA_INDEXNOW_KEY', 'CLOUDFLARE_API_TOKEN']) {
  writeText(resolve(TEMP_ROOT, '.env.example'), `${names.map((name) => `${name}=`).join('\n')}\n`);
}

function runNode(script: string, args: string[] = [], extraEnv: NodeJS.ProcessEnv = {}) {
  return execFileSync(process.execPath, [script, ...args], {
    cwd: TEMP_ROOT,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  });
}

function runNodeFailure(script: string, args: string[] = [], extraEnv: NodeJS.ProcessEnv = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: TEMP_ROOT,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  });
  if (result.status === 0) {
    throw new Error('expected command to fail');
  }
  return `${result.stdout || ''}${result.stderr || ''}`;
}

describe('Codex env governance', () => {
  beforeEach(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
    mkdirSync(TEMP_ROOT, { recursive: true });
    writeRegistry();
    writeEnvExample();
  });

  afterEach(() => {
    rmSync(TEMP_ROOT, { recursive: true, force: true });
  });

  it('registra valor no .env local sem imprimir o valor e com permissão 0600', () => {
    const output = runNode(REGISTER_SCRIPT, [
      'CLOUDFLARE_API_TOKEN',
      '--value',
      TEST_TOKEN,
      '--source',
      'unit-test',
    ]);

    const envPath = resolve(TEMP_ROOT, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envMode = statSync(envPath).mode & 0o777;

    expect(envContent).toContain(`CLOUDFLARE_API_TOKEN=${TEST_TOKEN}`);
    expect(envMode).toBe(0o600);
    expect(output).toContain('codex-env registered');
    expect(output).toContain('key=CLOUDFLARE_API_TOKEN');
    expect(output).not.toContain(TEST_TOKEN);
  });

  it('valida registry, .env.example e .env sem revelar valores', () => {
    writeText(resolve(TEMP_ROOT, '.env'), `BRIKAYA_INDEXNOW_KEY=${TEST_INDEXNOW_KEY}\n`);

    const output = runNode(VALIDATE_SCRIPT);

    expect(output).toContain('codex-env check ok');
    expect(output).not.toContain(TEST_INDEXNOW_KEY);
  });

  it('falha quando uma chave obrigatória está ausente do .env.example', () => {
    writeEnvExample(['CLOUDFLARE_API_TOKEN']);
    writeText(resolve(TEMP_ROOT, '.env'), `BRIKAYA_INDEXNOW_KEY=${TEST_INDEXNOW_KEY}\n`);

    const output = runNodeFailure(VALIDATE_SCRIPT);

    expect(output).toContain('BRIKAYA_INDEXNOW_KEY');
    expect(output).toContain('.env.example');
    expect(output).not.toContain(TEST_INDEXNOW_KEY);
  });

  it('materializa o arquivo público IndexNow em dist sem imprimir a chave', () => {
    writeText(resolve(TEMP_ROOT, '.env'), `BRIKAYA_INDEXNOW_KEY=${TEST_INDEXNOW_KEY}\n`);

    const output = runNode(MATERIALIZE_SCRIPT);
    const materializedPath = resolve(TEMP_ROOT, `dist/${TEST_INDEXNOW_KEY}.txt`);

    expect(existsSync(materializedPath)).toBe(true);
    expect(readFileSync(materializedPath, 'utf8')).toBe(`${TEST_INDEXNOW_KEY}\n`);
    expect(output).toContain('codex-env materialized');
    expect(output).toContain('keyLocation=https://brikaya.com/[redacted].txt');
    expect(output).not.toContain(TEST_INDEXNOW_KEY);
  });

  it('IndexNow usa BRIKAYA_INDEXNOW_KEY do .env e não aceita descoberta implícita por arquivo público', () => {
    writeText(resolve(TEMP_ROOT, '.env'), `BRIKAYA_INDEXNOW_KEY=${TEST_INDEXNOW_KEY}\n`);
    writeText(
      resolve(TEMP_ROOT, 'dist/sitemap.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url><loc>https://brikaya.com/</loc></url>',
        '</urlset>',
      ].join('\n'),
    );

    const output = runNode(INDEXNOW_SCRIPT, [], { BRIKAYA_INDEXNOW_DRY_RUN: 'true' });

    expect(output).toContain('yandex-indexnow dry-run');
    expect(output).toContain('urls=1');
    expect(output).toContain('keyLocation=https://brikaya.com/[redacted].txt');
    expect(output).not.toContain(TEST_INDEXNOW_KEY);

    writeText(resolve(TEMP_ROOT, '.env'), '');
    writeText(resolve(TEMP_ROOT, `public/${TEST_INDEXNOW_KEY}.txt`), `${TEST_INDEXNOW_KEY}\n`);

    const failure = runNodeFailure(INDEXNOW_SCRIPT, [], { BRIKAYA_INDEXNOW_DRY_RUN: 'true' });

    expect(failure).toContain('BRIKAYA_INDEXNOW_KEY');
    expect(failure).toContain('.env');
    expect(failure).not.toContain(TEST_INDEXNOW_KEY);
  });
});
