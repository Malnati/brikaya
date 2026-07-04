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
const TEST_CAMPAIGN_SEARCH =
  "?utm_source=google&utm_medium=paid-search&utm_campaign=brikaya-p0-latam-test";
const TEST_TITLE_KEY = "seo.title";
const PORTUGUESE_LOCALE: AppLocale = "pt-BR";
const SPANISH_LOCALE: AppLocale = "es-419";
const CHINESE_LOCALE: AppLocale = "zh-CN";
const HINDI_LOCALE: AppLocale = "hi-IN";
const ENGLISH_LOCALE: AppLocale = "en";
const GERMAN_LOCALE: AppLocale = "de";
const UNSUPPORTED_DUTCH_LANGUAGE = "nl-NL";
const GERMAN_BROWSER_LANGUAGE = "de-DE";
const FRENCH_BROWSER_LANGUAGE = "fr-FR";
const FRENCH_LOCALE: AppLocale = "fr";
const CANONICAL_ROOT = "https://brikaya.com/";
const SPANISH_CANONICAL = "https://brikaya.com/es-419/";
const CHINESE_TITLE = "Brikaya — 打砖块街机";
const MENU_LABEL = "Menú";
const LIME_GRAPHITE_LABEL = "Lima grafite";
const COLLISION_SPEED_LABEL = "Velocidade atual:";
const BUTTON_LABEL = "switch";
const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const LOCALE_DETECTION_STORAGE_KEY = "brikaya-locale-detection";
const MANUAL_LOCALE_SOURCE = "manual";
const NAVIGATOR_LANGUAGES_PROPERTY = "languages";
const NAVIGATOR_LANGUAGE_PROPERTY = "language";
const GERMANY_TIME_ZONE = "Europe/Berlin";
const MEXICO_TIME_ZONE = "America/Mexico_City";
const INDIA_TIME_ZONE = "Asia/Kolkata";
const UNSUPPORTED_TIME_ZONE = "Europe/Amsterdam";
const ENGLISH_LOCALES = new Set<AppLocale>(["en", "en-IN"]);
const LOCALIZED_APPEARANCE_KEYS: TranslationKey[] = [
  "appearance.option.auto-by-level",
  "appearance.option.neon-arcade",
  "appearance.option.retro-default",
  "appearance.option.sunset-cabinet",
  "appearance.option.real-metro-night",
  "appearance.option.real-auto-garage",
  "appearance.option.real-bio-lab",
  "appearance.option.real-ancient-temple",
  "appearance.option.real-orbital-station",
  "appearance.option.real-metro-tunnel",
  "appearance.option.real-workshop-steel",
  "appearance.option.real-bio-lab-glass",
  "appearance.option.real-temple-stone",
  "appearance.option.real-orbital-deck",
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
  const { locale, setLocale, setLocaleFromLocation, t } = useI18n();

  return (
    <div>
      <p>{locale}</p>
      <p>{t(TEST_TITLE_KEY)}</p>
      <button type="button" onClick={() => setLocale(SPANISH_LOCALE)}>
        {BUTTON_LABEL}
      </button>
      <button
        type="button"
        onClick={() => setLocaleFromLocation(GERMAN_LOCALE)}
      >
        location
      </button>
      <p>{t("controls.menu")}</p>
      <p>{t("appearance.option.lime-graphite")}</p>
      <p>{t("collision.currentSpeed")}</p>
    </div>
  );
}

function setNavigatorLocale(languages: readonly string[], language: string) {
  Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGES_PROPERTY, {
    configurable: true,
    value: languages,
  });
  Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGE_PROPERTY, {
    configurable: true,
    value: language,
  });
}

function setBrowserTimeZone(timeZone: string) {
  jest.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () =>
      ({
        resolvedOptions: () => ({ timeZone }),
      }) as Intl.DateTimeFormat,
  );
}

