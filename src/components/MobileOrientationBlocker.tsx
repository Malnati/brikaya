const ORIENTATION_BLOCKER_MESSAGE =
  "Você precisa de espaço para o joystick";

export function MobileOrientationBlocker() {
  return (
    <div
      className="mobile-orientation-blocker"
      data-testid="mobile-orientation-blocker"
      role="alertdialog"
      aria-modal="true"
      aria-label={ORIENTATION_BLOCKER_MESSAGE}
    >
      <div className="mobile-orientation-blocker__panel">
        <svg
          className="mobile-orientation-blocker__arrow"
          viewBox="0 0 96 96"
          role="img"
          aria-label="Vire para a posição vertical"
          focusable="false"
        >
          <path
            d="M30 20h24c11 0 20 9 20 20v3"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <path
            d="M61 31l13 13 13-13"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          <rect
            x="24"
            y="44"
            width="34"
            height="44"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
          />
        </svg>
        <p>{ORIENTATION_BLOCKER_MESSAGE}</p>
      </div>
    </div>
  );
}
