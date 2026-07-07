# Brikaya — registros, descoberta e indexação zero custo

## Objetivo

Manter `https://brikaya.com/` descobrível por buscadores sem custo, sem cobrança, sem plano pago, sem scripts externos de telemetria e sem exposição de identidade pessoal pública.

## Estado operacional em 2026-07-06

- Domínio canônico público: `https://brikaya.com/`.
- Publicação padrão: Cloudflare Pages Direct Upload do diretório `dist/`.
- Sitemap canônico: `https://brikaya.com/sitemap.xml`.
- Robots canônico: `https://brikaya.com/robots.txt` com diretiva `Sitemap`.
- Rotas públicas indexáveis: home e `/downloads/` em 235 idiomas após a onda 235 local: `pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th`, `zh-CN`, `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`, `mr`, `gu`, `kn`, `ml`, `pa`, `el`, `sv`, `da`, `no`, `fi`, `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`, `is`, `ga`, `cy`, `mt`, `sq`, `mk`, `bs`, `mn`, `tg`, `ky`, `tk`, `be`, `lb`, `eu`, `ca`, `gl`, `oc`, `br`, `mi`, `sm`, `to`, `fj`, `mg`, `so`, `yo`, `ig`, `ha`, `zu`, `xh`, `st`, `tn`, `ts`, `ss`, `ve`, `nso`, `rw`, `rn`, `ln`, `lg`, `ak`, `ee`, `tw`, `sn`, `ny`, `wo`, `ff`, `om`, `ti`, `qu`, `ay`, `gn`, `nah`, `ht`, `pap`, `jv`, `su`, `ceb`, `ilo`, `war`, `haw`, `co`, `sc`, `fur`, `rm`, `lad`, `ast`, `vec`, `lmo`, `pms`, `nap`, `scn`, `sco`, `ps`, `sd`, `ks`, `dv`, `ckb`, `ug`, `yi`, `bo`, `dz`, `ku`, `or`, `as`, `sa`, `mai`, `bho`, `doi`, `mni`, `kok`, `sat`, `lus`, `brx`, `raj`, `hne`, `awa`, `ace`, `bal`, `chr`, `crh`, `tt`, `ba`, `cv`, `sah`, `os`, `ab`, `ady`, `kab`, `tet`, `bug`, `min`, `ban`, `mad`, `bjn`, `hil`, `pam`, `bcl`, `gor`, `mak`, `sas`, `fy`, `fo`, `gd`, `gv`, `kw`, `se`, `kl`, `iu`, `cr`, `oj`, `lkt`, `nv`, `ik`, `ch`, `mh`, `ty`, `bi`, `na`, `gil`, `niu`, `rar`, `pau`, `tpi`, `ho`, `aa`, `av`, `ce`, `kv`, `udm`, `myv`, `mdf`, `mhr`, `mrj`, `tyv`, `alt`, `krc`, `kum`, `lez`, `inh`, `kbd`, `xal`, `nog`, `kaa`, `kjh`, `gag`, `rom`, `sma`, `smj`.
- Metadados de downloads devem ser localizados por idioma; não aceitar fallback inglês em páginas não inglesas.
- Google Search Console em 2026-07-06:
  - propriedade `sc-domain:brikaya.com` visível no Chrome autenticado;
  - `https://brikaya.com/sitemap.xml` processado em 2026-07-06 com 88 páginas no painel, enquanto o sitemap público já publica 136 URLs;
  - sitemap reenviado pela aba única com a URL canônica completa; processamento da nova onda de 48 rotas segue pendente pelo Google.
- Bing Webmaster Tools em 2026-07-06:
  - site `brikaya.com` visível no painel autenticado;
  - sitemap reenviado anteriormente e URLs recentes visíveis no painel;
  - 48 URLs da onda 67 submetidas manualmente em URL Submission;
  - painel passou para 80 URLs submetidas no dia e quota restante 20; Microsoft Clarity não foi instalado nem ativado.
- Yandex Webmaster sinalizou duas ações:
  - 2026-07-04 02:30 — acelerar indexação do site.
  - 2026-07-04 16:04 — favicon não carregado para o snippet de busca.
