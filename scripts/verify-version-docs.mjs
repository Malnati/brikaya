// scripts/verify-version-docs.mjs
import { existsSync } from "node:fs";

import { buildVersionFromGit } from "./build-version.mjs";
import { versionDocPaths } from "./version-doc-paths.mjs";

const BUILD_VERSION_ENV_KEY = "BRIKAYA_BUILD_VERSION";

function resolveBuildVersion() {
  const configuredVersion = process.env[BUILD_VERSION_ENV_KEY]?.trim();
  return configuredVersion || buildVersionFromGit(process.cwd());
}

function run() {
  const buildVersion = resolveBuildVersion();
  const { tagDocPath, releaseDocPath, tagDocRelativePath, releaseDocRelativePath } =
    versionDocPaths(buildVersion);

  const missingPaths = [];
  if (!existsSync(tagDocPath)) {
    missingPaths.push(tagDocRelativePath);
  }
  if (!existsSync(releaseDocPath)) {
    missingPaths.push(releaseDocRelativePath);
  }

  if (missingPaths.length > 0) {
    throw new Error(
      [
        `Documentação de versão ausente para ${buildVersion}.`,
        `Adicione: ${missingPaths.join(", ")}`,
      ].join(" "),
    );
  }

  console.log(`Version docs ok: ${buildVersion}.`);
}

run();
