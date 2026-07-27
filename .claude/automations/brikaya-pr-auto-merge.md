# Automação: brikaya-pr-auto-merge

Monitorar PRs abertos no repositório Brikaya e mergear automaticamente quando seguro. Paridade documental com `.cursor/automations/brikaya-pr-auto-merge.md` (o disparo real fica a cargo do usuário/scheduler).

## Trigger

- Cron a cada 20 minutos
- Escopo: repositório Brikaya (owner do remote configurado no Git)

## Escopo de atuação

- PRs com label `brikaya-agent`
- PRs explicitamente pedidos para merge na sessão
- Ignorar PRs com checks vermelhos ou fora do repositório Brikaya

## Fluxo

1. Listar PRs abertos elegíveis no repositório Brikaya via wrapper `codex-gh-admin`.
2. Para cada PR elegível com checks verdes, executar `npm run brikaya:merge-pr <numero>`.
3. Resolver conflitos automaticamente; parar apenas em conflito semanticamente inseguro.
4. Seguir `.cursor/rules/brikaya-pr-merge.mdc` e o template `/Users/mal/.codex/templates/github-admin-conflict-resolution.md`.

## Restrições

- Não pedir permissão humana para merge após CI verde (política do repositório).
- Não imprimir tokens ou segredos.
- Preservar trabalho humano sujo no checkout local.
