// tests/e2e/allowed-external-requests.js
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
    } else if (parsedUrl.origin === publicOrigin || isApprovedExternalRequest(parsedUrl)) {
      allowedExternalRequests.push(requestUrl);
    } else {
      unexpectedExternalRequests.push(requestUrl);
    }
  }

  return { allowedExternalRequests, unexpectedExternalRequests };
}
