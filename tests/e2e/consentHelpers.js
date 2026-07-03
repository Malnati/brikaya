// tests/e2e/consentHelpers.js
export const PRIVACY_CONSENT_STORAGE_KEY = "brikaya-privacy-consent";

const PRIVACY_CONSENT_VERSION = "2026-07-03-offline-play";
const PRIVACY_CONSENT_SCOPE = "offline_play_privacy_base";
const PRIVACY_CONSENT_ACCEPT_LABEL = "Aceitar e jogar";
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const CONSENT_READY_TIMEOUT_MS = 1500;
const INITIAL_COUNTDOWN_TIMEOUT_MS = 4000;

export async function acceptPrivacyConsentIfPresent(page) {
  let didAccept = await clickPrivacyConsentButton(page);

  if (!didAccept) {
    await page
      .waitForFunction(
        (buttonText) =>
          Array.from(document.querySelectorAll("button")).some(
            (button) => button.textContent?.trim() === buttonText,
          ),
        { timeout: CONSENT_READY_TIMEOUT_MS },
        PRIVACY_CONSENT_ACCEPT_LABEL,
      )
      .catch(() => undefined);
    didAccept = await clickPrivacyConsentButton(page);
  }

  if (didAccept) await waitForInitialCountdownToFinish(page);

  return didAccept;
}

async function clickPrivacyConsentButton(page) {
  return page.evaluate((buttonText) => {
    const acceptButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === buttonText,
    );

    if (!acceptButton) return false;

    acceptButton.click();
    return true;
  }, PRIVACY_CONSENT_ACCEPT_LABEL);
}

export async function seedPrivacyConsent(page) {
  await page.evaluate(
    ({ key, version, scope }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version,
          acceptedAt: new Date().toISOString(),
          scope,
        }),
      );
    },
    {
      key: PRIVACY_CONSENT_STORAGE_KEY,
      version: PRIVACY_CONSENT_VERSION,
      scope: PRIVACY_CONSENT_SCOPE,
    },
  );
}

export async function waitForInitialCountdownToFinish(page) {
  await page.waitForSelector(CINEMATIC_OVERLAY_SELECTOR, {
    hidden: true,
    timeout: INITIAL_COUNTDOWN_TIMEOUT_MS,
  });
}
