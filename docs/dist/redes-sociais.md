<!-- docs/dist/redes-sociais.md -->
# Registro social de Brikaya

Data de criação: 2026-07-04. Escopo: reservar e operar presença oficial de Brikaya em redes sociais, comunidades e canais de descoberta, sem custo direto, sem campanha paga e sem exposição pública de perfil pessoal.

Este documento é a fonte operacional para execução, pendências e bloqueios. O domínio público canônico é sempre `https://brikaya.com/`.

## 1. Regras de custo, privacidade e identidade

### 1.1. Regras obrigatórias

- Custo direto permitido: `R$ 0 / US$ 0`.
- Chrome autenticado no Gmail pode ser usado somente como bastidor administrativo.
- Perfil pessoal, nome civil, e-mail pessoal, telefone pessoal e conta privada não podem aparecer publicamente.
- Qualquer plataforma que não permita identidade pública exclusiva de Brikaya deve ficar marcada como `bloqueado por exposição pessoal`.
- Qualquer plataforma que pedir cartão, orçamento, assinatura, verificação paga, boost, campanha, pixel, SDK, tag, saldo, overage ou upgrade deve ficar marcada como `bloqueado por custo`.
- Não adicionar script externo, pixel, tag de medição, SDK, analytics de terceiros ou código de anúncio ao PWA.
- Não usar `.pages.dev` como destino público. Todo perfil deve apontar para `https://brikaya.com/`.
- Não publicar promessa de prêmio, dinheiro, aposta, ranking pago, benefício externo, compra dentro do jogo ou recompensa financeira.
- Não usar marcas concorrentes como nome, slogan, hashtag promocional, palavra-chave principal ou descrição pública.

### 1.2. Interpretação de identidade pública

| Situação | Permitido? | Decisão operacional |
| --- | --- | --- |
| Conta pessoal usada para autenticar bastidor e criar uma página pública de Brikaya | Sim | Permitido se a página pública não mostrar dados pessoais. |
| Página/perfil público com nome, foto, e-mail ou telefone pessoal do administrador | Não | Bloquear e registrar pendência. |
| Canal de marca do YouTube criado a partir de Gmail autenticado | Sim | Permitido se o canal público for Brikaya. |
| WhatsApp Business com número pessoal visível | Não | Pendente até existir número exclusivo do jogo. |
| Plataforma que exige documento sensível para perfil orgânico simples | Condicional | Parar e registrar pendência; não enviar sem nova decisão. |
| Verificação paga, selo pago ou assinatura premium | Não | Bloqueado por custo. |

### 1.3. Uso seguro do Chrome

Quando a execução real começar:

1. usar janela existente do Chrome;
2. abrir apenas abas temporárias necessárias;
3. não fechar abas preexistentes do usuário;
4. fechar abas criadas ao terminar;
5. nunca salvar prints com e-mail, nome civil, telefone, QR code, códigos, tokens ou IDs privados;
6. validar cada perfil em janela anônima ou sessão sem login antes de marcar `concluído`.

## 2. Kit de identidade

### 2.1. Nome, handles e domínio

| Campo | Valor padrão |
| --- | --- |
| Nome público | Brikaya |
| Domínio | `https://brikaya.com/` |
| Handle preferencial 1 | `brikaya` |
| Handle preferencial 2 | `playbrikaya` |
| Handle preferencial 3 | `brikayagame` |
| Handle preferencial 4 | `brikayaofficial` |
| Categoria primária | Game / Video game / Entertainment / Games/toys |
| Categoria secundária | Arcade game / Casual game / Browser game / PWA game |
| Idioma inicial | `pt-BR` |
| Idiomas de apoio | `en`, `es-419` |

### 2.2. Bios curtas aprovadas

| Idioma | Bio |
| --- | --- |
| `pt-BR` | Jogo arcade de quebrar blocos. Jogue grátis no navegador. |
| `en` | Block-breaking arcade game. Play free in your browser. |
| `es-419` | Juego arcade de romper bloques. Juega gratis en tu navegador. |

### 2.3. Descrição longa aprovada

`Brikaya é um jogo arcade de quebrar blocos feito para jogar no navegador. Acesse o site oficial, jogue grátis e instale como app quando seu navegador permitir.`

Versão em inglês:

`Brikaya is a block-breaking arcade game made to play in the browser. Open the official website, play for free, and install it as an app when your browser supports it.`

Versão em espanhol LATAM:

