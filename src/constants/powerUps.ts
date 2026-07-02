// src/constants/powerUps.ts
import { GAME_AUDIO_IDS, type AudioId } from "./audio";

export type PowerUpType =
  "multiball" | "wide_paddle" | "slow_ball" | "laser_fan";

export type PowerUpVisual = "ruby" | "gold" | "sapphire" | "diamond";

export interface PowerUpDefinition {
  type: PowerUpType;
  visibleName: string;
  visual: PowerUpVisual;
  activationAudioId: AudioId;
}

export const POWER_UP_DEFINITIONS = {
  multiball: {
    type: "multiball",
    visibleName: "Multiball",
    visual: "ruby",
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_MULTIBALL,
  },
  wide_paddle: {
    type: "wide_paddle",
    visibleName: "Raquete ampla",
    visual: "gold",
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_WIDE_PADDLE,
  },
  slow_ball: {
    type: "slow_ball",
    visibleName: "Bola lenta",
    visual: "sapphire",
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_SLOW_BALL,
  },
  laser_fan: {
    type: "laser_fan",
    visibleName: "Laser em leque",
    visual: "diamond",
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_LASER_FAN,
  },
} as const satisfies Record<PowerUpType, PowerUpDefinition>;

export const ACTIVE_POWER_UP_TYPES = [
  "multiball",
  "wide_paddle",
  "slow_ball",
  "laser_fan",
] as const satisfies readonly PowerUpType[];

export function getPowerUpDefinition(type: PowerUpType): PowerUpDefinition {
  return POWER_UP_DEFINITIONS[type];
}

export function getPowerUpActivationAudioId(type: PowerUpType): AudioId {
  return getPowerUpDefinition(type).activationAudioId;
}
