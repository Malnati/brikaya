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
- AVIF nunca é formato padrão para sprites, UI, power-ups, tijolos, VFX ou atlases desenhados a 60 FPS.
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

## Validação mínima

Antes de entrega técnica:

```bash
node --version
make help
npm run codex-env:check
npm run test:semantic-file-names
npm run test:svg-assets
npm run test:visual-asset-policy
npm run build
```
