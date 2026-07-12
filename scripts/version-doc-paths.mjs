// scripts/version-doc-paths.mjs
import { resolve } from "node:path";

const BUILD_VERSION_PATTERN = /^v\d+$/;
const TAGS_DIR = ".tags";
const RELEASES_DIR = ".releases";

export function assertBuildVersionLabel(versionLabel) {
  if (!BUILD_VERSION_PATTERN.test(versionLabel)) {
    throw new Error(`Versão inválida: ${versionLabel}. Esperado formato vN.`);
  }
}

export function versionDocPaths(versionLabel, cwd = process.cwd()) {
  assertBuildVersionLabel(versionLabel);
  return {
    tagDocPath: resolve(cwd, TAGS_DIR, `${versionLabel}.md`),
    releaseDocPath: resolve(cwd, RELEASES_DIR, `${versionLabel}.md`),
    tagDocRelativePath: `${TAGS_DIR}/${versionLabel}.md`,
    releaseDocRelativePath: `${RELEASES_DIR}/${versionLabel}.md`,
  };
}
