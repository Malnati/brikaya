// scripts/brikaya-gh-admin-setup.mjs
import { spawnSync } from 'node:child_process';

const REPO = 'Malnati/brikaya';
const CODEX_GH_ADMIN = '/Users/mal/.codex/bin/codex-gh-admin';
const BRANCH = 'main';
const REQUIRED_CHECK = 'ci';

function runProtectionUpdate(command, args, input) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    input,
  });
}

function run() {
  const payload = JSON.stringify({
    required_status_checks: {
      strict: true,
      contexts: [REQUIRED_CHECK],
    },
    enforce_admins: false,
    required_pull_request_reviews: null,
    restrictions: null,
  });

  const primary = runProtectionUpdate(
    CODEX_GH_ADMIN,
    ['api', `repos/${REPO}/branches/${BRANCH}/protection`, '-X', 'PUT'],
    payload,
  );

  if (primary.status === 0) {
    console.log(
      `Branch protection configurada em ${REPO}:${BRANCH} com required check "${REQUIRED_CHECK}".`,
    );
    return;
  }

  const output = `${primary.stderr || ''}${primary.stdout || ''}`;
  if (output.includes('Upgrade to GitHub Pro') || output.includes('HTTP 403')) {
    console.log(
      `WARN branch protection indisponível em ${REPO} (repo privado sem GitHub Pro). CI continua ativo; configure proteção manualmente se necessário.`,
    );
    return;
  }

  const fallback = runProtectionUpdate(
    'gh',
    ['--admin', 'api', `repos/${REPO}/branches/${BRANCH}/protection`, '-X', 'PUT'],
    payload,
  );

  if (fallback.status !== 0) {
    const fallbackOutput = `${fallback.stderr || ''}${fallback.stdout || ''}`;
    if (fallbackOutput.includes('Upgrade to GitHub Pro') || fallbackOutput.includes('HTTP 403')) {
      console.log(
        `WARN branch protection indisponível em ${REPO} (repo privado sem GitHub Pro). CI continua ativo; configure proteção manualmente se necessário.`,
      );
      return;
    }

    throw new Error(
      `Falha ao configurar branch protection:\n${output}\n${fallbackOutput}`,
    );
  }

  console.log(
    `Branch protection configurada em ${REPO}:${BRANCH} com required check "${REQUIRED_CHECK}".`,
  );
}

run();
