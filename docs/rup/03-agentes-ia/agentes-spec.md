<!-- docs/rup/03-agentes-ia/agentes.md -->
# Agentes de IA

> Base: [./agentes.md](./agentes.md)
> Rastreabilidade: [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023), [REQ-031](../02-planejamento/requisitos-spec.md#req-031)
> Legados correlatos: [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035)

Os agentes abaixo suportam o ciclo de vida do App e precisam ser mantidos em sincronia com a tabela oficial de `AGENTS.md`. Cada entrada deve indicar modelo, versão, responsáveis humanos e requisitos monitorados, mantendo o vínculo com o legado diagnóstico para auditoria.

| Agente | Função climática | Requisitos atuais | Legados equivalentes |
| --- | --- | --- | --- |
| **Codex Builder** | Geração de código, documentação e contratos de APIs verdes para `apps/*` e `services/*`. | [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-022](../02-planejamento/requisitos-spec.md#req-022) | [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-007](../02-planejamento/requisitos-spec.md#req-007) |
| **Codex Reviewer** | Revisão técnica, segurança e aderência regulatória em PRs. | [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-024](../02-planejamento/requisitos-spec.md#req-024) | [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-028](../02-planejamento/requisitos-spec.md#req-028) |
| **Scope Corrector** | Verificação de escopo frente ao roadmap socioambiental e à matriz de riscos. | [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003) | [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-015](../02-planejamento/requisitos-spec.md#req-015) |
| **Architecture Corrector** | Validação de arquitetura, integrações Open Finance e compliance climático. | [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-045](../02-planejamento/requisitos-spec.md#req-045) | [REQ-011](../02-planejamento/requisitos-spec.md#req-011)–[REQ-020](../02-planejamento/requisitos-spec.md#req-020) |
| **E2E Test Agent** | Geração e execução de cenários automatizados para onboarding, marketplace e liquidação. | [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-008](../02-planejamento/requisitos-spec.md#req-008) | [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-010](../02-planejamento/requisitos-spec.md#req-010) |
| **Audit Agent** | Consolidação de evidências ESG/BACEN, relatórios e checkpoints colaborativos. | [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-023](../02-planejamento/requisitos-spec.md#req-023) | [REQ-034](../02-planejamento/requisitos-spec.md#req-034), [REQ-029](../02-planejamento/requisitos-spec.md#req-029) |

## Responsabilidades operacionais
- Atualizar `AGENTS.md` a cada alteração de modelo, prompt ou owner, referenciando os requisitos afetados.
- Registrar execuções no formato `docs/reports/agents/{agente}-{timestamp}.md`, com campos `run_id`, `commit`, `req_ids`, `legados`. 
- Encaminhar falhas ou desvios para o fluxo colaborativo descrito em [`capacidade-diagnostico-colaborativo-spec.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md), garantindo aprovação humana para decisões sensíveis.

[Voltar ao índice](README-spec.md)