`Brikaya es un juego arcade de romper bloques hecho para jugar en el navegador. Abre el sitio oficial, juega gratis e instálalo como app cuando tu navegador lo permita.`

### 2.4. Links permitidos

| Uso | Link |
| --- | --- |
| Principal | `https://brikaya.com/` |
| Português | `https://brikaya.com/` |
| Inglês | `https://brikaya.com/en/` |
| Espanhol LATAM | `https://brikaya.com/es-419/` |

Não usar links com parâmetros UTM em campo `Website` permanente de perfil público. UTMs podem ser usados em posts/campanhas futuras documentadas, mas o perfil institucional deve manter URL limpa.

### 2.5. Hashtags orgânicas permitidas

| Tipo | Hashtags |
| --- | --- |
| Base | `#Brikaya`, `#ArcadeGame`, `#BrowserGame` |
| PT-BR | `#JogoOnline`, `#JogoGratis`, `#JogoArcade` |
| EN | `#IndieGame`, `#WebGame`, `#PWAGame` |
| ES-LATAM | `#JuegoGratis`, `#JuegoArcade`, `#JuegoWeb` |

Evitar hashtags de concorrentes, marcas registradas alheias e promessas de recompensa.

## 3. Matriz P0 de plataformas

Status inicial desta implementação: `pendente de execução segura`, porque este commit cria governança e checklist. Cadastros reais devem ser feitos em sessão própria, com Chrome, evidência sanitizada e interrupção imediata em qualquer tela de custo ou exposição pessoal.

| Plataforma | Prioridade | Identidade pública desejada | URL pública esperada | Status inicial | Custo esperado | Risco principal | Próximo passo seguro |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Meta Business Portfolio | P0 | Portfólio administrativo Brikaya | Não necessariamente público | Pendente | R$ 0 se sem ads | Criar conta de anúncios/pixel por engano | Criar portfólio sem campanha, sem pixel e sem ad account ativa. |
| Facebook Page | P0 | Página `Brikaya` | `facebook.com/<handle>` | Pendente | R$ 0 | Perfil pessoal aparecer como autor/admin | Criar Page, validar em sessão sem login e registrar URL. |
| Instagram Professional | P0 | Perfil `Brikaya` | `instagram.com/<handle>` | Pendente | R$ 0 | Vínculo público com conta pessoal | Criar perfil do jogo, converter para profissional se gratuito. |
| Threads | P0 | Perfil de Brikaya vinculado ao Instagram | `threads.net/@<handle>` | Pendente | R$ 0 | Depender do Instagram/Meta | Criar somente após Instagram seguro. |
| WhatsApp Business | P0 condicional | Conta comercial Brikaya | Link de contato comercial | Pendente | R$ 0 se app gratuito | Número pessoal público | Executar só com número exclusivo do jogo. |
| TikTok Business | P0 | Perfil Business Brikaya | `tiktok.com/@<handle>` | Pendente | R$ 0 para Business Account | Entrar em Ads Manager/orçamento | Criar perfil, trocar para Business Account gratuita, não configurar anúncios. |
| YouTube Brand Channel | P0 | Canal de marca Brikaya | `youtube.com/@<handle>` | Pendente | R$ 0 | Canal pessoal visível | Criar canal de marca e validar página pública. |
| X | P0 | Perfil orgânico Brikaya | `x.com/<handle>` | Pendente | R$ 0 no perfil orgânico | Premium Business pago | Criar perfil normal; bloquear Premium Business. |
| Telegram Channel | P0 | Canal público Brikaya | `t.me/<handle>` | Pendente | R$ 0 | Username ocupado/spam | Criar canal e registrar link; grupo só depois. |
| LinkedIn Page | P0 | Página Brikaya | `linkedin.com/company/<handle>` | Pendente | R$ 0 para Page | Exigir empresa formal/declaração | Criar Page se puder confirmar direito de agir sem expor pessoa física. |
| Bluesky | P0 | Perfil Brikaya | `bsky.app/profile/<handle>` ou `@brikaya.com` | Pendente | R$ 0 se DNS atual basta | DNS/handle incorreto | Criar conta; preferir handle por domínio se não exigir custo. |
| Mastodon | P0 | Perfil Brikaya em instância pública | Depende da instância | Pendente | R$ 0 em instância gratuita | Escolha de instância/moderação | Escolher instância adequada a jogos/tech; não auto-hospedar pago. |
| Discord | P0 | Servidor Brikaya | Convite público controlado | Pendente | R$ 0 | Moderação insuficiente | Criar servidor mínimo com regras e canais básicos. |
| Reddit | P0 | Perfil oficial Brikaya | `reddit.com/user/<handle>` | Pendente | R$ 0 | Subreddit sem moderação | Criar perfil; subreddit só se houver regra/moderação. |
| Pinterest Business | P0 | Conta Business Brikaya | `pinterest.com/<handle>` | Pendente | R$ 0 para conta Business | Ads/solicitação comercial | Criar conta Business gratuita sem campanha. |
| Snapchat Public Profile/Business | P0 | Perfil público Brikaya | Depende do Snap username | Pendente | R$ 0 se sem ads | Ads Manager/cartão | Criar só se não pedir pagamento. |
| Twitch | P0 | Canal Brikaya | `twitch.tv/<handle>` | Pendente | R$ 0 | Monetização prematura | Criar canal sem afiliado, bits, subs ou compras. |

