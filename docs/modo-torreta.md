<!-- docs/modo-torreta.md -->
# Plano e entrega — Modo Torreta

## Objetivo

Adicionar ao Brikaya um modo alternativo de jogo acionado pelo menu: **Torreta**. A fantasia é a visão do atirador dentro de uma torreta esférica de bombardeiro, com cama elástica, bolha de vidro e profundidade visual dentro do círculo de jogo.

## Contexto

- O jogo continua sendo arcade offline-first em React/TypeScript.
- O círculo permanece como limite visual e mecânico da partida.
- A bolinha, os blocos, poderes, fases, áudio, pontuação e recordes continuam compartilhados com o modo clássico.
- A mudança é um modo de apresentação e controle visual, não uma troca completa do motor do jogo.

## Escopo implementado

- Seletor de modo no menu:
  - `Clássico`
  - `Torreta`
- Persistência local da preferência do jogador.
- Reinício seguro da partida ao trocar o modo.
- Cenário de QA por URL: `?qaScenario=ball-turret`.
- Renderização da torreta dentro do círculo:
  - fundo com profundidade radial;
  - anéis internos;
  - horizonte elíptico;
  - cama elástica alinhada ao controle do jogador;
  - cama elástica curva;
  - camada de vidro e vinheta esférica.
- O modo clássico preserva a raquete original.
- O modo Torreta usa uma cama elástica curva como controle visual, mantendo a mesma lógica de colisão e progressão.
- Evidência visual desktop, mobile e menu em `docs/assets/issues/ball-turret-mode/evidence/`.

## Fora de escopo

- Modelos 3D externos, WebGL, GLB/glTF ou novas dependências runtime.
- Novas armas com dano, munição ou recarga.
- Campanhas, anúncios, compras ou serviços pagos.
- Alteração de regras de pontuação, fases, recordes ou privacidade.

## Arquitetura

### Estado do modo

- Constantes: `src/constants/gameMode.ts`.
- Hook de preferência: `src/hooks/useGameModePreference.ts`.
- `App` calcula o modo ativo e passa para `Game`.
- `Game` passa o modo para `useGameLoop`.
- `useGameLoop` cria o `GameEngine` com o modo selecionado.

### Renderização

- Renderizador dedicado: `src/logic/rendering/ballTurretRenderer.ts`.
- `GameEngine` escolhe entre:
  - modo clássico: campo radial + raquete;
  - modo Torreta: fundo de torreta + cama elástica + vidro.
- A lógica de física continua compartilhada para reduzir risco e preservar progressão.

### UI e linguagem

- Cópia final do usuário usa linguagem de produto:
  - `Modo de jogo`
  - `Clássico`
  - `Torreta`
  - `Rebata na cama elástica e defenda o círculo.`
- Nenhum detalhe de implementação aparece na interface do jogador.

## Cobertura de testes

### Unitários

- `src/constants/gameMode.test.ts`
  - valida modos conhecidos;
  - resolve valores inválidos para `classic`.
- `src/logic/rendering/ballTurretRenderer.test.ts`
  - desenha fundo, cama elástica e vidro;
  - usa geometria radial quando disponível;
  - mantém fallback quando a posição radial não existe.
- `src/components/Game.test.tsx`
  - repassa `gameMode` ao loop;
  - mantém padrão clássico.
- `src/App.test.tsx`
  - mostra seletor no menu;
  - persiste `Torreta`;
  - reinicia a partida ao trocar;
  - carrega preferência salva;
  - força `ball-turret` por cenário de QA.
- `src/logic/GameEngine.test.ts`
  - modo clássico desenha raquete;
  - modo Torreta chama renderizador de torreta;
  - cenário de QA força torreta.

### E2E/visual

- `tests/e2e/cloudflare-ball-turret-qa.js`
  - abre `?qaScenario=ball-turret`;
  - valida menu e botões de modo;
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
- Pacote atual: `1.2.1`.
- Deploy: Cloudflare Pages com domínio canônico `https://brikaya.com/`.

## Evidências esperadas

- PR da feature com screenshot centralizado em `## Evidência visual`.
- Release note versionada em `docs/releases/v1.2.1.md`.
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
