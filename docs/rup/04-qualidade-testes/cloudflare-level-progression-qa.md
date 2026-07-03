<!-- docs/rup/04-qualidade-testes/cloudflare-level-progression-qa.md -->
# QA publicado: níveis progressivos

## Objetivo

Provar que a versão publicada no Cloudflare Pages aumenta a dificuldade por fase sem reiniciar o jogo, sem perder pontuação e sem sair do limite visual do tabuleiro.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-level-progression-qa
```

## Cenário

O teste usa `?qaScenario=single-brick-phase-clear` para limpar a Fase 1 rapidamente e observar a entrada na Fase 2.

## Assertivas mínimas

- `brick_destroyed`, `score_update`, `level_complete` e `level_start` são registrados.
- A Fase 2 inicia após pausa mínima de transição.
- O toast informa `Fase 2` e `1.12×`.
- `level_complete.metadata.nextInitialBrickCount` é igual à quantidade inicial de blocos da Fase 2.
- A Fase 2 inicia com mais linhas e mais blocos que a fase concluída.
- Não há `restart_game` sem ação humana.
- Não há `game_end` ao concluir uma fase.
- Console publicado não contém `error`/`warn`.

## Evidência obrigatória

Salvar em `docs/assets/issues/level-progression/evidence/`:

- screenshot mobile com toast de fase;
- JSON do `cloudflare-level-progression-qa`;
- recibo dos testes locais relevantes.

## Merge

O PR só pode ser mesclado quando:

- o preview Cloudflare passar no QA de níveis progressivos;
- os QAs publicados já existentes de gameplay, transição, layout, tema e SVG continuarem passando;
- a produção for publicada após merge;
- a produção repetir o QA publicado contra `https://brikaya.com/`.
