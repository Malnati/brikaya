# Makefile
# Makefile para projeto Brikaya - jogo offline

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

# Development configuration
NODE_MODULES=node_modules
DIST_DIR=dist

# Cloudflare Pages zero-cost configuration
MALNATI_ENV_FILE=/Users/mal/GitHub/malnati/.env
BRICKBREAKER_CLOUDFLARE_PAGES_PROJECT_NAME=malnati-brickbreaker
BRICKBREAKER_CLOUDFLARE_PAGES_BRANCH=main
BRICKBREAKER_CLOUDFLARE_PAGES_OUTPUT_DIR=dist
BRICKBREAKER_CLOUDFLARE_PAGES_CUSTOM_DOMAIN=brikaya.com

# Process management
KILL_PROCESSES=@echo "🔪 Encerrando processos anteriores..." && \
	(pgrep -f "^node.*vite" >/dev/null 2>&1 && pkill -f "^node.*vite" 2>/dev/null || true) && \
	(pgrep -f "^npm.*dev" >/dev/null 2>&1 && pkill -f "^npm.*dev" 2>/dev/null || true) && \
	(pgrep -f "^npm.*preview" >/dev/null 2>&1 && pkill -f "^npm.*preview" 2>/dev/null || true) && \
	echo "✅ Processos anteriores encerrados!"

# Target padrão: mostrar help quando make é executado sem argumentos
.DEFAULT_GOAL := help

.PHONY: build dev preview clean help build-pwa prepare-capacitor ios android build-all kill-processes cloudflare-env-check cloudflare-build cloudflare-domain cloudflare-deploy cloudflare-mobile-qa cloudflare-no-score-reset cloudflare-phase-transition-qa cloudflare-level-progression-qa cloudflare-powerups-qa cloudflare-high-scores-qa cloudflare-cinematic-effects-qa cloudflare-phase10-stability-qa cloudflare-dashboard-layout-qa cloudflare-theme-qa cloudflare-svg-assets-qa cloudflare-runtime-update-qa cloudflare-audio-qa cloudflare-offline-pwa-qa docker-build docker-up docker-down docker-logs docker-shell

# Função para matar processos anteriores
kill-processes:
	$(KILL_PROCESSES)

# Instalar dependências do projeto
install:
	@echo "Instalando dependências do projeto..."
	@npm install
	@echo "Dependências instaladas com sucesso!"

# Gerar build da PWA
build-pwa:
	@echo "Gerando build da PWA..."
	@npm run build
	@echo "Build gerado em $(DIST_DIR)"

# Copiar build para Capacitor
prepare-capacitor:
	@echo "Copiando build para Capacitor..."
	@npx cap copy
	@echo "Build copiado para as plataformas nativas"

# Compilar o projeto para produção
build:
	@echo "Compilando o projeto..."
	@npm run build
	@echo "Projeto compilado com sucesso!"

# Validar variáveis necessárias para Cloudflare Pages sem exibir valores sensíveis
cloudflare-env-check:
	@node scripts/cloudflare-pages.js env-check

# Gerar build estático para Cloudflare Pages
cloudflare-build:
	@echo "Gerando build estático para Cloudflare Pages..."
	@npm run build
	@echo "Build estático gerado em $(BRICKBREAKER_CLOUDFLARE_PAGES_OUTPUT_DIR)"

# Garantir domínio canônico no Cloudflare Pages, mantendo custo zero
cloudflare-domain: cloudflare-env-check
	@node scripts/cloudflare-pages.js ensure-domain
	@node scripts/cloudflare-pages.js ensure-dns
	@node scripts/cloudflare-pages.js ensure-pages-dev-redirect

# Publicar no Cloudflare Pages via Direct Upload, mantendo custo zero
cloudflare-deploy: cloudflare-env-check cloudflare-build
	@node scripts/cloudflare-pages.js ensure-project
	@node scripts/cloudflare-pages.js deploy
	@node scripts/cloudflare-pages.js ensure-domain
	@node scripts/cloudflare-pages.js ensure-dns
	@node scripts/cloudflare-pages.js ensure-pages-dev-redirect


# Validar layout, logs e estatísticas contra o app publicado no Cloudflare Pages
cloudflare-mobile-qa:
	@npm run test:cloudflare-mobile

cloudflare-no-score-reset:
	@npm run test:cloudflare-no-score-reset

