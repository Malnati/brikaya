# Makefile

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

# Development configuration
NODE_MODULES=node_modules
DIST_DIR=dist

.PHONY: build dev preview clean help build-pwa prepare-capacitor ios android build-all

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
dev:
	@echo "Iniciando servidor de desenvolvimento..."
	@npm run dev

# Executar o jogo compilado (preview)
preview:
	@echo "Iniciando preview do jogo compilado..."
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
run: setup
	pkill -f "vite" || true
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
test-colors-dev:
	@echo "🧪 Testando cores do jogo em modo desenvolvimento..."
	@npm run test:colors:dev

# Verificar integridade das cores (para CI/CD)
check-colors:
	@echo "🔍 Verificando integridade das cores..."
	@npm run dev & sleep 8 && npm run test:colors && pkill -f "vite" || (pkill -f "vite" && exit 1)

# Teste manual completo
test-manual:
	@echo "🎮 Executando teste manual completo..."
	@node scripts/test-game-manual.js

# Mostrar ajuda
help:
	@echo "Available targets:"
	@echo "  install		- Instalar dependências do projeto"
	@echo "  build		  - Compilar o projeto para produção"
	@echo "  dev		    - Executar servidor de desenvolvimento"
	@echo "  preview		- Executar preview do jogo compilado"
	@echo "  clean		  - Limpar todos os arquivos gerados"
	@echo "  clean-deps     - Remover apenas node_modules"
	@echo "  setup          - Instalar dependências e compilar"
	@echo "  run            - Setup completo e executar preview"
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

