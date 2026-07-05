import {
  GAME_MODE_BALL_TURRET,
  GAME_MODE_CLASSIC,
  GAME_MODE_STORAGE_KEY,
  isGameMode,
  resolveGameMode,
} from "./gameMode";

describe("gameMode", () => {
  it("aceita apenas modos conhecidos", () => {
    expect(isGameMode(GAME_MODE_CLASSIC)).toBe(true);
    expect(isGameMode(GAME_MODE_BALL_TURRET)).toBe(true);
    expect(isGameMode("unknown")).toBe(false);
  });

  it("usa clássico como fallback seguro", () => {
    expect(resolveGameMode(null)).toBe(GAME_MODE_CLASSIC);
    expect(resolveGameMode("unknown")).toBe(GAME_MODE_CLASSIC);
    expect(resolveGameMode(GAME_MODE_BALL_TURRET)).toBe(GAME_MODE_BALL_TURRET);
    expect(GAME_MODE_STORAGE_KEY).toBe("brikaya-game-mode");
  });
});
