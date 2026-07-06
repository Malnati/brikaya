# Brikaya downloads — plano e execução zero custo

## Objetivo

Criar a página pública `https://brikaya.com/downloads/` como central oficial de instalação do Brikaya sem pagamento, sem cadastro do jogador e sem coleta de dados pessoais.

## Decisão obrigatória

Brikaya continua 100% gratuito:

- sem compra;
- sem assinatura;
- sem cartão;
- sem download pago;
- sem conta de jogador;
- sem login;
- sem formulário com nome, e-mail, telefone, documento, endereço ou perfil;
- sem envio de pontuação para servidor;
- sem pixel, SDK externo ou rastreamento de loja;
- sem loja paga enquanto não existir nova decisão explícita.

## Escopo entregue

A página `/downloads/` oferece somente caminhos gratuitos:

1. abrir o app web em `https://brikaya.com/`;
2. instalar pelo próprio navegador quando a opção existir;
3. escanear QRCode local para abrir o domínio canônico;
4. adicionar atalho à tela inicial;
5. ler o compromisso de gratuidade, privacidade e progresso local.

## Canais excluídos por pagamento conhecido

Estes canais não entram na UI pública agora:

- Chrome Web Store;
- Google Play;
- Apple App Store.

Motivo: exigem taxa de desenvolvedor/cadastro ou assinatura. Como a regra atual é custo zero absoluto, estes recursos ficam fora da página e fora da submissão.

## Canais bloqueados se exigirem dados pessoais públicos

Qualquer canal gratuito também fica bloqueado se exigir:

- exposição pública de pessoa física;
- documento pessoal público;
- selfie/verificação pessoal;
- cartão;
- plano com overage;
- conta obrigatória para o jogador;
- coleta de dados pessoais do jogador;
- scripts, pixels ou SDKs externos.

## Conteúdo público permitido

A página pode dizer:

- “Jogar agora”;
- “Instalar pelo navegador”;
- “Escaneie para jogar”;
- “Sem conta”;
- “Sem pagamento”;
- “Progresso local”;
- “Jogo offline”.

A página não deve dizer:

- nomes de lojas pagas;
- promessa de publicação em lojas pagas;
- detalhes de infraestrutura, build, framework, hospedagem, repositório ou ferramentas internas;
- pedido de login, cadastro ou dados pessoais.

## Assets

Assets runtime adicionados:

- `/assets/visual/ui/ui-downloads-qr-code.svg` — QRCode local para o domínio canônico;
- `/assets/visual/ui/ui-downloads-arcade-preview.svg` — imagem arcade de apoio;
- `/assets/visual/ui/ui-downloads-play-web.svg` — opção app web;
- `/assets/visual/ui/ui-downloads-install-browser.svg` — opção instalação pelo navegador;
- `/assets/visual/ui/ui-downloads-mobile-qr.svg` — opção QRCode;
- `/assets/visual/ui/ui-downloads-home-shortcut.svg` — opção atalho;
- `/assets/visual/ui/ui-downloads-free-privacy.svg` — compromisso grátis/privado.

Todos são SVG locais, sem raster, sem CDN, sem data URI, sem script embutido e sem fonte externa.

## SEO e offline

A implementação deve manter:

- canonical `https://brikaya.com/downloads/`;
- rotas localizadas para todos os 235 idiomas suportados após a onda 235 local; lista canônica: `pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th`, `zh-CN`, `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`, `mr`, `gu`, `kn`, `ml`, `pa`, `el`, `sv`, `da`, `no`, `fi`, `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`, `is`, `ga`, `cy`, `mt`, `sq`, `mk`, `bs`, `mn`, `tg`, `ky`, `tk`, `be`, `lb`, `eu`, `ca`, `gl`, `oc`, `br`, `mi`, `sm`, `to`, `fj`, `mg`, `so`, `yo`, `ig`, `ha`, `zu`, `xh`, `st`, `tn`, `ts`, `ss`, `ve`, `nso`, `rw`, `rn`, `ln`, `lg`, `ak`, `ee`, `tw`, `sn`, `ny`, `wo`, `ff`, `om`, `ti`, `qu`, `ay`, `gn`, `nah`, `ht`, `pap`, `jv`, `su`, `ceb`, `ilo`, `war`, `haw`, `co`, `sc`, `fur`, `rm`, `lad`, `ast`, `vec`, `lmo`, `pms`, `nap`, `scn`, `sco`, `ps`, `sd`, `ks`, `dv`, `ckb`, `ug`, `yi`, `bo`, `dz`, `ku`, `or`, `as`, `sa`, `mai`, `bho`, `doi`, `mni`, `kok`, `sat`, `lus`, `brx`, `raj`, `hne`, `awa`, `ace`, `bal`, `chr`, `crh`, `tt`, `ba`, `cv`, `sah`, `os`, `ab`, `ady`, `kab`, `tet`, `bug`, `min`, `ban`, `mad`, `bjn`, `hil`, `pam`, `bcl`, `gor`, `mak`, `sas`, `fy`, `fo`, `gd`, `gv`, `kw`, `se`, `kl`, `iu`, `cr`, `oj`, `lkt`, `nv`, `ik`, `ch`, `mh`, `ty`, `bi`, `na`, `gil`, `niu`, `rar`, `pau`, `tpi`, `ho`, `aa`, `av`, `ce`, `kv`, `udm`, `myv`, `mdf`, `mhr`, `mrj`, `tyv`, `alt`, `krc`, `kum`, `lez`, `inh`, `kbd`, `xal`, `nog`, `kaa`, `kjh`, `gag`, `rom`, `sma`, `smj`;
- sitemap com `/downloads/` e versões localizadas;
- título e descrição localizados por idioma, sem fallback inglês em páginas não inglesas;
- hreflang com todos os idiomas e `x-default`;
- fallback/offline após primeiro carregamento;
- QRCode apontando somente para `https://brikaya.com/`.

