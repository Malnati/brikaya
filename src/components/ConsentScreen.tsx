// src/components/ConsentScreen.tsx
import { useEffect, useState } from "react";

import { useI18n } from "../i18n";

interface ConsentScreenProps {
  onAccept: (allowLanguageLocation: boolean) => void;
}

const CONSENT_TITLE_ID = "privacy-consent-title";
const LANGUAGE_LOCATION_CHECKBOX_ID = "language-location-consent";
const CONSENT_SCREEN_TEST_ID = "consent-screen";

export function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const { t } = useI18n();
  const [allowLanguageLocation, setAllowLanguageLocation] = useState(false);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, []);

  return (
    <div
      className="consent-screen"
      data-testid={CONSENT_SCREEN_TEST_ID}
      role="dialog"
      aria-modal="true"
      aria-labelledby={CONSENT_TITLE_ID}
    >
      <div className="consent-screen__scroller">
        <div className="consent-screen__panel">
          <p className="consent-screen__brand">{t("consent.brand")}</p>
          <h2 id={CONSENT_TITLE_ID}>{t("consent.title")}</h2>
          <p>{t("consent.body.storage")}</p>
          <p>{t("consent.body.location")}</p>
          <p>{t("consent.body.ads")}</p>
          <label
            className="consent-screen__choice"
            htmlFor={LANGUAGE_LOCATION_CHECKBOX_ID}
          >
            <input
              id={LANGUAGE_LOCATION_CHECKBOX_ID}
              type="checkbox"
              checked={allowLanguageLocation}
              onChange={(event) =>
                setAllowLanguageLocation(event.target.checked)
              }
            />
            <span>{t("consent.locationLabel")}</span>
          </label>
          <p className="consent-screen__hint">{t("consent.locationHint")}</p>
          <button
            type="button"
            className="dashboard-button dashboard-button--primary consent-screen__button"
            onClick={() => onAccept(allowLanguageLocation)}
          >
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
