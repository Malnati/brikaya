#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPuppeteerLaunchOptions } from "../tests/e2e/browserLauncher.js";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const proposalsDir = path.join(
  repoRoot,
  "docs/assets/issues/ambient-electric-lightning/proposals",
);
const previewPath = path.join(proposalsDir, "preview.html");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const requestPath = decodeURIComponent(
        new URL(request.url ?? "/", "http://localhost").pathname,
      );
      const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
      const filePath = path.join(
        rootDir,
        safePath === "/" ? "preview.html" : safePath,
      );

      if (
        !filePath.startsWith(rootDir) ||
        !fs.existsSync(filePath) ||
        fs.statSync(filePath).isDirectory()
      ) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const extension = path.extname(filePath);
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[extension] ?? "application/octet-stream",
      });
      fs.createReadStream(filePath).pipe(response);
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Falha ao iniciar servidor estático"));
        return;
      }
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

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

async function captureSet(page, baseUrl, variant, mode, outputDir) {
  await page.goto(`${baseUrl}/preview.html`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.__proposalCapture?.renderFrame);
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

  const { server, baseUrl } = await startStaticServer(proposalsDir);
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions());

  const manifest = {
    generatedAt: new Date().toISOString(),
    previewPath:
      "docs/assets/issues/ambient-electric-lightning/proposals/preview.html",
    visualModel: "fullscreen-natural-fractal",
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
        const captures = await captureSet(
          page,
          baseUrl,
          variant.id,
          mode,
          outputDir,
        );
        manifest.sets.push({
          variant: variant.id,
          mode,
          outputDir: `docs/assets/issues/ambient-electric-lightning/proposals/${variant.folder}`,
          captures,
        });
        console.log(
          `Capturado ${variant.id}/${mode} (${captures.length} frames)`,
        );
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  const manifestPath = path.join(proposalsDir, "capture-manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Manifesto salvo em ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
