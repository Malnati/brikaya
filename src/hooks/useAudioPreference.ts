// src/hooks/useAudioPreference.ts
import { useCallback, useEffect, useState } from 'react';

import {
  AUDIO_STORAGE_ENABLED_VALUE,
  AUDIO_STORAGE_MUTED_KEY,
  AUDIO_STORAGE_MUTED_VALUE,
} from '../constants/audio';
import { audioManager } from '../utils/audioManager';

const STORAGE_UNAVAILABLE_FALLBACK_MUTED = true;

export interface AudioPreferenceToggleResult {
  changed: boolean;
  muted: boolean;
  unlocked: boolean;
}

function readInitialMuted(): boolean {
  try {
    return window.localStorage.getItem(AUDIO_STORAGE_MUTED_KEY) !== AUDIO_STORAGE_ENABLED_VALUE;
  } catch {
    return STORAGE_UNAVAILABLE_FALLBACK_MUTED;
  }
}

function persistMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(
      AUDIO_STORAGE_MUTED_KEY,
      muted ? AUDIO_STORAGE_MUTED_VALUE : AUDIO_STORAGE_ENABLED_VALUE,
    );
  } catch {}
}

export function useAudioPreference() {
  const [isAudioMuted, setIsAudioMuted] = useState(readInitialMuted);

  useEffect(() => {
    audioManager.setMuted(isAudioMuted);
    persistMuted(isAudioMuted);
  }, [isAudioMuted]);

  const toggleAudio = useCallback(async () => {
    if (isAudioMuted) {
      const unlocked = await audioManager.unlock();
      if (unlocked) {
        audioManager.setMuted(false);
        setIsAudioMuted(false);
        return { changed: true, muted: false, unlocked };
      }
      audioManager.setMuted(true);
      return { changed: false, muted: true, unlocked };
    }

    audioManager.setMuted(true);
    setIsAudioMuted(true);
    return { changed: true, muted: true, unlocked: audioManager.isUnlocked() };
  }, [isAudioMuted]);

  return { isAudioMuted, setIsAudioMuted, toggleAudio };
}
