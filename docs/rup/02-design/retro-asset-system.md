<!-- docs/rup/02-design/retro-asset-system.md -->
# Especificação Técnica — BrickBreaker Retro/Pixel Arcade Assets

## 1. Escopo implementado

| Item | Regra |
| --- | --- |
| Escopo runtime | Apenas imagens, ícones, VFX e áudios exibidos/usados pelo jogo, HUD, menus e overlays. |
| SVG-only visual | Toda imagem visual runtime deve ser SVG local/offline; raster é proibido em `public/assets/visual/`. |
| Fora de escopo | Evidências, screenshots técnicos, imagens de issues/PRs fora de `public/assets/visual/` e áudio. |
| Offline | Todo asset runtime deve existir em `public/` e ser listado no precache do service worker. |
| Paridade | O stem do arquivo físico é o ID único e deve converter exatamente para a constante camelCase. |
| Exclusividade | Nenhum basename runtime pode repetir no catálogo nem no disco. |
| Tamanho do ID | 12 a 64 caracteres. |

## 2. Convenção global de nomenclatura

| Tipo | Prefixo | Diretório runtime | Regex de arquivo | Exemplo arquivo | Exemplo constante |
| --- | --- | --- | --- | --- | --- |
| Sprite de jogo | `spr-` | `public/assets/visual/sprites/` | `^(spr)-[a-z0-9]+(-[a-z0-9]+)*\.svg$` | `spr-paddle-player-default.svg` | `sprPaddlePlayerDefault` |
| Brick | `spr-` | `public/assets/visual/bricks/` | `^(spr)-[a-z0-9]+(-[a-z0-9]+)*\.svg$` | `spr-brick-basic-red-normal.svg` | `sprBrickBasicRedNormal` |
| Power-up | `spr-` | `public/assets/visual/powerups/` | `^(spr)-[a-z0-9]+(-[a-z0-9]+)*\.svg$` | `spr-powerup-wide-paddle.svg` | `sprPowerupWidePaddle` |
| UI/ícone | `ui-` | `public/assets/visual/ui/` | `^(ui)-[a-z0-9]+(-[a-z0-9]+)*\.svg$` | `ui-pwa-app-icon.svg` | `uiPwaAppIcon` |
| VFX | `vfx-` | `public/assets/visual/vfx/` | `^(vfx)-[a-z0-9]+(-[a-z0-9]+)*\.svg$` | `vfx-level-up-star-overlay.svg` | `vfxLevelUpStarOverlay` |
| SFX | `sfx-` | `public/assets/audio/` | `^(sfx)-[a-z0-9]+(-[a-z0-9]+)*-[0-9]{2}\.(mp3\|ogg)$` | `sfx-paddle-hit-center-01.mp3` | `sfxPaddleHitCenter01` |
| BGM | `bgm-` | `public/assets/audio/` | `^(bgm)-[a-z0-9]+(-[a-z0-9]+)*-[0-9]{2}\.(mp3\|ogg)$` | `bgm-gameplay-loop-main-01.mp3` | `bgmGameplayLoopMain01` |
| Cor | `clr-` | Código/CSS | `^(clr)-[a-z0-9]+(-[a-z0-9]+)*$` | `clr-neon-cyan-primary` | `clrNeonCyanPrimary` |
| Tipografia | `typ-` | CSS/fonte local futura | `^(typ)-[a-z0-9]+(-[a-z0-9]+)*$` | `typ-arcade-score-pixel` | `typArcadeScorePixel` |

## 2.1 Regra SVG-only para imagens

| Item | Regra |
| --- | --- |
| Runtime visual | Usar somente `.svg` em `public/assets/visual/**`. |
| Artefatos Codex | Planejamento visual em `docs/assets/theme-planning/**` deve usar somente `.svg`. |
| Conteúdo SVG | Proibido `<script>`, `<image>`, `data:`, URL externa e raster embutido. |
| Referências runtime | `src/`, `public/sw.js`, `public/manifest.webmanifest` e `index.html` não podem apontar para PNG, JPG, JPEG, WebP, GIF ou ICO. |
| Exceções | Screenshots/evidências de QA e issues/PRs podem usar PNG fora dos diretórios acima. Áudio segue regras próprias. |
| Bloqueio | `npm run test:svg-assets` e `npm run build` devem falhar quando a regra for violada. |


