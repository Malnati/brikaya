// scripts/build-version.mjs
import { execFileSync } from "node:child_process";

const GIT_COMMAND = "git";
const GIT_REV_LIST_ARGS = ["rev-list", "--count", "HEAD"];
const BUILD_VERSION_PREFIX = "v";
const FALLBACK_BUILD_VERSION = "v0";
const FALLBACK_COMMIT_COUNT = 0;
const DECIMAL_RADIX = 10;
const BUILD_VERSION_PATTERN = /^v(\d+)$/;
const NPM_PATCH_SUFFIX = ".0.0";

export function buildVersionLabelFromCount(commitCount) {
  if (!Number.isFinite(commitCount) || commitCount < 1) {
    return FALLBACK_BUILD_VERSION;
  }

  return `${BUILD_VERSION_PREFIX}${Math.trunc(commitCount)}`;
}

export function commitCountFromBuildVersion(versionLabel) {
  const match = BUILD_VERSION_PATTERN.exec(versionLabel);
  if (!match) {
    throw new Error(`Versão inválida: ${versionLabel}. Esperado formato vN.`);
  }

  return Number.parseInt(match[1], DECIMAL_RADIX);
}

export function npmSemverFromBuildVersion(versionLabel) {
  const commitCount = commitCountFromBuildVersion(versionLabel);
  return `${commitCount}${NPM_PATCH_SUFFIX}`;
}

export function buildVersionFromGit(cwd = process.cwd()) {
  try {
    const commitCount = execFileSync(GIT_COMMAND, GIT_REV_LIST_ARGS, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const parsedCommitCount = Number.parseInt(commitCount, DECIMAL_RADIX);

    if (!Number.isFinite(parsedCommitCount) || parsedCommitCount < 1) {
      return FALLBACK_BUILD_VERSION;
    }

    return buildVersionLabelFromCount(parsedCommitCount);
  } catch {
    return FALLBACK_BUILD_VERSION;
  }
}

export function npmSemverFromGit(cwd = process.cwd()) {
  return npmSemverFromBuildVersion(buildVersionFromGit(cwd));
}

export { FALLBACK_BUILD_VERSION, FALLBACK_COMMIT_COUNT, BUILD_VERSION_PATTERN };
