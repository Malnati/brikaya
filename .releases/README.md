# Releases GitHub (`.releases/`)

Cada deploy de produção publica uma GitHub Release `vN` com notas versionadas neste diretório.

## Convenção

- Arquivo: `vN.md` (ex.: `v147.md`)
- Nome da release: igual ao nome do arquivo sem `.md`
- Formato: frontmatter YAML + corpo Markdown

```markdown
---
release: v147
title: Brikaya v147 — Título da release
prerelease: false
---

## Destaque

- ...
```

## Fluxo

1. Estime `N` do commit que será deployado.
2. Crie `.releases/vN.md` e o par correspondente em [`.tags/`](../.tags/).
3. Helper: `npm run brikaya:scaffold-version-docs`
4. O workflow de produção consome este arquivo ao publicar a release.
