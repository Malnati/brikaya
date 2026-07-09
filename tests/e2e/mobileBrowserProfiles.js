// tests/e2e/mobileBrowserProfiles.js
export const IPHONE_14_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

export const IPHONE_14_SHORT_VIEWPORT = {
  width: 390,
  height: 667,
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

const IPHONE_14_SAFARI_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const IPHONE_14_CHROME_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1";

export const MOBILE_BROWSER_PROFILES = [
  {
    name: "iphone-14-safari",
    label: "iPhone 14 Safari",
    engine: "webkit",
    viewport: IPHONE_14_VIEWPORT,
    userAgent: IPHONE_14_SAFARI_USER_AGENT,
    locale: "pt-BR,pt;q=0.9",
  },
  {
    name: "iphone-14-chrome",
    label: "iPhone 14 Chrome",
    engine: "chromium-ios",
    viewport: IPHONE_14_VIEWPORT,
    userAgent: IPHONE_14_CHROME_USER_AGENT,
    locale: "pt-BR,pt;q=0.9",
  },
];

export const CONSENT_SCROLL_PROFILES = [
  ...MOBILE_BROWSER_PROFILES,
  {
    name: "iphone-14-safari-short",
    label: "iPhone 14 Safari (viewport curto)",
    engine: "webkit",
    viewport: IPHONE_14_SHORT_VIEWPORT,
    userAgent: IPHONE_14_SAFARI_USER_AGENT,
    locale: "pt-BR,pt;q=0.9",
  },
  {
    name: "iphone-14-chrome-short",
    label: "iPhone 14 Chrome (viewport curto)",
    engine: "chromium-ios",
    viewport: IPHONE_14_SHORT_VIEWPORT,
    userAgent: IPHONE_14_CHROME_USER_AGENT,
    locale: "pt-BR,pt;q=0.9",
  },
];

export const JOURNEY_PROFILES = CONSENT_SCROLL_PROFILES;
