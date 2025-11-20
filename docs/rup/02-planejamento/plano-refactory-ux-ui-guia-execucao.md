<!-- docs/rup/02-planejamento/plano-refactory-ux-ui-guia-execucao.md -->
# Guia de Execução — Refactory UX/UI do ui

> Este documento fornece orientação prática e passo a passo para executar o refactory planejado.  
> **Plano completo**: [plano-refactory-ux-ui-spec.md](./plano-refactory-ux-ui-spec.md)

## 🎯 Objetivo

Transformar o ui de um MVP funcional em uma aplicação com Design System consolidado, componentes reutilizáveis e acessibilidade WCAG 2.2 AA, preparando o terreno para escalabilidade e futuras features PWA.

## 📊 Status Atual (2025-11-07)

### ✅ Concluído (Fase Inception)
- Inventário completo de componentes e páginas existentes
- Análise de pain points e gaps de acessibilidade
- Definição de backlog estruturado (35 tarefas)
- Documentação de planejamento RUP
- Validação de build e lint do projeto

### 🔜 Próximo (Fase Elaboration - Sprint 2)
- Refatoração de tokens de design (Tailwind config)
- Criação de design-tokens.ts (fonte de verdade)
- Documentação completa do Design System APP
- Protótipos hi-fi para validação

## 📋 Checklist de Pré-requisitos

Antes de iniciar a implementação, garanta que:

- [ ] **Aprovações obtidas**:
  - [ ] Governança técnica aprovou estrutura de tokens
  - [ ] UX Lead aprovou diretrizes de Design System
  - [ ] Product Owner aprovou priorização do backlog
  - [ ] Tech Lead aprovou estimativas e alocação

- [ ] **Ambiente configurado**:
  - [ ] Node.js ≥ 18.x instalado
  - [ ] npm ou pnpm atualizado
  - [ ] `app/ui/` clonado e dependências instaladas (`npm install`)
  - [ ] Build passa (`npm run build`)
  - [ ] Lint passa com ≤10 warnings (`npm run lint`)

- [ ] **Documentação revisada**:
  - [ ] Lido [plano-refactory-ux-ui-spec.md](./plano-refactory-ux-ui-spec.md)
  - [ ] Lido [docs/rup/99-anexos/MVP/plano-improve-ux-ui.md](../99-anexos/MVP/plano-improve-ux-ui.md)
  - [ ] Revisado AGENTS.md (regras 603010, 4x2, 8pt Grid)
  - [ ] Consultado [diretrizes-de-ux-spec.md](../06-ux-brand/diretrizes-de-ux-spec.md)

## 🏗️ Roadmap de Execução

### Sprint 2: Elaboration (Semanas 1-2, 40h)

#### DS-001: Refatorar tailwind.config.js (8h)
**Objetivo**: Substituir valores arbitrários por tokens semânticos

**Passos**:
1. Backup do arquivo atual: `cp tailwind.config.js tailwind.config.js.backup`
2. Implementar paleta de cores completa (primary, neutral, error, warning, info, success)
3. Adicionar escala tipográfica 4x2 (fontSize, fontWeight, fontFamily)
4. Configurar spacing 8pt Grid (múltiplos de 4 e 8)
5. Definir borderRadius, boxShadow, transitionDuration
6. Testar build: `npm run build`
7. Validar que páginas ainda renderizam sem quebras

**Arquivo de saída**: `app/ui/tailwind.config.js` (refatorado)

**Critério de aceite**:
- [ ] Paleta com escalas 50-950 para primary, neutral, error, warning, info
- [ ] Todas as cores com contraste WCAG AA validado
- [ ] Spacing apenas com múltiplos de 4 ou 8
- [ ] Build passa sem erros

#### DS-002: Criar design-tokens.ts (4h)
**Objetivo**: Fonte de verdade exportável para tokens

**Passos**:
1. Criar `app/ui/src/tokens/design-tokens.ts`
2. Exportar objetos TypeScript para colors, typography, spacing, shadows, motion
3. Adicionar JSDoc com descrição de uso de cada token
4. Criar scripts de validação (ex: contraste de cores)
5. Importar em `tailwind.config.js` para sincronização

