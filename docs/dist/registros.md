<!-- docs/dist/registros.md -->
# Registros P0 para Brikaya PWA-only

Pesquisa atualizada em 2026-07-03. Este documento é operacional para decisão de produto, não substitui parecer jurídico, fiscal ou contábil. A base de escopo é `docs/dist/projeto-pwa.md`; `docs/dist/projeto.md` permanece como histórico amplo.

## 1. Resumo executivo P0

Brikaya será distribuído como PWA/web 100% offline após o primeiro carregamento, sem Google Play, Apple App Store, Microsoft Store, IARC por loja, APK alternativo ou anúncio real no lançamento. A execução operacional passa a considerar todos os idiomas/locales planejados ou em tradução, incluindo `zh-CN`, mas a restrição de custo zero prevalece sobre qualquer cobertura regional.

### 1.1. Executar agora

| Item | Por que entra no P0 | Custo direto | Decisão |
| --- | --- | ---: | --- |
| Brasil - Classificação Indicativa / CLASSIND | Jogo digital acessível no Brasil e instalável/offline; risco regulatório baixo de resolver porque não há taxa. | R$ 0 | Tratar como obrigatório/condicional conservador. Preparar autoclassificação, símbolos e dossiê. |
| Google Search Console | Registro gratuito de propriedade para indexação, sitemap e diagnóstico SEO do domínio. | R$ 0 | Verificar domínio `brikaya.com` e enviar sitemap. |
| Bing Webmaster Tools | Registro gratuito para Bing/Copilot/ecossistema Microsoft e importação/diagnóstico de sitemap. | R$ 0 | Verificar site ou importar do Search Console quando houver conta sem aprovação administrativa. |
| Yandex Webmaster | Registro gratuito para descoberta em Yandex e leitura de sitemap. | R$ 0 | Fazer somente com conta autorizada e sem Yandex Metrica/tag externo. |
| Naver Search Advisor | Registro gratuito para coreano/Naver, se houver conta Naver autorizada. | R$ 0 | Verificar site e sitemap sem script runtime. |
| Baidu Search Resource Platform | Registro gratuito para descoberta em chinês, se houver conta Baidu autorizada. | R$ 0 | Tentar apenas domínio global; bloquear ICP, China Network, hospedagem China e serviço pago. |
| Buscas gratuitas de marca/nome | Reduz risco de conflito antes de crescer internacionalmente sem criar custo de depósito. | R$ 0 | Pesquisar `Brikaya`, `BrickBreaker`, domínio, logotipo, transliterações e variações por idioma. |

### 1.2. Monitorar

| Item | Gatilho | Decisão |
| --- | --- | --- |
| Índia - Online Gaming Rules 2026 | Se houver dinheiro, aposta, prêmio real, cash-out, e-sport, notificação de categoria ou determinação da autoridade. | Não registrar agora; manter guardrails sem monetização ao jogador. |
| AdSense / H5 Games Ads | Antes de qualquer anúncio real. | Planejar cadastro e documentos; não ativar no lançamento. |
| Reino Unido / EEA consentimento | Antes de anúncios personalizados para UK/EEA/CH. | Usar CMP certificado quando ads reais entrarem. |
| China continental | Antes de infraestrutura, app store, hospedagem local, ICP, monetização ou aceleração regional. | Não executar no custo-zero; manter apenas domínio global e busca gratuita se conta Baidu permitir. |

### 1.3. Não executar no P0

Registros de marca, copyright/software, patente, modelo de utilidade, desenho industrial, Madrid/WIPO, depósitos nacionais fora de BR/PY e registros que exigem representante/empresa local fora de BR/PY ficam fora do P0 quando forem opcionais e pagos.

## 2. Critérios de inclusão e exclusão

### 2.1. Inclui

- Registro obrigatório para lançar ou manter Brikaya PWA nos países/idiomas cobertos.
- Registro gratuito, mesmo opcional, quando ajuda decisão, descoberta, prova operacional ou redução de risco.
- Procedimento possível para pessoa física ou jurídica brasileira/paraguaia, sem constituir entidade local em terceiro país.
- Cadastro de webmaster gratuito para buscadores relevantes por idioma, quando não exigir conta paga, entidade local, representante, cartão, aprovação administrativa ou script runtime externo.
- Cadastro gratuito de webmaster/ads somente quando não ativa custo, cobrança, campanha ou compra de tráfego.

