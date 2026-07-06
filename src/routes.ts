import type { AppLocale } from "./i18n/messages";

export const HOME_ROUTE_PATH = "/";
export const DOWNLOADS_ROUTE_PATH = "/downloads/";

export type PublicRoutePath = typeof HOME_ROUTE_PATH | typeof DOWNLOADS_ROUTE_PATH;

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
