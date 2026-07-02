// src/assets/manifestIcons.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MANIFEST_PATH = 'public/manifest.webmanifest';
const ICON_PATH = 'public/icons/icon.svg';
const ICON_RUNTIME_PATH = '/icons/icon.svg';
const SVG_TYPE = 'image/svg+xml';
const ANY_SIZE = 'any';
const DISALLOWED_SVG_PATTERNS = [/<script\b/i, /<image\b/i, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i, /data:/i];

describe('manifest icons', () => {
  it('usa ícone PWA SVG local e seguro', () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), MANIFEST_PATH), 'utf8'));
    const svg = readFileSync(resolve(process.cwd(), ICON_PATH), 'utf8');

    expect(manifest.icons).toEqual([
      {
        src: ICON_RUNTIME_PATH,
        sizes: ANY_SIZE,
        type: SVG_TYPE,
        purpose: 'any maskable',
      },
    ]);
    expect(svg).toContain('<svg');
    expect(svg).toMatch(/viewBox=["'][^"']+["']/);
    for (const pattern of DISALLOWED_SVG_PATTERNS) {
      expect(svg).not.toMatch(pattern);
    }
  });
});