### 2.2. Exclui

- Registros pagos não obrigatórios.
- Registros de app stores, porque a rota é PWA-only sem lojas.
- Registros que dependem de empresa, endereço, representante obrigatório ou licença local fora de Brasil/Paraguai quando isso for condição de obtenção.
- Compra de domínio adicional, tráfego pago, assinatura, agência, despachante, escritório local ou parecer jurídico pago.
- Qualquer cadastro que peça upgrade, overage, cartão obrigatório para cobrança ou autorização de gastos sem aprovação explícita.
- Qualquer rota chinesa que exija ICP, hospedagem na China continental, Cloudflare China Network, content vetting pago, contrato comercial, entidade local ou app store local.

### 2.3. Interpretação de custo

| Tipo | Tratamento |
| --- | --- |
| Taxa oficial zero | Pode entrar no P0. |
| Taxa oficial variável mas obrigatória | Entra se for exigência legal de P0. |
| Taxa oficial paga e opcional | Fora do P0; documentar custo-fonte para decisão futura. |
| Custos indiretos opcionais | Fora do P0, incluindo advogado, contador, tradução juramentada, agente e anúncio em jornal quando não obrigatório para lançamento. |
| Impostos/recebimento futuro | Monitorar antes de monetização; não são registro de lançamento. |

## 3. Matriz de registros por país/região P0

