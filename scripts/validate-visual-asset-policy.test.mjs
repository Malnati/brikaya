// scripts/validate-visual-asset-policy.test.mjs
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  collectFiles,
  runtimePathFromPublicPath,
  validateAtlasExceptionDocument,
} from './validate-visual-asset-policy.mjs';

assert.equal(
  runtimePathFromPublicPath('public/assets/visual/atlases/atlas-demo.webp'),
  '/assets/visual/atlases/atlas-demo.webp',
);

assert.deepEqual(
  validateAtlasExceptionDocument({
    version: 1,
    policy: 'svg-first-runtime-atlas-exceptions',
    thresholds: {
      heavyAnimationFrameCount: 8,
      manyDrawsPerFrame: 100,
      requiresProfiledP95Improvement: true,
    },
    exceptions: [],
  }),
  [],
);

const invalidPolicyFailures = validateAtlasExceptionDocument({ version: 2 });
assert.ok(invalidPolicyFailures.some((failure) => failure.includes('version')));

const invalidExceptionFailures = validateAtlasExceptionDocument({
  version: 1,
  policy: 'svg-first-runtime-atlas-exceptions',
  thresholds: {
    heavyAnimationFrameCount: 8,
    manyDrawsPerFrame: 100,
    requiresProfiledP95Improvement: true,
  },
  exceptions: [
    {
      id: 'Bad ID',
      kind: 'atlas',
      runtimePaths: ['/assets/visual/sprites/bad.webp'],
      sourceSvgPaths: ['/assets/visual/sprites/bad.svg'],
      reason: 'profiled-faster',
      evidencePath: 'missing.json',
    },
  ],
});
assert.ok(invalidExceptionFailures.length >= 3);

const tempRoot = mkdtempSync(join(tmpdir(), 'visual-collect-'));
mkdirSync(join(tempRoot, 'nested'), { recursive: true });
writeFileSync(join(tempRoot, 'nested', 'a.svg'), '<svg></svg>');
const collected = collectFiles(tempRoot);
assert.equal(collected.length, 1);

console.log('visual-asset-policy unit ok');
