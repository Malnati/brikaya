// scripts/sync-package-version.test.mjs
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  readExpectedNpmSemver,
  syncPackageVersionFiles,
  verifyPackageVersionFiles,
} from "./sync-package-version.mjs";

const fixtureRoot = mkdtempSync(join(tmpdir(), "brikaya-pkg-version-"));
const packageJsonPath = join(fixtureRoot, "package.json");
const packageLockPath = join(fixtureRoot, "package-lock.json");

writeFileSync(
  packageJsonPath,
  JSON.stringify({ name: "brikaya", version: "1.2.5" }, null, 2) + "\n",
);
writeFileSync(
  packageLockPath,
  JSON.stringify(
    {
      name: "brikaya",
      version: "1.2.5",
      lockfileVersion: 3,
      packages: {
        "": { name: "brikaya", version: "1.2.5" },
      },
    },
    null,
    2,
  ) + "\n",
);

const expectedSemver = "42.0.0";
const synced = syncPackageVersionFiles({
  cwd: fixtureRoot,
  npmSemver: expectedSemver,
});

assert.equal(synced.npmSemver, expectedSemver);
assert.equal(JSON.parse(readFileSync(packageJsonPath, "utf8")).version, expectedSemver);

const lock = JSON.parse(readFileSync(packageLockPath, "utf8"));
assert.equal(lock.version, expectedSemver);
assert.equal(lock.packages[""].version, expectedSemver);

verifyPackageVersionFiles({
  cwd: fixtureRoot,
  npmSemver: expectedSemver,
});

assert.throws(
  () =>
    verifyPackageVersionFiles({
      cwd: fixtureRoot,
      npmSemver: "99.0.0",
    }),
  /package.json version/,
);

assert.equal(readExpectedNpmSemver({ buildVersionLabel: "v42" }), "42.0.0");

console.log("sync-package-version unit ok");
