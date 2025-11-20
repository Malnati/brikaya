<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/plano-automacao-issues.md -->
# Plano de Automação das Issues e Rastreabilidade via Diretório `docs/rup/`

> Base: [./plano-automacao-issues.md](./plano-automacao-issues.md)


## 1. Objetivo
Estabelecer um fluxo único para registrar, rastrear e automatizar requisitos e tarefas do projeto App utilizando o diretório `docs/rup/` como fonte da verdade. O plano garante que GitHub Actions e GitHub Copilot monitorem os artefatos do `docs/rup/` para gerar issues e atualizações automáticas, mantendo o `AGENTS.md` como autoridade operacional para os agentes Codex.

## 2. Panorama do Diretório `docs/rup/`
O diretório `docs/rup/` concentra os artefatos obrigatórios de cada fase do RUP. A tabela resume os diretórios ativos e os documentos principais que devem ser monitorados para automação:

| Diretório | Propósito | Artefatos-chave |
| --- | --- | --- |
| `docs/rup/00-visao/` | Visão estratégica e objetivos | `README.md`, `visao-do-produto.md`, `escopo.md`, `stakeholders.md`, `lgpd.md` |
| `docs/rup/01-arquitetura/` | Macroarquitetura, integrações e NFR | `README.md`, `arquitetura-da-extensao.md`, `integracoes-com-apis.md`, `requisitos-nao-funcionais.md` |
| `docs/rup/02-design/` | Design detalhado e fluxos operacionais | `README.md`, `design-geral.md`, `componentes.md`, `fluxos.md` |
| `docs/rup/02-planejamento/` | Planejamento, governança e riscos | `README.md`, `cronograma.md`, `governanca.md`, `milestones.md`, `riscos-e-mitigacoes.md`, `roadmap.md`, `wbs.md` |
| `docs/rup/03-implementacao/` | Diretrizes de implementação e testes unitários | `README.md`, `estrutura-de-projeto.md`, `build-e-automacao.md`, `padroes-de-codigo.md`, `testes.md` |
| `docs/rup/04-testes-e-validacao/` | Estratégias e critérios de QA | `README.md`, `estrategia-geral.md`, `criterios-de-aceitacao.md`, `testes-end-to-end.md`, `validacao-de-marcos.md` |
| `docs/rup/05-entrega-e-implantacao/` | Entrega, ambientes e operação contínua | `README.md`, `ambientes-e-configuracoes.md`, `empacotamento.md`, `publicacao-e-versionamento.md`, `operacao-e-manutencao.md` |
| `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/` | Governança técnica, auditoria e IA | `README.md`, `governanca-tecnica.md`, `controle-de-qualidade.md`, `auditoria-e-rastreabilidade.md`, `revisoes-com-ia.md` |
| `docs/rup/06-ux-brand/` | Diretrizes de UX, acessibilidade e identidade | `README.md`, `diretrizes-de-ux.md`, `acessibilidade.md`, `identidades-visuais.md` |
| `docs/rup/07-contribuicao/` | Normas de colaboração | `README.md`, `contribuindo.md`, `padroes-de-commit.md`, `template-de-pr.md` |
| `docs/rup/99-anexos/` | Glossário e referências de apoio | `README.md`, `glossario.md`, `referencias.md` |
| `docs/rup/03-agentes-ia/`, `docs/rup/04-qualidade-testes/`, `docs/rup/05-operacao-release/` | Acervos históricos | Documentação anterior preservada para auditoria |
| `docs/rup/validation-report.md` | Certifica atualizações e pendências | Relatório consolidado |

## 3. Convenção de Registro de Requisitos
Todos os requisitos devem ser lançados em arquivos existentes do diretório `docs/rup/`, seguindo a convenção RUP abaixo para rastreabilidade e automação:

1. **Prefixo**: `RUP-<fase>-<domínio>-<sequência>`. Exemplos:
   - `RUP-00-VIS-001` para requisitos estratégicos na visão.
   - `RUP-01-ARQ-015` para requisitos arquiteturais ou NFR.
   - `RUP-04-QA-007` para critérios de teste/validação.
