// src/hooks/useAppearancePreference.test.tsx
import { act, renderHook } from "@testing-library/react";

import { DEFAULT_APPEARANCE_SELECTION } from "../constants/appearance";

import { useAppearancePreference } from "./useAppearancePreference";

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-image-set");
  document.documentElement.removeAttribute("data-font-set");
});

describe("useAppearancePreference", () => {
  it("aplica e persiste Arcade Neon com Retrô Padrão", () => {
    const { result } = renderHook(() => useAppearancePreference());

    expect(result.current.selection).toEqual(DEFAULT_APPEARANCE_SELECTION);
    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme",
      "neon-arcade",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "manual",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-image-set",
      "retro-default",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-font-set",
      "arcade-ui",
    );
  });

  it("normaliza preferências antigas ou ocultas para o padrão", () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "brikaya-theme") return "pixel-sunset";
      if (key === "brikaya-theme-mode") return "auto";
      if (key === "brikaya-image-set") return "sunset-cabinet";
      if (key === "brikaya-font-set") return "block-pixel";
      return null;
    });

    const { result } = renderHook(() => useAppearancePreference());

    expect(result.current.selection).toEqual(DEFAULT_APPEARANCE_SELECTION);
    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme",
      "neon-arcade",
    );
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "manual",
    );
  });

  it("mantém padrão mesmo quando APIs antigas de aparência são chamadas", () => {
    const { result } = renderHook(() => useAppearancePreference());

    act(() => result.current.selectTheme("pixel-sunset"));
    act(() =>
      result.current.selectVisualThemePreset("preset-real-metro-night"),
    );
    act(() => result.current.selectAutomaticTheme());
    act(() => result.current.selectImageSet("sunset-cabinet"));
    act(() => result.current.selectFontSet("block-pixel"));
    act(() => result.current.advanceAutoTheme());

    expect(result.current.selection).toEqual(DEFAULT_APPEARANCE_SELECTION);
    expect(document.documentElement.dataset.theme).toBe("neon-arcade");
    expect(document.documentElement.dataset.imageSet).toBe("retro-default");
    expect(document.documentElement.dataset.fontSet).toBe("arcade-ui");
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      "brikaya-theme",
      "pixel-sunset",
    );
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      "brikaya-theme-mode",
      "auto",
    );
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      "brikaya-image-set",
      "sunset-cabinet",
    );
    expect(window.localStorage.setItem).not.toHaveBeenCalledWith(
      "brikaya-font-set",
      "block-pixel",
    );
  });
});
