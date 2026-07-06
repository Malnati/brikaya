// scripts/submit-yandex-indexnow.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadProjectEnv, readProjectEnv, sanitizeOutput } from './load-project-env.mjs';

const KEY_ENV_KEY = 'BRIKAYA_INDEXNOW_KEY';
const PUBLIC_ROOT_ENV_KEY = 'BRIKAYA_INDEXNOW_PUBLIC_ROOT';
const SITEMAP_ENV_KEY = 'BRIKAYA_INDEXNOW_SITEMAP';
const ENDPOINT_ENV_KEY = 'BRIKAYA_INDEXNOW_ENDPOINT';
const DRY_RUN_ENV_KEY = 'BRIKAYA_INDEXNOW_DRY_RUN';
const DEFAULT_PUBLIC_ROOT = 'dist';
const DEFAULT_SITEMAP_PATH = 'dist/sitemap.xml';
const DEFAULT_ENDPOINT = 'https://yandex.com/indexnow';
const CANONICAL_HOST = 'brikaya.com';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const MAX_URLS_PER_REQUEST = 10000;
const XML_LOC_PATTERN = /<loc>([^<]+)<\/loc>/g;
const REDACTED_KEY_LOCATION = `${CANONICAL_ORIGIN}/[redacted].txt`;
const SUCCESS_HTTP_STATUS = 200;
const PENDING_HTTP_STATUS = 202;
const HELP_FLAGS = new Set(['--help', '-h']);

function usage() {
  return [
    'Uso: node scripts/submit-yandex-indexnow.mjs',
    '',
    'Envia URLs do dist/sitemap.xml para um endpoint IndexNow gratuito.',
    '',
    'Variáveis registradas em .env:',
    `  ${KEY_ENV_KEY}=<chave pública IndexNow>`,
    `  ${PUBLIC_ROOT_ENV_KEY}=dist`,
    `  ${SITEMAP_ENV_KEY}=dist/sitemap.xml`,
    `  ${ENDPOINT_ENV_KEY}=https://yandex.com/indexnow`,
    `  ${DRY_RUN_ENV_KEY}=true`,
  ].join('\n');
}

function fail(message) {
  throw new Error(message);
}

function envFlag(envValues, name) {
  return /^(1|true|yes)$/i.test(envValues[name] || '');
}

function text(path) {
  return readFileSync(path, 'utf8');
}

function decodeXmlText(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function indexNowKey(projectEnv) {
  const key = projectEnv[KEY_ENV_KEY];
  if (!key) fail(`${KEY_ENV_KEY} ausente no .env local`);
  if (!INDEXNOW_KEY_PATTERN.test(key)) fail(`${KEY_ENV_KEY} inválida no .env local`);
  return key;
}

function assertMaterializedKeyFile(publicRoot, key) {
  const keyPath = resolve(publicRoot, `${key}.txt`);
  if (!existsSync(keyPath)) {
    return;
  }
  if (text(keyPath).trim() !== key) {
    fail('arquivo público IndexNow diverge do .env local');
  }
}

function sitemapUrls(sitemapPath) {
  if (!existsSync(sitemapPath)) fail('sitemap IndexNow não encontrado');

  const sitemap = text(sitemapPath);
  const urls = [...sitemap.matchAll(XML_LOC_PATTERN)].map((match) => decodeXmlText(match[1].trim()));
  if (urls.length === 0) fail('sitemap IndexNow sem URLs');
  return urls;
}

function canonicalIndexableUrls(urls) {
  const seen = new Set();
  const canonicalUrls = [];

  for (const rawUrl of urls) {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      fail('URL inválida em sitemap');
    }

    if (parsed.hostname !== CANONICAL_HOST || parsed.protocol !== 'https:') {
      fail('URL fora do host canônico em sitemap');
    }
    if (parsed.href.includes('.pages.dev')) {
      fail('URL pages.dev bloqueada em sitemap');
    }
    if (!parsed.href.startsWith(`${CANONICAL_ORIGIN}/`)) {
      fail('URL fora da origem canônica em sitemap');
    }
    if (!seen.has(parsed.href)) {
      seen.add(parsed.href);
      canonicalUrls.push(parsed.href);
    }
  }

  if (canonicalUrls.length > MAX_URLS_PER_REQUEST) {
    fail('sitemap excede limite IndexNow de 10000 URLs');
  }

  return canonicalUrls;
}

