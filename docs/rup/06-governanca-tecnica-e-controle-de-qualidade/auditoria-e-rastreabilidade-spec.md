<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md -->
# Auditoria e Rastreabilidade

> Base: [./auditoria-e-rastreabilidade.md](./auditoria-e-rastreabilidade.md)

## Objetivo
Garantir rastreabilidade integral entre requisitos, código, dados operacionais e entregas do template, permitindo auditorias contínuas das obrigações técnicas, legais e de UX. A estrutura espelha o modelo base (`REQ-001`…`REQ-030`) adaptado aos requisitos do catálogo do template (`REQ-101`…`REQ-404`).

---

## Atualizações quando requisitos gerarem auditoria
- Atualize este documento e o par base sempre que um requisito (`REQ-001`…`REQ-030` ou correlato App) exigir novos controles ou evidências.  
- Sincronize ajustes com `../02-planejamento/requisitos-spec.md`, `../02-planejamento/riscos-e-mitigacoes-spec.md`, `controle-de-qualidade-spec.md` e `revisoes-com-ia-spec.md`.  
- Registre o ciclo completo no `CHANGELOG.md`, em `docs/reports/audit-report.md`, `docs/reports/risk-summary.md` e no histórico `docs/reports/audit-history.md`.  
- **Checklist de encerramento:**
  1. Requisito catalogado com links cruzados para arquitetura, design, implementação, testes, métricas e governança.  
  2. Evidências anexadas aos PRs e relatórios (`audit-report.md`, `review-report.md`, `test-report.md`, `governance-summary.md`).  
  3. Registro de `run_id`/`pipeline_run_id` com hash e timestamp em `/docs/reports/`.  
  4. Comentário de auditoria publicado no PR e entrada correspondente no `CHANGELOG/`.  
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-024, REQ-028, REQ-029 e REQ-030.  
- **Nota colaborativa:** garantir que fluxos de aprovação humana (REQ-031–REQ-035 ↔ `REQ-110`, `REQ-304`, `REQ-305`) herdem os mesmos identificadores e checkpoints de auditoria.

---

## Princípios de rastreabilidade
- Manter identificadores `REQ-###` consistentes no catálogo, nos relatórios e nos commits (`git log --grep "REQ-"`).  
- Exigir que Issues/PRs referenciem explicitamente os requisitos atendidos e anexem evidências climáticas (dashboards, laudos, contratos).  
- Mapear testes automatizados e manuais para os requisitos validados, permitindo reconstruir a matriz requisito-teste.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-024, REQ-028 e REQ-029.  
- **Nota colaborativa:** incluir identificadores das filas colaborativas (REQ-031–REQ-035) na matriz de rastreabilidade para distinguir ações IA vs. humanas.

## Ferramentas e mecanismos
- GitHub Issues/PRs como fonte única de registro; uso obrigatório de templates com campo `REQ-###`.  
- Workflows descritos em [`revisoes-com-ia-spec.md`](revisoes-com-ia-spec.md) para validar lint, build, testes, auditorias IA e métricas ESG.  
- Logs e relatórios versionados em `/docs/reports/` com metadados (`run_id`, `pipeline_run_id`, `agent_id`, `hash`).  
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** conservar a segregação de contexto quando relatórios incluírem dados sensíveis de validação humana (REQ-031–REQ-035).

## Metadados obrigatórios de auditoria
- Cada execução IA registra `AGENT_ID`, `MODEL_NAME`, `GITHUB_RUN_ID`, `TIMESTAMP`, `PROMPT_FILE`, `RESULT_FILE`, `REVIEW_STATUS` conforme `AGENTS.md`.
- Relatórios humanos incluem responsável, cargo, data/hora, requisitos auditados e ações corretivas.
- Exportar consolidações para `docs/reports/audit-report.md` e `docs/reports/governance-summary.md`.
- **Requisitos associados:** REQ-022, REQ-023, REQ-024, REQ-028 e REQ-029.
- **Nota colaborativa:** adicionar `collaboration_id` às execuções que envolvem validadores humanos (REQ-031–REQ-035).

