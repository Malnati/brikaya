// src/monetization/googleAds.test.ts
import {
  configureGoogleAdSound,
  isGoogleAdsEnabled,
  requestInterlevelGoogleAd,
} from "./googleAds";

describe("Google interlevel ads", () => {
  beforeEach(() => {
    delete window.__BRIKAYA_GOOGLE_ADS_ENABLED__;
    delete window.adBreak;
    delete window.adConfig;
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("mantém anúncios desligados por padrão", async () => {
    window.adBreak = jest.fn();

    await expect(
      requestInterlevelGoogleAd({
        currentLevel: 1,
        nextLevel: 2,
        soundOn: true,
      }),
    ).resolves.toMatchObject({
      attempted: false,
      shown: false,
      reason: "disabled",
      placementName: "brikaya_level_1_to_2",
    });
    expect(window.adBreak).not.toHaveBeenCalled();
    expect(isGoogleAdsEnabled()).toBe(false);
  });

  it("não bloqueia a fase quando a API Google não está disponível", async () => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;

    await expect(
      requestInterlevelGoogleAd({
        currentLevel: 2,
        nextLevel: 3,
        soundOn: false,
      }),
    ).resolves.toMatchObject({
      attempted: false,
      shown: false,
      reason: "api_unavailable",
    });
  });

  it("não chama anúncio quando o navegador está offline", async () => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    window.adBreak = jest.fn();
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    await expect(
      requestInterlevelGoogleAd({
        currentLevel: 3,
        nextLevel: 4,
        soundOn: false,
      }),
    ).resolves.toMatchObject({
      attempted: false,
      shown: false,
      reason: "offline",
      placementName: "brikaya_level_3_to_4",
    });
    expect(window.adBreak).not.toHaveBeenCalled();
  });

  it("segue para a fase seguinte quando o Google retorna no-fill", async () => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    window.adConfig = jest.fn();
    window.adBreak = jest.fn((placement) => {
      placement.adBreakDone?.({ breakStatus: "notReady" });
    });

    await expect(
      requestInterlevelGoogleAd({
        currentLevel: 5,
        nextLevel: 6,
        soundOn: false,
      }),
    ).resolves.toMatchObject({
      attempted: true,
      shown: false,
      reason: "completed",
      placementName: "brikaya_level_5_to_6",
      placementInfo: { breakStatus: "notReady" },
    });
  });

  it("declara interstitial do tipo next entre fases e resolve no adBreakDone", async () => {
    window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = true;
    const beforeAd = jest.fn();
    const afterAd = jest.fn();
    const adConfig = jest.fn();
    window.adConfig = adConfig;
    window.adBreak = jest.fn((placement) => {
      placement.beforeAd?.();
      placement.afterAd?.();
      placement.adBreakDone?.({ breakStatus: "viewed" });
    });

    await expect(
      requestInterlevelGoogleAd({
        currentLevel: 4,
        nextLevel: 5,
        soundOn: true,
        beforeAd,
        afterAd,
      }),
    ).resolves.toMatchObject({
      attempted: true,
      shown: true,
      reason: "completed",
      placementName: "brikaya_level_4_to_5",
      placementInfo: { breakStatus: "viewed" },
    });

    expect(adConfig).toHaveBeenCalledWith({
      preloadAdBreaks: "on",
      sound: "on",
    });
    expect(window.adBreak).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "next",
        name: "brikaya_level_4_to_5",
      }),
    );
    expect(beforeAd).toHaveBeenCalledTimes(1);
    expect(afterAd).toHaveBeenCalledTimes(1);
  });

  it("ignora configuração de áudio quando a flag está desligada", () => {
    window.adConfig = jest.fn();

    configureGoogleAdSound(true);

    expect(window.adConfig).not.toHaveBeenCalled();
  });
});
