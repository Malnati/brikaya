<!-- docs/rup/04-qualidade-testes/cloudflare-effects-audio-qa.md -->
# QA publicado: efeitos visuais e sonoros

## Objetivo

Provar que os efeitos visuais cinematográficos e os sons do jogo funcionam na versão publicada do Cloudflare Pages, com mídias locais, cache offline e sem requisições externas.

## Escopo #008

A fase `#008` formaliza como concluído o pacote de efeitos visuais e sonoros já integrado ao jogo:

- overlays cinematográficos de contagem, subida de fase e fim de jogo;
- imagens de efeito visual em SVG local;
- sons locais de gameplay, interface, fase, recorde, power-ups e feedback;
- cache PWA de mídias visuais e sonoras;
- QA publicado repetível contra preview e produção.

## Comandos

```bash
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-cinematic-effects-qa
BRICKBREAKER_PUBLIC_URL=<cloudflare-preview-ou-producao> make cloudflare-audio-qa
npm run test:cinematic-media-assets
npm run test:audio-assets
```

## Assertivas mínimas

- Countdown, subida de fase e RIP aparecem como overlays visíveis.
- As imagens dos overlays vêm de `/assets/visual/vfx/` e usam SVG.
- As mídias cinematográficas estão no cache do PWA.
- Os eventos sonoros esperados são emitidos pelo tour QA.
- Os arquivos de áudio vêm do manifesto local e estão no cache.
- Não há requests externos de mídia visual ou sonora.
- Console publicado não contém `error`/`warn`.

## Evidência obrigatória

Salvar em `docs/assets/issues/effects-audio/evidence/`:

- JSON do QA cinematográfico publicado;
- screenshot dos overlays de countdown, subida de fase e RIP;
- JSON do QA de áudio publicado;
- screenshot do tour de áudio;
- recibo dos testes locais e publicados.

## Merge

O PR só pode ser mesclado quando:

- preview Cloudflare passar nos QAs cinematográfico e de áudio;
- validações locais de mídia visual e áudio passarem;
- regressões principais de gameplay/tema/SVG continuarem passando;
- produção for publicada após merge;
- produção repetir os QAs publicados contra `https://malnati-brickbreaker.pages.dev/`.