- Yandex em 2026-07-06:
  - `https://brikaya.com/sitemap.xml` está na fila de processamento;
  - reindexação manual de 48 URLs da onda 67 ficou `In queue`;
  - IndexNow foi reenviado após o deploy e retornou `200` para 136 URLs com chave redigida;
  - alerta de favicon ainda aparece até a próxima atualização do Yandex.
- Naver Search Advisor em 2026-07-06:
  - painel mostrou `sitemap.xml` submetido desde 2026-07-04 10:16:30;
  - coleta manual de novas URLs foi tentada na aba única, mas `/cs/` e URL completa foram rejeitadas pelo aviso de formato de URL;
  - não foi tentado senha, OTP, telefone, documento, pagamento ou contorno de limitação.
- Baidu Search Resource Platform em 2026-07-06:
  - aba de cadastro gratuita fornecida pelo usuário foi reutilizada no Chrome;
  - rota internacional do cadastro permitiu selecionar Brasil no seletor de país/região;
  - ao solicitar código de verificação com dado de contato autorizado pelo usuário, o Baidu retornou que registros de regiões externas, Hong Kong, Macau e Taiwan não são aceitos no momento;
  - ação permanece bloqueada em `blocked_auth`; nenhum código SMS, CAPTCHA, documento, ICP, pagamento, serviço pago ou registro final de conta foi concluído;
  - valores pessoais e senha não foram gravados em documentação, evidência ou screenshot público.


## Atualização P0-P20 em 2026-07-06 — expansão global publicada

- Idiomas publicados agora: 67 (`pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th`, `zh-CN`, `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`, `mr`, `gu`, `kn`, `ml`, `pa`, `el`, `sv`, `da`, `no`, `fi`, `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`).
- Novos idiomas P13-P16 já publicados nas ondas anteriores: `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`, `mr`, `gu`, `kn`, `ml`, `pa`, `el`, `sv`, `da`, `no`, `fi`. Onda 67 adicionou `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`.
- RTL P16: `ar`, `ur`, `fa` e `he` publicados com `dir="rtl"` no HTML gerado e no runtime.
- Sitemap publicado: 136 URLs (`home + downloads` para 67 idiomas, mais `/privacy/` e `/terms/`).
- QA público validado: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa`, `make cloudflare-offline-pwa-qa`.
- IndexNow/Yandex pós-deploy final: `200` para 136 URLs com chave redigida.
- Clarity P20: continua não instalado; nenhum script, pacote, tag, pixel ou SDK externo foi adicionado.
- Buscadores P1-P11: novo sitemap/hreflang já está público; Google/Bing/Yandex/Naver precisam apenas de acompanhamento de processamento, Baidu segue bloqueado por cadastro externo e DuckDuckGo/Yahoo/metabuscadores seguem por sitemap/Bing/IndexNow/crawl.

## Atualização operacional em 2026-07-06 — rechecagem Chrome e buscadores

- Aba única: Codex criou uma aba registrada da thread e a reutilizou sequencialmente para Google, Bing, Yandex, Naver, Brave e Seznam. A aba fica aberta como handoff.
- Google Search Console: sitemap canônico reenviado; painel ainda mostra `Processado` com 88 páginas, enquanto o sitemap público já contém 136 URLs. Pendência: aguardar processamento do Google para as 48 novas rotas.
- Bing Webmaster Tools: 48 URLs da onda 67 (`cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`, home + downloads) foram submetidas manualmente. O painel ficou com 80 URLs submetidas no dia e quota restante 20.
- Yandex Webmaster: `sitemap.xml` segue na fila de processamento; as mesmas 48 URLs da onda 67 foram enviadas para reindexação manual e ficaram `In queue`; quota restante 100. Alerta de favicon segue pendente até refresh do Yandex.
- Naver Search Advisor: `sitemap.xml` permanece submetido. A coleta manual das novas URLs não foi concluída porque o formulário rejeitou `/cs/` e a URL completa com aviso de formato; cobertura segue por sitemap/crawl.
- Brave Search: `https://brikaya.com/sitemap.xml` foi submetido no formulário gratuito e retornou `Success`.
- Seznam: formulário oficial de adição de URL abriu, mas exigiu código/CAPTCHA (`Opište kód`); nenhuma submissão manual foi feita. Cobertura segue por `robots.txt`, sitemap e IndexNow quando suportado.
- Mojeek: sem ação direta; documentação pública informa que a descoberta é por crawling e não há submissão manual.
- Clarity/analytics/pixel/tag: nada instalado, ativado ou publicado.
- Dados pessoais: nenhum valor de telefone, e-mail, senha, OTP, documento, CAPTCHA ou identidade pública foi armazenado em evidência.