function buildPayload(key, urlList) {
  return {
    host: CANONICAL_HOST,
    key,
    keyLocation: `${CANONICAL_ORIGIN}/${key}.txt`,
    urlList,
  };
}

function serviceLabel(endpoint) {
  const endpointHost = new URL(endpoint).hostname;
  if (endpointHost.includes('seznam.cz')) return 'seznam-indexnow';
  if (endpointHost.includes('yandex.')) return 'yandex-indexnow';
  return 'indexnow';
}

function sanitizedSummary(label, endpoint, urlCount, status = null) {
  const statusPart = status === null ? '' : ` status=${status}`;
  return `${label}: host=${CANONICAL_HOST} endpoint=${endpoint}${statusPart} urls=${urlCount} keyLocation=${REDACTED_KEY_LOCATION}`;
}

async function fetchStatus(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return response.status;
}

function curlStatus(endpoint, payload) {
  const result = spawnSync(
    'curl',
    [
      '--silent',
      '--show-error',
      '--output',
      '/dev/null',
      '--write-out',
      '%{http_code}',
      '--max-time',
      '30',
      '--request',
      'POST',
      '--header',
      'content-type: application/json; charset=utf-8',
      '--data-binary',
      '@-',
      endpoint,
    ],
    { input: JSON.stringify(payload), encoding: 'utf8' },
  );

  if (result.error) fail(`falha IndexNow: curl indisponível (${result.error.message})`);
  if (result.status !== 0) fail(`falha IndexNow: curl status=${result.status}`);
  return Number.parseInt((result.stdout || '').trim(), 10);
}

async function submit(endpoint, payload, envValues) {
  const label = serviceLabel(endpoint);
  let status;

  try {
    status = await fetchStatus(endpoint, payload);
  } catch (error) {
    if (label !== 'seznam-indexnow') throw error;
    status = curlStatus(endpoint, payload);
  }

  if (status === SUCCESS_HTTP_STATUS) {
    console.log(sanitizeOutput(sanitizedSummary(`${label} submitted`, endpoint, payload.urlList.length, status), envValues));
    return;
  }

  if (status === PENDING_HTTP_STATUS) {
    console.log(sanitizeOutput(sanitizedSummary(`${label} accepted-pending`, endpoint, payload.urlList.length, status), envValues));
    return;
  }

  fail(`falha IndexNow: status=${status}`);
}

async function run() {
  if (process.argv.slice(2).some((arg) => HELP_FLAGS.has(arg))) {
    console.log(usage());
    return;
  }

  const projectEnv = readProjectEnv();
  const envValues = loadProjectEnv();
  const publicRoot = resolve(process.cwd(), envValues[PUBLIC_ROOT_ENV_KEY] || DEFAULT_PUBLIC_ROOT);
  const sitemapPath = resolve(process.cwd(), envValues[SITEMAP_ENV_KEY] || DEFAULT_SITEMAP_PATH);
  const endpoint = envValues[ENDPOINT_ENV_KEY] || DEFAULT_ENDPOINT;
  const key = indexNowKey(projectEnv);
  assertMaterializedKeyFile(publicRoot, key);
  const urlList = canonicalIndexableUrls(sitemapUrls(sitemapPath));
  const payload = buildPayload(key, urlList);

  if (envFlag(envValues, DRY_RUN_ENV_KEY)) {
    const label = serviceLabel(endpoint);
    console.log(sanitizeOutput(sanitizedSummary(`${label} dry-run`, endpoint, urlList.length), { ...envValues, ...projectEnv }));
    return;
  }

  await submit(endpoint, payload, { ...envValues, ...projectEnv });
}

run().catch((error) => {
  console.error(sanitizeOutput(error.message, readProjectEnv()));
  process.exit(1);
});
