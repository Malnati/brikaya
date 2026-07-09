// scripts/audit-seo-brand-copy.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUTPUT_DIR = 'docs/assets/issues/seo-brick-audit';
const OUTPUT_PATH = join(OUTPUT_DIR, 'audit-matrix.json');
const BRICK_PATTERN =
  /brick-breaking|block breaker|block-breaker|quebrar bloco|romper bloque|blokbreker|casse-briques|phá khối|ทำลายบล็อก|打砖块|ブロック崩し|블록 브레이커/i;

function readOptional(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function extractTitle(html) {
  const match = html?.match(/<title>([^<]*)<\/title>/i);
  return match?.[1] ?? null;
}

function extractDescription(html) {
  const match = html?.match(/<meta name="description" content="([^"]*)"/i);
  return match?.[1] ?? null;
}

function scanText(label, text) {
  if (!text) return { label, matches: [] };
  const matches = [];
  text.split(/\r?\n/).forEach((line, index) => {
    if (BRICK_PATTERN.test(line)) {
      matches.push({ line: index + 1, excerpt: line.trim().slice(0, 180) });
    }
  });
  return { label, matches };
}

function loadStaticSeoFromSnapshot() {
  const snapshotPath = 'scripts/generated/i18n-home-seo.json';
  if (!existsSync(snapshotPath)) return {};
  return JSON.parse(readFileSync(snapshotPath, 'utf8'));
}

function run() {
  const locales = ['pt-BR', 'en', 'de', 'fr', 'nl', 'es-419'];
  const matrix = {
    generatedAt: new Date().toISOString(),
    locales: {},
    sources: {
      messages: scanText('src/i18n/messages.ts', readOptional('src/i18n/messages.ts')),
      generateLocalizedSeo: scanText(
        'scripts/generate-localized-seo.mjs',
        readOptional('scripts/generate-localized-seo.mjs'),
      ),
      indexHtml: scanText('index.html', readOptional('index.html')),
      aboutLegal: scanText(
        'scripts/legal-page-content.mjs',
        readOptional('scripts/legal-page-content.mjs'),
      ),
      legalTranslations: scanText(
        'scripts/legal-page-translations.json',
        readOptional('scripts/legal-page-translations.json'),
      ),
    },
  };

  const snapshot = loadStaticSeoFromSnapshot();

  for (const locale of locales) {
    const distPath =
      locale === 'pt-BR' ? 'dist/index.html' : join('dist', locale, 'index.html');
    const distHtml = readOptional(distPath);
    matrix.locales[locale] = {
      messagesSnapshot: snapshot[locale]?.home ?? null,
      dist: {
        title: extractTitle(distHtml),
        description: extractDescription(distHtml),
        brickMatches: distHtml ? scanText(distPath, distHtml).matches : [],
      },
    };
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(matrix, null, 2)}\n`);
  console.log(`audit-seo-brand-copy matrix ok: ${OUTPUT_PATH}`);
}

run();