## 4. Matriz P1 de plataformas adicionais

| Plataforma | Prioridade | Decisão | Status inicial | Gatilho para executar |
| --- | --- | --- | --- | --- |
| Product Hunt | P1 | Reservar perfil/produto se gratuito | Monitorar | Quando houver copy e imagem social revisadas. |
| Indie Hackers | P1 | Perfil/comunidade se gratuito | Monitorar | Quando houver relato público de lançamento. |
| itch.io | P1 | Perfil de jogo web se não conflitar com PWA-only | Monitorar | Quando houver página preparada e sem taxa. |
| Game Jolt | P1 | Perfil/página se gratuito | Monitorar | Quando houver material de jogo adequado. |
| Tumblr | P1 | Blog social leve | Monitorar | Se handle principal estiver livre. |
| Medium | P1 | Publicação orgânica se gratuito | Monitorar | Se não exigir assinatura paga nem perfil pessoal público. |
| Substack | P1 | Newsletter somente se gratuita | Monitorar | Se houver plano editorial e privacidade segura. |
| LINE | P1 condicional | Perfil/canal se região permitir sem custo | Monitorar | Se cadastro gratuito estiver disponível sem entidade local. |
| KakaoTalk | P1 condicional | Canal se região permitir sem custo | Monitorar | Se cadastro gratuito estiver disponível sem entidade local. |
| VK | P1 condicional | Perfil/comunidade se compliance permitir | Monitorar | Se houver necessidade real de mercado e sem risco. |
| WeChat | Fora P0 | Não executar agora | Bloqueado condicional | Só com estratégia China própria; não usar sem entidade/parecer. |

## 5. Runbook de execução por plataforma

### 5.1. Pré-check obrigatório

Antes de abrir qualquer cadastro:

1. confirmar que o domínio público responde em `https://brikaya.com/`;
2. separar avatar/capa própria e texto do kit de identidade;
3. abrir Chrome em janela existente;
4. verificar se a plataforma permite página/perfil público do jogo separado do perfil pessoal;
5. preparar registro em `docs/dist/redes-sociais.md` com status `pendente`;
6. decidir handle conforme ordem oficial;
7. parar imediatamente se aparecer custo, cartão ou exposição pessoal.

### 5.2. Fluxo padrão de criação

Para cada plataforma:

1. abrir site oficial da plataforma;
2. criar página/perfil/canal de marca, não perfil pessoal;
3. aplicar nome `Brikaya`;
4. testar handles na ordem oficial;
5. preencher bio curta no idioma mais adequado;
6. preencher URL limpa `https://brikaya.com/`;
7. evitar configuração de anúncios, pixel, tag, loja, monetização e pagamento;
8. abrir URL pública em sessão sem login;
9. confirmar que não aparece perfil pessoal;
10. registrar resultado na matriz;
11. salvar evidência sanitizada, se necessário;
12. fechar aba temporária.

### 5.3. Fluxo de bloqueio

Se aparecer bloqueio:

1. não avançar no formulário;
2. não inserir cartão, orçamento, telefone pessoal, documento sensível ou token;
3. registrar plataforma como `bloqueado` ou `pendente`;
4. registrar motivo curto;
5. registrar próximo passo exato;
6. se houver screenshot, cortar/redigir dados pessoais;
7. fechar aba temporária.

## 6. Regras específicas por plataforma

### 6.1. Meta Business Portfolio

