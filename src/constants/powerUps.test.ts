// src/constants/powerUps.test.ts
import { AUDIO_CATALOG, AUDIO_EVENT_IDS, GAME_AUDIO_IDS } from "./audio";
import {
  ACTIVE_POWER_UP_TYPES,
  POWER_UP_DEFINITIONS,
  getPowerUpActivationAudioId,
  type PowerUpType,
} from "./powerUps";

const EXPECTED_POWER_UP_TYPES: PowerUpType[] = [
  "multiball",
  "wide_paddle",
  "slow_ball",
  "laser_fan",
];

const ACTIVE_POWER_UPS_WITH_CURRENT_MECHANICS: PowerUpType[] = [
  "multiball",
  "wide_paddle",
  "slow_ball",
  "laser_fan",
];

describe("registry de power-ups", () => {
  it("exige áudio de ativação para todos os itens especiais", () => {
    expect(Object.keys(POWER_UP_DEFINITIONS).sort()).toEqual(
      [...EXPECTED_POWER_UP_TYPES].sort(),
    );

    for (const powerUpType of EXPECTED_POWER_UP_TYPES) {
      const definition = POWER_UP_DEFINITIONS[powerUpType];
      expect(definition.type).toBe(powerUpType);
      expect(definition.visibleName).toBeTruthy();
      expect(definition.visual).toBeTruthy();
      expect(definition.iconPath).toMatch(/^\/assets\/powerups\/.+\.svg$/);
      expect(definition.iconPath).not.toMatch(/https?:|data:|\.png|\.jpg|\.jpeg|\.webp/i);
      expect(definition.activationAudioId).toBe(
        getPowerUpActivationAudioId(powerUpType),
      );
      expect(AUDIO_EVENT_IDS).toContain(definition.activationAudioId);
      expect(
        AUDIO_CATALOG[definition.activationAudioId].files.length,
      ).toBeGreaterThan(0);
      expect(
        AUDIO_CATALOG[definition.activationAudioId].volume,
      ).toBeGreaterThan(0);
    }
  });

  it("mantém spawn automático apenas para power-ups com mecânica atual", () => {
    expect(ACTIVE_POWER_UP_TYPES).toEqual(
      ACTIVE_POWER_UPS_WITH_CURRENT_MECHANICS,
    );
  });

  it("mapeia Laser em leque para SFX específico CC0 local", () => {
    const audioId = getPowerUpActivationAudioId("laser_fan");

    expect(audioId).toBe(GAME_AUDIO_IDS.POWERUP_ACTIVATE_LASER_FAN);
    expect(AUDIO_CATALOG[audioId].files).toEqual([
      "/assets/audio/sfx_powerup_activate_laser_fan-01.mp3",
    ]);
  });
});
