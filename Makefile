# Makefile
# Makefile para projeto BrickBreaker - Jogo Breakout offline

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

# Reverse proxy configuration
CADDY_DOMAIN=brickbreacker.cranio.dev
CADDY_UPSTREAM=http://brickbreaker:7979
CADDY_NETWORK=vmi2889919_caddy_mesh
CADDY_SERVICE=caddy
ACME_EMAIL=infra@cranio.dev

# Development configuration
NODE_MODULES=node_modules
DIST_DIR=dist

# Cloudflare Pages zero-cost configuration
MALNATI_ENV_FILE=/Users/mal/GitHub/malnati/.env
BRICKBREAKER_CLOUDFLARE_PAGES_PROJECT_NAME=malnati-brickbreaker
BRICKBREAKER_CLOUDFLARE_PAGES_BRANCH=main
BRICKBREAKER_CLOUDFLARE_PAGES_OUTPUT_DIR=dist

# Process management
KILL_PROCESSES=@echo "🔪 Encerrando processos anteriores..." && \
	(pgrep -f "^node.*vite" >/dev/null 2>&1 && pkill -f "^node.*vite" 2>/dev/null || true) && \
	(pgrep -f "^npm.*dev" >/dev/null 2>&1 && pkill -f "^npm.*dev" 2>/dev/null || true) && \
	(pgrep -f "^npm.*preview" >/dev/null 2>&1 && pkill -f "^npm.*preview" 2>/dev/null || true) && \
	echo "✅ Processos anteriores encerrados!"

# Target padrão: mostrar help quando make é executado sem argumentos
.DEFAULT_GOAL := help

.PHONY: build dev preview clean help build-pwa prepare-capacitor ios android build-all kill-processes cloudflare-env-check cloudflare-build cloudflare-deploy cloudflare-mobile-qa cloudflare-no-score-reset docker-build docker-up docker-down docker-logs docker-shell docker-create-caddy-network docker-logs-caddy docker-reload-caddy

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

# Publicar no Cloudflare Pages via Direct Upload, mantendo custo zero
cloudflare-deploy: cloudflare-env-check cloudflare-build
	@node scripts/cloudflare-pages.js ensure-project
	@node scripts/cloudflare-pages.js deploy


# Validar layout, logs e estatísticas contra o app publicado no Cloudflare Pages
cloudflare-mobile-qa:
	@npm run test:cloudflare-mobile

cloudflare-no-score-reset:
	@npm run test:cloudflare-no-score-reset

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
docker-up: docker-create-caddy-network
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

# Docker: Garantir rede externa do Caddy
docker-create-caddy-network:
	@echo "🔌 Garantindo rede externa do Caddy..."
	@docker network inspect $(CADDY_NETWORK) >/dev/null 2>&1 || docker network create --driver bridge $(CADDY_NETWORK)

# Docker: Ver logs do Caddy
docker-logs-caddy:
	@docker compose logs -f $(CADDY_SERVICE)

# Docker: Recarregar configuração do Caddy
docker-reload-caddy:
	@docker compose exec $(CADDY_SERVICE) caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

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
	@echo "  cloudflare-deploy    - Publicar dist no Cloudflare Pages"
	@echo "  cloudflare-mobile-qa - Testar iPhone 15/logs contra Cloudflare publicado"
	@echo "  cloudflare-no-score-reset - Validar continuidade após tijolo no Cloudflare publicado"
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
	@echo "  docker-create-caddy-network - Garantir rede externa do Caddy"
	@echo "  docker-logs-caddy - Ver logs do reverse proxy Caddy"
	@echo "  docker-reload-caddy - Recarregar configuração ativa do Caddy"
	@echo ""
	@echo "Testes:"
	@echo "  test-colors    - Testar cores do jogo"
	@echo "  test-colors-dev - Testar cores em modo desenvolvimento"
	@echo "  test-colors-manual - Teste manual de cores (com servidor HTTP)"
	@echo "  check-colors   - Verificar integridade das cores (CI/CD)"
	@echo "  test-manual    - Teste manual completo"
	@echo ""
	@echo "  help           - Show this help message"
