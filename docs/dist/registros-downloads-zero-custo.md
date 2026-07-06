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
- rotas localizadas como `/en/downloads/` quando o idioma ativo usa prefixo;
- sitemap com `/downloads/` e versões localizadas;
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
```

Provas visuais esperadas:

- screenshot desktop de `/downloads/`;
- screenshot mobile de `/downloads/`;
- leitura/inspeção do QRCode ou link canônico visível;
- confirmação de ausência de Chrome Web Store, Google Play e Apple App Store na UI.

## Status

Implementação preparada para publicação Cloudflare Pages no domínio canônico. Submissões de lojas pagas não executadas por regra de custo zero.
