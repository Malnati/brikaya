// src/utils/visualAssetResolver.ts
import {
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_REAL_BIO_LAB_GLASS,
  IMAGE_SET_REAL_METRO_TUNNEL,
  IMAGE_SET_REAL_ORBITAL_DECK,
  IMAGE_SET_REAL_TEMPLE_STONE,
  IMAGE_SET_REAL_WORKSHOP_STEEL,
  IMAGE_SET_RETRO_DEFAULT,
  IMAGE_SET_SUNSET_CABINET,
  type ImageSetId,
} from "../constants/appearance";
import { VISUAL_ASSET_PATHS } from "../constants/visualAssets";

export const GAME_VISUAL_ASSET_ROLES = {
  ball: "ball",
  paddle: "paddle",
  brickRed: "brickRed",
  brickBlue: "brickBlue",
  brickGreen: "brickGreen",
  brickYellow: "brickYellow",
  brickPurple: "brickPurple",
  powerupMultiball: "powerupMultiball",
  powerupWidePaddle: "powerupWidePaddle",
  powerupSlowBall: "powerupSlowBall",
  powerupLaserFan: "powerupLaserFan",
  countdownCircleOverlay: "countdownCircleOverlay",
  countdownSparkOverlay: "countdownSparkOverlay",
  levelUpStarOverlay: "levelUpStarOverlay",
  levelUpTwirlOverlay: "levelUpTwirlOverlay",
  gameOverRipSmoke: "gameOverRipSmoke",
  appBrowserFavicon: "appBrowserFavicon",
  pwaAppIcon: "pwaAppIcon",
} as const;

export type GameVisualAssetRole =
  (typeof GAME_VISUAL_ASSET_ROLES)[keyof typeof GAME_VISUAL_ASSET_ROLES];

export type VisualAssetPathResolver = (role: GameVisualAssetRole) => string;

type VisualAssetKey = keyof typeof VISUAL_ASSET_PATHS;

