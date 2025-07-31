# Makefile

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

# Development configuration
NODE_MODULES=node_modules
DIST_DIR=dist

.PHONY: install-assets clean-assets install build dev preview clean help build-pwa prepare-capacitor ios android build-all

# Instalar dependências do projeto
install:
        @echo "Instalando dependências do projeto..."
        @npm install
        @echo "Dependências instaladas com sucesso!"

build-pwa:
        @echo "Gerando build da PWA..."
        @npm run build
        @echo "Build gerado em $(DIST_DIR)"

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
	npx vite --host

ios:
        @npx cap open ios

android:
        @npx cap open android

build-all: build-pwa prepare-capacitor

install-assets:
	@echo "Installing game assets from Kenney puzzle pack..."
	@mkdir -p $(ASSET_DIR)
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/ballGrey.png $(ASSET_DIR)/
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/paddleBlu.png $(ASSET_DIR)/paddle.png
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/element_red_square.png $(ASSET_DIR)/brick_red.png
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/element_blue_square.png $(ASSET_DIR)/brick_blue.png
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/element_green_square.png $(ASSET_DIR)/brick_green.png
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/element_yellow_square.png $(ASSET_DIR)/brick_yellow.png
	@cp $(TEMP_DIR)/kenney_puzzle-pack/png/element_purple_square.png $(ASSET_DIR)/brick_purple.png
	@echo "Kenney puzzle pack assets installed successfully!"

clean-assets:
	@echo "Removing assets..."
	@rm -rf $(ASSET_DIR)/*.png
	@echo "Assets removed!"

help:
	@echo "Available targets:"
	@echo "  install        - Instalar dependências do projeto"
	@echo "  build          - Compilar o projeto para produção"
	@echo "  dev            - Executar servidor de desenvolvimento"
	@echo "  preview        - Executar preview do jogo compilado"
	@echo "  clean          - Limpar todos os arquivos gerados"
	@echo "  clean-deps     - Remover apenas node_modules"
	@echo "  setup          - Instalar dependências e compilar"
        @echo "  run            - Setup completo e executar preview"
        @echo "  install-assets - Install Kenney puzzle pack assets"
        @echo "  clean-assets   - Remove installed assets"
        @echo "  build-pwa      - Gerar build da PWA"
        @echo "  prepare-capacitor - Copiar build para Capacitor"
        @echo "  ios            - Abrir projeto iOS no Xcode"
        @echo "  android        - Abrir projeto Android no Android Studio"
        @echo "  build-all      - Build PWA e copiar para Capacitor"
        @echo "  help           - Show this help message"