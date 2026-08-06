// scripts/spanish-search-edition.test.mjs
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve('dist');
const TRUST_PATHS = [
  '/about/',
  '/legal/',
  '/privacy/',
  '/terms/',
  '/data-deletion/',
  '/cookies/',
  '/support/',
];
const SPANISH_NAVIGATION = [
  'Jugar',
  'Cómo jugar',
  'Preguntas frecuentes',
  'Actualizaciones',
  'Acerca de',
  'Soporte',
];
const ENGLISH_NAVIGATION = ['Play', 'How to play', 'Updates', 'About', 'Support', 'Back to the game'];

function fail(message) {
  throw new Error(`spanish-search-edition test: ${message}`);
}

function readPage(relative) {
  const path = resolve(ROOT, relative);
  if (!existsSync(path)) fail(`missing ${relative}`);
  return readFileSync(path, 'utf8');
}

function assertSpanishSurface(html, label) {
  if (!html.includes('<html lang="es-419" dir="ltr">')) fail(`${label} must declare es-419 ltr`);
  if (!html.includes('<meta name="robots" content="index,follow" />')) fail(`${label} must be indexable`);
  for (const labelText of SPANISH_NAVIGATION) {
    if (!html.includes(`>${labelText}<`)) fail(`${label} missing Spanish navigation label ${labelText}`);
  }
  for (const english of ENGLISH_NAVIGATION) {
    if (html.includes(`>${english}<`)) fail(`${label} contains English fallback navigation ${english}`);
  }
  for (const route of ['/how-to-play/', '/faq/', '/updates/']) {
    if (!html.includes(`href="/es-419${route}"`)) fail(`${label} must link directly to ES-419${route}`);
  }
}

const landing = readPage('es-419/index.html');
assertSpanishSurface(landing, 'landing');
if (!landing.includes('>Jugar<') || landing.includes('>Play now<')) {
  fail('landing must render complete Spanish calls to action');
}

for (const trustPath of TRUST_PATHS) {
  const html = readPage(`es-419${trustPath}index.html`);
  assertSpanishSurface(html, `trust ${trustPath}`);
}

console.log('spanish-search-edition test ok: landing=1 trust=7 navigation=Spanish');
