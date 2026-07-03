<!-- docs/rup/99-anexos/plano-desenvolvimento-proximos-passos.md -->
# Plano de Desenvolvimento - Próximos Passos

## Propósito
Este documento estabelece o roadmap completo para o desenvolvimento do Brikaya, baseado na análise do estado atual do projeto, histórico de commits e pendências identificadas.

## Análise do Estado Atual

### ✅ O que está funcionando
- Jogo Brikaya básico implementado
- Sistema de logging com IndexedDB funcional
- Estrutura de componentes React/TypeScript organizada
- Sistema de pontuação persistente
- Service Worker para PWA
- Build com Vite e suporte a Capacitor
- Infraestrutura Docker configurada

### ⚠️ Problemas identificados
- Sistema de logging foi reativado recentemente (commit d782c83) após estar comentado
- **Testes básicos implementados** - Testes unitários para GameEngine criados e funcionando (9 testes passando)
- Framework de testes configurado (Jest) ✅
- Issues do GitHub não criadas para rastreamento
- PENDING.md desatualizado em relação ao plano atual

### 🎮 Features implementadas
- Multiplicação de bolinhas
- Penalidade de linha extra ao errar blocos
- Sistema de pontuação persistente

### 🚧 Pendências críticas
- ✅ Configurar framework de testes (Jest) - CONCLUÍDO
- ⚠️ Implementar suíte completa de testes unitários/integração/E2E - EM PROGRESSO
  - ✅ Testes unitários básicos para GameEngine (9 testes passando)
  - ⏳ Testes de integração para sistema de logging - PENDENTE
  - ⏳ Testes para componentes React - PENDENTE
  - ⏳ Testes E2E para gameplay básico - PENDENTE
- Testes E2E para plataformas nativas - PENDENTE
- Validação completa do sistema de logging - EM PROGRESSO
- Criar issues no GitHub para rastreamento - PENDENTE

## Plano Estruturado

### FASE 1: ESTABILIZAÇÃO E QUALIDADE (Sprints 1-2)

#### 1.1 Testes Automatizados
**Priority:** Alta
**Status:** ⚠️ EM PROGRESSO
**Issues GitHub:** 
- `#001`: ✅ Criar suíte de testes unitários para GameEngine - **CONCLUÍDO** (9 testes passando)
- `#002`: ✅ Implementar testes de integração para sistema de logging - **CONCLUÍDO** (5 testes passando)
- `#003`: ✅ Criar testes E2E para gameplay básico - **CONCLUÍDO** (QA publicado `test:cloudflare-gameplay-basic`)
- `#004`: ✅ Testar funcionalidade offline da PWA - **CONCLUÍDO** (QA publicado `test:cloudflare-offline-pwa`)

**Progresso atual:**
- ✅ Jest configurado e funcionando
- ✅ Testes unitários básicos para GameEngine implementados e passando (9 testes)
- ✅ Testes de integração para gameLogger implementados e passando (5 testes)
- ✅ Mocks adequados para Paddle, Ball, Bricks, AssetLoader e gameLogger
- ✅ Total: 14 testes passando
- ✅ QA publicado para gameplay básico com pontuação e eventos mínimos
- ✅ QA publicado para funcionamento offline após primeiro carregamento
- ⏳ Testes para componentes React pendentes (Game.tsx, GameLogViewer.tsx, CollisionStats.tsx)
- ⏳ Testes para objetos do jogo pendentes (Ball.ts, Bricks.ts, Paddle.ts)
- ⏳ Cobertura atual: ~18% (meta: >80%)

#### 1.2 Validação do Sistema de Logging
**Priority:** Alta  
**Actions:**
- Validar todas as chamadas de log reativadas
- Testar persistência no IndexedDB
- Verificar performance dos logs
- Documentar eventos de jogo no RUP

#### 1.3 Atualização RUP Específica
**Priority:** Média
**Status:** ✅ CONCLUÍDO
**Documents created:**
- ✅ `docs/rup/00-visao/jogo-brickbreaker-spec.md` - Visão do produto, público-alvo e objetivos
- ✅ `docs/rup/01-arquitetura/arquitetura-jogo-spec.md` - Arquitetura da engine, objetos e persistência
- ✅ `docs/rup/02-design/gameplay-mecanicas-spec.md` - Mecânicas de gameplay, física e interface

### FASE 2: ENHANCEMENTS E FEATURES (Sprints 3-4)

#### 2.1 Melhorias no Gameplay
**Priority:** Média
**Issues GitHub:**
- `#005`: ✅ Implementar sistema de níveis progressivos - **CONCLUÍDO** (linhas/blocos aumentam por fase e QA publicado `test:cloudflare-level-progression`)
- `#006`: ✅ Adicionar power-ups e especiais - **CONCLUÍDO** (telemetria `power_up`, Laser em leque e QA publicado `test:cloudflare-powerups`)
- `#007`: ✅ Criar sistema de high-scores global - **CONCLUÍDO como recordes gerais locais** (ranking no dispositivo, sem rede externa, QA publicado `test:cloudflare-high-scores`)
- `#008`: ✅ Implementar efeitos visuais e sonoros - **CONCLUÍDO** (overlays SVG locais, áudio local, QA `test:cloudflare-cinematic-effects` e `test:cloudflare-audio`)

