// scripts/validate-visual-asset-policy.mjs
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const POLICY_PATH = 'docs/assets/visual-runtime/atlas-exceptions.json';
export const REPORT_PATH =
  process.env.BRIKAYA_VISUAL_ASSET_POLICY_REPORT ||
  'tmp/reports/visual-asset-policy-guard.json';
export const VISUAL_RUNTIME_ROOT = 'public/assets/visual';
export const ATLAS_RUNTIME_PREFIX = '/assets/visual/atlases/';
export const CINEMATIC_RUNTIME_PREFIX = '/assets/visual/cinematics/';
export const SOURCE_SCAN_ENTRIES = [
  'src',
  'public/sw.js',
  'public/manifest.webmanifest',
  'index.html',
];
export const POLICY_TEXT_FILES = ['AGENTS.md', '.cursor/rules/all.mdc'];
export const ALLOWED_REASONS = new Set([
  'heavy-animation',
  'many-draws',
  'profiled-faster',
  'cinematic-background',
]);

const ALLOWED_ATLAS_EXTENSIONS = new Set(['.png', '.webp']);
const ALLOWED_CINEMATIC_EXTENSIONS = new Set(['.png', '.webp', '.avif']);
const BLOCKED_VISUAL_RASTER_EXTENSIONS = new Set([
  '.png',
  '.webp',
  '.avif',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
]);
const RUNTIME_VISUAL_RASTER_REFERENCE_PATTERN =
  /['"`]((?:\/assets\/visual\/)[^'"`\s)]+\.(?:png|webp|avif|jpe?g|gif|ico))['"`]/gi;
const PUBLIC_VISUAL_RASTER_REFERENCE_PATTERN =
  /['"`]((?:public\/assets\/visual\/)[^'"`\s)]+\.(?:png|webp|avif|jpe?g|gif|ico))['"`]/gi;
const SVG_EXTENSION = '.svg';
const POLICY_REQUIRED_SNIPPETS = [
  'SVG-first authoring',
  'atlas PNG/WebP',
  'AVIF',
  'public/assets/visual/cinematics',
];

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  reportPath: REPORT_PATH,
  policyPath: POLICY_PATH,
  checks: [],
};

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function writeReport() {
  ensureParentDirectory(REPORT_PATH);
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function fail(message) {
  throw new Error(message);
}

function addCheck(name, failures, metadata = {}) {
  const check = {
    name,
    ok: failures.length === 0,
    failures,
    ...metadata,
  };
  report.checks.push(check);
  if (failures.length > 0) {
    fail(`${name}: ${failures.join('; ')}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function collectFiles(path) {
  if (!existsSync(path)) return [];
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path)
    .flatMap((entry) => collectFiles(join(path, entry)))
    .sort();
}

export function runtimePathFromPublicPath(path) {
  const normalized = path.replaceAll('\\', '/');
  if (normalized.startsWith('/assets/')) return normalized;
  if (normalized.startsWith('public/')) {
    return `/${normalized.slice('public/'.length)}`;
  }
  return `/${relative(process.cwd(), resolve(path)).replaceAll('\\', '/').replace(/^public\//, '')}`;
}

function isKebabId(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isStringArray(value) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0)
  );
}

export function validateAtlasExceptionDocument(policy, options = {}) {
  const exists = options.exists || existsSync;
  const failures = [];

  if (!policy || typeof policy !== 'object') {
    return ['atlas-exceptions.json deve conter objeto JSON'];
  }
  if (policy.version !== 1) failures.push('version deve ser 1');
  if (policy.policy !== 'svg-first-runtime-atlas-exceptions') {
    failures.push('policy deve ser svg-first-runtime-atlas-exceptions');
  }

  const thresholds = policy.thresholds;
  if (!thresholds || typeof thresholds !== 'object') {
    failures.push('thresholds ausente');
  } else {
    if (thresholds.heavyAnimationFrameCount !== 8) {
      failures.push('thresholds.heavyAnimationFrameCount deve ser 8');
    }
    if (thresholds.manyDrawsPerFrame !== 100) {
      failures.push('thresholds.manyDrawsPerFrame deve ser 100');
    }
    if (thresholds.requiresProfiledP95Improvement !== true) {
      failures.push('thresholds.requiresProfiledP95Improvement deve ser true');
    }
  }

  if (!Array.isArray(policy.exceptions)) {
    failures.push('exceptions deve ser array');
    return failures;
  }

  const seenIds = new Set();
  for (const exception of policy.exceptions) {
    if (!exception || typeof exception !== 'object') {
      failures.push('exception inválida');
      continue;
    }
    if (!isKebabId(exception.id)) failures.push(`id inválido: ${exception.id}`);
    if (seenIds.has(exception.id)) failures.push(`id duplicado: ${exception.id}`);
    seenIds.add(exception.id);

    if (!['atlas', 'cinematic'].includes(exception.kind)) {
      failures.push(`${exception.id}: kind inválido`);
    }
    if (!isStringArray(exception.runtimePaths)) {
      failures.push(`${exception.id}: runtimePaths inválido`);
    }
    if (!isStringArray(exception.sourceSvgPaths)) {
      failures.push(`${exception.id}: sourceSvgPaths inválido`);
    }
    if (!ALLOWED_REASONS.has(exception.reason)) {
      failures.push(`${exception.id}: reason inválido`);
    }
    if (typeof exception.evidencePath !== 'string' || !exception.evidencePath) {
      failures.push(`${exception.id}: evidencePath ausente`);
    }
    if (typeof exception.evidencePath === 'string' && !exists(exception.evidencePath)) {
      failures.push(`${exception.id}: evidencePath não existe: ${exception.evidencePath}`);
    }

    for (const runtimePath of exception.runtimePaths ?? []) {
      if (exception.kind === 'atlas' && !runtimePath.startsWith(ATLAS_RUNTIME_PREFIX)) {
        failures.push(`${exception.id}: atlas fora de ${ATLAS_RUNTIME_PREFIX}`);
      }
      if (exception.kind === 'cinematic' && !runtimePath.startsWith(CINEMATIC_RUNTIME_PREFIX)) {
        failures.push(`${exception.id}: cinemática fora de ${CINEMATIC_RUNTIME_PREFIX}`);
      }
      const publicPath = `public${runtimePath}`;
      if (!exists(publicPath)) {
        failures.push(`${exception.id}: runtimePath ausente: ${publicPath}`);
      }
    }

    for (const sourcePath of exception.sourceSvgPaths ?? []) {
      if (!sourcePath.startsWith('/assets/visual/') || !sourcePath.endsWith('.svg')) {
        failures.push(`${exception.id}: sourceSvgPaths deve apontar para SVG runtime`);
      }
      const publicPath = `public${sourcePath}`;
      if (!exists(publicPath)) {
        failures.push(`${exception.id}: sourceSvgPath ausente: ${publicPath}`);
      }
    }

    if (exception.kind === 'atlas' && exception.reason === 'cinematic-background') {
      failures.push(`${exception.id}: atlas não pode usar reason cinematic-background`);
    }
    if (exception.kind === 'cinematic' && exception.reason !== 'cinematic-background') {
      failures.push(`${exception.id}: cinemática deve usar reason cinematic-background`);
    }
  }

  return failures;
}

function loadGovernedRuntimePaths(policy) {
  const governed = new Set();
  for (const exception of policy.exceptions ?? []) {
    for (const runtimePath of exception.runtimePaths ?? []) {
      governed.add(runtimePath);
    }
  }
  return governed;
}

function validateVisualRuntimeRasterFiles(policy) {
  const failures = [];
  const governedRuntimePaths = loadGovernedRuntimePaths(policy);
  const visualFiles = collectFiles(VISUAL_RUNTIME_ROOT);

  for (const file of visualFiles) {
    const extension = extname(file).toLowerCase();
    if (!BLOCKED_VISUAL_RASTER_EXTENSIONS.has(extension)) continue;

    const runtimePath = runtimePathFromPublicPath(file);
    const normalized = file.replaceAll('\\', '/');

    if (normalized.includes('/atlases/')) {
      if (!ALLOWED_ATLAS_EXTENSIONS.has(extension)) {
        failures.push(`${file}: atlas deve usar PNG ou WebP, não ${extension}`);
      }
      if (!governedRuntimePaths.has(runtimePath)) {
        failures.push(`${file}: atlas raster sem exceção governada`);
      }
      continue;
    }

    if (normalized.includes('/cinematics/')) {
      if (!ALLOWED_CINEMATIC_EXTENSIONS.has(extension)) {
        failures.push(`${file}: cinemática deve usar PNG, WebP ou AVIF`);
      }
      if (!governedRuntimePaths.has(runtimePath)) {
        failures.push(`${file}: cinemática raster sem exceção governada`);
      }
      continue;
    }

    failures.push(`${file}: raster visual fora de atlases/ ou cinematics/ governados`);
  }

  return failures;
}

function validateRuntimeRasterReferences(policy) {
  const failures = [];
  const governedRuntimePaths = loadGovernedRuntimePaths(policy);
  const scannedFiles = SOURCE_SCAN_ENTRIES.flatMap((entry) => collectFiles(entry));

  for (const sourceFile of scannedFiles) {
    const source = readFileSync(sourceFile, 'utf8');
    const matches = [
      ...source.matchAll(RUNTIME_VISUAL_RASTER_REFERENCE_PATTERN),
      ...source.matchAll(PUBLIC_VISUAL_RASTER_REFERENCE_PATTERN),
    ];

    for (const match of matches) {
      const runtimePath = match[1].startsWith('public/')
        ? runtimePathFromPublicPath(match[1])
        : match[1];

      if (runtimePath.includes('/atlases/') || runtimePath.includes('/cinematics/')) {
        if (!governedRuntimePaths.has(runtimePath)) {
          failures.push(`${sourceFile} referencia ${runtimePath} sem exceção governada`);
        }
        continue;
      }

      failures.push(`${sourceFile} referencia raster visual proibido: ${runtimePath}`);
    }
  }

  return { failures, scannedFiles: scannedFiles.length };
}

function validateAvifSpriteReferences() {
  const failures = [];
  const avifPattern =
    /['"`]((?:\/assets\/visual\/|public\/assets\/visual\/)(?!cinematics\/)[^'"`\s)]+\.avif)['"`]/gi;
  const scannedFiles = SOURCE_SCAN_ENTRIES.flatMap((entry) => collectFiles(entry));

  for (const sourceFile of scannedFiles) {
    const source = readFileSync(sourceFile, 'utf8');
    for (const match of source.matchAll(avifPattern)) {
      failures.push(`${sourceFile} referencia AVIF como sprite/runtime: ${match[1]}`);
    }
  }

  return failures;
}

function validatePolicyTextFiles() {
  const failures = [];
  for (const file of POLICY_TEXT_FILES) {
    if (!existsSync(file)) {
      failures.push(`${file} ausente`);
      continue;
    }
    const source = readFileSync(file, 'utf8');
    for (const snippet of POLICY_REQUIRED_SNIPPETS) {
      if (!source.includes(snippet)) {
        failures.push(`${file} não contém "${snippet}"`);
      }
    }
  }
  return failures;
}

function validateSvgOnlyDirectories() {
  const failures = [];
  const allowedRasterDirs = ['atlases', 'cinematics'];
  const visualFiles = collectFiles(VISUAL_RUNTIME_ROOT);

  for (const file of visualFiles) {
    const extension = extname(file).toLowerCase();
    if (extension === SVG_EXTENSION) continue;
    const normalized = file.replaceAll('\\', '/');
    const isAllowedDir = allowedRasterDirs.some((dir) => normalized.includes(`/${dir}/`));
    if (!isAllowedDir) {
      failures.push(`${file}: diretório visual runtime deve conter apenas SVG`);
    }
  }

  return failures;
}

function runVisualAssetPolicyGuard() {
  try {
    if (!existsSync(POLICY_PATH)) fail(`${POLICY_PATH} ausente`);

    const policy = readJson(POLICY_PATH);
    addCheck('atlas-exceptions.json é válido', validateAtlasExceptionDocument(policy));
    addCheck('política documentada em AGENTS/rules', validatePolicyTextFiles());
    addCheck(
      'raster visual governado só em atlases/cinematics',
      validateVisualRuntimeRasterFiles(policy),
    );
    addCheck('diretórios runtime simples permanecem SVG-only', validateSvgOnlyDirectories());

    const referenceResult = validateRuntimeRasterReferences(policy);
    addCheck('referências runtime respeitam exceções governadas', referenceResult.failures, {
      scannedFiles: referenceResult.scannedFiles,
    });

    addCheck('AVIF não é usado como sprite/atlas', validateAvifSpriteReferences());

    report.ok = true;
    writeReport();
    console.log(`visual-asset-policy ok: report=${REPORT_PATH}`);
  } catch (error) {
    report.error = error.message;
    writeReport();
    console.error(error);
    process.exit(1);
  }
}

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  runVisualAssetPolicyGuard();
}
