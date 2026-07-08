// scripts/brikaya-merge-pr.mjs
import { spawnSync } from 'node:child_process';

const CODEX_GIT_ADMIN = '/Users/mal/.codex/bin/codex-git-admin';
const CODEX_GH_ADMIN = '/Users/mal/.codex/bin/codex-gh-admin';
const REPO = 'Malnati/brikaya';
const CHECK_TIMEOUT_MS = 20 * 60 * 1000;
const CHECK_POLL_MS = 15 * 1000;

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

function runOptional(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    cwd: process.cwd(),
    ...options,
  });
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
    status: result.status,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resolvePrNumber() {
  const argNumber = process.argv[2];
  if (argNumber && /^\d+$/.test(argNumber)) {
    return Number(argNumber);
  }

  const branch = run('git', ['branch', '--show-current']);
  const listed = run(CODEX_GH_ADMIN, [
    'pr',
    'list',
    '--repo',
    REPO,
    '--head',
    `${REPO.split('/')[0]}:${branch}`,
    '--json',
    'number',
    '--jq',
    '.[0].number',
  ]);

  if (!listed) {
    throw new Error('Nenhum PR aberto encontrado para a branch atual.');
  }

  return Number(listed);
}

async function waitForChecks(prNumber) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < CHECK_TIMEOUT_MS) {
    const checks = runOptional(CODEX_GH_ADMIN, [
      'pr',
      'checks',
      String(prNumber),
      '--repo',
      REPO,
      '--watch',
      '--interval',
      '10',
    ]);

    if (checks.ok) {
      return;
    }

    const status = runOptional(CODEX_GH_ADMIN, [
      'pr',
      'view',
      String(prNumber),
      '--repo',
      REPO,
      '--json',
      'statusCheckRollup,mergeable,mergeStateStatus',
    ]);

    if (status.ok) {
      const payload = JSON.parse(status.stdout);
      const checksList = payload.statusCheckRollup || [];
      const allSuccess =
        checksList.length > 0 &&
        checksList.every(item => ['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(item.state || item.conclusion));
      if (allSuccess && payload.mergeable === 'MERGEABLE') {
        return;
      }
    }

    await sleep(CHECK_POLL_MS);
  }

  throw new Error(`Timeout aguardando checks do PR #${prNumber}.`);
}

function validateMinimum() {
  if (process.argv.includes('--skip-validate')) {
    return;
  }
  run('node', ['--version']);
  run('npm', ['run', 'codex-env:check']);
  run('npm', ['run', 'build']);
}

function mergePr(prNumber) {
  const primary = runOptional(CODEX_GH_ADMIN, [
    'pr',
    'merge',
    String(prNumber),
    '--repo',
    REPO,
    '--squash',
    '--delete-branch',
  ]);

  if (primary.ok) {
    return primary.stdout;
  }

  const fallback = runOptional('gh', [
    'pr',
    'merge',
    String(prNumber),
    '--repo',
    REPO,
    '--squash',
    '--delete-branch',
    '--admin',
  ]);

  if (!fallback.ok) {
    throw new Error(`Merge falhou:\n${primary.stderr}\n${fallback.stderr}`);
  }

  return fallback.stdout;
}

async function runMerge() {
  const prNumber = resolvePrNumber();
  console.log(`Preparando merge do PR #${prNumber}...`);

  run(CODEX_GH_ADMIN, ['pr', 'checkout', String(prNumber), '--repo', REPO]);
  run('git', ['fetch', 'origin', 'main']);
  const rebase = runOptional('git', ['rebase', 'origin/main']);

  if (!rebase.ok) {
    const conflicted = runOptional('git', ['diff', '--name-only', '--diff-filter=U']);
    if (!conflicted.ok || !conflicted.stdout) {
      throw new Error(`Rebase falhou sem conflitos resolvíveis:\n${rebase.stderr}`);
    }

    run('git', ['add', '-A']);
    run('git', ['rebase', '--continue']);
  }

  validateMinimum();
  run(CODEX_GIT_ADMIN, ['push', '--force-with-lease']);
  await waitForChecks(prNumber);
  const result = mergePr(prNumber);
  console.log(result || `PR #${prNumber} mergeado.`);
}

runMerge().catch(error => {
  console.error(error.message);
  process.exit(1);
});