## 3. Função normativa de conversão

| Entrada kebab-case | Saída camelCase |
| --- | --- |
| `spr-paddle-player-default` | `sprPaddlePlayerDefault` |
| `vfx-brick-red-destroy-sparks` | `vfxBrickRedDestroySparks` |
| `sfx-paddle-hit-center-01` | `sfxPaddleHitCenter01` |
| `bgm-gameplay-loop-main-01` | `bgmGameplayLoopMain01` |

## 4. Catálogo visual runtime atual

| ID único | Arquivo físico | Constante | Dimensão | Aspect ratio | Estado | Uso |
| --- | --- | --- | ---: | ---: | --- | --- |
| `spr-ball-player-default` | `public/assets/visual/sprites/spr-ball-player-default.svg` | `sprBallPlayerDefault` | 16x16 | 1:1 | normal | Esfera principal |
| `spr-paddle-player-default` | `public/assets/visual/sprites/spr-paddle-player-default.svg` | `sprPaddlePlayerDefault` | 96x16 | 6:1 | normal | Raquete padrão |
| `spr-brick-basic-red-normal` | `public/assets/visual/bricks/spr-brick-basic-red-normal.svg` | `sprBrickBasicRedNormal` | 48x20 | 12:5 | normal | Brick vermelho |
| `spr-brick-basic-blue-normal` | `public/assets/visual/bricks/spr-brick-basic-blue-normal.svg` | `sprBrickBasicBlueNormal` | 48x20 | 12:5 | normal | Brick azul |
| `spr-brick-basic-green-normal` | `public/assets/visual/bricks/spr-brick-basic-green-normal.svg` | `sprBrickBasicGreenNormal` | 48x20 | 12:5 | normal | Brick verde |
| `spr-brick-basic-yellow-normal` | `public/assets/visual/bricks/spr-brick-basic-yellow-normal.svg` | `sprBrickBasicYellowNormal` | 48x20 | 12:5 | normal | Brick amarelo |
| `spr-brick-basic-purple-normal` | `public/assets/visual/bricks/spr-brick-basic-purple-normal.svg` | `sprBrickBasicPurpleNormal` | 48x20 | 12:5 | normal | Brick roxo |
| `spr-powerup-multiball-orb` | `public/assets/visual/powerups/spr-powerup-multiball-orb.svg` | `sprPowerupMultiballOrb` | 24x24 | 1:1 | coletável | Duplica esferas |
| `spr-powerup-wide-paddle` | `public/assets/visual/powerups/spr-powerup-wide-paddle.svg` | `sprPowerupWidePaddle` | 24x24 | 1:1 | coletável | Amplia paddle |
| `spr-powerup-slow-ball` | `public/assets/visual/powerups/spr-powerup-slow-ball.svg` | `sprPowerupSlowBall` | 24x24 | 1:1 | coletável | Reduz velocidade |
| `spr-powerup-laser-fan` | `public/assets/visual/powerups/spr-powerup-laser-fan.svg` | `sprPowerupLaserFan` | 24x24 | 1:1 | coletável | Elimina múltiplos bricks |
| `vfx-countdown-circle-overlay` | `public/assets/visual/vfx/vfx-countdown-circle-overlay.svg` | `vfxCountdownCircleOverlay` | 180x180 | 1:1 | overlay | Contagem inicial |
| `vfx-countdown-spark-overlay` | `public/assets/visual/vfx/vfx-countdown-spark-overlay.svg` | `vfxCountdownSparkOverlay` | 180x180 | 1:1 | overlay | Faísca da contagem inicial |
| `vfx-level-up-star-overlay` | `public/assets/visual/vfx/vfx-level-up-star-overlay.svg` | `vfxLevelUpStarOverlay` | 180x180 | 1:1 | overlay | Fase concluída |
| `vfx-level-up-twirl-overlay` | `public/assets/visual/vfx/vfx-level-up-twirl-overlay.svg` | `vfxLevelUpTwirlOverlay` | 180x180 | 1:1 | overlay | Fase concluída |
| `vfx-game-over-rip-smoke` | `public/assets/visual/vfx/vfx-game-over-rip-smoke.svg` | `vfxGameOverRipSmoke` | 180x180 | 1:1 | overlay | Fim de jogo |
| `ui-app-browser-favicon` | `public/assets/visual/ui/ui-app-browser-favicon.svg` | `uiAppBrowserFavicon` | 32x32 | 1:1 | normal | Favicon |
| `ui-pwa-app-icon` | `public/assets/visual/ui/ui-pwa-app-icon.svg` | `uiPwaAppIcon` | 512x512 | 1:1 | normal | Ícone PWA |

