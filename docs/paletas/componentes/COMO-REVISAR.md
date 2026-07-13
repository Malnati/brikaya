# Como revisar a proposta elétrica

Pacote autocontido para aceite ou pedido de mudanças — versionado em `docs/paletas/componentes` no repositório Brikaya.

## Passo a passo

1. **Abrir o preview interativo**
   - Dê **duplo clique em `preview.html`** no Chrome (janela externa, fora do IDE).
   - Ou execute **`Abrir-Preview.command`** (abre direto no Chrome).
   - O preview funciona direto via `file://` — não precisa de servidor.
   - Se aparecer `Unsafe attempt to load URL file://...` no console, o arquivo foi aberto dentro de um iframe (ex.: preview do Cursor). Feche e abra com duplo clique no Chrome ou use `Abrir-Preview.command`.
   - **Alternativa opcional** (HTTP local, útil para depuração):
     ```bash
     cd docs/paletas/componentes
     python3 -m http.server 8765
     ```
     Depois acesse: http://127.0.0.1:8765/preview.html

2. **Revisar as abas**
   - **Circuitos** — 8 amostras; `spr-component-basic-yellow-normal` (bola vermelha animada em forma LED, por cima dos demais elementos), `spr-component-basic-purple-normal` (arestas roxas elétricas em loop nas placas do capacitor), `spr-component-metal-steel-dented-one` (arestas amarelas elétricas animadas em forma blindada) e `spr-component-metal-steel-dented-two` (bola verde animada em forma blindada) animam em loop; demais são estáticos
   - **VFX elétricos** — inventário estático com nomes em disco
   - **Animações** — faíscas pulsando, bola de energia, impactos em loop e raios ambiente
   - **Raios ambiente** — animação Pulse / Arcade / Storm (padrão: Arcade)
   - **Tokens** — 4 swatches com chip de cor e metadados legíveis

3. **Consultar documentação**
   - `README.md` — inventário completo e checkboxes de aceite
   - `palette-manifest.json` — catálogo machine-readable (49 circuitos + VFX)

4. **Referência estática**
   - `captures/` — PNGs das abas do preview
   - `evidence/` — evidência de QA local
   - `authoring/` — SVGs rascunho (`codex-*`) usados como fonte autoral

5. **Aprovar ou pedir mudanças**
   - Anote o que aprovar ou o que quer alterar (nomes, intensidade dos raios, cores, etc.)
   - Variante ambiente recomendada: **Arcade**

## Estrutura do pacote

```
docs/paletas/componentes/
├── README.md
├── COMO-REVISAR.md
├── Abrir-Preview.command
├── preview.html          (autocontido — abre via file://)
├── palette-manifest.json (referência; não usado em runtime)
├── authoring/       (7 SVGs codex-*)
├── captures/        (4 PNGs)
├── evidence/
└── assets/
    ├── components/  (8 amostras)
    ├── sprites/     (bola elétrica)
    └── vfx/         (15 SVGs: 8 countdown + 7 elétricos)
```
