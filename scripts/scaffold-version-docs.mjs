// scripts/scaffold-version-docs.mjs
import { existsSync, writeFileSync } from "node:fs";

import { buildVersionFromGit } from "./build-version.mjs";
import { versionDocPaths } from "./version-doc-paths.mjs";

const BUILD_VERSION_ENV_KEY = "BRIKAYA_BUILD_VERSION";
const FORCE_ENV_KEY = "BRIKAYA_SCAFFOLD_FORCE";

function resolveBuildVersion() {
  const configuredVersion = process.env[BUILD_VERSION_ENV_KEY]?.trim();
  return configuredVersion || buildVersionFromGit(process.cwd());
}

function buildTagTemplate(versionLabel) {
  return `---
tag: ${versionLabel}
title: Brikaya ${versionLabel}
---

Descreva em uma linha o que esta versão entrega.
`;
}

function buildReleaseTemplate(versionLabel) {
  return `---
release: ${versionLabel}
title: Brikaya ${versionLabel}
prerelease: false
---

## Destaque

- 

## Mudanças

- 

## Validação

- Menu: Versão ${versionLabel} / Version ${versionLabel}
- Produção: https://brikaya.com/
`;
}

function writeIfMissing(filePath, contents, force) {
  if (existsSync(filePath) && !force) {
    console.log(`Mantido existente: ${filePath}`);
    return false;
  }

  writeFileSync(filePath, contents, "utf8");
  console.log(`Criado: ${filePath}`);
  return true;
}

function run() {
  const versionLabel = resolveBuildVersion();
  const force = process.env[FORCE_ENV_KEY] === "true";
  const { tagDocPath, releaseDocPath } = versionDocPaths(versionLabel);

  writeIfMissing(tagDocPath, buildTagTemplate(versionLabel), force);
  writeIfMissing(releaseDocPath, buildReleaseTemplate(versionLabel), force);
}

run();