| País/região | Registro/cadastro | Status P0 | Custo direto | Quem pode fazer | Documentos/requisitos | Decisão |
| --- | --- | --- | ---: | --- | --- | --- |
| Brasil | CLASSIND / Classificação Indicativa | Obrigatório/condicional conservador | R$ 0 | Cidadão, titular de direitos ou representante; brasileiro via gov.br; estrangeiro via usuário/senha do CLASSIND. | Conta gov.br ou acesso CLASSIND; ficha técnica de autoclassificação; sinopse; link/cópia jogável; material de análise; símbolos e descritores corretos. | Preparar e executar como P0. Se MJSP confirmar isenção por browser-only sem armazenamento local, manter como autoclassificação gratuita/documentada. |
| Paraguai | Registro DINAPI de software/direito autoral | Opcional pago | 1 jornal + publicação de edicto, se solicitado | Autor, produtor ou representante autorizado. | Cédula; formulário; depósito da obra; código fonte/objeto; publicação por 3 dias. | Fora do P0: pago e não obrigatório para lançar PWA. |
| Paraguai | Marca DINAPI | Opcional pago | 2 jornales + agente/AGPI + eventuais publicações | PF/PJ via agente de propriedade industrial. | FE-011; cédula autenticada ou docs PJ; poder, se aplicável; assinatura/selos. | Fora do P0: pago e não obrigatório. Fazer só busca gratuita. |
| EUA/Canadá | ESRB | Voluntário para web self-host sem loja; exigido por muitos consoles/lojas/retailers. | R$ 0 via IARC apenas em storefront participante; fora disso pode haver custo/processo próprio. | Publisher/dev via loja participante ou ESRB. | Conteúdo do jogo, materiais de rating, formulário/questionário quando disponível. | Não executar. Sem loja, IARC não é acessível por conta própria. |
| Reino Unido | PEGI/Games Rating Authority | Não identificado como filing obrigatório para PWA web gratuito sem venda física/loja. | Não executar | Publisher via sistema PEGI/IARC quando canal exige. | Build, materiais e formulário quando aplicável. | Não executar no P0; manter informação etária própria/CLASSIND. |
| México | Sistema mexicano de classificação de videojuegos | Obrigação focada em sujeitos obrigados que distribuem/comercializam/arrendam videojogos físicos. | R$ 0 para o PWA, pois não há filing P0 identificado. | Distribuidor/comercializador/arrendador, quando aplicável. | Estampa/classificação em produto físico e publicidade do sujeito obrigado. | Não obrigatório para PWA gratuito sem mídia física, venda ou aluguel. |
| Índia | Online Gaming Authority / PROG Rules 2026 | Não obrigatório enquanto Brikaya for social/casual sem dinheiro, prêmio real ou e-sport. | R$ 0 agora | Service provider se requerer determinação/registro ou for notificado. | Descrição do jogo; user-safety features; grievance mechanism se aplicável; documentos da aplicação se houver notificação. | Monitorar; proibir staking, cash-out, prêmio real, aposta, loot monetizável e e-sport no P0. |
| China global `zh-CN` | Baidu Search Resource Platform | Opcional gratuito se conta Baidu autorizada existir | R$ 0 | Controlador do site com login Baidu. | Login; prova de posse; sitemap. | Tentar apenas como webmaster gratuito. Não fazer ICP, Cloudflare China Network, hospedagem local, app store, pagamento, licença ou monetização. |
| Coreia `ko` | Naver Search Advisor | Opcional gratuito se conta Naver autorizada existir | R$ 0 | Controlador do site com login Naver. | Login; prova de posse; sitemap. | Parcial em 2026-07-04: site adicionado, arquivo HTML público oficial publicado e validado em HTTP 200; verificação final bloqueada por CAPTCHA obrigatório do Naver antes do sitemap. |
| Global/Rússia/adjacentes | Yandex Webmaster | Opcional gratuito se conta Yandex autorizada existir | R$ 0 | Controlador do site com login Yandex. | Login; prova de posse; sitemap. | Concluído em 2026-07-04 por DNS TXT no Cloudflare; sitemap enviado para fila de processamento sem Yandex Metrica/tag externo. |
| Global/web | Google Search Console | Opcional gratuito | R$ 0 | Proprietário/controlador do domínio/site. | Conta Google; prova de propriedade por DNS TXT, HTML file, meta tag ou método aceito; sitemap. | Concluído para domínio. |
| Global/web | Bing Webmaster Tools | Opcional gratuito | R$ 0 | Proprietário/controlador do domínio/site. | Conta Microsoft/Google/Facebook; site; sitemap; verificação por XML/meta/CNAME ou importação do Search Console. | Concluído em 2026-07-04 por CNAME DNS no Cloudflare; sitemap enviado sem custo. |
| Global/web | Buscas gratuitas de marca/nome | Opcional gratuito | R$ 0 | Qualquer responsável pelo projeto. | Lista de termos, transliterações, prints/links de resultado; nenhuma taxa. | Fazer antes de impulsionar SEO internacional; não depositar marca. |
| Global/web | AdSense / H5 Games Ads | Condicional futuro | R$ 0 direto, sem contar tributos/banco/contabilidade | Pessoa física ou jurídica em país suportado, incluindo Brasil/Paraguai conforme disponibilidade. | Conta Google; site/conteúdo próprio; país/endereço de pagamento; dados fiscais; identidade; PIN postal; banco/forma de pagamento; política de privacidade; aprovação H5 separada. | Não executar agora. Documentar gatilhos antes de ads reais. |

## 4. CLASSIND Brasil - decisão P0 detalhada

### 4.1. Por que tratar como P0

A página oficial do MJSP separa mídia física, distribuição digital por download e jogos/apps. Para mídia física, há classificação prévia e taxa zero. Para distribuição digital, jogos/apps podem ser autoclassificados quando seguem critérios brasileiros e exibem símbolos/descritores corretamente. A portaria também traz hipótese de jogo exclusivamente em navegador sem armazenamento local não ser obrigatório; porém Brikaya é PWA instalável e explicitamente funciona offline após primeiro carregamento. Portanto, o tratamento conservador é: considerar o comportamento offline/cache como distribuição digital local e cumprir CLASSIND/autoclassificação.

### 4.2. Custo

- Taxa oficial: R$ 0.
- Custos indiretos: nenhum obrigatório se o próprio mantenedor preparar dossiê e formulário.
- Prazo oficial de análise quando houver solicitação: 30 a 120 dias, conforme página do serviço; página específica de jogos/apps cita até 30 dias para mídia física.
- Validade: indeterminada até eventual revisão normativa/classificatória.

### 4.3. Requisitos/documentos

