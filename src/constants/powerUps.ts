// src/constants/powerUps.ts
import { GAME_AUDIO_IDS, type AudioId } from './audio';
import {
  sprPowerupLaserFan,
  sprPowerupMultiballOrb,
  sprPowerupSlowBall,
  sprPowerupWidePaddle,
} from './visualAssets';

export type PowerUpType =
  'multiball' | 'wide_paddle' | 'slow_ball' | 'laser_fan';

export type PowerUpVisual = 'ruby' | 'gold' | 'sapphire' | 'diamond';

export interface PowerUpDefinition {
  type: PowerUpType;
  visibleName: string;
  visual: PowerUpVisual;
  iconPath: string;
  activationAudioId: AudioId;
}

export const POWER_UP_ICON_PATHS = {
  multiball: sprPowerupMultiballOrb,
  wide_paddle: sprPowerupWidePaddle,
  slow_ball: sprPowerupSlowBall,
  laser_fan: sprPowerupLaserFan,
} as const satisfies Record<PowerUpType, string>;

export const POWER_UP_DEFINITIONS = {
  multiball: {
    type: 'multiball',
    visibleName: 'Multiball',
    visual: 'ruby',
    iconPath: POWER_UP_ICON_PATHS.multiball,
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_MULTIBALL,
  },
  wide_paddle: {
    type: 'wide_paddle',
    visibleName: 'Raquete ampla',
    visual: 'gold',
    iconPath: POWER_UP_ICON_PATHS.wide_paddle,
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_WIDE_PADDLE,
  },
  slow_ball: {
    type: 'slow_ball',
    visibleName: 'Bola lenta',
    visual: 'sapphire',
    iconPath: POWER_UP_ICON_PATHS.slow_ball,
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_SLOW_BALL,
  },
  laser_fan: {
    type: 'laser_fan',
    visibleName: 'Laser em leque',
    visual: 'diamond',
    iconPath: POWER_UP_ICON_PATHS.laser_fan,
    activationAudioId: GAME_AUDIO_IDS.POWERUP_ACTIVATE_LASER_FAN,
  },
} as const satisfies Record<PowerUpType, PowerUpDefinition>;

export const ACTIVE_POWER_UP_TYPES = [
  'multiball',
  'wide_paddle',
  'slow_ball',
  'laser_fan',
] as const satisfies readonly PowerUpType[];

export function getPowerUpDefinition(type: PowerUpType): PowerUpDefinition {
  return POWER_UP_DEFINITIONS[type];
}

export function getPowerUpActivationAudioId(type: PowerUpType): AudioId {
  return getPowerUpDefinition(type).activationAudioId;
}
