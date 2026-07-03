<!-- docs/rup/04-qualidade-testes/cloudflare-mobile-qa.md -->
# QA mobile publicado no Cloudflare

## Regra

Testes locais são pré-checks técnicos. A prova da verdade do Brikaya é sempre o aplicativo publicado no Cloudflare Pages.

## Runtime obrigatório

Antes de qualquer build, deploy ou QA publicado, execute `node --version` e confirme Node v23.x. Testes gerados por outro runtime não são evidência aceita para este projeto.

## Fluxo obrigatório

1. Publicar a branch no Cloudflare Pages Direct Upload.
2. Executar `make cloudflare-mobile-qa` com `BRICKBREAKER_PUBLIC_URL` apontando para o preview publicado.
3. Validar iPhone default mais recente, canvas, botões, logs, estatísticas, IndexedDB, console e screenshot.
4. Executar `make cloudflare-no-score-reset` para provar que colisão com tijolo/pontuação não reinicia motor, não registra `restart_game` sem ação humana e não recoloca a bolinha no ponto inicial.
5. Executar `make cloudflare-phase-transition-qa` para provar pausa, toast, `level_complete`, `level_start` e ausência de `game_end` em conclusão de fase.
6. Executar `make cloudflare-dashboard-layout-qa` para validar a matriz obrigatória em `tests/e2e/responsiveViewportMatrix.json`: iPhone default 2023-2026, iPad default/11-inch 2023-2026 e desktop 1366/1440/1920.
7. Executar `make cloudflare-theme-qa` para provar seletor claro/escuro, persistência, ausência de features fora de escopo e ausência de recursos externos.
8. Salvar evidências em `docs/assets/issues/<slug>/evidence/` quando houver PR de UI/gameplay.
9. Mesclar apenas após CI e QA publicado passarem.
10. Após merge, repetir QA contra `https://brikaya.com/`.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-mobile-qa
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-no-score-reset
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-phase-transition-qa
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-dashboard-layout-qa
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-theme-qa
```

## Evidência esperada

- Screenshot PNG do app publicado.
- JSON com URL, viewport, estado de layout, IndexedDB, logs, estatísticas e console.
- JSON de continuidade pós-tijolo com contagem de `game_start`, `restart_game`, `score_update` e posição da bolinha.
- JSON de transição de fase com `level_complete`, `level_start`, pausa observada, toast e screenshot.
- JSON de layout responsivo com matriz obrigatória, botões 44px+, canvas inteiro visível e placeholders de anúncio seguros.
- JSON de tema com screenshots claro/escuro, persistência após reload e bloqueio de recursos externos.
- Registro no PR com link para os artefatos.

## Matriz responsiva oficial

A lista detalhada de viewports obrigatórios está em [Matriz responsiva obrigatória do Brikaya](./responsive-viewport-matrix.md).
