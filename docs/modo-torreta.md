<!-- docs/modo-torreta.md -->
# Plano e entrega — Modo Torreta

## Objetivo

Tornar **Torreta** o padrão permanente do Brikaya em todas as fases. A fantasia é a visão do atirador dentro de uma torreta esférica de bombardeiro, com cama elástica, bolha de vidro e profundidade visual dentro do círculo de jogo.

## Contexto

- O jogo continua sendo arcade offline-first em React/TypeScript.
- O círculo permanece como limite visual e mecânico da partida.
- A bolinha, os blocos, poderes, fases, áudio, pontuação e recordes continuam usando o motor compartilhado.
- O modo clássico fica apenas como compatibilidade interna de motor/testes, sem seletor para o jogador.

## Escopo implementado

- Torreta forçada como modo ativo no fluxo normal do jogador.
- Seletor de modo removido do menu.
- Preferência antiga de modo clássico salva no aparelho é ignorada.
- Cenário de QA por URL: `?qaScenario=ball-turret`.
- Renderização da torreta dentro do círculo:
  - fundo com profundidade radial;
  - anéis internos;
  - horizonte elíptico;
  - cama elástica alinhada ao controle do jogador;
  - cama elástica curva;
  - cama elástica em anel completo no modo 360°;
  - camada de vidro e vinheta esférica.
- O modo clássico preserva a raquete original apenas para compatibilidade interna.
- A Torreta usa uma cama elástica como controle visual, mantendo progressão, pontuação, fases, áudio e recordes.
- Blocos da Torreta preenchem toda a circunferência.
- O segmento ativo da cama elástica rebate a bolinha; o restante do anel é indicação visual.
- Power-ups da Torreta saem do centro para a borda e são coletados ao tocar a borda.
- Bolinhas da Torreta nascem em sequência por pontos diferentes da borda e seguem para dentro.
- Evidência visual desktop, mobile e menu em `docs/assets/issues/ball-turret-mode/evidence/`.

## Fora de escopo

- Modelos 3D externos, WebGL, GLB/glTF ou novas dependências runtime.
- Novas armas com dano, munição ou recarga.
- Campanhas, anúncios, compras ou serviços pagos.
- Alteração de regras de pontuação, fases, recordes ou privacidade.

## Arquitetura

### Estado do modo

- Constantes: `src/constants/gameMode.ts`.
- `App` fixa o modo ativo em Torreta e passa para `Game`.
- `Game` passa o modo para `useGameLoop`.
- `useGameLoop` cria o `GameEngine` com o modo selecionado.

### Renderização

- Renderizador dedicado: `src/logic/rendering/ballTurretRenderer.ts`.
- `GameEngine` escolhe entre:
  - modo clássico: campo radial + raquete;
  - modo Torreta: fundo de torreta + cama elástica + vidro.
- A lógica de física continua compartilhada onde preserva progressão.
- A Torreta adiciona parametrização radial própria:
  - arco de blocos: `-π` a `π`;
  - movimento da cama elástica: 360°;
  - perda de bolinha: qualquer borda fora do segmento ativo;
  - anel visual: volta completa, com destaque no segmento ativo.

### Plano 360° implementado em `v1.2.2`

1. **Blocos em toda a circunferência**
   - A geometria da Torreta usa arco completo.
   - A quantidade de colunas dobra em relação ao modo clássico.
   - A densidade visual fica distribuída nos quatro quadrantes.
2. **Power-ups do centro para as bordas**
   - O spawn radial começa no centro do círculo.
   - A direção segue a posição atual da bolinha quando disponível.
   - A ativação acontece quando o item toca a borda.
3. **Cama elástica em volta completa**
   - O anel completo fica sempre visível.
   - Apenas o segmento ativo móvel rebate a bolinha.
   - Touch usa ponto completo do canvas para permitir controle 360°.
4. **Bolinhas em toda a borda**
   - O spawn inicial e os spawns de nova fase alternam bordas.
   - A direção inicial aponta para dentro da arena.
   - Multiball continua compartilhando a física existente.

### UI e linguagem

- O menu não exibe seleção de modo.
- Cópia final do usuário mantém linguagem de produto e não expõe detalhes de implementação.

## Cobertura de testes

### Unitários

- `src/constants/gameMode.test.ts`
  - valida modos conhecidos;
  - preserva compatibilidade interna do modo clássico.
- `src/logic/rendering/ballTurretRenderer.test.ts`
  - desenha fundo, cama elástica e vidro;
  - usa geometria radial quando disponível;
  - mantém fallback quando a posição radial não existe.
- `src/utils/radialGeometry.test.ts`
  - valida arco completo da Torreta;
  - valida distribuição em quatro quadrantes;
  - valida navegação 360° do segmento ativo.
- `src/objects/PowerUp.test.ts`
  - valida movimento radial do centro até a borda.
- `src/objects/Ball.test.ts`
  - valida perda da bolinha em qualquer borda fora do segmento ativo da Torreta.
