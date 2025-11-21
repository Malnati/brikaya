<!-- docs/checklists/009-governanca-tecnica-checklist.md -->
# Checklist de Governança Técnica e Controle de Qualidade

## Auditoria e Rastreabilidade
- [ ] Confirmar que auditorias automáticas geram relatórios diários/mensais conforme `audit-history.md` e `validation-report.md`.
- [ ] Garantir que `docs/reports/YYYYMMDD/qa-report-{branch}-{short-sha}.md` seja produzido para cada execução relevante.
- [ ] Verificar que planos de auditoria seguem estrutura padrão (`*-audit.md`) e estão pareados com os planos principais.
- [ ] Checar que pipelines de revisão com IA (`revisoes-com-ia.md`) permanecem sincronizados com escopos, triggers e outputs esperados.

## Controles de Qualidade
- [ ] Validar métricas obrigatórias: acessibilidade sem violações críticas, performance (Lighthouse ≥ limites), cobertura de testes mantida ou ampliada.
- [ ] Confirmar medição e registro da regra cromática 60-30-10 e demais critérios de branding.
- [ ] Garantir que novos componentes/funcionalidades passam por revisão manual obrigatória conforme critérios definidos.

## Políticas de Aprovação
- [ ] Checar que commits e PRs citam IDs de requisitos (`REQ-###`) e riscos (`RISK-###`) quando aplicável.
- [ ] Confirmar que falhas em testes E2E críticos, regressões de performance >10%, violações WCAG AA ou vulnerabilidades altas bloqueiam aprovação.
- [ ] Verificar que dependências externas atualizadas têm avaliação de segurança e registro em governança.

## Responsabilidade Técnica e Relatórios
- [ ] Garantir que responsáveis técnicos listados em `governanca-tecnica.md` permanecem atualizados.
- [ ] Validar que tabelas de relatórios automatizados estão sincronizadas com pipelines configurados.
- [ ] Checar que decisões e exceções são registradas nos relatórios oficiais com referência cruzada a requisitos e riscos.
