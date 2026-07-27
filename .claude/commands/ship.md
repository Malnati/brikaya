---
description: Fechar o prompt no Brikaya — resultados → PR+merge → tag+release, sem pedir permissão
---

Ao atender **completamente** um prompt no Brikaya, execute este fluxo até o fim, sem pedir permissão (fonte: `AGENTS.md`). Isto garante PR+merge na `main`, tag e release automáticos, com a descrição = resultados alcançados.

1. Confirmar runtime: `node --version` com prefixo `v23.`.
2. Rodar `npm run brikaya:scaffold-version-docs` e anotar o `vN` dos arquivos criados (`.tags/vN.md`, `.releases/vN.md`).
3. **Preencher os resultados alcançados pelo prompt** (sem placeholders — o gate `verify:version-docs-results` bloqueia):
   - `.tags/vN.md`: corpo = descrição da tag (o que esta versão entrega).
   - `.releases/vN.md`: seções `## Destaque` e `## Mudanças` com bullets reais.
4. Rodar `npm run brikaya:ship` — valida (inclui os resultados), faz 1 commit, push e PR. Push via `codex-git-admin`; PR via `codex-gh-admin` (fallback `gh --admin`). Nunca `git push`/`gh pr` diretos; nunca imprimir segredos.
5. Rodar `npm run brikaya:merge-pr` — merge squash na `main` após CI verde (ver `/merge-pr`).
6. O push em `main` dispara `deploy-production`, que cria a **tag anotada `vN`** (descrição = resultados) e a **release `Brikaya vN`** (título com prefixo `vN`, notas = resultados).

Reportar ao final: número do PR, `vN`, e link de preview `https://dev.brikaya.com/`.