## Validação esperada

Comando mínimo:

```bash
node --version
make help
npm run test:semantic-file-names
npm run test:svg-assets
npm run build
```

QA público após deploy:

```bash
make cloudflare-deploy
make cloudflare-public-check
make cloudflare-i18n-seo-qa
make cloudflare-offline-pwa-qa
```

Provas visuais esperadas:

- screenshot desktop de `/downloads/`;
- screenshot mobile de `/downloads/`;
- leitura/inspeção do QRCode ou link canônico visível;
- confirmação de ausência de Chrome Web Store, Google Play e Apple App Store na UI.

## Status

Implementação preparada para publicação Cloudflare Pages no domínio canônico. Submissões de lojas pagas não executadas por regra de custo zero.

Publicação validada em 2026-07-06:

- `make cloudflare-deploy` publicou `https://brikaya.com/`.
- `make cloudflare-public-check` passou.
- `make cloudflare-i18n-seo-qa` passou com downloads localizados para todos os 67 idiomas.
- `make cloudflare-offline-pwa-qa` passou.
- `make yandex-indexnow-submit` agora força envio real (`BRIKAYA_INDEXNOW_DRY_RUN=false`) e retornou `200` para 136 URLs com chave redigida.

Status multilíngue obrigatório:

- `/downloads/` publica copy em `pt-BR`;
- páginas prefixadas publicam copy e SEO no respectivo idioma;
- `en` e `en-IN` podem usar copy em inglês;
- todos os demais idiomas devem exibir título, descrição, botões, opções, instruções e compromisso de gratuidade no idioma local.

Buscadores devem receber a versão canônica via sitemap e hreflang; quando houver painel gratuito, a submissão deve ser feita pela aba única `Brikaya webmaster/i18n`.

Status de buscadores em 2026-07-06:

- Google Search Console: sitemap canônico reenviado; painel processado ainda mostra 88 páginas, enquanto o sitemap público já contém 136 URLs.
- Bing Webmaster Tools: 48 URLs da onda 67 submetidas manualmente; painel com 80 URLs submetidas no dia e quota restante 20; Clarity não foi ativado.
- Yandex Webmaster: sitemap em fila; 48 URLs da onda 67 em fila de reindexação manual; IndexNow retornou `200` para 136 URLs.
- Naver Search Advisor: `sitemap.xml` já submetido; coleta manual de novas URLs bloqueada por aviso de formato.
- Brave Search: `https://brikaya.com/sitemap.xml` submetido no formulário gratuito com confirmação `Success`.
- Seznam: formulário oficial exige código/CAPTCHA; nenhuma submissão manual foi feita.
- Baidu Search Resource Platform: cadastro internacional gratuito tentou Brasil na aba fornecida; Baidu retornou que registros de regiões externas não são suportados no momento. Não houve código SMS, CAPTCHA, documento, ICP, pagamento, serviço pago nem registro final de conta; valores pessoais não entram na documentação/evidência.
- DuckDuckGo/Yahoo/Mojeek/Yep/outros: sem painel direto obrigatório no escopo; cobertura por Bing/IndexNow/sitemap/robots/canonical/hreflang/crawlers.


Follow-up fa/he em 2026-07-06:

- `fa` e `he` publicados com `dir="rtl"`, rotas home/downloads, SEO localizado e hreflang.
- `make cloudflare-i18n-seo-qa` validou downloads em 67 idiomas e sitemap de 136 URLs.
- Google Search Console recebeu reenvio do sitemap; Bing recebeu sitemap e quatro URLs `fa/he`; Yandex recebeu IndexNow com 136 URLs; Naver manteve sitemap e tentativa manual sem confirmação durável.
- Clarity segue desinstalado.

## Atualização P13-P20 publicada em 2026-07-06