## Follow-up Naver/Baidu em 2026-07-06

- Naver Search Advisor: aba fornecida pelo usuário mostrou `https://brikaya.com` selecionado e `sitemap.xml` na tabela de sitemaps submetidos com registro `26.07.04 10:16:30`. A tentativa de abrir “Web page collection” redirecionou para login/callback; nenhuma senha, OTP, CAPTCHA, telefone, documento ou pagamento foi informado.
- Baidu: aba de cadastro fornecida pelo usuário foi reutilizada. A rota internacional aceitou Brasil no seletor, mas ao solicitar código de verificação o painel retornou: “Registration from overseas regions and Hong Kong, Macao and Taiwan is not currently supported.” A configuração continua bloqueada por autenticação/região suportada. Não foi inserido código SMS, CAPTCHA, documento, ICP, pagamento, serviço pago nem registro final de conta; valores pessoais e senha não foram registrados em evidência pública.
- As duas abas foram mantidas abertas como handoff; nenhuma aba nova foi criada pelo Codex nesta continuação.


## Follow-up fa/he e painéis abertos em 2026-07-06

- `fa` e `he` foram publicados como idiomas RTL completos: home, `/downloads/`, SEO, canonical, hreflang e sitemap.
- Sitemap público passou a 136 URLs (`home + downloads` para 67 idiomas, mais `/privacy/` e `/terms/`).
- Google Search Console: aba aberta reutilizada; `https://brikaya.com/sitemap.xml` reenviado e painel confirmou “Sitemap enviado”. A inspeção de `https://brikaya.com/fa/downloads/` mostrou que a URL ainda não estava no Google; a tentativa de solicitação manual de indexação não exibiu confirmação durável no tempo limite da automação.
- Bing Webmaster Tools: aba aberta do Clarity foi reutilizada apenas para navegar ao Webmaster; Clarity não foi instalado. Sitemap reenviado com sucesso para processamento, e `/fa/`, `/fa/downloads/`, `/he/`, `/he/downloads/` apareceram na lista de URLs submetidas.
- Yandex Webmaster: aba aberta reutilizada; sitemap continua na fila de processamento e o alerta de favicon ainda aparece. IndexNow/Yandex aceitou 136 URLs; envio final retornou `200`.
- Naver Search Advisor: aba aberta de coleta manual reutilizada; sessão válida e formulário visível, mas a coleta manual de `/fa/` apareceu no histórico em rechecagem posterior; os demais idiomas seguem por sitemap/crawl.
- Nenhuma aba nova foi criada; as abas de Google, Bing, Yandex e Naver ficaram abertas como handoff.
- Nenhum CAPTCHA, OTP, senha, documento, pagamento, telefone novo, Clarity, pixel, tag, SDK externo ou telemetria foi usado.

## Regra operacional de navegador

Toda configuração feita por Codex via Chrome ou outro navegador no macOS deve usar uma única aba de trabalho:

1. abrir uma aba no início quando não houver aba viva da rodada anterior;
2. navegar todos os painéis nessa mesma aba;
3. evitar abrir abas/janelas extras;
4. fechar/release popups ou abas extras criadas pelo site, quando não forem necessárias;
5. deixar a aba aberta ao final como handoff para a próxima iteração.

Identificação operacional da aba: `Brikaya webmaster/i18n`.

Exceção histórica registrada em 2026-07-06: uma rechecagem anterior do Naver redirecionou a aba reutilizada para OAuth/login e o Chrome bloqueou a automação por UI de extensão. Na rechecagem atual, Codex usou a aba registrada da thread e a manteve aberta; nenhum painel exigiu senha, OTP, telefone, documento ou pagamento.

Essa regra vale para:

- Google Search Console;
- Bing Webmaster Tools;
- Yandex Webmaster;
- Naver Search Advisor;
- Baidu Search Resource Platform;
- consulta de documentação DuckDuckGo/Yahoo/outros;
- Gmail, somente quando necessário para código ou link de verificação webmaster.

## Matriz de buscadores zero-custo

