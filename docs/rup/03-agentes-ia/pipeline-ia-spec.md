<!-- docs/rup/03-agentes-ia/pipeline-ia.md -->
# Pipeline de IA

> Base: [./pipeline-ia.md](./pipeline-ia.md)
> Rastreabilidade: [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023), [REQ-031](../02-planejamento/requisitos-spec.md#req-031)
> Legados correlatos: [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035)

O pipeline automatizado coordena como os agentes atuam do planejamento à auditoria. A sequência abaixo adapta o fluxo do Yagnostic para as jornadas do App, destacando pontos onde decisões humanas precisam coexistir com a IA.

1. **Planejamento e preparação** — `Scope Corrector` coleta requisitos ativos, roadmap e riscos, vinculando-os aos legados equivalentes para garantir rastreabilidade (ex.: [REQ-001](../02-planejamento/requisitos-spec.md#req-001) ↔ [REQ-001](../02-planejamento/requisitos-spec.md#req-001)).
2. **Geração assistida** — `Codex Builder` produz código, documentação e scripts baseados nos prompts aprovados, registrando o `run_id` e anexando evidências a `docs/reports/agents/`, conforme [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
3. **Revisões automáticas** — `Codex Reviewer` e `Architecture Corrector` verificam segurança, arquitetura, LGPD e integrações Open Finance, citando [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e [REQ-019](../02-planejamento/requisitos-spec.md#req-019); divergências são encaminhadas ao fluxo colaborativo inspirado nos legados [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-025](../02-planejamento/requisitos-spec.md#req-025).
4. **Validação colaborativa** — `E2E Test Agent` executa suites e gera relatórios; quando a cobertura envolve checkpoints humanos, o pipeline cria `collaboration_ticket_id` e aguarda aprovação de especialistas ([REQ-031](../02-planejamento/requisitos-spec.md#req-031)).
5. **Auditoria e publicação** — `Audit Agent` consolida logs, métricas ESG e decisões humanas em `docs/reports/audit-history.md`, referenciando [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023). O pipeline registra no changelog a associação com os legados correspondentes.

Qualquer alteração na sequência deve ser refletida também em `../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md`, garantindo alinhamento entre RUP e governança operacional.

[Voltar à seção de agentes](README-spec.md)
