// tests/unit/seoMetadata.test.ts
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const INDEX_HTML_PATH = 'public/index.html';
const PLAY_HTML_PATH = 'play/index.html';
const PRIVACY_HTML_PATH = 'public/privacy/index.html';
const TERMS_HTML_PATH = 'public/terms/index.html';
const ROBOTS_TXT_PATH = 'public/robots.txt';
const SITEMAP_XML_PATH = 'public/sitemap.xml';
const CANONICAL_URL = 'https://brikaya.com/';
const PLAY_CANONICAL_URL = 'https://brikaya.com/play/';
const SITEMAP_URL = 'https://brikaya.com/sitemap.xml';
const SOCIAL_IMAGE_URL = 'https://brikaya.com/assets/visual/ui/ui-pwa-app-icon.svg';
const ROOT_FAVICON_LINK = '<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />';
const PORTUGUESE_LOCALE = 'pt-BR';
const DESCRIPTION_META_NAME = 'name="description"';
const CANONICAL_REL = 'rel="canonical"';
const OG_IMAGE_PROPERTY = 'property="og:image"';
const TWITTER_IMAGE_NAME = 'name="twitter:image"';
const SITEMAP_DIRECTIVE = `Sitemap: ${SITEMAP_URL}`;
const LOC_TAG = `<loc>${CANONICAL_URL}</loc>`;
const PRIVACY_LOC_TAG = '<loc>https://brikaya.com/privacy/</loc>';
const TERMS_LOC_TAG = '<loc>https://brikaya.com/terms/</loc>';
const PORTUGUESE_PRIVACY_LOC_TAG = '<loc>https://brikaya.com/pt-BR/privacy/</loc>';
const SEARCH_EDITION_LOCALES = ['en', 'pt-BR', 'es-419'] as const;
const INDEXABLE_EDITION_LOCALES = ['en', 'pt-BR', 'es-419'] as const;
const CURRENT_INDEXABLE_EDITORIAL_URL_COUNT = 9;
const INDEXABLE_TRUST_PATH_COUNT = 7;
const EXPECTED_SITEMAP_LOC_COUNT =
  INDEXABLE_EDITION_LOCALES.length +
  CURRENT_INDEXABLE_EDITORIAL_URL_COUNT +
  INDEXABLE_EDITION_LOCALES.length * INDEXABLE_TRUST_PATH_COUNT;
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';
const CURRENT_LEGAL_LASTMOD = '2026-07-29';
const LOCALIZED_LOCALES = [
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
  "cs",
  "ro",
  "hu",
  "bg",
  "sk",
  "sl",
  "hr",
  "sr",
  "lt",
  "lv",
  "et",
  "sw",
  "af",
  "am",
  "ka",
  "hy",
  "az",
  "kk",
  "uz",
  "ne",
  "si",
  "km",
  "lo",
  "my",
  "is",
  "ga",
  "cy",
  "mt",
  "sq",
  "mk",
  "bs",
  "mn",
  "tg",
  "ky",
  "tk",
  "be",
  "lb",
  "eu",
  "ca",
  "gl",
  "oc",
  "br",
  "mi",
  "sm",
  "to",
  "fj",
  "mg",
  "so",
  "yo",
  "ig",
  "ha",
  "zu",
  "xh",
  "st",
  "tn",
  "ts",
  "ss",
  "ve",
  "nso",
  "rw",
  "rn",
  "ln",
  "lg",
  "ak",
  "ee",
  "tw",
  "sn",
  "ny",
  "wo",
  "ff",
  "om",
  "ti",
  "qu",
  "ay",
  "gn",
  "nah",
  "ht",
  "pap",
  "jv",
  "su",
  "ceb",
  "ilo",
  "war",
  "haw",
  "co",
  "sc",
  "fur",
  "rm",
  "lad",
  "ast",
  "vec",
  "lmo",
  "pms",
  "nap",
  "scn",
  "sco",
  "ps",
  "sd",
  "ks",
  "dv",
  "ckb",
  "ug",
  "yi",
  "bo",
  "dz",
  "ku",
  "or",
  "as",
  "sa",
  "mai",
  "bho",
  "doi",
  "mni",
  "kok",
  "sat",
  "lus",
  "brx",
  "raj",
  "hne",
  "awa",
  "ace",
  "bal",
  "chr",
  "crh",
  "tt",
  "ba",
  "cv",
  "sah",
  "os",
  "ab",
  "ady",
  "kab",
  "tet",
  "bug",
  "min",
  "ban",
  "mad",
  "bjn",
  "hil",
  "pam",
  "bcl",
  "gor",
  "mak",
  "sas",
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
] as const;

