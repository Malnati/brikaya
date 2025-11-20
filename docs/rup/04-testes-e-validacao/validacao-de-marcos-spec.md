<!-- docs/rup/04-testes-e-validacao/validacao-de-marcos.md -->
# Validação de Marcos

> Base: [./validacao-de-marcos.md](./validacao-de-marcos.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Testes E2E](./testes-end-to-end-spec.md) · [Testes de segurança](./testes-seguranca-e2e-spec.md) · [Capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

## Objetivo
Estabelecer checkpoints formais de validação alinhados aos marcos do roadmap, garantindo que cada entrega conte com evidências funcionais, de segurança e de colaboração antes da transição para a próxima fase. 【F:docs/rup/02-planejamento/roadmap-spec.md†L40-L120】

## Tabela de marcos
| Marco | Escopo validado | Evidências necessárias | Requisitos | Status |
| --- | --- | --- | --- | --- |
| **M1 — Cooperativa Zero** | Onboarding multicanal, checklist colaborativo e certificação inicial. | Cenários 1 e 2 de `testes-end-to-end-spec.md` executados em DEV, relatórios anexados em `docs/reports/`. 【F:docs/rup/04-testes-e-validacao/testes-end-to-end-spec.md†L33-L60】 | REQ-001 · REQ-002 · REQ-031 | ✅ Aprovado |
| **M2 — Marketplace Piloto** | Publicação de lotes, negociação e contratação logística. | Cenários 3 e 4 aprovados em DEV/HML, logs de split arquivados e checklist colaborativo preenchido. 【F:docs/rup/04-testes-e-validacao/testes-end-to-end-spec.md†L61-L78】 | REQ-003 · REQ-004 · REQ-008 · REQ-009 | ✅ Aprovado |
| **M3 — Piloto Regulatório** | Relatórios ESG, auditorias de segurança e integrações governamentais. | Execução dos testes de segurança `E2E-SEC-002` e `E2E-SEC-003`, envio de relatórios à sandbox BACEN/MMA e registro no audit log. 【F:docs/rup/04-testes-e-validacao/testes-seguranca-e2e-spec.md†L39-L77】 | REQ-006 · REQ-009 · REQ-023 · REQ-040 | ⚙️ Em andamento |
| **M4 — Lançamento Controlado** | Operação colaborativa com SLA monitorado, dashboards públicos atualizados. | Execução completa dos cenários 5 e 6, métricas comparativas humano vs. IA anexadas, revisão conjunta com times de risco. 【F:docs/rup/04-testes-e-validacao/testes-end-to-end-spec.md†L79-L95】 | REQ-006 · REQ-034 · REQ-041 · REQ-037 | ⏳ Pendente |

## Procedimento de atualização
1. Registrar o resultado no changelog e na `audit-history.md`, anexando links para evidências. 【F:docs/rup/audit-history.md†L1-L80】
2. Atualizar dashboards colaborativos com as métricas do marco e informar stakeholders listados em `stakeholders-spec.md`. 【F:docs/rup/00-visao/stakeholders-spec.md†L1-L40】
3. Revisitar `criterios-de-aceitacao-spec.md` e `qualidade-e-metricas-spec.md` para incluir ajustes decorrentes do marco.

[Voltar aos Testes](./README-spec.md)
