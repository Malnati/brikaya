// tests/e2e/publicQaEnv.js
const DEFAULT_PUBLIC_URL = "https://brikaya.com/";

const ALLOWED_QA_HOSTNAMES = new Set([
  "brikaya.com",
  "dev.brikaya.com",
  "127.0.0.1",
  "localhost",
]);

export function publicQaUrl() {
  return process.env.BRIKAYA_PUBLIC_URL || DEFAULT_PUBLIC_URL;
}

export function canonicalOrigin() {
  const url = new URL(publicQaUrl());
  return `${url.protocol}//${url.host}/`;
}

const PAGES_PREVIEW_HOST_SUFFIX = ".pages.dev";

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
