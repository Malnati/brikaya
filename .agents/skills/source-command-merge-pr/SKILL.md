---
name: "source-command-merge-pr"
description: "Merge de PR do Brikaya após CI verde"
---

# source-command-merge-pr

Use this skill when the user asks to run the migrated source command `merge-pr`.

## Command Template

Fazer o merge do PR do Brikaya seguindo o fluxo canônico já definido no projeto. Se um número de PR for informado como argumento, use-o; caso contrário, opere sobre o PR da branch atual.

Passos:

1. Rodar `git status --short` antes de qualquer checkout, para preservar trabalho humano sujo local.
2. Confirmar que o check `ci` está verde. Não prosseguir com checks vermelhos.
3. Rodar `npm run brikaya:merge-pr` (acrescentar o número do PR quando informado). O script encapsula a rota de admin, o squash/delete-branch e o push pós-rebase.
4. Para a política completa de merge e resolução de conflitos, seguir `.cursor/rules/brikaya-pr-merge.mdc` e o template `/Users/mal/.codex/templates/github-admin-conflict-resolution.md`. Parar apenas em conflito semanticamente inseguro.

Nunca imprimir tokens ou segredos.
