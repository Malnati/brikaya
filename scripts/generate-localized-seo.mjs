// scripts/generate-localized-seo.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LEGAL_DEFAULT_LOCALE,
  LEGAL_LASTMOD,
  LEGAL_PATHS,
  renderLegalPage,
} from './legal-page-content.mjs';
import {
  EDITORIAL_DEFAULT_LOCALE,
  EDITORIAL_LASTMOD,
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  editorialLocalePath,
  renderEditorialPage,
} from './editorial-page-content.mjs';
import { LANDING_LASTMOD, PLAY_ROUTE_PATH, renderLandingPage } from './landing-page-content.mjs';

const DIST_DIR = 'dist';
const PUBLIC_DIR = 'public';
const INDEX_FILE = 'index.html';
const SITEMAP_FILE = 'sitemap.xml';
const ROBOTS_FILE = 'robots.txt';
const HEADERS_FILE = '_headers';
const CANONICAL_ORIGIN = 'https://brikaya.com';
const DEFAULT_LOCALE = 'pt-BR';
const ADSENSE_OWNERSHIP_SNIPPET = '    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9571619183194136" crossorigin="anonymous"></script>';
const LASTMOD = '2026-07-15';
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const HOME_ROUTE_PATH = '/';
const DOWNLOADS_ROUTE_PATH = '/downloads/';
const SPA_LOCALIZED_ROUTES = [PLAY_ROUTE_PATH, DOWNLOADS_ROUTE_PATH];
const STATIC_PUBLIC_PATHS = LEGAL_PATHS;
const ELIGIBILITY_CONFIG_PATH = resolve(
  process.cwd(),
  'config/locale-eligibility.json',
);
const ELIGIBILITY_CONFIG = JSON.parse(
  readFileSync(ELIGIBILITY_CONFIG_PATH, 'utf8'),
);
const SEARCH_EDITIONS = ELIGIBILITY_CONFIG.searchEditions;
const INDEXABLE_TRUST_PATHS = ELIGIBILITY_CONFIG.indexableTrustPaths;
const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he', 'ps', 'sd', 'ks', 'dv', 'ckb', 'ug', 'yi', 'bal', 'ar-SA', 'ar-EG', 'fa-AF', 'ps-AF', 'sd-IN', 'ks-IN', 'ug-CN', 'yi-001']);

