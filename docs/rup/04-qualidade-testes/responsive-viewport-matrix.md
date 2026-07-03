<!-- docs/rup/04-qualidade-testes/responsive-viewport-matrix.md -->
# Matriz responsiva obrigatória do Brikaya

## Objetivo

Garantir que a PWA publicada funcione nos tamanhos de tela definidos para mobile, tablet e desktop, priorizando o tabuleiro e a jogabilidade. Menus, botões secundários, logs e painéis continuam validados, mas não definem a cobertura principal.

## Fonte de verdade automatizada

A matriz executável fica em [`../../../tests/e2e/responsiveViewportMatrix.json`](../../../tests/e2e/responsiveViewportMatrix.json). O teste publicado principal é:

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-dashboard-layout-qa
```

## Cobertura obrigatória

| Grupo | Viewport CSS | Orientação | DPR | Dispositivos cobertos | Prioridade |
| --- | ---: | --- | ---: | --- | --- |
| iPhone 15/16 default | `393x852` | portrait | 3 | iPhone 15, iPhone 16 | Gameplay |
| iPhone 15/16 default | `852x393` | landscape | 3 | iPhone 15, iPhone 16 | Gameplay |
| iPhone 16e default | `390x844` | portrait | 3 | iPhone 16e | Gameplay |
| iPhone 16e default | `844x390` | landscape | 3 | iPhone 16e | Gameplay |
| iPhone 17 default | `402x874` | portrait | 3 | iPhone 17 | Gameplay + smoke overlays |
| iPhone 17 default | `874x402` | landscape | 3 | iPhone 17 | Gameplay |
| iPad 11/Air 11 default | `820x1180` | portrait | 2 | iPad 11-inch A16, iPad Air 11 M2/M3 | Gameplay |
| iPad 11/Air 11 default | `1180x820` | landscape | 2 | iPad 11-inch A16, iPad Air 11 M2/M3 | Gameplay |
| iPad Pro 11 M4 default | `834x1210` | portrait | 2 | iPad Pro 11-inch M4 | Gameplay |
| iPad Pro 11 M4 default | `1210x834` | landscape | 2 | iPad Pro 11-inch M4 | Gameplay |
| Desktop compacto | `1366x768` | landscape | 1 | Notebook comum | Gameplay |
| Desktop laptop | `1440x900` | landscape | 1 | Laptop amplo | Gameplay + smoke overlays |
| Desktop full HD | `1920x1080` | landscape | 1 | Monitor full HD | Gameplay |

## Critérios obrigatórios

- Sem overflow horizontal.
- Canvas inteiro dentro da área visível, sem exigir scroll para jogar.
- Canvas ocupa a largura útil quando a altura permitir; quando a altura útil limitar o tabuleiro, a cobertura exige largura jogável mínima de 60% da viewport.
- Canvas sem sobreposição por HUD, botões ou placeholders.
- Raquete/bola/tijolos continuam operáveis após resize/orientação.
- Rotação portrait → landscape não cria novo `game_start` nem `restart_game`.
- Console publicado sem `error`/`warn` do app.
- Smoke de menus/logs/colisões roda só no iPhone default mais recente e desktop principal para evitar custo de QA desnecessário.

## Achado incorporado em 2026-07-03

A matriz inicial passava nos tamanhos novos, mas revelou que tablet landscape alto e desktop podiam manter o canvas abaixo da primeira dobra. Como a prioridade é o jogo em si, a cobertura foi endurecida para exigir tabuleiro completo visível; o sizing responsivo deve limitar o canvas pela altura útil da viewport fora do modo landscape imersivo.

No deploy inicial dessa correção, a validação publicada revelou um segundo efeito: a altura corrente do canvas podia virar limite recursivo e encolher o tabuleiro em tablet/desktop. A cobertura foi ajustada para recuperar o tamanho a partir da altura útil da viewport e aceitar canvas centralizado quando a altura, e não a largura, for o limite real.

## Referências revisadas em 2026-07-03

- Apple iPhone 15/15 Plus: <https://support.apple.com/en-us/111831>
- Apple iPhone 16: <https://support.apple.com/en-us/121029>
- Apple iPhone 16e: <https://support.apple.com/en-us/122208>
- Apple iPhone 17: <https://support.apple.com/en-us/125089>
- Apple iPad 11-inch A16: <https://www.apple.com/ipad-11/specs/>
- Apple iPad Air 11-inch M3: <https://support.apple.com/en-us/122241>
- Apple iPad Pro 11-inch M4: <https://support.apple.com/en-us/119892>
- YesViz iPhone viewport table: <https://yesviz.com/iphones.php>
- YesViz iPad 11th Gen viewport: <https://yesviz.com/devices/ipad-2025/>
- iPad viewport reference table: <https://screensizechecker.com/devices/ipad-viewport-sizes>
