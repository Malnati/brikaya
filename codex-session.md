# Avaliar pipeline SVG-first

> [@superpowers](plugin://superpowers@openai-curated-remote) [@build-web-apps](plugin://build-web-apps@openai-curated-remote) [@game-studio](plugin://game-studio@openai-curated-remote)
> O assunto é um estudo sobre a qualidade do gráfico do jogo. A escolha de utilizar SVG por padrão veio da ideia de obter desenhos vetoriais que possam ser convertidos e transformados em animações, raster, imagens e até vídeos no futuro.
>
> As dúvidas são as seguintes:
>
> - Uma vez aprovados todos os desenhos e efeitos visuais, qual é o formato com maior qualidade gráfica e melhor desempenho em processamento para converter o SVG em imagem?
>
> - Uma vez aprovados todos os desenhos e efeitos visuais, qual é o formato com maior qualidade gráfica e melhor desempenho em processamento para converter o SVG em animações?
>
> - Uma vez aprovados todos os desenhos e efeitos visuais, qual é o formato com maior qualidade gráfica e melhor desempenho em processamento para converter o SVG em efeitos visuais com texto parametrizavel?
>
> - A ideia de manter em SVG-first é uma boa abordagem? O que mais usa-se no mercado de games?

<details><summary>9 previous messages</summary>

> Usando skills: `superpowers:using-superpowers` para rito obrigatório; `game-studio:web-game-foundations` para práticas de jogos web; `build-web-apps:frontend-app-builder` para contexto PWA/web.
>
> Complemento obrigatório: lendo referência Codex da skill e regras de comunicação/asset pipeline relevantes.
>
> Buscando memória específica Brickbreaker/Brikaya para não contradizer decisões anteriores.
>
> Memória relevante achada: regra SVG runtime-only, exceções raster para evidência/QA, validações existentes. Vou inspecionar repositório agora.
>
> Inspecionando estado técnico local: package, assets, docs de design. Sem alterações.
>
> Inspecionando como SVG entra no render/runtime para recomendação prática, sem mudar arquivos.
>
> Lendo loader/render relevante.
>
> Medindo tamanho/complexidade dos SVGs atuais para calibrar recomendação.
>
> <details><summary>Searched the web</summary>
>
> <details><summary>Searched the web</summary>
>
> - Searched the web for `MDN image file type and format guide PNG WebP AVIF APNG lossless alpha animation`
> - Searched the web for `Google Developers WebP lossless lossy alpha animation official`
> - Searched the web for `MDN CanvasRenderingContext2D fillText method canvas text drawing`
> - Searched the web for `Unity Manual Sprite Atlas official 2D games texture atlas`
> - Searched the web for `MDN web video codec guide WebM alpha VP9 AV1 official`
> - Searched the web for `https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types`
> - Searched the web for `https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage`
>
> </details>
>
> </details>
</details>

Resumo: **manter SVG-first é bom para Brikaya**, mas “runtime final” não precisa ser SVG para sempre. Melhor política: **SVG como master editável + exportação gerada só quando houver ganho medido**.

## Respostas diretas

| Uso | Melhor formato/runtime recomendado | Motivo |
|---|---|---|
| Imagem estática aprovada | **PNG-32 em atlas/spritesheet** para máxima qualidade + decode simples. **WebP lossless** se tamanho pesar mais. | PNG preserva alfa e nitidez sem perda. WebP reduz bytes, mas decode tende a custar mais. |
| Animações aprovadas | **Spritesheet/texture atlas + JSON metadata**. Preferir **PNG-32**; usar **WebP lossless** se payload for gargalo. | Padrão forte em games 2D: controle de frame, timing, colisão, cache e batching. |
| Efeitos com texto parametrizável | **Não converter texto final para imagem fixa**. Renderizar texto via Canvas/DOM; para muito texto, **bitmap font/SDF/MSDF atlas**. Cachear em `ImageBitmap`/OffscreenCanvas quando repetir. | Texto muda por idioma, placar, mensagem, tamanho e acessibilidade. Imagem fixa explode variantes. |
| Cinemáticas longas não interativas | **WebM VP9/AV1** ou MP4 fallback, se virar vídeo real. | Melhor que spritesheet para sequências longas, mas pior para gameplay/controlabilidade. |

## Para Brikaya hoje

Inspeção local: 146 SVGs runtime em `public/assets/visual`, total ~120 KB, média ~840 bytes, quase todos simples. O loader atual usa `HTMLImageElement` e desenha via `ctx.drawImage`. Portanto:

- **Não há motivo forte para abandonar SVG runtime agora.**
- Se performance virar problema: gerar **atlas PNG/WebP por tema** no build, mantendo SVG como fonte.
- Para sprites muito repetidos ou animações: exportar `atlas-theme@2x.png` + `atlas-theme.json`.
- Para HUD/texto/placar: manter texto code-native; só o ornamento do efeito vem de SVG/atlas.

## Mercado de games

- 2D: mercado usa muito **spritesheets/texture atlases**. Phaser, PixiJS, Unity e Godot documentam esse fluxo.
- UI/ícones/web simples: SVG é comum.
- Animação vetorial interativa: Rive/Lottie/Spine aparecem, mas adicionam runtime/tooling. Em Brikaya, só com aprovação porque o projeto evita dependências runtime.
- 3D: mercado web usa **glTF/GLB**; não é foco do Brikaya atual.

## Recomendação final

**Política ideal:**
**SVG-first authoring → SVG runtime enquanto simples → atlas PNG/WebP quando houver animação pesada, muitos draws, ou profiling provar ganho.**

Não trocar por AVIF como padrão de sprites. AVIF é ótimo para compressão visual, fundo/cena/cinemática, mas não é melhor escolha para assets pequenos desenhados a 60 FPS.

Fontes: [MDN image formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types), [W3C PNG 3](https://www.w3.org/TR/png-3/), [Google WebP](https://developers.google.com/speed/webp), [AOM AVIF](https://aomedia.org/specifications/avif/), [MDN Canvas drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage), [Phaser animations](https://docs.phaser.io/phaser/concepts/animations), [PixiJS spritesheets](https://pixijs.com/7.x/guides/components/sprite-sheets), [PixiJS BitmapText](https://pixijs.com/8.x/guides/components/scene-objects/text), [Unity Sprite Atlas](https://docs.unity3d.com/6000.4/Documentation/Manual/sprite/atlas/atlas-introduction.html), [Khronos glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html).

> Crie ou atualize os artefatos Codex como agents, rules, hooks e scripts para garantir a Política ideal, desde a definição de planos até as implementações de planos: SVG-first authoring → SVG runtime enquanto simples → atlas PNG/WebP quando houver animação pesada, muitos draws, ou profiling provar ganho.
> Não trocar por AVIF como padrão de sprites. AVIF é ótimo para compressão visual, fundo/cena/cinemática, mas não é melhor escolha para assets pequenos desenhados a 60 FPS.

<details><summary>12 previous messages</summary>

> Usando skills: `superpowers:using-superpowers` obrigatório; `superpowers:writing-plans` para plano executável; `game-studio:web-game-foundations` para política de assets de jogo web.
>
> Usando também `caveman:caveman` por padrão local de comunicação.
>
> Memória rápida: políticas SVG anteriores.
>
> Exploração local: artefatos Codex/rules/hooks/scripts existentes, sem editar.
>
> Lendo regras atuais e validadores ligados a assets.
>
> Lendo pre-commit e estrutura de scripts.
>
> Checando docs/plans e docs de sistema visual.
>
> Docs antigos citados na memória não existem no checkout atual; plano deve criar docs/superpowers/plans e talvez docs/assets/graphics-policy.
>
> Estado Git atual: branch não-main; plano deve preservar worktree.
>
> Confirmei sem mudanças locais; branch real será checada de novo na execução.
>
> Checando padrões de testes Node/Jest para planejar scripts sem inventar.
>
> Plan
>
> # Política SVG-first para assets Brikaya
>
> ## Resumo
> Implementar governança repo-local, sem trocar assets agora: **SVG como fonte padrão**, **SVG runtime enquanto simples**, **PNG/WebP atlas só com exceção documentada**, **AVIF proibido para sprites/atlases** e permitido apenas para fundo/cena/cinemática com recibo.
>
> ## Mudanças principais
> - Criar branch `codex/svg-first-asset-policy-guard`.
> - Atualizar `AGENTS.md` e `.cursor/rules/all.mdc` com:
>   - planos visuais devem declarar formato fonte, formato runtime, motivo e evidência;
>   - SVG local/offline segue padrão para sprites, UI e VFX simples;
>   - atlas PNG/WebP só em `public/assets/visual/atlases/`, com SVG fonte preservado;
>   - AVIF nunca como padrão de sprites/atlases; só para `public/assets/visual/cinematics/` com justificativa.
> - Criar `docs/assets/visual-runtime/atlas-exceptions.json` vazio, esquema versionado:
>   - `id`, `kind`, `runtimePaths`, `sourceSvgPaths`, `reason`, `evidencePath`;
>   - `reason`: `heavy-animation`, `many-draws`, `profiled-faster`, `cinematic-background`;
>   - limiares padrão: animação > 8 frames, > 100 draws/frame, ou p95 frame time menor no candidato.
> - Criar `docs/assets/visual-runtime/README.md` explicando decisão SVG → atlas e exemplos aceitos/rejeitados.
>
> ## Scripts, hooks e validação
> - Criar `scripts/validate-visual-asset-policy.mjs`.
>   - Gera `tmp/reports/visual-asset-policy-guard.json`.
>   - Falha se PNG/WebP/AVIF aparecer fora dos diretórios e exceções permitidas.
>   - Falha se atlas não tiver SVG fonte + evidência.
>   - Falha se AVIF for referenciado como sprite/atlas.
>   - Confere que `AGENTS.md` e `.cursor/rules/all.mdc` contêm a política.
> - Criar `scripts/validate-visual-asset-policy.test.mjs` com testes unitários dos casos acima.
> - Atualizar `scripts/validate-svg-assets.mjs` para aceitar exceções governadas sem quebrar SVG padrão.
> - Atualizar `scripts/normalize-semantic-file-names.mjs` para aceitar nomes semânticos de atlas/cinematic governados.
> - Atualizar `package.json`:
>   - `test:visual-asset-policy`
>   - `test:visual-asset-policy:unit`
>   - incluir ambos no `build`.
> - Atualizar `scripts/pre-commit-check.sh` e `scripts/install-git-hooks.sh` para rodar `npm run test:visual-asset-policy`.
>
> ## Testes obrigatórios
> - `node --version` deve iniciar com `v23.`
> - `npm run test:visual-asset-policy:unit`
> - `npm run test:visual-asset-policy`
> - `npm run test:semantic-file-names`
> - `npm run test:svg-assets`
> - `npm run build`
>
> ## Assumptions
> - Escopo só do repo `/Users/mal/GitHub/malnati/brickbreaker`; não alterar `/Users/mal/.codex/AGENTS.md`.
> - Nenhum raster novo será criado nesta tarefa.
> - PNG/WebP atlas futuro será exceção explícita, não novo padrão.
> - Plano detalhado de execução pode ser versionado em `docs/superpowers/plans/2026-07-07-svg-first-asset-policy.md` durante implementação.
</details>

Checando `.gitignore` para paths novos versionáveis.

> PLEASE IMPLEMENT THIS PLAN:
> # Política SVG-first para assets Brikaya
>
> ## Resumo
> Implementar governança repo-local, sem trocar assets agora: **SVG como fonte padrão**, **SVG runtime enquanto simples**, **PNG/WebP atlas só com exceção documentada**, **AVIF proibido para sprites/atlases** e permitido apenas para fundo/cena/cinemática com recibo.
>
> ## Mudanças principais
> - Criar branch `codex/svg-first-asset-policy-guard`.
> - Atualizar `AGENTS.md` e `.cursor/rules/all.mdc` com:
>   - planos visuais devem declarar formato fonte, formato runtime, motivo e evidência;
>   - SVG local/offline segue padrão para sprites, UI e VFX simples;
>   - atlas PNG/WebP só em `public/assets/visual/atlases/`, com SVG fonte preservado;
>   - AVIF nunca como padrão de sprites/atlases; só para `public/assets/visual/cinematics/` com justificativa.
> - Criar `docs/assets/visual-runtime/atlas-exceptions.json` vazio, esquema versionado:
>   - `id`, `kind`, `runtimePaths`, `sourceSvgPaths`, `reason`, `evidencePath`;
>   - `reason`: `heavy-animation`, `many-draws`, `profiled-faster`, `cinematic-background`;
>   - limiares padrão: animação > 8 frames, > 100 draws/frame, ou p95 frame time menor no candidato.
> - Criar `docs/assets/visual-runtime/README.md` explicando decisão SVG → atlas e exemplos aceitos/rejeitados.
>
> ## Scripts, hooks e validação
> - Criar `scripts/validate-visual-asset-policy.mjs`.
>   - Gera `tmp/reports/visual-asset-policy-guard.json`.
>   - Falha se PNG/WebP/AVIF aparecer fora dos diretórios e exceções permitidas.
>   - Falha se atlas não tiver SVG fonte + evidência.
>   - Falha se AVIF for referenciado como sprite/atlas.
>   - Confere que `AGENTS.md` e `.cursor/rules/all.mdc` contêm a política.
> - Criar `scripts/validate-visual-asset-policy.test.mjs` com testes unitários dos casos acima.
> - Atualizar `scripts/validate-svg-assets.mjs` para aceitar exceções governadas sem quebrar SVG padrão.
> - Atualizar `scripts/normalize-semantic-file-names.mjs` para aceitar nomes semânticos de atlas/cinematic governados.
> - Atualizar `package.json`:
>   - `test:visual-asset-policy`
>   - `test:visual-asset-policy:unit`
>   - incluir ambos no `build`.
> - Atualizar `scripts/pre-commit-check.sh` e `scripts/install-git-hooks.sh` para rodar `npm run test:visual-asset-policy`.
>
> ## Testes obrigatórios
> - `node --version` deve iniciar com `v23.`
> - `npm run test:visual-asset-policy:unit`
> - `npm run test:visual-asset-policy`
> - `npm run test:semantic-file-names`
> - `npm run test:svg-assets`
> - `npm run build`
>
> ## Assumptions
> - Escopo só do repo `/Users/mal/GitHub/malnati/brickbreaker`; não alterar `/Users/mal/.codex/AGENTS.md`.
> - Nenhum raster novo será criado nesta tarefa.
> - PNG/WebP atlas futuro será exceção explícita, não novo padrão.
> - Plano detalhado de execução pode ser versionado em `docs/superpowers/plans/2026-07-07-svg-first-asset-policy.md` durante implementação.

<details><summary>32 previous messages</summary>

> Usando skills: `superpowers:using-superpowers` + `superpowers:executing-plans` para executar plano validado; `superpowers:test-driven-development` para scripts com testes; `caveman:caveman` para resposta curta.
>
> Subagents talvez disponíveis; checando, mas execução direta segue se não houver ferramenta exposta.
>
> Memória rápida: regras SVG/guard anteriores para preservar escopo runtime-only.
>
> Criando branch pedida; worktree limpo.
>
> Branch ok. Fazendo TDD: teste RED antes do script guard.
>
> Atualizando docs/rules; nenhum raster criado.
>
> Atualizando `AGENTS.md` e Cursor rule.
>
> <details><summary>Edited 2 files</summary>
>
> - Wrote `./AGENTS.md` (+9 -3)
> - Wrote `./.cursor/rules/all.mdc` (+6 -2)
>
> </details>
>
> Docs/política base ok. Criando teste RED do guard.
>
> RED ok: módulo ausente. Implementando guard mínimo + relatório.
>
> Guard GREEN. Integrando package, hooks, SVG validator, semantic names.
>
> Patch SVG validator: aceitar só exceções governadas.
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./scripts/validate-svg-assets.mjs` (+9 -1)
>
> </details>
>
> Patch nomes semânticos: atlas/cinematics governados.
>
> Atualizando normalizador.
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./scripts/normalize-semantic-file-names.mjs` (+12 -0)
>
> </details>
>
> Integrando hooks.
>
> <details><summary>Edited 2 files</summary>
>
> - Wrote `./scripts/pre-commit-check.sh` (+3 -0)
> - Wrote `./scripts/install-git-hooks.sh` (+1 -1)
>
> </details>
>
> Rodando unidade e guard completo.
>
> Rodando semantic + SVG.
>
> Diff rápido antes de build completo.
>
> Rodando validação obrigatória completa.
>
> Validações passam. Checando status final e arquivos ignorados.
>
> Rodando `git diff --check`.
>
> Revisão rápida dos novos artefatos.
>
> Adicionando JSON Schema referenciado; evita `$schema` morto.
>
> Revalidando após schema.
>
> Validação ok. Checando diff final.
>
> Stage + commit.
>
> Usando `superpowers:finishing-a-development-branch` para fechar branch com verificação final.
>
> Finishing skill: rodando suite Jest + detect env.
>
> Tudo validado; branch local limpa.
</details>

Implementado.

- Branch: `codex/svg-first-asset-policy-guard`
- Commit: `f6e86220 chore(assets): enforce svg-first runtime policy`
- Criados guard/docs em `/Users/mal/GitHub/malnati/brickbreaker/docs/assets/visual-runtime/`
- Criado script `/Users/mal/GitHub/malnati/brickbreaker/scripts/validate-visual-asset-policy.mjs`
- Integrado em `package.json`, pre-commit, SVG validator e semantic-name validator
- Nenhum raster criado
- Não alterei `/Users/mal/.codex/AGENTS.md`

Validações OK:
- `node --version` → `v23.5.0`
- `make help`
- `npm run codex-env:check`
- `npm run test:visual-asset-policy:unit`
- `npm run test:visual-asset-policy`
- `npm run test:semantic-file-names`
- `npm run test:svg-assets`
- `npm run build`
- `npm test -- --runInBand` → 59 suites / 415 tests OK

Obs: build manteve warning Vite de chunk >500 kB, não fatal.
