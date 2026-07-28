// scripts/verify-adsense-ready-proxy.mjs
/**
 * Release gate for the narrow AdSense property-verification footprint.
 * It verifies deployable artifacts; it never represents an approval decision.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import {
  EDITORIAL_DEFAULT_LOCALE,
  EDITORIAL_LASTMOD,
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  MIN_EDITORIAL_MAIN_WORDS,
  countEditorialMainWords,
  editorialLocalePath,
} from './editorial-page-content.mjs';
import { MIN_LANDING_MAIN_WORDS, countLandingMainWords } from './landing-page-content.mjs';
import {
  LEGAL_DEFAULT_LOCALE,
  LEGAL_LASTMOD,
  LEGAL_PATHS,
  MIN_LEGAL_MAIN_WORDS,
  countLegalMainWords,
} from './legal-page-content.mjs';

const CANONICAL_ORIGIN = 'https://brikaya.com';
const EXPECTED_PUBLISHER_ID = 'pub-9571619183194136';
const OWNERSHIP_PATTERN = new RegExp(`https://pagead2\\.googlesyndication\\.com/pagead/js/adsbygoogle\\.js\\?client=ca-${EXPECTED_PUBLISHER_ID}`, 'g');
const AD_RUNTIME_PATTERN = /pagead2\.googlesyndication\.com|\badsbygoogle\b|\badBreak\b|\badConfig\b|__BRIKAYA_GOOGLE_ADS_ENABLED__|google_ad_/i;
const PLAY_INDEX_PATH = 'play/index.html';
const PUBLIC_HOME_INDEX_PATH = 'public/index.html';
const LEGAL_DEPTH_PATHS = ['/about/', '/privacy/', '/terms/', '/support/', '/cookies/'];
const ELIGIBILITY = JSON.parse(readFileSync(resolve('config/locale-eligibility.json'), 'utf8'));
const EXPECTED_SEARCH_LOCALES = ['en', 'pt-BR', 'es-419'];
const EXPECTED_SITEMAP_URLS = new Set([
  ...EXPECTED_SEARCH_LOCALES.map((locale) => `${CANONICAL_ORIGIN}${locale === 'pt-BR' ? '/' : `/${locale}/`}`),
  ...ELIGIBILITY.indexableTrustPaths.flatMap((path) =>
    EXPECTED_SEARCH_LOCALES.map((locale) => `${CANONICAL_ORIGIN}${locale === 'en' ? path : `/${locale}${path}`}`),
  ),
  ...EDITORIAL_PATHS.flatMap((path) =>
    EDITORIAL_LOCALES.map((locale) => `${CANONICAL_ORIGIN}${editorialLocalePath(locale, path)}`),
  ),
]);

function fail(message) {
  throw new Error(`adsense-ready-proxy: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function stripHtmlToWords(html) {
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  const mainMatch = cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const body = mainMatch ? mainMatch[1] : cleaned;
  return body.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').split(/\s+/).filter(Boolean);
}

function readOptional(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function walkFiles(root, predicate) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(path, predicate));
    else if (predicate(path)) files.push(path);
  }
  return files;
}

function countOwnershipSnippets(html) {
  return [...html.matchAll(OWNERSHIP_PATTERN)].length;
}

function assertAdsTxt(path, label) {
  const ads = readOptional(resolve(path));
  assert(ads, `missing ${label} ${path}`);
  assert(
    ads.trim().split(/\r?\n/).some(
      (line) =>
        line ===
        `google.com, ${EXPECTED_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`,
    ),
    `${label} ${path} publisher mismatch`,
  );
  return ads;
}

function verifyAdsTxt() {
  const deployedAds = assertAdsTxt('dist/ads.txt', 'deployed');
  const publicAds = readOptional(resolve('public/ads.txt'));
  if (publicAds) {
    assertAdsTxt('public/ads.txt', 'public source');
    assert(
      publicAds === deployedAds,
      'public/ads.txt must match deployed dist/ads.txt',
    );
  }
}

function verifyOwnershipPlacement() {
  const roots = ['public', 'dist'].filter(existsSync);
  assert(roots.length > 0, 'missing generated public artifacts');
  for (const root of roots) {
    const home = resolve(root, 'index.html');
    assert(existsSync(home), `missing canonical landing ${home}`);
    const homeHtml = readFileSync(home, 'utf8');
    const head = homeHtml.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
    assert(countOwnershipSnippets(head) === 1, `${root}/index.html must contain exactly one ownership snippet in <head>`);
    assert(countOwnershipSnippets(homeHtml) === 1, `${root}/index.html must contain ownership snippet exactly once`);

    for (const file of walkFiles(root, (path) => path.endsWith('.html'))) {
      if (file === home) continue;
      const html = readFileSync(file, 'utf8');
      assert(countOwnershipSnippets(html) === 0, `ownership snippet is forbidden outside canonical /: ${relative(root, file)}`);
      assert(!AD_RUNTIME_PATTERN.test(html), `advertising runtime is forbidden outside canonical /: ${relative(root, file)}`);
    }
    const homeWithoutOwnership = homeHtml.replace(OWNERSHIP_PATTERN, '');
    assert(!AD_RUNTIME_PATTERN.test(homeWithoutOwnership), `${root}/index.html contains runtime advertising bootstrap beyond ownership verification`);
  }

  for (const file of [resolve(PLAY_INDEX_PATH), ...walkFiles('src', (path) => /\.(?:ts|tsx)$/.test(path) && !/\.test\.(?:ts|tsx)$/.test(path))]) {
    const source = readOptional(file);
    if (source) assert(!AD_RUNTIME_PATTERN.test(source), `game runtime must not contain advertising bootstrap: ${file}`);
  }
}

function verifyLandingSourceDepth() {
  for (const locale of ['pt-BR', 'en']) {
    assert(countLandingMainWords(locale) >= MIN_LANDING_MAIN_WORDS, `landing ${locale} source is below ${MIN_LANDING_MAIN_WORDS} words`);
  }
}

function verifyGeneratedLandingHome() {
  const html = readOptional(resolve(PUBLIC_HOME_INDEX_PATH));
  assert(html, `missing generated landing ${PUBLIC_HOME_INDEX_PATH}`);
  assert(stripHtmlToWords(html).length >= MIN_LANDING_MAIN_WORDS, `${PUBLIC_HOME_INDEX_PATH} is below ${MIN_LANDING_MAIN_WORDS} words`);
  assert(html.includes(`rel="canonical" href="${CANONICAL_ORIGIN}/"`), `${PUBLIC_HOME_INDEX_PATH} missing canonical ${CANONICAL_ORIGIN}/`);
  assert(html.includes('href="/play/"'), `${PUBLIC_HOME_INDEX_PATH} missing CTA link to /play/`);
}

function verifyEditorialContent() {
  for (const path of EDITORIAL_PATHS) {
    for (const locale of EDITORIAL_LOCALES) {
      assert(countEditorialMainWords(locale, path) >= MIN_EDITORIAL_MAIN_WORDS, `${locale}${path} source is below ${MIN_EDITORIAL_MAIN_WORDS} words`);
      for (const root of ['public', 'dist'].filter(existsSync)) {
        const file = resolve(root, editorialLocalePath(locale, path).replace(/^\//, ''), 'index.html');
        assert(existsSync(file), `missing generated editorial page ${file}`);
        const html = readFileSync(file, 'utf8');
        assert(stripHtmlToWords(html).length >= MIN_EDITORIAL_MAIN_WORDS, `${file} is below ${MIN_EDITORIAL_MAIN_WORDS} words`);
        assert(html.includes(EDITORIAL_LASTMOD), `${file} missing editorial lastmod ${EDITORIAL_LASTMOD}`);
      }
    }
  }
}

function verifyLegalContent() {
  for (const path of LEGAL_DEPTH_PATHS) {
    assert(LEGAL_PATHS.includes(path), `legal depth path ${path} is not configured`);
    assert(countLegalMainWords(LEGAL_DEFAULT_LOCALE, path) >= MIN_LEGAL_MAIN_WORDS, `legal ${path} source is below ${MIN_LEGAL_MAIN_WORDS} words`);
    const file = resolve('public', path.replace(/^\//, ''), 'index.html');
    assert(existsSync(file), `missing generated legal page ${file}`);
    const html = readFileSync(file, 'utf8');
    assert(stripHtmlToWords(html).length >= MIN_LEGAL_MAIN_WORDS, `${file} is below ${MIN_LEGAL_MAIN_WORDS} words`);
    assert(html.includes(LEGAL_LASTMOD), `${file} missing legal lastmod ${LEGAL_LASTMOD}`);
  }
}

function verifyIndexability() {
  const editions = ELIGIBILITY.searchEditions;
  assert(JSON.stringify(editions.map((edition) => edition.locale)) === JSON.stringify(EXPECTED_SEARCH_LOCALES), 'search editions must be exactly EN/PT-BR/ES-419');
  for (const edition of editions) assert(edition.adsenseSupported && edition.contentComplete && !edition.fallback, `${edition.locale} must be complete and non-fallback`);

  const deployedSitemapPath = resolve('dist/sitemap.xml');
  assert(existsSync(deployedSitemapPath), 'missing deployed dist/sitemap.xml');
  const deployedSitemap = readFileSync(deployedSitemapPath, 'utf8');
  const locations = [...deployedSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert(locations.length === 33, `sitemap must contain exactly 33 URLs, found ${locations.length}`);
  assert(new Set(locations).size === locations.length, 'sitemap contains duplicate URLs');
  assert(locations.every((url) => EXPECTED_SITEMAP_URLS.has(url)) && EXPECTED_SITEMAP_URLS.size === locations.length, 'sitemap contains a non-allowed or missing URL');

  const publicSitemap = readOptional(resolve('public/sitemap.xml'));
  if (publicSitemap) {
    const publicLocations = [...publicSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
    assert(
      JSON.stringify(publicLocations) === JSON.stringify(locations),
      'public/sitemap.xml must match deployed dist/sitemap.xml',
    );
  }

  for (const file of walkFiles('dist', (path) => path.endsWith('index.html'))) {
    const html = readFileSync(file, 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    const relativePath = relative('dist', file);
    assert(canonical, `missing canonical: ${relativePath}`);
    if (!EXPECTED_SITEMAP_URLS.has(canonical)) {
      const robotsMatches = [
        ...html.matchAll(
          /<meta name="robots" content="([^"]+)" \/>/gi,
        ),
      ];
      assert(
        robotsMatches.length === 1 &&
          robotsMatches[0][1] === 'noindex,follow',
        `fallback canonical ${canonical} must have exact noindex,follow: ${relativePath}`,
      );
      assert(
        !/\bhreflang\s*=/i.test(html),
        `fallback canonical ${canonical} must have zero hreflang: ${relativePath}`,
      );
    }
  }
}

function verifySpanishAtomicQa() {
  const result = spawnSync(process.execPath, ['scripts/verify-spanish-editorial-edition.mjs'], { encoding: 'utf8' });
  assert(result.status === 0, `Spanish atomic QA failed: ${result.stdout}\n${result.stderr}`);
}

function run() {
  verifyAdsTxt();
  verifyOwnershipPlacement();
  verifyLandingSourceDepth();
  verifyGeneratedLandingHome();
  verifyEditorialContent();
  verifyLegalContent();
  verifyIndexability();
  verifySpanishAtomicQa();
  console.log(`adsense-ready-proxy ok: ownership=canonical-/ only publisher=${EXPECTED_PUBLISHER_ID} sitemap=33 editions=${EXPECTED_SEARCH_LOCALES.join(',')} game-runtime=offline-ad-free (proxy only; not AdSense approval)`);
}

try {
  run();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
