// scripts/stamp-service-worker-version.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildVersionFromGit } from "./build-version.mjs";

const BUILD_ID_PLACEHOLDER = "__BRIKAYA_BUILD_ID__";
const BUILD_VERSION_PLACEHOLDER = "__BRIKAYA_BUILD_VERSION__";
const BUILD_ID_ENV_KEY = "BRIKAYA_BUILD_ID";
const BUILD_VERSION_ENV_KEY = "BRIKAYA_BUILD_VERSION";
const SW_FILE_ENV_KEY = "BRIKAYA_SW_FILE";
const DEFAULT_SW_FILE = "dist/sw.js";
const BUILD_ID_SAFE_PATTERN = /[^A-Za-z0-9_.-]/g;
const EMPTY_STRING = "";
const UTC_TIMESTAMP_PATTERN = /[-:.TZ]/g;
const TIMESTAMP_LENGTH = 14;
const SCRIPT_LABEL = "Service Worker version stamped";
const BUILD_ID_ASSIGNMENT_PATTERN = /const BUILD_ID = "[^"]*";/;
const BUILD_VERSION_ASSIGNMENT_PATTERN = /const BUILD_VERSION = "[^"]*";/;
const BUILD_VERSION_LABEL_PATTERN = /^v\d+$/;

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

function buildVersionFromEnvironment(env, cwd = process.cwd()) {
  const configuredBuildVersion = env[BUILD_VERSION_ENV_KEY]?.trim();
  if (
    configuredBuildVersion &&
    BUILD_VERSION_LABEL_PATTERN.test(configuredBuildVersion)
  ) {
    return configuredBuildVersion;
  }

  return buildVersionFromGit(cwd);
}

function resolveServiceWorkerFile(env) {
  return resolve(process.cwd(), env[SW_FILE_ENV_KEY] || DEFAULT_SW_FILE);
}

function replacePlaceholderOrAssignment(source, placeholder, assignmentPattern, value) {
  if (source.includes(placeholder)) {
    return source.split(placeholder).join(value);
  }

  if (assignmentPattern.test(source)) {
    const constName = assignmentPattern.source.includes("BUILD_VERSION")
      ? "BUILD_VERSION"
      : "BUILD_ID";
    return source.replace(assignmentPattern, `const ${constName} = "${value}";`);
  }

  throw new Error(`Placeholder ausente: ${placeholder}`);
}

export function stampServiceWorker(swFilePath, buildId, buildVersion) {
  if (!existsSync(swFilePath)) {
    throw new Error(`Arquivo não encontrado: ${swFilePath}`);
  }

  let source = readFileSync(swFilePath, "utf8");
  source = replacePlaceholderOrAssignment(
    source,
    BUILD_ID_PLACEHOLDER,
    BUILD_ID_ASSIGNMENT_PATTERN,
    buildId,
  );
  source = replacePlaceholderOrAssignment(
    source,
    BUILD_VERSION_PLACEHOLDER,
    BUILD_VERSION_ASSIGNMENT_PATTERN,
    buildVersion,
  );
  writeFileSync(swFilePath, source);
  return source;
}

function run() {
  const buildId = buildIdFromEnvironment(process.env);
  const buildVersion = buildVersionFromEnvironment(process.env);
  const swFilePath = resolveServiceWorkerFile(process.env);
  stampServiceWorker(swFilePath, buildId, buildVersion);
  console.log(`${SCRIPT_LABEL}: buildId=${buildId} buildVersion=${buildVersion}`);
}

run();
