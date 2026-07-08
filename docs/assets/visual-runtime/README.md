<!-- docs/assets/visual-runtime/README.md -->
# Política visual runtime — SVG-first

Brikaya usa SVG como fonte autoral e como runtime padrão enquanto o asset continua simples. O objetivo é preservar edição vetorial, baixo acoplamento, cache offline e renderização previsível sem criar variantes raster prematuras.

## Decisão padrão

1. **Fonte autoral:** SVG local versionado.
2. **Runtime padrão:** SVG local/offline em `public/assets/visual/**`.
3. **Exceção atlas:** PNG/WebP somente em `public/assets/visual/atlases/`, registrado em `atlas-exceptions.json`, com SVG fonte preservado e evidência de necessidade.
4. **Exceção cinemática:** AVIF somente em `public/assets/visual/cinematics/`, para fundo/cena/cinemática não usada como sprite ou atlas de gameplay.
5. **Nunca padrão de sprite:** AVIF não é formato padrão para sprites, power-ups, tijolos, UI ou VFX desenhados a 60 FPS.

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
- Referência a `/assets/visual/...avif` em código de sprites, power-ups, tijolos, UI ou VFX de gameplay.