- Página `/downloads/` publicada em 67 idiomas.
- Onda 67 adicionada: `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`.
- RTL: `ar`, `ur`, `fa` e `he` têm `dir="rtl"`; demais idiomas publicados como `dir="ltr"`.
- `make cloudflare-i18n-seo-qa` validou `title`, canonical, hreflang e sitemap para downloads em todos os 67 idiomas.
- `make yandex-indexnow-submit` enviou 136 URLs e retornou `200` com chave redigida.
- Google/Bing/Yandex/Naver/Brave/Seznam foram rechecados na aba única; detalhes sanitizados estão em `docs/assets/issues/webmaster-i18n-global/evidence/evi-webmaster-i18n-global-status.json`.
- Microsoft Clarity permanece desinstalado por política: não há pacote `@microsoft/clarity`, script `clarity.ms`, tag, pixel ou SDK externo no site publicado.

## Atualização — onda 67 idiomas

- Timestamp: 2026-07-06T16:19:43.073Z
- Novos idiomas publicados nesta onda: `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`.
- Site público: 48 novas rotas home/downloads responderam 200 e `sitemap.xml` publicou 136 URLs.
- Google Search Console: sitemap reenviado; painel ainda mostra 88 páginas antes do novo processamento de 136 URLs.
- Bing Webmaster: 48 URLs da onda 67 enviadas manualmente; quota restante 20.
- Yandex/IndexNow: 136 URLs aceitas com status 200; 48 URLs da onda 67 enviadas para reindexação manual e ficaram `In queue`; sitemap segue em fila de processamento.
- Naver: `sitemap.xml` confirmado; coleta manual de novas URLs bloqueada por formato.
- Brave: `https://brikaya.com/sitemap.xml` submetido com confirmação `Success`.
- Seznam: formulário oficial bloqueado por CAPTCHA/código; não submetido.
- Clarity/analytics/pixel/tag: não instalado; verificação pública sem marcadores.

## Atualização — onda 91 idiomas validada localmente

- Timestamp: 2026-07-06T16:40:29.402Z
- Novos idiomas LTR adicionados nesta branch: `is`, `ga`, `cy`, `mt`, `sq`, `mk`, `bs`, `mn`, `tg`, `ky`, `tk`, `be`, `lb`, `eu`, `ca`, `gl`, `oc`, `br`, `mi`, `sm`, `to`, `fj`, `mg`, `so`.
- Total alvo após publicação: 91 idiomas e 184 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- RTL não mudou nesta onda: `ar`, `ur`, `fa` e `he` continuam como únicos idiomas `dir="rtl"`.
- Clarity/analytics/pixel/tag/SDK externo continuam bloqueados e não foram adicionados.
- Validação local: `node --version`, `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` e `npm run build` passaram; build gerou `localized-seo ok: locales=91, routes=2`.
- Buscadores: nova submissão em Google/Bing/Yandex/Naver/Brave só deve ocorrer após deploy público; Bing tem quota diária limitada e a última rechecagem deixou quota restante 20.

## Atualização operacional — onda 91 publicada em 2026-07-06

- Timestamp: 2026-07-06T16:58:23.340Z
- Produção: `https://brikaya.com/` publicada via Cloudflare Pages; deploy `https://1628c27e.brikaya-live.pages.dev`.
- Sitemap público: 184 URLs; amostras `/is/downloads/`, `/mk/downloads/`, `/ca/downloads/`, `/mi/downloads/` e `/so/downloads/` responderam 200.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` e `make cloudflare-offline-pwa-qa` passaram; report i18n validou 91 hreflangs e 54 rotas de downloads amostradas.
- IndexNow/Yandex: `make yandex-indexnow-submit` retornou `202 accepted-pending` para 184 URLs com chave redigida.
- Chrome aba única: Google recebeu reenvio do sitemap; Bing recebeu 20 URLs até quota 0; Yandex recebeu 48 URLs em fila; Naver confirmou `sitemap.xml`; Brave retornou `Success`; aba final ficou aberta em `https://brikaya.com/sitemap.xml`.
- Pendências: Google ainda mostra 88 páginas até reprocessar; Bing precisa próxima quota para as 28 URLs restantes da onda 91; Yandex/Naver/Brave ficam aguardando processamento; Seznam segue bloqueado por CAPTCHA; Baidu segue bloqueado por cadastro externo; Clarity continua desinstalado.

## Atualização — onda 115 idiomas em implementação

