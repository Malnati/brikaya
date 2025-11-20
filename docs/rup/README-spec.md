<!-- docs/rup/README.md -->
# Template de Projeto Multiplataforma

> Base: [./README.md](./README.md)

**Fase: Documentação completa RUP**

Bem-vindo à documentação oficial do **Template de Projeto Multiplataforma**, iniciativa da **Template Corporation** para criar uma estrutura de desenvolvimento corporativo. O diretório `docs/rup/` organiza as fases do projeto conforme o **Rational Unified Process (RUP)**, garantindo rastreabilidade, previsibilidade e governança técnica contínua enquanto estruturamos uma plataforma digital versátil para diversos casos de uso corporativo.

---

## Introdução Geral

O Template combina aplicativos web e mobile, APIs seguras, motores de avaliação de negócio e integrações com diversos sistemas corporativos. A plataforma captura dados de processos de negócio, calcula indicadores de performance, monetiza os resultados em carteiras digitais e liquida transações com remuneração justa para todos os stakeholders envolvidos.

Os componentes centrais abrangem canais digitais para clientes e agentes de campo, serviços de onboarding e KYC, motor de elegibilidade para financiamentos, módulo de tokenização de ativos, camadas de relatório regulatório e painéis de impacto para investidores. Esta documentação serve como guia completo — da visão inicial à manutenção evolutiva — e está alinhada aos agentes e pipelines definidos em `AGENTS.md`.

---

## Estrutura das Fases RUP

| Fase | Diretório | Descrição |
| --- | --- | --- |
| 00 – Visão do Projeto | [./00-visao/README-spec.md](./00-visao/README-spec.md) | Propósito, escopo, stakeholders do ecossistema verde e diretrizes de LGPD. |
| 01 – Arquitetura | [./01-arquitetura/README-spec.md](./01-arquitetura/README-spec.md) | Macroarquitetura da plataforma bancária, microsserviços climáticos e integrações externas. |
| 02 – Design Detalhado | [./02-design/README-spec.md](./02-design/README-spec.md) | Componentes internos, contratos de APIs e fluxos de orquestração das jornadas financeiras climáticas. |
| 03 – Testes e Validação | [./04-testes-e-validacao/README-spec.md](./04-testes-e-validacao/README-spec.md) | Estratégia de testes, marcos e cenários ponta a ponta das operações de INvestmento verde. |
| 04 – Entrega e Implantação | [./05-entrega-e-implantacao/README-spec.md](./05-entrega-e-implantacao/README-spec.md) | Empacotamento, provisionamento de ambientes e governança de releases para serviços bancários. |
| 05 – Governança Técnica e Controle de Qualidade | [./06-governanca-tecnica-e-controle-de-qualidade/README-spec.md](./06-governanca-tecnica-e-controle-de-qualidade/README-spec.md) | Agentes, pipelines, auditoria, LGPD e compliance financeiro-ambiental contínuo. |

---

## Índice detalhado da documentação

### Fases RUP
- [00-Visão](00-visao/README-spec.md): escopo, objetivos climáticos, stakeholders e diretrizes de LGPD.
- [01-Arquitetura](01-arquitetura/README-spec.md): macroarquitetura da plataforma bancária e integrações socioambientais.
- [02-Design](02-design/README-spec.md): diagramas, componentes de serviços financeiros verdes e fluxos de orquestração.
- [03-Testes e Validação](04-testes-e-validacao/README-spec.md): estratégia de testes, marcos validados e cenários ponta a ponta.
- [04-Entrega e Implantação](05-entrega-e-implantacao/README-spec.md): empacotamento, publicação de serviços e governança operacional.
- [05-Governança](06-governanca-tecnica-e-controle-de-qualidade/README-spec.md): agentes, pipelines, auditoria, LGPD e compliance regulatório.

### Materiais complementares
- [Planejamento histórico](02-planejamento/README-spec.md): registros auxiliares de roadmap, riscos e cronogramas.
- [Agentes IA (arquivo)](03-agentes-ia/README-spec.md): seção preservada como referência, direcionando para a fase de Governança.
- [Documentos legados de implementação](03-implementacao/README-spec.md): consolidação das diretrizes técnicas nas fases atuais.
- [Qualidade e testes (arquivo)](04-qualidade-testes/README-spec.md): reencaminha para a estratégia oficial de testes e validação.
- [Operação e release (arquivo)](05-operacao-release/README-spec.md): referencia os procedimentos atualizados de entrega e implantação.
- [UX e identidade](06-ux-brand/README-spec.md): orientações de experiência, comunicação visual e engajamento comunitário.
- [Contribuição](07-contribuicao/README-spec.md): padrões de colaboração e governança de commits.
- [Anexos](99-anexos/README-spec.md): glossário e referências adicionais.

---

## 📍 Fases do Ciclo RUP

1. **Iniciação (Visão)** — Define impacto climático, produtos financeiros e atores envolvidos.
2. **Elaboração (Arquitetura)** — Estrutura técnica e limites das integrações com parceiros e reguladores.
3. **Construção (Design)** — Consolida componentes e contratos internos do ecossistema bancário verde.
4. **Transição (Testes e Validação)** — Verifica fluxos críticos e critérios de aceite das jornadas financeiras.
5. **Implantação (Entrega)** — Empacota serviços, pipelines e canais de relacionamento.
6. **Governança (Operação contínua)** — Sustenta auditorias, agentes e conformidade socioambiental.

---

## Automação e IA no Ciclo RUP

O projeto utiliza agentes inteligentes definidos em `AGENTS.md` e orquestrados pelos pipelines descritos em `PIPELINE.md`:

- **Codex Builder** – Geração assistida de código e documentação.
- **Codex Reviewer** – Revisão técnica e detecção de inconsistências.
- **Scope Corrector** e **Architecture Corrector** – Garantia de aderência a requisitos e arquitetura.
- **E2E Test Agent** – Apoio à criação e execução de cenários ponta a ponta.
- **Audit Agent** – Consolidação de evidências de conformidade.

Todos os agentes operam com controle humano obrigatório, mantendo logs versionados e sem expor segredos.

---

## Conformidade e Segurança

- Cumprimento das exigências da **LGPD**, das regulações do **Banco Central do Brasil** e das normas ambientais aplicáveis.
- Dados pessoais, financeiros e operacionais utilizam criptografia em repouso e em trânsito, com trilhas de auditoria completas.
- Canais de distribuição e integrações externas operam com autorizações documentadas e monitoradas pela governança MBRA.

---

## 🏢 Responsabilidade Técnica

**Organização:** Millennium Brasil (MBRA)
**Responsável:** Ricardo Malnati — Engenheiro de Software
**Infraestrutura:** GitHub + Codex + OpenRouter
**Licença:** Uso restrito corporativo (documentação interna MBRA)
**Última atualização:** [gerada conforme ciclo de auditoria]

---

[Voltar ao topo](#app-—-climate-INvestment)
