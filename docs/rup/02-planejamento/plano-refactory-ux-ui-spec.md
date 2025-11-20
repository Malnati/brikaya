<!-- docs/rup/02-planejamento/plano-refactory-ux-ui-spec.md -->
# Plano de Refactory UX/UI do ui — Especificação Evolutiva

> Base: [./plano-refactory-ux-ui.md](./plano-refactory-ux-ui.md)

## Status Geral

- **Projeto alvo**: ui
- **Issue de origem**: Planejamento de Refactory UX/UI: Diretrizes e Plano de Execução
- **Data de início**: 2025-11-07
- **Fase RUP atual**: Inception (concluída) → Elaboration (próxima)
- **Responsável técnico**: Conforme docs/rup/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md
- **Plano detalhado de referência**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md

## Executive Summary

Este documento consolida o planejamento executivo para o refactory UX/UI do ui, estabelecendo estrutura de Design System APP (cores 60-30-10, tipografia 4x2, grid 8pt), arquitetura de componentes Atomic Design, e processo de implementação em 4 fases RUP distribuídas em 5 sprints (~280h estimadas).

**Objetivos principais**:
1. Consolidar Design System com tokens exportáveis
2. Refatorar 15+ componentes existentes e criar 20+ novos
3. Elevar acessibilidade para WCAG 2.2 AA (Lighthouse A11y ≥ 95)
4. Reduzir bundle de 420KB para <350KB mantendo funcionalidades
5. Atingir SUS ≥ 80 com usuários piloto

**Estado atual validado** (2025-11-07):
- ✅ Build passa sem erros
- ⚠️ Lint com 11 warnings (meta: ≤5)
- ❌ Tokens de design não padronizados
- ❌ Componentes com classes inline repetidas
- ❌ Ausência de Design System documentado

**Próximos passos imediatos**: Aprovação de governança → Sprint 2 (Elaboration) → Refatoração de tokens e documentação.

## Referências Completas

Para detalhamento completo de cada seção, consultar:
- **Diagnóstico e Stack**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seções 1, 4)
- **Metodologias**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 3)
- **Design System Tokens**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 4), AGENTS.md (regras 603010, 4x2, 8pt Grid)
- **Arquitetura de Componentes**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 5)
- **Acessibilidade**: docs/rup/06-ux-brand/acessibilidade.md, docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 6)
- **Processo RUP**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 8)
- **Backlog**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 11)
- **Métricas**: docs/rup/99-anexos/MVP/plano-improve-ux-ui.md (seção 13)

## Backlog Estruturado (35 tarefas)

### Prioridade 1 — Foundation (Sprint 2: Elaboration)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
DS-001 | Refatorar tailwind.config.js com tokens completos (cores, tipografia, spacing) | 8h | 🔜 Próximo
DS-002 | Criar design-tokens.ts exportável (fonte de verdade) | 4h | 🔜 Próximo
DS-003 | Atualizar index.css com CSS custom properties (dark mode) | 4h | 🔜 Próximo
DS-004 | Documentar Design System em docs/rup/06-ux-brand/design-system-dominio-spec.md | 16h | 🔜 Próximo
DS-005 | Criar guia de contribuição para componentes (README templates) | 8h | 🔜 Próximo

**Sprint 2 Total**: 40h, 5 tarefas

### Prioridade 2 — Atoms (Sprint 3: Construction Foundation)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
COMP-001 | Button.tsx com variants (primary, secondary, ghost, danger) | 6h | ⏸️ Aguardando DS
COMP-002 | Input.tsx base (text, email, password) | 4h | ⏸️ Aguardando DS
COMP-003 | Label.tsx com suporte a required indicator | 2h | ⏸️ Aguardando DS
COMP-004 | Badge.tsx (chip/tag) com variants | 3h | ⏸️ Aguardando DS
COMP-005 | Icon.tsx (wrapper Material Symbols) | 3h | ⏸️ Aguardando DS
COMP-006 | Spinner.tsx com tamanhos | 2h | ⏸️ Aguardando DS

