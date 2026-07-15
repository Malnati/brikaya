// scripts/build-version.test.mjs
import assert from "node:assert/strict";

import {
  npmSemverFromBuildVersion,
  commitCountFromBuildVersion,
  buildVersionLabelFromCount,
} from "./build-version.mjs";

assert.equal(buildVersionLabelFromCount(158), "v158");
assert.equal(buildVersionLabelFromCount(1), "v1");
assert.equal(buildVersionLabelFromCount(0), "v0");
assert.equal(buildVersionLabelFromCount(-3), "v0");

assert.equal(npmSemverFromBuildVersion("v158"), "158.0.0");
assert.equal(npmSemverFromBuildVersion("v1"), "1.0.0");
assert.equal(npmSemverFromBuildVersion("v0"), "0.0.0");
assert.throws(() => npmSemverFromBuildVersion("1.2.5"), /Versão inválida/);
assert.throws(() => npmSemverFromBuildVersion("v"), /Versão inválida/);

assert.equal(commitCountFromBuildVersion("v160"), 160);
assert.equal(commitCountFromBuildVersion("v0"), 0);
assert.throws(() => commitCountFromBuildVersion("bad"), /Versão inválida/);

console.log("build-version unit ok");
