<!-- CHANGELOG.md -->
- Estrutura inicial do projeto criada com arquivos vazios e TODOs
- Implementação completa do jogo Breakout com suporte offline
- Resolvido conflitos para integrar mudancas da main

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

