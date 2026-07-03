<!-- docs/rup/04-qualidade-testes/cloudflare-offline-pwa-qa.md -->
# QA publicado: funcionamento sem internet

## Objetivo

Provar que o jogo publicado no Cloudflare Pages abre, mantém o canvas visível e serve arquivos essenciais após o primeiro carregamento, mesmo com a rede desativada no navegador.

## Escopo validado

- Registro e controle ativo do Service Worker.
- Cache versionado do runtime publicado.
- Recarregamento da tela principal sem internet.
- Resposta offline para HTML, manifesto, SVGs visuais e áudio essencial.
- Ausência de requests externos.
- Ausência de termos técnicos internos na interface final.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ npm run test:cloudflare-offline-pwa
```

Para preview de branch, substitua `BRICKBREAKER_PUBLIC_URL` pela URL publicada da branch.

## Evidência esperada

- `tmp/reports/cloudflare-offline-pwa-qa.json`
- `tmp/screenshots/cloudflare-offline-pwa-qa.png`

O JSON deve conter `ok: true`, cache `breakout-cache-*`, `hasCanvas: true`, `hasController: true`, lista de arquivos essenciais com status 200 e `externalRequests: []`.