- Próxima onda sem custo e sem telemetria: `yo`, `ig`, `ha`, `zu`, `xh`, `st`, `tn`, `ts`, `ss`, `ve`, `nso`, `rw`, `rn`, `ln`, `lg`, `ak`, `ee`, `tw`, `sn`, `ny`, `wo`, `ff`, `om`, `ti`.
- Total alvo após publicação: 115 idiomas e 232 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- RTL não muda nesta onda: continuam `ar`, `ur`, `fa` e `he`; todos os novos idiomas desta onda são LTR.
- Clarity permanece bloqueado/desinstalado: nenhum pixel, tag, SDK externo ou telemetria foi adicionado.
- Buscadores após deploy: reenviar sitemap no Google, tentar Bing somente se houver quota gratuita, enviar IndexNow/Yandex, confirmar Naver/Brave e manter Baidu/Seznam bloqueados quando exigirem identidade, CAPTCHA, ICP, telefone extra ou custo.
## Atualização — onda 115 validada localmente

- Validação local concluída: `node --version` (`v23.5.0`), `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` e `npm run build` passaram.
- Resultado do build: `localized-seo ok: locales=115, routes=2`.
- Evidência visual local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave115-yo-downloads.png`, rota `/yo/downloads/`, `lang=yo`, `dir=ltr`.
- Próximo estado: PR, merge em `main`, deploy, QA público e rechecagem dos buscadores gratuitos.

## Atualização operacional — onda 115 publicada em 2026-07-06

- `main` recebeu PR #215 e `https://brikaya.com/` foi republicado com 115 idiomas e sitemap público de 232 URLs.
- Validação pós-deploy: `make cloudflare-deploy`, `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa`, `make cloudflare-offline-pwa-qa` e `make yandex-indexnow-submit` passaram.
- Checagens públicas: `/yo/downloads/`, `/ha/downloads/`, `/rw/downloads/` e `/ti/downloads/` responderam 200 com `lang` correto, `dir=ltr`, título/description localizados e sem Clarity/analytics/googletag.
- Google Search Console: sitemap reenviado; painel confirmou “Sitemap enviado”, mas tabela ainda mostra 184 páginas até o Google reprocessar o sitemap de 232 URLs.
- Bing Webmaster Tools: sitemap reenviado e voltou para `Processing`; URL Submission manual está com quota 0 e reset indicado em cerca de 7h.
- Yandex Webmaster: IndexNow aceitou 232 URLs (`202`); 48 URLs da onda 115 foram enviadas manualmente e aparecem `In queue`; quota restante 4.
- Naver Search Advisor: `sitemap.xml` confirmado; coleta manual de nova URL ficou inconsistente e foi interrompida para evitar duplicatas/spam.
- Brave Search: endpoint gratuito usado anteriormente retornou 404 na rechecagem; cobertura segue por sitemap/crawl/IndexNow quando suportado.
- Clarity continua bloqueado/desinstalado: nenhum pixel, tag, analytics, SDK externo ou telemetria foi adicionado.

## Atualização — onda 139 validada localmente

- Timestamp: 2026-07-06T17:45:11.959607Z
- Novos idiomas LTR adicionados nesta branch: `qu, ay, gn, nah, ht, pap, jv, su, ceb, ilo, war, haw, co, sc, fur, rm, lad, ast, vec, lmo, pms, nap, scn, sco`.
- Total alvo após publicação: 139 idiomas e 280 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- RTL não muda nesta onda: `ar`, `ur`, `fa` e `he` continuam como únicos idiomas `dir="rtl"`.
- Screenshot de evidência local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave139-qu-downloads.png`.
- Validação local passou: `node --version` (`v23.5.0`), `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` (58 suites / 369 testes) e `npm run build` (`localized-seo ok: locales=139, routes=2`).
- Clarity/analytics/pixel/tag/SDK externo continuam bloqueados e não foram adicionados.
- Buscadores: rechecagem Google/Bing/Yandex/Naver só deve ocorrer após merge/deploy público; Bing depende de quota gratuita diária; Baidu/Seznam continuam bloqueados quando exigirem identidade pública, CAPTCHA, ICP, telefone extra ou custo.

## Atualização operacional — onda 139 publicada em 2026-07-06

- Timestamp: 2026-07-06T17:56:23.859785Z
- Produção: `https://brikaya.com/` publicada via Cloudflare Pages; deploy `https://27a38c07.brikaya-live.pages.dev`.
- Sitemap público: 280 URLs; amostras `/qu/downloads/`, `/gn/downloads/`, `/jv/downloads/`, `/haw/downloads/` e `/scn/downloads/` responderam 200 com `lang` correto e sem marcadores de Clarity/analytics/tag/pixel.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` e `make cloudflare-offline-pwa-qa` passaram; report i18n validou 139 hreflangs e 64 rotas de downloads amostradas.
- IndexNow/Yandex: `make yandex-indexnow-submit` retornou `202 accepted-pending` para 280 URLs com chave redigida; Yandex manual colocou `qu` e `gn` em fila e esgotou a quota diária.
- Chrome aba única: Google recebeu reenvio do sitemap; Bing recebeu sitemap e ficou em `Processing`; Naver confirmou `sitemap.xml`, mas coleta manual redirecionou para login/callback e foi interrompida; aba final ficou aberta em `https://brikaya.com/sitemap.xml`.
- Pendências: Google/Bing/Yandex/Naver precisam reprocessar; Yahoo/DuckDuckGo dependem de Bing/crawl; Brave sem endpoint direto atual; Baidu/Seznam seguem bloqueados por cadastro externo/CAPTCHA/ICP/custo; Clarity continua desinstalado.


