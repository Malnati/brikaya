// tests/e2e/publicQaEnv.js
const DEFAULT_PUBLIC_URL = "https://brikaya.com/";

const ALLOWED_QA_HOSTNAMES = new Set([
  "brikaya.com",
  "dev.brikaya.com",
  "127.0.0.1",
  "localhost",
]);

const PAGES_PREVIEW_HOST_SUFFIX = ".pages.dev";

export function publicQaUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

export function canonicalOrigin() {
  const url = new URL(publicQaUrl());
  return `${url.protocol}//${url.host}/`;
}

export function isAllowedQaHostname(hostname) {
  return (
    ALLOWED_QA_HOSTNAMES.has(hostname) ||
    hostname.endsWith(PAGES_PREVIEW_HOST_SUFFIX)
  );
}

export function assertAllowedQaHostname(targetUrl) {
  const parsed = new URL(targetUrl);
  if (!isAllowedQaHostname(parsed.hostname)) {
    throw new Error(
      `QA deve usar hostname permitido (${[...ALLOWED_QA_HOSTNAMES].join(", ")}, *${PAGES_PREVIEW_HOST_SUFFIX}): ${targetUrl}`,
    );
  }
}

export async function applyPortugueseQaLocale(page) {
  const client = await page.createCDPSession();
  await client.send("Emulation.setLocaleOverride", { locale: "pt-BR" });
  await page.setExtraHTTPHeaders({ "Accept-Language": "pt-BR,pt;q=0.9" });
}

export async function seedPortugueseLocaleStorage(page) {
  await page.evaluate(() => {
    window.localStorage.setItem("brikaya-locale", "pt-BR");
    window.localStorage.setItem("brikaya-locale-source", "manual");
  });
}

export async function preparePortugueseQaPage(page, targetUrl) {
  await applyPortugueseQaLocale(page);
  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await seedPortugueseLocaleStorage(page);
}
