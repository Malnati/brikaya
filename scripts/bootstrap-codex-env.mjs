// scripts/bootstrap-codex-env.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import {
  ensureProjectEnvPermissions,
  readEnvFile,
  readProjectEnv,
  registryEntries,
  sanitizeOutput,
  upsertProjectEnvValue,
} from './load-project-env.mjs';

const ROOT_ENV_FILE = '/Users/mal/GitHub/malnati/.env';
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const DEFAULT_VALUES = {
  BRIKAYA_CLOUDFLARE_PAGES_PROJECT_NAME: 'brikaya-live',
  BRIKAYA_CLOUDFLARE_PAGES_BRANCH: 'main',
  BRIKAYA_CLOUDFLARE_PAGES_OUTPUT_DIR: 'dist',
  BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN: 'brikaya.com',
  BRIKAYA_INDEXNOW_ENDPOINT: 'https://yandex.com/indexnow',
  BRIKAYA_INDEXNOW_PUBLIC_ROOT: 'dist',
  BRIKAYA_INDEXNOW_SITEMAP: 'dist/sitemap.xml',
  BRIKAYA_INDEXNOW_DRY_RUN: 'true',
  BRIKAYA_GOOGLE_SEARCH_CONSOLE_PROPERTY: 'sc-domain:brikaya.com',
};

function discoverIndexNowKey() {
  for (const dirName of ['public', 'dist']) {
    const dir = resolve(process.cwd(), dirName);
    if (!existsSync(dir)) {
      continue;
    }
    for (const fileName of readdirSync(dir).sort()) {
      if (extname(fileName).toLowerCase() !== '.txt') {
        continue;
      }
      const keyFromName = basename(fileName, '.txt');
      if (!INDEXNOW_KEY_PATTERN.test(keyFromName)) {
        continue;
      }
      const keyFromFile = readFileSync(resolve(dir, fileName), 'utf8').trim();
      if (keyFromName === keyFromFile) {
        return keyFromFile;
      }
    }
  }
  return null;
}

function candidateValue(name, currentEnv, rootEnv) {
  if (currentEnv[name]) {
    return currentEnv[name];
  }
  if (rootEnv[name]) {
    return rootEnv[name];
  }
  if (name === 'BRIKAYA_INDEXNOW_KEY') {
    return discoverIndexNowKey();
  }
  return DEFAULT_VALUES[name] || null;
}

function run() {
  const rootEnv = readEnvFile(ROOT_ENV_FILE);
  let projectEnv = readProjectEnv();
  const registered = [];
  const kept = [];
  const missing = [];

  for (const entry of registryEntries()) {
    const value = candidateValue(entry.name, projectEnv, rootEnv);
    if (!value) {
      if (entry.required) {
        missing.push(entry.name);
      }
      continue;
    }
    if (projectEnv[entry.name]) {
      kept.push(entry.name);
      continue;
    }
    upsertProjectEnvValue(entry.name, value);
    registered.push(entry.name);
    projectEnv = readProjectEnv();
  }

  ensureProjectEnvPermissions();
  const receipt = [
    'codex-env bootstrap:',
    `registered=${registered.join(',') || 'none'}`,
    `kept=${kept.join(',') || 'none'}`,
    `missing=${missing.join(',') || 'none'}`,
    `timestamp=${new Date().toISOString()}`,
    'values=[redacted]',
  ].join(' ');

  console.log(sanitizeOutput(receipt, readProjectEnv()));
  if (missing.length > 0) {
    process.exit(1);
  }
}

run();
