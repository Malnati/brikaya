<!-- docs/rup/03-implementacao/build-e-automacao.md -->
# Build, Automação e Integração Contínua

> Base: [./build-e-automacao.md](./build-e-automacao.md)
> Rastreabilidade: [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-045](../02-planejamento/requisitos-spec.md#req-045)
> Legados correlatos: [REQ-011](../02-planejamento/requisitos-spec.md#req-011)–[REQ-020](../02-planejamento/requisitos-spec.md#req-020)
> Referências complementares: [Entrega e Implantação](../05-entrega-e-implantacao/README-spec.md) · [Governança Técnica](../06-governanca-tecnica-e-controle-de-qualidade/README-spec.md) · [Capacidade Colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

Esta seção descreve o fluxo de automação do App, adaptando a disciplina herdada do Yagnostic para a realidade de um App com obrigações climáticas. Os scripts, pipelines e controles documentados aqui precisam refletir tanto os requisitos atuais quanto as práticas legadas (`REQ-001`…`REQ-030`) para manter rastreabilidade completa.

---

## Princípios gerais
- **Makefiles como interface única** — cada pacote (`apps/*`, `services/*`, `data/*`, `infra/*`) expõe `make install`, `make lint`, `make test`, `make build` e `make deploy`, garantindo consistência operacional e atendendo [REQ-045](../02-planejamento/requisitos-spec.md#req-045). Os targets devem mencionar os equivalentes legados [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-020](../02-planejamento/requisitos-spec.md#req-020) ao atualizar documentação.
- **Scripts determinísticos** — builds precisam ser reproduzíveis em qualquer ambiente (local, CI, produção) com variáveis explícitas (`ENV`, `SERVICE`, `TENANT`), atendendo [REQ-012](../02-planejamento/requisitos-spec.md#req-012) e os controles de disponibilidade legados [REQ-013](../02-planejamento/requisitos-spec.md#req-013).
- **Observabilidade integrada** — cada pipeline registra logs estruturados com `transaction_id`, `commit_sha` e `collaboration_ticket_id` quando a automação aciona revisões humanas, garantindo a rastreabilidade exigida por [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e pelos legados [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

---

## Pipelines CI/CD (GitHub Actions)
1. **`ci-build.yml`** — instala dependências, executa lint e build para `apps/` e `services/`. Deve publicar artefatos em `docs/reports/ci/` e anexar métricas de performance/ESG, refletindo [REQ-022](../02-planejamento/requisitos-spec.md#req-022). Sempre mencionar os legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015)–[REQ-018](../02-planejamento/requisitos-spec.md#req-018) nas notas.
2. **`ci-tests.yml`** — orquestra suites unitárias, integração e contratos. Resultados precisam citar os requisitos cobertos (por exemplo, onboarding → [REQ-001](../02-planejamento/requisitos-spec.md#req-001), marketplace → [REQ-003](../02-planejamento/requisitos-spec.md#req-003)) e relacionar cenários legados [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-010](../02-planejamento/requisitos-spec.md#req-010).
3. **`cd-deploy.yml`** — aplica manifests Terraform/Helm, valida migrações e aciona checklists humanos para ambientes HML/PRD. Precisa registrar qual analista aprovou a liberação conforme [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e manter histórico legado [REQ-032](../02-planejamento/requisitos-spec.md#req-032)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035).
4. **`audit-sync.yml`** — consolida evidências (logs, capturas, relatórios ESG) e atualiza `docs/reports/audit-history.md`, em linha com [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

Cada pipeline deve publicar no PR um resumo contendo IDs de requisito atendidos e links para `docs/reports/`. O comentário precisa citar os legados relevantes sempre que uma etapa reimplementar comportamento herdado (ex.: interceptação de arquivos, fila colaborativa).

---

## Cadeia de variáveis de ambiente
- Valores sensíveis residem em `infra/secrets/` (arquivos criptografados) e são projetados para os serviços via `make deploy`. Documente qualquer nova variável no catálogo central (`docs/config/variables.md`) com referência a [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e aos legados [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- `docker-compose.<ambiente>.yml` consome os mesmos nomes de variáveis para manter paridade entre ambientes, atendendo [REQ-012](../02-planejamento/requisitos-spec.md#req-012).
- Templates (`.env.example`, `secrets.sample`) não devem conter valores reais; inclua observações sobre como obter os segredos via cofre corporativo, preservando diretrizes de [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

---

## Automação colaborativa
- Quando um pipeline depender de validação humana (por exemplo, liberar liquidações climáticas), inclua etapa manual (`workflow_dispatch` ou `environment protection`) e mencione o requisito colaborativo correspondente ([REQ-031](../02-planejamento/requisitos-spec.md#req-031)). Registre também a equivalência com os legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-033](../02-planejamento/requisitos-spec.md#req-033).
- Gatilhos que envolvam dados pessoais devem executar `tools/privacy-scan` antes da publicação, exportando relatório LGPD para `docs/reports/privacy/` e citando [REQ-011](../02-planejamento/requisitos-spec.md#req-011).
- As execuções dos agentes de IA (Codex Builder, Reviewer etc.) precisam ser registradas via `tools/agents-logger`, anexando `run_id` e `commit` à saída do pipeline para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e os legados [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-028](../02-planejamento/requisitos-spec.md#req-028).

---

## Checklist antes de publicar uma versão
1. `make lint` e `make test` executados com sucesso em todos os pacotes impactados (citar IDs cobertos no PR).
2. Artefatos (`dist/`, `manifests/`, relatórios) anexados ao pipeline e sincronizados em `docs/reports/`.
3. Aprovações humanas registradas quando exigidas por [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
4. Changelog atualizado com a linha do tempo da build (referenciar a data e o requisito), mantendo histórico do legado diagnóstico.

[Voltar ao índice](README-spec.md)
