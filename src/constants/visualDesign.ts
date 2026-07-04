// src/constants/visualDesign.ts
export interface VisualColorToken {
  id: string;
  cssVar: string;
  tailwindToken: string;
  hex: string;
  usage: string;
}

export interface TypographyToken {
  id: string;
  cssVar: string;
  desktopSize: string;
  mobileSize: string;
  weight: 400 | 600 | 700;
  usage: string;
}

export const VISUAL_COLOR_TOKENS = [
  { id: 'clr-arcade-bg-void', cssVar: '--bb-clr-arcade-bg-void', tailwindToken: 'arcade.bgVoid', hex: '#080816', usage: 'Fundo principal' },
  { id: 'clr-arcade-surface-panel', cssVar: '--bb-clr-arcade-surface-panel', tailwindToken: 'arcade.surfacePanel', hex: '#12122a', usage: 'Painéis HUD/menu' },
  { id: 'clr-neon-cyan-primary', cssVar: '--bb-clr-neon-cyan-primary', tailwindToken: 'neon.cyanPrimary', hex: '#00e5ff', usage: 'CTA, foco e esfera' },
  { id: 'clr-neon-magenta-accent', cssVar: '--bb-clr-neon-magenta-accent', tailwindToken: 'neon.magentaAccent', hex: '#ff2bd6', usage: 'Destaque raro' },
  { id: 'clr-neon-yellow-reward', cssVar: '--bb-clr-neon-yellow-reward', tailwindToken: 'neon.yellowReward', hex: '#ffe45e', usage: 'Score e recompensa' },
  { id: 'clr-neon-green-success', cssVar: '--bb-clr-neon-green-success', tailwindToken: 'neon.greenSuccess', hex: '#39ff88', usage: 'Power-up positivo' },
  { id: 'clr-neon-red-danger', cssVar: '--bb-clr-neon-red-danger', tailwindToken: 'neon.redDanger', hex: '#ff3b5f', usage: 'Dano e perda' },
  { id: 'clr-neon-purple-rare', cssVar: '--bb-clr-neon-purple-rare', tailwindToken: 'neon.purpleRare', hex: '#9b5cff', usage: 'Power-up raro' },
  { id: 'clr-text-main-light', cssVar: '--bb-clr-text-main-light', tailwindToken: 'text.mainLight', hex: '#f8f7ff', usage: 'Texto principal' },
  { id: 'clr-text-muted-blue', cssVar: '--bb-clr-text-muted-blue', tailwindToken: 'text.mutedBlue', hex: '#9cb7d8', usage: 'Texto auxiliar' },
  { id: 'clr-outline-grid-blue', cssVar: '--bb-clr-outline-grid-blue', tailwindToken: 'outline.gridBlue', hex: '#244c7a', usage: 'Bordas e grid' },
] as const satisfies readonly VisualColorToken[];

export const TYPOGRAPHY_TOKENS = [
  { id: 'typ-arcade-headline', cssVar: '--bb-font-size-headline', desktopSize: '32px', mobileSize: '28px', weight: 700, usage: 'Game over e títulos' },
  { id: 'typ-arcade-subtitle', cssVar: '--bb-font-size-subtitle', desktopSize: '24px', mobileSize: '20px', weight: 600, usage: 'Score e fase' },
  { id: 'typ-arcade-body', cssVar: '--bb-font-size-body', desktopSize: '16px', mobileSize: '16px', weight: 400, usage: 'Menu e botões' },
  { id: 'typ-arcade-caption', cssVar: '--bb-font-size-caption', desktopSize: '12px', mobileSize: '12px', weight: 400, usage: 'Legenda e versão' },
] as const satisfies readonly TypographyToken[];
