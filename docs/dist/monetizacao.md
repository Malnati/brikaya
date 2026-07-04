<!-- docs/dist/monetizacao.md -->
# Monetização P0 PWA-only — Brikaya

Este documento define o plano operacional P0 para preparar monetização futura de Brikaya como PWA-only. Ele não é parecer jurídico, contábil ou fiscal. A execução de anúncios reais, recebimento de receita, escolha PF/PJ e tratamento tributário dependem de validação posterior com profissionais habilitados e com as plataformas envolvidas.

Esta entrega é somente documental: não ativa anúncios reais, não adiciona script externo, não cria slot, não inclui ID de publisher, não muda runtime, não muda service worker, não muda manifesto e não altera a experiência offline do jogo.

## 1. Decisão executiva P0

A decisão P0 é: **não monetizar no lançamento P0; preparar elegibilidade e governança**.

Brikaya deve primeiro consolidar uma presença PWA confiável em `https://brikaya.com/`, com tráfego orgânico legítimo, conteúdo próprio, privacidade clara, consentimento quando exigido e prova de retenção. Ads reais só podem ser considerados em fase posterior, depois de:

1. site e conta elegíveis para AdSense;
2. eventual acesso aprovado a H5 Games Ads;
3. decisão explícita de exceção à regra offline para anúncios online opcionais;
4. consentimento e privacidade tratados por região;
5. titularidade fiscal definida;
6. revisão contábil/fiscal do titular;
7. QA publicado no domínio canônico comprovando que o jogo segue funcionando offline sem depender de anúncios.

P0 não mede sucesso por receita. P0 mede sucesso por prontidão: site apto, conteúdo próprio, política clara, tráfego legítimo, retenção real e ausência de riscos básicos de conta.

## 2. Premissas fixas

| Tema | Premissa P0 | Decisão operacional |
| --- | --- | --- |
| Produto | Brikaya é PWA publicado em `https://brikaya.com/`. | Monetização futura deve partir do domínio canônico. |
| Offline | O jogo principal funciona offline após primeiro carregamento. | Ads reais não podem ser requisito para jogar. |
| Publicação | Cloudflare Pages zero-custo segue como rota web. | Não criar dependência paga para monetização P0. |
| Lojas | Google Play, Apple App Store e Microsoft Store ficam fora do P0. | Sem app store, sem review de loja, sem SDK nativo. |
| AdMob | AdMob nativo fica fora do P0. | AdMob só caberia em rota nativa/WebView futura, não PWA-only P0. |
| WebView monetizado | WebView Android/iOS fica fora do P0. | Não misturar PWA canônica com wrapper nativo nesta fase. |
| Tráfego pago | Compra de tráfego fica bloqueada em P0. | Não ativar Google Ads, App Campaigns, Performance Max ou equivalentes. |
| Scripts externos | Nenhum script real de ads nesta entrega. | `ads_disabled` permanece padrão. |
| Segredos/IDs | Nenhum ID real de publisher, slot, conta, chave ou token entra no Git. | Documentar apenas decisões e nomes conceituais. |

Essas premissas existem para proteger o contrato central do projeto: Brikaya precisa continuar sendo jogável, instalável e útil mesmo sem rede depois do primeiro carregamento.

## 3. Definição de P0

P0 cobre apenas mercados e idiomas necessários para validar a rota PWA inicial sem espalhar esforço de localização, consentimento e suporte.

| Mercado P0 | Locale | Objetivo | Motivo | Condição de monetização futura |
| --- | --- | --- | --- | --- |
| Brasil | `pt-BR` | Base original, validação de conteúdo, LGPD e tráfego orgânico inicial. | O projeto nasce em português, com maior controle linguístico e operacional. | Política de privacidade compatível, titularidade definida e nenhuma promessa de ganho ao jogador. |
| Estados Unidos, Canadá e Reino Unido | `en` | Validar inglês P0 e audiência de maior valor publicitário futuro. | Inglês amplia alcance internacional com um único pacote textual inicial. | Reino Unido exige gate de consentimento antes de ads personalizados; EUA/Canadá exigem atenção a privacidade e público infantil/misto. |
| México e LATAM hispânica | `es-419` | Validar escala regional em espanhol latino-americano. | Um locale regional evita fragmentação precoce e permite distribuição orgânica por links/comunidades. | Privacidade clara, tráfego legítimo e nada de incentivo a clique ou recompensa externa. |
| Índia | `en-IN` | Testar escala mobile/web em mercado grande, com baixo custo inicial de localização. | Inglês indiano permite entrada antes de tradução dedicada. | Monetização só após retenção real, revisão de público e decisão posterior sobre `hi-IN`. |
| Índia futura condicionada | `hi-IN` | Expandir alcance local se `en-IN` provar tração. | Hindi só faz sentido após dados P0 e revisão linguística. | Fora desta versão; não implementar nem prometer. |

