<!-- docs/rup/04-testes-e-validacao/README.md -->
# Fase 04 — Testes e Validação

> Base: [./README.md](./README.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Arquitetura da extensão](../01-arquitetura/arquitetura-da-extensao-spec.md) · [Fluxos operacionais](../02-design/fluxos-spec.md) · [Qualidade e Métricas](../04-qualidade-testes/qualidade-e-metricas-spec.md)

## Objetivo
Consolidar as diretrizes de validação do **App — CLImate INvestment**, assegurando que cada requisito funcional, técnico e colaborativo seja homologado com rastreabilidade completa. A fase conecta arquitetura, design e governança, garantindo que os cenários contemplados reflitam as jornadas descritas em `fluxos-spec.md` e os controles cooperativos documentados na capacidade de diagnóstico colaborativo. 【F:docs/rup/02-design/fluxos-spec.md†L1-L120】【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L1-L120】

## Documentos disponíveis
- [`estrategia-geral.md`](estrategia-geral-spec.md) — descreve camadas, ambientes, ferramentas e evidências para validação contínua. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- [`criterios-de-aceitacao.md`](criterios-de-aceitacao-spec.md) — consolida critérios funcionais, não funcionais, de segurança e operacionais necessários para liberar releases. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- [`testes-end-to-end.md`](testes-end-to-end-spec.md) — lista cenários críticos ponta a ponta cobrindo onboarding, marketplace, liquidação e governança. **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- [`testes-seguranca-e2e.md`](testes-seguranca-e2e-spec.md) — amplia os E2E com ataques simulados e verificação de logs. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- [`validacao-de-marcos.md`](validacao-de-marcos-spec.md) — relaciona marcos e checkpoints obrigatórios antes de cada release. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- [`resumo-validacao-seguranca.md`](resumo-validacao-seguranca-spec.md) — sintetiza evidências e métricas da capacidade de segurança. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- [`resumo-validacao-multiplas-capacidades.md`](resumo-validacao-multiplas-capacidades-spec.md) — consolida resultados de todas as capacidades auditadas, inclusive colaboração humano+IA. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001) a [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a [REQ-035](../02-planejamento/requisitos-spec.md#req-035).

## Como manter sincronizado
- Atualize o documento base (`*.md`) e a versão evolutiva (`*-spec.md`) sempre em conjunto, citando o `REQ-###` correspondente e registrando a alteração no changelog e na `audit-history.md`. 【F:docs/rup/02-planejamento/requisitos-spec.md†L27-L200】【F:docs/rup/audit-history.md†L1-L80】
- Garanta que evidências de testes estejam em `docs/reports/` com vínculo ao PR e aos dashboards previstos em `capacidade-diagnostico-colaborativo-spec.md`. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md†L31-L104】【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】
- Sempre valide consistência com `../04-qualidade-testes/` para manter indicadores, métricas e critérios alinhados às metas de sustentabilidade e compliance.

## Integração colaborativa
As validações desta fase alimentam diretamente a fila colaborativa (`CollabReviewBoard`) e os indicadores de SLA humano vs. IA, garantindo que bloqueios de crédito, liquidação ou relatórios só sejam liberados após aprovação conjunta. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L70-L176】

[Voltar ao índice da documentação](../README-spec.md)
