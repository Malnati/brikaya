<!-- docs/rup/01-arquitetura/arquitetura-jogo-spec.md -->
# Arquitetura do BrickBreaker

## Visão Geral
O jogo é uma PWA React/TypeScript que roda totalmente offline após o primeiro carregamento. A arquitetura separa lógica de jogo (`src/logic/GameEngine.ts`), objetos (`src/objects/*.ts`), UI (`src/components/*.tsx`), persistência (`src/storage`) e infraestrutura offline (`sw.js`, `registerServiceWorker.ts`).

## Camadas Principais
- **Engine e Objetos** — `GameEngine` orquestra atualização de física, colisões e multiplicação de bolinhas, utilizando objetos `Ball`, `Bricks` e `Paddle`.
- **Interface** — Componentes React exibem HUD de pontuação, vidas e controles, renderizando o canvas principal do jogo.
- **Persistência e Logs** — IndexedDB armazena pontuações (`src/storage/score.ts`) e eventos (`src/storage/gameLogger.ts`) para análise posterior.
- **Offline e Assets** — Service Worker realiza precache do bundle, manifest e assets locais; `src/utils/assetLoader.ts` gerencia carregamento no primeiro acesso.
- **Builds Nativos** — Capacitor empacota a PWA para iOS e Android com base nos artefatos gerados pelo Vite.

## Fluxos Críticos
1. **Loop de jogo**: `GameEngine` atualiza estado com base no delta de tempo, calcula colisões, multiplica bolinhas quando necessário e sinaliza eventos de penalidade de linha extra.
2. **Persistência**: callbacks de eventos enviam pontuações e logs para IndexedDB; reidratação ocorre ao iniciar nova sessão para manter histórico.
3. **Offline-first**: service worker intercepta requisições e retorna assets do cache; queda de rede não afeta gameplay nem carregamento de sons/imagens.

## Qualidade e Observabilidade
- Métricas prioritárias: FPS médio, tempo de frame, tempo de carregamento inicial e tamanho do bundle.
- Logging obrigatório para eventos de início/fim de partida, multiplicação de bolinhas, linhas penalizadas e falhas inesperadas.
- Testes automatizados devem cobrir `GameEngine`, persistência de logs, renderização de componentes e registro do service worker (issues #001–#004).

## Riscos e Mitigações
- **Performance em dispositivos modestos**: manter cálculo de colisão O(n) otimizado e limitar partículas/efeitos durante Fase 1.
- **Divergência de cache**: revisar `sw.js` a cada alteração de asset e garantir invalidation via versionamento no Vite.
- **Perda de estado**: validar que writes no IndexedDB são idempotentes e que falhas não travam o loop principal.

## Rastreabilidade
- Roadmap: `docs/rup/99-anexos/plano-desenvolvimento-proximos-passos.md`
- Issues associadas: #001–#004 (testes), #005–#008 (gameplay), #009–#012 (builds nativos)
- Documentos relacionados: visão (`../00-visao/jogo-brickbreaker-spec.md`), design (`../02-design/gameplay-mecanicas-spec.md`), testes (`../03-implementacao/testes-spec.md`)
