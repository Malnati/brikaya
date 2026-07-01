<!-- CHANGELOG.md -->
- Estrutura inicial do projeto criada com arquivos vazios e TODOs
- Implementação completa do jogo Breakout com suporte offline
- Resolvido conflitos para integrar mudancas da main

## [1.14.2] - 2026-07-01
### Corrigido
- Ícones locais do manifesto PWA substituídos por PNGs válidos para remover warning de imagem inválida no Chrome.
- Painéis de logs e colisões deixam de consultar IndexedDB quando fechados.
- `DebugLogger` serializa argumentos não clonáveis e não emite warnings quando o armazenamento de debug não está pronto.
- Debug periódico de cores no canvas fica limitado a localhost ou `?debugColors=1`.

### Testado
- Cobertura unitária para validade dos ícones, `DebugLogger`, painel de logs fechado e estatísticas de colisão fechadas.
- QA runtime update passa a falhar quando houver warnings/errors de console relevantes.

## [1.14.1] - 2026-07-01
### Documentado
- Tarefa Markdown para investigar warnings não bloqueantes do QA runtime update sem alterar Service Worker, gameplay, HUD ou cache.

## [1.14.0] - 2026-07-01
### Adicionado
- Atualização automática do PWA ao abrir, focar ou voltar para o jogo quando uma nova versão estiver disponível.
- `BUILD_ID` carimbado no `dist/sw.js` a cada build, com `CACHE_NAME` derivado da versão publicada.
- QA publicado `make cloudflare-runtime-update-qa` para validar troca de Service Worker na mesma URL sem refresh manual.

### Alterado
- Registro do Service Worker agora verifica atualizações em `load`, `pageshow`, `focus` e `visibilitychange`, aplica `skipWaiting` internamente e recarrega uma única vez por troca de controlador.
- Ativação do Service Worker remove caches antigos do BrickBreaker e recarrega clientes do mesmo origin apenas quando havia cache anterior.

## [1.13.0] - 2026-06-30
### Adicionado
- Controle de velocidade por fase com `maxSpeed`, `minSpeed`, `reductionPerBrick` e telemetria persistida em `speedState`.
- Override local de spawn inicial da Fase 1 com `initialSpawnSpeed` 3x, sem alterar `maxSpeed`, `minSpeed` ou `reductionPerBrick`.
- Logs, estatísticas e QA publicado para velocidade atual, tempo da fase, reduções por bloco e limite mínimo atingido.
- Tag/release de rollback `stable/pre-speed-control-2026-06-30` antes da feature.

### Alterado
- A bola agora inicia cada fase na velocidade máxima da fase e reduz por constante fixa a cada bloco destruído.
- A colisão com a raquete preserva o ângulo e apenas clampa a magnitude na faixa permitida da fase.
- Payloads de transição de fase, `gameLogger`, `collisionTracker`, painéis de logs/colisões e testes passaram a carregar tempos e velocidades.
- O HUD persistente foi compactado e tema, logs, colisões e zerar pontuação foram movidos para menu lateral fechado por padrão.

## [1.12.0] - 2026-06-30
### Adicionado
- Seletor visível de tema `Claro`/`Escuro`, com persistência local da preferência.
- Tokens CSS alinhados ao Design System Kinetic Neon e Kinetic High-Contrast sem dependências externas.
- QA publicado `make cloudflare-theme-qa` para validar tema, persistência, ausência de features fora de escopo e ausência de recursos externos.
- Documentação de escopo para impedir que protótipos do Design System criem funcionalidades não aprovadas.

### Alterado
- Dashboard, botões, chips, toast, placeholders, logs e estatísticas passam a usar tokens compartilhados de tema.

## [1.11.0] - 2026-06-30
### Adicionado
- Pausa automática entre fases com toast exibindo fase e velocidade da próxima jogada.
- Progressão de velocidade por fase com teto de `2.2×`.
- Dashboard responsivo moderno em volta do tabuleiro, preservando o quadro do canvas.
- Placeholders offline de publicidade, sem scripts externos ou identificadores reais de anúncio.
- QA publicado para transição de fase e dashboard responsivo em Cloudflare Pages.

