<!-- docs/rup/03-implementacao/padroes-de-codigo.md -->
# Padrões de Código

> Base: [./padroes-de-codigo.md](./padroes-de-codigo.md)
> Rastreabilidade: [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-023](../02-planejamento/requisitos-spec.md#req-023)
> Legados correlatos: [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-028](../02-planejamento/requisitos-spec.md#req-028)
> Referências complementares: [Design de Experiência](../02-design/design-geral-spec.md) · [Governança Técnica](../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md) · [Capacidade Colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

As convenções desta seção orientam como escrever código para o ecossistema do App (clientes digitais, microsserviços, pipelines de dados e automações). O texto foi reestruturado a partir do legado Yagnostic, preservando ligações com os requisitos `REQ-001`…`REQ-030` para permitir comparações históricas.

---

## Linguagens e frameworks suportados
- **TypeScript** — padrão para aplicações React/React Native (`apps/`) e serviços NestJS (`services/`), atendendo [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-007](../02-planejamento/requisitos-spec.md#req-007) e mantendo equivalências com os legados [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-008](../02-planejamento/requisitos-spec.md#req-008).
- **Python** — pipelines analíticos e automações de dados (`data/pipelines/`), com padrões de notebook e scripts alinhados a [REQ-022](../02-planejamento/requisitos-spec.md#req-022). Referenciar os legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015)–[REQ-017](../02-planejamento/requisitos-spec.md#req-017) ao evoluir jobs.
- **SQL (PostgreSQL/BigQuery)** — consultas, views regulatórias e relatórios climáticos para [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023). Manter boas práticas herdadas de [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

---

## Convenções de estrutura
- **Feature-Sliced + Domain-Driven Design** — componentes React são organizados por domínio (`apps/portal-web/src/domains/<contexto>`), com camadas `entities`, `features`, `pages`. Esta estrutura atende [REQ-001](../02-planejamento/requisitos-spec.md#req-001) e herda padrões do legado [REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- **Módulos NestJS desacoplados** — cada serviço expõe `module`, `controller`, `service`, `dto`, `infra`. Contratos compartilham a biblioteca `services/_shared/contracts`, mantendo rastros de [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e legados [REQ-021](../02-planejamento/requisitos-spec.md#req-021).
- **Pipelines declarativos** — jobs Python residem em `data/pipelines/<dominio>/` com `README` explicando entradas, saídas e checkpoints humanos. Relacione sempre os requisitos [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e legados [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

---

## Qualidade e segurança
- **Linting obrigatório** — ESLint/Prettier para TypeScript, Flake8/Black para Python e `sqlfluff` para SQL. Qualquer exceção precisa citar o requisito impactado e o legado correspondente.
- **Cobertura mínima** — 80% para módulos críticos (onboarding, core banking, liquidação), justificando divergências em `docs/reports/coverage/` e referenciando [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Validação de entrada** — use DTOs tipados (`class-validator`) e schemas (`zod`/`pydantic`) antes de persistir dados. Exceções devem mencionar controles de [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e legados [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- **Segurança por design** — secrets via vault, rotação automática e logs assíncronos com mascaramento. Toda alteração deve incluir nota apontando [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e os legados [REQ-026](../02-planejamento/requisitos-spec.md#req-026)–[REQ-028](../02-planejamento/requisitos-spec.md#req-028).

---

## Observabilidade e auditoria
- Registre `correlation_id`, `tenant_id`, `impact_token` e, quando aplicável, `collaboration_ticket_id`. Esses campos garantem rastreabilidade cruzada com [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e com os legados [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Logs e métricas devem ser estruturados (JSON) e enviados ao stack de observabilidade descrito em `infra/monitoring/`. A ausência desses campos precisa ser justificada em auditoria.
- Sempre que um módulo expuser dashboards para especialistas humanos, inclua indicadores que evidenciem se a decisão veio da IA ou de revisão manual, conectando-se a [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035).

---

## Boas práticas por camada
- **Front-end** — componentes devem declarar o arquivo fonte no cabeçalho (`<!-- apps/portal-web/... -->`), importar tokens de `apps/portal-web/src/shared/tokens` e utilizar hooks compartilhados (`useTenant`, `useImpactIndicators`). Atualizações precisam sincronizar microcopy com `docs/prototype/`, atendendo [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e o legado [REQ-008](../02-planejamento/requisitos-spec.md#req-008).
- **Back-end** — trate todos os erros com códigos padronizados (`ERR_<dominio>_<evento>`) e mensagens auditáveis. Inclua testes de contrato sempre que endpoints forem alterados, citando [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e legados [REQ-005](../02-planejamento/requisitos-spec.md#req-005)–[REQ-007](../02-planejamento/requisitos-spec.md#req-007).
- **Data/ML** — notebooks precisam conter seções `Contexto`, `Dataset`, `Métricas`, `Decisão` e `Próximos Passos`, assinadas pelo responsável humano. A estrutura atende [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e mantém o comportamento legado [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

---

## Processo de revisão
1. Abrir PR referenciando os IDs de requisitos tocados (atuais e legados) e anexar trechos relevantes com a notação `【F:path†Lx-Ly】`.
2. Executar `make lint` e `make test` antes de solicitar revisão.
3. Garantir revisão dupla quando o código afetar fluxos colaborativos ou dados sensíveis, citando [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e os legados [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

[Voltar ao índice](README-spec.md)