2. **Sequência numérica**: três dígitos sequenciais por diretório. Atualize o último índice registrado no próprio arquivo antes de criar o próximo.
3. **Bloco padrão**: cada requisito deve incluir:
   - Cabeçalho `## RUP-<...>` ou `###` conforme hierarquia do documento.
   - Seções obrigatórias: `Descrição`, `Justificativa`, `Impactos`, `Critérios de Aceitação` (quando aplicável) e `Relacionamentos` (links cruzados para outros requisitos).
4. **Rastreabilidade cruzada**:
   - Requisitos funcionais → `docs/rup/02-design/*`.
   - Requisitos não funcionais → `docs/rup/01-arquitetura/requisitos-nao-funcionais.md`.
   - Processos de entrega/governança → `docs/rup/05-entrega-e-implantacao/*` e `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/*`.
   - Experiência do usuário → `docs/rup/06-ux-brand/*`.
   - Itens de planejamento → `docs/rup/02-planejamento/*`.
   - Testes derivados → `docs/rup/04-testes-e-validacao/*`.
5. **Sem novos arquivos**: sempre atualizar o artefato existente correspondente, registrando referências cruzadas no início do documento (lista ou índice) quando necessário.
6. **Validação**: após atualizar qualquer requisito, registrar a entrada em `docs/rup/validation-report.md`, mantendo o histórico de revisão.

## 4. Workflow de Automação de Issues
1. **Monitoramento do Diretório `docs/rup/`**:
   - GitHub Actions vigia alterações nos diretórios `docs/rup/**` e neste plano (`docs/rup/06-governanca-tecnica-e-controle-de-qualidade/plano-automacao-issues.md`).
   - Ao detectar um novo bloco `RUP-<...>` ou alteração relevante, a action aciona o GitHub Copilot para analisar o delta.
2. **Geração de Issues**:
   - Copilot utiliza o prefixo RUP para gerar título (`<prefixo> - <resumo>`).
   - Labels padronizados derivam da fase (ex.: `fase:visao`, `fase:arquitetura`, `fase:qa`).
   - O corpo da issue replica o bloco do requisito, adicionando checklists para cada critério de aceitação.
3. **Sincronização Bidirecional**:
   - Fechamento da issue exige atualizar o bloco RUP com o campo `Status` (`em andamento`, `concluído`, `cancelado`) e data/hora.
   - GitHub Actions valida que o status foi refletido no diretório `docs/rup/` antes de permitir merge de PRs relacionados.
4. **Relatórios Automáticos**:
   - A cada merge em `main`, uma action compila `docs/plan-automate-issues.md` + `docs/rup/validation-report.md` e gera um resumo no `CHANGELOG/` correspondente.
   - Logs de execução de agentes permanecem centralizados conforme política do `AGENTS.md`.

## 5. Governança e Papel do AGENTS.md
- `AGENTS.md` permanece como contrato operacional para agentes Codex e humanos.
- Instruções conflitantes devem ser revisadas para garantir:
  - Observância obrigatória do plano presente neste documento.
  - Permissão explícita para criar ou atualizar entradas no diretório `docs/rup/` quando direcionado pelas issues automatizadas.
  - Reforço de que novas documentações devem priorizar artefatos existentes.
- Atualizações no `AGENTS.md` devem sempre referenciar este plano e ser registradas em changelog.

## 6. Próximos Passos
1. Atualizar `AGENTS.md` alinhando-o a este plano e removendo eventuais conflitos herdados de outros projetos.
2. Configurar pipeline GitHub Actions para análise das alterações no diretório `docs/rup/` e criação automática de issues.
3. Definir prompts específicos do Copilot baseados no prefixo RUP para gerar/resolver issues.
4. Capacitar a equipe sobre o uso da convenção de requisitos e validação no `docs/rup/validation-report.md`.

Com esse fluxo, o projeto mantém rastreabilidade integral alinhada ao RUP, permitindo que automações baseadas nos artefatos do diretório `docs/rup/` criem e acompanhem issues de forma confiável e auditável.
