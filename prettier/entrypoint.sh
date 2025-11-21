#!/bin/bash
# prettier/entrypoint.sh

# Executar script de formatação Prettier
# Este script é chamado pelo Docker Compose quando o serviço prettier é executado

set -e

# Diretório de trabalho (montado via volume)
WORK_DIR="${WORK_DIR:-/workspace}"
cd "$WORK_DIR" || exit 1

# Variáveis de ambiente para o script
export IN_DOCKER=true
export WORK_DIR="$WORK_DIR"

# Executar script de formatação
exec /bin/bash "$WORK_DIR/scripts/format-prettier.sh"
