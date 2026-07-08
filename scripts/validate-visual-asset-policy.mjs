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
export const REPORT_PATH = process.env.BRIKAYA_VISUAL_ASSET_POLICY_REPORT || 'tmp/reports/visual-asset-policy-guard.json';
export const VISUAL_RUNTIME_ROOT = 'public/assets/visual';
export const ATLAS_RUNTIME_PREFIX = '/assets/visual/atlases/';
export const CINEMATIC_RUNTIME_PREFIX = '/assets/visual/cinematics/';
export const SOURCE_SCAN_ENTRIES = ['src', 'public/sw.js', 'public/manifest.webmanifest', 'index.html'];
export const POLICY_TEXT_FILES = ['AGENTS.md', '.cursor/rules/all.mdc'];
export const ALLOWED_REASONS = new Set([
  'heavy-animation',
  'many-draws',
  'profiled-faster',
  'cinematic-background',
]);

const ALLOWED_ATLAS_EXTENSIONS = new Set(['.png', '.webp']);
const ALLOWED_CINEMATIC_EXTENSIONS = new Set(['.png', '.webp', '.avif']);
const BLOCKED_VISUAL_RASTER_EXTENSIONS = new Set(['.png', '.webp', '.avif', '.jpg', '.jpeg', '.gif', '.ico']);
const RUNTIME_VISUAL_RASTER_REFERENCE_PATTERN = /['"`]((?:\/assets\/visual\/)[^'"`\s)]+\.(?:png|webp|avif|jpe?g|gif|ico))['"`]/gi;
const PUBLIC_VISUAL_RASTER_REFERENCE_PATTERN = /['"`]((?:public\/assets\/visual\/)[^'"`\s)]+\.(?:png|webp|avif|jpe?g|gif|ico))['"`]/gi;
const SVG_EXTENSION = '.svg';
const POLICY_REQUIRED_SNIPPETS = [
  'SVG-first authoring',
  'atlas PNG/WebP',
  'AVIF',
  'public/assets/visual/cinematics',
];

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
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
  if (normalized.startsWith('public/')) return `/${normalized.slice('public/'.length)}`;
  return `/${relative(process.cwd(), resolve(path)).replaceAll('\\', '/').replace(/^public\//, '')}`;
}

function isKebabId(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0);
}