## 5. Estados futuros reservados para sprites

| Grupo | Estado obrigatório quando adicionado | Padrão de ID | Observação |
| --- | --- | --- | --- |
| Paddle | `default`, `hit`, `wide`, `damaged` | `spr-paddle-player-{state}` | Só adicionar arquivo quando o estado existir em tela. |
| Bola | `default`, `fast`, `slow`, `ghost` | `spr-ball-player-{state}` | `ghost` deve representar transição curta/spawn. |
| Brick básico | `normal`, `damaged` | `spr-brick-basic-{color}-{state}` | Destruição deve preferir VFX, não sprite invisível persistente. |
| Brick reforçado | `normal`, `damaged` | `spr-brick-{strength}-{color}-{state}` | `strength` deve ser semântico: `strong`, `heavy`, `steel`. |
| Power-up | `collectible` | `spr-powerup-{effect}` | Nome deve descrever efeito, não letra abreviada. |
| VFX de impacto | `sheet`, `overlay`, `sparks`, `flash` | `vfx-{subject}-{event}-{kind}` | Spritesheet deve declarar frames e duração no catálogo. |

## 6. Paleta neon/arcade

| ID | CSS var | Tailwind token | HEX | Aplicação semântica |
| --- | --- | --- | --- | --- |
| `clr-arcade-bg-void` | `--bb-clr-arcade-bg-void` | `arcade.bgVoid` | `#080816` | Fundo principal |
| `clr-arcade-surface-panel` | `--bb-clr-arcade-surface-panel` | `arcade.surfacePanel` | `#12122a` | Painéis HUD/menu |
| `clr-neon-cyan-primary` | `--bb-clr-neon-cyan-primary` | `neon.cyanPrimary` | `#00e5ff` | CTA, foco e esfera |
| `clr-neon-magenta-accent` | `--bb-clr-neon-magenta-accent` | `neon.magentaAccent` | `#ff2bd6` | Destaque raro |
| `clr-neon-yellow-reward` | `--bb-clr-neon-yellow-reward` | `neon.yellowReward` | `#ffe45e` | Score/recompensa |
| `clr-neon-green-success` | `--bb-clr-neon-green-success` | `neon.greenSuccess` | `#39ff88` | Power-up positivo |
| `clr-neon-red-danger` | `--bb-clr-neon-red-danger` | `neon.redDanger` | `#ff3b5f` | Dano/perda |
| `clr-neon-purple-rare` | `--bb-clr-neon-purple-rare` | `neon.purpleRare` | `#9b5cff` | Power-up raro |
| `clr-text-main-light` | `--bb-clr-text-main-light` | `text.mainLight` | `#f8f7ff` | Texto principal |
| `clr-text-muted-blue` | `--bb-clr-text-muted-blue` | `text.mutedBlue` | `#9cb7d8` | Texto auxiliar |
| `clr-outline-grid-blue` | `--bb-clr-outline-grid-blue` | `outline.gridBlue` | `#244c7a` | Bordas/grid |

### 6.1 Regra 60-30-10

| Grupo | Cores | Uso |
| --- | --- | --- |
| 60% base | `clr-arcade-bg-void`, `clr-arcade-surface-panel` | Fundo e estrutura |
| 30% suporte | `clr-outline-grid-blue`, `clr-text-muted-blue`, bricks | HUD, cards e divisórias |
| 10% accent | Ciano, magenta, amarelo, verde, vermelho | CTA, reward, VFX, foco e alerta |

## 7. Tipografia