cloudflare-phase-transition-qa:
	@npm run test:cloudflare-phase-transition

cloudflare-level-progression-qa:
	@npm run test:cloudflare-level-progression

cloudflare-powerups-qa:
	@npm run test:cloudflare-powerups

cloudflare-high-scores-qa:
	@npm run test:cloudflare-high-scores

cloudflare-cinematic-effects-qa:
	@npm run test:cloudflare-cinematic-effects

cloudflare-phase10-stability-qa:
	@npm run test:cloudflare-phase10-stability

cloudflare-dashboard-layout-qa:
	@npm run test:cloudflare-dashboard-layout

cloudflare-theme-qa:
	@npm run test:cloudflare-theme

cloudflare-svg-assets-qa:
	@npm run test:cloudflare-svg-assets

cloudflare-runtime-update-qa:
	@npm run test:cloudflare-runtime-update

cloudflare-audio-qa:
	@npm run test:cloudflare-audio

cloudflare-offline-pwa-qa:
	@npm run test:cloudflare-offline-pwa

# Executar o jogo em modo de desenvolvimento
dev: kill-processes
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	@npm run dev

# Executar o jogo compilado (preview)
preview: kill-processes
	@echo "🎮 Iniciando preview do jogo compilado..."
	@npm run preview

# Limpar arquivos gerados
clean:
	@echo "Limpando arquivos gerados..."
	@rm -rf $(DIST_DIR)
	@rm -rf $(NODE_MODULES)
	@echo "Arquivos limpos!"

# Limpar apenas node_modules
clean-deps:
	@echo "Removendo node_modules..."
	@rm -rf $(NODE_MODULES)
	@echo "node_modules removido!"

# Instalar e compilar tudo
setup: install build
	@echo "Setup completo! O projeto está pronto para execução."

# Executar tudo (instalar, compilar e iniciar preview)
run: kill-processes setup
	@echo "🎯 Iniciando aplicativo..."
	@npx vite --host

# Executar apenas o preview (assumindo que já foi compilado)
start: kill-processes
	@echo "🎯 Iniciando aplicativo..."
	@npx vite --host

# Abrir projeto iOS no Xcode
ios:
	@npx cap open ios

# Abrir projeto Android no Android Studio
android:
	@npx cap open android

# Build completo (PWA + Capacitor)
build-all: build-pwa prepare-capacitor

# Testar cores do jogo
test-colors:
	@echo "🧪 Testando cores do jogo..."
	@npm run test:colors

# Testar cores em modo desenvolvimento
test-colors-dev: kill-processes
	@echo "🧪 Testando cores do jogo em modo desenvolvimento..."
	@npm run test:colors:dev

# Verificar integridade das cores (para CI/CD)
check-colors: kill-processes
	@echo "🔍 Verificando integridade das cores..."
	@timeout 30s bash -c 'npm run dev & sleep 8 && npm run test:colors && pkill -f "vite"' || (pkill -f "vite" && exit 1)

# Teste manual completo
test-manual: kill-processes
	@echo "🎮 Executando teste manual completo..."
	@timeout 60s bash -c 'npm run dev & sleep 5 && node scripts/test-game-manual.js && pkill -f "vite"' || (pkill -f "vite" && exit 1)

# Teste manual de cores (com servidor HTTP simples)
test-colors-manual:
	@echo "🎨 Executando teste manual de cores..."
	@node scripts/test-colors-manual.js

# Parar todos os processos do jogo
stop:
	@echo "🛑 Parando todos os processos do jogo..."
	$(KILL_PROCESSES)

# Reiniciar o jogo (parar e iniciar novamente)
restart: stop
	@sleep 1
	@$(MAKE) dev

# Docker: Build da imagem
docker-build:
	@echo "🐳 Construindo imagem Docker..."
	@docker compose build

# Docker: Iniciar containers
docker-up:
	@echo "🚀 Iniciando containers Docker..."
	@docker compose up -d
	@echo "✅ Aplicação disponível em http://localhost:7979"

# Docker: Parar containers
docker-down:
	@echo "🛑 Parando containers Docker..."
	@docker compose down

# Docker: Ver logs
docker-logs:
	@docker compose logs -f brickbreaker

# Docker: Acessar shell do container
docker-shell:
	@docker compose exec brickbreaker /bin/bash

