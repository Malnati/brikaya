<!-- docs/dist/projeto-pwa.md -->
# Projeto PWA-only de distribuição internacional, monetização e licenciamento — Brikaya

## 1. Objetivo

Este documento refaz a pesquisa de distribuição internacional de Brikaya considerando **somente PWA/web**. A premissa central é: **Brikaya não será publicado em Google Play, Apple App Store, Microsoft Store ou qualquer outra loja nesta rota**.

Brikaya permanece um jogo casual arcade/PWA, acessado por URL, instalável pelo navegador quando o browser/plataforma permitir, hospedado como site estático e operado com funcionamento offline após o primeiro carregamento. O foco de decisão passa a ser:

1. alcance web/mobile nos países-alvo;
2. compatibilidade de navegador, instalação PWA e service worker;
3. SEO, compartilhamento por link e descoberta orgânica;
4. monetização web futura por AdSense/H5 Games Ads, não por SDK nativo de app store;
5. titularidade de recebimento por pessoa física ou jurídica sem exigir empresa/ID em cada país do público;
6. licenciamento sem custo e sem dependência de loja.

Este documento é a base operacional PWA-only. O documento `docs/dist/projeto.md` continua como histórico amplo de distribuição/monetização/licenciamento, mas decisões de lançamento inicial devem usar este arquivo quando a pergunta for: “o que fazer se Brikaya for apenas PWA?”.

## 2. Premissas PWA-only

| Tema | Decisão PWA-only | Efeito prático |
| --- | --- | --- |
| Canal de distribuição | URL pública, SEO, links diretos, comunidades, diretórios web e instalação pelo navegador. | Não depende de aprovação de loja nem de app bundle nativo. |
| Plataforma inicial | Web/PWA em domínio próprio e Cloudflare Pages. | Manter `brikaya.com` como destino principal. |
| Loja de app | Fora de escopo. | Não considerar taxa, ranking, ASO ou aprovação de Google Play/App Store na decisão inicial. |
| Instalação | Navegador pode oferecer instalação quando critérios PWA forem atendidos. | Instalação é vantagem, não requisito para jogar. |
| Offline | Jogo deve funcionar offline após primeiro carregamento. | Ads reais, métricas externas e consentimento online precisam ser opcionais e não podem quebrar gameplay offline. |
| Monetização | Web ads futuros: AdSense e, se aprovado, H5 Games Ads. | AdMob/SDK nativo ficam fora da rota PWA-only. |
| Impulsionamento pago | Preparado como caminho externo, bloqueado até autorização explícita de gasto. | Google Ads, Meta Ads, Reddit Ads e TikTok Ads podem ter cadastros/rascunhos sem cobrança; teto futuro documentado: R$500. |
| Licenciamento | Código, assets, textos e traduções precisam permitir uso comercial gratuito. | Sem asset pago, royalty, assinatura ou licença NC/ND. |
| Dados sensíveis | Nenhum ID real, conta privada, credencial ou valor de ambiente no Git. | Documentar só nomes lógicos e decisões. |

## 3. O que muda ao remover lojas da decisão

| Critério antigo com lojas | Critério PWA-only substituto | Decisão para Brikaya |
| --- | --- | --- |
| Downloads em app stores | Alcance web/mobile, tráfego orgânico, links compartilháveis e uso em navegador. | Medir sessões web, retenção e instalação PWA, não ranking de loja. |
| ASO de loja | SEO, Search Console, sitemap, metadados HTML e páginas localizadas. | Priorizar títulos/descrições por idioma e indexação. |
| Taxa de publicação | Hospedagem estática sem custo adicional já adotada no projeto. | Sem taxa inicial de loja. |
| Review de loja | Políticas web/ads/privacidade e qualidade da página. | Revisar AdSense, consentimento e conteúdo, não store review. |
| SDK nativo de anúncios | AdSense/H5 Games Ads no documento web. | Sem AdMob em PWA puro. |
| País da loja | Países de audiência, idioma, consentimento e disponibilidade de AdSense. | Não exige empresa/ID local em cada país-alvo. |
| App Campaigns | SEO, posts orgânicos, diretórios gratuitos e links de comunidade. | Campanha paga fica bloqueada. |