#### 2.2 Otimização e Performance
**Priority:** Média
**Actions:**
- Otimizar renderização do canvas
- Implementar lazy loading para assets
- Otimizar service worker
- Reduzir bundle size

### FASE 3: PLATAFORMAS NATIVAS E RELEASE (Sprints 5-6)

#### 3.1 Builds Nativos
**Priority:** Alta
**Issues GitHub:**
- `#009`: Configurar build iOS via Capacitor
- `#010`: Configurar build Android via Capacitor
- `#011`: Implementar testes E2E para plataformas nativas
- `#012`: Criar processo de CI/CD para builds

#### 3.2 Release e Distribuição
**Priority:** Média
**Actions:**
- Preparar assets para app stores
- Criar documentação de deployment
- Implementar analytics básico
- Preparar versão 1.0.0

## Atualizações RUP Necessárias

### Documentos a Criar:

#### 1. docs/rup/00-visao/
- `jogo-brickbreaker.md` (template)
- `jogo-brickbreaker-spec.md` (escopo, objetivos, público)

#### 2. docs/rup/01-arquitetura/
- `arquitetura-jogo.md` (template)
- `arquitetura-jogo-spec.md` (GameEngine, física, renderização)

#### 3. docs/rup/02-design/
- `gameplay-mecanicas.md` (template)
- `gameplay-mecanicas-spec.md` (regras, níveis, power-ups)

#### 4. docs/rup/03-implementacao/testes-spec.md
- Adaptar para contexto de jogo (remover referências fintech)

### Documentos a Atualizar:
- `docs/rup/03-implementacao/estrutura-de-projeto-spec.md`
- `docs/rup/04-qualidade-testes/criterios-de-aceite-spec.md`
- `docs/rup/99-anexos/checklists/006-implementacao-padroes-checklist.md`

## Issues GitHub - Estrutura

### Template de Issue:
```markdown
## Título: [Feature/Fix/Hotfix] Descrição clara

### Tipo
- [ ] Feature
- [ ] Bug Fix  
- [ ] Hotfix
- [ ] Enhancement

### Prioridade
- [ ] Alta
- [ ] Média
- [ ] Baixa

### Descrição
Detalhamento completo da tarefa

### Critérios de Aceite
- [ ] Critério 1
- [ ] Critério 2

### Dependências
- Issue #XXX

### Rastreabilidade RUP
- REQ-XXX (se aplicável)

### Testes
- [ ] Unitários
- [ ] Integração
- [ ] E2E
```

## Integração com AGENTS.md

### Agents a Utilizar:

#### 1. Codex Builder
- Gerar testes unitários para GameEngine
- Criar documentação RUP específica
- Implementar novas features de gameplay

#### 2. Codex Reviewer  
- Revisar qualidade dos testes criados
- Validar aderência aos padrões do projeto
- Verificar conformidade com regras de offline

#### 3. E2E Test Agent
- Criar suítes de testes E2E
- Implementar testes para plataformas nativas
- Validar funcionalidade offline

#### 4. Audit Agent
- Auditar conformidade com AGENTS.md
- Validar estrutura RUP atualizada
- Verificar qualidade da documentação

## Cronograma Sugerido

### Sprint 1 (2 semanas)
- Setup de testes unitários
- Validação sistema de logging  
- Criação issues #001-#004

### Sprint 2 (2 semanas)
- Implementação testes integração
- Início documentação RUP específica
- Issues #005-#006

### Sprint 3 (2 semanas)
- Features gameplay
- Otimizações de performance
- Issues #007-#008

### Sprint 4 (2 semanas)
- Builds nativos
- Testes E2E plataformas nativas
- Issues #009-#012

## Métricas de Sucesso

### Qualidade:
- Cobertura de testes > 80%
- Zero bugs críticos em produção
- Performance < 100ms para interações

### Entrega:
- Releases a cada 2 semanas
- Documentação 100% atualizada
- Issues resolvidas dentro do sprint

### Produto:
- Gameplay fluido e responsivo
- Funcionamento 100% offline
- Builds nativos estáveis

## Próximas Ações Imediatas

1. ⏳ Criar issues #001-#004 no GitHub
2. ✅ Configurar estrutura de testes (Jest) - **CONCLUÍDO**
3. ✅ Iniciar documentação RUP específica - **CONCLUÍDO**
4. ⚠️ Validar sistema de logging atual - **EM PROGRESSO**
5. ⚠️ Continuar Sprint 1 com foco em testes - **EM PROGRESSO**
   - ✅ Testes unitários básicos GameEngine
   - ⏳ Testes de integração para logging
   - ⏳ Testes para componentes React

## Rastreabilidade

- **Baseado em:** Análise de commits, logs e documentação atual
- **Referências:** AGENTS.md, PENDING.md, CHANGELOG.md
- **Atualização:** 2026-07-03
- **Última revisão:** 2026-07-03 - QA publicado de gameplay básico e offline da PWA implementados
- **Responsável:** Equipe de desenvolvimento Brikaya

---

Este plano proporciona uma roadmap clara para estabilizar, melhorar e preparar o Brikaya para release, seguindo as diretrizes do AGENTS.md e mantendo a qualidade e documentação adequadas.