País do jogador influencia idioma, consentimento, privacidade, demanda publicitária e eCPM futuro. Ele não obriga, por padrão, criação de empresa local. Titularidade de pagamento depende do país fiscal real do recebedor, documentos, endereço, forma de pagamento e regras das plataformas.

P1 e P2 ficam fora desta versão. Europa continental, Japão, Coreia do Sul, Indonésia, Vietnã, Filipinas, Tailândia e outros mercados só devem avançar após P0 provar retenção, operação e governança.

## 4. Tese de monetização P0

A tese é: Brikaya pode se tornar monetizável como jogo HTML5/PWA, mas P0 deve provar maturidade antes de pedir ou ativar anúncios.

Antes de qualquer receita, Brikaya precisa demonstrar:

- conteúdo próprio, original e suficiente;
- páginas indexáveis e acessíveis no domínio canônico;
- política de privacidade clara;
- tráfego real e legítimo;
- retenção mensurável;
- experiência offline íntegra;
- ausência de incentivo a clique;
- ausência de posicionamento que induza clique acidental;
- titularidade fiscal definida;
- critérios regionais de consentimento mapeados.

P0 não deve prometer receita, lucro, RPM, eCPM, payback, ganho por usuário ou qualquer expectativa financeira. Receita de ads depende de aprovação de conta/site, volume de tráfego, país, formato, demanda de anunciantes, sazonalidade, câmbio, impostos, taxas bancárias e qualidade do tráfego. Sem dados reais de ads aprovados, qualquer número seria hipótese fraca.

## 5. Estados operacionais de ads

Brikaya deve usar estados de decisão para impedir ativação acidental de anúncios.

| Estado | Descrição | Permitido em P0? | Requisitos |
| --- | --- | --- | --- |
| `ads_disabled` | Estado atual. Sem anúncio real, sem script externo, sem ID real e sem chamada de rede publicitária. | Sim. É o padrão e único estado executável no P0. | Jogo offline continua íntegro. |
| `ads_readiness` | Prontidão documental e operacional: privacidade, conteúdo, SEO, elegibilidade, titularidade e gate de ativação definidos. | Sim. Este é o máximo que P0 pode entregar. | Nenhum código real de ads; nenhum ID versionado. |
| `ads_test` | Integração técnica futura com modo de teste, consentimento validado e QA publicado. | Não. Futuro PR técnico. | Plano próprio, IDs de teste, consentimento e validação no domínio canônico. |
| `ads_live` | Anúncios reais aprovados e publicados. | Não. Futuro bloqueado. | AdSense/H5 aprovado, consentimento, revisão fiscal, QA publicado e autorização explícita. |

P0 termina no máximo em `ads_readiness`. Qualquer tentativa de ir para `ads_test` ou `ads_live` nesta entrega viola o escopo.

## 6. Formatos permitidos e proibidos

### Permitidos apenas como plano futuro

| Formato | Decisão P0 | Condição futura |
| --- | --- | --- |
| AdSense display na página | Documentar como opção web futura. | Site aprovado, layout seguro, privacidade e consentimento quando exigido. |
| H5 Games Ads / Ad Placement API | Documentar como melhor encaixe futuro para jogo HTML5/canvas. | Acesso/aprovação H5 e AdSense aprovado; conta elegível. |
| Interstitial entre fases | Permitido apenas como conceito futuro. | Só em transição natural, pausa ou fim; nunca durante jogada contínua. |
| Rewarded | Permitido apenas como hipótese futura. | Só voluntário, claro, aprovado e sem vantagem enganosa. |

### Proibidos em P0

