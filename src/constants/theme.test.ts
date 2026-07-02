// src/constants/theme.test.ts
import {
  resolveInitialTheme,
  isThemeMode,
  THEME_STORAGE_KEY,
  THEME_LIGHT,
  THEME_DARK,
} from "./theme";

describe("theme preference", () => {
  it("aplica tema salvo válido", () => {
    expect(resolveInitialTheme(THEME_LIGHT, false)).toBe(THEME_LIGHT);
    expect(resolveInitialTheme(THEME_DARK, true)).toBe(THEME_DARK);
  });

  it("usa escuro quando não há escolha salva ou tema salvo é inválido", () => {
    expect(resolveInitialTheme("store" as any, false)).toBe(THEME_DARK);
    expect(resolveInitialTheme("ranking" as any, true)).toBe(THEME_DARK);
    expect(resolveInitialTheme(null, false)).toBe(THEME_DARK);
    expect(resolveInitialTheme(null, true)).toBe(THEME_DARK);
  });

  it("reconhece somente temas claro e escuro", () => {
    expect(THEME_STORAGE_KEY).toBe("brickbreaker-theme");
    expect(isThemeMode(THEME_LIGHT)).toBe(true);
    expect(isThemeMode(THEME_DARK)).toBe(true);
    expect(isThemeMode("settings")).toBe(false);
    expect(isThemeMode("upgrades")).toBe(false);
  });
});
