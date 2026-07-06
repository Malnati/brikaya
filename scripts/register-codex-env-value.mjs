// scripts/register-codex-env-value.mjs
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CodexEnvError,
  ensureProjectEnvPermissions,
  readProjectEnv,
  registryEntryByName,
  sanitizeOutput,
  upsertProjectEnvValue,
} from './load-project-env.mjs';

const HELP_FLAGS = new Set(['--help', '-h']);
const VALUE_OPTION = '--value';
const FROM_FILE_OPTION = '--from-file';
const FROM_ENV_OPTION = '--from-env';
const SOURCE_OPTION = '--source';

function usage() {
  return [
    'Uso: node scripts/register-codex-env-value.mjs <ENV_NAME> (--value <valor>|--from-file <path>|--from-env <ENV_NAME>) [--source <texto>]',
    '',
    'Registra ou atualiza uma variável no .env local sem imprimir o valor.',
  ].join('\n');
}

function optionValue(args, optionName) {
  const index = args.indexOf(optionName);
  if (index === -1) {
    return null;
  }
  return args[index + 1] || null;
}

function valueFromArgs(args) {
  const directValue = optionValue(args, VALUE_OPTION);
  if (directValue !== null) {
    return directValue;
  }

  const fromFile = optionValue(args, FROM_FILE_OPTION);
  if (fromFile !== null) {
    const filePath = resolve(process.cwd(), fromFile);
    if (!existsSync(filePath)) {
      throw new CodexEnvError('arquivo de origem não encontrado');
    }
    return readFileSync(filePath, 'utf8').trim();
  }

  const fromEnv = optionValue(args, FROM_ENV_OPTION);
  if (fromEnv !== null) {
    const envValue = process.env[fromEnv];
    if (!envValue) {
      throw new CodexEnvError(`variável de origem ausente: ${fromEnv}`);
    }
    return envValue;
  }

  throw new CodexEnvError('valor ausente');
}

function run() {
  const args = process.argv.slice(2);
  if (args.some((arg) => HELP_FLAGS.has(arg))) {
    console.log(usage());
    return;
  }

  const name = args[0];
  if (!name) {
    throw new CodexEnvError('nome de variável ausente');
  }

  const entry = registryEntryByName(name);
  if (!entry) {
    throw new CodexEnvError(`variável não registrada no registry: ${name}`);
  }

  const value = valueFromArgs(args.slice(1));
  const source = optionValue(args, SOURCE_OPTION) || entry.source || 'codex';
  upsertProjectEnvValue(name, value);
  ensureProjectEnvPermissions();

  const envValues = readProjectEnv();
  const receipt = [
    'codex-env registered:',
    `key=${name}`,
    `classification=${entry.classification}`,
    `source=${source}`,
    `timestamp=${new Date().toISOString()}`,
    'value=[redacted]',
  ].join(' ');

  console.log(sanitizeOutput(receipt, envValues));
}

try {
  run();
} catch (error) {
  console.error(sanitizeOutput(error.message || String(error), readProjectEnv()));
  process.exit(1);
}
