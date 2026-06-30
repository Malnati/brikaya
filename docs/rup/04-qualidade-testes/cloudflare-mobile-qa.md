<!-- docs/rup/04-qualidade-testes/cloudflare-mobile-qa.md -->
# QA mobile publicado no Cloudflare

## Regra

Testes locais são pré-checks técnicos. A prova da verdade do BrickBreaker é sempre o aplicativo publicado no Cloudflare Pages.

## Runtime obrigatório

Antes de qualquer build, deploy ou QA publicado, execute `node --version` e confirme Node v23.x. Testes gerados por outro runtime não são evidência aceita para este projeto.

## Fluxo obrigatório

1. Publicar a branch no Cloudflare Pages Direct Upload.
2. Executar `make cloudflare-mobile-qa` com `BRICKBREAKER_PUBLIC_URL` apontando para o preview publicado.
3. Validar iPhone 15, canvas, botões, logs, estatísticas, IndexedDB, console e screenshot.
4. Executar `make cloudflare-no-score-reset` para provar que colisão com tijolo/pontuação não reinicia motor, não registra `restart_game` sem ação humana e não recoloca a bolinha no ponto inicial.
5. Executar `make cloudflare-phase-transition-qa` para provar pausa, toast, `level_complete`, `level_start` e ausência de `game_end` em conclusão de fase.
6. Executar `make cloudflare-dashboard-layout-qa` para validar iPhone SE, iPhone 12/13/14, iPhone 15, iPhone Pro Max, landscape, tablet e desktop.
7. Salvar evidências em `docs/assets/issues/<slug>/evidence/` quando houver PR de UI/gameplay.
8. Mesclar apenas após CI e QA publicado passarem.
9. Após merge, repetir QA contra `https://malnati-brickbreaker.pages.dev/`.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-mobile-qa
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-no-score-reset
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-phase-transition-qa
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-dashboard-layout-qa
```

## Evidência esperada

- Screenshot PNG do app publicado.
- JSON com URL, viewport, estado de layout, IndexedDB, logs, estatísticas e console.
- JSON de continuidade pós-tijolo com contagem de `game_start`, `restart_game`, `score_update` e posição da bolinha.
- JSON de transição de fase com `level_complete`, `level_start`, pausa observada, toast e screenshot.
- JSON de layout responsivo com viewports obrigatórios, botões 44px+, canvas visível e placeholders de anúncio seguros.
- Registro no PR com link para os artefatos.
