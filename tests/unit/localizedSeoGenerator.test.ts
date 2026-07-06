// tests/unit/localizedSeoGenerator.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GENERATOR_PATH = 'scripts/generate-localized-seo.mjs';
const RELATIVE_MANIFEST_PATTERN = 'href="./manifest.webmanifest"';
const ABSOLUTE_MANIFEST_PATTERN = 'href="/manifest.webmanifest"';
const RELATIVE_FAVICON_PATTERN = 'href="./favicon.svg"';
const ABSOLUTE_FAVICON_PATTERN = 'href="/favicon.svg"';
const RELATIVE_ASSET_HREF_PATTERN = 'href="./assets/';
const ABSOLUTE_ASSET_HREF_PATTERN = 'href="/assets/';
const RELATIVE_ASSET_SRC_PATTERN = 'src="./assets/';
const ABSOLUTE_ASSET_SRC_PATTERN = 'src="/assets/';
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

  it('inclui páginas públicas de privacidade e termos no sitemap gerado', () => {
    const generator = readProjectFile(GENERATOR_PATH);

    expect(generator).toContain(PRIVACY_PATH);
    expect(generator).toContain(TERMS_PATH);
  });

  it('declara metadados de downloads para todos os idiomas suportados', () => {
    const generator = readProjectFile(GENERATOR_PATH);
    const downloadsSeoBlock = generator.slice(
      generator.indexOf('const DOWNLOADS_SEO = {'),
      generator.indexOf('function metadataFor'),
    );

    for (const locale of LOCALIZED_LOCALES) {
      expect(downloadsSeoBlock).toContain(`'${locale}':`);
    }
    expect(downloadsSeoBlock).toContain("下载 Brikaya");
    expect(downloadsSeoBlock).toContain("Brikayaをダウンロード");
    expect(downloadsSeoBlock).toContain("Brikaya डाउनलोड");
    expect(downloadsSeoBlock).toContain("تنزيل Brikaya");
    expect(downloadsSeoBlock).toContain("Скачать Brikaya");
    expect(downloadsSeoBlock).toContain("Brikaya ڈاؤن لوڈ کریں");
    expect(downloadsSeoBlock).toContain("دانلود Brikaya");
    expect(downloadsSeoBlock).toContain("הורדת Brikaya");
    expect(downloadsSeoBlock).toContain("Brikaya பதிவிறக்கவும்");
    expect(downloadsSeoBlock).toContain("Brikaya डाउनलोड करा");
    expect(downloadsSeoBlock).toContain("Brikaya ડાઉનલોડ કરો");
    expect(downloadsSeoBlock).toContain("Λήψη Brikaya");
    expect(downloadsSeoBlock).toContain("Lataa Brikaya");
    expect(downloadsSeoBlock).toContain("Stáhnout Brikaya");
    expect(downloadsSeoBlock).toContain("Изтеглете Brikaya");
    expect(downloadsSeoBlock).toContain("Преузми Brikaya");
    expect(downloadsSeoBlock).toContain("Laai Brikaya af");
    expect(downloadsSeoBlock).toContain("Brikaya yuklab olish");
    expect(downloadsSeoBlock).toContain("Brikaya ဒေါင်းလုဒ်လုပ်ရန်");
    expect(downloadsSeoBlock).toContain("Sækja Brikaya");
    expect(downloadsSeoBlock).toContain("Преземи Brikaya");
    expect(downloadsSeoBlock).toContain("Baixa Brikaya");
    expect(downloadsSeoBlock).toContain("Tikiake Brikaya");
    expect(downloadsSeoBlock).toContain("Soo dejiso Brikaya");
    expect(downloadsSeoBlock).toContain("Gba Brikaya silẹ");
    expect(downloadsSeoBlock).toContain("Budata Brikaya");
    expect(downloadsSeoBlock).toContain("Zazzage Brikaya");
    expect(downloadsSeoBlock).toContain("Landa i-Brikaya");
    expect(downloadsSeoBlock).toContain("Khuphela i-Brikaya");
    expect(downloadsSeoBlock).toContain("Khoasolla Brikaya");
    expect(downloadsSeoBlock).toContain("Folosa Brikaya");
    expect(downloadsSeoBlock).toContain("Download Brikaya");
    expect(downloadsSeoBlock).toContain("Descargar Brikaya");
    expect(downloadsSeoBlock).toContain("Descarregar Brikaya");
    expect(downloadsSeoBlock).toContain("下載 Brikaya");
    expect(downloadsSeoBlock).toContain("تنزيل Brikaya");
    expect(downloadsSeoBlock).toContain("Brikaya نى چۈشۈرۈش");
    expect(downloadsSeoBlock).toContain("אַראָפּלאָדן Brikaya");
    expect(downloadsSeoBlock).toContain("Dawuniloda Brikaya");
  });
});
