// scripts/publish-version-release.test.mjs
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { publishVersionRelease, ensureGitIdentity } from "./publish-version-release.mjs";

function createFixtureRepo() {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "brikaya-publish-version-"));
  const tagsDir = join(fixtureRoot, ".tags");
  const releasesDir = join(fixtureRoot, ".releases");

  mkdirSync(tagsDir, { recursive: true });
  mkdirSync(releasesDir, { recursive: true });

  writeFileSync(
    join(tagsDir, "v9.md"),
    `---
tag: v9
title: Brikaya v9
---

Tag de teste.
`,
    "utf8",
  );

  writeFileSync(
    join(releasesDir, "v9.md"),
    `---
release: v9
title: Brikaya v9 — Teste
prerelease: true
---

## Destaque

- Teste automatizado.
`,
    "utf8",
  );

  return fixtureRoot;
}

function testEnsureGitIdentity() {
  const calls = [];
  const runner = {
    cwd: process.cwd(),
    spawn: (command, args) => {
      calls.push({ command, args: [...args] });

      if (command === "git" && args[0] === "config" && args[1] === "--get") {
        return { status: 1, stdout: "", stderr: "" };
      }

      return { status: 0, stdout: "", stderr: "" };
    },
  };

  ensureGitIdentity(runner, "git");

  assert.ok(
    calls.some(
      (call) =>
        call.command === "git" &&
        call.args[0] === "config" &&
        call.args[1] === "user.name" &&
        call.args[2] === "github-actions[bot]",
    ),
  );
  assert.ok(
    calls.some(
      (call) =>
        call.command === "git" &&
        call.args[0] === "config" &&
        call.args[1] === "user.email" &&
        call.args[2].includes("github-actions"),
    ),
  );
}

testEnsureGitIdentity();

const fixtureRoot = createFixtureRepo();
const calls = [];
const targetSha = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

function createTestRunner(cwd) {
  return {
    cwd,
    spawn: (command, args) => {
      calls.push({ command, args });

      if (command === "git" && args[0] === "rev-parse") {
        if (args[1] === "HEAD") {
          return { status: 0, stdout: targetSha, stderr: "" };
        }

        return { status: 1, stdout: "", stderr: "missing" };
      }

      if (command === "gh" && args[0] === "release" && args[1] === "view") {
        return { status: 1, stdout: "", stderr: "missing" };
      }

      return { status: 0, stdout: "", stderr: "" };
    },
  };
}

try {
  const result = publishVersionRelease({
    cwd: fixtureRoot,
    versionLabel: "v9",
    targetSha,
    repo: "Malnati/brikaya",
    dryRun: false,
    gitCommand: "git",
    ghCommand: "gh",
    env: {},
    runner: createTestRunner(fixtureRoot),
  });

  assert.equal(result.tagName, "v9");
  assert.ok(calls.some((call) => call.command === "git" && call.args.includes("tag")));
  assert.ok(calls.some((call) => call.command === "git" && call.args[0] === "push"));
  assert.ok(
    calls.some(
      (call) => call.command === "gh" && call.args[0] === "release" && call.args[1] === "create",
    ),
  );

  console.log("publish-version-release unit ok");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
