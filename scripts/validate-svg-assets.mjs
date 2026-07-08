// scripts/validate-svg-assets.mjs
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import {
  findInvalidRuntimeVisualFiles,
  loadVisualAssetPolicy,
} from './validate-visual-asset-policy.mjs';

const VISUAL_ASSET_SOURCE_PATH = 'src/constants/visualAssets.ts';
const VISUAL_RUNTIME_ROOT = 'public/assets/visual';
const CODEX_VISUAL_ARTIFACT_ROOT = 'docs/assets/theme-planning';
const REPORT_PATH = process.env.BRIKAYA_SVG_GUARD_REPORT || 'tmp/reports/svg-assets-guard.json';
const ROOT_FAVICON_FILE = 'public/favicon.svg';
const FAVICON_RUNTIME_PATH = '/favicon.svg';
const PWA_ICON_RUNTIME_PATH = '/assets/visual/ui/ui-pwa-app-icon.svg';
const RUNTIME_SVG_PATTERN = /['"`]((?:\/assets\/visual\/)[^'"`]+\.svg)['"`]/g;
const ALLOWED_VISUAL_EXTENSION = '.svg';
const SOURCE_SCAN_ENTRIES = ['src', 'public/sw.js', 'public/manifest.webmanifest', 'index.html'];
const EXPECTED_REFERENCES = {
  'index.html': [FAVICON_RUNTIME_PATH],
  [VISUAL_ASSET_SOURCE_PATH]: [],
  'public/manifest.webmanifest': [PWA_ICON_RUNTIME_PATH],
};
const ASSET_MANIFEST_RUNTIME_PATH = '/asset-cache-manifest.json';
const VISUAL_RUNTIME_PATH_PREFIX = '/assets/visual/';
const AUDIO_RUNTIME_PATH_PREFIX = '/assets/audio/';
const ASSET_CACHE_NAME_TOKEN = 'ASSET_CACHE_NAME';
const SERVICE_WORKER_EXPECTED_REFERENCES = [
  ASSET_MANIFEST_RUNTIME_PATH,
  VISUAL_RUNTIME_PATH_PREFIX,
  AUDIO_RUNTIME_PATH_PREFIX,
  ASSET_CACHE_NAME_TOKEN,
];
const DISALLOWED_SVG_PATTERNS = [
  { pattern: /<script\b/i, label: '<script>' },
  { pattern: /<image\b/i, label: '<image>' },
  { pattern: /https?:\/\/(?!(?:www\.w3\.org\/2000\/svg|www\.w3\.org\/1999\/xhtml|www\.w3\.org\/1999\/xlink)\b)/i, label: 'external url' },
  { pattern: /data:/i, label: 'data uri' },
  { pattern: /@font-face/i, label: 'external font hook' },
];
const DISALLOWED_RUNTIME_RASTER_REFERENCE_PATTERN =
  /(?:\/assets\/visual\/|public\/assets\/visual\/)(?!atlases\/|cinematics\/)[^'"`\s)]*\.(?:png|jpe?g|webp|gif|ico|avif)\b|(?:\/|public\/)favicon\.ico\b/i;
