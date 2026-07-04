// src/marketing/campaignLinks.ts
import { getCanonicalUrl } from "../i18n/metadata";
import type { AppLocale } from "../i18n/messages";

const EMPTY_STRING = "";
const QUERY_PREFIX = "?";
const CAMPAIGN_PARAM_MAX_LENGTH = 96;
const CAMPAIGN_PARAM_UNSAFE_PATTERN = /[^a-zA-Z0-9._~:-]+/g;
const CAMPAIGN_PARAM_EDGE_SEPARATOR_PATTERN = /^[-_.:~]+|[-_.:~]+$/g;
const UTM_SOURCE_PARAMETER = "utm_source";
const UTM_MEDIUM_PARAMETER = "utm_medium";
const UTM_CAMPAIGN_PARAMETER = "utm_campaign";
const UTM_CONTENT_PARAMETER = "utm_content";
const UTM_TERM_PARAMETER = "utm_term";
const GOOGLE_SOURCE = "google";
const META_SOURCE = "meta";
const REDDIT_SOURCE = "reddit";
const TIKTOK_SOURCE = "tiktok";
const ORGANIC_SOURCE = "organic-share";
const PAID_SEARCH_MEDIUM = "paid-search";
const PAID_SOCIAL_MEDIUM = "paid-social";
const COMMUNITY_MEDIUM = "community";
const QR_MEDIUM = "qr";
const BRASIL_P0_CAMPAIGN = "brikaya-p0-brasil-test";
const ENGLISH_P0_CAMPAIGN = "brikaya-p0-english-test";
const LATAM_P0_CAMPAIGN = "brikaya-p0-latam-test";
const INDIA_P0_CAMPAIGN = "brikaya-p0-india-test";
const EUROPE_P1_CAMPAIGN = "brikaya-p1-europe-test";
const ASIA_P1_CAMPAIGN = "brikaya-p1-asia-test";
const SEA_P2_CAMPAIGN = "brikaya-p2-sea-test";
const COPY_A_CONTENT = "copy-a";
const COPY_B_CONTENT = "copy-b";
const GAME_LINK_CONTENT = "game-link";

export const CAMPAIGN_QUERY_PARAMETERS = [
  UTM_SOURCE_PARAMETER,
  UTM_MEDIUM_PARAMETER,
  UTM_CAMPAIGN_PARAMETER,
  UTM_CONTENT_PARAMETER,
  UTM_TERM_PARAMETER,
] as const;

export type CampaignQueryParameter = (typeof CAMPAIGN_QUERY_PARAMETERS)[number];
export type CampaignUrlParameters = Partial<Record<CampaignQueryParameter, string>>;

export interface CampaignUrlPreset {
  id: string;
  locale: AppLocale;
  label: string;
  parameters: CampaignUrlParameters;
}

export const CAMPAIGN_URL_PRESETS = [
  {
    id: "google-brasil-search",
    locale: "pt-BR",
    label: "Google Ads teste Brasil",
    parameters: {
      utm_source: GOOGLE_SOURCE,
      utm_medium: PAID_SEARCH_MEDIUM,
      utm_campaign: BRASIL_P0_CAMPAIGN,
      utm_content: COPY_A_CONTENT,
    },
  },
  {
    id: "google-english-search",
    locale: "en",
    label: "Google Ads teste inglês global",
    parameters: {
      utm_source: GOOGLE_SOURCE,
      utm_medium: PAID_SEARCH_MEDIUM,
      utm_campaign: ENGLISH_P0_CAMPAIGN,
      utm_content: COPY_A_CONTENT,
    },
  },
  {
    id: "meta-latam-social",
    locale: "es-419",
    label: "Meta Ads teste LATAM",
    parameters: {
      utm_source: META_SOURCE,
      utm_medium: PAID_SOCIAL_MEDIUM,
      utm_campaign: LATAM_P0_CAMPAIGN,
      utm_content: COPY_B_CONTENT,
    },
  },
  {
    id: "meta-india-social",
    locale: "en-IN",
    label: "Meta Ads teste Índia",
    parameters: {
      utm_source: META_SOURCE,
      utm_medium: PAID_SOCIAL_MEDIUM,
      utm_campaign: INDIA_P0_CAMPAIGN,
      utm_content: COPY_A_CONTENT,
    },
  },
  {
    id: "reddit-english-community",
    locale: "en",
    label: "Reddit Ads/comunidades teste inglês",
    parameters: {
      utm_source: REDDIT_SOURCE,
      utm_medium: COMMUNITY_MEDIUM,
      utm_campaign: ENGLISH_P0_CAMPAIGN,
      utm_content: GAME_LINK_CONTENT,
    },
  },
  {
    id: "tiktok-sea-social-reserve",
    locale: "id",
    label: "TikTok reserva SEA",
    parameters: {
      utm_source: TIKTOK_SOURCE,
      utm_medium: PAID_SOCIAL_MEDIUM,
      utm_campaign: SEA_P2_CAMPAIGN,
      utm_content: COPY_A_CONTENT,
    },
  },
  {
    id: "organic-europe-share",
    locale: "de",
    label: "Compartilhamento orgânico Europa",
    parameters: {
      utm_source: ORGANIC_SOURCE,
      utm_medium: QR_MEDIUM,
      utm_campaign: EUROPE_P1_CAMPAIGN,
      utm_content: GAME_LINK_CONTENT,
    },
  },
  {
    id: "organic-asia-share",
    locale: "ja",
    label: "Compartilhamento orgânico Ásia",
    parameters: {
      utm_source: ORGANIC_SOURCE,
      utm_medium: QR_MEDIUM,
      utm_campaign: ASIA_P1_CAMPAIGN,
      utm_content: GAME_LINK_CONTENT,
    },
  },
] as const satisfies readonly CampaignUrlPreset[];

function sanitizeCampaignParameter(value: string): string {
  return value
    .trim()
    .slice(0, CAMPAIGN_PARAM_MAX_LENGTH)
    .replace(CAMPAIGN_PARAM_UNSAFE_PATTERN, "-")
    .replace(CAMPAIGN_PARAM_EDGE_SEPARATOR_PATTERN, EMPTY_STRING);
}

export function buildCampaignUrl(
  locale: AppLocale,
  parameters: CampaignUrlParameters,
): string {
  const searchParams = new URLSearchParams();

  for (const parameter of CAMPAIGN_QUERY_PARAMETERS) {
    const sanitizedValue = sanitizeCampaignParameter(
      parameters[parameter] ?? EMPTY_STRING,
    );
    if (sanitizedValue) searchParams.set(parameter, sanitizedValue);
  }

  const queryString = searchParams.toString();
  return queryString
    ? `${getCanonicalUrl(locale)}${QUERY_PREFIX}${queryString}`
    : getCanonicalUrl(locale);
}

export function buildCampaignPresetUrls(): Record<string, string> {
  return Object.fromEntries(
    CAMPAIGN_URL_PRESETS.map((preset) => [
      preset.id,
      buildCampaignUrl(preset.locale, preset.parameters),
    ]),
  );
}
