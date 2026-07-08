#!/usr/bin/env node
// .cursor/hooks/visual-asset-policy-gate.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const VISUAL_PATH_PATTERN =
  /(?:^|\/)(public\/assets\/visual\/|src\/constants\/visualAssets\.ts|docs\/assets\/visual-runtime\/)/;

function readHookInput() {
  try {
    const raw = readFileSync(0, 'utf8').trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function matchesVisualPolicyPath(filePath) {
  if (typeof filePath !== 'string') return false;
  const normalized = filePath.replaceAll('\\', '/');
  return VISUAL_PATH_PATTERN.test(normalized);
}

const input = readHookInput();
const editedPath = input.file_path ?? input.path ?? input.filePath ?? '';
const shouldValidate = matchesVisualPolicyPath(editedPath);

if (!shouldValidate) {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

const result = spawnSync('npm', ['run', 'test:visual-asset-policy'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

if (result.status === 0) {
  process.stdout.write(
    JSON.stringify({
      continue: true,
      message: 'Política visual SVG-first validada.',
    }),
  );
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    continue: false,
    message:
      result.stderr?.trim() ||
      result.stdout?.trim() ||
      'Falha na validação da política visual SVG-first.',
  }),
);
process.exit(1);
