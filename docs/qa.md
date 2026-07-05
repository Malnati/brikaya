<!-- docs/qa.md -->
# QA

## Validação local mínima

```bash
node --version
make help
npm run test:semantic-file-names
npm run test:svg-assets
npm run build
```

## Validação publicada

Usar `BRIKAYA_PUBLIC_URL` quando for necessário testar preview autorizado. Para produção, usar `https://brikaya.com/`.


## Modo Torreta

```bash
npm run test:cloudflare-ball-turret
```

Use `BRIKAYA_BALL_TURRET_QA_REPORT`, `BRIKAYA_BALL_TURRET_MENU_SCREENSHOT`, `BRIKAYA_BALL_TURRET_DESKTOP_SCREENSHOT` e `BRIKAYA_BALL_TURRET_MOBILE_SCREENSHOT` quando a evidência publicada deve ir para `tmp/reports/` sem alterar os arquivos versionados de PR.

## Critérios

- Sem regressão de jogo principal.
- Sem assets visuais runtime fora de SVG local.
- Sem dependência de rede para jogar após primeiro carregamento.