- AdMob nativo.
- SDK de app store.
- WebView monetizado.
- Anúncios durante gameplay contínuo.
- Anúncios sobre controles, canvas ativo ou área de toque crítica.
- Anúncio obrigatório para iniciar, continuar ou terminar uma partida.
- Anúncio offline.
- Pedido para o usuário clicar.
- Pedido para amigos/testadores clicarem.
- Incentivo financeiro ou recompensa externa por clique.
- Posicionamento que pareça botão, menu, power-up, download, prêmio ou item do jogo.
- Qualquer script, slot ou ID real versionado no Git.

## 7. Conflito offline x anúncios

Texto normativo para Brikaya:

> O jogo principal continua offline após primeiro carregamento; anúncios reais, se aprovados no futuro, são online-only, opcionais, consentidos quando exigido e nunca necessários para jogar.

Essa regra separa produto de monetização. O jogo precisa funcionar sem ads. Se o navegador estiver offline, se o usuário negar consentimento, se a conta de ads estiver indisponível ou se a chamada publicitária falhar, Brikaya deve continuar jogável.

Se a exceção offline não for aprovada explicitamente, o estado permanece `ads_disabled`.

Em qualquer fase futura, modo offline deve ocultar/desativar publicidade real sem quebrar:

- canvas;
- menus;
- controles;
- pontuação;
- logs;
- estatísticas;
- install prompt da PWA;
- service worker;
- cache do jogo;
- progressão de fase.

Ads reais não podem ser pré-cacheados como parte do jogo, porque dependem de rede, consentimento, medição e políticas externas. O cache offline deve continuar pertencendo ao produto, não ao inventário publicitário.

## 8. Elegibilidade AdSense/H5

As fontes oficiais relevantes para P0 são:

