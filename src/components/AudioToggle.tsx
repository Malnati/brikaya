// src/components/AudioToggle.tsx
interface AudioToggleProps {
  muted: boolean;
  onToggle: () => void;
}

const AUDIO_ON_LABEL = 'Som';
const AUDIO_OFF_LABEL = 'Sem som';
const AUDIO_ON_ICON = '♪';
const AUDIO_OFF_ICON = '×';

export function AudioToggle({ muted, onToggle }: AudioToggleProps) {
  return (
    <button
      type="button"
      className="dashboard-button dashboard-button--secondary audio-toggle"
      aria-pressed={!muted}
      onClick={onToggle}
    >
      <span aria-hidden="true" className="button-icon">{muted ? AUDIO_OFF_ICON : AUDIO_ON_ICON}</span>
      {muted ? AUDIO_OFF_LABEL : AUDIO_ON_LABEL}
    </button>
  );
}
