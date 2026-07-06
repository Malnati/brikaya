// scripts/load-project-env.mjs
import { existsSync, readFileSync, chmodSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const PROJECT_ENV_FILE_NAME = '.env';
export const ENV_EXAMPLE_FILE_NAME = '.env.example';
export const REGISTRY_FILE_NAME = 'config/codex-env.registry.json';
export const SAFE_SECRET_PLACEHOLDER = '[REDACTED]';
export const SAFE_ID_PLACEHOLDER = '[ID]';
export const REDACTED_KEY_LOCATION = 'https://brikaya.com/[redacted].txt';

const COMMENT_PREFIX = '#';
const ENV_SEPARATOR = '=';
const EMPTY_STRING = '';
const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';
const SAFE_ENV_VALUE_PATTERN = /^[A-Za-z0-9_./:@+-]+$/;
const ENV_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const SENSITIVE_KEY_PATTERN = /TOKEN|SECRET|PASSWORD|JSON|REFRESH|ACCOUNT_ID|CLIENT_ID|AUD|KEY|DNS_TXT/i;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const HEX_ID_PATTERN = /\b[a-f0-9]{32}\b/gi;
const ENV_FILE_MODE = 0o600;

export class CodexEnvError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CodexEnvError';
  }
}

export function projectEnvPath(cwd = process.cwd()) {
  return resolve(cwd, PROJECT_ENV_FILE_NAME);
}

export function envExamplePath(cwd = process.cwd()) {
  return resolve(cwd, ENV_EXAMPLE_FILE_NAME);
}

export function registryPath(cwd = process.cwd()) {
  return resolve(cwd, REGISTRY_FILE_NAME);
}

export function parseEnvValue(rawValue) {
  const trimmedValue = rawValue.trim();
  const isSingleQuoted = trimmedValue.startsWith(SINGLE_QUOTE) && trimmedValue.endsWith(SINGLE_QUOTE);
  const isDoubleQuoted = trimmedValue.startsWith(DOUBLE_QUOTE) && trimmedValue.endsWith(DOUBLE_QUOTE);

  if (isDoubleQuoted) {
    try {
      return JSON.parse(trimmedValue);
    } catch {
      return trimmedValue.slice(1, -1);
    }
  }

  if (isSingleQuoted) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

export function parseEnvText(content) {
  return content.split('\n').reduce((envValues, line) => {
    const trimmedLine = line.trim();
    const separatorIndex = trimmedLine.indexOf(ENV_SEPARATOR);
    const shouldSkipLine =
      trimmedLine === EMPTY_STRING || trimmedLine.startsWith(COMMENT_PREFIX) || separatorIndex === -1;

    if (shouldSkipLine) {
      return envValues;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    if (!ENV_NAME_PATTERN.test(key)) {
      return envValues;
    }

    envValues[key] = parseEnvValue(trimmedLine.slice(separatorIndex + 1));
    return envValues;
  }, {});
}

export function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return parseEnvText(readFileSync(filePath, 'utf8'));
}

export function readProjectEnv(cwd = process.cwd()) {
  return readEnvFile(projectEnvPath(cwd));
}

export function loadProjectEnv(cwd = process.cwd(), extraEnv = process.env) {
  return {
    ...readProjectEnv(cwd),
    ...extraEnv,
  };
}

export function loadRegistry(cwd = process.cwd()) {
  const path = registryPath(cwd);
  if (!existsSync(path)) {
    throw new CodexEnvError('config/codex-env.registry.json ausente');
  }

  return JSON.parse(readFileSync(path, 'utf8'));
}

export function registryEntries(cwd = process.cwd()) {
  const registry = loadRegistry(cwd);
  if (!Array.isArray(registry.entries)) {
    throw new CodexEnvError('registry Codex sem entries');
  }

  return registry.entries;
}

export function registryEntryByName(name, cwd = process.cwd()) {
  return registryEntries(cwd).find((entry) => entry.name === name) || null;
}

export function assertEnvName(name) {
  if (!ENV_NAME_PATTERN.test(name)) {
    throw new CodexEnvError(`nome de variável inválido: ${name}`);
  }
}

export function assertEnvValue(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new CodexEnvError('valor de variável ausente');
  }
  if (value.includes('\n') || value.includes('\r')) {
    throw new CodexEnvError('valor multiline não suportado para .env do Brikaya');
  }
}

export function quoteEnvValue(value) {
  assertEnvValue(value);
  return SAFE_ENV_VALUE_PATTERN.test(value) ? value : JSON.stringify(value);
}

export function ensureProjectEnvPermissions(cwd = process.cwd()) {
  const envPath = projectEnvPath(cwd);
  if (!existsSync(envPath)) {
    return;
  }

  const mode = statSync(envPath).mode & 0o777;
  if (mode !== ENV_FILE_MODE) {
    chmodSync(envPath, ENV_FILE_MODE);
  }
}

export function upsertProjectEnvValue(name, value, cwd = process.cwd()) {
  assertEnvName(name);
  assertEnvValue(value);

  const envPath = projectEnvPath(cwd);
  const existingContent = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  const lines = existingContent.split('\n');
  const nextLine = `${name}=${quoteEnvValue(value)}`;
  let replaced = false;
  const nextLines = lines.map((line) => {
    const separatorIndex = line.indexOf(ENV_SEPARATOR);
    if (separatorIndex === -1) {
      return line;
    }
    const key = line.slice(0, separatorIndex).trim();
    if (key === name) {
      replaced = true;
      return nextLine;
    }
    return line;
  });

  if (!replaced) {
    if (nextLines.length === 1 && nextLines[0] === EMPTY_STRING) {
      nextLines[0] = nextLine;
    } else {
      if (nextLines[nextLines.length - 1] !== EMPTY_STRING) {
        nextLines.push(EMPTY_STRING);
      }
      nextLines.push(nextLine);
    }
  }

  const normalizedContent = `${nextLines.join('\n').replace(/\n+$/u, '')}\n`;
  mkdirSync(dirname(envPath), { recursive: true });
  writeFileSync(envPath, normalizedContent, { mode: ENV_FILE_MODE });
  chmodSync(envPath, ENV_FILE_MODE);
}

export function buildSensitiveValues(envValues) {
  return Object.entries(envValues)
    .filter(([key, value]) => SENSITIVE_KEY_PATTERN.test(key) && typeof value === 'string' && value.length > 0)
    .map(([, value]) => value)
    .sort((leftValue, rightValue) => rightValue.length - leftValue.length);
}

export function sanitizeOutput(output, envValues = {}) {
  const valueSanitizedOutput = buildSensitiveValues(envValues).reduce((sanitizedText, value) => {
    return sanitizedText.split(value).join(SAFE_SECRET_PLACEHOLDER);
  }, output);

  return valueSanitizedOutput
    .replace(EMAIL_PATTERN, '[EMAIL]')
    .replace(HEX_ID_PATTERN, SAFE_ID_PLACEHOLDER)
    .replace(/https:\/\/brikaya\.com\/[A-Za-z0-9-]{8,128}\.txt/g, REDACTED_KEY_LOCATION);
}
