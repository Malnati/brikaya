// scripts/editorial-page-content.test.mjs
import {
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  MIN_EDITORIAL_MAIN_WORDS,
  countEditorialMainWords,
  editorialLocalePath,
  renderEditorialPage,
} from './editorial-page-content.mjs';

const SPANISH_LOCALE = 'es-419';
const EXPECTED_EDITORIAL_LOCALES = ['en-US', 'pt-BR', SPANISH_LOCALE];

if (JSON.stringify(EDITORIAL_LOCALES) !== JSON.stringify(EXPECTED_EDITORIAL_LOCALES)) {
  throw new Error(`editorial locales must be ${EXPECTED_EDITORIAL_LOCALES.join(', ')}`);
}

for (const path of EDITORIAL_PATHS) {
  for (const locale of EDITORIAL_LOCALES) {
    const words = countEditorialMainWords(locale, path);
    if (words < MIN_EDITORIAL_MAIN_WORDS) {
      throw new Error(`${locale}${path} has ${words} words (< ${MIN_EDITORIAL_MAIN_WORDS})`);
    }
  }
}

if (editorialLocalePath('en-US', '/faq/') !== '/faq/') {
  throw new Error('en-US editorial path should be root');
}
if (editorialLocalePath('pt-BR', '/faq/') !== '/pt-BR/faq/') {
  throw new Error('pt-BR editorial path should be prefixed');
}
if (editorialLocalePath(SPANISH_LOCALE, '/faq/') !== '/es-419/faq/') {
  throw new Error('es-419 editorial path should be prefixed');
}

for (const path of EDITORIAL_PATHS) {
  const html = renderEditorialPage({
    locale: SPANISH_LOCALE,
    path,
    canonicalUrl: `https://brikaya.com/es-419${path}`,
    alternateLinks: '',
    dir: 'ltr',
  });
  if (!html.includes('<html lang="es-419" dir="ltr">')) {
    throw new Error(`${SPANISH_LOCALE}${path} must declare Spanish ltr HTML`);
  }
  if (!html.includes('>Jugar<') || !html.includes('>Cómo jugar<') || !html.includes('>Actualizaciones<')) {
    throw new Error(`${SPANISH_LOCALE}${path} navigation must be fully Spanish`);
  }
  if (html.includes('Back to the game') || html.includes('Last updated:')) {
    throw new Error(`${SPANISH_LOCALE}${path} must not fall back to English UI copy`);
  }
}

console.log(
  `editorial-page-content unit ok: pages=${EDITORIAL_PATHS.length} locales=${EDITORIAL_LOCALES.length} minWords=${MIN_EDITORIAL_MAIN_WORDS}`,
);