**Arquivo de saída**: `app/ui/src/tokens/design-tokens.ts`

**Critério de aceite**:
- [ ] Tokens exportados e tipados (TypeScript)
- [ ] Documentação inline (JSDoc) para cada grupo
- [ ] Sincronizado com tailwind.config.js
- [ ] Validação de contraste passa

#### DS-003: Atualizar index.css (4h)
**Objetivo**: CSS custom properties para dark mode e resets acessíveis

**Passos**:
1. Adicionar CSS reset acessível (normalize ou similar)
2. Criar variáveis CSS para tokens principais (`--color-primary-500`, `--spacing-4`, etc.)
3. Adicionar suporte a `prefers-reduced-motion`
4. Configurar estilos base para dark mode (`@media (prefers-color-scheme: dark)`)
5. Mover animações hardcoded para utilities reutilizáveis

**Arquivo de saída**: `app/ui/src/index.css` (refatorado)

**Critério de aceite**:
- [ ] CSS reset aplicado
- [ ] Variáveis CSS para cores, spacing, shadows
- [ ] `prefers-reduced-motion` respeitado
- [ ] Estilos base para dark mode

#### DS-004: Documentar Design System (16h)
**Objetivo**: Documentação completa e navegável

**Passos**:
1. Criar `docs/rup/06-ux-brand/design-system-dominio-spec.md`
2. Documentar paleta de cores com exemplos visuais
3. Documentar escala tipográfica com uso recomendado
4. Documentar grid 8pt e espaçamentos
5. Adicionar seção de iconografia (Material Symbols)
6. Criar catálogo de componentes (ou integrar Storybook)
7. Adicionar guias de acessibilidade (contraste, navegação)

**Arquivo de saída**: `docs/rup/06-ux-brand/design-system-dominio-spec.md`

**Critério de aceite**:
- [ ] Paleta documentada com códigos hex, uso e contraste
- [ ] Tipografia com exemplos de headings, body, captions
- [ ] Spacing com grid visual
- [ ] Seção de acessibilidade (WCAG AA)
- [ ] Catálogo de componentes iniciado

#### DS-005: Guia de Contribuição (8h)
**Objetivo**: Padronizar criação de novos componentes

**Passos**:
1. Criar `app/ui/src/components/README.md`
2. Documentar estrutura Atomic Design (atoms, molecules, organisms, templates)
3. Adicionar template de componente (`ComponentName.tsx`, testes, storybook)
4. Definir convenções de nomenclatura (PascalCase, sufixos)
5. Guia de props (interfaces, defaults, required)
6. Checklist de review (acessibilidade, tokens, testes)

**Arquivo de saída**: `app/ui/src/components/README.md`

**Critério de aceite**:
- [ ] Estrutura Atomic Design explicada
- [ ] Template de componente com exemplo
- [ ] Convenções de nomenclatura documentadas
- [ ] Checklist de review de componentes

### Sprint 3: Construction — Foundation (Semanas 3-4, 54h)

#### Atoms (COMP-001 a COMP-006)
**Componentes**: Button, Input, Label, Badge, Icon, Spinner

**Passos gerais**:
1. Criar arquivo `src/components/atoms/ComponentName.tsx`
2. Implementar com tokens (sem valores hardcoded)
3. Adicionar variants via props (size, variant, disabled, etc.)
4. Garantir acessibilidade (ARIA, keyboard navigation)
5. Criar testes unitários (`ComponentName.test.tsx`)
6. Adicionar story (se Storybook configurado)

**Critério de aceite (todos os atoms)**:
- [ ] Implementados com tokens de design
- [ ] Props tipadas (TypeScript interfaces)
- [ ] Acessibilidade validada (ARIA, keyboard)
- [ ] Testes unitários passando
- [ ] Documentação inline (JSDoc)

