// scripts/validate-audio-assets.mjs
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const AUDIO_DOC_PATH = 'docs/audio.md';
const AUDIO_ASSETS_DOC_PATH = 'docs/audio-assets.md';
const AUDIO_CONSTANTS_PATH = 'src/constants/audio.ts';
const SERVICE_WORKER_PATH = 'public/sw.js';
const AUDIO_DIR = 'public/assets/audio';
const EXPECTED_AUDIO_ID_COUNT = 38;
const SILENT_AUDIO_ID = 'sfx_ad_placeholder_none';
const MP3_EXTENSION = '.mp3';
const AUDIO_FILE_PATTERN = /^(.*)-\d{2}\.mp3$/;
const DURATION_TOLERANCE_SECONDS = 0.08;
const HTTPS_URL_PATTERN = /https?:\/\//;
const AUDIO_EVENT_IDS_PATTERN = /export const AUDIO_EVENT_IDS = (\[[\s\S]*?\]) as const;/;
const MARKDOWN_ROW_AUDIO_ID_PATTERN = /^\| `([^`]+)` \|/gm;
const LICENSE_ACCEPT_PATTERN = /(CC0|Public Domain|Silêncio lógico)/i;
const RUNTIME_AUDIO_PATH_PREFIX = '/assets/audio/';
const RUNTIME_AUDIO_DOC_PREFIX = 'public/assets/audio/';

function fail(message) {
  throw new Error(message);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function parseCatalogIds(markdown) {
  return [...markdown.matchAll(MARKDOWN_ROW_AUDIO_ID_PATTERN)].map(match => match[1]);
}

function parseAudioEventIds(source) {
  const match = source.match(AUDIO_EVENT_IDS_PATTERN);
  if (!match) fail('AUDIO_EVENT_IDS não encontrado em src/constants/audio.ts');
  return JSON.parse(match[1]);
}

function parseTargetMaxSeconds(markdown) {
  const result = new Map();
  for (const line of markdown.split('\n')) {
    const match = line.match(MARKDOWN_ROW_AUDIO_ID_PATTERN);
    if (!match) continue;
    const cells = line.split('|').slice(2, -1).map(cell => cell.trim());
    const durationCell = cells[6] || '';
    const values = [];
    for (const secondsMatch of durationCell.matchAll(/(\d+(?:[.,]\d+)?)\s*s\b/g)) {
      values.push(Number(secondsMatch[1].replace(',', '.')));
    }
    for (const millisecondsMatch of durationCell.matchAll(/(\d+(?:[.,]\d+)?)\s*ms\b/g)) {
      values.push(Number(millisecondsMatch[1].replace(',', '.')) / 1000);
    }
    if (values.length > 0) {
      result.set(match[1], Math.max(...values));
    }
  }
  return result;
}

function getDurationSeconds(path) {
  return Number(execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    path,
  ], { encoding: 'utf8' }).trim());
}

function getSha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function groupAudioFiles() {
  const groups = new Map();
  for (const fileName of readdirSync(AUDIO_DIR)) {
    if (!fileName.endsWith(MP3_EXTENSION)) continue;
    const match = fileName.match(AUDIO_FILE_PATTERN);
    if (!match) fail(`Nome de áudio fora do padrão: ${fileName}`);
    const audioId = match[1];
    if (!groups.has(audioId)) groups.set(audioId, []);
    groups.get(audioId).push(`${AUDIO_DIR}/${fileName}`);
  }
  return groups;
}

function validateAudioAssetsDoc(markdown, ids) {
  if (!markdown.startsWith('<!-- docs/audio-assets.md -->')) {
    fail('docs/audio-assets.md sem cabeçalho de caminho');
  }

  for (const id of ids) {
    if (!markdown.includes(`\`${id}\``)) fail(`docs/audio-assets.md não documenta ${id}`);
  }

  for (const line of markdown.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    const licenseCell = cells[3] || '';
    const runtimeCell = cells[5] || '';
    if (!LICENSE_ACCEPT_PATTERN.test(licenseCell)) fail(`Licença não aceita na linha: ${line}`);
    if (!runtimeCell.includes('No-op') && !runtimeCell.includes(RUNTIME_AUDIO_DOC_PREFIX)) {
      fail(`Runtime não local na linha: ${line}`);
    }
  }
}

function validate() {
  if (!existsSync(AUDIO_DOC_PATH)) fail('docs/audio.md ausente');
  if (!existsSync(AUDIO_ASSETS_DOC_PATH)) fail('docs/audio-assets.md ausente');
  if (!existsSync(AUDIO_DIR)) fail('public/assets/audio ausente');

  const audioDoc = read(AUDIO_DOC_PATH);
  const audioAssetsDoc = read(AUDIO_ASSETS_DOC_PATH);
  const constantsSource = read(AUDIO_CONSTANTS_PATH);
  const serviceWorker = read(SERVICE_WORKER_PATH);

  if (!audioDoc.startsWith('<!-- docs/audio.md -->')) fail('docs/audio.md sem cabeçalho de caminho');
  if (HTTPS_URL_PATTERN.test(constantsSource)) fail('src/constants/audio.ts contém URL externa');

  const catalogIds = parseCatalogIds(audioDoc);
  const constantsIds = parseAudioEventIds(constantsSource);
  if (catalogIds.length !== EXPECTED_AUDIO_ID_COUNT) fail(`docs/audio.md tem ${catalogIds.length} IDs, esperado ${EXPECTED_AUDIO_ID_COUNT}`);
  if (constantsIds.length !== EXPECTED_AUDIO_ID_COUNT) fail(`AUDIO_EVENT_IDS tem ${constantsIds.length} IDs, esperado ${EXPECTED_AUDIO_ID_COUNT}`);
  if (JSON.stringify(catalogIds) !== JSON.stringify(constantsIds)) fail('AUDIO_EVENT_IDS diverge de docs/audio.md');

  validateAudioAssetsDoc(audioAssetsDoc, catalogIds);

  const groups = groupAudioFiles();
  const targets = parseTargetMaxSeconds(audioDoc);
  let fileCount = 0;

  for (const id of catalogIds) {
    const files = groups.get(id) || [];
    if (id === SILENT_AUDIO_ID) {
      if (files.length > 0) fail(`${SILENT_AUDIO_ID} não pode ter arquivo de áudio`);
      continue;
    }

    if (files.length === 0) fail(`Sem arquivo runtime para ${id}`);
    for (const filePath of files) {
      fileCount += 1;
      const publicPath = filePath.replace('public', '');
      if (!serviceWorker.includes(publicPath)) fail(`Service worker não precacheia ${publicPath}`);
      if (!publicPath.startsWith(RUNTIME_AUDIO_PATH_PREFIX)) fail(`Caminho runtime externo: ${publicPath}`);
      const durationSeconds = getDurationSeconds(filePath);
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) fail(`Duração inválida: ${filePath}`);
      const targetMax = targets.get(id);
      if (targetMax && durationSeconds > targetMax + DURATION_TOLERANCE_SECONDS) {
        fail(`${filePath} dura ${durationSeconds.toFixed(3)}s, máximo ${targetMax}s`);
      }
      const sha = getSha256(filePath);
      if (!audioAssetsDoc.includes(sha)) fail(`SHA-256 ausente em docs/audio-assets.md: ${filePath}`);
    }
  }

  if (fileCount !== 90) fail(`Total de MP3 ${fileCount}, esperado 90`);
  console.log(`audio-assets ok: ids=${catalogIds.length} mp3=${fileCount}`);
}

validate();
