// scripts/generate-legal-translations.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LEGAL_DEFAULT_LOCALE, LEGAL_TEXT } from './legal-page-content.mjs';

const GENERATOR_PATH = 'scripts/generate-localized-seo.mjs';
const OUTPUT_PATH = 'scripts/legal-page-translations.json';
const BATCH_SIZE = 12;
const CONCURRENCY = 12;
const RETRIES = 3;
const GOOGLE_TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const PROTECTED_TERMS = [
  ['https://brikaya.com/', 'ZXQBRIKAYAURLXQZ'],
  ['contato@brikaya.com', 'ZXQBRIKAYAEMAILXQZ'],
  ['brikaya.com', 'ZXQBRIKAYADOMAINXQZ'],
  ['Ricardo Malnati', 'ZXQRICARDOMALNATIXQZ'],
  ['Brikaya', 'ZXQBRIKAYAXQZ'],
];

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

function generatorLocales() {
  const source = readFileSync(resolve(process.cwd(), GENERATOR_PATH), 'utf8');
  const match = source.match(/const LOCALES = \[([\s\S]*?)\];/);
  if (!match) throw new Error('LOCALES not found');
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1]);
}

function legalLocaleKey(locale) {
  if (locale === 'zh-CN') return 'zh-Hans';
  if (locale === 'zh-TW' || locale === 'zh-HK') return 'zh-Hant';
  return locale.split('-')[0];
}

function primaryLegalLocales(locales) {
  const preferred = new Map([
    ['pt', 'pt-BR'],
    ['es', 'es-419'],
    ['hi', 'hi-IN'],
    ['zh-Hans', 'zh-CN'],
    ['zh-Hant', 'zh-TW'],
  ]);
  const groups = new Map();
  for (const locale of locales) {
    const key = legalLocaleKey(locale);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(locale);
  }

  return [...groups.entries()]
    .filter(([key]) => key !== 'en')
    .map(([key, values]) => {
      const preferredLocale = preferred.get(key);
      if (preferredLocale && values.includes(preferredLocale)) return preferredLocale;
      return values.find((value) => !value.includes('-')) ?? values[0];
    });
}

function targetFor(locale) {
  return FALLBACK_TARGETS[locale] ?? locale;
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function protectText(value) {
  return PROTECTED_TERMS.reduce((text, [term, token]) => text.replaceAll(term, token), value);
}

function restoreText(value) {
  return PROTECTED_TERMS.reduce((text, [term, token]) => text.replaceAll(token, term), value);
}

function cleanTranslatedValue(id, value) {
  const cleaned = String(value)
    .split(/\n/)[0]
    .replace(/Z{2,3}\d+Z{2,3}/g, '')
    .replace(/З{2,3}\d+З{2,3}/g, '')
    .replace(/__LEGAL_\d+__/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (/rim|atari|ZXQ|XQZ|ЗХК|ХКЗ|БРИКАИА|БРИКАИ|БРИКА|BRIKAYAURL|BRIKAYAEMAIL|RICARDOMALNATI/i.test(cleaned)) {
    return LEGAL_TEXT[id];
  }
  return cleaned || LEGAL_TEXT[id];
}

function parseBatchTranslation(output, ids) {
  const parsed = {};
  const pattern = /ZZZ(\d+)ZZZ\s*([\s\S]*?)(?=ZZZ\d+ZZZ|$)/g;
  for (const match of output.matchAll(pattern)) {
    const batchIndex = Number(match[1]);
    const id = ids[batchIndex];
    if (!id) continue;
    parsed[id] = restoreText(match[2].trim());
  }
  return parsed;
}

async function translateOne(locale, id) {
  const target = targetFor(locale);
  if (target === 'en') return LEGAL_TEXT[id];
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: protectText(LEGAL_TEXT[id]) });
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

async function translateBatch(locale, ids) {
  const target = targetFor(locale);
  if (target === 'en') {
    return Object.fromEntries(ids.map((id) => [id, LEGAL_TEXT[id]]));
  }
  const query = ids.map((id, index) => `ZZZ${index}ZZZ ${protectText(LEGAL_TEXT[id])}`).join('\n');
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: query });
  let parsed = {};
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_ENDPOINT}?${params}`);
      const text = await response.text();
      if (!response.ok) throw new Error(`translate ${locale}/${target} http ${response.status}`);
      const payload = JSON.parse(text);
      const translated = payload?.[0]?.map((part) => part?.[0] ?? '').join('') ?? '';
      parsed = parseBatchTranslation(translated, ids);
      if (Object.keys(parsed).length === ids.length) return parsed;
      break;
    } catch (error) {
      lastError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250 * attempt));
    }
  }

  const fallback = { ...parsed };
  const missing = ids.filter((id) => !fallback[id]);
  for (const id of missing) {
    fallback[id] = await translateOne(locale, id);
  }
  if (Object.keys(fallback).length === ids.length) return fallback;
  throw lastError ?? new Error(`translate ${locale}/${target} parsed ${Object.keys(fallback).length}/${ids.length}`);
}

async function translateLocale(locale, ids) {
  const translated = {};
  for (const batch of chunks(ids, BATCH_SIZE)) {
    Object.assign(translated, await translateBatch(locale, batch));
  }
  return translated;
}

async function run() {
  const ids = Object.keys(LEGAL_TEXT).sort();
  const locales = primaryLegalLocales(generatorLocales());
  const output = {};
  let cursor = 0;
  async function worker() {
    while (cursor < locales.length) {
      const locale = locales[cursor++];
      process.stderr.write(`legal translation ${locale}\n`);
      output[locale] = Object.fromEntries(
        Object.entries(await translateLocale(locale, ids)).map(([id, value]) => [
          id,
          cleanTranslatedValue(id, value),
        ]),
      );
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const sorted = Object.fromEntries(
    Object.entries(output).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(
    resolve(process.cwd(), OUTPUT_PATH),
    `${JSON.stringify({ _default: LEGAL_DEFAULT_LOCALE, translations: sorted }, null, 2)}\n`,
  );
  process.stderr.write(`legal translations ok: locales=${locales.length}, ids=${ids.length}\n`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
