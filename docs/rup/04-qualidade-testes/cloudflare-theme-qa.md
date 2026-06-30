<!-- docs/rup/04-qualidade-testes/cloudflare-theme-qa.md -->
# QA publicado: tema claro/escuro e Design System

## Objetivo

Garantir que a adaptação visual ao Design System e o seletor `Claro`/`Escuro` funcionem somente com funcionalidades existentes do BrickBreaker e sem recursos externos.

## Comando oficial

```bash
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-theme-qa
```

Para preview de branch, substitua `BRICKBREAKER_PUBLIC_URL` pela URL publicada pelo Cloudflare Pages.

## Evidências esperadas

- Screenshot iPhone 15 claro.
- Screenshot iPhone 15 escuro.
- Screenshot desktop claro.
- Screenshot desktop escuro.
- Relatório JSON do teste publicado.

## Critérios obrigatórios

- URL precisa terminar em `.pages.dev`.
- Seletor `Claro`/`Escuro` deve aparecer em iPhone 15 e desktop.
- A seleção deve mudar `data-theme` no documento.
- A escolha deve persistir após reload.
- Sem overflow horizontal.
- Todos os botões devem ter alvo mínimo de 44px.
- Canvas inteiro deve estar visível.
- Logs e colisões devem continuar acessíveis.
- Loja, ranking, leaderboard, upgrades, tutorial, multiplayer e settings não podem aparecer.
- Nenhum recurso externo pode ser requisitado.
- Console não pode publicar `warn` nem `error`.

## Bloqueadores

- Tema validado somente em localhost.
- Uso de Tailwind CDN, Google Fonts, Material Symbols, `googleusercontent` ou qualquer terceiro.
- Adição de funcionalidade desenhada mas não existente no jogo.
- PR sem screenshots e JSON do app publicado.