const LOCALES = [
  'pt-BR',
  'en',
  'es-419',
  'en-IN',
  'hi-IN',
  'de',
  'fr',
  'it',
  'ja',
  'ko',
  'id',
  'vi',
  'fil',
  'th',
  'zh-CN',
  'ar',
  'ru',
  'tr',
  'nl',
  'pl',
  'uk',
  'ms',
  'zh-TW',
  'pt-PT',
  'es-ES',
  'en-GB',
  'fr-CA',
  'bn',
  'ur',
  'fa',
  'he',
  'ta',
  'te',
  'mr',
  'gu',
  'kn',
  'ml',
  'pa',
  'el',
  'sv',
  'da',
  'no',
  'fi',
  'cs',
  'ro',
  'hu',
  'bg',
  'sk',
  'sl',
  'hr',
  'sr',
  'lt',
  'lv',
  'et',
  'sw',
  'af',
  'am',
  'ka',
  'hy',
  'az',
  'kk',
  'uz',
  'ne',
  'si',
  'km',
  'lo',
  'my',
  'is',
  'ga',
  'cy',
  'mt',
  'sq',
  'mk',
  'bs',
  'mn',
  'tg',
  'ky',
  'tk',
  'be',
  'lb',
  'eu',
  'ca',
  'gl',
  'oc',
  'br',
  'mi',
  'sm',
  'to',
  'fj',
  'mg',
  'so',
  'yo',
  'ig',
  'ha',
  'zu',
  'xh',
  'st',
  'tn',
  'ts',
  'ss',
  've',
  'nso',
  'rw',
  'rn',
  'ln',
  'lg',
  'ak',
  'ee',
  'tw',
  'sn',
  'ny',
  'wo',
  'ff',
  'om',
  'ti',
  'qu',
  'ay',
  'gn',
  'nah',
  'ht',
  'pap',
  'jv',
  'su',
  'ceb',
  'ilo',
  'war',
  'haw',
  'co',
  'sc',
  'fur',
  'rm',
  'lad',
  'ast',
  'vec',
  'lmo',
  'pms',
  'nap',
  'scn',
  'sco',
  'ps',
  'sd',
  'ks',
  'dv',
  'ckb',
  'ug',
  'yi',
  'bo',
  'dz',
  'ku',
  'or',
  'as',
  'sa',
  'mai',
  'bho',
  'doi',
  'mni',
  'kok',
  'sat',
  'lus',
  'brx',
  'raj',
  'hne',
  'awa',
  'ace',
  'bal',
  'chr',
  'crh',
  'tt',
  'ba',
  'cv',
  'sah',
  'os',
  'ab',
  'ady',
  'kab',
  'tet',
  'bug',
  'min',
  'ban',
  'mad',
  'bjn',
  'hil',
  'pam',
  'bcl',
  'gor',
  'mak',
  'sas',
  'fy',
  'fo',
  'gd',
  'gv',
  'kw',
  'se',
  'kl',
  'iu',
  'cr',
  'oj',
  'lkt',
  'nv',
  'ik',
  'ch',
  'mh',
  'ty',
  'bi',
  'na',
  'gil',
  'niu',
  'rar',
  'pau',
  'tpi',
  'ho',
  'aa',
  'av',
  'ce',
  'kv',
  'udm',
  'myv',
  'mdf',
  'mhr',
  'mrj',
  'tyv',
  'alt',
  'krc',
  'kum',
  'lez',
  'inh',
  'kbd',
  'xal',
  'nog',
  'kaa',
  'kjh',
  'gag',
  'rom',
  'sma',
  'smj',
  'la',
  'eo',
  'ia',
  'ie',
  'io',
  'vo',
  'an',
  'mwl',
  'ext',
  'bar',
  'hsb',
  'dsb',
  'nds',
  'frr',
  'stq',
  'ksh',
  'pcd',
  'wa',
  'li',
  'vls',
  'zea',
  'frp',
  'arp',
  'en-AU',
  'en-CA',
  'en-NZ',
  'en-ZA',
  'es-MX',
  'es-AR',
  'es-CO',
  'es-CL',
  'es-PE',
  'pt-AO',
  'pt-MZ',
  'fr-BE',
  'fr-CH',
  'de-AT',
  'de-CH',
  'it-CH',
  'zh-HK',
  'ar-SA',
  'ar-EG',
  'fa-AF',
  'ps-AF',
  'sd-IN',
  'ks-IN',
  'ug-CN',
  'yi-001',
  'mus',
];

function legalLocaleKey(locale) {
  if (locale === 'zh-CN') return 'zh-Hans';
  if (locale === 'zh-TW' || locale === 'zh-HK') return 'zh-Hant';
  return locale.split('-')[0];
}

function primaryLegalLocales(locales) {
  const preferred = new Map([
    ['pt', 'pt-BR'],
    ['es', 'es-419'],
    ['hi', 'hi-IN'],
    ['zh-Hans', 'zh-CN'],
    ['zh-Hant', 'zh-TW'],
  ]);
  const groups = new Map();
  for (const locale of locales) {
    const key = legalLocaleKey(locale);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(locale);
  }

  return [...groups.entries()]
    .filter(([key]) => key !== 'en')
    .map(([key, values]) => {
      const preferredLocale = preferred.get(key);
      if (preferredLocale && values.includes(preferredLocale)) return preferredLocale;
      return values.find((value) => !value.includes('-')) ?? values[0];
    });
}

const LEGAL_LOCALIZED_LOCALES = primaryLegalLocales(LOCALES);
const LEGAL_LOCALES = [LEGAL_DEFAULT_LOCALE, ...LEGAL_LOCALIZED_LOCALES];

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const I18N_HOME_SEO_PATH = join(MODULE_DIR, 'generated/i18n-home-seo.json');
const I18N_HOME_SEO = JSON.parse(readFileSync(I18N_HOME_SEO_PATH, 'utf8'));

