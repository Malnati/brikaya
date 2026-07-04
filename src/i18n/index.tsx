// src/i18n/index.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type AppLocale,
  type TranslationKey,
} from "./messages";
import { applySeoMetadata, getLocalePath, getMessage } from "./metadata";

export {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  SUPPORTED_LOCALES,
  type AppLocale,
  type TranslationKey,
} from "./messages";
export { getCanonicalUrl, getLocalePath, getSeoMetadata } from "./metadata";

const LOCALE_STORAGE_KEY = "brikaya-locale";
const LOCALE_SOURCE_STORAGE_KEY = "brikaya-locale-source";
const MANUAL_LOCALE_SOURCE = "manual";
const PATH_SEGMENT_SEPARATOR = "/";
const EMPTY_STRING = "";
const TEMPLATE_PATTERN = /\{\{(\w+)\}\}/g;
const TIME_ZONE_LOCALE_MAP: readonly (readonly [string, AppLocale])[] = [
  ["America/Araguaina", "pt-BR"],
  ["America/Bahia", "pt-BR"],
  ["America/Belem", "pt-BR"],
  ["America/Boa_Vista", "pt-BR"],
  ["America/Campo_Grande", "pt-BR"],
  ["America/Cuiaba", "pt-BR"],
  ["America/Eirunepe", "pt-BR"],
  ["America/Fortaleza", "pt-BR"],
  ["America/Maceio", "pt-BR"],
  ["America/Manaus", "pt-BR"],
  ["America/Noronha", "pt-BR"],
  ["America/Porto_Velho", "pt-BR"],
  ["America/Recife", "pt-BR"],
  ["America/Rio_Branco", "pt-BR"],
  ["America/Santarem", "pt-BR"],
  ["America/Sao_Paulo", "pt-BR"],
  ["America/Argentina/Buenos_Aires", "es-419"],
  ["America/Argentina/Catamarca", "es-419"],
  ["America/Argentina/Cordoba", "es-419"],
  ["America/Argentina/Jujuy", "es-419"],
  ["America/Argentina/La_Rioja", "es-419"],
  ["America/Argentina/Mendoza", "es-419"],
  ["America/Argentina/Rio_Gallegos", "es-419"],
  ["America/Argentina/Salta", "es-419"],
  ["America/Argentina/San_Juan", "es-419"],
  ["America/Argentina/San_Luis", "es-419"],
  ["America/Argentina/Tucuman", "es-419"],
  ["America/Argentina/Ushuaia", "es-419"],
  ["America/Asuncion", "es-419"],
  ["America/Bogota", "es-419"],
  ["America/Caracas", "es-419"],
  ["America/Costa_Rica", "es-419"],
  ["America/El_Salvador", "es-419"],
  ["America/Guatemala", "es-419"],
  ["America/Guayaquil", "es-419"],
  ["America/Havana", "es-419"],
  ["America/La_Paz", "es-419"],
  ["America/Lima", "es-419"],
  ["America/Managua", "es-419"],
  ["America/Mexico_City", "es-419"],
  ["America/Monterrey", "es-419"],
  ["America/Montevideo", "es-419"],
  ["America/Panama", "es-419"],
  ["America/Puerto_Rico", "es-419"],
  ["America/Santiago", "es-419"],
  ["America/Santo_Domingo", "es-419"],
  ["America/Tegucigalpa", "es-419"],
  ["America/Tijuana", "es-419"],
  ["America/New_York", "en"],
  ["America/Chicago", "en"],
  ["America/Denver", "en"],
  ["America/Los_Angeles", "en"],
  ["America/Toronto", "en"],
  ["Europe/London", "en"],
  ["Australia/Sydney", "en"],
  ["Australia/Melbourne", "en"],
  ["Asia/Kolkata", "en-IN"],
  ["Asia/Calcutta", "en-IN"],
  ["Europe/Berlin", "de"],
  ["Europe/Paris", "fr"],
  ["Europe/Rome", "it"],
  ["Asia/Tokyo", "ja"],
  ["Asia/Seoul", "ko"],
  ["Asia/Jakarta", "id"],
  ["Asia/Makassar", "id"],
  ["Asia/Jayapura", "id"],
  ["Asia/Ho_Chi_Minh", "vi"],
  ["Asia/Manila", "fil"],
  ["Asia/Bangkok", "th"],
  ["Asia/Shanghai", "zh-CN"],
  ["Asia/Urumqi", "zh-CN"],
  ["Asia/Chongqing", "zh-CN"],
  ["Asia/Harbin", "zh-CN"],
  ["Asia/Hong_Kong", "zh-CN"],
  ["Asia/Macau", "zh-CN"],
];
const TIME_ZONE_LOCALE_PREFIX_MAP: readonly (readonly [string, AppLocale])[] = [
  ["America/Argentina/", "es-419"],
  ["America/Mexico_", "es-419"],
  ["America/North_Dakota/", "en"],
  ["Australia/", "en"],
];

