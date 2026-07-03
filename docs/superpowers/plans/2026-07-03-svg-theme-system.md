<!-- docs/superpowers/plans/2026-07-03-svg-theme-system.md -->
# SVG Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar temas selecionáveis no menu do BrickBreaker, combinando cores, fontes e conjuntos de imagens em SVG, mantendo o jogo offline e a nomenclatura semântica adotada no thread “Padronizar nomes de arquivos”.

**Architecture:** Separar aparência em três decisões persistidas: `themeId` para cores/superfícies, `imageSetId` para sprites/UI/VFX SVG e `fontSetId` para escala/família tipográfica local via CSS tokens. O canvas deve resolver assets por papel sem reiniciar `GameEngine`, usando um resolvedor central que troca paths em tempo real e pré-carrega o conjunto escolhido. O menu deve expor escolhas humanas simples, enquanto o código mantém IDs técnicos kebab-case/camelCase auditáveis.

**Tech Stack:** React 18, TypeScript strict, Vite, IndexedDB já existente, Service Worker cache-first, SVG local em `public/assets/visual/`, Jest, Puppeteer QA publicado via Cloudflare Pages.

---

## Escopo travado

### Dentro do escopo

- Temas visuais selecionáveis no menu.
- Conjuntos de imagens em **SVG apenas**.
- Tokens de cor e tipografia por tema.
- Persistência local offline.
- Precache de todos os SVGs runtime no `public/sw.js`.
- Cobertura unitária e QA publicado.
- Mockups/diagramas/planejamento em SVG apenas.

### Fora do escopo

- PNG, JPG, WebP, GIF ou qualquer raster runtime novo.
- Fontes remotas, CDN ou scripts externos.
- Loja, upgrades, ranking, leaderboard, tutorial, multiplayer, créditos, vidas ou navegação inferior.
- Alterar a área do canvas/tabuleiro além do necessário para trocar assets.
- Alterar regras de pontuação, colisão, fases ou logs.

## Artefatos visuais SVG do planejamento

- [Opções visuais SVG](../../assets/theme-planning/svg-theme-system/brickbreaker-theme-options.svg)
- [Arquitetura SVG](../../assets/theme-planning/svg-theme-system/brickbreaker-theme-architecture.svg)

## Vocabulário técnico adotado

| Termo humano | Prefixo | Exemplo no disco | Exemplo no código |
| --- | --- | --- | --- |
| Sprite de jogo | `spr-` | `spr-paddle-player-default.svg` | `sprPaddlePlayerDefault` |
| UI/HUD/menu | `ui-` | `ui-pwa-app-icon.svg` | `uiPwaAppIcon` |
| Efeito visual | `vfx-` | `vfx-level-up-star-overlay.svg` | `vfxLevelUpStarOverlay` |
| Cor | `clr-` | `clr-neon-cyan-primary` | `clrNeonCyanPrimary` |
| Tipografia | `typ-` | `typ-arcade-headline` | `typArcadeHeadline` |
| SFX | `sfx-` | `sfx-paddle-hit-center-01.mp3` | `sfxPaddleHitCenter01` |
| BGM | `bgm-` | `bgm-gameplay-loop-main-01.mp3` | `bgmGameplayLoopMain01` |

## Opções visuais aprováveis antes da implementação

| Opção | `themeId` | `imageSetId` | `fontSetId` | Papel |
| --- | --- | --- | --- | --- |
| Neon Arcade | `neon-arcade` | `retro-default` | `arcade-ui` | Padrão recomendado, compatível com tokens atuais. |
| CRT Alto Contraste | `crt-high-contrast` | `high-contrast` | `crt-mono` | Primeiro tema extra por ganho de acessibilidade. |
| Pixel Sunset | `pixel-sunset` | `sunset-cabinet` | `block-pixel` | Tema alternativo posterior, sem nova mecânica. |

## File structure

### Criar

- `src/constants/appearance.ts` — IDs, labels, tokens, storage keys, defaults e migração de valores antigos.
- `src/constants/appearance.test.ts` — validação de IDs, defaults, migração, labels e ausência de termos técnicos na UI.
- `src/hooks/useAppearancePreference.ts` — estado persistido e aplicação em `document.documentElement.dataset`.
- `src/hooks/useAppearancePreference.test.tsx` — persistência, fallback e atributos `data-*`.
- `src/components/AppearanceSelector.tsx` — controles de menu para tema visual, imagens e fonte.
- `src/components/AppearanceSelector.test.tsx` — renderização, seleção e acessibilidade.
- `src/utils/visualAssetResolver.ts` — resolvedor de assets por papel e conjunto de imagens.
- `src/utils/visualAssetResolver.test.ts` — paths por papel, fallback e exclusividade.
- SVGs novos em `public/assets/visual/sprites/`, `public/assets/visual/bricks/`, `public/assets/visual/powerups/` e `public/assets/visual/vfx/`.

### Modificar

- `src/constants/theme.ts` — manter compatibilidade ou reexportar aliases antigos para o novo sistema.
- `src/components/ThemeToggle.tsx` — substituir por wrapper de compatibilidade ou remover quando `AppearanceSelector` entrar.
- `src/App.tsx` — usar `useAppearancePreference` e trocar seção `Tema` por `Aparência`.
- `src/components/Game.tsx` — receber `imageSetId` e repassar para `useGameLoop`.
- `src/hooks/useGameLoop.ts` — sincronizar `imageSetId` no `GameEngine` sem reiniciar por pontuação/colisão.
- `src/logic/GameEngine.ts` — aceitar atualização de conjunto visual e pré-carregar assets necessários.
- `src/objects/Ball.ts`, `src/objects/Paddle.ts`, `src/objects/Bricks.ts`, `src/objects/PowerUp.ts` — resolver assets por papel em vez de path fixo.
- `src/constants/assets.ts` e `src/constants/powerUps.ts` — fornecer papéis semânticos e manter fallback default.
- `src/constants/visualAssets.ts` — catalogar todos os SVGs novos com IDs únicos.
- `src/constants/assetNaming.test.ts` — exigir SVG-only para runtime visual.
- `scripts/validate-svg-assets.mjs` — bloquear raster e validar SVGs novos.
- `public/sw.js` — precache de todos os novos SVGs runtime.
- `tests/e2e/cloudflare-theme-qa.js` — validar menu “Aparência”, persistência e troca de tema/imagens/fonte.
- `tests/e2e/cloudflare-svg-assets-qa.js` — validar todos os SVGs esperados, sem raster runtime.
- `docs/rup/02-design/retro-asset-system.md` — registrar `themeId`, `imageSetId`, `fontSetId` e SVG-only.
- `CHANGELOG.md` — registrar a feature quando implementada.

---

## Task 1: Contrato de aparência SVG-only

**Files:**
- Create: `src/constants/appearance.ts`
- Create: `src/constants/appearance.test.ts`
- Modify: `src/constants/theme.ts`

- [ ] **Step 1: Write failing tests for appearance contract**

Create `src/constants/appearance.test.ts`:

