<!-- AGENTS.md -->
# Contribuição assistida por IA — Brikaya

Estas instruções se aplicam a todo o repositório.

## Projeto

Brikaya é um jogo arcade offline-first em TypeScript/React, distribuído como PWA no domínio canônico `https://brikaya.com/`.

## Runtime obrigatório

- Use Node.js v23.x e npm 10.x.
- Antes de build, teste, publicação ou execução técnica, rode `node --version` e confirme prefixo `v23.`.

## Engenharia

- Aplicar DRY, SRP, coesão alta e baixo acoplamento.
- Componentes React devem usar funções nomeadas.
- Separar código por domínio lógico: `components/`, `hooks/`, `logic/`, `objects/`, `storage/`, `utils/`, `constants/`.
- Evitar dependências externas em runtime do jogo principal.
- Não fazer alterações estéticas não solicitadas.
- Remover código morto após qualquer mudança funcional.

## Offline-first

- O jogo principal deve funcionar offline após o primeiro carregamento.
- Service worker deve precachear o necessário e atender runtime com estratégia local/cache-first quando aplicável.
- Anúncios reais, se aprovados no futuro, devem ser opcionais, online-only e nunca bloquear jogo, pontuação, áudio, logs, assets ou progressão.

## Assets

- Imagem visual runtime deve ser SVG local/offline.
- Proibido adicionar raster, data URI, CDN, fonte externa, imagem externa ou script embutido em SVG runtime.
- Áudio runtime deve ter origem documentada e ficar local.
- Antes de commit, rode `npm run test:semantic-file-names` e `npm run test:svg-assets`.

## Produto e UI

- Interface deve usar linguagem de usuário, não detalhes internos.
- Não expor fornecedores, infraestrutura, variáveis, credenciais, ferramentas internas ou detalhes de operação para jogador final.
- Seguir WCAG 2.1 AA para contraste, foco e navegação.
- Manter simplicidade visual, grade de 8px, regra 60-30-10 e hierarquia tipográfica 4x2.

## Publicação

- Publicação padrão: saída estática em `dist/`.
- Domínio público canônico: `https://brikaya.com/`.
- Não aceitar cobrança, plano pago, overage, cartão, campanha ativa ou compra sem aprovação explícita.
- Variáveis locais ficam fora do Git; documentar apenas nomes seguros em `.env.example`.

## GitHub

- Operações GitHub em automação local devem usar wrappers administrativos configurados nesta máquina.
- Não usar comandos GitHub simples quando houver wrapper obrigatório.
- Não imprimir tokens, segredos ou dados sensíveis.

## Validação mínima

Antes de entrega técnica:

```bash
node --version
make help
npm run test:semantic-file-names
npm run test:svg-assets
npm run build
```
