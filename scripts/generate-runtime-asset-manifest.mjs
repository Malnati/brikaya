// scripts/generate-runtime-asset-manifest.mjs
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const PUBLIC_ROOT_ENV_KEY = 'BRICKBREAKER_ASSET_MANIFEST_PUBLIC_ROOT';
const OUTPUT_ENV_KEY = 'BRICKBREAKER_ASSET_MANIFEST_OUTPUT';
const DEFAULT_PUBLIC_ROOT = 'public';
const DEFAULT_OUTPUT = 'dist/asset-cache-manifest.json';
const SCHEMA_VERSION = 1;
const VISUAL_ROOT = 'assets/visual';
const AUDIO_ROOT = 'assets/audio';
const VISUAL_KIND = 'visual';
const AUDIO_KIND = 'audio';
const SHA_PREFIX = 'sha256-';
const MANIFEST_OK_LABEL = 'runtime-asset-manifest ok';
const JSON_SPACE = 2;
const EMPTY_LINE = '\n';
const ALLOWED_EXTENSIONS_BY_ROOT = {
  [VISUAL_ROOT]: new Set(['.svg']),
  [AUDIO_ROOT]: new Set(['.mp3', '.ogg']),
};
const KIND_BY_ROOT = {
  [VISUAL_ROOT]: VISUAL_KIND,
  [AUDIO_ROOT]: AUDIO_KIND,
};

function resolvePublicRoot(env) {
  return resolve(process.cwd(), env[PUBLIC_ROOT_ENV_KEY] || DEFAULT_PUBLIC_ROOT);
}

function resolveOutputPath(env) {
  return resolve(process.cwd(), env[OUTPUT_ENV_KEY] || DEFAULT_OUTPUT);
}

function collectFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .flatMap((entryName) => {
      const entryPath = join(directory, entryName);
      const stats = statSync(entryPath);
      if (stats.isDirectory()) return collectFiles(entryPath);
      if (!stats.isFile()) return [];
      return [entryPath];
    })
    .sort();
}

function runtimePath(publicRoot, filePath) {
  return `/${relative(publicRoot, filePath).split(/[\\/]+/).join('/')}`;
}

function hashFile(filePath) {
  return `${SHA_PREFIX}${createHash('sha256').update(readFileSync(filePath)).digest('hex')}`;
}

function assetKind(publicRoot, filePath) {
  const relativePath = relative(publicRoot, filePath).split(/[\\/]+/).join('/');
  const root = Object.keys(ALLOWED_EXTENSIONS_BY_ROOT).find((candidate) =>
    relativePath.startsWith(`${candidate}/`),
  );
  if (!root) return null;
  const extension = extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS_BY_ROOT[root].has(extension)) return null;
  return KIND_BY_ROOT[root];
}

function collectAssets(publicRoot) {
  const roots = Object.keys(ALLOWED_EXTENSIONS_BY_ROOT).map((root) =>
    join(publicRoot, root),
  );
  return roots
    .flatMap((root) => collectFiles(root))
    .map((filePath) => {
      const kind = assetKind(publicRoot, filePath);
      if (!kind) return null;
      const stats = statSync(filePath);
      return {
        path: runtimePath(publicRoot, filePath),
        hash: hashFile(filePath),
        size: stats.size,
        kind,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.path.localeCompare(right.path));
}

function manifestVersion(assets) {
  const versionSource = JSON.stringify(
    assets.map((asset) => ({ path: asset.path, hash: asset.hash, size: asset.size })),
  );
  return `${SHA_PREFIX}${createHash('sha256').update(versionSource).digest('hex')}`;
}

function buildManifest(publicRoot) {
  const assets = collectAssets(publicRoot);
  const assetsByPath = Object.fromEntries(
    assets.map((asset) => [asset.path, asset]),
  );
  return {
    schemaVersion: SCHEMA_VERSION,
    version: manifestVersion(assets),
    assets,
    assetsByPath,
  };
}

function writeManifest(outputPath, manifest) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, JSON_SPACE)}${EMPTY_LINE}`);
}

function run() {
  const publicRoot = resolvePublicRoot(process.env);
  const outputPath = resolveOutputPath(process.env);
  const manifest = buildManifest(publicRoot);
  writeManifest(outputPath, manifest);
  console.log(`${MANIFEST_OK_LABEL}: assets=${manifest.assets.length} output=${outputPath}`);
}

run();
