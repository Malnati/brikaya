// scripts/validate-codex-env.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  CodexEnvError,
  envExamplePath,
  projectEnvPath,
  readEnvFile,
  readProjectEnv,
  registryEntries,
  sanitizeOutput,
} from './load-project-env.mjs';

const ENV_KEY_LITERAL_PATTERN = /['"`]((?:BRIKAYA|CLOUDFLARE|GOOGLE|YANDEX)_[A-Z0-9_]+)['"`]/g;
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const PUBLIC_ARTIFACT_DIRS = ['public', 'dist'];
const ALLOWED_CLASSIFICATIONS = new Set(['secret', 'public-generated', 'public-config']);
const REQUIRED_ENV_MODE = 0o600;
const SCAN_EXTENSIONS = new Set(['.js', '.mjs', '.ts', '.tsx', '.md', '.json', '.html', '.sh']);
const SCAN_FILES_WITHOUT_EXT = new Set(['Makefile', '.env.example', 'AGENTS.md']);

function fail(messages, envValues) {
  if (messages.length > 0) {
    throw new CodexEnvError(sanitizeOutput(`codex-env check failed:\n- ${messages.join('\n- ')}`, envValues));
  }
}

function trackedFiles() {
  const result = spawnSync('git', ['ls-files'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .split('\n')
    .filter(Boolean)
    .filter((file) => {
      const extension = extname(file);
      const base = basename(file);
      return SCAN_EXTENSIONS.has(extension) || SCAN_FILES_WITHOUT_EXT.has(base);
    });
}

function envLiteralsInTrackedFiles() {
  const keys = new Set();
  for (const file of trackedFiles()) {
    const filePath = resolve(process.cwd(), file);
    if (!existsSync(filePath)) {
      continue;
    }
    const content = readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(ENV_KEY_LITERAL_PATTERN)) {
      keys.add(match[1]);
    }
  }
  return [...keys].sort();
}

function envExampleKeys() {
  return Object.keys(readEnvFile(envExamplePath()));
}

function validateRegistry(entries, errors) {
  const seen = new Set();
  for (const entry of entries) {
    if (!entry.name) {
      errors.push('registry contém entry sem name');
      continue;
    }
    if (seen.has(entry.name)) {
      errors.push(`registry contém variável duplicada: ${entry.name}`);
    }
    seen.add(entry.name);
    if (!ALLOWED_CLASSIFICATIONS.has(entry.classification)) {
      errors.push(`classification inválida para ${entry.name}`);
    }
  }
}

function validateEnvExample(entries, exampleKeys, errors) {
  const exampleKeySet = new Set(exampleKeys);
  for (const entry of entries) {
    if (!exampleKeySet.has(entry.name)) {
      errors.push(`${entry.name} não está em .env.example`);
    }
  }
}

function validateProjectEnv(entries, projectEnv, errors) {
  const envPath = projectEnvPath();
  if (!existsSync(envPath)) {
    errors.push('.env local ausente');
    return;
  }

  const mode = statSync(envPath).mode & 0o777;
  if (mode !== REQUIRED_ENV_MODE) {
    errors.push('.env local deve estar com permissão 0600');
  }

  for (const entry of entries.filter((item) => item.required)) {
    if (!projectEnv[entry.name]) {
      errors.push(`${entry.name} ausente no .env local`);
    }
  }
}

function validateUnknownProjectEnvKeys(entries, projectEnv, errors) {
  const registryNames = new Set(entries.map((entry) => entry.name));
  for (const key of Object.keys(projectEnv).sort()) {
    if (/^(BRIKAYA|CLOUDFLARE|GOOGLE|YANDEX)_/.test(key) && !registryNames.has(key)) {
      errors.push(`${key} presente no .env local mas ausente do registry`);
    }
  }
}

function validateTrackedEnvLiterals(entries, errors) {
  const registryNames = new Set(entries.map((entry) => entry.name));
  for (const key of envLiteralsInTrackedFiles()) {
    if (!registryNames.has(key)) {
      errors.push(`${key} usado em artefato versionado mas ausente do registry`);
    }
  }
}

function indexNowVerificationFiles() {
  const files = [];
  for (const dirName of PUBLIC_ARTIFACT_DIRS) {
    const dir = resolve(process.cwd(), dirName);
    if (!existsSync(dir)) {
      continue;
    }
    for (const fileName of readdirSync(dir)) {
      if (extname(fileName).toLowerCase() !== '.txt') {
        continue;
      }
      const keyFromName = basename(fileName, '.txt');
      if (!INDEXNOW_KEY_PATTERN.test(keyFromName)) {
        continue;
      }
      const filePath = resolve(dir, fileName);
      const content = readFileSync(filePath, 'utf8').trim();
      if (content === keyFromName) {
        files.push({ dirName, key: content });
      }
    }
  }
  return files;
}

function validateIndexNowMirrors(projectEnv, errors) {
  const envKey = projectEnv.BRIKAYA_INDEXNOW_KEY;
  for (const file of indexNowVerificationFiles()) {
    if (!envKey) {
      errors.push(`arquivo IndexNow em ${file.dirName} sem BRIKAYA_INDEXNOW_KEY no .env local`);
    } else if (envKey !== file.key) {
      errors.push(`arquivo IndexNow em ${file.dirName} diverge de BRIKAYA_INDEXNOW_KEY no .env local`);
    }
  }
}

function run() {
  const entries = registryEntries();
  const projectEnv = readProjectEnv();
  const errors = [];

  validateRegistry(entries, errors);
  validateEnvExample(entries, envExampleKeys(), errors);
  validateProjectEnv(entries, projectEnv, errors);
  validateUnknownProjectEnvKeys(entries, projectEnv, errors);
  validateTrackedEnvLiterals(entries, errors);
  validateIndexNowMirrors(projectEnv, errors);
  fail(errors, projectEnv);

  console.log(
    sanitizeOutput(
      `codex-env check ok: registry=${entries.length} required=${entries.filter((entry) => entry.required).length} envFile=.env`,
      projectEnv,
    ),
  );
}

try {
  run();
} catch (error) {
  console.error(sanitizeOutput(error.message || String(error), readProjectEnv()));
  process.exit(1);
}
