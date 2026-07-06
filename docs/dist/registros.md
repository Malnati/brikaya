# Brikaya — registros, descoberta e indexação zero custo

## Objetivo

Manter `https://brikaya.com/` descobrível por buscadores sem custo, sem cobrança, sem plano pago, sem scripts externos de telemetria e sem exposição de identidade pessoal pública.

## Estado operacional em 2026-07-06

- Domínio canônico público: `https://brikaya.com/`.
- Publicação padrão: Cloudflare Pages Direct Upload do diretório `dist/`.
- Sitemap canônico: `https://brikaya.com/sitemap.xml`.
- Robots canônico: `https://brikaya.com/robots.txt` com diretiva `Sitemap`.
- Google Search Console já foi tratado em ciclo anterior.
- Yandex Webmaster sinalizou duas ações:
  - 2026-07-04 02:30 — acelerar indexação do site.
  - 2026-07-04 16:04 — favicon não carregado para o snippet de busca.

## Correção Yandex/favicon

A correção técnica publicada pelo repositório deve manter:

- favicon raiz em `https://brikaya.com/favicon.svg`;
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />` no HTML público;
- favicon SVG local, sem raster, sem CDN, sem `data:`, sem `<image>`, sem script e sem fonte externa;
- cache com revalidação para `/favicon.svg`;
- service worker precacheando `/favicon.svg` para manter a experiência offline-first.

Não criar `favicon.ico`, PNG, JPG ou outro raster runtime enquanto a regra do projeto exigir imagem runtime SVG local/offline.

## IndexNow/Yandex

IndexNow foi adotado como caminho zero-custo para informar ao Yandex que páginas do Brikaya mudaram. A chave IndexNow é pública por definição porque o protocolo exige um arquivo `.txt` acessível no domínio. Ela não é credencial de login e não deve ser usada para autenticação interna.

Fonte operacional obrigatória:

- `BRIKAYA_INDEXNOW_KEY` fica no `.env` local do projeto;
- `public/<chave>.txt` não é mais fonte versionada;
- o arquivo público de verificação é materializado em `dist/<chave>.txt` durante build/deploy;
- logs, PRs e docs devem exibir apenas `https://brikaya.com/[redacted].txt`.

Para sincronizar valores atuais sem imprimir chaves:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:bootstrap
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:check
```

### Comando de validação sem envio

```bash
PATH="/opt/homebrew/bin:$PATH" make yandex-indexnow-dry-run
```

### Comando de envio pós-deploy

```bash
PATH="/opt/homebrew/bin:$PATH" make yandex-indexnow-submit
```

Resultado aceito:

- `status=200`: Yandex recebeu as URLs e a chave foi aceita.
- `status=202`: Yandex recebeu as URLs, mas a chave ainda está em verificação; repetir depois de alguns minutos.

Falhas esperadas e ação:

- `403`: verificar se o arquivo `.txt` da chave está público no domínio canônico.
- `422`: verificar formato da chave, `keyLocation`, host e URLs do sitemap.
- `429`: aguardar; não repetir em loop agressivo.

## Sitemap e reindexação manual

Após cada deploy que muda metadados públicos, favicon, sitemap ou rotas, executar:

```bash
PATH="/opt/homebrew/bin:$PATH" make cloudflare-deploy
PATH="/opt/homebrew/bin:$PATH" make cloudflare-public-check
PATH="/opt/homebrew/bin:$PATH" make yandex-indexnow-submit
```

Se houver acesso gratuito/autenticado ao Yandex Webmaster:

1. Confirmar `https://brikaya.com/sitemap.xml` em “Sitemap files”.
2. Solicitar reprocessamento do sitemap quando houver tentativa disponível.
3. Usar “Reindex pages” para `https://brikaya.com/` após deploy do favicon.
4. Revisar “Site diagnostics” até o alerta de favicon sair ou mudar de estado.

Se Yandex Webmaster bloquear por sessão, autorização ou conta, registrar como pendência operacional. Não criar serviço pago, campanha, cartão, assinatura, overage ou tag de Metrica por padrão.

## Fora de escopo atual

- Yandex Metrica: não adicionada por ser telemetria/script externo e por não ser necessária para corrigir favicon ou notificar mudança via IndexNow.
- Indexação garantida: IndexNow acelera descoberta, mas não garante inclusão nem atualização imediata do snippet.
- Lojas/app stores: continuam fora do P0 se exigirem taxa, cartão, assinatura ou exposição pessoal pública.

## Evidência esperada

Antes de afirmar conclusão:

```bash
PATH="/opt/homebrew/bin:$PATH" node --version
PATH="/opt/homebrew/bin:$PATH" make help
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:check
PATH="/opt/homebrew/bin:$PATH" npm run test:semantic-file-names
PATH="/opt/homebrew/bin:$PATH" npm run test:svg-assets
PATH="/opt/homebrew/bin:$PATH" npm run build
/usr/bin/curl -sSI https://brikaya.com/favicon.svg
/usr/bin/curl -sSI https://brikaya.com/sitemap.xml
/usr/bin/curl -sSI https://brikaya.com/robots.txt
```

Critérios:

- Node começa com `v23.`.
- `.env` local contém as variáveis obrigatórias, com valores omitidos em logs e permissão `0600`.
- `/favicon.svg` público responde `200` com `content-type: image/svg+xml`.
- `/sitemap.xml` e `/robots.txt` respondem `200`.
- IndexNow retorna `200` ou `202` com saída sanitizada, sem imprimir a chave.
