// scripts/normalize-semantic-file-names.mjs
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';

const CHECK_MODE = '--check';
const WRITE_MODE = '--write';
const HELP_MODE = '--help';
const MODE_VALUES = new Set([CHECK_MODE, WRITE_MODE]);
const ROOT_DIR = process.cwd();
const PUBLIC_VISUAL_ROOT = 'public/assets/visual/';
const PUBLIC_AUDIO_ROOT = 'public/assets/audio/';
const CODEX_THEME_ROOT = 'docs/assets/theme-planning/';
const CODEX_ISSUES_ROOT = 'docs/assets/issues/';
const CODEX_EVIDENCE_SEGMENTS = new Set(['evidence', 'orientation']);
const CHECK_REPORT_PATH = 'tmp/reports/semantic-file-names-check-report.json';
const VERSIONED_REPORT_PATH = 'docs/assets/issues/semantic-file-names/evidence/evi-semantic-file-names-check-report.json';
const VERSIONED_RENAME_MAP_PATH = 'docs/assets/issues/semantic-file-names/evidence/evi-semantic-file-names-rename-map.json';
const MIN_STEM_LENGTH = 12;
const MAX_STEM_LENGTH = 64;
const ISSUE_KEY_MAX_LENGTH = 30;
const HASH_LENGTH = 6;
const HASH_SEPARATOR_LENGTH = 1;
const PATH_SEPARATOR = '/';
const JSON_SPACE = 2;
const EMPTY_LINE = '\n';
const TEXT_FILE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdc',
  '.mjs',
  '.ts',
  '.tsx',
  '.txt',
  '.webmanifest',
  '.yml',
  '.yaml',
]);
const EVIDENCE_EXTENSIONS = new Set(['.json', '.png', '.jpg', '.jpeg', '.webp', '.svg']);
const TEXT_EVIDENCE_EXTENSIONS_TO_JSON = new Set(['.md', '.txt']);
const JSON_EVIDENCE_EXTENSION = '.json';
const RUNTIME_VISUAL_PATTERN = /^(spr|ui|vfx)-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RUNTIME_AUDIO_PATTERN = /^(sfx|bgm)-[a-z0-9]+(?:-[a-z0-9]+)*-[0-9]{2}$/;
const CODEX_THEME_PATTERN = /^codex-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CODEX_EVIDENCE_PATTERN = /^evi-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEBAB_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PREFIX_PATTERNS = [
  /^\d{8}t\d{6}z-+/i,
  /^\d{4}-\d{2}-\d{2}t\d{2}-\d{2}-\d{2}z-+/i,
  /^\d{4}-\d{2}-\d{2}-+/,
  /^\d{8}-+/,
];
const STRIP_PATH_PREFIX_PATTERN = /^public\//;
const GIT_MV_ARGS = ['mv'];

function usage() {
  return [
    'Uso: node scripts/normalize-semantic-file-names.mjs --check',
    'Uso: node scripts/normalize-semantic-file-names.mjs --write',
  ].join(EMPTY_LINE);
}

function fail(message) {
  throw new Error(message);
}

function normalizeSlashes(value) {
  return value.split(/[\\/]+/).join(PATH_SEPARATOR);
}

function pathExists(path) {
  return existsSync(resolve(ROOT_DIR, path));
}

function readText(path) {
  return readFileSync(resolve(ROOT_DIR, path), 'utf8');
}

function writeText(path, content) {
  const absolutePath = resolve(ROOT_DIR, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
}

function writeJson(path, payload) {
  writeText(path, `${JSON.stringify(payload, null, JSON_SPACE)}${EMPTY_LINE}`);
}

function gitKnownFiles() {
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .map(normalizeSlashes)
    .sort();
}

function gitPendingRenames() {
  const status = execFileSync('git', ['status', '--porcelain=v1'], { cwd: ROOT_DIR, encoding: 'utf8' });
  const renames = new Map();
  for (const line of status.split('\n').filter(Boolean)) {
    const match = line.match(/^R. (.+) -> (.+)$/);
    if (match) renames.set(normalizeSlashes(match[1]), normalizeSlashes(match[2]));
  }
  return renames;
}

function fileName(path) {
  return path.split(PATH_SEPARATOR).pop() || path;
}

function fileStem(path) {
  return fileName(path).replace(/\.[^.]+$/, '');
}

function fileExtension(path) {
  return extname(path).toLowerCase();
}

function isFile(path) {
  try {
    return statSync(resolve(ROOT_DIR, path)).isFile();
  } catch {
    return false;
  }
}

function isTextFile(path) {
  return TEXT_FILE_EXTENSIONS.has(fileExtension(path));
}

function slugify(value) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return slug || 'artifact';
}

function stripDatePrefix(value) {
  return DATE_PREFIX_PATTERNS.reduce((result, pattern) => result.replace(pattern, ''), value);
}

