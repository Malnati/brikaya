// src/constants/appearance.ts
export const THEME_NEON_ARCADE = 'neon-arcade';
export const THEME_CRT_HIGH_CONTRAST = 'crt-high-contrast';
export const THEME_PIXEL_SUNSET = 'pixel-sunset';
export const THEME_OCEAN_NIGHT = 'ocean-night';
export const THEME_JUNGLE_LASER = 'jungle-laser';
export const THEME_AMBER_RETRO = 'amber-retro';
export const THEME_COSMIC_ICE = 'cosmic-ice';
export const THEME_ELECTRIC_PLUM = 'electric-plum';
export const THEME_LIME_GRAPHITE = 'lime-graphite';
export const THEME_RUBY_DEPTH = 'ruby-depth';
export const IMAGE_SET_RETRO_DEFAULT = 'retro-default';
export const IMAGE_SET_HIGH_CONTRAST = 'high-contrast';
export const IMAGE_SET_SUNSET_CABINET = 'sunset-cabinet';
export const FONT_SET_ARCADE_UI = 'arcade-ui';
export const FONT_SET_CRT_MONO = 'crt-mono';
export const FONT_SET_BLOCK_PIXEL = 'block-pixel';
export const LEGACY_THEME_DARK = 'dark';
export const LEGACY_THEME_LIGHT = 'light';

export const APPEARANCE_STORAGE_KEYS = {
  theme: 'brickbreaker-theme',
  imageSet: 'brickbreaker-image-set',
  fontSet: 'brickbreaker-font-set',
} as const;

export const THEME_IDS = [
  THEME_NEON_ARCADE,
  THEME_CRT_HIGH_CONTRAST,
  THEME_PIXEL_SUNSET,
  THEME_OCEAN_NIGHT,
  THEME_JUNGLE_LASER,
  THEME_AMBER_RETRO,
  THEME_COSMIC_ICE,
  THEME_ELECTRIC_PLUM,
  THEME_LIME_GRAPHITE,
  THEME_RUBY_DEPTH,
] as const;

export const IMAGE_SET_IDS = [
  IMAGE_SET_RETRO_DEFAULT,
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_SUNSET_CABINET,
] as const;

export const FONT_SET_IDS = [
  FONT_SET_ARCADE_UI,
  FONT_SET_CRT_MONO,
  FONT_SET_BLOCK_PIXEL,
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ImageSetId = (typeof IMAGE_SET_IDS)[number];
export type FontSetId = (typeof FONT_SET_IDS)[number];

export interface AppearanceSelection {
  themeId: ThemeId;
  imageSetId: ImageSetId;
  fontSetId: FontSetId;
}

export interface AppearanceOption<T extends string> {
  id: T;
  label: string;
}

export const DEFAULT_APPEARANCE_SELECTION = {
  themeId: THEME_NEON_ARCADE,
  imageSetId: IMAGE_SET_RETRO_DEFAULT,
  fontSetId: FONT_SET_ARCADE_UI,
} as const satisfies AppearanceSelection;

export const THEME_OPTIONS = [
  { id: THEME_NEON_ARCADE, label: 'Neon Arcade' },
  { id: THEME_CRT_HIGH_CONTRAST, label: 'CRT alto contraste' },
  { id: THEME_PIXEL_SUNSET, label: 'Pixel Sunset' },
  { id: THEME_OCEAN_NIGHT, label: 'Oceano noturno' },
  { id: THEME_JUNGLE_LASER, label: 'Selva laser' },
  { id: THEME_AMBER_RETRO, label: 'Âmbar retrô' },
  { id: THEME_COSMIC_ICE, label: 'Gelo cósmico' },
  { id: THEME_ELECTRIC_PLUM, label: 'Ameixa elétrica' },
  { id: THEME_LIME_GRAPHITE, label: 'Lima grafite' },
  { id: THEME_RUBY_DEPTH, label: 'Rubi profundo' },
] as const satisfies readonly AppearanceOption<ThemeId>[];

export const IMAGE_SET_OPTIONS = [
  { id: IMAGE_SET_RETRO_DEFAULT, label: 'Retro padrão' },
  { id: IMAGE_SET_HIGH_CONTRAST, label: 'Alto contraste' },
  { id: IMAGE_SET_SUNSET_CABINET, label: 'Cabine Sunset' },
] as const satisfies readonly AppearanceOption<ImageSetId>[];

export const FONT_SET_OPTIONS = [
  { id: FONT_SET_ARCADE_UI, label: 'Arcade' },
  { id: FONT_SET_CRT_MONO, label: 'CRT mono' },
  { id: FONT_SET_BLOCK_PIXEL, label: 'Blocos pixel' },
] as const satisfies readonly AppearanceOption<FontSetId>[];

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function isImageSetId(value: unknown): value is ImageSetId {
  return IMAGE_SET_IDS.includes(value as ImageSetId);
}

export function isFontSetId(value: unknown): value is FontSetId {
  return FONT_SET_IDS.includes(value as FontSetId);
}

export function migrateStoredThemeId(value: unknown): ThemeId | null {
  if (value === LEGACY_THEME_DARK) return THEME_NEON_ARCADE;
  if (value === LEGACY_THEME_LIGHT) return THEME_CRT_HIGH_CONTRAST;
  return isThemeId(value) ? value : null;
}

export function resolveAppearanceSelection(input: {
  themeId: unknown;
  imageSetId: unknown;
  fontSetId: unknown;
}): AppearanceSelection {
  return {
    themeId:
      migrateStoredThemeId(input.themeId) ??
      DEFAULT_APPEARANCE_SELECTION.themeId,
    imageSetId: isImageSetId(input.imageSetId)
      ? input.imageSetId
      : DEFAULT_APPEARANCE_SELECTION.imageSetId,
    fontSetId: isFontSetId(input.fontSetId)
      ? input.fontSetId
      : DEFAULT_APPEARANCE_SELECTION.fontSetId,
  };
}
