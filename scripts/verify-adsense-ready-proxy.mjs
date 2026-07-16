// scripts/verify-adsense-ready-proxy.mjs
/**
 * Proxy hygiene checks for AdSense site readiness.
 * Does NOT prove Google approval or "valuable content" quality.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EDITORIAL_DEFAULT_LOCALE,
  EDITORIAL_LASTMOD,
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  MIN_EDITORIAL_MAIN_WORDS,
  countEditorialMainWords,
  editorialLocalePath,
} from './editorial-page-content.mjs';
import {
  MIN_LANDING_MAIN_WORDS,
  countLandingMainWords,
} from './landing-page-content.mjs';
import {
  LEGAL_DEFAULT_LOCALE,
  LEGAL_LASTMOD,
  LEGAL_PATHS,
  MIN_LEGAL_MAIN_WORDS,
  countLegalMainWords,
} from './legal-page-content.mjs';

const CANONICAL_ORIGIN = 'https://brikaya.com';
const EXPECTED_PUBLISHER_ID = 'pub-9571619183194136';
const MAX_EDITORIAL_LOCALE_FANOUT = EDITORIAL_LOCALES.length;
const PLAY_INDEX_PATH = 'play/index.html';
const PUBLIC_HOME_INDEX_PATH = 'public/index.html';
const LEGAL_DEPTH_PATHS = ['/about/', '/privacy/', '/terms/', '/support/', '/cookies/'];

function fail(message) {
  throw new Error(`adsense-ready-proxy: ${message}`);
}

function stripHtmlToWords(html) {
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  const mainMatch = cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const body = mainMatch ? mainMatch[1] : cleaned;
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ');
  return text.split(/\s+/).filter(Boolean);
}

function readOptional(path) {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8');
}

function verifyAdsTxt() {
  const publicAds = readOptional(resolve('public/ads.txt'));
  if (!publicAds) fail('missing public/ads.txt');
  const line = publicAds.trim().split(/\r?\n/)[0] ?? '';
  if (!line.includes(`google.com, ${EXPECTED_PUBLISHER_ID}, DIRECT`)) {
    fail(`public/ads.txt publisher mismatch (expected ${EXPECTED_PUBLISHER_ID})`);
  }
}

function verifyAdSenseSnippet() {
  const playHtml = readOptional(resolve(PLAY_INDEX_PATH));
  if (!playHtml) fail(`missing ${PLAY_INDEX_PATH}`);
  if (!playHtml.includes(`client=ca-${EXPECTED_PUBLISHER_ID}`)) {
    fail(`${PLAY_INDEX_PATH} missing AdSense client ca-${EXPECTED_PUBLISHER_ID}`);
  }
}

function verifyLandingSourceDepth() {
  for (const locale of ['pt-BR', 'en']) {
    const words = countLandingMainWords(locale);
    if (words < MIN_LANDING_MAIN_WORDS) {
      fail(
        `landing ${locale} source has ${words} words (proxy minimum ${MIN_LANDING_MAIN_WORDS})`,
      );
    }
  }
}

function verifyGeneratedLandingHome() {
  const publicHome = resolve(PUBLIC_HOME_INDEX_PATH);
  if (!existsSync(publicHome)) {
    fail(`missing generated landing ${publicHome}`);
  }
  const html = readFileSync(publicHome, 'utf8');
  const words = stripHtmlToWords(html);
  if (words.length < MIN_LANDING_MAIN_WORDS) {
    fail(
      `${PUBLIC_HOME_INDEX_PATH} main/body has ${words.length} words (proxy minimum ${MIN_LANDING_MAIN_WORDS})`,
    );
  }
  if (!html.includes(`rel="canonical" href="${CANONICAL_ORIGIN}/"`)) {
    fail(`${PUBLIC_HOME_INDEX_PATH} missing canonical ${CANONICAL_ORIGIN}/`);
  }
  if (!html.includes('href="/play/"')) {
    fail(`${PUBLIC_HOME_INDEX_PATH} missing CTA link to /play/`);
  }
}

function verifyEditorialSourceDepth() {
  for (const path of EDITORIAL_PATHS) {
    for (const locale of EDITORIAL_LOCALES) {
      const words = countEditorialMainWords(locale, path);
      if (words < MIN_EDITORIAL_MAIN_WORDS) {
        fail(
          `${locale}${path} source has ${words} words (proxy minimum ${MIN_EDITORIAL_MAIN_WORDS})`,
        );
      }
    }
  }
}

function verifyGeneratedEditorialPages() {
  const roots = ['public', 'dist'].filter((dir) => existsSync(dir));
  if (!roots.includes('public')) fail('missing public/');

  for (const path of EDITORIAL_PATHS) {
    for (const locale of EDITORIAL_LOCALES) {
      const relative = editorialLocalePath(locale, path).replace(/^\//, '');
      const publicFile = resolve('public', relative, 'index.html');
      if (!existsSync(publicFile)) {
        fail(`missing generated editorial page ${publicFile}`);
      }
      const html = readFileSync(publicFile, 'utf8');
      const words = stripHtmlToWords(html);
      if (words.length < MIN_EDITORIAL_MAIN_WORDS) {
        fail(
          `${publicFile} main/body has ${words.length} words (proxy minimum ${MIN_EDITORIAL_MAIN_WORDS})`,
        );
      }
      if (!html.includes(EDITORIAL_LASTMOD)) {
        fail(`${publicFile} missing editorial lastmod ${EDITORIAL_LASTMOD}`);
      }
      const canonical = `${CANONICAL_ORIGIN}${editorialLocalePath(locale, path)}`;
      if (!html.includes(`rel="canonical" href="${canonical}"`)) {
        fail(`${publicFile} missing canonical ${canonical}`);
      }
    }
  }

  if (roots.includes('dist')) {
    for (const path of EDITORIAL_PATHS) {
      for (const locale of EDITORIAL_LOCALES) {
        const relative = editorialLocalePath(locale, path).replace(/^\//, '');
        const distFile = resolve('dist', relative, 'index.html');
        if (!existsSync(distFile)) {
          fail(`missing dist editorial page ${distFile}`);
        }
      }
    }
  }
}

function verifyLegalSourceDepth() {
  for (const path of LEGAL_DEPTH_PATHS) {
    if (!LEGAL_PATHS.includes(path)) {
      fail(`legal depth path ${path} is not in LEGAL_PATHS`);
    }
    const words = countLegalMainWords(LEGAL_DEFAULT_LOCALE, path);
    if (words < MIN_LEGAL_MAIN_WORDS) {
      fail(
        `legal ${LEGAL_DEFAULT_LOCALE}${path} source has ${words} words (proxy minimum ${MIN_LEGAL_MAIN_WORDS})`,
      );
    }
  }
}

function verifyGeneratedLegalDefaultPages() {
  for (const path of LEGAL_DEPTH_PATHS) {
    const relative = path.replace(/^\//, '');
    const publicFile = resolve('public', relative, 'index.html');
    if (!existsSync(publicFile)) {
      fail(`missing generated legal page ${publicFile}`);
    }
    const html = readFileSync(publicFile, 'utf8');
    const words = stripHtmlToWords(html);
    if (words.length < MIN_LEGAL_MAIN_WORDS) {
      fail(
        `${publicFile} main/body has ${words.length} words (proxy minimum ${MIN_LEGAL_MAIN_WORDS})`,
      );
    }
    if (!html.includes(LEGAL_LASTMOD)) {
      fail(`${publicFile} missing legal lastmod ${LEGAL_LASTMOD}`);
    }
  }
}

function verifySitemapEditorialFanout() {
  const sitemapPath = existsSync(resolve('public/sitemap.xml'))
    ? resolve('public/sitemap.xml')
    : resolve('dist/sitemap.xml');
  if (!existsSync(sitemapPath)) fail('missing sitemap.xml in public/ or dist/');
  const sitemap = readFileSync(sitemapPath, 'utf8');

  for (const path of EDITORIAL_PATHS) {
    const expected = EDITORIAL_LOCALES.map(
      (locale) => `<loc>${CANONICAL_ORIGIN}${editorialLocalePath(locale, path)}</loc>`,
    );
    for (const entry of expected) {
      if (!sitemap.includes(entry)) fail(`sitemap missing ${entry}`);
    }

    const matches = [...sitemap.matchAll(
      new RegExp(`<loc>${CANONICAL_ORIGIN.replace(/\./g, '\\.')}(/[a-zA-Z0-9-]+)?${path.replace(/\//g, '\\/')}</loc>`, 'g'),
    )];
    if (matches.length !== MAX_EDITORIAL_LOCALE_FANOUT) {
      fail(
        `sitemap editorial fan-out for ${path}: found ${matches.length}, expected ${MAX_EDITORIAL_LOCALE_FANOUT} (EN/PT only)`,
      );
    }
  }
}

function run() {
  verifyAdsTxt();
  verifyAdSenseSnippet();
  verifyLandingSourceDepth();
  verifyGeneratedLandingHome();
  verifyEditorialSourceDepth();
  verifyGeneratedEditorialPages();
  verifyLegalSourceDepth();
  verifyGeneratedLegalDefaultPages();
  verifySitemapEditorialFanout();
  console.log(
    `adsense-ready-proxy ok: publisher=${EXPECTED_PUBLISHER_ID} landing=/ play=/${PLAY_INDEX_PATH} editorialPages=${EDITORIAL_PATHS.length} legalDepthPages=${LEGAL_DEPTH_PATHS.length} locales=${EDITORIAL_LOCALES.join(',')} default=${EDITORIAL_DEFAULT_LOCALE} (proxy only; not AdSense approval)`,
  );
}

try {
  run();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