## Atualização — onda 163 validada localmente

- Timestamp: 2026-07-06T18:13:57.111Z
- Novos idiomas adicionados nesta branch: `ps`, `sd`, `ks`, `dv`, `ckb`, `ug`, `yi`, `bo`, `dz`, `ku`, `or`, `as`, `sa`, `mai`, `bho`, `doi`, `mni`, `kok`, `sat`, `lus`, `brx`, `raj`, `hne`, `awa`.
- Total alvo após publicação: 163 idiomas e 328 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- RTL expandido: `ps`, `sd`, `ks`, `dv`, `ckb`, `ug` e `yi` entram como `dir="rtl"` junto de `ar`, `ur`, `fa` e `he`.
- Screenshot de evidência local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave163-dv-downloads.png`.
- Validação local passou: `node --version` (`v23.5.0`), `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` (58 suítes / 370 testes) e `npm run build` (`localized-seo ok: locales=163, routes=2`).
- Clarity/analytics/pixel/tag/SDK externo continuam bloqueados e não foram adicionados.
- Buscadores: rechecagem Google/Bing/Yandex/Naver só deve ocorrer após merge/deploy público; Bing depende de quota gratuita diária; Baidu/Seznam continuam bloqueados quando exigirem identidade pública, CAPTCHA, ICP, telefone extra ou custo.


## Atualização operacional — onda 163 publicada em 2026-07-06

- Timestamp: 2026-07-06T18:26:21.735Z
- Produção: `https://brikaya.com/` publicada via Cloudflare Pages; deploy `https://237f364f.brikaya-live.pages.dev`.
- Sitemap público: 328 URLs; amostras `/ps/downloads/`, `/dv/downloads/`, `/or/downloads/`, `/sat/downloads/` e `/awa/downloads/` responderam 200 com `lang` correto e sem marcadores de Clarity/analytics/tag/pixel.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` e `make cloudflare-offline-pwa-qa` passaram; report i18n validou 163 hreflangs e 69 rotas de downloads amostradas.
- IndexNow/Yandex: `make yandex-indexnow-submit` retornou `202 accepted-pending` para 328 URLs com chave redigida.
- Chrome aba única: Google recebeu reenvio do sitemap; Bing recebeu sitemap e ficou em `Processing`; Bing URL Submission estava com quota 0; Yandex confirmou sitemap em fila e limite diário de reindexação atingido; Naver confirmou `sitemap.xml`, mas `/ps/` não entrou no histórico; Google Cloud Auth foi somente leitura; aba final ficou aberta em `https://brikaya.com/sitemap.xml`.
- Pendências: Google/Bing/Yandex/Naver precisam reprocessar; Yahoo/DuckDuckGo dependem de Bing/crawl; Brave sem endpoint direto atual; Baidu/Seznam seguem bloqueados por cadastro externo/CAPTCHA/ICP/custo; Clarity continua desinstalado.


## Atualização — onda 187 validada localmente

