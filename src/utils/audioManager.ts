// src/utils/audioManager.ts
import {
  AUDIO_CATALOG,
  AUDIO_DEFAULT_FADE_MS,
  AUDIO_DUCKING_GAIN,
  AUDIO_DUCKING_RELEASE_MS,
  AUDIO_EVENT_IDS,
  AUDIO_MASTER_VOLUME,
  AUDIO_MAX_SIMULTANEOUS_SFX,
  AUDIO_PUBLIC_PATHS,
  AUDIO_QA_SCENARIO,
  GAMEPLAY_MUSIC_AUDIO_ID,
  HIGH_INTENSITY_MUSIC_AUDIO_ID,
  MENU_MUSIC_AUDIO_ID,
  SILENT_AUDIO_ID,
  type AudioId,
} from '../constants/audio';
import { ERROR, WARN } from './logger';

const AUDIO_CONTEXT_RUNNING_STATE = 'running';
const AUDIO_CONTEXT_SUSPENDED_STATE = 'suspended';
const FETCH_CACHE_MODE: RequestCache = 'force-cache';
const AUDIO_EVENT_PLAYED_STATUS = 'played';
const AUDIO_EVENT_MUTED_STATUS = 'muted';
const AUDIO_EVENT_BLOCKED_STATUS = 'blocked';
const AUDIO_EVENT_SILENT_STATUS = 'silent';
const AUDIO_EVENT_FAILED_STATUS = 'failed';
const AUDIO_EVENT_TOUR_DELAY_MS = 24;
const AUDIO_ERROR_MESSAGE = 'Falha recuperável de áudio.';
const MUSIC_SWAP_AUDIO_IDS = new Set<AudioId>([MENU_MUSIC_AUDIO_ID, GAMEPLAY_MUSIC_AUDIO_ID]);
const AUDIO_CONTEXT_MISSING_STATE = 'missing';
const AUDIO_UNLOCK_NOT_STARTED_REASON = 'not_started';
const AUDIO_UNLOCK_ALREADY_RUNNING_REASON = 'already_running';
const AUDIO_UNLOCK_OK_REASON = 'ok';
const AUDIO_UNLOCK_UNAVAILABLE_REASON = 'audio_context_unavailable';
const AUDIO_UNLOCK_FAILED_REASON = 'audio_context_failed';
const SILENT_UNLOCK_CHANNEL_COUNT = 1;
const SILENT_UNLOCK_FRAME_COUNT = 1;
const SILENT_UNLOCK_GAIN = 0;

type AudioEventStatus =
  | typeof AUDIO_EVENT_PLAYED_STATUS
  | typeof AUDIO_EVENT_MUTED_STATUS
  | typeof AUDIO_EVENT_BLOCKED_STATUS
  | typeof AUDIO_EVENT_SILENT_STATUS
  | typeof AUDIO_EVENT_FAILED_STATUS;

interface AudioQaEvent {
  id: AudioId;
  status: AudioEventStatus;
  path: string | null;
  timestamp: number;
}

interface AudioUnlockResult {
  unlocked: boolean;
  contextState: string;
  reason: string;
}

interface ActiveMusicNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

interface AudioWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
  __brickbreakerAudioEvents?: AudioQaEvent[];
  __brickbreakerRunAudioTour?: () => Promise<AudioId[]>;
  __brickbreakerAudioState?: () => {
    muted: boolean;
    unlocked: boolean;
    contextState: string;
    lastUnlockResult: AudioUnlockResult;
    loaded: number;
    events: AudioQaEvent[];
  };
}

function getAudioWindow(): AudioWindow | null {
  if (typeof window === 'undefined') return null;
  return window as AudioWindow;
}

function getAudioContextConstructor(audioWindow: AudioWindow): typeof AudioContext | null {
  return audioWindow.AudioContext || audioWindow.webkitAudioContext || null;
}

function secondsFromMs(milliseconds: number): number {
  return milliseconds / 1000;
}

function createDelay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

class BrickBreakerAudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loadingBuffers = new Map<string, Promise<AudioBuffer | null>>();
  private activeMusic = new Map<AudioId, ActiveMusicNode>();
  private muted = true;
  private unlocked = false;
  private activeSfxCount = 0;
  private duckingTimer: ReturnType<typeof setTimeout> | null = null;
  private lastUnlockResult: AudioUnlockResult = {
    unlocked: false,
    contextState: AUDIO_CONTEXT_MISSING_STATE,
    reason: AUDIO_UNLOCK_NOT_STARTED_REASON,
  };

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterVolume();
    if (muted) {
      this.stopMusic();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  async unlock(): Promise<boolean> {
    if (this.unlocked && this.audioContext?.state === AUDIO_CONTEXT_RUNNING_STATE) {
      this.recordUnlockResult(true, AUDIO_UNLOCK_ALREADY_RUNNING_REASON);
      return true;
    }

    const audioWindow = getAudioWindow();
    if (!audioWindow) return false;

    const AudioContextConstructor = getAudioContextConstructor(audioWindow);
    if (!AudioContextConstructor) {
      this.recordUnlockResult(false, AUDIO_UNLOCK_UNAVAILABLE_REASON);
      this.recordEvent(SILENT_AUDIO_ID, AUDIO_EVENT_BLOCKED_STATUS, null);
      return false;
    }

    try {
      this.ensureAudioGraph(AudioContextConstructor);
      this.playSilentUnlockPulse();
      if (this.audioContext?.state === AUDIO_CONTEXT_SUSPENDED_STATE) {
        await this.audioContext.resume();
      }
      this.unlocked = this.audioContext?.state === AUDIO_CONTEXT_RUNNING_STATE;
      this.recordUnlockResult(this.unlocked, AUDIO_UNLOCK_OK_REASON);
      this.applyMasterVolume();
      void this.preloadAll();
      return this.unlocked;
    } catch (error) {
      WARN(AUDIO_ERROR_MESSAGE, error);
      this.recordUnlockResult(false, AUDIO_UNLOCK_FAILED_REASON);
      this.recordEvent(SILENT_AUDIO_ID, AUDIO_EVENT_FAILED_STATUS, null);
      return false;
    }
  }

  async preloadAll(): Promise<void> {
    if (!this.audioContext) return;
    await Promise.all(AUDIO_PUBLIC_PATHS.map(path => this.loadBuffer(path)));
  }

  async play(id: AudioId): Promise<void> {
    const entry = AUDIO_CATALOG[id];
    const path = this.pickFile(id);

    if (id === SILENT_AUDIO_ID || entry.volume === 0 || !path) {
      this.recordEvent(id, AUDIO_EVENT_SILENT_STATUS, path);
      return;
    }

    if (this.muted) {
      this.recordEvent(id, AUDIO_EVENT_MUTED_STATUS, path);
      return;
    }

    if (!this.unlocked || !this.audioContext || !this.sfxGain) {
      this.recordEvent(id, AUDIO_EVENT_BLOCKED_STATUS, path);
      return;
    }

    if (entry.type === 'music') {
      await this.playMusic(id);
      return;
    }

    if (this.activeSfxCount >= AUDIO_MAX_SIMULTANEOUS_SFX) {
      this.recordEvent(id, AUDIO_EVENT_BLOCKED_STATUS, path);
      return;
    }

    const buffer = await this.loadBuffer(path);
    if (!buffer || !this.audioContext || !this.sfxGain) {
      this.recordEvent(id, AUDIO_EVENT_FAILED_STATUS, path);
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = buffer;
    gain.gain.value = entry.volume;
    source.connect(gain);
    gain.connect(this.sfxGain);
    this.activeSfxCount += 1;
    source.onended = () => {
      this.activeSfxCount = Math.max(0, this.activeSfxCount - 1);
    };
    source.start();
    this.duck(entry.duckingMs);
    this.recordEvent(id, AUDIO_EVENT_PLAYED_STATUS, path);
  }

  async playMusic(id: AudioId): Promise<void> {
    const entry = AUDIO_CATALOG[id];
    const path = this.pickFile(id);

    if (!path || id === SILENT_AUDIO_ID) {
      this.recordEvent(id, AUDIO_EVENT_SILENT_STATUS, path);
      return;
    }

    if (this.muted) {
      this.recordEvent(id, AUDIO_EVENT_MUTED_STATUS, path);
      return;
    }

    if (!this.unlocked || !this.audioContext || !this.musicGain) {
      this.recordEvent(id, AUDIO_EVENT_BLOCKED_STATUS, path);
      return;
    }

    if (this.activeMusic.has(id)) return;

    if (MUSIC_SWAP_AUDIO_IDS.has(id)) {
      for (const activeId of MUSIC_SWAP_AUDIO_IDS) {
        if (activeId !== id) this.stopMusic(activeId);
      }
    }

    const buffer = await this.loadBuffer(path);
    if (!buffer || !this.audioContext || !this.musicGain) {
      this.recordEvent(id, AUDIO_EVENT_FAILED_STATUS, path);
      return;
    }

    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = buffer;
    source.loop = entry.loop;
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(entry.volume, this.audioContext.currentTime + secondsFromMs(entry.fadeInMs || AUDIO_DEFAULT_FADE_MS));
    source.connect(gain);
    gain.connect(this.musicGain);
    source.start();
    this.activeMusic.set(id, { source, gain });
    this.recordEvent(id, AUDIO_EVENT_PLAYED_STATUS, path);
  }

  stopMusic(id?: AudioId): void {
    const ids = id ? [id] : Array.from(this.activeMusic.keys());
    for (const activeId of ids) {
      const node = this.activeMusic.get(activeId);
      const context = this.audioContext;
      if (!node || !context) continue;
      const fadeMs = AUDIO_CATALOG[activeId].fadeOutMs || AUDIO_DEFAULT_FADE_MS;
      node.gain.gain.cancelScheduledValues(context.currentTime);
      node.gain.gain.setValueAtTime(node.gain.gain.value, context.currentTime);
      node.gain.gain.linearRampToValueAtTime(0, context.currentTime + secondsFromMs(fadeMs));
      getAudioWindow()?.setTimeout(() => {
        try {
          node.source.stop();
        } catch {}
      }, fadeMs + AUDIO_DEFAULT_FADE_MS);
      this.activeMusic.delete(activeId);
    }
  }

  async setHighIntensity(active: boolean): Promise<void> {
    if (active) {
      await this.playMusic(HIGH_INTENSITY_MUSIC_AUDIO_ID);
      return;
    }
    this.stopMusic(HIGH_INTENSITY_MUSIC_AUDIO_ID);
  }

  duck(durationMs: number): void {
    if (!this.musicGain || !this.audioContext || durationMs <= 0) return;
    if (this.duckingTimer) clearTimeout(this.duckingTimer);
    this.musicGain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.musicGain.gain.setValueAtTime(AUDIO_DUCKING_GAIN, this.audioContext.currentTime);
    this.duckingTimer = setTimeout(() => {
      if (!this.musicGain || !this.audioContext) return;
      this.musicGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + secondsFromMs(AUDIO_DUCKING_RELEASE_MS));
    }, durationMs);
  }

  async runQaTour(): Promise<AudioId[]> {
    for (const id of AUDIO_EVENT_IDS) {
      await this.play(id);
      await createDelay(AUDIO_EVENT_TOUR_DELAY_MS);
    }
    return [...AUDIO_EVENT_IDS];
  }

  exposeQaApi(): void {
    const audioWindow = getAudioWindow();
    if (!audioWindow) return;
    audioWindow.__brickbreakerAudioEvents = audioWindow.__brickbreakerAudioEvents || [];
    audioWindow.__brickbreakerRunAudioTour = () => this.runQaTour();
    audioWindow.__brickbreakerAudioState = () => ({
      muted: this.muted,
      unlocked: this.unlocked,
      contextState: this.audioContext?.state || AUDIO_CONTEXT_MISSING_STATE,
      lastUnlockResult: this.lastUnlockResult,
      loaded: this.buffers.size,
      events: [...(audioWindow.__brickbreakerAudioEvents || [])],
    });
  }

  shouldRunQaTour(): boolean {
    const audioWindow = getAudioWindow();
    if (!audioWindow) return false;
    return new URLSearchParams(audioWindow.location.search).get('qaScenario') === AUDIO_QA_SCENARIO;
  }

  private ensureAudioGraph(AudioContextConstructor: typeof AudioContext): void {
    if (this.audioContext) return;
    this.audioContext = new AudioContextConstructor();
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    this.applyMasterVolume();
  }

  private playSilentUnlockPulse(): void {
    if (!this.audioContext || !this.masterGain) return;
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = this.audioContext.createBuffer(
      SILENT_UNLOCK_CHANNEL_COUNT,
      SILENT_UNLOCK_FRAME_COUNT,
      this.audioContext.sampleRate,
    );
    gain.gain.value = SILENT_UNLOCK_GAIN;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  private applyMasterVolume(): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = this.muted ? 0 : AUDIO_MASTER_VOLUME;
  }

  private recordUnlockResult(unlocked: boolean, reason: string): void {
    this.lastUnlockResult = {
      unlocked,
      contextState: this.audioContext?.state || AUDIO_CONTEXT_MISSING_STATE,
      reason,
    };
  }

  private pickFile(id: AudioId): string | null {
    const files = AUDIO_CATALOG[id].files;
    if (files.length === 0) return null;
    return files[Math.floor(Math.random() * files.length)] || files[0];
  }

  private async loadBuffer(path: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(path)) return this.buffers.get(path) || null;
    if (this.loadingBuffers.has(path)) return this.loadingBuffers.get(path) || null;
    if (!this.audioContext) return null;

    const promise = fetch(path, { cache: FETCH_CACHE_MODE })
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext?.decodeAudioData(arrayBuffer) || null)
      .then(buffer => {
        if (buffer) this.buffers.set(path, buffer);
        return buffer;
      })
      .catch(error => {
        ERROR(AUDIO_ERROR_MESSAGE, error);
        return null;
      })
      .finally(() => {
        this.loadingBuffers.delete(path);
      });

    this.loadingBuffers.set(path, promise);
    return promise;
  }

  private recordEvent(id: AudioId, status: AudioEventStatus, path: string | null): void {
    const audioWindow = getAudioWindow();
    if (!audioWindow) return;
    audioWindow.__brickbreakerAudioEvents = audioWindow.__brickbreakerAudioEvents || [];
    audioWindow.__brickbreakerAudioEvents.push({ id, status, path, timestamp: Date.now() });
  }
}

export const audioManager = new BrickBreakerAudioManager();
