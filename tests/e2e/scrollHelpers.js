import { ACCEPT_BUTTON_LABELS } from './consentSelectors.js';

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
