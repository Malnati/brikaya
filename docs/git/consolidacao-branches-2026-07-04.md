<!-- docs/git/consolidacao-branches-2026-07-04.md -->
# Consolidação de branches — 2026-07-04

## Objetivo

Consolidar o repositório Brikaya/BrickBreaker em `main`, verificar branches locais e remotas, preservar rastreabilidade antes da exclusão e evitar reintrodução de código antigo que conflitava com o estado publicado atual.

## Estado inicial verificado

- Repositório: `/Users/mal/GitHub/malnati/brickbreaker`.
- Remoto GitHub: `origin` em `https://github.com/Malnati/brickbreaker.git`.
- Branch remota viva: apenas `origin/main` em `538fac1`.
- PRs abertos em `Malnati/brickbreaker`: nenhum.
- Branches locais antes da limpeza: 84, incluindo a branch temporária de consolidação.
- Branches locais não ancestrais de `origin/main`: 78.
- Worktrees registradas: 39.
- Worktrees detached com commit não integrado em `origin/main`: 0.
- Worktree com arquivo não versionado: `/Users/mal/GitHub/malnati/brickbreaker-icon-controls`, apenas `tmp-icon-pr-body.md`.
- Backup de segurança criado antes de exclusões:
  - Bundle Git: `/Users/mal/.config/superpowers/backups/brickbreaker/brickbreaker-all-local-refs-20260704-031535.bundle`.
  - Arquivo auxiliar/untracked/inventários: `/Users/mal/.config/superpowers/backups/brickbreaker/brickbreaker-untracked-worktree-files-20260704-031535.tar.gz`.

## Classificação das branches locais

### Branches patch-equivalentes ou já absorvidas por squash

63 branches locais tinham commits à frente apenas como patch-equivalentes (`git cherry` retornou `-`) ou já estavam ancestrais de `origin/main`. Elas foram classificadas como consolidadas porque `origin/main` contém o conteúdo funcional por commits de PR/squash mais novos.

### Branches com patch-unique, mas superseded/conflitantes

15 branches tinham pelo menos um patch que `git cherry` marcou como único. Todas foram testadas por cherry-pick probe em worktree descartável criada de `origin/main`; todas entraram em conflito contra o estado atual. A revisão mostrou que os conflitos são de branches antigas contra implementações mais novas já presentes em `main`, ou evidências antigas com nomes hoje inválidos pela regra semântica.

| Branch | Patch-unique | Resultado da probe | Decisão |
| --- | ---: | --- | --- |
| `docs/ads-revenue-pf-pj-paraguay-brazil` | 1 | conflito em `CHANGELOG.md` | conteúdo já absorvido em `docs/dist/projeto.md` por commit atual |
| `docs/docs-only-auto-merge-policy` | 1 | conflito em `CHANGELOG.md` | política já presente em `AGENTS.md` e changelog atual |
| `docs/pwa-only-distribution-research` | 1 | conflito em `CHANGELOG.md` e `docs/dist/projeto-pwa.md` | documento já presente com versão atual |
| `docs/svg-theme-system-plan` | 1 | conflito em plano e assets antigos sem prefixo semântico | plano já existe; assets atuais usam `codex-*` |
| `feature/cloudflare-pages-zero-cost` | 1 | conflitos em Cloudflare, PWA, manifest, lockfile e docs | fluxo Cloudflare atual já é mais novo e zero-custo |
| `feature/dez-temas-visuais` | 6 | conflito em QA de tema | dez temas já estão em `main` com evidência semântica atual |
| `feature/dez-temas-visuais-final` | 7 | conflito em QA de tema | superseded pela implementação e QA de temas atuais |
| `feature/speed-control-telemetry` | 2 | conflitos em gameplay, HUD, logs e QA | velocidade/HUD já consolidados por `d6caa2d` e evoluções posteriores |
| `feature/svg-theme-system` | 9 | conflitos em regras e implementação SVG | sistema de aparência/SVG já existe em `main` com versão mais nova |
| `fix/ios-android-audio-toggle-v79` | 2 | conflito em evidências iOS/Android | correção de som já consolidada por `a7e49b1`; evidência antiga é superseded |
| `fix/mobile-qa-hardening-cycle-2` | 3 | conflitos em changelog e QA cinematográfico | hardening já incorporado em `228cd2d` e commits posteriores |
| `fix/published-qa-runner-stability` | 1 | conflitos em QAs publicados | scripts atuais já têm estabilizações posteriores |
| `fix/theme-qa-close-constant` | 2 | conflito em dashboard QA | fechamento/estabilidade já evoluiu em `main` |
| `fix/vfx-powerup-alignment` | 1 | conflitos em VFX, power-ups e evidências | correção já consolidada por `dca4389` e RIP mobile posterior |
| `hide-publicity` | 1 | conflitos em Cloudflare/changelog | validação canônica já consolidada por `39fef64`; ocultação de publicidade por `f5eb0c3` |