```ts
// src/constants/appearance.test.ts
import {
  APPEARANCE_STORAGE_KEYS,
  DEFAULT_APPEARANCE_SELECTION,
  FONT_SET_OPTIONS,
  IMAGE_SET_OPTIONS,
  THEME_OPTIONS,
  isFontSetId,
  isImageSetId,
  isThemeId,
  migrateStoredThemeId,
  resolveAppearanceSelection,
} from './appearance';

const TECHNICAL_COPY_PATTERN = /svg|asset|token|css|dataset|runtime|cache|service worker|localstorage/i;

describe('appearance contract', () => {
  it('define escolhas padrão humanas e persistíveis', () => {
    expect(DEFAULT_APPEARANCE_SELECTION).toEqual({
      themeId: 'neon-arcade',
      imageSetId: 'retro-default',
      fontSetId: 'arcade-ui',
    });
    expect(APPEARANCE_STORAGE_KEYS.theme).toBe('brickbreaker-theme');
    expect(APPEARANCE_STORAGE_KEYS.imageSet).toBe('brickbreaker-image-set');
    expect(APPEARANCE_STORAGE_KEYS.fontSet).toBe('brickbreaker-font-set');
  });

  it('aceita apenas IDs conhecidos', () => {
    expect(isThemeId('neon-arcade')).toBe(true);
    expect(isThemeId('crt-high-contrast')).toBe(true);
    expect(isThemeId('pixel-sunset')).toBe(true);
    expect(isThemeId('store')).toBe(false);

    expect(isImageSetId('retro-default')).toBe(true);
    expect(isImageSetId('high-contrast')).toBe(true);
    expect(isImageSetId('sunset-cabinet')).toBe(true);
    expect(isImageSetId('ranking')).toBe(false);

    expect(isFontSetId('arcade-ui')).toBe(true);
    expect(isFontSetId('crt-mono')).toBe(true);
    expect(isFontSetId('block-pixel')).toBe(true);
    expect(isFontSetId('google-fonts')).toBe(false);
  });

  it('migra temas antigos claro/escuro sem quebrar preferência salva', () => {
    expect(migrateStoredThemeId('dark')).toBe('neon-arcade');
    expect(migrateStoredThemeId('light')).toBe('crt-high-contrast');
    expect(migrateStoredThemeId('neon-arcade')).toBe('neon-arcade');
    expect(migrateStoredThemeId('invalid')).toBe(null);
  });

  it('resolve seleção com fallback padrão', () => {
    expect(resolveAppearanceSelection({ themeId: 'pixel-sunset', imageSetId: 'sunset-cabinet', fontSetId: 'block-pixel' })).toEqual({
      themeId: 'pixel-sunset',
      imageSetId: 'sunset-cabinet',
      fontSetId: 'block-pixel',
    });
    expect(resolveAppearanceSelection({ themeId: 'store', imageSetId: 'ranking', fontSetId: 'remote-font' })).toEqual(DEFAULT_APPEARANCE_SELECTION);
  });

  it('usa labels finais sem termos técnicos internos', () => {
    const labels = [...THEME_OPTIONS, ...IMAGE_SET_OPTIONS, ...FONT_SET_OPTIONS].map((option) => option.label);
    expect(labels).toEqual([
      'Neon Arcade',
      'CRT alto contraste',
      'Pixel Sunset',
      'Retro padrão',
      'Alto contraste',
      'Cabine Sunset',
      'Arcade',
      'CRT mono',
      'Blocos pixel',
    ]);
    expect(labels.some((label) => TECHNICAL_COPY_PATTERN.test(label))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --version
npm test -- src/constants/appearance.test.ts --runInBand
```

Expected: fail with `Cannot find module './appearance'`.

- [ ] **Step 3: Implement `appearance.ts`**

Create `src/constants/appearance.ts`:

```ts
// src/constants/appearance.ts
export const THEME_NEON_ARCADE = 'neon-arcade';
export const THEME_CRT_HIGH_CONTRAST = 'crt-high-contrast';
export const THEME_PIXEL_SUNSET = 'pixel-sunset';
export const IMAGE_SET_RETRO_DEFAULT = 'retro-default';
export const IMAGE_SET_HIGH_CONTRAST = 'high-contrast';
export const IMAGE_SET_SUNSET_CABINET = 'sunset-cabinet';
export const FONT_SET_ARCADE_UI = 'arcade-ui';
export const FONT_SET_CRT_MONO = 'crt-mono';
export const FONT_SET_BLOCK_PIXEL = 'block-pixel';
export const LEGACY_THEME_DARK = 'dark';
export const LEGACY_THEME_LIGHT = 'light';

export const APPEARANCE_STORAGE_KEYS = {
  theme: 'brickbreaker-theme',
  imageSet: 'brickbreaker-image-set',
  fontSet: 'brickbreaker-font-set',
} as const;

export const THEME_IDS = [
  THEME_NEON_ARCADE,
  THEME_CRT_HIGH_CONTRAST,
  THEME_PIXEL_SUNSET,
] as const;
export const IMAGE_SET_IDS = [
  IMAGE_SET_RETRO_DEFAULT,
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_SUNSET_CABINET,
] as const;
export const FONT_SET_IDS = [
  FONT_SET_ARCADE_UI,
  FONT_SET_CRT_MONO,
  FONT_SET_BLOCK_PIXEL,
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ImageSetId = (typeof IMAGE_SET_IDS)[number];
export type FontSetId = (typeof FONT_SET_IDS)[number];

export interface AppearanceSelection {
  themeId: ThemeId;
  imageSetId: ImageSetId;
  fontSetId: FontSetId;
}

export interface AppearanceOption<T extends string> {
  id: T;
  label: string;
}

export const DEFAULT_APPEARANCE_SELECTION = {
  themeId: THEME_NEON_ARCADE,
  imageSetId: IMAGE_SET_RETRO_DEFAULT,
  fontSetId: FONT_SET_ARCADE_UI,
} as const satisfies AppearanceSelection;

export const THEME_OPTIONS = [
  { id: THEME_NEON_ARCADE, label: 'Neon Arcade' },
  { id: THEME_CRT_HIGH_CONTRAST, label: 'CRT alto contraste' },
  { id: THEME_PIXEL_SUNSET, label: 'Pixel Sunset' },
] as const satisfies readonly AppearanceOption<ThemeId>[];

export const IMAGE_SET_OPTIONS = [
  { id: IMAGE_SET_RETRO_DEFAULT, label: 'Retro padrão' },
  { id: IMAGE_SET_HIGH_CONTRAST, label: 'Alto contraste' },
  { id: IMAGE_SET_SUNSET_CABINET, label: 'Cabine Sunset' },
] as const satisfies readonly AppearanceOption<ImageSetId>[];

export const FONT_SET_OPTIONS = [
  { id: FONT_SET_ARCADE_UI, label: 'Arcade' },
  { id: FONT_SET_CRT_MONO, label: 'CRT mono' },
  { id: FONT_SET_BLOCK_PIXEL, label: 'Blocos pixel' },
] as const satisfies readonly AppearanceOption<FontSetId>[];

export function isThemeId(value: unknown): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function isImageSetId(value: unknown): value is ImageSetId {
  return IMAGE_SET_IDS.includes(value as ImageSetId);
}

export function isFontSetId(value: unknown): value is FontSetId {
  return FONT_SET_IDS.includes(value as FontSetId);
}

export function migrateStoredThemeId(value: unknown): ThemeId | null {
  if (value === LEGACY_THEME_DARK) return THEME_NEON_ARCADE;
  if (value === LEGACY_THEME_LIGHT) return THEME_CRT_HIGH_CONTRAST;
  return isThemeId(value) ? value : null;
}

export function resolveAppearanceSelection(input: {
  themeId: unknown;
  imageSetId: unknown;
  fontSetId: unknown;
}): AppearanceSelection {
  return {
    themeId: migrateStoredThemeId(input.themeId) ?? DEFAULT_APPEARANCE_SELECTION.themeId,
    imageSetId: isImageSetId(input.imageSetId) ? input.imageSetId : DEFAULT_APPEARANCE_SELECTION.imageSetId,
    fontSetId: isFontSetId(input.fontSetId) ? input.fontSetId : DEFAULT_APPEARANCE_SELECTION.fontSetId,
  };
}
```