| Plataforma | Ação esperada | Status aceito | Bloqueio |
| --- | --- | --- | --- |
| Google Search Console | Confirmar propriedade, sitemap, inspeção de `/`, `/downloads/` e amostras localizadas | `verified`, `sitemap_submitted`, `manual_index_requested` | reautenticação, CAPTCHA, limite temporário |
| Bing Webmaster Tools | Confirmar/importar site, enviar sitemap e URLs principais | `verified`, `sitemap_submitted`, `manual_index_requested` | conta/permissão ausente |
| Yahoo | Cobertura via Bing Webmaster Tools | `no_direct_action` | nenhum painel direto útil |
| DuckDuckGo | Cobertura via sitemap, Bing e rastreamento próprio | `no_direct_action` | nenhum painel direto obrigatório |
| Yandex Webmaster | Confirmar sitemap, favicon, notificações e reindexação | `verified`, `sitemap_submitted`, `indexnow_submitted` | Metrica/tag paga/telemetria não entra |
| Naver Search Advisor | Confirmar verificação, corrigir submissão de sitemap e usar IndexNow | `verified`, `sitemap_submitted`, `indexnow_submitted` | conta, CAPTCHA ou formato rejeitado |
| Baidu Search Resource Platform | Adicionar/verificar site e enviar sitemap se conta permitir | `verified`, `sitemap_submitted` | telefone novo, documento, ICP, pagamento ou identidade pública |
| Brave Search | Enviar sitemap/URL pelo formulário gratuito de refetch | `manual_index_requested` | CAPTCHA, custo ou rastreamento externo |
| Seznam/Yep/outros | Cobrir via IndexNow quando suportado | `indexnow_submitted` ou `no_direct_action` | CAPTCHA, serviço pago ou conta indisponível |

Microsoft Clarity deve permanecer sem instalação no Brikaya enquanto a regra de privacidade proibir pixel, tag, SDK externo ou rastreamento de sessão.

Status executado em 2026-07-06:

| Plataforma | Status | Evidência sanitizada |
| --- | --- | --- |
| Google Search Console | `pending_processing` | sitemap processado com 88 páginas no painel; sitemap público já tem 136 URLs e foi reenviado |
| Bing Webmaster Tools | `manual_index_requested` | 48 URLs da onda 67 enviadas manualmente; painel com 80 URLs submetidas no dia e quota restante 20 |
| Yahoo | `no_direct_action` | submissão segue via Bing Webmaster Tools; sem painel separado no escopo |
| DuckDuckGo | `no_direct_action` | descoberta coberta por Bing, sitemap, robots, canonical, hreflang e crawler próprio; sem tag/pixel |
| Yandex Webmaster | `manual_index_requested` + `indexnow_submitted` | sitemap em fila; 48 URLs da onda 67 em fila de reindexação; IndexNow `200` |
| Naver Search Advisor | `sitemap_submitted` | `sitemap.xml` listado como submetido; coleta manual de novas URLs bloqueada por formato |
| Brave Search | `manual_index_requested` | `https://brikaya.com/sitemap.xml` submetido no formulário gratuito com confirmação `Success` |
| Seznam | `blocked_captcha` | formulário oficial exige código/CAPTCHA; nenhuma submissão manual feita |
| Baidu Search Resource Platform | `blocked_auth` | cadastro internacional gratuito tentou Brasil e retornou bloqueio para regiões externas; parada antes de SMS/CAPTCHA/documento/ICP/pagamento/registro final |
| Mojeek/Seznam/Yep/outros | `indexnow_submitted`/`no_direct_action` | cobertos por IndexNow quando suportado, por crawler próprio ou por páginas públicas rastreáveis |

## Correção Yandex/favicon

A correção técnica publicada pelo repositório deve manter:

- favicon raiz em `https://brikaya.com/favicon.svg`;
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />` no HTML público;
- favicon SVG local, sem raster, sem CDN, sem `data:`, sem `<image>`, sem script e sem fonte externa;
- cache com revalidação para `/favicon.svg`;
- service worker precacheando `/favicon.svg` para manter a experiência offline-first.

Não criar `favicon.ico`, PNG, JPG ou outro raster runtime enquanto a regra do projeto exigir imagem runtime SVG local/offline.

## IndexNow/Yandex

IndexNow foi adotado como caminho zero-custo para informar ao Yandex que páginas do Brikaya mudaram. A chave IndexNow é pública por definição porque o protocolo exige um arquivo `.txt` acessível no domínio. Ela não é credencial de login e não deve ser usada para autenticação interna.

Fonte operacional obrigatória:

- `BRIKAYA_INDEXNOW_KEY` fica no `.env` local do projeto;
- `public/<chave>.txt` não é mais fonte versionada;
- o arquivo público de verificação é materializado em `dist/<chave>.txt` durante build/deploy;
- logs, PRs e docs devem exibir apenas `https://brikaya.com/[redacted].txt`.

