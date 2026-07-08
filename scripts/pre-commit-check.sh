#!/bin/bash
# scripts/pre-commit-check.sh

set -euo pipefail

echo "🔍 Verificando governança Codex/.env..."
npm run codex-env:check

echo "🔍 Verificando nomes semânticos de arquivos..."
npm run test:semantic-file-names

echo "🔍 Verificando SVGs runtime..."
npm run test:svg-assets

echo "🔍 Verificando política visual SVG-first..."
npm run test:visual-asset-policy

echo "🎉 Pre-commit concluído sem vazamento de variáveis."
