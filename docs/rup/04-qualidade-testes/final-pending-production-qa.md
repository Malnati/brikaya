<!-- docs/rup/04-qualidade-testes/final-pending-production-qa.md -->
# QA final de pendências publicadas

## Objetivo
Registrar a execução final das pendências publicáveis do Brikaya em `https://brikaya.com/`.

## Contexto
Após os merges das fases de tema SVG, progressão de fases, power-ups, recordes e efeitos visuais/sonoros, ainda existia uma pendência operacional para executar o conjunto de QA publicado contra produção. Essa validação foi executada em 2026-07-03.

## Escopo
- Validar mobile iPhone 15, menu, IndexedDB e controles.
- Validar que destruir tijolo não reinicia pontuação, bolinha nem motor.
- Validar pausa/toast e início da fase seguinte.
- Validar dashboard responsivo em mobile, paisagem, tablet e desktop.
- Validar seleção persistente de tema visual, imagens e fonte.

## Fora de escopo
- Alterar gameplay.

## Evidência principal
- Recibo consolidado: [final-pending-qa-receipt.json](../../assets/issues/final-pending-qa/evidence/final-pending-qa-receipt.json)

## Resultados de QA publicado
| Comando | URL | Resultado | Evidência |
| --- | --- | --- | --- |
| `make cloudflare-mobile-qa` | `https://brikaya.com/` | Passou; 0 problemas de console; menu e controles validados. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-qa.json) / [screenshot](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-qa.png) |
| `make cloudflare-no-score-reset` | `https://brikaya.com/` | Passou; eventos `game_start`, `brick_destroyed`, `score_update`, `collision`; sem reinício indevido. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-no-score-reset-after-brick.json) / [screenshot](../../assets/issues/final-pending-qa/evidence/production-cloudflare-no-score-reset-after-brick.png) |
| `make cloudflare-phase-transition-qa` | `https://brikaya.com/?qaScenario=single-brick-phase-clear` | Passou; `level_complete`, pausa/toast e `level_start` registrados. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-phase-transition.json) / [screenshot](../../assets/issues/final-pending-qa/evidence/production-cloudflare-phase-transition.png) |
| `make cloudflare-dashboard-layout-qa` | `https://brikaya.com/` | Passou; sem overflow horizontal nos layouts testados. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout.json) / [mobile](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout.png) / [desktop](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout-desktop.png) / [paisagem](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout-landscape.png) |
| `make cloudflare-theme-qa` | `https://brikaya.com/` | Passou; tema, conjunto de imagens e fonte persistem em mobile e desktop; 0 requisições externas. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-qa.json) / [iPhone contraste](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-iphone15-contrast.png) / [iPhone Sunset](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-iphone15-sunset.png) |

## Evidência visual
- Mobile publicado: [production-cloudflare-mobile-qa.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-qa.png)
- Menu mobile publicado: [production-cloudflare-mobile-menu.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-menu.png)
- Tema iPhone contraste: [production-cloudflare-theme-iphone15-contrast.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-iphone15-contrast.png)
- Tema desktop Sunset: [production-cloudflare-theme-desktop-sunset.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-desktop-sunset.png)

## Critério de aceite
- Pendência de QA Cloudflare publicada: concluída.
