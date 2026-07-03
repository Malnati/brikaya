<!-- CHANGELOG.md -->
- Estrutura inicial do projeto criada com arquivos vazios e TODOs
- Implementação completa do jogo Breakout com suporte offline
- Resolvido conflitos para integrar mudancas da main

## [1.20.2] - 2026-07-03
### Adicionado
- QA publicado `test:cloudflare-gameplay-basic` para validar carregamento, controles, pontuação e eventos básicos de gameplay no Cloudflare Pages.
- Documento de qualidade para prova publicada do fluxo básico de jogo.

### Testado
- `npm run test:cloudflare-gameplay-basic`

## [1.20.1] - 2026-07-03
### Adicionado
- QA publicado `test:cloudflare-offline-pwa` para validar recarregamento do jogo sem internet após o primeiro carregamento.
- Documento de qualidade para prova offline da PWA em Cloudflare Pages.

### Testado
- `npm run test:cloudflare-offline-pwa`

## [1.20.0] - 2026-07-03
### Adicionado
- Sistema de aparência com seleção de tema visual, conjunto de imagens SVG e fonte no menu.
- Novos conjuntos `high-contrast` e `sunset-cabinet` para sprites, power-ups, tijolos e VFX em SVG local/offline.

### Alterado
- O jogo troca o conjunto de imagens no motor atual sem recriar partida, pontuação ou fase.
- QA Cloudflare de tema passa a validar `Aparência`, persistência de tema/imagens/fonte e screenshots de contraste/Sunset.

### Testado
- `npm test -- src/hooks/useGameLoop.test.tsx src/components/Game.test.tsx src/components/GameCinematicOverlay.test.tsx src/App.test.tsx src/logic/GameEngine.test.ts src/objects/Ball.test.ts src/objects/Bricks.test.ts src/objects/PowerUp.test.ts --runInBand`
- `npm run test:asset-naming`
- `npm run test:svg-assets`
- `npm run build`

## [1.19.1] - 2026-07-03
### Adicionado
- Regra obrigatória SVG-only para imagens visuais runtime e artefatos visuais Codex de planejamento.
- Recibo JSON `tmp/reports/svg-assets-guard.json` gerado pelo validador SVG.

### Alterado
- `npm run build` passa a executar `npm run test:svg-assets` antes da compilação.
- Especificação de assets visuais passa a aceitar somente `.svg`, preservando screenshots/evidências PNG fora do runtime visual.

### Testado
- `npm run test:svg-assets`
- `npm run build`

## [1.19.0] - 2026-07-03
### Adicionado
- Catálogo técnico `src/constants/visualAssets.ts` com IDs únicos, constantes camelCase e paths físicos padronizados para imagens exibidas em tela.
- Tokens retro/arcade em `src/constants/visualDesign.ts`, sincronizados com variáveis CSS de cor e tipografia.
- Cobertura `npm run test:asset-naming` para validar regex, tamanho 12-64, paridade código/disco, basenames exclusivos, existência física, CSS tokens e precache.
- Especificação técnica em `docs/rup/02-design/retro-asset-system.md` para orientar próximos pedidos de sprites, VFX, UI, SFX e BGM.

### Alterado
- Assets visuais runtime foram reorganizados em `public/assets/visual/` por tipo semântico: `sprites/`, `bricks/`, `powerups/`, `vfx/` e `ui/`.
- Assets sonoros runtime foram renomeados para kebab-case com prefixos `sfx-`/`bgm-` e sufixo numérico de variação.
- Manifesto PWA, favicon, service worker, constantes, testes e validadores passam a referenciar os novos nomes semânticos.

### Testado
- `npm run test:asset-naming`
- `npm run test:svg-assets`
- `npm run test:cinematic-media-assets`
- `npm run test:audio-assets`

