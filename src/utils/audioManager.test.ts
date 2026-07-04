// src/utils/audioManager.test.ts
import { GAMEPLAY_MUSIC_AUDIO_ID, GAME_AUDIO_IDS, SILENT_AUDIO_ID } from '../constants/audio';
import { audioManager } from './audioManager';

interface TestAudioWindow extends Window {
  __brikayaAudioEvents?: Array<{ id: string; status: string; path: string | null }>;
  __brikayaAudioState?: () => {
    musicMuted: boolean;
    events: Array<{ id: string; status: string; path: string | null }>;
  };
}

function testWindow(): TestAudioWindow {
  return window as TestAudioWindow;
}

describe('audioManager', () => {
  beforeEach(() => {
    testWindow().__brikayaAudioEvents = [];
    audioManager.exposeQaApi();
    audioManager.setMuted(true);
    audioManager.setMusicMuted(false);
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1)),
    }) as jest.Mock;
    delete (window as Partial<Window>).AudioContext;
    delete (window as Partial<Window>).webkitAudioContext;
  });

  it('registra silêncio lógico sem tentar tocar arquivo', async () => {
    await audioManager.play(SILENT_AUDIO_ID);
    const events = testWindow().__brikayaAudioState?.().events || [];
    expect(events).toContainEqual(expect.objectContaining({
      id: SILENT_AUDIO_ID,
      status: 'silent',
      path: null,
    }));
  });

  it('registra evento mutado sem bloquear o jogo', async () => {
    await audioManager.play(GAME_AUDIO_IDS.BUTTON_PRESS);
    const events = testWindow().__brikayaAudioState?.().events || [];
    expect(events).toContainEqual(expect.objectContaining({
      id: GAME_AUDIO_IDS.BUTTON_PRESS,
      status: 'muted',
    }));
  });

  it('desbloqueia o Web Audio com pulso silencioso no gesto do usuário', async () => {
    const start = jest.fn();
    const connect = jest.fn();
    const createBuffer = jest.fn(() => ({ length: 1 }));
    const createBufferSource = jest.fn(() => ({
      buffer: null,
      connect,
      start,
    }));
    const createGain = jest.fn(() => ({
      connect,
      gain: {
        value: 1,
        cancelScheduledValues: jest.fn(),
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
      },
    }));

    class MockAudioContext {
      state = 'running';
      destination = {};
      currentTime = 0;
      sampleRate = 44100;
      createBuffer = createBuffer;
      createBufferSource = createBufferSource;
      createGain = createGain;
      decodeAudioData = jest.fn().mockResolvedValue({ duration: 1 });
      resume = jest.fn().mockResolvedValue(undefined);
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });

    await expect(audioManager.unlock()).resolves.toBe(true);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(createBuffer).toHaveBeenCalledWith(1, 1, 44100);
    expect(createBufferSource).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(testWindow().__brikayaAudioState?.()).toEqual(
      expect.objectContaining({
        unlocked: true,
        contextState: 'running',
        lastUnlockResult: expect.objectContaining({ unlocked: true }),
      }),
    );
  });

  it('pausa música sem mutar efeitos sonoros', async () => {
    const connect = jest.fn();
    const createBufferSource = jest.fn(() => ({
      buffer: null,
      connect,
      start: jest.fn(),
      onended: null,
    }));
    const createGain = jest.fn(() => ({
      connect,
      gain: {
        value: 1,
        cancelScheduledValues: jest.fn(),
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
      },
    }));

    class MockAudioContext {
      state = 'running';
      destination = {};
      currentTime = 0;
      sampleRate = 44100;
      createBuffer = jest.fn(() => ({ length: 1 }));
      createBufferSource = createBufferSource;
      createGain = createGain;
      decodeAudioData = jest.fn().mockResolvedValue({ duration: 1 });
      resume = jest.fn().mockResolvedValue(undefined);
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });

    await audioManager.unlock();
    audioManager.setMuted(false);
    audioManager.setMusicMuted(true);
    expect(audioManager.isMusicMuted()).toBe(true);

    await audioManager.playMusic(GAMEPLAY_MUSIC_AUDIO_ID);
    await audioManager.play(GAME_AUDIO_IDS.BUTTON_PRESS);

    const events = testWindow().__brikayaAudioState?.().events || [];
    expect(testWindow().__brikayaAudioState?.().musicMuted).toBe(true);
    expect(events).toContainEqual(expect.objectContaining({
      id: GAMEPLAY_MUSIC_AUDIO_ID,
      status: 'muted',
    }));
    expect(events).toContainEqual(expect.objectContaining({
      id: GAME_AUDIO_IDS.BUTTON_PRESS,
      status: 'played',
    }));
  });
});