- Timestamp: 2026-07-06T18:36:01.651Z
- Novos idiomas adicionados nesta branch: `ace`, `bal`, `chr`, `crh`, `tt`, `ba`, `cv`, `sah`, `os`, `ab`, `ady`, `kab`, `tet`, `bug`, `min`, `ban`, `mad`, `bjn`, `hil`, `pam`, `bcl`, `gor`, `mak`, `sas`.
- Total alvo após publicação: 187 idiomas e 376 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- RTL expandido: `bal` entra como `dir="rtl"` junto de `ar`, `ur`, `fa`, `he`, `ps`, `sd`, `ks`, `dv`, `ckb`, `ug` e `yi`.
- Screenshot de evidência local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave187-bal-downloads.png`.
- Validação local passou: `node --version` (`v23.5.0`), `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` (58 suítes / 371 testes) e `npm run build` (`localized-seo ok: locales=187, routes=2`).
- Clarity/analytics/pixel/tag/SDK externo continuam bloqueados e não foram adicionados.
- Buscadores: rechecagem Google/Bing/Yandex/Naver só deve ocorrer após merge/deploy público; Bing depende de quota gratuita diária; Baidu/Seznam continuam bloqueados quando exigirem identidade pública, CAPTCHA, ICP, telefone extra ou custo.

## Atualização operacional — onda 187 publicada em 2026-07-06

- Timestamp: 2026-07-06T18:49:54.804Z
- Produção: `https://brikaya.com/` publicada via Cloudflare Pages; deploy `https://055de4e1.brikaya-live.pages.dev`.
- Sitemap público: 376 URLs; amostras `/ace/downloads/`, `/bal/downloads/`, `/chr/downloads/`, `/tt/downloads/` e `/ban/downloads/` responderam 200 com `lang` correto e sem marcadores de Clarity/analytics/tag/pixel.
- RTL público: `/bal/downloads/` validado com `html lang="bal" dir="rtl"`; RTL publicado agora cobre `ar`, `ur`, `fa`, `he`, `ps`, `sd`, `ks`, `dv`, `ckb`, `ug`, `yi` e `bal`.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` e `make cloudflare-offline-pwa-qa` passaram; report i18n validou 187 hreflangs e 74 rotas de downloads amostradas.
- IndexNow/Yandex: `make yandex-indexnow-submit` retornou `202 accepted-pending` para 376 URLs com chave redigida.
- Chrome aba única: Google recebeu reenvio do sitemap; Bing recebeu sitemap e ficou em `Processing`; Bing URL Submission estava com quota 0; Yandex confirmou sitemap em fila, checklist com 4 recomendações e limite diário de reindexação atingido; Naver confirmou `sitemap.xml`, mas `/ace/` não entrou no histórico; aba final ficou aberta em `https://brikaya.com/sitemap.xml`.
- Pendências: Google/Bing/Yandex/Naver precisam reprocessar; Yahoo/DuckDuckGo dependem de Bing/crawl; Brave sem endpoint direto atual; Baidu/Seznam seguem bloqueados por cadastro externo/CAPTCHA/ICP/custo; Clarity continua desinstalado.

## Atualização — onda 211 validada localmente

- Próxima onda sem custo e sem telemetria: `fy`, `fo`, `gd`, `gv`, `kw`, `se`, `kl`, `iu`, `cr`, `oj`, `lkt`, `nv`, `ik`, `ch`, `mh`, `ty`, `bi`, `na`, `gil`, `niu`, `rar`, `pau`, `tpi`, `ho`.
- Total alvo após publicação: 211 idiomas e 424 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- Validação local concluída: `node --version`, `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` (58 suites / 371 testes) e `npm run build` (`localized-seo ok: locales=211, routes=2`).
- Evidência visual local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave211-iu-downloads.png`; rota `/iu/downloads/` respondeu 200, `lang=iu`, `dir=ltr`, título/canonical localizados e sem Clarity/analytics/pixel.
- RTL não muda nesta onda: continuam `ar`, `ur`, `fa`, `he`, `ps`, `sd`, `ks`, `dv`, `ckb`, `ug`, `yi` e `bal`.
- Clarity permanece bloqueado/desinstalado: nenhum pixel, tag, SDK externo ou telemetria foi adicionado.
- Buscadores após deploy: reenviar sitemap no Google/Bing, enviar IndexNow/Yandex, confirmar Naver e manter Baidu/Seznam bloqueados quando exigirem identidade, CAPTCHA, ICP, telefone extra ou custo.


## Atualização — onda 211 publicada em 2026-07-06

- Publicação: PR #219 mergeado em `main` e deploy Cloudflare concluído em `https://brikaya.com/` via `https://df12b7a5.brikaya-live.pages.dev`.
- Escopo publicado: 211 idiomas, 424 URLs no sitemap, hreflang completo e `x-default`.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` (211 hreflangs, 79 páginas de downloads amostradas), `make cloudflare-offline-pwa-qa` e `make yandex-indexnow-submit` (202, 424 URLs).
- Amostras públicas: `/fy/downloads/`, `/se/downloads/`, `/iu/downloads/`, `/nv/downloads/`, `/tpi/downloads/` responderam 200 com `html lang` correto, `dir=ltr`, título localizado e sem Clarity/analytics/pixel.
- Buscadores: Bing aceitou sitemap para processamento; Google ainda mostra 376 até reprocessar o sitemap 424; Yandex mantém sitemap em fila e IndexNow aceitou 424 URLs; Naver confirma sitemap, mas coleta manual `/fy/` segue bloqueada por aviso de formato.
- Clarity: painel existe, mas instalação continua bloqueada; nenhum script, tag, SDK, pixel ou telemetria foi adicionado.
- Aba única Chrome: reutilizada e deixada aberta em `https://brikaya.com/sitemap.xml`.


## Atualização — onda 235 validada localmente

