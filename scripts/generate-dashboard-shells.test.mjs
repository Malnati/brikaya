// scripts/generate-dashboard-shells.test.mjs
import assert from "node:assert/strict";

import {
  DASHBOARD_SHELL_ROUTES,
  buildDashboardShellHtml,
} from "./generate-dashboard-shells.mjs";

const BASE_HTML = `<!-- index.html -->
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
    <link rel="canonical" href="https://brikaya.com/play/" />
    <meta name="robots" content="noindex,follow" />
    <script type="application/ld+json">
      { "@context": "https://schema.org" }
    </script>
    <meta name="description" content="Jogue Brikaya no navegador." />
    <meta property="og:url" content="https://brikaya.com/play/" />
    <meta property="og:title" content="Brikaya — arcade de circuitos eletrônicos" />
    <meta property="og:description" content="Remova componentes e avance fases." />
    <meta name="twitter:title" content="Brikaya — arcade de circuitos eletrônicos" />
    <meta name="twitter:description" content="Remova componentes e avance fases." />
    <title>Brikaya — arcade de circuitos eletrônicos</title>
    <script type="module" crossorigin src="/assets/index-abc123.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-abc123.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const [dashboard2d] = DASHBOARD_SHELL_ROUTES;
const html = buildDashboardShellHtml(BASE_HTML, dashboard2d);

assert.equal(html.includes('<link rel="manifest"'), false);
assert.equal(html.includes("application/ld+json"), false);
assert.match(
  html,
  /<link rel="canonical" href="https:\/\/brikaya\.com\/dashboard\/2d\/" \/>/,
);
assert.match(html, /<meta name="robots" content="noindex,follow" \/>/);
assert.match(
  html,
  new RegExp(`<title>${escapeRegExp(dashboard2d.title)}</title>`),
);
assert.match(
  html,
  new RegExp(
    `<meta name="description" content="${escapeRegExp(dashboard2d.description)}"`,
  ),
);
assert.match(
  html,
  /<meta property="og:url" content="https:\/\/brikaya\.com\/dashboard\/2d\/" \/>/,
);
assert.equal(html.includes('src="/assets/index-abc123.js"'), true);
assert.equal(html.includes('<div id="root"></div>'), true);

assert.equal(DASHBOARD_SHELL_ROUTES.length, 2);
assert.deepEqual(
  DASHBOARD_SHELL_ROUTES.map((route) => route.routePath),
  ["/dashboard/2d/", "/dashboard/3d/"],
);

console.log("generate-dashboard-shells unit ok");