| Token | CSS var | Desktop | Mobile | Peso | Uso | Fallback seguro |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `typ-arcade-headline` | `--bb-font-size-headline` | 32px | 28px | 700 | Títulos e Game Over | `ui-monospace, Menlo, Consolas, monospace` |
| `typ-arcade-subtitle` | `--bb-font-size-subtitle` | 24px | 20px | 600 | Score, fase, combo | `ui-monospace, Menlo, Consolas, monospace` |
| `typ-arcade-body` | `--bb-font-size-body` | 16px | 16px | 400 | Menu e botões | `system-ui, sans-serif` |
| `typ-arcade-caption` | `--bb-font-size-caption` | 12px | 12px | 400 | Legendas e versão | `ui-monospace, monospace` |

## 8. Regras de VFX e partículas

| Regra | Valor |
| --- | --- |
| Duração curta | 120ms a 300ms |
| Duração overlay | 800ms a 1800ms |
| Loop | Apenas BGM/ambiente; VFX de impacto não deve loopar. |
| Reduced motion | Trocar spritesheet por frame estático ou reduzir animação CSS. |
| Centro do playfield | Nunca cobrir por mais de 1800ms. |
| Partículas mobile | Máximo de 48 simultâneas. |
| Estado destruído de brick | Usar VFX/spritesheet em vez de sprite persistente invisível. |

## 9. Catálogo sonoro runtime

| ID evento | Arquivos | Tipo | Trigger | Volume | Loop |
| --- | ---: | --- | --- | ---: | --- |
| `bgm-menu-loop-main` | 1 | music | Menu inicial/pausa futura | 0.28 | sim |
| `bgm-gameplay-loop-main` | 1 | music | Partida ativa | 0.32 | sim |
| `bgm-gameplay-intense-layer` | 1 | music | Fases altas/velocidade alta | 0.18 | sim |
| `sfx-game-start` | 2 | effect | Início/reinício humano | 0.72 | não |
| `sfx-paddle-hit-center` | 4 | effect | Bola no centro da raquete | 0.62 | não |
| `sfx-paddle-hit-edge` | 4 | effect | Bola na borda da raquete | 0.68 | não |
| `sfx-wall-hit` | 5 | effect | Parede lateral | 0.48 | não |
| `sfx-ceiling-hit` | 4 | effect | Teto | 0.00 | não |
| `sfx-brick-hit` | 5 | effect | Brick recebe impacto | 0.64 | não |
| `sfx-brick-break-red` | 3 | effect | Brick vermelho destruído | 0.00 | não |
| `sfx-brick-break-blue` | 3 | effect | Brick azul destruído | 0.00 | não |
| `sfx-brick-break-green` | 3 | effect | Brick verde destruído | 0.00 | não |
| `sfx-brick-break-yellow` | 3 | effect | Brick amarelo destruído | 0.00 | não |
| `sfx-brick-break-purple` | 3 | effect | Brick roxo destruído | 0.00 | não |
| `sfx-score-tick` | 3 | effect | Incremento de score | 0.24 | não |
| `sfx-combo-small` | 2 | effect | Combo curto | 0.44 | não |
| `sfx-combo-large` | 2 | effect | Combo alto | 0.58 | não |
| `sfx-ball-lost` | 2 | effect | Bola perdida | 0.66 | não |
| `sfx-game-over` | 1 | effect | Fim de jogo | 0.78 | não |
| `sfx-level-complete` | 2 | effect | Fase concluída | 0.82 | não |
| `sfx-level-toast-in` | 2 | ui | Toast de fase | 0.58 | não |
| `sfx-level-start` | 2 | effect | Início de fase | 0.70 | não |
| `sfx-restart` | 2 | ui | Reiniciar/Jogar de novo | 0.52 | não |
| `sfx-reset-score` | 1 | ui | Zerar pontuação | 0.48 | não |
| `sfx-button-press` | 4 | ui | Botão/menu | 0.36 | não |
| `sfx-panel-open` | 2 | ui | Abrir painel | 0.30 | não |
| `sfx-panel-close` | 2 | ui | Fechar painel | 0.28 | não |
| `sfx-theme-toggle` | 2 | ui | Alternar tema | 0.34 | não |
| `sfx-ad-placeholder-none` | 0 | future | Placeholder offline silencioso | 0.00 | não |
| `sfx-powerup-spawn` | 3 | effect | Power-up aparece | 0.58 | não |
| `sfx-powerup-collect` | 3 | effect | Power-up coletado | 0.72 | não |
| `sfx-powerup-activate-multiball` | 2 | effect | Ativar multiball | 0.74 | não |
| `sfx-powerup-activate-wide-paddle` | 2 | effect | Ativar paddle amplo | 0.68 | não |
| `sfx-powerup-activate-slow-ball` | 2 | effect | Ativar bola lenta | 0.60 | não |
| `sfx-powerup-activate-laser-fan` | 1 | effect | Ativar laser em leque | 0.82 | não |
| `sfx-powerup-expire` | 2 | effect | Power-up expira | 0.50 | não |
| `sfx-highscore-new` | 2 | effect | Novo recorde | 0.78 | não |
| `sfx-offline-ready` | 1 | system | App pronto offline | 0.32 | não |
| `sfx-error-soft` | 2 | system | Erro leve/ação bloqueada | 0.42 | não |

