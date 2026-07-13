// scripts/brikaya-ship.mjs
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const CODEX_GIT_ADMIN = "/Users/mal/.codex/bin/codex-git-admin";
const CODEX_GH_ADMIN = "/Users/mal/.codex/bin/codex-gh-admin";
const REPO = "Malnati/brikaya";
const PREVIEW_URL = "https://dev.brikaya.com/";

function defaultRun(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    cwd: process.cwd(),
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} falhou:\n${result.stdout}\n${result.stderr}`);
  }

  return (result.stdout || "").trim();
}

function runOptional(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    cwd: process.cwd(),
  });
  return {
    ok: result.status === 0,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
  };
}

function hasChanges(run = defaultRun) {
  const status = run("git", ["status", "--porcelain"]);
  return status.length > 0;
}

function currentBranch(run = defaultRun) {
  return run("git", ["branch", "--show-current"]);
}

function commitMessageFromArgs(argv = process.argv) {
  const messageIndex = argv.indexOf("--message");
  if (messageIndex !== -1 && argv[messageIndex + 1]) {
    return argv[messageIndex + 1];
  }
  return "feat: entregar alterações do agente Brikaya";
}

export function validateMinimum(options = {}) {
  const run = options.run || defaultRun;
  const argv = options.argv || process.argv;

  if (argv.includes("--skip-validate")) {
    return;
  }

  run("node", ["--version"]);
  run("npm", ["run", "codex-env:check"]);
  run("npm", ["run", "test:semantic-file-names"]);
  run("npm", ["run", "test:svg-assets"]);
  run("npm", ["run", "test:visual-asset-policy"]);
  run("npm", ["run", "brikaya:scaffold-version-docs"]);
  run("npm", ["run", "verify:version-docs"]);
}

function findOpenPr(branch, runOptionalFn = runOptional) {
  const owner = REPO.split("/")[0];
  const listed = runOptionalFn(CODEX_GH_ADMIN, [
    "pr",
    "list",
    "--repo",
    REPO,
    "--head",
    `${owner}:${branch}`,
    "--state",
    "open",
    "--json",
    "number,url",
  ]);

  if (!listed.ok || !listed.stdout) {
    return null;
  }

  try {
    const parsed = JSON.parse(listed.stdout);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
    if (parsed?.number) {
      return parsed;
    }
    return null;
  } catch {
    const urlMatch = listed.stdout.match(/https:\/\/github\.com\/[^\s]+/);
    if (urlMatch) {
      return { url: urlMatch[0] };
    }
    return null;
  }
}

export function runShip(options = {}) {
  const run = options.run || defaultRun;
  const argv = options.argv || process.argv;

  if (!hasChanges(run)) {
    console.log("Nenhuma alteração para commitar.");
    const branch = currentBranch(run);
    const existingPr = findOpenPr(branch);
    if (existingPr?.url) {
      console.log(`PR existente: ${existingPr.url}`);
      console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
    }
    return;
  }

  validateMinimum({ run, argv });
  const message = commitMessageFromArgs(argv);
  run("git", ["add", "-A"]);
  run("git", ["commit", "-m", message]);
  run(CODEX_GIT_ADMIN, ["push", "-u", "origin", "HEAD"]);

  const branch = currentBranch(run);
  const existingPr = findOpenPr(branch);
  if (existingPr?.url) {
    console.log(`Push concluído. PR existente: ${existingPr.url}`);
    console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
    return;
  }

  const title = message.split("\n")[0].slice(0, 120);
  const body = [
    "## Summary",
    "- Entrega automática do agente Brikaya",
    "",
    "## Test plan",
    "- [ ] CI verde",
    `- [ ] Preview em ${PREVIEW_URL}`,
    "",
    "## Preview",
    `Após o CI, validar em ${PREVIEW_URL}`,
  ].join("\n");

  const prCreate = runOptional(CODEX_GH_ADMIN, [
    "pr",
    "create",
    "--repo",
    REPO,
    "--title",
    title,
    "--body",
    body,
  ]);

  if (!prCreate.ok) {
    const existingAfterFailure = findOpenPr(branch);
    if (existingAfterFailure?.url) {
      console.log(`Push concluído. PR existente: ${existingAfterFailure.url}`);
      console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
      return;
    }
    throw new Error(`Falha ao criar PR:\n${prCreate.stderr}`);
  }

  const prUrl =
    prCreate.stdout.split("\n").find((line) => line.includes("github.com")) ||
    prCreate.stdout;
  runOptional(CODEX_GH_ADMIN, [
    "label",
    "create",
    "brikaya-agent",
    "--repo",
    REPO,
    "--description",
    "PR criado pelo agente Brikaya",
    "--color",
    "1D76DB",
  ]);
  runOptional(CODEX_GH_ADMIN, [
    "pr",
    "edit",
    prUrl,
    "--repo",
    REPO,
    "--add-label",
    "brikaya-agent",
  ]);
  console.log(`PR criado: ${prUrl}`);
  console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
}

const isMainModule =
  process.argv[1] &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);

if (isMainModule) {
  runShip();
}
