// src/utils/audioManager.test.ts
import { GAME_AUDIO_IDS, SILENT_AUDIO_ID } from '../constants/audio';
import { audioManager } from './audioManager';

interface TestAudioWindow extends Window {
  __brickbreakerAudioEvents?: Array<{ id: string; status: string; path: string | null }>;
  __brickbreakerAudioState?: () => { events: Array<{ id: string; status: string; path: string | null }> };
}

function testWindow(): TestAudioWindow {
  return window as TestAudioWindow;
}

describe('audioManager', () => {
  beforeEach(() => {
    testWindow().__brickbreakerAudioEvents = [];
    audioManager.exposeQaApi();
    audioManager.setMuted(true);
  });

  it('registra silêncio lógico sem tentar tocar arquivo', async () => {
    await audioManager.play(SILENT_AUDIO_ID);
    const events = testWindow().__brickbreakerAudioState?.().events || [];
    expect(events).toContainEqual(expect.objectContaining({
      id: SILENT_AUDIO_ID,
      status: 'silent',
      path: null,
    }));
  });

  it('registra evento mutado sem bloquear o jogo', async () => {
    await audioManager.play(GAME_AUDIO_IDS.BUTTON_PRESS);
    const events = testWindow().__brickbreakerAudioState?.().events || [];
    expect(events).toContainEqual(expect.objectContaining({
      id: GAME_AUDIO_IDS.BUTTON_PRESS,
      status: 'muted',
    }));
  });
});