#### Layout (LAY-001 a LAY-005)
**Componentes**: AppShell, AuthLayout, DashboardLayout, AppHeader, BottomNavigation (refactor)

**Passos gerais**:
1. Criar templates base em `src/components/templates/`
2. Implementar com flex/grid responsivo
3. Integrar landmarks semânticos (`<header>`, `<main>`, `<nav>`, `<footer>`)
4. Adicionar skip links para acessibilidade
5. Refatorar páginas para usar layouts

**Critério de aceite (todos os layouts)**:
- [ ] Responsivos (mobile-first)
- [ ] Landmarks semânticos
- [ ] Skip links implementados
- [ ] Dark mode funcional (via CSS vars)
- [ ] Páginas refatoradas para usar templates

### Sprint 4: Construction — Components (Semanas 5-6, 62h)

#### Molecules (COMP-007 a COMP-011)
**Componentes**: TextField, Select, SearchBar, Card, LoteCard (refactor)

**Passos gerais**:
1. Compor atoms existentes (Input + Label + Error = TextField)
2. Implementar lógica de estado (useState, controlled components)
3. Adicionar validação inline (error messages)
4. Garantir acessibilidade (aria-describedby, aria-invalid)
5. Refatorar componentes existentes (LoteCard) para usar base (Card)

**Critério de aceite (todos os molecules)**:
- [ ] Composição de atoms
- [ ] Estados (default, hover, focus, disabled, error)
- [ ] Validação e mensagens de erro
- [ ] Acessibilidade completa
- [ ] Testes cobrindo states

#### Organisms (COMP-012 a COMP-014)
**Componentes**: FilterPanel, Gallery, MapWithMarkers (refactor)

**Passos gerais**:
1. Compor molecules e atoms
2. Implementar lógica complexa (filtros, carrossel, mapa)
3. Adicionar interatividade avançada (collapse, swipe, zoom)
4. Garantir navegação por teclado
5. Refatorar MapWithMarkers para remover inline styles

**Critério de aceite (todos os organisms)**:
- [ ] Composição de molecules/atoms
- [ ] Interatividade completa (mouse + keyboard)
- [ ] Acessibilidade (ARIA live regions, roles)
- [ ] Performance otimizada (lazy loading, memoization)
- [ ] Testes E2E para fluxos críticos

### Sprint 5: Construction — Pages (Semanas 7-8, 60h)

#### Pages (PAGE-001 a PAGE-005)
**Páginas**: LoginPage, HomePage, ListarLotesPage, DetalhesLotePage, CriarLotePage

**Passos gerais**:
1. Substituir classes inline por componentes
2. Aplicar layout templates (AuthLayout, DashboardLayout)
3. Integrar molecules/organisms refatorados
4. Validar fluxos completos (login → home → detalhes → compra)
5. Otimizar performance (lazy loading, code splitting)

**Critério de aceite (todas as páginas)**:
- [ ] Zero classes inline (100% componentes)
- [ ] Layout templates aplicados
- [ ] Navegação por teclado completa
- [ ] Loading states consistentes (skeletons)
- [ ] Testes E2E de fluxos críticos

### Transition: QA e Docs (Semanas 8-9, 48h)

#### QA (QA-001 a QA-003)
**Tarefas**: Testes E2E, auditoria axe-core, Lighthouse CI

**Passos**:
1. Implementar testes E2E com Playwright (login, criar lote, comprar)
2. Rodar axe-core em todas as páginas, corrigir erros críticos
3. Configurar Lighthouse CI no GitHub Actions
4. Validar métricas: LCP <2.5s, INP <200ms, A11y ≥95

**Critério de aceite**:
- [ ] Testes E2E passando (fluxos críticos)
- [ ] axe-core sem erros críticos
- [ ] Lighthouse CI configurado
- [ ] Todas as métricas atendidas

#### Docs (DOC-001 a DOC-003)
**Tarefas**: Atualizar RUP, criar Storybook, changelogs

**Passos**:
1. Atualizar `docs/rup/04-testes-e-validacao/` com novos testes
2. Criar Storybook ou catálogo alternativo
3. Atualizar changelogs finais por sprint

