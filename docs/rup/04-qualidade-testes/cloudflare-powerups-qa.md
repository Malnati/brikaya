<!-- docs/rup/04-qualidade-testes/cloudflare-powerups-qa.md -->
# QA publicado: power-ups e especiais

## Objetivo

Provar que a versão publicada no Cloudflare Pages entrega power-ups e especiais sem dependências externas, sem duplicar pontuação e sem reiniciar o jogo.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-powerups-qa
```

## Cenário

O teste usa `?qaScenario=laser-fan` para posicionar o especial Laser em leque acima da raquete, coletar o item automaticamente e concluir a fase por destruição dos tijolos ativos.

## Assertivas mínimas

- `game_start`, `power_up`, `brick_destroyed`, `score_update` e `level_complete` são registrados.
- A ativação do Laser em leque registra `power_up.metadata.powerUpType = "laser_fan"` e `power_up.metadata.action = "activate"`.
- O Laser em leque produz um único `score_update` com `reason = "laser_fan"`.
- A fase entra em transição uma única vez após o especial.
- Não há `restart_game` sem ação humana.
- Não há requisições externas para imagens, áudio ou scripts.
- Console publicado não contém `error`/`warn`.

## Evidência obrigatória

Salvar em `docs/assets/issues/powerups-specials/evidence/`:

- screenshot mobile com o efeito ou resultado do especial;
- screenshot do item coletável quando disponível;
- JSON do `cloudflare-powerups-qa`;
- recibo dos testes locais relevantes.

## Merge

O PR só pode ser mesclado quando:

- o preview Cloudflare passar no QA de power-ups;
- os QAs publicados já existentes de gameplay, níveis, transição, layout, tema e SVG continuarem passando;
- a produção for publicada após merge;
- a produção repetir o QA publicado contra `https://brikaya.com/`.
