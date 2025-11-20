<!-- docs/rup/03-implementacao/testes.md -->
# Estratégia de Testes na Implementação

> Base: [./testes.md](./testes.md)
> Rastreabilidade: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-022](../02-planejamento/requisitos-spec.md#req-022)
> Legados correlatos: [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-030](../02-planejamento/requisitos-spec.md#req-030)
> Referências complementares: [04-Testes e Validação](../04-testes-e-validacao/README-spec.md) · [Capacidade Colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) · [Governança Técnica](../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md)

Esta estratégia orienta como instrumentar testes unitários, integração e automatizações para os módulos do App. Os casos foram reescritos com foco nas jornadas financeiras verdes, mas preservam ligações com o legado Yagnostic para garantir rastreabilidade comparativa.

---

## Escopo principal
- **Onboarding e KYC verde** — fluxos `services/onboarding` e `apps/portal-web` precisam validar documentos, consentimentos e revisões humanas, atendendo [REQ-001](../02-planejamento/requisitos-spec.md#req-001) e [REQ-031](../02-planejamento/requisitos-spec.md#req-031); utilize como referência histórica os casos de [REQ-001](../02-planejamento/requisitos-spec.md#req-001) e [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
- **Marketplace e logística** — testes cobrem cadastro de lotes, matching e rotas colaborativas ([REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-004](../02-planejamento/requisitos-spec.md#req-004)), herdando lições de [REQ-003](../02-planejamento/requisitos-spec.md#req-003)–[REQ-007](../02-planejamento/requisitos-spec.md#req-007).
- **Core bancário e liquidação climática** — cenários para split, incentivos e auditoria financeira ([REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008)), comparando com o legado de interceptação/compartilhamento [REQ-005](../02-planejamento/requisitos-spec.md#req-005)–[REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- **Dashboards ESG e relatórios** — verificar métricas, filtros e exportações ([REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009)), alinhados aos legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015)–[REQ-034](../02-planejamento/requisitos-spec.md#req-034).

---

## Testes unitários recomendados
### Front-end (`apps/portal-web`)
1. **`OnboardingFlow.test.tsx`** — simula cadastros completos, falhas documentais e aprovação humana. Verificar geração de `collaboration_ticket_id` e consentimentos LGPD ([REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-011](../02-planejamento/requisitos-spec.md#req-011); legado [REQ-001](../02-planejamento/requisitos-spec.md#req-001)).
2. **`MarketplaceListing.test.tsx`** — garante filtros, cálculo de preço climático e gatilhos de revisão manual ([REQ-003](../02-planejamento/requisitos-spec.md#req-003)), preservando equivalência com [REQ-003](../02-planejamento/requisitos-spec.md#req-003).
3. **`ImpactDashboard.test.tsx`** — valida indicadores ESG, exportação e sincronização com relatórios ([REQ-006](../02-planejamento/requisitos-spec.md#req-006)), conectando ao legado [REQ-015](../02-planejamento/requisitos-spec.md#req-015).

### Back-end (`services/*`)
1. **`services/onboarding`** — testes para `/applications` (criação), `/reviews` (aprovação manual) e notificações, assegurando trilha colaborativa ([REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-031](../02-planejamento/requisitos-spec.md#req-031)).
2. **`services/core-banking`** — valida split de pagamentos, idempotência e registro no ledger ([REQ-008](../02-planejamento/requisitos-spec.md#req-008)), alinhado ao legado [REQ-007](../02-planejamento/requisitos-spec.md#req-007).
3. **`services/impact-reports`** — confirma geração de relatórios BACEN/ESG, filtragem por analista e envio a `docs/reports/` ([REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-023](../02-planejamento/requisitos-spec.md#req-023)).

### Data & ML (`data/pipelines`)
- Crie testes para pipelines críticos usando `pytest` ou `great_expectations`, validando limites, enriquecimento e checkpoints humanos ([REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-031](../02-planejamento/requisitos-spec.md#req-031)). Use o legado [REQ-034](../02-planejamento/requisitos-spec.md#req-034) como referência.

---

## Integração e contratos
- **Contratos REST/GraphQL** — utilize `pact` ou `supertest` para validar contratos entre `apps/` e `services/`, assegurando compatibilidade com [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e legados [REQ-005](../02-planejamento/requisitos-spec.md#req-005)–[REQ-007](../02-planejamento/requisitos-spec.md#req-007).
- **Eventos/Kafka** — testes devem confirmar idempotência e correlação (`correlation_id`, `impact_token`, `collaboration_ticket_id`) seguindo [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Open Finance e parceiros** — mocks precisam refletir políticas de autenticação, consentimento e auditoria ([REQ-019](../02-planejamento/requisitos-spec.md#req-019)), preservando lições dos legados [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-024](../02-planejamento/requisitos-spec.md#req-024).

---

## Automação e relatórios
- Scripts `npm test`/`yarn test` e `pytest` devem integrar-se aos pipelines descritos em [Build e Automação](build-e-automacao-spec.md), exportando resultados para `docs/reports/tests/` com referência explícita aos IDs de requisito.
- Capturas de tela, gravações e logs relevantes precisam ser anexados quando os testes cobrirem fluxos críticos ou jornadas colaborativas, mantendo a rastreabilidade de [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e dos legados [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- Falhas devem abrir incidentes com vínculo ao plano de capacidade e à matriz de riscos, garantindo que especialistas humanos acompanhem o backlog colaborativo.

---

## Checklist de encerramento
1. Suites relevantes executadas localmente e em CI com artefatos arquivados.
2. Requisitos atuais e legados citados nos relatórios de teste.
3. Aprovação dos analistas colaboradores quando um caso testar fluxos híbridos (IA + humano), registrando evidência em `docs/reports/`.
4. Atualização do changelog com o resumo da cobertura aplicada.

[Voltar ao índice](README-spec.md)
