---
name: "source-command-validate"
description: "Rodar a validação mínima do Brikaya antes de entrega (AGENTS.md)"
---

# source-command-validate

Use this skill when the user asks to run the migrated source command `validate`.

## Command Template

Rodar a sequência de validação mínima do Brikaya (fonte: `AGENTS.md`). Executar na ordem e reportar o primeiro passo que falhar:

```bash
node --version
make help
npm run codex-env:check
npm run sync:package-version
npm run verify:package-version
npm run verify:build-version
npm run test:semantic-file-names
npm run test:svg-assets
npm run test:visual-asset-policy
npm run build
```

Confirmar que `node --version` tem prefixo `v23.`. Antes de merge em `main`, garantir também a documentação de versão (`npm run brikaya:scaffold-version-docs`, preencher `.tags/vN.md` e `.releases/vN.md`, `npm run verify:version-docs`).
