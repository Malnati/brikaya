# docs/publicacao.md
# Publicação

O domínio público canônico do Brikaya é `https://brikaya.com/`.
O domínio de desenvolvimento publicado é `https://dev.brikaya.com/`.

## CI/CD automático

| Branch | Workflow | Destino |
|--------|----------|---------|
| `main` | `ci` → `deploy-production` | `https://brikaya.com/` |
| demais | `ci` → `deploy-preview` | `https://dev.brikaya.com/` |

O preview em `dev.brikaya.com` reflete o último push de branch não-main que passou no CI.

## Comandos locais

```bash
make cloudflare-env-check
make cloudflare-build
make cloudflare-deploy
make cloudflare-deploy-preview
```

## Automação Git (agentes)

```bash
npm run brikaya:ship        # commit + push + PR
npm run brikaya:merge-pr    # merge autônomo após CI verde
npm run brikaya:sync-gh-secrets
npm run brikaya:gh-admin-setup
```

## Regras

- Publicar apenas saída estática em `dist/`.
- Bloquear qualquer fluxo que peça pagamento, cartão, plano pago, overage ou campanha ativa.
- Validar o site publicado após deploy.
- QA em preview: `BRIKAYA_PUBLIC_URL=https://dev.brikaya.com/ make cloudflare-mobile-qa`

## Secrets do GitHub Actions (nomes apenas)

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Sincronizar do `.env` local com `npm run brikaya:sync-gh-secrets` (valores nunca versionados).
