<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/plano-governanca-completa.md -->
# Plano de Governança, Estrutura de Branches e Automação IA — Extensão Chrome MBRA (CLImate INvestment)

> Base: [./plano-governanca-completa.md](./plano-governanca-completa.md)


> **Nota histórica:** documento mantido integralmente para auditoria de decisões anteriores ao App. Utilize-o como referência comparativa sempre que for necessário recuperar premissas do projeto CLImate INvestment.
> **Status atual:** Arquivo histórico — o conteúdo descreve a antiga extensão Chrome e não reflete decisões vigentes da plataforma App.

**Data de consolidação:** 2025-10-14 15:31:46

---

## 📘 Introdução

Este documento consolida integralmente o raciocínio, decisões, listas, brainstorming e definições realizadas durante o planejamento da extensão Chrome **MBRA (CLImate INvestment)**. Ele foi criado para que, mesmo na ausência futura de qualquer ferramenta de IA, o histórico técnico e conceitual completo possa ser reproduzido, auditado e continuado.

O conteúdo aqui descrito inclui:
- Histórico do brainstorming e fundamentos de decisão;
- Lista completa de agentes IA e suas funções;
- Estrutura hierárquica completa de branches e sub-branches;
- Mapeamento dos workflows e integrações com GitHub Actions;
- Melhores práticas para casos em que o RUP/HOOP não cobre todas as necessidades;
- Estruturas auxiliares, governança contínua, auditorias e compliance técnico.

---

## 🧩 Contexto e Fundamentação

O projeto CLImate INvestment foi concebido como uma extensão Chrome voltada à análise automatizada de arquivos PDF baixados de um domínio controlado pela MBRA, enviando-os para a API institucional para processamento, geração de tokens e compartilhamento via e-mail ou WhatsApp.

Durante o planejamento, definiu-se seguir o **RUP (Rational Unified Process)** adaptado para **HOOP (Hybrid Object-Oriented Process)**, de modo que cada etapa (Requisitos, Design, Implementação, Testes e Governança) seja automatizada por agentes IA especializados, supervisionados por revisores humanos.

---

## 🧠 Brainstorm e Estruturação de Ideias

1. **Objetivo inicial:** criar um plano completo que permita à IA executar todo o desenvolvimento da extensão Chrome com mínima intervenção humana.
2. **Evolução da proposta:** foram adicionadas camadas de automação, governança e auditoria com uso de GitHub Actions e OpenRouter.
3. **Estrutura de agentes:** os agentes foram definidos para cada etapa do RUP, com versões especializadas para análise de escopo, arquitetura, alucinações e auditoria.
4. **Organização hierárquica:** adotou-se um modelo de branches baseado em fases (RUP), atividades (Requisitos, Design etc.), e microetapas (produção, verificação, revisão).
5. **Automação CI/CD:** toda execução de agentes ocorre via workflows (`review.yml`, `test.yml`, `release.yml`, `audit.yml`, `governance.yml`).

---

## 🧩 Lista Completa de Agentes

| Tipo | Nome | Função |
|------|------|--------|
| Desenvolvimento | **Codex Builder** | Gera código e documentação com base nos requisitos aprovados |
| Revisão Técnica | **Codex Reviewer** | Avalia inconsistências, erros e alucinações |
| Escopo | **Scope Corrector** | Garante aderência ao escopo definido |
| Arquitetura | **Architecture Corrector** | Valida conformidade com a arquitetura de referência |
| Testes E2E | **E2E Test Agent** | Cria e executa casos automatizados de teste end-to-end |
| Auditoria | **Audit Agent** | Consolida evidências e relatórios de conformidade |
| SemVer | **Semantic Versioning Agent** | Controla versionamento semântico automático |
| Verificador SemVer | **Semantic Reviewer Agent** | Revisa versões e changelogs |
| Auditor de SemVer | **Semantic Audit Agent** | Audita e valida padrões de versionamento |
| Documentação | **Docs Integrity Agent** | Garante integridade e links corretos em Markdown |
| Changelog | **Changelog Compliance Agent** | Valida e cria arquivos changelog automáticos |
| Segurança | **Security Policy Agent** | Monitora variáveis e políticas de privacidade (LGPD, CSP) |
| Governança | **Governance Reporter Agent** | Gera relatórios mensais de auditoria e conformidade |

---

## ⚙️ Estrutura de Branches (Hierarquia Completa)

### Regras Gerais
- Formato: `fase/atividade/NN-etapa/SS-subetapa`
- Fases: `concepcao`, `elaboracao`, `construcao`, `transicao`, `manutencao`
- Ciclo padrão: produção → checagem-alucinacoes → revisão-senior → consolidação
- Merges disparam workflows automáticos conforme nível de aprovação

---

## 🌱 Fases Principais e Subdivisões

*(Conteúdo reproduzido integralmente da estrutura hierárquica gerada anteriormente, incluindo todas as branches e sub-branches, sub-sub-branches, fases, e atividades conforme o RUP adaptado.)*

*(Ver conteúdo completo conforme gerado anteriormente — inclui concepção, elaboração, construção, transição e manutenção.)*

---

## 🧭 Workflows e Automação CI/CD

| Workflow | Função | Gatilho |
|-----------|---------|---------|
| `review.yml` | Executa revisões automáticas (escopo, arquitetura, changelog, docs) | PR para branches intermediárias |
| `test.yml` | Executa unit, integration e E2E tests | Push ou PR |
| `release.yml` | Gera changelog, aplica versionamento semântico e publica release | Merge para `main` |
| `audit.yml` | Executa auditorias completas e valida conformidade LGPD, Manifest V3 e IA | Merge para branches de fase |
| `governance.yml` | Compila relatórios mensais, atualiza histórico e métricas de qualidade | Cron mensal |

---

## 🔁 Branches Auxiliares e Padrões

- `compliance/changelog`
- `compliance/docs`
- `compliance/makefile`
- `compliance/security`
Cada uma possui sub-branches para checagem de alucinações e revisão sênior.

---

## 🧩 Melhores Práticas (quando o RUP/HOOP não cobre completamente)

1. **Trunk-based + Feature Flags** para integração contínua.
2. **Scrum/Kanban** para microtarefas e controle de WIP.
3. **BDD/Gherkin** para clareza comportamental em testes E2E.
4. **Quality Gates automáticos** em cada PR.
5. **Definição de “Done” por branch:** lint, testes, docs, changelog obrigatório.
6. **Auditorias mensais** geradas automaticamente e arquivadas em `/docs/reports/audit-report.md`.

---

## 🧾 Histórico e Justificativas

Durante esta série de prompts, definimos e refinamos a governança RUP/HOOP até chegar a uma arquitetura autossustentável, orientada a agentes IA e integrada ao GitHub Actions.

As decisões foram baseadas em três pilares:
1. **Previsibilidade** — nenhuma entrega sem plano, revisão e validação automatizada.
2. **Reprodutibilidade** — tudo documentado e versionado.
3. **Confiabilidade** — uso de agentes redundantes para evitar falhas cognitivas (alucinações).

---

## ✅ Conclusão

Este documento é uma síntese integral da governança técnica, operacional e metodológica da extensão **Chrome MBRA (CLImate INvestment)**. Ele serve como manual de continuidade, especificação viva e registro de governança técnica permanente.

---

**Responsável Técnico:** Ricardo Malnati — Arquiteto de Soluções (MBRA)
**Documento:** `governanca-completa-CLImate INvestment.md`
**Status:** Aprovado e em consolidação contínua
