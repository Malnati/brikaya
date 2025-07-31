# Makefile

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

# Development configuration
NODE_MODULES=node_modules
DIST_DIR=dist

.PHONY: install-assets clean-assets install build dev preview clean help

# Instalar dependências do projeto
install:
	@echo "Instalando dependências do projeto..."
	@npm install
	@echo "Dependências instaladas com sucesso!"

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
run: setup preview

install-assets:
	@echo "Installing game assets..."
	@mkdir -p $(ASSET_DIR) $(TEMP_DIR)
	@echo "Generating game assets locally..."
	@node $(TEMP_DIR)/generate-png-assets.js
	@echo "Assets installed successfully!"

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
	@echo "  install-assets - Download and install game assets"
	@echo "  clean-assets   - Remove installed assets"
	@echo "  help           - Show this help message"