<!-- docs/rup/04-qualidade-testes/cloudflare-gameplay-basic-qa.md -->
# QA publicado: gameplay básico

## Objetivo

Provar que o jogo publicado no Cloudflare Pages carrega a tela principal, mantém controles essenciais visíveis, aceita entrada básica, pontua e registra eventos mínimos sem reinício indevido.

## Escopo validado

- Canvas visível e com área útil.
- HUD com score avançando durante observação curta.
- Controles visíveis com alvo mínimo de 44 px.
- Eventos `game_start`, `brick_destroyed` e `score_update` no IndexedDB.
- Ausência de `restart_game` e `game_end` no fluxo básico observado.
- Ausência de requests externos e problemas de console.
- Ausência de termos técnicos internos na interface final.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ npm run test:cloudflare-gameplay-basic
```

Para preview de branch, substitua `BRICKBREAKER_PUBLIC_URL` pela URL publicada da branch.

## Evidência esperada

- `tmp/reports/cloudflare-gameplay-basic-qa.json`
- `tmp/screenshots/cloudflare-gameplay-basic-qa.png`

O JSON deve conter `ok: true`, score maior que zero, eventos obrigatórios presentes e `externalRequests: []`.