export function validateAtlasExceptionDocument(policy, options = {}) {
  const exists = options.exists || existsSync;
  const failures = [];

  if (!policy || typeof policy !== 'object') return ['atlas-exceptions.json deve conter objeto JSON'];
  if (policy.version !== 1) failures.push('version deve ser 1');
  if (policy.policy !== 'svg-first-runtime-atlas-exceptions') {
    failures.push('policy deve ser svg-first-runtime-atlas-exceptions');
  }
  if (!policy.thresholds || typeof policy.thresholds !== 'object') {
    failures.push('thresholds ausente');
  } else {
    if (policy.thresholds.heavyAnimationFrameCount !== 8) {
      failures.push('thresholds.heavyAnimationFrameCount deve ser 8');
    }
    if (policy.thresholds.manyDrawsPerFrame !== 100) {
      failures.push('thresholds.manyDrawsPerFrame deve ser 100');
    }
    if (policy.thresholds.requiresProfiledP95Improvement !== true) {
      failures.push('thresholds.requiresProfiledP95Improvement deve ser true');
    }
  }
  if (!Array.isArray(policy.exceptions)) {
    failures.push('exceptions deve ser array');
    return failures;
  }

  const seenIds = new Set();
  const seenRuntimePaths = new Set();

  for (const [index, exception] of policy.exceptions.entries()) {
    const prefix = `exceptions[${index}]`;
    if (!exception || typeof exception !== 'object') {
      failures.push(`${prefix} deve ser objeto`);
      continue;
    }
    if (!isKebabId(exception.id)) failures.push(`${prefix}.id deve ser kebab-case`);
    if (seenIds.has(exception.id)) failures.push(`${prefix}.id duplicado: ${exception.id}`);
    seenIds.add(exception.id);

    if (!['atlas', 'cinematic'].includes(exception.kind)) {
      failures.push(`${prefix}.kind deve ser atlas ou cinematic`);
    }
    if (!isStringArray(exception.runtimePaths) || exception.runtimePaths.length === 0) {
      failures.push(`${prefix}.runtimePaths deve ser array não vazio`);
    }
    if (!isStringArray(exception.sourceSvgPaths) || exception.sourceSvgPaths.length === 0) {
      failures.push(`${prefix}.sourceSvgPaths deve ser array não vazio`);
    }
    if (!ALLOWED_REASONS.has(exception.reason)) {
      failures.push(`${prefix}.reason inválido: ${exception.reason}`);
    }
    if (typeof exception.evidencePath !== 'string' || exception.evidencePath.length === 0) {
      failures.push(`${prefix}.evidencePath deve ser string não vazia`);
    } else if (!exists(exception.evidencePath)) {
      failures.push(`${prefix}.evidencePath ausente: ${exception.evidencePath}`);
    }

    for (const runtimePath of exception.runtimePaths || []) {
      const extension = extname(runtimePath).toLowerCase();
      if (seenRuntimePaths.has(runtimePath)) failures.push(`${prefix}.runtimePaths duplicado: ${runtimePath}`);
      seenRuntimePaths.add(runtimePath);

      if (exception.kind === 'atlas') {
        if (!runtimePath.startsWith(ATLAS_RUNTIME_PREFIX)) {
          failures.push(`${prefix}.runtimePath de atlas deve estar em ${ATLAS_RUNTIME_PREFIX}: ${runtimePath}`);
        }
        if (extension === '.avif') failures.push(`${prefix}: AVIF não pode ser atlas: ${runtimePath}`);
        if (!ALLOWED_ATLAS_EXTENSIONS.has(extension)) {
          failures.push(`${prefix}.runtimePath de atlas deve usar PNG/WebP: ${runtimePath}`);
        }
        if (exception.reason === 'cinematic-background') {
          failures.push(`${prefix}.reason cinematic-background não pode justificar atlas`);
        }
      }

      if (exception.kind === 'cinematic') {
        if (!runtimePath.startsWith(CINEMATIC_RUNTIME_PREFIX)) {
          failures.push(`${prefix}.runtimePath cinematic deve estar em ${CINEMATIC_RUNTIME_PREFIX}: ${runtimePath}`);
        }
        if (!ALLOWED_CINEMATIC_EXTENSIONS.has(extension)) {
          failures.push(`${prefix}.runtimePath cinematic deve usar PNG/WebP/AVIF: ${runtimePath}`);
        }
        if (exception.reason !== 'cinematic-background') {
          failures.push(`${prefix}.reason cinematic deve ser cinematic-background`);
        }
      }
    }

    for (const sourceSvgPath of exception.sourceSvgPaths || []) {
      if (extname(sourceSvgPath).toLowerCase() !== SVG_EXTENSION) {
        failures.push(`${prefix}.sourceSvgPaths deve apontar SVG: ${sourceSvgPath}`);
      }
      if (!exists(sourceSvgPath)) failures.push(`${prefix}.sourceSvgPath ausente: ${sourceSvgPath}`);
    }
  }

  return failures;
}

export function allowedRuntimeRasterPaths(policy) {
  const paths = new Set();
  if (!policy || !Array.isArray(policy.exceptions)) return paths;
  for (const exception of policy.exceptions) {
    for (const runtimePath of exception.runtimePaths || []) paths.add(runtimePath);
  }
  return paths;
}

export function findInvalidRuntimeVisualFiles(files, policy) {
  const failures = [];
  const allowed = allowedRuntimeRasterPaths(policy);
  for (const filePath of files) {
    const extension = extname(filePath).toLowerCase();
    if (!BLOCKED_VISUAL_RASTER_EXTENSIONS.has(extension)) continue;
    const runtimePath = runtimePathFromPublicPath(filePath);
    if (!allowed.has(runtimePath)) {
      failures.push(`${filePath}: raster visual não governado por ${POLICY_PATH}`);
      continue;
    }
    if (extension === '.avif' && !runtimePath.startsWith(CINEMATIC_RUNTIME_PREFIX)) {
      failures.push(`${filePath}: AVIF só é permitido em ${CINEMATIC_RUNTIME_PREFIX}`);
    }
    if ((extension === '.png' || extension === '.webp') && !runtimePath.startsWith(ATLAS_RUNTIME_PREFIX) && !runtimePath.startsWith(CINEMATIC_RUNTIME_PREFIX)) {
      failures.push(`${filePath}: PNG/WebP runtime só é permitido em atlas/cinematics governados`);
    }
  }
  return failures;
}

