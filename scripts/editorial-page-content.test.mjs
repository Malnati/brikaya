// scripts/editorial-page-content.test.mjs
import {
  EDITORIAL_LOCALES,
  EDITORIAL_PATHS,
  MIN_EDITORIAL_MAIN_WORDS,
  countEditorialMainWords,
  editorialLocalePath,
} from './editorial-page-content.mjs';

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

console.log(
  `editorial-page-content unit ok: pages=${EDITORIAL_PATHS.length} locales=${EDITORIAL_LOCALES.length} minWords=${MIN_EDITORIAL_MAIN_WORDS}`,
);
