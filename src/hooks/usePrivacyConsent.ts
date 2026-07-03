// src/hooks/usePrivacyConsent.ts
import { useCallback, useState } from "react";

import {
  PRIVACY_CONSENT_STORAGE_KEY,
  createPrivacyConsentRecord,
  parsePrivacyConsentRecord,
  type PrivacyConsentRecord,
} from "../constants/privacyConsent";

function readStoredConsent(): PrivacyConsentRecord | null {
  try {
    return parsePrivacyConsentRecord(
      window.localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

function writeStoredConsent(record: PrivacyConsentRecord): void {
  window.localStorage.setItem(PRIVACY_CONSENT_STORAGE_KEY, JSON.stringify(record));
}

function removeStoredConsent(): void {
  window.localStorage.removeItem(PRIVACY_CONSENT_STORAGE_KEY);
}

export function usePrivacyConsent() {
  const [consentRecord, setConsentRecord] =
    useState<PrivacyConsentRecord | null>(readStoredConsent);

  const acceptPrivacyConsent = useCallback(() => {
    const nextRecord = createPrivacyConsentRecord();

    try {
      writeStoredConsent(nextRecord);
    } catch {}

    setConsentRecord(nextRecord);
  }, []);

  const revokePrivacyConsent = useCallback(() => {
    try {
      removeStoredConsent();
    } catch {}

    setConsentRecord(null);
  }, []);

  return {
    consentRecord,
    hasPrivacyConsent: consentRecord !== null,
    acceptPrivacyConsent,
    revokePrivacyConsent,
  };
}
