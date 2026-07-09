// scripts/validate-public-trace-guard.test.mjs
import assert from 'node:assert/strict';

import {
  findForbiddenTraces,
  isBinaryBuffer,
  shouldSkipPath
} from './trace-guard-rules.mjs';

function joinParts(parts) {
  return parts.join('');
}

const CLEAN_TEXT = 'Brikaya roda offline no navegador.';
const LEGACY_TEXT = [
  'Public copy must not mention',
  joinParts(['Bre', 'ak', 'out']) + ',',
  joinParts(['At', 'ari']) + ',',
  joinParts(['Bl', 'ock', 'bre', 'aker']) + ',',
  joinParts(['Bl', 'ock', '-', 'bre', 'aker']) + ',',
  'or',
  joinParts(['MI', 'T']),
  joinParts(['Lic', 'ense']) + '.'
].join(' ');
const CLEAN_FILE = 'README.md';
const GENERATED_FILE = 'dist/index.html';
const SOURCE_FILE = 'src/App.tsx';

assert.deepEqual(findForbiddenTraces(CLEAN_TEXT, CLEAN_FILE), []);

const findings = findForbiddenTraces(LEGACY_TEXT, CLEAN_FILE);
assert.equal(findings.length, 5);
assert.deepEqual(
  findings.map((finding) => finding.id),
  [
    'legacy-project-compound-de',
    'legacy-project-hyphenated',
    'legacy-game-title',
    'sensitive-comparison-b',
    'project-license-old-a',
  ]
);

assert.equal(shouldSkipPath(GENERATED_FILE), true);
assert.equal(shouldSkipPath(SOURCE_FILE), false);
assert.equal(isBinaryBuffer(Buffer.from([0x61, 0x00, 0x62])), true);
assert.equal(isBinaryBuffer(Buffer.from('plain text')), false);

console.log('public-trace-guard unit ok');