function readProjectFile(filePath: string): string {
  return readFileSync(resolve(process.cwd(), filePath), 'utf8');
}

function renderSpanishLegalPage(): string {
  const script = `
    import { renderLegalPage } from './scripts/legal-page-content.mjs';

    const localizedPath = (locale, path) =>
      locale === 'en-US' ? path : \`/\${locale}\${path}\`;

    process.stdout.write(renderLegalPage({
      locale: 'es-419',
      path: '/legal/',
      canonicalUrl: 'https://brikaya.com/es-419/legal/',
      alternateLinks: '',
      dir: 'ltr',
      localizedPath,
    }));
  `;

  return execFileSync(
    process.execPath,
    ['--input-type=module', '--eval', script],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );
}

type SeoEligibilitySnapshot = {
  searchEdition: boolean;
  contentComplete: boolean;
  indexable: boolean;
};

const SEO_METADATA = JSON.parse(
  readProjectFile('scripts/generated/i18n-home-seo.json'),
) as Record<string, SeoEligibilitySnapshot>;

describe('metadados públicos de descoberta do Brikaya', () => {
  it('declara idioma, descrição e URL canônica na landing pública', () => {
    const html = readProjectFile(INDEX_HTML_PATH);

    expect(html).toMatch(new RegExp(`<html lang="${PORTUGUESE_LOCALE}"(?: dir="ltr")?>`));
    expect(html).toContain(DESCRIPTION_META_NAME);
    expect(html).toContain(CANONICAL_REL);
    expect(html).toContain(CANONICAL_URL);
    expect(html).toContain(ROOT_FAVICON_LINK);
    expect(html).toContain(OG_IMAGE_PROPERTY);
    expect(html).toContain(TWITTER_IMAGE_NAME);
    expect(html).toContain(SOCIAL_IMAGE_URL);
    expect(html).toContain('href="/play/"');
    for (const locale of INDEXABLE_EDITION_LOCALES) {
      expect(html).toContain(`hreflang="${locale}"`);
    }
    expect(html).not.toContain('hreflang="ja"');
    expect(html).toContain('hreflang="x-default"');
    expect((html.match(/hreflang=/g) ?? [])).toHaveLength(4);
  });

  it('mantém o shell do jogo acessível, canônico e fora da busca', () => {
    const html = readProjectFile(PLAY_HTML_PATH);

    expect(html).toMatch(new RegExp(`<html lang="${PORTUGUESE_LOCALE}"(?: dir="ltr")?>`));
    expect(html).toContain(PLAY_CANONICAL_URL);
    expect(html).not.toContain('ca-pub-9571619183194136');
    expect(html).not.toMatch(/pagead2\.googlesyndication\.com|\badsbygoogle\b|\badBreak\b|\badConfig\b|__BRIKAYA_GOOGLE_ADS_ENABLED__/i);
    expect(html).toContain('<meta name="robots" content="noindex,follow" />');
    expect(html).not.toContain('hreflang=');
  });

  it('publica robots.txt apontando para sitemap canônico', () => {
    const robots = readProjectFile(ROBOTS_TXT_PATH);

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(SITEMAP_DIRECTIVE);
  });

  it('publica exatamente as 33 URLs completas das edições EN/PT/ES-419', () => {
    const sitemap = readProjectFile(SITEMAP_XML_PATH);
    const locCount = (sitemap.match(/<loc>/g) ?? []).length;

    expect(sitemap.startsWith(XML_DECLARATION)).toBe(true);
    expect(sitemap).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(locCount).toBe(EXPECTED_SITEMAP_LOC_COUNT);
    expect(sitemap).toContain(LOC_TAG);
    for (const locale of INDEXABLE_EDITION_LOCALES) {
      const localizedUrl =
        locale === PORTUGUESE_LOCALE
          ? CANONICAL_URL
          : `https://brikaya.com/${locale}/`;
      expect(sitemap).toContain(`<loc>${localizedUrl}</loc>`);
    }
    expect(sitemap).toContain('<loc>https://brikaya.com/es-419/</loc>');
    expect(sitemap).not.toContain('/play/</loc>');
    expect(sitemap).not.toContain('/downloads/</loc>');
    expect(sitemap).not.toContain('/user-agreement/</loc>');
    expect(sitemap).not.toContain('/license/</loc>');
    expect(sitemap).not.toContain('<loc>https://brikaya.com/ja/</loc>');
    expect(sitemap).toContain(PRIVACY_LOC_TAG);
    expect(sitemap).toContain(TERMS_LOC_TAG);
    expect(sitemap).toContain(PORTUGUESE_PRIVACY_LOC_TAG);
    expect(sitemap).toContain('<loc>https://brikaya.com/es-419/terms/</loc>');
    expect(sitemap).not.toContain('<loc>https://brikaya.com/fr/privacy/</loc>');
    expect(sitemap).not.toContain('<loc>https://brikaya.com/zh-CN/data-deletion/</loc>');
    expect(sitemap).not.toContain('.pages.dev');
  });

  it('mantém hreflang recíproco entre as edições EN/PT/ES-419 completas', () => {
    const privacy = readProjectFile(PRIVACY_HTML_PATH);
    const terms = readProjectFile(TERMS_HTML_PATH);

    expect(privacy).toContain('<html lang="en-US" dir="ltr">');
    expect(privacy).toContain('<title>Privacy policy — Brikaya</title>');
    expect(privacy).toContain('<link rel="canonical" href="https://brikaya.com/privacy/" />');
    expect(privacy).toContain('hreflang="pt-BR"');
    expect(privacy).toContain('href="https://brikaya.com/pt-BR/privacy/"');
    expect(privacy).toContain('hreflang="en"');
    expect(privacy).toContain('hreflang="es-419"');
    expect((privacy.match(/hreflang=/g) ?? [])).toHaveLength(4);
    expect(terms).toContain('<html lang="en-US" dir="ltr">');
    expect(terms).toContain('<title>Terms of use — Brikaya</title>');
    expect(privacy).toContain(ROOT_FAVICON_LINK);
    expect(terms).toContain(ROOT_FAVICON_LINK);
  });

  it('preserva 284 locais jogáveis e restringe a busca às três edições', () => {
    expect(LOCALIZED_LOCALES).toHaveLength(284);
    expect(
      LOCALIZED_LOCALES.filter((locale) => SEO_METADATA[locale]?.searchEdition),
    ).toEqual(['pt-BR', 'en', 'es-419']);
    expect(SEO_METADATA.en.contentComplete).toBe(true);
    expect(SEO_METADATA['pt-BR'].contentComplete).toBe(true);
    expect(SEO_METADATA['es-419'].contentComplete).toBe(true);
    expect(SEO_METADATA['es-419'].indexable).toBe(true);
  });

  it('mantém user-agreement e license acessíveis sem indexação nem hreflang', () => {
    for (const path of ['public/user-agreement/index.html', 'public/license/index.html']) {
      const html = readProjectFile(path);
      expect(html).toContain('<meta name="robots" content="noindex,follow" />');
      expect(html).not.toContain('hreflang=');
    }
  });

  it('data o material legal espanhol atualizado na página e no sitemap', () => {
    const html = renderSpanishLegalPage();
    const sitemap = readProjectFile(SITEMAP_XML_PATH);

    expect(html).toContain(`"dateModified":"${CURRENT_LEGAL_LASTMOD}"`);
    expect(html).toContain(`Última actualización: ${CURRENT_LEGAL_LASTMOD}`);
    expect(sitemap).toMatch(
      new RegExp(
        `<loc>https://brikaya\\.com/es-419/legal/</loc>\\s*<lastmod>${CURRENT_LEGAL_LASTMOD}</lastmod>`,
      ),
    );
  });
});
