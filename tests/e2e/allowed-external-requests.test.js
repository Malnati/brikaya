// tests/e2e/allowed-external-requests.test.js
import assert from "node:assert/strict";
import test from "node:test";

import { classifyExternalRequests } from "./allowed-external-requests.js";

const PUBLIC_URL = "https://brikaya.com/";

test("classifies approved ad requests separately from unexpected external requests", () => {
  const result = classifyExternalRequests(
    [
      "https://brikaya.com/assets/visual/components/spr-component-basic-red-normal.svg",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-safe",
      "https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-safe",
      "https://ep1.adtrafficquality.google/getconfig/sodar?sv=200",
      "https://ep2.adtrafficquality.google/sodar/sodar2.js",
      "https://www.google.com/recaptcha/api2/aframe",
      "https://www.google.com/search?q=brikaya",
      "https://cdn.example.com/asset.png",
    ],
    PUBLIC_URL,
  );

  assert.deepEqual(result.allowedExternalRequests, [
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-safe",
    "https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-safe",
    "https://ep1.adtrafficquality.google/getconfig/sodar?sv=200",
    "https://ep2.adtrafficquality.google/sodar/sodar2.js",
    "https://www.google.com/recaptcha/api2/aframe",
  ]);
  assert.deepEqual(result.unexpectedExternalRequests, [
    "https://www.google.com/search?q=brikaya",
    "https://cdn.example.com/asset.png",
  ]);
});