- [ ] **Step 4: Keep old theme constants compatible**

Modify `src/constants/theme.ts` to reexport compatible values:

```ts
// src/constants/theme.ts
import {
  APPEARANCE_STORAGE_KEYS,
  THEME_CRT_HIGH_CONTRAST,
  THEME_NEON_ARCADE,
  type ThemeId,
  isThemeId,
  migrateStoredThemeId,
} from './appearance';

export const THEME_LIGHT = THEME_CRT_HIGH_CONTRAST;
export const THEME_DARK = THEME_NEON_ARCADE;
export const THEME_STORAGE_KEY = APPEARANCE_STORAGE_KEYS.theme;

export type ThemeMode = ThemeId;

export function isThemeMode(value: unknown): value is ThemeMode {
  return isThemeId(value) || value === 'light' || value === 'dark';
}

export function resolveInitialTheme(storedTheme: unknown, _prefersDark: boolean): ThemeMode {
  return migrateStoredThemeId(storedTheme) ?? THEME_NEON_ARCADE;
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- src/constants/appearance.test.ts src/constants/theme.test.ts --runInBand
```

Expected: all tests pass after updating `src/constants/theme.test.ts` expectations from `light/dark` to the new compatible IDs.

- [ ] **Step 6: Commit**

```bash
git add src/constants/appearance.ts src/constants/appearance.test.ts src/constants/theme.ts src/constants/theme.test.ts
git commit -m "feat(theme): definir contrato de aparência SVG"
```

---

## Task 2: Catálogo de assets por conjunto de imagens

**Files:**
- Create: `src/utils/visualAssetResolver.ts`
- Create: `src/utils/visualAssetResolver.test.ts`
- Modify: `src/constants/visualAssets.ts`
- Modify: `src/constants/assets.ts`
- Modify: `src/constants/powerUps.ts`

- [ ] **Step 1: Add failing resolver tests**

Create `src/utils/visualAssetResolver.test.ts`:

```ts
// src/utils/visualAssetResolver.test.ts
import {
  GAME_VISUAL_ASSET_ROLES,
  getRuntimeVisualAssetPathsForImageSet,
  resolveGameVisualAssetPath,
} from './visualAssetResolver';

const SVG_PATTERN = /^\/assets\/visual\/.+\.svg$/;

describe('visual asset resolver', () => {
  it('resolve paths SVG por papel no conjunto padrão', () => {
    expect(resolveGameVisualAssetPath('retro-default', GAME_VISUAL_ASSET_ROLES.ball)).toBe('/assets/visual/sprites/spr-ball-player-default.svg');
    expect(resolveGameVisualAssetPath('retro-default', GAME_VISUAL_ASSET_ROLES.paddle)).toBe('/assets/visual/sprites/spr-paddle-player-default.svg');
    expect(resolveGameVisualAssetPath('retro-default', GAME_VISUAL_ASSET_ROLES.brickRed)).toBe('/assets/visual/bricks/spr-brick-basic-red-normal.svg');
  });

  it('resolve variantes SVG alto contraste', () => {
    expect(resolveGameVisualAssetPath('high-contrast', GAME_VISUAL_ASSET_ROLES.ball)).toBe('/assets/visual/sprites/spr-ball-player-high-contrast-default.svg');
    expect(resolveGameVisualAssetPath('high-contrast', GAME_VISUAL_ASSET_ROLES.paddle)).toBe('/assets/visual/sprites/spr-paddle-player-high-contrast-default.svg');
  });

  it('resolve variantes SVG sunset', () => {
    expect(resolveGameVisualAssetPath('sunset-cabinet', GAME_VISUAL_ASSET_ROLES.ball)).toBe('/assets/visual/sprites/spr-ball-player-sunset-default.svg');
    expect(resolveGameVisualAssetPath('sunset-cabinet', GAME_VISUAL_ASSET_ROLES.paddle)).toBe('/assets/visual/sprites/spr-paddle-player-sunset-default.svg');
  });

  it('lista somente SVGs sem repetição por conjunto', () => {
    for (const imageSetId of ['retro-default', 'high-contrast', 'sunset-cabinet'] as const) {
      const paths = getRuntimeVisualAssetPathsForImageSet(imageSetId);
      expect(paths.length).toBeGreaterThanOrEqual(18);
      expect(new Set(paths).size).toBe(paths.length);
      expect(paths.every((path) => SVG_PATTERN.test(path))).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/utils/visualAssetResolver.test.ts --runInBand
```

Expected: fail with missing resolver.

- [ ] **Step 3: Add new SVG path constants**

Extend `src/constants/visualAssets.ts` with new SVG constants. Use these exact names and paths for high-contrast and sunset variants:

