// src/hooks/useAppearancePreference.test.tsx
import { act, renderHook } from "@testing-library/react";

import { resolveVisualThemePresetByTheme } from "../constants/appearance";

import { useAppearancePreference } from "./useAppearancePreference";

const STORED_AUTO_THEME_SEQUENCE = [
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
const STORED_SEQUENCE_LAST_INDEX = "14";
const STORED_SEQUENCE_PENULTIMATE_INDEX = "13";

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-image-set");
  document.documentElement.removeAttribute("data-font-set");
});

describe("useAppearancePreference", () => {
  it("aplica padrão neon/retro/arcade", () => {
    const { result } = renderHook(() => useAppearancePreference());
    expect(result.current.selection).toEqual(
      expect.objectContaining({
        themeId: "neon-arcade",
        themeMode: "auto",
        autoThemeIndex: 0,
        imageSetId: "retro-default",
        fontSetId: "arcade-ui",
      }),
    );
    expect(result.current.selection.autoThemeSequence[0]).toBe("neon-arcade");
    expect(new Set(result.current.selection.autoThemeSequence).size).toBe(15);
    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
  });

  it("persiste escolha manual e mantém imagem/fonte válidas", () => {
    const { result } = renderHook(() => useAppearancePreference());
    act(() => result.current.selectTheme("pixel-sunset"));
    act(() => result.current.selectImageSet("sunset-cabinet"));
    act(() => result.current.selectFontSet("block-pixel"));

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme",
      "pixel-sunset",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "manual",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-image-set",
      "sunset-cabinet",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-font-set",
      "block-pixel",
    );
    expect(document.documentElement.dataset.theme).toBe("pixel-sunset");
    expect(result.current.selection.themeMode).toBe("manual");
    expect(document.documentElement.dataset.imageSet).toBe("sunset-cabinet");
    expect(document.documentElement.dataset.fontSet).toBe("block-pixel");
  });

  it("aplica conjunto pronto com cor e imagem juntas", () => {
    const { result } = renderHook(() => useAppearancePreference());
    act(() =>
      result.current.selectVisualThemePreset("preset-real-metro-night"),
    );

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme",
      "real-metro-night",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "manual",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-image-set",
      "real-metro-tunnel",
    );
    expect(result.current.selection.themeId).toBe("real-metro-night");
    expect(result.current.selection.imageSetId).toBe("real-metro-tunnel");
    expect(document.documentElement.dataset.theme).toBe("real-metro-night");
    expect(document.documentElement.dataset.imageSet).toBe("real-metro-tunnel");
  });

  it("preserva imagem manual quando usuário altera apenas a cor", () => {
    const { result } = renderHook(() => useAppearancePreference());

    act(() => result.current.selectImageSet("real-bio-lab-glass"));
    act(() => result.current.selectTheme("pixel-sunset"));

    expect(result.current.selection.themeId).toBe("pixel-sunset");
    expect(result.current.selection.themeMode).toBe("manual");
    expect(result.current.selection.imageSetId).toBe("real-bio-lab-glass");
    expect(document.documentElement.dataset.theme).toBe("pixel-sunset");
    expect(document.documentElement.dataset.imageSet).toBe(
      "real-bio-lab-glass",
    );
  });

  it("avança tema automático e persiste sequência sem repetir tema atual", () => {
    const { result } = renderHook(() => useAppearancePreference());
    const firstTheme = result.current.selection.themeId;

    act(() => result.current.advanceAutoTheme());

    expect(result.current.selection.themeMode).toBe("auto");
    expect(result.current.selection.themeId).not.toBe(firstTheme);
    expect(result.current.selection.imageSetId).toBe(
      resolveVisualThemePresetByTheme(result.current.selection.themeId)
        .imageSetId,
    );
    expect(result.current.selection.autoThemeIndex).toBe(1);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "auto",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme",
      result.current.selection.themeId,
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-image-set",
      result.current.selection.imageSetId,
    );
  });

  it("não avança tema quando usuário escolheu tema manual", () => {
    const { result } = renderHook(() => useAppearancePreference());

    act(() => result.current.selectTheme("pixel-sunset"));
    act(() => result.current.advanceAutoTheme());

    expect(result.current.selection.themeId).toBe("pixel-sunset");
    expect(result.current.selection.themeMode).toBe("manual");
  });

  it("reativa automático a partir do tema atual", () => {
    const { result } = renderHook(() => useAppearancePreference());

    act(() => result.current.selectImageSet("real-bio-lab-glass"));
    act(() => result.current.selectTheme("pixel-sunset"));
    act(() => result.current.selectAutomaticTheme());

    expect(result.current.selection.themeId).toBe("pixel-sunset");
    expect(result.current.selection.imageSetId).toBe("sunset-cabinet");
    expect(result.current.selection.themeMode).toBe("auto");
    expect(result.current.selection.autoThemeSequence[0]).toBe("pixel-sunset");
    expect(result.current.selection.autoThemeIndex).toBe(0);
  });

  it("recupera ciclo automático salvo e fecha rodada sem repetir tema", () => {
    const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "brikaya-theme-mode") return "auto";
      if (key === "brikaya-auto-theme-sequence")
        return JSON.stringify(STORED_AUTO_THEME_SEQUENCE);
      if (key === "brikaya-auto-theme-index")
        return STORED_SEQUENCE_PENULTIMATE_INDEX;
      return null;
    });
    const { result } = renderHook(() => useAppearancePreference());

    expect(result.current.selection.themeId).toBe("real-ancient-temple");
    expect(result.current.selection.autoThemeIndex).toBe(13);

    act(() => result.current.advanceAutoTheme());

    expect(result.current.selection.themeId).toBe("real-orbital-station");
    expect(result.current.selection.autoThemeIndex).toBe(14);

    act(() => result.current.advanceAutoTheme());

    expect(result.current.selection.themeId).not.toBe("real-orbital-station");
    expect(result.current.selection.autoThemeIndex).toBe(0);
    expect(result.current.selection.autoThemeSequence[0]).toBe(
      result.current.selection.themeId,
    );
    expect(new Set(result.current.selection.autoThemeSequence).size).toBe(15);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-auto-theme-index",
      "0",
    );
    randomSpy.mockRestore();
  });

  it("normaliza índice salvo inválido sem quebrar modo automático", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "brikaya-theme-mode") return "auto";
      if (key === "brikaya-auto-theme-sequence")
        return JSON.stringify(STORED_AUTO_THEME_SEQUENCE);
      if (key === "brikaya-auto-theme-index")
        return STORED_SEQUENCE_LAST_INDEX + "9";
      return null;
    });
    const { result } = renderHook(() => useAppearancePreference());

    expect(result.current.selection.themeId).toBe("neon-arcade");
    expect(result.current.selection.themeMode).toBe("auto");
    expect(result.current.selection.autoThemeIndex).toBe(0);
  });

  it("migra valor antigo escuro", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) =>
      key === "brikaya-theme" ? "dark" : null,
    );
    const { result } = renderHook(() => useAppearancePreference());
    expect(result.current.selection.themeId).toBe("neon-arcade");
    expect(result.current.selection.themeMode).toBe("manual");
  });
});
