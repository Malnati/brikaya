<!-- docs/dist/projeto.md -->
# Projeto de distribuição internacional, monetização e licenciamento — Brikaya

## 1. Objetivo

Brikaya é um jogo casual arcade/PWA inspirado no formato clássico de quebra-blocos, com execução web, foco em sessões curtas, jogabilidade imediata e operação offline após o primeiro carregamento.

Este documento define o plano profundo para ampliar a distribuição internacional de Brikaya sem alterar runtime nesta entrega. O objetivo é preparar a próxima etapa de internacionalização, monetização legal e crescimento por país mantendo três restrições centrais:

1. **Distribuição inicial sem custo obrigatório** para o usuário final e para o mantenedor.
2. **Licenciamento 100% regular** para código, assets, textos, traduções, marca e materiais promocionais.
3. **Separação explícita entre monetização por anúncios e impulsionamento pago**:
   - monetização por anúncios: receita futura exibida dentro ou ao redor do jogo, condicionada a aprovação de conta, consentimento e exceção à política offline;
   - impulsionamento pago: compra de tráfego/campanhas, tratada como custo bloqueado até autorização expressa de orçamento.

Este arquivo é um plano documental. Ele **não implementa** i18n, anúncios, AdSense, AdMob, Google Ads, Firebase, scripts externos, mudanças de service worker, mudanças Cloudflare, IDs reais, credenciais ou qualquer alteração de runtime.

## 2. Premissas e bloqueios zero-custo

### 2.1. Premissas obrigatórias

| Tema | Premissa | Efeito no projeto |
| --- | --- | --- |
| Usuário final | Brikaya deve continuar gratuito para jogar. | Não planejar paywall, assinatura, compra obrigatória, venda de fases ou bloqueio de gameplay por pagamento. |
| Mantenedor | A rota inicial não deve exigir taxa de publicação, compra de tráfego, compra de asset, royalty, assinatura ou licença paga. | Distribuição inicial recomendada fica em web/PWA, usando infraestrutura já existente e sem ativar campanhas. |
| Licenciamento | Código, assets, textos e traduções devem permitir uso comercial gratuito. | Recusar materiais com restrição comercial, royalty, pagamento, watermark, assinatura ou obrigação incompatível com distribuição simples. |
| Offline | O jogo principal permanece offline após primeiro uso. | Exceção PWA-only aprovada: anúncios reais são opcionais, online-only, consentidos quando exigido e nunca necessários para jogar. |
| Dados sensíveis | Documento não pode conter IDs reais, credenciais, contas, chaves, variáveis privadas ou valores de ambiente. | Toda configuração real deve ficar fora do Git e ser documentada apenas por função, não por valor. |

### 2.2. Bloqueios explícitos de custo

