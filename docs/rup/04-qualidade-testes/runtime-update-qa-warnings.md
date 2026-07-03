<!-- docs/rup/04-qualidade-testes/runtime-update-qa-warnings.md -->

# Tarefa — Investigar warnings não bloqueantes do QA runtime update

## Objective

Investigar e reduzir ruído não bloqueante observado no `cloudflare-runtime-update-qa`, preservando a atualização automática do PWA já validada em produção.

## Context

A versão publicada em `https://brikaya.com/` no commit `7f80528` foi validada em 2026-07-01 com `BUILD_ID` publicado `prod-7f80528-proof-20260701125312`.

O QA runtime update passa e confirma:

- `BUILD_ID` publicado sem placeholder;
- cache ativo correto;
- canvas renderizado;
- ausência de overflow horizontal.

Mesmo com aceite funcional, o recibo do QA runtime update registra warnings de console no perfil persistente:

- `⚠️ IndexedDB não inicializado`;
- `Falha ao armazenar log no IndexedDB: JSHandle@error`;
- warning do manifesto para `https://brikaya.com/icons/icon-192.png`.

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

- `BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-runtime-update-qa` continua passando.
- Cada warning remanescente no recibo é reduzido ou justificado tecnicamente.
- `npm test -- --runInBand` passa.
- `npm run build` passa.
- `BUILD_ID` publicado permanece sem placeholder.
- Nenhuma regressão nos QAs publicados existentes.

## Diagnosis

- Os arquivos `public/icons/icon-192.png` e `public/icons/icon-512.png` declaravam dimensões corretas no `IHDR`, mas tinham payload `IDAT` inválido; `zlib.inflate` falhava e Chrome recusava o ícone do manifesto.
- `GameLogViewer` e `CollisionStats` eram montados fechados, mas ainda executavam leituras/polling em IndexedDB.
- `DebugLogger` tentava armazenar argumentos não clonáveis, como funções, referências circulares e objetos de erro crus.
- `useColorDebug` executava leitura periódica de pixels do canvas em produção, mesmo sem fluxo explícito de debug.

## Resolution

- Ícones PWA substituídos por PNGs locais válidos 192x192 e 512x512.
- `GameLogViewer` só carrega logs quando `isVisible=true`.
- `useCollisionStats` recebeu controle `enabled`; `CollisionStats` fechado não inicia polling.
- `DebugLogger` passa a serializar argumentos antes de gravar e transforma falhas internas em no-op silencioso.
- `useColorDebug` roda apenas em `localhost`, `127.0.0.1` ou com `?debugColors=1`.
- `cloudflare-runtime-update-qa` agora falha se capturar warnings/errors de console relevantes.

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
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-runtime-update-qa
```

Se houver alteração funcional ou de QA, executar também os QAs publicados existentes:

```bash
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-mobile-qa
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-no-score-reset
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-phase-transition-qa
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-dashboard-layout-qa
BRICKBREAKER_PUBLIC_URL=https://brikaya.com/ make cloudflare-theme-qa
```

## Expected evidence

- Recibo JSON do `cloudflare-runtime-update-qa`.
- Lista dos warnings removidos ou justificativa dos warnings remanescentes.
- Saída resumida de testes/build.
- Confirmação do `BUILD_ID` publicado sem placeholder.

## Evidence — preview

- Preview: `https://89d40e66.brikaya.com/`
- `PATH=/opt/homebrew/bin:$PATH node --version`: `v23.5.0`.
- `make help`: passou.
- `npm test -- --runInBand`: 12 suites, 53 testes, 0 falhas.
- `npm run build`: passou; `BUILD_ID` de preview `preview-fix-runtime-update-qa-warnings-20260701174406`.
- `BRICKBREAKER_PUBLIC_URL=https://89d40e66.brikaya.com/ make cloudflare-runtime-update-qa`: passou com `consoleProblems: []`.
- `BRICKBREAKER_PUBLIC_URL=https://89d40e66.brikaya.com/ make cloudflare-mobile-qa`: passou com `consoleProblems: []`.
- `BRICKBREAKER_PUBLIC_URL=https://89d40e66.brikaya.com/ make cloudflare-dashboard-layout-qa`: passou com `consoleProblems: []`.
- `BRICKBREAKER_PUBLIC_URL=https://89d40e66.brikaya.com/ make cloudflare-no-score-reset`: passou com `consoleProblems: []`.
- `BRICKBREAKER_PUBLIC_URL=https://89d40e66.brikaya.com/ make cloudflare-phase-transition-qa`: passou com `consoleProblems: []`.
- `BRICKBREAKER_PUBLIC_URL=https://89d40e66.brikaya.com/ make cloudflare-theme-qa`: passou com `consoleProblems: []`.

Recibos JSON:

- [runtime update](../../assets/issues/runtime-update-qa-warnings/evidence/preview-cloudflare-runtime-update-qa.json)
- [mobile QA](../../assets/issues/runtime-update-qa-warnings/evidence/preview-cloudflare-mobile-qa.json)
- [dashboard layout QA](../../assets/issues/runtime-update-qa-warnings/evidence/preview-cloudflare-dashboard-layout.json)
- [no score reset QA](../../assets/issues/runtime-update-qa-warnings/evidence/preview-cloudflare-no-score-reset-after-brick.json)
- [phase transition QA](../../assets/issues/runtime-update-qa-warnings/evidence/preview-cloudflare-phase-transition.json)
- [theme QA](../../assets/issues/runtime-update-qa-warnings/evidence/preview-cloudflare-theme-qa.json)

## GitHub epic/sub-issue links

- GitHub issue: indisponível porque Issues está desativado no repositório.
- PR de documentação desta tarefa: a definir.
