---
description: Planejar assets visuais do Brikaya pela política SVG-first
---

Use a skill `svg-first-visual-planning` para planejar ou revisar qualquer asset visual do Brikaya (sprite, UI, VFX, power-up, conversão SVG→atlas, profiling de render).

Antes de implementar, o plano deve declarar: **formato fonte** (caminho SVG versionado), **formato runtime** (SVG / atlas PNG / atlas WebP / cinemática AVIF), **motivo técnico** (`heavy-animation` / `many-draws` / `profiled-faster` / `cinematic-background`) e **evidência** (`docs/assets/issues/<issue>/evidence/`).

Regras: SVG é fonte e runtime padrão; atlas PNG/WebP só em `public/assets/visual/atlases/` com exceção em `docs/assets/visual-runtime/atlas-exceptions.json`; AVIF só em `public/assets/visual/cinematics/`. Validar com `npm run test:visual-asset-policy` e `npm run test:svg-assets`.
