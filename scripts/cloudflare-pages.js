// scripts/cloudflare-pages.js
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const COMMAND_INDEX = 2;
const DEFAULT_COMMAND = 'env-check';
const ROOT_ENV_FILE = '/Users/mal/GitHub/malnati/.env';
const PROJECT_ENV_FILE = resolve(process.cwd(), '.env');
const ENV_FILE_PATHS = [ROOT_ENV_FILE, PROJECT_ENV_FILE];
const COMMENT_PREFIX = '#';
const ENV_SEPARATOR = '=';
const EMPTY_STRING = '';
const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';
const NPM_EXECUTABLE = 'npx';
const WRANGLER_COMMAND = 'wrangler';
const PROJECT_NAME_KEY = 'BRICKBREAKER_CLOUDFLARE_PAGES_PROJECT_NAME';
const BRANCH_KEY = 'BRICKBREAKER_CLOUDFLARE_PAGES_BRANCH';
const OUTPUT_DIR_KEY = 'BRICKBREAKER_CLOUDFLARE_PAGES_OUTPUT_DIR';
const ACCOUNT_ID_KEY = 'CLOUDFLARE_ACCOUNT_ID';
const API_TOKEN_KEY = 'CLOUDFLARE_API_TOKEN';
const DEFAULT_PAGES_PROJECT_NAME = 'malnati-brickbreaker';
const DEFAULT_PAGES_BRANCH = 'main';
const DEFAULT_OUTPUT_DIR = 'dist';
const REQUIRED_ENV_KEYS = [ACCOUNT_ID_KEY, API_TOKEN_KEY, PROJECT_NAME_KEY, BRANCH_KEY, OUTPUT_DIR_KEY];
const SENSITIVE_KEY_PATTERN = /TOKEN|SECRET|PASSWORD|JSON|REFRESH|ACCOUNT_ID|CLIENT_ID|AUD/i;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const HEX_ID_PATTERN = /\b[a-f0-9]{32}\b/g;
const SAFE_EMAIL_PLACEHOLDER = '[EMAIL]';
const SAFE_ID_PLACEHOLDER = '[ID]';
const SAFE_SECRET_PLACEHOLDER = '[REDACTED]';
const PROJECT_LIST_COMMAND = ['pages', 'project', 'list'];
const WHOAMI_COMMAND = ['whoami'];
const PROJECT_CREATE_COMMAND = ['pages', 'project', 'create'];
const PAGES_DEPLOY_COMMAND = ['pages', 'deploy'];
const PROJECT_NAME_OPTION = '--project-name';
const BRANCH_OPTION = '--branch';
const PRODUCTION_BRANCH_OPTION = '--production-branch';
const COMMANDS = new Set([
  'env-check',
  'whoami',
  'project-list',
  'ensure-project',
  'deploy'
]);

function parseEnvValue(rawValue) {
  const trimmedValue = rawValue.trim();
  const isSingleQuoted = trimmedValue.startsWith(SINGLE_QUOTE) && trimmedValue.endsWith(SINGLE_QUOTE);
  const isDoubleQuoted = trimmedValue.startsWith(DOUBLE_QUOTE) && trimmedValue.endsWith(DOUBLE_QUOTE);

  if (isSingleQuoted || isDoubleQuoted) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, 'utf8')
    .split('\n')
    .reduce((envValues, line) => {
      const trimmedLine = line.trim();
      const separatorIndex = trimmedLine.indexOf(ENV_SEPARATOR);
      const shouldSkipLine =
        trimmedLine === EMPTY_STRING || trimmedLine.startsWith(COMMENT_PREFIX) || separatorIndex === -1;

      if (shouldSkipLine) {
        return envValues;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = parseEnvValue(trimmedLine.slice(separatorIndex + 1));
      envValues[key] = value;
      return envValues;
    }, {});
}

