import { useEffect, useRef } from "react";

import { useI18n } from "../i18n";

interface PostAdResumePromptProps {
  nextLevel: number;
  speedLabel: string;
  onResume: () => void;
}

const TITLE_ID = "post-ad-resume-title";
const DESCRIPTION_ID = "post-ad-resume-description";

export function PostAdResumePrompt({
  nextLevel,
  speedLabel,
  onResume,
}: PostAdResumePromptProps) {
  const { t } = useI18n();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      className="post-ad-resume"
      role="dialog"
      aria-modal="true"
      aria-label={t("postAdResume.aria")}
      aria-describedby={DESCRIPTION_ID}
      data-testid="post-ad-resume-prompt"
    >
      <div className="post-ad-resume__halo" aria-hidden="true" />
      <section className="post-ad-resume__panel">
        <p className="post-ad-resume__eyebrow">
          {t("cinematic.speedPrefix")} {speedLabel}
        </p>
        <h2 id={TITLE_ID}>{t("postAdResume.title")}</h2>
        <p id={DESCRIPTION_ID} className="post-ad-resume__body">
          {t("postAdResume.body", { level: nextLevel })}
        </p>
        <p className="post-ad-resume__thanks">{t("postAdResume.thanks")}</p>
        <button
          ref={buttonRef}
          type="button"
          className="dashboard-button dashboard-button--primary post-ad-resume__button"
          data-testid="post-ad-resume-cta"
          onClick={onResume}
        >
          {t("postAdResume.cta")}
        </button>
      </section>
    </div>
  );
}
