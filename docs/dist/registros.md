# Brikaya — registros, descoberta e indexação zero custo

## Objetivo

Manter `https://brikaya.com/` descobrível por buscadores sem custo, sem cobrança, sem plano pago, sem scripts externos de telemetria e sem exposição de identidade pessoal pública.

## Estado operacional em 2026-07-06

- Domínio canônico público: `https://brikaya.com/`.
- Publicação padrão: Cloudflare Pages Direct Upload do diretório `dist/`.
- Sitemap canônico: `https://brikaya.com/sitemap.xml`.
- Robots canônico: `https://brikaya.com/robots.txt` com diretiva `Sitemap`.
- Rotas públicas indexáveis: home e `/downloads/` em 33 idiomas: `pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th`, `zh-CN`, `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`.
- Metadados de downloads devem ser localizados por idioma; não aceitar fallback inglês em páginas não inglesas.
- Google Search Console em 2026-07-06:
  - propriedade `sc-domain:brikaya.com` visível no Chrome autenticado;
  - `https://brikaya.com/sitemap.xml` processado em 2026-07-06 com 32 páginas;
  - inspeção de URL e solicitação manual de indexação concluídas para `/`, `/downloads/`, `/es-419/`, `/es-419/downloads/`, `/ja/`, `/ja/downloads/`, `/zh-CN/` e `/zh-CN/downloads/`.
- Bing Webmaster Tools em 2026-07-06:
  - site `brikaya.com` visível no painel autenticado;
  - sitemap reenviado e em processamento;
  - URL Inspection + Request indexing + confirmação `Submit` concluídos para as mesmas oito URLs principais;
  - painel IndexNow mostrou URLs localizadas recentes; Microsoft Clarity não foi instalado.
- Yandex Webmaster sinalizou duas ações:
  - 2026-07-04 02:30 — acelerar indexação do site.
  - 2026-07-04 16:04 — favicon não carregado para o snippet de busca.
- Yandex em 2026-07-06:
  - `https://brikaya.com/sitemap.xml` está na fila de processamento;
  - reindexação manual de `https://brikaya.com/` e `https://brikaya.com/downloads/` ficou `In queue`;
  - IndexNow retornou `202 accepted-pending` para 32 URLs com chave redigida.
- Naver Search Advisor em 2026-07-06:
  - painel mostrou `sitemap.xml` submetido desde 2026-07-04 10:16:30;
  - o erro anterior de formato de URL não apareceu no estado submetido;
  - rechecagem posterior redirecionou para login; não foi tentado senha, OTP, telefone ou documento.
- Baidu Search Resource Platform em 2026-07-06:
  - aba de cadastro gratuita fornecida pelo usuário foi reutilizada no Chrome;
  - rota internacional do cadastro permitiu selecionar Brasil no seletor de país/região;
  - ao solicitar código de verificação com dado de contato autorizado pelo usuário, o Baidu retornou que registros de regiões externas, Hong Kong, Macau e Taiwan não são aceitos no momento;
  - ação permanece bloqueada em `blocked_auth`; nenhum código SMS, CAPTCHA, documento, ICP, pagamento, serviço pago ou registro final de conta foi concluído;
  - valores pessoais e senha não foram gravados em documentação, evidência ou screenshot público.


## Atualização P0-P20 em 2026-07-06 — expansão global publicada

- Idiomas publicados agora: 33 (`pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th`, `zh-CN`, `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`).
- Novos idiomas P13-P16: `ar`, `ru`, `tr`, `nl`, `pl`, `uk`, `ms`, `zh-TW`, `pt-PT`, `es-ES`, `en-GB`, `fr-CA`, `bn`, `ur`, `fa`, `he`, `ta`, `te`.
- RTL P16: `ar`, `ur`, `fa` e `he` publicados com `dir="rtl"` no HTML gerado e no runtime.
- Sitemap publicado: 68 URLs (`home + downloads` para 33 idiomas, mais `/privacy/` e `/terms/`).
- QA público validado: `make cloudflare-public-check`, `make cloudflare-i18n-seo-qa`, `make cloudflare-offline-pwa-qa`.
- IndexNow/Yandex pós-deploy: `202 accepted-pending` para 68 URLs com chave redigida.
- Clarity P20: continua não instalado; nenhum script, pacote, tag, pixel ou SDK externo foi adicionado.
- Buscadores P1-P11: novo sitemap/hreflang já está público; Google/Bing/Yandex/Naver precisam apenas de acompanhamento de processamento, Baidu segue bloqueado por cadastro externo e DuckDuckGo/Yahoo/metabuscadores seguem por sitemap/Bing/IndexNow/crawl.

## Follow-up Naver/Baidu em 2026-07-06