## [1.18.5] - 2026-07-02
### Alterado
- Imagens runtime do jogo passam a usar SVG local/offline para bola, raquete, tijolos, efeitos cinematográficos, power-ups, favicon e ícone PWA.
- Power-ups deixam de depender visualmente das letras `M/W/S/L` quando o SVG está carregado, mantendo fallback local para falha de asset.

### Testado
- Novo validador `npm run test:svg-assets` garante SVGs locais com `viewBox`, sem scripts, raster embutido, data URI ou URLs externas fora do namespace SVG.
- Validações cinematográficas e de manifesto passam a exigir SVGs cacheáveis no service worker.


## [1.18.4] - 2026-07-02
### Corrigido
- Botão de som passa a destravar o Web Audio no próprio gesto do usuário, com pulso silencioso compatível com iOS/WebKit.
- Toggle mantém `Sem som` quando o desbloqueio falha e só muda para `Som` quando o áudio realmente fica liberado.

### Testado
- Cobertura unitária valida unlock silencioso, persistência de preferência e ausência de música quando o unlock falha.
- QA de áudio publicado passa a validar matriz automatizada Chrome desktop, Android emulado e iPhone emulado.

## [1.18.3] - 2026-07-02
### Corrigido
- Canvas no modo paisagem imersivo mobile/tablet passa a usar a largura útil da viewport em vez de manter proporção 480:320 com margens laterais.
- Som inicial passa a começar mudo quando não há preferência salva, com ícone e rótulo acessível refletindo `Sem som`.

### Testado
- Cobertura unitária valida canvas full-width em landscape imersivo e preferência inicial de áudio mudo.
- QA publicado de dashboard/mobile/audio passa a validar largura do canvas, ausência de scroll/sobreposição e estado inicial mudo.

## [1.18.2] - 2026-07-02
### Corrigido
- Quadro do jogo volta a ocupar toda a largura útil disponível, removendo o recuo responsivo que limitava o canvas.
- Fase, score, total e recorde passam a aparecer em um único badge central no topo, com separadores, enquanto Som, Reiniciar/Jogar de novo e Menu ficam fora da área jogável.
- Efeito visual do power-up Laser em leque passa a permanecer visível por 2s sem bloquear a transição de fase.

### Testado
- Cobertura unitária valida o HUD superior, o cálculo full-width do canvas e a duração mínima do efeito Laser.
- QA publicado de dashboard/mobile/laser passa a validar badge único, controles superiores e ausência de sobreposição no canvas.

## [1.18.1] - 2026-07-02
### Corrigido
- Removidas constantes responsivas e de tema que ficaram obsoletas após o modo full-width e o tema escuro padrão, mantendo o contrato de código sem referências mortas.

## [1.18.0] - 2026-07-02
### Adicionado
- Tema padrão escuro quando não há preferência salva, mantendo seletor Claro/Escuro e persistência local.
- Versão incremental visível dentro do menu do jogo com rótulo acessível.
- Power-up `Laser em leque`, limitado a dois spawns por fase, destruindo todos os blocos ativos sem reiniciar a partida.
- QA publicado `test:cloudflare-laser-powerup` para validar destruição total, pontuação, transição única de fase e ausência de requests externos.

### Alterado
- Quadro principal do jogo passa a ocupar praticamente toda a largura útil do dashboard, preservando proporção e mantendo o modo paisagem imersivo.

## [1.17.2] - 2026-07-02
### Adicionado
- Número de versão incremental `vN` baseado na contagem de commits Git, exibido discretamente no canto inferior direito do shell do jogo.

### Testado
- Cobertura unitária e QA publicado validam presença do `vN` sem sobrepor canvas, controles ou publicidade.

## [1.17.1] - 2026-07-02
### Alterado
- Efeitos cinematográficos de contagem inicial, subida de fase e RIP passam a usar imagens locais CC0/domínio público de Kenney, distribuídas com o PWA offline.
- Overlay mantém os textos essenciais acessíveis e usa as imagens apenas como camadas decorativas sem dependências externas.

