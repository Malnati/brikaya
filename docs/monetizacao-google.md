<!-- docs/monetizacao-google.md -->
# Brikaya — verificação de propriedade Google sem anúncios ativos

## Objetivo desta fase

Manter `https://brikaya.com/` verificável para propriedade do site, sem publicar unidades, placements, integração H5, interstitials ou interface de publicidade. O jogo continua offline-capable após o primeiro carregamento e não depende de scripts externos para iniciar, avançar fases, salvar progresso ou tocar áudio.

## Estado em 2026-07-29

- Conta/publisher: `ca-pub-9571619183194136`.
- Site no AdSense: `brikaya.com` ainda exibe a rejeição por conteúdo de baixo valor, cujo diagnóstico foi atualizado em 2026-07-15, antes da remediação atual.
- Saída local: um único snippet de verificação no `<head>` de `/`; nenhum em `/{locale}/`, páginas editoriais, confiança/legal, `/play/`, downloads, acordo do usuário ou licença.
- Fonte local de `ads.txt`: `google.com, pub-9571619183194136, DIRECT, f08c47fec0942fa0`.
- Nenhuma unidade real, slot, banner, interstitial, loader, `adsbygoogle`, H5 Ad Placement API, `adBreak` ou `adConfig` integra a saída desta etapa.
- O gate `npm run verify:adsense-ready-proxy` valida a colocação única, `dist/ads.txt`, sitemap com 33 URLs permitidas, os nove conteúdos editoriais com pelo menos 500 palavras, as 21 páginas de confiança com pelo menos 280 palavras, QA EN/PT-BR/ES-419 e canônicas de fallback com `noindex,follow` e zero `hreflang`.
- O gate `npm run verify:adsense-public-ready` é executado depois do deploy e repete no domínio canônico as verificações de inventário, conteúdo, links, canônicas, `hreflang`, `noindex`, snippet e `ads.txt`.
- A produção v174 já apresentou as 33 URLs, `ads.txt` público e rotas de jogo separadas. Esta entrega reforça conteúdo e bloqueia o workflow caso a prova pública pós-deploy falhe.
- Solicitar revisão somente depois que CI, deploy e auditoria pública desta entrega estiverem verdes. A autorização e a ação autenticada pertencem ao painel Sites, não ao CI.

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
- Prova pública: `npm run verify:adsense-public-ready`
- Fonte de `ads.txt`: `public/ads.txt`

## Fontes oficiais

- H5 Games Ads: <https://support.google.com/adsense/answer/1705831>
- Ad Placement API: <https://developers.google.com/ad-placement/apis>
- Guia ads.txt AdSense: <https://support.google.com/adsense/answer/12171612>
- Políticas AdSense: <https://support.google.com/adsense/answer/48182>
