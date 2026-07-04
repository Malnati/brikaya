<!-- docs/arquitetura.md -->
# Arquitetura

Brikaya é uma PWA estática com interface React, lógica de jogo em TypeScript, armazenamento local no navegador e service worker para disponibilidade offline.

## Camadas

- `src/components/`: interface e composição de tela.
- `src/logic/`: motor e regras de jogo.
- `src/objects/`: objetos de jogo.
- `src/storage/`: persistência local.
- `src/utils/`: utilitários técnicos.
- `src/constants/`: constantes compartilhadas.
- `public/assets/`: assets locais de runtime.

## Princípios

- Jogo principal sem dependência de rede após primeiro carregamento.
- Assets runtime locais e rastreáveis.
- Build estático em `dist/`.
