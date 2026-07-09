// scripts/run-cloudflare-e2e-suite.mjs
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const E2E_SUITE = [
  "tests/e2e/cloudflare-audio-qa.js",
  "tests/e2e/cloudflare-ball-turret-qa.js",
  "tests/e2e/cloudflare-cinematic-effects-qa.js",
  "tests/e2e/cloudflare-consent-screen-qa.js",
  "tests/e2e/cloudflare-consent-scroll-qa.js",
  "tests/e2e/cloudflare-dashboard-layout-qa.js",
  "tests/e2e/cloudflare-evasive-blocks-qa.js",
  "tests/e2e/cloudflare-gameplay-basic-qa.js",
  "tests/e2e/cloudflare-high-scores-qa.js",
  "tests/e2e/cloudflare-i18n-seo-qa.js",
  "tests/e2e/cloudflare-interlevel-google-ads-qa.js",
  "tests/e2e/cloudflare-laser-powerup-qa.js",
  "tests/e2e/cloudflare-location-language-qa.js",
  "tests/e2e/cloudflare-metal-blocks-qa.js",
  "tests/e2e/cloudflare-mobile-qa.js",
  "tests/e2e/cloudflare-mobile-journey-qa.js",
  "tests/e2e/cloudflare-no-score-reset-after-brick.js",
  "tests/e2e/cloudflare-offline-pwa-qa.js",
  "tests/e2e/cloudflare-orientation-lock-qa.js",
  "tests/e2e/cloudflare-phase-transition-qa.js",
  "tests/e2e/cloudflare-phase10-stability-qa.js",
  "tests/e2e/cloudflare-reset-preferences-qa.js",
  "tests/e2e/cloudflare-runtime-update-qa.js",
  "tests/e2e/cloudflare-svg-assets-qa.js",
  "tests/e2e/cloudflare-theme-qa.js",
];

function parseListEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveSuite() {
  const only = parseListEnv("BRIKAYA_E2E_ONLY");
  if (only.length > 0) {
    return only.map((entry) => resolve(process.cwd(), entry));
  }

  const skip = new Set(parseListEnv("BRIKAYA_E2E_SKIP"));
  return E2E_SUITE.filter((entry) => !skip.has(entry)).map((entry) =>
    resolve(process.cwd(), entry),
  );
}

function runSuite() {
  const suite = resolveSuite();
  const failures = [];

  console.log(`Executando ${suite.length} testes e2e Cloudflare...`);

  for (const testPath of suite) {
    const label = testPath.split("/").slice(-1)[0];
    console.log(`\n[e2e] ${label}`);
    const result = spawnSync(process.execPath, [testPath], {
      stdio: "inherit",
      env: process.env,
    });

    if (result.status !== 0) {
      failures.push(label);
      console.error(`[e2e] FALHOU: ${label}`);
      break;
    }

    console.log(`[e2e] OK: ${label}`);
  }

  if (failures.length > 0) {
    console.error(`\nSuíte e2e interrompida. Falhas: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log(`\nSuíte e2e concluída com sucesso (${suite.length} testes).`);
}

runSuite();