- [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en)
- [H5 Games Ads](https://support.google.com/adsense/answer/9959170?hl=en)
- [Ad Placement API signup](https://developers.google.com/ad-placement/docs/signup)

Pontos oficiais traduzidos para decisão operacional:

- AdSense exige conteúdo próprio, aderência a políticas, idade mínima e acesso ao HTML do site.
- H5 Games Ads é uma rota para jogos HTML5 e usa a Ad Placement API, mas depende de elegibilidade/aprovação.
- Acesso a H5 Games Ads não é garantido; há aprovação por aplicação e necessidade de AdSense aprovado.

Checklist P0 antes de solicitar ou preparar ads:

| Item | Estado esperado P0 | Bloqueio se ausente |
| --- | --- | --- |
| Domínio canônico ativo | `https://brikaya.com/` responde como destino principal. | Não solicitar ads em origem temporária ou inconsistente. |
| Conteúdo próprio | Nome, textos, assets, jogo, metadados e páginas são próprios ou licenciados. | Risco de rejeição e risco jurídico. |
| Conteúdo suficiente | Página/site explica o jogo, privacidade, contato e contexto mínimo. | Site pode parecer vazio, fraco ou sem valor. |
| HTML acessível | Páginas principais podem ser inspecionadas e indexadas. | Risco de reprovação ou baixa descoberta. |
| Páginas institucionais | Privacidade, contato/suporte e informações básicas planejadas/publicadas antes de ads. | Risco de baixa confiança e compliance fraco. |
| Política de privacidade | Linguagem clara sobre dados, armazenamento local, cookies/ads futuros. | Não ativar ads. |
| Ausência de concorrentes | Sem usar marcas de jogos concorrentes em UI, SEO ou copy pública. | Risco de marca, política e qualidade. |
| Conteúdo não copiado | Não copiar descrições, screenshots, reviews ou keywords de terceiros. | Risco de rejeição e infração. |
| Tráfego orgânico legítimo | Origem por SEO, link direto, comunidades permitidas e referral honesto. | Não comprar tráfego duvidoso. |
| Titular adulto | Titular maior de 18 anos ou responsável adulto, conforme requisito AdSense. | Não abrir conta inadequada. |
| Conta/titular definidos | PF/PJ escolhida antes de receita real. | Evitar perfil de pagamento errado. |

## 9. Regras de posicionamento e UX de ads

Fontes oficiais:

- [Ad Placement API placement types](https://developers.google.com/ad-placement/docs/placement-types)
- [AdSense ad placement policies](https://support.google.com/adsense/answer/1346295?hl=en)

P0 só define política futura. Não há implementação de ads.

Interstitial futuro só pode ser estudado em transições naturais:

- fim de fase;
- pausa voluntária;
- tela de fim de partida;
- antes da próxima fase, com jogo parado;
- retorno de menu não crítico, se o usuário já interrompeu a ação.

Interstitial futuro é proibido:

- no meio da bola em movimento;
- no momento de toque/click de controle principal;
- sobre power-up, botão, canvas ativo ou HUD crítico;
- após cada interação;
- de surpresa durante gameplay contínuo;
- em sequência logo após outro anúncio em tela cheia;
- com layout que pareça parte do jogo.

Rewarded futuro só pode ser considerado se for:

- voluntário;
- claro;
- opcional;
- compreensível antes do usuário aceitar;
- aprovado pelas políticas aplicáveis;
- sem bloquear progressão normal;
- sem vantagem enganosa;
- sem induzir criança ou jogador vulnerável;
- sem recompensa financeira externa.

Rótulos futuros, se houver, devem ser neutros e claros, como “Publicidade” ou “Anúncio”. Não usar textos que peçam clique, sugiram apoio financeiro por clique ou confundam anúncio com recurso do jogo.

## 10. Consentimento e privacidade P0

P0 prepara a matriz de consentimento; não implementa CMP nem anúncios.

Fonte oficial para EEA/UK/Suíça:

- [Google CMP requirements for EEA/UK/Switzerland](https://support.google.com/admanager/answer/13554020?hl=en)

| Região P0 | Risco/necessidade | Decisão P0 |
| --- | --- | --- |
| Brasil | LGPD antes de ads reais, com clareza sobre dados, cookies, armazenamento local e publicidade futura. | Preparar política; não ativar ads. |
| Estados Unidos | Atenção a privacidade estadual e público infantil/misto. | Evitar claims infantis; revisar classificação de público antes de ads. |
| Canadá | Política de privacidade clara e atenção a consentimento conforme aplicável. | Tratar como mercado inglês com revisão própria antes de ads. |
| Reino Unido | Consentimento compatível antes de ads personalizados. | Não ativar ads personalizados sem gate de consentimento. |
| EEA/Suíça atingidos por tráfego em inglês | Google exige CMP certificada integrada ao TCF quando aplicável para ads personalizados. | Se tráfego europeu for servido com ads, implementar CMP antes de `ads_live`. |
| México/LATAM hispânica | Privacidade clara, sem promessa de ganho e sem tráfego incentivado. | Usar linguagem simples em `es-419`; sem ads em P0. |
| Índia | Privacidade clara, atenção a público jovem/misto e idioma. | Monetização só após retenção e revisão de público. |

A política de privacidade futura deve explicar, em linguagem de usuário:

- dados salvos localmente pelo jogo;
- funcionamento offline;
- se há ou não cookies não essenciais;
- uso opcional de região aproximada para sugerir idioma, sem salvar coordenadas e sem envio externo;
- como anúncios futuros podem depender de rede/consentimento;
- que jogar não depende de aceitar publicidade personalizada;
- canal de contato/suporte.

A página pública inicial de privacidade/termos deve existir antes de ativar sugestão de idioma por região. Essa página não autoriza ads reais, CMP ou scripts externos; ela só cobre dados locais, idioma e consentimento opcional de região.

## 11. Titularidade PF/PJ em P0

Fontes oficiais:

- [AdSense account types](https://support.google.com/adsense/answer/32750?hl=en)
- [AdSense availability](https://support.google.com/adsense/answer/13402307?hl=en)
- [LATAM Hyperwallet payout announcement](https://support.google.com/adsense/answer/17148970)

Regra central: separar “país da audiência” de “país fiscal do recebedor”. Usuários no Brasil, Estados Unidos, Canadá, Reino Unido, México, LATAM ou Índia não obrigam empresa nesses países por padrão. O que precisa bater é o titular real da conta de pagamentos, documentos, endereço, banco/forma de recebimento e obrigações fiscais do recebedor.

| Rota de titularidade | Viabilidade operacional em tese | Condições antes de ads reais | Risco se escolher errado |
| --- | --- | --- | --- |
| PF Brasil | Possível em tese se a receita pertencer à pessoa física brasileira. | CPF/documento, endereço, forma de pagamento aceita, dados fiscais e orientação sobre Carnê-Leão/declaração quando aplicável. | Receita no perfil errado, imposto mal tratado, retrabalho de conta. |
| PF Paraguai | Possível em tese se a receita pertencer à pessoa física paraguaia. | Documento/cédula, endereço, forma de pagamento aceita, dados fiscais e validação local sobre RUC/atividade recorrente quando aplicável. | Dificuldade documental, recebimento ou obrigação fiscal não prevista. |
| EAS Paraguai | Possível em tese como organização se a receita pertencer à pessoa jurídica. | EAS constituída, RUC, documentos, representante autorizado e perfil de pagamentos coerente com organização. | Conta individual aberta por engano pode exigir cancelamento/recriação ou travar recebimento. |
| Empresa nos países P0 | Não exigida por padrão só porque há usuários nesses países. | Avaliar apenas se houver operação local, contrato, filial, venda direta, obrigação regulatória específica ou estratégia fiscal própria. | Custo e complexidade desnecessários. |

Decisão P0:

1. Não abrir conta de ads até definir se receita pertence a PF ou EAS.
2. Não usar país, endereço, banco ou documento artificial para tentar melhorar eCPM, aprovação ou pagamento.
3. Não tratar audiência internacional como exigência automática de empresa internacional.
4. Validar com contador no país fiscal real do recebedor antes de `ads_live`.
5. Registrar nos docs futuros apenas nomes lógicos; nunca IDs reais de conta ou pagamento.

## 12. Métricas P0 antes de ads

Antes de ads aprovados, Brikaya deve medir produto e prontidão, não receita.

| Métrica P0 | Pergunta respondida | Uso |
| --- | --- | --- |
| Usuários por país | Onde há audiência real? | Priorizar idiomas e consentimento. |
| Idioma | Qual locale é usado? | Validar `pt-BR`, `en`, `es-419`, `en-IN`. |
| Retorno | Jogadores voltam? | Provar retenção antes de monetizar. |
| Sessões | Há uso recorrente? | Avaliar maturidade de tráfego. |
| Fases jogadas | Jogo engaja além do primeiro contato? | Decidir se interstitial futuro teria pausa natural suficiente. |
| Instalação PWA quando disponível | Usuários instalam? | Medir profundidade de engajamento. |
| Origem orgânica/referral | Tráfego vem de fontes legítimas? | Reduzir risco de tráfego inválido. |
| Erros/offline | Offline e PWA funcionam? | Proteger contrato principal. |
| Retenção por URL/PWA instalada | Instalar melhora retorno? | Guiar evolução PWA sem loja. |

Não usar eCPM, RPM, CTR de anúncio ou receita estimada antes de ads aprovados. Esses indicadores só fazem sentido em `ads_test`/`ads_live` e mesmo assim precisam ser interpretados com cuidado.

Não instalar analytics pago ou ferramenta que quebre offline nesta fase. Qualquer medição futura precisa respeitar zero-custo, privacidade, consentimento e funcionamento do jogo sem rede.

### 12.1. Impulsionamento externo sem publicidade no jogo

Impulsionar Brikaya fora do jogo não muda o estado `ads_disabled`. Google Ads, Meta Ads, Reddit Ads ou TikTok Ads podem ser preparados como canais de aquisição externa, mas não podem inserir anúncio, pixel, tag, SDK, cookie de terceiros, publisher ID, slot ou script no runtime do jogo.

O plano operacional e o teto futuro de R$500 ficam registrados em `docs/dist/pendencias-publicacao-impulsionamento.md`. Qualquer cadastro deve parar antes de cartão, saldo, campanha ativa, cobrança, assinatura, upgrade, crédito ou obrigação financeira.

Parâmetros UTM são permitidos nos links de campanha para diferenciar origem manualmente, desde que canonical, `hreflang`, sitemap e metadados públicos continuem apontando para URLs limpas no domínio `https://brikaya.com/`.

## 13. Gate de ativação futura

Antes de sair de `ads_disabled`, todos os itens abaixo precisam estar verdadeiros:

| Gate | Critério | Evidência esperada |
| --- | --- | --- |
| Site aprovado | AdSense/site elegível ou etapa equivalente concluída. | Recibo operacional sem dados sensíveis. |
| H5 avaliado | H5 Games Ads solicitado/aprovado se esse formato for usado. | Status documentado sem IDs reais. |
| Política de privacidade | Página publicada e revisada. | URL pública e revisão textual. |
| Consentimento | Gate por região implementado quando exigido. | QA por região/perfil, sem dados pessoais. |
| Titularidade | PF/PJ definida. | Decisão documentada sem documento real no Git. |
| Revisão fiscal | Contador/profissional validou obrigações do titular. | Registro de decisão, sem dados pessoais. |
| QA publicado | Domínio canônico validado. | Recibos em `docs/assets/issues/.../evidence/` somente se houver mudança UI/técnica futura. |
| Offline intacto | Testes provam jogo offline sem ads. | QA PWA/offline publicado. |
| Tráfego legítimo | Sem incentivo a clique, sem origem duvidosa. | Revisão de fontes de tráfego. |
| Sem IDs reais versionados | Git não contém publisher ID, slot, token ou segredo. | Varredura por padrões sensíveis. |

Ativação real deve ser outro PR, outro plano e outra validação. Esse PR futuro precisa explicar exatamente qual estado será alterado, qual script será carregado, como consentimento funciona, como offline se mantém, quais testes cobrem regressão e como IDs reais ficam fora do Git.

## 14. Riscos P0

| Risco | Impacto | Mitigação P0 |
| --- | --- | --- |
| Rejeição AdSense | A monetização web atrasa ou fica inviável. | Preparar conteúdo próprio, páginas mínimas, privacidade e tráfego real antes de solicitar. |
| H5 não aprovado | Interstitial/rewarded via H5 não fica disponível. | Manter AdSense display como hipótese futura e preservar jogo sem ads. |
| Tráfego insuficiente | Ads não geram aprendizado nem receita material. | Priorizar SEO, link direto, comunidades permitidas e retenção antes de monetizar. |
| Público infantil/misto | Pode exigir tratamento conservador de privacidade e anúncios. | Evitar copy direcionada a crianças; revisar classificação de público antes de ads. |
| Clique inválido | Conta pode sofrer limitação ou bloqueio. | Proibir pedidos de clique, anúncios perto de controles e tráfego incentivado. |
| Conflito offline | Ads quebram contrato PWA. | Manter ads online-only opcionais e `ads_disabled` até exceção aprovada. |
| Consentimento mal implementado | Ads personalizados podem violar política/região. | Exigir CMP/gate adequado antes de `ads_live` em regiões aplicáveis. |
| Conta PF/PJ errada | Pagamento, imposto e troca de titularidade podem ficar problemáticos. | Definir titular antes de abrir/usar conta de ads. |
| Imposto/câmbio/custo bancário supera receita | Receita bruta não vira lucro líquido. | Tratar monetização como experimento futuro; validar com contador antes de ativar. |
| IDs reais no Git | Exposição operacional e risco de abuso. | Documentar só nomes lógicos; varrer padrões sensíveis antes de commit. |

## 15. Decisão final P0

A decisão final P0 é:

1. lançar e operar Brikaya sem ads reais;
2. manter `ads_disabled` como estado executável;
3. usar `ads_readiness` apenas como prontidão documental e operacional;
4. preparar conteúdo próprio, privacidade, consentimento e SEO;
5. medir retenção, origem de tráfego e uso por país/idioma;
6. decidir titularidade PF/PJ antes de qualquer conta/receita real;
7. não comprar tráfego sem nova decisão; impulsionamento externo fica apenas preparado e documentado com teto futuro de R$500;
8. não inserir AdMob, app store, WebView monetizado ou SDK nativo;
9. só depois solicitar/ativar monetização, em PR técnico separado, com autorização explícita.

## 16. Critérios de aceite

- O arquivo existe em `docs/dist/monetizacao.md`.
- A primeira linha é `<!-- docs/dist/monetizacao.md -->`.
- O foco P0 está explícito.
- P1/P2 estão fora de escopo desta versão.
- Os estados `ads_disabled`, `ads_readiness`, `ads_test` e `ads_live` estão definidos.
- AdSense e H5 Games Ads são tratados como futuros, não como implementação atual.
- AdMob, app store, WebView monetizado e SDK nativo estão fora de escopo.
- O conflito offline x ads está explicado.
- PF/PJ Brasil, PF Paraguai e EAS Paraguai estão explicados.
- País da audiência está separado do país fiscal do recebedor.
- Métricas P0 antes de ads estão listadas sem prometer receita.
- Impulsionamento externo está separado de publicidade no jogo e referencia `docs/dist/pendencias-publicacao-impulsionamento.md`.
- Riscos P0 têm mitigação documental.
- Fontes oficiais estão linkadas.
- Nenhum ID real, chave, token, secret, slot, publisher ID ou placeholder sensível foi incluído.
