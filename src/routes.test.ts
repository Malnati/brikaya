import {
  ABOUT_ROUTE_PATH,
  DATA_DELETION_ROUTE_PATH,
  DOWNLOADS_ROUTE_PATH,
  FAQ_ROUTE_PATH,
  HOME_ROUTE_PATH,
  HOW_TO_PLAY_ROUTE_PATH,
  LEGAL_ROUTE_PATH,
  PRIVACY_ROUTE_PATH,
  getLocalizedPublicPath,
  getLocalizedLegalPath,
  getLocalizedEditorialPath,
  getPublicRoutePath,
  isDownloadsRoute,
  stripLocalePrefix,
} from "./routes";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./i18n/messages";

describe("public routes", () => {
  it("detecta downloads com e sem prefixo de idioma", () => {
    expect(getPublicRoutePath("/downloads/", SUPPORTED_LOCALES)).toBe(
      DOWNLOADS_ROUTE_PATH,
    );
    expect(getPublicRoutePath("/en/downloads/", SUPPORTED_LOCALES)).toBe(
      DOWNLOADS_ROUTE_PATH,
    );
    expect(isDownloadsRoute("/es-419/downloads/", SUPPORTED_LOCALES)).toBe(
      true,
    );
  });

  it("preserva home para rotas desconhecidas", () => {
    expect(getPublicRoutePath("/", SUPPORTED_LOCALES)).toBe(HOME_ROUTE_PATH);
    expect(getPublicRoutePath("/unknown/", SUPPORTED_LOCALES)).toBe(
      HOME_ROUTE_PATH,
    );
  });

  it("remove apenas prefixos de idioma suportados", () => {
    expect(stripLocalePrefix("/en/downloads/", SUPPORTED_LOCALES)).toBe(
      DOWNLOADS_ROUTE_PATH,
    );
    expect(stripLocalePrefix("/downloads/", SUPPORTED_LOCALES)).toBe(
      DOWNLOADS_ROUTE_PATH,
    );
  });

  it("gera caminhos localizados sem perder a página atual", () => {
    expect(
      getLocalizedPublicPath(DEFAULT_LOCALE, DEFAULT_LOCALE, DOWNLOADS_ROUTE_PATH),
    ).toBe(DOWNLOADS_ROUTE_PATH);
    expect(getLocalizedPublicPath("en", DEFAULT_LOCALE, DOWNLOADS_ROUTE_PATH)).toBe(
      "/en/downloads/",
    );
    expect(getLocalizedPublicPath("en", DEFAULT_LOCALE, HOME_ROUTE_PATH)).toBe(
      "/en/",
    );
  });

  it("gera caminhos legais por idioma principal sem duplicar variantes", () => {
    expect(getLocalizedLegalPath("en", PRIVACY_ROUTE_PATH)).toBe("/privacy/");
    expect(getLocalizedLegalPath("en-AU", PRIVACY_ROUTE_PATH)).toBe("/privacy/");
    expect(getLocalizedLegalPath("pt-BR", PRIVACY_ROUTE_PATH)).toBe(
      "/pt-BR/privacy/",
    );
    expect(getLocalizedLegalPath("pt-PT", PRIVACY_ROUTE_PATH)).toBe(
      "/pt-BR/privacy/",
    );
    expect(getLocalizedLegalPath("es-ES", PRIVACY_ROUTE_PATH)).toBe(
      "/es-419/privacy/",
    );
    expect(getLocalizedLegalPath("fr-CA", ABOUT_ROUTE_PATH)).toBe("/fr/about/");
    expect(getLocalizedLegalPath("zh-HK", LEGAL_ROUTE_PATH)).toBe(
      "/zh-TW/legal/",
    );
    expect(getLocalizedLegalPath("ar-SA", DATA_DELETION_ROUTE_PATH)).toBe(
      "/ar/data-deletion/",
    );
  });

  it("gera caminhos editoriais só em en-US e pt-BR", () => {
    expect(getLocalizedEditorialPath("en", HOW_TO_PLAY_ROUTE_PATH)).toBe(
      "/how-to-play/",
    );
    expect(getLocalizedEditorialPath("en-AU", FAQ_ROUTE_PATH)).toBe("/faq/");
    expect(getLocalizedEditorialPath("fr", HOW_TO_PLAY_ROUTE_PATH)).toBe(
      "/how-to-play/",
    );
    expect(getLocalizedEditorialPath("pt-BR", HOW_TO_PLAY_ROUTE_PATH)).toBe(
      "/pt-BR/how-to-play/",
    );
    expect(getLocalizedEditorialPath("pt-PT", FAQ_ROUTE_PATH)).toBe(
      "/pt-BR/faq/",
    );
  });
});
