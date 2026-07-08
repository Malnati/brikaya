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
      'Há alterações locais não enviadas. Ao concluir a tarefa, execute npm run brikaya:ship sem pedir permissão.',
  }),
);
process.exit(0);
