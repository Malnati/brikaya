#!/bin/bash

# Script de pre-commit para verificar cores do jogo
# Este script deve ser executado antes de cada commit

set -e

echo "🔍 Verificando integridade das cores do jogo..."

# Verificar se o diretório tmp existe
if [ ! -d "tmp" ]; then
    mkdir -d tmp
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules não encontrado. Execute 'npm install' primeiro."
    exit 1
fi

# Verificar se o Puppeteer está instalado
if ! npm list puppeteer > /dev/null 2>&1; then
    echo "❌ Puppeteer não encontrado. Execute 'npm install' primeiro."
    exit 1
fi

# Iniciar servidor de desenvolvimento em background
echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Aguardar o servidor inicializar
echo "⏳ Aguardando servidor inicializar..."
sleep 8

# Executar teste de cores
echo "🧪 Executando teste de cores..."
if npm run test:colors; then
    echo "✅ Teste de cores passou!"
    RESULT=0
else
    echo "❌ Teste de cores falhou!"
    RESULT=1
fi

# Parar o servidor
echo "🛑 Parando servidor..."
kill $DEV_PID 2>/dev/null || true

# Aguardar o processo terminar
wait $DEV_PID 2>/dev/null || true

# Verificar se há screenshots de erro
if [ -f "tmp/color-test-screenshot.png" ]; then
    echo "📸 Screenshot de teste salvo em: tmp/color-test-screenshot.png"
fi

# Retornar resultado
if [ $RESULT -eq 0 ]; then
    echo "🎉 Verificação de cores concluída com sucesso!"
    exit 0
else
    echo "🚨 Verificação de cores falhou. Verifique os logs acima."
    echo "💡 Dicas para resolver:"
    echo "   - Verifique se as imagens dos bricks existem em public/assets/"
    echo "   - Verifique se o AssetLoader está carregando as imagens corretamente"
    echo "   - Verifique se não há problemas de CORS ou caminhos"
    exit 1
fi 