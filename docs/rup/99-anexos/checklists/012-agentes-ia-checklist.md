<!-- docs/checklists/012-agentes-ia-checklist.md -->
# Checklist de Agentes de IA e Pipelines Automatizados

## Catálogo de Agentes
- [ ] Validar que a lista de agentes (Builder, Reviewer, Scope Corrector, Architecture Corrector, E2E Test Agent, Audit Agent) está atualizada com versão, modelo e status.
- [ ] Garantir que alterações em agentes são refletidas em `docs/rup/03-agentes-ia/` e no `AGENTS.md` raiz.

## Políticas e Regras
- [ ] Confirmar que políticas de execução de agentes respeitam limites éticos (LGPD, políticas de IA aprovadas) e não acessam dados de produção.
- [ ] Verificar que fluxos com IA incluem checkpoints humanos quando exigidos e registram decisões.
- [ ] Garantir que exclusões ou movimentações de artefatos requerem atualização de referências em `docs/rup/` e `docs/reports/`.

## Pipelines de IA
- [ ] Checar que `pipeline-ia.md` documenta triggers, inputs, outputs e mecanismos de auditoria para cada pipeline automatizado.
- [ ] Validar que logs e artefatos gerados por agentes são anexados aos PRs correspondentes.
- [ ] Confirmar que scripts de bootstrap do MCP GitHub são executados e monitorados quando integrações exigem suporte remoto.