describe("i18n offline do Brikaya", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", TEST_ROUTE);
    window.localStorage.clear();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    setNavigatorLocale([PORTUGUESE_LOCALE], PORTUGUESE_LOCALE);
    setBrowserTimeZone("America/Sao_Paulo");
    (window.localStorage.setItem as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      LOCALE_SOURCE_STORAGE_KEY,
      MANUAL_LOCALE_SOURCE,
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      SPANISH_CANONICAL,
    );
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
  });

  it("preserva parâmetros de campanha na navegação e mantém canonical limpo", async () => {
    const user = userEvent.setup();
    window.history.replaceState(
      null,
      "",
      `${TEST_ROUTE}${TEST_CAMPAIGN_SEARCH}`,
    );

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: BUTTON_LABEL }));

    expect(window.location.search).toBe(TEST_CAMPAIGN_SEARCH);
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      SPANISH_CANONICAL,
    );
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

  it("usa locale do navegador quando não há rota nem preferência salva", () => {
    setBrowserTimeZone(GERMANY_TIME_ZONE);
    setNavigatorLocale(["es-MX", "en-US"], "es-MX");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(SPANISH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
    expect(document.documentElement.lang).toBe(SPANISH_LOCALE);
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      LOCALE_STORAGE_KEY,
      SPANISH_LOCALE,
    );
  });

  it("registra idioma sugerido por região sem salvar coordenadas", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-04T10:00:00.000Z"));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "location" }));

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      LOCALE_DETECTION_STORAGE_KEY,
      JSON.stringify({
        version: "2026-07-04-location",
        locale: GERMAN_LOCALE,
        source: "location",
        detectedAt: "2026-07-04T10:00:00.000Z",
      }),
    );
    expect(
      JSON.stringify((window.localStorage.setItem as jest.Mock).mock.calls),
    ).not.toMatch(/latitude|longitude|-23\\.5505|-46\\.6333/i);
  });

  it("mantém preferência salva acima do idioma do navegador", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === LOCALE_STORAGE_KEY) return HINDI_LOCALE;
        if (key === LOCALE_SOURCE_STORAGE_KEY) return MANUAL_LOCALE_SOURCE;
        return null;
      },
    );
    setNavigatorLocale(["es-MX"], "es-MX");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(HINDI_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(HINDI_LOCALE));
  });

  it("ignora locale legado não manual e usa idioma atual do navegador", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => (key === LOCALE_STORAGE_KEY ? HINDI_LOCALE : null),
    );
    setNavigatorLocale([GERMAN_BROWSER_LANGUAGE], GERMAN_BROWSER_LANGUAGE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
  });

  it("avalia todos os idiomas do navegador antes de usar fuso horário", () => {
    setNavigatorLocale(
      [UNSUPPORTED_DUTCH_LANGUAGE, GERMAN_BROWSER_LANGUAGE],
      UNSUPPORTED_DUTCH_LANGUAGE,
    );
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
  });

  it("usa navigator.language quando navigator.languages não está disponível", () => {
    Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGES_PROPERTY, {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, NAVIGATOR_LANGUAGE_PROPERTY, {
      configurable: true,
      value: FRENCH_BROWSER_LANGUAGE,
    });
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(FRENCH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(FRENCH_LOCALE));
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      LOCALE_STORAGE_KEY,
      FRENCH_LOCALE,
    );
  });

  it("usa fuso horário do navegador quando o idioma não é suportado", () => {
    setNavigatorLocale(
      [UNSUPPORTED_DUTCH_LANGUAGE],
      UNSUPPORTED_DUTCH_LANGUAGE,
    );
    setBrowserTimeZone(GERMANY_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(GERMAN_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(GERMAN_LOCALE));
    expect(document.documentElement.lang).toBe(GERMAN_LOCALE);
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      LOCALE_STORAGE_KEY,
      GERMAN_LOCALE,
    );
  });

  it("ignora pt-BR legado automático e usa fuso horário quando não há preferência manual", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => (key === LOCALE_STORAGE_KEY ? PORTUGUESE_LOCALE : null),
    );
    setNavigatorLocale(["nl-NL"], "nl-NL");
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(SPANISH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(SPANISH_LOCALE));
  });

  it("mantém pt-BR manual acima do fuso horário", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === LOCALE_STORAGE_KEY) return PORTUGUESE_LOCALE;
        if (key === LOCALE_SOURCE_STORAGE_KEY) return MANUAL_LOCALE_SOURCE;
        return null;
      },
    );
    setNavigatorLocale(["nl-NL"], "nl-NL");
    setBrowserTimeZone(MEXICO_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(PORTUGUESE_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(PORTUGUESE_LOCALE));
  });

  it("mapeia fuso horário da Índia para inglês indiano quando o idioma não é suportado", () => {
    setNavigatorLocale(["nl-NL"], "nl-NL");
    setBrowserTimeZone(INDIA_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText("en-IN")).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath("en-IN"));
  });

  it("mantém rota pública acima da preferência salva e do navegador", () => {
    window.history.replaceState(null, "", getLocalePath(ENGLISH_LOCALE));
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => (key === LOCALE_STORAGE_KEY ? HINDI_LOCALE : null),
    );
    setNavigatorLocale(["es-MX"], "es-MX");

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(ENGLISH_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(ENGLISH_LOCALE));
  });

  it("usa pt-BR quando idioma e fuso do navegador não são suportados", () => {
    setNavigatorLocale(["nl-NL"], "nl-NL");
    setBrowserTimeZone(UNSUPPORTED_TIME_ZONE);

    render(
      <I18nProvider>
        <LocaleProbe />
      </I18nProvider>,
    );

    expect(screen.getByText(PORTUGUESE_LOCALE)).toBeInTheDocument();
    expect(window.location.pathname).toBe(getLocalePath(PORTUGUESE_LOCALE));
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