- Acesso ao sistema CLASSIND.
- Conta gov.br para requerente brasileiro; usuário/senha para estrangeiro quando aplicável.
- Dados do requerente e titular dos direitos.
- Ficha técnica de autoclassificação.
- Sinopse curta e objetiva de Brikaya.
- Link público jogável ou cópia disponibilizada por link.
- Registro do que existe e do que não existe: violência realista, sangue, nudez, sexo, drogas, linguagem imprópria, medo/horror, apostas reais/simuladas, compras, interação entre usuários, localização compartilhada.
- Evidência de gameplay em vídeo ou build jogável se o sistema solicitar material complementar.
- Símbolo/faixa etária e descritores aplicados no site/metadados/área informativa do jogo quando a classificação for definida.

### 4.4. Checklist de execução

- Preparar `Resumo do conteúdo`: jogo arcade de quebra-blocos, sem narrativa adulta, sem chat, sem compra, sem prêmio real, sem aposta, sem multiplayer.
- Preparar `Elementos interativos`: PWA offline, armazenamento local de pontuação/logs, sem interação com outros usuários, sem localização, sem compra digital.
- Preencher ficha técnica no CLASSIND ou registrar autoclassificação conforme rota aceita.
- Publicar ou anexar link `https://brikaya.com/` como cópia acessível.
- Registrar decisão no changelog/documento e manter símbolo/descritores coerentes.

### 4.5. Confirmação recomendada

Enviar consulta curta ao canal oficial se houver dúvida sobre a hipótese “browser-only”: Brikaya roda no navegador, mas usa service worker/cache para jogar offline e pode ser instalado como PWA. Se MJSP responder que isso não exige CLASSIND, rebaixar de obrigatório/condicional para opcional gratuito, mantendo a informação etária como boa prática.

## 5. Registros gratuitos não obrigatórios que entram no P0

### 5.1. Google Search Console

| Campo | Valor |
| --- | --- |
| Custo | R$ 0 direto. |
| Por que considerar | SEO e diagnóstico substituem ASO de loja na rota PWA-only. |
| Requisitos | Conta Google; controle de `brikaya.com`; DNS TXT recomendado para propriedade de domínio; sitemap publicado. |
| Evidência esperada | Propriedade verificada; sitemap enviado; URL principal inspecionada. |
| Risco | Tokens de verificação não devem expor credenciais; preferir DNS TXT quando possível. |
| Estado operacional | Concluído em 2026-07-03: propriedade `sc-domain:brikaya.com` verificada por DNS TXT; sitemap original processado com 1 página; sitemap localizado com 15 URLs canônicas reenviado no Chrome autenticado; reprocessamento das novas URLs fica pendente do Google. |

### 5.2. Bing Webmaster Tools

| Campo | Valor |
| --- | --- |
| Custo | R$ 0 direto. |
| Por que considerar | Cobertura Bing/Microsoft e possibilidade de importar dados do Search Console. |
| Requisitos | Conta Microsoft/Google/Facebook; controle do domínio/site; sitemap; verificação por XML/meta/CNAME/importação. |
| Evidência esperada | Site verificado; sitemap enviado ou importado. |
| Risco | Não adicionar scripts de terceiros no runtime do jogo; usar verificação DNS/arquivo/meta estática. |
| Estado operacional | Concluído em 2026-07-04: site `https://brikaya.com/` verificado por CNAME DNS no Cloudflare; sitemap `https://brikaya.com/sitemap.xml` enviado e exibido como `Submitted/Processing`, com 0 erros e 0 warnings. |

### 5.3. Buscadores por idioma

| Buscador/ferramenta | Idiomas/mercados cobertos | Estado em 2026-07-04 | Regra de custo zero |
| --- | --- | --- | --- |
| Google Search Console | Todos os idiomas no domínio, incluindo `pt-BR`, `en`, `es-419`, `en-IN`, `hi-IN`, `de`, `fr`, `it`, `ja`, `ko`, `id`, `vi`, `fil`, `th`, `zh-CN`. | Concluído para domínio; sitemap multilíngue com 15 URLs canônicas reenviado após i18n/SEO. | Aguardar reprocessamento das novas URLs localizadas; reenviar sitemap quando novas rotas reais forem adicionadas. |
| Bing Webmaster Tools | Global/Bing/Copilot. | Concluído: site verificado por CNAME DNS e sitemap enviado. | Manter sem Clarity, ads, importação paga, aprovação administrativa ou script runtime. |
| Yandex Webmaster | Mercados onde Yandex ainda traz descoberta orgânica. | Concluído: site verificado por DNS TXT e sitemap enviado para fila de processamento. | Sem Yandex Metrica/tag externo; manter somente domínio e sitemap. |
| Naver Search Advisor | Coreano/`ko`. | Parcial: site adicionado, termo gratuito aceito, arquivo HTML público oficial publicado e HTTP 200; CAPTCHA obrigatório bloqueia confirmação final e envio de sitemap. | Não resolver CAPTCHA sem confirmação explícita; sem script runtime; arquivo público é o único artefato de verificação. |
| Baidu Search Resource Platform | Chinês simplificado/`zh-CN`. | Pendente por conta Baidu autorizada. | Sem ICP, China Network, hospedagem China, app store, monetização ou serviço pago. |

