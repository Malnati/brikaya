// scripts/stamp-service-worker-version.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PLACEHOLDER = "__BRIKAYA_BUILD_ID__";
const BUILD_ID_ENV_KEY = "BRIKAYA_BUILD_ID";
const SW_FILE_ENV_KEY = "BRIKAYA_SW_FILE";
const DEFAULT_SW_FILE = "dist/sw.js";
const BUILD_ID_SAFE_PATTERN = /[^A-Za-z0-9_.-]/g;
const EMPTY_STRING = "";
const UTC_TIMESTAMP_PATTERN = /[-:.TZ]/g;
const TIMESTAMP_LENGTH = 14;
const SCRIPT_LABEL = "Service Worker version stamped";
const BUILD_ID_ASSIGNMENT_PATTERN = /const BUILD_ID = "[^"]*";/;

function buildTimestampId(date = new Date()) {
  return date
    .toISOString()
    .replace(UTC_TIMESTAMP_PATTERN, EMPTY_STRING)
    .slice(0, TIMESTAMP_LENGTH);
}

function buildIdFromEnvironment(env) {
  const configuredBuildId = env[BUILD_ID_ENV_KEY]?.trim();
  const rawBuildId = configuredBuildId || buildTimestampId();
  return rawBuildId.replace(BUILD_ID_SAFE_PATTERN, "-");
}

function resolveServiceWorkerFile(env) {
  return resolve(process.cwd(), env[SW_FILE_ENV_KEY] || DEFAULT_SW_FILE);
}

function stampServiceWorker(swFilePath, buildId) {
  if (!existsSync(swFilePath)) {
    throw new Error(`Arquivo não encontrado: ${swFilePath}`);
  }

  const source = readFileSync(swFilePath, "utf8");

  if (source.includes(PLACEHOLDER)) {
    const stampedSource = source.split(PLACEHOLDER).join(buildId);
    writeFileSync(swFilePath, stampedSource);
    return stampedSource;
  }

  if (BUILD_ID_ASSIGNMENT_PATTERN.test(source)) {
    const stampedSource = source.replace(
      BUILD_ID_ASSIGNMENT_PATTERN,
      `const BUILD_ID = "${buildId}";`,
    );
    writeFileSync(swFilePath, stampedSource);
    return stampedSource;
  }

  throw new Error(`Placeholder ausente em ${swFilePath}: ${PLACEHOLDER}`);
}

function run() {
  const buildId = buildIdFromEnvironment(process.env);
  const swFilePath = resolveServiceWorkerFile(process.env);
  stampServiceWorker(swFilePath, buildId);
  console.log(`${SCRIPT_LABEL}: ${buildId}`);
}

run();
