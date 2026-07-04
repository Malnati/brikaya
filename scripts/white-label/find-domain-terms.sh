#!/bin/bash
# scripts/white-label/find-domain-terms.sh
# Script para encontrar termos do domínio anterior no código e documentação

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_FILE="${PROJECT_ROOT}/docs/rup/99-anexos/reference/termos-dominio-anterior.csv"

# Termos proibidos do domínio anterior
TERMS=(
  "resíduo"
  "residuo"
  "resíduos"
  "residuos"
  "lote"
  "lotes"
  "crédito de carbono"
  "credito de carbono"
  "créditos de carbono"
  "creditos de carbono"
  "marketplace de resíduos"
  "marketplace de residuos"
)

echo "Arquivo,Linha,Termo,Contexto" > "$OUTPUT_FILE"

for term in "${TERMS[@]}"; do
  echo "Buscando: $term"
  
  # Buscar em arquivos de código e documentação
  rg -n -i "$term" \
    --type-add 'code:*.{ts,tsx,js,jsx,sql}' \
    --type code \
    --type markdown \
    --type yaml \
    --type json \
    "$PROJECT_ROOT" 2>/dev/null | while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    line_num=$(echo "$line" | cut -d: -f2)
    context=$(echo "$line" | cut -d: -f3- | sed 's/"/""/g')
    
    # Converter caminho relativo
    rel_file="${file#$PROJECT_ROOT/}"
    
    echo "\"$rel_file\",\"$line_num\",\"$term\",\"$context\"" >> "$OUTPUT_FILE"
  done || true
done

echo ""
echo "Relatório gerado em: $OUTPUT_FILE"
echo "Total de ocorrências encontradas: $(tail -n +2 "$OUTPUT_FILE" | wc -l)"