### Prioridade 3 — Layout (Sprint 3: Construction Foundation)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
LAY-001 | AppShell.tsx (header, main, bottom nav) | 8h | ⏸️ Aguardando DS
LAY-002 | AuthLayout.tsx (login, signup) | 4h | ⏸️ Aguardando DS
LAY-003 | DashboardLayout.tsx (app logado) | 6h | ⏸️ Aguardando DS
LAY-004 | Refatorar BottomNavigation com tokens | 6h | ⏸️ Aguardando DS
LAY-005 | AppHeader com dark mode toggle | 10h | ⏸️ Aguardando DS

**Sprint 3 Total**: 54h, 11 tarefas (atoms + layout)

### Prioridade 4 — Molecules (Sprint 4: Construction Components)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
COMP-007 | TextField.tsx (Input + Label + Error) | 6h | ⏸️ Aguardando atoms
COMP-008 | Select.tsx customizado | 8h | ⏸️ Aguardando atoms
COMP-009 | SearchBar.tsx com ícone e clear | 4h | ⏸️ Aguardando atoms
COMP-010 | Card.tsx base (header, body, footer) | 6h | ⏸️ Aguardando atoms
COMP-011 | Refatorar LoteCard com Card base | 8h | ⏸️ Aguardando COMP-010

### Prioridade 5 — Organisms (Sprint 4: Construction Components)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
COMP-012 | FilterPanel.tsx (collapse, chips) | 12h | ⏸️ Aguardando molecules
COMP-013 | Gallery.tsx acessível (carrossel keyboard) | 10h | ⏸️ Aguardando atoms
COMP-014 | Refatorar MapWithMarkers com tokens | 8h | ⏸️ Aguardando DS

**Sprint 4 Total**: 62h, 9 tarefas (molecules + organisms)

### Prioridade 6 — Pages (Sprint 5: Construction Pages)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
PAGE-001 | Refatorar LoginPage com AuthLayout | 8h | ⏸️ Aguardando LAY-002
PAGE-002 | Refatorar HomePage com DashboardLayout | 12h | ⏸️ Aguardando LAY-003
PAGE-003 | Refatorar ListarLotesPage (filtros, mapa, grid) | 14h | ⏸️ Aguardando COMP-012
PAGE-004 | Refatorar DetalhesLotePage (gallery, sections) | 12h | ⏸️ Aguardando COMP-013
PAGE-005 | Refatorar CriarLotePage (wizard steps) | 14h | ⏸️ Aguardando molecules

**Sprint 5 Total**: 60h, 5 tarefas

### Prioridade 7 — QA e Docs (Transition: Contínua)
**ID** | **Título** | **Estimativa** | **Status**
--- | --- | --- | ---
QA-001 | Testes E2E críticos (Playwright) | 12h | ⏸️ Aguardando pages
QA-002 | Auditoria axe-core em todas as páginas | 6h | ⏸️ Aguardando pages
QA-003 | Lighthouse CI em pipeline | 4h | ⏸️ Aguardando pages
DOC-001 | Atualizar docs/rup/04-testes-e-validacao/ | 6h | ⏸️ Aguardando QA
DOC-002 | Criar Storybook ou catálogo alternativo | 16h | ⏸️ Aguardando components
DOC-003 | Atualizar changelogs com entregas | 4h | ⏸️ Contínuo

**Transition Total**: 48h, 6 tarefas

**TOTAL GERAL**: 264h (~33 dias úteis para 1 dev, ~17 dias úteis para 2 devs)

## Cronograma Proposto

**Sprint 1 (Inception)**: ✅ Concluído (2025-11-07)
- Inventário, diagnóstico, planejamento, documentação

**Sprint 2 (Elaboration)**: 🔜 Semanas 1-2
- DS-001 a DS-005 (Foundation)
- Entrega: Tokens + Documentação Design System

