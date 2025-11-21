#!/bin/bash
# scripts/white-label/validate-headers.sh
# Script para validar cabeçalhos de caminho em arquivos Markdown

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FAILED_FILES=()

# Encontrar todos os arquivos .md
while IFS= read -r -d '' file; do
  rel_file="${file#$PROJECT_ROOT/}"
  
  # Verificar se o arquivo tem cabeçalho de caminho
  if ! head -n 1 "$file" | grep -q "^<!-- $rel_file -->"; then
    FAILED_FILES+=("$rel_file")
  fi
done < <(find "$PROJECT_ROOT" -name "*.md" -type f -print0)

if [ ${#FAILED_FILES[@]} -eq 0 ]; then
  echo "✅ Todos os arquivos Markdown possuem cabeçalhos de caminho corretos"
  exit 0
else
  echo "❌ Arquivos sem cabeçalho de caminho correto:"
  for file in "${FAILED_FILES[@]}"; do
    echo "  - $file"
  done
  exit 1
fi

