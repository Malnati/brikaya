// scripts/brikaya-ship.mjs
import { spawnSync } from 'node:child_process';

const CODEX_GIT_ADMIN = '/Users/mal/.codex/bin/codex-git-admin';
const CODEX_GH_ADMIN = '/Users/mal/.codex/bin/codex-gh-admin';
const REPO = 'Malnati/brikaya';
const PREVIEW_URL = 'https://dev.brikaya.com/';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    cwd: process.cwd(),
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} falhou:\n${result.stdout}\n${result.stderr}`);
  }

  return (result.stdout || '').trim();
}

function runOptional(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function hasChanges() {
  const status = run('git', ['status', '--porcelain']);
  return status.length > 0;
}

function currentBranch() {
  return run('git', ['branch', '--show-current']);
}

function commitMessageFromArgs() {
  const messageIndex = process.argv.indexOf('--message');
  if (messageIndex !== -1 && process.argv[messageIndex + 1]) {
    return process.argv[messageIndex + 1];
  }
  return 'feat: entregar alterações do agente Brikaya';
}

function validateMinimum() {
  if (process.argv.includes('--skip-validate')) {
    return;
  }
  run('node', ['--version']);
  run('npm', ['run', 'codex-env:check']);
  run('npm', ['run', 'test:semantic-file-names']);
  run('npm', ['run', 'test:svg-assets']);
  run('npm', ['run', 'test:visual-asset-policy']);
}

function findOpenPr(branch) {
  const listed = runOptional(CODEX_GH_ADMIN, [
    'pr',
    'list',
    '--repo',
    REPO,
    '--head',
    `${REPO.split('/')[0]}:${branch}`,
    '--json',
    'number,url',
    '--jq',
    '.[0]',
  ]);

  if (!listed.ok || !listed.stdout) {
    return null;
  }

  try {
    return JSON.parse(listed.stdout);
  } catch {
    return null;
  }
}

function runShip() {
  if (!hasChanges()) {
    console.log('Nenhuma alteração para commitar.');
    const branch = currentBranch();
    const existingPr = findOpenPr(branch);
    if (existingPr?.url) {
      console.log(`PR existente: ${existingPr.url}`);
      console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
    }
    return;
  }

  validateMinimum();
  const message = commitMessageFromArgs();
  run('git', ['add', '-A']);
  run('git', ['commit', '-m', message]);
  run(CODEX_GIT_ADMIN, ['push', '-u', 'origin', 'HEAD']);

  const branch = currentBranch();
  const existingPr = findOpenPr(branch);
  if (existingPr?.url) {
    console.log(`Push concluído. PR existente: ${existingPr.url}`);
    console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
    return;
  }

  const title = message.split('\n')[0].slice(0, 120);
  const body = [
    '## Summary',
    '- Entrega automática do agente Brikaya',
    '',
    '## Test plan',
    '- [ ] CI verde',
    `- [ ] Preview em ${PREVIEW_URL}`,
    '',
    '## Preview',
    `Após o CI, validar em ${PREVIEW_URL}`,
  ].join('\n');

  const prCreate = runOptional(CODEX_GH_ADMIN, [
    'pr',
    'create',
    '--repo',
    REPO,
    '--title',
    title,
    '--body',
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

  const prUrl = prCreate.stdout.split('\n').find(line => line.includes('github.com')) || prCreate.stdout;
  runOptional(CODEX_GH_ADMIN, [
    'label',
    'create',
    'brikaya-agent',
    '--repo',
    REPO,
    '--description',
    'PR criado pelo agente Brikaya',
    '--color',
    '1D76DB',
  ]);
  runOptional(CODEX_GH_ADMIN, ['pr', 'edit', prUrl, '--repo', REPO, '--add-label', 'brikaya-agent']);
  console.log(`PR criado: ${prUrl}`);
  console.log(`Preview esperado após CI: ${PREVIEW_URL}`);
}

runShip();