Para sincronizar valores atuais sem imprimir chaves:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:bootstrap
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:check
```

### Comando de validação sem envio

```bash
PATH="/opt/homebrew/bin:$PATH" make yandex-indexnow-dry-run
```

### Comando de envio pós-deploy

```bash
PATH="/opt/homebrew/bin:$PATH" make yandex-indexnow-submit
```

Resultado aceito:

- `status=200`: Yandex recebeu as URLs e a chave foi aceita.
- `status=202`: Yandex recebeu as URLs, mas a chave ainda está em verificação; repetir depois de alguns minutos.

Falhas esperadas e ação:

- `403`: verificar se o arquivo `.txt` da chave está público no domínio canônico.
- `422`: verificar formato da chave, `keyLocation`, host e URLs do sitemap.
- `429`: aguardar; não repetir em loop agressivo.

## Sitemap e reindexação manual

Após cada deploy que muda metadados públicos, favicon, sitemap ou rotas, executar:

```bash
PATH="/opt/homebrew/bin:$PATH" make cloudflare-deploy
PATH="/opt/homebrew/bin:$PATH" make cloudflare-public-check
PATH="/opt/homebrew/bin:$PATH" make yandex-indexnow-submit
```

Se houver acesso gratuito/autenticado ao Yandex Webmaster:

1. Confirmar `https://brikaya.com/sitemap.xml` em “Sitemap files”.
2. Solicitar reprocessamento do sitemap quando houver tentativa disponível.
3. Usar “Reindex pages” para `https://brikaya.com/` após deploy do favicon.
4. Revisar “Site diagnostics” até o alerta de favicon sair ou mudar de estado.

Se Yandex Webmaster bloquear por sessão, autorização ou conta, registrar como pendência operacional. Não criar serviço pago, campanha, cartão, assinatura, overage ou tag de Metrica por padrão.

## Internacionalização e downloads

Critérios permanentes:

- cada rota `/<locale>/` deve publicar `<html lang="<locale>">`, canonical limpo e hreflang para todos os idiomas;
- cada rota `/<locale>/downloads/` deve publicar título e descrição no idioma da rota;
- `pt-BR` continua em `/` e `/downloads/`;
- todos os demais idiomas usam prefixo de rota;
- `x-default` aponta para a rota `pt-BR`;
- `/privacy/` e `/terms/` continuam páginas estáticas canônicas;
- nenhuma página pública de downloads deve listar lojas pagas conhecidas como opção ativa.

Falha que não pode regressar:

- páginas como `/es-419/downloads/`, `/ja/downloads/` e `/zh-CN/downloads/` não podem ter título/descrição em inglês por fallback.

## Fora de escopo atual

- Yandex Metrica: não adicionada por ser telemetria/script externo e por não ser necessária para corrigir favicon ou notificar mudança via IndexNow.
- Indexação garantida: IndexNow acelera descoberta, mas não garante inclusão nem atualização imediata do snippet.
- Lojas/app stores: continuam fora do P0 se exigirem taxa, cartão, assinatura ou exposição pessoal pública.

## Evidência esperada

Antes de afirmar conclusão:

```bash
PATH="/opt/homebrew/bin:$PATH" node --version
PATH="/opt/homebrew/bin:$PATH" make help
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:check
PATH="/opt/homebrew/bin:$PATH" npm run test:semantic-file-names
PATH="/opt/homebrew/bin:$PATH" npm run test:svg-assets
PATH="/opt/homebrew/bin:$PATH" npm run build
/usr/bin/curl -sSI https://brikaya.com/favicon.svg
/usr/bin/curl -sSI https://brikaya.com/sitemap.xml
/usr/bin/curl -sSI https://brikaya.com/robots.txt
/usr/bin/curl -sS https://brikaya.com/zh-CN/downloads/
/usr/bin/curl -sS https://brikaya.com/ja/downloads/
/usr/bin/curl -sS https://brikaya.com/es-419/downloads/
```

