// Regression tests mutate generated public artifacts and run the real readiness gate.
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PUBLISHER_ID = 'pub-9571619183194136';
const OWNERSHIP_SNIPPET = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUBLISHER_ID}" crossorigin="anonymous"></script>`;
const HOME_PATH = 'public/index.html';
const DIST_HOME_PATH = 'dist/index.html';
const FORBIDDEN_PATH = 'dist/en/index.html';
const FALLBACK_PATH = 'dist/fr/index.html';
const PLAY_PATH = 'dist/play/index.html';
const DIST_ADS_PATH = 'dist/ads.txt';
const DIST_SITEMAP_PATH = 'dist/sitemap.xml';
const DIST_SPANISH_LEGAL_PATH = 'dist/es-419/legal/index.html';
const DIST_PORTUGUESE_SUPPORT_PATH = 'dist/pt-BR/support/index.html';
const LEGAL_TRANSLATIONS_PATH = 'scripts/legal-page-translations.json';
const originals = new Map(
  [
    HOME_PATH,
    DIST_HOME_PATH,
    FORBIDDEN_PATH,
    FALLBACK_PATH,
    PLAY_PATH,
    DIST_ADS_PATH,
    DIST_SITEMAP_PATH,
    DIST_SPANISH_LEGAL_PATH,
    DIST_PORTUGUESE_SUPPORT_PATH,
    LEGAL_TRANSLATIONS_PATH,
  ].map((path) => [path, readFileSync(path, 'utf8')]),
);

function runGate() {
  return spawnSync(process.execPath, ['scripts/verify-adsense-ready-proxy.mjs'], {
    encoding: 'utf8',
  });
}

function expectGateFailure(label, matcher) {
  const result = runGate();
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status === 0) throw new Error(`${label} must make the readiness gate fail`);
  if (!matcher.test(output)) throw new Error(`${label} failed for the wrong reason: ${output}`);
}