Objetivo: administrar ativos Meta de Brikaya sem campanha paga.

Permitido:

- portfólio administrativo exclusivo;
- Facebook Page;
- Instagram Professional;
- Threads;
- vínculo com WhatsApp Business somente com número exclusivo.

Proibido:

- criar campanha;
- criar pixel;
- aceitar sugestão de boost;
- adicionar método de pagamento;
- publicar perfil pessoal como dono visível.

Status inicial: `pendente`.

### 6.2. Facebook Page

Campos aprovados:

- nome: `Brikaya`;
- categoria: `Games/toys`, `Video game` ou equivalente;
- descrição: bio curta PT-BR;
- site: `https://brikaya.com/`.

Aceite:

- Page abre publicamente;
- botão/link leva ao domínio canônico;
- administrador pessoal não aparece em área pública comum.

### 6.3. Instagram Professional e Threads

Campos aprovados:

- nome: `Brikaya`;
- username conforme ordem oficial;
- categoria: jogo/entretenimento;
- site: `https://brikaya.com/`;
- bio PT-BR ou EN, conforme interface.

Aceite:

- perfil público separado;
- Threads criado somente a partir do perfil de Brikaya;
- nenhuma publicação automática pelo perfil pessoal.

### 6.4. WhatsApp Business

Regra de bloqueio forte: não usar número pessoal.

Status deve ficar `pendente: número exclusivo de Brikaya` enquanto não existir número dedicado.

Quando houver número dedicado:

- nome comercial: `Brikaya`;
- categoria: `Video game` ou `Entertainment`;
- site: `https://brikaya.com/`;
- mensagem curta sem prometer suporte em tempo real se não houver operação.

### 6.5. TikTok Business

Fonte oficial indica Business Account gratuita e configuração pelo app, mas também expõe ferramentas de anúncios. A execução deve ficar limitada a perfil e recursos orgânicos.

Permitido:

- criar perfil do jogo;
- mudar para Business Account gratuita;
- publicar bio/link quando liberado pela plataforma.

Proibido:

- Ads Manager;
- orçamento;
- cartão;
- campanha;
- TikTok Shop.

### 6.6. YouTube Brand Channel

Objetivo: criar canal de marca sem expor canal pessoal.

Campos aprovados:

- canal: `Brikaya`;
- handle conforme ordem oficial;
- descrição longa EN ou PT-BR;
- link principal: `https://brikaya.com/`.

Aceite:

- canal público mostra Brikaya;
- canal pessoal não aparece como identidade pública;
- sem monetização, membros, Super Chat ou anúncios.

### 6.7. X

Permitido:

- perfil orgânico gratuito;
- bio curta;
- URL canônica.

Bloqueado:

- Premium Business;
- Basic/Full Access;
- verificação paga;
- afiliados pagos;
- ads credit que exige cartão.

A própria documentação de X Premium Business lista assinatura e pagamento; portanto qualquer rota Premium Business fica `bloqueado por custo`.

### 6.8. Telegram

Permitido:

- canal público oficial;
- grupo de feedback somente se houver regras mínimas;
- username conforme ordem oficial.

Adiar:

- bot, porque cria token e só deve existir se houver uso imediato.

Canais mínimos se grupo for criado:

- regras;
- anuncios;
- feedback;
- bugs.

### 6.9. LinkedIn Page

Fonte oficial indica criação gratuita de Page, mas exige conta LinkedIn e confirmação de direito de agir pela página.

Permitido:

- Page de Brikaya se o formulário aceitar marca/produto sem entidade formal extra;
- URL do site canônico.

Bloquear/pendenciar se:

- exigir empresa formal não definida;
- exigir dados pessoais públicos;
- exigir documento sensível fora do escopo.

### 6.10. Bluesky

Preferência: handle de domínio `@brikaya.com`, porque o próprio Bluesky recomenda domínio para organizações.

Permitido:

- criar conta com handle temporário;
- adicionar TXT DNS `_atproto` se for gratuito e não expuser segredo;
- validar perfil público.

Bloquear/pendenciar se:

- exigir compra de domínio adicional;
- exigir assinatura;
- exigir dado pessoal público.

### 6.11. Mastodon

Escolha de instância precisa considerar regras locais de moderação.

Critérios de instância:

- aceita projeto/jogo/tecnologia;
- cadastro gratuito;
- termos compatíveis com marca/jogo;
- sem exigência de doação/assinatura;
- moderação clara;
- não expõe perfil pessoal.

