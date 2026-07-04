// src/build/runtimeAssetManifest.test.ts
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SCRIPT_PATH = 'scripts/generate-runtime-asset-manifest.mjs';
const TEMP_ROOT = 'tmp/tests/runtime-asset-manifest/public';
const TEMP_OUTPUT = 'tmp/tests/runtime-asset-manifest/dist/asset-cache-manifest.json';
const SVG_PATH = '/assets/visual/sprites/spr-test-ball.svg';
const MP3_PATH = '/assets/audio/sfx-test-hit-01.mp3';
const IGNORED_PATH = '/assets/misc/spr-test-raster.png';
const SVG_SOURCE = '<svg viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>';
const MP3_SOURCE = 'fake-mp3-bytes';

function writeRuntimeFile(runtimePath: string, source: string) {
  const filePath = resolve(TEMP_ROOT, runtimePath.replace(/^\//, ''));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, source);
}

function sha256(source: string) {
  return `sha256-${createHash('sha256').update(source).digest('hex')}`;
}

describe('generate-runtime-asset-manifest', () => {
  beforeEach(() => {
    rmSync(resolve('tmp/tests/runtime-asset-manifest'), {
      recursive: true,
      force: true,
    });
  });

  afterEach(() => {
    rmSync(resolve('tmp/tests/runtime-asset-manifest'), {
      recursive: true,
      force: true,
    });
  });

  it('gera manifesto determinístico com hashes para SVGs e áudios runtime', () => {
    writeRuntimeFile(SVG_PATH, SVG_SOURCE);
    writeRuntimeFile(MP3_PATH, MP3_SOURCE);
    writeRuntimeFile(IGNORED_PATH, 'ignored');

    const output = execFileSync(process.execPath, [SCRIPT_PATH], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BRIKAYA_ASSET_MANIFEST_PUBLIC_ROOT: resolve(TEMP_ROOT),
        BRIKAYA_ASSET_MANIFEST_OUTPUT: resolve(TEMP_OUTPUT),
      },
      encoding: 'utf8',
    });
    const manifest = JSON.parse(readFileSync(resolve(TEMP_OUTPUT), 'utf8'));

    expect(output).toContain('runtime-asset-manifest ok');
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.assets.map((asset: { path: string }) => asset.path)).toEqual([
      MP3_PATH,
      SVG_PATH,
    ]);
    expect(manifest.assetsByPath[SVG_PATH]).toMatchObject({
      path: SVG_PATH,
      hash: sha256(SVG_SOURCE),
      kind: 'visual',
      size: Buffer.byteLength(SVG_SOURCE),
    });
    expect(manifest.assetsByPath[MP3_PATH]).toMatchObject({
      path: MP3_PATH,
      hash: sha256(MP3_SOURCE),
      kind: 'audio',
      size: Buffer.byteLength(MP3_SOURCE),
    });
    expect(manifest.assetsByPath[IGNORED_PATH]).toBeUndefined();
    expect(manifest.version).toMatch(/^sha256-[a-f0-9]{64}$/);
  });
});