### Adicionado
- Recibo de licença e SHA-256 dos assets cinematográficos em `docs/assets/issues/cinematic-public-domain-media/evidence/`.
- Validação `npm run test:cinematic-media-assets` para garantir paths locais, precache no service worker e política CC0/domínio público.

### Testado
- QA cinematográfico publicado passa a validar mídia local, cache PWA e ausência de requests externos de mídia.

## [1.17.0] - 2026-07-02
### Adicionado
- Overlay cinematográfico inicial com contagem `3`, `2`, `1` em tela cheia, limitado a 1,8s e exibido apenas no primeiro carregamento da página.
- Mensagem visual em tela cheia entre fases informando a subida de nível durante a pausa existente.
- Overlay `RIP` em tela cheia ao perder, limitado a 1,8s, com reinício automático sem confirmação.
- QA Puppeteer publicado para validar countdown, subida de fase, RIP, áudio local e ausência de countdown em reinícios posteriores.

### Alterado
- Início do `GameEngine` passa a aguardar o fim da contagem inicial, sem alterar resize/orientation ou reinícios posteriores.
- SFX locais já catalogados de início e subida de fase passam a tocar em volume audível para acompanhar os novos efeitos visuais.

### Testado
- Cobertura de App valida countdown inicial, mensagem de fase e reinício automático pós-RIP sem nova contagem.

## [1.16.8] - 2026-07-02
### Adicionado
- Registry obrigatório de power-ups com áudio específico de ativação, nome visível e visual lógico para `multiball`, `wide_paddle`, `slow_ball` e `laser_fan`.
- SFX local/offline CC0 `sfx_powerup_activate_laser_fan` baseado em Kenney Sci-fi Sounds (`laserSmall_000.ogg`).

### Corrigido
- Ativação de power-ups passa a tocar o SFX específico via registry em vez de fallback por ramificação.
- Volume do SFX de ativação do multiball volta ao nível audível documentado.

### Testado
- Cobertura unitária valida que todo item especial tem `activationAudioId` existente no catálogo e arquivo local.
- `npm run test:audio-assets` valida licença, SHA-256, duração e precache do novo MP3.


## [1.16.7] - 2026-07-02
### Corrigido
- HUD, menu e controles principais deixam de sobrepor o canvas no modo paisagem imersivo mobile/tablet.
- O canvas em paisagem passa a reservar área compacta para score/fase/recorde/menu e controles essenciais, preservando proporção e continuidade do jogo.

### Testado
- QA de dashboard passa a falhar quando qualquer botão, HUD ou controles principais cruzam a área do canvas em landscape.

## [1.16.6] - 2026-07-02
### Corrigido
- Mobile/tablet em paisagem passa a ativar modo imersivo por `visualViewport`, ponteiro touch e classe raiz, evitando que o jogo fique preso ao card central quando o navegador altera a viewport.
- Canvas em paisagem imersiva passa a usar quase toda a área segura disponível sem alterar a proporção do tabuleiro nem recriar o `GameEngine`.

### Testado
- Cobertura unitária valida cálculo responsivo para portrait, celular landscape, tablet landscape touch e desktop sem toque.
- QA publicado de dashboard passa a exigir classe imersiva, canvas com ao menos 90% da altura da viewport, shell sem overflow e ausência de novo `game_start`/`restart_game` na rotação.

## [1.16.5] - 2026-07-01
### Alterado
- Velocidade-base da progressão reduzida de `6x` para `3x`.
- `minSpeed` passa a derivar da máxima da própria fase dividida por 4.
- Redução por bloco passa a distribuir apenas a faixa entre `maxSpeed` e `minSpeed` pela quantidade inicial de blocos da fase.

### Testado
- Cobertura unitária e QA publicado validam redução gradual sem queda imediata ao mínimo em fases com múltiplos blocos.

