// scripts/sync-package-version.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildVersionFromGit,
  npmSemverFromBuildVersion,
} from "./build-version.mjs";

const PACKAGE_JSON = "package.json";
const PACKAGE_LOCK = "package-lock.json";
const JSON_INDENT = 2;
const ROOT_PACKAGE_KEY = "";

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, JSON_INDENT)}\n`);
}

export function readExpectedNpmSemver(options = {}) {
  if (typeof options.buildVersionLabel === "string") {
    return npmSemverFromBuildVersion(options.buildVersionLabel);
  }

  const cwd = options.cwd || process.cwd();
  return npmSemverFromBuildVersion(buildVersionFromGit(cwd));
}

export function syncPackageVersionFiles(options = {}) {
  const cwd = options.cwd || process.cwd();
  const npmSemver = options.npmSemver || readExpectedNpmSemver({ cwd });
  const packageJsonPath = resolve(cwd, PACKAGE_JSON);
  const packageLockPath = resolve(cwd, PACKAGE_LOCK);

  const packageJson = readJson(packageJsonPath);
  packageJson.version = npmSemver;
  writeJson(packageJsonPath, packageJson);

  const packageLock = readJson(packageLockPath);
  packageLock.version = npmSemver;
  if (packageLock.packages && packageLock.packages[ROOT_PACKAGE_KEY]) {
    packageLock.packages[ROOT_PACKAGE_KEY].version = npmSemver;
  }
  writeJson(packageLockPath, packageLock);

  return { npmSemver, packageJsonPath, packageLockPath };
}

export function verifyPackageVersionFiles(options = {}) {
  const cwd = options.cwd || process.cwd();
  const npmSemver = options.npmSemver || readExpectedNpmSemver({ cwd });
  const packageJsonPath = resolve(cwd, PACKAGE_JSON);
  const packageLockPath = resolve(cwd, PACKAGE_LOCK);

  const packageJson = readJson(packageJsonPath);
  if (packageJson.version !== npmSemver) {
    throw new Error(
      `package.json version="${packageJson.version}" diverge de ${npmSemver}.`,
    );
  }

  const packageLock = readJson(packageLockPath);
  if (packageLock.version !== npmSemver) {
    throw new Error(
      `package-lock.json version="${packageLock.version}" diverge de ${npmSemver}.`,
    );
  }

  const rootPackage = packageLock.packages?.[ROOT_PACKAGE_KEY];
  if (rootPackage && rootPackage.version !== npmSemver) {
    throw new Error(
      `package-lock.json packages[""].version="${rootPackage.version}" diverge de ${npmSemver}.`,
    );
  }

  return { npmSemver };
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return entry.endsWith("sync-package-version.mjs");
}

function run() {
  const mode = process.argv.includes("--verify") ? "verify" : "sync";
  const cwd = process.cwd();
  const npmSemver = readExpectedNpmSemver({ cwd });

  if (mode === "verify") {
    verifyPackageVersionFiles({ cwd, npmSemver });
    console.log(`Package version ok: ${npmSemver}`);
    return;
  }

  const synced = syncPackageVersionFiles({ cwd, npmSemver });
  console.log(`Package version synced: ${synced.npmSemver}`);
}

if (isMainModule()) {
  run();
}
