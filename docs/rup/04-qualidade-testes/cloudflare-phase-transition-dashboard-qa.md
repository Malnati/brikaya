<!-- docs/rup/04-qualidade-testes/cloudflare-phase-transition-dashboard-qa.md -->
# QA publicado: transição de fase e dashboard responsivo

## Objetivo

Garantir que a versão publicada no Cloudflare Pages prove os comportamentos de fase, toast, layout mobile e placeholders de publicidade antes de PR, merge ou produção.

## Gates obrigatórios

1. `node --version` deve começar com `v23.` antes de build, deploy ou QA.
2. PRs pendentes de version bump/Dependabot devem ser resolvidos antes da branch de feature.
3. Testes locais são pré-check; a prova final sempre usa `BRICKBREAKER_PUBLIC_URL` apontando para Cloudflare Pages publicado.
4. Cloudflare deve usar Pages estático em `dist/`, sem produtos pagos.
5. Se aparecer cobrança, upgrade, overage ou autorização comercial, pare e registre blocker.

## Transição de fase

Comando:

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-phase-transition-qa
```

O teste deve usar `?qaScenario=single-brick-phase-clear` e validar:

- último tijolo destruído registra `brick_destroyed` e `score_update`;
- conclusão de todos os tijolos registra `level_complete`;
- o jogo pausa antes da nova fase;
- o toast aparece acima da área dos tijolos e não cobre raquete/controles;
- toast contém `Fase 2` e `1.12×` no cenário inicial;
- nova fase registra `level_start`;
- nova fase inicia com a quantidade de blocos prevista e mais linhas que a fase concluída;
- não há `restart_game` sem ação humana;
- não há `game_end` por vitória ao completar fase;
- console não contém `error`/`warn`.

## Dashboard responsivo

Comando:

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-dashboard-layout-qa
```

Viewports obrigatórios:

- Fonte executável: `tests/e2e/responsiveViewportMatrix.json`.
- Mobile: iPhone 15/16 (`393x852` e `852x393`), iPhone 16e (`390x844` e `844x390`) e iPhone 17 (`402x874` e `874x402`).
- Tablet: iPad 11/Air 11 (`820x1180` e `1180x820`) e iPad Pro 11 M4 (`834x1210` e `1210x834`).
- Desktop: `1366x768`, `1440x900` e `1920x1080`.
- Documento detalhado: `docs/rup/04-qualidade-testes/responsive-viewport-matrix.md`.

Assertivas mínimas:

- sem overflow horizontal;
- canvas inteiro visível, sem exigir scroll para jogar;
- canvas com largura cheia quando a altura permitir ou largura jogável mínima quando a altura for o limite real;
- botões principais com alvo mínimo de 44px;
- header e chips visíveis;
- logs e colisões acessíveis;
- iPhone 15 sem botões cortados;
- slot lateral somente quando há espaço;
- slot inferior não fica entre canvas e controles principais;
- placeholders de publicidade mantêm distância visual da área jogável.

## Tema claro/escuro e Design System

Comando:

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-theme-qa
```

Assertivas mínimas:

- seletor `Claro`/`Escuro` visível em iPhone 15 e desktop;
- tema muda `data-theme`;
- escolha persiste após reload;
- botões mantêm alvo mínimo de 44px;
- canvas permanece inteiro visível;
- logs e colisões continuam acessíveis;
- loja, ranking, leaderboard, upgrades, tutorial, multiplayer e settings não aparecem;
- nenhuma requisição externa é feita.

## Política de publicidade

- Esta entrega permite apenas placeholders offline com texto `Publicidade`.
- É proibido adicionar script externo, `adsbygoogle`, `ca-pub-*` ou `data-ad-slot`.
- A regra aprovada para PWA-only mantém o jogo principal offline após primeiro carregamento; anúncios reais futuros são opcionais, online-only, consentidos quando exigido e nunca necessários para jogar.
- Em QA offline, anúncios reais futuros devem ficar ocultos ou desativados sem bloquear gameplay, logs, pontuação ou navegação.
- O posicionamento deve evitar clique acidental, conforme orientação de política AdSense: <https://support.google.com/adsense/answer/1346295?hl=en>.
- Uma unidade responsiva real futura deve considerar a largura disponível, conforme orientação oficial: <https://support.google.com/adsense/answer/9183363?hl=en>.

## Evidência obrigatória

Salvar em `docs/assets/issues/phase-pause-modern-dashboard/evidence/`:

- screenshot iPhone 15 normal;
- screenshot iPhone 15 com toast;
- screenshot desktop com placeholders;
- JSON do `cloudflare-phase-transition-qa`;
- JSON do `cloudflare-dashboard-layout-qa`;
- JSON do `cloudflare-mobile-qa`;
- JSON do `cloudflare-no-score-reset`.
- JSON do `cloudflare-theme-qa`;
- screenshots iPhone 15 e desktop nos temas claro e escuro.

## Merge

O PR só pode ser mergeado se:

- CI passar;
- preview Cloudflare passar nos cinco comandos de QA;
- PR incluir evidência visual e JSON publicados;
- produção for publicada após merge;
- produção passar nos cinco comandos de QA contra `https://brikaya.com/`.
