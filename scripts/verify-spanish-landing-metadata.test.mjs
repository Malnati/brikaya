// scripts/verify-spanish-landing-metadata.test.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const LANDING_PATH = 'dist/es-419/index.html';
const landing = readFileSync(LANDING_PATH, 'utf8');
const englishTitle = 'Brikaya — circuit component arcade';
const englishDescription = 'Play Brikaya, a free circuit component arcade in your browser, with progress saved on your device and offline play after the first visit.';

const corrupted = landing
  .replace(/<title>[^<]+<\/title>/, `<title>${englishTitle}</title>`)
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${englishDescription}" />`)
  .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${englishTitle}" />`)
  .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${englishDescription}" />`)
  .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${englishTitle}" />`)
  .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${englishDescription}" />`);

if (corrupted === landing) throw new Error('test fixture did not corrupt the Spanish landing metadata');

try {
  writeFileSync(LANDING_PATH, corrupted);
  const result = spawnSync(process.execPath, ['scripts/verify-spanish-editorial-edition.mjs'], {
    encoding: 'utf8',
  });
  if (result.status === 0) {
    throw new Error('English landing metadata must make the Spanish atomic gate fail');
  }
  if (!/landing metadata|landing.*English|es-419\/.+metadata/i.test(`${result.stdout}\n${result.stderr}`)) {
    throw new Error(`gate failed for the wrong reason: ${result.stdout}\n${result.stderr}`);
  }
} finally {
  writeFileSync(LANDING_PATH, landing);
}

console.log('verify-spanish-landing-metadata test ok: English metadata is rejected');
