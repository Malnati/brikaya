#!/usr/bin/env node
// .cursor/hooks/brikaya-ship-reminder.mjs
import { spawnSync } from 'node:child_process';

function hasUncommittedChanges() {
  const result = spawnSync('git', ['status', '--porcelain'], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  return Boolean((result.stdout || '').trim());
}

if (!hasUncommittedChanges()) {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    continue: true,
    message:
      'Há alterações locais não enviadas. Se o prompt foi atendido, feche-o sem pedir permissão: preencha os resultados em .tags/vN.md e .releases/vN.md, execute npm run brikaya:ship e npm run brikaya:merge-pr — o deploy cria a tag vN e a release com esses resultados.',
  }),
);
process.exit(0);
