<!-- docs/rup/04-qualidade-testes/runtime-update-qa-warnings.md -->

# Tarefa — Investigar warnings não bloqueantes do QA runtime update

## Objective

Investigar e reduzir ruído não bloqueante observado no `cloudflare-runtime-update-qa`, preservando a atualização automática do PWA já validada em produção.

## Context

A versão publicada em `https://malnati-brickbreaker.pages.dev/` no commit `7f80528` foi validada em 2026-07-01 com `BUILD_ID` publicado `prod-7f80528-proof-20260701125312`.

O QA runtime update passa e confirma:

- `BUILD_ID` publicado sem placeholder;
- cache ativo correto;
- canvas renderizado;
- ausência de overflow horizontal.

Mesmo com aceite funcional, o recibo do QA runtime update registra warnings de console no perfil persistente:

- `⚠️ IndexedDB não inicializado`;
- `Falha ao armazenar log no IndexedDB: JSHandle@error`;
- warning do manifesto para `https://malnati-brickbreaker.pages.dev/icons/icon-192.png`.

Os demais QAs publicados relevantes registraram `consoleProblems: 0`.

## Scope

- Diagnosticar por que o perfil persistente do `cloudflare-runtime-update-qa` vê warnings de IndexedDB.
- Diagnosticar por que Chrome/Puppeteer reporta warning do ícone `icon-192.png` no manifesto.
- Ajustar somente tratamento de logs, QA ou asset se houver causa confirmada.
- Preservar comportamento atual do Service Worker e da atualização automática.

## Out of scope

- Não alterar gameplay.
- Não alterar HUD/menu.
- Não alterar fórmula de velocidade.
- Não alterar estratégia de cache/update do PWA sem nova revisão.
- Não publicar nova versão apenas para esta investigação sem validação completa.

## Milestone

middle

## Type

Markdown-managed task.

## Stage

Não aplicável.

## Backlog

GitHub Issues está desativado no repositório `Malnati/brickbreaker`, então esta tarefa fica registrada como tarefa Markdown versionada até existir backlog GitHub disponível.

## Acceptance criteria

- `BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-runtime-update-qa` continua passando.
- Cada warning remanescente no recibo é reduzido ou justificado tecnicamente.
- `npm test -- --runInBand` passa.
- `npm run build` passa.
- `BUILD_ID` publicado permanece sem placeholder.
- Nenhuma regressão nos QAs publicados existentes.

## Execution plan

1. Reproduzir warnings com perfil persistente limpo e com perfil persistente já usado.
2. Separar warnings que vêm do ambiente de teste dos warnings que vêm do app publicado.
3. Verificar carregamento e validade dos ícones locais do manifesto.
4. Verificar inicialização do IndexedDB no fluxo de runtime update sem mudar o comportamento de atualização automática.
5. Corrigir apenas se a causa for confirmada e dentro do escopo.

## Validation/tests

Executar, no mínimo:

```bash
PATH=/opt/homebrew/bin:$PATH node --version
make help
npm test -- --runInBand
npm run build
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-runtime-update-qa
```

Se houver alteração funcional ou de QA, executar também os QAs publicados existentes:

```bash
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-mobile-qa
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-no-score-reset
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-phase-transition-qa
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-dashboard-layout-qa
BRICKBREAKER_PUBLIC_URL=https://malnati-brickbreaker.pages.dev/ make cloudflare-theme-qa
```

## Expected evidence

- Recibo JSON do `cloudflare-runtime-update-qa`.
- Lista dos warnings removidos ou justificativa dos warnings remanescentes.
- Saída resumida de testes/build.
- Confirmação do `BUILD_ID` publicado sem placeholder.

## GitHub epic/sub-issue links

- GitHub issue: indisponível porque Issues está desativado no repositório.
- PR de documentação desta tarefa: a definir.
