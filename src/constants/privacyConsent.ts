// src/constants/privacyConsent.ts
export const PRIVACY_CONSENT_STORAGE_KEY = "brikaya-privacy-consent";
export const PRIVACY_CONSENT_VERSION = "2026-07-03-offline-play";
export const PRIVACY_CONSENT_SCOPE = "offline_play_privacy_base";
export const LANGUAGE_LOCATION_CONSENT_STORAGE_KEY =
  "brikaya-language-location-consent";
export const LANGUAGE_LOCATION_CONSENT_VERSION = "2026-07-04-language-location";
export const LANGUAGE_LOCATION_CONSENT_SCOPE =
  "approximate_region_language_suggestion";

export interface PrivacyConsentRecord {
  version: typeof PRIVACY_CONSENT_VERSION;
  acceptedAt: string;
  scope: typeof PRIVACY_CONSENT_SCOPE;
}

export interface LanguageLocationConsentRecord {
  version: typeof LANGUAGE_LOCATION_CONSENT_VERSION;
  acceptedAt: string;
  scope: typeof LANGUAGE_LOCATION_CONSENT_SCOPE;
}

const MIN_ACCEPTED_AT_LENGTH = 1;

function isPrivacyConsentRecord(value: unknown): value is PrivacyConsentRecord {
  if (!value || typeof value !== "object") return false;

  const candidate = value as PrivacyConsentRecord;
  const acceptedAtTime = Date.parse(candidate.acceptedAt);

  return (
    candidate.version === PRIVACY_CONSENT_VERSION &&
    candidate.scope === PRIVACY_CONSENT_SCOPE &&
    typeof candidate.acceptedAt === "string" &&
    candidate.acceptedAt.length >= MIN_ACCEPTED_AT_LENGTH &&
    Number.isFinite(acceptedAtTime)
  );
}

function isLanguageLocationConsentRecord(
  value: unknown,
): value is LanguageLocationConsentRecord {
  if (!value || typeof value !== "object") return false;

  const candidate = value as LanguageLocationConsentRecord;
  const acceptedAtTime = Date.parse(candidate.acceptedAt);

  return (
    candidate.version === LANGUAGE_LOCATION_CONSENT_VERSION &&
    candidate.scope === LANGUAGE_LOCATION_CONSENT_SCOPE &&
    typeof candidate.acceptedAt === "string" &&
    candidate.acceptedAt.length >= MIN_ACCEPTED_AT_LENGTH &&
    Number.isFinite(acceptedAtTime)
  );
}

export function createPrivacyConsentRecord(
  acceptedAt = new Date(),
): PrivacyConsentRecord {
  return {
    version: PRIVACY_CONSENT_VERSION,
    acceptedAt: acceptedAt.toISOString(),
    scope: PRIVACY_CONSENT_SCOPE,
  };
}

export function createLanguageLocationConsentRecord(
  acceptedAt = new Date(),
): LanguageLocationConsentRecord {
  return {
    version: LANGUAGE_LOCATION_CONSENT_VERSION,
    acceptedAt: acceptedAt.toISOString(),
    scope: LANGUAGE_LOCATION_CONSENT_SCOPE,
  };
}

export function parsePrivacyConsentRecord(
  storedValue: string | null,
): PrivacyConsentRecord | null {
  if (!storedValue) return null;

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    return isPrivacyConsentRecord(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export function parseLanguageLocationConsentRecord(
  storedValue: string | null,
): LanguageLocationConsentRecord | null {
  if (!storedValue) return null;

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    return isLanguageLocationConsentRecord(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}
