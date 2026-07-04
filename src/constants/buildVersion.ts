// src/constants/buildVersion.ts
declare const __BRIKAYA_BUILD_VERSION__: string | undefined;

const FALLBACK_BUILD_VERSION = "v0";
const BUILD_VERSION_PATTERN = /^v\d+$/;
const BUILD_VERSION_MENU_PREFIX = "Versão";
const BUILD_VERSION_ARIA_PREFIX = "Versão do jogo";

function readBuildVersion(): string {
  if (
    typeof __BRIKAYA_BUILD_VERSION__ === "string" &&
    BUILD_VERSION_PATTERN.test(__BRIKAYA_BUILD_VERSION__)
  ) {
    return __BRIKAYA_BUILD_VERSION__;
  }

  return FALLBACK_BUILD_VERSION;
}

export const BUILD_VERSION_LABEL = readBuildVersion();
export const BUILD_VERSION_MENU_LABEL = `${BUILD_VERSION_MENU_PREFIX} ${BUILD_VERSION_LABEL}`;
export const BUILD_VERSION_ARIA_LABEL = `${BUILD_VERSION_ARIA_PREFIX} ${BUILD_VERSION_LABEL}`;
