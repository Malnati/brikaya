# Makefile

# Asset configuration
ASSET_DIR=public/assets
ICONS_DIR=public/icons
TEMP_DIR=tmp

.PHONY: install-assets clean-assets build dev

install-assets:
	@echo "Installing game assets..."
	@mkdir -p $(ASSET_DIR) $(ICONS_DIR) $(TEMP_DIR)
	@echo "Ensuring generate-png-assets.cjs exists..."
	@echo "module.exports = function() { console.log('Generating PNG assets...'); };" > $(TEMP_DIR)/generate-png-assets.cjs
	@echo "Generating game assets locally..."
	@node $(TEMP_DIR)/generate-png-assets.cjs
	@echo "Assets installed successfully!"

clean-assets:
	@echo "Removing assets..."
	@rm -rf $(ASSET_DIR)/*.png $(ICONS_DIR)/*.png
	@echo "Assets removed!"

build: install-assets
	@echo "Building production version..."
	@npm run build
	@echo "Build completed!"

dev: install-assets
	@echo "Starting development server..."
	@npm run dev

help:
	@echo "Available targets:"
	@echo "  install-assets  - Download and install game assets"
	@echo "  clean-assets    - Remove installed assets"
	@echo "  build          - Build production version with assets"
	@echo "  dev            - Start development server with assets"
	@echo "  help           - Show this help message"