- Próxima onda sem custo e sem telemetria: `aa`, `av`, `ce`, `kv`, `udm`, `myv`, `mdf`, `mhr`, `mrj`, `tyv`, `alt`, `krc`, `kum`, `lez`, `inh`, `kbd`, `xal`, `nog`, `kaa`, `kjh`, `gag`, `rom`, `sma`, `smj`.
- Total alvo após publicação: 235 idiomas e 472 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- Validação local concluída: `node --version`, `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` (58 suites / 371 testes) e `npm run build` (`localized-seo ok: locales=235, routes=2`).
- Evidência visual local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave235-ce-downloads.png`; rota `/ce/downloads/` respondeu 200, `lang=ce`, `dir=ltr`, título/canonical localizados e sem Clarity/analytics/pixel.
- RTL não muda nesta onda; nenhum idioma RTL novo foi adicionado.
- Clarity permanece bloqueado/desinstalado: nenhum pixel, tag, SDK externo ou telemetria foi adicionado.

## Atualização — onda 235 publicada em 2026-07-06

- `https://brikaya.com/downloads/` e rotas localizadas estão publicadas em 235 idiomas com sitemap público de 472 URLs.
- Novos idiomas desta onda: `aa`, `av`, `ce`, `kv`, `udm`, `myv`, `mdf`, `mhr`, `mrj`, `tyv`, `alt`, `krc`, `kum`, `lez`, `inh`, `kbd`, `xal`, `nog`, `kaa`, `kjh`, `gag`, `rom`, `sma`, `smj`.
- Nenhum idioma RTL novo nesta onda; RTL público continua em `ar`, `ur`, `fa`, `he`, `ps`, `sd`, `ks`, `dv`, `ckb`, `ug`, `yi` e `bal`.
- Evidência local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave235-ce-downloads.png` e `evi-brikaya-i18n-seo-wave235-local-preview.json`.
- Evidência pública: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-public-validation.json` validou 235 hreflangs e 84 downloads amostrados.
- Buscadores gratuitos: Google recebeu sitemap completo; Bing recebeu sitemap e ficou em processamento; Yandex recebeu IndexNow 472; Naver confirmou sitemap.
- Limite preservado: sem pagamento, sem loja paga, sem Clarity, sem analytics, sem pixel, sem tag, sem SDK externo e sem coleta de dados pessoais do jogador.


## Atualização — onda 259 validada localmente

- Timestamp: 2026-07-06T21:15:02Z
- Próxima onda sem custo e sem telemetria: `la`, `eo`, `ia`, `ie`, `io`, `vo`, `an`, `mwl`, `ext`, `bar`, `hsb`, `dsb`, `nds`, `frr`, `stq`, `ksh`, `pcd`, `wa`, `li`, `vls`, `zea`, `frp`, `arp`, `mus`.
- Total alvo após publicação: 259 idiomas e 520 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- Validação local concluída: `node --version` (`v23.5.0`), `make help`, `npm run codex-env:check`, `npm run test:semantic-file-names`, `npm run test:svg-assets`, `npm test -- --runInBand` (58 suites / 371 testes) e `npm run build` (`localized-seo ok: locales=259, routes=2`).
- Evidência visual local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave259-la-downloads.png`; rota `/la/downloads/` respondeu 200, `lang=la`, `dir=ltr`, título/canonical localizados e sem Clarity/analytics/pixel.
- RTL não muda nesta onda; nenhum idioma RTL novo foi adicionado.
- Clarity permanece bloqueado/desinstalado: nenhum pixel, tag, SDK externo ou telemetria foi adicionado.
- Buscadores após deploy: reenviar sitemap no Google/Bing, enviar IndexNow/Yandex, confirmar Naver e manter Baidu/Seznam bloqueados quando exigirem identidade, CAPTCHA, ICP, telefone extra ou custo.


## Atualização — onda 259 publicada em 2026-07-06

- Publicação: PR #221 mergeado com os 24 idiomas LTR e PR #222 corrigiu o QA público para validar todos os 259 hreflangs; `https://brikaya.com/` foi republicado via Cloudflare Pages em `https://35327c32.brikaya-live.pages.dev`.
- Escopo publicado: 259 idiomas, 520 URLs no sitemap, hreflang completo e `x-default`.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` (259 hreflangs, 84 páginas de downloads amostradas), `make cloudflare-offline-pwa-qa` e `make yandex-indexnow-submit` (202, 520 URLs) passaram.
- Amostras públicas: `/la/downloads/`, `/eo/downloads/`, `/nds/downloads/`, `/hsb/downloads/` e `/wa/downloads/` responderam 200 com `html lang` correto, `dir=ltr`, título localizado e sem Clarity/analytics/pixel.
- Google Search Console: sitemap reenviado com URL completa; painel confirmou “Sitemap enviado”, mas tabela ainda mostra 472 páginas até o Google reprocessar o sitemap de 520 URLs.
- Bing Webmaster Tools: sitemap reenviado e voltou para `Processing`; total descoberto do painel estava em 487, linha do sitemap em 472, e URL Submission manual está com quota 0.
- Yandex Webmaster: IndexNow aceitou 520 URLs (`202`); sitemap segue em fila de processamento e checklist mostra 3 recomendações até o robô usar o sitemap processado.
- Naver Search Advisor: `sitemap.xml` confirmado; uma tentativa segura de coleta de `/la/` não gerou novo item no histórico, sem CAPTCHA/OTP/custo.
- Clarity: painel indica projeto existente, mas instalação continua bloqueada; nenhum script, tag, SDK, pixel ou telemetria foi adicionado.
- Aba única Chrome: reutilizada e deixada aberta em `https://brikaya.com/sitemap.xml`.
- Pendências: Google/Bing/Yandex/Naver precisam reprocessar; Yahoo/DuckDuckGo dependem de Bing/crawl; Brave sem endpoint direto atual; Baidu/Seznam seguem bloqueados por cadastro externo/CAPTCHA/ICP/custo; Clarity continua desinstalado.


