import assert from 'node:assert/strict';
import {
  analyzeHtml,
  assertFunctionalNoindexPage,
  assertIndexablePage,
} from './verify-adsense-public-ready.mjs';

const words = Array.from({ length: 300 }, (_, index) => `palavra${index}`).join(
  ' ',
);
const alternates = ['en', 'pt-BR', 'es-419', 'x-default']
  .map(
    (locale) =>
      `<link rel="alternate" hreflang="${locale}" href="https://brikaya.com/" />`,
  )
  .join('');
const ownership =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9571619183194136" crossorigin="anonymous"></script>';

const indexableHtml = `<!doctype html><html lang="pt-BR"><head>
<link rel="canonical" href="https://brikaya.com/" />
<meta name="robots" content="index,follow" />
${alternates}
${ownership}
</head><body><main>${words}</main></body></html>`;

const indexable = analyzeHtml(indexableHtml);
assert.doesNotThrow(() =>
  assertIndexablePage(indexable, {
    url: 'https://brikaya.com/',
    minWords: 280,
    expectedHreflangs: ['en', 'pt-BR', 'es-419', 'x-default'],
    ownershipAllowed: true,
  }),
);

assert.throws(
  () =>
    assertIndexablePage(
      analyzeHtml(indexableHtml.replace('index,follow', 'noindex,follow')),
      {
        url: 'https://brikaya.com/',
        minWords: 280,
        expectedHreflangs: ['en', 'pt-BR', 'es-419', 'x-default'],
        ownershipAllowed: true,
      },
    ),
  /index,follow/,
);

const noindexHtml = `<!doctype html><html lang="pt-BR"><head>
<link rel="canonical" href="https://brikaya.com/play/" />
<meta name="robots" content="noindex,follow" />
</head><body><main>Jogo funcional.</main></body></html>`;
assert.doesNotThrow(() =>
  assertFunctionalNoindexPage(analyzeHtml(noindexHtml), {
    url: 'https://brikaya.com/play/',
  }),
);
assert.throws(
  () =>
    assertFunctionalNoindexPage(
      analyzeHtml(noindexHtml.replace('</head>', `${ownership}</head>`)),
      { url: 'https://brikaya.com/play/' },
    ),
  /advertising runtime|ownership/i,
);

console.log(
  'verify-adsense-public-ready unit ok: indexable depth, hreflang, noindex routes, and ownership placement',
);
