# Automação: brikaya-pr-auto-merge

Monitorar PRs abertos em `Malnati/brikaya` e mergear automaticamente quando seguro.

## Trigger

- Cron a cada 20 minutos
- Escopo: repositório `Malnati/brikaya`

## Escopo de atuação

- PRs com label `brikaya-agent`
- PRs explicitamente pedidos para merge na sessão
- Ignorar PRs com checks vermelhos ou fora do repositório Brikaya

## Fluxo

1. Listar PRs abertos com `codex-gh-admin pr list --repo Malnati/brikaya`.
2. Para cada PR elegível com checks verdes, executar `npm run brikaya:merge-pr <numero>`.
3. Resolver conflitos automaticamente; parar apenas em conflito semanticamente inseguro.
4. Usar `codex-gh-admin pr merge --squash --delete-branch` ou `gh pr merge --admin` como fallback.

## Restrições

- Não pedir permissão humana para merge após CI verde.
- Não imprimir tokens ou segredos.
- Preservar trabalho humano sujo no checkout local.

## Substitui

- Automação Codex pausada de merge documental-only (manter pausada).