```ts
export const sprBallPlayerHighContrastDefault = '/assets/visual/sprites/spr-ball-player-high-contrast-default.svg';
export const sprPaddlePlayerHighContrastDefault = '/assets/visual/sprites/spr-paddle-player-high-contrast-default.svg';
export const sprBrickBasicRedHighContrastNormal = '/assets/visual/bricks/spr-brick-basic-red-high-contrast-normal.svg';
export const sprBrickBasicBlueHighContrastNormal = '/assets/visual/bricks/spr-brick-basic-blue-high-contrast-normal.svg';
export const sprBrickBasicGreenHighContrastNormal = '/assets/visual/bricks/spr-brick-basic-green-high-contrast-normal.svg';
export const sprBrickBasicYellowHighContrastNormal = '/assets/visual/bricks/spr-brick-basic-yellow-high-contrast-normal.svg';
export const sprBrickBasicPurpleHighContrastNormal = '/assets/visual/bricks/spr-brick-basic-purple-high-contrast-normal.svg';
export const sprPowerupMultiballOrbHighContrast = '/assets/visual/powerups/spr-powerup-multiball-orb-high-contrast.svg';
export const sprPowerupWidePaddleHighContrast = '/assets/visual/powerups/spr-powerup-wide-paddle-high-contrast.svg';
export const sprPowerupSlowBallHighContrast = '/assets/visual/powerups/spr-powerup-slow-ball-high-contrast.svg';
export const sprPowerupLaserFanHighContrast = '/assets/visual/powerups/spr-powerup-laser-fan-high-contrast.svg';
export const vfxCountdownCircleHighContrastOverlay = '/assets/visual/vfx/vfx-countdown-circle-high-contrast-overlay.svg';
export const vfxCountdownSparkHighContrastOverlay = '/assets/visual/vfx/vfx-countdown-spark-high-contrast-overlay.svg';
export const vfxLevelUpStarHighContrastOverlay = '/assets/visual/vfx/vfx-level-up-star-high-contrast-overlay.svg';
export const vfxLevelUpTwirlHighContrastOverlay = '/assets/visual/vfx/vfx-level-up-twirl-high-contrast-overlay.svg';
export const vfxGameOverRipHighContrastSmoke = '/assets/visual/vfx/vfx-game-over-rip-high-contrast-smoke.svg';
export const sprBallPlayerSunsetDefault = '/assets/visual/sprites/spr-ball-player-sunset-default.svg';
export const sprPaddlePlayerSunsetDefault = '/assets/visual/sprites/spr-paddle-player-sunset-default.svg';
export const sprBrickBasicRedSunsetNormal = '/assets/visual/bricks/spr-brick-basic-red-sunset-normal.svg';
export const sprBrickBasicBlueSunsetNormal = '/assets/visual/bricks/spr-brick-basic-blue-sunset-normal.svg';
export const sprBrickBasicGreenSunsetNormal = '/assets/visual/bricks/spr-brick-basic-green-sunset-normal.svg';
export const sprBrickBasicYellowSunsetNormal = '/assets/visual/bricks/spr-brick-basic-yellow-sunset-normal.svg';
export const sprBrickBasicPurpleSunsetNormal = '/assets/visual/bricks/spr-brick-basic-purple-sunset-normal.svg';
export const sprPowerupMultiballOrbSunset = '/assets/visual/powerups/spr-powerup-multiball-orb-sunset.svg';
export const sprPowerupWidePaddleSunset = '/assets/visual/powerups/spr-powerup-wide-paddle-sunset.svg';
export const sprPowerupSlowBallSunset = '/assets/visual/powerups/spr-powerup-slow-ball-sunset.svg';
export const sprPowerupLaserFanSunset = '/assets/visual/powerups/spr-powerup-laser-fan-sunset.svg';
export const vfxCountdownCircleSunsetOverlay = '/assets/visual/vfx/vfx-countdown-circle-sunset-overlay.svg';
export const vfxCountdownSparkSunsetOverlay = '/assets/visual/vfx/vfx-countdown-spark-sunset-overlay.svg';
export const vfxLevelUpStarSunsetOverlay = '/assets/visual/vfx/vfx-level-up-star-sunset-overlay.svg';
export const vfxLevelUpTwirlSunsetOverlay = '/assets/visual/vfx/vfx-level-up-twirl-sunset-overlay.svg';
export const vfxGameOverRipSunsetSmoke = '/assets/visual/vfx/vfx-game-over-rip-sunset-smoke.svg';
```

Update `VISUAL_ASSET_PATHS` and `VISUAL_ASSET_CATALOG` with entries for all constants. Dimensions must match the default roles: ball `16x16`, paddle `96x16`, bricks `48x20`, power-ups `24x24`, VFX `180x180`.

- [ ] **Step 4: Implement resolver**

Create `src/utils/visualAssetResolver.ts`:

```ts
// src/utils/visualAssetResolver.ts
import {
  IMAGE_SET_HIGH_CONTRAST,
  IMAGE_SET_RETRO_DEFAULT,
  IMAGE_SET_SUNSET_CABINET,
  type ImageSetId,
} from '../constants/appearance';
import {
  sprBallPlayerDefault,
  sprBallPlayerHighContrastDefault,
  sprBallPlayerSunsetDefault,
  sprBrickBasicBlueHighContrastNormal,
  sprBrickBasicBlueNormal,
  sprBrickBasicBlueSunsetNormal,
  sprBrickBasicGreenHighContrastNormal,
  sprBrickBasicGreenNormal,
  sprBrickBasicGreenSunsetNormal,
  sprBrickBasicPurpleHighContrastNormal,
  sprBrickBasicPurpleNormal,
  sprBrickBasicPurpleSunsetNormal,
  sprBrickBasicRedHighContrastNormal,
  sprBrickBasicRedNormal,
  sprBrickBasicRedSunsetNormal,
  sprBrickBasicYellowHighContrastNormal,
  sprBrickBasicYellowNormal,
  sprBrickBasicYellowSunsetNormal,
  sprPaddlePlayerDefault,
  sprPaddlePlayerHighContrastDefault,
  sprPaddlePlayerSunsetDefault,
  sprPowerupLaserFan,
  sprPowerupLaserFanHighContrast,
  sprPowerupLaserFanSunset,
  sprPowerupMultiballOrb,
  sprPowerupMultiballOrbHighContrast,
  sprPowerupMultiballOrbSunset,
  sprPowerupSlowBall,
  sprPowerupSlowBallHighContrast,
  sprPowerupSlowBallSunset,
  sprPowerupWidePaddle,
  sprPowerupWidePaddleHighContrast,
  sprPowerupWidePaddleSunset,
} from '../constants/visualAssets';

export const GAME_VISUAL_ASSET_ROLES = {
  ball: 'ball',
  paddle: 'paddle',
  brickRed: 'brickRed',
  brickBlue: 'brickBlue',
  brickGreen: 'brickGreen',
  brickYellow: 'brickYellow',
  brickPurple: 'brickPurple',
  powerupMultiball: 'powerupMultiball',
  powerupWidePaddle: 'powerupWidePaddle',
  powerupSlowBall: 'powerupSlowBall',
  powerupLaserFan: 'powerupLaserFan',
} as const;

export type GameVisualAssetRole = (typeof GAME_VISUAL_ASSET_ROLES)[keyof typeof GAME_VISUAL_ASSET_ROLES];

export const GAME_VISUAL_ASSETS_BY_IMAGE_SET = {
  [IMAGE_SET_RETRO_DEFAULT]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: sprBallPlayerDefault,
    [GAME_VISUAL_ASSET_ROLES.paddle]: sprPaddlePlayerDefault,
    [GAME_VISUAL_ASSET_ROLES.brickRed]: sprBrickBasicRedNormal,
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: sprBrickBasicBlueNormal,
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: sprBrickBasicGreenNormal,
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: sprBrickBasicYellowNormal,
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: sprBrickBasicPurpleNormal,
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]: sprPowerupMultiballOrb,
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]: sprPowerupWidePaddle,
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: sprPowerupSlowBall,
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: sprPowerupLaserFan,
  },
  [IMAGE_SET_HIGH_CONTRAST]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: sprBallPlayerHighContrastDefault,
    [GAME_VISUAL_ASSET_ROLES.paddle]: sprPaddlePlayerHighContrastDefault,
    [GAME_VISUAL_ASSET_ROLES.brickRed]: sprBrickBasicRedHighContrastNormal,
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: sprBrickBasicBlueHighContrastNormal,
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: sprBrickBasicGreenHighContrastNormal,
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: sprBrickBasicYellowHighContrastNormal,
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: sprBrickBasicPurpleHighContrastNormal,
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]: sprPowerupMultiballOrbHighContrast,
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]: sprPowerupWidePaddleHighContrast,
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: sprPowerupSlowBallHighContrast,
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: sprPowerupLaserFanHighContrast,
  },
  [IMAGE_SET_SUNSET_CABINET]: {
    [GAME_VISUAL_ASSET_ROLES.ball]: sprBallPlayerSunsetDefault,
    [GAME_VISUAL_ASSET_ROLES.paddle]: sprPaddlePlayerSunsetDefault,
    [GAME_VISUAL_ASSET_ROLES.brickRed]: sprBrickBasicRedSunsetNormal,
    [GAME_VISUAL_ASSET_ROLES.brickBlue]: sprBrickBasicBlueSunsetNormal,
    [GAME_VISUAL_ASSET_ROLES.brickGreen]: sprBrickBasicGreenSunsetNormal,
    [GAME_VISUAL_ASSET_ROLES.brickYellow]: sprBrickBasicYellowSunsetNormal,
    [GAME_VISUAL_ASSET_ROLES.brickPurple]: sprBrickBasicPurpleSunsetNormal,
    [GAME_VISUAL_ASSET_ROLES.powerupMultiball]: sprPowerupMultiballOrbSunset,
    [GAME_VISUAL_ASSET_ROLES.powerupWidePaddle]: sprPowerupWidePaddleSunset,
    [GAME_VISUAL_ASSET_ROLES.powerupSlowBall]: sprPowerupSlowBallSunset,
    [GAME_VISUAL_ASSET_ROLES.powerupLaserFan]: sprPowerupLaserFanSunset,
  },
} as const satisfies Record<ImageSetId, Record<GameVisualAssetRole, string>>;

export function resolveGameVisualAssetPath(imageSetId: ImageSetId, role: GameVisualAssetRole): string {
  return GAME_VISUAL_ASSETS_BY_IMAGE_SET[imageSetId][role];
}

export function getRuntimeVisualAssetPathsForImageSet(imageSetId: ImageSetId): string[] {
  return Object.values(GAME_VISUAL_ASSETS_BY_IMAGE_SET[imageSetId]);
}
```