### Corrigido
- Conclusão de todos os tijolos deixa de encerrar o jogo por vitória e passa a registrar `level_complete` e `level_start`.
- Cobertura unitária para progressão de fase, multiplicador de velocidade e eventos de fase.


## [1.10.0] - 2026-06-30
### Corrigido
- Layout mobile do BrickBreaker para iPhone 15, evitando canvas e botões fora da viewport.
- Ciclo do GameEngine para limpar loops/listeners no restart/re-render, reduzir velocidade inicial em mobile e não reiniciar após pontuação/tijolo.
- Visualização de logs e estatísticas para uso em telas mobile publicadas.
- Workflow de Prettier para não ficar bloqueado quando nenhum diretório Node elegível é encontrado.
- `package-lock.json` sincronizado com `package.json` para permitir `npm ci`.

### Adicionado
- QA automatizado contra Cloudflare Pages publicado via `make cloudflare-mobile-qa` e `make cloudflare-no-score-reset`.
- Regras Codex/agents/rules para exigir análise de logs/estatísticas, teste publicado no Cloudflare, PR e merge automatizado após CI.

## [1.9.0] - 2026-06-30
### Adicionado
- Publicação zero custo no Cloudflare Pages via Direct Upload para `malnati-brickbreaker.pages.dev` com targets `cloudflare-env-check`, `cloudflare-build` e `cloudflare-deploy`.
- Documentação operacional para uso de `/Users/mal/GitHub/malnati/.env`, política de Google Chrome/Google Console e matriz de custo zero.
- `.env.example` com variáveis não sensíveis do projeto Pages.

### Corrigido
- `Makefile` volta a executar `make help` com indentação válida.
- Build de produção usa `tsconfig.app.json` para excluir testes TypeScript do pacote estático.
- Service Worker volta a ser registrado e passa a cachear assets de produção com estratégia cache-first.
- Manifest PWA passa a usar ícones PNG locais.
- Alertas/debug visíveis foram removidos do carregamento inicial.

## [1.8.0] - 2025-11-21
### Adicionado
- **Serviço Caddy com HTTPS**: Novo container dedicado que publica `brickbreacker.cranio.dev` com TLS automático e proxy para o serviço `brickbreaker`.
- **Infraestrutura Docker atualizada**: `docker-compose.yml` com volumes de configuração/certificados e rede compartilhada `vmi2889919_caddy_mesh`.
- **Automação Makefile**: Alvos para criar a rede externa, acompanhar logs e recarregar a configuração do Caddy.
- **Documentação operacional**: Instruções de uso do Caddy via Docker e variáveis configuráveis no README.

## [1.7.0] - 2025-01-27
### Adicionado
- **Testes unitários para GameEngine**: Suíte completa de 9 testes cobrindo inicialização, ciclo de vida, gerenciamento de pontuação e estado do jogo
- **Testes de integração para gameLogger**: 5 testes validando registro de eventos no IndexedDB (início de jogo, atualização de pontuação, colisões)
- **Correção de configuração Jest**: Corrigido erro de configuração (`moduleNameMapping` -> `moduleNameMapper`)
- **Mocks adequados**: Implementados mocks completos para Paddle, Ball, Bricks, AssetLoader e gameLogger

### Melhorado
- **Plano de desenvolvimento atualizado**: Status atualizado refletindo progresso real dos testes
- **Cobertura de testes**: Total de 14 testes passando (9 unitários + 5 integração)

## [1.6.0] - 2025-11-20
### Adicionado
- **Documentação RUP específica do BrickBreaker**: novas seções de visão, arquitetura e design de gameplay para alinhar desenvolvimento offline-first.
- **Guia de testes e critérios de aceite**: estratégia focada em engine, persistência e PWA offline com rastreabilidade para issues #001–#012.
- **Checklist atualizado**: validação de estrutura, service worker, build Capacitor e cobertura de testes.

