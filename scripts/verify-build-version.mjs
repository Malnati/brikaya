// scripts/verify-build-version.mjs
import { execFileSync } from "node:child_process";

import { buildVersionFromGit } from "./build-version.mjs";

const GIT_COMMAND = "git";
const GIT_REV_LIST_ARGS = ["rev-list", "--count", "HEAD"];
const STUCK_VERSION_LABEL = "v1";
const MIN_COMMIT_COUNT_FOR_GUARD = 2;
const DECIMAL_RADIX = 10;

function readCommitCount(cwd = process.cwd()) {
  try {
    const commitCount = execFileSync(GIT_COMMAND, GIT_REV_LIST_ARGS, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const parsedCommitCount = Number.parseInt(commitCount, DECIMAL_RADIX);
    return Number.isFinite(parsedCommitCount) ? parsedCommitCount : 0;
  } catch {
    return 0;
  }
}

function run() {
  const buildVersion = buildVersionFromGit(process.cwd());
  const commitCount = readCommitCount(process.cwd());

  if (
    commitCount >= MIN_COMMIT_COUNT_FOR_GUARD &&
    buildVersion === STUCK_VERSION_LABEL
  ) {
    throw new Error(
      [
        `Versão de build presa em ${STUCK_VERSION_LABEL} com ${commitCount} commits.`,
        "Verifique checkout shallow (fetch-depth: 0) ou disponibilidade do Git no ambiente de build.",
      ].join(" "),
    );
  }

  console.log(`Build version ok: ${buildVersion} (${commitCount} commits).`);
}

run();
