<!-- docs/dist/registros-execucao-zero-custo.md -->
# Execução zero-custo dos registros multilíngues Brikaya

Data UTC: 2026-07-03 23:30:00. Escopo: domínio canônico `https://brikaya.com/`, PWA-only, todos os idiomas planejados/traduzidos e nenhuma ação com custo.

## Resultado operacional

| Frente | Status | Resultado | Próxima ação segura |
| --- | --- | --- | --- |
| Google Search Console | Concluído | Propriedade `sc-domain:brikaya.com` verificada por DNS TXT; sitemap `https://brikaya.com/sitemap.xml` processado; 1 página encontrada; homepage inspecionada. | Reenviar sitemap quando rotas localizadas reais tiverem metadados/canonical próprios. |
| Sitemap/robots público | Concluído para raiz | `robots.txt` aponta para sitemap; sitemap lista a raiz canônica; HTTP 200 confirmado. | Não adicionar `hreflang` até rotas localizadas servirem conteúdo e metadados equivalentes por idioma. |
| Bing Webmaster Tools | Bloqueado por conta | Login Microsoft disponível no Chrome pertence a tenant corporativo e pediu aprovação de administrador para `BingWebmasterTools`. Não acionei `Request approval`. | Usar conta Microsoft pessoal/autorizada ou login Google permitido; importar Search Console ou verificar por DNS/meta/arquivo. |
| Yandex Webmaster | Bloqueado por login/UI | Página pública confirma serviço gratuito; fluxo de adicionar site exige login. A automação Chrome foi interrompida por UI de extensão antes de autenticar. | Retomar com conta Yandex autorizada; adicionar `brikaya.com` e sitemap sem Metrica/tag externo. |
| Naver Search Advisor | Não executado | Fonte oficial orienta Webmaster Tools com login/posse de site; não havia conta Naver autorizada. | Usar conta Naver autorizada; verificar posse e submeter sitemap. |
| Baidu Search Resource Platform | Não executado | Fonte oficial exige login para adicionar site. Conta Baidu/local não estava disponível. | Usar somente conta Baidu gratuita se disponível; não ativar ICP/China Network/hospedagem China/serviço pago. |
| CLASSIND Brasil | Dossiê preparado | Conteúdo e critérios estão documentados em `docs/dist/registros.md`; submissão exige gov.br/CLASSIND e dados do requerente/titular. | Submeter com conta gov.br/CLASSIND autorizada; parar se aparecer qualquer custo. |
| Buscas gratuitas de marca | Parcial/documentado | Busca web geral não mostrou colisão oficial evidente para `Brikaya`; apareceu risco fonético público `Brekiya`, exigindo busca oficial antes de depósito pago futuro. | Executar bases oficiais nominativas quando login/captcha permitir; não depositar marca. |

## Decisões aplicadas

- A propriedade de domínio no Google cobre todos os caminhos futuros (`/en/`, `/zh-CN/`, etc.); não é necessário registrar cada idioma separadamente no Search Console.
- `hreflang` não foi publicado porque as rotas verificadas (`/en/`, `/zh-CN/` e demais) ainda respondem com HTML `pt-BR`, canonical raiz e metadados em português. Publicar alternates agora criaria sinal SEO incorreto.
- China fica limitada a descoberta global sem custo. Cloudflare China Network/ICP/hospedagem local/licença/app store chinesa ficam bloqueados por custo/obrigações.
- Nenhum anúncio, campanha, tag de analytics, script de terceiro, conta paga, cartão, depósito de PI ou aprovação administrativa foi acionado.

## Evidência

- JSON operacional: `docs/assets/issues/multilingual-zero-cost-registrations/evidence/evi-multilingual-zero-cost-registration-status.json`.
- Evidência anterior de Search Console: `docs/assets/issues/search-console-seo/evidence/evi-search-console-seo-public-validation.json`.

## Fontes operacionais

| Tema | Fonte |
| --- | --- |
| Google verificação de propriedade | <https://support.google.com/webmasters/answer/9008080> |
| Google páginas localizadas / `hreflang` | <https://developers.google.com/search/docs/specialty/international/localized-versions> |
| Bing add/verify site | <https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b> |
| Yandex sitemap | <https://yandex.com/support/webmaster/en/indexing-options/sitemap> |
| Naver Webmaster Tools | <https://searchadvisor.naver.com/start> |
| Naver sitemap | <https://searchadvisor.naver.com/guide/request-feed> |
| Baidu Search Resource Platform | <https://ziyuan.baidu.com/site/index> |
| Cloudflare China Network | <https://developers.cloudflare.com/china-network/faq/> |
| CLASSIND jogos/apps | <https://www.gov.br/mj/pt-br/assuntos/seus-direitos/classificacao-1/paginas-classificacao-indicativa/jogos-e-apps> |
