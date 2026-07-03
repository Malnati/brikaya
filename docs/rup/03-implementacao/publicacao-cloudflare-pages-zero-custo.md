<!-- docs/rup/03-implementacao/publicacao-cloudflare-pages-zero-custo.md -->
# Publicação Cloudflare Pages zero custo

## Objetivo

Publicar o Brikaya como PWA estática no Cloudflare Pages sem ativar serviços pagos, mantendo funcionamento offline após o primeiro carregamento.

## Arquitetura escolhida

- Produto: Cloudflare Pages.
- Método: Direct Upload com Wrangler.
- Projeto Cloudflare Pages operacional: `malnati-brickbreaker`.
- Domínio canônico: `https://brikaya.com/`.
- O domínio gerado pelo Cloudflare Pages deve redirecionar para `https://brikaya.com/` e não deve ser usado como endpoint público.
- Saída publicada: `dist/`.
- Branch de produção: `main`.

## Matriz de custo

| Item | Uso neste projeto | Custo esperado | Regra |
| --- | --- | --- | --- |
| Cloudflare Pages estático | Sim | Zero | Permitido |
| Domínio gerado pelo Cloudflare Pages | Sim, somente com redirect canônico | Zero | Não usar como endpoint público |
| Bulk Redirect para domínio canônico | Sim, 1 lista e 1 regra | Zero no plano gratuito | Permitido dentro das quotas gratuitas |
| Domínio próprio já registrado `brikaya.com` | Sim | Zero adicional esperado | Permitido sem compra/transferência |
| Domínio próprio comprado | Não | Pode gerar custo | Proibido sem confirmação |
| Pages Functions | Não | Pode consumir quotas extras | Não usar |
| Workers | Não | Pode consumir quotas extras | Não usar |
| KV/D1/R2/Queues/Vectorize | Não | Pode gerar custo/limite | Não usar |
| Access/Zero Trust | Não | Pode exigir ativação/overage | Não usar |
| AI/Images/Browser Rendering | Não | Pode gerar custo | Não usar |
| Web Analytics/RUM/beacon externo | Não | Zero se desativado | Bloquear com `no-transform` e QA sem request externo |
| Google Console | Não no fluxo padrão | Não aplicável | Só usar projeto Tookyn se necessário |

Se Cloudflare, Google ou outro painel exibir cobrança, upgrade, overage, compra de domínio, ativação comercial ou autorização de gastos, a execução deve parar antes de aceitar.

## Variáveis

As credenciais sensíveis ficam em `/Users/mal/GitHub/malnati/.env`. O `.env` local do projeto contém apenas variáveis específicas do Brikaya e deve ser espelhado no `.env` de `/Users/mal/GitHub/malnati/` quando mudar.

Variáveis usadas:

- `CLOUDFLARE_ACCOUNT_ID` — definida em `/Users/mal/GitHub/malnati/.env`.
- `CLOUDFLARE_API_TOKEN` — definida em `/Users/mal/GitHub/malnati/.env`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_PROJECT_NAME` — padrão operacional `malnati-brickbreaker`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_BRANCH` — padrão `main`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_OUTPUT_DIR` — padrão `dist`.
- `BRICKBREAKER_CLOUDFLARE_PAGES_CUSTOM_DOMAIN` — domínio principal `brikaya.com`.

Não registre valores reais em Markdown, issues, PRs, screenshots, logs publicados ou respostas do Codex.

## Comandos oficiais

Documentação oficial consultada:

- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Direct Upload com Wrangler em CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Pages Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages API Domains](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/domains/methods/create/)
- [Cloudflare DNS Records API](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/create/)
- [Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Limites do Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/)
- [Redirect do domínio gerado pelo Pages para domínio customizado](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/)
- [Disponibilidade gratuita de Redirects](https://developers.cloudflare.com/rules/url-forwarding/)
- [Variáveis de ambiente do Wrangler](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/)

Comandos equivalentes:

```bash
npx wrangler pages project create malnati-brickbreaker --production-branch main
npx wrangler pages deploy dist --project-name malnati-brickbreaker --branch main
node scripts/cloudflare-pages.js ensure-domain
node scripts/cloudflare-pages.js ensure-dns
node scripts/cloudflare-pages.js ensure-pages-dev-redirect
```

Targets do projeto:

```bash
make cloudflare-env-check
make cloudflare-build
make cloudflare-deploy
make cloudflare-domain
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
node scripts/cloudflare-pages.js domain-list
node scripts/cloudflare-pages.js dns-state
node scripts/cloudflare-pages.js redirect-state
make cloudflare-deploy
make cloudflare-domain
```

Público:

```bash
curl -I https://brikaya.com/
curl -I https://malnati-brickbreaker.pages.dev/
```

Validações no navegador:

- jogo abre sem alertas/debug visíveis;
- assets locais carregam;
- manifest aponta para ícones locais;
- service worker fica ativo;
- pontuação/logs persistem via IndexedDB;
- após um carregamento online, recarregar offline mantém jogo e assets disponíveis;
- não há chamadas a CDN, fontes externas, APIs pagas ou terceiros;
- `Cache-Control` inclui `no-transform`, impedindo injeção automática de beacon externo.

## Evidência pública

- Screenshot: `docs/assets/issues/cloudflare-pages-zero-cost/evidence/2026-06-30-public-desktop.png`
- Recibo técnico sanitizado: `docs/assets/issues/cloudflare-pages-zero-cost/evidence/2026-06-30-public-validation.json`

## Recibo sanitizado esperado

A entrega deve informar somente:

- URL canônica validada;
- redirect do domínio gerado pelo Cloudflare Pages para `https://brikaya.com/`;
- confirmação de Cloudflare Pages estático sem produtos pagos ativados;
- nomes das variáveis espelhadas, sem valores;
- Google Console não usado ou confirmação de uso do projeto Tookyn;
- se Chrome foi usado: janela usada e abas temporárias fechadas;
- comandos de validação executados;
- evidência offline;
- bloqueadores restantes, se houver.
