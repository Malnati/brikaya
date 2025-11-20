#!/bin/bash
# scripts/install-git-hooks.sh

# Script para instalar git hooks no repositório
# Instala o hook pre-push que executa Prettier via Docker antes de cada push

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
  echo -e "${RED}❌ Erro: Este diretório não é um repositório Git.${NC}"
  exit 1
fi

# Criar diretório de hooks se não existir
GIT_HOOKS_DIR=".git/hooks"
if [ ! -d "$GIT_HOOKS_DIR" ]; then
  mkdir -p "$GIT_HOOKS_DIR"
fi

# Caminho do hook pre-push
PRE_PUSH_HOOK="$GIT_HOOKS_DIR/pre-push"

echo -e "${BLUE}📝 Instalando git hook pre-push...${NC}"

# Criar o hook pre-push
cat > "$PRE_PUSH_HOOK" << 'HOOK_EOF'
#!/bin/bash
# .git/hooks/pre-push
# Git hook que executa Prettier via Docker antes de cada push

# Não usar set -e porque Prettier pode retornar códigos diferentes de 0
# mesmo quando funciona corretamente
set -u  # Apenas falha em variáveis não definidas

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Executando Prettier antes do push...${NC}"

# Verificar se Docker está disponível
if ! command -v docker >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Docker não encontrado. Pulando validação Prettier.${NC}"
  echo -e "${YELLOW}💡 Instale Docker ou execute manualmente: make format-prettier${NC}"
  exit 0
fi

# Verificar se docker compose está disponível
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1 2>/dev/null; then
  COMPOSE_CMD="docker compose"
elif docker-compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo -e "${YELLOW}⚠️  Docker Compose não encontrado. Pulando validação Prettier.${NC}"
  exit 0
fi

# Diretório raiz do projeto (onde está o docker-compose.yml)
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT" || exit 1

# Verificar se docker-compose.yml existe
if [ ! -f "app/docker-compose.yml" ]; then
  echo -e "${YELLOW}⚠️  docker-compose.yml não encontrado. Pulando validação Prettier.${NC}"
  exit 0
fi

# Salvar estado atual do git
GIT_STATUS=$(git status --porcelain 2>/dev/null || echo "")

# Executar Prettier via Docker Compose
echo -e "${BLUE}🐳 Executando Prettier via Docker...${NC}"
# Prettier pode retornar código diferente de 0 mesmo quando funciona
# Por isso não verificamos o código de saída diretamente
$COMPOSE_CMD -f app/docker-compose.yml run --rm prettier 2>&1 || true

# Verificar se há mudanças após formatação
NEW_GIT_STATUS=$(git status --porcelain 2>/dev/null || echo "")

if [ "$GIT_STATUS" != "$NEW_GIT_STATUS" ]; then
  echo -e "${RED}❌ Arquivos foram formatados pelo Prettier!${NC}"
  echo -e "${YELLOW}📝 Por favor, revise as mudanças e faça commit antes de fazer push:${NC}"
  echo -e "${BLUE}   git add .${NC}"
  echo -e "${BLUE}   git commit -m 'chore: format code with Prettier'${NC}"
  echo -e "${BLUE}   git push${NC}"
  echo ""
  echo -e "${YELLOW}Ou execute manualmente: make format-prettier${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Nenhuma mudança de formatação necessária. Prosseguindo com push...${NC}"
exit 0
HOOK_EOF

# Tornar o hook executável
chmod +x "$PRE_PUSH_HOOK"

echo -e "${GREEN}✅ Git hook pre-push instalado com sucesso!${NC}"
echo ""
echo -e "${BLUE}💡 O hook será executado automaticamente antes de cada push.${NC}"
echo -e "${BLUE}💡 Para desabilitar temporariamente: chmod -x $PRE_PUSH_HOOK${NC}"
echo -e "${BLUE}💡 Para reabilitar: chmod +x $PRE_PUSH_HOOK${NC}"
echo ""
echo -e "${GREEN}📚 Formas de executar este script:${NC}"
echo -e "   ${YELLOW}1.${NC} Diretamente: ${BLUE}bash scripts/install-git-hooks.sh${NC}"
echo -e "   ${YELLOW}2.${NC} Via wrapper: ${BLUE}./install-hooks.sh${NC}"
echo -e "   ${YELLOW}3.${NC} Via Makefile: ${BLUE}make install-hooks${NC} (se make estiver instalado)"
