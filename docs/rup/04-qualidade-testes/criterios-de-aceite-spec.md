<!-- docs/rup/04-qualidade-testes/criterios-de-aceite.md -->
# Critérios de Aceite (histórico)

> Base: [./criterios-de-aceite.md](./criterios-de-aceite.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Critérios de aceitação](../04-testes-e-validacao/criterios-de-aceitacao-spec.md) · [Testes E2E](../04-testes-e-validacao/testes-end-to-end-spec.md)

Este arquivo registra critérios herdados e direciona para a especificação vigente. Utilize-o quando precisar contextualizar mudanças históricas ou comparar versões do plano de testes. Os critérios atuais devem sempre ser mantidos em `../04-testes-e-validacao/criterios-de-aceitacao-spec.md`. 【F:docs/rup/04-testes-e-validacao/criterios-de-aceitacao-spec.md†L1-L160】

## Critérios legados
- **Onboarding e compliance** — aprovação conjunta das personas de risco antes do acesso ao marketplace, com logs auditáveis. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
- **Tokenização de lotes** — evidências completas de certificação (dados, fotos, sensores) e emissão de tokens rastreáveis. **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-005](../02-planejamento/requisitos-spec.md#req-005).
- **Liquidação financeira** — split automático registrado no ledger, comprovantes distribuídos e logs de auditoria preservados. **Requisitos:** [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- **Dashboards e relatórios ESG** — indicadores atualizados, exportações regulatórias e microcopy orientada à ação. 【F:landing/src/pages/Home.tsx†L33-L120】 **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Integração colaborativa
Os critérios acima permanecem válidos para rastrear decisões antigas e alinhar métricas com o painel colaborativo (`REQ-031` a `REQ-035`). Ao revalidar qualquer requisito, sincronize este histórico com a versão espec e documente a decisão em `audit-history.md`. 【F:docs/rup/audit-history.md†L1-L80】

[Voltar ao arquivo de Qualidade](./README-spec.md)