Critérios:

- Node começa com `v23.`.
- `.env` local contém as variáveis obrigatórias, com valores omitidos em logs e permissão `0600`.
- `/favicon.svg` público responde `200` com `content-type: image/svg+xml`.
- `/sitemap.xml` e `/robots.txt` respondem `200`.
- downloads localizados respondem `200` com título e descrição no idioma certo.
- IndexNow retorna `200` ou `202` com saída sanitizada, sem imprimir a chave.

## Atualização — onda 67 idiomas

- Timestamp: 2026-07-06T16:19:43.073Z
- Novos idiomas publicados nesta onda: `cs`, `ro`, `hu`, `bg`, `sk`, `sl`, `hr`, `sr`, `lt`, `lv`, `et`, `sw`, `af`, `am`, `ka`, `hy`, `az`, `kk`, `uz`, `ne`, `si`, `km`, `lo`, `my`.
- Site público: 48 novas rotas home/downloads responderam 200 e `sitemap.xml` publicou 136 URLs.
- Google Search Console: sitemap reenviado; painel ainda mostra 88 páginas processadas antes do novo processamento de 136 URLs.
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

- Publicação: PR #220 mergeado em `main` e deploy Cloudflare concluído em `https://brikaya.com/` via `https://c92228e9.brikaya-live.pages.dev`.
- Escopo publicado: 235 idiomas, 472 URLs no sitemap, hreflang completo e `x-default`.
- QA público: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa` (235 hreflangs, 84 páginas de downloads amostradas), `make cloudflare-offline-pwa-qa` e `make yandex-indexnow-submit` (202, 472 URLs) passaram.
- Amostras públicas: `/aa/downloads/`, `/ce/downloads/`, `/tyv/downloads/`, `/kaa/downloads/` e `/sma/downloads/` responderam 200 com `html lang` correto, `dir=ltr`, título localizado e sem Clarity/analytics/pixel.
- Google Search Console: sitemap reenviado com URL completa; painel confirmou “Sitemap enviado”, mas tabela ainda mostra 376 páginas até o Google reprocessar o sitemap de 472 URLs.
- Bing Webmaster Tools: sitemap reenviado e voltou para `Processing`; URL Submission manual está com quota 0 e 100 URLs já enviadas hoje.
- Yandex Webmaster: IndexNow aceitou 472 URLs (`202`); sitemap segue em fila de processamento e checklist mantém aviso até o robô usar o sitemap processado.
- Naver Search Advisor: `sitemap.xml` confirmado; coleta manual de `/aa/` não gerou novo item no histórico, sem CAPTCHA/OTP/custo.
- Google Cloud Auth: somente leitura; app OAuth permanece em `Testing`, sem publicação.
- Clarity: painel indica projeto existente, mas instalação continua bloqueada; nenhum script, tag, SDK, pixel ou telemetria foi adicionado.
- Aba única Chrome: reutilizada e deixada aberta em `https://brikaya.com/sitemap.xml`.
- Pendências: Google/Bing/Yandex/Naver precisam reprocessar; Yahoo/DuckDuckGo dependem de Bing/crawl; Brave sem endpoint direto atual; Baidu/Seznam seguem bloqueados por cadastro externo/CAPTCHA/ICP/custo; Clarity continua desinstalado.


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


## Atualização — rechecagem Chrome pós-onda 284 em 2026-07-06

- Aba única registrada/reutilizada e deixada aberta em `https://brikaya.com/sitemap.xml`.
- Google Search Console: página `Sitemaps` abriu autenticada para `sc-domain:brikaya.com`; sem CAPTCHA, OTP, senha ou custo visto nesta leitura.
- Bing Webmaster Tools: painel Clarity abriu autenticado em modo leitura; Clarity não foi instalado nem ativado.
- Yandex Webmaster: checklist abriu autenticado e ainda mostra 3 recomendações; sem ação paga e sem CAPTCHA.
- Naver Search Advisor: abriu fluxo autenticado/callback, mas tela continua sem confirmação operacional de coleta nova; sem CAPTCHA, OTP, senha ou custo visível.
- Seznam Reporter/Webmaster: portal abriu autenticado/legível; IndexNow já foi enviado via endpoint oficial com status 200 para 570 URLs; painel fica para reprocessamento/crawl.

