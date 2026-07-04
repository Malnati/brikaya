#!/bin/bash
# install-hooks.sh

# Wrapper script para instalar git hooks
# Pode ser executado diretamente sem necessidade do make

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_SCRIPT="$SCRIPT_DIR/scripts/install-git-hooks.sh"

if [ ! -f "$HOOKS_SCRIPT" ]; then
  echo "❌ Erro: Script de instalação não encontrado em $HOOKS_SCRIPT"
  exit 1
fi

# Executar o script de instalação
bash "$HOOKS_SCRIPT"
