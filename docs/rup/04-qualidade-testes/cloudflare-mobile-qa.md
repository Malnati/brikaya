<!-- docs/rup/04-qualidade-testes/cloudflare-mobile-qa.md -->
# QA mobile publicado no Cloudflare

## Regra

Testes locais são pré-checks técnicos. A prova da verdade do BrickBreaker é sempre o aplicativo publicado no Cloudflare Pages.

## Fluxo obrigatório

1. Publicar a branch no Cloudflare Pages Direct Upload.
2. Executar `make cloudflare-mobile-qa` com `BRICKBREAKER_PUBLIC_URL` apontando para o preview publicado.
3. Validar iPhone 15, canvas, botões, logs, estatísticas, IndexedDB, console e screenshot.
4. Salvar evidências em `docs/assets/issues/<slug>/evidence/` quando houver PR de UI/gameplay.
5. Mesclar apenas após CI e QA publicado passarem.
6. Após merge, repetir QA contra `https://malnati-brickbreaker.pages.dev/`.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-mobile-qa
```

## Evidência esperada

- Screenshot PNG do app publicado.
- JSON com URL, viewport, estado de layout, IndexedDB, logs, estatísticas e console.
- Registro no PR com link para os artefatos.
