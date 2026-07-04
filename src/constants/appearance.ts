// src/constants/appearance.ts
export const THEME_NEON_ARCADE = "neon-arcade";
export const THEME_CRT_HIGH_CONTRAST = "crt-high-contrast";
export const THEME_PIXEL_SUNSET = "pixel-sunset";
export const THEME_OCEAN_NIGHT = "ocean-night";
export const THEME_JUNGLE_LASER = "jungle-laser";
export const THEME_AMBER_RETRO = "amber-retro";
export const THEME_COSMIC_ICE = "cosmic-ice";
export const THEME_ELECTRIC_PLUM = "electric-plum";
export const THEME_LIME_GRAPHITE = "lime-graphite";
export const THEME_RUBY_DEPTH = "ruby-depth";
export const THEME_REAL_METRO_NIGHT = "real-metro-night";
export const THEME_REAL_AUTO_GARAGE = "real-auto-garage";
export const THEME_REAL_BIO_LAB = "real-bio-lab";
export const THEME_REAL_ANCIENT_TEMPLE = "real-ancient-temple";
export const THEME_REAL_ORBITAL_STATION = "real-orbital-station";
export const THEME_MODE_AUTO = "auto";
export const THEME_MODE_MANUAL = "manual";
export const THEME_AUTO_OPTION_ID = "auto-by-level";
export const IMAGE_SET_RETRO_DEFAULT = "retro-default";
export const IMAGE_SET_HIGH_CONTRAST = "high-contrast";
export const IMAGE_SET_SUNSET_CABINET = "sunset-cabinet";
export const IMAGE_SET_REAL_METRO_TUNNEL = "real-metro-tunnel";
export const IMAGE_SET_REAL_WORKSHOP_STEEL = "real-workshop-steel";
export const IMAGE_SET_REAL_BIO_LAB_GLASS = "real-bio-lab-glass";
export const IMAGE_SET_REAL_TEMPLE_STONE = "real-temple-stone";
export const IMAGE_SET_REAL_ORBITAL_DECK = "real-orbital-deck";
export const FONT_SET_ARCADE_UI = "arcade-ui";
export const FONT_SET_CRT_MONO = "crt-mono";
export const FONT_SET_BLOCK_PIXEL = "block-pixel";
export const LEGACY_THEME_DARK = "dark";
export const LEGACY_THEME_LIGHT = "light";

export const APPEARANCE_STORAGE_KEYS = {
  theme: "brickbreaker-theme",
  themeMode: "brickbreaker-theme-mode",
  autoThemeSequence: "brickbreaker-auto-theme-sequence",
  autoThemeIndex: "brickbreaker-auto-theme-index",
  imageSet: "brickbreaker-image-set",
  fontSet: "brickbreaker-font-set",
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
  THEME_REAL_METRO_NIGHT,
  THEME_REAL_AUTO_GARAGE,
  THEME_REAL_BIO_LAB,
  THEME_REAL_ANCIENT_TEMPLE,
  THEME_REAL_ORBITAL_STATION,
] as const;

export const IMAGE_SET_IDS = [
  IMAGE_SET_RETRO_DEFAULT,
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_SUNSET_CABINET,
  IMAGE_SET_REAL_METRO_TUNNEL,
  IMAGE_SET_REAL_WORKSHOP_STEEL,
  IMAGE_SET_REAL_BIO_LAB_GLASS,
  IMAGE_SET_REAL_TEMPLE_STONE,
  IMAGE_SET_REAL_ORBITAL_DECK,
] as const;

export const FONT_SET_IDS = [
  FONT_SET_ARCADE_UI,
  FONT_SET_CRT_MONO,
  FONT_SET_BLOCK_PIXEL,
] as const;

export const THEME_MODE_IDS = [THEME_MODE_AUTO, THEME_MODE_MANUAL] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeMode = (typeof THEME_MODE_IDS)[number];
export type ImageSetId = (typeof IMAGE_SET_IDS)[number];
export type FontSetId = (typeof FONT_SET_IDS)[number];

export interface AppearanceSelection {
  themeId: ThemeId;
  themeMode: ThemeMode;
  autoThemeSequence: readonly ThemeId[];
  autoThemeIndex: number;
  imageSetId: ImageSetId;
  fontSetId: FontSetId;
}

