<!-- README.md -->
# Brikaya

Brikaya é um jogo arcade offline-first para navegador, desenvolvido em TypeScript e React como PWA. O jogo roda no domínio canônico `https://brikaya.com/` e mantém a experiência principal disponível após o primeiro carregamento.

## Características

- PWA instalável e offline-first.
- Interface responsiva para desktop e mobile.
- Pontuação e estatísticas locais no navegador.
- Assets visuais locais em SVG.
- Áudio local controlável pelo jogador.
- Publicação web estática sem dependência de serviços pagos para jogar.

## Desenvolvimento local

Pré-requisitos:

- Node.js v23.x.
- npm 10.x.

```bash
git clone https://github.com/Malnati/brikaya.git
cd brikaya
npm install
npm run dev
```

## Build

```bash
npm run build
```

O build gera saída estática em `dist/`.

## Publicação

A rota pública oficial é `https://brikaya.com/`. Os comandos operacionais ficam no `Makefile`:

```bash
make cloudflare-env-check
make cloudflare-build
make cloudflare-deploy
```

Qualquer publicação deve manter custo zero até aprovação explícita para mudança comercial.

## Qualidade

Validações principais:

```bash
npm run test:semantic-file-names
npm run test:svg-assets
npm run build
```

Testes contra o site publicado usam `BRIKAYA_PUBLIC_URL` quando for necessário apontar para preview ou produção.

## Documentação

- [Arquitetura](docs/arquitetura.md)
- [Autoria e propriedade](docs/autoria-e-propriedade.md)
- [Privacidade](docs/privacidade.md)
- [Publicação](docs/publicacao.md)
- [QA](docs/qa.md)

## Licença

Brikaya é distribuído sob a [MIT License](LICENSE).
