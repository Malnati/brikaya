<!-- docs/rup/01-arquitetura/integracoes-com-apis.md -->
# Integrações e APIs Externas

> Base: [./integracoes-com-apis.md](./integracoes-com-apis.md)
> Rastreabilidade App: [REQ-104](../02-planejamento/requisitos-spec.md#req-104), [REQ-108](../02-planejamento/requisitos-spec.md#req-108), [REQ-302](../02-planejamento/requisitos-spec.md#req-302)
> Legado correspondente: [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-012](../02-planejamento/requisitos-spec.md#req-012)

As integrações do App conectam canais digitais, core banking climático e parceiros externos (Open Finance, cooperativas, registradoras, órgãos reguladores). Este arquivo replica a estrutura modular do Yagnostic, preservando referências aos contratos herdados (`app/api/src/diagnostics/diagnostics.controller.ts`, `app/api/src/app.controller.ts`) e acrescentando notas específicas do domínio climático.

---

## Atualizações quando requisitos afetarem integrações

- **Fluxos funcionais (App `REQ-101`, `REQ-103`, `REQ-108`; legado `REQ-001`…`REQ-007`):** descreva novos endpoints, payloads e dependências compartilhadas. Atualize `arquitetura-da-extensao-spec.md`, `../02-design/fluxos-spec.md` e registre o mapeamento com os requisitos herdados.
- **Requisitos técnicos (App `REQ-302`, `REQ-303`, `REQ-305`; legado `REQ-011`…`REQ-020`):** sincronize mudanças em gateways, barramentos de eventos, ETLs climáticos e políticas de versionamento.
- **Capacidade colaborativa (App `REQ-304`; legado `REQ-031`…`REQ-035`):** documente como integrações expõem checkpoints humanos, auditorias e métricas compartilhadas.

---

## Ambientes de Integração

| Ambiente | Endpoint base | Características App | Referência legada |
| --- | --- | --- | --- |
| **DEV** | `https://api-dev.dominio.com.br` | Sandbox com dados sintéticos, mocks para registradoras e Open Finance; permite cenários de revisão colaborativa. | Fluxo equivalente `rup/01-arquitetura/integracoes-com-apis-spec.md` (DEV) alinhado a [REQ-031](../02-planejamento/requisitos-spec.md#req-031). |
| **HML** | `https://api-hml.dominio.com.br` | Ambiente conectado a pipelines de QA, dados mascarados e chaves de teste PIX/SPI. | Reutiliza políticas de aprovação do legado (`/diagnostics/submit` em modo sandbox) documentadas em [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e [REQ-007](../02-planejamento/requisitos-spec.md#req-007). |
| **PRD** | `https://api.dominio.com.br` | Produção com segregação por tenant, logging completo e retenção regulatória para BACEN e órgãos ambientais. | Mantém rastreabilidade com os requisitos legados `REQ-022` e `REQ-029`, garantindo auditoria contínua. |

---

## Principais APIs App e mapeamento legado

| Endpoint App | Método | Descrição climática | Requisitos App · Legado equivalente |
| --- | --- | --- | --- |
| `/auth/sso` | `POST`/`GET` | Integração SSO com provedor corporativo (OIDC/SAML), gestão de sessões OIDC, MFA condicional. | [REQ-110](../02-planejamento/requisitos-spec.md#req-110) · [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002) |
| `/cadastros/usuarios` | `POST`/`PATCH` | Cadastro completo com CPF, validação documental, KYC automatizado, perfis múltiplos. | [REQ-111](../02-planejamento/requisitos-spec.md#req-111) · [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-031](../02-planejamento/requisitos-spec.md#req-031) |
| `/cadastros/organizacoes` | `POST`/`PATCH` | CNPJ, razão social, CNAE, regime tributário, endereço fiscal, classificação por subtipo. | [REQ-112](../02-planejamento/requisitos-spec.md#req-112) · [REQ-002](../02-planejamento/requisitos-spec.md#req-002) |
| `/cadastros/unidades` | `POST`/`PATCH` | Coordenadas GPS obrigatórias, capacidade armazenagem, horário operação, tipologias. | [REQ-113](../02-planejamento/requisitos-spec.md#req-113) · Nova integração |
| `/cadastros/veiculos` | `POST`/`PATCH` | Frota, seguros vigentes, certificações ambientais, documentos de licença. | [REQ-114](../02-planejamento/requisitos-spec.md#req-114) · [REQ-004](../02-planejamento/requisitos-spec.md#req-004) |
| `/marketplace/precificacao` | `POST`/`GET` | Engine dinâmica baseada em oferta/demanda, localização, qualidade, histórico de preços. | [REQ-116](../02-planejamento/requisitos-spec.md#req-116) · [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-009](../02-planejamento/requisitos-spec.md#req-009) |
| `/finance/escrow` | `POST`/`PATCH` | Sistema de custódia avançado, liberação pós-entrega, split de comissões, conciliação. | [REQ-117](../02-planejamento/requisitos-spec.md#req-117) · [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007) |
| `/finance/gateways` | `POST`/`WEBHOOK` | Múltiplos gateways homologados, PIX, cartão, contas virtuais. | [REQ-118](../02-planejamento/requisitos-spec.md#req-118) · [REQ-005](../02-planejamento/requisitos-spec.md#req-005) |
| `/logistica/rastreamento` | `GET`/`WEBHOOK` | GPS tempo real, telemetria veículos, atualizações 30min, comprovantes entrega, TMS. | [REQ-119](../02-planejamento/requisitos-spec.md#req-119) · [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-006](../02-planejamento/requisitos-spec.md#req-006) |
| `/fiscal/sefaz` | `POST`/`GET` | Emissão NF-e/NFS-e automática, cálculo tributos, exportação XML, status tempo real. | [REQ-120](../02-planejamento/requisitos-spec.md#req-120) · Nova integração |
| `/esg/calculos` | `POST`/`GET` | Metodologias padrão (IPCC, GHG Protocol), tCO₂ evitado, relatórios impacto, exportação assinada. | [REQ-121](../02-planejamento/requisitos-spec.md#req-121) · [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-022](../02-planejamento/requisitos-spec.md#req-022) |
| `/blockchain/dominio` | `POST`/`GET` | Smart contracts APP Coin, Polygon, minting controlado, burning, lastro ambiental, APIs públicas. | [REQ-122](../02-planejamento/requisitos-spec.md#req-122) · [REQ-034](../02-planejamento/requisitos-spec.md#req-034) |
| `/admin/dashboard` | `GET`/`POST` | Métricas tempo real, gestão usuários/permissões, logs auditoria, KPIs ESG, exportações regulatórias. | [REQ-123](../02-planejamento/requisitos-spec.md#req-123) · [REQ-033](../02-planejamento/requisitos-spec.md#req-033), [REQ-034](../02-planejamento/requisitos-spec.md#req-034) |
| `/kyc/onboarding` | `POST` JSON | Recebe documentos, biometria e dados socioambientais para abertura de conta verde. | `REQ-101`, `REQ-304` · [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-031](../02-planejamento/requisitos-spec.md#req-031) |
| `/residuos/lotes` | `POST`/`GET` | Cadastra, atualiza e consulta lotes com certificados, sensores IoT e status colaborativo. | `REQ-103`, `REQ-105` · [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-033](../02-planejamento/requisitos-spec.md#req-033) |
| `/logistica/ordens` | `POST`/`PATCH` | Cria ordens de transporte, vincula seguros e atualiza telemetria climática. | `REQ-104` · [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-006](../02-planejamento/requisitos-spec.md#req-006) |
| `/finance/liquidacoes` | `POST` | Executa split climático (PIX/SPI), aplica incentivos e registra ledger ESG. | `REQ-107`, `REQ-108` · [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-032](../02-planejamento/requisitos-spec.md#req-032) |
| `/impacto/indicadores` | `GET` | Disponibiliza métricas ESG, créditos de carbono e trilha pública de auditoria. | `REQ-106`, `REQ-109`, `REQ-205` · [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-034](../02-planejamento/requisitos-spec.md#req-034) |
| `/open-finance/consent` | `POST`/`DELETE` | Administra consentimentos Open Finance e callbacks de revogação. | `REQ-201`, `REQ-401` · [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-028](../02-planejamento/requisitos-spec.md#req-028) |

> Descrições padronizadas sem marcas legadas para manter neutralidade de integrações e aderência ao manual de marca.

**Referência herdada:** os endpoints climáticos partem das estruturas originais `/diagnostics/submit`, `/diagnostics/audio`, `/config` e `/debug/env` descritas em `rup/01-arquitetura/integracoes-com-apis-spec.md`, garantindo rastreabilidade com o código (`app/api/src/diagnostics/diagnostics.controller.ts`, `app/api/src/app.controller.ts`).

---

## Autenticação, Segurança e Governança

- **OAuth 2.1 + mTLS** — Todas as APIs expostas a parceiros utilizam client credentials com certificados rotacionados (`REQ-201`; legado [REQ-014](../02-planejamento/requisitos-spec.md#req-014)).
- **Assinatura de webhooks** — Webhooks para cooperativas ou ERPs carregam assinatura HMAC herdada (`app/api/src/diagnostics/diagnostics.controller.ts`), adaptada para eventos climáticos (`REQ-302`; legado [REQ-012](../02-planejamento/requisitos-spec.md#req-012)).
- **Catálogo centralizado** — Contratos OpenAPI/AsyncAPI permanecem versionados no API Hub corporativo com depreciação mínima de 90 dias (`REQ-302`, `REQ-205`; legados [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-019](../02-planejamento/requisitos-spec.md#req-019)).
- **Auditoria colaborativa** — Cada chamada que altera estado registra `user_id`, `analyst_id` e `decision_reference`, alimentando relatórios climáticos (`REQ-404`; legado [REQ-029](../02-planejamento/requisitos-spec.md#req-029)).
- **RBAC + ABAC** — Escopos OAuth carregam atributos de segmento, rating e certificações para reforçar segregação de funções e políticas contextuais exigidas pelos níveis N0–N5 (`REQ-040`, `REQ-304`; legado [REQ-031](../02-planejamento/requisitos-spec.md#req-031)).
- **MFA adaptativa** — Tokens de sessão exigem step-up authentication para liberações de liquidação ou ajustes sensíveis, replicando MFA biométrica + PIN descrita para operadores financeiros (`REQ-201`, `REQ-304`; legado [REQ-014](../02-planejamento/requisitos-spec.md#req-014)).
- **Recertificação e logs** — APIs administrativas devem expor eventos de concessão, revisão periódica e revogação de acesso para alimentar auditorias e campanhas trimestrais (`REQ-205`, `REQ-404`; legado [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).

---

## Checkpoints de autorização entre canais

- **Portal → Área do usuário** — Integrações de onboarding promovem usuários do nível N0 para N1 após validações KYC digitais e captura de consentimentos, mantendo trilhas de aprovação alinhadas aos requisitos colaborativos (`REQ-101`, `REQ-304`).
- **Área corporativa → Portal administrativo** — Workflows API exigem aprovação de gestores N3 antes de liberar políticas, integrações ou tokens expandidos, com verificação ABAC e logs de credenciais temporárias (`REQ-040`, `REQ-302`).
- **Área corporativa → Aplicativo bancário** — O gateway financeiro valida MFA reforçada e dupla aprovação antes de conceder escopos críticos, garantindo correlação entre sessão web e mobile e envio de eventos para o data lake de auditoria (`REQ-107`, `REQ-304`).

---

## Tratamento de Erros e Resiliência

- **Retry com idempotência** — Integrações críticas utilizam chaves idempotentes para evitar liquidações duplicadas (`REQ-108`; legados [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007)).
- **Fallback assíncrono** — Eventos ficam em filas Kafka/SQS quando parceiros estiverem indisponíveis, seguindo o padrão herdado do Yagnostic (`REQ-109`, `REQ-205`; legados [REQ-013](../02-planejamento/requisitos-spec.md#req-013), [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).
- **Alertas de SLA** — Atrasos em callbacks disparam alertas multicanal para squads de compliance e especialistas socioambientais (`REQ-304`; legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).

---

## Padrões e Contratos Obrigatórios

- **REST/GraphQL para transações síncronas**, com versionamento `v{major}` e resposta padronizada (correlation-id, timestamps, status regulatório). (`REQ-302`; legados [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-019](../02-planejamento/requisitos-spec.md#req-019)).
- **AsyncAPI/Kafka para eventos climáticos e financeiros**, permitindo replay e auditoria (`REQ-303`; legados [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022)).
- **ETL seguro** para importação de históricos ambientais, seguindo políticas LGPD e governança colaborativa (`REQ-303`, `REQ-401`; legados [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-024](../02-planejamento/requisitos-spec.md#req-024)).
- **Webhooks com aprovação dupla** em liquidações ou decisões críticas, somente concluídos após validação humana registrada (`REQ-108`, `REQ-304`; legados [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-032](../02-planejamento/requisitos-spec.md#req-032), [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).

---

## Notas de Convivência com a Capacidade Colaborativa

- Payloads devem incluir `collaboration_ticket_id` sempre que houver revisão humana, mantendo rastreabilidade ponta a ponta (`REQ-304`; legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-033](../02-planejamento/requisitos-spec.md#req-033)).
- APIs de indicadores ESG precisam aceitar filtros por analista responsável e expor metadados de decisão, garantindo paridade entre IA e especialistas (`REQ-106`, `REQ-205`; legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).
- Consentimentos Open Finance e LGPD devem ser replicados nas filas colaborativas, permitindo que especialistas visualizem apenas dados autorizados (`REQ-201`, `REQ-401`; legados [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-028](../02-planejamento/requisitos-spec.md#req-028)).

[Voltar ao índice](./README-spec.md)
