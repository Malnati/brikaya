// scripts/refresh-legal-text-ids.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LEGAL_DEFAULT_LOCALE, LEGAL_TEXT } from './legal-page-content.mjs';

const OUTPUT_PATH = 'scripts/legal-page-translations.json';
const GOOGLE_TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const RETRIES = 3;
const IDS = process.argv.slice(2);

const FALLBACK_TARGETS = {
  'pt-BR': 'pt',
  'es-419': 'es',
  'hi-IN': 'hi',
  rm: 'fr',
  nah: 'es',
  sc: 'it',
  lad: 'es',
  ast: 'es',
  pms: 'it',
  nap: 'it',
  sco: 'en',
  ks: 'ur',
  mni: 'bn',
  brx: 'hi',
  raj: 'hi',
  hne: 'hi',
  chr: 'en',
  ady: 'ru',
  kab: 'fr',
  bug: 'id',
  bjn: 'id',
  gor: 'id',
  sas: 'id',
  kw: 'en',
  cr: 'en',
  lkt: 'en',
  oj: 'en',
  nv: 'en',
  bi: 'en',
  ik: 'en',
  na: 'en',
  gil: 'en',
  niu: 'en',
  rar: 'en',
  pau: 'en',
  ho: 'en',
  myv: 'ru',
  mdf: 'ru',
  mrj: 'ru',
  alt: 'ru',
  kum: 'ru',
  krc: 'ru',
  lez: 'ru',
  inh: 'ru',
  kbd: 'ru',
  xal: 'ru',
  nog: 'ru',
  kaa: 'uz',
  gag: 'tr',
  kjh: 'ru',
  sma: 'no',
  smj: 'sv',
  ia: 'en',
  ie: 'en',
  io: 'en',
  vo: 'en',
  mwl: 'pt',
  an: 'es',
  ext: 'es',
  bar: 'de',
  hsb: 'de',
  dsb: 'de',
  nds: 'de',
  frr: 'de',
  stq: 'de',
  ksh: 'de',
  pcd: 'fr',
  wa: 'fr',
  frp: 'fr',
  vls: 'nl',
  zea: 'nl',
  arp: 'en',
  mus: 'en',
};

const PROTECTED_TERMS = [
  ['https://brikaya.com/', 'ZXQBRIKAYAURLXQZ'],
  ['contato@brikaya.com', 'ZXQBRIKAYAEMAILXQZ'],
  ['brikaya.com', 'ZXQBRIKAYADOMAINXQZ'],
  ['Ricardo Malnati', 'ZXQRICARDOMALNATIXQZ'],
  ['Brikaya', 'ZXQBRIKAYAXQZ'],
];

function targetFor(locale) {
  return FALLBACK_TARGETS[locale] ?? locale;
}

function protectText(value) {
  return PROTECTED_TERMS.reduce((text, [term, token]) => text.replaceAll(term, token), value);
}

function restoreText(value) {
  return PROTECTED_TERMS.reduce((text, [term, token]) => text.replaceAll(token, term), value);
}

async function translateOne(locale, id) {
  const target = targetFor(locale);
  if (target === 'en') return LEGAL_TEXT[id];
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: target,
    dt: 't',
    q: protectText(LEGAL_TEXT[id]),
  });
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?${params}`);
      const text = await response.text();
      if (!response.ok) throw new Error(`translate ${locale}/${target} ${id} http ${response.status}`);
      const payload = JSON.parse(text);
      const translated = payload?.[0]?.map((part) => part?.[0] ?? '').join('')?.trim();
      if (translated) return restoreText(translated);
      throw new Error(`translate ${locale}/${target} ${id} empty`);
    } catch (error) {
      lastError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250 * attempt));
    }
  }
  throw lastError;
}

async function run() {
  const ids = IDS.length > 0 ? IDS : Object.keys(LEGAL_TEXT);
  const file = JSON.parse(readFileSync(resolve(process.cwd(), OUTPUT_PATH), 'utf8'));
  const translations = file.translations ?? file;
  const locales = Object.keys(translations).sort();

  for (const locale of locales) {
    if (locale === LEGAL_DEFAULT_LOCALE) continue;
    process.stderr.write(`refresh legal ids ${locale}\n`);
    for (const id of ids) {
      translations[locale][id] = await translateOne(locale, id);
    }
  }

  writeFileSync(
    resolve(process.cwd(), OUTPUT_PATH),
    `${JSON.stringify({ _default: LEGAL_DEFAULT_LOCALE, translations }, null, 2)}\n`,
  );
  process.stderr.write(`refresh legal ids ok: locales=${locales.length}, ids=${ids.length}\n`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
