import { pathToFileURL } from "node:url";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { buildVersionFromGit } from "./build-version.mjs";
import { parseVersionDoc } from "./parse-version-doc.mjs";
import { versionDocPaths } from "./version-doc-paths.mjs";

const BUILD_VERSION_ENV_KEY = "BRIKAYA_BUILD_VERSION";
const TARGET_SHA_ENV_KEY = "GITHUB_SHA";
const DRY_RUN_ENV_KEY = "BRIKAYA_PUBLISH_DRY_RUN";
const CODEX_GH_ADMIN = "/Users/mal/.codex/bin/codex-gh-admin";
const CODEX_GIT_ADMIN = "/Users/mal/.codex/bin/codex-git-admin";
const DEFAULT_REPO = "Malnati/brikaya";
const GIT_COMMAND = "git";
const GH_COMMAND = "gh";

function runCommand(runner, command, args, options = {}) {
  const result = runner.spawn(command, args, {
    encoding: "utf8",
    cwd: runner.cwd || process.cwd(),
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} falhou:\n${result.stdout}\n${result.stderr}`,
    );
  }

  return (result.stdout || "").trim();
}

function runOptionalCommand(runner, command, args, options = {}) {
  const result = runner.spawn(command, args, {
    encoding: "utf8",
    cwd: runner.cwd || process.cwd(),
    ...options,
  });

  return {
    ok: result.status === 0,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
    status: result.status,
  };
}

function createDefaultRunner(cwd = process.cwd()) {
  return {
    cwd,
    spawn: (command, args, options) =>
      spawnSync(command, args, {
        cwd,
        ...options,
      }),
  };
}

function resolveGhCommand() {
  if (process.env.GITHUB_ACTIONS === "true") {
    return GH_COMMAND;
  }

  if (existsSync(CODEX_GH_ADMIN)) {
    return CODEX_GH_ADMIN;
  }

  return GH_COMMAND;
}

function resolveGitCommand() {
  if (process.env.GITHUB_ACTIONS === "true") {
    return GIT_COMMAND;
  }

  if (existsSync(CODEX_GIT_ADMIN)) {
    return CODEX_GIT_ADMIN;
  }

  return GIT_COMMAND;
}

function resolveBuildVersion(env = process.env) {
  const configuredVersion = env[BUILD_VERSION_ENV_KEY]?.trim();
  return configuredVersion || buildVersionFromGit(process.cwd());
}

function resolveTargetSha(runner, env = process.env) {
  const configuredSha = env[TARGET_SHA_ENV_KEY]?.trim();
  if (configuredSha) {
    return configuredSha;
  }

  return runCommand(runner, GIT_COMMAND, ["rev-parse", "HEAD"]);
}

function readVersionDoc(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  return parseVersionDoc(readFileSync(filePath, "utf8"));
}

function parseTagDoc(versionLabel, tagDocPath) {
  const parsed = readVersionDoc(tagDocPath);
  const tagName = parsed.frontmatter.tag;

  if (tagName !== versionLabel) {
    throw new Error(
      `Campo tag em ${tagDocPath} deve ser ${versionLabel}, recebido ${tagName}.`,
    );
  }

  const title =
    typeof parsed.frontmatter.title === "string" && parsed.frontmatter.title.trim()
      ? parsed.frontmatter.title.trim()
      : `Brikaya ${versionLabel}`;

  const message = [title, "", parsed.body].filter(Boolean).join("\n");

  return {
    tagName,
    title,
    message,
  };
}

function parseReleaseDoc(versionLabel, releaseDocPath) {
  const parsed = readVersionDoc(releaseDocPath);
  const releaseName = parsed.frontmatter.release;

  if (releaseName !== versionLabel) {
    throw new Error(
      `Campo release em ${releaseDocPath} deve ser ${versionLabel}, recebido ${releaseName}.`,
    );
  }

  const title =
    typeof parsed.frontmatter.title === "string" && parsed.frontmatter.title.trim()
      ? parsed.frontmatter.title.trim()
      : `Brikaya ${versionLabel}`;

  const prerelease = parsed.frontmatter.prerelease === true;

  return {
    releaseName,
    title,
    prerelease,
    notes: parsed.body,
  };
}

function tagPointsToSha(runner, gitCommand, tagName, targetSha) {
  const result = runOptionalCommand(runner, gitCommand, [
    "rev-parse",
    `refs/tags/${tagName}^{commit}`,
  ]);

  return result.ok && result.stdout === targetSha;
}

function tagExists(runner, gitCommand, tagName) {
  const result = runOptionalCommand(runner, gitCommand, [
    "rev-parse",
    `refs/tags/${tagName}`,
  ]);
  return result.ok;
}

function ensureAnnotatedTag(
  runner,
  gitCommand,
  tagName,
  targetSha,
  message,
  dryRun,
) {
  if (tagPointsToSha(runner, gitCommand, tagName, targetSha)) {
    console.log(`Tag ${tagName} já aponta para ${targetSha}.`);
    return;
  }

  if (tagExists(runner, gitCommand, tagName)) {
    throw new Error(
      `Tag ${tagName} já existe e aponta para outro commit. Não é seguro sobrescrever.`,
    );
  }

  if (dryRun) {
    console.log(`[dry-run] git tag -a ${tagName} ${targetSha}`);
    return;
  }

  const tempDir = mkdtempSync(join(tmpdir(), "brikaya-tag-"));
  const messagePath = join(tempDir, "tag-message.txt");

  try {
    writeFileSync(messagePath, message, "utf8");
    runCommand(runner, gitCommand, ["tag", "-a", tagName, targetSha, "-F", messagePath]);
    console.log(`Tag ${tagName} criada em ${targetSha}.`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function pushTag(runner, gitCommand, tagName, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] git push origin refs/tags/${tagName}`);
    return;
  }

  runCommand(runner, gitCommand, ["push", "origin", `refs/tags/${tagName}`]);
  console.log(`Tag ${tagName} publicada no remoto.`);
}