export interface AppearanceOption<T extends string> {
  id: T;
  label: string;
}

export const DEFAULT_APPEARANCE_SELECTION = {
  themeId: THEME_NEON_ARCADE,
  themeMode: THEME_MODE_AUTO,
  autoThemeSequence: THEME_IDS,
  autoThemeIndex: 0,
  imageSetId: IMAGE_SET_RETRO_DEFAULT,
  fontSetId: FONT_SET_ARCADE_UI,
} as const satisfies AppearanceSelection;

export const THEME_OPTIONS = [
  { id: THEME_NEON_ARCADE, label: "Neon Arcade" },
  { id: THEME_CRT_HIGH_CONTRAST, label: "CRT alto contraste" },
  { id: THEME_PIXEL_SUNSET, label: "Pixel Sunset" },
  { id: THEME_OCEAN_NIGHT, label: "Oceano noturno" },
  { id: THEME_JUNGLE_LASER, label: "Selva laser" },
  { id: THEME_AMBER_RETRO, label: "Âmbar retrô" },
  { id: THEME_COSMIC_ICE, label: "Gelo cósmico" },
  { id: THEME_ELECTRIC_PLUM, label: "Ameixa elétrica" },
  { id: THEME_LIME_GRAPHITE, label: "Lima grafite" },
  { id: THEME_RUBY_DEPTH, label: "Rubi profundo" },
  { id: THEME_REAL_METRO_NIGHT, label: "Metrô noturno" },
  { id: THEME_REAL_AUTO_GARAGE, label: "Oficina mecânica" },
  { id: THEME_REAL_BIO_LAB, label: "Laboratório clínico" },
  { id: THEME_REAL_ANCIENT_TEMPLE, label: "Templo antigo" },
  { id: THEME_REAL_ORBITAL_STATION, label: "Estação orbital" },
] as const satisfies readonly AppearanceOption<ThemeId>[];

export const IMAGE_SET_OPTIONS = [
  { id: IMAGE_SET_RETRO_DEFAULT, label: "Retro padrão" },
  { id: IMAGE_SET_HIGH_CONTRAST, label: "Alto contraste" },
  { id: IMAGE_SET_SUNSET_CABINET, label: "Cabine Sunset" },
  { id: IMAGE_SET_REAL_METRO_TUNNEL, label: "Metrô realista" },
  { id: IMAGE_SET_REAL_WORKSHOP_STEEL, label: "Oficina realista" },
  { id: IMAGE_SET_REAL_BIO_LAB_GLASS, label: "Laboratório realista" },
  { id: IMAGE_SET_REAL_TEMPLE_STONE, label: "Templo realista" },
  { id: IMAGE_SET_REAL_ORBITAL_DECK, label: "Órbita realista" },
] as const satisfies readonly AppearanceOption<ImageSetId>[];

export const FONT_SET_OPTIONS = [
  { id: FONT_SET_ARCADE_UI, label: "Arcade" },
  { id: FONT_SET_CRT_MONO, label: "CRT mono" },
  { id: FONT_SET_BLOCK_PIXEL, label: "Blocos pixel" },
] as const satisfies readonly AppearanceOption<FontSetId>[];

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_MODE_IDS.includes(value as ThemeMode);
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

export function resolveAutoThemeSequence(
  value: unknown,
): readonly ThemeId[] | null {
  if (!Array.isArray(value)) return null;

  const uniqueThemeIds = new Set(value);
  const hasOnlyKnownThemes = value.every((themeId) => isThemeId(themeId));
  const hasAllThemes = THEME_IDS.every((themeId) =>
    uniqueThemeIds.has(themeId),
  );

  if (
    value.length !== THEME_IDS.length ||
    uniqueThemeIds.size !== THEME_IDS.length ||
    !hasOnlyKnownThemes ||
    !hasAllThemes
  ) {
    return null;
  }

  return value as readonly ThemeId[];
}

export function parseStoredAutoThemeSequence(
  value: unknown,
): readonly ThemeId[] | null {
  if (typeof value !== 'string') return resolveAutoThemeSequence(value);

  try {
    return resolveAutoThemeSequence(JSON.parse(value));
  } catch {
    return null;
  }
}