function compactSlug(value, maxLength) {
  const slug = slugify(value);
  if (slug.length <= maxLength) return slug;
  const tokens = slug.split('-');
  const selected = [];
  let length = 0;
  for (const token of tokens) {
    const nextLength = length + token.length + (selected.length > 0 ? 1 : 0);
    if (nextLength > maxLength) break;
    selected.push(token);
    length = nextLength;
  }
  if (selected.length > 0) return selected.join('-');
  return slug.slice(0, maxLength).replace(/-+$/g, '') || 'artifact';
}

function hashPath(path) {
  return createHash('sha256').update(path).digest('hex').slice(0, HASH_LENGTH);
}

function ensureStemLength(stem) {
  if (stem.length >= MIN_STEM_LENGTH) return stem;
  return `${stem}-${'asset'.slice(0, MIN_STEM_LENGTH - stem.length - HASH_SEPARATOR_LENGTH)}`;
}

function truncateStemWithHash(stem, hash) {
  const suffix = `-${hash}`;
  const baseMaxLength = MAX_STEM_LENGTH - suffix.length;
  const base = stem.slice(0, baseMaxLength).replace(/-+$/g, '');
  return ensureStemLength(`${base}${suffix}`);
}

function evidenceParts(path) {
  const parts = path.split(PATH_SEPARATOR);
  const rootParts = CODEX_ISSUES_ROOT.split(PATH_SEPARATOR).filter(Boolean);
  const issueIndex = rootParts.length;
  const segmentIndex = issueIndex + 1;
  return {
    issueSlug: parts[issueIndex] || 'issue',
    segment: parts[segmentIndex] || '',
  };
}

function isCodexEvidencePath(path) {
  if (!path.startsWith(CODEX_ISSUES_ROOT)) return false;
  const parts = path.split(PATH_SEPARATOR);
  const rootParts = CODEX_ISSUES_ROOT.split(PATH_SEPARATOR).filter(Boolean);
  const segment = parts[rootParts.length + 1];
  return CODEX_EVIDENCE_SEGMENTS.has(segment);
}

function governedKind(path) {
  if (path.startsWith(PUBLIC_VISUAL_ROOT)) return 'runtime-visual';
  if (path.startsWith(PUBLIC_AUDIO_ROOT)) return 'runtime-audio';
  if (path.startsWith(CODEX_THEME_ROOT)) return 'codex-theme-planning';
  if (isCodexEvidencePath(path)) return 'codex-evidence';
  return null;
}

function governedFiles(files) {
  return files.filter((path) => governedKind(path) && isFile(path));
}

function validateGovernedName(path) {
  const kind = governedKind(path);
  const stem = fileStem(path);
  const extension = fileExtension(path);
  if (!kind) return [];
  const failures = [];
  if (stem.length < MIN_STEM_LENGTH || stem.length > MAX_STEM_LENGTH) {
    failures.push(`${path}: stem deve ter ${MIN_STEM_LENGTH}-${MAX_STEM_LENGTH} caracteres`);
  }
  if (!KEBAB_PATTERN.test(stem)) failures.push(`${path}: stem não está em kebab-case sem caracteres especiais`);
  if (kind === 'runtime-visual' && (extension !== '.svg' || !RUNTIME_VISUAL_PATTERN.test(stem))) {
    failures.push(`${path}: visual runtime deve usar spr/ui/vfx e .svg`);
  }
  if (kind === 'runtime-audio' && (!['.mp3', '.ogg'].includes(extension) || !RUNTIME_AUDIO_PATTERN.test(stem))) {
    failures.push(`${path}: áudio runtime deve usar sfx/bgm, sufixo numérico e .mp3/.ogg`);
  }
  if (kind === 'codex-theme-planning' && (extension !== '.svg' || !CODEX_THEME_PATTERN.test(stem))) {
    failures.push(`${path}: planejamento visual Codex deve usar codex-*.svg`);
  }
  if (kind === 'codex-evidence' && (!EVIDENCE_EXTENSIONS.has(extension) || !CODEX_EVIDENCE_PATTERN.test(stem))) {
    failures.push(`${path}: evidência Codex deve usar evi-* com extensão permitida`);
  }
  return failures;
}

function targetThemePath(path) {
  const stem = fileStem(path);
  const extension = fileExtension(path);
  if (CODEX_THEME_PATTERN.test(stem) && extension === '.svg') return path;
  const targetStem = ensureStemLength(compactSlug(`codex-${stem}`, MAX_STEM_LENGTH));
  return `${dirnamePortable(path)}/${targetStem}${extension}`;
}

function dirnamePortable(path) {
  const index = path.lastIndexOf(PATH_SEPARATOR);
  return index === -1 ? '.' : path.slice(0, index);
}

