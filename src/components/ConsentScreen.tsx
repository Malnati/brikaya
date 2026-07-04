// src/components/ConsentScreen.tsx
import { useI18n } from "../i18n";

interface ConsentScreenProps {
  onAccept: () => void;
}

const CONSENT_TITLE_ID = "privacy-consent-title";

export function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const { t } = useI18n();

  return (
    <div
      className="consent-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby={CONSENT_TITLE_ID}
    >
      <div className="consent-screen__panel">
        <p className="consent-screen__brand">{t("consent.brand")}</p>
        <h2 id={CONSENT_TITLE_ID}>{t("consent.title")}</h2>
        <p>{t("consent.body.storage")}</p>
        <p>{t("consent.body.ads")}</p>
        <button
          type="button"
          className="dashboard-button dashboard-button--primary consent-screen__button"
          onClick={onAccept}
        >
          {t("consent.accept")}
        </button>
      </div>
    </div>
  );
}
