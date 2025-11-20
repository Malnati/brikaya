<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md -->
# Governança Técnica

> Base: [./governanca-tecnica.md](./governanca-tecnica.md)

## Objetivo
Estabelecer a cadeia de decisão técnica do template APP, garantindo que cada incremento de produto cumpra requisitos funcionais, técnicos e regulatórios (`REQ-001`…`REQ-404`) sem amarrar o conteúdo a um domínio específico. A governança aplica o princípio **“IA executa, humano valida”**, assegurando rastreabilidade integral das decisões documentadas.

## Papéis e Responsabilidades
- **Diretoria Técnica App** — aprova roadmaps climáticos, alinha INvestimentos tecnológicos e valida métricas de impacto ESG.  
- **Arquitetura de Plataforma Climática** — mantém o mapa de domínios (onboarding verde, marketplace de resíduos, tokenização) e aprova integrações (`REQ-301`, `REQ-302`).  
- **Tech Leads de Domínio** — coordenam implementações, revisões técnicas e métricas de performance para marketplace (`REQ-103` ↔ `REQ-006`), liquidação (`REQ-108` ↔ `REQ-005`) e dashboards (`REQ-106` ↔ `REQ-009`).  
- **Comitê Socioambiental e Compliance** — garante aderência à LGPD (`REQ-024` ↔ `REQ-027`), BACEN (`REQ-402`) e políticas de sustentabilidade (`REQ-403`).  
- **Agentes IA (Codex, Scope, Architecture, Audit, UX)** — descritos em `AGENTS.md`, executam pipelines e produzem evidências em `/docs/reports/`.  
- **Requisitos associados:** REQ-001, REQ-005, REQ-006, REQ-009, REQ-016, REQ-019, REQ-022, REQ-023, REQ-024, REQ-029 e REQ-030.  
- **Nota colaborativa:** alinhar responsabilidades com os validadores humanos previstos em REQ-031–REQ-035 (mapeados no App para `REQ-110`, `REQ-303`, `REQ-304`, `REQ-305` e `REQ-404`) garantindo SLA entre IA e especialistas.

## Hierarquia de Governança Técnica
A estrutura decisória distribui checkpoints ao longo do RUP e das frentes de negócios verdes:

1. **Diretoria Técnica** — valida releases, aprova relatórios climáticos e autoriza mudanças entre ambientes (`REQ-019`, `REQ-022`).
2. **Comitê de Governança ESG** — audita decisões automatizadas, verifica ética/LGPD e cruza indicadores em `docs/reports/` (`REQ-017`, `REQ-024`, `REQ-029`).
3. **Agentes Autônomos** — executam `build.yml`, `test.yml`, `review.yml`, `audit.yml` e `governance.yml`, registrando `run_id`, `pipeline_run_id` e metadados exigidos (`REQ-022`, `REQ-023`).