- [ ] **Step 5: Run resolver tests**

Run:

```bash
npm test -- src/utils/visualAssetResolver.test.ts --runInBand
```

Expected: pass after constants and resolver exist.

- [ ] **Step 6: Commit**

```bash
git add src/constants/visualAssets.ts src/constants/assets.ts src/constants/powerUps.ts src/utils/visualAssetResolver.ts src/utils/visualAssetResolver.test.ts
git commit -m "feat(assets): resolver conjuntos SVG por tema"
```

---

## Task 3: Criar variantes SVG

**Files:**
- Create: `public/assets/visual/sprites/*.svg`
- Create: `public/assets/visual/bricks/*.svg`
- Create: `public/assets/visual/powerups/*.svg`
- Create: `public/assets/visual/vfx/*.svg`
- Modify: `public/sw.js`

- [ ] **Step 1: Duplicate current SVGs as seed files**

Run:

```bash
cp public/assets/visual/sprites/spr-ball-player-default.svg public/assets/visual/sprites/spr-ball-player-high-contrast-default.svg
cp public/assets/visual/sprites/spr-ball-player-default.svg public/assets/visual/sprites/spr-ball-player-sunset-default.svg
cp public/assets/visual/sprites/spr-paddle-player-default.svg public/assets/visual/sprites/spr-paddle-player-high-contrast-default.svg
cp public/assets/visual/sprites/spr-paddle-player-default.svg public/assets/visual/sprites/spr-paddle-player-sunset-default.svg
```

Repeat the same seed-copy pattern for bricks, power-ups and VFX using the exact paths listed in Task 2.

- [ ] **Step 2: Recolor high-contrast SVGs**

Edit each high-contrast SVG so the palette uses:

```txt
Background/transparent: unchanged
Primary cyan: #7df9ff
Text/outline white: #f8f7ff
Reward yellow: #ffd000
Success green: #7cff6b
Danger red: #ff5c7a
Rare purple: #b89cff
```

- [ ] **Step 3: Recolor sunset SVGs**

Edit each sunset SVG so the palette uses:

```txt
Background/transparent: unchanged
Primary orange: #ff8a00
Accent magenta: #ff2bd6
Reward yellow: #ffe45e
Success green: #2cff9a
Danger red: #ff365e
Rare purple: #9b5cff
```

- [ ] **Step 4: Validate every SVG file starts with path comment where applicable**

For SVG files, XML comments are allowed. Each new SVG must start with:

```xml
<!-- public/assets/visual/<group>/<filename>.svg -->
```

Example:

```xml
<!-- public/assets/visual/sprites/spr-ball-player-high-contrast-default.svg -->
```

- [ ] **Step 5: Add all new SVGs to `public/sw.js` precache**

Add each new path to the precache array. No raster path may be added.

- [ ] **Step 6: Run validators**

Run:

```bash
npm run test:asset-naming
npm run test:svg-assets
```

Expected: both pass. If `test:asset-naming` reports a new SVG missing from catalog, update `src/constants/visualAssets.ts` before continuing.

- [ ] **Step 7: Commit**

```bash
git add public/assets/visual public/sw.js src/constants/visualAssets.ts
git commit -m "feat(assets): adicionar variantes SVG de temas"
```

---

## Task 4: Persistência e aplicação de aparência

**Files:**
- Create: `src/hooks/useAppearancePreference.ts`
- Create: `src/hooks/useAppearancePreference.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Write failing hook tests**

Create `src/hooks/useAppearancePreference.test.tsx`:

```tsx
// src/hooks/useAppearancePreference.test.tsx
import { act, renderHook } from '@testing-library/react';

import { useAppearancePreference } from './useAppearancePreference';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-image-set');
  document.documentElement.removeAttribute('data-font-set');
});

