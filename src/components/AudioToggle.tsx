// src/components/AudioToggle.tsx
import { useI18n } from "../i18n";

interface AudioToggleProps {
  muted: boolean;
  onToggle: () => void;
  iconOnly?: boolean;
  className?: string;
}

const AUDIO_ON_ICON = "♪";
const AUDIO_OFF_ICON = "×";

export function AudioToggle({
  muted,
  onToggle,
  iconOnly = false,
  className = "",
}: AudioToggleProps) {
  const { t } = useI18n();
  const label = muted ? t("audio.off") : t("audio.on");
  const icon = muted ? AUDIO_OFF_ICON : AUDIO_ON_ICON;
  const buttonClassName = [
    "dashboard-button",
    "dashboard-button--secondary",
    "audio-toggle",
    iconOnly ? "audio-toggle--icon" : "",
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