const COMPONENT_BRICK_PATH_PATTERN = /public\/assets\/visual\/bricks\/spr-brick-/;
const REQUIRED_COMPONENT_SHAPE_ATTRIBUTES = [
  'data-component-shape',
  'data-terminal-left',
  'data-terminal-right',
];
const COMPONENT_TERMINAL_COORDINATES = {
  capacitor: { left: '31 24', right: '65 24' },
  resistor: { left: '20 24', right: '76 24' },
  chip: { left: '21 24', right: '75 24' },
  'led-diode': { left: '34 24', right: '66 24' },
  inductor: { left: '22 24', right: '74 24' },
  'shield-module': { left: '25 24', right: '71 24' },
};
const FORBIDDEN_COMPONENT_BORDER_LEAD_PATTERN =
  /<path\b[^>]*\bd=["'][^"']*(?:M0 24H|M\d+(?:\.\d+)? 24H96)[^"']*["']/i;
const FORBIDDEN_COMPONENT_BACKPLATE_PATTERNS = [
  {
    pattern: /<rect\b/i,
    label: '<rect> usado como atalho de bloco ou forma geométrica comum',
  },
  {
    pattern: /\b(?:board|backplate|cell|c[ée]lula)\b/i,
    label: 'nome/metadata de board, backplate ou célula',
  },
  {
    pattern:
      /<rect\b(?=[^>]*\bx=["']4["'])(?=[^>]*\by=["']5["'])(?=[^>]*\bwidth=["']88["'])(?=[^>]*\bheight=["']38["'])[^>]*>/i,
    label: 'backplate retangular dominante 88x38',
  },
  {
    pattern: /\bid=["'][^"']*-board["']/i,
    label: 'gradiente ou definição de board',
  },
  {
    pattern: /url\(\#[^)]+-board\)/i,
    label: 'preenchimento de board',
  },
];

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  reportPath: REPORT_PATH,
  visualRuntimeRoot: VISUAL_RUNTIME_ROOT,
  codexVisualArtifactRoot: CODEX_VISUAL_ARTIFACT_ROOT,
  expectedRuntimeSvgPaths: [],
  visualRuntimeSvgAssets: [],
  codexVisualSvgArtifacts: [],
  scannedReferenceFiles: [],
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

function read(path) {
  return readFileSync(path, 'utf8');
}

function collectFiles(path) {
  if (!existsSync(path)) return [];
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path)
    .flatMap((entry) => collectFiles(join(path, entry)))
    .sort();
}

function relativePath(path) {
  return relative(process.cwd(), resolve(path));
}

function runtimePathForPublicAsset(path) {
  return `/${relativePath(path).replace(/^public\//, '')}`;
}

function matchRuntimeSvgPaths(sourcePath) {
  return [...read(sourcePath).matchAll(RUNTIME_SVG_PATTERN)].map((match) => match[1]);
}

function validateSvgContent(svgFiles) {
  const failures = [];
  for (const svgFile of svgFiles) {
    const source = read(svgFile);
    if (!/<svg[\s>]/i.test(source)) failures.push(`${svgFile} não contém <svg`);
    if (!/viewBox=["'][^"']+["']/.test(source)) failures.push(`${svgFile} não contém viewBox`);
    for (const rule of DISALLOWED_SVG_PATTERNS) {
      if (rule.pattern.test(source)) failures.push(`${svgFile} contém ${rule.label}`);
    }
  }
  return failures;
}

function readComponentShapeAttributes(source) {
  const svgOpenTag = source.match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const shape = svgOpenTag.match(/\bdata-component-shape=["']([^"']+)["']/i)?.[1];
  const terminalLeft = svgOpenTag.match(/\bdata-terminal-left=["']([^"']+)["']/i)?.[1];
  const terminalRight = svgOpenTag.match(/\bdata-terminal-right=["']([^"']+)["']/i)?.[1];
  return { shape, terminalLeft, terminalRight };
}

function validateComponentSilhouetteAssets(svgFiles) {
  const componentSvgFiles = svgFiles.filter((svgFile) =>
    COMPONENT_BRICK_PATH_PATTERN.test(svgFile.replaceAll('\\', '/')),
  );
  const failures = [];

  for (const svgFile of componentSvgFiles) {
    const source = read(svgFile);
    const svgOpenTag = source.match(/<svg\b[^>]*>/i)?.[0] ?? '';
    for (const attribute of REQUIRED_COMPONENT_SHAPE_ATTRIBUTES) {
      if (!new RegExp(`\\b${attribute}=["'][^"']+["']`, 'i').test(svgOpenTag)) {
        failures.push(`${svgFile} não declara ${attribute} no <svg>`);
      }
    }
    for (const rule of FORBIDDEN_COMPONENT_BACKPLATE_PATTERNS) {
      if (rule.pattern.test(source)) {
        failures.push(`${svgFile} ainda usa ${rule.label}`);
      }
    }

    const { shape, terminalLeft, terminalRight } = readComponentShapeAttributes(source);
    const expectedTerminals = shape ? COMPONENT_TERMINAL_COORDINATES[shape] : undefined;
    if (!expectedTerminals) {
      failures.push(`${svgFile} usa data-component-shape desconhecido: ${shape ?? 'ausente'}`);
    } else {
      if (terminalLeft !== expectedTerminals.left) {
        failures.push(
          `${svgFile} data-terminal-left deve ser "${expectedTerminals.left}", recebeu "${terminalLeft ?? 'ausente'}"`,
        );
      }
      if (terminalRight !== expectedTerminals.right) {
        failures.push(
          `${svgFile} data-terminal-right deve ser "${expectedTerminals.right}", recebeu "${terminalRight ?? 'ausente'}"`,
        );
      }
    }

    if (FORBIDDEN_COMPONENT_BORDER_LEAD_PATTERN.test(source)) {
      failures.push(`${svgFile} ainda contém lead de borda (M0 24H… ou …H96)`);
    }
  }

  return { failures, componentFiles: componentSvgFiles.length };
}

function validateRootFavicon() {
  const failures = [];
  if (!existsSync(ROOT_FAVICON_FILE)) {
    failures.push(`${ROOT_FAVICON_FILE} ausente`);
  } else {
    failures.push(...validateSvgContent([ROOT_FAVICON_FILE]));
  }
  addCheck('favicon raiz SVG existe e é seguro', failures, {
    faviconPath: ROOT_FAVICON_FILE,
    runtimePath: FAVICON_RUNTIME_PATH,
  });
}

function validateDirectorySvgOnly(directory, label) {
  const files = collectFiles(directory);
  const invalidFiles = files.filter((file) => extname(file).toLowerCase() !== ALLOWED_VISUAL_EXTENSION);
  const failures = directory === VISUAL_RUNTIME_ROOT
    ? findInvalidRuntimeVisualFiles(files, loadVisualAssetPolicy())
    : invalidFiles.map((file) => `${file} não é .svg`);
  addCheck(`${label} usa SVG ou exceção raster governada`, failures, {
    scannedFiles: files.length,
    nonSvgFiles: invalidFiles.length,
  });
  return files.filter((file) => extname(file).toLowerCase() === ALLOWED_VISUAL_EXTENSION);
}

function validateExpectedReferences(expectedRuntimeSvgPaths) {
  const expectedReferences = {
    ...EXPECTED_REFERENCES,
    [VISUAL_ASSET_SOURCE_PATH]: expectedRuntimeSvgPaths,
    'public/sw.js': SERVICE_WORKER_EXPECTED_REFERENCES,
  };
  const failures = [];
  for (const [sourceFile, expectedPaths] of Object.entries(expectedReferences)) {
    if (!existsSync(sourceFile)) {
      failures.push(`${sourceFile} ausente`);
      continue;
    }
    const source = read(sourceFile);
    for (const runtimePath of expectedPaths) {
      if (!source.includes(runtimePath)) failures.push(`${sourceFile} não referencia ${runtimePath}`);
    }
  }
  addCheck('referências obrigatórias de SVG runtime existem', failures, {
    sourceFiles: Object.keys(expectedReferences),
  });
}

function validateRuntimeRasterReferences() {
  const scannedReferenceFiles = SOURCE_SCAN_ENTRIES.flatMap((entry) => collectFiles(entry));
  report.scannedReferenceFiles = scannedReferenceFiles;
  const failures = [];
  for (const sourceFile of scannedReferenceFiles) {
    const source = read(sourceFile);
    const matches = source.match(DISALLOWED_RUNTIME_RASTER_REFERENCE_PATTERN) || [];
    for (const match of matches) failures.push(`${sourceFile} referencia ${match}`);
  }
  addCheck('referências runtime não usam raster visual', failures, {
    scannedFiles: scannedReferenceFiles.length,
  });
}

function validateExpectedSvgFiles(expectedRuntimeSvgPaths) {
  const failures = [];
  for (const runtimePath of expectedRuntimeSvgPaths) {
    const assetPath = `public${runtimePath}`;
    if (!existsSync(assetPath)) failures.push(`${assetPath} ausente`);
  }
  addCheck('SVGs catalogados existem no disco', failures, {
    expectedFiles: expectedRuntimeSvgPaths.length,
  });
}

try {
  if (!existsSync(VISUAL_ASSET_SOURCE_PATH)) fail(`${VISUAL_ASSET_SOURCE_PATH} ausente`);

  const expectedRuntimeSvgPaths = [...new Set(matchRuntimeSvgPaths(VISUAL_ASSET_SOURCE_PATH))].sort();
  report.expectedRuntimeSvgPaths = expectedRuntimeSvgPaths;

  const visualRuntimeSvgAssets = validateDirectorySvgOnly(
    VISUAL_RUNTIME_ROOT,
    'assets visuais runtime',
  );
  const codexVisualSvgArtifacts = validateDirectorySvgOnly(
    CODEX_VISUAL_ARTIFACT_ROOT,
    'artefatos visuais Codex',
  );
  report.visualRuntimeSvgAssets = visualRuntimeSvgAssets.map(runtimePathForPublicAsset);
  report.codexVisualSvgArtifacts = codexVisualSvgArtifacts;

  validateExpectedSvgFiles(expectedRuntimeSvgPaths);
  validateExpectedReferences(expectedRuntimeSvgPaths);
  validateRuntimeRasterReferences();
  validateRootFavicon();

  const componentSilhouetteResult = validateComponentSilhouetteAssets(visualRuntimeSvgAssets);
  addCheck('componentes eletrônicos usam silhueta própria sem backplate dominante', componentSilhouetteResult.failures, {
    componentFiles: componentSilhouetteResult.componentFiles,
  });

  addCheck(
    'conteúdo SVG é local e seguro',
    validateSvgContent([...visualRuntimeSvgAssets, ...codexVisualSvgArtifacts]),
    {
      svgFiles: visualRuntimeSvgAssets.length + codexVisualSvgArtifacts.length,
    },
  );

  report.ok = true;
  writeReport();
  console.log(
    `svg-assets ok: runtime=${visualRuntimeSvgAssets.length}, codex=${codexVisualSvgArtifacts.length}, report=${REPORT_PATH}`,
  );
} catch (error) {
  report.error = error.message;
  writeReport();
  console.error(error);
  process.exit(1);
}
