// src/build/serviceWorkerLazyAssets.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SERVICE_WORKER_PATH = 'public/sw.js';
const ASSET_MANIFEST_PATH = '/asset-cache-manifest.json';
const VISUAL_ASSET_PREFIX = '/assets/visual/';
const AUDIO_ASSET_PREFIX = '/assets/audio/';
const PRECACHE_ARRAY_PATTERN = /const\s+PRECACHE_URLS\s*=\s*\[([\s\S]*?)\];/;

function readServiceWorker() {
  return readFileSync(resolve(process.cwd(), SERVICE_WORKER_PATH), 'utf8');
}

function readPrecacheSource() {
  const source = readServiceWorker();
  const match = source.match(PRECACHE_ARRAY_PATTERN);
  expect(match).toBeTruthy();
  return match![1];
}

describe('service worker lazy asset cache', () => {
  it('não precacheia assets visuais ou áudio durante install', () => {
    const source = readServiceWorker();
    const precacheSource = readPrecacheSource();

    expect(source).toContain('CORE_PRECACHE_URLS');
    expect(source).toContain(ASSET_MANIFEST_PATH);
    expect(precacheSource).not.toContain(VISUAL_ASSET_PREFIX);
    expect(precacheSource).not.toContain(AUDIO_ASSET_PREFIX);
  });

  it('declara cache estável e manifesto de hash para assets runtime', () => {
    const source = readServiceWorker();

    expect(source).toContain('ASSET_CACHE_NAME');
    expect(source).toContain('ASSET_CACHE_STATUS_HEADER');
    expect(source).toContain(ASSET_MANIFEST_PATH);
    expect(source).toContain(VISUAL_ASSET_PREFIX);
    expect(source).toContain(AUDIO_ASSET_PREFIX);
  });

  it('migra assets de caches legados antes de remover caches de shell antigos', () => {
    const source = readServiceWorker();
    const migrateIndex = source.indexOf('await migrateLegacyAssets()');
    const deleteIndex = source.indexOf('await deleteOldCaches()');

    expect(migrateIndex).toBeGreaterThan(-1);
    expect(deleteIndex).toBeGreaterThan(-1);
    expect(migrateIndex).toBeLessThan(deleteIndex);
  });

  it('solicita reload pelo app para permitir progresso visual', () => {
    const source = readServiceWorker();

    expect(source).toContain('RELOAD_CLIENT_MESSAGE');
    expect(source).toContain('client.postMessage');
    expect(source).not.toContain('client.navigate');
  });

  it('usa network-first para bundles Vite e bloqueia cache de text/html', () => {
    const source = readServiceWorker();
    const viteBundleHandlerMatch = source.match(
      /async function handleViteBundleRequest\(request\) \{([\s\S]*?)\n\}/,
    );

    expect(source).toContain('VITE_BUNDLE_PATH_PATTERN');
    expect(source).toContain('isViteBundleRequest');
    expect(source).toContain('handleViteBundleRequest');
    expect(source).toContain('shouldCacheShellResponse');
    expect(source).toContain('HTML_CONTENT_TYPE');
    expect(viteBundleHandlerMatch).toBeTruthy();
    expect(viteBundleHandlerMatch?.[1]).toContain('await fetch(request)');
    expect(viteBundleHandlerMatch?.[1]).not.toMatch(
      /^[\s\S]*caches\.match\(request\)[\s\S]*await fetch\(request\)/,
    );
  });
});