export type TranslationValues = Record<string, string | number>;

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

interface I18nProviderProps {
  children: ReactNode;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isAppLocale(value: unknown): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

function normalizeLocale(value: string | null | undefined): AppLocale | null {
  if (!value) return null;
  if (isAppLocale(value)) return value;

  const normalizedValue = value.toLowerCase();
  if (normalizedValue.startsWith("pt")) return "pt-BR";
  if (normalizedValue.startsWith("es")) return "es-419";
  if (normalizedValue === "en-in") return "en-IN";
  if (normalizedValue.startsWith("en")) return "en";
  if (normalizedValue.startsWith("hi")) return "hi-IN";
  if (normalizedValue.startsWith("zh")) return "zh-CN";
  if (normalizedValue.startsWith("de")) return "de";
  if (normalizedValue.startsWith("fr")) return "fr";
  if (normalizedValue.startsWith("it")) return "it";
  if (normalizedValue.startsWith("ja")) return "ja";
  if (normalizedValue.startsWith("ko")) return "ko";
  if (normalizedValue.startsWith("id")) return "id";
  if (normalizedValue.startsWith("vi")) return "vi";
  if (normalizedValue.startsWith("fil") || normalizedValue.startsWith("tl"))
    return "fil";
  if (normalizedValue.startsWith("th")) return "th";

  return null;
}

function readLocaleFromPath(): AppLocale | null {
  const firstSegment = window.location.pathname
    .split(PATH_SEGMENT_SEPARATOR)
    .filter(Boolean)[0];

  return normalizeLocale(firstSegment);
}

function readStoredLocale(): AppLocale | null {
  try {
    const storedLocale = normalizeLocale(
      window.localStorage.getItem(LOCALE_STORAGE_KEY),
    );
    if (!storedLocale) return null;
    if (
      window.localStorage.getItem(LOCALE_SOURCE_STORAGE_KEY) ===
      MANUAL_LOCALE_SOURCE
    )
      return storedLocale;
    if (storedLocale === DEFAULT_LOCALE) return null;

    return storedLocale;
  } catch {
    return null;
  }
}

function readBrowserLocale(): AppLocale | null {
  const browserLanguages = Array.isArray(window.navigator.languages)
    ? [...window.navigator.languages]
    : [];
  const browserLanguage = window.navigator.language;
  if (browserLanguage) browserLanguages.push(browserLanguage);

  for (const language of browserLanguages) {
    const locale = normalizeLocale(language);
    if (locale) return locale;
  }

  return null;
}

function readBrowserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

function readLocaleFromTimeZone(): AppLocale | null {
  const timeZone = readBrowserTimeZone();
  if (!timeZone) return null;

  for (const [mappedTimeZone, locale] of TIME_ZONE_LOCALE_MAP) {
    if (timeZone === mappedTimeZone) return locale;
  }

  for (const [mappedPrefix, locale] of TIME_ZONE_LOCALE_PREFIX_MAP) {
    if (timeZone.startsWith(mappedPrefix)) return locale;
  }

  return null;
}

function readInitialLocale(): AppLocale {
  return (
    readLocaleFromPath() ??
    readStoredLocale() ??
    readBrowserLocale() ??
    readLocaleFromTimeZone() ??
    DEFAULT_LOCALE
  );
}

function persistManualLocale(locale: AppLocale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    window.localStorage.setItem(LOCALE_SOURCE_STORAGE_KEY, MANUAL_LOCALE_SOURCE);
  } catch {
    return;
  }
}

function updateLocalizedPath(locale: AppLocale) {
  const nextPath = getLocalePath(locale);
  const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentUrl === nextUrl) return;

  window.history.replaceState(window.history.state, EMPTY_STRING, nextUrl);
}

function interpolate(template: string, values: TranslationValues | undefined) {
  if (!values) return template;

  return template.replace(TEMPLATE_PATTERN, (_match, key: string) =>
    values[key] === undefined ? EMPTY_STRING : String(values[key]),
  );
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(readInitialLocale);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    persistManualLocale(nextLocale);
    updateLocalizedPath(nextLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) =>
      interpolate(getMessage(locale, key), values),
    [locale],
  );

  useEffect(() => {
    applySeoMetadata(locale);
    updateLocalizedPath(locale);
  }, [locale]);

  const contextValue = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const contextValue = useContext(I18nContext);
  if (!contextValue) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => undefined,
      t: (key, values) => interpolate(getMessage(DEFAULT_LOCALE, key), values),
    };
  }

  return contextValue;
}