| Item | Custo/risco | Decisão zero-custo |
| --- | --- | --- |
| Google Ads | Google Ads é pago, pois campanha exige orçamento e lances. | Permitido apenas como rascunho/documentação. Nenhuma campanha ativa sem aprovação explícita de gasto. |
| Google Play | O cadastro no Play Console exige taxa única oficial de US$25, segundo o [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en). | Publicação nativa Android via Play Store fica fora da rota zero-custo inicial. |
| Apple Developer Program | O programa custa US$99 por ano, segundo a página do [Apple Developer Program](https://developer.apple.com/programs/enroll/). | iOS/App Store ficam fora da rota zero-custo inicial. |
| Assets pagos | Bancos pagos, packs premium, assinaturas, royalties e materiais com watermark criam custo ou risco. | Proibidos na rota inicial. |
| Tradução paga | Tradução profissional paga pode ser útil, mas cria custo. | Fica fora da rota inicial; se houver tradução assistida, revisar e registrar origem sem copiar concorrentes. |
| Compra de tráfego | Campanhas, redes pagas, influenciadores pagos e posts patrocinados criam custo. | Bloqueados até autorização de orçamento. |

### 2.3. Interpretação operacional de “sem custo”

Neste plano, “sem custo” significa:

- sem taxa de publicação obrigatória;
- sem compra de tráfego;
- sem compra de asset;
- sem royalty;
- sem assinatura;
- sem dependência paga;
- sem obrigação de repassar custo ao usuário;
- sem ativar serviço que peça cobrança, upgrade, overage ou autorização de gastos.

## 3. Pesquisa de mercado

### 3.1. Leitura executiva

A distribuição de Brikaya deve equilibrar três sinais diferentes:

1. **Receita gamer**: países com alto gasto em jogos tendem a ter CPM/eCPM e potencial de monetização melhores, mas também maior competição e maior exigência de localização.
2. **Downloads/alcance mobile**: países com alto volume favorecem jogos leves, casuais, PWA, SEO e compartilhamento orgânico.
3. **Casual/hypercasual**: jogos simples, rápidos e com barreira baixa de entrada performam bem em escala global, especialmente quando localizados e fáceis de iniciar.
4. **Viabilidade operacional Google/Cloudflare**: a primeira onda deve priorizar países onde a distribuição web, indexação, anúncios Google futuros e operação Cloudflare sejam pragmáticas.

### 3.2. Mercados por receita gamer

A referência de receita por país vem do ranking anual da [Newzoo — Top countries and markets by video game revenues](https://newzoo.com/resources/rankings/top-10-countries-by-game-revenues). A versão consultada apresenta estimativas de 2025 e lista como maiores mercados: China, Estados Unidos, Japão, Coreia do Sul, Alemanha, Reino Unido, França, Canadá, Brasil e Itália.

| Sinal | Países/regiões relevantes | Impacto para Brikaya |
| --- | --- | --- |
| Receita máxima | China e Estados Unidos lideram a lista. | Estados Unidos entram no P0 por idioma inglês, Google, web e alto valor; China fica fora da primeira onda por barreiras regulatórias e operacionais. |
| Alto valor asiático | Japão e Coreia do Sul aparecem entre os maiores mercados. | Entram em P1: exigem localização dedicada (`ja`, `ko`) e QA cultural. |
| Alto valor europeu | Alemanha, Reino Unido, França e Itália aparecem no top 10. | Reino Unido entra em P0 via inglês; Alemanha, França e Itália entram em P1. |
| América | Canadá e Brasil aparecem no top 10. | Canadá entra junto do bloco inglês; Brasil é origem natural `pt-BR` e P0. |

### 3.3. Mercados por downloads/alcance mobile

A referência mobile geral vem do [Sensor Tower State of Mobile 2026](https://sensortower.com/blog/state-of-mobile-2026), que registra máximas históricas em downloads, receita de compras dentro de apps e tempo gasto em 2025. O relatório também destaca que jogos continuam relevantes, com maior foco em retenção, monetização e valor de longo prazo, não apenas volume bruto.

Para Sudeste Asiático, o [Sensor Tower Southeast Asia Mobile Gaming 2025](https://sensortower.com/blog/southeast-asia-mobile-gaming-2025) destaca que a região alcançou 1,93 bilhão de novos installs de jogos mobile no primeiro trimestre de 2025, com Indonésia, Filipinas e Vietnã liderando downloads regionais.

| Sinal | País/região | Impacto para Brikaya |
| --- | --- | --- |
| Downloads massivos | Indonésia | P2 por volume, idioma `id`, baixo atrito e forte potencial orgânico. |
| Downloads massivos | Filipinas | P2 por alcance e familiaridade parcial com inglês; `fil` pode evoluir depois. |
| Downloads massivos | Vietnã | P2 por volume e ecossistema forte de publicação mobile; exige `vi`. |
| Alcance global por inglês | EUA, Canadá, Reino Unido, Índia, Filipinas | `en` e `en-IN` têm alto retorno por reaproveitamento, com QA regional. |
| Alcance LATAM | México e América Latina hispânica | `es-419` cobre vários países com uma localização inicial. |

### 3.4. Mercados por casual/hypercasual

O [Liftoff/Singular 2025 Casual Gaming Apps Report](https://liftoff.ai/2025-casual-gaming-apps-report/) indica que jogos casuais e hypercasual têm alto potencial de alcance por formatos simples, grande público e aquisição baseada em criatividade/retensão. A leitura útil para Brikaya é que um arcade leve deve priorizar:

- onboarding imediato;
- sessões curtas;
- retenção por recorde local e desafio;
- metadados localizados;
- performance mobile;
- anúncios futuros pouco intrusivos, apenas em pausas naturais.

O levantamento [MAF/AppMagic — Top Mobile Games of 2025](https://maf.ad/en/blog/top-mobile-games-2025/) mostra que jogos de puzzle/casual e hypercasual aparecem com grande volume de downloads, com exemplos como Block Blast!, Subway Surfers, Ludo King, Vita Mahjong e títulos simples com onboarding direto. Para Brikaya, isso reforça que um jogo arcade/puzzle leve pode competir por acessibilidade e clareza, não por complexidade.

### 3.5. Mercados operacionalmente viáveis com Google/Cloudflare

A rota inicial deve considerar não apenas consumo de games, mas também a capacidade de operar legalmente com serviços web, indexação e anúncios futuros.

| Categoria | Países/regiões | Decisão |
| --- | --- | --- |
| Alta viabilidade web/Google | Brasil, EUA, Canadá, Reino Unido, México, LATAM, Índia | Priorizar P0. |
| Alta receita e viabilidade com localização | Japão, Coreia do Sul, Alemanha, França, Itália | Priorizar P1. |
| Alto volume mobile, viabilidade gradual | Indonésia, Vietnã, Filipinas, Tailândia | Priorizar P2 com QA local e consentimento conforme jurisdição. |
| Alta receita, baixa viabilidade inicial | China | Fora da primeira onda: barreiras Google, Cloudflare, publicação, licenças, conteúdo e regulação. |

## 4. Matriz de países-alvo

| Prioridade | País/região | Idioma | Objetivo principal | Justificativa | Rota de distribuição | Observações legais/ads |
| --- | --- | --- | --- | --- | --- | --- |
| P0 — lançamento web inicial | Brasil | `pt-BR` | Base original, validação de produto, comunidade inicial e SEO em português. | Origem do projeto, menor custo de revisão, alto número de jogadores no ranking Newzoo e facilidade de comunicação. | Web/PWA em domínio existente e Cloudflare Pages; posts orgânicos; Search Console. | Manter jogo gratuito; anúncios reais dependem de aprovação de conta, consentimento quando exigido e regra online-only; revisar marca no INPI. |
| P0 — lançamento web inicial | Estados Unidos, Canadá e Reino Unido | `en` | Alto valor de monetização futura e maior alcance internacional com um catálogo base. | EUA, Reino Unido e Canadá aparecem entre mercados fortes por receita; inglês reaproveita conteúdo para outros países. | Web/PWA, landing em inglês, metadados localizados, comunidades gratuitas. | EEA/UK exige atenção de consentimento no Reino Unido; Canadá/EUA exigem cuidado com privacidade e público infantil quando aplicável. |
| P0 — lançamento web inicial | México e LATAM hispânica | `es-419` | Ampliar alcance regional com uma localização espanhola neutra latino-americana. | `es-419` cobre México, Colômbia, Argentina, Chile, Peru e outros mercados com baixo custo incremental. | Web/PWA, SEO em espanhol LATAM, posts orgânicos e diretórios gratuitos. | Evitar espanhol europeu como base inicial; revisar termos promocionais para não prometer ganhos/recompensas financeiras. |
| P0 — lançamento web inicial | Índia | `en-IN`; evolução `hi-IN` | Alto alcance mobile e aprendizado de retenção em país mobile-first. | Grande base mobile e uso amplo de inglês em tecnologia/jogos; hindi expande alcance depois. | Web/PWA leve, metadados em inglês indiano, comunidades gratuitas. | Anúncios futuros exigem política clara para menores; hindi só após QA linguístico. |
| P1 — alto valor de monetização | Japão | `ja` | Aumentar valor futuro de monetização e testar aceitação em mercado premium. | Japão está entre maiores mercados por receita gamer. | Web/PWA com landing e metadados em japonês após P0 validado. | Exige tradução humana/revisada; evitar uso de nomes de jogos concorrentes em materiais públicos. |
| P1 — alto valor de monetização | Coreia do Sul | `ko` | Expandir para mercado gamer de alto gasto. | Coreia do Sul está entre maiores mercados por receita gamer. | Web/PWA com página em coreano e assets textuais revisados. | Requer localização cuidadosa; anúncios só após consentimento e políticas locais revisadas. |
| P1 — alto valor de monetização | Alemanha | `de` | Capturar mercado europeu de alto valor e validar consentimento EEA. | Alemanha aparece no top 10 de receita e é mercado forte de privacidade. | Web/PWA em alemão, SEO, consentimento antes de ads reais. | CMP/consentimento obrigatório antes de publicidade personalizada; revisar termos legais em alemão. |
| P1 — alto valor de monetização | França | `fr` | Expandir na Europa com localização própria. | França aparece entre mercados relevantes por receita e consumo mobile. | Web/PWA em francês, metadados e posts orgânicos. | Consentimento EEA obrigatório para ads; revisar linguagem para público geral. |
| P1 — alto valor de monetização | Itália | `it` | Completar cobertura inicial de mercados europeus do top 10. | Itália aparece no top 10 Newzoo e pode aproveitar pipeline EEA já preparado. | Web/PWA em italiano. | Consentimento EEA obrigatório; QA de tradução e metadados. |
| P2 — alto volume/SEA | Indonésia | `id` | Volume mobile e aprendizado de crescimento orgânico no Sudeste Asiático. | Sensor Tower aponta Indonésia como líder regional de downloads de jogos mobile no Q1 2025. | Web/PWA leve, conteúdo em indonésio, comunidades gratuitas. | Verificar políticas locais e adequação cultural; anúncios futuros com consentimento quando exigido. |
| P2 — alto volume/SEA | Vietnã | `vi` | Aproveitar mercado mobile dinâmico e cultura forte de jogos leves. | Sensor Tower destaca Vietnã entre líderes regionais de downloads e publishers SEA. | Web/PWA em vietnamita após P0/P1 técnico estabilizado. | Exige revisão linguística; evitar promessas de recompensa ou monetização ao jogador. |
| P2 — alto volume/SEA | Filipinas | `en`; evolução `fil` | Escalar com inglês primeiro e evoluir para localização filipina. | Filipinas aparecem entre maiores volumes regionais de downloads mobile. | Web/PWA em inglês, depois `fil` se dados justificarem. | Verificar classificação etária e linguagem promocional para público amplo. |
| P2 — alto volume/SEA | Tailândia | `th` futuro | Avaliar monetização regional e localização SEA adicional. | Tailândia aparece como mercado regional relevante em receita IAP no relatório Sensor Tower SEA. | Web/PWA com tradução tailandesa apenas após validação de P2. | Exige revisão local; não iniciar ads sem consentimento e testes. |
| Fora da primeira onda | China | `zh-CN` futuro, se houver rota específica | Não priorizar no lançamento inicial. | Alta receita gamer, mas grande barreira operacional/regulatória para rota Google/Cloudflare. | Fora da rota web/Google inicial. | Exigiria estratégia própria de distribuição, hospedagem, licenças, aprovação e compliance local. |

## 5. Plano futuro de internacionalização

### 5.1. Escopo

A internacionalização será uma fase futura. Esta entrega documental apenas define arquitetura, prioridades e critérios.

A recomendação é criar um catálogo local, tipado e sem dependência externa em `src/i18n/`, mantendo o projeto compatível com PWA offline. A solução deve evitar SDK remoto, CDN, serviço de tradução em runtime ou qualquer chamada externa para carregar textos.

### 5.2. Locales planejados

| Grupo | Locales | Finalidade |
| --- | --- | --- |
| Origem | `pt-BR` | Texto-base atual e primeira referência de produto. |
| P0 inicial | `en`, `es-419` | Internacionalização mínima com maior reaproveitamento. |
| P0 evolução | `en-IN`, `hi-IN` | Ajuste regional para Índia: inglês primeiro, hindi depois. |
| P1 crescimento | `ja`, `ko`, `de`, `fr`, `it` | Mercados de alto valor de receita. |
| P2 volume | `id`, `vi` | Sudeste Asiático com alto volume mobile. |
| P2 futuro | `fil`, `th` | Filipinas e Tailândia após validação de retenção. |

### 5.3. Regras de produto e linguagem

1. **“Brikaya” não traduz.** O nome do jogo deve permanecer igual em todos os mercados enquanto a busca de marca não indicar risco.
2. **UX copy traduzida por tarefa do usuário.** Textos devem orientar ação e resultado, não expor implementação.
3. **Sem termos técnicos na interface final.** Usuário deve ver linguagem de jogo, progresso, pausa, fase, pontuação e recordes; não infraestrutura, framework, cache, build, serviço ou provedor.
4. **Fallback obrigatório: `en`.** Se uma chave não existir no locale escolhido, usar inglês e registrar pendência em QA.
5. **Origem versionada.** `pt-BR` deve ser tratado como origem de intenção, mas não como fonte literal para todos os idiomas quando a frase exigir adaptação cultural.
6. **Preferência local.** Persistir escolha de idioma localmente, sem conta obrigatória.
7. **HTML lang.** Atualizar `html lang` conforme locale ativo.
8. **Sem rede para catálogo.** Todos os textos necessários devem estar no bundle/cache offline.
9. **QA por locale.** Cada idioma deve ser validado contra versão publicada em Cloudflare antes de ser considerado pronto.
10. **Revisão legal mínima.** Metadados públicos devem evitar marcas de terceiros e descrições copiadas de concorrentes.

### 5.4. Estrutura sugerida futura

| Arquivo/diretório futuro | Função | Observação |
| --- | --- | --- |
| `src/i18n/locales/pt-BR.ts` | Catálogo original. | Deve ser completo e tipado. |
| `src/i18n/locales/en.ts` | Fallback internacional. | Obrigatório antes de qualquer expansão. |
| `src/i18n/locales/es-419.ts` | Espanhol latino-americano. | Não usar espanhol europeu como padrão inicial. |
| `src/i18n/types.ts` | Tipos de chaves e locales. | Evita chaves ausentes. |
| `src/i18n/index.ts` | Seleção, fallback e helpers. | Sem dependência externa. |
| `docs/dist/i18n-qa.md` | Futuro checklist de revisão por idioma. | Criar apenas quando a implementação começar. |

### 5.5. Critérios de aceite para fase futura de i18n

- Todos os textos visíveis ao usuário vêm do catálogo local.
- O jogo continua funcionando offline após primeiro carregamento.
- Nenhuma dependência externa é adicionada para tradução em runtime.
- `pt-BR`, `en` e `es-419` passam em build e QA publicado.
- `html lang` reflete idioma selecionado.
- Preferência de idioma persiste localmente.
- Nome Brikaya permanece sem tradução.
- Nenhuma marca de concorrente aparece em UI, anúncio ou descrição pública.

## 6. Plano futuro de publicidade Google

### 6.1. Exceção aprovada para PWA-only

O repositório exige que o jogo principal funcione offline após o primeiro uso e proíbe requisições externas para o gameplay essencial. Publicidade real do Google exige rede externa, carregamento de código/ads, medição e comunicação com plataformas de anúncio.

A exceção PWA-only está aprovada com este contrato:

> O jogo principal continua offline após primeiro carregamento; anúncios são opcionais, online-only, consentidos quando exigido e nunca necessários para jogar.

Esta aprovação é apenas política/documental. Ela não implementa AdSense, H5 Games Ads, AdMob, SDK, script externo, ID real, credencial, campanha, mudança de service worker ou qualquer alteração de runtime. Até existir PR próprio de ativação, qualquer slot permanece como placeholder offline ou área ausente.

### 6.2. Web/PWA: AdSense e H5 Games Ads

| Item | Requisito | Fonte | Decisão para Brikaya |
| --- | --- | --- | --- |
| AdSense | Conta e site precisam cumprir requisitos de elegibilidade, conteúdo próprio, políticas e idade mínima. | [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en) | Futuro; não inserir código real agora. |
| H5 Games Ads | Produto por aplicação; acesso não é garantido e requer AdSense aprovado. | [Ad Placement API signup](https://developers.google.com/ad-placement/docs/signup) | Futuro; solicitar somente após i18n P0 e desenho técnico compatível com a exceção aprovada. |
| Formatos | H5 Games Ads permite interstitial e rewarded em momentos naturais do jogo. | [AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170?hl=en) | Usar apenas entre fases, pausa ou tela de fim; nunca durante jogada contínua. |
| Código no Git | IDs reais de editor/anúncio não devem entrar no repositório. | Política interna do projeto. | Documentar nomes lógicos e manter valores reais fora do Git. |
| Offline | Ads exigem rede e não podem ser pré-cacheados como parte do jogo. | Regra do repositório + natureza dos anúncios. | Modo offline deve ocultar/desativar publicidade real. |

### 6.3. Native Android futuro: AdMob

AdMob/Google Mobile Ads SDK pertence a uma rota nativa Android ou WebView Android, não ao PWA puro. A documentação do [AdMob Android quick start](https://developers.google.com/admob/android/quick-start) exige registro do app, SDK, configuração nativa e ID do app AdMob no manifesto Android.

Decisão:

- não adicionar AdMob nesta entrega;
- não adicionar SDK nativo agora;
- não alterar Capacitor agora;
- não publicar via Google Play na rota zero-custo inicial por causa da taxa de registro;
- tratar AdMob como fase futura, dependente de orçamento, rota Android e revisão legal.

### 6.4. Consentimento, privacidade e menores

| Região/tema | Requisito | Fonte | Decisão |
| --- | --- | --- | --- |
| EEA/UK/CH | É preciso informar e obter consentimento para cookies/local storage e dados pessoais quando legalmente exigido. | [European regulations messages](https://support.google.com/admanager/answer/10076805?hl=en) | Antes de ads reais na Europa/Reino Unido/Suíça, implementar CMP/consentimento compatível. |
| CMP | Google exige CMP certificada em cenários EEA/UK/CH para AdSense/AdMob/Ad Manager, conforme política vigente. | [European regulations messages](https://support.google.com/admanager/answer/10076805?hl=en) | Não ativar anúncios nesses mercados sem consentimento testado. |
| COPPA/menores | Conteúdo direcionado a crianças ou público misto pode exigir tratamento child-directed/idade. | [AdMob targeting/COPPA](https://developers.google.com/admob/android/targeting) | Definir classificação etária e política de público antes de anúncios. |
| Personalização | Pode ser necessário desativar personalização conforme idade/região/consentimento. | [AdMob targeting/COPPA](https://developers.google.com/admob/android/targeting) | Preferir abordagem conservadora no início. |

### 6.5. Segurança de conta e qualidade de tráfego

A página [Google Ads Traffic Quality — Publishers](https://www.google.com/ads/adtrafficquality/publishers/) reforça práticas contra tráfego inválido, cliques acidentais e fontes suspeitas. Para Brikaya:

- nunca clicar nos próprios anúncios;
- nunca pedir para amigos, testadores ou usuários clicarem em anúncios;
- evitar posicionamento que cause clique acidental;
- não exibir anúncio em cima de controles do jogo;
- não exibir anúncio durante jogada contínua;
- não comprar tráfego de origem duvidosa;
- revisar relatórios por país, origem e anomalia;
- manter ads desativados em builds de desenvolvimento e testes automatizados;
- usar modo de teste quando permitido pelas políticas;
- não publicar logs contendo IDs reais ou dados sensíveis.

### 6.6. Estados operacionais futuros

| Estado | Descrição | Permitido na rota atual? |
| --- | --- | --- |
| `ads_disabled` | Sem anúncio real; placeholders offline ou nenhuma área de anúncio. | Sim, rota atual. |
| `ads_test` | Integração técnica com IDs de teste e consentimento validado. | Futuro, exige PR próprio e desenho técnico compatível com a exceção aprovada. |
| `ads_live` | Anúncios reais aprovados. | Futuro, exige aprovação AdSense/H5/AdMob, consentimento e decisão explícita de ativação. |


### 6.7. Viabilidade de receita, lucro e titularidade para recebimento

Esta seção responde se Brikaya pode gerar receita de anúncios como PWA nos países-alvo e se o recebimento pode ocorrer por pessoa física, pessoa física paraguaia, pessoa física brasileira ou EAS paraguaia. A resposta é operacional, não jurídica, contábil ou fiscal.

A conclusão é: **é possível receber receita de anúncios em tese**, desde que AdSense/H5 Games Ads ou AdMob aprovem o site/app, a conta cumpra políticas, o titular passe verificações de identidade/endereço/pagamentos, os dados fiscais sejam enviados quando solicitados e as regras de privacidade/consentimento de cada país sejam cumpridas. **Isso não garante lucro líquido.** Google informa que ganhos variam por tráfego, país do usuário, tipo de conteúdo, formato de anúncio, demanda de anunciantes, sazonalidade e câmbio. Portanto, receita de anúncios deve ser tratada como experimento futuro, não como promessa financeira.

#### Perguntas diretas

| Pergunta | Resposta operacional | Condições e riscos |
| --- | --- | --- |
| Dá para publicar e receber anúncios como pessoa física? | Sim, em tese, via conta AdSense individual; pagamento vai ao nome do titular. | O Google AdSense oferece tipos de conta `individual` e `organization`; depois de ativada, a troca de tipo pode exigir cancelar e abrir outra conta. |
| Como pessoa física paraguaia? | Sim, em tese. Paraguai consta na disponibilidade AdSense e AdMob. | Exige identidade/endereço/pagamento compatíveis, dados fiscais quando solicitados e tratamento tributário local. Pode exigir RUC ou obrigação local conforme atividade e orientação contábil. |
| Como pessoa física brasileira? | Sim, em tese. Brasil consta na disponibilidade AdSense. | Exige CPF/identidade/endereço compatíveis. Para residente fiscal no Brasil, renda recebida do exterior deve entrar na análise fiscal, incluindo Carnê-Leão quando aplicável. |
| Como EAS paraguaia? | Sim, em tese, via perfil de pagamentos de organização. | Exige documento da EAS, RUC, dados bancários/recebimento, representante/admin autorizado e coerência entre nome da organização, documentos e perfil Google Payments. |
| Países-alvo mudam PF/PJ? | Não diretamente. | A escolha PF/PJ depende do titular fiscal e de pagamentos, não do país onde o jogador vê o anúncio. Países-alvo afetam consentimento, políticas, demanda, eCPM, idioma, retenção e privacidade. |
| Precisa empresa ou ID nos países-alvo? | Para PWA com AdSense/H5, não como regra geral. | Precisa titularidade válida no país da conta de pagamentos e cumprimento das regras dos países onde anúncios são exibidos. Empresa/ID local só deve ser considerada se houver operação local, app store, contrato local, obrigação regulatória específica ou estratégia fiscal própria. |

#### Comparação PF/PJ para recebimento

| Opção de titularidade | Quando faz sentido | Documentos/condições prováveis | Pontos de atenção |
| --- | --- | --- | --- |
| Pessoa física paraguaia | Menor complexidade inicial quando a receita pertence ao titular individual. | Cédula/identidade paraguaia válida, endereço de pagamento, conta ou forma de recebimento aceita, informações fiscais quando solicitadas. | Confirmar com contador paraguaio se a atividade recorrente exige RUC, regime fiscal específico ou formalização posterior. |
| Pessoa física brasileira | Possível pelo lado Google quando a receita pertence à pessoa física brasileira. | CPF, documento de identidade, endereço brasileiro, forma de pagamento aceita e informações fiscais. | Para residente no Brasil, rendimentos do exterior podem exigir Carnê-Leão mensal e declaração anual; validar com contador antes de ativar receita. |
| EAS paraguaia | Melhor quando o objetivo é separar patrimônio, operar como empresa e receber em nome da pessoa jurídica. | EAS constituída, RUC, documento de registro, representante/admin autorizado, endereço e conta/forma de pagamento compatível. | Perfil Google Payments deve ser organização desde o início se a receita for da EAS; dados do perfil devem bater com documentos oficiais. |
| Empresa nos países-alvo | Normalmente desnecessária para PWA inicial. | Só avaliar se houver app store local, equipe/contrato local, obrigação regulatória, venda direta, filial, retenção fiscal local ou parceiro comercial. | Não abrir empresa/ID em país-alvo apenas porque há usuários vendo anúncios naquele país. |

#### Regras de decisão para Brikaya

1. Se a receita inicial for experimental e pessoal, a rota mais simples é avaliar conta individual no país real de residência fiscal do titular.
2. Se a receita deve pertencer à EAS, criar a rota como organização desde o começo, com documentos da EAS/RUC e representante autorizado.
3. Não usar país, endereço, documento ou banco artificial para tentar melhorar pagamento, eCPM ou aprovação.
4. Não confundir país do público com país do titular: jogadores nos Estados Unidos, Índia, Japão, Europa ou Sudeste Asiático não obrigam empresa nesses países para uma PWA global.
5. Países-alvo influenciam consentimento e privacidade: EEA/UK/CH exigem tratamento mais rigoroso antes de ads reais; EUA exigem atenção a leis estaduais e menores; Brasil/Paraguai/LATAM exigem linguagem e política coerentes.
6. Receita bruta só vira lucro líquido depois de impostos, custos bancários, câmbio, contador, compliance, eventual campanha paga e manutenção operacional.
7. Como esta é pesquisa operacional, antes de ativar anúncios reais deve haver validação com contador no país do titular e revisão das telas/políticas exigidas pelo Google.

#### Checklist antes de ativar monetização real

| Item | Pessoa física paraguaia | Pessoa física brasileira | EAS paraguaia |
| --- | --- | --- | --- |
| País disponível no AdSense/AdMob | Sim, Paraguai aparece nas listas de disponibilidade. | Sim, Brasil aparece nas listas de disponibilidade. | Sim, Paraguai aparece nas listas de disponibilidade. |
| Tipo de conta recomendado | Individual. | Individual. | Organization. |
| Documento principal | Cédula/identidade compatível com o perfil. | CPF/documento de identidade compatível com o perfil. | Documento da EAS/RUC e representante autorizado. |
| Pagamento | Forma aceita para endereço de pagamento no Paraguai. | Forma aceita para endereço de pagamento no Brasil. | Forma aceita em nome da organização ou conforme perfil aprovado. |
| Impostos | Confirmar RUC/obrigações com contador paraguaio. | Avaliar Carnê-Leão e declaração anual se residente fiscal no Brasil. | Confirmar regime da EAS, faturamento, notas/registro e impostos com contador paraguaio. |
| Países-alvo | Não exigem documento local por si só. | Não exigem documento local por si só. | Não exigem documento local por si só. |


## 7. Plano de impulsionamento

### 7.1. Zero-custo permitido

| Ação | Países iniciais | Resultado esperado | Custo |
| --- | --- | --- | --- |
| SEO básico da landing/PWA | Brasil, bloco inglês, LATAM | Indexação e descoberta orgânica. | Sem custo direto. |
| Google Search Console | Todos os P0 | Ver consultas, países, indexação e problemas de página. | Sem custo direto. |
| Metadados por idioma | `pt-BR`, `en`, `es-419` | Melhor snippet, título e descrição por público. | Sem custo direto. |
| Screenshots localizadas | P0 | Materiais para README, landing e posts. | Sem custo direto se gerados internamente. |
| Posts orgânicos | Brasil, EUA/Canadá/Reino Unido, México/LATAM, Índia | Tráfego inicial sem compra. | Sem custo direto. |
| Comunidades gratuitas | Reddit, fóruns de web games, comunidades indie, grupos locais permitidos | Feedback e tráfego inicial. | Sem custo direto; exige moderação e respeito a regras locais. |
| Diretórios gratuitos | PWA directories, web game directories sem cobrança | Backlinks e descoberta. | Sem custo direto se não exigirem pagamento/assinatura. |

### 7.2. Pago bloqueado

Google Ads, App Campaigns e Performance Max só podem existir como rascunho documental enquanto não houver orçamento aprovado. A documentação de [Google Ads geotargeting](https://support.google.com/google-ads/answer/1722043?hl=en) permite segmentar países/regiões, e a página de [Google App Campaigns](https://business.google.com/en-all/ad-solutions/app-ads/) descreve campanhas para promover apps em Google Search, YouTube, Play e outros inventários. Ainda assim, qualquer campanha ativa exige orçamento.

| Item pago | Estado permitido agora | Bloqueio |
| --- | --- | --- |
| Google Ads Search | Rascunho de países, idioma e copy. | Não ativar sem orçamento. |
| Performance Max | Apenas estudo. | Não ativar sem orçamento e medição adequada. |
| App Campaigns | Apenas estudo, especialmente porque PWA não é app store nativo inicial. | Não ativar sem app publicado e orçamento. |
| Influenciadores pagos | Fora da rota inicial. | Exige orçamento e contrato. |
| Compra de tráfego | Fora da rota inicial. | Risco de tráfego inválido e custo. |

### 7.3. Geo targeting documental futuro

| Campanha futura | Países | Idioma | Estado |
| --- | --- | --- | --- |
| Brikaya P0 Brasil | Brasil | `pt-BR` | Rascunho, bloqueado por custo. |
| Brikaya P0 English | Estados Unidos, Canadá, Reino Unido | `en` | Rascunho, bloqueado por custo. |
| Brikaya P0 LATAM | México e países hispânicos LATAM | `es-419` | Rascunho, bloqueado por custo. |
| Brikaya P0 Índia | Índia | `en-IN`, depois `hi-IN` | Rascunho, bloqueado por custo. |
| Brikaya P1 Premium | Japão, Coreia do Sul, Alemanha, França, Itália | `ja`, `ko`, `de`, `fr`, `it` | Só após dados P0. |
| Brikaya P2 Volume | Indonésia, Vietnã, Filipinas, Tailândia | `id`, `vi`, `en`/`fil`, `th` | Só após dados P0/P1 e QA local. |

## 8. Licenciamento e legalidade

> Este documento é um plano operacional de licenciamento e distribuição. Não é parecer jurídico. Antes de campanha paga, app store ou parceria comercial, revisar com profissional habilitado se houver risco relevante.

### 8.1. Código

O código atual do projeto está sob licença MIT no arquivo `LICENSE`. A referência conceitual é a [Open Source Initiative — MIT License](https://opensource.org/license/mit), que permite uso, cópia, modificação, publicação, distribuição, sublicenciamento e venda, preservando aviso de copyright e licença.

Decisão:

- manter MIT para o código do projeto;
- preservar `LICENSE`;
- não copiar código de jogos concorrentes;
- registrar dependências e licenças quando novas dependências forem adicionadas;
- evitar dependências que imponham custo, copyleft obrigatório indesejado ou restrição comercial.

### 8.2. Assets aceitos

| Tipo de asset | Aceito? | Condição |
| --- | --- | --- |
| Criação própria | Sim | Registrar origem interna quando relevante. |
| Creative Commons CC0 | Sim | Preferencial para zero fricção; ver [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en). |
| Domínio público equivalente | Sim | Confirmar jurisdição/origem e ausência de restrição. |
| Licença permissiva gratuita para uso comercial | Sim, com cuidado | Aceitar se não exigir pagamento, assinatura, royalty, share-alike obrigatório ou atribuição incompatível. |
| Assets gerados internamente em SVG | Sim | Devem cumprir regra SVG-only para runtime e não copiar marcas/personagens. |

### 8.3. Assets recusados

| Restrição | Motivo de recusa |
| --- | --- |
| NC / não comercial | Incompatível com monetização por anúncios e uso comercial. |
| ND / sem derivados | Incompatível com adaptação visual e integração ao jogo. |
| SA obrigatório | Pode impor obrigações de relicenciamento incompatíveis com zero fricção. |
| Royalty | Cria custo variável. |
| Compra única obrigatória | Viola rota inicial sem custo. |
| Assinatura | Viola rota inicial sem custo. |
| Watermark | Não serve para publicação profissional e pode indicar uso não licenciado. |
| Streaming-only ou uso apenas em plataforma específica | Incompatível com distribuição própria. |
| Atribuição obrigatória em UI, se o projeto quiser zero fricção | Pode obrigar créditos visíveis e complicar ads/store; só considerar em fase futura se explicitamente aceito. |
| Personagens, logos ou marcas reconhecíveis de terceiros | Risco de copyright, marca e confusão comercial. |

### 8.4. Mecânica de jogo

A página [U.S. Copyright Office — What is Copyright?](https://www.copyright.gov/what-is-copyright/) explica que copyright protege expressão original fixada, não ideias, procedimentos, métodos, sistemas, processos, conceitos, princípios ou descobertas.

Decisão para Brikaya:

- a ideia geral de jogo de blocos, bola e raquete não deve ser tratada como cópia por si só;
- a expressão específica deve ser própria: nome, arte, layout, sons, textos, fases, efeitos, assets, código e materiais promocionais;
- não copiar telas, sprites, sons, nomes, slogans, descrições ou campanhas de concorrentes;
- não usar visual que pareça derivado de um jogo específico protegido.

### 8.5. Marcas e nomes proibidos em UI/anúncios/descrição pública

Não usar como título, subtítulo, keyword promocional principal, descrição pública, copy de anúncio ou UI:

- Breakout;
- Arkanoid;
- Atari;
- BlackBerry;
- nomes de jogos concorrentes;
- nomes de publishers concorrentes;
- slogans ou elementos distintivos de terceiros.

Esses termos podem aparecer apenas em documentação interna de risco/benchmark quando necessário e com contexto factual, nunca como material de marketing.

### 8.6. Busca gratuita de marca antes do lançamento

Antes de ampliar distribuição pública e antes de campanha paga, executar busca gratuita:

| Fonte | O que verificar |
| --- | --- |
| USPTO | Marcas nos Estados Unidos próximas a “Brikaya”. |
| WIPO Global Brand Database | Marcas internacionais. |
| EUIPO | Marcas na União Europeia. |
| INPI Brasil | Marcas no Brasil. |
| Web search | Uso comum, jogos, apps, domínios e redes sociais. |
| App stores | Nomes de apps/jogos similares. |
| Domínios | Disponibilidade e conflitos de nomes. |

Critério: se houver conflito relevante, pausar campanha pública e decidir entre ajuste de nome, subtítulo ou parecer jurídico.

### 8.7. Traduções

Regras para tradução:

- produzir texto original;
- não copiar descrições de concorrentes;
- não traduzir reviews, store listings ou anúncios de terceiros;
- registrar origem/autor/ferramenta se houver tradução assistida;
- revisar termos de menores, recompensa, anúncio e privacidade por país;
- manter glossário para “fase”, “pontuação”, “recorde”, “pausa”, “continuar” e “jogar novamente”.

## 9. Roadmap documental

| Fase | Nome | Escopo | Saída esperada | Bloqueios |
| --- | --- | --- | --- | --- |
| Fase 0 | Documento de distribuição | Criar `docs/dist/projeto.md`. | Plano versionado com países, i18n, ads e licenciamento. | Nenhum após merge deste PR. |
| Fase 1 | i18n P0 sem anúncios reais | Implementar `pt-BR`, `en`, `es-419`; fallback `en`; persistência local; `html lang`; QA publicado. | PR próprio com build e QA Cloudflare. | Não inserir ads reais. |
| Fase 2 | Preparar consentimento e estados de ads | Definir arquitetura `ads_disabled`/`ads_test`/`ads_live`, consentimento e desenho técnico compatível com a exceção aprovada. | Documento técnico + implementação se aprovada. | Ads reais ainda desativados. |
| Fase 3 | Solicitar AdSense/H5 Games Ads | Preparar site, políticas, conteúdo original, candidatura e documentação de aprovação. | Conta/aprovação fora do Git; IDs reais fora do repositório. | Acesso não garantido; sem segredo no Git. |
| Fase 4 | Ativar anúncios | Só após aprovação de conta, consentimento, revisão de menores e PR próprio de ativação. | Ads online opcionais em momentos naturais. | Não ativar em modo offline; não ativar sem consentimento onde exigido. |
| Fase 5 | Expansão P1/P2 | Traduzir `ja`, `ko`, `de`, `fr`, `it`, `id`, `vi` e futuros `fil`/`th` por dados reais. | Roadmap ajustado por retenção, país, CTR orgânico, eCPM e feedback. | Sem tradução automática não revisada em mercados críticos. |

## 10. Critérios de aceite deste documento

- `docs/dist/projeto.md` existe.
- Primeira linha é `<!-- docs/dist/projeto.md -->`.
- Países e idiomas aparecem em tabela priorizada P0/P1/P2.
- Google Ads é pago e está marcado como bloqueado sem orçamento explícito.
- Google Play está fora da rota zero-custo inicial por taxa oficial de US$25.
- App Store/iOS estão fora da rota zero-custo inicial por Apple Developer Program de US$99/ano.
- Publicidade real é descrita como futura, online-only, consentida quando exigido e dependente de PR próprio de ativação.
- AdSense/H5 Games Ads aparecem como dependentes de aprovação.
- AdMob aparece apenas como rota nativa Android futura, não como PWA puro atual.
- Licenciamento lista assets aceitos e recusados.
- Mecânica de jogo diferencia ideia/sistema de expressão protegida.
- Marcas de terceiros são bloqueadas para UI, anúncio e descrição pública.
- Fontes estão linkadas.
- Documento responde explicitamente se é possível receber anúncios como pessoa física, pessoa física paraguaia, pessoa física brasileira e EAS paraguaia.
- Documento separa titularidade fiscal/pagamentos da geografia dos usuários nos países-alvo.
- Documento não promete lucro garantido e diferencia receita bruta, pagamento recebido e lucro líquido.
- Documento marca a análise de PF/PJ/Paraguai/Brasil como pesquisa operacional, não parecer jurídico, contábil ou fiscal.
- Nenhum ID real, credencial, conta privada, chave ou valor de ambiente foi incluído.

## 11. Fontes consultadas

| Tema | Fonte |
| --- | --- |
| Ranking de receita gamer por país | [Newzoo — Top countries and markets by game revenues](https://newzoo.com/resources/rankings/top-10-countries-by-game-revenues) |
| Mobile global 2026 | [Sensor Tower — State of Mobile 2026](https://sensortower.com/blog/state-of-mobile-2026) |
| Mobile gaming no Sudeste Asiático | [Sensor Tower — Southeast Asia mobile gaming 2025](https://sensortower.com/blog/southeast-asia-mobile-gaming-2025) |
| Casual gaming e benchmarks | [Liftoff/Singular — 2025 Casual Gaming Apps Report](https://liftoff.ai/2025-casual-gaming-apps-report/) |
| Top mobile games/casual/hypercasual | [MAF/AppMagic — Top Mobile Games 2025](https://maf.ad/en/blog/top-mobile-games-2025/) |
| Taxa Google Play Console | [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |
| Apple Developer Program | [Apple Developer Program](https://developer.apple.com/programs/enroll/) |
| Elegibilidade AdSense | [AdSense eligibility](https://support.google.com/adsense/answer/9724?hl=en) |
| H5 Games Ads / Ad Placement API signup | [Ad Placement API signup](https://developers.google.com/ad-placement/docs/signup) |
| H5 Games Ads | [AdSense H5 Games Ads](https://support.google.com/adsense/answer/9959170?hl=en) |
| AdMob Android | [AdMob Android quick start](https://developers.google.com/admob/android/quick-start) |
| Consentimento EEA/UK/CH | [European regulations messages](https://support.google.com/admanager/answer/10076805?hl=en) |
| Menores/COPPA/targeting | [AdMob targeting/COPPA](https://developers.google.com/admob/android/targeting) |
| Qualidade de tráfego de anúncios | [Google Ads Traffic Quality](https://www.google.com/ads/adtrafficquality/publishers/) |
| Geotargeting Google Ads | [Google Ads geotargeting](https://support.google.com/google-ads/answer/1722043?hl=en) |
| App Campaigns | [Google App Campaigns](https://business.google.com/en-all/ad-solutions/app-ads/) |
| Tipos de conta AdSense | [AdSense account type](https://support.google.com/adsense/answer/10163?hl=en) |
| Tipos de conta Google Payments | [Google Payments account type](https://support.google.com/paymentscenter/answer/11543916?hl=en) |
| Disponibilidade AdSense | [AdSense availability](https://support.google.com/adsense/answer/13402307?hl=en) |
| Métodos de pagamento AdSense | [AdSense payment methods](https://support.google.com/adsense/answer/1714397?hl=en) |
| Nome/endereço/país de pagamento AdSense | [AdSense payment name/address/country](https://support.google.com/adsense/answer/2628816?hl=en) |
| Receita AdSense | [AdSense revenue](https://support.google.com/adsense/answer/9902?hl=en) |
| Etapas para receber AdSense | [Steps to getting paid](https://support.google.com/adsense/answer/1709858?hl=en) |
| Disponibilidade AdMob | [AdMob availability](https://support.google.com/admob/answer/16451422?hl=en-GB) |
| Funcionamento AdMob | [How AdMob works](https://support.google.com/admob/answer/7356092?hl=en) |
| Receita Federal — Carnê-Leão | [Carnê-Leão](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/carne-leao) |
| Gov.br — Apurar Carnê-Leão | [Apurar Carnê-Leão](https://www.gov.br/pt-br/servicos/apurar-carne-leao) |
| DNIT Paraguai — RUC pessoas físicas/jurídicas | [DNIT RUC](https://www.dnit.gov.py/web/portal-institucional/inscripci%C3%B3n-de-personas-f%C3%ADsicas-y-jur%C3%ADdicas) |
| MIT | [Open Source Initiative — MIT License](https://opensource.org/license/mit) |
| CC0 | [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| Copyright | [U.S. Copyright Office — What is Copyright?](https://www.copyright.gov/what-is-copyright/) |
