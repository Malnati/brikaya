<!-- docs/rup/05-operacao-release/setup-ambiente-codex.md -->
# Setup do ambiente Codex (Histórico)

> Base: [./setup-ambiente-codex.md](./setup-ambiente-codex.md)
> Referência atual: [Empacotamento](../05-entrega-e-implantacao/empacotamento-spec.md) · [Publicação e Versionamento](../05-entrega-e-implantacao/publicacao-e-versionamento-spec.md)

Este roteiro mantém o passo a passo para restaurar o ambiente Codex utilizado na automação do App. Embora os pipelines atuais estejam descritos na fase de Entrega e Implantação, este arquivo continua associado a [REQ-305](../02-planejamento/requisitos-spec.md#req-305) (IaC e GitOps) e registra a equivalência com os legados `REQ-019`, `REQ-021`, `REQ-022`.

> **Base de requisitos:** o PRD (`docs/rup/99-anexos/PRD_Plataforma_App_Completo.md`) exige entregáveis técnicos globais com pipelines reproduzíveis, enquanto a matriz de permissões (`docs/rup/99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md`) determina segregação de funções. O setup precisa refletir esses controles ao configurar tokens, MCP e logs.

## Pré-requisitos
- Token pessoal do GitHub com escopos `repo`, `read:org`, `workflow`, garantindo auditoria de acesso ([REQ-305](../02-planejamento/requisitos-spec.md#req-305); legados `REQ-021`, `REQ-022`).
- Variáveis definidas no terminal ou em scripts (`GH_TOKEN`, `GH_REPO_SLUG`, `GH_HOST` quando aplicável) para permitir rastreabilidade de pipelines e integrações colaborativas (REQ-305; legados `REQ-021`, `REQ-029`).
- Permissão para instalar dependências e executar scripts no container Codex, alinhado ao fluxo de build descrito em [empacotamento-spec.md](../05-entrega-e-implantacao/empacotamento-spec.md).

## Variáveis de ambiente sugeridas
```bash
export GH_TOKEN="<token_github>"
export GH_REPO_SLUG="mbra/app"
export GITHUB_TOKEN="$GH_TOKEN"
export GITHUB_PERSONAL_ACCESS_TOKEN="$GH_TOKEN"
```
- Se utilizar GitHub Enterprise, configure `GH_HOST` para registrar logs corretos em `docs/checklists/release-log.md` (REQ-029; legado `REQ-029`).

## Passo a passo resumido
1. **Propagar credenciais** — exporte as variáveis acima na sessão atual e registre no checklist `docs/checklists/codex-setup.md`, preservando [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e legados `REQ-022`, `REQ-029`.
2. **Instalar GitHub CLI** — `bash scripts/bootstrap-gh.sh` instala/configura o `gh`, habilita `gh auth setup-git` e valida acesso ao repositório definido em `GH_REPO_SLUG`. Necessário para pipelines GitOps de [REQ-305](../02-planejamento/requisitos-spec.md#req-305). Legado associado: `REQ-021`.
3. **Provisionar servidor MCP** — `bash scripts/mcp-github/mcp-bootstrap.sh` instala Go, clona `github-mcp-server`, compila binário e inicia o serviço no modo `stdio`. Registre saída em `/tmp/github-mcp.log` e `/tmp/github-mcp.pid`, alinhando auditorias colaborativas com [REQ-205](../02-planejamento/requisitos-spec.md#req-205) e legados `REQ-031`–`REQ-033`.
4. **Verificar estado** — execute `gh auth status` e `pgrep -f github-mcp-server` para confirmar a inicialização. Anexe evidências ao relatório `docs/checklists/codex-setup.md` para cumprir [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
5. **Aplicar hooks locais** — `bash scripts/git-pre-commit/install-pre-commit.sh` sincroniza validações locais com os pipelines, reforçando [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e legado `REQ-019`.

## Logs e auditoria
- Exportar logs do MCP para `docs/checklists/codex-mcp-log.md` após cada reinstalação, permitindo rastreamento de chamadas de agentes colaborativos (REQ-304; legados `REQ-031`–`REQ-033`).
- Registrar versões instaladas (`gh --version`, `go version`) em `docs/checklists/codex-setup.md`, garantindo consistência entre execuções e cumprindo [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

[Voltar ao índice](README-spec.md)
