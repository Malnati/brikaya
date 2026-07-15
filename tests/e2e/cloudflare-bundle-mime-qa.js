// tests/e2e/cloudflare-bundle-mime-qa.js
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { assertAllowedQaHostname } from "./publicQaEnv.js";

const DEFAULT_PUBLIC_URL = "https://brikaya.com/play/";
const DEFAULT_REPORT_PATH = "tmp/reports/cloudflare-bundle-mime-qa.json";
const PUBLIC_URL_ENV_KEY = "BRIKAYA_PUBLIC_URL";
const REPORT_ENV_KEY = "BRIKAYA_BUNDLE_MIME_QA_REPORT";
const STALE_PROBE_PATH = "/assets/index-__stale_probe__.js";
const INDEX_SCRIPT_PATTERN = /assets\/index-[^"']+\.js/i;
const INDEX_STYLE_PATTERN = /assets\/index-[^"']+\.css/i;
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const JAVASCRIPT_CONTENT_TYPE = "javascript";
const CSS_CONTENT_TYPE = "css";
const HTML_CONTENT_TYPE = "text/html";
const FETCH_TIMEOUT_MS = 15000;

function env(name, fallback) {
  return process.env[name] || fallback;
}

function publicUrl() {
  return env(PUBLIC_URL_ENV_KEY, DEFAULT_PUBLIC_URL);
}

function isLocalPreviewUrl() {
  const hostname = new URL(publicUrl()).hostname;
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function reportPath() {
  return env(REPORT_ENV_KEY, DEFAULT_REPORT_PATH);
}

function ensureParentDirectory(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function withCacheBust(pathname) {
  const url = new URL(pathname, publicUrl());
  url.searchParams.set("qaBundleMimeCheck", String(Date.now()));
  return url;
}

async function fetchProbe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    return {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
    };
  } finally {
    clearTimeout(timer);
  }
}

function extractBundlePaths(indexHtml) {
  const script = indexHtml.match(INDEX_SCRIPT_PATTERN)?.[0];
  const style = indexHtml.match(INDEX_STYLE_PATTERN)?.[0];

  assert(script, "Não foi possível extrair bundle JS do index publicado.");
  assert(style, "Não foi possível extrair bundle CSS do index publicado.");

  return { script, style };
}

function isExpectedBundleContentType(contentType, bundleKind) {
  const normalizedContentType = contentType.toLowerCase();

  if (normalizedContentType.includes(HTML_CONTENT_TYPE)) {
    return false;
  }

  if (bundleKind === JAVASCRIPT_CONTENT_TYPE) {
    return normalizedContentType.includes(JAVASCRIPT_CONTENT_TYPE);
  }

  if (bundleKind === CSS_CONTENT_TYPE) {
    return normalizedContentType.includes(CSS_CONTENT_TYPE);
  }

  return false;
}

async function main() {
  const targetUrl = publicUrl();
  assertAllowedQaHostname(targetUrl);

  const indexUrl = withCacheBust("/");
  const indexResponse = await fetch(indexUrl, { cache: "no-store" });
  const indexHtml = await indexResponse.text();

  assert(
    indexResponse.status === HTTP_STATUS_OK,
    `Index publicado indisponível: status=${indexResponse.status}`,
  );

  const bundlePaths = extractBundlePaths(indexHtml);
  const [scriptProbe, styleProbe, staleProbe] = await Promise.all([
    fetchProbe(withCacheBust(`/${bundlePaths.script}`)),
    fetchProbe(withCacheBust(`/${bundlePaths.style}`)),
    fetchProbe(withCacheBust(STALE_PROBE_PATH)),
  ]);

  assert(
    scriptProbe.status === HTTP_STATUS_OK &&
      isExpectedBundleContentType(scriptProbe.contentType, JAVASCRIPT_CONTENT_TYPE),
    `Bundle JS com MIME inválido: status=${scriptProbe.status}; content-type=${scriptProbe.contentType}`,
  );
  assert(
    styleProbe.status === HTTP_STATUS_OK &&
      isExpectedBundleContentType(styleProbe.contentType, CSS_CONTENT_TYPE),
    `Bundle CSS com MIME inválido: status=${styleProbe.status}; content-type=${styleProbe.contentType}`,
  );

  if (isLocalPreviewUrl()) {
    console.log(
      "SKIP stale bundle probe em preview local; validar em deploy publicado.",
    );
  } else {
    assert(
      staleProbe.status === HTTP_STATUS_NOT_FOUND,
      `Probe stale bundle deveria retornar 404: status=${staleProbe.status}; content-type=${staleProbe.contentType}`,
    );
  }

  const report = {
    publicUrl: targetUrl,
    bundles: {
      script: {
        path: bundlePaths.script,
        ...scriptProbe,
      },
      style: {
        path: bundlePaths.style,
        ...styleProbe,
      },
    },
    staleProbe,
    passed: true,
  };

  ensureParentDirectory(reportPath());
  writeFileSync(reportPath(), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`OK bundle MIME QA: ${bundlePaths.script}, ${bundlePaths.style}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
