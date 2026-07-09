// tests/e2e/consentSelectors.js
export const CONSENT_SCREEN_SELECTOR =
  '[data-testid="consent-screen"], .consent-screen';

export const LANGUAGE_DETECTION_OVERLAY_SELECTOR =
  '[data-testid="language-detection-overlay"], .language-detection-overlay';

export const ACCEPT_BUTTON_LABELS = ["Aceitar e jogar", "Accept and play"];

export const LOCATION_CHECKBOX_LABELS = [
  "Usar região para sugerir idioma",
  "Use region to suggest language",
];

export async function waitForConsentScreen(page, timeoutMs = 45000) {
  await page.waitForSelector(CONSENT_SCREEN_SELECTOR, { timeout: timeoutMs });
}

export async function isConsentScreenVisible(page) {
  return page.evaluate((selector) => {
    const screen = document.querySelector(selector);
    if (!screen) return false;
    const style = window.getComputedStyle(screen);
    const rect = screen.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }, CONSENT_SCREEN_SELECTOR);
}