describe('useAppearancePreference', () => {
  it('aplica padrão neon/retro/arcade', () => {
    const { result } = renderHook(() => useAppearancePreference());
    expect(result.current.selection).toEqual({ themeId: 'neon-arcade', imageSetId: 'retro-default', fontSetId: 'arcade-ui' });
    expect(document.documentElement.dataset.theme).toBe('neon-arcade');
    expect(document.documentElement.dataset.imageSet).toBe('retro-default');
    expect(document.documentElement.dataset.fontSet).toBe('arcade-ui');
  });

  it('persiste escolhas válidas', () => {
    const { result } = renderHook(() => useAppearancePreference());
    act(() => result.current.selectTheme('pixel-sunset'));
    act(() => result.current.selectImageSet('sunset-cabinet'));
    act(() => result.current.selectFontSet('block-pixel'));

    expect(window.localStorage.getItem('brickbreaker-theme')).toBe('pixel-sunset');
    expect(window.localStorage.getItem('brickbreaker-image-set')).toBe('sunset-cabinet');
    expect(window.localStorage.getItem('brickbreaker-font-set')).toBe('block-pixel');
    expect(document.documentElement.dataset.theme).toBe('pixel-sunset');
    expect(document.documentElement.dataset.imageSet).toBe('sunset-cabinet');
    expect(document.documentElement.dataset.fontSet).toBe('block-pixel');
  });

  it('migra valor antigo escuro', () => {
    window.localStorage.setItem('brickbreaker-theme', 'dark');
    const { result } = renderHook(() => useAppearancePreference());
    expect(result.current.selection.themeId).toBe('neon-arcade');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/hooks/useAppearancePreference.test.tsx --runInBand
```

Expected: missing hook failure.

- [ ] **Step 3: Implement hook**

Create `src/hooks/useAppearancePreference.ts`:

```ts
// src/hooks/useAppearancePreference.ts
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  APPEARANCE_STORAGE_KEYS,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
  resolveAppearanceSelection,
} from '../constants/appearance';

function readStoredValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function readInitialSelection(): AppearanceSelection {
  return resolveAppearanceSelection({
    themeId: readStoredValue(APPEARANCE_STORAGE_KEYS.theme),
    imageSetId: readStoredValue(APPEARANCE_STORAGE_KEYS.imageSet),
    fontSetId: readStoredValue(APPEARANCE_STORAGE_KEYS.fontSet),
  });
}

function applyAppearance(selection: AppearanceSelection) {
  document.documentElement.dataset.theme = selection.themeId;
  document.documentElement.dataset.imageSet = selection.imageSetId;
  document.documentElement.dataset.fontSet = selection.fontSetId;
}

export function useAppearancePreference() {
  const initialSelection = useMemo(readInitialSelection, []);
  const [selection, setSelection] = useState<AppearanceSelection>(initialSelection);

  useEffect(() => {
    applyAppearance(selection);
  }, [selection]);

  const selectTheme = useCallback((themeId: ThemeId) => {
    setSelection((current) => ({ ...current, themeId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.theme, themeId);
  }, []);

  const selectImageSet = useCallback((imageSetId: ImageSetId) => {
    setSelection((current) => ({ ...current, imageSetId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.imageSet, imageSetId);
  }, []);

  const selectFontSet = useCallback((fontSetId: FontSetId) => {
    setSelection((current) => ({ ...current, fontSetId }));
    writeStoredValue(APPEARANCE_STORAGE_KEYS.fontSet, fontSetId);
  }, []);

  return { selection, selectTheme, selectImageSet, selectFontSet };
}
```

- [ ] **Step 4: Add CSS datasets**

Modify `src/styles/index.css` by replacing/augmenting theme selectors:

```css
:root[data-theme="neon-arcade"] {
  color-scheme: dark;
}

:root[data-theme="crt-high-contrast"] {
  color-scheme: dark;
  --bb-color-background: #02040a;
  --bb-color-surface: #0d1625;
  --bb-color-panel: #101b32;
  --bb-color-panel-soft: #17233d;
  --bb-color-text: #f8f7ff;
  --bb-color-muted: #c8d7e8;
  --bb-color-primary: #7df9ff;
  --bb-color-primary-strong: #ffffff;
  --bb-color-secondary: #ffd000;
  --bb-color-tertiary: #b89cff;
  --bb-color-outline: #f8f7ff;
  --bb-color-outline-soft: #7df9ff;
  --bb-color-danger: #ff5c7a;
  --bb-color-danger-strong: #ff9aad;
  --bb-color-board: #02040a;
  --bb-color-on-primary: #02040a;
}

:root[data-theme="pixel-sunset"] {
  color-scheme: dark;
  --bb-color-background: #16071f;
  --bb-color-surface: #2a1038;
  --bb-color-panel: #321247;
  --bb-color-panel-soft: #3c1856;
  --bb-color-text: #fff5f7;
  --bb-color-muted: #ffc4df;
  --bb-color-primary: #ff8a00;
  --bb-color-primary-strong: #ffe45e;
  --bb-color-secondary: #ff2bd6;
  --bb-color-tertiary: #9b5cff;
  --bb-color-outline: #6b2d8d;
  --bb-color-outline-soft: #ff8a00;
  --bb-color-danger: #ff365e;
  --bb-color-danger-strong: #ff7b95;
  --bb-color-board: #100517;
  --bb-color-on-primary: #16071f;
}

:root[data-font-set="crt-mono"] {
  --bb-font-display: ui-monospace, Menlo, Consolas, monospace;
  --bb-font-body: ui-monospace, Menlo, Consolas, monospace;
}

:root[data-font-set="block-pixel"] {
  --bb-font-display: ui-monospace, Menlo, Consolas, monospace;
  --bb-font-body: system-ui, sans-serif;
}
```

- [ ] **Step 5: Wire App**

Modify `src/App.tsx`:

```tsx
import { useAppearancePreference } from './hooks/useAppearancePreference';
```

Replace:

```tsx
const { theme, selectTheme } = useThemePreference();
```

With:

```tsx
const { selection, selectTheme, selectImageSet, selectFontSet } = useAppearancePreference();
```

Pass `selection.imageSetId` to `Game` in the existing `Game` JSX.

- [ ] **Step 6: Run hook and app tests**

Run:

```bash
npm test -- src/hooks/useAppearancePreference.test.tsx src/App.test.tsx --runInBand
```

Expected: pass after App test fixtures are updated for `Aparência`.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useAppearancePreference.ts src/hooks/useAppearancePreference.test.tsx src/App.tsx src/styles/index.css src/App.test.tsx
git commit -m "feat(theme): persistir aparência do jogo"
```

---

## Task 5: Menu de aparência

**Files:**
- Create: `src/components/AppearanceSelector.tsx`
- Create: `src/components/AppearanceSelector.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Write component test**

Create `src/components/AppearanceSelector.test.tsx`:

```tsx
// src/components/AppearanceSelector.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppearanceSelector } from './AppearanceSelector';

const INITIAL_SELECTION = {
  themeId: 'neon-arcade',
  imageSetId: 'retro-default',
  fontSetId: 'arcade-ui',
} as const;

describe('AppearanceSelector', () => {
  it('mostra escolhas de aparência com texto de usuário', async () => {
    const onThemeChange = jest.fn();
    const onImageSetChange = jest.fn();
    const onFontSetChange = jest.fn();

    render(
      <AppearanceSelector
        selection={INITIAL_SELECTION}
        onThemeChange={onThemeChange}
        onImageSetChange={onImageSetChange}
        onFontSetChange={onFontSetChange}
      />,
    );

    expect(screen.getByText('Tema visual')).toBeInTheDocument();
    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByText('Fonte')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pixel Sunset' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cabine Sunset' }));
    await userEvent.click(screen.getByRole('button', { name: 'Blocos pixel' }));

    expect(onThemeChange).toHaveBeenCalledWith('pixel-sunset');
    expect(onImageSetChange).toHaveBeenCalledWith('sunset-cabinet');
    expect(onFontSetChange).toHaveBeenCalledWith('block-pixel');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/AppearanceSelector.test.tsx --runInBand
```

Expected: missing component failure.

- [ ] **Step 3: Implement component**

Create `src/components/AppearanceSelector.tsx`:

```tsx
// src/components/AppearanceSelector.tsx
import {
  FONT_SET_OPTIONS,
  IMAGE_SET_OPTIONS,
  THEME_OPTIONS,
  type AppearanceOption,
  type AppearanceSelection,
  type FontSetId,
  type ImageSetId,
  type ThemeId,
} from '../constants/appearance';

interface AppearanceSelectorProps {
  selection: AppearanceSelection;
  onThemeChange: (themeId: ThemeId) => void;
  onImageSetChange: (imageSetId: ImageSetId) => void;
  onFontSetChange: (fontSetId: FontSetId) => void;
}

interface AppearanceOptionGroupProps<T extends string> {
  title: string;
  options: readonly AppearanceOption<T>[];
  selectedId: T;
  onChange: (id: T) => void;
}

function AppearanceOptionGroup<T extends string>({ title, options, selectedId, onChange }: AppearanceOptionGroupProps<T>) {
  return (
    <div className="appearance-selector__group">
      <h4>{title}</h4>
      <div className="appearance-selector__options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`appearance-selector__button ${selectedId === option.id ? 'appearance-selector__button--active' : ''}`}
            aria-pressed={selectedId === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AppearanceSelector({ selection, onThemeChange, onImageSetChange, onFontSetChange }: AppearanceSelectorProps) {
  return (
    <div className="appearance-selector" aria-label="Aparência do jogo">
      <AppearanceOptionGroup title="Tema visual" options={THEME_OPTIONS} selectedId={selection.themeId} onChange={onThemeChange} />
      <AppearanceOptionGroup title="Imagens" options={IMAGE_SET_OPTIONS} selectedId={selection.imageSetId} onChange={onImageSetChange} />
      <AppearanceOptionGroup title="Fonte" options={FONT_SET_OPTIONS} selectedId={selection.fontSetId} onChange={onFontSetChange} />
    </div>
  );
}
```

- [ ] **Step 4: Replace menu section**

In `src/App.tsx`, replace:

```tsx
<div className="settings-drawer__section">
  <h3>Tema</h3>
  <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
</div>
```

With:

```tsx
<div className="settings-drawer__section">
  <h3>Aparência</h3>
  <AppearanceSelector
    selection={selection}
    onThemeChange={selectTheme}
    onImageSetChange={selectImageSet}
    onFontSetChange={selectFontSet}
  />
</div>
```

- [ ] **Step 5: Add CSS**

Add to `src/styles/index.css`:

```css
.appearance-selector {
  display: grid;
  gap: 16px;
}

.appearance-selector__group {
  display: grid;
  gap: 8px;
}

.appearance-selector__group h4 {
  margin: 0;
  color: var(--bb-color-muted);
  font-size: var(--bb-font-size-caption);
  font-family: var(--bb-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.appearance-selector__options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.appearance-selector__button {
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--bb-color-outline) 34%, transparent);
  color: var(--bb-color-text);
  background: color-mix(in srgb, var(--bb-color-surface) 82%, transparent);
  font: inherit;
  cursor: pointer;
}

.appearance-selector__button--active {
  color: var(--bb-color-on-primary);
  background: var(--bb-color-primary);
  border-color: var(--bb-color-primary-strong);
  box-shadow: var(--bb-shadow-accent);
}

.appearance-selector__button:focus-visible {
  outline: 2px solid var(--bb-color-primary-strong);
  outline-offset: 2px;
}
```

- [ ] **Step 6: Run menu tests**

Run:

```bash
npm test -- src/components/AppearanceSelector.test.tsx src/App.test.tsx --runInBand
```

Expected: pass after App test assertions are updated to expect `Aparência`, `Tema visual`, `Imagens`, `Fonte`, and no `Claro`/`Escuro` requirement unless kept as migrated labels elsewhere.

- [ ] **Step 7: Commit**

```bash
git add src/components/AppearanceSelector.tsx src/components/AppearanceSelector.test.tsx src/App.tsx src/styles/index.css src/App.test.tsx
git commit -m "feat(ui): adicionar seletor de aparência"
```

---

## Task 6: Troca de imagens sem resetar jogo

**Files:**
- Modify: `src/components/Game.tsx`
- Modify: `src/hooks/useGameLoop.ts`
- Modify: `src/logic/GameEngine.ts`
- Modify: `src/objects/Ball.ts`
- Modify: `src/objects/Paddle.ts`
- Modify: `src/objects/Bricks.ts`
- Modify: `src/objects/PowerUp.ts`
- Modify: tests for affected files

- [ ] **Step 1: Add tests that image-set changes do not restart `GameEngine`**

Update `src/components/Game.test.tsx` or `src/hooks/useGameLoop` test coverage to assert that changing `imageSetId` calls a setter on the current engine instead of constructing a new engine.

Expected test shape:

```ts
expect(mockGameEngineConstructor).toHaveBeenCalledTimes(1);
rerender(<Game {...props} imageSetId="high-contrast" />);
expect(mockGameEngineConstructor).toHaveBeenCalledTimes(1);
expect(mockSetImageSet).toHaveBeenCalledWith('high-contrast');
```

- [ ] **Step 2: Add `imageSetId` prop to `Game`**

In `src/components/Game.tsx`, add:

```ts
import type { ImageSetId } from '../constants/appearance';
```

Add prop:

```ts
imageSetId: ImageSetId;
```

Pass to hook:

```ts
useGameLoop(..., startBlocked, imageSetId);
```

- [ ] **Step 3: Add `imageSetId` sync to `useGameLoop`**

Add parameter after `startBlocked`:

```ts
imageSetId: ImageSetId
```

Add effect:

```ts
useEffect(() => {
  engineRef.current?.setImageSet(imageSetId);
}, [imageSetId]);
```

Do not add `imageSetId` to the engine-construction effect dependency list. This prevents score/engine reset when the user changes only the visual set.

- [ ] **Step 4: Add setter in `GameEngine`**

Add field:

```ts
private imageSetId: ImageSetId;
```

Constructor receives `imageSetId` and stores it.

Add method:

```ts
public setImageSet(imageSetId: ImageSetId) {
  if (this.imageSetId === imageSetId) return;
  this.imageSetId = imageSetId;
  void AssetLoader.preloadImageSet(imageSetId);
}
```

- [ ] **Step 5: Update object draw calls**

Objects must resolve by role and current image set. If object constructors do not receive `imageSetId`, pass a resolver function from `GameEngine`:

```ts
private resolveAssetPath = (role: GameVisualAssetRole) => resolveGameVisualAssetPath(this.imageSetId, role);
```

Then use:

```ts
const ballImage = AssetLoader.getImage(this.resolveAssetPath(GAME_VISUAL_ASSET_ROLES.ball));
```

Apply equivalent calls for paddle, bricks and power-ups.

- [ ] **Step 6: Extend `AssetLoader`**

Add:

```ts
static async preloadImageSet(imageSetId: ImageSetId): Promise<void> {
  const paths = getRuntimeVisualAssetPathsForImageSet(imageSetId);
  await Promise.allSettled(paths.map((path) => this.preloadImage(path)));
}
```

Update `preloadAllAssets` to call the default image-set path list or accept an optional `imageSetId`.

- [ ] **Step 7: Run targeted tests**

Run:

```bash
npm test -- src/components/Game.test.tsx src/logic/GameEngine.test.ts src/objects/Ball.test.ts src/objects/PowerUp.test.ts --runInBand
```

Expected: pass; changing image set must not create `restart_game`, `game_start` or a new engine.

- [ ] **Step 8: Commit**

```bash
git add src/components/Game.tsx src/hooks/useGameLoop.ts src/logic/GameEngine.ts src/objects/Ball.ts src/objects/Paddle.ts src/objects/Bricks.ts src/objects/PowerUp.ts src/utils/assetLoader.ts src/**/*.test.ts
git commit -m "feat(game): trocar conjunto SVG sem reiniciar partida"
```

---

## Task 7: QA, documentação e Cloudflare

**Files:**
- Modify: `src/constants/assetNaming.test.ts`
- Modify: `scripts/validate-svg-assets.mjs`
- Modify: `tests/e2e/cloudflare-theme-qa.js`
- Modify: `tests/e2e/cloudflare-svg-assets-qa.js`
- Modify: `docs/rup/02-design/retro-asset-system.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Enforce SVG-only in naming test**

In `src/constants/assetNaming.test.ts`, set visual regex to:

```ts
const VISUAL_ASSET_PATTERN = /^(spr|ui|vfx)-[a-z0-9]+(-[a-z0-9]+)*\.svg$/;
```

Add assertion:

```ts
expect(entry.path.endsWith('.svg')).toBe(true);
```

- [ ] **Step 2: Update Cloudflare theme QA**

In `tests/e2e/cloudflare-theme-qa.js`, replace legacy `Claro`/`Escuro` expectations with:

```js
assert(state.bodyText.includes('Aparência'), `${viewportName}: seção Aparência ausente.`);
assert(state.bodyText.includes('Tema visual'), `${viewportName}: Tema visual ausente.`);
assert(state.bodyText.includes('Imagens'), `${viewportName}: Imagens ausente.`);
assert(state.bodyText.includes('Fonte'), `${viewportName}: Fonte ausente.`);
assert(state.buttons.some((button) => button.text === 'Neon Arcade'), `${viewportName}: Neon Arcade ausente.`);
assert(state.buttons.some((button) => button.text === 'CRT alto contraste'), `${viewportName}: CRT alto contraste ausente.`);
assert(state.buttons.some((button) => button.text === 'Pixel Sunset'), `${viewportName}: Pixel Sunset ausente.`);
```

Add localStorage assertions for:

```js
brickbreaker-theme
brickbreaker-image-set
brickbreaker-font-set
```

- [ ] **Step 3: Update Cloudflare SVG QA**

Extend `EXPECTED_SVG_PATHS` with every new SVG created in Task 3. Keep `FORBIDDEN_RUNTIME_RASTER` unchanged and make the test fail on any raster request.

- [ ] **Step 4: Update documentation**

In `docs/rup/02-design/retro-asset-system.md`, add a section:

```md
## 12. Temas e conjuntos SVG

| Campo | Função | Storage key | Valores iniciais |
| --- | --- | --- | --- |
| `themeId` | Cores e superfícies | `brickbreaker-theme` | `neon-arcade`, `crt-high-contrast`, `pixel-sunset` |
| `imageSetId` | Sprites/UI/VFX SVG | `brickbreaker-image-set` | `retro-default`, `high-contrast`, `sunset-cabinet` |
| `fontSetId` | Tipografia local via CSS tokens | `brickbreaker-font-set` | `arcade-ui`, `crt-mono`, `block-pixel` |

Regra: todo asset visual runtime de tema deve ser SVG. PNG, JPG, WebP e GIF ficam proibidos para novos temas sem autorização explícita.
```

- [ ] **Step 5: Update CHANGELOG**

Add under the current top unreleased section:

```md
- Sistema de aparência planejado/implementado com seleção de tema visual, conjunto de imagens SVG e fonte no menu.
- Novos conjuntos `high-contrast` e `sunset-cabinet` mantêm assets visuais em SVG local e precache offline.
```

- [ ] **Step 6: Run local verification**

Run:

```bash
node --version
npm run test:asset-naming
npm run test:svg-assets
npm test -- --runInBand
npm run build
```

Expected: all pass on Node v23.

- [ ] **Step 7: Deploy preview and run published QA**

Run official zero-cost flow:

```bash
make cloudflare-env-check
make cloudflare-build
make cloudflare-deploy
BRICKBREAKER_PUBLIC_URL=<preview-url> make cloudflare-theme-qa
BRICKBREAKER_PUBLIC_URL=<preview-url> make cloudflare-svg-assets-qa
BRICKBREAKER_PUBLIC_URL=<preview-url> make cloudflare-mobile-qa
BRICKBREAKER_PUBLIC_URL=<preview-url> make cloudflare-no-score-reset
```

Expected: every QA command exits `0`, screenshots/receipts are generated under `tmp/`, and no external/raster runtime requests appear.

- [ ] **Step 8: Add PR visual evidence**

Copy relevant published QA screenshots to:

```txt
docs/assets/issues/svg-theme-system/evidence/
```

Use centered clickable screenshot HTML in the PR body, following the repository evidence policy.

- [ ] **Step 9: Commit final docs/QA update**

```bash
git add src/constants/assetNaming.test.ts scripts/validate-svg-assets.mjs tests/e2e/cloudflare-theme-qa.js tests/e2e/cloudflare-svg-assets-qa.js docs/rup/02-design/retro-asset-system.md CHANGELOG.md docs/assets/issues/svg-theme-system/evidence
git commit -m "test(theme): validar aparência SVG publicada"
```

---

## Validation checklist before PR

- [ ] `node --version` starts with `v23.`.
- [ ] `make help` succeeds.
- [ ] No raster assets are added for visual theme runtime.
- [ ] Every new SVG has semantic unique basename, 12–64 chars.
- [ ] Every new SVG is in `VISUAL_ASSET_CATALOG`.
- [ ] Every runtime SVG is in `public/sw.js` precache.
- [ ] Menu shows user copy: `Aparência`, `Tema visual`, `Imagens`, `Fonte`.
- [ ] UI does not show internal words like `SVG`, `asset`, `token`, `cache`, `runtime`, `dataset`, `localStorage`, `service worker`.
- [ ] Changing `imageSetId` does not create a new `GameEngine` and does not reset score.
- [ ] Published Cloudflare QA passes against preview URL.
- [ ] PR includes SVG/theme visual evidence and JSON receipts.

## Execution choice

Plan complete. Recommended execution path: **Subagent-Driven**, one fresh worker per task, with review after each task. Inline execution is possible but riskier because this crosses constants, UI, canvas rendering, service worker and published QA.
