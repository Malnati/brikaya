#!/bin/bash
# scripts/install-git-hooks.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ ! -d ".git" ]; then
  echo -e "${RED}❌ Erro: este diretório não é um repositório Git.${NC}"
  exit 1
fi

GIT_HOOKS_DIR=".git/hooks"
mkdir -p "$GIT_HOOKS_DIR"

PRE_COMMIT_HOOK="$GIT_HOOKS_DIR/pre-commit"
PRE_PUSH_HOOK="$GIT_HOOKS_DIR/pre-push"

echo -e "${BLUE}📝 Instalando git hooks Codex/Brikaya...${NC}"

cat > "$PRE_COMMIT_HOOK" <<'HOOK_EOF'
#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

bash scripts/pre-commit-check.sh
HOOK_EOF

cat > "$PRE_PUSH_HOOK" <<'HOOK_EOF'
#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

echo "🔍 Verificando governança Codex/.env antes do push..."
npm run codex-env:check

echo "☁️  QA publicado Cloudflare continua obrigatório para gameplay/UI/logs antes de PR/merge."
echo "💡 Quando aplicável: BRIKAYA_PUBLIC_URL=<preview-cloudflare> make cloudflare-mobile-qa"
if [ "${BRIKAYA_RUN_PUBLISHED_QA_ON_PUSH:-0}" = "1" ]; then
  make cloudflare-mobile-qa
fi
HOOK_EOF

chmod +x "$PRE_COMMIT_HOOK" "$PRE_PUSH_HOOK" scripts/pre-commit-check.sh

echo -e "${GREEN}✅ Git hooks instalados com sucesso.${NC}"
echo -e "${BLUE}💡 pre-commit: scripts/pre-commit-check.sh${NC}"
echo -e "${BLUE}💡 pre-push: npm run codex-env:check${NC}"
