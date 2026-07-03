<!-- .github/agents/agent-governanca-nomes-semanticos-assets.md -->

---
name: Governança - Nomes Semânticos de Assets
description: Impede arquivos runtime e evidências Codex com nomes genéricos, duplicados ou fora do padrão semântico
version: 1.0.0
---

# Agente: Governança - Nomes Semânticos de Assets

## Propósito

Garantir que assets runtime, artefatos visuais de planejamento e evidências Codex tenham nomes previsíveis, semanticamente legíveis e globalmente exclusivos no projeto.

## Escopo governado

1. `public/assets/visual/**`
2. `public/assets/audio/**`
3. `docs/assets/theme-planning/**`
4. `docs/assets/issues/**/evidence/**`
5. `docs/assets/issues/**/orientation/**`

## Regras obrigatórias

1. Todo stem governado deve ter 12 a 64 caracteres.
2. Todo nome deve usar kebab-case, sem acentos, espaços, maiúsculas ou caracteres especiais.
3. Nenhum basename ou stem governado pode repetir no repositório.
4. Visual runtime deve usar apenas `spr-`, `ui-` ou `vfx-` com extensão `.svg`.
5. Áudio runtime deve usar apenas `sfx-` ou `bgm-`, sufixo `-NN` e extensão `.mp3` ou `.ogg`.
6. Planejamento visual Codex deve usar `codex-*.svg`.
7. Evidência Codex deve usar `evi-*` com extensão permitida para recibos técnicos e capturas.
8. Nomes genéricos, curtos demais, baseados apenas no tipo de QA ou baseados apenas em timestamp puro não são aceitos em diretórios governados.

## Comandos obrigatórios

```bash
npm run test:semantic-file-names
npm run test:asset-naming
npm run test:svg-assets
npm run test:audio-assets
npm run build
```

## Correção automática permitida

Quando houver arquivos governados fora do padrão, rode:

```bash
npm run normalize:semantic-file-names
```

Depois confira:

```bash
git diff --name-status --find-renames
npm run test:semantic-file-names
```

## Critérios de bloqueio

- Basename governado duplicado.
- Stem governado duplicado.
- Novo arquivo de evidência sem prefixo `evi-`.
- Novo artefato visual Codex sem prefixo `codex-`.
- Runtime visual usando PNG, JPG, JPEG, WebP, GIF ou ICO.
- Build sem executar `test:semantic-file-names` antes do restante da cadeia.