try {
  const canonicalFixture = (html) =>
    html.includes(OWNERSHIP_SNIPPET)
      ? html
      : html.replace('</head>', `    ${OWNERSHIP_SNIPPET}\n  </head>`);
  const forbiddenWithOwnership = originals
    .get(FORBIDDEN_PATH)
    .replace('</head>', `    ${OWNERSHIP_SNIPPET}\n  </head>`);

  writeFileSync(HOME_PATH, canonicalFixture(originals.get(HOME_PATH)));
  writeFileSync(DIST_HOME_PATH, canonicalFixture(originals.get(DIST_HOME_PATH)));
  writeFileSync(FORBIDDEN_PATH, forbiddenWithOwnership);
  expectGateFailure('ownership snippet on /en/', /ownership snippet.*canonical|canonical.*ownership snippet|forbidden.*ownership/i);
  writeFileSync(FORBIDDEN_PATH, originals.get(FORBIDDEN_PATH));

  writeFileSync(
    PLAY_PATH,
    originals.get(PLAY_PATH).replace('</head>', '    <script>window.adBreak = () => {};</script>\n  </head>'),
  );
  expectGateFailure('advertising bootstrap on /play/', /advertising runtime is forbidden outside canonical/i);
  writeFileSync(PLAY_PATH, originals.get(PLAY_PATH));

  writeFileSync(
    FALLBACK_PATH,
    originals.get(FALLBACK_PATH).replace('<meta name="robots" content="noindex,follow" />', ''),
  );
  expectGateFailure('fallback without robots meta', /fallback canonical.*exact noindex,follow|noindex,follow.*fallback canonical/i);
  writeFileSync(FALLBACK_PATH, originals.get(FALLBACK_PATH));

  writeFileSync(
    FALLBACK_PATH,
    originals.get(FALLBACK_PATH).replace(
      '</head>',
      '    <link rel="alternate" hreflang="fr" href="https://brikaya.com/fr/" />\n  </head>',
    ),
  );
  expectGateFailure('fallback with leftover hreflang', /fallback canonical.*hreflang|hreflang.*fallback canonical/i);
  writeFileSync(FALLBACK_PATH, originals.get(FALLBACK_PATH));

  unlinkSync(DIST_ADS_PATH);
  expectGateFailure('missing deployed ads.txt', /missing deployed dist\/ads\.txt/i);
  writeFileSync(DIST_ADS_PATH, originals.get(DIST_ADS_PATH));

  unlinkSync(DIST_SITEMAP_PATH);
  expectGateFailure('missing deployed sitemap.xml', /missing deployed dist\/sitemap\.xml/i);
  writeFileSync(DIST_SITEMAP_PATH, originals.get(DIST_SITEMAP_PATH));

  const translations = JSON.parse(originals.get(LEGAL_TRANSLATIONS_PATH));
  const portugueseLegal = translations.translations['pt-BR'];
  portugueseLegal['about.description'] =
    'About Brikaya, a free offline-first arcade game published at brikaya.com.';
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    `${JSON.stringify(translations, null, 2)}\n`,
  );
  expectGateFailure(
    'English metadata fallback in Portuguese trust page',
    /pt-BR\/about\/ metadata appears to contain an English fallback/i,
  );
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );

  const bodyFallbackTranslations = JSON.parse(
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );
  bodyFallbackTranslations.translations['pt-BR']['about.s1.body1'] =
    'This game is free and works in your browser after the first load.';
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    `${JSON.stringify(bodyFallbackTranslations, null, 2)}\n`,
  );
  expectGateFailure(
    'English body fallback in Portuguese trust page',
    /pt-BR\/about\/ about\.s1\.body1 appears to contain an English fallback/i,
  );
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );

  const restoredTranslations = JSON.parse(
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );
  const spanishLegal = restoredTranslations.translations['es-419'];
  const longLegalBody1 = spanishLegal['legal.s1.body1'];
  const longLegalBody2 = spanishLegal['legal.s1.body2'];
  const shortLegalBody1 =
    'Estas páginas fueron preparadas para que los jugadores, motores de búsqueda y plataformas puedan encontrar información pública sobre Brikaya en direcciones estables.';
  const shortLegalBody2 =
    'Cuando una característica material del juego cambia, estas páginas deben revisarse y actualizarse.';
  spanishLegal['legal.s1.body1'] = shortLegalBody1;
  spanishLegal['legal.s1.body2'] = shortLegalBody2;
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    `${JSON.stringify(restoredTranslations, null, 2)}\n`,
  );
  writeFileSync(
    DIST_SPANISH_LEGAL_PATH,
    originals
      .get(DIST_SPANISH_LEGAL_PATH)
      .replace(longLegalBody1, shortLegalBody1)
      .replace(longLegalBody2, shortLegalBody2),
  );
  expectGateFailure(
    'thin Spanish trust page',
    /es-419 trust page \/legal\/ source must meet the 280-word minimum/i,
  );
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );
  writeFileSync(
    DIST_SPANISH_LEGAL_PATH,
    originals.get(DIST_SPANISH_LEGAL_PATH),
  );

  const portugueseDepthTranslations = JSON.parse(
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );
  const portugueseSupport =
    portugueseDepthTranslations.translations['pt-BR'];
  portugueseSupport['support.lead'] = 'Suporte do Brikaya.';
  portugueseSupport['support.s1.body1'] = 'Envie uma mensagem.';
  portugueseSupport['support.s1.body2'] = 'Não envie senhas.';
  portugueseSupport['support.s2.body1'] = 'Descreva o problema.';
  portugueseSupport['support.s3.body1'] = 'Use o contato oficial.';
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    `${JSON.stringify(portugueseDepthTranslations, null, 2)}\n`,
  );
  expectGateFailure(
    'thin Portuguese trust page',
    /pt-BR trust page \/support\/.*280-word minimum/i,
  );
  writeFileSync(
    LEGAL_TRANSLATIONS_PATH,
    originals.get(LEGAL_TRANSLATIONS_PATH),
  );
  writeFileSync(
    DIST_PORTUGUESE_SUPPORT_PATH,
    originals.get(DIST_PORTUGUESE_SUPPORT_PATH),
  );

  writeFileSync(
    DIST_SITEMAP_PATH,
    originals.get(DIST_SITEMAP_PATH).replace(
      '</urlset>',
      '  <url><loc>https://brikaya.com/</loc></url>\n</urlset>',
    ),
  );
  expectGateFailure('duplicate sitemap URL', /sitemap must contain exactly 33 URLs|sitemap contains duplicate URLs/i);
} finally {
  for (const [path, content] of originals) writeFileSync(path, content);
}

console.log('verify-adsense-ready-proxy tests ok: ownership, runtime, fallback indexability, localized metadata/body fallback, all-edition trust depth, and deployed artifact mutations are rejected');
