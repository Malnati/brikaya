<!-- docs/monetizacao-google.md -->
# Brikaya — verificação de propriedade Google sem anúncios ativos

## Objetivo desta fase

Manter `https://brikaya.com/` verificável para propriedade do site, sem publicar unidades, placements, integração H5, interstitials ou interface de publicidade. O jogo continua offline-capable após o primeiro carregamento e não depende de scripts externos para iniciar, avançar fases, salvar progresso ou tocar áudio.

## Estado em 2026-07-27

- Conta/publisher: `ca-pub-9571619183194136`.
- Site no AdSense: `brikaya.com` permanece com rejeição histórica por conteúdo de baixo valor até decisão humana posterior.
- Saída local: um único snippet de verificação no `<head>` de `/`; nenhum em `/{locale}/`, páginas editoriais, confiança/legal, `/play/`, downloads, acordo do usuário ou licença.
- Fonte local de `ads.txt`: `google.com, pub-9571619183194136, DIRECT, f08c47fec0942fa0`.
- Nenhuma unidade real, slot, banner, interstitial, loader, `adsbygoogle`, H5 Ad Placement API, `adBreak` ou `adConfig` integra a saída desta etapa.
- O gate `npm run verify:adsense-ready-proxy` valida a colocação única, `dist/ads.txt`, `dist/sitemap.xml` com 33 URLs permitidas, edição EN/PT-BR/ES-419, QA espanhol e todas as canônicas de fallback com `noindex,follow` e zero `hreflang`. É um gate técnico, não aprovação AdSense.
- Estado público desta revisão: pendente de merge, deploy de produção e prova no domínio canônico.
- Não solicitar revisão automaticamente nem clicar em confirmação no painel Sites. Essa decisão segue humana, somente após novo inventário público e elegibilidade da conta/site.

## Condição para qualquer monetização futura

Qualquer avaliação futura de H5/inter-phase ads é condicional a: aprovação da conta e do site, elegibilidade explícita para H5 Games Ads, políticas aplicáveis, consentimento quando exigido e revisão de UX. Não há implementação ou compromisso de publicar anúncios antes dessa aprovação.

Se um experimento futuro for aprovado, ele deve ser planejado e revisado separadamente. Não pode prejudicar jogo offline, progressão, pontuação, áudio, controles ou acesso gratuito.

## Regras de produto

- Não há campanhas pagas, orçamento, cartão ou compra neste escopo.
- QA não clica nem incentiva cliques em anúncio real.
- O jogador não vê elementos de publicidade nesta fase.
- Privacidade, termos e suporte permanecem páginas públicas de referência; mudanças futuras devem ser descritas nelas antes de uso.

## Evidência técnica

- Prontidão: [`docs/adsense-site-readiness.md`](adsense-site-readiness.md)
- Gate: `npm run verify:adsense-ready-proxy`
- Fonte de `ads.txt`: `public/ads.txt`

## Fontes oficiais

- H5 Games Ads: <https://support.google.com/adsense/answer/1705831>
- Ad Placement API: <https://developers.google.com/ad-placement/apis>
- Guia ads.txt AdSense: <https://support.google.com/adsense/answer/12171612>
- Políticas AdSense: <https://support.google.com/adsense/answer/48182>
