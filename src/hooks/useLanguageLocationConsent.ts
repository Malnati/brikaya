// src/hooks/useLanguageLocationConsent.ts
import { useCallback, useState } from "react";

import {
  LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
  createLanguageLocationConsentRecord,
  parseLanguageLocationConsentRecord,
  type LanguageLocationConsentRecord,
} from "../constants/privacyConsent";

function readStoredLanguageLocationConsent(): LanguageLocationConsentRecord | null {
  try {
    return parseLanguageLocationConsentRecord(
      window.localStorage.getItem(LANGUAGE_LOCATION_CONSENT_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

function writeStoredLanguageLocationConsent(
  record: LanguageLocationConsentRecord,
): void {
  window.localStorage.setItem(
    LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
    JSON.stringify(record),
  );
}

function removeStoredLanguageLocationConsent(): void {
  window.localStorage.removeItem(LANGUAGE_LOCATION_CONSENT_STORAGE_KEY);
}

export function useLanguageLocationConsent() {
  const [languageLocationConsentRecord, setLanguageLocationConsentRecord] =
    useState<LanguageLocationConsentRecord | null>(
      readStoredLanguageLocationConsent,
    );

  const acceptLanguageLocationConsent = useCallback(() => {
    const nextRecord = createLanguageLocationConsentRecord();

    try {
      writeStoredLanguageLocationConsent(nextRecord);
    } catch {}

    setLanguageLocationConsentRecord(nextRecord);
  }, []);

  const revokeLanguageLocationConsent = useCallback(() => {
    try {
      removeStoredLanguageLocationConsent();
    } catch {}

    setLanguageLocationConsentRecord(null);
  }, []);

  return {
    languageLocationConsentRecord,
    hasLanguageLocationConsent: languageLocationConsentRecord !== null,
    acceptLanguageLocationConsent,
    revokeLanguageLocationConsent,
  };
}
