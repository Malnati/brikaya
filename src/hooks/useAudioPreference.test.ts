// src/hooks/useAudioPreference.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";

import {
  AUDIO_STORAGE_ENABLED_VALUE,
  AUDIO_STORAGE_MUTED_KEY,
  AUDIO_STORAGE_MUTED_VALUE,
} from "../constants/audio";
import { audioManager } from "../utils/audioManager";
import { useAudioPreference } from "./useAudioPreference";

function mockGetItem(value: string | null): void {
  (window.localStorage.getItem as jest.Mock).mockReturnValue(value);
}

describe("useAudioPreference", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem(null);
    jest.spyOn(audioManager, "setMuted");
    jest.spyOn(audioManager, "unlock").mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("inicia mudo quando não existe preferência salva", async () => {
    mockGetItem(null);

    const { result } = renderHook(() => useAudioPreference());

    expect(result.current.isAudioMuted).toBe(true);
    await waitFor(() =>
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        AUDIO_STORAGE_MUTED_KEY,
        AUDIO_STORAGE_MUTED_VALUE,
      ),
    );
    expect(audioManager.setMuted).toHaveBeenCalledWith(true);
  });

  it("mantém som ligado quando a preferência salva é enabled", () => {
    mockGetItem(AUDIO_STORAGE_ENABLED_VALUE);

    const { result } = renderHook(() => useAudioPreference());

    expect(result.current.isAudioMuted).toBe(false);
  });

  it("mantém mudo quando a preferência salva é muted", () => {
    mockGetItem(AUDIO_STORAGE_MUTED_VALUE);

    const { result } = renderHook(() => useAudioPreference());

    expect(result.current.isAudioMuted).toBe(true);
  });

  it("usa mudo quando o storage falha", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error("storage indisponível");
    });

    const { result } = renderHook(() => useAudioPreference());

    expect(result.current.isAudioMuted).toBe(true);
  });

  it("só ativa som depois de desbloquear áudio", async () => {
    mockGetItem(null);
    const { result } = renderHook(() => useAudioPreference());
    let toggleResult:
      | Awaited<ReturnType<typeof result.current.toggleAudio>>
      | undefined;

    await act(async () => {
      toggleResult = await result.current.toggleAudio();
    });

    expect(audioManager.unlock).toHaveBeenCalledTimes(1);
    expect(toggleResult).toEqual({
      changed: true,
      muted: false,
      unlocked: true,
    });
    expect(result.current.isAudioMuted).toBe(false);
    expect(audioManager.setMuted).toHaveBeenLastCalledWith(false);
  });

  it("mantém mudo quando o desbloqueio do áudio falha", async () => {
    mockGetItem(null);
    (audioManager.unlock as jest.Mock).mockResolvedValue(false);
    const { result } = renderHook(() => useAudioPreference());
    let toggleResult:
      | Awaited<ReturnType<typeof result.current.toggleAudio>>
      | undefined;

    await act(async () => {
      toggleResult = await result.current.toggleAudio();
    });

    expect(toggleResult).toEqual({
      changed: false,
      muted: true,
      unlocked: false,
    });
    expect(result.current.isAudioMuted).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenLastCalledWith(
      AUDIO_STORAGE_MUTED_KEY,
      AUDIO_STORAGE_MUTED_VALUE,
    );
  });
});
