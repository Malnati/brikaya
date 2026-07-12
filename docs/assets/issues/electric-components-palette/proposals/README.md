# Paleta de componentes elétricos — aceite e integração

Documento unificado para aceite dos componentes elétricos/circuito exibidos no Brikaya, com nomes semânticos em disco e preview visual.

## Como visualizar

Abra no navegador:

[`preview.html`](./preview.html)

Parâmetros opcionais para raios ambiente (via jogo): `?lightning=pulse|arcade|storm`

Manifesto machine-readable: [`palette-manifest.json`](./palette-manifest.json)

## Inventário — blocos de circuito (49 SVGs)

| Cor / role | Forma elétrica | Nome base em disco |
|---|---|---|
| Vermelho | Indutor quadrado | `spr-component-basic-red-normal.svg` |
| Azul | Transistor | `spr-component-basic-blue-normal.svg` |
| Verde | Chip | `spr-component-basic-green-normal.svg` |
| Amarelo | Nó de energia vermelho (forma LED) | `spr-component-basic-yellow-normal.svg` |
| Roxo | Capacitor com arestas de energia roxa em loop | `spr-component-basic-purple-normal.svg` |
| Metal | Módulo blindado | `spr-component-metal-steel-normal.svg` |
| Metal dentado (1) | Arestas de energia amarela (forma blindada) | `spr-component-metal-steel-dented-one.svg` |
| Metal dentado (2) | Nó de energia verde (forma blindada) | `spr-component-metal-steel-dented-two.svg` |

Variantes por image set: `high-contrast`, `sunset`, `{metro\|garage\|lab\|temple\|orbital}-real`.

## Inventário — VFX e sprites elétricos

| Componente | Nome em disco | Runtime |
|---|---|---|
| Bola de energia | `spr-ball-player-default.svg` | Canvas procedural (SVG fonte) |
| Faísca countdown | `vfx-countdown-spark-*-overlay.svg` (8 variantes) | SVG + CSS |
| Raio ambiente Pulse | `vfx-ambient-electric-lightning-pulse-backdrop.svg` | Canvas procedural |
| Raio ambiente Arcade | `vfx-ambient-electric-lightning-arcade-backdrop.svg` | Canvas procedural |
| Raio ambiente Storm | `vfx-ambient-electric-lightning-storm-backdrop.svg` | Canvas procedural |
| Impacto em bloco | `vfx-electric-impact-component-burst.svg` | Canvas procedural |
| Impacto parede lateral | `vfx-electric-impact-wall-burst.svg` | Canvas procedural |
| Impacto teto | `vfx-electric-impact-ceiling-burst.svg` | Canvas procedural |
| Impacto parede radial | `vfx-electric-impact-radial-wall-burst.svg` | Canvas procedural |

Rascunhos de autoría: [`authoring/codex-*.svg`](./authoring/)

## Tokens cromáticos elétricos

| Token | Valor |
|---|---|
| Core | `#eefdff` / `rgba(238,253,255,0.92)` |
| Halo | `rgba(66,224,255,0.34)` |
| Sombra | `rgba(77,232,255,0.88)` |
| Esfera fallback | `#7df9ff` |

## Decisão de formato (VFX novos)

| Campo | Valor |
|---|---|
| Formato fonte | SVG estático em `public/assets/visual/vfx/vfx-*.svg` |
| Formato runtime | Canvas 2D procedural |
| Motivo | `heavy-animation` + `many-draws` |
| Evidência | `docs/assets/issues/electric-components-palette/evidence/` |

## Aceite

- [x] Família basic (5 cores × 8 image sets)
- [x] Família metal-steel (3 estados × variantes)
- [x] `spr-ball-player-default` (bola de energia)
- [x] `vfx-countdown-spark-*` (8 variantes)
- [x] `vfx-ambient-electric-lightning-{pulse\|arcade\|storm}-backdrop`
- [x] `vfx-electric-impact-{component\|wall\|ceiling\|radial-wall}-burst`
- [x] Variante ambiente padrão: **Arcade**
- [x] Paleta cromática unificada

## Implementação runtime

- Raios ambiente: `src/logic/rendering/ambientElectricBackground.ts`
- Renderer compartilhado: `src/logic/rendering/electricLightningRenderer.ts`
- Impactos elétricos (DRY): `src/logic/rendering/electricImpactRenderer.ts`
- Componentes animados (`*-normal` autorizados): `src/logic/rendering/electricComponentEnergyRenderer.ts`, `electricComponentEdgeRenderer.ts`, `electricEnergyBallRenderer.ts`
- Integração de blocos: `src/objects/Components.ts` (`drawComponent` → preset procedural ou SVG estático)
- Integração: `GameEngine.drawGameBackdrop()` + `?lightning=pulse|arcade|storm`
- Catálogo: `src/constants/visualAssets.ts` + `GAME_VISUAL_ASSET_ROLES`
