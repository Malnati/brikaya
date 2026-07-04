<!-- docs/rup/02-design/design-system-adaptacao-escopo.md -->
# Adaptação do Design System ao Brikaya atual

## Objetivo

Aplicar o Design System proposto em `design-system/` ao jogo existente sem transformar protótipos em funcionalidades novas. A única funcionalidade adicionada nesta entrega é a seleção explícita de tema claro/escuro na tela.

## Fontes visuais aceitas

| Fonte | Uso nesta entrega | Observação |
| --- | --- | --- |
| `design-system/kinetic_neon/DESIGN.md` | Tema escuro | Usar tokens de cor, ritmo visual, cards, chips e botões. |
| `design-system/kinetic_high_contrast/DESIGN.md` | Tema claro | Usar tokens de cor, contraste, cards, chips e botões. |
| `design-system/*/screen.png` | Referência visual | Usar apenas como inspiração de superfícies existentes. |
| `design-system/*/code.html` | Não copiar | Contém Tailwind CDN, Google Fonts, Material Symbols e imagens remotas; incompatível com PWA offline. |

## Matriz de escopo

| Item desenhado/proposto | Status no jogo atual | Decisão |
| --- | --- | --- |
| Arena de jogo | Existe | Aplicar tema ao shell, frame, botões, chips, toast e superfícies ao redor. |
| Alternância claro/escuro | Não existia | Implementar como seletor visível `Claro`/`Escuro`. |
| Logs | Existe | Adaptar visual aos tokens do tema. |
| Estatísticas de colisões | Existe | Adaptar visual aos tokens do tema. |
| Publicidade | Sem anúncio real aprovado | Manter oculto; não adicionar placeholder, reserva visual nem scripts reais. |
| Loja/store | Não existe | Fora de escopo. Não implementar. |
| Upgrades/power-ups novos | Não existe nesta entrega | Fora de escopo. Não implementar. |
| Ranking/leaderboard | Não existe | Fora de escopo. Não implementar. |
| Settings/configurações | Não existe | Fora de escopo. Não implementar. |
| Tutorial | Não existe | Fora de escopo. Não implementar. |
| Multiplayer | Não existe | Fora de escopo. Não implementar. |
| Créditos/moeda | Não existe | Fora de escopo. Não implementar. |
| Navegação inferior | Não existe | Fora de escopo. Não implementar. |
| Vidas como HUD | Não faz parte do HUD atual entregue | Fora de escopo até decisão específica de gameplay. |

## Tokens aplicados

| Token CSS | Tema escuro — Kinetic Neon | Tema claro — Kinetic High-Contrast | Uso |
| --- | --- | --- | --- |
| `--bb-color-background` | `#131313` | `#fcf8fb` | Fundo geral. |
| `--bb-color-surface` | `#1c1b1b` | `#ffffff` | Superfícies principais. |
| `--bb-color-panel` | `#20201f` | `#f6f3f5` | Cards, painéis e modais. |
| `--bb-color-panel-soft` | `#2a2a2a` | `#eae7ea` | Botões secundários e estados. |
| `--bb-color-text` | `#e5e2e1` | `#1b1b1d` | Texto principal. |
| `--bb-color-muted` | `#bbc9cf` | `#3d4949` | Texto secundário. |
| `--bb-color-primary` | `#00d4ff` | `#006a6a` | CTAs, foco e chips. |
| `--bb-color-secondary` | `#ff4b89` | `#b40066` | Destaques e estados fortes. |
| `--bb-color-tertiary` | `#ad00ff` | `#6c37df` | Destaque raro. |
| `--bb-color-outline` | `#859398` | `#6d7a79` | Bordas e divisórias. |
| `--bb-color-danger` | `#ffb4ab` | `#ba1a1a` | Erros e ações destrutivas. |

## Regras obrigatórias para próximas execuções

1. Design System não autoriza criar funcionalidades novas.
2. Qualquer elemento desenhado sem implementação atual deve entrar em documentação como fora de escopo, não em código de produto.
3. Tema claro/escuro deve ser validado no app publicado no Cloudflare Pages.
4. O app deve continuar 100% offline após o primeiro carregamento.
5. Não usar CDN, Google Fonts, Material Symbols, Tailwind CDN, imagens remotas ou scripts externos.
6. Localhost é apenas pré-check; a prova final é Cloudflare Pages publicado.
