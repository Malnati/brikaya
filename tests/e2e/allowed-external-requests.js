// tests/e2e/allowed-external-requests.js
const APPROVED_EXTERNAL_HOSTNAMES = new Set([
  "pagead2.googlesyndication.com",
  "googleads.g.doubleclick.net",
  "ep1.adtrafficquality.google",
  "ep2.adtrafficquality.google",
]);

const GOOGLE_RECAPTCHA_HOSTNAME = "www.google.com";
const GOOGLE_RECAPTCHA_PATH_PREFIX = "/recaptcha/";

function parseUrl(candidateUrl) {
  try {
    return new URL(candidateUrl);
  } catch {
    return null;
  }
}

function isApprovedExternalRequest(parsedUrl) {
  if (APPROVED_EXTERNAL_HOSTNAMES.has(parsedUrl.hostname)) return true;

  return (
    parsedUrl.hostname === GOOGLE_RECAPTCHA_HOSTNAME &&
    parsedUrl.pathname.startsWith(GOOGLE_RECAPTCHA_PATH_PREFIX)
  );
}

export function classifyExternalRequests(requestUrls, publicUrl) {
  const publicOrigin = new URL(publicUrl).origin;
  const allowedExternalRequests = [];
  const unexpectedExternalRequests = [];

  for (const requestUrl of requestUrls) {
    const parsedUrl = parseUrl(requestUrl);

    if (!parsedUrl) {
      unexpectedExternalRequests.push(requestUrl);
      continue;
    }

    if (parsedUrl.origin === publicOrigin) continue;

    if (isApprovedExternalRequest(parsedUrl)) {
      allowedExternalRequests.push(requestUrl);
      continue;
    }

    unexpectedExternalRequests.push(requestUrl);
  }

  return { allowedExternalRequests, unexpectedExternalRequests };
}