Rotas localizadas publicadas em 2026-07-04 (`/en/`, `/zh-CN/` e demais) já têm HTML/metadados localizados, canonical próprio, sitemap multilíngue e `hreflang`. Os cadastros Bing/Yandex usam o mesmo `https://brikaya.com/sitemap.xml`, agora com 15 URLs canônicas.

### 5.4. Buscas gratuitas de marca/nome

Buscas não registram direito novo, mas reduzem risco antes de internacionalizar SEO e materiais públicos. Guardar evidência textual de data, termo, base consultada e resultado sintético; não salvar dados pessoais de terceiros além do mínimo público necessário.

| Base | Link operacional | Termos mínimos |
| --- | --- | --- |
| INPI Brasil | <https://busca.inpi.gov.br/pePI/> | `Brikaya`, `BrickBreaker`, `Brikaya Games`, logotipo/nome visual. |
| DINAPI Paraguai | <https://www.dinapi.gov.py/> | `Brikaya`, `BrickBreaker`, variações fonéticas simples. |
| USPTO EUA | <https://tmsearch.uspto.gov/> | `Brikaya`, `Brick Breaker`, `Brikaya arcade`. |
| WIPO Global Brand Database | <https://branddb.wipo.int/> | Busca global de marca nominativa e imagem se houver. |
| EUIPO eSearch | <https://euipo.europa.eu/eSearch/> | `Brikaya` para risco na União Europeia. |
| UK IPO | <https://trademarks.ipo.gov.uk/ipo-tmtext> | `Brikaya` e variações. |
| CIPO Canadá | <https://ised-isde.canada.ca/cipo/trademark-search/> | `Brikaya`, `BrickBreaker`. |
| IMPI México / Marcanet | <https://marcia.impi.gob.mx/marcas/search> | `Brikaya`, `BrickBreaker`. |
| IP India | <https://ipindiaonline.gov.in/tmrpublicsearch/frmmain.aspx> | `Brikaya`, `BrickBreaker`. |
| China/Baidu/web chinês | <https://ziyuan.baidu.com/site/index> e busca web local gratuita | `Brikaya`, `布里卡亚` se adotado, transliterações revisadas. |
| Coreia/Naver/web coreano | <https://searchadvisor.naver.com/> e busca web local gratuita | `Brikaya`, transliteração coreana se adotada, `BrickBreaker`. |
| Web/domínios | Buscadores gerais, registradores e redes públicas | domínio principal, variações `.com`, perfis sociais. |

## 6. Itens condicionais futuros

### 6.1. AdSense e H5 Games Ads

Não faz parte do lançamento porque `docs/dist/projeto-pwa.md` mantém anúncios reais como futuro e porque o jogo precisa continuar funcional offline. Antes de qualquer anúncio real:

