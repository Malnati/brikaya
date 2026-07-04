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
const PATH_SEGMENT_SEPARATOR = "/";
const EMPTY_STRING = "";
const TEMPLATE_PATTERN = /\{\{(\w+)\}\}/g;

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
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function readInitialLocale(): AppLocale {
  return readLocaleFromPath() ?? readStoredLocale() ?? DEFAULT_LOCALE;
}

function persistLocale(locale: AppLocale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
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
    persistLocale(nextLocale);
    updateLocalizedPath(nextLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) =>
      interpolate(getMessage(locale, key), values),
    [locale],
  );

  useEffect(() => {
    applySeoMetadata(locale);
    persistLocale(locale);
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
