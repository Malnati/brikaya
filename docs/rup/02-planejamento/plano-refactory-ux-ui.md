<!-- docs/rup/02-planejamento/plano-refactory-ux-ui.md -->
# Plano de Refactory UX/UI — Guia de Orientação

## Propósito

Este documento serve como modelo e guia para registrar planos de refactory de interface e experiência do usuário em projetos baseados no framework RUP. Ele estabelece a estrutura esperada, convenções e referências cruzadas necessárias.

## Como usar

1. Consulte o documento evolutivo correspondente (`plano-refactory-ux-ui-spec.md`) para acompanhar o planejamento vigente do refactory UX/UI do ui.
2. Este arquivo contém apenas instruções reutilizáveis e templates.
3. Ao iniciar um novo projeto ou refactory, copie este arquivo e crie um documento evolutivo específico seguindo a mesma estrutura.

## Estrutura Esperada de um Plano de Refactory UX/UI

Um plano completo deve conter as seguintes seções:

### 1. Contexto e Diagnóstico
- Stack tecnológica atual
- Análise de componentes existentes
- Pain points identificados
- Gaps de acessibilidade e responsividade
- Estado atual da documentação de Design System

### 2. Objetivos Estratégicos
- Metas de UX e UI
- Alinhamento com requisitos do produto
- Métricas de sucesso esperadas
- ROI esperado (tempo de desenvolvimento, consistência)

### 3. Metodologias e Frameworks
- Abordagens de design (Double Diamond, Atomic Design, etc.)
- Heurísticas e princípios (Nielsen, Norman, WCAG)
- Ferramentas de Design Ops
- Padrões de tokens (W3C Design Tokens, etc.)

### 4. Design System
- Estrutura de tokens (cores, tipografia, espaçamento, sombras, motion)
- Documentação e fonte de verdade
- Ferramentas de integração (Storybook, Figma, etc.)
- Conformidade com regras do AGENTS.md (603010, 4x2, 8pt Grid)

### 5. Arquitetura de Componentes
- Layout base e containers
- Hierarquia de componentes (Atomic Design)
- Componentes prioritários
- Responsividade e breakpoints

### 6. Acessibilidade e Conteúdo
- Conformidade WCAG
- ARIA e roles
- Navegação por teclado
- Microcopy e UX Writing
- Internacionalização (se aplicável)

### 7. Performance e Observabilidade
- Core Web Vitals
- Otimizações (lazy loading, code splitting)
- Métricas e analytics
- Monitoramento de UX

### 8. Processo de Execução
- Fases RUP (Inception, Elaboration, Construction, Transition)
- Sprints e cronograma
- Marcos e entregas incrementais
- Validação e feedback

### 9. Critérios de Aceitação
- Validações técnicas
- Conformidade com design
- Testes automatizados
- Auditorias de acessibilidade
- Revisões cruzadas

### 10. Guardrails para Implementação
- Checklists de entrada
- Validações automáticas
- Regras de código
- Proibições e restrições

### 11. Backlog Inicial
- Lista priorizada de tarefas
- Estimativas e dependências
- Responsáveis
- Links para issues/stories

### 12. Entregáveis
- Artefatos documentais
- Código e componentes
- Atualizações RUP
- Evidências de testes

### 13. Métricas de Sucesso
- KPIs de UX
- Métricas técnicas
- Performance
- Acessibilidade

## Relacionamentos e Referências Cruzadas

Um plano de refactory deve referenciar:

- **Requisitos**: `docs/rup/02-planejamento/especificacao-de-requisitos-spec.md`
- **Riscos**: `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md`
- **Design System**: `docs/rup/06-ux-brand/diretrizes-de-ux-spec.md`
- **Arquitetura**: `docs/rup/01-arquitetura/` (conforme aplicável)
- **Checklists**: `docs/rup/99-anexos/checklists/` (especialmente 004-design-experiencia-checklist.md e 010-ux-brand-checklist.md)
- **Planos MVP**: `docs/rup/99-anexos/MVP/` (planos específicos como PWA, mensagens, etc.)

## Conformidade com AGENTS.md

Todo plano de refactory UX/UI deve:

1. Seguir as regras de cores 60-30-10
2. Aplicar tipografia 4x2 (4 tamanhos, 2 pesos)
3. Respeitar grid 8pt para espaçamentos
4. Seguir princípio de Simplicidade Visual
5. Aplicar Regra de UX Writing
6. Documentar tokens de Design System
7. Garantir acessibilidade WCAG AA
8. Criar changelog com timestamp único
9. Atualizar documentação RUP correlata

## Como evoluir

- Registre cada decisão, sprint e entrega no documento evolutivo (`-spec.md`)
- Mantenha rastreabilidade com requisitos (REQ-###) e riscos (RISK-###)
- Cite fontes, responsáveis e datas
- Atualize métricas de sucesso conforme progresso
- Mantenha este arquivo apenas com instruções reutilizáveis

## Documento Evolutivo

[Plano de Refactory UX/UI — Especificação Evolutiva](./plano-refactory-ux-ui-spec.md)

## Referências

- AGENTS.md — Regras de UX (603010, 4x2, 8pt Grid, Simplicidade, UX Writing)
- docs/rup/99-anexos/MVP/plano-improve-ux-ui.md — Plano detalhado do ui
- docs/rup/06-ux-brand/diretrizes-de-ux-spec.md — Diretrizes vigentes
- docs/rup/99-anexos/checklists/ — Checklists de conformidade