## Checklist de cadastros e compliance fiscal
- Validar entidades previstas em [`../02-planejamento/requisitos-banco-digital-spec.md#requisitos-de-usuarios-e-acesso`](../02-planejamento/requisitos-banco-digital-spec.md#requisitos-de-usuarios-e-acesso): organização/usuário, localização, lote, transporte e certificados.
- Conferir campos obrigatórios (`uuid`, CNAE, contatos autorizados, status de verificação) e anexos técnicos (laudos, FISPQ, NF, passaporte digital) antes da liberação de cada perfil.
- Garantir que logs de NF-e/NFS-e e CFOP estejam versionados com hash e referência à transação (`REQ-002`, `REQ-003`, `REQ-004`, `REQ-005`).
- Revisar exportações fiscais (PDF/CSV/SPED) e relatórios ESG para confirmar restrição de acesso aos perfis previstos no RBAC (`REQ-009`, `REQ-010`, `REQ-024`, `REQ-029`, `REQ-030`, `REQ-040`).
- Registrar achados e exceções na matriz de auditoria com responsável humano designado (filas `REQ-031`…`REQ-035`).
- **Requisitos associados:** REQ-002, REQ-003, REQ-004, REQ-005, REQ-008, REQ-009, REQ-010, REQ-020, REQ-024, REQ-025, REQ-026, REQ-029, REQ-030 e REQ-040.
- **Nota colaborativa:** incluir o status de regularização fiscal nas entradas do `audit-report.md` e replicar o alerta no `governance-summary.md` quando houver pendências humanas.

## Auditoria periódica
- Auditoria semanal automática (`audit.yml`) valida cobertura de requisitos, logs e métricas ESG.
- Auditoria mensal humana consolida indicadores em `governance-summary.md` e revisa planos de mitigação.
- Revisões extraordinárias disparadas por incidentes (BACEN, LGPD, métricas climáticas).
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** alinhar calendário das auditorias com ciclos colaborativos para registrar métricas REQ-031–REQ-035.

## Relatório final
- Exportado em Markdown (`docs/reports/audit-report.md`), contendo conclusões, não conformidades, planos de ação e referência a commits/PRs.  
- Deve citar requisitos auditados, riscos correlatos e métricas ESG.  
- **Requisitos associados:** REQ-022, REQ-023, REQ-024 e REQ-029.  
- **Nota colaborativa:** quando houver achados sobre validação humana, documentar responsáveis, prazo de resolução e estado das filas REQ-031–REQ-035.

## Catálogo de relatórios automatizados
Ver a seção [Catálogo de relatórios automatizados](#catalogo-de-relatorios-automatizados) para detalhes completos dos artefatos versionados em `/docs/reports/`.

### `audit-report.md`
- **Pipeline:** `audit.yml`  
- **Responsável IA:** Audit Agent  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `checked_controls`, `hash`.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** incluir métricas de aprovação humana (REQ-031–REQ-035) sempre que houver filas colaborativas.

### `release-report.md`
- **Pipeline:** `release.yml`  
- **Responsável IA:** Semantic Versioning Agent  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `version`, `commits_included`, `hash`.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023 e REQ-030.  
- **Nota colaborativa:** registrar status das pendências colaborativas antes da publicação.

### `test-report.md`
- **Pipeline:** `test.yml`  
- **Responsável IA:** Test Agent  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `suite`, `tests_executed`, `passed`, `failed`, `coverage`.  
- **Requisitos associados:** REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-015, REQ-019, REQ-020 e REQ-021.  
- **Nota colaborativa:** destacar cenários colaborativos (REQ-031–REQ-035) e respectivos resultados.

### `agent-report.md`
- **Pipeline:** `build.yml` e `review.yml`  
- **Responsáveis IA:** agentes executados no pipeline (Codex Builder/Reviewer, Scope/Architecture Corrector, Security Policy Agent, UX Reviewer).  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `model`, `execution_time`, `status`, `review_status`.  
- **Requisitos associados:** REQ-018, REQ-019, REQ-021, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** registrar qual etapa colaborativa (REQ-031–REQ-035) foi afetada pelos achados.

### `coverage-report.md`
- **Pipeline:** `test.yml`  
- **Responsável IA:** Coverage Agent  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `coverage.statements`, `coverage.branches`, `coverage.functions`, `hash`.  
- **Requisitos associados:** REQ-015, REQ-019, REQ-022 e REQ-023.  
- **Nota colaborativa:** incluir filtros para fluxos colaborativos e métricas de SLA humano (REQ-031–REQ-035).

### `risk-summary.md`
- **Pipeline:** `audit.yml`  
- **Responsável IA:** Audit Agent  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `total_risks`, `critical`, `medium`, `low`, `mitigated`, `new_since_last_audit`.  
- **Requisitos associados:** REQ-017, REQ-019, REQ-022 e REQ-029.  
- **Nota colaborativa:** vincular riscos às etapas colaborativas (REQ-031–REQ-035) e às mitigações socioambientais.

### `governance-summary.md`
- **Pipeline:** `governance.yml`  
- **Responsável IA:** Governance Agent  
- **Campos mínimos:** `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `month`, `audits_passed`, `open_findings`, `ethics_score`, `technical_score`, `human_validation_sla`.  
- **Requisitos associados:** REQ-015, REQ-019, REQ-022, REQ-023 e REQ-034.  
- **Nota colaborativa:** apresentar comparativo IA vs. humano para os requisitos REQ-031–REQ-035.

### Frequência e automação
| Relatório | Frequência | Ação Automática |
| --- | --- | --- |
| `audit-report.md` | Semanal / pós-merge | Valida requisitos, riscos e conformidade LGPD/BACEN. |
| `release-report.md` | A cada release | Atualiza `CHANGELOG/` e registra versionamento semântico. |
| `test-report.md` | Em cada commit monitorado | Atualiza histórico de testes e cobertura. |
| `agent-report.md` | Ao final de cada execução IA | Consolida metadados e recomendações. |
| `coverage-report.md` | Em `pull_request` e `push` protegido | Garante cobertura mínima e rastreabilidade de suites. |
| `risk-summary.md` | Mensal | Consolida riscos ESG e planos de mitigação. |
| `governance-summary.md` | Mensal | Compila auditorias técnicas, métricas ESG e colaboração IA + humana. |

### Rastreabilidade complementar
- [`../02-planejamento/requisitos-spec.md`](../02-planejamento/requisitos-spec.md) — catálogo oficial de requisitos App.  
- [`../02-planejamento/riscos-e-mitigacoes-spec.md`](../02-planejamento/riscos-e-mitigacoes-spec.md) — matriz de riscos ESG/BACEN.  
- [`revisoes-com-ia-spec.md`](revisoes-com-ia-spec.md) — definição dos workflows e agentes IA.  
- [`../../AGENTS.md`](../../AGENTS.md) — responsabilidades dos agentes e metadados exigidos.  
- `CHANGELOG/` — histórico versionado das decisões e auditorias aprovadas.  
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** atualizar os apontamentos sempre que novas personas colaborativas forem introduzidas (REQ-031–REQ-035).

### Armazenamento e governança
- Versionamento contínuo em `/docs/reports/` com arquivamento trimestral em `/docs/reports/archive/`.  
- Metadados obrigatórios (`timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `hash`) em todos os relatórios.  
- Registros de exceção devem citar plano de ação, responsáveis e referências no `CHANGELOG/`.  
- **Requisitos associados:** REQ-017, REQ-019, REQ-022, REQ-023, REQ-024 e REQ-029.  
- **Nota colaborativa:** armazenar anexos das validações humanas (REQ-031–REQ-035) junto aos relatórios correspondentes.

## Fluxo de sincronização review → audit → release
1. `review.yml` executa agentes IA, gera `review-report.md` com `run_id` específico e registra achados.  
2. `audit.yml` consome `review_run_id`, produz novo `run_id`, atualiza `audit-report.md`, `risk-summary.md` e associa as evidências do review.  
3. `release.yml` reutiliza `audit_run_id`, publica `release-report.md` e atualiza `CHANGELOG/`.  
4. `governance.yml` consolida resultados em `governance-summary.md` com indicadores IA + humano.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.  
- **Nota colaborativa:** inserir status das filas colaborativas (REQ-031–REQ-035) antes da publicação da release.

[Voltar ao índice](README-spec.md)