## Atualização — onda 284 validada localmente

- Escopo: 25 novos locales solicitados (`en-AU, en-CA, en-NZ, en-ZA, es-MX, es-AR, es-CO, es-CL, es-PE, pt-AO, pt-MZ, fr-BE, fr-CH, de-AT, de-CH, it-CH, zh-HK, ar-SA, ar-EG, fa-AF, ps-AF, sd-IN, ks-IN, ug-CN, yi-001`), total alvo de 284 idiomas e 570 URLs no sitemap (home + downloads por idioma, mais `/privacy/` e `/terms/`).
- RTL adicional: `ar-SA`, `ar-EG`, `fa-AF`, `ps-AF`, `sd-IN`, `ks-IN`, `ug-CN`, `yi-001`; amostra local confirmou `dir=rtl` em `/ar-SA/downloads/` e `/ug-CN/downloads/`.
- Validação local concluída: `node --version` (`v23.5.0`), `npm test -- --runInBand` (58 suites / 372 testes) e `npm run build` (`localized-seo ok: locales=284, routes=2`).
- Sitemap local: `dist/sitemap.xml` com 570 `<loc>`; `public/sitemap.xml` atualizado para 570 URLs; `robots.txt` mantém `Sitemap: https://brikaya.com/sitemap.xml`.
- Amostras locais de downloads: `/en-AU/downloads/`, `/es-MX/downloads/`, `/pt-AO/downloads/`, `/zh-HK/downloads/`, `/ar-SA/downloads/`, `/ug-CN/downloads/` responderam 200, title/description/canonical localizados e sem Clarity/analytics/pixel/tag.
- Evidência visual local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave284-ar-sa-downloads.png`.
- Evidência JSON local: `docs/assets/issues/i18n-seo-localization/evidence/evi-brikaya-i18n-seo-wave284-local-preview.json`.
- Seznam zero-custo: criado alvo `seznam-indexnow-submit` usando endpoint oficial `https://search.seznam.cz/indexnow`; painel Seznam/Webmaster fica limitado a fluxo gratuito e deve parar em CAPTCHA, OTP, telefone, documento, pagamento ou dado pessoal público. Referências oficiais: `https://o-seznam.cz/napoveda/vyhledavani/seznambot/sitemap-xml/`, `https://o-seznam.cz/napoveda/vyhledavani/seznambot/protokol-indexnow/`, `https://o-seznam.cz/napoveda/vyhledavani/seznam-webmaster/`.
- Clarity permanece desinstalado: nenhum script/tag/pixel/SDK de telemetria foi adicionado.


## Atualização — onda 284 publicada em 2026-07-06

- Publicação: PR #223 mergeado e `https://brikaya.com/` republicado via Cloudflare Pages em `https://19331701.brikaya-live.pages.dev`.
- Escopo publicado: 284 idiomas, 570 URLs no sitemap, hreflang completo e `x-default`.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` (284 hreflangs, 90 páginas de downloads amostradas), `make cloudflare-offline-pwa-qa`, `make yandex-indexnow-submit` (202, 570 URLs) e `make seznam-indexnow-submit` (200, 570 URLs) passaram.
- Amostras públicas: `/en-AU/downloads/`, `/es-MX/downloads/`, `/pt-AO/downloads/`, `/zh-HK/downloads/`, `/ar-SA/downloads/` e `/ug-CN/downloads/` responderam 200 com `html lang` correto, `dir` correto, title localizado e sem Clarity/analytics/pixel.
- Seznam: endpoint oficial `https://search.seznam.cz/indexnow` aceitou 570 URLs com status 200; o script mantém fallback seguro por `curl` quando o `fetch` local sofre timeout de rede, sem imprimir chave.
- Yandex: IndexNow aceitou 570 URLs com status 202.
- Clarity: continua desinstalado; nenhum script, tag, SDK, pixel ou telemetria foi adicionado.
- Pendências: Google/Bing/Yandex/Naver/Seznam precisam reprocessar crawler/painéis; Yahoo/DuckDuckGo dependem de Bing/crawl; Baidu permanece bloqueado por cadastro externo/ICP/documento/custo quando exigido.