function releaseExists(runner, ghCommand, tagName, repo) {
  const result = runOptionalCommand(runner, ghCommand, [
    "release",
    "view",
    tagName,
    "--repo",
    repo,
  ]);
  return result.ok;
}

function ensureGitHubRelease(
  runner,
  ghCommand,
  tagName,
  targetSha,
  releaseDoc,
  repo,
  dryRun,
) {
  if (releaseExists(runner, ghCommand, tagName, repo)) {
    console.log(`Release ${tagName} já existe no GitHub.`);
    return;
  }

  const tempDir = mkdtempSync(join(tmpdir(), "brikaya-release-"));
  const notesPath = join(tempDir, "release-notes.md");

  try {
    writeFileSync(notesPath, releaseDoc.notes, "utf8");

    const args = [
      "release",
      "create",
      tagName,
      "--repo",
      repo,
      "--target",
      targetSha,
      "--title",
      releaseDoc.title,
      "--notes-file",
      notesPath,
    ];

    if (releaseDoc.prerelease) {
      args.push("--prerelease");
    }

    if (dryRun) {
      console.log(`[dry-run] ${ghCommand} ${args.join(" ")}`);
      return;
    }

    runCommand(runner, ghCommand, args);
    console.log(`Release ${tagName} publicada no GitHub.`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

export function publishVersionRelease(options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const dryRun = options.dryRun ?? env[DRY_RUN_ENV_KEY] === "true";
  const versionLabel =
    options.versionLabel || resolveBuildVersion(env);
  const repo = options.repo || env.GITHUB_REPOSITORY || DEFAULT_REPO;
  const gitCommand = options.gitCommand || resolveGitCommand();
  const ghCommand = options.ghCommand || resolveGhCommand();
  const runner = options.runner || createDefaultRunner(cwd);
  const resolvedTargetSha =
    options.targetSha || resolveTargetSha(runner, env);

  const { tagDocPath, releaseDocPath } = versionDocPaths(versionLabel, cwd);
  const tagDoc = parseTagDoc(versionLabel, tagDocPath);
  const releaseDoc = parseReleaseDoc(versionLabel, releaseDocPath);

  ensureAnnotatedTag(
    runner,
    gitCommand,
    tagDoc.tagName,
    resolvedTargetSha,
    tagDoc.message,
    dryRun,
  );
  pushTag(runner, gitCommand, tagDoc.tagName, dryRun);
  ensureGitHubRelease(
    runner,
    ghCommand,
    tagDoc.tagName,
    resolvedTargetSha,
    releaseDoc,
    repo,
    dryRun,
  );

  return {
    versionLabel,
    targetSha: resolvedTargetSha,
    tagName: tagDoc.tagName,
    releaseTitle: releaseDoc.title,
  };
}

function run() {
  const result = publishVersionRelease();
  console.log(
    `Version publish ok: ${result.tagName} @ ${result.targetSha.slice(0, 7)}.`,
  );
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  run();
}
