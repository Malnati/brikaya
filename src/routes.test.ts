import {
  DOWNLOADS_ROUTE_PATH,
  HOME_ROUTE_PATH,
  getLocalizedPublicPath,
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
});
