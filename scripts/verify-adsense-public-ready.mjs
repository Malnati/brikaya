import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  MIN_EDITORIAL_MAIN_WORDS,
  editorialLocalePath,
} from './editorial-page-content.mjs';
import { MIN_LANDING_MAIN_WORDS } from './landing-page-content.mjs';
import {
  LEGAL_DEFAULT_LOCALE,
  MIN_LEGAL_MAIN_WORDS,
} from './legal-page-content.mjs';

const CANONICAL_ORIGIN = 'https://brikaya.com';
const EXPECTED_PUBLISHER_ID = 'pub-9571619183194136';
const EXPECTED_HREFLANGS = ['en', 'pt-BR', 'es-419', 'x-default'];
const OWNERSHIP_PATTERN = new RegExp(
  `https://pagead2\\.googlesyndication\\.com/pagead/js/adsbygoogle\\.js\\?client=ca-${EXPECTED_PUBLISHER_ID}`,
  'g',
);
const AD_RUNTIME_PATTERN =
  /pagead2\.googlesyndication\.com|\badsbygoogle\b|\badBreak\b|\badConfig\b|google_ad_/i;
const ELIGIBILITY = JSON.parse(
  readFileSync(resolve('config/locale-eligibility.json'), 'utf8'),
);
const SEARCH_LOCALES = ELIGIBILITY.searchEditions.map(
  (edition) => edition.locale,
);
const FUNCTIONAL_NOINDEX_PATHS = [
  '/play/',
  '/downloads/',
  '/user-agreement/',
  '/license/',
  '/en/play/',
  '/en/downloads/',
  '/es-419/play/',
  '/es-419/downloads/',
  '/ca/',
  '/ca/legal/',
];
const FETCH_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 20_000;