| Requisito | Documento/dado exigido | Custo direto | Observação |
| --- | --- | ---: | --- |
| Conta AdSense | Conta Google; site/conteúdo próprio; país de pagamento onde o titular mora e recebe PIN. | R$ 0 | País não pode ser escolhido de forma fictícia. Brasil e Paraguai constam como disponíveis na página oficial de disponibilidade. |
| Site aprovado | URL pública, conteúdo próprio, políticas do programa, navegação funcional. | R$ 0 | Brikaya deve ter conteúdo jogável e páginas legais suficientes. |
| Pagamentos | Nome/endereço corretos, identidade, PIN por correio, banco/forma de pagamento. | R$ 0 direto | Pode haver custo bancário/contábil fora do Google. |
| Dados fiscais | Formulários fiscais aplicáveis; TIN quando exigido; certificado de residência fiscal se usado para tratado. | R$ 0 direto | Pode haver retenção maior se não completar. Consultoria tributária é opcional e fora do P0. |
| Política de privacidade | Disclosure de cookies Google/terceiros, publicidade personalizada e opt-out. | R$ 0 | Deve existir antes de ads reais. |
| H5 Games Ads | AdSense aprovado; formulário de acesso H5; aprovação por aplicação. | R$ 0 | Acesso não é garantido. |
| UK/EEA/CH consentimento | CMP certificado Google/IAB TCF para anúncios personalizados. | R$ 0 se usar ferramenta gratuita adequada; pago se escolher terceiro pago. | Não ativar personalized ads sem CMP válido onde exigido. |

### 6.2. Guardrails de monetização para manter Índia fora de registro

- Não aceitar aposta, stake, buy-in, entrada paga para jogar, prêmio monetário, saque, marketplace de itens, token, NFT ou cash-out.
- Não transformar ranking em competição premiada.
- Não vender loot box ou item aleatório monetizável.
- Não vender “rewarded ad” como ganho financeiro; se rewarded ads entrarem, usar benefício limitado, claro e não conversível em dinheiro.
- Não declarar Brikaya como e-sport sem nova análise.
- Manter mecanismo de contato/reclamação documentado antes de escala internacional com ads.

## 7. Registros pagos opcionais excluídos do P0

### 7.1. Brasil - INPI

| Registro | Custo oficial citado | Documentos/requisitos | Por que fica fora do P0 |
| --- | ---: | --- | --- |
| Registro de programa de computador | Tabela vigente INPI 2025/2026 indica R$ 210 para pedido RPC; guia básico antigo ainda cita R$ 185. Confirmar valor na GRU antes de pagar. | Cadastro INPI; GRU; hash do código-fonte; Declaração de Veracidade assinada digitalmente; e-CPF/e-CNPJ ICP-Brasil. | Pago e opcional; proteção autoral existe independentemente do registro. |
| Marca nominativa/mista | Tabela INPI 2025/2026 indica valores por classe; pedido com especificação pré-aprovada aparece como R$ 360/R$ 880 conforme etapa/regra da tabela, com desconto de 50% para perfis elegíveis. | Cadastro; GRU; especificação de produtos/serviços; representação da marca se mista; documentos do titular/procurador. | Pago e opcional; fazer só busca gratuita P0. |
| Desenho industrial | Tabela INPI indica pedido base de R$ 350, com desconto quando aplicável. | Relatório/desenhos/figuras; GRU; dados do titular/autor. | Pago e opcional; UI/sprites não exigem depósito para lançar PWA. |
| Patente/modelo de utilidade | Pago e tecnicamente improvável para mecânica clássica/software puro. | Relatório descritivo, reivindicações, resumo, desenhos, GRU, possível procurador. | Fora do P0; não é obrigatório e pode nem ser cabível. |

### 7.2. Paraguai - DINAPI

| Registro | Custo oficial citado | Documentos/requisitos | Por que fica fora do P0 |
| --- | ---: | --- | --- |
| Software/direito autoral | 1 jornal + publicação de edicto por 3 dias. Em 2026-07-03, MTESS informa jornal mínimo de G. 117.077 a partir de 2026-07-01; logo a taxa oficial base equivale a G. 117.077, sem incluir jornal/diário. | Cédula; formulário Nro. 024; duas vias; suporte com software; código fonte e objeto; manuais se existirem; edicto; espera de 30 dias úteis. | Pago e opcional; proteção autoral é automática segundo DINAPI. |
| Marca | 2 jornales. Em 2026-07-03, base estimada: G. 234.154, sem incluir agente/AGPI e eventuais custos adicionais. | FE-011; duas vias; assinatura do solicitante e AGPI; cédula autenticada para PF; poder se aplicável. | Pago e opcional; fazer só busca gratuita P0. |
| Patentes/desenhos/modelos | Pago/complexo; varia por trâmite. | Dossiê técnico, formulários, taxas e possível agente. | Fora do P0 por custo e ausência de exigência para PWA. |

