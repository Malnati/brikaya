// src/constants/cinematicMedia.ts
import {
  vfxCountdownCircleOverlay,
  vfxCountdownSparkOverlay,
  vfxGameOverRipSmoke,
  vfxLevelUpStarOverlay,
  vfxLevelUpTwirlOverlay,
} from './visualAssets';

export const CINEMATIC_MEDIA_PATHS = {
  COUNTDOWN_CIRCLE: vfxCountdownCircleOverlay,
  COUNTDOWN_SPARK: vfxCountdownSparkOverlay,
  LEVEL_UP_TWIRL: vfxLevelUpTwirlOverlay,
  LEVEL_UP_STAR: vfxLevelUpStarOverlay,
  RIP_SMOKE: vfxGameOverRipSmoke,
} as const;

export const CINEMATIC_MEDIA_LAYERS = {
  countdown: [
    {
      id: 'countdown-circle',
      src: CINEMATIC_MEDIA_PATHS.COUNTDOWN_CIRCLE,
    },
    {
      id: 'countdown-spark',
      src: CINEMATIC_MEDIA_PATHS.COUNTDOWN_SPARK,
    },
  ],
  levelUp: [
    {
      id: 'level-up-twirl',
      src: CINEMATIC_MEDIA_PATHS.LEVEL_UP_TWIRL,
    },
    {
      id: 'level-up-star',
      src: CINEMATIC_MEDIA_PATHS.LEVEL_UP_STAR,
    },
  ],
  rip: [
    {
      id: 'rip-smoke',
      src: CINEMATIC_MEDIA_PATHS.RIP_SMOKE,
    },
  ],
} as const;

export type CinematicMediaType = keyof typeof CINEMATIC_MEDIA_LAYERS;
