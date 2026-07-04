<!-- docs/dist/registros-execucao-zero-custo.md -->
# Execução zero-custo dos registros multilíngues Brikaya

Data UTC: 2026-07-04T02:11:17Z. Escopo: domínio canônico `https://brikaya.com/`, PWA-only, todos os idiomas planejados/traduzidos e nenhuma ação com custo.

## Resultado operacional

| Frente | Status | Resultado | Próxima ação segura |
| --- | --- | --- | --- |
| Google Search Console | Concluído | Propriedade `sc-domain:brikaya.com` verificada por DNS TXT; sitemap `https://brikaya.com/sitemap.xml` reenviado com 15 URLs localizadas; reprocessamento das novas URLs fica pendente do Google. | Reenviar sitemap quando novas rotas reais forem adicionadas. |
| Sitemap/robots público | Concluído | `robots.txt`, homepage, sitemap multilíngue com 15 URLs e arquivo público de verificação Naver seguem HTTP 200. | Remover arquivo público de verificação somente se o Naver confirmar que a posse permanecerá válida sem ele. |
| Bing Webmaster Tools | Concluído | Site `https://brikaya.com/` verificado por CNAME DNS no Cloudflare; sitemap enviado e exibido como `Submitted/Processing`, com 0 erros e 0 warnings. | Manter sem Microsoft Clarity, ads, campanhas, importações pagas ou aprovação administrativa. |
| Yandex Webmaster | Concluído | Site verificado por DNS TXT no Cloudflare; usuário ficou com papel Owner; sitemap enviado para a fila de processamento do Yandex. | Aguardar processamento do sitemap; não ativar Yandex Metrica, tag externo ou proteção/serviço pago. |
| Naver Search Advisor | Concluído | Conta Naver autenticada; termo gratuito aceito; site `https://brikaya.com/` verificado por arquivo HTML público oficial; sitemap `https://brikaya.com/sitemap.xml` enviado e listado como `sitemap.xml` em 26.07.04 10:16:30. | Aguardar processamento/coleta do Naver; manter sem script runtime, ads ou serviço pago. |
| Baidu Search Resource Platform | Não executado | Fonte oficial exige login para adicionar site. Conta Baidu/local não estava disponível. | Usar somente conta Baidu gratuita se disponível; não ativar ICP/China Network/hospedagem China/serviço pago. |
| CLASSIND Brasil | Concluído; em triagem | Inscrição processual de Brikaya enviada no Safari/gov.br; confirmação "Inscrição processual completa" exibida; listagem mostra Brikaya com status "Triagem". Evidência sanitizada da sinopse anexada: `docs/assets/issues/multilingual-zero-cost-registrations/evidence/evi-classind-sinopse-brikaya-zero-custo.json`. | Aguardar análise/contato do CLASSIND; aplicar símbolo/descritores públicos quando houver resultado; continuar bloqueando qualquer cobrança. |
| Buscas gratuitas de marca | Parcial/documentado | Busca web geral não mostrou colisão oficial evidente para `Brikaya`; apareceu risco fonético público `Brekiya`, exigindo busca oficial antes de depósito pago futuro. | Executar bases oficiais nominativas quando login/captcha permitir; não depositar marca. |

Reconferência Chrome autenticada em 2026-07-04: Google Search Console, Bing, Yandex e Naver exibiram o sitemap de `brikaya.com` sem CAPTCHA ativo, cobrança, aprovação administrativa, tag externa ou produto pago aceito nesta rodada. Cloudflare foi usado apenas como leitura de cache/estado; nenhum purge ou mudança de plano foi acionado nesta reconferência.

## Decisões aplicadas

- A propriedade de domínio no Google cobre todos os caminhos futuros (`/en/`, `/zh-CN/`, etc.); não é necessário registrar cada idioma separadamente no Search Console.
- `hreflang` e sitemap multilíngue foram publicados após as rotas localizadas passarem a servir HTML/metadados próprios; os buscadores recebem o mesmo sitemap canônico.
- China fica limitada a descoberta global sem custo. Cloudflare China Network/ICP/hospedagem local/licença/app store chinesa ficam bloqueados por custo/obrigações.
- Nenhum anúncio, campanha, tag de analytics, script de terceiro, conta paga, cartão, depósito de PI, aprovação administrativa ou cobrança foi acionado.
- O arquivo HTML público do Naver é exceção mínima de verificação de posse exigida pelo provedor; o token fica versionado apenas no arquivo público necessário, redigido em docs/evidências/chat.
- CAPTCHA do Naver deixou de bloquear a sessão; a propriedade foi confirmada e o sitemap foi enviado sem custo.
- CLASSIND foi submetido apenas após confirmação final explícita do usuário; a confirmação e o status de triagem foram verificados no Safari sem custo.

## Evidência

- JSON operacional: `docs/assets/issues/multilingual-zero-cost-registrations/evidence/evi-multilingual-zero-cost-registration-status.json`.
- JSON de reconferência + i18n automático: `docs/assets/issues/auto-locale-webmaster/evidence/evi-brikaya-auto-locale-webmaster-verification.json`.
- Evidência sanitizada da sinopse anexada ao CLASSIND: `docs/assets/issues/multilingual-zero-cost-registrations/evidence/evi-classind-sinopse-brikaya-zero-custo.json`.
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
