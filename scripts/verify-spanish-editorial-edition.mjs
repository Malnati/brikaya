// scripts/verify-spanish-editorial-edition.mjs
/** Atomic release gate for the complete ES-419 search edition. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  EDITORIAL_DEFAULT_LOCALE,
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  MIN_EDITORIAL_MAIN_WORDS,
  countEditorialMainWords,
  editorialLocalePath,
  editorialPageFor,
} from './editorial-page-content.mjs';
import {
  LEGAL_PAGE_DEFINITIONS,
  LEGAL_TEXT,
  MIN_LEGAL_MAIN_WORDS,
  countLegalMainWords,
  legalPageIds,
  legalText,
} from './legal-page-content.mjs';
import {
  MIN_LANDING_MAIN_WORDS,
  countLandingMainWords,
  landingCopyForLocale,
} from './landing-page-content.mjs';

const CANONICAL_ORIGIN = 'https://brikaya.com';
const SPANISH_LOCALE = 'es-419';
const ENGLISH_LOCALE = EDITORIAL_DEFAULT_LOCALE;
const PORTUGUESE_LOCALE = 'pt-BR';
const CONFIG_PATH = 'config/locale-eligibility.json';
const INDEXABLE_TRUST_PATHS = JSON.parse(readFileSync(resolve(CONFIG_PATH), 'utf8')).indexableTrustPaths;
const SEO_METADATA = JSON.parse(readFileSync(resolve('scripts/generated/i18n-home-seo.json'), 'utf8'));
const COMMON_SPANISH_NAVIGATION = [
  'Jugar',
  'Cómo jugar',
  'Preguntas frecuentes',
  'Actualizaciones',
  'Acerca de',
  'Soporte',
];
const EDITORIAL_SPANISH_NAVIGATION = [
  ...COMMON_SPANISH_NAVIGATION,
  'Volver al juego',
  'Última actualización:',
];
const PLACEHOLDER_OR_INTERNAL_MARKERS = /\b(?:TODO|TBD|FIXME|lorem ipsum|translation pending|translate me|internal only)\b|\{\{|\}\}/i;

function fail(message) {
  throw new Error(`spanish-editorial-edition: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readRequired(path) {
  if (!existsSync(path)) fail(`missing ${path}`);
  return readFileSync(path, 'utf8');
}

function normalize(value) {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39);/g, ' ')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}@.\-/]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,/])/g, '$1');
}

function wordCount(value) {
  return normalize(value).split(' ').filter(Boolean).length;
}

function fieldsFromEditorial(page) {
  return [
    page.title,
    page.description,
    page.h1,
    page.lead,
    ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ];
}

function fieldsFromLanding(copy) {
  return [
    copy.brand,
    copy.headline,
    copy.lead,
    copy.playCta,
    copy.howToCta,
    copy.faqCta,
    copy.downloadsCta,
    copy.updated,
    ...copy.nav.map(([, label]) => label),
    ...copy.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ];
}

function legalPageIdsFor(path) {
  const page = LEGAL_PAGE_DEFINITIONS[path];
  assert(page, `unknown legal page ${path}`);
  const ids = [page.titleId, page.descriptionId, page.h1Id, page.leadId];
  for (const [headingId, paragraphIds] of page.sections) ids.push(headingId, ...paragraphIds);
  if (page.showLinkGrid) {
    for (const id of legalPageIds()) {
      if (id.startsWith('link.')) ids.push(id);
    }
  }
  return [...new Set(ids)];
}

function assertCompleteSpanishFields(label, spanishFields, englishFields) {
  const normalizedEnglishCorpus = englishFields
    .map(normalize)
    .filter((value) => wordCount(value) >= 3)
    .join('\n');

  for (const [index, value] of spanishFields.entries()) {
    const normalized = normalize(value);
    assert(normalized.length > 0, `${label} required Spanish field ${index + 1} is empty`);
    assert(!PLACEHOLDER_OR_INTERNAL_MARKERS.test(value), `${label} required Spanish field ${index + 1} has a placeholder or internal marker`);
    if (wordCount(normalized) >= 3) {
      assert(
        !normalizedEnglishCorpus.includes(normalized),
        `${label} required Spanish field ${index + 1} is copied from the English source corpus`,
      );
    }
  }
}

function assertEditorialSource() {
  assert(
    JSON.stringify(EDITORIAL_LOCALES) === JSON.stringify([ENGLISH_LOCALE, PORTUGUESE_LOCALE, SPANISH_LOCALE]),
    'editorial locale set must be exactly en-US, pt-BR, es-419',
  );

  for (const path of EDITORIAL_PATHS) {
    const english = editorialPageFor(ENGLISH_LOCALE, path);
    const spanish = editorialPageFor(SPANISH_LOCALE, path);
    assert(english && spanish, `${path} must have complete English and Spanish source editions`);
    assert(spanish.sections.length === english.sections.length, `${path} Spanish section count must match the canonical edition`);
    assert(countEditorialMainWords(SPANISH_LOCALE, path) >= MIN_EDITORIAL_MAIN_WORDS, `${path} Spanish source must meet the ${MIN_EDITORIAL_MAIN_WORDS}-word minimum`);
    assert(countEditorialMainWords(SPANISH_LOCALE, path) >= countEditorialMainWords(ENGLISH_LOCALE, path) * 0.75, `${path} Spanish source is materially shorter than the canonical edition`);
    assertCompleteSpanishFields(`editorial ${path}`, fieldsFromEditorial(spanish), fieldsFromEditorial(english));

    for (const [index, section] of spanish.sections.entries()) {
      assert(section.paragraphs.length === english.sections[index].paragraphs.length, `${path} Spanish section ${index + 1} must preserve paragraph coverage`);
    }
  }
}

function assertLandingSource() {
  const english = landingCopyForLocale('en');
  const spanish = landingCopyForLocale(SPANISH_LOCALE);
  assert(spanish.sections.length === english.sections.length, 'Spanish landing section count must match English');
  assert(countLandingMainWords(SPANISH_LOCALE) >= MIN_LANDING_MAIN_WORDS, `Spanish landing must meet the ${MIN_LANDING_MAIN_WORDS}-word minimum`);
  assert(countLandingMainWords(SPANISH_LOCALE) >= countLandingMainWords('en') * 0.75, 'Spanish landing is materially shorter than English');
  assertCompleteSpanishFields('landing', fieldsFromLanding(spanish), fieldsFromLanding(english));
  for (const [index, section] of spanish.sections.entries()) {
    assert(section.paragraphs.length === english.sections[index].paragraphs.length, `Spanish landing section ${index + 1} must preserve paragraph coverage`);
  }
}

function assertTrustSource() {
  const englishCorpus = legalPageIds().map((id) => LEGAL_TEXT[id]);
  const spanishCorpus = legalPageIds().map((id) => legalText(SPANISH_LOCALE, id));
  assertCompleteSpanishFields('legal translation catalog', spanishCorpus, englishCorpus);

  for (const path of INDEXABLE_TRUST_PATHS) {
    const ids = legalPageIdsFor(path);
    const englishFields = ids.map((id) => legalText('en-US', id));
    const spanishFields = ids.map((id) => legalText(SPANISH_LOCALE, id));
    assert(
      countLegalMainWords(SPANISH_LOCALE, path) >= MIN_LEGAL_MAIN_WORDS,
      `Spanish trust page ${path} must meet the ${MIN_LEGAL_MAIN_WORDS}-word minimum`,
    );
    assert(countLegalMainWords(SPANISH_LOCALE, path) >= countLegalMainWords('en-US', path) * 0.75, `Spanish trust page ${path} is materially shorter than English`);
    assertCompleteSpanishFields(`trust ${path}`, spanishFields, englishFields);
  }
}

function expectedAlternateLinks(path, kind) {
  const localePath = (locale) => {
    if (kind === 'landing') return locale === PORTUGUESE_LOCALE ? '/' : `/${locale}/`;
    if (kind === 'editorial') return editorialLocalePath(locale === 'en' ? ENGLISH_LOCALE : locale, path);
    return locale === 'en' ? path : `/${locale}${path}`;
  };
  const alternatives = kind === 'landing'
    ? [
      [PORTUGUESE_LOCALE, `${CANONICAL_ORIGIN}${localePath(PORTUGUESE_LOCALE)}`],
      ['en', `${CANONICAL_ORIGIN}${localePath('en')}`],
      [SPANISH_LOCALE, `${CANONICAL_ORIGIN}${localePath(SPANISH_LOCALE)}`],
    ]
    : [
      ['en', `${CANONICAL_ORIGIN}${localePath('en')}`],
      [PORTUGUESE_LOCALE, `${CANONICAL_ORIGIN}${localePath(PORTUGUESE_LOCALE)}`],
      [SPANISH_LOCALE, `${CANONICAL_ORIGIN}${localePath(SPANISH_LOCALE)}`],
    ];
  return [...alternatives, ['x-default', `${CANONICAL_ORIGIN}${kind === 'landing' ? '/' : localePath('en')}`]];
}

function assertExactAlternateLinks(html, path, kind, label) {
  const actual = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)" \/>/g)].map(([, locale, href]) => [locale, href]);
  assert(JSON.stringify(actual) === JSON.stringify(expectedAlternateLinks(path, kind)), `${label} must have exactly reciprocal EN/PT-BR/ES-419 and x-default hreflang links`);
}

function htmlPath(locale, path, kind) {
  if (kind === 'landing') return locale === PORTUGUESE_LOCALE ? 'index.html' : `${locale}/index.html`;
  if (kind === 'editorial') return `${editorialLocalePath(locale === 'en' ? ENGLISH_LOCALE : locale, path).replace(/^\//, '')}index.html`;
  return `${(locale === 'en' ? path : `/${locale}${path}`).replace(/^\//, '')}index.html`;
}

function canonicalPath(locale, path, kind) {
  if (kind === 'landing') return locale === PORTUGUESE_LOCALE ? '/' : `/${locale}/`;
  if (kind === 'editorial') return editorialLocalePath(locale === 'en' ? ENGLISH_LOCALE : locale, path);
  return locale === 'en' ? path : `/${locale}${path}`;
}

function assertIndexableDocument(html, locale, path, kind, label) {
  const language = locale === 'en' && kind === 'landing' ? 'en' : locale === 'en' ? 'en-US' : locale;
  const canonical = `${CANONICAL_ORIGIN}${canonicalPath(locale, path, kind)}`;
  assert(html.includes(`<html lang="${language}" dir="ltr">`), `${label} must declare ${language} ltr HTML`);
  assert(html.includes('<meta name="robots" content="index,follow" />'), `${label} must be indexable`);
  assert(html.includes(`<link rel="canonical" href="${canonical}" />`), `${label} must use canonical ${canonical}`);
  assertExactAlternateLinks(html, path, kind, label);
}

function assertInternalLinks(html, file, root) {
  const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map(([, href]) => href);
  for (const href of hrefs) {
    if (href.startsWith('//') || href.startsWith('/assets/') || href === '/favicon.svg' || href === '/manifest.webmanifest') continue;
    const target = href.endsWith('/') ? `${href}index.html` : href;
    assert(existsSync(resolve(root, target.replace(/^\//, ''))), `${file} links to missing internal target ${href}`);
  }
}

function mainText(html) {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1].replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ') : html;
}

function assertSpanishRenderedContent(html, label, spanishFields, englishFields, expectedSections, expectedParagraphs, navigationLabels, metadataFields) {
  const main = mainText(html);
  const normalizedMain = normalize(main);
  assert(!PLACEHOLDER_OR_INTERNAL_MARKERS.test(main), `${label} rendered content has a placeholder or internal marker`);
  assertCompleteSpanishFields(`${label} source`, spanishFields, englishFields);
  if (metadataFields) {
    assertCompleteSpanishFields(
      `${label} metadata`,
      [metadataFields.title, metadataFields.description],
      [metadataFields.englishTitle, metadataFields.englishDescription],
    );
    assert(html.includes(`<title>${metadataFields.title}</title>`), `${label} is missing Spanish title metadata`);
    assert(html.includes(`<meta name="description" content="${metadataFields.description}" />`), `${label} is missing Spanish description metadata`);
    assert(html.includes(`<meta property="og:title" content="${metadataFields.title}" />`), `${label} is missing Spanish Open Graph title metadata`);
    assert(html.includes(`<meta property="og:description" content="${metadataFields.description}" />`), `${label} is missing Spanish Open Graph description metadata`);
    assert(html.includes(`<meta name="twitter:title" content="${metadataFields.title}" />`), `${label} is missing Spanish Twitter title metadata`);
    assert(html.includes(`<meta name="twitter:description" content="${metadataFields.description}" />`), `${label} is missing Spanish Twitter description metadata`);
  }
  for (const field of metadataFields ? spanishFields.slice(2) : spanishFields) {
    const normalizedField = normalize(field);
    if (wordCount(normalizedField) >= 2) assert(normalizedMain.includes(normalizedField), `${label} is missing rendered Spanish content`);
  }
  const englishCorpus = englishFields.map(normalize).filter((value) => wordCount(value) >= 3).join('\n');
  for (const englishField of englishFields) {
    const normalizedEnglish = normalize(englishField);
    if (wordCount(normalizedEnglish) >= 3) assert(!normalizedMain.includes(normalizedEnglish), `${label} renders copied English content`);
  }
  assert((main.match(/<section(?:\s[^>]*)?>/g) ?? []).length === expectedSections, `${label} must render every required section`);
  assert((main.match(/<p(?:\s[^>]*)?>/g) ?? []).length === expectedParagraphs, `${label} must render every required paragraph`);
  for (const navigationLabel of navigationLabels) {
    assert(html.includes(`>${navigationLabel}<`) || html.includes(`${navigationLabel} `), `${label} missing Spanish navigation or label: ${navigationLabel}`);
  }
  for (const route of ['/how-to-play/', '/faq/', '/updates/']) {
    assert(html.includes(`href="/es-419${route}"`), `${label} must link directly to Spanish ${route}`);
  }
}

function sourceFor(path, kind) {
  if (kind === 'landing') {
    const spanish = landingCopyForLocale(SPANISH_LOCALE);
    const english = landingCopyForLocale('en');
    const spanishMetadata = SEO_METADATA[SPANISH_LOCALE]?.home;
    const englishMetadata = SEO_METADATA.en?.home;
    assert(spanishMetadata && englishMetadata, 'missing generated landing SEO metadata for Spanish or English');
    return {
      spanishFields: fieldsFromLanding(spanish),
      englishFields: fieldsFromLanding(english),
      sections: spanish.sections.length,
      paragraphs: 3 + spanish.sections.reduce((total, section) => total + section.paragraphs.length, 0),
      navigation: COMMON_SPANISH_NAVIGATION,
      metadata: {
        title: spanishMetadata.title,
        description: spanishMetadata.description,
        englishTitle: englishMetadata.title,
        englishDescription: englishMetadata.description,
      },
    };
  }
  if (kind === 'editorial') {
    const spanish = editorialPageFor(SPANISH_LOCALE, path);
    const english = editorialPageFor(ENGLISH_LOCALE, path);
    return {
      spanishFields: fieldsFromEditorial(spanish),
      englishFields: fieldsFromEditorial(english),
      sections: spanish.sections.length,
      paragraphs: 3 + spanish.sections.reduce((total, section) => total + section.paragraphs.length, 0),
      navigation: EDITORIAL_SPANISH_NAVIGATION,
      metadata: {
        title: spanish.title,
        description: spanish.description,
        englishTitle: english.title,
        englishDescription: english.description,
      },
    };
  }
  const ids = legalPageIdsFor(path);
  const definition = LEGAL_PAGE_DEFINITIONS[path];
  return {
    spanishFields: ids.map((id) => legalText(SPANISH_LOCALE, id)),
    englishFields: ids.map((id) => legalText('en-US', id)),
    sections: definition.sections.length,
    paragraphs: 3 + definition.sections.reduce((total, [, paragraphIds]) => total + paragraphIds.length, 0),
    navigation: [...COMMON_SPANISH_NAVIGATION, 'Volver al juego', 'Última actualización:'],
    metadata: {
      title: legalText(SPANISH_LOCALE, definition.titleId),
      description: legalText(SPANISH_LOCALE, definition.descriptionId),
      englishTitle: legalText('en-US', definition.titleId),
      englishDescription: legalText('en-US', definition.descriptionId),
    },
  };
}

function assertGeneratedEdition() {
  const config = JSON.parse(readRequired(CONFIG_PATH));
  const spanishEdition = config.searchEditions.find((edition) => edition.locale === SPANISH_LOCALE);
  assert(spanishEdition?.contentComplete === true, 'es-419 contentComplete must be true only after this complete edition exists');
  assert(spanishEdition?.fallback === false && spanishEdition?.adsenseSupported === true, 'es-419 must remain an eligible non-fallback edition');

  const root = resolve('dist');
  assert(existsSync(root), 'missing dist/ generated output');
  const pageSets = [
    { kind: 'landing', paths: ['/'] },
    { kind: 'editorial', paths: EDITORIAL_PATHS },
    { kind: 'trust', paths: INDEXABLE_TRUST_PATHS },
  ];
  let spanishIndexablePages = 0;

  for (const { kind, paths } of pageSets) {
    for (const path of paths) {
      for (const locale of ['en', PORTUGUESE_LOCALE, SPANISH_LOCALE]) {
        const relative = htmlPath(locale, path, kind);
        const html = readRequired(resolve(root, relative));
        const label = `${locale}${path}`;
        assertIndexableDocument(html, locale, path, kind, label);
        if (locale === SPANISH_LOCALE) {
          const source = sourceFor(path, kind);
          assertInternalLinks(html, relative, root);
          assertSpanishRenderedContent(html, label, source.spanishFields, source.englishFields, source.sections, source.paragraphs, source.navigation, source.metadata);
          spanishIndexablePages += 1;
        }
      }
    }
  }

  assert(spanishIndexablePages === 11, `Spanish edition must expose all 11 indexable URLs atomically (found ${spanishIndexablePages})`);

  for (const path of EDITORIAL_PATHS) {
    const publicFile = resolve('public', htmlPath(SPANISH_LOCALE, path, 'editorial'));
    const source = sourceFor(path, 'editorial');
    const html = readRequired(publicFile);
    assertIndexableDocument(html, SPANISH_LOCALE, path, 'editorial', `public ${SPANISH_LOCALE}${path}`);
    assertSpanishRenderedContent(html, `public ${SPANISH_LOCALE}${path}`, source.spanishFields, source.englishFields, source.sections, source.paragraphs, source.navigation, source.metadata);
  }
}

function run() {
  assertEditorialSource();
  assertLandingSource();
  assertTrustSource();
  assertGeneratedEdition();
  console.log(`spanish-editorial-edition ok: editorialPages=${EDITORIAL_PATHS.length} spanishIndexableUrls=11 sitemapTarget=33`);
}

try {
  run();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
