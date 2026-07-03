<!-- docs/rup/04-qualidade-testes/final-pending-production-qa.md -->
# QA final de pendências publicadas

## Objetivo
Registrar a execução final das pendências publicáveis do BrickBreaker em `https://malnati-brickbreaker.pages.dev/` e separar o que ficou bloqueado por dependência externa de DNS.

## Contexto
Após os merges das fases de tema SVG, progressão de fases, power-ups, recordes e efeitos visuais/sonoros, ainda existia uma pendência operacional para executar o conjunto de QA publicado contra produção. Essa validação foi executada em 2026-07-03.

## Escopo
- Validar mobile iPhone 15, menu, IndexedDB e controles.
- Validar que destruir tijolo não reinicia pontuação, bolinha nem motor.
- Validar pausa/toast e início da fase seguinte.
- Validar dashboard responsivo em mobile, paisagem, tablet e desktop.
- Validar seleção persistente de tema visual, imagens e fonte.
- Registrar prova Caddy/TLS/`/healthz` como bloqueada quando DNS não resolve.

## Fora de escopo
- Alterar gameplay.
- Alterar DNS de `cranio.dev`.
- Operar Caddy, VPS ou Cloudflare DNS.
- Marcar TLS/`/healthz` como concluídos sem DNS público resolvendo.

## Evidência principal
- Recibo consolidado: [final-pending-qa-receipt.json](../../assets/issues/final-pending-qa/evidence/final-pending-qa-receipt.json)
- Prova Caddy bloqueada: [caddy-public-proof-blocked-receipt.json](../../assets/issues/final-pending-qa/evidence/caddy-public-proof-blocked-receipt.json) / [summary](../../assets/issues/final-pending-qa/evidence/caddy-public-proof-blocked-summary.md)

## Resultados de QA publicado
| Comando | URL | Resultado | Evidência |
| --- | --- | --- | --- |
| `make cloudflare-mobile-qa` | `https://malnati-brickbreaker.pages.dev/` | Passou; 0 problemas de console; menu e controles validados. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-qa.json) / [screenshot](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-qa.png) |
| `make cloudflare-no-score-reset` | `https://malnati-brickbreaker.pages.dev/` | Passou; eventos `game_start`, `brick_destroyed`, `score_update`, `collision`; sem reinício indevido. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-no-score-reset-after-brick.json) / [screenshot](../../assets/issues/final-pending-qa/evidence/production-cloudflare-no-score-reset-after-brick.png) |
| `make cloudflare-phase-transition-qa` | `https://malnati-brickbreaker.pages.dev/?qaScenario=single-brick-phase-clear` | Passou; `level_complete`, pausa/toast e `level_start` registrados. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-phase-transition.json) / [screenshot](../../assets/issues/final-pending-qa/evidence/production-cloudflare-phase-transition.png) |
| `make cloudflare-dashboard-layout-qa` | `https://malnati-brickbreaker.pages.dev/` | Passou; sem overflow horizontal nos layouts testados. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout.json) / [mobile](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout.png) / [desktop](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout-desktop.png) / [paisagem](../../assets/issues/final-pending-qa/evidence/production-cloudflare-dashboard-layout-landscape.png) |
| `make cloudflare-theme-qa` | `https://malnati-brickbreaker.pages.dev/` | Passou; tema, conjunto de imagens e fonte persistem em mobile e desktop; 0 requisições externas. | [JSON](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-qa.json) / [iPhone contraste](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-iphone15-contrast.png) / [iPhone Sunset](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-iphone15-sunset.png) |

## Evidência visual
- Mobile publicado: [production-cloudflare-mobile-qa.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-qa.png)
- Menu mobile publicado: [production-cloudflare-mobile-menu.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-mobile-menu.png)
- Tema iPhone contraste: [production-cloudflare-theme-iphone15-contrast.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-iphone15-contrast.png)
- Tema desktop Sunset: [production-cloudflare-theme-desktop-sunset.png](../../assets/issues/final-pending-qa/evidence/production-cloudflare-theme-desktop-sunset.png)

## Bloqueio Caddy/TLS/healthz
A validação Caddy/TLS/`/healthz` foi delegada ao orquestrador obrigatório `root@217.76.58.179:/root/w/iac` via `tmux` + Codex headless, por ser escopo VPS. Resultado: bloqueado antes de TLS.

- Domínio testado: `brickbreacker.cranio.dev`
- DNS: `NXDOMAIN` para A/AAAA via resolvedor do sistema, Cloudflare `1.1.1.1`, Google `8.8.8.8` e `getent hosts` sem resultado.
- TLS: não validável porque o hostname não resolve.
- `/healthz`: não validável; `curl` normal com TLS ficou em status `000` por falha de resolução.

## Critério de aceite
- Pendência de QA Cloudflare publicada: concluída.
- Pendências Caddy/TLS/`/healthz`: permanecem abertas até DNS público de `brickbreacker.cranio.dev` apontar para o host correto e nova prova remota retornar TLS válido + `/healthz` HTTP 200 com corpo `healthy`.
