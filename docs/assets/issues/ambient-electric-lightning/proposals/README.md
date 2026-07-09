# Proposta — Raios elétricos de fundo

Documento de aceite para o efeito ambiente de energia elétrica atravessando o fundo escuro do playfield.

## Como visualizar

Abra no navegador:

[`preview.html`](./preview.html)

Parâmetros opcionais na URL:

- `?variant=pulse|arcade|storm`
- `?mode=classic|turret`

Exemplo: `preview.html?variant=storm&mode=turret`

## Variantes

| Variante | Raios simultâneos | Intervalo spawn | Alpha | Ramificações | Uso recomendado |
|---|---|---|---|---|---|
| **Pulse** | 1–2 | 2,5–4,0 s | 0,12–0,30 | raras | fundo discreto |
| **Arcade** | 2–4 | 1,2–2,5 s | 0,22–0,50 | moderadas | **padrão sugerido** |
| **Storm** | 4–6 | 0,6–1,5 s | 0,35–0,72 | frequentes | máximo drama |

## Modos de fundo

| Modo | Descrição |
|---|---|
| **Clássico** | Playfield circular escuro com anel ciano (modo brickbreaker padrão) |
| **Torreta** | Gradiente radial azul-escuro com anéis concêntricos e horizonte |

## Controles do preview

- **Variante** — alterna Pulse / Arcade / Storm
- **Clássico / Torreta** — troca o fundo simulado
- **Pausar** — congela a animação
- **Reiniciar seed** — reinicia a sequência pseudo-aleatória
- **Forçar raio** — dispara um raio imediato

## Frames capturados

Cada pasta contém 5 frames representando fases da animação (início, meio, pico, fade):

- [`variant-a-pulse/`](./variant-a-pulse/)
- [`variant-b-arcade/`](./variant-b-arcade/)
- [`variant-c-storm/`](./variant-c-storm/)

Arquivos seguem o padrão `{classic|turret}-frame-{01..05}.png`.

Manifesto de captura: [`capture-manifest.json`](./capture-manifest.json)

## Decisão de formato

| Campo | Valor |
|---|---|
| Formato fonte | N/A (geração procedural) |
| Formato runtime | Canvas 2D procedural |
| Motivo | `heavy-animation` + `many-draws` |
| Paleta | Core `#eefdff`, halo `rgba(66,224,255,0.34)` — alinhada aos impactos elétricos existentes |

## Aceite

Escolha uma variante para integração no jogo:

- [ ] **Pulse** — sutil
- [ ] **Arcade** — equilibrado (recomendado)
- [ ] **Storm** — intenso

Após a escolha, a variante aprovada vira o preset padrão em runtime. As demais permanecem acessíveis via `?lightning=pulse|arcade|storm`.

## Implementação no jogo (pós-aceite)

- Módulos: `src/logic/rendering/electricLightningRenderer.ts`, `src/logic/rendering/ambientElectricBackground.ts`
- Integração: `GameEngine.drawGameBackdrop()` nos modos clássico e torreta
- Performance: efeitos reduzidos em mobile / `prefers-reduced-motion`