export const GAME_VISUAL_ASSET_KEYS_BY_IMAGE_SET = {
  [IMAGE_SET_RETRO_DEFAULT]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: "sprBrickBasicYellowNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: "sprBrickBasicPurpleNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]: "sprPowerupMultiballOrb",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]: "sprPowerupWidePaddle",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBall",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFan",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]: "vfxCountdownSparkOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]: "vfxLevelUpStarOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]: "vfxLevelUpTwirlOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]: "vfxGameOverRipSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_HIGH_CONTRAST]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerHighContrastDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerHighContrastDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedHighContrastNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueHighContrastNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]:
      "sprBrickBasicGreenHighContrastNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]:
      "sprBrickBasicYellowHighContrastNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]:
      "sprBrickBasicPurpleHighContrastNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]:
      "sprPowerupMultiballOrbHighContrast",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]:
      "sprPowerupWidePaddleHighContrast",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallHighContrast",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanHighContrast",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleHighContrastOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkHighContrastOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]:
      "vfxLevelUpStarHighContrastOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlHighContrastOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]:
      "vfxGameOverRipHighContrastSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_SUNSET_CABINET]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerSunsetDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerSunsetDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedSunsetNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueSunsetNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenSunsetNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: "sprBrickBasicYellowSunsetNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: "sprBrickBasicPurpleSunsetNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]: "sprPowerupMultiballOrbSunset",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]: "sprPowerupWidePaddleSunset",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallSunset",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanSunset",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleSunsetOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkSunsetOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]: "vfxLevelUpStarSunsetOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlSunsetOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]: "vfxGameOverRipSunsetSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_REAL_METRO_TUNNEL]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerMetroRealDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerMetroRealDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedMetroRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueMetroRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenMetroRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: "sprBrickBasicYellowMetroRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: "sprBrickBasicPurpleMetroRealNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]:
      "sprPowerupMultiballOrbMetroReal",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]:
      "sprPowerupWidePaddleMetroReal",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallMetroReal",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanMetroReal",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleMetroRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkMetroRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]:
      "vfxLevelUpStarMetroRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlMetroRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]: "vfxGameOverRipMetroRealSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_REAL_WORKSHOP_STEEL]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerGarageRealDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerGarageRealDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedGarageRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueGarageRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenGarageRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]:
      "sprBrickBasicYellowGarageRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]:
      "sprBrickBasicPurpleGarageRealNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]:
      "sprPowerupMultiballOrbGarageReal",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]:
      "sprPowerupWidePaddleGarageReal",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallGarageReal",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanGarageReal",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleGarageRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkGarageRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]:
      "vfxLevelUpStarGarageRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlGarageRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]: "vfxGameOverRipGarageRealSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_REAL_BIO_LAB_GLASS]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerLabRealDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerLabRealDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedLabRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueLabRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenLabRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: "sprBrickBasicYellowLabRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: "sprBrickBasicPurpleLabRealNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]: "sprPowerupMultiballOrbLabReal",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]: "sprPowerupWidePaddleLabReal",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallLabReal",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanLabReal",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleLabRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkLabRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]:
      "vfxLevelUpStarLabRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlLabRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]: "vfxGameOverRipLabRealSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_REAL_TEMPLE_STONE]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerTempleRealDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerTempleRealDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedTempleRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueTempleRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenTempleRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]:
      "sprBrickBasicYellowTempleRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]:
      "sprBrickBasicPurpleTempleRealNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]:
      "sprPowerupMultiballOrbTempleReal",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]:
      "sprPowerupWidePaddleTempleReal",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallTempleReal",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanTempleReal",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleTempleRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkTempleRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]:
      "vfxLevelUpStarTempleRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlTempleRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]: "vfxGameOverRipTempleRealSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
  [IMAGE_SET_REAL_ORBITAL_DECK]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: "sprBallPlayerOrbitalRealDefault",
    [GAME_VISUAL_ASSET_ROLES.paddle]: "sprPaddlePlayerOrbitalRealDefault",
    [GAME_VISUAL_ASSET_ROLES.brickRed]: "sprBrickBasicRedOrbitalRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: "sprBrickBasicBlueOrbitalRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: "sprBrickBasicGreenOrbitalRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickYellow]:
      "sprBrickBasicYellowOrbitalRealNormal",
    [GAME_VISUAL_ASSET_ROLES.brickPurple]:
      "sprBrickBasicPurpleOrbitalRealNormal",
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]:
      "sprPowerupMultiballOrbOrbitalReal",
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]:
      "sprPowerupWidePaddleOrbitalReal",
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: "sprPowerupSlowBallOrbitalReal",
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: "sprPowerupLaserFanOrbitalReal",
    [GAME_VISUAL_ASSET_ROLES.countdownCircleOverlay]:
      "vfxCountdownCircleOrbitalRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.countdownSparkOverlay]:
      "vfxCountdownSparkOrbitalRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpStarOverlay]:
      "vfxLevelUpStarOrbitalRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.levelUpTwirlOverlay]:
      "vfxLevelUpTwirlOrbitalRealOverlay",
    [GAME_VISUAL_ASSET_ROLES.gameOverRipSmoke]:
      "vfxGameOverRipOrbitalRealSmoke",
    [GAME_VISUAL_ASSET_ROLES.appBrowserFavicon]: "uiAppBrowserFavicon",
    [GAME_VISUAL_ASSET_ROLES.pwaAppIcon]: "uiPwaAppIcon",
  },
} as const satisfies Record<
  ImageSetId,
  Record<GameVisualAssetRole, VisualAssetKey>
>;

export function resolveGameVisualAssetPath(
  imageSetId: ImageSetId,
  role: GameVisualAssetRole,
): string {
  return VISUAL_ASSET_PATHS[
    GAME_VISUAL_ASSET_KEYS_BY_IMAGE_SET[imageSetId][role]
  ];
}

export const DEFAULT_GAME_VISUAL_ASSET_RESOLVER: VisualAssetPathResolver = (
  role,
) => resolveGameVisualAssetPath(IMAGE_SET_RETRO_DEFAULT, role);

export function getRuntimeVisualAssetPathsForImageSet(
  imageSetId: ImageSetId,
): string[] {
  return Object.values(GAME_VISUAL_ASSET_KEYS_BY_IMAGE_SET[imageSetId]).map(
    (assetKey) => VISUAL_ASSET_PATHS[assetKey],
  );
}