**Sprint 3 (Construction - Foundation)**: Semanas 3-4
- COMP-001 a COMP-006 (Atoms)
- LAY-001 a LAY-005 (Layout)
- Entrega: Componentes base + Layout shell

**Sprint 4 (Construction - Components)**: Semanas 5-6
- COMP-007 a COMP-014 (Molecules + Organisms)
- Entrega: Componentes complexos + Refatorações

**Sprint 5 (Construction - Pages)**: Semanas 7-8
- PAGE-001 a PAGE-005 (Pages refactor)
- Entrega: Telas refatoradas

**Transition (Contínua)**: Semanas 8-9
- QA-001 a DOC-003 (QA + Docs finais)
- Entrega: Validações + Documentação completa

## Critérios de Aceitação Resumidos

### Fase Elaboration (Sprint 2)
- [ ] tailwind.config.js com tokens 603010, 4x2, 8pt Grid
- [ ] design-tokens.ts exportável e documentado
- [ ] index.css com CSS custom properties para dark mode
- [ ] docs/rup/06-ux-brand/design-system-dominio-spec.md completo
- [ ] Protótipos aprovados por governança

### Fase Construction (Sprints 3-5)
- [ ] 6 atoms criados e testados
- [ ] 5 layouts criados (AppShell, AuthLayout, DashboardLayout, Header, BottomNav refatorado)
- [ ] 8 molecules/organisms criados/refatorados
- [ ] 6 páginas refatoradas
- [ ] Lint ≤ 5 warnings
- [ ] Build < 350KB
- [ ] Testes unitários cobertura ≥ 70%

### Fase Transition
- [ ] Lighthouse A11y ≥ 95 em todas as páginas
- [ ] axe-core sem erros críticos
- [ ] Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1
- [ ] SUS ≥ 80 com 10+ usuários piloto
- [ ] Documentação RUP atualizada
- [ ] Storybook ou catálogo publicado

## Riscos e Mitigações

**RISK-UX-001**: Escopo creep (adição de features não planejadas)
- **Mitigação**: Aprovar qualquer mudança com governança, manter backlog priorizado
- **Impacto**: Alto (pode atrasar 2-3 sprints)
- **Probabilidade**: Média

**RISK-UX-002**: Incompatibilidade de dependências ao refatorar
- **Mitigação**: Refatorar incrementalmente, manter testes passando
- **Impacto**: Médio (1 sprint de re-trabalho)
- **Probabilidade**: Baixa

**RISK-UX-003**: Regressão de acessibilidade em páginas não testadas
- **Mitigação**: Auditoria axe-core em todas as páginas, não apenas refatoradas
- **Impacto**: Alto (bloqueio de release)
- **Probabilidade**: Média

**RISK-UX-004**: Dark mode inconsistente entre componentes
- **Mitigação**: Tokens CSS custom properties desde início, validação visual manual
- **Impacto**: Médio (re-trabalho de estilo)
- **Probabilidade**: Média

## Aprovações Necessárias

- [ ] **Governança Técnica**: Aprovar estrutura de tokens e arquitetura de componentes
- [ ] **UX Lead**: Aprovar Design System e protótipos hi-fi
- [ ] **Product Owner**: Aprovar priorização de backlog e cronograma
- [ ] **Tech Lead**: Aprovar estimativas e alocação de recursos

## Histórico de Atualizações

### 2025-11-07 (Inception - v1.0)
- Criação inicial do documento evolutivo
- Análise completa de stack e componentes existentes
- Definição de backlog em 35 tarefas priorizadas
- Estabelecimento de cronograma em 5 sprints
- Identificação de 4 riscos principais
- Documentação de critérios de aceitação por fase

---

**Documento vivo**: Este arquivo será atualizado a cada sprint com progresso, decisões e ajustes.
**Próxima revisão**: Após aprovação de governança (Sprint 2 kickoff)
**Contato**: Conforme docs/rup/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md
