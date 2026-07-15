// src/hooks/useTypingEffect.ts
import { useMemo } from "react";

export function useTypingEffect(
  fullText: string,
  startMs: number,
  durationMs: number,
  elapsedMs: number,
  isSkipped: boolean,
): string {
  return useMemo(() => {
    if (isSkipped || durationMs <= 0) {
      return fullText;
    }

    if (elapsedMs < startMs) {
      return "";
    }

    const timeSinceStart = elapsedMs - startMs;

    if (timeSinceStart >= durationMs) {
      return fullText;
    }

    const progress = timeSinceStart / durationMs;
    const targetLength = Math.floor(progress * fullText.length);

    return fullText.slice(0, Math.max(0, targetLength));
  }, [fullText, startMs, durationMs, elapsedMs, isSkipped]);
}
