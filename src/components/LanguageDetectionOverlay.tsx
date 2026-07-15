// src/components/LanguageDetectionOverlay.tsx
import { useMemo } from "react";

import { useI18n } from "../i18n";

const GLYPH_ROWS = 10;
const GLYPH_COLUMNS = 22;
const GLYPH_SOURCE = "BRIKAYA0123456789<>/{}[]#$%&*+=?@";
const GLYPH_SOURCE_LENGTH = GLYPH_SOURCE.length;
const PROGRESS_NOW = 100;
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 100;

function buildGlyphRows(): string[] {
  return Array.from({ length: GLYPH_ROWS }, (_rowValue, rowIndex) =>
    Array.from({ length: GLYPH_COLUMNS }, (_columnValue, columnIndex) => {
      const sourceIndex =
        (rowIndex * GLYPH_COLUMNS + columnIndex * (rowIndex + 3)) %
        GLYPH_SOURCE_LENGTH;
      return GLYPH_SOURCE[sourceIndex];
    }).join(""),
  );
}

export function LanguageDetectionOverlay() {
  const { t } = useI18n();
  const glyphRows = useMemo(buildGlyphRows, []);

  return (
    <div
      className="language-detection-overlay"
      role="status"
      aria-live="polite"
      data-testid="language-detection-overlay"
    >
      <div className="language-detection-overlay__rain" aria-hidden="true">
        {glyphRows.map((row, index) => (
          <span key={`${row}-${index}`}>{row}</span>
        ))}
      </div>
      <div className="language-detection-overlay__panel">
        <p className="language-detection-overlay__eyebrow">Brikaya</p>
        <h2>{t("language.detectingTitle")}</h2>
        <p>{t("language.detectingBody")}</p>
        <div
          className="language-detection-overlay__track"
          role="progressbar"
          aria-label={t("language.detectingProgress")}
          aria-valuemin={PROGRESS_MIN}
          aria-valuemax={PROGRESS_MAX}
          aria-valuenow={PROGRESS_NOW}
        >
          <span className="language-detection-overlay__bar" />
        </div>
      </div>
    </div>
  );
}
