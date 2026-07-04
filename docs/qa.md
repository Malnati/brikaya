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

## Critérios

- Sem regressão de jogo principal.
- Sem assets visuais runtime fora de SVG local.
- Sem dependência de rede para jogar após primeiro carregamento.
