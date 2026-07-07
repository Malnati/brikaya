// src/constants/appearance.test.ts
import {
  APPEARANCE_STORAGE_KEYS,
  DEFAULT_APPEARANCE_SELECTION,
  FONT_SET_OPTIONS,
  IMAGE_SET_OPTIONS,
  THEME_IDS,
  THEME_MODE_AUTO,
  THEME_MODE_MANUAL,
  THEME_OPTIONS,
  VISUAL_THEME_PRESET_OPTIONS,
  createAutoThemeSequence,
  isFontSetId,
  isImageSetId,
  isThemeId,
  isVisualThemePresetId,
  migrateStoredThemeId,
  resolveNextAutoThemeState,
  resolveAppearanceSelection,
  resolveVisualThemePresetByTheme,
  resolveVisualThemePresetForSelection,
} from "./appearance";

const TECHNICAL_COPY_PATTERN =
  /svg|asset|token|css|dataset|runtime|cache|service worker|localstorage/i;
const EXPECTED_THEME_IDS = [
  "neon-arcade",
  "crt-high-contrast",
  "pixel-sunset",
  "ocean-night",
  "jungle-laser",
  "amber-retro",
  "cosmic-ice",
  "electric-plum",
  "lime-graphite",
  "ruby-depth",
  "real-metro-night",
  "real-auto-garage",
  "real-bio-lab",
  "real-ancient-temple",
  "real-orbital-station",
] as const;
const EXPECTED_THEME_LABELS = [
  "Neon Arcade",
  "CRT alto contraste",
  "Pixel Sunset",
  "Oceano noturno",
  "Selva laser",
  "Âmbar retrô",
  "Gelo cósmico",
  "Ameixa elétrica",
  "Lima grafite",
  "Rubi profundo",
  "Metrô noturno",
  "Oficina mecânica",
  "Laboratório clínico",
  "Templo antigo",
  "Estação orbital",
] as const;
const EXPECTED_VISUAL_PRESET_IDS = [
  "preset-neon-arcade",
  "preset-crt-high-contrast",
  "preset-pixel-sunset",
  "preset-ocean-night",
  "preset-jungle-laser",
  "preset-amber-retro",
  "preset-cosmic-ice",
  "preset-electric-plum",
  "preset-lime-graphite",
  "preset-ruby-depth",
  "preset-real-metro-night",
  "preset-real-auto-garage",
  "preset-real-bio-lab",
  "preset-real-ancient-temple",
  "preset-real-orbital-station",
] as const;
const EXPECTED_VISUAL_PRESET_LABELS = [
  "Arcade neon",
  "CRT alto contraste",
  "Pôr do sol pixelado",
  "Oceano noturno",
  "Selva laser",
  "Âmbar retrô",
  "Gelo cósmico",
  "Ameixa elétrica",
  "Lima grafite",
  "Rubi profundo",
  "Metrô noturno",
  "Oficina mecânica",
  "Laboratório clínico",
  "Templo antigo",
  "Estação orbital",
] as const;
const EXPECTED_PRESET_IMAGE_SETS = [
  "retro-default",
  "high-contrast",
  "sunset-cabinet",
  "retro-default",
  "retro-default",
  "retro-default",
  "retro-default",
  "retro-default",
  "retro-default",
  "retro-default",
  "real-metro-tunnel",
  "real-workshop-steel",
  "real-bio-lab-glass",
  "real-temple-stone",
  "real-orbital-deck",
] as const;

