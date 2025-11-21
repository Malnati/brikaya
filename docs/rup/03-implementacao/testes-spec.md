<!-- docs/rup/03-implementacao/testes-spec.md -->
# Estratégia de Testes na Implementação — BrickBreaker

## Objetivo
Definir cobertura mínima e tipos de teste para validar engine, UI e infraestrutura offline do BrickBreaker, conforme roadmap (#001–#004) e fases descritas no plano de desenvolvimento.

## Escopo Prioritário (Fase 1)
- **Engine**: colisões, multiplicação de bolinhas, penalidade de linha extra, limites de canvas.
- **Persistência**: gravação e leitura de pontuações (`src/storage/score.ts`) e logs (`src/storage/gameLogger.ts`).
- **PWA offline**: registro do service worker, precache de assets e fallback cache-first.
- **Interface**: renderização do canvas, HUD de pontuação/vidas e exibição de logs.

## Suites Recomendadas
### Testes Unitários (Vitest/Testing Library)
1. `GameEngine.spec.ts` — valida cálculo de ângulos, colisões, criação de bolinhas extras e aplicação da penalidade.
2. `scoreStorage.spec.ts` — garante persistência e recuperação de pontuação, incluindo cenários de falha.
3. `gameLogger.spec.ts` — verifica serialização de eventos e limite de tamanho do log.
4. `GameUI.spec.tsx` — assegura que HUD reflete estado da engine e que controles respondem a teclado/toque.

### Testes de Integração
- Simular partida completa com gravação de pontuação e logs no IndexedDB utilizando mocks de armazenamento.
- Verificar interação entre `assetLoader`, service worker e componentes para carregamento offline.

### Testes E2E (Puppeteer)
- Fluxo completo de gameplay básico (start → destruição de tijolos → game over) com captura de evidências.
- Validação do modo offline: carregar o jogo, habilitar offline no navegador, garantir continuidade do gameplay e leitura de logs.
- Execução obrigatória em Android/iOS simulados nas fases #009–#012.

## Automação e Relatórios
- Scripts `npm run test` e `npm run build` devem ser orquestrados via `Makefile` em pipelines CI.
- Resultados de testes E2E devem gerar evidências em `tmp/screenshots/` e serem referenciados em relatórios de QA.
- Falhas críticas precisam abrir item no `PENDING.md` com link para issue correspondente.

## Critérios de Aceite
- Cobertura mínima de 60% na Fase 1 e evolução para 80% antes da release 1.0.0.
- Zero regressões conhecidas em mecânicas principais (movimento, colisão, multiplicação e penalidade).
- Tests de offline garantindo que todas as requisições são atendidas via cache após primeiro load.

## Rastreabilidade
- Plano: `../99-anexos/plano-desenvolvimento-proximos-passos.md`
- Arquitetura: `../01-arquitetura/arquitetura-jogo-spec.md`
- Design: `../02-design/gameplay-mecanicas-spec.md`
