<!-- docs/rup/03-implementacao/estrutura-de-projeto.md -->
# Estrutura de Projeto

> Base: [./estrutura-de-projeto.md](./estrutura-de-projeto.md)
> Rastreabilidade: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-022](../02-planejamento/requisitos-spec.md#req-022)
> Legados correlatos: [REQ-001](../02-planejamento/requisitos-spec.md#req-001)–[REQ-020](../02-planejamento/requisitos-spec.md#req-020)
> Referências complementares: [Arquitetura da Plataforma](../01-arquitetura/arquitetura-da-extensao-spec.md) · [Design de Experiência](../02-design/design-geral-spec.md) · [Capacidade Colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

Esta especificação descreve a organização de diretórios, módulos e contratos técnicos do **App — CLImate INvestment**. O documento reaproveita o modelo modular estabelecido no Yagnostic, porém todas as referências de domínio foram substituídas por jornadas financeiras verdes, mantendo o vínculo histórico com os requisitos `REQ-001`…`REQ-030` para facilitar auditorias de migração.

---

## Como atualizar
1. Registre novos contextos ou ajustes estruturais aqui e em `estrutura-de-projeto.md`, citando o ID do requisito impactado.
2. Atualize os artefatos de arquitetura (`../01-arquitetura/`) e design (`../02-design/`) para manter consistência entre visão, implementação e experiência.
3. Sempre que a mudança envolver revisão humana ou checkpoints colaborativos, documente a correspondência com [`capacidade-diagnostico-colaborativo-spec.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) e com os legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035).

---

## Organização macro do repositório
- `apps/` — clientes web e mobile (React/React Native) e portais parceiros, alinhados a [REQ-001](../02-planejamento/requisitos-spec.md#req-001) e [REQ-006](../02-planejamento/requisitos-spec.md#req-006); herdam padrões de usabilidade dos legados [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- `services/` — microsserviços Node/NestJS e jobs de orquestração que materializam onboarding, marketplace, core bancário verde e relatórios ([REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-007](../02-planejamento/requisitos-spec.md#req-007)); equivalentes legados [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007).
- `data/` — pipelines de ETL/ELT, lake climático, modelos de scoring e catálogos ESG, garantindo observabilidade de [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e governança de [REQ-023](../02-planejamento/requisitos-spec.md#req-023); mantém mapeamento com legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015)–[REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- `infra/` — infraestrutura como código (Terraform/Helm) e automações GitOps que sustentam [REQ-045](../02-planejamento/requisitos-spec.md#req-045), incluindo scripts compartilhados pelo pipeline colaborativo.
- `docs/` — documentação viva, relatórios de auditoria e planos de capacidade. Mantém o histórico herdado (`rup/03-implementacao/`) para rastrear decisões e o novo conteúdo adaptado ao App.

---

## Aplicações digitais (`apps/`)
### Portal App (`apps/portal-web`)
- Orquestra jornadas de onboarding multicanal ([REQ-001](../02-planejamento/requisitos-spec.md#req-001)) e marketplace de resíduos ([REQ-003](../02-planejamento/requisitos-spec.md#req-003)).
- Mantém microcopy e componentes sincronizados com `docs/prototype/` e as guidelines legadas [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- Integra módulos colaborativos (fila de revisão humana, chat socioambiental) que refletem `capacidade-diagnostico-colaborativo` e preservam rastros `collaboration_ticket_id` exigidos por [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

### Aplicativo Cooperativas (`apps/cooperativas-mobile`)
- Implementa fluxo offline-first para cadastros e passaporte digital de resíduos ([REQ-003](../02-planejamento/requisitos-spec.md#req-003)), derivado do legado [REQ-006](../02-planejamento/requisitos-spec.md#req-006).
- Usa storage criptografado e sincronização eventual, garantindo privacidade de [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e equivalências legadas [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- Dashboards locais exibem indicadores ESG alinhados a [REQ-006](../02-planejamento/requisitos-spec.md#req-006); alertas de revisão humana replicam comportamento descrito em [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

### Painel de Investidores (`apps/investidores-dashboard`)
- Oferece visão consolidada de carteiras climáticas, liquidações e créditos tokenizados ([REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-009](../02-planejamento/requisitos-spec.md#req-009)).
- Todas as métricas replicam o pipeline de auditoria (`docs/reports/`), mantendo a rastreabilidade histórica de [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

---

## Serviços de domínio (`services/`) - Atualizados M1

### `services/auth` ([REQ-110](../02-planejamento/requisitos-spec.md#req-110))
- **Autenticação avançada:** MFA (SMS/E-mail/App), SSO com provedores corporativos (OIDC/SAML), gestão sessões OIDC
- **Módulos NestJS:** `AuthController`, `SSOService`, `MFAService`, `SessionManager`
- **Endpoints:** `/auth/login`, `/auth/sso/{provider}`, `/auth/mfa/verify`, `/auth/logout`
- **Integrações:** provedores de identidade corporativos, discovery OIDC e bibliotecas JWT/OIDC

> Microcopy padronizada para remover marcas legadas e reforçar neutralidade de manual de marca.

### `services/cadastros` ([REQ-111](../02-planejamento/requisitos-spec.md#req-111) a [REQ-115](../02-planejamento/requisitos-spec.md#req-115))
- **Usuários:** CPF, KYC automatizado, perfil múltiplo, consentimento LGPD
- **Organizações:** CNPJ, classificação subtipo, dados fiscais, conta bancária
- **Unidades:** GPS obrigatório, capacidade, horários, tipologias manipuladas
- **Veículos/Certificados:** frota, seguros, certificações ambientais
- **Parceiros/Investidores:** logísticos, cooperativas, investidores cadastrados/interessados
- **Módulos NestJS:** `UserModule`, `OrganizationModule`, `UnitModule`, `VehicleModule`, `PartnerModule`
- **Endpoints:** `/cadastros/usuarios`, `/cadastros/organizacoes`, `/cadastros/unidades`, `/cadastros/veiculos`, `/cadastros/parceiros`

### `services/marketplace` ([REQ-116](../02-planejamento/requisitos-spec.md#req-116))
- **Engine precificação dinâmica:** oferta/demanda, localização (200km), qualidade, histórico
- **Matching geolocalizado:** busca por raio, filtros tipologia, condições logísticas
- **Negociação assistida:** chat integrado, contratos digitais automáticos
- **Módulos NestJS:** `PricingEngine`, `MatchingService`, `NegotiationModule`, `GeoSearchService`
- **Endpoints:** `/marketplace/precificacao`, `/marketplace/search`, `/marketplace/lotes`, `/marketplace/negotiation`

### `services/finance` ([REQ-117](../02-planejamento/requisitos-spec.md#req-117), [REQ-118](../02-planejamento/requisitos-spec.md#req-118))
- **Escrow avançado:** custódia por transação, liberação pós-entrega, split configurável
- **Múltiplos gateways:** provedores homologados de pagamento, PIX, contas virtuais
- **Conciliação automática:** webhooks, reconciliação bancária, relatórios financeiros
- **Módulos NestJS:** `EscrowModule`, `PaymentGatewayModule`, `ReconciliationModule`, `SplitService`
- **Endpoints:** `/finance/escrow`, `/finance/gateways`, `/finance/payments`, `/finance/reconciliation`

### `services/logistics` ([REQ-119](../02-planejamento/requisitos-spec.md#req-119))
- **Rastreamento GPS:** tempo real, telemetria veículos, atualizações 30min
- **TMS integrado:** planejamento rotas, comprovantes entrega, integração parceiros
- **Monitoramento:** temperatura, combustível, velocidade, alertas automáticos
- **Módulos NestJS:** `TrackingModule`, `TMSService`, `TelemetryModule`, `DeliveryModule`
- **Endpoints:** `/logistics/tracking`, `/logistics/routes`, `/logistics/deliveries`, `/logistics/telemetry`

### `services/fiscal-esg` ([REQ-120](../02-planejamento/requisitos-spec.md#req-120), [REQ-121](../02-planejamento/requisitos-spec.md#req-121))
- **Emissão fiscal:** SEFAZ, NF-e/NFS-e automática, cálculo tributos, exportação XML
- **Cálculos ESG:** metodologias IPCC/GHG Protocol, tCO₂ evitado, relatórios impacto
- **Compliance:** status tempo real, validações automáticas, assinatura digital
- **Módulos NestJS:** `FiscalModule`, `SEFAZService`, `ESGCalculatorModule`, `ComplianceService`
- **Endpoints:** `/fiscal/sefaz`, `/fiscal/nfe`, `/esg/calculos`, `/esg/relatorios`

### `services/blockchain` ([REQ-122](../02-planejamento/requisitos-spec.md#req-122))
- **APP Coin:** smart contracts Polygon, minting/burning controlado, lastro ambiental
- **APIs públicas:** integração wallets/exchanges, transparência transações
- **Governança:** DAO preparatório, tokenomics, distribuição rewards
- **Módulos NestJS:** `BlockchainModule`, `SmartContractService`, `TokenService`, `DAOModule`
- **Endpoints:** `/blockchain/dominio`, `/blockchain/contracts`, `/blockchain/transactions`, `/blockchain/governance`

### `services/admin` ([REQ-123](../02-planejamento/requisitos-spec.md#req-123))
- **Dashboard unificado:** métricas tempo real, KPIs ESG, volume transações
- **Gestão usuários:** aprovações, permissões RBAC/ABAC, auditoria acessos
- **Relatórios regulatórios:** BACEN, órgãos ambientais, exportações automáticas
- **Módulos NestJS:** `AdminModule`, `DashboardService`, `UserManagementModule`, `ReportsModule`
- **Endpoints:** `/admin/dashboard`, `/admin/users`, `/admin/permissions`, `/admin/reports`

### `services/onboarding` (Legado preservado)
- Processa KYC/KYB verde, com integração a bureaus, Open Finance e validação humana quando houver inconsistências. Requisitos: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-031](../02-planejamento/requisitos-spec.md#req-031); legado: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
- Expõe endpoints `/kyc/applications`, `/kyc/reviews` e eventos `kyc.reviewed`, referenciando contratos versionados no API Hub.

### `services/marketplace`
- Garante cadastro de lotes, matching e precificação climática ([REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-005](../02-planejamento/requisitos-spec.md#req-005)).
- Notificações para especialistas e compradores utilizam filas Kafka e webhooks assinados, mantendo logs equivalentes aos legados [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e [REQ-007](../02-planejamento/requisitos-spec.md#req-007).

### `services/core-banking`
- Opera ledger verde, liquidações, split e incentivos ([REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008)).
- Todas as operações exigem `correlation_id` e `impact_token`, com checkpoints colaborativos para liberações acima do limite climático definido na governança ([REQ-023](../02-planejamento/requisitos-spec.md#req-023)).

### `services/impact-reports`
- Consolida métricas ESG, relatórios BACEN e emissões tokenizadas ([REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009)).
- Disponibiliza dashboards e APIs públicas com filtros de auditoria compartilhados com os especialistas humanos (legado [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).

---

## Dados e analytics (`data/`)
- `data/pipelines/` — jobs de ingestão (Kafka → Lakehouse) que alimentam scoring e relatórios, garantindo SLAs de [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e compliance de [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- `data/models/` — notebooks e modelos de IA/ML versionados com metadados (dataset, responsável, métricas) conforme [REQ-031](../02-planejamento/requisitos-spec.md#req-031); mantêm equivalência com os legados [REQ-032](../02-planejamento/requisitos-spec.md#req-032)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035).
- `data/catalog/` — contratos de dados (Open Metadata, DataHub) e políticas de acesso. Cada atualização precisa registrar consentimentos LGPD ([REQ-011](../02-planejamento/requisitos-spec.md#req-011)) e manter histórico legado [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

---

## Ferramentas e automação (`infra/` e `tools/`)
- Makefiles por pacote reutilizam targets `build`, `test`, `lint`, `deploy`, alinhados a [REQ-045](../02-planejamento/requisitos-spec.md#req-045) e às obrigações legadas [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
- Scripts auxiliares ficam em `tools/` (por exemplo, `tools/audit-sync`, `tools/collab-replay`) e devem registrar execuções em `docs/reports/` para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- Playbooks de retomada colaborativa (`tools/collab-fallback`) conectam filas de eventos e dashboards humanos, refletindo as notas de [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-033](../02-planejamento/requisitos-spec.md#req-033).

---

## Convivência com a capacidade colaborativa
- Qualquer módulo que dependa de validação humana deve declarar `collaboration_ticket_id` e `analyst_required` no contrato de saída, assegurando rastreabilidade cruzada entre [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
- Pastas que armazenem templates, prompts ou microcopy precisam referenciar `docs/reports/qa/` e `AGENTS.md`, mantendo a equivalência com o legado diagnóstico (especialmente [REQ-028](../02-planejamento/requisitos-spec.md#req-028)).
- Ao criar novos domínios, registre os checkpoints colaborativos na matriz de riscos (`../02-planejamento/riscos-e-mitigacoes-spec.md`) e no plano de capacidade, evitando descompasso com auditorias humanas.

[Voltar ao índice](README-spec.md)
