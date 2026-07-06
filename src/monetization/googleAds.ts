// src/monetization/googleAds.ts
const INTERLEVEL_AD_BREAK_TIMEOUT_MS = 30000;
export const INTERLEVEL_AD_PHASE_INTERVAL = 3;
const GOOGLE_INTERLEVEL_PLACEMENT_TYPE = "next";
const GOOGLE_INTERLEVEL_PLACEMENT_PREFIX = "brikaya_level";
const GOOGLE_AD_SOUND_ON = "on";
const GOOGLE_AD_SOUND_OFF = "off";

type GoogleAdSound = typeof GOOGLE_AD_SOUND_ON | typeof GOOGLE_AD_SOUND_OFF;

type GoogleAdPlacementType = typeof GOOGLE_INTERLEVEL_PLACEMENT_TYPE;

interface GoogleAdBreakPlacementInfo {
  breakStatus?: string;
  type?: string;
  name?: string;
}

interface GoogleAdBreakConfig {
  type: GoogleAdPlacementType;
  name: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (placementInfo?: GoogleAdBreakPlacementInfo) => void;
}

interface GoogleAdConfigPayload {
  sound?: GoogleAdSound;
  preloadAdBreaks?: "on" | "auto";
}

declare global {
  interface Window {
    __BRIKAYA_GOOGLE_ADS_ENABLED__?: boolean;
    adsbygoogle?: unknown[];
    adBreak?: (placement: GoogleAdBreakConfig) => void;
    adConfig?: (config: GoogleAdConfigPayload) => void;
  }
}

export interface InterlevelGoogleAdRequest {
  currentLevel: number;
  nextLevel: number;
  soundOn: boolean;
  beforeAd?: () => void;
  afterAd?: () => void;
}

export interface InterlevelGoogleAdResult {
  attempted: boolean;
  shown: boolean;
  reason:
    | "disabled"
    | "offline"
    | "api_unavailable"
    | "completed"
    | "timeout"
    | "error";
  placementName: string;
  placementInfo?: GoogleAdBreakPlacementInfo;
}

function isBrowserReady(): boolean {
  return typeof window !== "undefined";
}

export function isGoogleAdsEnabled(): boolean {
  return isBrowserReady() && window.__BRIKAYA_GOOGLE_ADS_ENABLED__ === true;
}

export function shouldRequestInterlevelGoogleAd(currentLevel: number): boolean {
  return (
    Number.isInteger(currentLevel) &&
    currentLevel > 0 &&
    currentLevel % INTERLEVEL_AD_PHASE_INTERVAL === 0
  );
}

function createInterlevelPlacementName(
  currentLevel: number,
  nextLevel: number,
): string {
  return `${GOOGLE_INTERLEVEL_PLACEMENT_PREFIX}_${currentLevel}_to_${nextLevel}`;
}

export function configureGoogleAdSound(soundOn: boolean): void {
  if (!isGoogleAdsEnabled() || typeof window.adConfig !== "function") return;

  window.adConfig({
    preloadAdBreaks: "on",
    sound: soundOn ? GOOGLE_AD_SOUND_ON : GOOGLE_AD_SOUND_OFF,
  });
}

export function requestInterlevelGoogleAd({
  currentLevel,
  nextLevel,
  soundOn,
  beforeAd,
  afterAd,
}: InterlevelGoogleAdRequest): Promise<InterlevelGoogleAdResult> {
  const placementName = createInterlevelPlacementName(currentLevel, nextLevel);

  if (!isGoogleAdsEnabled()) {
    return Promise.resolve({
      attempted: false,
      shown: false,
      reason: "disabled",
      placementName,
    });
  }

  if (!navigator.onLine) {
    return Promise.resolve({
      attempted: false,
      shown: false,
      reason: "offline",
      placementName,
    });
  }

  if (typeof window.adBreak !== "function") {
    return Promise.resolve({
      attempted: false,
      shown: false,
      reason: "api_unavailable",
      placementName,
    });
  }

  configureGoogleAdSound(soundOn);
  const adBreak = window.adBreak;

  return new Promise((resolve) => {
    let settled = false;
    let shown = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finish = (
      reason: InterlevelGoogleAdResult["reason"],
      placementInfo?: GoogleAdBreakPlacementInfo,
    ) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        attempted: true,
        shown,
        reason,
        placementName,
        placementInfo,
      });
    };

    timeoutId = setTimeout(() => {
      afterAd?.();
      finish("timeout");
    }, INTERLEVEL_AD_BREAK_TIMEOUT_MS);

    try {
      adBreak({
        type: GOOGLE_INTERLEVEL_PLACEMENT_TYPE,
        name: placementName,
        beforeAd: () => {
          shown = true;
          beforeAd?.();
        },
        afterAd: () => {
          afterAd?.();
        },
        adBreakDone: (placementInfo) => {
          finish("completed", placementInfo);
        },
      });
    } catch {
      afterAd?.();
      finish("error");
    }
  });
}