- `src/components/Game.test.tsx`
  - repassa `gameMode` ao loop;
  - mantém compatibilidade padrão do componente isolado.
- `src/App.test.tsx`
  - usa `ball-turret` por padrão;
  - não mostra seletor no menu;
  - ignora preferência antiga de modo clássico;
  - força `ball-turret` por cenário de QA.
- `src/logic/GameEngine.test.ts`
  - modo clássico desenha raquete;
  - modo Torreta chama renderizador de torreta;
  - cenário de QA força torreta;
  - valida dobro de colunas na Torreta;
  - valida spawn inicial radial da bolinha;
  - valida power-up radial.
- `src/hooks/useGameLoop.test.tsx`
  - encaminha `x` e `y` do toque para permitir controle em 360°.

### E2E/visual

- `tests/e2e/cloudflare-ball-turret-qa.js`
  - abre `?qaScenario=ball-turret`;
  - valida que a Torreta está ativa sem seletor de modo;
  - exercita cama elástica por mouse e teclado;
  - captura desktop, mobile e menu;
  - verifica canvas visível e HUD ativo;
  - bloqueia cópia pública com detalhes técnicos.

## Correções e validações antes da feature

Antes da entrega da Torreta, a pendência de contagem em Safari mobile foi fechada em PR separado:

- PR: `#170` — `fix: reserva tela em contagem mobile`.
- Merge: `201f2e23485307fa2222102754d96f36547cd612`.
- Cobertura: unitário do overlay, suíte completa, build e evidência visual.

## Validação mínima local

Executar com Node.js v23.x:

```bash
PATH=/opt/homebrew/opt/node@23/bin:$PATH node --version
PATH=/opt/homebrew/opt/node@23/bin:$PATH make help
PATH=/opt/homebrew/opt/node@23/bin:$PATH npm run test:semantic-file-names
PATH=/opt/homebrew/opt/node@23/bin:$PATH npm run test:svg-assets
PATH=/opt/homebrew/opt/node@23/bin:$PATH npm test -- --runInBand
PATH=/opt/homebrew/opt/node@23/bin:$PATH npm run build
```

## Validação visual local

```bash
PATH=/opt/homebrew/opt/node@23/bin:$PATH npm run preview -- --host 127.0.0.1 --port 7979
PATH=/opt/homebrew/opt/node@23/bin:$PATH \
  BRIKAYA_PUBLIC_URL=http://127.0.0.1:7979/ \
  BRIKAYA_BALL_TURRET_QA_REPORT=docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-local-qa.json \
  npm run test:cloudflare-ball-turret
```

## Validação publicada

Após merge, release e deploy:

```bash
PATH=/opt/homebrew/opt/node@23/bin:$PATH make cloudflare-public-check
PATH=/opt/homebrew/opt/node@23/bin:$PATH make cloudflare-offline-pwa-qa
PATH=/opt/homebrew/opt/node@23/bin:$PATH make cloudflare-mobile-qa
PATH=/opt/homebrew/opt/node@23/bin:$PATH \
  BRIKAYA_BALL_TURRET_QA_REPORT=tmp/reports/ball-turret-public-qa.json \
  BRIKAYA_BALL_TURRET_MENU_SCREENSHOT=tmp/reports/ball-turret-menu.png \
  BRIKAYA_BALL_TURRET_DESKTOP_SCREENSHOT=tmp/reports/ball-turret-desktop.png \
  BRIKAYA_BALL_TURRET_MOBILE_SCREENSHOT=tmp/reports/ball-turret-mobile.png \
  make cloudflare-ball-turret-qa
```

## Publicação

- Release inicial do modo: `v1.2.0` — `Brikaya v1.2.0 — Modo Torreta`.
- Release do ajuste atual: `v1.2.1` — `Brikaya v1.2.1 — Torreta com cama elástica`.
- Release 360°: `v1.2.2` — `Brikaya v1.2.2 — Torreta 360°`.
- Pacote atual: `1.2.2`.
- Deploy: Cloudflare Pages com domínio canônico `https://brikaya.com/`.

## Evidências esperadas

- PR da feature com screenshot centralizado em `## Evidência visual`.
- Release note versionada em `docs/releases/v1.2.2.md`.
- Evidência visual versionada:
  - `docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-menu.png`
  - `docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-gameplay-desktop.png`
  - `docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-gameplay-mobile.png`
  - `docs/assets/issues/ball-turret-mode/evidence/evi-ball-turret-local-qa.json`
- Evidência publicada em `tmp/reports/` após deploy.

## Rollback

Se a publicação mostrar regressão:

1. Reverter a release/tag apenas se necessário para consumo externo.
2. Reverter o PR do modo Torreta em novo PR.
3. Manter a correção de Safari mobile separada, pois ela foi validada e não depende da Torreta.
4. Reexecutar build, QA PWA/offline, mobile e QA específica do modo.
