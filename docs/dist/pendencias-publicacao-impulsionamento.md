<!-- docs/dist/pendencias-publicacao-impulsionamento.md -->
# Pendências de publicação global e impulsionamento externo — Brikaya

Data UTC: 2026-07-04. Escopo: `https://brikaya.com/`, PWA-only, todos os países/locales previstos em `docs/dist/*.md`, orçamento máximo futuro de R$500 e nenhuma publicidade dentro do jogo.

## 1. Decisão operacional

Brikaya deve ficar pronto para divulgação global por três caminhos:

1. publicação/indexação orgânica sem custo;
2. preparação de cadastros e campanhas externas sem contratar;
3. contratação futura de testes pagos, limitada a R$500 totais, somente depois de leitura e decisão do responsável.

Regras que não podem ser violadas:

- não inserir banner, SDK, pixel, tag de remarketing, tracker, anúncio, publisher ID, slot ou script externo no jogo;
- não aceitar cartão obrigatório, depósito, saldo, assinatura, upgrade, crédito, overage, campanha ativa ou cobrança recorrente sem decisão posterior;
- não criar promessa de prêmio, dinheiro, recompensa externa, ranking premiado ou vantagem financeira;
- não divulgar URL de preview ou `.pages.dev`; usar somente `https://brikaya.com/` e rotas localizadas canônicas;
- todo bloqueio que for apenas decisão futura deve ficar documentado, sem interromper o restante do trabalho gratuito.

## 2. Estado por país, região e locale

| Prioridade | País/região | Locale público | Status para publicar | Pendência antes de impulsionar | Canal principal sem custo | Canal pago futuro preparado |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Brasil | `pt-BR` | Publicado no domínio canônico. CLASSIND enviado e em triagem. | Aguardar resultado CLASSIND; aplicar símbolo/descritores se retornar. | SEO, WhatsApp, comunidades BR, diretórios web gratuitos. | Google Search e Meta com limite diário baixo. |
| P0 | Estados Unidos, Canadá, Reino Unido | `en` | Publicado. | Revisar copy para não mirar crianças; UK exige consentimento antes de ads reais personalizados. | SEO inglês, Reddit/comunidades, web games, PWA. | Google Search, Reddit, Meta; sem pixel. |
| P0 | México e LATAM hispânica | `es-419` | Publicado. | Busca gratuita de marca no IMPI/Marcanet e revisão de espanhol regional. | SEO LATAM, posts orgânicos, comunidades hispânicas. | Meta e Google Search com campanha regional. |
| P0 | Índia | `en-IN`, `hi-IN` | Publicado. | Manter sem prêmio, aposta, cash-out ou e-sport; revisar se regras de online gaming mudarem. | SEO, comunidades mobile/web e idioma local. | Meta/Google externos; sem promessa de recompensa. |
| P1 | Alemanha | `de` | Publicado. | Revisão cultural e consentimento EEA antes de qualquer ads personalizado. | SEO alemão, diretórios web gratuitos. | Google Search futuro; sem remarketing. |
| P1 | França | `fr` | Publicado. | Revisão cultural e consentimento EEA/CNIL antes de ads personalizado. | SEO francês, comunidades indie/web. | Google Search futuro; sem remarketing. |
| P1 | Itália | `it` | Publicado. | Revisão cultural e consentimento EEA antes de ads personalizado. | SEO italiano e comunidades gratuitas. | Google Search futuro; sem remarketing. |
| P1 | Japão | `ja` | Publicado. | Revisão cultural/copy antes de impulsionar. | SEO japonês e divulgação orgânica cuidadosa. | Google Search futuro, se copy revisada. |
| P1 | Coreia do Sul | `ko` | Publicado; Naver cadastrado. | Aguardar coleta Naver; revisar copy local. | Naver/SEO, comunidades coreanas gratuitas. | Google/Meta futuro, se copy revisada. |
| P2 | Indonésia | `id` | Publicado. | Validar retenção antes de gastar. | SEO, comunidades mobile/web SEA. | TikTok/Meta futuro, mas TikTok fica bloqueado se mínimo superar reserva. |
| P2 | Vietnã | `vi` | Publicado. | Revisão local antes de campanha. | SEO e comunidades gratuitas. | Meta/TikTok futuro, condicionado a mínimo. |
| P2 | Filipinas | `fil` e `en` | Publicado. | Validar se inglês ou Filipino converte melhor. | SEO, comunidades e compartilhamento direto. | Meta/TikTok futuro, condicionado a mínimo. |
| P2 | Tailândia | `th` | Publicado. | Revisão local antes de campanha. | SEO e diretórios gratuitos. | TikTok/Meta futuro, condicionado a mínimo. |
| Monitorado | China global | `zh-CN` | Publicado globalmente. | Baidu gratuito só com conta autorizada; sem ICP, China Network, hospedagem China ou app store local. | Descoberta global e Baidu se gratuito. | Bloqueado; precisa plano separado. |

