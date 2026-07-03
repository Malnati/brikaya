<!-- docs/rup/04-qualidade-testes/cloudflare-high-scores-qa.md -->
# QA publicado: recordes gerais locais

## Objetivo

Provar que a versão publicada no Cloudflare Pages mostra recordes gerais locais no menu, sem rede externa e sem expor termos técnicos para o jogador.

## Comando

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-high-scores-qa
```

## Escopo offline

O termo `global` do roadmap é aplicado como recorde geral do jogo no dispositivo. Ranking remoto fica fora de escopo porque o jogo deve funcionar 100% offline e sem requisições após o primeiro uso.

## Cenário

O teste limpa o estado local, semeia pontuações no armazenamento do navegador, recarrega o jogo publicado em cenário estável e abre o menu lateral.

## Assertivas mínimas

- O menu exibe a seção `Recordes`.
- `Melhor partida` reflete o maior valor salvo.
- A lista local é ordenada do maior para o menor score.
- Scores zerados ou inválidos não aparecem no ranking.
- A interface não expõe cópia técnica para usuário final.
- Não há requisições externas.
- Console publicado não contém `error`/`warn`.

## Evidência obrigatória

Salvar em `docs/assets/issues/local-high-scores/evidence/`:

- screenshot mobile do menu com recordes;
- JSON do `cloudflare-high-scores-qa`;
- recibo dos testes locais relevantes.

## Merge

O PR só pode ser mesclado quando:

- o preview Cloudflare passar no QA de recordes;
- os QAs publicados já existentes de gameplay, PWA, níveis, power-ups, layout, tema e SVG continuarem passando;
- a produção for publicada após merge;
- a produção repetir o QA publicado contra `https://malnati-brickbreaker.pages.dev/`.