function extractRuntimeRasterReferences(source) {
  const references = [];
  for (const match of source.matchAll(RUNTIME_VISUAL_RASTER_REFERENCE_PATTERN)) references.push(match[1]);
  for (const match of source.matchAll(PUBLIC_VISUAL_RASTER_REFERENCE_PATTERN)) references.push(runtimePathFromPublicPath(match[1]));
  return references;
}

export function findInvalidRuntimeVisualReferences(sourceFiles, policy) {
  const failures = [];
  const allowed = allowedRuntimeRasterPaths(policy);
  for (const sourceFile of sourceFiles) {
    for (const runtimePath of extractRuntimeRasterReferences(sourceFile.source)) {
      const extension = extname(runtimePath).toLowerCase();
      if (extension === '.avif' && !runtimePath.startsWith(CINEMATIC_RUNTIME_PREFIX)) {
        failures.push(`${sourceFile.filePath}: AVIF não pode ser sprite/atlas/runtime 60 FPS: ${runtimePath}`);
        continue;
      }
      if (!allowed.has(runtimePath)) {
        failures.push(`${sourceFile.filePath}: referência raster visual sem exceção: ${runtimePath}`);
      }
    }
  }
  return failures;
}

export function validatePolicyText(policyTexts) {
  const failures = [];
  for (const filePath of POLICY_TEXT_FILES) {
    const source = policyTexts[filePath] || '';
    for (const snippet of POLICY_REQUIRED_SNIPPETS) {
      if (!source.includes(snippet)) failures.push(`${filePath} não contém política: ${snippet}`);
    }
  }
  return failures;
}

export function loadVisualAssetPolicy(path = POLICY_PATH) {
  return readJson(path);
}

function readSourceFiles(entries) {
  return entries.flatMap((entry) => collectFiles(entry)).map((filePath) => ({
    filePath,
    source: readFileSync(filePath, 'utf8'),
  }));
}

function addCheck(report, name, failures, metadata = {}) {
  const check = { name, ok: failures.length === 0, failures, ...metadata };
  report.checks.push(check);
  if (failures.length > 0) throw new Error(`${name}: ${failures.join('; ')}`);
}

function writeReport(report) {
  ensureParentDirectory(REPORT_PATH);
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

export function validateVisualAssetPolicy(options = {}) {
  const policyPath = options.policyPath || POLICY_PATH;
  const visualRoot = options.visualRoot || VISUAL_RUNTIME_ROOT;
  const report = {
    ok: false,
    checkedAt: new Date().toISOString(),
    policyPath,
    reportPath: REPORT_PATH,
    visualRuntimeRoot: visualRoot,
    checks: [],
  };

  try {
    const policy = loadVisualAssetPolicy(policyPath);
    const runtimeFiles = collectFiles(visualRoot);
    const sourceFiles = readSourceFiles(SOURCE_SCAN_ENTRIES);
    const policyTexts = Object.fromEntries(
      POLICY_TEXT_FILES.map((filePath) => [filePath, existsSync(filePath) ? readFileSync(filePath, 'utf8') : '']),
    );

    addCheck(report, 'atlas-exceptions schema válido', validateAtlasExceptionDocument(policy), {
      exceptions: Array.isArray(policy.exceptions) ? policy.exceptions.length : 0,
    });
    addCheck(report, 'arquivos raster runtime são exceções governadas', findInvalidRuntimeVisualFiles(runtimeFiles, policy), {
      scannedFiles: runtimeFiles.length,
      allowedRasterPaths: [...allowedRuntimeRasterPaths(policy)].sort(),
    });
    addCheck(report, 'referências runtime raster são exceções governadas', findInvalidRuntimeVisualReferences(sourceFiles, policy), {
      scannedFiles: sourceFiles.length,
    });
    addCheck(report, 'AGENTS e Cursor declaram política visual', validatePolicyText(policyTexts), {
      policyFiles: POLICY_TEXT_FILES,
    });

    report.ok = true;
    writeReport(report);
    return report;
  } catch (error) {
    report.error = error.message;
    writeReport(report);
    throw error;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  try {
    const report = validateVisualAssetPolicy();
    console.log(`visual-asset-policy ok: checks=${report.checks.length}, report=${REPORT_PATH}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
