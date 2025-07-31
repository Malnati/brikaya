<!-- README.md -->
# gm-offline-brickbreaker
Offline Brick-Breacker game.

## 🎨 Sistema de Verificação de Cores

Este projeto inclui um sistema automatizado para verificar e prevenir problemas de cores no jogo. O sistema detecta automaticamente se os bricks estão sendo renderizados com as cores corretas ou se estão usando o fallback azul.

### Testes de Cores Disponíveis

```bash
# Teste básico (requer servidor rodando)
make test-colors

# Teste completo com servidor automático
make test-colors-dev

# Teste manual completo
make test-manual

# Verificação para CI/CD
make check-colors

# Diagnóstico de problemas
node scripts/diagnose-colors.js
```

### Verificação Automática

O projeto inclui um hook de pre-commit que verifica automaticamente as cores antes de cada commit. Se houver problemas, o commit será bloqueado até que sejam resolvidos.

Para mais detalhes sobre os testes de cores, consulte [COLOR_TESTING.md](COLOR_TESTING.md).

## Build nativo com Capacitor

1. Gere a build da PWA executando `make build-pwa`.
2. Copie os arquivos para as plataformas com `make prepare-capacitor`.
3. Caso seja o primeiro uso, adicione as plataformas com `npx cap add ios` e `npx cap add android`.
4. Abra o projeto iOS no Xcode: `make ios`.
5. Abra o projeto Android no Android Studio: `make android`.