## 3. Pendências registradas

### 3.1. Executar ou manter sem custo

- [x] Domínio canônico publicado: `https://brikaya.com/`.
- [x] Sitemap multilíngue com 15 URLs.
- [x] `hreflang` e `html lang` por locale.
- [x] Google Search Console verificado e sitemap reenviado.
- [x] Bing Webmaster Tools verificado e sitemap enviado.
- [x] Yandex Webmaster verificado e sitemap enviado.
- [x] Naver Search Advisor verificado e sitemap enviado.
- [x] CLASSIND enviado; status em triagem.
- [x] Metadados sociais próprios com imagem local SVG do app.
- [x] Preservação de parâmetros UTM em navegação localizada sem sujar canonical.
- [ ] Baidu Search Resource Platform, somente se existir conta Baidu gratuita autorizada.
- [ ] Buscas gratuitas oficiais de marca/nome: INPI, DINAPI, USPTO, WIPO, EUIPO, UK IPO, CIPO, IMPI, IP India e buscas web locais.
- [ ] Registro de resultado das buscas gratuitas com links e prints/evidências sanitizadas, sem depósito pago.

### 3.2. Preparar sem contratar

- [x] Presets de URL de campanha no código-fonte para Google, Meta, Reddit, TikTok reservado e orgânico.
- [x] Kit de campanhas por mercado nesta documentação.
- [x] Divisão de orçamento R$500 documentada.
- [ ] Conta Google Ads: criar somente até etapa sem campanha ativa e sem forma de pagamento obrigatória.
- [ ] Conta Meta Ads: criar somente se conta autenticada permitir sem cobrança/campanha ativa.
- [ ] Conta Reddit Ads: criar somente se permitir sem cartão obrigatório; compra exige cartão e campanha ativa.
- [ ] Conta TikTok Ads: criar somente se permitir sem saldo/campanha; veiculação fica limitada por mínimos oficiais em USD.

### 3.3. Bloqueios pagos ou de decisão

- [ ] Qualquer pagamento de anúncio.
- [ ] Adicionar cartão, saldo, banco ou PayPal em plataforma de ads.
- [ ] Criar campanha ativa, publicar anúncio ou definir início automático.
- [ ] Aceitar crédito promocional que gere obrigação de gasto, verificação financeira ou cobrança futura.
- [ ] Registrar marca, software, copyright ou desenho industrial pago.
- [ ] Contratar ICP, Cloudflare China Network, hospedagem China, app store chinesa ou representante local.
- [ ] Ativar AdSense/H5 Games Ads, CMP, pixel, tag, analytics remoto ou script externo.

## 4. Cadastros de marketing e status operacional

| Serviço | Objetivo para Brikaya | O que pode ficar pronto sem custo | Ponto de parada obrigatório | Status desta rodada |
| --- | --- | --- | --- | --- |
| Google Ads | Teste de busca por intenção: “jogo de quebrar blocos”, “block breaker”, “arcade browser game”. | Conta e rascunho conceitual, quando a interface permitir pular recomendações e campanha. | Pagamento, método financeiro, campanha ativa ou envio de cobrança. | Não executado: exige sessão autenticada/decisão financeira para concluir além do rascunho documental. |
| Meta Ads | Alcance social para Brasil, LATAM, Índia e SEA sem anúncio dentro do jogo. | Página/perfil e rascunho de campanha, se a conta permitir sem cobrança. | Primeira campanha, método de pagamento ou cobrança automática. | Não executado: ajuda oficial indica pagamento ao criar primeiro anúncio; fica bloqueado antes de compromisso. |
| Reddit Ads | Teste em público inglês de indie/web games/PWA. | Rascunho de copy e segmentação. | Cartão e campanha para compra. | Não executado: documentação de compra exige cartão e campanha; fica pendente. |
| TikTok Ads | Teste social curto para SEA/LATAM se o mínimo couber. | Conta/rascunho criativo se possível. | Orçamento mínimo oficial em USD, saldo, cartão ou campanha ativa. | Não executado para veiculação: mínimos oficiais tornam a reserva de R$60 insuficiente como teste isolado. |
| Baidu | Descoberta `zh-CN` sem rota China paga. | Verificação gratuita do site, se houver conta Baidu. | ICP, China Network, hospedagem China, contrato comercial ou pagamento. | Pendente por conta Baidu autorizada. |

