# Registro Codex de variáveis e chaves — Brikaya

## Objetivo

Manter um recibo versionado, sem valores sensíveis, para toda variável ou chave usada por Codex, navegador autenticado, API, SDK ou CLI no projeto Brikaya.

O valor real fica somente no `.env` local do projeto, que é ignorado pelo Git e deve permanecer com permissão `0600`.

## Recibo desta thread

- Data: 2026-07-06
- Branch/PR: `codex/yandex-favicon-indexnow` / PR #207
- Ação: migração da correção Yandex favicon/IndexNow para governança `.env`
- Resultado: `.env` local atualizado por `npm run codex-env:bootstrap`
- Valores: não impressos, não versionados e não incluídos em logs ou PR

### Chaves/variáveis confirmadas no `.env` local

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `BRIKAYA_CLOUDFLARE_PAGES_PROJECT_NAME`
- `BRIKAYA_CLOUDFLARE_PAGES_BRANCH`
- `BRIKAYA_CLOUDFLARE_PAGES_OUTPUT_DIR`
- `BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN`
- `BRIKAYA_INDEXNOW_KEY`
- `BRIKAYA_INDEXNOW_ENDPOINT`
- `BRIKAYA_INDEXNOW_PUBLIC_ROOT`
- `BRIKAYA_INDEXNOW_SITEMAP`
- `BRIKAYA_INDEXNOW_DRY_RUN`
- `BRIKAYA_GOOGLE_SEARCH_CONSOLE_PROPERTY`

`BRIKAYA_GOOGLE_SEARCH_CONSOLE_DNS_TXT` fica registrado no registry e no `.env.example`, mas só deve receber valor no `.env` local quando houver valor materializado para uma nova verificação.

## Operação obrigatória para futuras threads

Antes de usar navegador autenticado, API, SDK ou CLI que crie ou configure chave/variável:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:register -- NOME_DA_VARIAVEL --value "valor" --source "origem sanitizada"
```

Quando o valor já estiver em arquivo local:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:register -- NOME_DA_VARIAVEL --from-file caminho/local --source "origem sanitizada"
```

Quando o valor já estiver em variável de ambiente do processo:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:register -- NOME_DA_VARIAVEL --from-env NOME_ORIGEM --source "origem sanitizada"
```

Os comandos emitem somente recibos com nome da chave, classificação, origem e timestamp. O valor real nunca deve aparecer em terminal, documentação, PR, screenshot ou artifact público.

## Validação

Rodar antes de commit, push, deploy ou submissão IndexNow:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:check
```

O validador garante:

- `config/codex-env.registry.json` existe e classifica as variáveis;
- `.env.example` lista nomes seguros;
- `.env` local contém as variáveis obrigatórias;
- `.env` local está com permissão `0600`;
- variáveis `BRIKAYA_*`, `CLOUDFLARE_*`, `GOOGLE_*` e `YANDEX_*` usadas em artefatos versionados estão registradas;
- arquivos públicos IndexNow derivados não divergem de `BRIKAYA_INDEXNOW_KEY`.

## Artefatos públicos derivados

A chave IndexNow é pública por protocolo, mas a fonte local é `BRIKAYA_INDEXNOW_KEY` no `.env`. O arquivo público de verificação é gerado em `dist/<chave>.txt` por:

```bash
PATH="/opt/homebrew/bin:$PATH" npm run codex-env:materialize
```

O log sempre redige o filename real como:

```text
keyLocation=https://brikaya.com/[redacted].txt
```
