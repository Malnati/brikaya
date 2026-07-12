// scripts/debug-mime-publication.mjs
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadProjectEnv } from './load-project-env.mjs';

const LOG_PATH = resolve(process.cwd(), '.cursor/debug-9600b7.log');
const SESSION_ID = '9600b7';
const RUN_ID = process.env.DEBUG_RUN_ID || 'pre-fix';
const CUSTOM_DOMAIN = 'brikaya.com';
const STALE_PATH = '/assets/index-__stale_probe__.js';
const API_BASE = 'https://api.cloudflare.com/client/v4';

function log(hypothesisId, location, message, data = {}) {
  const entry = {
    sessionId: SESSION_ID,
    runId: RUN_ID,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
  fetch('http://127.0.0.1:7746/ingest/75c78413-7aab-44a9-9639-0f9dc87ea232', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION_ID,
    },
    body: JSON.stringify(entry),
  }).catch(() => {});
}

async function cfApi(pathname, env, options = {}) {
  const response = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

async function probeUrl(url) {
  const response = await fetch(url, { cache: 'no-store' });
  return {
    url,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    cfCacheStatus: response.headers.get('cf-cache-status') || '',
  };
}

async function main() {
  const env = loadProjectEnv(process.cwd());
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const projectName = env.BRIKAYA_CLOUDFLARE_PAGES_PROJECT_NAME || 'brikaya-live';
  const zoneName = env.BRIKAYA_CLOUDFLARE_ZONE_NAME || 'brikaya.com';

  log('A', 'debug-mime-publication.mjs:main', 'start', {
    hasAccountId: Boolean(accountId),
    hasApiToken: Boolean(env.CLOUDFLARE_API_TOKEN),
    projectName,
    zoneName,
  });

  const project = await cfApi(
    `/accounts/${accountId}/pages/projects/${projectName}`,
    env,
    { method: 'GET' },
  );
  const deploymentConfigs = project.payload?.result?.deployment_configs || null;
  const productionHandling =
    deploymentConfigs?.production?.not_found_handling || 'unknown';
  const previewHandling =
    deploymentConfigs?.preview?.not_found_handling || 'unknown';

  log('B', 'debug-mime-publication.mjs:project', 'pages project not_found_handling', {
    projectOk: project.ok,
    projectStatus: project.status,
    productionHandling,
    previewHandling,
    deploymentConfigKeys: deploymentConfigs ? Object.keys(deploymentConfigs) : [],
    deploymentConfigs,
  });

  const zones = await cfApi(
    `/zones?name=${encodeURIComponent(zoneName)}&account.id=${accountId}`,
    env,
    { method: 'GET' },
  );
  const zoneId = zones.payload?.result?.[0]?.id || '';
  log('C', 'debug-mime-publication.mjs:zone', 'zone lookup', {
    zoneOk: zones.ok,
    zoneIdPresent: Boolean(zoneId),
  });

  let purgeResult = { skipped: true };
  if (zoneId) {
    const purge = await cfApi(`/zones/${zoneId}/purge_cache`, env, {
      method: 'POST',
      body: JSON.stringify({ purge_everything: true }),
    });
    purgeResult = {
      ok: purge.ok,
      status: purge.status,
      errors: purge.payload?.errors || [],
    };
    log('A', 'debug-mime-publication.mjs:purge', 'zone purge attempt', purgeResult);
  }

  const staleProbe = await probeUrl(`https://${CUSTOM_DOMAIN}${STALE_PATH}?debug=${Date.now()}`);
  log('D', 'debug-mime-publication.mjs:probe', 'stale bundle probe', staleProbe);

  const indexProbe = await probeUrl(`https://${CUSTOM_DOMAIN}/?debug=${Date.now()}`);
  const indexHtml = await fetch(indexProbe.url).then((response) => response.text());
  const scriptMatch = indexHtml.match(/assets\/index-[^"']+\.js/i)?.[0] || '';
  let bundleProbe = { skipped: true };
  if (scriptMatch) {
    bundleProbe = await probeUrl(`https://${CUSTOM_DOMAIN}/${scriptMatch}?debug=${Date.now()}`);
    log('E', 'debug-mime-publication.mjs:bundle', 'current bundle probe', bundleProbe);
  }

  const summary = {
    productionHandling,
    purgeOk: purgeResult.ok === true,
    staleStatus: staleProbe.status,
    staleContentType: staleProbe.contentType,
    bundleStatus: bundleProbe.status,
    bundleContentType: bundleProbe.contentType,
  };
  log('ALL', 'debug-mime-publication.mjs:summary', 'diagnostic summary', summary);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  log('ALL', 'debug-mime-publication.mjs:error', 'diagnostic failed', {
    message: error instanceof Error ? error.message : String(error),
  });
  console.error(error);
  process.exit(1);
});
