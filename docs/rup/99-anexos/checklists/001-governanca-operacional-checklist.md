<!-- docs/checklists/001-governanca-operacional-checklist.md -->
# Checklist de Governança Operacional do Repositório

## Políticas Gerais de Agentes
- [ ] Confirmar que as execuções de agentes registram `AGENT_ID`, `GITHUB_RUN_ID`, `MODEL_NAME`, `TIMESTAMP`, `PROMPT_FILE`, `RESULT_FILE` e `REVIEW_STATUS`, exportando o relatório para `docs/reports/audit-report.md` ao final de cada ciclo. 
- [ ] Validar que os pipelines `audit.yml` e demais automações de auditoria permanecem habilitados e sem erros conhecidos.
- [ ] Verificar se existe changelog atualizado apontando revisões governadas conforme as instruções do `AGENTS.md`.

## Convenções de Código Obrigatórias
- [ ] Garantir que todo arquivo editado contenha comentário inicial com o caminho relativo seguindo a sintaxe definida para a linguagem (Markdown, TypeScript, JavaScript, YAML, Makefile, MCD etc.).
- [ ] Assegurar que não existam imports fora do topo dos arquivos ou envolvidos em blocos `try/catch` para contornar erros de carregamento.
- [ ] Revisar que não há código morto: funções, classes, hooks, variáveis, tipos, enums ou imports sem uso; entradas de configuração e dependências não utilizadas devem ser removidas.
- [ ] Confirmar que o princípio DRY está preservado e que componentes ou helpers não duplicam lógica existente.

## Scripts, Automação e Ferramentas
- [ ] Checar que não foram adicionados scripts shell (`.sh`, `.bash`) além de entrypoints referenciados por Dockerfiles, nem novos alvos no `Makefile` sem autorização explícita.
- [ ] Validar que as automações utilizam exclusivamente o `Makefile` como orquestrador oficial.
- [ ] Garantir que scripts E2E continuem escritos em JavaScript/TypeScript com Puppeteer e executados via `npm run test:e2e` ou alvos já existentes.

## Documentação e Comunicação
- [ ] Confirmar que alterações relevantes em variáveis de ambiente, endpoints ou arquitetura atualizaram os READMEs específicos e `docs/README.md`.
- [ ] Revisar se planos de mudança seguem o padrão obrigatório (seções numeradas, prefixo `YYYYMMDDHHMMSS-`, versão audit e referência cruzada no changelog).
- [ ] Certificar que relatórios automáticos (`docs/reports/`) permanecem sincronizados com revisões de requisitos, riscos e auditorias.

## Monitoramento e Observabilidade
- [ ] Checar que cada serviço containerizado expõe `/health` e `/metrics` conforme `docs/rup/05-entrega-e-implantacao/ambientes-e-configuracoes.md`.
- [ ] Garantir que ajustes em portas, coletores ou dashboards estejam documentados nos artefatos de entrega e governança correspondentes.

## Ética, Segurança e Compliance
- [ ] Validar aderência à LGPD, políticas de provedores de IA e restrições da Chrome Web Store; nenhuma operação deve acessar dados de produção.
- [ ] Confirmar que requisitos e riscos referenciados citam IDs (`REQ-###`, `RISK-###`) e permanecem atualizados na documentação oficial.

## Integração com GitHub e MCP
- [ ] Garantir que `GH_TOKEN`, `GH_REPO_SLUG` e variáveis relacionadas estejam configuradas antes de usar `gh`.
- [ ] Registrar a execução dos scripts `scripts/bootstrap-gh.sh` e `scripts/mcp-github/mcp-bootstrap.sh` quando fluxos dependem do GitHub CLI ou MCP.
- [ ] Verificar logs em `/tmp/github-mcp.log` e PID em `/tmp/github-mcp.pid` para assegurar que o servidor MCP do GitHub esteja ativo quando necessário.
