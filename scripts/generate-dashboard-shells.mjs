// scripts/generate-dashboard-shells.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const DIST_DIR = "dist";
const PLAY_INDEX_PATH = join("play", "index.html");
const INDEX_FILE = "index.html";
const CANONICAL_ORIGIN = "https://brikaya.com";

export const DASHBOARD_SHELL_ROUTES = [
  {
    routePath: "/dashboard/2d/",
    title: "Dashboard Brikaya — elementos 2D",
    description:
      "Ferramenta interna para revisar os elementos visuais 2D do Brikaya (bola, raquete, componentes eletrônicos, power-ups e controle da Torreta) antes de aplicá-los ao jogo em produção.",
  },
  {
    routePath: "/dashboard/3d/",
    title: "Dashboard Brikaya — elementos 3D",
    description:
      "Ferramenta interna reservada para revisar futuros elementos visuais 3D do Brikaya antes de aplicá-los ao jogo em produção.",
  },
];

function escapeHtmlAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

export function buildDashboardShellHtml(baseHtml, config) {
  const canonicalUrl = `${CANONICAL_ORIGIN}${config.routePath}`;
  const title = escapeHtmlAttribute(config.title);
  const description = escapeHtmlAttribute(config.description);

  return baseHtml
    .replace(/\n\s*<link rel="manifest" href="[^"]*" \/>/, "")
    .replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonicalUrl}" />`,
    )
    .replace(
      /<meta name="robots" content="[^"]*" \/>/,
      '<meta name="robots" content="noindex,follow" />',
    )
    .replace(/\n\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, "")
    .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${canonicalUrl}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${title}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${title}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${description}" />`,
    );
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function run() {
  const distRoot = resolve(process.cwd(), DIST_DIR);
  const baseHtml = readFileSync(join(distRoot, PLAY_INDEX_PATH), "utf8");

  for (const config of DASHBOARD_SHELL_ROUTES) {
    const shellHtml = buildDashboardShellHtml(baseHtml, config);
    writeFile(
      join(distRoot, config.routePath.replace(/^\//, ""), INDEX_FILE),
      shellHtml,
    );
  }

  console.log(`dashboard-shells ok: routes=${DASHBOARD_SHELL_ROUTES.length}`);
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return entry.endsWith("generate-dashboard-shells.mjs");
}

if (isMainModule()) {
  run();
}
