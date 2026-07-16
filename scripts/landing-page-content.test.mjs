// scripts/landing-page-content.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LANDING_SW_RECOVERY_SCRIPT,
  PLAY_ROUTE_PATH,
  renderLandingPage,
} from './landing-page-content.mjs';

test('landing inclui bootstrap de recovery do SW sem registrar worker', () => {
  const html = renderLandingPage({
    locale: 'pt-BR',
    canonicalUrl: 'https://brikaya.com/',
    alternateLinks: '',
    dir: 'ltr',
    title: 'Brikaya',
    description: 'Arcade offline-first',
  });

  assert.match(html, /<script>/);
  assert.ok(html.includes(LANDING_SW_RECOVERY_SCRIPT));
  assert.ok(html.includes('serviceWorker'));
  assert.ok(html.includes('getRegistrations'));
  assert.ok(html.includes('display-mode: standalone'));
  assert.ok(html.includes(PLAY_ROUTE_PATH));
  assert.equal(html.includes('serviceWorker.register'), false);
  assert.equal(html.includes('navigator.serviceWorker.register'), false);
});

test('bootstrap redireciona só apex standalone para /play/', () => {
  assert.ok(LANDING_SW_RECOVERY_SCRIPT.includes('path==="/"'));
  assert.ok(LANDING_SW_RECOVERY_SCRIPT.includes('path==="/index.html"'));
  assert.ok(LANDING_SW_RECOVERY_SCRIPT.includes(`var play=${JSON.stringify(PLAY_ROUTE_PATH)}`));
  assert.ok(LANDING_SW_RECOVERY_SCRIPT.includes('location.replace(play)'));
});
