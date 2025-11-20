<!-- docs/rup/01-arquitetura/arquitetura-da-extensao.md -->
# Arquitetura da Plataforma App

> Base: [./arquitetura-da-extensao.md](./arquitetura-da-extensao.md)
> Rastreabilidade App: [REQ-101](../02-planejamento/requisitos-spec.md#req-101), [REQ-103](../02-planejamento/requisitos-spec.md#req-103), [REQ-301](../02-planejamento/requisitos-spec.md#req-301)
> Legado correspondente: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-006](../02-planejamento/requisitos-spec.md#req-006)

Este documento traduz o blueprint herdado do Yagnostic para a realidade climática do **App — CLImate INvestment**. Os blocos abaixo mantêm títulos, bullets e referências a protótipos/código originais (`app/ui/`, `app/api/`, `prototype/` documentados na pasta `rup/`), acrescentando notas sobre como o ecossistema financeiro verde absorve essas decisões e como elas se conectam à capacidade colaborativa (`REQ-031`…`REQ-035`).

---

## Atualizações para novos requisitos

### Épicos M1 Integrados à Arquitetura
- **E1 - Autenticação e Acesso ([REQ-110](../02-planejamento/requisitos-spec.md#req-110)):** integração com provedores SSO corporativos (OIDC/SAML), implementação de MFA, gestão de sessões OIDC
- **E2 - Cadastros ([REQ-111](../02-planejamento/requisitos-spec.md#req-111) a [REQ-115](../02-planejamento/requisitos-spec.md#req-115)):** módulos específicos para cada entidade (usuários, organizações, unidades, veículos, parceiros) com validação automática e integração geoespacial
- **E3 - Marketplace ([REQ-116](../02-planejamento/requisitos-spec.md#req-116)):** engine de precificação dinâmica com algoritmos de matching baseados em localização, qualidade e histórico
- **E4 - Pagamentos e Escrow ([REQ-117](../02-planejamento/requisitos-spec.md#req-117), [REQ-118](../02-planejamento/requisitos-spec.md#req-118)):** sistema de custódia avançado com múltiplos gateways de pagamento, contas virtuais e split automatizado
- **E5 - Logística, ESG e Fiscal ([REQ-119](../02-planejamento/requisitos-spec.md#req-119) a [REQ-121](../02-planejamento/requisitos-spec.md#req-121)):** rastreamento GPS, emissão fiscal automática via SEFAZ, cálculos ESG padronizados
- **E6 - APP Coin ([REQ-122](../02-planejamento/requisitos-spec.md#req-122)):** smart contracts blockchain, minting controlado, lastro ambiental verificável
- **E7 - Administração ([REQ-123](../02-planejamento/requisitos-spec.md#req-123)):** dashboard unificado com métricas em tempo real, gestão de permissões RBAC/ABAC

> Terminologia de integrações e pagamentos neutralizada para remover marcas legadas e manter aderência ao manual de marca.

### Requisitos Arquiteturais Consolidados
- **Requisitos funcionais (App `REQ-101`, `REQ-103`, `REQ-107`, `REQ-110`…`REQ-123`; legado `REQ-001`…`REQ-007`):** registre mudanças que impactem onboarding verde, marketplace de resíduos e liquidação climática. Sempre sincronize `integracoes-com-apis-spec.md`, `../02-design/fluxos-spec.md` e o catálogo de requisitos com a equivalência legada.
- **Requisitos técnicos (App `REQ-301`, `REQ-303`, `REQ-305`; legado `REQ-011`…`REQ-020`):** detalhe ajustes em topologia, barramentos de eventos e pipelines IaC. Inclua dependências com data lake climático e com as métricas herdadas (`REQ-017`, `REQ-019`).
- **Requisitos colaborativos (App `REQ-304`; legado `REQ-031`…`REQ-035`):** sempre que IA socioambiental delegar decisão a especialistas humanos, anote como filas, dashboards e logs preservam checkpoints colaborativos.

---

## Visão Geral das Camadas

- **Aplicações Web e Mobile (React/Vite, React Native)** — Reaproveitam o shell do Yagnostic (`app/ui/src/App.tsx`, `app/ui/src/components/dashboard/DashboardOverview.tsx`) para entregar jornadas de onboarding climático, marketplace e relatórios ESG. Ajustes devem mapear tokens e helpers (`BrandingHelper.ts`, `UploadHelper.ts`) para o branding verde.
- **API Climática (NestJS)** — A camada `app/api/src/diagnostics/diagnostics.controller.ts` é reutilizada como base de orquestração para scoring socioambiental, liquidações e auditorias. Endpoints herdados (`/diagnostics/submit`, `/diagnostics/audio`) são recontextualizados para fluxos climáticos e expõem métricas ESG.
- **Provas de conceito e protótipos** — Telas em `prototype/` (dashboard, onboarding, consentimentos) continuam como referência visual para squads do App. Sempre registre adaptações de texto e métricas no changelog.
- **BFF/Orquestração** — Um gateway GraphQL/REST garante personalização por persona e controla limites regulatórios (`REQ-302`; legado `REQ-012`). Filas de eventos e ETL climático (`REQ-303`; legado `REQ-017`) conectam o core banking verde às fontes externas.

---

## Fluxo Operacional End-to-End

1. **Onboarding e validação climática** — Reutiliza o fluxo `Login → Approval → Onboarding` herdado (`app/ui/src/Login.tsx`, `app/ui/src/ApprovalHelper.ts`, `prototype/onboarding-consentimento.html`) para capturar consentimentos e scoring socioambiental. Requisitos: [REQ-101](../02-planejamento/requisitos-spec.md#req-101) · Legado: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
2. **Cadastro e monitoramento de lotes** — Componentes de upload e fila (`app/ui/src/Upload.tsx`, `app/ui/src/components/dashboard/DiagnosticQueue.tsx`) suportam documentação de resíduos, sensores IoT e anexos regulatórios. Requisitos: [REQ-103](../02-planejamento/requisitos-spec.md#req-103) · Legado: [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-033](../02-planejamento/requisitos-spec.md#req-033).
3. **Marketplace e precificação climática** — A camada de dashboard e matching utiliza organismos herdados (`prototype/dashboard-visao-geral.html`, `prototype/dashboard-fila.html`) para combinar oferta e demanda. Requisitos: [REQ-103](../02-planejamento/requisitos-spec.md#req-103), [REQ-104](../02-planejamento/requisitos-spec.md#req-104) · Legado: [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-006](../02-planejamento/requisitos-spec.md#req-006).
4. **Liquidação financeira verde** — Serviços NestJS (`app/api/src/diagnostics/diagnostics.service.ts`) evoluem para split climático, distribuição de incentivos e registro de métricas ESG. Requisitos: [REQ-107](../02-planejamento/requisitos-spec.md#req-107), [REQ-108](../02-planejamento/requisitos-spec.md#req-108) · Legado: [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-032](../02-planejamento/requisitos-spec.md#req-032).
5. **Relatórios e transparência** — Dashboards públicos e APIs (`prototype/dashboard-visao-geral.html`, `rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`) alinham métricas ESG, risco e auditoria colaborativa. Requisitos: [REQ-106](../02-planejamento/requisitos-spec.md#req-106), [REQ-205](../02-planejamento/requisitos-spec.md#req-205) · Legado: [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

Cada etapa deve registrar checkpoints colaborativos compartilhados com `capacidade-diagnostico-colaborativo-spec.md`, garantindo transparência entre IA e especialistas.

---

## Componentes Front-end Herdados

- **Shell de Aplicação (`app/ui/src/App.tsx`)** — Base para rotas de onboarding verde, marketplace e liquidação; mantenha o carregamento de branding (`app/ui/src/BrandingHelper.ts`) alinhado ao novo design.
- **ApprovalStatus e fluxos de consentimento** — Componentes `app/ui/src/components/approval/ApprovalStatus.tsx` e `app/ui/src/components/onboarding/OnboardingFlow.tsx` continuam guiando bloqueios regulatórios (`REQ-101`; legado `REQ-031`). Documente ajustes em textos e métricas.
- **DashboardOverview / DiagnosticQueue** — Organismos herdados exibem indicadores ESG e filas de eventos. Atualize dados calculados e crossovers com filas colaborativas (`REQ-205`; legado `REQ-034`).
- **UploadHelper e armazenamento offline** — Persistem lotes e anexos em IndexedDB (`REQ-103`; legado `REQ-011`). Sempre alinhe `DB_VERSION` e migrações com os pipelines de dados climáticos.

---

## Serviços Backend e Contratos

- **Controllers NestJS** — `app/api/src/diagnostics/diagnostics.controller.ts` documenta validações, logging estruturado e retorno de DTOs. Ao adaptar para clima, cite os novos endpoints no catálogo (`integracoes-com-apis-spec.md`) mantendo equivalência com `/diagnostics/submit` e `/diagnostics/audio`.
- **Services e DTOs** — Classes em `app/api/src/diagnostics/diagnostics.service.ts` e `app/api/src/diagnostics/dto` continuam encapsulando regras de negócio. Registre novas dependências com scoring socioambiental e liquidação verde (`REQ-301`; legado `REQ-011`).
- **Configuração e debug** — Endpoints `/config` e `/debug/env` seguem sendo a fonte de parâmetros, limites de upload e feature flags. Documente como tokens climáticos e indicadores ESG são expostos para painéis colaborativos.

## Domínio de Cadastro Climático

- **Modelagem por entidade** — Organizações, unidades operacionais, lotes, transportadores e certificados permanecem entidades independentes com identificadores próprios (`uuid`) para garantir versionamento e rastreabilidade socioambiental (`REQ-002`, `REQ-103`; legado `REQ-002`, `REQ-003`). Os campos obrigatórios abrangem perfil financeiro, classificação fiscal, contatos, coordenadas geográficas, capacidade de armazenamento, laudos e anexos multimídia, preservando o inventário original de dados de negócio.
- **Passaporte digital e scoring** — Cada lote mantém vínculo com passaporte digital, termos de responsabilidade, certificados ambientais e score de verificação, permitindo auditoria cruzada entre marketplace, logística e compliance (`REQ-005`, `REQ-103`; legado `REQ-003`, `REQ-033`).
- **Relacionamentos hierárquicos** — Gestores corporativos administram conjuntos de unidades e lotes vinculados à organização, enquanto parceiros logísticos e transportadores são associados por integrações TMS e trilhas de certificação (`REQ-004`, `REQ-104`; legado `REQ-004`, `REQ-006`).

## Identidade e Controle de Acesso

- **Perfis colaborativos** — O desenho arquitetural contempla visitantes, usuários autenticados, gestores corporativos, administradores de clientes, operadores financeiros e auditores, cada um com responsabilidades específicas sobre cadastros, liquidações e auditoria (`REQ-032`, `REQ-040`; legado `REQ-031`, `REQ-033`).
- **Níveis N0–N5** — A hierarquia de autorização define progressão de privilégios por interface, com validação KYC/KYB, segregação de funções e exigência de MFA reforçado antes de liberar operações críticas ou auditoria central (`REQ-201`, `REQ-304`; legado `REQ-014`, `REQ-031`).
- **Fluxos de escalonamento** — Regras de promoção entre níveis utilizam políticas ABAC (segmento, certificações, rating) e dupla aprovação para liberar tokens de sessão e credenciais temporárias, garantindo logs completos e interoperabilidade com o aplicativo bancário (`REQ-037`, `REQ-304`; legado `REQ-031`, `REQ-033`).
- **Controles técnicos** — RBAC hierárquico, ABAC contextual, gestão de sessões OIDC/OAuth2, revisões periódicas de acesso e monitoramento UEBA são tratados como contratos arquiteturais e sincronizados com requisitos não funcionais e de governança (`REQ-040`, `REQ-205`; legado `REQ-033`, `REQ-034`).【F:docs/rup/99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md†L79-L92】

---

## Regras de Acesso, Segurança e Observabilidade

- **Zero Trust** — Autenticação multifatorial, OIDC e segregação por tenant devem ser alinhadas a `REQ-201` (legado `REQ-014`).
- **Consentimentos e Open Finance** — Persistência de consentimentos e auditoria devem refletir `REQ-108`, `REQ-201` (legado `REQ-007`, `REQ-024`).
- **Monitoramento ESG** — Métricas de impacto são exibidas nos dashboards herdados e registradas em logs distribuídos (`REQ-205`; legado `REQ-022`).
- **Resiliência** — Filas e IndexedDB mantêm resiliência offline (`REQ-103`; legado `REQ-011`). Documente fallback assíncrono e estratégias de retry.

---

## Notas de Convivência com a Capacidade Colaborativa

- **Filas compartilhadas** — Cada decisão automática deve incluir `collaboration_ticket_id` e registrar aprovação humana, alinhando-se aos requisitos colaborativos ([REQ-304](../02-planejamento/requisitos-spec.md#req-304); legado [REQ-031](../02-planejamento/requisitos-spec.md#req-031)).
- **Dashboards de impacto** — Manter paridade entre indicadores IA/humano, destacando estados de revisão (`REQ-106`, `REQ-205`; legado [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).
- **Auditoria integrada** — Logs, trilhas e relatórios devem apontar para `docs/reports/` e anexar decisões humanas conforme `capacidade-diagnostico-colaborativo-spec.md` (legado [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).

[Voltar ao índice](README-spec.md)
