// src/constants/audio.test.ts
import {
  AUDIO_CATALOG,
  AUDIO_EVENT_IDS,
  AUDIO_PUBLIC_PATHS,
  GAME_AUDIO_IDS,
  SILENT_AUDIO_ID,
} from './audio';

const EXPECTED_AUDIO_ID_COUNT = 39;
const EXPECTED_AUDIO_FILE_COUNT = 91;
const LOCAL_AUDIO_PREFIX = '/assets/audio/';
const MP3_EXTENSION = '.mp3';

describe('catálogo de áudio', () => {
  it('mantém 39 IDs lógicos com arquivos locais para todos exceto silêncio intencional', () => {
    expect(AUDIO_EVENT_IDS).toHaveLength(EXPECTED_AUDIO_ID_COUNT);
    expect(AUDIO_PUBLIC_PATHS).toHaveLength(EXPECTED_AUDIO_FILE_COUNT);

    for (const audioId of AUDIO_EVENT_IDS) {
      const entry = AUDIO_CATALOG[audioId];
      expect(entry.id).toBe(audioId);
      if (audioId === SILENT_AUDIO_ID) {
        expect(entry.files).toEqual([]);
        expect(entry.volume).toBe(0);
        continue;
      }
      expect(entry.files.length).toBeGreaterThan(0);
      expect(entry.files.every(file => file.startsWith(LOCAL_AUDIO_PREFIX))).toBe(true);
      expect(entry.files.every(file => file.endsWith(MP3_EXTENSION))).toBe(true);
    }
  });

  it('expõe IDs usados pelo motor sem URLs externas', () => {
    expect(Object.values(GAME_AUDIO_IDS).every(audioId => AUDIO_EVENT_IDS.includes(audioId))).toBe(true);
    expect(AUDIO_PUBLIC_PATHS.every(path => path.startsWith(LOCAL_AUDIO_PREFIX))).toBe(true);
  });

  it('reutiliza sons existentes para o feedback de atualização', () => {
    expect(AUDIO_EVENT_IDS).toContain(GAME_AUDIO_IDS.UPDATE_PROGRESS);
    expect(AUDIO_EVENT_IDS).toContain(GAME_AUDIO_IDS.UPDATE_INSTALLED);
    expect(
      AUDIO_CATALOG[GAME_AUDIO_IDS.UPDATE_PROGRESS].files.length,
    ).toBeGreaterThan(0);
    expect(
      AUDIO_CATALOG[GAME_AUDIO_IDS.UPDATE_INSTALLED].files.length,
    ).toBeGreaterThan(0);
    expect(AUDIO_PUBLIC_PATHS).toHaveLength(EXPECTED_AUDIO_FILE_COUNT);
  });
});
