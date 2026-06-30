// src/components/LevelToast.tsx
import { LevelTransitionPayload } from '../constants/game';

interface LevelToastProps {
  payload: LevelTransitionPayload | null;
  visible: boolean;
}

export function LevelToast({ payload, visible }: LevelToastProps) {
  if (!payload) return null;

  return (
    <div
      className={`level-toast ${visible ? 'level-toast--visible' : 'level-toast--hidden'}`}
      aria-live="polite"
      data-testid="level-toast"
    >
      Fase {payload.nextLevel} • velocidade {payload.nextSpeedMultiplier.toFixed(2)}×
    </div>
  );
}
