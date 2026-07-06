// scripts/submit-yandex-indexnow.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

const PUBLIC_ROOT_ENV_KEY = 'BRIKAYA_INDEXNOW_PUBLIC_ROOT';
const SITEMAP_ENV_KEY = 'BRIKAYA_INDEXNOW_SITEMAP';
const ENDPOINT_ENV_KEY = 'BRIKAYA_INDEXNOW_ENDPOINT';
const DRY_RUN_ENV_KEY = 'BRIKAYA_INDEXNOW_DRY_RUN';
const DEFAULT_PUBLIC_ROOT = 'public';
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
    'Envia URLs do dist/sitemap.xml para o IndexNow/Yandex.',
    '',
    'Variáveis:',
    `  ${PUBLIC_ROOT_ENV_KEY}=public`,
    `  ${SITEMAP_ENV_KEY}=dist/sitemap.xml`,
    `  ${ENDPOINT_ENV_KEY}=https://yandex.com/indexnow`,
    `  ${DRY_RUN_ENV_KEY}=true`,
  ].join('\n');
}

function fail(message) {
  throw new Error(message);
}

function envFlag(name) {
  return /^(1|true|yes)$/i.test(process.env[name] || '');
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

function findIndexNowKey(publicRoot) {
  if (!existsSync(publicRoot)) fail('diretório público IndexNow não encontrado');

  const matchingKeys = readdirSync(publicRoot)
    .filter((entry) => extname(entry).toLowerCase() === '.txt')
    .sort()
    .map((entry) => {
      const filePath = resolve(publicRoot, entry);
      const keyFromName = basename(entry, '.txt');
      const keyFromFile = text(filePath).trim();
      return keyFromName === keyFromFile ? keyFromFile : null;
    })
    .filter(Boolean);

  if (matchingKeys.length === 0) fail('chave IndexNow não encontrada');

  const key = matchingKeys[0];
  if (!INDEXNOW_KEY_PATTERN.test(key)) fail('chave IndexNow inválida');

  return key;
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

function sanitizedSummary(label, endpoint, urlCount, status = null) {
  const statusPart = status === null ? '' : ` status=${status}`;
  return `${label}: host=${CANONICAL_HOST} endpoint=${endpoint}${statusPart} urls=${urlCount} keyLocation=${REDACTED_KEY_LOCATION}`;
}

async function submit(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (response.status === SUCCESS_HTTP_STATUS) {
    console.log(sanitizedSummary('yandex-indexnow submitted', endpoint, payload.urlList.length, response.status));
    return;
  }

  if (response.status === PENDING_HTTP_STATUS) {
    console.log(sanitizedSummary('yandex-indexnow accepted-pending', endpoint, payload.urlList.length, response.status));
    return;
  }

  fail(`falha IndexNow: status=${response.status}`);
}

async function run() {
  if (process.argv.slice(2).some((arg) => HELP_FLAGS.has(arg))) {
    console.log(usage());
    return;
  }

  const publicRoot = resolve(process.cwd(), process.env[PUBLIC_ROOT_ENV_KEY] || DEFAULT_PUBLIC_ROOT);
  const sitemapPath = resolve(process.cwd(), process.env[SITEMAP_ENV_KEY] || DEFAULT_SITEMAP_PATH);
  const endpoint = process.env[ENDPOINT_ENV_KEY] || DEFAULT_ENDPOINT;
  const key = findIndexNowKey(publicRoot);
  const urlList = canonicalIndexableUrls(sitemapUrls(sitemapPath));
  const payload = buildPayload(key, urlList);

  if (envFlag(DRY_RUN_ENV_KEY)) {
    console.log(sanitizedSummary('yandex-indexnow dry-run', endpoint, urlList.length));
    return;
  }

  await submit(endpoint, payload);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