Se não houver instância segura, status `pendente: escolher instância`.

### 6.12. Discord

Servidor mínimo:

- `#regras`;
- `#anuncios`;
- `#feedback`;
- `#bugs`;
- `#geral` opcional.

Texto mínimo de regras:

- respeito entre participantes;
- sem spam;
- sem dados pessoais;
- sem promessa de suporte imediato;
- links oficiais apenas para `brikaya.com`.

Proibido:

- bots pagos;
- integrações que exijam token sem necessidade;
- vendas/assinaturas.

### 6.13. Reddit

Permitido:

- perfil oficial `u/<handle>`;
- post orgânico somente em comunidades onde regras permitirem.

Subreddit:

- criar só se houver tempo de moderação;
- se não houver, marcar `monitorar`.

Proibido:

- spam cross-post;
- compra de anúncio;
- uso de subreddits sem respeitar regras locais.

### 6.14. Pinterest Business

Fonte oficial indica conta business gratuita e ferramentas de anúncios. Execução deve ficar limitada à conta gratuita e pins orgânicos.

Permitido:

- conta Business gratuita;
- perfil com domínio canônico;
- pins orgânicos futuros com imagens próprias.

Proibido:

- anúncios;
- reunião comercial paga;
- catálogo com pixel/tag;
- cartão/orçamento.

### 6.15. Snapchat

Permitido:

- perfil público/business se gratuito;
- link para `brikaya.com` se disponível.

Bloquear se:

- fluxo exigir Ads Manager com cartão;
- exigir compra de anúncio;
- expor usuário pessoal.

### 6.16. Twitch

Permitido:

- canal Brikaya;
- descrição com URL canônica;
- banner/avatar próprios.

Proibido:

- assinatura paga;
- compras;
- afiliado/monetização prematura;
- bots pagos.

## 7. Pendências operacionais

| ID | Plataforma | Pendência | Motivo | Próximo passo |
| --- | --- | --- | --- | --- |
| SOC-P0-001 | Todas | Executar cadastros reais com Chrome | Este commit só cria governança versionada | Abrir sessão operacional dedicada, criar perfis um a um e atualizar matriz. |
| SOC-P0-002 | WhatsApp Business | Obter número exclusivo de Brikaya | Número pessoal não pode ficar público | Separar chip/número/linha dedicada antes de criar conta. |
| SOC-P0-003 | Meta | Confirmar separação pública do perfil pessoal | Meta usa conta pessoal como administrador | Criar Page/portfolio e validar em sessão sem login antes de concluir. |
| SOC-P0-004 | LinkedIn | Confirmar se Page aceita Brikaya sem entidade formal extra | Formulário pode pedir company details | Tentar somente até tela gratuita; parar se pedir dado sensível ou exposição pessoal. |
| SOC-P0-005 | Bluesky | Decidir handle `@brikaya.com` ou `@brikaya.bsky.social` | Handle por domínio exige TXT DNS | Usar DNS só se gratuito, público e sem segredo. |
| SOC-P0-006 | Mastodon | Escolher instância | Federação depende de regras locais | Comparar instâncias gratuitas adequadas a jogos/tech. |
| SOC-P0-007 | Discord/Reddit | Definir esforço mínimo de moderação | Comunidade sem moderação vira risco | Criar regras mínimas antes de abrir convite público/subreddit. |
| SOC-P0-008 | P1 | Decidir plataformas adicionais | P0 vem primeiro | Só executar depois de P0 ou quando handle estiver em risco. |

## 8. Bloqueios automáticos

| Bloqueio | Status a registrar | Ação |
| --- | --- | --- |
| Pedido de cartão ou orçamento | `bloqueado por custo` | Fechar fluxo, documentar e não avançar. |
| Verificação paga/selo pago | `bloqueado por custo` | Manter perfil orgânico sem selo. |
| Boost/campanha sugerida | `bloqueado por campanha paga` | Não aceitar, não criar draft ativo. |
| Pixel/SDK/tag externa | `bloqueado por runtime` | Não instalar, não alterar PWA. |
| Perfil pessoal visível | `bloqueado por exposição pessoal` | Cancelar ou ajustar para identidade Brikaya. |
| Número pessoal obrigatório | `pendente: número exclusivo` | Aguardar número dedicado. |
| Documento pessoal sensível | `pendente: revisão de risco` | Solicitar decisão específica antes de enviar. |
| Entidade local/ICP/representante | `bloqueado por requisito externo` | Não executar no P0. |

