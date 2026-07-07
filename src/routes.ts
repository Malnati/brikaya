import type { AppLocale } from "./i18n/messages";

export const HOME_ROUTE_PATH = "/";
export const DOWNLOADS_ROUTE_PATH = "/downloads/";
export const ABOUT_ROUTE_PATH = "/about/";
export const LEGAL_ROUTE_PATH = "/legal/";
export const PRIVACY_ROUTE_PATH = "/privacy/";
export const TERMS_ROUTE_PATH = "/terms/";
export const USER_AGREEMENT_ROUTE_PATH = "/user-agreement/";
export const LICENSE_ROUTE_PATH = "/license/";
export const DATA_DELETION_ROUTE_PATH = "/data-deletion/";
export const COOKIES_ROUTE_PATH = "/cookies/";
export const SUPPORT_ROUTE_PATH = "/support/";

export const LEGAL_ROUTE_PATHS = [
  ABOUT_ROUTE_PATH,
  LEGAL_ROUTE_PATH,
  PRIVACY_ROUTE_PATH,
  TERMS_ROUTE_PATH,
  USER_AGREEMENT_ROUTE_PATH,
  LICENSE_ROUTE_PATH,
  DATA_DELETION_ROUTE_PATH,
  COOKIES_ROUTE_PATH,
  SUPPORT_ROUTE_PATH,
] as const;

export type PublicRoutePath = typeof HOME_ROUTE_PATH | typeof DOWNLOADS_ROUTE_PATH;
export type LegalRoutePath = (typeof LEGAL_ROUTE_PATHS)[number];

const PATH_SEPARATOR = "/";
const EMPTY_PATH = "";
const TRAILING_SLASH_PATTERN = /\/+$/;
const LEADING_SLASH_PATTERN = /^\/+/;

function ensureLeadingSlash(pathname: string): string {
  if (!pathname) return HOME_ROUTE_PATH;
  return pathname.startsWith(PATH_SEPARATOR)
    ? pathname
    : `${PATH_SEPARATOR}${pathname}`;
}

function ensureTrailingSlash(pathname: string): string {
  if (pathname === HOME_ROUTE_PATH) return pathname;
  return pathname.endsWith(PATH_SEPARATOR) ? pathname : `${pathname}${PATH_SEPARATOR}`;
}

export function normalizePublicPath(pathname: string): string {
  const [pathOnly] = ensureLeadingSlash(pathname).split(/[?#]/);
  const normalizedPath = pathOnly.replace(/\/+/g, PATH_SEPARATOR);
  return ensureTrailingSlash(normalizedPath || HOME_ROUTE_PATH);
}

export function stripLocalePrefix(
  pathname: string,
  supportedLocales: readonly AppLocale[],
): string {
  const normalizedPath = normalizePublicPath(pathname);
  const segments = normalizedPath.split(PATH_SEPARATOR).filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment || !supportedLocales.includes(firstSegment as AppLocale)) {
    return normalizedPath;
  }

  const routeSegments = segments.slice(1);
  if (routeSegments.length === 0) return HOME_ROUTE_PATH;

  return ensureTrailingSlash(`${PATH_SEPARATOR}${routeSegments.join(PATH_SEPARATOR)}`);
}

export function getPublicRoutePath(
  pathname: string,
  supportedLocales: readonly AppLocale[],
): PublicRoutePath {
  const routePath = stripLocalePrefix(pathname, supportedLocales);
  if (routePath === DOWNLOADS_ROUTE_PATH) return DOWNLOADS_ROUTE_PATH;

  return HOME_ROUTE_PATH;
}

export function isDownloadsRoute(
  pathname: string,
  supportedLocales: readonly AppLocale[],
): boolean {
  return getPublicRoutePath(pathname, supportedLocales) === DOWNLOADS_ROUTE_PATH;
}

export function getLocalizedPublicPath(
  locale: AppLocale,
  defaultLocale: AppLocale,
  routePath: PublicRoutePath = HOME_ROUTE_PATH,
): string {
  const normalizedRoutePath = normalizePublicPath(routePath) as PublicRoutePath;
  if (locale === defaultLocale) return normalizedRoutePath;

  const routeWithoutLeadingSlash = normalizedRoutePath.replace(
    LEADING_SLASH_PATTERN,
    EMPTY_PATH,
  );
  const routeSuffix = routeWithoutLeadingSlash.replace(
    TRAILING_SLASH_PATTERN,
    EMPTY_PATH,
  );

  if (!routeSuffix) return `${PATH_SEPARATOR}${locale}${PATH_SEPARATOR}`;

  return `${PATH_SEPARATOR}${locale}${PATH_SEPARATOR}${routeSuffix}${PATH_SEPARATOR}`;
}


function getLegalLocaleKey(locale: AppLocale): string {
  if (locale === "zh-CN") return "zh-Hans";
  if (locale === "zh-TW" || locale === "zh-HK") return "zh-Hant";
  return locale.split("-")[0];
}

export function getPrimaryLegalLocale(locale: AppLocale): AppLocale | "en-US" {
  const key = getLegalLocaleKey(locale);
  if (key === "en") return "en-US";
  if (key === "pt") return "pt-BR";
  if (key === "es") return "es-419";
  if (key === "hi") return "hi-IN";
  if (key === "zh-Hans") return "zh-CN";
  if (key === "zh-Hant") return "zh-TW";

  const baseLocale = locale.split("-")[0] as AppLocale;
  return baseLocale;
}

export function getLocalizedLegalPath(
  locale: AppLocale,
  legalRoutePath: LegalRoutePath,
): string {
  const normalizedRoutePath = normalizePublicPath(legalRoutePath) as LegalRoutePath;
  const legalLocale = getPrimaryLegalLocale(locale);
  if (legalLocale === "en-US") return normalizedRoutePath;

  return `${PATH_SEPARATOR}${legalLocale}${normalizedRoutePath}`;
}
