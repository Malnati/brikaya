<!-- docs/rup/03-implementacao/publicacao-cloudflare-pages-zero-custo.md -->
# Publicação Cloudflare Pages zero custo

## Objetivo

Publicar o BrickBreaker como PWA estática no Cloudflare Pages sem ativar serviços pagos, mantendo funcionamento offline após o primeiro carregamento.

## Arquitetura escolhida

- Produto: Cloudflare Pages.
- Método: Direct Upload com Wrangler.
- Projeto padrão tentado: `brickbreaker`.
- Fallback operacional: `malnati-brickbreaker`.
- URL pública usada quando o subdomínio limpo estiver indisponível: `https://malnati-brickbreaker.pages.dev/`.
- Saída publicada: `dist/`.
- Branch de produção: `main`.

## Matriz de custo

| Item | Uso neste projeto | Custo esperado | Regra |
| --- | --- | --- | --- |
| Cloudflare Pages estático | Sim | Zero | Permitido |
| Domínio `*.pages.dev` | Sim | Zero | Permitido |
| Domínio próprio comprado | Não | Pode gerar custo | Proibido sem confirmação |
| Pages Functions | Não | Pode consumir quotas extras | Não usar |
| Workers | Não | Pode consumir quotas extras | Não usar |
| KV/D1/R2/Queues/Vectorize | Não | Pode gerar custo/limite | Não usar |
| Access/Zero Trust | Não | Pode exigir ativação/overage | Não usar |
| AI/Images/Browser Rendering | Não | Pode gerar custo | Não usar |
| Google Console | Não no fluxo padrão | Não aplicável | Só usar projeto Tookyn se necessário |

Se Cloudflare, Google ou outro painel exibir cobrança, upgrade, overage, compra de domínio, ativação comercial ou autorização de gastos, a execução deve parar antes de aceitar.

## Variáveis

As credenciais sensíveis ficam em `/Users/mal/GitHub/malnati/.env`. O `.env` local do projeto contém apenas variáveis específicas do BrickBreaker e deve ser espelhado no `.env` de `/Users/mal/GitHub/malnati/` quando mudar.

Variáveis usadas:

- `CLOUDFLARE_ACCOUNT_ID` — definida em `/Users/mal/GitHub/malnati/.env`.
- `CLOUDFLARE_API_TOKEN` — definida em `/Users/mal/GitHub/malnati/.env`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_PROJECT_NAME` — padrão operacional `malnati-brickbreaker`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_BRANCH` — padrão `main`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_OUTPUT_DIR` — padrão `dist`.

Não registre valores reais em Markdown, issues, PRs, screenshots, logs publicados ou respostas do Codex.

## Comandos oficiais

Documentação oficial consultada:

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Direct Upload com Wrangler em CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Limites do Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/)
- [Variáveis de ambiente do Wrangler](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/)

Comandos equivalentes:

```bash
npx wrangler pages project create malnati-brickbreaker --production-branch main
npx wrangler pages deploy dist --project-name malnati-brickbreaker --branch main
```

Targets do projeto:

```bash
make cloudflare-env-check
make cloudflare-build
make cloudflare-deploy
```

## Política de Google Chrome e Google Console

O Google Console não é necessário para o fluxo padrão. Se for necessário usá-lo, use somente:

```text
https://console.cloud.google.com/welcome?project=tookyn
```

Se for necessário usar Google Chrome:

1. Definir qual janela existente será usada antes da navegação.
2. Não abrir novas janelas.
3. Abrir abas temporárias apenas nessa janela.
4. Fechar as abas abertas pela execução assim que a etapa terminar.
5. Não fechar abas preexistentes do usuário.

## Validação obrigatória

Local:

```bash
make help
npm ci
npm run build
npm test -- --runInBand
```

Cloudflare:

```bash
node scripts/cloudflare-pages.js whoami
node scripts/cloudflare-pages.js project-list
make cloudflare-deploy
```

Público:

```bash
curl -I https://malnati-brickbreaker.pages.dev/
```

Validações no navegador:

- jogo abre sem alertas/debug visíveis;
- assets locais carregam;
- manifest aponta para ícones locais;
- service worker fica ativo;
- pontuação/logs persistem via IndexedDB;
- após um carregamento online, recarregar offline mantém jogo e assets disponíveis;
- não há chamadas a CDN, fontes externas, APIs pagas ou terceiros.

## Evidência pública

- Screenshot: `docs/assets/issues/cloudflare-pages-zero-cost/evidence/2026-06-30-public-desktop.png`
- Recibo técnico sanitizado: `docs/assets/issues/cloudflare-pages-zero-cost/evidence/2026-06-30-public-validation.json`

## Recibo sanitizado esperado

A entrega deve informar somente:

- URL pública validada;
- confirmação de Cloudflare Pages estático sem produtos pagos ativados;
- nomes das variáveis espelhadas, sem valores;
- Google Console não usado ou confirmação de uso do projeto Tookyn;
- se Chrome foi usado: janela usada e abas temporárias fechadas;
- comandos de validação executados;
- evidência offline;
- bloqueadores restantes, se houver.