## 4. Fontes de pesquisa PWA-only

A pesquisa PWA-only usa quatro grupos de evidência:

1. **Capacidade web/PWA**: installability, web app manifest, service worker, experiência offline e alcance por URL.
2. **Adoção digital/mobile**: população conectada, conexões móveis e uso de navegador/smartphone.
3. **Mercado gamer/ads**: receita gamer como proxy de valor de audiência, não como indicador de loja.
4. **Operação web legal**: AdSense/H5 availability, consentimento por região, titularidade de pagamentos e licenciamento.

| Fonte | Uso nesta decisão |
| --- | --- |
| [web.dev — Progressive Web Apps](https://web.dev/learn/pwa/progressive-web-apps) | Define PWA como web app instalável, confiável e com uma base de código alcançando qualquer dispositivo compatível. |
| [web.dev — Install criteria](https://web.dev/articles/install-criteria) | Critérios de instalação e promoção pelo navegador. |
| [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) | Instalação de PWA como experiência de app sem loja obrigatória. |
| [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) | Publicação estática por upload direto, compatível com PWA. |
| [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | Descoberta por busca orgânica. |
| [Google Search Central — Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | Sitemaps para descoberta de URLs e versões localizadas. |
| [Google Search Central — Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions) | Regras de `hreflang` para páginas localizadas equivalentes. |
| [Google Search Central — Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | Definir URL canônica preferida e evitar duplicação entre hosts/rotas. |
| [Google Search Central — Mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing) | Priorizar conteúdo equivalente e usável no mobile para indexação. |
| [Google Search Console](https://search.google.com/search-console/about) | Monitorar indexação, consultas e problemas de páginas. |
| [AdSense availability](https://support.google.com/adsense/answer/13402307?hl=en) | Países aceitos para cadastro e operação AdSense, incluindo Brasil e Paraguai. |
| [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en) | Requisitos de site/conteúdo para monetização web. |
| [AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170?hl=en) | Monetização de jogos HTML5 via site/página/WebView, com API única. |
| [Ad Placement API — HTML5 game structure](https://developers.google.com/ad-placement/docs/html5-game-structure) | Estrutura de jogo HTML5/canvas com AdSense e Ad Placement API. |
| [European regulations messages](https://support.google.com/admanager/answer/10076805?hl=en) | Consentimento EEA/UK/CH antes de ads reais. |
| [Google Ads Traffic Quality](https://www.google.com/ads/adtrafficquality/publishers/) | Qualidade de tráfego, cliques inválidos e posicionamento seguro. |
| [DataReportal Global Digital 2026](https://datareportal.com/reports/digital-2026-global-overview-report) | Sinal de escala global de internet/smartphones. |
| [DataReportal Brazil 2026](https://datareportal.com/reports/digital-2026-brazil) | Sinal de alcance mobile/web no Brasil. |
| [DataReportal USA 2026](https://datareportal.com/reports/digital-2026-united-states-of-america) | Sinal de penetração de internet e alto valor web nos EUA. |
| [DataReportal India 2026](https://datareportal.com/reports/digital-2026-india) | Sinal de escala web/mobile para Índia. |
| [DataReportal Indonesia 2026](https://datareportal.com/reports/digital-2026-indonesia) | Sinal de volume mobile/web no Sudeste Asiático. |
| [StatCounter Mobile Browser Market Share](https://gs.statcounter.com/browser-market-share/mobile/worldwide) | Sinal de concentração global em navegadores mobile, importante para PWA. |
| [Newzoo top countries by game revenues](https://newzoo.com/resources/rankings/top-10-countries-by-game-revenues) | Proxy de valor gamer por país, sem decidir por app stores. |
| [Sensor Tower State of Mobile 2026](https://sensortower.com/blog/state-of-mobile-2026) | Sinal de consumo mobile/jogos, usado com cautela porque é mais app/mobile que web. |
| [Liftoff/Singular Casual Gaming Apps Report](https://liftoff.ai/2025-casual-gaming-apps-report/) | Sinal de comportamento casual/hypercasual, usado para UX e retenção, não para app store. |

## 5. Pesquisa de mercado reinterpretada para PWA

### 5.1. Receita gamer não basta para PWA

Ranking de receita gamer ajuda a estimar valor potencial da audiência e demanda publicitária, mas não decide a rota PWA. Para PWA, um país de alta receita só é prioridade se também tiver:

- acesso estável ao site;
- compatibilidade com navegadores modernos;
- idioma localizado;
- AdSense/ads disponíveis;
- regras de consentimento tratáveis;
- caminho orgânico de descoberta por busca/link/comunidade;
- tráfego sem compra obrigatória.

Por isso, China continua fora da primeira onda PWA, mesmo sendo grande mercado gamer: a rota Google/Cloudflare/AdSense e a distribuição web aberta exigiriam análise regulatória e operacional separada.

### 5.2. Downloads de app store deixam de ser métrica principal

Relatórios de mobile apps continuam úteis para entender comportamento casual, sessões curtas e retenção, mas a métrica PWA inicial deve ser:

| Métrica PWA | Por que importa |
| --- | --- |
| Usuários por país | Mede alcance real do site. |
| Sessões por idioma | Mostra quais localizações geram uso. |
| Retenção por retorno ao URL/PWA instalada | Substitui download de loja como sinal de adoção. |
| Instalação PWA quando disponível | Mede profundidade de engajamento. |
| Busca orgânica e links de referência | Mostram aquisição zero-custo. |
| Tempo de jogo e fases jogadas | Mostram qualidade da audiência para ads futuros. |
| eCPM futuro por país | Só medir depois de ads aprovados; antes disso é hipótese. |

### 5.3. Compatibilidade PWA e browser importam mais que store share

PWA depende de navegador e plataforma. Chrome/Android tende a ser rota forte para instalação PWA; Safari/iOS oferece suporte PWA com limitações e comportamento próprio; desktop pode instalar por Chrome/Edge e equivalentes. Portanto:

- países Android/mobile-first tendem a ser bons para PWA por link;
- países iOS-heavy podem ter alto valor, mas exigem instrução clara de “Adicionar à tela inicial” e QA Safari;
- desktop pode ser relevante para EUA/Europa/Reino Unido, mas Brikaya deve priorizar mobile layout;
- instalação não deve bloquear jogo: qualquer pessoa deve jogar no navegador sem instalar.

## 6. Matriz PWA-only de países-alvo

| Prioridade | País/região | Locale | Objetivo PWA principal | Justificativa PWA-only | Distribuição PWA | Ads/consentimento |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Brasil | `pt-BR` | Origem, validação de SEO, comunidade inicial e idioma base. | Alto acesso mobile/web, país disponível em AdSense, controle linguístico local. | `brikaya.com`, SEO, Search Console, posts orgânicos, links WhatsApp/Redes. | Ads futuros via AdSense/H5; LGPD e política de privacidade antes de ads reais. |
| P0 | Estados Unidos, Canadá, Reino Unido | `en` | Alto valor de audiência e base internacional em inglês. | Alta penetração de internet; EUA/Reino Unido/Canadá são mercados relevantes de games e ads. | Landing em inglês, metadados, comunidades web games, SEO. | Reino Unido exige consentimento compatível; EUA exigem cuidado com menores e privacidade estadual. |
| P0 | México e LATAM hispânica | `es-419` | Escalar com uma localização espanhola regional. | Boa adequação para link/PWA, idioma reutilizável e países disponíveis para AdSense. | SEO em espanhol LATAM, posts orgânicos, diretórios gratuitos. | Privacidade por país; sem prometer recompensa financeira ao jogador. |
| P0 | Índia | `en-IN`; evolução `hi-IN` | Testar escala mobile/web em mercado gigante. | DataReportal indica grande base de internet; PWA por link reduz fricção de loja. | Inglês indiano primeiro, SEO e comunidades gratuitas. | Ads futuros com cuidado extra para público infantil/misto e consentimento aplicável. |
| P1 | Alemanha | `de` | Mercado europeu de alto valor para ads e web. | Alto valor gamer e boa estrutura web; exige localização séria. | Página alemã, SEO local, QA de consentimento. | EEA exige CMP/consentimento antes de ads reais. |
| P1 | França | `fr` | Expansão europeia com boa audiência web. | Alto valor de ads/jogos e idioma independente. | Página francesa, metadados e comunidades gratuitas. | EEA/CNIL e consentimento antes de ads reais. |
| P1 | Itália | `it` | Complementar Europa do top gamer com PWA. | Mercado gamer relevante e rota web viável. | Página italiana e SEO. | EEA/CMP antes de ads reais. |
| P1 | Japão | `ja` | Alto valor gamer e potencial de eCPM, com localização dedicada. | Newzoo aponta alta receita; PWA precisa vencer barreira cultural/idioma. | Página japonesa, QA mobile/desktop, divulgação orgânica cuidadosa. | Ads só após revisão de copy, privacidade e idade. |
| P1 | Coreia do Sul | `ko` | Alto valor gamer e cultura mobile forte. | Mercado gamer premium, mas exige tradução e adequação cultural. | Página coreana e SEO/local communities. | Ads só após revisão local e consentimento aplicável. |
| P2 | Indonésia | `id` | Volume mobile/web e teste SEA. | DataReportal aponta grande escala mobile; Sensor Tower indica alto volume de jogos mobile regional. | Página indonésia, social orgânico, diretórios/comunidades gratuitas. | Ads futuros podem ter eCPM menor; priorizar retenção antes de monetizar. |
| P2 | Vietnã | `vi` | Volume mobile e audiência casual. | Mercado mobile forte; PWA reduz fricção e evita loja. | Página vietnamita após validação P0/P1. | Revisão linguística/local antes de ads reais. |
| P2 | Filipinas | `en`; futuro `fil` | Entrar com inglês e evoluir por dados. | Inglês reduz custo inicial; SEA tem grande volume mobile. | Landing em inglês, depois `fil` se houver tração. | Atenção a público jovem e políticas de privacidade. |
| P2 | Tailândia | `th` futuro | Avaliar SEA adicional por dados reais. | Mercado mobile relevante, mas tradução exige revisão local. | Só após P0/P1/P2 inicial. | Ads e consentimento após QA local. |
| Fora da primeira onda | China | `zh-CN` futuro | Não priorizar PWA Google/Cloudflare inicial. | Barreiras operacionais/regulatórias e rota Google/AdSense incerta. | Exige estratégia separada. | Não ativar sem parecer local e infraestrutura própria. |

## 7. Plano PWA-only de distribuição

### 7.1. Canais permitidos sem loja

| Canal | Ação | Custo | Observação |
| --- | --- | --- | --- |
| URL direta | Usar `https://brikaya.com/` como destino canônico. | Sem custo adicional obrigatório. | Principal canal PWA. |
| SEO | Título, descrição, canonical, sitemap, conteúdo local por idioma. | Sem custo direto. | Substitui ASO de loja. |
| Search Console | Verificar domínio, inspecionar URL, enviar sitemap. | Sem custo direto. | Monitorar indexação por país/consulta. |
| Links sociais | Posts orgânicos por idioma/país. | Sem custo direto. | Evitar spam e tráfego inválido. |
| Comunidades | Web games, indie games, PWA/web dev, comunidades locais. | Sem custo direto. | Respeitar regras de cada comunidade. |
| Diretórios web gratuitos | Submeter somente onde não houver cobrança ou licença restritiva. | Sem custo direto. | Validar qualidade para evitar tráfego inválido. |
| QR/link físico | Cartão, apresentação ou evento local. | Custo só se imprimir. | Pode ser útil no Brasil/Paraguai. |
| PWA install prompt | Deixar navegador oferecer instalação quando critérios forem cumpridos. | Sem custo direto. | Não forçar instalação antes de jogar. |
| Impulsionamento externo preparado | Criar rascunhos e links com UTM para serviços de marketing sem ativar campanha. | Sem custo até o ponto anterior a cartão/saldo/cobrança. | Sem publicidade no jogo; orçamento futuro máximo R$500 em `docs/dist/pendencias-publicacao-impulsionamento.md`. |

### 7.2. Canais fora de escopo

| Canal | Motivo |
| --- | --- |
| Google Play | Loja fora da rota PWA-only. |
| Apple App Store | Loja fora da rota PWA-only. |
| AdMob | SDK/app nativo fora da rota PWA-only. |
| App Campaigns | Foco app store/app install; fora da rota inicial sem loja. |
| Loja alternativa APK | Fora do objetivo: PWA por URL. |
| Compra de tráfego | Custo bloqueado até autorização explícita; preparação documental e links UTM são permitidos. |

## 8. Plano PWA-only de i18n e SEO

Esta seção registra o plano e o estado operacional de i18n/SEO. Em 2026-07-03, a primeira implementação PWA-only/offline-first foi publicada no domínio canônico, sem anúncios reais, scripts externos, métricas externas, credenciais versionadas ou serviço pago.

### 8.1. Auditoria atual da base PWA

| Área | Estado atual observado | Decisão documental |
| --- | --- | --- |
| `index.html` | `html lang="pt-BR"`, título/descrição/canonical, Open Graph, Twitter Card e `hreflang` para 15 locales no domínio canônico. | Manter geração localizada no build e bloquear URLs `.pages.dev` em SEO público. |
| `manifest.webmanifest` | `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`, `scope` e ícone SVG local já existem. | Base PWA está presente; futuras descrições/screenshot metadata precisam seguir assets próprios e offline. |
| Domínio público | Canônico operacional é `https://brikaya.com/`. | Usar apenas domínio canônico em material público; URLs de preview/Pages são evidência técnica, não destino público. |
| Conteúdo localizado | Rotas públicas equivalentes existem para `pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th` e `zh-CN`. | Manter catálogo local/offline, preferência local e QA publicado antes de ampliar copy. |
| Ads/Search Console | Search Console está verificado por DNS TXT e o sitemap localizado foi reenviado; não há anúncios reais, IDs de publisher, tags pagas ou scripts externos. | Aguardar reprocessamento do Google; manter bloqueio para ads, CMP e custos sem tarefa própria aprovada. |

### 8.2. Fases de i18n PWA-only

| Fase | Locales | Entrega PWA | Critério para avançar |
| --- | --- | --- | --- |
| P0 origem | `pt-BR` | Definir texto-base de produto, UX copy e metadados em português brasileiro. | Texto completo, original, sem marca de concorrente e validado no domínio publicado. |
| P0 internacional | `en`, `es-419` | Catálogo local/offline, metadados e rota pública por idioma. | Fallback `en`, revisão humana mínima e QA publicado. |
| P0 Índia | `en-IN`, `hi-IN` | Rotas públicas e metadados iniciais para validação zero-custo. | Dados reais de acesso/retenção antes de qualquer expansão paga ou campanha. |
| P1 alto valor | `de`, `fr`, `it`, `ja`, `ko` | Rotas públicas e catálogo inicial para SEO orgânico. | Dados P0, revisão cultural e validação de consentimento antes de ads. |
| P2 volume SEA | `id`, `vi`, `fil`, `th` | Rotas públicas e catálogo inicial para teste orgânico. | Dados de acesso/retenção e revisão local mínima antes de campanhas ou ads. |

Regras permanentes de i18n:

- “Brikaya” não traduz.
- Catálogo deve ser local/offline, tipado e versionado no repositório; não carregar tradução de serviço externo em runtime.
- `en` é fallback obrigatório quando chave ou locale não estiver pronto.
- `pt-BR` preserva intenção original, mas traduções devem adaptar tarefa, tom e contexto local.
- Idioma inicial segue prioridade fixa: rota localizada, preferência manual salva, região aproximada quando consentida, lista completa de idiomas do navegador, fuso horário do navegador como inferência offline de país e, por último, `pt-BR`; não usar IP, range de IP, serviço externo, biblioteca GeoIP em runtime ou recurso pago.
- A região aproximada para idioma deve ser opcional, consentida em texto próprio, processada só no aparelho, sem salvar coordenadas, sem envio externo, sem bloquear jogo em caso de negativa e com opção de revogação no menu.
- Preferência manual de idioma deve persistir localmente, sem conta obrigatória, e vencer a detecção automática do navegador/fuso; detecção automática não deve gravar uma preferência manual nem preservar locales legados sem marcador manual.
- `html lang` deve refletir idioma ativo para acessibilidade, navegação e ferramentas do navegador.
- QA deve validar que nenhum texto visível expõe infraestrutura, cache, framework, provedor, credencial, build ou ferramenta interna.
- QA deve ocorrer no domínio publicado, porque PWA, service worker, cache e instalação dependem do comportamento real do navegador.

### 8.3. Regras de SEO PWA-only

| Tema | Regra para PR futuro | Bloqueio |
| --- | --- | --- |
| Canonical | A URL pública preferida é `https://brikaya.com/`. | Não usar host `.pages.dev` como destino público, canonical ou URL compartilhada em material final. |
| Título | Título deve combinar marca + benefício do jogo por idioma. | Não usar nomes de concorrentes como keyword promocional. |
| Description | Descrição deve explicar o jogo em linguagem simples, por idioma. | Não prometer dinheiro, recompensa externa, prêmio ou vantagem enganosa. |
| Open Graph/Twitter | Metadados sociais devem apontar para assets próprios e URL canônica. | Não usar imagem remota, raster runtime proibido ou material de terceiro. |
| Sitemap | Criar sitemap somente com URLs públicas reais e canônicas. | Não listar rotas inexistentes, preview URLs ou páginas não revisadas. |
| Robots | Permitir indexação do domínio canônico quando pronto e apontar para sitemap. | Não bloquear o canônico por engano. |
| `hreflang` | Usar apenas quando houver URLs localizadas equivalentes, revisadas e publicadas. | Não declarar `hreflang` para catálogo interno sem página/rota pública correspondente. |
| Mobile-first | Conteúdo e ações importantes devem existir e funcionar no mobile. | Não depender de conteúdo só desktop para indexação ou primeira experiência. |
| Search Console | Verificar domínio e enviar sitemap quando SEO mínimo estiver publicado. | Não versionar arquivo/token real de verificação sem autorização e sem `.env`/segredo tratado. |

### 8.4. Entrega mínima de SEO implementada

A primeira implementação de SEO ficou pequena e testável:

1. `index.html` recebe `lang`, título, description, canonical, metadados sociais e `hreflang`;
2. `public/robots.txt` e `public/sitemap.xml` usam somente URLs canônicas reais;
3. `https://brikaya.com/` permanece como único destino público;
4. nenhum script externo, analytics, tag de ads ou credencial foi adicionado;
5. `npm run build` e QA publicado validam o domínio canônico;
6. Search Console foi conferido no Chrome autenticado e o sitemap localizado foi reenviado;
7. primeiro acesso sem rota ou preferência manual salva pode usar região aproximada quando consentida; se a permissão for negada, indisponível ou inconclusiva, usa todos os valores de `navigator.languages`, depois `navigator.language`, fuso horário local/offline quando o idioma não for suportado e `pt-BR` somente como fallback final.

### 8.5. Critérios de aceite para i18n + SEO

- `pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th` e `zh-CN` têm catálogo local/offline antes de ativar seleção pública de idioma.
- `html lang` acompanha o idioma ativo.
- Rota localizada vence preferência manual salva, preferência manual vence região consentida, região consentida vence idioma do navegador, idioma suportado vence fuso horário e idioma/fuso não suportados caem em `pt-BR`.
- Fallback `en` funciona sem quebrar UI, HUD, menus, toasts, recordes ou logs.
- Título, description, canonical, Open Graph, sitemap e robots usam somente domínio canônico e assets próprios.
- `hreflang` aparece somente para URLs localizadas reais publicadas no domínio canônico.
- Nenhum texto público usa marcas de concorrentes, nomes de lojas, promessa de recompensa ou copy copiada.
- Nenhuma implementação futura insere IDs de publisher, atributos de slot, chamadas de anúncios, chaves, tokens, arquivos de verificação reais ou scripts remotos sem tarefa própria aprovada.
- Build, testes relevantes e QA publicado passam antes de considerar i18n/SEO prontos.

## 9. Plano PWA-only de monetização

### 9.1. Resposta direta

É possível monetizar um jogo PWA/web com anúncios, mas Brikaya só deve ativar ads reais depois de:

1. aprovação AdSense do site;
2. eventual aprovação/acesso a H5 Games Ads;
3. decisão explícita de exceção à regra offline: jogo offline; anúncios online opcionais;
4. consentimento e privacidade onde exigidos;
5. modo `ads_disabled`/`ads_test`/`ads_live` separado;
6. política contra cliques próprios e tráfego inválido;
7. titularidade de pagamento definida: pessoa física ou pessoa jurídica.

Estado atual da base de privacidade: Brikaya pode exigir aceite local para jogar offline, sem anúncios reais, sem CMP e sem chamadas externas. Essa base não autoriza monetização; ads reais continuam pendentes de aprovação, estados próprios e consentimento compatível com o país.

Estado atual da sugestão de idioma por região: Brikaya pode pedir permissão opcional de região aproximada para sugerir idioma, desde que coordenadas não sejam salvas nem enviadas, a negativa não bloqueie o jogo e a política pública de privacidade/termos explique finalidade, retenção e revogação.

### 9.2. Formatos PWA permitidos no plano

| Formato | PWA-only? | Decisão |
| --- | --- | --- |
| AdSense display na página | Sim, se site aprovado. | Futuro; não implementar agora. |
| H5 Games Ads via Ad Placement API | Sim, se acesso/aprovação. | Melhor encaixe para jogo HTML5/canvas; futuro. |
| Interstitial entre fases | Sim, em tese. | Só em pausas naturais; nunca durante gameplay contínuo. |
| Rewarded ads | Sim, em tese via H5, se permitido/aprovado. | Usar com cuidado; não vender vantagem enganosa. |
| AdMob nativo | Não para PWA puro. | Fora de escopo. |
| Ads offline | Não. | Ads reais dependem de rede; offline deve ocultar/desativar. |

### 9.3. Conflito offline x ads

A regra atual do projeto exige PWA 100% offline após primeiro carregamento. Ads reais exigem rede. Portanto, a política correta para PWA-only é:

> O jogo principal continua offline após primeiro carregamento; anúncios são opcionais, online-only, consentidos quando exigido e nunca necessários para jogar.

Estado atual: nenhuma área visual de anúncio deve ser renderizada. Qualquer placeholder futuro exige tarefa própria aprovada e QA publicado para não bloquear jogo, layout ou offline.

### 9.4. PF/PJ e países-alvo

Para PWA, o país do jogador não obriga empresa local. O que importa é:

- país real do titular da conta de pagamento;
- tipo de conta: individual ou organization;
- documentação, endereço, banco/forma de recebimento e dados fiscais;
- políticas dos países onde anúncios são exibidos.

| Pergunta | Resposta PWA-only |
| --- | --- |
| Dá para receber como pessoa física? | Sim, em tese, via conta individual, se país/documentos/pagamentos forem aceitos. |
| Pessoa física paraguaia? | Sim, em tese; Paraguai consta na disponibilidade AdSense/AdMob, mas exige validação documental/fiscal local. |
| Pessoa física brasileira? | Sim, em tese; Brasil consta na disponibilidade AdSense, mas residente fiscal brasileiro deve avaliar Carnê-Leão/declaração. |
| EAS paraguaia? | Sim, em tese, como organização, se documentos/RUC/representante/pagamento forem aprovados. |
| Precisa empresa nos EUA/Japão/Europa/Índia/SEA? | Não como regra PWA; só considerar se houver operação local, contrato, filial, obrigação regulatória ou estratégia fiscal. |

## 10. Plano PWA-only de licenciamento

A rota PWA-only não reduz obrigações de licenciamento. Ela só remove loja/app review da primeira etapa.

| Área | Regra |
| --- | --- |
| Código | Manter MIT e preservar `LICENSE`. |
| Assets runtime | Apenas criação própria, CC0/domínio público equivalente ou licença permissiva gratuita para uso comercial. |
| Assets recusados | NC, ND, royalty, assinatura, compra obrigatória, watermark, streaming-only, uso restrito por plataforma, marca/personagem de terceiro. |
| Sons | Usar só sons próprios ou licenciados para uso comercial gratuito. |
| Traduções | Texto original; não copiar descrições de concorrentes. |
| Marcas | Não usar nomes de concorrentes em UI, SEO, anúncio ou descrição pública. |
| Mecânica | Ideia de jogo não é o problema; expressão visual/sonora/textual/código deve ser própria. |
| PWA metadata | Nome, descrição, ícones e screenshots precisam ser próprios e legalmente utilizáveis. |

## 11. Roadmap PWA-only

| Fase | Objetivo | Entrega | Bloqueio |
| --- | --- | --- | --- |
| 0 | Documento PWA-only | `docs/dist/projeto-pwa.md` com escopo PWA-only, i18n/SEO, monetização e licenciamento. | Nenhum após merge do PR documental; não implementa runtime. |
| 1 | SEO mínimo PWA | Title/description/canonical/Open Graph/sitemap/robots/Search Console publicados e validados. | Sem ads reais, sem IDs sensíveis e sem URLs `.pages.dev` públicas. |
| 2 | i18n P0/P1/P2 inicial | 15 locales com rotas públicas, fallback `en`, `html lang`, preferência local e catálogo offline. | QA publicado obrigatório; revisão cultural continua antes de ads ou campanhas. |
| 3 | Medição zero-custo permitida | Decidir métricas locais/privacidade sem serviço pago. | Não quebrar offline. |
| 4 | Preparar impulsionamento externo | Documentar pendências, orçamento R$500, links UTM e cadastros possíveis sem contratação. | Parar antes de cartão, saldo, campanha ativa ou cobrança. |
| 5 | Preparar ads PWA | Base local de privacidade sem ads reais; política offline+ads, CMP quando exigida e estados `ads_disabled`/`ads_test`/`ads_live` em etapa futura. | Aprovação explícita necessária. |
| 6 | Solicitar AdSense/H5 | Site maduro, conteúdo original, privacidade, titularidade PF/PJ definida. | Acesso não garantido. |
| 7 | Ativar ads reais | Só após aprovação, consentimento e QA publicado. | Nunca como dependência para jogar. |
| 8 | Otimizar i18n por dados | Ajustar copy, países e futuras páginas por dados reais de acesso/retensão. | Sem campanha paga e sem ads reais sem aprovação própria. |

## 12. Decisão recomendada PWA-only

Para decidir agora, sem loja, a recomendação é:

1. **Rota de produto:** PWA/web em `brikaya.com`, sem app store.
2. **Rota inicial de países:** Brasil, inglês global, LATAM espanhol e Índia.
3. **Rota de crescimento:** Europa/Japão/Coreia por valor; Indonésia/Vietnã/Filipinas/Tailândia por volume.
4. **Rota de monetização:** sem ads reais no lançamento inicial; preparar AdSense/H5 depois de SEO+i18n+privacidade.
5. **Rota PF/PJ:** definir titularidade pelo país fiscal real do recebedor, não pelo país da audiência.
6. **Rota legal:** manter assets/textos/código próprios ou permissivos para uso comercial gratuito.
7. **Rota de prova:** decisão deve ser revisada por dados reais do PWA publicado, não por ranking de loja.

## 13. Critérios de aceite deste documento

- O arquivo existe em `docs/dist/projeto-pwa.md`.
- A primeira linha é `<!-- docs/dist/projeto-pwa.md -->`.
- O documento declara que Google Play, App Store e outras lojas estão fora de escopo.
- Pesquisa e matriz de países são reinterpretadas para PWA/web.
- O plano usa SEO, Search Console, link direto, comunidades e instalação por navegador como distribuição principal.
- A seção de i18n/SEO separa auditoria atual, regras permanentes, canonical, `hreflang`, sitemap, robots e Search Console.
- O documento declara que a implementação atual não adiciona ads, scripts externos, métricas externas ou credenciais versionadas.
- O documento referencia a preparação de impulsionamento externo sem publicidade no jogo e sem contratação automática.
- Monetização é AdSense/H5 Games Ads futura, sem AdMob ou SDK nativo.
- O conflito offline x ads é explicado como anúncios online opcionais.
- PF/PJ e Brasil/Paraguai são tratados como titularidade de pagamento, não como exigência por país-alvo.
- Licenciamento permanece zero-custo e comercialmente seguro.
- Fontes PWA/web/ads/SEO estão linkadas.
- Nenhum ID real, credencial, conta privada, chave ou valor de ambiente foi incluído.