function targetEvidencePath(path) {
  const extension = fileExtension(path);
  const stem = fileStem(path);
  const targetExtension = TEXT_EVIDENCE_EXTENSIONS_TO_JSON.has(extension) ? JSON_EVIDENCE_EXTENSION : extension;
  const { issueSlug } = evidenceParts(path);
  const issueKey = compactSlug(issueSlug, ISSUE_KEY_MAX_LENGTH);
  const prefix = `evi-${issueKey}`;
  const duplicatedPrefix = `${prefix}-${prefix}`;
  if (
    EVIDENCE_EXTENSIONS.has(extension) &&
    CODEX_EVIDENCE_PATTERN.test(stem) &&
    stem.length >= MIN_STEM_LENGTH &&
    stem.length <= MAX_STEM_LENGTH &&
    !stem.startsWith(duplicatedPrefix)
  ) {
    return path;
  }
  const slugStem = slugify(stem);
  const artifactSourceBase = slugStem.startsWith(`${prefix}-`) ? slugStem.slice(prefix.length + 1) : stripDatePrefix(slugStem);
  const artifactSource = artifactSourceBase.startsWith(`${prefix}-`)
    ? artifactSourceBase.slice(prefix.length + 1)
    : artifactSourceBase;
  const remaining = MAX_STEM_LENGTH - prefix.length - HASH_SEPARATOR_LENGTH;
  const artifactKey = compactSlug(artifactSource, Math.max(MIN_STEM_LENGTH, remaining));
  const targetStem = ensureStemLength(`${prefix}-${artifactKey}`).slice(0, MAX_STEM_LENGTH).replace(/-+$/g, '');
  return `${dirnamePortable(path)}/${targetStem}${targetExtension}`;
}

function initialTargetPath(path) {
  const kind = governedKind(path);
  if (kind === 'codex-theme-planning') return targetThemePath(path);
  if (kind === 'codex-evidence') return targetEvidencePath(path);
  return path;
}

function addHashToPath(path, originalPath) {
  const extension = fileExtension(path);
  const stem = fileStem(path);
  const hashedStem = truncateStemWithHash(stem, hashPath(originalPath));
  return `${dirnamePortable(path)}/${hashedStem}${extension}`;
}

function buildRenameMap(files) {
  const candidates = new Map();
  for (const path of files) candidates.set(path, initialTargetPath(path));

  const occupiedFileNames = new Map();
  const occupiedStems = new Map();
  const result = new Map();
  for (const path of files.sort()) {
    let target = candidates.get(path);
    const unchanged = target === path;
    const originalFileName = fileName(path);
    const originalStem = fileStem(path);
    let targetFileName = fileName(target);
    let targetStem = fileStem(target);
    const fileNameOwner = occupiedFileNames.get(targetFileName);
    const stemOwner = occupiedStems.get(targetStem);
    const collides = (fileNameOwner && fileNameOwner !== path) || (stemOwner && stemOwner !== path);
    const needsHash = collides || (!unchanged && (targetFileName === originalFileName || targetStem === originalStem));
    if (needsHash && !unchanged) target = addHashToPath(target, path);
    targetFileName = fileName(target);
    targetStem = fileStem(target);
    while (
      (occupiedFileNames.has(targetFileName) && occupiedFileNames.get(targetFileName) !== path) ||
      (occupiedStems.has(targetStem) && occupiedStems.get(targetStem) !== path)
    ) {
      target = addHashToPath(target, `${path}:${target}`);
      targetFileName = fileName(target);
      targetStem = fileStem(target);
    }
    occupiedFileNames.set(targetFileName, path);
    occupiedStems.set(targetStem, path);
    if (target !== path) result.set(path, target);
  }
  return result;
}

function validateUniqueness(files) {
  const failures = [];
  const names = new Map();
  const stems = new Map();
  for (const path of files) {
    const name = fileName(path);
    const stem = fileStem(path);
    const nameOwner = names.get(name);
    const stemOwner = stems.get(stem);
    if (nameOwner && nameOwner !== path) failures.push(`basename duplicado: ${name} em ${nameOwner} e ${path}`);
    if (stemOwner && stemOwner !== path) failures.push(`stem duplicado: ${stem} em ${stemOwner} e ${path}`);
    names.set(name, path);
    stems.set(stem, path);
  }
  return failures;
}

function scanFailures(files) {
  const failures = [];
  for (const path of files) failures.push(...validateGovernedName(path));
  failures.push(...validateUniqueness(files));
  return failures;
}

function textFiles(files) {
  return files.filter((path) => isFile(path) && isTextFile(path));
}

function replaceAllLiteral(source, search, replacement) {
  return source.split(search).join(replacement);
}