### 7.3. EUA, Canadá, Reino Unido, México, Índia e sistemas internacionais

| Registro | Decisão |
| --- | --- |
| USPTO trademark federal | O USPTO declara que o depósito federal é escolha do titular; pago/opcional. Fazer busca gratuita, não depositar. |
| Copyright Office EUA | Pago/opcional para registro; fora do P0. Direitos autorais não dependem de registro para existir, embora registro possa ter efeitos probatórios/processuais locais. |
| CIPO/UK IPO/IMPI/IP India marca | Pago/opcional; fora do P0. Fazer busca gratuita. |
| Madrid/WIPO marca internacional | Pago e dependente de estratégia multi-país; fora do P0. |
| PEGI/ESRB/IARC via loja | Fora do P0 sem loja; IARC só via storefront participante. |
| Patentes internacionais/PCT | Pago, complexo e não obrigatório; fora do P0. |

## 8. Checklist operacional P0

### 8.1. Conteúdo CLASSIND

- [ ] Confirmar URL pública canônica `https://brikaya.com/`.
- [ ] Escrever sinopse curta do jogo.
- [ ] Listar descritores ausentes/presentes.
- [ ] Preparar resposta sobre PWA offline/cache: service worker, instalação pelo navegador e jogo offline.
- [ ] Preparar vídeo curto de gameplay se necessário.
- [ ] Preencher ficha técnica/autoclassificação no CLASSIND ou registrar autoclassificação conforme rota aceita.
- [ ] Aplicar símbolo/descritores no local público do site quando definido.

### 8.2. Descoberta gratuita

- [x] Verificar `brikaya.com` no Google Search Console por DNS TXT.
- [x] Enviar sitemap.
- [x] Reenviar sitemap localizado com 15 URLs canônicas no Google Search Console.
- [x] Inspecionar URL principal e solicitar indexação inicial.
- [x] Confirmar que sitemap multilíngue/`hreflang` foi publicado após rotas localizadas reais com metadados próprios.
- [ ] Verificar/importar site no Bing Webmaster Tools com conta não bloqueada por aprovação administrativa.
- [ ] Verificar site no Yandex Webmaster com conta autorizada.
- [ ] Verificar site no Naver Search Advisor com conta autorizada.
- [ ] Verificar site no Baidu Search Resource Platform com conta autorizada e sem rota China paga.
- [ ] Salvar resumo de busca gratuita de marca/nome por base oficial.

### 8.3. Monitoramento futuro

- [ ] Revisar Índia PROG se Brikaya ganhar recursos online competitivos, prêmio, pagamento ou e-sport.
- [ ] Revisar AdSense/H5 somente quando anúncios forem autorizados.
- [ ] Revisar CMP UK/EEA/CH antes de qualquer anúncio personalizado.
- [ ] Reavaliar marca registrada paga somente após tração, receita ou risco real de conflito.

## 9. Fontes oficiais e consulta

Data de consulta: 2026-07-03. Usar a tabela vigente do órgão quando houver divergência entre guia antigo e tabela de retribuições.

