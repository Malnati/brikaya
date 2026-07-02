// src/constants/cinematicMedia.ts
export const CINEMATIC_MEDIA_PATHS = {
  COUNTDOWN_CIRCLE: "/assets/cinematics/countdown-circle.svg",
  COUNTDOWN_SPARK: "/assets/cinematics/countdown-spark.svg",
  LEVEL_UP_TWIRL: "/assets/cinematics/level-up-twirl.svg",
  LEVEL_UP_STAR: "/assets/cinematics/level-up-star.svg",
  RIP_SMOKE: "/assets/cinematics/rip-smoke.svg",
} as const;

export const CINEMATIC_MEDIA_LAYERS = {
  countdown: [
    {
      id: "countdown-circle",
      src: CINEMATIC_MEDIA_PATHS.COUNTDOWN_CIRCLE,
    },
    {
      id: "countdown-spark",
      src: CINEMATIC_MEDIA_PATHS.COUNTDOWN_SPARK,
    },
  ],
  levelUp: [
    {
      id: "level-up-twirl",
      src: CINEMATIC_MEDIA_PATHS.LEVEL_UP_TWIRL,
    },
    {
      id: "level-up-star",
      src: CINEMATIC_MEDIA_PATHS.LEVEL_UP_STAR,
    },
  ],
  rip: [
    {
      id: "rip-smoke",
      src: CINEMATIC_MEDIA_PATHS.RIP_SMOKE,
    },
  ],
} as const;

export type CinematicMediaType = keyof typeof CINEMATIC_MEDIA_LAYERS;
