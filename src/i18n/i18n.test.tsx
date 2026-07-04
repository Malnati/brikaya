// src/i18n/i18n.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  I18nProvider,
  SUPPORTED_LOCALES,
  getCanonicalUrl,
  getLocalePath,
  getSeoMetadata,
  useI18n,
  type AppLocale,
} from ".";
import { EN_MESSAGES, I18N_MESSAGES, type TranslationKey } from "./messages";

const TEST_ROUTE = "/";
const TEST_TITLE_KEY = "seo.title";
const PORTUGUESE_LOCALE: AppLocale = "pt-BR";
const SPANISH_LOCALE: AppLocale = "es-419";
const CHINESE_LOCALE: AppLocale = "zh-CN";
const CANONICAL_ROOT = "https://brikaya.com/";
const SPANISH_CANONICAL = "https://brikaya.com/es-419/";
const CHINESE_TITLE = "Brikaya — 打砖块街机";
const MENU_LABEL = "Menú";
const LIME_GRAPHITE_LABEL = "Lima grafite";
const COLLISION_SPEED_LABEL = "Velocidade atual:";
const BUTTON_LABEL = "switch";
const ENGLISH_LOCALES = new Set<AppLocale>(["en", "en-IN"]);
const LOCALIZED_APPEARANCE_KEYS: TranslationKey[] = [
  "appearance.option.neon-arcade",
  "appearance.option.retro-default",
  "appearance.option.sunset-cabinet",
  "appearance.option.block-pixel",
];
const USER_COPY_KEYS: TranslationKey[] = [
  "menu.tools",
  "menu.logs",
  "logs.close",
  "logs.title",
  "logs.allEvents",
  "logs.refresh",
  "logs.export",
  "logs.clear",
];
const TECHNICAL_COPY_PATTERN = /\b(logs?|tools?)\b/i;

function LocaleProbe() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div>
      <p>{locale}</p>
      <p>{t(TEST_TITLE_KEY)}</p>
      <button type="button" onClick={() => setLocale(SPANISH_LOCALE)}>
        {BUTTON_LABEL}
      </button>
      <p>{t("controls.menu")}</p>
      <p>{t("appearance.option.lime-graphite")}</p>
      <p>{t("collision.currentSpeed")}</p>
    </div>
  );
}

describe("i18n offline do Brikaya", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", TEST_ROUTE);
    window.localStorage.clear();
  });

  it("publica metadados para todos os locales planejados", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const metadata = getSeoMetadata(locale);

      expect(metadata.title).toContain("Brikaya");
      expect(metadata.description.length).toBeGreaterThan(24);
      expect(metadata.canonicalUrl).toBe(getCanonicalUrl(locale));
      expect(getLocalePath(locale).startsWith(TEST_ROUTE)).toBe(true);
    }
  });

  it("usa pt-BR por padrão e troca idioma com html lang, canonical e URL", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(PORTUGUESE_LOCALE)).toBeInTheDocument();
    expect(screen.getByText(LIME_GRAPHITE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(COLLISION_SPEED_LABEL)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(PORTUGUESE_LOCALE);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      CANONICAL_ROOT,
    );

    await user.click(screen.getByRole("button", { name: BUTTON_LABEL }));

    expect(screen.getByText(SPANISH_LOCALE)).toBeInTheDocument();
    expect(screen.getByText(MENU_LABEL)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(SPANISH_LOCALE);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      SPANISH_CANONICAL,
    );
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
  });

  it("reconhece locale zh-CN em rota pública localizada", () => {
    window.history.replaceState(null, "", getLocalePath(CHINESE_LOCALE));

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(CHINESE_LOCALE)).toBeInTheDocument();
    expect(screen.getByText(CHINESE_TITLE)).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(CHINESE_LOCALE);
  });

  it("mantém opções de aparência localizadas sem fallback visual em inglês", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (ENGLISH_LOCALES.has(locale)) continue;

      for (const key of LOCALIZED_APPEARANCE_KEYS) {
        expect(I18N_MESSAGES[locale][key]).toBeTruthy();
        expect(I18N_MESSAGES[locale][key]).not.toBe(EN_MESSAGES[key]);
      }
    }
  });

  it("mantém rótulos visíveis de histórico em linguagem de produto", () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const key of USER_COPY_KEYS) {
        expect(I18N_MESSAGES[locale][key]).toBeTruthy();
        expect(I18N_MESSAGES[locale][key]).not.toMatch(TECHNICAL_COPY_PATTERN);
      }
    }
  });
});
