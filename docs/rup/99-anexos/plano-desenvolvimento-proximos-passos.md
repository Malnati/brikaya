<!-- docs/rup/99-anexos/plano-desenvolvimento-proximos-passos.md -->
# Plano de Desenvolvimento - Próximos Passos

## Propósito
Este documento estabelece o roadmap completo para o desenvolvimento do BrickBreaker, baseado na análise do estado atual do projeto, histórico de commits e pendências identificadas.

## Análise do Estado Atual

### ✅ O que está funcionando
- Jogo BrickBreaker básico implementado
- Sistema de logging com IndexedDB funcional
- Estrutura de componentes React/TypeScript organizada
- Sistema de pontuação persistente
- Service Worker para PWA
- Build com Vite e suporte a Capacitor
- Infraestrutura Docker configurada

### ⚠️ Problemas identificados
- Sistema de logging foi reativado recentemente (commit d782c83) após estar comentado
- **ZERO testes unitários/integração no diretório src**
- Documentação RUP genérica, não específica para jogo
- Pendências não priorizadas no PENDING.md
- Issues do GitHub não criadas para rastreamento

### 🎮 Features implementadas
- Multiplicação de bolinhas
- Penalidade de linha extra ao errar blocos
- Sistema de pontuação persistente

### 🚧 Pendências críticas
- Testes E2E para plataformas nativas
- Validação completa do sistema de logging
- Documentação específica do jogo

## Plano Estruturado

### FASE 1: ESTABILIZAÇÃO E QUALIDADE (Sprints 1-2)

#### 1.1 Testes Automatizados
**Priority:** Alta
**Issues GitHub:** 
- `#001`: Criar suíte de testes unitários para GameEngine
- `#002`: Implementar testes de integração para sistema de logging
- `#003`: Criar testes E2E para gameplay básico
- `#004`: Testar funcionalidade offline da PWA

#### 1.2 Validação do Sistema de Logging
**Priority:** Alta  
**Actions:**
- Validar todas as chamadas de log reativadas
- Testar persistência no IndexedDB
- Verificar performance dos logs
- Documentar eventos de jogo no RUP

#### 1.3 Atualização RUP Específica
**Priority:** Média
**Documents to create:**
- `docs/rup/00-visao/jogo-brickbreaker-spec.md`
- `docs/rup/01-arquitetura/arquitetura-jogo-spec.md`
- `docs/rup/02-design/gameplay-mecanicas-spec.md`

### FASE 2: ENHANCEMENTS E FEATURES (Sprints 3-4)

#### 2.1 Melhorias no Gameplay
**Priority:** Média
**Issues GitHub:**
- `#005`: Implementar sistema de níveis progressivos
- `#006`: Adicionar power-ups e especiais
- `#007`: Criar sistema de high-scores global
- `#008`: Implementar efeitos visuais e sonoros

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

1. Criar issues #001-#004 no GitHub
2. Configurar estrutura de testes (Jest/Vitest)
3. Iniciar documentação RUP específica
4. Validar sistema de logging atual
5. Começar Sprint 1 com foco em testes

## Rastreabilidade

- **Baseado em:** Análise de commits, logs e documentação atual
- **Referências:** AGENTS.md, PENDING.md, CHANGELOG.md
- **Atualização:** 2025-11-20
- **Responsável:** Equipe de desenvolvimento BrickBreaker

---

Este plano proporciona uma roadmap clara para estabilizar, melhorar e preparar o BrickBreaker para release, seguindo as diretrizes do AGENTS.md e mantendo a qualidade e documentação adequadas.