## [1.5.0] - 2025-11-20
### Adicionado
- **Plano de desenvolvimento**: Criado plano detalhado para próximos passos em `docs/rup/99-anexos/plano-desenvolvimento-proximos-passos.md`
  - Definidas 3 fases de desenvolvimento (Estabilização, Enhancements, Release)
  - Mapeadas 12 issues do GitHub prioritárias (#001-#012)
  - Planejada atualização completa da documentação RUP específica
  - Integrado plano com diretrizes do AGENTS.md
  - Estabelecido cronograma de 4 sprints (8 semanas)
  - Definidas métricas de sucesso e critérios de qualidade

### Planejado
- **Testes automatizados**: Suíte completa de testes unitários, integração e E2E
- **Documentação específica**: RUP adaptado para contexto de jogo BrickBreaker
- **Builds nativos**: Configuração iOS/Android via Capacitor com testes
- **Métricas de qualidade**: Cobertura >80%, performance <100ms, zero bugs críticos

## [1.4.0] - 2025-11-20
### Removido
- **Documentação legada**: Removida toda documentação específica do projeto anterior (CLImate INvestment)
  - Diretórios removidos: `00-visao/`, `01-arquitetura/`, `02-design/`, `02-planejamento/`, `03-agentes-ia/`, `04-testes-e-validacao/`, `05-entrega-e-implantacao/`, `05-operacao-release/`, `06-governanca-tecnica-e-controle-de-qualidade/`, `06-ux-brand/`, `99-anexos/MVP/`
  - Arquivos removidos: `validation-issue-log.json`, `validation-report.md`, `validation-report-spec.md`, `mapeamento-white-label.md`
  - Referências removidas: `manus/`, `modules/` (específicos de backend/banco de dados)

### Melhorado
- **Estrutura RUP**: Adaptada documentação RUP genérica para contexto do BrickBreaker
  - README principal atualizado para refletir jogo PWA offline
  - Checklists mantidos e adaptados para desenvolvimento de jogos
  - Referências técnicas reutilizáveis preservadas (Heroicons, Swagger)
  - Documentação agora focada em desenvolvimento de jogos e não em fintech

## [1.3.0] - 2025-11-20
### Adicionado
- **Infraestrutura Docker**: Adicionada estrutura completa para execução via Docker
  - `Dockerfile` para containerização do projeto
  - `docker-compose.yml` para orquestração de containers
  - `.dockerignore` para otimização de builds
  - Novos targets no Makefile: `docker-build`, `docker-up`, `docker-down`, `docker-logs`, `docker-shell`, `docker-build-prod`

### Ajustado
- **Branding**: Adaptados arquivos de branding para o contexto do jogo BrickBreaker
  - `branding/tokens.json`: Atualizado com paleta de cores do jogo (#1a1a1a, #2d2d2d, #00d4ff)
  - `branding/assets/README.md`: Documentação adaptada para o contexto do jogo
  - Removidas referências ao projeto anterior (APP, marketplace)
  
### Melhorado
- **Makefile**: Reorganizado e melhorado com seções claras
  - Adicionado cabeçalho descritivo
  - Help reorganizado por categorias (Desenvolvimento Local, Builds Nativos, Docker, Testes)
  - Mantidos todos os targets relevantes para o projeto de jogo

## [1.1.0] - 2024-07-31
### Melhorado
- **Física da bolinha**: Implementada física realista de colisão com a raquete
  - A bolinha agora rebate com ângulos diferentes baseados na posição onde bate na raquete
  - Ângulo máximo de rebatida de 60 graus (π/3 radianos)
  - Variação de velocidade baseada na posição do hit (0.8x a 1.2x da velocidade base)
  - Prevenção de travamento da bolinha na raquete

## [1.2.0] - 2024-08-01
### Adicionado

- Multiplicação de bolinhas ao quebrar múltiplos blocos em uma mesma trajetória
- Jogo termina apenas quando todas as bolinhas são perdidas ou todos os blocos são destruídos
- Penalidade ao não quebrar blocos: uma nova linha é inserida no topo quando a
  bola retorna à raquete sem destruir blocos.

## [1.2.0] - 2024-08-31
### Adicionado
- Pontuação acumulada persistida em IndexedDB

## [1.2.0] - 2024-08-01
### Adicionado
- Integração com Capacitor para build nativo iOS e Android
- Novos targets no Makefile para gerar e preparar o build
