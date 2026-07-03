// src/constants/visualAssets.ts

export const sprBallPlayerDefault = '/assets/visual/sprites/spr-ball-player-default.svg';
export const sprPaddlePlayerDefault = '/assets/visual/sprites/spr-paddle-player-default.svg';
export const sprBrickBasicRedNormal = '/assets/visual/bricks/spr-brick-basic-red-normal.svg';
export const sprBrickBasicBlueNormal = '/assets/visual/bricks/spr-brick-basic-blue-normal.svg';
export const sprBrickBasicGreenNormal = '/assets/visual/bricks/spr-brick-basic-green-normal.svg';
export const sprBrickBasicYellowNormal = '/assets/visual/bricks/spr-brick-basic-yellow-normal.svg';
export const sprBrickBasicPurpleNormal = '/assets/visual/bricks/spr-brick-basic-purple-normal.svg';
export const vfxCountdownCircleOverlay = '/assets/visual/vfx/vfx-countdown-circle-overlay.svg';
export const vfxCountdownSparkOverlay = '/assets/visual/vfx/vfx-countdown-spark-overlay.svg';
export const vfxLevelUpStarOverlay = '/assets/visual/vfx/vfx-level-up-star-overlay.svg';
export const vfxLevelUpTwirlOverlay = '/assets/visual/vfx/vfx-level-up-twirl-overlay.svg';
export const vfxGameOverRipSmoke = '/assets/visual/vfx/vfx-game-over-rip-smoke.svg';
export const sprPowerupMultiballOrb = '/assets/visual/powerups/spr-powerup-multiball-orb.svg';
export const sprPowerupWidePaddle = '/assets/visual/powerups/spr-powerup-wide-paddle.svg';
export const sprPowerupSlowBall = '/assets/visual/powerups/spr-powerup-slow-ball.svg';
export const sprPowerupLaserFan = '/assets/visual/powerups/spr-powerup-laser-fan.svg';
export const uiAppBrowserFavicon = '/assets/visual/ui/ui-app-browser-favicon.svg';
export const uiPwaAppIcon = '/assets/visual/ui/ui-pwa-app-icon.svg';

export type VisualAssetGroup = 'sprite' | 'brick' | 'powerup' | 'vfx' | 'ui';

export interface VisualAssetCatalogEntry {
  id: string;
  variableName: string;
  path: string;
  group: VisualAssetGroup;
  semanticRole: string;
  state: string;
  width: number;
  height: number;
  usage: string;
}

export const VISUAL_ASSET_PATHS = {
  sprBallPlayerDefault,
  sprPaddlePlayerDefault,
  sprBrickBasicRedNormal,
  sprBrickBasicBlueNormal,
  sprBrickBasicGreenNormal,
  sprBrickBasicYellowNormal,
  sprBrickBasicPurpleNormal,
  vfxCountdownCircleOverlay,
  vfxCountdownSparkOverlay,
  vfxLevelUpStarOverlay,
  vfxLevelUpTwirlOverlay,
  vfxGameOverRipSmoke,
  sprPowerupMultiballOrb,
  sprPowerupWidePaddle,
  sprPowerupSlowBall,
  sprPowerupLaserFan,
  uiAppBrowserFavicon,
  uiPwaAppIcon,
} as const;

