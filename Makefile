# Makefile

# Asset configuration
ASSET_DIR=public/assets
TEMP_DIR=tmp

.PHONY: install-assets clean-assets

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
	@echo "  install-assets  - Download and install game assets"
	@echo "  clean-assets    - Remove installed assets"
	@echo "  help           - Show this help message"