Todos os níveis vinculam logs ao `CHANGELOG/` e aos artefatos descritos em [`auditoria-e-rastreabilidade-spec.md`](auditoria-e-rastreabilidade-spec.md#catalogo-de-relatorios-automatizados), preservando rastreabilidade com os fluxos colaborativos (`REQ-031`…`REQ-035`).

## Fluxo de Aprovação
1. Planejar incremento com issue/épico e identificar requisitos afetados (`REQ-001`…`REQ-030` ↔ `REQ-101`…`REQ-404`).
2. Desenvolver com atualizações simultâneas em protótipo (`../02-design/fluxos-spec.md`), APIs (`../03-implementacao/estrutura-de-projeto-spec.md`) e documentação RUP.
3. Executar pipelines obrigatórios conforme [`revisoes-com-ia-spec.md`](revisoes-com-ia-spec.md):
   - `build.yml` — compila apps web/mobile e serviços de liquidação (`REQ-018`, `REQ-019`).
   - `test.yml` — roda suites unit, integração, E2E e validadores ESG (`REQ-005`…`REQ-009`, `REQ-015`).
   - `review.yml` — revisões IA (escopo, arquitetura, segurança, governança) com dupla aprovação humana (`REQ-019`, `REQ-022`).
   - `audit.yml` — consolida metadados de rastreabilidade, métricas socioambientais e compliance (`REQ-017`, `REQ-029`).
4. Validar componentes impactados:  
   - **Core Bancário:** `services/core-banking/`, `services/liquidacao-verde/`.  
   - **Marketplace:** `apps/web/src/modules/marketplace/`, `apps/web/src/modules/passaporte-digital/`.  
   - **Análises ESG:** `services/scoring-socioambiental/`, dashboards em `apps/web/src/modules/impacto-esg/`.  
5. Revisões IA + humanas, atualizando `CHANGELOG.md`, `docs/reports/` e `../02-planejamento/riscos-e-mitigacoes-spec.md`.
6. Merge apenas após aprovação conjunta (engenharia + socioambiental) e confirmação das métricas colaborativas (REQ-031–REQ-035 ↔ `REQ-110`, `REQ-304`, `REQ-305`).

- **Requisitos associados:** REQ-001, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-015, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** anexar evidências de aprovação humana das filas climáticas (REQ-031–REQ-035) nos relatórios `governance-summary.md`.

## Ciclo HOOP de Governança
O App adota o ciclo HOOP (Hipótese → Observação → Otimização → Produção) alinhado às fases RUP:

1. **Hipótese** — definir experimentos (ex.: novo indicador ESG) registrando requisitos no catálogo (`../02-planejamento/requisitos-spec.md`) e hipóteses em `docs/reports/hypothesis-log.md`.  
2. **Observação** — revisar arquitetura, riscos (`../02-planejamento/riscos-e-mitigacoes-spec.md`) e impactos socioambientais com atas no `CHANGELOG/`.  
3. **Otimização** — implementar, testar, medir SLAs de crédito verde e KPIs ESG em `coverage-report.md`/`test-report.md`.  
4. **Produção** — auditar releases (`audit-report.md`, `governance-summary.md`), armazenar contratos climáticos e aprovações.  
5. **Revisão Contínua** — consolidar métricas colaborativas e planos de ação no `risk-summary.md`.

- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-034.
- **Nota colaborativa:** usar a fase “Revisão” para consolidar decisões IA + humano dos requisitos REQ-031–REQ-035, com mapeamento direto aos riscos ESG críticos.

## Ritos de Governança
- **Checkpoint semanal** — revisão de pendências técnicas, riscos ESG e SLAs de aprovação humana.  
- **Post-mortem socioambiental** — obrigatório após incidentes que impactem score climático ou liquidação verde.  
- **Auditoria mensal** — gera `governance-summary.md`, consolida indicadores 60-30-10, SLA de fila e conformidade LGPD.  
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-024, REQ-029 e REQ-034.  
- **Nota colaborativa:** acompanhar métricas de throughput humano vs. IA (REQ-031–REQ-035) e publicar comparativo na ata mensal.

## Políticas de Rastreabilidade
- Linkar requisitos, riscos, testes, commits e relatórios (`REQ-019`, `REQ-022`, `REQ-023`).
- Preservar logs de consentimento, aprovações de crédito e decisões ESG (`REQ-024`, `REQ-028`, `REQ-029`).
- Armazenar relatórios em `/docs/reports/` com hash, timestamp e responsáveis (`REQ-022`).
- **Requisitos associados:** REQ-017, REQ-019, REQ-022, REQ-023, REQ-024, REQ-028, REQ-029 e REQ-030.
- **Nota colaborativa:** incluir identificadores das filas colaborativas (`REQ-031`…`REQ-035`) nos logs para reconstituir a jornada de aprovação humana.

## Matriz de Perfis e Permissões
| Perfil | Subtipos-chave | Permissões essenciais |
| --- | --- | --- |
| Fornecedor de resíduo | Setor público, ONG, agricultores familiar/empresarial, agroindústria, indústria categorizada por CNAE | Gerenciar cadastro, publicar lotes, anexar laudos/FISPQ/NF, consultar relatórios de impacto, avaliar compradores |
| Comprador de resíduo | Setor público, recicladores, empresas de valorização, indústrias por CNAE | Pesquisar lotes (raio ≤ 200 km), negociar, emitir pedidos, pagar via escrow, acessar relatórios básicos, avaliar fornecedores |
| Comprador de produto reciclado | Órgãos públicos e empresas com foco em produtos recuperados | Cadastrar perfil institucional, comprar produtos reciclados, consumir relatórios de impacto vinculados |
| Parceiro | Logística, cooperativas, serviços de mão de obra, laboratórios, certificadoras | Cadastrar serviços, ser vinculado a transações, receber avaliações |
| Investidor | Investidor verificado ou interessado via formulário de contato | Visualizar pipeline de projetos, aportar capital, adquirir tokens/dominio coin quando habilitado |
| Administrador App | Diretores técnicos e comitê ESG | Configurar perfis, revisar acessos, aprovar exceções, publicar relatórios restritos |
- A matriz herda o inventário detalhado em [`../02-planejamento/requisitos-banco-digital-spec.md#niveis-de-acesso`](../02-planejamento/requisitos-banco-digital-spec.md#niveis-de-acesso) e orienta a implementação de RBAC alinhado ao `REQ-040`.
- **Requisitos associados:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-006, REQ-009, REQ-010, REQ-016, REQ-024, REQ-029, REQ-034 e REQ-040.
- **Nota colaborativa:** validar semanalmente com os squads que as filas colaborativas (`REQ-031`…`REQ-035`) respeitam o mesmo mapeamento de perfis e que exceções são registradas no `governance-summary.md`.

## Governança de Cadastros e Compliance Fiscal
- **Entidades obrigatórias:**
  - Organização/Usuário — `uuid`, tipo de pessoa, razão social/nome completo, CNAE, contatos autorizados, perfil financeiro e status de verificação.
  - Localização/Unidade — endereço completo, coordenadas, janelas de coleta, capacidade de armazenagem, tipologias manipuladas.
  - Lote de resíduo — título, descrição do processo, categoria e subtipo padronizados, quantidade/unidade, condição, embalagens, documentação técnica, preço e logística definida.
  - Transporte — transportador, frota, seguros e disponibilidade.
  - Compliance — certificados, licenças ambientais, selos de terceiros e passaporte digital vinculado.
- **Controles fiscais:** onboarding captura regime tributário, CFOP por operação, regras de retenção (ICMS, ISS, PIS/COFINS, IRRF) e integrações NF-e/NFS-e com trilha de auditoria imutável (ver detalhes técnicos e endpoints em [integracao-fiscal-spec.md](./integracao-fiscal-spec.md)).
- **Relatórios restritos:** dashboards ESG e extratos fiscais exportáveis (PDF/CSV) ficam limitados a perfis autorizados, com hash verificável e registros de consentimento (`Acesso restrito` no anexo de requisitos).
- **Integrações prioritárias:** SEFAZ, prefeituras, bancos e ERPs contábeis precisam de contratos aprovados pelo comitê técnico antes da ativação.
- **Requisitos associados:** REQ-002, REQ-003, REQ-004, REQ-005, REQ-008, REQ-009, REQ-010, REQ-020, REQ-024, REQ-025, REQ-026, REQ-029, REQ-030 e REQ-040.
- **Nota colaborativa:** auditar mensalmente cadastros incompletos e exceções fiscais, anexando o diagnóstico em `audit-report.md` e notificando validadores humanos (`REQ-031`…`REQ-035`).

## Governança Visual e Conteúdo
- Mudanças em microcopy, branding climático ou tokens exigem aprovação da governança UX/compliance antes do merge.
- Auditorias 60-30-10, Regra 4x2 e simplificação visual seguem `AGENTS.md` e `../06-ux-brand/diretrizes-de-ux-spec.md`.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** diferenciar mensagens automáticas da IA e instruções dos analistas verdes (REQ-031–REQ-033) em toda microcopy.

## Checklists Consolidados
### Requisitos LGPD e Compliance Verde
- Consentimento explícito nos canais digitais (`apps/web/src/modules/onboarding/`).  
- Termos versionados (`ENV: API_CONSENT_VERSION`, `LGPD_TERM_VERSION`).  
- Trilha de auditoria financeira e ESG (`services/auditoria-socioambiental/`).  
- **Requisitos associados:** REQ-024, REQ-025, REQ-026, REQ-027, REQ-028 e REQ-029.

### UX Writing e 8pt Grid
- Microcopy orientada à ação e parâmetros configuráveis (`MESSAGE_PREFIX`, `ESG_ALERT_TEMPLATE`).  
- Espaçamentos múltiplos de 8px conforme `AGENTS.md`.  
- Regra tipográfica 4x2 aplicada aos dashboards (`apps/web/src/modules/impacto-esg/components/`).  
- **Requisitos associados:** REQ-016, REQ-024, REQ-028 e REQ-034.  
- **Nota colaborativa:** sinalizar diferenças entre mensagens automáticas da IA e respostas humanas em filas REQ-031–REQ-033.

### Notificações Omnicanal
- Serviço `services/notificacoes-omnicanal/` integra e-mail, WhatsApp e alertas internos.  
- Configuração via `ADMIN_EMAIL`, `DASHBOARD_URL`, `NOTIFICATION_DEFAULT_COMPANY_NAME`.  
- Opt-out LGPD disponível em todos os canais.  
- **Requisitos associados:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-024, REQ-026, REQ-028 e REQ-029.  
- **Nota colaborativa:** distinguir notificações voltadas a validadores humanos das enviadas às cooperativas (REQ-031–REQ-035).

## Métricas de Governança Técnica
| Métrica | Meta | Relatório |
| --- | --- | --- |
| Cobertura de testes end-to-end | ≥ 95% nos fluxos marketplace/liquidação | `test-report.md` |
| Erros críticos em build | 0 tolerados | `agent-report.md` |
| Latência média de aprovação humana | ≤ 18h | `governance-summary.md` |
| Conformidade LGPD e BACEN | 100% | `audit-report.md` |
| Auditorias IA executadas | Semanais | `audit-report.md` |
| Auditorias humanas | Mensais | `governance-summary.md` |

- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.  
- **Nota colaborativa:** incluir métricas de throughput humano vs. IA para REQ-031–REQ-035 nas publicações mensais.

## Governança dos Agentes e Pipelines
| Workflow | Responsável IA | Auditor humano | Frequência |
| --- | --- | --- | --- |
| `build.yml` | Code Agent | Tech Lead de Plataforma | A cada PR |
| `test.yml` | Test Agent | QA ESG | A cada commit crítico |
| `review.yml` | Scope & Architecture Agents | Comitê Socioambiental | Pull Request |
| `audit.yml` | Audit Agent | Diretor Técnico | Semanal |
| `governance.yml` | Governance Agent | Comitê ESG | Mensal |

- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** manter segregação de perfis e logs para etapas colaborativas (REQ-031–REQ-035) com registro do validador humano.

## Governança Ética e LGPD
- Tratamento de dados conforme LGPD, BACEN e políticas ESG (`REQ-024`…`REQ-029`, `REQ-402`, `REQ-403`).  
- Logs anonimizados com controle de acesso e registro de agente + revisor.  
- Consentimento revisado periodicamente e versionado em `docs/reports/consent-log.md`.  
- **Requisitos associados:** REQ-017, REQ-024, REQ-025, REQ-026, REQ-027, REQ-028, REQ-029 e REQ-030.  
- **Nota colaborativa:** assegurar que fluxos colaborativos (REQ-031–REQ-035) usem os mesmos mecanismos de consentimento e revogação.

## Ciclo de Auditoria Técnica
1. Agentes IA executam `review.yml`/`build.yml` e publicam `agent-report.md`.  
2. `audit.yml` gera `audit-report.md`, `risk-summary.md` e atualiza indicadores (`REQ-022`, `REQ-023`).  
3. Revisão humana registra decisões no `CHANGELOG/` e atualiza `../02-planejamento/riscos-e-mitigacoes-spec.md`.  
4. `governance.yml` compila `governance-summary.md` com métricas ESG e colaborativas.  
5. Releases vinculam `review_run_id`, `audit_run_id` e `release_run_id` no `CHANGELOG.md`.  
6. Comitê ESG reavalia riscos críticos e planos de mitigação.  
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.  
- **Nota colaborativa:** mapear pendências dos validadores humanos (REQ-031–REQ-033) e anexar planos de ação à próxima auditoria.

## Encerramento de Release
- Checklist completo (testes, auditorias, documentação, changelog) aprovado e arquivado.  
- Aprovação final por engenharia e governança ESG/compliance.  
- Artefatos versionados e retidos por 12 meses nos diretórios `docs/reports/` e `CHANGELOG/`.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** registrar o estado das filas colaborativas (REQ-031–REQ-035) no `release-report.md` antes da publicação.

[Voltar ao índice](README-spec.md)
