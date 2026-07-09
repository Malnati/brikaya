#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildPuppeteerLaunchOptions } from "../tests/e2e/browserLauncher.js";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const proposalsDir = path.join(
  repoRoot,
  "docs/assets/issues/ambient-electric-lightning/proposals",
);
const previewPath = path.join(proposalsDir, "preview.html");
const previewUrl = pathToFileURL(previewPath).href;

const VARIANTS = [
  { id: "pulse", folder: "variant-a-pulse" },
  { id: "arcade", folder: "variant-b-arcade" },
  { id: "storm", folder: "variant-c-storm" },
];
const MODES = ["classic", "turret"];
const FRAME_CAPTURES = [
  { name: "01", timestamp: 1_000, seed: 11 },
  { name: "02", timestamp: 1_180, seed: 11 },
  { name: "03", timestamp: 1_360, seed: 11 },
  { name: "04", timestamp: 1_520, seed: 11 },
  { name: "05", timestamp: 1_720, seed: 11 },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function captureSet(page, variant, mode, outputDir) {
  await page.goto(previewUrl, { waitUntil: "networkidle0" });
  const captures = [];

  for (const frame of FRAME_CAPTURES) {
    await page.evaluate(
      (payload) => {
        window.__proposalCapture.renderFrame(payload);
      },
      {
        variant,
        mode,
        timestamp: frame.timestamp,
        seed: frame.seed,
        forceBolts: variant === "storm" ? 5 : variant === "arcade" ? 3 : 2,
      },
    );

    const fileName = `${mode}-frame-${frame.name}.png`;
    const filePath = path.join(outputDir, fileName);
    const canvas = await page.$("#preview-canvas");
    await canvas.screenshot({ path: filePath });
    captures.push({
      fileName,
      timestamp: frame.timestamp,
      seed: frame.seed,
      capturedAt: new Date().toISOString(),
    });
  }

  return captures;
}

async function main() {
  if (!fs.existsSync(previewPath)) {
    throw new Error(`Preview não encontrado: ${previewPath}`);
  }

  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions());

  const manifest = {
    generatedAt: new Date().toISOString(),
    previewPath: "docs/assets/issues/ambient-electric-lightning/proposals/preview.html",
    frameCaptures: FRAME_CAPTURES,
    sets: [],
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 920, height: 760, deviceScaleFactor: 1 });

    for (const variant of VARIANTS) {
      for (const mode of MODES) {
        const outputDir = path.join(proposalsDir, variant.folder);
        ensureDir(outputDir);
        const captures = await captureSet(page, variant.id, mode, outputDir);
        manifest.sets.push({
          variant: variant.id,
          mode,
          outputDir: `docs/assets/issues/ambient-electric-lightning/proposals/${variant.folder}`,
          captures,
        });
        console.log(`Capturado ${variant.id}/${mode} (${captures.length} frames)`);
      }
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(proposalsDir, "capture-manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Manifesto salvo em ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