### 9.1 Mixagem

| Canal | Volume base | Ducking |
| --- | ---: | --- |
| BGM | 0.28 a 0.32 | Reduzir durante conclusão de fase/fim de jogo. |
| SFX impacto | 0.48 a 0.68 | Sem ducking global. |
| SFX reward | 0.70 a 0.82 | Reduz BGM durante recompensa. |
| UI | 0.28 a 0.52 | Sem ducking global. |
| Erro/perda | 0.42 a 0.78 | Reduz BGM por janela curta. |

## 10. Contratos TDD-first

| Teste/validador | Deve validar |
| --- | --- |
| `src/constants/assetNaming.test.ts` | Regex, 12-64 chars, basename único, paridade kebab/camel e cobertura disco/código. |
| `npm run test:asset-naming` | Catálogos visuais/áudio, existência física e precache. |
| `npm run test:svg-assets` | SVG local, `viewBox`, ausência de script, raster embutido, data URI, URL externa, raster runtime e artefato Codex visual fora de SVG. |
| `npm run test:cinematic-media-assets` | VFX de overlay existem, são locais e entram no service worker. |
| `npm run test:audio-assets` | Catálogo sonoro, arquivos MP3, duração, SHA, licença e precache. |
| `npm test -- --runInBand` | Regressão unitária completa. |
| `npm run build` | SVG-only guard, TypeScript, Vite build e carimbo do service worker. |

## 11. Critérios de aceite para novos assets

| Critério | Regra |
| --- | --- |
| Nome físico | Kebab-case, prefixo obrigatório, sem acento/espaço/caractere especial e extensão `.svg` para visual runtime. |
| Constante | camelCase derivada exatamente do stem. |
| Catálogo | Adicionar em `src/constants/visualAssets.ts` ou `src/constants/audio.ts`. |
| Service worker | Adicionar no precache runtime. |
| Documento | Atualizar esta especificação quando o asset criar novo grupo/estado. |
| Testes | Rodar `test:asset-naming`, validador específico e build. |

## 12. Temas e conjuntos SVG

| Campo | Função | Storage key | Valores iniciais |
| --- | --- | --- | --- |
| `themeId` | Cores e superfícies | `brickbreaker-theme` | `neon-arcade`, `crt-high-contrast`, `pixel-sunset` |
| `imageSetId` | Sprites, UI e VFX SVG | `brickbreaker-image-set` | `retro-default`, `high-contrast`, `sunset-cabinet` |
| `fontSetId` | Tipografia local via CSS tokens | `brickbreaker-font-set` | `arcade-ui`, `crt-mono`, `block-pixel` |

Regra: todo asset visual runtime de tema deve ser SVG local/offline. PNG, JPG, WebP e GIF ficam proibidos para novos temas sem autorização explícita.

| Conjunto humano | `themeId` | `imageSetId` | `fontSetId` | Uso |
| --- | --- | --- | --- | --- |
| Neon Arcade | `neon-arcade` | `retro-default` | `arcade-ui` | Padrão recomendado. |
| CRT alto contraste | `crt-high-contrast` | `high-contrast` | `crt-mono` | Acessibilidade e leitura forte. |
| Pixel Sunset | `pixel-sunset` | `sunset-cabinet` | `block-pixel` | Alternativa cromática sem mudar mecânica. |
