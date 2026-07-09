---
name: svg-first-visual-planning
description: >-
  Planejar e implementar assets visuais do Brikaya seguindo a política
  SVG-first. Use ao criar planos visuais, novos sprites, conversões SVG→atlas,
  animações ou profiling de render.
---

# SVG-first — planejamento visual Brikaya

## Quando usar

- Novo asset visual (sprite, UI, VFX, bloco, power-up)
- Conversão SVG → atlas PNG/WebP
- Avaliação de performance de render
- Revisão de formato (AVIF, WebP, PNG, SVG)

## Política ideal

```
SVG-first authoring
  → SVG runtime enquanto simples
  → atlas PNG/WebP com exceção documentada
```

**AVIF nunca** como padrão de sprites/UI/componentes/VFX a 60 FPS. AVIF só para fundo/cena/cinemática em `public/assets/visual/cinematics/`.

## Checklist obrigatório no plano

Antes de implementar, declare:

| Campo | Exemplo |
|---|---|
| Formato fonte | `public/assets/visual/sprites/spr-ball-player-default.svg` |
| Formato runtime | SVG / atlas PNG / atlas WebP / cinemática AVIF |
| Motivo | `heavy-animation` / `many-draws` / `profiled-faster` / `cinematic-background` |
| Evidência | `docs/assets/issues/<issue>/evidence/evi-*.json` |

## Limiares para exceção atlas

- Animação > 8 frames
- > 100 draws/frame
- Profiling com p95 frame time menor no candidato atlas

Registrar exceção em `docs/assets/visual-runtime/atlas-exceptions.json`.

## Validação antes de concluir

```bash
npm run test:visual-asset-policy
npm run test:svg-assets
npm run test:semantic-file-names
```

## Referências

- [docs/assets/visual-runtime/README.md](../../docs/assets/visual-runtime/README.md)
- [docs/superpowers/plans/2026-07-07-svg-first-asset-policy.md](../../docs/superpowers/plans/2026-07-07-svg-first-asset-policy.md)
