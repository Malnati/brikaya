// src/constants/assetNaming.test.ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import {
  VISUAL_ASSET_CATALOG,
  VISUAL_ASSET_PATHS,
  type VisualAssetCatalogEntry,
} from './visualAssets';
import {
  VISUAL_COLOR_TOKENS,
  TYPOGRAPHY_TOKENS,
} from './visualDesign';
import {
  AUDIO_ASSET_PATHS,
  AUDIO_CATALOG,
  AUDIO_EVENT_IDS,
  AUDIO_PUBLIC_PATHS,
  SILENT_AUDIO_ID,
} from './audio';

const VISUAL_ASSET_PATTERN = /^(spr|ui|vfx)-[a-z0-9]+(-[a-z0-9]+)*\.(svg|png|webp)$/;
const AUDIO_ASSET_PATTERN = /^(sfx|bgm)-[a-z0-9]+(-[a-z0-9]+)*-[0-9]{2}\.(mp3|ogg)$/;
const TOKEN_PATTERN = /^(spr|ui|vfx|clr|typ|sfx|bgm)-[a-z0-9]+(-[a-z0-9]+)*(-[0-9]{2})?$/;
const MIN_ID_LENGTH = 12;
const MAX_ID_LENGTH = 64;
const PUBLIC_PREFIX = 'public';
const CSS_PATH = 'src/styles/index.css';
const SERVICE_WORKER_PATH = 'public/sw.js';
const VISUAL_ASSET_DIR = 'public/assets/visual';
const AUDIO_ASSET_DIR = 'public/assets/audio';

function kebabToCamel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, character: string) => character.toUpperCase());
}

function stripExtension(filePath: string): string {
  return basename(filePath).replace(/\.[^.]+$/, '');
}

function assertUniqueBasenames(paths: readonly string[]) {
  const seen = new Map<string, string>();
  for (const path of paths) {
    const fileName = basename(path);
    const existingPath = seen.get(fileName);
    expect(existingPath).toBeUndefined();
    seen.set(fileName, path);
  }
}

function collectAssetFilePaths(dirPath: string, extensions: readonly string[]): string[] {
  return readdirSync(dirPath).flatMap((entryName) => {
    const entryPath = `${dirPath}/${entryName}`;
    if (statSync(entryPath).isDirectory()) {
      return collectAssetFilePaths(entryPath, extensions);
    }
    if (!extensions.some((extension) => entryName.endsWith(extension))) {
      return [];
    }
    return [entryPath.replace(/^public/, '')];
  });
}

function assertEntryParity(entry: VisualAssetCatalogEntry) {
  const stem = stripExtension(entry.path);
  expect(entry.id).toBe(stem);
  expect(entry.variableName).toBe(kebabToCamel(stem));
  expect(entry.id.length).toBeGreaterThanOrEqual(MIN_ID_LENGTH);
  expect(entry.id.length).toBeLessThanOrEqual(MAX_ID_LENGTH);
  expect(entry.id).toMatch(TOKEN_PATTERN);
  expect(basename(entry.path)).toMatch(VISUAL_ASSET_PATTERN);
}

describe('nomenclatura semântica de assets visuais exibidos', () => {
  it('mantém paridade exata entre ID, variável camelCase e arquivo físico', () => {
    const visualPaths = Object.values(VISUAL_ASSET_PATHS);
    const diskVisualPaths = collectAssetFilePaths(VISUAL_ASSET_DIR, ['.svg', '.png', '.webp']);

    expect(VISUAL_ASSET_CATALOG).toHaveLength(18);
    expect(visualPaths).toHaveLength(VISUAL_ASSET_CATALOG.length);
    expect(visualPaths.sort()).toEqual(diskVisualPaths.sort());
    assertUniqueBasenames(visualPaths);

    for (const entry of VISUAL_ASSET_CATALOG) {
      assertEntryParity(entry);
      expect(visualPaths).toContain(entry.path);
      expect(entry.width).toBeGreaterThan(0);
      expect(entry.height).toBeGreaterThan(0);
      expect(existsSync(resolve(process.cwd(), `${PUBLIC_PREFIX}${entry.path}`))).toBe(true);
    }
  });

  it('precacheia todos os assets visuais exibidos para uso offline', () => {
    const serviceWorker = readFileSync(resolve(process.cwd(), SERVICE_WORKER_PATH), 'utf8');

    for (const assetPath of Object.values(VISUAL_ASSET_PATHS)) {
      expect(serviceWorker).toContain(assetPath);
    }
  });
});

describe('tokens visuais retro arcade', () => {
  it('declara todas as cores e escala tipográfica no CSS runtime', () => {
    const css = readFileSync(resolve(process.cwd(), CSS_PATH), 'utf8');

    for (const token of VISUAL_COLOR_TOKENS) {
      expect(token.id).toMatch(TOKEN_PATTERN);
      expect(css).toContain(token.cssVar);
      expect(css).toContain(token.hex.toLowerCase());
    }

    for (const token of TYPOGRAPHY_TOKENS) {
      expect(css).toContain(token.cssVar);
      expect(css).toContain(token.desktopSize);
      expect(css).toContain(token.mobileSize);
    }
  });
});

describe('nomenclatura semântica de áudio runtime', () => {
  it('mantém arquivos SFX/BGM em kebab-case com prefixo e variável camelCase equivalente', () => {
    const audioPaths = Object.values(AUDIO_ASSET_PATHS);
    const diskAudioPaths = collectAssetFilePaths(AUDIO_ASSET_DIR, ['.mp3', '.ogg']);

    expect(audioPaths).toHaveLength(AUDIO_PUBLIC_PATHS.length);
    expect(audioPaths.sort()).toEqual(diskAudioPaths.sort());
    assertUniqueBasenames(audioPaths);

    for (const [variableName, runtimePath] of Object.entries(AUDIO_ASSET_PATHS)) {
      const stem = stripExtension(runtimePath);
      expect(variableName).toBe(kebabToCamel(stem));
      expect(stem.length).toBeGreaterThanOrEqual(MIN_ID_LENGTH);
      expect(stem.length).toBeLessThanOrEqual(MAX_ID_LENGTH);
      expect(stem).toMatch(TOKEN_PATTERN);
      expect(basename(runtimePath)).toMatch(AUDIO_ASSET_PATTERN);
      expect(existsSync(resolve(process.cwd(), `${PUBLIC_PREFIX}${runtimePath}`))).toBe(true);
    }
  });

  it('mantém catálogo sonoro com IDs semânticos e arquivos locais', () => {
    for (const audioId of AUDIO_EVENT_IDS) {
      const entry = AUDIO_CATALOG[audioId];
      expect(audioId).toMatch(TOKEN_PATTERN);
      expect(entry.id).toBe(audioId);
      if (audioId === SILENT_AUDIO_ID) {
        expect(entry.files).toEqual([]);
        continue;
      }
      expect(entry.files.length).toBeGreaterThan(0);
      for (const filePath of entry.files) {
        expect(AUDIO_PUBLIC_PATHS).toContain(filePath);
      }
    }
  });
});
