<!-- README.md -->
# gm-offline-brickbreaker
Offline Brick-Breacker game.

## Build nativo com Capacitor

1. Gere a build da PWA executando `make build-pwa`.
2. Copie os arquivos para as plataformas com `make prepare-capacitor`.
3. Caso seja o primeiro uso, adicione as plataformas com `npx cap add ios` e `npx cap add android`.
4. Abra o projeto iOS no Xcode: `make ios`.
5. Abra o projeto Android no Android Studio: `make android`.
