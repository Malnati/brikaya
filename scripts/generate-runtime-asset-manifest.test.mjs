// scripts/generate-runtime-asset-manifest.test.mjs
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildManifest } from "./generate-runtime-asset-manifest.mjs";

const fixtureRoot = mkdtempSync(join(tmpdir(), "brikaya-manifest-"));
const visualDir = join(fixtureRoot, "assets", "visual");
mkdirSync(visualDir, { recursive: true });
writeFileSync(join(visualDir, "dot.svg"), "<svg xmlns='http://www.w3.org/2000/svg'></svg>\n");

const manifest = buildManifest(fixtureRoot, "v99");

assert.equal(manifest.buildVersion, "v99");
assert.equal(typeof manifest.version, "string");
assert.ok(manifest.version.startsWith("sha256-"));
assert.equal(manifest.schemaVersion, 1);
assert.ok(manifest.assets.length >= 1);

console.log("generate-runtime-asset-manifest unit ok");
