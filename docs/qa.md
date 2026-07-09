<!-- docs/qa.md -->
# QA

## Validação local mínima

```bash
node --version
make help
npm run test:semantic-file-names
npm run test:svg-assets
npm run test:visual-asset-policy
npm run build
npm test
```

## Suíte e2e no CI

O workflow `ci-reusable` executa `npm run test:cloudflare-e2e` contra o `dist/` servido em `http://127.0.0.1:7979/` antes de qualquer deploy (`deploy-preview` e `deploy-production` dependem de `needs: ci`).

Replicação local:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 7979 &
BRIKAYA_PUBLIC_URL=http://127.0.0.1:7979/ npm run test:cloudflare-e2e
```

Atalho: `make cloudflare-e2e-qa` (requer `BRIKAYA_PUBLIC_URL` quando o alvo não for o padrão de produção).

No CI/preview local (`127.0.0.1`), `cloudflare-audio-qa.js` fica de fora do gate automático; validar áudio com `make cloudflare-audio-qa` contra `https://brikaya.com/` ou `https://dev.brikaya.com/`.

Variáveis opcionais para depuração: `BRIKAYA_E2E_ONLY` e `BRIKAYA_E2E_SKIP` (lista separada por vírgula de caminhos em `tests/e2e/`).

## Validação publicada

Usar `BRIKAYA_PUBLIC_URL` quando for necessário testar preview autorizado. Para produção, usar `https://brikaya.com/`.


## Modo Torreta

```bash
npm run test:cloudflare-ball-turret
```

Use `BRIKAYA_BALL_TURRET_QA_REPORT`, `BRIKAYA_BALL_TURRET_MENU_SCREENSHOT`, `BRIKAYA_BALL_TURRET_DESKTOP_SCREENSHOT` e `BRIKAYA_BALL_TURRET_MOBILE_SCREENSHOT` quando a evidência publicada deve ir para `tmp/reports/` sem alterar os arquivos versionados de PR.

## Critérios

- Sem regressão de jogo principal.
- Sem raster runtime fora de SVG local ou exceção governada em `docs/assets/visual-runtime/atlas-exceptions.json`.
- Sem dependência de rede para jogar após primeiro carregamento.
