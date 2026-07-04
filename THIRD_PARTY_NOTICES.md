<!-- THIRD_PARTY_NOTICES.md -->
# Avisos de terceiros

Brikaya usa bibliotecas de desenvolvimento e execução listadas em `package.json`. Cada dependência mantém seus próprios termos e avisos.

## Dependências principais

- React e React DOM para interface.
- Vite e TypeScript para build e tipagem.
- Capacitor para empacotamento nativo opcional.
- idb para persistência local no navegador.
- Jest, Testing Library e Puppeteer para validação automatizada.
- Wrangler para publicação estática quando autorizado.

## Assets

- Assets visuais do runtime devem ser SVG local/offline em `public/assets/visual/`.
- Assets de áudio do runtime devem ficar em `public/assets/audio/` com origem rastreável.
- Novos assets externos só podem entrar quando a origem, autorização de uso, hash e escopo forem registrados antes do commit.

## Restrições

Não incorporar material visual, sonoro, textual ou promocional sem origem documentada e autorização compatível com distribuição web, PWA e monetização futura.
