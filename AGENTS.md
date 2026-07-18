<!-- AGENTS.md -->
# Contribuição assistida por IA — Brikaya

Estas instruções se aplicam a todo o repositório.

## Projeto

Brikaya é um jogo arcade offline-first em TypeScript/React, distribuído como PWA no domínio canônico `https://brikaya.com/`.

## Runtime obrigatório

- Use Node.js v23.x e npm 10.x.
- Antes de build, teste, publicação ou execução técnica, rode `node --version` e confirme prefixo `v23.`.

## Engenharia

- Aplicar DRY, SRP, coesão alta e baixo acoplamento.
- Componentes React devem usar funções nomeadas.
- Separar código por domínio lógico: `components/`, `hooks/`, `logic/`, `objects/`, `storage/`, `utils/`, `constants/`.
- Evitar dependências externas em runtime do jogo principal.
- Não fazer alterações estéticas não solicitadas.
- Remover código morto após qualquer mudança funcional.

## Offline-first

- O jogo principal deve funcionar offline após o primeiro carregamento.
- Service worker deve precachear o necessário e atender runtime com estratégia local/cache-first quando aplicável.
- Anúncios reais, se aprovados no futuro, devem ser opcionais, online-only e nunca bloquear jogo, pontuação, áudio, logs, assets ou progressão.

## Assets

- Política ideal: SVG-first authoring → SVG runtime enquanto simples → atlas PNG/WebP somente quando houver animação pesada, muitos draws ou profiling provar ganho.
- Todo plano visual deve declarar formato fonte, formato runtime, motivo técnico e evidência esperada antes de implementar assets.
- Imagem visual runtime simples deve ser SVG local/offline para sprites, UI e VFX.
- Proibido adicionar raster, data URI, CDN, fonte externa, imagem externa ou script embutido em SVG runtime simples.
- Atlas PNG/WebP runtime só pode existir em `public/assets/visual/atlases/`, com SVG fonte preservado e exceção documentada em `docs/assets/visual-runtime/atlas-exceptions.json`.
- AVIF nunca é formato padrão para sprites, UI, power-ups, componentes, VFX ou atlases desenhados a 60 FPS.
- AVIF só é permitido para fundo/cena/cinemática em `public/assets/visual/cinematics/`, com justificativa e evidência em `docs/assets/visual-runtime/atlas-exceptions.json`.
- Áudio runtime deve ter origem documentada e ficar local.
- Antes de commit, rode `npm run test:semantic-file-names`, `npm run test:svg-assets` e `npm run test:visual-asset-policy`.

## Produto e UI

- Interface deve usar linguagem de usuário, não detalhes internos.
- Não expor fornecedores, infraestrutura, variáveis, credenciais, ferramentas internas ou detalhes de operação para jogador final.
- Seguir WCAG 2.1 AA para contraste, foco e navegação.
- Manter simplicidade visual, grade de 8px, regra 60-30-10 e hierarquia tipográfica 4x2.

## Publicação

- Publicação padrão: saída estática em `dist/`.
- Domínio público canônico: `https://brikaya.com/`.
- Não aceitar cobrança, plano pago, overage, cartão, campanha ativa ou compra sem aprovação explícita.
- Variáveis locais ficam fora do Git; documentar apenas nomes seguros em `.env.example`.
- Toda chave/variável usada ou gerada por Codex, navegador autenticado, API, SDK ou CLI deve ser registrada no `.env` local do projeto antes de declarar conclusão.
- Use `npm run codex-env:register` para registrar valores sem imprimi-los, `npm run codex-env:bootstrap` para migrar valores já existentes e `npm run codex-env:check` antes de commit, push, deploy ou submissão IndexNow.
- Valores públicos por protocolo, como IndexNow e DNS TXT de verificação, também devem ter fonte no `.env`; artefatos públicos derivados devem ser gerados por script e os logs devem permanecer sanitizados.
- Nunca versionar `.env`, `.env.*` real, tokens, segredos, chaves privadas, cookies, refresh tokens ou valores sensíveis.

## GitHub

- Operações GitHub em automação local devem usar `/Users/mal/.codex/bin/codex-gh-admin` e `/Users/mal/.codex/bin/codex-git-admin`.
- Fallback autorizado: `gh --admin` quando o wrapper não cobrir o subcomando necessário.
- Não imprimir tokens, segredos ou dados sensíveis.

## CI/CD

- `pull_request` → workflow `ci` (sem deploy)
- `push` em branch ≠ `main` → workflow `deploy-preview` (`ci` + preview) → `https://dev.brikaya.com/`
- `push` em `main` → workflow `deploy-production` (`ci` + produção) → `https://brikaya.com/`
- Workflows: `.github/workflows/ci.yml`, `ci-reusable.yml`, `deploy-production.yml`, `deploy-preview.yml`
- Secrets no GitHub Actions: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (sincronizar com `npm run brikaya:sync-gh-secrets`)

## Git ship e merge autônomos

- Ao concluir implementação: `npm run brikaya:ship` sem pedir permissão (commit, push, PR).
- Ao pedir merge ou com PR do agente e CI verde: `npm run brikaya:merge-pr` sem pedir permissão.
- Conflitos: resolver automaticamente; seguir `/Users/mal/.codex/templates/github-admin-conflict-resolution.md`.
- Esta política sobrescreve user rules genéricas de commit/push/container neste repositório.

