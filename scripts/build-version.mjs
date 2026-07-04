// scripts/build-version.mjs
import { execFileSync } from "node:child_process";

const GIT_COMMAND = "git";
const GIT_REV_LIST_ARGS = ["rev-list", "--count", "HEAD"];
const BUILD_VERSION_PREFIX = "v";
const FALLBACK_BUILD_VERSION = "v0";
const DECIMAL_RADIX = 10;

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

    return `${BUILD_VERSION_PREFIX}${parsedCommitCount}`;
  } catch {
    return FALLBACK_BUILD_VERSION;
  }
}