function seoEntryFor(locale) {
  return I18N_HOME_SEO[locale] ?? I18N_HOME_SEO.en;
}

function searchEditionFor(locale) {
  const searchLocale = locale === LEGAL_DEFAULT_LOCALE || locale === EDITORIAL_DEFAULT_LOCALE
    ? 'en'
    : locale;
  return SEARCH_EDITIONS.find((edition) => edition.locale === searchLocale);
}

function isIndexableEdition(locale) {
  const edition = searchEditionFor(locale);
  return Boolean(
    edition &&
    edition.adsenseSupported === true &&
    edition.contentComplete === true &&
    edition.fallback !== true,
  );
}

const INDEXABLE_LANDING_LOCALES = LOCALES.filter(isIndexableEdition);
const INDEXABLE_LEGAL_LOCALES = LEGAL_LOCALES.filter(isIndexableEdition);
const INDEXABLE_EDITORIAL_LOCALES = EDITORIAL_LOCALES.filter(isIndexableEdition);

function metadataFor(locale, routePath) {
  const entry = seoEntryFor(locale);
  if (routePath === DOWNLOADS_ROUTE_PATH) {
    return entry.downloads;
  }
  if (routePath === PLAY_ROUTE_PATH) {
    return entry.home;
  }
  return entry.home;
}



function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function localePath(locale, routePath = HOME_ROUTE_PATH) {
  if (locale === DEFAULT_LOCALE) return routePath;
  if (routePath === HOME_ROUTE_PATH) return `/${locale}/`;

  return `/${locale}${routePath}`;
}

function canonicalUrl(locale, routePath = HOME_ROUTE_PATH) {
  return `${CANONICAL_ORIGIN}${localePath(locale, routePath)}`;
}

function legalLocalePath(locale, routePath) {
  if (locale === LEGAL_DEFAULT_LOCALE) return routePath;
  return `/${locale}${routePath}`;
}

function legalCanonicalUrl(locale, routePath) {
  return `${CANONICAL_ORIGIN}${legalLocalePath(locale, routePath)}`;
}

function htmlTagFor(locale) {
  return `<html lang="${locale}" dir="${RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'}">`;
}