describe("appearance contract", () => {
  it("define escolhas padrão humanas e persistíveis", () => {
    expect(DEFAULT_APPEARANCE_SELECTION).toEqual({
      themeId: "neon-arcade",
      themeMode: THEME_MODE_MANUAL,
      autoThemeSequence: EXPECTED_THEME_IDS,
      autoThemeIndex: 0,
      imageSetId: "retro-default",
      fontSetId: "arcade-ui",
    });
    expect(APPEARANCE_STORAGE_KEYS.theme).toBe("brikaya-theme");
    expect(APPEARANCE_STORAGE_KEYS.themeMode).toBe("brikaya-theme-mode");
    expect(APPEARANCE_STORAGE_KEYS.autoThemeSequence).toBe(
      "brikaya-auto-theme-sequence",
    );
    expect(APPEARANCE_STORAGE_KEYS.autoThemeIndex).toBe(
      "brikaya-auto-theme-index",
    );
    expect(APPEARANCE_STORAGE_KEYS.imageSet).toBe("brikaya-image-set");
    expect(APPEARANCE_STORAGE_KEYS.fontSet).toBe("brikaya-font-set");
  });

  it("expõe exatamente quinze temas visuais persistíveis", () => {
    expect(THEME_IDS).toEqual(EXPECTED_THEME_IDS);
    expect(THEME_OPTIONS).toHaveLength(15);
    expect(THEME_OPTIONS.map((option) => option.id)).toEqual(
      EXPECTED_THEME_IDS,
    );
    expect(THEME_OPTIONS.map((option) => option.label)).toEqual(
      EXPECTED_THEME_LABELS,
    );
    expect(new Set(THEME_OPTIONS.map((option) => option.id)).size).toBe(15);
  });

  it("aceita apenas IDs conhecidos", () => {
    for (const themeId of EXPECTED_THEME_IDS) {
      expect(isThemeId(themeId)).toBe(true);
    }
    expect(isThemeId("store")).toBe(false);

    expect(isImageSetId("retro-default")).toBe(true);
    expect(isImageSetId("high-contrast")).toBe(true);
    expect(isImageSetId("sunset-cabinet")).toBe(true);
    expect(isImageSetId("real-metro-tunnel")).toBe(true);
    expect(isImageSetId("real-workshop-steel")).toBe(true);
    expect(isImageSetId("real-bio-lab-glass")).toBe(true);
    expect(isImageSetId("real-temple-stone")).toBe(true);
    expect(isImageSetId("real-orbital-deck")).toBe(true);
    expect(isImageSetId("ranking")).toBe(false);

    expect(isFontSetId("arcade-ui")).toBe(true);
    expect(isFontSetId("crt-mono")).toBe(true);
    expect(isFontSetId("block-pixel")).toBe(true);
    expect(isFontSetId("google-fonts")).toBe(false);

    expect(isVisualThemePresetId("preset-real-metro-night")).toBe(true);
    expect(isVisualThemePresetId("real-metro-night")).toBe(false);
  });

  it("mapeia cada tema para um conjunto pronto de cor e imagem", () => {
    expect(VISUAL_THEME_PRESET_OPTIONS).toHaveLength(THEME_IDS.length);
    expect(VISUAL_THEME_PRESET_OPTIONS.map((option) => option.id)).toEqual(
      EXPECTED_VISUAL_PRESET_IDS,
    );
    expect(VISUAL_THEME_PRESET_OPTIONS.map((option) => option.themeId)).toEqual(
      EXPECTED_THEME_IDS,
    );
    expect(VISUAL_THEME_PRESET_OPTIONS.map((option) => option.label)).toEqual(
      EXPECTED_VISUAL_PRESET_LABELS,
    );
    expect(
      VISUAL_THEME_PRESET_OPTIONS.map((option) => option.imageSetId),
    ).toEqual(EXPECTED_PRESET_IMAGE_SETS);

    for (const themeId of THEME_IDS) {
      const preset = resolveVisualThemePresetByTheme(themeId);
      expect(preset.themeId).toBe(themeId);
      expect(
        resolveVisualThemePresetForSelection({
          themeId: preset.themeId,
          imageSetId: preset.imageSetId,
        })?.id,
      ).toBe(preset.id);
    }
  });

  it("migra temas antigos claro/escuro sem quebrar preferência salva", () => {
    expect(migrateStoredThemeId("dark")).toBe("neon-arcade");
    expect(migrateStoredThemeId("light")).toBe("crt-high-contrast");
    expect(migrateStoredThemeId("neon-arcade")).toBe("neon-arcade");
    expect(migrateStoredThemeId("invalid")).toBe(null);
  });

  it("resolve seleção sempre no padrão visível", () => {
    expect(
      resolveAppearanceSelection({
        themeId: "pixel-sunset",
        themeMode: THEME_MODE_MANUAL,
        imageSetId: "sunset-cabinet",
        fontSetId: "block-pixel",
      }),
    ).toEqual(DEFAULT_APPEARANCE_SELECTION);
    expect(
      resolveAppearanceSelection({
        themeId: "store",
        imageSetId: "ranking",
        fontSetId: "remote-font",
      }),
    ).toEqual(DEFAULT_APPEARANCE_SELECTION);
  });

  it("ignora tema salvo antigo e preserva padrão visível", () => {
    expect(
      resolveAppearanceSelection({
        themeId: "pixel-sunset",
        imageSetId: null,
        fontSetId: null,
      }),
    ).toEqual(DEFAULT_APPEARANCE_SELECTION);
  });

  it("avança tema automático sem repetir antes de fechar ciclo", () => {
    let autoThemeState = {
      themeId: "neon-arcade" as const,
      autoThemeSequence: createAutoThemeSequence("neon-arcade", () => 0),
      autoThemeIndex: 0,
    };
    const visitedThemes = new Set([autoThemeState.themeId]);

    for (let count = 1; count < THEME_IDS.length; count += 1) {
      const previousThemeId = autoThemeState.themeId;
      autoThemeState = resolveNextAutoThemeState({
        currentThemeId: autoThemeState.themeId,
        autoThemeSequence: autoThemeState.autoThemeSequence,
        autoThemeIndex: autoThemeState.autoThemeIndex,
        random: () => 0,
      });

      expect(autoThemeState.themeId).not.toBe(previousThemeId);
      expect(visitedThemes.has(autoThemeState.themeId)).toBe(false);
      visitedThemes.add(autoThemeState.themeId);
    }

    expect(visitedThemes.size).toBe(THEME_IDS.length);
    expect(
      resolveNextAutoThemeState({
        currentThemeId: autoThemeState.themeId,
        autoThemeSequence: autoThemeState.autoThemeSequence,
        autoThemeIndex: autoThemeState.autoThemeIndex,
        random: () => 0,
      }).themeId,
    ).not.toBe(autoThemeState.themeId);
  });

  it("usa labels finais sem termos técnicos internos", () => {
    const labels = [
      ...VISUAL_THEME_PRESET_OPTIONS,
      ...THEME_OPTIONS,
      ...IMAGE_SET_OPTIONS,
      ...FONT_SET_OPTIONS,
    ].map((option) => option.label);
    expect(labels).toEqual([
      ...EXPECTED_VISUAL_PRESET_LABELS,
      ...EXPECTED_THEME_LABELS,
      "Retro padrão",
      "Alto contraste",
      "Cabine Sunset",
      "Metrô realista",
      "Oficina realista",
      "Laboratório realista",
      "Templo realista",
      "Órbita realista",
      "Arcade",
      "CRT mono",
      "Pixel eletrônico",
    ]);
    expect(labels.some((label) => TECHNICAL_COPY_PATTERN.test(label))).toBe(
      false,
    );
  });
});
