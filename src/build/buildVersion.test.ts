// src/build/buildVersion.test.ts
import { execFileSync } from "node:child_process";

const BUILD_VERSION_IMPORT_SCRIPT = `
  import { buildVersionFromGit } from './scripts/build-version.mjs';
  console.log(buildVersionFromGit(process.cwd()));
`;
const BUILD_VERSION_FALLBACK_SCRIPT = `
  import { buildVersionFromGit } from './scripts/build-version.mjs';
  console.log(buildVersionFromGit('/caminho/inexistente/brickbreaker'));
`;

describe("buildVersionFromGit", () => {
  it("gera rótulo vN a partir da contagem de commits", () => {
    const commitCount = execFileSync("git", ["rev-list", "--count", "HEAD"], {
      encoding: "utf8",
    }).trim();

    const buildVersion = execFileSync(
      "node",
      ["--input-type=module", "-e", BUILD_VERSION_IMPORT_SCRIPT],
      { encoding: "utf8" },
    ).trim();

    expect(buildVersion).toBe(`v${commitCount}`);
  });

  it("usa fallback v0 quando Git não está disponível", () => {
    const buildVersion = execFileSync(
      "node",
      ["--input-type=module", "-e", BUILD_VERSION_FALLBACK_SCRIPT],
      { encoding: "utf8" },
    ).trim();

    expect(buildVersion).toBe("v0");
  });
});
