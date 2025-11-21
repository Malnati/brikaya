#!/bin/bash
# scripts/format-prettier.sh

# Script para executar Prettier localmente, replicando a lógica do workflow
# .github/workflows/prettier.yml
# Suporta execução local e via Docker

# Não usar set -e porque Prettier pode retornar códigos de saída diferentes de 0
# mesmo quando funciona corretamente (ex: arquivos que não podem ser formatados)
set -u  # Apenas falha em variáveis não definidas

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detecta se está rodando dentro do Docker
IN_DOCKER=${IN_DOCKER:-false}

# Diretório de trabalho (raiz do projeto)
WORK_DIR="${WORK_DIR:-$(pwd)}"
cd "$WORK_DIR" || exit 1

echo -e "${BLUE}🔍 Procurando projetos Node.js em: $WORK_DIR${NC}"

# Encontra todos os diretórios que contêm package.json na raiz
# Exclui node_modules, .git, e diretórios de referência/documentação
# Remove a raiz (.) se ela contiver package.json mas não for um projeto real
PROJECT_DIRS=$(find . -name "package.json" -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/docs/*" \
  -not -path "*/.ref/*" \
  -exec dirname {} \; | sort -u | sed 's|^\./||' | sed 's|^\.$||' | grep -v '^$' | sed 's|$|/|' | tr '\n' ' ' | sed 's/[[:space:]]*$//')

# Se não houver projetos, avisa e sai
if [ -z "$PROJECT_DIRS" ]; then
  echo -e "${YELLOW}⚠️  Nenhum projeto Node.js encontrado. Prettier será ignorado.${NC}"
  exit 0
fi

echo -e "${GREEN}✅ Projetos Node.js encontrados: $PROJECT_DIRS${NC}"

# Verifica se o arquivo .prettierignore existe em .github/workflows/
IGNORE_PATH=""
if [ -f ".github/workflows/.prettierignore" ]; then
  IGNORE_PATH=".github/workflows/.prettierignore"
  echo -e "${GREEN}✅ Usando .prettierignore de .github/workflows/${NC}"
else
  echo -e "${YELLOW}⚠️  Nenhum arquivo .prettierignore encontrado em .github/workflows/. Continuando sem ignore path.${NC}"
fi

if [ -n "$IGNORE_PATH" ]; then
  IGNORE_OPTION="--ignore-path $IGNORE_PATH"
else
  IGNORE_OPTION=""
fi

# Verifica se Prettier está disponível
# Prioriza Prettier da raiz, depois global
PRETTIER_CMD=""
if [ -f "node_modules/.bin/prettier" ]; then
  PRETTIER_CMD="node_modules/.bin/prettier"
elif command -v prettier >/dev/null 2>&1; then
  PRETTIER_CMD="prettier"
else
  echo -e "${RED}❌ Prettier não encontrado.${NC}"
  if [ "$IN_DOCKER" = "false" ]; then
    echo -e "${YELLOW}💡 Instale com: npm install prettier${NC}"
    echo -e "${YELLOW}💡 Ou execute via Docker: make format-prettier${NC}"
  else
    echo -e "${YELLOW}💡 Instalando Prettier...${NC}"
    npm install prettier@latest --no-save || exit 1
    PRETTIER_CMD="node_modules/.bin/prettier"
  fi
  if [ -z "$PRETTIER_CMD" ]; then
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}📝 Executando Prettier nos projetos encontrados...${NC}"
echo -e "${BLUE}   Comando: $PRETTIER_CMD${NC}"
if [ -n "$IGNORE_OPTION" ]; then
  echo -e "${BLUE}   Ignore path: $IGNORE_PATH${NC}"
fi

# Prepara lista de diretórios para o Prettier (remove barras finais)
DIRS_FOR_PRETTIER=""
for DIR in $PROJECT_DIRS; do
  DIR_CLEAN=$(echo "$DIR" | sed 's|/$||')
  if [ -d "$DIR_CLEAN" ]; then
    DIRS_FOR_PRETTIER="$DIRS_FOR_PRETTIER $DIR_CLEAN"
  fi
done

# Executa Prettier uma única vez com todos os diretórios (como no workflow)
# --ignore-unknown: ignora arquivos desconhecidos
# --write: escreve as mudanças nos arquivos
if [ -n "$DIRS_FOR_PRETTIER" ]; then
  # Prettier pode retornar código de saída diferente de 0 mesmo quando funciona corretamente
  # Por isso capturamos e reportamos o código de saída, mas não tratamos como erro fatal
  echo -e "${BLUE}   Diretórios: $DIRS_FOR_PRETTIER${NC}"
  $PRETTIER_CMD $IGNORE_OPTION --ignore-unknown --write $DIRS_FOR_PRETTIER
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Formatação concluída com sucesso!${NC}"
  else
    echo -e "${YELLOW}⚠️  Prettier concluído com código de saída $EXIT_CODE (pode ser normal)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Nenhum diretório válido encontrado para formatação.${NC}"
fi