- Naver Search Advisor: aba fornecida pelo usuário mostrou `https://brikaya.com` selecionado e `sitemap.xml` na tabela de sitemaps submetidos com registro `26.07.04 10:16:30`. A tentativa de abrir “Web page collection” redirecionou para login/callback; nenhuma senha, OTP, CAPTCHA, telefone, documento ou pagamento foi informado.
- Baidu: aba de cadastro fornecida pelo usuário foi reutilizada. A rota internacional aceitou Brasil no seletor, mas ao solicitar código de verificação o painel retornou: “Registration from overseas regions and Hong Kong, Macao and Taiwan is not currently supported.” A configuração continua bloqueada por autenticação/região suportada. Não foi inserido código SMS, CAPTCHA, documento, ICP, pagamento, serviço pago nem registro final de conta; valores pessoais e senha não foram registrados em evidência pública.
- As duas abas foram mantidas abertas como handoff; nenhuma aba nova foi criada pelo Codex nesta continuação.


## Follow-up fa/he e painéis abertos em 2026-07-06

- `fa` e `he` foram publicados como idiomas RTL completos: home, `/downloads/`, SEO, canonical, hreflang e sitemap.
- Sitemap público passou a 68 URLs (`home + downloads` para 33 idiomas, mais `/privacy/` e `/terms/`).
- Google Search Console: aba aberta reutilizada; `https://brikaya.com/sitemap.xml` reenviado e painel confirmou “Sitemap enviado”. A inspeção de `https://brikaya.com/fa/downloads/` mostrou que a URL ainda não estava no Google; a tentativa de solicitação manual de indexação não exibiu confirmação durável no tempo limite da automação.
- Bing Webmaster Tools: aba aberta do Clarity foi reutilizada apenas para navegar ao Webmaster; Clarity não foi instalado. Sitemap reenviado com sucesso para processamento, e `/fa/`, `/fa/downloads/`, `/he/`, `/he/downloads/` apareceram na lista de URLs submetidas.
- Yandex Webmaster: aba aberta reutilizada; sitemap continua na fila de processamento e o alerta de favicon ainda aparece. IndexNow/Yandex aceitou 68 URLs com `202 accepted-pending`.
- Naver Search Advisor: aba aberta de coleta manual reutilizada; sessão válida e formulário visível, mas tentativas com `/fa/` e `fa/` não criaram confirmação durável nem linha de histórico no tempo limite. Sitemap previamente submetido segue como caminho confiável.
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

Exceção registrada em 2026-07-06: nenhuma aba nova foi criada pelo Codex, mas uma rechecagem do Naver redirecionou a aba reutilizada para OAuth/login e o Chrome bloqueou a automação por UI de extensão. Para não inserir credenciais nem quebrar os limites de privacidade, a checagem restante do Baidu usou uma aba `about:blank` já existente. Esse desvio fica registrado em `docs/assets/issues/webmaster-i18n-global/evidence/evi-webmaster-i18n-global-status.json`.

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
| Seznam/Yep/outros | Cobrir via IndexNow quando suportado | `indexnow_submitted` ou `no_direct_action` | serviço pago ou conta indisponível |

Microsoft Clarity deve permanecer sem instalação no Brikaya enquanto a regra de privacidade proibir pixel, tag, SDK externo ou rastreamento de sessão.

Status executado em 2026-07-06:

| Plataforma | Status | Evidência sanitizada |
| --- | --- | --- |
| Google Search Console | `manual_index_requested` | sitemap processado com 32 páginas; oito URLs principais inspecionadas e enviadas para fila |
| Bing Webmaster Tools | `manual_index_requested` | sitemap reenviado; oito URLs principais submetidas; IndexNow listou URLs localizadas |
| Yahoo | `no_direct_action` | submissão segue via Bing Webmaster Tools; sem painel separado no escopo |
| DuckDuckGo | `no_direct_action` | descoberta coberta por Bing, sitemap, robots, canonical, hreflang e crawler próprio; sem tag/pixel |
| Yandex Webmaster | `manual_index_requested` + `indexnow_submitted` | sitemap em fila; `/` e `/downloads/` em fila de reindexação; IndexNow `202` |
| Naver Search Advisor | `sitemap_submitted` | `sitemap.xml` listado como submetido; rechecagem posterior bloqueada por login |
| Baidu Search Resource Platform | `blocked_auth` | cadastro internacional gratuito tentou Brasil e retornou bloqueio para regiões externas; parada antes de SMS/CAPTCHA/documento/ICP/pagamento/registro final |
| Seznam/Yep/outros | `indexnow_submitted`/`no_direct_action` | cobertos por IndexNow quando suportado e por páginas públicas rastreáveis |

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
