<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md -->
# Revisões com Inteligência Artificial

> Base: [./revisoes-com-ia.md](./revisoes-com-ia.md)

## Objetivo
Documentar o uso coordenado de agentes IA na governança técnica do App, garantindo transparência, rastreabilidade e aderência aos requisitos `REQ-001`…`REQ-030` (legado Yagnostic) e seus equivalentes climáticos (`REQ-101`…`REQ-305`).

---

## Atualizações quando requisitos demandarem novas revisões
- Atualize este documento sempre que novos requisitos exigirem validações IA adicionais ou ajustes de pipeline.  
- Sincronize alterações com `governanca-tecnica-spec.md`, `controle-de-qualidade-spec.md`, `auditoria-e-rastreabilidade-spec.md` e `../02-planejamento/requisitos-spec.md`.  
- Registre métricas e checkpoints no `CHANGELOG.md`, `docs/reports/review-report.md`, `docs/reports/agent-report.md` e `docs/reports/governance-summary.md`.  
- **Requisitos associados:** REQ-015, REQ-018, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** validar cobertura dos fluxos colaborativos (REQ-031–REQ-035 ↔ `REQ-110`, `REQ-304`, `REQ-305`) toda vez que um novo agente for configurado.

Todas as revisões devem cruzar os achados com a [matriz de riscos](../02-planejamento/riscos-e-mitigacoes-spec.md) para manter o catálogo `RISK-###` atualizado.

---

## Arquitetura dos agentes
- Infraestrutura baseada em OpenRouter + agentes definidos em `AGENTS.md`.  
- Workflows GitHub Actions (`build.yml`, `review.yml`, `test.yml`, `audit.yml`, `governance.yml`) orquestram as execuções IA.  
- Tokens (`OPENROUTER_TOKEN`, `GITHUB_TOKEN`) e variáveis (`MODEL_DEFAULT`, `GOVERNANCE_MATRIX_PATH`) seguem políticas de rotação e segregação.  
- **Requisitos associados:** REQ-018, REQ-019, REQ-021, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** criar ambientes isolados para prompts que contenham dados de validação humana (REQ-031–REQ-035).

## Agentes definidos
1. **Codex Builder** — gera código/documentação alinhados aos requisitos climáticos.  
2. **Codex Reviewer** — avalia inconsistências técnicas, riscos ESG e alucinações.  
3. **Scope Corrector** e **Architecture Corrector** — garantem aderência ao escopo RUP e à arquitetura App (`REQ-301`, `REQ-305`).  
4. **Security Policy Agent** — valida LGPD, BACEN e políticas ESG (`REQ-024`, `REQ-402`, `REQ-403`).  
5. **UX Reviewer** — aplica 60-30-10, Regra 4x2 e UX writing climático (`REQ-016`, `REQ-028`).  
6. **Test Agent / Coverage Agent** — apoiam a geração de suites unit/E2E e cobertura mínima (`REQ-015`, `REQ-019`).  
7. **Audit Agent / Governance Agent** — consolidam métricas de auditoria e governança (`REQ-022`, `REQ-023`, `REQ-029`).  
- **Nota colaborativa:** incluir verificações específicas para as filas colaborativas (REQ-031–REQ-035) em cada agente relevante.

## Workflows GitHub Actions
| Workflow | Fase RUP | Descrição | Agentes IA | Artefatos |
| --- | --- | --- | --- | --- |
| `build.yml` | Construção | Compila serviços, aplica lint, executa testes unitários. | Codex Builder, Test Agent | `dist/`, `agent-report.md` |
| `review.yml` | Elaboração / Governança | Avalia escopo, arquitetura, segurança, UX e governança. | Codex Reviewer, Scope/Architecture Corrector, Security Policy Agent, UX Reviewer, Governance Reviewer | `review-report.md`, `scope-correction.json`, `security-policy-report.md`, `ux-review.json`, `governance-review.json` |
| `test.yml` | Transição | Executa testes unitários, integração e E2E com suporte IA. | Test Agent, Coverage Agent | `test-report.md`, `coverage-report.md` |
| `audit.yml` | Governança | Consolida logs, metadados, riscos e compliance. | Audit Agent, Governance Agent | `audit-report.md`, `risk-summary.md`, `governance-summary.md` |
| `governance.yml` | Governança contínua | Compila métricas mensais IA + humano. | Governance Agent | `governance-summary.md` |
- **Requisitos associados:** REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-015, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-034.  
- **Nota colaborativa:** cada workflow deve validar indicadores de aprovação humana e SLA definidos para REQ-031–REQ-035.

## Estrutura de diretórios e arquivos
- `.github/workflows/*.yml`
- `docs/reports/*.md`
- `docs/reports/*.json`
- `docs/reports/archive/`
- **Requisitos associados:** REQ-019, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** garantir que relatórios sobre colaboração humana estejam arquivados com hash e identificação do validador (REQ-031–REQ-035).

