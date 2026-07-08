#!/usr/bin/env node
// .cursor/hooks/brikaya-git-route-gate.mjs
import { readFileSync } from 'node:fs';

const CODEX_GIT_ADMIN = '/Users/mal/.codex/bin/codex-git-admin';
const CODEX_GH_ADMIN = '/Users/mal/.codex/bin/codex-gh-admin';
const BLOCKED_GIT_PUSH = /(^|\s)git\s+push\b/;
const BLOCKED_GH_PR = /(^|\s)gh\s+pr\b/;

function readHookInput() {
  try {
    const raw = readFileSync(0, 'utf8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const input = readHookInput();
const command = input.command || input.shellCommand || input.cmd || '';

if (!command) {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

const usesAdminGitRoute =
  command.includes(CODEX_GIT_ADMIN) || command.includes(CODEX_GH_ADMIN);

if (usesAdminGitRoute) {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

if (BLOCKED_GIT_PUSH.test(command)) {
  process.stdout.write(
    JSON.stringify({
      continue: false,
      message: `Use ${CODEX_GIT_ADMIN} push em vez de git push no Brikaya.`,
    }),
  );
  process.exit(1);
}

if (BLOCKED_GH_PR.test(command)) {
  process.stdout.write(
    JSON.stringify({
      continue: false,
      message: `Use ${CODEX_GH_ADMIN} pr em vez de gh pr no Brikaya.`,
    }),
  );
  process.exit(1);
}

process.stdout.write(JSON.stringify({ continue: true }));
process.exit(0);
