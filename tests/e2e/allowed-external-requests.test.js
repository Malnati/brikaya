// tests/e2e/allowed-external-requests.test.js
import assert from "node:assert/strict";
import test from "node:test";

import { classifyExternalRequests } from "./allowed-external-requests.js";

const PUBLIC_URL = "https://brikaya.com/";

test("rejects advertising requests while allowing only the required external verification frame", () => {
  const result = classifyExternalRequests(
    [
      "https://brikaya.com/assets/visual/components/spr-component-basic-red-normal.svg",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-safe",
      "https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-safe",
      "https://www.google.com/recaptcha/api2/aframe",
    ],
    PUBLIC_URL,
  );

  assert.deepEqual(result.allowedExternalRequests, [
    "https://brikaya.com/assets/visual/components/spr-component-basic-red-normal.svg",
    "https://www.google.com/recaptcha/api2/aframe",
  ]);
  assert.deepEqual(result.unexpectedExternalRequests, [
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-safe",
    "https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-safe",
  ]);
});
