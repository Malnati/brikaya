.PHONY: help build start stop clean format-prettier install-hooks

help:
	@echo "Available targets: build start stop clean format-prettier install-hooks"

build:
	@echo "No build pipeline is defined yet; add project-specific steps when components are introduced."

start:
	@echo "No runtime services are defined yet; configure start commands once applications are added."

stop:
	@echo "No runtime services are running; add stop commands alongside future start targets."

clean:
	@echo "No build artifacts to clean; extend this target when build outputs are created."

format-prettier:
	@if docker info >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 2>/dev/null && [ -f "app/docker-compose.yml" ]; then \
		echo "🐳 Executando Prettier via Docker Compose..."; \
		docker compose -f app/docker-compose.yml run --rm prettier || true; \
	elif docker info >/dev/null 2>&1; then \
		echo "🐳 Executando Prettier via Docker..."; \
		docker run --rm -it \
			-v "$(PWD):/workspace" \
			-w /workspace \
			-e IN_DOCKER=true \
			-e WORK_DIR=/workspace \
			node:20-alpine \
			sh -c "apk add --no-cache bash findutils && bash scripts/format-prettier.sh"; \
	elif command -v act >/dev/null 2>&1 && docker info >/dev/null 2>&1; then \
		echo "✅ Usando act para executar workflow..."; \
		echo "⚠️  Nota: act pode requerer configuração adicional. Se falhar, use o script shell diretamente."; \
		act workflow_dispatch -W .github/workflows/prettier.yml \
			--input dry=false \
			--input no_commit=true \
			--secret GITHUB_TOKEN=dummy \
			--secret COPILOT_PAT=dummy || (echo "⚠️  act falhou, usando script shell como fallback..."; bash scripts/format-prettier.sh); \
	else \
		echo "⚠️  Docker não disponível, usando script shell local..."; \
		bash scripts/format-prettier.sh; \
	fi

install-hooks:
	@if command -v bash >/dev/null 2>&1; then \
		echo "📝 Instalando git hooks..."; \
		bash scripts/install-git-hooks.sh; \
	else \
		echo "❌ Erro: bash não encontrado. Execute diretamente: bash scripts/install-git-hooks.sh"; \
		exit 1; \
	fi
