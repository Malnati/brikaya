// src/i18n/metadata.ts
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  I18N_MESSAGES,
  SUPPORTED_LOCALES,
  type AppLocale,
  type TranslationKey,
} from "./messages";
import {
  DOWNLOADS_ROUTE_PATH,
  HOME_ROUTE_PATH,
  PLAY_ROUTE_PATH,
  getLocalizedPublicPath,
  getPublicRoutePath,
  type PublicRoutePath,
} from "../routes";

const CANONICAL_ORIGIN = "https://brikaya.com";
const HREFLANG_DEFAULT = "x-default";
const HREFLANG_LINK_SELECTOR = 'link[rel="alternate"][hreflang]';
const CANONICAL_LINK_SELECTOR = 'link[rel="canonical"]';
const DESCRIPTION_META_SELECTOR = 'meta[name="description"]';
const OG_URL_META_SELECTOR = 'meta[property="og:url"]';
const OG_TITLE_META_SELECTOR = 'meta[property="og:title"]';
const OG_DESCRIPTION_META_SELECTOR = 'meta[property="og:description"]';
const TWITTER_TITLE_META_SELECTOR = 'meta[name="twitter:title"]';
const TWITTER_DESCRIPTION_META_SELECTOR = 'meta[name="twitter:description"]';
const CONTENT_ATTRIBUTE = "content";
const HREF_ATTRIBUTE = "href";
const HREFLANG_ATTRIBUTE = "hreflang";
const REL_ATTRIBUTE = "rel";
const ALTERNATE_REL = "alternate";

export interface SeoMetadata {
  title: string;
  description: string;
  ogDescription: string;
  canonicalUrl: string;
}

export function getLocalizedRoutePath(
  locale: AppLocale,
  routePath: PublicRoutePath = HOME_ROUTE_PATH,
): string {
  return getLocalizedPublicPath(locale, DEFAULT_LOCALE, routePath);
}

export function getLocalePath(locale: AppLocale): string {
  return getLocalizedRoutePath(locale, PLAY_ROUTE_PATH);
}

export function getCanonicalUrl(
  locale: AppLocale,
  routePath: PublicRoutePath = HOME_ROUTE_PATH,
): string {
  return `${CANONICAL_ORIGIN}${getLocalizedRoutePath(locale, routePath)}`;
}

export function getSeoMetadata(
  locale: AppLocale,
  routePath: PublicRoutePath = HOME_ROUTE_PATH,
): SeoMetadata {
  const messages = I18N_MESSAGES[locale] ?? I18N_MESSAGES[FALLBACK_LOCALE];
  const isDownloadsPage = routePath === DOWNLOADS_ROUTE_PATH;

  return {
    title: messages[isDownloadsPage ? "seo.downloadsTitle" : "seo.title"],
    description:
      messages[isDownloadsPage ? "seo.downloadsDescription" : "seo.description"],
    ogDescription:
      messages[
        isDownloadsPage ? "seo.downloadsOgDescription" : "seo.ogDescription"
      ],
    canonicalUrl: getCanonicalUrl(locale, routePath),
  };
}

function ensureLink(selector: string): HTMLLinkElement {
  const currentElement = document.head.querySelector<HTMLLinkElement>(selector);
  if (currentElement) return currentElement;

  const nextElement = document.createElement("link");
  document.head.appendChild(nextElement);
  return nextElement;
}

function setMetaContent(selector: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  element?.setAttribute(CONTENT_ATTRIBUTE, content);
}

function removeExistingHreflangLinks() {
  document.head
    .querySelectorAll<HTMLLinkElement>(HREFLANG_LINK_SELECTOR)
    .forEach((element) => element.remove());
}

function appendHreflangLink(locale: AppLocale | typeof HREFLANG_DEFAULT, url: string) {
  const link = document.createElement("link");
  link.setAttribute(REL_ATTRIBUTE, ALTERNATE_REL);
  link.setAttribute(HREFLANG_ATTRIBUTE, locale);
  link.setAttribute(HREF_ATTRIBUTE, url);
  document.head.appendChild(link);
}

export function applySeoMetadata(locale: AppLocale) {
  const routePath = getPublicRoutePath(window.location.pathname, SUPPORTED_LOCALES);
  const metadata = getSeoMetadata(locale, routePath);
  const canonicalLink = ensureLink(CANONICAL_LINK_SELECTOR);

  document.documentElement.lang = locale;
  document.title = metadata.title;
  canonicalLink.setAttribute(REL_ATTRIBUTE, "canonical");
  canonicalLink.setAttribute(HREF_ATTRIBUTE, metadata.canonicalUrl);
  setMetaContent(DESCRIPTION_META_SELECTOR, metadata.description);
  setMetaContent(OG_URL_META_SELECTOR, metadata.canonicalUrl);
  setMetaContent(OG_TITLE_META_SELECTOR, metadata.title);
  setMetaContent(OG_DESCRIPTION_META_SELECTOR, metadata.ogDescription);
  setMetaContent(TWITTER_TITLE_META_SELECTOR, metadata.title);
  setMetaContent(TWITTER_DESCRIPTION_META_SELECTOR, metadata.ogDescription);
  removeExistingHreflangLinks();
  for (const supportedLocale of SUPPORTED_LOCALES) {
    appendHreflangLink(supportedLocale, getCanonicalUrl(supportedLocale, routePath));
  }
  appendHreflangLink(HREFLANG_DEFAULT, getCanonicalUrl(DEFAULT_LOCALE, routePath));
}

export function getMessage(locale: AppLocale, key: TranslationKey): string {
  return I18N_MESSAGES[locale]?.[key] ?? I18N_MESSAGES[FALLBACK_LOCALE][key];
}
