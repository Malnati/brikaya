// src/utils/audioManager.test.ts
import {
  AUDIO_CATALOG,
  GAMEPLAY_MUSIC_AUDIO_ID,
  GAME_AUDIO_IDS,
  SILENT_AUDIO_ID,
} from '../constants/audio';
import { audioManager } from './audioManager';

interface TestAudioWindow extends Window {
  __brikayaAudioEvents?: Array<{ id: string; status: string; path: string | null }>;
  __brikayaAudioState?: () => {
    musicMuted: boolean;
    latencySensitiveEffectsReady: boolean;
    loadedPaths: string[];
    events: Array<{ id: string; status: string; path: string | null }>;
  };
}

function testWindow(): TestAudioWindow {
  return window as TestAudioWindow;
}

type AudioManagerModule = typeof import('./audioManager');

interface LatencyTestAudioContextControls {
  start: jest.Mock;
  decodeAudioData: jest.Mock;
  resolveAllDecodes: () => Promise<void>;
}

async function loadFreshAudioManager(): Promise<AudioManagerModule> {
  jest.resetModules();
  return import('./audioManager');
}

function installLatencyTestAudioContext(): LatencyTestAudioContextControls {
  const start = jest.fn();
  const connect = jest.fn();
  const decodeResolvers: Array<(buffer: AudioBuffer) => void> = [];
  const createBuffer = jest.fn(() => ({ length: 1 }));
  const createBufferSource = jest.fn(() => ({
    buffer: null,
    connect,
    start,
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
  const decodeAudioData = jest.fn(
    () =>
      new Promise<AudioBuffer>((resolve) => {
        decodeResolvers.push(resolve);
      }),
  );

  class MockAudioContext {
    state = 'running';
    destination = {};
    currentTime = 0;
    sampleRate = 44100;
    createBuffer = createBuffer;
    createBufferSource = createBufferSource;
    createGain = createGain;
    decodeAudioData = decodeAudioData;
    resume = jest.fn().mockResolvedValue(undefined);
  }

  Object.defineProperty(window, 'AudioContext', {
    configurable: true,
    value: MockAudioContext,
  });

  return {
    start,
    decodeAudioData,
    resolveAllDecodes: async () => {
      const resolvers = [...decodeResolvers];
      decodeResolvers.length = 0;
      for (const resolve of resolvers) {
        resolve({ duration: 1 } as AudioBuffer);
      }
      await Promise.resolve();
    },
  };
}

async function waitForDecodeCalls(
  audioControls: LatencyTestAudioContextControls,
  minimumCallCount: number,
): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (audioControls.decodeAudioData.mock.calls.length >= minimumCallCount) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error(`decodeAudioData não chegou a ${minimumCallCount} chamada(s).`);
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

    expect(global.fetch).toHaveBeenCalledWith(
      AUDIO_CATALOG[GAME_AUDIO_IDS.PADDLE_HIT_CENTER].files[0],
      { cache: 'force-cache' },
    );
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

  it('não toca efeito sensível a tempo depois que o decode atrasado termina', async () => {
    const fresh = await loadFreshAudioManager();
    const audioControls = installLatencyTestAudioContext();
    const arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(1));
    global.fetch = jest.fn().mockResolvedValue({ arrayBuffer }) as jest.Mock;
    testWindow().__brikayaAudioEvents = [];
    fresh.audioManager.exposeQaApi();

    await fresh.audioManager.unlock();
    fresh.audioManager.setMuted(false);
    audioControls.start.mockClear();

    const playPromise = fresh.audioManager.play(GAME_AUDIO_IDS.PADDLE_HIT_CENTER);
    await waitForDecodeCalls(audioControls, 1);

    expect(audioControls.start).not.toHaveBeenCalled();

    await audioControls.resolveAllDecodes();
    await playPromise;

    expect(audioControls.start).not.toHaveBeenCalled();
    expect(testWindow().__brikayaAudioState?.().events).toContainEqual(
      expect.objectContaining({
        id: GAME_AUDIO_IDS.PADDLE_HIT_CENTER,
        status: 'blocked',
      }),
    );
  });

  it('preaquece todas as variações de efeitos sensíveis para tocar no mesmo tick do evento', async () => {
    const fresh = await loadFreshAudioManager();
    const audioControls = installLatencyTestAudioContext();
    const arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(1));
    global.fetch = jest.fn().mockResolvedValue({ arrayBuffer }) as jest.Mock;
    testWindow().__brikayaAudioEvents = [];
    fresh.audioManager.exposeQaApi();

    await fresh.audioManager.unlock();
    fresh.audioManager.setMuted(false);
    const expectedPaths = AUDIO_CATALOG[GAME_AUDIO_IDS.PADDLE_HIT_CENTER].files;
    const preloadLatencySensitiveEffects = (
      fresh.audioManager as typeof fresh.audioManager & {
        preloadLatencySensitiveEffects: () => Promise<void>;
      }
    ).preloadLatencySensitiveEffects;
    const preloadPromise = preloadLatencySensitiveEffects.call(fresh.audioManager);
    await waitForDecodeCalls(audioControls, expectedPaths.length);
    await audioControls.resolveAllDecodes();
    await preloadPromise;
    audioControls.start.mockClear();

    await fresh.audioManager.play(GAME_AUDIO_IDS.PADDLE_HIT_CENTER);

    const requestedPaths = (global.fetch as jest.Mock).mock.calls.map(
      ([path]) => path,
    );
    const audioState = testWindow().__brikayaAudioState?.();
    for (const expectedPath of expectedPaths) {
      expect(requestedPaths).toContain(expectedPath);
      expect(audioState?.loadedPaths).toContain(expectedPath);
    }
    expect(audioState?.latencySensitiveEffectsReady).toBe(true);
    expect(audioControls.start).toHaveBeenCalledTimes(1);
  });
});
