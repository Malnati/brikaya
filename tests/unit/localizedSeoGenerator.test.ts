// tests/unit/localizedSeoGenerator.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GENERATOR_PATH = 'scripts/generate-localized-seo.mjs';
const I18N_HOME_SEO_PATH = 'scripts/generated/i18n-home-seo.json';
const RELATIVE_MANIFEST_PATTERN = 'href="./manifest.webmanifest"';
const ABSOLUTE_MANIFEST_PATTERN = 'href="/manifest.webmanifest"';
const RELATIVE_FAVICON_PATTERN = 'href="./favicon.svg"';
const ABSOLUTE_FAVICON_PATTERN = 'href="/favicon.svg"';
const RELATIVE_ASSET_HREF_PATTERN = 'href="./assets/';
const ABSOLUTE_ASSET_HREF_PATTERN = 'href="/assets/';
const RELATIVE_ASSET_SRC_PATTERN = 'src="./assets/';
const ABSOLUTE_ASSET_SRC_PATTERN = 'src="/assets/';
const LEGAL_CONTENT_PATH = 'scripts/legal-page-content.mjs';
const LEGAL_TRANSLATIONS_PATH = 'scripts/legal-page-translations.json';
const EXPECTED_PRIMARY_LEGAL_LOCALES = 253;
const PRIVACY_PATH = "'/privacy/'";
const TERMS_PATH = "'/terms/'";
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

describe('gerador SEO localizado', () => {
  it('converte assets relativos do Vite em paths absolutos para rotas aninhadas', () => {
    const generator = readProjectFile(GENERATOR_PATH);

    expect(generator).toContain(RELATIVE_MANIFEST_PATTERN);
    expect(generator).toContain(ABSOLUTE_MANIFEST_PATTERN);
    expect(generator).toContain(RELATIVE_FAVICON_PATTERN);
    expect(generator).toContain(ABSOLUTE_FAVICON_PATTERN);
    expect(generator).toContain(RELATIVE_ASSET_HREF_PATTERN);
    expect(generator).toContain(ABSOLUTE_ASSET_HREF_PATTERN);
    expect(generator).toContain(RELATIVE_ASSET_SRC_PATTERN);
    expect(generator).toContain(ABSOLUTE_ASSET_SRC_PATTERN);
  });

  it('declara páginas legais multilíngues com padrão en-US', () => {
    const generator = readProjectFile(GENERATOR_PATH);
    const legalContent = readProjectFile(LEGAL_CONTENT_PATH);

    expect(legalContent).toContain("LEGAL_DEFAULT_LOCALE = 'en-US'");
    expect(legalContent).toContain(PRIVACY_PATH);
    expect(legalContent).toContain(TERMS_PATH);
    expect(legalContent).toContain("'/data-deletion/'");
    expect(generator).toContain('LEGAL_LOCALES = [LEGAL_DEFAULT_LOCALE');
    expect(generator).toContain('renderLegalPage({');
    expect(generator).toContain('legalHreflangLinks(routePath)');
    expect(generator).toContain('writeFile(join(publicRoot, SITEMAP_FILE), sitemap)');
  });

  it('mantém traduções legais para idiomas principais sem variantes regionais duplicadas', () => {
    const payload = JSON.parse(readProjectFile(LEGAL_TRANSLATIONS_PATH)) as {
      translations: Record<string, Record<string, string>>;
    };
    const translationLocales = Object.keys(payload.translations);

    expect(translationLocales).toHaveLength(EXPECTED_PRIMARY_LEGAL_LOCALES);
    expect(payload.translations['pt-BR']['privacy.h1']).not.toBe('Privacy policy');
    expect(payload.translations['es-419']['terms.h1']).not.toBe('Terms of use');
    expect(payload.translations.fr['legal.h1']).not.toBe('Legal and trust');
    expect(payload.translations['zh-CN']['dataDeletion.h1']).toBeTruthy();
    expect(payload.translations.ar['privacy.h1']).toBeTruthy();
    expect(payload.translations).not.toHaveProperty('en');
    expect(payload.translations).not.toHaveProperty('en-AU');
    expect(payload.translations).not.toHaveProperty('fr-CA');
    expect(payload.translations).not.toHaveProperty('de-CH');
  });

  it('declara metadados de downloads para todos os idiomas suportados', () => {
    const generator = readProjectFile(GENERATOR_PATH);
    const seoSnapshot = JSON.parse(readProjectFile(I18N_HOME_SEO_PATH)) as Record<
      string,
      { downloads: { title: string; description: string; ogDescription: string } }
    >;

    expect(generator).toContain('I18N_HOME_SEO');
    expect(generator).toContain('entry.downloads');

    for (const locale of LOCALIZED_LOCALES) {
      expect(seoSnapshot[locale]?.downloads?.title).toMatch(/Brikaya/i);
      expect(seoSnapshot[locale]?.downloads?.description).toBeTruthy();
      expect(seoSnapshot[locale]?.downloads?.ogDescription).toBeTruthy();
    }

    expect(seoSnapshot['pt-BR'].downloads.title).toContain('Baixar Brikaya');
    expect(seoSnapshot.en.downloads.title).toContain('Download Brikaya');
    expect(seoSnapshot['zh-CN'].downloads.title).toContain('下载 Brikaya');
    expect(seoSnapshot.ja.downloads.title).toContain('Brikayaをダウンロード');
    expect(seoSnapshot.ar.downloads.title).toContain('تنزيل Brikaya');
  });
});
