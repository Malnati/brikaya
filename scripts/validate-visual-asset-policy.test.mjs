// scripts/validate-visual-asset-policy.test.mjs
import assert from 'node:assert/strict';

import {
  allowedRuntimeRasterPaths,
  findInvalidRuntimeVisualFiles,
  findInvalidRuntimeVisualReferences,
  validateAtlasExceptionDocument,
  validatePolicyText,
} from './validate-visual-asset-policy.mjs';

const VALID_POLICY = {
  version: 1,
  policy: 'svg-first-runtime-atlas-exceptions',
  thresholds: {
    heavyAnimationFrameCount: 8,
    manyDrawsPerFrame: 100,
    requiresProfiledP95Improvement: true,
  },
  exceptions: [
    {
      id: 'powerups-profiled-atlas',
      kind: 'atlas',
      runtimePaths: ['/assets/visual/atlases/atlas-powerups-profiled.webp'],
      sourceSvgPaths: ['public/assets/visual/powerups/spr-powerup-multiball-orb.svg'],
      reason: 'profiled-faster',
      evidencePath: 'docs/assets/issues/powerups/evidence/evi-powerups-atlas-profile.json',
    },
    {
      id: 'rip-cinematic-background',
      kind: 'cinematic',
      runtimePaths: ['/assets/visual/cinematics/cinematic-rip-background.avif'],
      sourceSvgPaths: ['public/assets/visual/vfx/vfx-game-over-rip-smoke.svg'],
      reason: 'cinematic-background',
      evidencePath: 'docs/assets/issues/rip/evidence/evi-rip-cinematic-background.json',
    },
  ],
};

const existing = new Set([
  'public/assets/visual/powerups/spr-powerup-multiball-orb.svg',
  'public/assets/visual/vfx/vfx-game-over-rip-smoke.svg',
  'docs/assets/issues/powerups/evidence/evi-powerups-atlas-profile.json',
  'docs/assets/issues/rip/evidence/evi-rip-cinematic-background.json',
]);
const exists = (path) => existing.has(path);

assert.deepEqual(validateAtlasExceptionDocument(VALID_POLICY, { exists }), []);
assert.deepEqual(
  allowedRuntimeRasterPaths(VALID_POLICY),
  new Set([
    '/assets/visual/atlases/atlas-powerups-profiled.webp',
    '/assets/visual/cinematics/cinematic-rip-background.avif',
  ]),
);

assert.deepEqual(
  findInvalidRuntimeVisualFiles(
    [
      'public/assets/visual/sprites/spr-ball-player-default.svg',
      'public/assets/visual/atlases/atlas-powerups-profiled.webp',
      'public/assets/visual/cinematics/cinematic-rip-background.avif',
    ],
    VALID_POLICY,
  ),
  [],
);

assert.match(
  findInvalidRuntimeVisualFiles(
    ['public/assets/visual/sprites/spr-ball-player-default.png'],
    VALID_POLICY,
  ).join('\n'),
  /raster visual não governado/,
);

assert.match(
  validateAtlasExceptionDocument(
    {
      ...VALID_POLICY,
      exceptions: [
        {
          id: 'bad-avif-atlas',
          kind: 'atlas',
          runtimePaths: ['/assets/visual/atlases/atlas-powerups.avif'],
          sourceSvgPaths: ['public/assets/visual/powerups/spr-powerup-multiball-orb.svg'],
          reason: 'heavy-animation',
          evidencePath: 'docs/assets/issues/powerups/evidence/evi-powerups-atlas-profile.json',
        },
      ],
    },
    { exists },
  ).join('\n'),
  /AVIF não pode ser atlas/,
);

assert.match(
  findInvalidRuntimeVisualReferences(
    [
      {
        filePath: 'src/constants/visualAssets.ts',
        source: "export const bad = '/assets/visual/sprites/spr-ball-player-default.avif';",
      },
    ],
    VALID_POLICY,
  ).join('\n'),
  /AVIF não pode ser sprite/,
);

assert.deepEqual(
  findInvalidRuntimeVisualReferences(
    [
      {
        filePath: 'src/constants/visualAssets.ts',
        source: "export const ok = '/assets/visual/atlases/atlas-powerups-profiled.webp';",
      },
    ],
    VALID_POLICY,
  ),
  [],
);

assert.deepEqual(
  validatePolicyText({
    'AGENTS.md': 'SVG-first authoring atlas PNG/WebP AVIF public/assets/visual/cinematics',
    '.cursor/rules/all.mdc': 'SVG-first authoring atlas PNG/WebP AVIF public/assets/visual/cinematics',
  }),
  [],
);

console.log('visual-asset-policy unit ok');
