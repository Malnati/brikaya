// src/hooks/useLanguageLocationConsent.test.ts
import { act, renderHook } from "@testing-library/react";

import {
  LANGUAGE_LOCATION_CONSENT_SCOPE,
  LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
  LANGUAGE_LOCATION_CONSENT_VERSION,
} from "../constants/privacyConsent";
import { useLanguageLocationConsent } from "./useLanguageLocationConsent";

const VALID_LOCATION_CONSENT_RECORD = JSON.stringify({
  version: LANGUAGE_LOCATION_CONSENT_VERSION,
  acceptedAt: "2026-07-04T00:00:00.000Z",
  scope: LANGUAGE_LOCATION_CONSENT_SCOPE,
});

function mockStoredLanguageLocationConsent(value: string | null): void {
  (window.localStorage.getItem as jest.Mock).mockImplementation(
    (key: string) =>
      key === LANGUAGE_LOCATION_CONSENT_STORAGE_KEY ? value : null,
  );
}

describe("useLanguageLocationConsent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoredLanguageLocationConsent(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("mantém sugestão por região desligada quando não existe aceite salvo", () => {
    const { result } = renderHook(() => useLanguageLocationConsent());

    expect(result.current.hasLanguageLocationConsent).toBe(false);
    expect(result.current.languageLocationConsentRecord).toBeNull();
  });

  it("aceita consentimento salvo com versão e escopo atuais", () => {
    mockStoredLanguageLocationConsent(VALID_LOCATION_CONSENT_RECORD);

    const { result } = renderHook(() => useLanguageLocationConsent());

    expect(result.current.hasLanguageLocationConsent).toBe(true);
    expect(result.current.languageLocationConsentRecord?.version).toBe(
      LANGUAGE_LOCATION_CONSENT_VERSION,
    );
    expect(result.current.languageLocationConsentRecord?.scope).toBe(
      LANGUAGE_LOCATION_CONSENT_SCOPE,
    );
  });

  it("persiste apenas versão, data e escopo da permissão local", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-04T12:00:00.000Z"));
    const { result } = renderHook(() => useLanguageLocationConsent());

    act(() => {
      result.current.acceptLanguageLocationConsent();
    });

    expect(result.current.hasLanguageLocationConsent).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: LANGUAGE_LOCATION_CONSENT_VERSION,
        acceptedAt: "2026-07-04T12:00:00.000Z",
        scope: LANGUAGE_LOCATION_CONSENT_SCOPE,
      }),
    );
  });

  it("remove consentimento de região sem tocar no aceite base", () => {
    mockStoredLanguageLocationConsent(VALID_LOCATION_CONSENT_RECORD);
    const { result } = renderHook(() => useLanguageLocationConsent());

    act(() => {
      result.current.revokeLanguageLocationConsent();
    });

    expect(result.current.hasLanguageLocationConsent).toBe(false);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      LANGUAGE_LOCATION_CONSENT_STORAGE_KEY,
    );
  });
});
