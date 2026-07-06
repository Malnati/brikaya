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
- rotas localizadas para todos os idiomas suportados:
  - `/en/downloads/`;
  - `/es-419/downloads/`;
  - `/en-IN/downloads/`;
  - `/hi-IN/downloads/`;
  - `/de/downloads/`;
  - `/fr/downloads/`;
  - `/it/downloads/`;
  - `/ja/downloads/`;
  - `/ko/downloads/`;
  - `/id/downloads/`;
  - `/vi/downloads/`;
  - `/fil/downloads/`;
  - `/th/downloads/`;
  - `/zh-CN/downloads/`;
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
- `make cloudflare-i18n-seo-qa` passou com downloads localizados para todos os 15 idiomas.
- `make cloudflare-offline-pwa-qa` passou.
- `make yandex-indexnow-submit` agora força envio real (`BRIKAYA_INDEXNOW_DRY_RUN=false`) e retornou `202 accepted-pending` para 32 URLs com chave redigida.

Status multilíngue obrigatório:

- `/downloads/` publica copy em `pt-BR`;
- páginas prefixadas publicam copy e SEO no respectivo idioma;
- `en` e `en-IN` podem usar copy em inglês;
- todos os demais idiomas devem exibir título, descrição, botões, opções, instruções e compromisso de gratuidade no idioma local.

Buscadores devem receber a versão canônica via sitemap e hreflang; quando houver painel gratuito, a submissão deve ser feita pela aba única `Brikaya webmaster/i18n`.

Status de buscadores em 2026-07-06:

- Google Search Console: sitemap processado e oito URLs principais com indexação manual solicitada.
- Bing Webmaster Tools: sitemap reenviado, oito URLs principais submetidas, IndexNow com URLs localizadas recentes, sem ativar Clarity.
- Yandex Webmaster: sitemap em fila, `/` e `/downloads/` em fila de reindexação.
- Naver Search Advisor: `sitemap.xml` já submetido; rechecagem posterior parou em login sem inserir credenciais.
- Baidu Search Resource Platform: cadastro internacional gratuito tentou Brasil na aba fornecida; Baidu retornou que registros de regiões externas não são suportados no momento. Não houve código SMS, CAPTCHA, documento, ICP, pagamento, serviço pago nem registro final de conta; valores pessoais não entram na documentação/evidência.
- DuckDuckGo/Yahoo/Seznam/Yep/outros: sem painel direto obrigatório no escopo; cobertura por Bing/IndexNow/sitemap/robots/canonical/hreflang.
