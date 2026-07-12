# Tags de versão (`.tags/`)

Cada deploy de produção publica uma tag Git `vN` com conteúdo versionado neste diretório.

## Convenção

- Arquivo: `vN.md` (ex.: `v147.md`)
- Nome da tag: igual ao nome do arquivo sem `.md`
- Formato: frontmatter YAML + corpo Markdown

```markdown
---
tag: v147
title: Brikaya v147
---

Mensagem curta da anotação da tag.
```

## Fluxo

1. Estime `N` do commit que será deployado (`git rev-list --count HEAD` no SHA alvo).
2. Crie `.tags/vN.md` e o par correspondente em [`.releases/`](../.releases/).
3. Helper: `npm run brikaya:scaffold-version-docs`
4. O workflow de produção consome este arquivo ao publicar a tag.
