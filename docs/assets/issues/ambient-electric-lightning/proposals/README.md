# Proposta — Raios elétricos em tela cheia (natural)

Preview autocontido para aprovação visual antes de merge no jogo.

## Modelo visual (correção conceitual)

- **Área:** canvas/viewport inteiro — raios **não** são clipados no círculo do playfield
- **Aparência:** relâmpago natural de tempestade — fractal com ramificações, solo → céu
- **Ordem de render:** fundo noturno tela cheia → raios → globo do playfield por cima (referência)

## Análise em movimento

1. Abra `preview.html` (duplo clique ou servidor local)
2. Observe 30–60 s por variante
3. Use **Comparar variantes** para ciclar Pulse → Arcade → Storm (~6 s cada)

## Variantes

| ID | Pasta | Perfil | Status |
|---|---|---|---|
| `pulse` | `variant-a-pulse/` | Sutil | QA (`?lightning=pulse`) |
| `arcade` | `variant-b-arcade/` | Equilibrado | **Aprovado — padrão de produção** (11/07/2026) |
| `storm` | `variant-c-storm/` | Intenso | QA (`?lightning=storm`) |

## Recaptura de frames

```bash
node scripts/capture-ambient-lightning-proposals.mjs
```

Gera PNGs em `variant-*` e atualiza `capture-manifest.json`.

## Override no jogo

`?lightning=pulse|arcade|storm`