## 5. Orçamento futuro máximo de R$500

Este orçamento é plano de teste, não autorização de gasto.

| Serviço | Reserva máxima | Uso pretendido | Países/locales | Condição antes de gastar |
| --- | ---: | --- | --- | --- |
| Google Ads | R$170 | Busca com palavras de intenção e URL localizada. | `pt-BR`, `en`, `es-419`, `en-IN`. | Conta criada, pagamento aprovado pelo responsável, limite diário baixo e campanha pausável. |
| Meta Ads | R$170 | Impulsionamento externo de post/link, sem pixel. | Brasil, LATAM, Índia e Filipinas/SEA em teste. | Post/copy revisado, conta e pagamento definidos pelo responsável. |
| Reddit Ads | R$100 | Público inglês de web games, indie games e PWA. | `en`. | Cartão/compra aprovados pelo responsável e campanha com teto claro. |
| TikTok Ads | R$60 | Reserva de aprendizado; não contratar se mínimo oficial superar a reserva. | `id`, `vi`, `fil`, `th`, LATAM. | Só usar se plataforma aceitar teto real dentro da reserva; caso contrário redistribuir após decisão. |
| Total | R$500 | Teste curto de aquisição externa. | P0 primeiro, P1/P2 só com evidência. | Nunca exceder R$500 sem nova autorização. |

Redistribuição segura se TikTok ficar bloqueado por mínimo: Google +R$30, Meta +R$20, Reddit +R$10. A redistribuição também exige autorização antes de gasto.

## 6. Presets de links preparados no código-fonte

O arquivo `src/marketing/campaignLinks.ts` define links canônicos com UTM, sem script externo e sem envio de dados a terceiros pelo jogo.

| Preset | URL base | Uso |
| --- | --- | --- |
| `google-brasil-search` | `https://brikaya.com/` | Busca paga futura no Brasil. |
| `google-english-search` | `https://brikaya.com/en/` | Busca paga futura em inglês. |
| `meta-latam-social` | `https://brikaya.com/es-419/` | Social pago futuro para LATAM. |
| `meta-india-social` | `https://brikaya.com/en-IN/` | Social pago futuro para Índia em inglês. |
| `reddit-english-community` | `https://brikaya.com/en/` | Comunidades/Reddit em inglês. |
| `tiktok-sea-social-reserve` | `https://brikaya.com/id/` | Reserva SEA, bloqueada se mínimo não couber. |
| `organic-europe-share` | `https://brikaya.com/de/` | QR/link orgânico Europa. |
| `organic-asia-share` | `https://brikaya.com/ja/` | QR/link orgânico Ásia. |

Canonical e `hreflang` permanecem limpos; parâmetros UTM só vivem no link de campanha e continuam na navegação localizada para não perder atribuição manual.

## 7. Kit de campanha por idioma