function updateReferences(files, renames) {
  const textFilePaths = textFiles(files);
  const groupedByDirectory = new Map();
  for (const [oldPath, newPath] of renames) {
    const dir = dirnamePortable(oldPath);
    if (!groupedByDirectory.has(dir)) groupedByDirectory.set(dir, []);
    groupedByDirectory.get(dir).push([oldPath, newPath]);
  }

  const changed = [];
  for (const path of textFilePaths) {
    let source = readText(path);
    let next = source;
    for (const [oldPath, newPath] of renames) {
      next = replaceAllLiteral(next, oldPath, newPath);
      next = replaceAllLiteral(next, oldPath.replace(STRIP_PATH_PREFIX_PATTERN, ''), newPath.replace(STRIP_PATH_PREFIX_PATTERN, ''));
    }
    const sameDirectoryRenames = groupedByDirectory.get(dirnamePortable(path)) || [];
    for (const [oldPath, newPath] of sameDirectoryRenames) {
      next = replaceAllLiteral(next, fileName(oldPath), fileName(newPath));
    }
    if (next !== source) {
      writeText(path, next);
      changed.push(path);
    }
  }
  return changed;
}

function safeGitMv(oldPath, newPath) {
  const absoluteTarget = resolve(ROOT_DIR, newPath);
  mkdirSync(dirname(absoluteTarget), { recursive: true });
  if (pathExists(newPath)) fail(`Destino já existe: ${newPath}`);
  try {
    execFileSync('git', [...GIT_MV_ARGS, oldPath, newPath], { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch {
    renameSync(resolve(ROOT_DIR, oldPath), absoluteTarget);
  }
}

function applyRenames(renames) {
  const orderedRenames = [...renames.entries()].sort((left, right) => right[0].length - left[0].length);
  for (const [oldPath, newPath] of orderedRenames) safeGitMv(oldPath, newPath);
}

function convertTextEvidenceToJson(renames) {
  for (const [oldPath, newPath] of renames) {
    const oldExtension = fileExtension(oldPath);
    if (!TEXT_EVIDENCE_EXTENSIONS_TO_JSON.has(oldExtension)) continue;
    if (fileExtension(newPath) !== JSON_EVIDENCE_EXTENSION) continue;
    if (governedKind(newPath) !== 'codex-evidence') continue;
    const content = readText(newPath).replace(/\r\n/g, '\n').split('\n');
    writeJson(newPath, {
      kind: oldExtension === '.md' ? 'markdown-evidence' : 'text-evidence',
      legacyFormat: oldExtension.slice(1),
      normalizedTo: newPath,
      content,
    });
  }
}

function buildReport(mode, files, failures, renames, changedReferences) {
  return {
    ok: failures.length === 0,
    mode: mode.replace(/^--/, ''),
    governedFileCount: files.length,
    failureCount: failures.length,
    renameCount: renames.size,
    changedReferenceCount: changedReferences.length,
    failures,
    renames: [...renames.entries()].map(([from, to]) => ({ from, to })),
    changedReferences,
  };
}

function runCheck(mode, files, reportPath, renames = new Map(), changedReferences = []) {
  const failures = scanFailures(files);
  const report = buildReport(mode, files, failures, renames, changedReferences);
  writeJson(reportPath, report);
  if (failures.length > 0) fail(`Nomes semânticos inválidos: ${failures.length} falhas. Relatório: ${reportPath}`);
  return report;
}

function runWrite(files) {
  const renames = buildRenameMap(files);
  applyRenames(renames);
  const knownAfterRenames = gitKnownFiles();
  const changedReferences = updateReferences(knownAfterRenames, renames);
  convertTextEvidenceToJson(renames);
  const filesAfterReferences = governedFiles(gitKnownFiles());
  const cumulativeRenames = gitPendingRenames();
  const report = runCheck(WRITE_MODE, filesAfterReferences, VERSIONED_REPORT_PATH, cumulativeRenames, changedReferences);
  const renameMap = {
    ok: true,
    governedFileCount: filesAfterReferences.length,
    renameCount: cumulativeRenames.size,
    renames: report.renames,
  };
  writeJson(VERSIONED_RENAME_MAP_PATH, renameMap);
  return { report, renameMap };
}

function main() {
  const mode = process.argv[2];
  if (mode === HELP_MODE || !MODE_VALUES.has(mode)) {
    console.log(usage());
    process.exit(mode === HELP_MODE ? 0 : 2);
  }
  const files = governedFiles(gitKnownFiles());
  if (mode === CHECK_MODE) {
    const report = runCheck(mode, files, process.env.BRICKBREAKER_SEMANTIC_NAMES_REPORT || CHECK_REPORT_PATH);
    console.log(`semantic-file-names ok: governed=${report.governedFileCount}`);
    return;
  }
  const { report, renameMap } = runWrite(files);
  console.log(`semantic-file-names normalized: governed=${report.governedFileCount} renames=${renameMap.renameCount}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