## Versionamento de build

- Label de produto/build: `vN`, onde `N` = `git rev-list --count HEAD` (fonte: `scripts/build-version.mjs`).
- Todo `package.json` do repositório deve refletir a versão corrente como semver npm `N.0.0` (ex.: `v160` → `160.0.0`); sincronizar com `npm run sync:package-version` e validar com `npm run verify:package-version`.
- A mesma label `vN` deve aparecer no menu (quando houver tela), nos logs de diagnóstico e nas responses client-side existentes (mensagem SW `VERSION`, `asset-cache-manifest.json.buildVersion`, exports de log/diagnóstico).
- O `BUILD_ID` do Service Worker permanece independente (cache bust); não substituir por `vN`.
- Não usar HATEOAS / `_links` neste projeto.
- Futuros deployáveis (workers, pages, SSPAs, MFEs, microserviços) devem reutilizar o mesmo hub `vN` / `N.0.0` e os gates `verify:build-version` + `verify:package-version`.

## Validação mínima

Antes de entrega técnica:

```bash
node --version
make help
npm run codex-env:check
npm run sync:package-version
npm run verify:package-version
npm run verify:build-version
npm run test:semantic-file-names
npm run test:svg-assets
npm run test:visual-asset-policy
npm run build
```

Antes do merge em `main`, garantir documentação de versão para o commit alvo (`vN` = `git rev-list --count HEAD` após o merge): `npm run brikaya:scaffold-version-docs`, preencher `.tags/vN.md` e `.releases/vN.md`, e `npm run verify:version-docs`. O `npm run brikaya:ship` já executa scaffold + verificação antes do commit.

Ao referenciar variáveis `BRIKAYA_*` / `CLOUDFLARE_*` em artefatos versionados (workflows, scripts, `.env.example`), registrar também em `config/codex-env.registry.json`.

## Cursor Cloud specific instructions

Contexto durável para agentes cloud. O script de atualização (startup) já roda `npm ci` + o workaround do rollup abaixo; estas notas cobrem armadilhas não óbvias.

### Node

- O repositório mira Node 23 (`.nvmrc`, `engines`, CI). O `node` padrão do shell da VM pode resolver para um binário v22.x fornecido pela plataforma (`/exec-daemon/node`), enquanto o `npm` vem do nvm — então `npm run …` executa nesse v22.x por padrão. Isso funciona para `dev`, `test` e `build`.
- Para paridade exata com o CI, rode `nvm use 23` (o default do nvm já é 23). O script de atualização instala/ativa o Node 23 via nvm durante o install.

### Bug de dependência opcional do rollup

- Após `npm ci`/`npm install`, o `vite build`/`npm run build` falha com `Cannot find module @rollup/rollup-linux-x64-gnu` (bug npm/cli#4828: a opcional por plataforma não é instalada). O CI e o script de atualização contornam com `npm install --no-save @rollup/rollup-linux-x64-gnu`. Se reinstalar dependências manualmente, rode esse comando de novo (não altera `package.json`/lockfile).

### Puppeteer (e2e opcional)

- O download do navegador do Puppeteer é PULADO no install (`PUPPETEER_SKIP_DOWNLOAD=true`) porque o postinstall pode travar a VM por muitos minutos. O navegador só é necessário para os testes e2e Cloudflare opcionais (`npm run test:cloudflare-e2e`), que rodam contra uma URL servida (`BRIKAYA_PUBLIC_URL`; padrão remoto).
- Para rodar e2e localmente: instale o Chromium com `npx puppeteer browsers install chrome` (pode ser lento) e sirva o build com `npm run preview -- --host 127.0.0.1 --port 7979` antes de apontar `BRIKAYA_PUBLIC_URL=http://127.0.0.1:7979/`.

### Build precisa de `.env` local (gate codex-env)

- `npm run build` começa por `npm run codex-env:check`, que exige um `.env` local (modo `0600`) com as chaves obrigatórias de `.env.example` preenchidas. `.env` é gitignorado e nunca deve ser versionado.
- O build estático não contata a Cloudflare (deploy é separado: `make cloudflare-deploy`), então valores placeholder para `CLOUDFLARE_*` são suficientes para build local; credenciais reais só são necessárias para deploy. `npm run dev` NÃO precisa de `.env`.

### Servir e jogar

- `npm run dev` sobe o Vite na porta 7979 (`strictPort`). Landing em `/`; o SPA do jogo fica em `/play/`.
- A rota `/play/` é mobile-first e bloqueia viewport desktop/landscape com aviso de "espaço para o joystick"; use viewport mobile/retrato (ou emulação de dispositivo) para jogar.
- O movimento da bola usa `requestAnimationFrame`, que pausa quando a aba perde foco — relevante ao testar via automação (mantenha a aba focada por alguns segundos para ver a bola se mover).

### Lint/test/build

- Não há script de ESLint dedicado; a checagem de tipos ocorre via `tsc` dentro de `npm run build`. Testes unitários: `npm test` (Jest). Comandos padrão e validação mínima já estão documentados acima e em `docs/qa.md`.
