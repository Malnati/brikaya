<!-- docs/publicacao.md -->
# Publicação

O domínio público canônico do Brikaya é `https://brikaya.com/`.

## Comandos

```bash
make cloudflare-env-check
make cloudflare-build
make cloudflare-deploy
```

## Regras

- Publicar apenas saída estática em `dist/`.
- Bloquear qualquer fluxo que peça pagamento, cartão, plano pago, overage ou campanha ativa.
- Validar o site publicado após deploy.