| Locale | Título curto | Texto curto | CTA | Público inicial | UTM campaign |
| --- | --- | --- | --- | --- | --- |
| `pt-BR` | Brikaya no navegador | Quebre blocos, avance fases e jogue offline depois do primeiro acesso. | Jogar agora | casual, arcade, PWA, mobile web, Brasil | `brikaya-p0-brasil-test` |
| `en` | Brikaya block breaker | Break blocks in your browser, keep progress on your device, and come back offline. | Play now | block breaker, browser games, indie games, PWA | `brikaya-p0-english-test` |
| `es-419` | Brikaya en tu navegador | Rompe bloques, supera niveles y vuelve a jugar aunque estés sin conexión. | Jugar ahora | juegos casuales, arcade, LATAM, navegador | `brikaya-p0-latam-test` |
| `en-IN` | Brikaya for quick play | A light arcade game for your browser, ready to continue after the first visit. | Play now | casual mobile web, India, arcade | `brikaya-p0-india-test` |
| `hi-IN` | Brikaya ब्राउज़र में | ब्लॉक तोड़ें, लेवल बढ़ाएँ और पहली बार के बाद ऑफ़लाइन खेलें। | अभी खेलें | mobile web India, casual arcade | `brikaya-p0-india-test` |
| `de` | Brikaya Blockbreaker | Spiele direkt im Browser und mach nach dem ersten Besuch auch offline weiter. | Jetzt spielen | arcade, browser games, Germany | `brikaya-p1-europe-test` |
| `fr` | Brikaya casse-briques | Jouez dans le navigateur, gardez votre progression et revenez hors connexion. | Jouer | arcade, jeux navigateur, France | `brikaya-p1-europe-test` |
| `it` | Brikaya rompi blocchi | Gioca nel browser, salva i progressi e torna anche senza connessione. | Gioca ora | arcade, browser game, Italy | `brikaya-p1-europe-test` |
| `ja` | Brikaya ブロック崩し | ブラウザで遊び、初回アクセス後はオフラインでも続けられます。 | プレイする | browser arcade, Japan | `brikaya-p1-asia-test` |
| `ko` | Brikaya 블록 브레이커 | 브라우저에서 플레이하고 첫 방문 뒤에는 오프라인으로도 이어가세요. | 플레이 | browser arcade, Korea | `brikaya-p1-asia-test` |
| `id` | Brikaya pemecah blok | Main di browser, simpan progres, lalu lanjutkan setelah kunjungan pertama. | Main sekarang | casual mobile web, Indonesia | `brikaya-p2-sea-test` |
| `vi` | Brikaya phá khối | Chơi trên trình duyệt, lưu tiến trình và quay lại sau lần truy cập đầu. | Chơi ngay | casual mobile web, Vietnam | `brikaya-p2-sea-test` |
| `fil` | Brikaya block breaker | Maglaro sa browser, i-save ang progreso, at bumalik kahit offline. | Maglaro | casual mobile web, Philippines | `brikaya-p2-sea-test` |
| `th` | Brikaya ทำลายบล็อก | เล่นบนเบราว์เซอร์ บันทึกความคืบหน้า และกลับมาเล่นต่อได้ | เล่นเลย | casual mobile web, Thailand | `brikaya-p2-sea-test` |
| `zh-CN` | Brikaya 打砖块 | 在浏览器中游玩，首次访问后也可离线继续。 | 开始游玩 | global Chinese discovery only | `brikaya-zh-global-monitor` |

## 8. Critério “pronto para contratar”

Antes de gastar qualquer valor:

- [ ] responsável leu este documento;
- [ ] plataforma escolhida aceita orçamento dentro do teto disponível;
- [ ] método de pagamento definido fora do Git;
- [ ] campanha fica pausada até revisão final;
- [ ] URL usa preset canônico com UTM;
- [ ] copy revisada por idioma;
- [ ] nenhum pixel/tag/SDK será instalado no jogo;
- [ ] limite total do lote fica igual ou abaixo de R$500;
- [ ] plano registra como pausar, cancelar e conferir cobrança.

## 9. Fontes oficiais usadas nesta rodada

| Tema | Fonte |
| --- | --- |
| Google Ads — criação de conta e possibilidade de criar conta antes de campanha | <https://support.google.com/google-ads/answer/6366720?hl=en> |
| Google Ads — orçamento de conta | <https://support.google.com/google-ads/answer/7054229?hl=en> |
| Meta Ads — cobrança e pagamento | <https://www.facebook.com/business/help/716180208457684> |
| Meta Ads — opções de pagamento | <https://www.facebook.com/business/help/212763688755026> |
| TikTok Ads — mínimos de orçamento | <https://ads.tiktok.com/help/article/budget> |
| Reddit Ads — compra de anúncio | <https://business.reddithelp.com/s/article/How-to-purchase-Reddit-Ads> |
| Reddit Ads — cobrança | <https://business.reddithelp.com/s/article/When-are-you-charged> |
