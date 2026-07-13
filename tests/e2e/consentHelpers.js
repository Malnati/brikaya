// tests/e2e/consentHelpers.js
import {
  ACCEPT_BUTTON_LABELS,
  LANGUAGE_DETECTION_OVERLAY_SELECTOR,
  LOCATION_CHECKBOX_LABELS,
  ONBOARDING_DEMO_OVERLAY_SELECTOR,
} from "./consentSelectors.js";

export const PRIVACY_CONSENT_STORAGE_KEY = "brikaya-privacy-consent";
export const LANGUAGE_LOCATION_CONSENT_STORAGE_KEY =
  "brikaya-language-location-consent";

const PRIVACY_CONSENT_VERSION = "2026-07-03-offline-play";
const PRIVACY_CONSENT_SCOPE = "offline_play_privacy_base";
export const PRIVACY_CONSENT_ACCEPT_LABEL = ACCEPT_BUTTON_LABELS[0];
const CINEMATIC_OVERLAY_SELECTOR = '[data-testid="game-cinematic-overlay"]';
const COUNTDOWN_COUNT_SELECTOR =
  '[data-testid="game-cinematic-countdown-count"]';
const CONSENT_READY_TIMEOUT_MS = 1500;
const INITIAL_COUNTDOWN_TIMEOUT_MS = 10000;
const LANGUAGE_DETECTION_TIMEOUT_MS = 3000;
const ONBOARDING_DEMO_TIMEOUT_MS = 5500;

export async function waitForStartupSequenceToFinish(page) {
  await waitForOverlayToHideIfPresent(
    page,
    ONBOARDING_DEMO_OVERLAY_SELECTOR,
    ONBOARDING_DEMO_TIMEOUT_MS,
  );
  await waitForOverlayToHideIfPresent(
    page,
    LANGUAGE_DETECTION_OVERLAY_SELECTOR,
    LANGUAGE_DETECTION_TIMEOUT_MS,
  );
  await waitForOverlayToHideIfPresent(
    page,
    CINEMATIC_OVERLAY_SELECTOR,
    INITIAL_COUNTDOWN_TIMEOUT_MS,
  );
  await waitForInitialCountdownCountToHide(page);
}

export async function acceptPrivacyConsentIfPresent(page) {
  let didAccept = await clickPrivacyConsentButton(page);

  if (!didAccept) {
    await page
      .waitForFunction(
        (acceptLabels) =>
          Array.from(document.querySelectorAll("button")).some((button) =>
            acceptLabels.includes(button.textContent?.trim() ?? ""),
          ),
        { timeout: CONSENT_READY_TIMEOUT_MS },
        ACCEPT_BUTTON_LABELS,
      )
      .catch(() => undefined);
    didAccept = await clickPrivacyConsentButton(page);
  }

  await waitForStartupSequenceToFinish(page);

  return didAccept;
}

async function clickPrivacyConsentButton(page) {
  return page.evaluate((acceptLabels) => {
    const acceptButton = Array.from(document.querySelectorAll("button")).find(
      (button) => acceptLabels.includes(button.textContent?.trim() ?? ""),
    );

    if (!acceptButton) return false;

    acceptButton.click();
    return true;
  }, ACCEPT_BUTTON_LABELS);
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
  await waitForStartupSequenceToFinish(page);
}

async function waitForOverlayToHideIfPresent(page, selector, timeoutMs) {
  const overlay = await page.$(selector);

  if (!overlay) return;

  await page.waitForSelector(selector, {
    hidden: true,
    timeout: timeoutMs ?? INITIAL_COUNTDOWN_TIMEOUT_MS,
  });
}

export async function clickInputByLabel(page, label) {
  const labels = Array.isArray(label) ? label : [label];
  const didClick = await page.evaluate((labelTexts) => {
    const targetLabel = Array.from(document.querySelectorAll("label")).find(
      (candidate) =>
        labelTexts.some((labelText) => candidate.textContent?.includes(labelText)),
    );
    const input = targetLabel?.querySelector("input");
    if (!input) return false;
    input.click();
    return true;
  }, labels);

  if (!didClick) {
    throw new Error(`Opção não encontrada: ${labels.join(" | ")}`);
  }
}

export async function clickButtonByText(page, label) {
  const labels = Array.isArray(label) ? label : [label];
  const didClick = await page.evaluate((buttonLabels) => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (candidate) => buttonLabels.includes(candidate.textContent?.trim() ?? ""),
    );
    if (!button) return false;
    button.click();
    return true;
  }, labels);

  if (!didClick) {
    throw new Error(`Botão não encontrado: ${labels.join(" | ")}`);
  }
}

export async function assertLanguageDetectionFlow(page, profileLabel) {
  const sawOverlay = await page
    .waitForSelector(LANGUAGE_DETECTION_OVERLAY_SELECTOR, {
      visible: true,
      timeout: LANGUAGE_DETECTION_TIMEOUT_MS,
    })
    .then(() => true)
    .catch(() => false);

  if (sawOverlay) {
    await waitForOverlayToHideIfPresent(page, LANGUAGE_DETECTION_OVERLAY_SELECTOR);
    return { sawOverlay: true };
  }

  const locationConsent = await page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, LANGUAGE_LOCATION_CONSENT_STORAGE_KEY);

  if (!locationConsent) {
    throw new Error(
      `${profileLabel}: overlay de detecção de idioma ausente e consentimento de região não foi gravado.`,
    );
  }

  return { sawOverlay: false, locationConsentStored: true };
}

export async function waitForInitialCountdownCountToHide(page) {
  const countdown = await page.$(COUNTDOWN_COUNT_SELECTOR);
  if (!countdown) return;

  await page.waitForSelector(COUNTDOWN_COUNT_SELECTOR, {
    hidden: true,
    timeout: INITIAL_COUNTDOWN_TIMEOUT_MS,
  });
}
