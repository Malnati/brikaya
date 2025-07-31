# Makefile

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

# Development configuration
NODE_MODULES=node_modules
DIST_DIR=dist

# Process management
KILL_PROCESSES=@echo "🔪 Encerrando processos anteriores..." && \
	pkill -f "vite" 2>/dev/null || true && \
	pkill -f "node.*vite" 2>/dev/null || true && \
	pkill -f "npm.*dev" 2>/dev/null || true && \
	pkill -f "npm.*preview" 2>/dev/null || true && \
	sleep 2 && \
	echo "✅ Processos anteriores encerrados!"

.PHONY: build dev preview clean help build-pwa prepare-capacitor ios android build-all kill-processes

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

# Parar todos os processos do jogo
stop:
	@echo "🛑 Parando todos os processos do jogo..."
	$(KILL_PROCESSES)

# Reiniciar o jogo (parar e iniciar novamente)
restart: stop dev

# Mostrar ajuda
help:
	@echo "Available targets:"
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
	@echo "  build-pwa      - Gerar build da PWA"
	@echo "  prepare-capacitor - Copiar build para Capacitor"
	@echo "  ios            - Abrir projeto iOS no Xcode"
	@echo "  android        - Abrir projeto Android no Android Studio"
	@echo "  build-all      - Build PWA e copiar para Capacitor"
	@echo "  test-colors    - Testar cores do jogo"
	@echo "  test-colors-dev - Testar cores em modo desenvolvimento"
	@echo "  check-colors   - Verificar integridade das cores (CI/CD)"
	@echo "  test-manual    - Teste manual completo"
	@echo "  help           - Show this help message"

