// src/hooks/usePrivacyConsent.test.ts
import { act, renderHook } from "@testing-library/react";

import {
  PRIVACY_CONSENT_SCOPE,
  PRIVACY_CONSENT_STORAGE_KEY,
  PRIVACY_CONSENT_VERSION,
} from "../constants/privacyConsent";
import { usePrivacyConsent } from "./usePrivacyConsent";

const VALID_CONSENT_RECORD = JSON.stringify({
  version: PRIVACY_CONSENT_VERSION,
  acceptedAt: "2026-07-03T00:00:00.000Z",
  scope: PRIVACY_CONSENT_SCOPE,
});

function mockStoredConsent(value: string | null): void {
  (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) =>
    key === PRIVACY_CONSENT_STORAGE_KEY ? value : null,
  );
}

describe("usePrivacyConsent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoredConsent(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("exige consentimento quando não existe aceite salvo", () => {
    const { result } = renderHook(() => usePrivacyConsent());

    expect(result.current.hasPrivacyConsent).toBe(false);
    expect(result.current.consentRecord).toBeNull();
  });

  it("aceita consentimento salvo com versão e escopo atuais", () => {
    mockStoredConsent(VALID_CONSENT_RECORD);

    const { result } = renderHook(() => usePrivacyConsent());

    expect(result.current.hasPrivacyConsent).toBe(true);
    expect(result.current.consentRecord?.version).toBe(PRIVACY_CONSENT_VERSION);
    expect(result.current.consentRecord?.scope).toBe(PRIVACY_CONSENT_SCOPE);
  });

  it("persiste aceite com data, versão e escopo mínimos", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-07-03T12:00:00.000Z"));
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => {
      result.current.acceptPrivacyConsent();
    });

    expect(result.current.hasPrivacyConsent).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      PRIVACY_CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: PRIVACY_CONSENT_VERSION,
        acceptedAt: "2026-07-03T12:00:00.000Z",
        scope: PRIVACY_CONSENT_SCOPE,
      }),
    );
  });

  it("permite aceite em memória quando armazenamento falha", () => {
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error("armazenamento indisponível");
    });
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => {
      result.current.acceptPrivacyConsent();
    });

    expect(result.current.hasPrivacyConsent).toBe(true);
    expect(result.current.consentRecord?.scope).toBe(PRIVACY_CONSENT_SCOPE);
  });

  it("revoga consentimento salvo e volta a exigir aceite", () => {
    mockStoredConsent(VALID_CONSENT_RECORD);
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => {
      result.current.revokePrivacyConsent();
    });

    expect(result.current.hasPrivacyConsent).toBe(false);
    expect(result.current.consentRecord).toBeNull();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      PRIVACY_CONSENT_STORAGE_KEY,
    );
  });
});