function directionFor(locale) {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

function hreflangLinks(routePath = HOME_ROUTE_PATH) {
  return [
    ...INDEXABLE_LANDING_LOCALES.map((locale) =>
      `    <link rel="alternate" hreflang="${locale}" href="${canonicalUrl(locale, routePath)}" />`,
    ),
    `    <link rel="alternate" hreflang="x-default" href="${canonicalUrl(DEFAULT_LOCALE, routePath)}" />`,
  ].join('\n');
}

function legalHreflangLinks(routePath) {
  return [
    ...INDEXABLE_LEGAL_LOCALES.map((locale) =>
      `    <link rel="alternate" hreflang="${locale === LEGAL_DEFAULT_LOCALE ? 'en' : locale}" href="${legalCanonicalUrl(locale, routePath)}" />`,
    ),
    `    <link rel="alternate" hreflang="x-default" href="${legalCanonicalUrl(LEGAL_DEFAULT_LOCALE, routePath)}" />`,
  ].join('\n');
}

function editorialCanonicalUrl(locale, routePath) {
  return `${CANONICAL_ORIGIN}${editorialLocalePath(locale, routePath)}`;
}

function editorialHreflangLinks(routePath) {
  return [
    ...INDEXABLE_EDITORIAL_LOCALES.map((locale) =>
      `    <link rel="alternate" hreflang="${locale === EDITORIAL_DEFAULT_LOCALE ? 'en' : locale}" href="${editorialCanonicalUrl(locale, routePath)}" />`,
    ),
    `    <link rel="alternate" hreflang="x-default" href="${editorialCanonicalUrl(EDITORIAL_DEFAULT_LOCALE, routePath)}" />`,
  ].join('\n');
}

function replaceOrInsertHead(html, locale, routePath = HOME_ROUTE_PATH) {
  const metadata = metadataFor(locale, routePath);
  const canonical = canonicalUrl(locale, routePath);
  return html
    .replaceAll('href="./manifest.webmanifest"', 'href="/manifest.webmanifest"')
    .replaceAll('href="./favicon.svg"', 'href="/favicon.svg"')
    .replaceAll('href="./assets/', 'href="/assets/')
    .replaceAll('src="./assets/', 'src="/assets/')
    .replace(/<html lang="[^"]+"(?: dir="[^"]+")?>/, htmlTagFor(locale))
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeXml(metadata.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeXml(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeXml(metadata.ogDescription)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeXml(metadata.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeXml(metadata.ogDescription)}" />`)
    .replace(/<title>.*<\/title>/, `<title>${escapeXml(metadata.title)}</title>`)
    .replace(/\n    <meta name="robots" content="[^"]*" \/>/, '')
    .replace(/(?:\n    <link rel="alternate" hreflang="[^"]+" href="[^"]+" \/>)+/, '')
    .replace(
      '    <meta name="theme-color"',
      `    <meta name="robots" content="noindex,follow" />\n    <meta name="theme-color"`,
    );
}

function sitemapUrlEntry(url) {
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    `    <lastmod>${LASTMOD}</lastmod>`,
    '  </url>',
  ].join('\n');
}

function buildSitemap() {
  const localizedUrls = INDEXABLE_LANDING_LOCALES.map((locale) =>
    sitemapUrlEntry(canonicalUrl(locale, HOME_ROUTE_PATH)),
  ).join('\n');
  const legalUrls = INDEXABLE_TRUST_PATHS.flatMap((path) =>
    INDEXABLE_LEGAL_LOCALES.map((locale) =>
      sitemapUrlEntry(legalCanonicalUrl(locale, path)).replace(
        `<lastmod>${LASTMOD}</lastmod>`,
        `<lastmod>${LEGAL_LASTMOD}</lastmod>`,
      ),
    ),
  ).join('\n');
  const editorialUrls = EDITORIAL_PATHS.flatMap((path) =>
    INDEXABLE_EDITORIAL_LOCALES.map((locale) =>
      sitemapUrlEntry(editorialCanonicalUrl(locale, path)).replace(
        `<lastmod>${LASTMOD}</lastmod>`,
        `<lastmod>${EDITORIAL_LASTMOD}</lastmod>`,
      ),
    ),
  ).join('\n');
  const urls = `${localizedUrls}\n${legalUrls}\n${editorialUrls}`;
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobots() {
  if (process.env.BRIKAYA_DEPLOY_ENV === 'preview') {
    return 'User-agent: *\nDisallow: /\n';
  }
  return `User-agent: *\nAllow: /\n\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n`;
}

function buildHeaders() {
  const baseHeaders = readFileSync(resolve(process.cwd(), PUBLIC_DIR, HEADERS_FILE), 'utf8').trimEnd();
  if (process.env.BRIKAYA_DEPLOY_ENV !== 'preview') return `${baseHeaders}\n`;
  return `${baseHeaders}\n\n/*\n  X-Robots-Tag: noindex\n`;
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function run() {
  const distRoot = resolve(process.cwd(), DIST_DIR);
  const publicRoot = resolve(process.cwd(), PUBLIC_DIR);
  const playIndexPath = join(distRoot, 'play', INDEX_FILE);
  const spaBaseHtml = readFileSync(playIndexPath, 'utf8');

  for (const locale of LOCALES) {
    const metadata = metadataFor(locale, HOME_ROUTE_PATH);
    const indexable = isIndexableEdition(locale);
    let landingHtml = renderLandingPage({
      locale,
      canonicalUrl: canonicalUrl(locale, HOME_ROUTE_PATH),
      alternateLinks: indexable ? hreflangLinks(HOME_ROUTE_PATH) : '',
      dir: directionFor(locale),
      title: metadata.title,
      description: metadata.description,
    }).replace(
      '<meta name="robots" content="index,follow" />',
      `<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}" />`,
    );
    if (locale === DEFAULT_LOCALE) {
      landingHtml = landingHtml.replace('</head>', `${ADSENSE_OWNERSHIP_SNIPPET}\n  </head>`);
    }
    const outputPath =
      locale === DEFAULT_LOCALE
        ? join(distRoot, INDEX_FILE)
        : join(distRoot, locale, INDEX_FILE);
    writeFile(outputPath, landingHtml);
    if (locale === DEFAULT_LOCALE) {
      writeFile(join(publicRoot, INDEX_FILE), landingHtml);
    }
  }

  for (const routePath of SPA_LOCALIZED_ROUTES) {
    for (const locale of LOCALES) {
      const localizedHtml = replaceOrInsertHead(spaBaseHtml, locale, routePath);
      writeFile(
        join(distRoot, localePath(locale, routePath).replace(/^\//, ''), INDEX_FILE),
        localizedHtml,
      );
    }
  }

  for (const routePath of STATIC_PUBLIC_PATHS) {
    for (const locale of LEGAL_LOCALES) {
      const indexable =
        INDEXABLE_TRUST_PATHS.includes(routePath) &&
        isIndexableEdition(locale);
      const legalHtml = renderLegalPage({
        locale,
        path: routePath,
        canonicalUrl: legalCanonicalUrl(locale, routePath),
        alternateLinks: indexable ? legalHreflangLinks(routePath) : '',
        dir: directionFor(locale),
        localizedPath: legalLocalePath,
      }).replace(
        '<meta name="robots" content="index,follow" />',
        `<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}" />`,
      );
      writeFile(join(distRoot, legalLocalePath(locale, routePath).replace(/^\//, ''), INDEX_FILE), legalHtml);
      if (locale === LEGAL_DEFAULT_LOCALE) {
        writeFile(join(publicRoot, routePath.replace(/^\//, ''), INDEX_FILE), legalHtml);
      }
    }
  }

  for (const routePath of EDITORIAL_PATHS) {
    for (const locale of EDITORIAL_LOCALES) {
      const indexable = isIndexableEdition(locale);
      const editorialHtml = renderEditorialPage({
        locale,
        path: routePath,
        canonicalUrl: editorialCanonicalUrl(locale, routePath),
        alternateLinks: indexable ? editorialHreflangLinks(routePath) : '',
        dir: directionFor(locale),
      }).replace(
        '<meta name="robots" content="index,follow" />',
        `<meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}" />`,
      );
      const relativePath = editorialLocalePath(locale, routePath).replace(/^\//, '');
      writeFile(join(distRoot, relativePath, INDEX_FILE), editorialHtml);
      writeFile(join(publicRoot, relativePath, INDEX_FILE), editorialHtml);
    }
  }

  const sitemap = buildSitemap();
  const robots = buildRobots();
  const headers = buildHeaders();
  writeFile(join(distRoot, SITEMAP_FILE), sitemap);
  writeFile(join(distRoot, ROBOTS_FILE), robots);
  if (process.env.BRIKAYA_DEPLOY_ENV !== 'preview') {
    writeFile(join(publicRoot, SITEMAP_FILE), sitemap);
    writeFile(join(publicRoot, ROBOTS_FILE), robots);
  }
  writeFile(join(distRoot, HEADERS_FILE), headers);
  console.log(
    `localized-seo ok: locales=${LOCALES.length}, searchEditions=${SEARCH_EDITIONS.length}, indexableLandings=${INDEXABLE_LANDING_LOCALES.length}, spaRoutes=${SPA_LOCALIZED_ROUTES.length}, legalLocales=${LEGAL_LOCALES.length}, indexableTrustLocales=${INDEXABLE_LEGAL_LOCALES.length}, indexableTrustPages=${INDEXABLE_TRUST_PATHS.length}, editorialLocales=${EDITORIAL_LOCALES.length}, indexableEditorialLocales=${INDEXABLE_EDITORIAL_LOCALES.length}, editorialPages=${EDITORIAL_PATHS.length}`,
  );
}

run();
