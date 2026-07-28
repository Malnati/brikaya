import * as importedEligibilityConfig from "../../config/locale-eligibility.json";
import {
  DOWNLOADS_ROUTE_PATH,
  HOME_ROUTE_PATH,
  PLAY_ROUTE_PATH,
  normalizePublicPath,
  type PublicRoutePath,
} from "../routes";
import { SUPPORTED_LOCALES, type AppLocale } from "./messages";

export interface LocaleEligibility {
  playable: boolean;
  searchEdition: boolean;
  adsenseSupported: boolean;
  contentComplete: boolean;
  fallback: boolean;
  indexable: boolean;
  reason?: string;
}

type ConfiguredSearchEdition = Pick<
  LocaleEligibility,
  "adsenseSupported" | "contentComplete" | "fallback" | "reason"
> & {
  locale: AppLocale;
};

type LocaleEligibilityConfig = {
  searchEditions: ConfiguredSearchEdition[];
  indexableTrustPaths: string[];
  alwaysNoindexPaths: string[];
};

const configModule = importedEligibilityConfig as unknown as LocaleEligibilityConfig & {
  default?: LocaleEligibilityConfig;
};
const eligibilityConfig = configModule.default ?? configModule;

const configuredEditions = new Map<AppLocale, ConfiguredSearchEdition>(
  eligibilityConfig.searchEditions.map((edition) => [edition.locale, edition]),
);

export const SEARCH_EDITION_LOCALES = eligibilityConfig.searchEditions.map(
  (edition) => edition.locale,
);
export const INDEXABLE_TRUST_PATHS = eligibilityConfig.indexableTrustPaths;
export const ALWAYS_NOINDEX_PATHS = eligibilityConfig.alwaysNoindexPaths;

function noSearchEditionEligibility(playable: boolean): LocaleEligibility {
  return {
    playable,
    searchEdition: false,
    adsenseSupported: false,
    contentComplete: false,
    fallback: true,
    indexable: false,
    reason: playable
      ? "Locale is playable but has no complete search edition."
      : "Locale is not supported.",
  };
}

export function getLocaleEligibility(locale: AppLocale): LocaleEligibility {
  const playable = SUPPORTED_LOCALES.includes(locale);
  const edition = configuredEditions.get(locale);
  if (!edition) return noSearchEditionEligibility(playable);

  const searchEdition = true;
  const { adsenseSupported, contentComplete, fallback, reason } = edition;
  const indexable =
    searchEdition && adsenseSupported && contentComplete && !fallback;

  return {
    playable,
    searchEdition,
    adsenseSupported,
    contentComplete,
    fallback,
    indexable,
    ...(reason ? { reason } : {}),
  };
}

export const INDEXABLE_SEARCH_EDITION_LOCALES = SEARCH_EDITION_LOCALES.filter(
  (locale) => getLocaleEligibility(locale).indexable,
);

export function isIndexablePublicRoute(
  locale: AppLocale,
  routePath: PublicRoutePath,
): boolean {
  if (routePath === PLAY_ROUTE_PATH || routePath === DOWNLOADS_ROUTE_PATH) {
    return false;
  }

  return routePath === HOME_ROUTE_PATH && getLocaleEligibility(locale).indexable;
}

export function isIndexableTrustRoute(
  locale: AppLocale,
  routePath: string,
): boolean {
  return (
    getLocaleEligibility(locale).indexable &&
    INDEXABLE_TRUST_PATHS.includes(normalizePublicPath(routePath))
  );
}