**Critério de aceite**:
- [ ] docs/rup/ atualizado
- [ ] Storybook publicado (ou catálogo alternativo)
- [ ] Changelogs completos

## 🎨 Regras de Design Obrigatórias

### 603010 (Cores)
- **60%** superfície primária (verde APP, neutros claros)
- **30%** superfície secundária (neutros médios, cards)
- **10%** accent (CTAs, estados interativos, badges)

**Validação**: Ferramenta de proporção de cores ou auditoria visual

### 4x2 (Tipografia)
- **4 tamanhos**: xs (12px), sm (14px), base (16px), lg/xl/2xl/3xl (18-36px)
- **2 pesos**: normal (400), semibold (600)

**Validação**: Grep por font-size/font-weight fora da escala

### 8pt Grid (Espaçamento)
- Todos os valores de padding, margin, gap devem ser múltiplos de 4 ou 8
- Border radius: 4, 8, 12, 16, 24, 32, full

**Validação**: Lint customizado ou auditoria manual

## 🔍 Checklist de Validação por Tarefa

Antes de marcar qualquer tarefa como concluída:

- [ ] Código implementado com tokens (sem valores hardcoded)
- [ ] TypeScript strict (sem `any`, `@ts-ignore`)
- [ ] Acessibilidade validada (ARIA, keyboard, contraste)
- [ ] Testes escritos e passando (unit, E2E conforme aplicável)
- [ ] Documentação inline (JSDoc ou comentários)
- [ ] Build passa (`npm run build`)
- [ ] Lint ≤5 warnings (`npm run lint`)
- [ ] Screenshot "antes/depois" (para refatorações de UI)
- [ ] Changelog atualizado (se mudança significativa)

## 📈 Monitoramento de Progresso

### Métricas a Rastrear
- **Bundle size**: Meta <350KB (atual: 420KB)
- **Lint warnings**: Meta ≤5 (atual: 11)
- **Cobertura de testes**: Meta ≥70%
- **Lighthouse Performance**: Meta ≥85
- **Lighthouse A11y**: Meta ≥95

### Relatórios
- **Semanal**: Atualizar backlog no plano-refactory-ux-ui-spec.md
- **Por sprint**: Criar changelog em CHANGELOG/YYYYMMDDHHMMSS.md
- **Final (Transition)**: Relatório completo com antes/depois

## 🚨 Bloqueadores e Escalonamento

### Quando escalonar?
- Mudança de escopo (adicionar nova feature não planejada)
- Descoberta de bug crítico em dependência
- Necessidade de aprovar nova dependência externa
- Atraso >1 sprint vs. cronograma

### Para quem escalonar?
- **Tech Lead**: Questões técnicas, alocação de recursos
- **UX Lead**: Dúvidas de design, validação de protótipos
- **Product Owner**: Mudanças de escopo, priorização
- **Governança**: Riscos arquiteturais, segurança, compliance

## 📚 Referências Rápidas

### Documentação
- [Plano completo (spec)](./plano-refactory-ux-ui-spec.md)
- [Plano detalhado MVP](../99-anexos/MVP/plano-improve-ux-ui.md)
- [AGENTS.md — Regras UX](../../../AGENTS.md)
- [Diretrizes UX](../06-ux-brand/diretrizes-de-ux-spec.md)
- [Checklists](../99-anexos/checklists/)

### Ferramentas
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Dev**: `npm run dev`
- **Testes**: `npm test` (quando configurado)
- **Lighthouse**: `npx lighthouse http://localhost:5173`
- **axe-core**: Browser DevTools extension

### Comunidade e Suporte
- Issue tracker: GitHub Issues
- Discussões: GitHub Discussions (se habilitado)
- Documentação de contribuição: `docs/rup/07-contribuicao/`

---

**Última atualização**: 2025-11-07 (Inception)  
**Próxima revisão**: Após Sprint 2 (Elaboration) ou bloqueios significativos  
**Mantenedor**: Conforme docs/rup/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md
