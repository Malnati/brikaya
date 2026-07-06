// src/assets/manifestIcons.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { uiPwaAppIcon } from '../constants/visualAssets';

const MANIFEST_PATH = 'public/manifest.webmanifest';
const ICON_PATH = 'public/assets/visual/ui/ui-pwa-app-icon.svg';
const ROOT_FAVICON_PATH = 'public/favicon.svg';
const SVG_TYPE = 'image/svg+xml';
const ANY_SIZE = 'any';
const DISALLOWED_SVG_PATTERNS = [/<script\b/i, /<image\b/i, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/i, /data:/i];

describe('manifest icons', () => {
  it('usa ícone PWA SVG local e seguro com nome semântico', () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), MANIFEST_PATH), 'utf8'));
    const svg = readFileSync(resolve(process.cwd(), ICON_PATH), 'utf8');

    expect(manifest.icons).toEqual([
      {
        src: uiPwaAppIcon,
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

  it('publica favicon raiz SVG local e seguro para robôs de busca', () => {
    const svg = readFileSync(resolve(process.cwd(), ROOT_FAVICON_PATH), 'utf8');

    expect(svg).toContain('<svg');
    expect(svg).toMatch(/viewBox=["'][^"']+["']/);
    for (const pattern of DISALLOWED_SVG_PATTERNS) {
      expect(svg).not.toMatch(pattern);
    }
  });
});
