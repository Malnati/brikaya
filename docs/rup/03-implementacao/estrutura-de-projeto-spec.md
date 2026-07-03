<!-- docs/rup/03-implementacao/estrutura-de-projeto-spec.md -->
# Estrutura de Projeto — Brikaya

## Visão Geral
Este documento descreve como o código do Brikaya está organizado para manter alta coesão, baixa dependência externa e suporte total ao modo offline. A estrutura reflete o layout definido em `AGENTS.md` e serve como referência para novos módulos e testes.

## Diretórios Principais
- `src/components/` — componentes React do HUD e da interface de jogo (`Game`, `GameLogViewer`, `CollisionStats`).
- `src/logic/` — motores e regras centrais (`GameEngine.ts`).
- `src/objects/` — entidades do jogo (`Ball.ts`, `Bricks.ts`, `Paddle.ts`).
- `src/storage/` — persistência em IndexedDB para pontuação e logs.
- `src/utils/` — utilitários como rastreamento de colisões e carregamento de assets.
- `src/constants/` — valores configuráveis do jogo (velocidades, tamanhos, assets locais).
- `public/` — assets estáticos usados pelo service worker e pela PWA.
- `docs/` — documentação RUP e anexos, incluindo este arquivo.

## Fluxo de Build e Deploy
1. **Desenvolvimento**: `npm run dev` via Vite; registrar service worker com `registerServiceWorker.ts` para testar offline.
2. **Build**: `npm run build` gera artefatos para PWA; `make build-pwa` prepara saída para Capacitor.
3. **Nativo**: `make build-all` + `make ios`/`make android` empacotam a PWA.
4. **Cache**: `sw.js` deve ser atualizado sempre que novos assets ou constantes mudarem para evitar divergência.

## Convenções de Código
- Constantes de configuração declaradas no topo dos arquivos ou em `src/constants`.
- Nenhum acesso de rede após o primeiro carregamento; assets e fontes sempre locais.
- Imports agrupados no topo dos arquivos conforme política de `imports.mdc`.
- Código morto e dependências não utilizadas devem ser removidos após refatorações.

## Integração com Testes
- Estrutura de testes deve espelhar os domínios acima (`tests/unit`, `tests/integration`, `tests/e2e`).
- Mocks de IndexedDB e service worker devem ficar próximos dos testes de persistência/offline.

## Rastreabilidade
- Plano: `../99-anexos/plano-desenvolvimento-proximos-passos.md`
- Visão: `../00-visao/jogo-brickbreaker-spec.md`
- Arquitetura: `../01-arquitetura/arquitetura-jogo-spec.md`
- Testes: `./testes-spec.md`
