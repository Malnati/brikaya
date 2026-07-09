<!-- docs/assets/visual-runtime/README.md -->
# Política visual runtime — SVG-first

Brikaya usa SVG como fonte autoral e como runtime padrão enquanto o asset continua simples. O objetivo é preservar edição vetorial, baixo acoplamento, cache offline e renderização previsível sem criar variantes raster prematuras.

Origem da decisão: estudo registrado em `codex-session.md` na raiz do repositório (registro histórico local).

## Estudo de qualidade gráfica

| Caso de uso | Formato recomendado | Motivo |
|---|---|---|
| Imagem estática aprovada | PNG-32 em atlas; WebP lossless se bytes pesarem | Alfa sem perda; decode previsível no Canvas |
| Animações aprovadas | Spritesheet/atlas + JSON (PNG-32 ou WebP lossless) | Padrão 2D: batching, cache, timing |
| Texto parametrizável | Canvas/DOM nativo; bitmap/SDF/MSDF só para volume alto | Evita explosão de variantes por idioma e acessibilidade |
| Cinemática longa não interativa | WebM VP9/AV1 ou MP4 fallback | Melhor que atlas para sequências longas |

SVG-first é adequado para Brikaya hoje: assets simples, loader via `HTMLImageElement` + `drawImage`. Mercado 2D usa atlases; SVG domina UI/ícones web.

## Decisão padrão

1. **Fonte autoral:** SVG local versionado.
2. **Runtime padrão:** SVG local/offline em `public/assets/visual/**`.
3. **Exceção atlas:** PNG/WebP somente em `public/assets/visual/atlases/`, registrado em `atlas-exceptions.json`, com SVG fonte preservado e evidência de necessidade.
4. **Exceção cinemática:** AVIF somente em `public/assets/visual/cinematics/`, para fundo/cena/cinemática não usada como sprite ou atlas de gameplay.
5. **Nunca padrão de sprite:** AVIF não é formato padrão para sprites, power-ups, componentes, UI ou VFX desenhados a 60 FPS.

## Quando converter SVG para atlas PNG/WebP

Use atlas apenas quando pelo menos uma condição estiver comprovada:

- animação pesada com mais de 8 frames;
- muitos desenhos por frame, acima de 100 draws/frame;
- profiling mostra melhora de p95 frame time no candidato atlas;
- necessidade de empacotar frames aprovados mantendo o SVG fonte como origem.

A exceção deve conter `id`, `kind`, `runtimePaths`, `sourceSvgPaths`, `reason` e `evidencePath` em `docs/assets/visual-runtime/atlas-exceptions.json`.

## Exemplos aceitos

- `public/assets/visual/atlases/atlas-powerups-wave.webp` com `reason: "profiled-faster"`, SVGs de origem em `sourceSvgPaths` e relatório em `evidencePath`.
- `public/assets/visual/cinematics/cinematic-rip-background.avif` com `reason: "cinematic-background"`, sem uso como sprite/atlas.

## Exemplos rejeitados

- Sprite pequeno convertido para AVIF.
- PNG/WebP em `public/assets/visual/sprites/` sem exceção.
- Atlas PNG/WebP sem SVG fonte preservado.
- Referência a `/assets/visual/...avif` em código de sprites, power-ups, componentes, UI ou VFX de gameplay.

## Pré-requisitos antes da primeira exceção atlas

Quando `atlas-exceptions.json` deixar de estar vazio, estender também:

- `scripts/generate-runtime-asset-manifest.mjs` — indexar PNG/WebP/AVIF governados
- `src/constants/assets.test.ts` — permitir paths de exceção no catálogo
- `tests/e2e/cloudflare-svg-assets-qa.js` — reconhecer raster governado
- `src/utils/visualAssetResolver.ts` — carregar atlas/cinemática registrados
