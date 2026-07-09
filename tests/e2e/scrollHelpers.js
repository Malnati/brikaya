// tests/e2e/scrollHelpers.js
const CONSENT_SCREEN_SELECTOR = '[data-testid="consent-screen"]';
const ACCEPT_BUTTON_LABEL = "Aceitar e jogar";

export async function readConsentScrollMetrics(page) {
  return page.evaluate((selector) => {
    const screen = document.querySelector(selector);
    if (!screen) {
      return { found: false };
    }

    const style = window.getComputedStyle(screen);
    const acceptButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Aceitar e jogar",
    );
    const acceptRect = acceptButton?.getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    return {
      found: true,
      scrollHeight: screen.scrollHeight,
      clientHeight: screen.clientHeight,
      scrollTop: screen.scrollTop,
      overflowY: style.overflowY,
      touchAction: style.touchAction,
      overscrollBehavior: style.overscrollBehavior,
      acceptButtonInView:
        Boolean(acceptRect) &&
        acceptRect.bottom <= screenRect.bottom + 1 &&
        acceptRect.top >= screenRect.top - 1,
      acceptButtonBelowFold:
        Boolean(acceptRect) && acceptRect.bottom > screenRect.bottom + 1,
    };
  }, CONSENT_SCREEN_SELECTOR);
}

export async function assertConsentScreenScrollable(page, profileLabel) {
  const before = await readConsentScrollMetrics(page);

  if (!before.found) {
    throw new Error(`${profileLabel}: tela de consentimento não encontrada.`);
  }

  if (before.overflowY !== "auto" && before.overflowY !== "scroll") {
    throw new Error(
      `${profileLabel}: overflow-y inesperado (${before.overflowY}).`,
    );
  }

  if (before.touchAction !== "pan-y") {
    throw new Error(
      `${profileLabel}: touch-action inesperado (${before.touchAction}).`,
    );
  }

  const scrollDelta = Math.max(120, before.scrollHeight - before.clientHeight);
  const scrolled = await page.evaluate(
    ({ selector, delta }) => {
      const screen = document.querySelector(selector);
      if (!screen) return { changed: false, scrollTop: 0 };

      const initialScrollTop = screen.scrollTop;
      screen.scrollTop = initialScrollTop + delta;

      return {
        changed: screen.scrollTop !== initialScrollTop,
        scrollTop: screen.scrollTop,
      };
    },
    { selector: CONSENT_SCREEN_SELECTOR, delta: scrollDelta },
  );

  if (before.scrollHeight > before.clientHeight + 8 && !scrolled.changed) {
    throw new Error(
      `${profileLabel}: conteúdo excede viewport mas scroll não respondeu.`,
    );
  }

  const afterScroll = await readConsentScrollMetrics(page);

  if (afterScroll.acceptButtonBelowFold && afterScroll.scrollTop === 0) {
    throw new Error(
      `${profileLabel}: botão de aceite ficou abaixo da dobra sem rolagem.`,
    );
  }

  await page.evaluate((selector) => {
    const screen = document.querySelector(selector);
    if (screen) screen.scrollTop = 0;
  }, CONSENT_SCREEN_SELECTOR);

  if (before.acceptButtonBelowFold) {
    await page.evaluate(
      ({ selector, label }) => {
        const screen = document.querySelector(selector);
        const acceptButton = Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent?.trim() === label,
        );
        if (screen && acceptButton) {
          acceptButton.scrollIntoView({ block: "end" });
        }
      },
      { selector: CONSENT_SCREEN_SELECTOR, label: ACCEPT_BUTTON_LABEL },
    );

    const reachable = await readConsentScrollMetrics(page);
    if (!reachable.acceptButtonInView) {
      throw new Error(
        `${profileLabel}: scroll não alcançou o botão Aceitar e jogar.`,
      );
    }
  }

  return {
    before,
    afterScroll,
    scrolled,
  };
}

export async function simulateTouchScrollOnConsent(page, deltaY = 180) {
  const box = await page.$(CONSENT_SCREEN_SELECTOR);
  if (!box) return { performed: false };

  const rect = await box.boundingBox();
  if (!rect) return { performed: false };

  const startX = rect.x + rect.width / 2;
  const startY = rect.y + rect.height * 0.75;
  const endY = startY - deltaY;

  await page.touchscreen.tap(startX, startY);
  await page.touchscreen.touchStart(startX, startY);
  await page.touchscreen.touchMove(startX, endY);
  await page.touchscreen.touchEnd();

  return readConsentScrollMetrics(page);
}
