// scripts/sync-github-actions-secrets.mjs
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readProjectEnv, readEnvFile } from './load-project-env.mjs';

const REPO = 'Malnati/brikaya';
const CODEX_GH_ADMIN = '/Users/mal/.codex/bin/codex-gh-admin';
const SECRET_NAMES = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN'];
const ROOT_ENV_FILE = '/Users/mal/GitHub/malnati/.env';

function readMergedEnv() {
  const projectEnv = readProjectEnv();
  const rootEnv = existsSync(ROOT_ENV_FILE) ? readEnvFile(ROOT_ENV_FILE) : {};
  return { ...rootEnv, ...projectEnv, ...process.env };
}

function runGhAdmin(args) {
  const result = spawnSync(CODEX_GH_ADMIN, args, {
    encoding: 'utf8',
    env: process.env,
  });

  if (result.status === 0) {
    return { ok: true, output: result.stdout || '' };
  }

  return {
    ok: false,
    output: `${result.stdout || ''}${result.stderr || ''}`,
    status: result.status,
  };
}

function runGhAdminFallback(args) {
  const result = spawnSync('gh', ['--admin', ...args], {
    encoding: 'utf8',
    env: process.env,
  });

  if (result.status === 0) {
    return { ok: true, output: result.stdout || '' };
  }

  return {
    ok: false,
    output: `${result.stdout || ''}${result.stderr || ''}`,
    status: result.status,
  };
}

function setSecret(name, value) {
  const primary = runGhAdmin(['secret', 'set', name, '--repo', REPO, '--body', value]);
  if (primary.ok) {
    return primary;
  }

  if (primary.output.includes('403') || primary.output.includes('permission')) {
    return runGhAdminFallback(['secret', 'set', name, '--repo', REPO, '--body', value]);
  }

  return primary;
}

function run() {
  const envValues = readMergedEnv();
  const receipt = [];

  for (const secretName of SECRET_NAMES) {
    const value = envValues[secretName];
    if (!value) {
      throw new Error(`Secret ausente no ambiente local: ${secretName}`);
    }

    const result = setSecret(secretName, value);
    if (!result.ok) {
      throw new Error(`Falha ao registrar secret ${secretName}: ${result.output.trim()}`);
    }

    receipt.push(secretName);
  }

  const listResult = runGhAdmin(['secret', 'list', '--repo', REPO]);
  if (!listResult.ok) {
    throw new Error(`Falha ao listar secrets: ${listResult.output.trim()}`);
  }

  const listed = SECRET_NAMES.every(name => listResult.output.includes(name));
  if (!listed) {
    throw new Error('Secrets registrados mas não confirmados em secret list.');
  }

  console.log(
    `GitHub Actions secrets sincronizados para ${REPO}: ${receipt.join(', ')}. Valores omitidos do recibo.`,
  );
}

run();