export const VISUAL_ASSET_CATALOG = [
  {
    id: 'spr-ball-player-default',
    variableName: 'sprBallPlayerDefault',
    path: sprBallPlayerDefault,
    group: 'sprite',
    semanticRole: 'ball',
    state: 'normal',
    width: 16,
    height: 16,
    usage: 'Esfera principal',
  },
  {
    id: 'spr-paddle-player-default',
    variableName: 'sprPaddlePlayerDefault',
    path: sprPaddlePlayerDefault,
    group: 'sprite',
    semanticRole: 'paddle',
    state: 'normal',
    width: 96,
    height: 16,
    usage: 'Raquete padrão',
  },
  {
    id: 'spr-brick-basic-red-normal',
    variableName: 'sprBrickBasicRedNormal',
    path: sprBrickBasicRedNormal,
    group: 'brick',
    semanticRole: 'brick',
    state: 'normal',
    width: 48,
    height: 20,
    usage: 'Bloco básico vermelho',
  },
  {
    id: 'spr-brick-basic-blue-normal',
    variableName: 'sprBrickBasicBlueNormal',
    path: sprBrickBasicBlueNormal,
    group: 'brick',
    semanticRole: 'brick',
    state: 'normal',
    width: 48,
    height: 20,
    usage: 'Bloco básico azul',
  },
  {
    id: 'spr-brick-basic-green-normal',
    variableName: 'sprBrickBasicGreenNormal',
    path: sprBrickBasicGreenNormal,
    group: 'brick',
    semanticRole: 'brick',
    state: 'normal',
    width: 48,
    height: 20,
    usage: 'Bloco básico verde',
  },
  {
    id: 'spr-brick-basic-yellow-normal',
    variableName: 'sprBrickBasicYellowNormal',
    path: sprBrickBasicYellowNormal,
    group: 'brick',
    semanticRole: 'brick',
    state: 'normal',
    width: 48,
    height: 20,
    usage: 'Bloco básico amarelo',
  },
  {
    id: 'spr-brick-basic-purple-normal',
    variableName: 'sprBrickBasicPurpleNormal',
    path: sprBrickBasicPurpleNormal,
    group: 'brick',
    semanticRole: 'brick',
    state: 'normal',
    width: 48,
    height: 20,
    usage: 'Bloco básico roxo',
  },
  {
    id: 'vfx-countdown-circle-overlay',
    variableName: 'vfxCountdownCircleOverlay',
    path: vfxCountdownCircleOverlay,
    group: 'vfx',
    semanticRole: 'countdown',
    state: 'overlay',
    width: 180,
    height: 180,
    usage: 'Anel da contagem inicial',
  },
  {
    id: 'vfx-countdown-spark-overlay',
    variableName: 'vfxCountdownSparkOverlay',
    path: vfxCountdownSparkOverlay,
    group: 'vfx',
    semanticRole: 'countdown',
    state: 'overlay',
    width: 180,
    height: 180,
    usage: 'Faísca da contagem inicial',
  },
  {
    id: 'vfx-level-up-star-overlay',
    variableName: 'vfxLevelUpStarOverlay',
    path: vfxLevelUpStarOverlay,
    group: 'vfx',
    semanticRole: 'level-up',
    state: 'overlay',
    width: 180,
    height: 180,
    usage: 'Estrela de subida de fase',
  },
  {
    id: 'vfx-level-up-twirl-overlay',
    variableName: 'vfxLevelUpTwirlOverlay',
    path: vfxLevelUpTwirlOverlay,
    group: 'vfx',
    semanticRole: 'level-up',
    state: 'overlay',
    width: 180,
    height: 180,
    usage: 'Espiral de subida de fase',
  },
  {
    id: 'vfx-game-over-rip-smoke',
    variableName: 'vfxGameOverRipSmoke',
    path: vfxGameOverRipSmoke,
    group: 'vfx',
    semanticRole: 'game-over',
    state: 'overlay',
    width: 180,
    height: 180,
    usage: 'Fumaça de fim de jogo',
  },
  {
    id: 'spr-powerup-multiball-orb',
    variableName: 'sprPowerupMultiballOrb',
    path: sprPowerupMultiballOrb,
    group: 'powerup',
    semanticRole: 'multiball',
    state: 'collectible',
    width: 24,
    height: 24,
    usage: 'Power-up multiball',
  },
  {
    id: 'spr-powerup-wide-paddle',
    variableName: 'sprPowerupWidePaddle',
    path: sprPowerupWidePaddle,
    group: 'powerup',
    semanticRole: 'wide-paddle',
    state: 'collectible',
    width: 24,
    height: 24,
    usage: 'Power-up raquete ampla',
  },
  {
    id: 'spr-powerup-slow-ball',
    variableName: 'sprPowerupSlowBall',
    path: sprPowerupSlowBall,
    group: 'powerup',
    semanticRole: 'slow-ball',
    state: 'collectible',
    width: 24,
    height: 24,
    usage: 'Power-up bola lenta',
  },
  {
    id: 'spr-powerup-laser-fan',
    variableName: 'sprPowerupLaserFan',
    path: sprPowerupLaserFan,
    group: 'powerup',
    semanticRole: 'laser-fan',
    state: 'collectible',
    width: 24,
    height: 24,
    usage: 'Power-up laser em leque',
  },
  {
    id: 'ui-app-browser-favicon',
    variableName: 'uiAppBrowserFavicon',
    path: uiAppBrowserFavicon,
    group: 'ui',
    semanticRole: 'favicon',
    state: 'normal',
    width: 32,
    height: 32,
    usage: 'Ícone do navegador',
  },
  {
    id: 'ui-pwa-app-icon',
    variableName: 'uiPwaAppIcon',
    path: uiPwaAppIcon,
    group: 'ui',
    semanticRole: 'pwa-icon',
    state: 'normal',
    width: 512,
    height: 512,
    usage: 'Ícone instalável da PWA',
  },
] as const satisfies readonly VisualAssetCatalogEntry[];

export const RUNTIME_VISUAL_ASSET_PATHS = Object.values(VISUAL_ASSET_PATHS);
