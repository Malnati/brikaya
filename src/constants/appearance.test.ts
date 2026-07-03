// src/constants/appearance.test.ts
import {
  APPEARANCE_STORAGE_KEYS,
  DEFAULT_APPEARANCE_SELECTION,
  FONT_SET_OPTIONS,
  IMAGE_SET_OPTIONS,
  THEME_IDS,
  THEME_OPTIONS,
  isFontSetId,
  isImageSetId,
  isThemeId,
  migrateStoredThemeId,
  resolveAppearanceSelection,
} from './appearance';

const TECHNICAL_COPY_PATTERN = /svg|asset|token|css|dataset|runtime|cache|service worker|localstorage/i;
const EXPECTED_THEME_IDS = [
  'neon-arcade',
  'crt-high-contrast',
  'pixel-sunset',
  'ocean-night',
  'jungle-laser',
  'amber-retro',
  'cosmic-ice',
  'electric-plum',
  'lime-graphite',
  'ruby-depth',
] as const;
const EXPECTED_THEME_LABELS = [
  'Neon Arcade',
  'CRT alto contraste',
  'Pixel Sunset',
  'Oceano noturno',
  'Selva laser',
  'Âmbar retrô',
  'Gelo cósmico',
  'Ameixa elétrica',
  'Lima grafite',
  'Rubi profundo',
] as const;

describe('appearance contract', () => {
  it('define escolhas padrão humanas e persistíveis', () => {
    expect(DEFAULT_APPEARANCE_SELECTION).toEqual({
      themeId: 'neon-arcade',
      imageSetId: 'retro-default',
      fontSetId: 'arcade-ui',
    });
    expect(APPEARANCE_STORAGE_KEYS.theme).toBe('brickbreaker-theme');
    expect(APPEARANCE_STORAGE_KEYS.imageSet).toBe('brickbreaker-image-set');
    expect(APPEARANCE_STORAGE_KEYS.fontSet).toBe('brickbreaker-font-set');
  });

  it('expõe exatamente dez temas visuais persistíveis', () => {
    expect(THEME_IDS).toEqual(EXPECTED_THEME_IDS);
    expect(THEME_OPTIONS).toHaveLength(10);
    expect(THEME_OPTIONS.map((option) => option.id)).toEqual(
      EXPECTED_THEME_IDS,
    );
    expect(THEME_OPTIONS.map((option) => option.label)).toEqual(
      EXPECTED_THEME_LABELS,
    );
    expect(new Set(THEME_OPTIONS.map((option) => option.id)).size).toBe(10);
  });

  it('aceita apenas IDs conhecidos', () => {
    for (const themeId of EXPECTED_THEME_IDS) {
      expect(isThemeId(themeId)).toBe(true);
    }
    expect(isThemeId('store')).toBe(false);

    expect(isImageSetId('retro-default')).toBe(true);
    expect(isImageSetId('high-contrast')).toBe(true);
    expect(isImageSetId('sunset-cabinet')).toBe(true);
    expect(isImageSetId('ranking')).toBe(false);

    expect(isFontSetId('arcade-ui')).toBe(true);
    expect(isFontSetId('crt-mono')).toBe(true);
    expect(isFontSetId('block-pixel')).toBe(true);
    expect(isFontSetId('google-fonts')).toBe(false);
  });

  it('migra temas antigos claro/escuro sem quebrar preferência salva', () => {
    expect(migrateStoredThemeId('dark')).toBe('neon-arcade');
    expect(migrateStoredThemeId('light')).toBe('crt-high-contrast');
    expect(migrateStoredThemeId('neon-arcade')).toBe('neon-arcade');
    expect(migrateStoredThemeId('invalid')).toBe(null);
  });

  it('resolve seleção com fallback padrão', () => {
    expect(
      resolveAppearanceSelection({
        themeId: 'pixel-sunset',
        imageSetId: 'sunset-cabinet',
        fontSetId: 'block-pixel',
      }),
    ).toEqual({
      themeId: 'pixel-sunset',
      imageSetId: 'sunset-cabinet',
      fontSetId: 'block-pixel',
    });
    expect(
      resolveAppearanceSelection({
        themeId: 'store',
        imageSetId: 'ranking',
        fontSetId: 'remote-font',
      }),
    ).toEqual(DEFAULT_APPEARANCE_SELECTION);
  });

  it('usa labels finais sem termos técnicos internos', () => {
    const labels = [
      ...THEME_OPTIONS,
      ...IMAGE_SET_OPTIONS,
      ...FONT_SET_OPTIONS,
    ].map((option) => option.label);
    expect(labels).toEqual([
      ...EXPECTED_THEME_LABELS,
      'Retro padrão',
      'Alto contraste',
      'Cabine Sunset',
      'Arcade',
      'CRT mono',
      'Blocos pixel',
    ]);
    expect(labels.some((label) => TECHNICAL_COPY_PATTERN.test(label))).toBe(
      false,
    );
  });
});