## Descrição detalhada dos workflows
### 🧱 `build.yml`
- **Fase RUP:** Construção.  
- **Gatilhos:** `push`/`pull_request` para branches monitoradas.  
- **Etapas:** instalar dependências, lint, build, testes unitários, geração de artefatos.  
- **Artefatos:** `dist/`, `build-log.txt`, `agent-report.md`.  
- **Requisitos associados:** REQ-015, REQ-018, REQ-019, REQ-020 e REQ-030.  
- **Nota colaborativa:** validar se módulos colaborativos (REQ-031–REQ-033) estão incluídos no pacote antes de liberar revisão.

### 🔍 `review.yml`
- **Fase RUP:** Elaboração / Governança.  
- **Etapas chave:** preparar contexto, acionar Codex Reviewer, Scope/Architecture Corrector, Security Policy Agent, UX Reviewer e Governance Reviewer; consolidar achados em `review-report.md`.  
- **Critérios de sucesso:** nenhum erro crítico e recomendações com responsáveis definidos.  
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-028, REQ-029 e REQ-034.  
- **Nota colaborativa:** marcar explicitamente quais itens impactam os fluxos humanos (REQ-031–REQ-035) e solicitar aprovação manual antes do merge.

### 🧪 `test.yml`
- **Fase RUP:** Transição.  
- **Etapas:** testes unitários, integração, E2E com dados climáticos e cenários colaborativos; geração de relatórios `test-report.md` e `coverage-report.md`.  
- **Requisitos associados:** REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-011, REQ-015, REQ-019, REQ-020 e REQ-021.  
- **Nota colaborativa:** incluir suites para aprovações humanas, SLA de fila e monitoramento ESG (REQ-031–REQ-035).

### 🚀 `release.yml`
- **Fase RUP:** Implantação.  
- **Etapas:** validar build/test, gerar changelog, empacotar release, publicar `release-report.md`.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** registrar no changelog o status dos validadores humanos (REQ-031–REQ-035) antes da tag final.

### 🧾 `audit.yml`
- **Fase RUP:** Governança Técnica.  
- **Etapas:** coletar logs IA, executar Audit/Governance Agents, gerar `audit-report.md`, `risk-summary.md`, `governance-summary.md`, validar rastreabilidade.  
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.  
- **Nota colaborativa:** anexar métricas de SLA humano e comentários dos validadores (REQ-031–REQ-035) a cada execução.

## Variáveis e segredos
| Variável | Descrição | Tipo | Uso |
| --- | --- | --- | --- |
| `OPENROUTER_TOKEN` | Token de acesso aos modelos IA. | Secret | Execução de agentes nos workflows `review.yml` e `audit.yml`. |
| `GITHUB_TOKEN` | Token padrão do GitHub Actions. | Secret | Checkout, upload de artefatos e comentários automatizados. |
| `MODEL_DEFAULT` | Modelo IA padrão (ex.: `deepseek-coder`). | Variável | Seleção dinâmica de agentes. |
| `GOVERNANCE_MATRIX_PATH` | Caminho para matriz de requisitos governança. | Variável | Cruzamento de requisitos durante as revisões. |
| `AGENT_LOG_PATH` | Diretório para logs IA. | Variável | Persistência de evidências consumidas pelo `audit.yml`. |
| `SECURITY_POLICY_PROFILE` | Perfil de políticas de segurança/LGPD. | Variável | Geração de `security-policy-report.md`. |
| `COLLAB_SLA_TARGET` | SLA alvo para validações humanas. | Variável | Indicador requerido nos relatórios REQ-031–REQ-035. |
- **Requisitos associados:** REQ-017, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** segregar variáveis adicionais quando prompts incluírem dados sensíveis das filas colaborativas.

## Execução automatizada
- Workflows acionados por `push`, `pull_request`, `workflow_dispatch` e `schedule` garantem cobertura contínua.  
- Cada execução gera relatórios com hash, timestamp e links para os requisitos auditados.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** sincronizar execuções com janelas de validação humana para evitar gargalos (REQ-031–REQ-035).

## Critérios de confiabilidade
- Nenhum agente aprova sua própria saída; revisão humana obrigatória antes do merge ou release.  
- Achados críticos exigem plano de ação registrado no `CHANGELOG/` e acompanhamento em `risk-summary.md`.  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023 e REQ-029.  
- **Nota colaborativa:** registrar o responsável humano por cada validação colaborativa (REQ-031–REQ-035) nos relatórios IA.

## Relatórios de conformidade IA
- Consolidam alertas, recomendações e métricas de confiabilidade dos agentes.  
- Arquivados em `/docs/reports/` com rastreabilidade cruzada (`run_id`, `pipeline_run_id`, `hash`).  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.  
- **Nota colaborativa:** destacar métricas IA vs. humano e pendências colaborativas (REQ-031–REQ-035) em cada relatório.

## Gestão de segredos
- Tokens, prompts e parâmetros de execução ficam em segredos GitHub e `.env` privados, seguindo política de rotação e dupla custódia.  
- Auditorias verificam acesso e uso conforme as regras éticas/legais do App.  
- **Requisitos associados:** REQ-017, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.  
- **Nota colaborativa:** armazenar de forma segregada credenciais utilizadas pelas equipes humanas nos fluxos REQ-031–REQ-035.

[Voltar ao índice](README-spec.md)