function loadEnvironment() {
  const fileValues = ENV_FILE_PATHS.reduce((mergedValues, filePath) => {
    return { ...mergedValues, ...readEnvFile(filePath) };
  }, {});

  return {
    ...process.env,
    ...fileValues,
    [PROJECT_NAME_KEY]: fileValues[PROJECT_NAME_KEY] || process.env[PROJECT_NAME_KEY] || DEFAULT_PAGES_PROJECT_NAME,
    [BRANCH_KEY]: fileValues[BRANCH_KEY] || process.env[BRANCH_KEY] || DEFAULT_PAGES_BRANCH,
    [OUTPUT_DIR_KEY]: fileValues[OUTPUT_DIR_KEY] || process.env[OUTPUT_DIR_KEY] || DEFAULT_OUTPUT_DIR
  };
}

function buildSensitiveValues(envValues) {
  return Object.entries(envValues)
    .filter(([key, value]) => SENSITIVE_KEY_PATTERN.test(key) && typeof value === 'string' && value.length > 0)
    .map(([, value]) => value)
    .sort((leftValue, rightValue) => rightValue.length - leftValue.length);
}

function sanitizeOutput(output, envValues) {
  const sensitiveValues = buildSensitiveValues(envValues);
  const valueSanitizedOutput = sensitiveValues.reduce((sanitizedText, value) => {
    return sanitizedText.split(value).join(SAFE_SECRET_PLACEHOLDER);
  }, output);

  return valueSanitizedOutput
    .replace(EMAIL_PATTERN, SAFE_EMAIL_PLACEHOLDER)
    .replace(HEX_ID_PATTERN, SAFE_ID_PLACEHOLDER);
}

function validateEnvironment(envValues) {
  const missingKeys = REQUIRED_ENV_KEYS.filter(key => !envValues[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Variáveis ausentes: ${missingKeys.join(', ')}`);
  }
}

function runWrangler(args, envValues) {
  const result = spawnSync(NPM_EXECUTABLE, [WRANGLER_COMMAND, ...args], {
    env: envValues,
    encoding: 'utf8'
  });
  const sanitizedStdout = sanitizeOutput(result.stdout || EMPTY_STRING, envValues);
  const sanitizedStderr = sanitizeOutput(result.stderr || EMPTY_STRING, envValues);

  if (sanitizedStdout) {
    process.stdout.write(sanitizedStdout);
  }

  if (sanitizedStderr) {
    process.stderr.write(sanitizedStderr);
  }

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Wrangler falhou com status ${result.status}.`);
  }

  return result.stdout || EMPTY_STRING;
}

function printEnvCheck(envValues) {
  validateEnvironment(envValues);
  REQUIRED_ENV_KEYS.forEach(key => {
    console.log(`OK ${key}`);
  });
}

function ensureProject(envValues) {
  validateEnvironment(envValues);
  const projectName = envValues[PROJECT_NAME_KEY];
  const projectListOutput = runWrangler(PROJECT_LIST_COMMAND, envValues);
  const projectExists = projectListOutput.includes(projectName);

  if (projectExists) {
    console.log(`Projeto Pages já existe: ${projectName}`);
    return;
  }

  runWrangler(
    [...PROJECT_CREATE_COMMAND, projectName, PRODUCTION_BRANCH_OPTION, envValues[BRANCH_KEY]],
    envValues
  );
}

function deploy(envValues) {
  validateEnvironment(envValues);
  runWrangler(
    [
      ...PAGES_DEPLOY_COMMAND,
      envValues[OUTPUT_DIR_KEY],
      PROJECT_NAME_OPTION,
      envValues[PROJECT_NAME_KEY],
      BRANCH_OPTION,
      envValues[BRANCH_KEY]
    ],
    envValues
  );
}

function run() {
  const command = process.argv[COMMAND_INDEX] || DEFAULT_COMMAND;
  const envValues = loadEnvironment();

  if (!COMMANDS.has(command)) {
    throw new Error(`Comando inválido: ${command}`);
  }

  if (command === 'env-check') {
    printEnvCheck(envValues);
    return;
  }

  if (command === 'whoami') {
    validateEnvironment(envValues);
    runWrangler(WHOAMI_COMMAND, envValues);
    return;
  }

  if (command === 'project-list') {
    validateEnvironment(envValues);
    runWrangler(PROJECT_LIST_COMMAND, envValues);
    return;
  }

  if (command === 'ensure-project') {
    ensureProject(envValues);
    return;
  }

  deploy(envValues);
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