## Atualização operacional em 2026-07-06 — monetização Google H5 sem campanha paga

- AdSense autenticado em `https://adsense.google.com/adsense/u/0/pub-9571619183194136/sites/detail/url=brikaya.com` mostrou `brikaya.com`, verificou propriedade por snippet e aceitou `Pedir revisão`.
- Estado superior após pedido: `Preparando`; etapa de revisão aparece como `Revisão solicitada`.
- CMP certificado Google foi configurado pelo painel AdSense com três opções para regulamentações europeias: `Consentir`, `Não consentir`, `Gerenciar opções`.
- O painel ainda mostrou ads.txt como `Não encontrado`; o projeto agora publica `/ads.txt` com o publisher público do AdSense e aguarda recrawl do AdSense.
- Central de políticas do AdSense verificada em modo leitura: `Não encontramos nenhum problema`.
- Implementação preparada sem campanha paga: snippet para revisão do site, flag runtime desligada por padrão, chamada H5 `adBreak` apenas depois das fases 3, 6, 9... quando a liberação do Google existir, e mensagem pós-anúncio com retorno manual ao jogo.
- H5 Games Ads / Ad Placement API segue pendente de liberação/aprovação do Google; o formulário oficial exige conta aprovada e dados adicionais de contato/empresa/telefone antes de submissão.
- Guardrails mantidos: sem Google Ads campaign, sem orçamento, sem cartão, sem Clarity/pixel adicional, sem clique em anúncio real em QA e sem anúncio durante jogada ativa e sem exibição em todas as transições de fase.
- Documento operacional: [`docs/monetizacao-google.md`](../monetizacao-google.md).

## Atualização operacional em 2026-07-07 — pacote legal e confiança pública

- Escopo publicado: preparar URLs públicas para Sobre, Legal, Privacidade, Termos, Contrato de usuário, Licença, Exclusão de dados, Cookies/anúncios e Suporte.
- Objetivo: antecipar exigências comuns de Google OAuth/App Branding, Meta Developers, buscadores e preparação futura para lojas, mantendo Brikaya como PWA gratuito sem conta de jogador.
- Guardrail: sem campanha paga, sem cartão, sem loja paga, sem pixel novo, sem exposição de perfil pessoal e sem compromisso de custo.
- Sitemap: deve incluir as novas rotas estáticas junto com home/downloads localizados após `npm run build`.
- Search Console: após merge/deploy, reenviar `https://brikaya.com/sitemap.xml` e aguardar processamento; não tratar processamento pendente como erro de publicação.
- Meta/Google: usar as URLs públicas `https://brikaya.com/privacy/`, `https://brikaya.com/terms/` e `https://brikaya.com/data-deletion/` quando algum painel pedir política, termos ou instrução de exclusão.

## Atualização operacional em 2026-07-07 — páginas legais multilíngues e sitemap principal

- Escopo implementado: páginas legais/trust com padrão `en-US` nas URLs raiz e versões localizadas geradas para os idiomas principais do jogo, sem variantes regionais duplicadas.
- Páginas cobertas: Sobre, Legal, Privacidade, Termos, Contrato de usuário, Licença, Exclusão de dados, Cookies/anúncios e Suporte.
- Sitemap alvo após build: 2.854 URLs (`284 * home/downloads` + `254 * 9 páginas legais`).
- Exemplos que devem existir após publicação: `/privacy/`, `/pt-BR/privacy/`, `/es-419/terms/`, `/fr/legal/`, `/zh-CN/data-deletion/`, `/zh-TW/legal/`, `/ar/privacy/`.
- Exemplos que não devem existir no sitemap legal: `/en-AU/privacy/`, `/en-GB/terms/`, `/fr-CA/privacy/`, `/de-CH/legal/`.
- Guardrail mantido: sem campanha paga, cartão, loja paga, pixel novo, Clarity/script novo ou exposição de perfil pessoal.
- Buscadores após deploy: reenviar `https://brikaya.com/sitemap.xml` no Google Search Console e Bing Webmaster Tools; usar `make yandex-indexnow-submit` e `make seznam-indexnow-submit`; confirmar Naver/Yandex/Seznam quando possível sem CAPTCHA, OTP, telefone, documento, custo ou publicação de identidade pessoal.
