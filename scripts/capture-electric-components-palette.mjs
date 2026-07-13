#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPuppeteerLaunchOptions } from "../tests/e2e/browserLauncher.js";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const paletteDir = path.join(repoRoot, "docs/paletas/componentes");
const capturesDir = path.join(paletteDir, "captures");
const previewPath = path.join(paletteDir, "preview.html");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
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

const CAPTURES = [
  { id: "palette-preview-circuits", tab: "circuits" },
  { id: "palette-preview-vfx", tab: "vfx" },
  { id: "palette-preview-ambient-arcade", tab: "ambient", variant: "arcade" },
  { id: "palette-preview-tokens", tab: "tokens" },
];

async function main() {
  fs.mkdirSync(capturesDir, { recursive: true });
  const { server, baseUrl } = await startStaticServer(repoRoot);
  const browser = await puppeteer.launch(buildPuppeteerLaunchOptions());
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const manifest = { generatedAt: new Date().toISOString(), captures: [] };

  try {
    for (const capture of CAPTURES) {
      await page.goto(`${baseUrl}/${path.relative(repoRoot, previewPath)}`, {
        waitUntil: "networkidle0",
      });
      await page.click(`button[data-tab="${capture.tab}"]`);
      if (capture.variant) {
        await page.select("#variantSelect", capture.variant);
        await page.waitForTimeout(1200);
      }
      const outputPath = path.join(capturesDir, `${capture.id}.png`);
      await page.screenshot({ path: outputPath, fullPage: true });
      manifest.captures.push({
        id: capture.id,
        file: `captures/${capture.id}.png`,
        tab: capture.tab,
        variant: capture.variant ?? null,
      });
      console.log(`Captura: ${capture.id}`);
    }

    fs.writeFileSync(
      path.join(paletteDir, "capture-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
