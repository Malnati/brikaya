import { ACCEPT_BUTTON_LABELS } from './consentSelectors.js';

const CONSENT_SCREEN_SELECTOR = '[data-testid="consent-screen"], .consent-screen';

export async function readConsentScrollMetrics(page) {
  return page.evaluate((selector) => {
    const consent = document.querySelector(selector);
    if (!consent) {
      return null;
    }

    const style = window.getComputedStyle(consent);
    return {
      scrollHeight: consent.scrollHeight,
      clientHeight: consent.clientHeight,
      scrollTop: consent.scrollTop,
      overflowY: style.overflowY,
      canScroll: consent.scrollHeight > consent.clientHeight + 1,
    };
  }, CONSENT_SCREEN_SELECTOR);
}

export async function assertConsentScreenScrollable(page, profileLabel) {
  const metrics = await readConsentScrollMetrics(page);
  if (!metrics) {
    throw new Error(`${profileLabel}: tela de consentimento não encontrada.`);
  }

  const allowsScroll = ['auto', 'scroll', 'overlay'].includes(metrics.overflowY);
  if (!allowsScroll) {
    throw new Error(
      `${profileLabel}: consentimento sem overflow rolável (${metrics.overflowY}).`,
    );
  }

  if (!metrics.canScroll) {
    return {
      profileLabel,
      scrolled: false,
      required: false,
      ...metrics,
    };
  }

  const beforeScrollTop = metrics.scrollTop;
  await page.evaluate((selector) => {
    const consent = document.querySelector(selector);
    if (consent) {
      consent.scrollTop = consent.scrollHeight;
    }
  }, CONSENT_SCREEN_SELECTOR);

  const afterMetrics = await readConsentScrollMetrics(page);
  if (!afterMetrics || afterMetrics.scrollTop <= beforeScrollTop) {
    throw new Error(
      `${profileLabel}: consentimento não rolou (scrollTop ${beforeScrollTop} -> ${afterMetrics?.scrollTop ?? 'n/a'}).`,
    );
  }

  return {
    profileLabel,
    scrolled: true,
    required: true,
    beforeScrollTop,
    afterScrollTop: afterMetrics.scrollTop,
    ...afterMetrics,
  };
}

export async function simulateTouchScrollOnConsent(page, { deltaY = 220, steps = 4 } = {}) {
  const scrolled = await page.evaluate(
    async ({ deltaY: scrollDelta, steps: scrollSteps }) => {
      const consent = document.querySelector('.consent-screen');
      if (!consent) {
        return false;
      }

      const rect = consent.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + Math.min(rect.height * 0.75, rect.height - 8);
      const stepDelta = scrollDelta / scrollSteps;

      const dispatchTouch = (type, clientX, clientY) => {
        const touch = new Touch({
          identifier: 1,
          target: consent,
          clientX,
          clientY,
          pageX: clientX + window.scrollX,
          pageY: clientY + window.scrollY,
          radiusX: 2,
          radiusY: 2,
          rotationAngle: 0,
          force: 1,
        });
        consent.dispatchEvent(new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
        }));
      };

      dispatchTouch('touchstart', startX, startY);
      for (let index = 1; index <= scrollSteps; index += 1) {
        const nextY = startY - stepDelta * index;
        dispatchTouch('touchmove', startX, nextY);
        await new Promise((resolve) => window.setTimeout(resolve, 16));
      }
      dispatchTouch('touchend', startX, startY - scrollDelta);
      return true;
    },
    { deltaY, steps },
  );

  if (!scrolled) {
    throw new Error('Consent screen not found for touch scroll simulation.');
  }

  await page.waitForFunction(
  (acceptLabels) => {
    const buttons = Array.from(document.querySelectorAll('.consent-screen button'));
    return buttons.some((button) => {
      const label = (button.textContent || '').trim();
      return acceptLabels.includes(label);
    });
  },
  { timeout: 10_000 },
  ACCEPT_BUTTON_LABELS,
  );
}
