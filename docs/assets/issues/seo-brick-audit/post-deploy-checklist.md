# SEO brick audit — pós-deploy

## Estado local (branch `mal/seo-brick-audit-b946`)

Validado no repositório após build:

```bash
npm run test:seo-brand-copy
rg -i 'brick-breaking|block breaker|quebrar bloco' dist/index.html dist/en/index.html public/about/index.html
```

Resultado esperado: sem ocorrências.

## Produção antes do deploy

Evidência capturada em `curl-production-evidence.txt` (2026-07-09):

- `/` — meta ainda com `quebrar blocos` (JSON-LD legado em cache/build anterior)
- `/en/` — `block breaker arcade` no HTML estático
- `/about/` — `brick-breaking play`
- `/fr/` — `casse-briques`
- `/nl/` — `blokbreker`

## Após merge + CI + deploy preview/produção

1. Purge cache Cloudflare (`make cloudflare-purge-cache` ou pipeline deploy)
2. IndexNow: `npm run indexnow:yandex` (requer `BRIKAYA_INDEXNOW_KEY` no `.env`)
3. Revalidar:

```bash
curl -sL https://brikaya.com/about/ | rg -i 'brick|circuit-component'
curl -sL https://brikaya.com/en/ | rg -i 'block breaker|circuit component'
curl -sL https://brikaya.com/ | rg -i 'quebrar bloco|circuitos eletrônicos'
```

4. Consultas SERP externas:

- `site:brikaya.com brick`
- `site:brikaya.com "block breaker"`
- `site:brikaya.com "brick-breaking"`

## PR

https://github.com/Malnati/brikaya/pull/293