## [1.16.4] - 2026-07-01
### Alterado
- Mobile em orientação paisagem passa a usar modo imersivo: dashboard sem card, anúncios/status ocultos e canvas ocupando a maior área segura disponível.
- Redimensionamento do canvas por rotação deixa de recriar o `GameEngine`, preservando fase, pontuação, bolinha e logs de início.

### Testado
- QA de dashboard publicado passa a validar canvas expandido em iPhone landscape e ausência de `game_start`/`restart_game` durante rotação.

## [1.16.3] - 2026-07-01
### Corrigido
- Ícones de `Som` e `Reiniciar`/`Jogar de novo` saem de cima do tabuleiro e passam a ficar fora do quadro do jogo.

### Testado
- Cobertura unitária e QA publicado validam que os ícones não sobrepõem o canvas nem a área de publicidade.

## [1.16.2] - 2026-07-01
### Alterado
- Controles `Som` e `Reiniciar`/`Jogar de novo` passam a aparecer como ícones discretos nos cantos inferiores do tabuleiro.
- Menu lateral fica reservado para tema, logs, colisões e zerar pontuação.

### Testado
- Cobertura de App e QA publicado validam controles acessíveis, alvos touch de 44px e ausência de overflow.

## [1.16.1] - 2026-07-01
### Corrigido
- Bolinha em fases altas passa a usar passos internos de movimento e clamp nas bordas para não sair do canvas após a Fase 10.
- Contadores de hits por fase, bolas ativas e média de bolas por jogo passam a considerar multiball e perdas parciais corretamente.
- HUD passa a receber o nível inicial real do motor do jogo, evitando divergência visual em cenários de fase avançada.

### Testado
- Cobertura unitária para alta velocidade, contadores de fase, multiball e estatística de bolas.
- Novo QA publicado `make cloudflare-phase10-stability-qa` valida Fase 11 com bolinha ativa, sem `game_end`/`ball_lost` indevido.

## [1.16.0] - 2026-07-01
### Alterado
- Velocidade-base da progressão passa a partir da Fase 1 com 2x sobre o spawn inicial efetivo anterior, removendo o override isolado acima de `maxSpeed`.
- `minSpeed` por fase passa a usar divisor 4 em vez de 2, mantendo `reductionPerBrick` por quantidade inicial de blocos.
- Ação `Reiniciar`/`Jogar de novo` foi movida para a seção `Partida` do menu lateral, liberando espaço persistente para o jogo e publicidade.

## [1.15.0] - 2026-07-01
### Adicionado
- Integração local de 90 arquivos MP3 CC0/domínio público em `public/assets/audio/`, cobrindo os 38 IDs lógicos de `docs/audio.md` com `sfx_ad_placeholder_none` como no-op silencioso.
- Manifesto de áudio em `src/constants/audio.ts`, gerenciador Web Audio offline-safe, controle `Som`/`Sem som`, música de menu/gameplay, camada de intensidade, ducking e falha silenciosa sem quebrar o jogo.
- Gatilhos sonoros para início, raquete, parede, teto, tijolos por cor, score, bola perdida, fase concluída, toast, nova fase, game over, UI, high-score, offline pronto, combos e power-ups mínimos.
- Documento de prova `docs/audio-assets.md` com fonte, licença verificada, arquivo original, runtime, duração, SHA-256 e conversão por asset.
- Validação `npm run test:audio-assets` e target `make cloudflare-audio-qa` para QA publicado de eventos lógicos, cache e ausência de requests externos de áudio.

### Alterado
- Service Worker passa a precachear todos os áudios locais para manter o PWA jogável offline após o primeiro carregamento.
- Pontuação local passa a manter recorde para acionar feedback de novo high-score.

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
- Documentação do pacote completo de áudios em `docs/audio.md`, com músicas, efeitos de gameplay, sons de UI, reservas futuras, regras de mix e critérios offline para aquisição ou produção posterior.

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
