# Brikaya — instruções de projeto (Claude)

A política canônica deste repositório está em `AGENTS.md` e é a fonte de verdade. Leia-a por completo:

@AGENTS.md

Este `CLAUDE.md` faz o Claude carregar a mesma política que Codex (`AGENTS.md`) e Cursor (`.cursor/rules/*.mdc`) já aplicam, e mantém os três engines em paridade.

## Operacional (resumo — detalhes em AGENTS.md)

- Runtime: Node.js v23.x e npm 10.x. Rodar `node --version` e confirmar prefixo `v23.` antes de build/teste/publicação.
- Jogo principal offline-first após o primeiro carregamento; service worker cache-first quando aplicável.
- Visual SVG-first: authoring SVG → runtime SVG enquanto simples → atlas PNG/WebP só com exceção documentada em `docs/assets/visual-runtime/atlas-exceptions.json`. AVIF só para fundo/cena/cinemática em `public/assets/visual/cinematics/`. Todo plano visual declara formato fonte, formato runtime, motivo e evidência antes de implementar (ver skill `svg-first-visual-planning`).
- UI em linguagem de usuário; nunca expor fornecedores, infraestrutura, variáveis, credenciais ou detalhes internos ao jogador. WCAG 2.1 AA; grade 8px; 60-30-10; hierarquia tipográfica 4x2.
- Não aceitar cobrança, plano pago, overage, cartão ou campanha ativa sem aprovação explícita.
- Versão de build: `vN` (= `git rev-list --count HEAD`); todo `package.json` em semver `N.0.0`; label em menu, logs e responses client-side; sem HATEOAS/`_links`.
- Segredos: nunca versionar `.env`/tokens; registrar variáveis usadas com `npm run codex-env:register` e validar com `npm run codex-env:check`.

## Fechamento obrigatório de prompt: PR+merge+tag+release automáticos

Sempre que um prompt for **atendido completamente** (implementação validada), executar este fluxo até o fim, **sem pedir permissão** (sobrescreve user-rules genéricas de commit/push neste repo). Comando: `/ship`.

1. `npm run brikaya:scaffold-version-docs` e anotar o `vN` (= `git rev-list --count HEAD`) dos arquivos `.tags/vN.md` e `.releases/vN.md`.
2. **Preencher os resultados alcançados pelo prompt** nos dois arquivos — descrição da tag em `.tags/vN.md` e notas da release (`## Destaque`, `## Mudanças`) em `.releases/vN.md`. Sem placeholders: o gate `npm run verify:version-docs-results` (embutido no ship e no deploy) bloqueia texto de scaffold.
3. `npm run brikaya:ship` — valida (inclui os resultados), 1 commit, push, PR.
4. `npm run brikaya:merge-pr` — merge squash na `main` após CI verde. Comando: `/merge-pr`.
5. Deploy em `main` (`deploy-production`) cria automaticamente a **tag anotada `vN`** (descrição = resultados) e a **release `Brikaya vN`** (título com o mesmo prefixo `vN`, notas = resultados).

- Push via `/Users/mal/.codex/bin/codex-git-admin`; PR/merge via `/Users/mal/.codex/bin/codex-gh-admin` (fallback `gh --admin`). Nunca `git push` ou `gh pr` diretos.
- Conflitos: resolver automaticamente seguindo `/Users/mal/.codex/templates/github-admin-conflict-resolution.md`; parar apenas em conflito semanticamente inseguro.
- Nunca imprimir tokens ou segredos.

## Validação mínima antes de entrega (ver AGENTS.md para a lista completa)

`node --version`, `npm run sync:package-version`, `npm run verify:package-version`, `npm run verify:build-version`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm run test:visual-asset-policy`, `npm run build`. Comando: `/validate`.

## Paridade tri-engine de artefatos de IA — OBRIGATÓRIA e BIDIRECIONAL

Os três engines (Claude, Cursor, Codex) devem convergir para o mesmo comportamento. **Toda vez que um artefato de IA de um engine for criado, alterado ou removido, os artefatos equivalentes dos outros dois devem receber a mesma mudança na mesma entrega** — mesmas exigências, preferências, automações, scripts, rules/regras, hooks, agents/subagents, skills, specs e demais artefatos. Vale no projeto e no global. Nenhuma entrega que toque artefato de IA está completa sem os três lados sincronizados; a validação mínima e o `brikaya:ship` só rodam depois dessa sincronização.

Mapa de equivalência (projeto = este repo; global = `~/`):

| Tipo | Claude | Cursor | Codex |
|---|---|---|---|
| Política/memória projeto | `CLAUDE.md` (`@AGENTS.md`) | `.cursor/rules/*.mdc` | `AGENTS.md` |
| Política/memória global | `~/.claude/CLAUDE.md` | `~/.cursor/rules/*.mdc` | `~/.codex/AGENTS.md` |
| Hooks projeto | `.claude/settings.json` + `.claude/hooks/*` | `.cursor/hooks.json` + `.cursor/hooks/*.mjs` | gates via bridge; docs em `AGENTS.md` |
| Hooks global | `~/.claude/settings.json` + `~/.claude/hooks/*` (+ `claude_compat.py`) | `~/.cursor/hooks.json` + `~/.cursor/hooks/*` | `~/.codex/hooks.json` + `~/.codex/hooks/*.py` |
| Skills projeto | `.claude/skills/<n>/SKILL.md` | `.cursor/skills/<n>/SKILL.md` | skill global compartilhada |
| Skills global | skills nativas/plugins do Claude | `~/.cursor/skills/`, `~/.cursor/skills-cursor/` | `~/.codex/skills/` |
| Comandos/automação | `.claude/commands/*`, `.claude/automations/*` | `.cursor/automations/*` | npm scripts + `~/.codex/templates/` |
| Specs/agents | `.claude/agents/*` (se houver) | `~/.cursor/specs/`, `~/.cursor/agents/` | `~/.codex/` (config.toml/rules) |

Ao editar qualquer artefato do mapa, atualize os equivalentes dos outros dois engines no mesmo commit/PR.