export function parseStoredAutoThemeIndex(
  value: unknown,
  sequenceLength: number = THEME_IDS.length,
): number {
  const parsedValue =
    typeof value === 'number' ? value : Number.parseInt(String(value), 10);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0 ||
    parsedValue >= sequenceLength
  ) {
    return DEFAULT_APPEARANCE_SELECTION.autoThemeIndex;
  }

  return parsedValue;
}

function shuffleThemeIds(
  themeIds: readonly ThemeId[],
  random: () => number,
): ThemeId[] {
  const sequence = [...themeIds];

  for (let index = sequence.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    const currentThemeId = sequence[index];
    sequence[index] = sequence[randomIndex];
    sequence[randomIndex] = currentThemeId;
  }

  return sequence;
}

export function createAutoThemeSequence(
  currentThemeId: ThemeId,
  random: () => number = Math.random,
): readonly ThemeId[] {
  return [
    currentThemeId,
    ...shuffleThemeIds(
      THEME_IDS.filter((themeId) => themeId !== currentThemeId),
      random,
    ),
  ];
}

export function createNextAutoThemeCycle(
  currentThemeId: ThemeId,
  random: () => number = Math.random,
): readonly ThemeId[] {
  const sequence = shuffleThemeIds(THEME_IDS, random);

  if (sequence[0] === currentThemeId) {
    const nextThemeIndex = sequence.findIndex(
      (themeId) => themeId !== currentThemeId,
    );
    const nextThemeId = sequence[nextThemeIndex];
    sequence[nextThemeIndex] = currentThemeId;
    sequence[0] = nextThemeId;
  }

  return sequence;
}

export interface AutoThemeAdvanceState {
  themeId: ThemeId;
  autoThemeSequence: readonly ThemeId[];
  autoThemeIndex: number;
}

export function resolveNextAutoThemeState(input: {
  currentThemeId: ThemeId;
  autoThemeSequence: unknown;
  autoThemeIndex: unknown;
  random?: () => number;
}): AutoThemeAdvanceState {
  const random = input.random ?? Math.random;
  const currentSequence =
    resolveAutoThemeSequence(input.autoThemeSequence) ??
    createAutoThemeSequence(input.currentThemeId, random);
  const currentIndex = parseStoredAutoThemeIndex(
    input.autoThemeIndex,
    currentSequence.length,
  );
  const nextIndex = currentIndex + 1;

  if (nextIndex < currentSequence.length) {
    return {
      themeId: currentSequence[nextIndex],
      autoThemeSequence: currentSequence,
      autoThemeIndex: nextIndex,
    };
  }

  const nextSequence = createNextAutoThemeCycle(input.currentThemeId, random);

  return {
    themeId: nextSequence[0],
    autoThemeSequence: nextSequence,
    autoThemeIndex: 0,
  };
}

export function resolveAppearanceSelection(input: {
  themeId: unknown;
  themeMode?: unknown;
  autoThemeSequence?: unknown;
  autoThemeIndex?: unknown;
  imageSetId: unknown;
  fontSetId: unknown;
}): AppearanceSelection {
  const storedThemeId = migrateStoredThemeId(input.themeId);
  const autoThemeSequence =
    parseStoredAutoThemeSequence(input.autoThemeSequence) ??
    DEFAULT_APPEARANCE_SELECTION.autoThemeSequence;
  const autoThemeIndex = parseStoredAutoThemeIndex(
    input.autoThemeIndex,
    autoThemeSequence.length,
  );
  const themeMode = isThemeMode(input.themeMode)
    ? input.themeMode
    : storedThemeId
      ? THEME_MODE_MANUAL
      : DEFAULT_APPEARANCE_SELECTION.themeMode;

  return {
    themeId:
      themeMode === THEME_MODE_AUTO
        ? autoThemeSequence[autoThemeIndex]
        : storedThemeId ?? DEFAULT_APPEARANCE_SELECTION.themeId,
    themeMode,
    autoThemeSequence,
    autoThemeIndex,
    imageSetId: isImageSetId(input.imageSetId)
      ? input.imageSetId
      : DEFAULT_APPEARANCE_SELECTION.imageSetId,
    fontSetId: isFontSetId(input.fontSetId)
      ? input.fontSetId
      : DEFAULT_APPEARANCE_SELECTION.fontSetId,
  };
}