## 9. Evidências sanitizadas

### 9.1. Caminho recomendado

Evidências futuras devem ficar em:

```text
docs/assets/issues/social-registration/evidence/
```

Padrão de nome:

```text
evi-social-registration-<platform>-<status>.png
evi-social-registration-<platform>-<status>.json
```

Exemplos válidos:

- `evi-social-registration-facebook-page-concluido.png`;
- `evi-social-registration-whatsapp-business-pendente.json`;
- `evi-social-registration-x-premium-bloqueado.png`.

### 9.2. Dados proibidos em evidência

- e-mail pessoal;
- telefone;
- nome civil;
- foto pessoal;
- documento;
- códigos de autenticação;
- QR code de login;
- tokens;
- IDs de conta privada;
- mensagens privadas;
- chaves, secrets ou variáveis de ambiente.

### 9.3. Recibo textual seguro

Modelo:

```text
Plataforma: <nome>
Status: <concluído|pendente|bloqueado|monitorar>
URL pública: <url pública ou n/a>
Handle: <handle ou n/a>
Custo: R$ 0 confirmado / bloqueado antes de custo
Exposição pessoal: não observada / bloqueada / pendente
Evidência: <arquivo ou descrição sanitizada>
Próximo passo: <ação exata>
```

## 10. Validação final

Antes de declarar uma plataforma como `concluído`:

- abrir URL pública sem estar logado;
- confirmar que nome público é Brikaya;
- confirmar que bio não cita infraestrutura, ferramenta, conta pessoal ou provedor interno;
- confirmar que link aponta para `https://brikaya.com/`;
- confirmar que não há cobrança ativa;
- confirmar que não há campanha ativa;
- confirmar que não há pixel/tag/script instalado no PWA;
- confirmar que evidência não contém dado pessoal;
- atualizar matriz e pendências no mesmo commit documental.

Antes de declarar o programa social P0 como `concluído`:

- todas as plataformas P0 têm status final registrado;
- todas as pendências restantes têm motivo e próximo passo;
- bloqueios pagos estão explícitos;
- `CHANGELOG.md` registra a decisão operacional;
- evidências sanitizadas existem para perfis concluídos ou bloqueios relevantes.

## 11. Referências oficiais

| Plataforma | Fonte oficial | Uso neste plano |
| --- | --- | --- |
| Meta Business Portfolio | `https://www.facebook.com/business/help/1710077379203657` | Portfólio Meta e ativos relacionados. |
| WhatsApp no Meta Business | `https://www.facebook.com/business/help/713785646327651` | Relação WhatsApp/Business e risco de número público. |
| Instagram Professional | `https://help.instagram.com/502981923235522/` | Conversão/uso profissional. |
| TikTok Business Account | `https://ads.tiktok.com/business/en-US/solutions/business-account` | Conta Business gratuita e bloqueio de anúncios. |
| X Premium Business | `https://help.x.com/en/using-x/premium-business` | Confirmação de assinatura/pagamento para Premium Business. |
| YouTube Brand Channel | `https://support.google.com/youtube/answer/1646861` | Criação de canal separado. |
| Telegram Channels | `https://telegram.org/faq_channels` | Canais públicos. |
| Telegram Bots | `https://core.telegram.org/bots/faq` | Decisão de adiar bot/token. |
| LinkedIn Page | `https://www.linkedin.com/help/linkedin/answer/a543852` | Page gratuita e exigência de conta/admin. |
| Pinterest Business | `https://business.pinterest.com/` | Conta Business gratuita e separação de ads. |
| Snapchat Business | `https://businesshelp.snapchat.com/s/article/set-up-snapchat` | Configuração business/public profile. |
| Discord Game Community | `https://docs.discord.com/developers/game-development/how-to-create-a-community-for-your-game` | Comunidade de jogo. |
| Bluesky domain handle | `https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial` | Handle por domínio e TXT DNS. |
| Mastodon | `https://joinmastodon.org/` | Rede federada, escolha de instância e moderação. |
| Reddit community | `https://support.reddithelp.com/hc/en-us/articles/15484382518344-How-to-create-a-community` | Subreddit somente com moderação. |
| Twitch account | `https://help.twitch.tv/s/article/creating-an-account-with-twitch` | Canal orgânico. |