| Tema | Fonte |
| --- | --- |
| Brasil CLASSIND jogos/apps | [Jogos e Apps - MJSP](https://www.gov.br/mj/pt-br/assuntos/seus-direitos/classificacao-1/paginas-classificacao-indicativa/jogos-e-apps) |
| Brasil CLASSIND serviço | [Obter Classificação Indicativa](https://www.gov.br/pt-br/servicos/obter-classificacao-indicativa) |
| IARC acesso/custo | [IARC FAQ](https://globalratings.com/faq/) e [IARC](https://www.globalratings.com/) |
| México videojuegos | [DOF/SEGOB - Lineamientos de videojuegos](https://sidof.segob.gob.mx/notas/docFuente/5606047) |
| Índia online gaming | [PIB - Online Gaming Rules 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2254606&lang=1&reg=3) e [MeitY PROG Act PDF](https://www.meity.gov.in/static/uploads/2025/10/8a7f103cefc68ed8aaa2ebc9a2ed7c13.pdf) |
| AdSense conta | [Create an AdSense account](https://support.google.com/adsense/answer/7402253?hl=en) |
| AdSense disponibilidade | [AdSense availability](https://support.google.com/adsense/answer/13402307?hl=en) |
| AdSense pagamento | [Steps to getting paid](https://support.google.com/adsense/answer/1709858?hl=en) |
| AdSense privacidade | [Required content](https://support.google.com/adsense/answer/1348695?hl=en) |
| H5 Games Ads | [Get started with AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170?hl=en) e [Ad Placement API signup](https://developers.google.com/ad-placement/docs/signup) |
| CMP Google | [Google consent management requirements](https://support.google.com/adsense/answer/13554116?hl=en) |
| Google Search Console | [Search Console](https://search.google.com/search-console/about) e [Verify your site ownership](https://support.google.com/webmasters/answer/9008080?hl=en) |
| Bing Webmaster Tools | [Bing Webmaster Tools](https://www.bing.com/toolbox/webmaster/) e [Add and Verify site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b) |
| INPI custos | [Tabela de retribuições INPI](https://www.gov.br/inpi/pt-br/inpi-data/precificacao-dos-servicos/tabela-de-retribuicoes-inpi_portaria-mdic-no110_2025-e-portaria-inpi-no-10_2025.pdf) |
| INPI software | [Registro de Programa de Computador - INPI](https://www.gov.br/inpi/pt-br/servicos/programas-de-computador/arquivos/guia-basico/REGISTRODEPROGRAMADECOMPUTADOR3.pdf) |
| DINAPI registros | [DINAPI - Como registrar](https://www.dinapi.gov.py/portal/v3/derecho-de-autor/como-registrar/) |
| DINAPI software | [Instructivo Derecho de Autor para Software](https://www.dinapi.gov.py/portal/v3/assets/biblioteca/documentos/Instructivo-Industria-del-Software-1.2-6.pdf) |
| DINAPI marca | [Requisitos para registro de marca](https://mosaico.dinapi.gov.py/osticket/v011401/kb/faq.php?id=25) |
| Paraguai jornal mínimo | [MTESS - reajuste 2026](https://www.mtess.gov.py/?p=36166) e [Decreto 6225/2026](https://www.mtess.gov.py/wp-content/uploads/2026/06/DECRETO-N%C2%B0-6225-SALARIO-MINIMO-2026.pdf) |
| Google páginas localizadas | [Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| Yandex sitemap | [Sitemap files - Yandex Webmaster](https://yandex.com/support/webmaster/en/indexing-options/sitemap) |
| Naver webmaster/sitemap | [Naver Search Advisor](https://searchadvisor.naver.com/start) e [RSS/site map](https://searchadvisor.naver.com/guide/request-feed) |
| Baidu site management | [Baidu Search Resource Platform](https://ziyuan.baidu.com/site/index) |
| Cloudflare China Network | [Cloudflare China Network FAQ](https://developers.cloudflare.com/china-network/faq/) |
| USPTO marca opcional | [Why register your trademark?](https://www.uspto.gov/trademarks/basics/why-register-your-trademark) |
| ESRB | [ESRB FAQ](https://www.esrb.org/faqs/) |
| Reino Unido PEGI | [UK GOV - PEGI rules](https://www.gov.uk/government/news/new-rules-to-better-protect-children-from-inappropriate-video-game-content) |

## 10. Decisão final P0

1. Nenhum registro pago de PI é obrigatório para lançar Brikaya como PWA-only.
2. O único registro regulatório tratado como P0 obrigatório/condicional é CLASSIND Brasil, por custo zero e por ambiguidade conservadora do PWA offline.
3. Search Console, Bing Webmaster Tools, Yandex, Naver, Baidu e buscas gratuitas de marca/nome entram no P0 apenas quando não custam e ajudam distribuição web sem lojas.
4. Monetização via AdSense/H5 é futura, gratuita para cadastrar, mas condicionada a aprovação, documentos fiscais/pagamento, privacidade e possível consentimento UK/EEA/CH.
5. Índia permanece sem registro enquanto Brikaya não envolver dinheiro, aposta, prêmio real, e-sport ou categoria notificada.
6. Qualquer mudança para app store, anúncios reais, compra de tráfego, prêmio real, ranking premiado, loja nativa, depósito de marca/software/patente, ICP/China Network/hospedagem China ou ativação comercial exige nova decisão fora deste P0.
