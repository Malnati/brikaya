<!-- CHANGELOG.md -->
# Changelog

## 2026-07-05 — v1.2.4 — Joystick orbital da Torreta

- Convertido o joystick da Torreta para giro orbital contínuo da cama elástica.
- Mantido o toque dentro do próprio joystick: segurar à direita/esquerda gira a cama elástica por toda a circunferência.
- Ao soltar ou centralizar o joystick, o giro para e a cama elástica mantém a posição atual.
- Preservado o arraste direto no tabuleiro como controle alternativo.
- Ampliada a cobertura unitária e o QA da Torreta para provar giro contínuo sem arraste pela tela inteira.

## 2026-07-05 — v1.2.3 — Joystick touch da Torreta

- Adicionado joystick visível no modo Torreta para dispositivos de toque.
- Posicionado o joystick abaixo do tabuleiro em portrait e à direita em landscape.
- Ligado o joystick ao segmento ativo da cama elástica por ângulo direto em 360°.
- Mantido o arraste direto no tabuleiro como controle alternativo.
- Adicionada cobertura unitária e QA visual portrait/landscape para a Torreta.

## 2026-07-05 — v1.2.2 — Torreta 360°

- Expandida a Torreta para arena de 360°.
- Distribuídos blocos por toda a circunferência.
- Ajustados power-ups para saírem do centro em direção às bordas.
- Ajustadas bolinhas para nascerem em pontos variados da borda.
- Mantido o modo clássico sem alteração.

## 2026-07-05 — v1.2.1 — Torreta com cama elástica

- Substituída a mira por uma cama elástica curva móvel no modo Torreta.
- Invertida a coleção de tijolos da Torreta para o arco inferior, oposto à posição clássica.
- Atualizada a cópia do menu para a nova ação de rebater na cama elástica.
- Adicionada release note `docs/releases/v1.2.1.md`.

## 2026-07-05 — v1.2.0 — Modo Torreta

- Adicionado o modo de jogo `Torreta` acionado pelo menu.
- Mantidos bolinha, blocos, poderes, fases e recordes compartilhados com o modo clássico.
- Adicionada renderização de mira, cano, bolha de vidro e profundidade dentro do círculo.
- Adicionadas cobertura unitária, QA visual desktop/mobile e release note versionada.
- Fechada antes da feature a pendência de contagem em Safari mobile via PR #170.

## 2026-07-04 — Baseline inicial

- Estabelecido baseline público do Brikaya.
- Consolidada a identidade atual do produto.
- Definida distribuição proprietária.
- Removida documentação histórica anterior do repositório público.
- Preparado repositório para histórico Git consolidado em commit único.