# Docker: Build de produção
docker-build-prod:
	@echo "🏗️ Construindo build de produção..."
	@docker compose --profile build up brickbreaker-build
	@echo "✅ Build gerado em dist/"

# Mostrar ajuda
help:
	@echo "Available targets:"
	@echo ""
	@echo "Desenvolvimento Local:"
	@echo "  kill-processes  - Encerrar processos anteriores do jogo"
	@echo "  install		- Instalar dependências do projeto"
	@echo "  build		  - Compilar o projeto para produção"
	@echo "  dev		    - Executar servidor de desenvolvimento"
	@echo "  preview		- Executar preview do jogo compilado"
	@echo "  start          - Iniciar aplicativo (assumindo build existente)"
	@echo "  run            - Setup completo e executar preview"
	@echo "  restart        - Parar e reiniciar o jogo"
	@echo "  stop           - Parar todos os processos do jogo"
	@echo "  clean		  - Limpar todos os arquivos gerados"
	@echo "  clean-deps     - Remover apenas node_modules"
	@echo "  setup          - Instalar dependências e compilar"
	@echo ""
	@echo "Cloudflare Pages sem custo:"
	@echo "  cloudflare-env-check - Validar variáveis Cloudflare sem exibir valores"
	@echo "  cloudflare-build     - Gerar build estático para Pages"
	@echo "  cloudflare-domain    - Garantir domínio canônico e redirect para brikaya.com"
	@echo "  cloudflare-deploy    - Publicar dist no Cloudflare Pages e manter brikaya.com canônico"
	@echo "  cloudflare-mobile-qa - Testar iPhone 15/logs contra Cloudflare publicado"
	@echo "  cloudflare-no-score-reset - Validar continuidade após tijolo no Cloudflare publicado"
	@echo "  cloudflare-phase-transition-qa - Validar pausa/toast de fase no Cloudflare publicado"
	@echo "  cloudflare-level-progression-qa - Validar níveis progressivos no Cloudflare publicado"
	@echo "  cloudflare-powerups-qa - Validar power-ups/especiais no Cloudflare publicado"
	@echo "  cloudflare-high-scores-qa - Validar recordes gerais locais no Cloudflare publicado"
	@echo "  cloudflare-cinematic-effects-qa - Validar efeitos visuais cinematográficos no Cloudflare publicado"
	@echo "  cloudflare-phase10-stability-qa - Validar estabilidade da bolinha após Fase 10 no Cloudflare publicado"
	@echo "  cloudflare-dashboard-layout-qa - Validar dashboard responsivo no Cloudflare publicado"
	@echo "  cloudflare-theme-qa - Validar aparência contra Cloudflare publicado"
	@echo "  cloudflare-svg-assets-qa - Validar SVGs runtime/cache contra Cloudflare publicado"
	@echo "  cloudflare-runtime-update-qa - Validar atualização automática contra Cloudflare publicado"
	@echo "  cloudflare-audio-qa - Validar áudio/cache contra Cloudflare publicado"
	@echo "  cloudflare-offline-pwa-qa - Validar PWA offline contra Cloudflare publicado"
	@echo ""
	@echo "Builds Nativos:"
	@echo "  build-pwa      - Gerar build da PWA"
	@echo "  prepare-capacitor - Copiar build para Capacitor"
	@echo "  ios            - Abrir projeto iOS no Xcode"
	@echo "  android        - Abrir projeto Android no Android Studio"
	@echo "  build-all      - Build PWA e copiar para Capacitor"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build   - Construir imagem Docker"
	@echo "  docker-up      - Iniciar containers Docker"
	@echo "  docker-down    - Parar containers Docker"
	@echo "  docker-logs    - Ver logs do container"
	@echo "  docker-shell   - Acessar shell do container"
	@echo "  docker-build-prod - Build de produção via Docker"
	@echo ""
	@echo "Testes:"
	@echo "  test-colors    - Testar cores do jogo"
	@echo "  test-colors-dev - Testar cores em modo desenvolvimento"
	@echo "  test-colors-manual - Teste manual de cores (com servidor HTTP)"
	@echo "  check-colors   - Verificar integridade das cores (CI/CD)"
	@echo "  test-manual    - Teste manual completo"
	@echo ""
	@echo "  help           - Show this help message"