function fail(message) {
  throw new Error(`adsense-public-ready: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function stripHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:\w+|#\d+);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAttribute(tag, name) {
  return (
    tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] ?? null
  );
}

export function analyzeHtml(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const canonicalTag =
    html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    html.match(/<link\b[^>]*\bhref=["'][^"']+["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[0] ??
    '';
  const robotsTag =
    html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0] ?? '';
  const alternateTags = [
    ...html.matchAll(
      /<link\b[^>]*\brel=["']alternate["'][^>]*\bhreflang=["'][^"']+["'][^>]*>/gi,
    ),
  ].map((match) => match[0]);
  const ownershipCount = [...html.matchAll(OWNERSHIP_PATTERN)].length;
  const htmlWithoutOwnership = html.replace(OWNERSHIP_PATTERN, '');
  const text = stripHtml(main);

  return {
    canonical: extractAttribute(canonicalTag, 'href'),
    robots: extractAttribute(robotsTag, 'content'),
    hreflangs: alternateTags
      .map((tag) => extractAttribute(tag, 'hreflang'))
      .filter(Boolean),
    ownershipCount,
    hasAdvertisingRuntime: AD_RUNTIME_PATTERN.test(htmlWithoutOwnership),
    lang:
      html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1] ?? null,
    words: text ? text.split(/\s+/).length : 0,
    mainHash: createHash('sha256').update(text).digest('hex'),
    internalHrefs: [
      ...html.matchAll(/\bhref=["']([^"'#]+)["']/gi),
    ].map((match) => match[1]),
  };
}

export function assertIndexablePage(
  page,
  { url, minWords, expectedHreflangs, ownershipAllowed = false },
) {
  assert(page.canonical === url, `${url} canonical=${page.canonical ?? 'missing'}`);
  assert(page.robots === 'index,follow', `${url} must use index,follow`);
  assert(
    page.words >= minWords,
    `${url} has ${page.words} main words; minimum=${minWords}`,
  );
  const actualHreflangs = [...new Set(page.hreflangs)].sort();
  const expected = [...expectedHreflangs].sort();
  assert(
    JSON.stringify(actualHreflangs) === JSON.stringify(expected),
    `${url} hreflang=${actualHreflangs.join(',')} expected=${expected.join(',')}`,
  );
  assert(
    ownershipAllowed ? page.ownershipCount === 1 : page.ownershipCount === 0,
    `${url} ownership snippet count=${page.ownershipCount}`,
  );
  assert(
    !page.hasAdvertisingRuntime,
    `${url} contains advertising runtime beyond ownership verification`,
  );
}

export function assertFunctionalNoindexPage(page, { url }) {
  assert(page.canonical === url, `${url} canonical=${page.canonical ?? 'missing'}`);
  assert(page.robots === 'noindex,follow', `${url} must use noindex,follow`);
  assert(page.hreflangs.length === 0, `${url} must not publish hreflang`);
  assert(page.ownershipCount === 0, `${url} ownership snippet is forbidden`);
  assert(!page.hasAdvertisingRuntime, `${url} contains advertising runtime`);
}

function landingPath(locale) {
  if (locale === 'pt-BR') return '/';
  return `/${locale}/`;
}

function trustPath(locale, path) {
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}

function expectedPages() {
  return [
    ...SEARCH_LOCALES.map((locale) => ({
      path: landingPath(locale),
      minWords: MIN_LANDING_MAIN_WORDS,
      locale,
      type: 'landing',
    })),
    ...ELIGIBILITY.indexableTrustPaths.flatMap((path) =>
      SEARCH_LOCALES.map((locale) => ({
        path: trustPath(locale, path),
        minWords: MIN_LEGAL_MAIN_WORDS,
        locale: locale === 'en' ? LEGAL_DEFAULT_LOCALE : locale,
        type: 'trust',
      })),
    ),
    ...EDITORIAL_PATHS.flatMap((path) =>
      EDITORIAL_LOCALES.map((locale) => ({
        path: editorialLocalePath(locale, path),
        minWords: MIN_EDITORIAL_MAIN_WORDS,
        locale,
        type: 'editorial',
      })),
    ),
  ];
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_ATTEMPTS) {
        await new Promise((resolvePromise) =>
          setTimeout(resolvePromise, attempt * 250),
        );
      }
    }
  }
  throw lastError;
}

function fetchUrl(baseUrl, path) {
  return new URL(path.replace(/^\//, ''), baseUrl).href;
}

async function fetchText(baseUrl, path, options = {}) {
  const url = fetchUrl(baseUrl, path);
  const response = await fetchWithRetry(url, options);
  return {
    body: await response.text(),
    response,
    url,
  };
}

async function verifyHttpRedirect() {
  if (process.env.BRIKAYA_SKIP_HTTPS_REDIRECT === '1') return;
  const response = await fetchWithRetry('http://brikaya.com/', {
    redirect: 'manual',
  });
  assert(
    [301, 302, 307, 308].includes(response.status),
    `HTTP apex redirect status=${response.status}`,
  );
  assert(
    response.headers.get('location')?.startsWith(`${CANONICAL_ORIGIN}/`),
    `HTTP apex redirect location=${response.headers.get('location') ?? 'missing'}`,
  );
}

async function run() {
  const baseUrl = new URL(
    process.env.BRIKAYA_PUBLIC_URL ?? `${CANONICAL_ORIGIN}/`,
  );
  const pages = expectedPages();
  assert(pages.length === 33, `expected page model count=${pages.length}`);

  const sitemap = await fetchText(baseUrl, '/sitemap.xml');
  assert(sitemap.response.status === 200, `sitemap status=${sitemap.response.status}`);
  const sitemapUrls = [
    ...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  const expectedCanonicalUrls = pages.map(
    (page) => `${CANONICAL_ORIGIN}${page.path}`,
  );
  assert(sitemapUrls.length === 33, `sitemap URLs=${sitemapUrls.length}`);
  assert(
    new Set(sitemapUrls).size === sitemapUrls.length,
    'sitemap contains duplicate URLs',
  );
  assert(
    JSON.stringify([...sitemapUrls].sort()) ===
      JSON.stringify([...expectedCanonicalUrls].sort()),
    'sitemap differs from the controlled 33-URL inventory',
  );

  const robots = await fetchText(baseUrl, '/robots.txt');
  assert(robots.response.status === 200, `robots status=${robots.response.status}`);
  assert(
    !/^Disallow:\s*\/\s*$/im.test(robots.body),
    'production robots blocks the entire site',
  );
  assert(
    robots.body.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`),
    'robots.txt missing canonical sitemap',
  );

  const ads = await fetchText(baseUrl, '/ads.txt');
  assert(ads.response.status === 200, `ads.txt status=${ads.response.status}`);
  assert(
    ads.body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .includes(
        `google.com, ${EXPECTED_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`,
      ),
    'ads.txt publisher record is missing',
  );

  const hashes = new Map();
  const internalPaths = new Set();
  for (const model of pages) {
    const result = await fetchText(baseUrl, model.path);
    assert(result.response.status === 200, `${model.path} status=${result.response.status}`);
    assert(
      !/noindex/i.test(result.response.headers.get('x-robots-tag') ?? ''),
      `${model.path} has an index-blocking X-Robots-Tag`,
    );
    const page = analyzeHtml(result.body);
    const canonicalUrl = `${CANONICAL_ORIGIN}${model.path}`;
    assert(page.lang === model.locale, `${canonicalUrl} lang=${page.lang}`);
    assertIndexablePage(page, {
      url: canonicalUrl,
      minWords: model.minWords,
      expectedHreflangs: EXPECTED_HREFLANGS,
      ownershipAllowed: model.path === '/',
    });
    const duplicate = hashes.get(page.mainHash);
    assert(!duplicate, `${canonicalUrl} duplicates visible main content from ${duplicate}`);
    hashes.set(page.mainHash, canonicalUrl);
    for (const href of page.internalHrefs) {
      const link = new URL(href, canonicalUrl);
      if (link.origin === CANONICAL_ORIGIN) internalPaths.add(link.pathname);
    }
  }

  for (const path of FUNCTIONAL_NOINDEX_PATHS) {
    const result = await fetchText(baseUrl, path);
    assert(result.response.status === 200, `${path} status=${result.response.status}`);
    assertFunctionalNoindexPage(analyzeHtml(result.body), {
      url: `${CANONICAL_ORIGIN}${path}`,
    });
  }

  for (const path of internalPaths) {
    const result = await fetchText(baseUrl, path);
    assert(
      result.response.status < 400,
      `internal link ${path} status=${result.response.status}`,
    );
  }

  await verifyHttpRedirect();
  console.log(
    `adsense-public-ready ok: indexable=${pages.length} unique=${hashes.size} functionalNoindex=${FUNCTIONAL_NOINDEX_PATHS.length} internalLinks=${internalPaths.size} adsTxt=authorized ownership=canonical-/ only`,
  );
}

const isDirectExecution =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectExecution) {
  run().catch((error) => {
    console.error(error.message || String(error));
    process.exit(1);
  });
}