## Análise de cobertura de testes

Nenhuma mudança funcional nova foi aplicada a partir das branches antigas porque o conteúdo útil já estava em `main` ou conflita com implementações mais novas. A análise de cobertura ficou assim:

- Cloudflare/publicação/PWA: coberto por `tests/unit/cloudflarePagesPublicIndex.test.ts`, `src/registerServiceWorker.test.ts`, `src/build/runtimeAssetManifest.test.ts`, `src/build/serviceWorkerLazyAssets.test.ts`, `src/build/stampServiceWorkerVersion.test.ts` e QAs publicados `cloudflare-*`.
- Temas/SVG/aparência: coberto por `src/constants/appearance.test.ts`, `src/utils/visualAssetResolver.test.ts`, `src/components/AppearanceSelector.test.tsx`, `src/hooks/useAppearancePreference.test.tsx`, `npm run test:svg-assets` e `npm run test:semantic-file-names`.
- Gameplay/velocidade/HUD/logs: coberto por `src/logic/GameEngine.test.ts`, `src/objects/Ball.test.ts`, `src/storage/gameLogger.test.ts`, `src/components/Game.test.tsx`, `src/hooks/useGameLoop.test.tsx` e QAs de pontuação/fase.
- Áudio e toggles mobile: coberto por `src/hooks/useAudioPreference.test.ts`, `src/utils/audioManager.test.ts`, `src/constants/audio.test.ts` e `make cloudflare-audio-qa` quando a publicação é validada.
- VFX/power-ups/RIP: coberto por `src/components/GameCinematicOverlay.test.tsx`, `src/objects/PowerUp.test.ts`, `tests/e2e/cloudflare-cinematic-effects-qa.js` e `tests/e2e/cloudflare-laser-powerup-qa.js`.
- i18n/SEO: coberto por `src/i18n/i18n.test.tsx`, `tests/unit/localizedSeoGenerator.test.ts`, `tests/unit/seoMetadata.test.ts` e QA publicado de i18n/SEO quando aplicável.
- Branch cleanup: verificado por comandos Git (`branch`, `worktree`, `ls-remote`) e não por teste de aplicação, pois é estado operacional do repositório.

## Validação local executada antes da limpeza

- `PATH="/opt/homebrew/bin:$PATH" node --version` → `v23.5.0`.
- `PATH="/opt/homebrew/bin:$PATH" make help` → target list carregou corretamente.
- `PATH="/opt/homebrew/bin:$PATH" npm test -- --runInBand` → 39 suites / 193 testes passaram na baseline `origin/main`.

## Política de limpeza

- Não aplicar cherry-pick de branch superseded quando ele reintroduz arquivo antigo, evidência com nome inválido, lockfile antigo, script antigo ou cópia ultrapassada de lógica já evoluída.
- Remover worktrees limpas após backup.
- Preservar `main` como branch única local e remota.
- Manter bundle local de recuperação fora do Git para auditoria emergencial.
