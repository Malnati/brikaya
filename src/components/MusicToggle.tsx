// src/components/MusicToggle.tsx
import { useI18n } from "../i18n";

interface MusicToggleProps {
  muted: boolean;
  onToggle: () => void;
  iconOnly?: boolean;
  className?: string;
}

const MUSIC_ON_ICON = "♫";
const MUSIC_OFF_ICON = "×";

export function MusicToggle({
  muted,
  onToggle,
  iconOnly = false,
  className = "",
}: MusicToggleProps) {
  const { t } = useI18n();
  const label = muted ? t("music.off") : t("music.on");
  const icon = muted ? MUSIC_OFF_ICON : MUSIC_ON_ICON;
  const buttonClassName = [
    "dashboard-button",
    "dashboard-button--secondary",
    "music-toggle",
    iconOnly ? "music-toggle--icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={buttonClassName}
      aria-pressed={!muted}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      onClick={onToggle}
    >
      <span aria-hidden="true" className="button-icon">
        {icon}
      </span>
      {!iconOnly && label}
    </button>
  );
}
