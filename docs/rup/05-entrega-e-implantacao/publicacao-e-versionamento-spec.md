<!-- docs/rup/05-entrega-e-implantacao/publicacao-e-versionamento.md -->
# Publicação e Versionamento

> Base: [./publicacao-e-versionamento.md](./publicacao-e-versionamento.md)
> Referências correlatas: [Empacotamento](./empacotamento-spec.md) · [Ambientes e Configurações](./ambientes-e-configuracoes-spec.md) · [Auditoria e Rastreabilidade](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md)

## Objetivo
Padronizar versionamento, publicação e governança de releases do App (APIs, portais e conectores Open Finance), garantindo rastreabilidade completa entre código, artefatos e evidências regulatórias. Este fluxo sustenta [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e [REQ-305](../02-planejamento/requisitos-spec.md#req-305); na herança histórica, cobre `REQ-018`, `REQ-019`, `REQ-022`, `REQ-029`, `REQ-030` e mantém equivalência com legados colaborativos `REQ-031`–`REQ-033`.

### Requisitos identificados nos anexos
| Requisito | Expectativa de release | Fonte |
| --- | --- | --- |
| [REQ-101](../02-planejamento/requisitos-spec.md#req-101) | Releases devem registrar aprovações de onboarding, MFA e consentimentos antes de disponibilizar novas builds. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e1--autenticação-e-acesso) |
| [REQ-103](../02-planejamento/requisitos-spec.md#req-103) | Versionamento precisa destacar evoluções de marketplace, filtros e contratos digitais. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e3--marketplace) |
| [REQ-107](../02-planejamento/requisitos-spec.md#req-107) · [REQ-108](../02-planejamento/requisitos-spec.md#req-108) | Publicações devem anexar evidências de split, escrow e hash blockchain exigidos no PRD. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) |
| [REQ-205](../02-planejamento/requisitos-spec.md#req-205) | Post-release precisa monitorar métricas ESG, filas colaborativas e SLAs descritos no PRD. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) |
| [REQ-404](../02-planejamento/requisitos-spec.md#req-404) | Fluxo de versionamento deve manter SoD, logs assinados e permissões conforme níveis N0–N5. | [`sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) |

---

## Atualização contínua
- Sempre que novos requisitos alterarem políticas de release (ex.: feature flags reguladas, fluxos colaborativos), sincronizar este arquivo com `empacotamento-spec.md`, `ambientes-e-configuracoes-spec.md` e [`revisoes-com-ia-spec.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md).
- Toda mudança de processo deve gerar entrada no `CHANGELOG/` e atualização em `docs/checklists/release-log.md`, anexando links para pipelines e relatórios de QA.
- Requisitos colaborativos (REQ-304) exigem nota indicando como as versões preservam compatibilidade com dashboards humanos (legados `REQ-031`–`REQ-035`).

---

## Estratégia de versionamento
- Utilizar SemVer (`MAJOR.MINOR.PATCH`) para todos os componentes. Incrementos major indicam mudanças incompatíveis ou regulatórias críticas; minor adicionam funcionalidades compatíveis; patch corrige bugs. Cumpre [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e legado `REQ-019`.
- A versão declarada deve estar presente em `package.json`, `helm/Chart.yaml`, `terraform.tfvars` e `docs/Compliance/release-matrix.md`, mantendo coerência com [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Tags Git seguem o padrão `release/vX.Y.Z`. Cada tag deve apontar para evidências de build e testes arquivadas em `docs/checklists/` (REQ-022; legado `REQ-022`).

## Política de changelog
- Cada release deve criar um arquivo `CHANGELOG/YYYYMMDDHHMMSS.md` com cabeçalho `<!-- CHANGELOG/<arquivo>.md -->`, resumo das alterações e requisitos atendidos. Obriga [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Registrar, em seções distintas, impactos em onboarding (`REQ-101`), marketplace (`REQ-103`), liquidação (`REQ-108`) e governança (`REQ-404`). Para cada item, indicar legado correspondente (`REQ-001`, `REQ-004`, `REQ-007`, `REQ-029`).
- Releases sem alterações no código devem justificar o motivo (ex.: rotação de segredos) e apontar requisitos cobertos, mantendo `REQ-029` e legado `REQ-029`.

## Pipeline de publicação
1. **Merge na branch principal** após aprovação técnica, validação de QA e revisão colaborativa quando aplicável. Pipelines `ci.yml` e `qa.yml` devem completar sem falhas (REQ-205; legado `REQ-015`).
2. **Execução do workflow `release.yml`**:
   - Build e testes (UI/API) → gera artefatos e anexos (REQ-019; legado `REQ-019`).
   - Assinatura das imagens e upload para dominio.com.br/bancoverde/*` com tag `vX.Y.Z` (REQ-305; legado `REQ-020`).
   - Publicação de pacote estático `portal-vX.Y.Z.tar.gz` no GitHub Releases com checksums e relatório de QA (REQ-022; legado `REQ-022`).
3. **Atualização de infraestrutura** — aplicar `terraform plan/apply` ou `helm upgrade` com a nova tag; registrar execução em `docs/checklists/iac-deploy.md` (REQ-305).
4. **Habilitação controlada** — feature flags e endpoints colaborativos ativados gradualmente via `configs/collaboration/` com aprovação dos especialistas (REQ-304; legados `REQ-031`–`REQ-033`).
5. **Comunicação** — enviar nota de release para stakeholders internos e cooperativas quando houver impacto operacional, anexando métricas ESG relevantes (REQ-106; legado `REQ-015`).

## Matriz de publicação
| Artefato | Destino | Evidência obrigatória | Requisitos | Legados |
| --- | --- | --- | --- | --- |
| Imagem `core-api` | Registro privado | `docs/checklists/build-log.md` + assinatura | REQ-108, REQ-305 | REQ-005, REQ-019 |
| Imagem `open-finance-gateway` | Registro privado | `docs/checklists/signature-log.md` | REQ-302, REQ-401 | REQ-012, REQ-024 |
| Bundle `portal` | GitHub Releases + CDN | `docs/checklists/release-log.md` | REQ-103, REQ-206 | REQ-004, REQ-016 |
| Scripts de conciliação | Repositório interno (`tools/`) | `docs/checklists/tooling-update.md` | REQ-108, REQ-404 | REQ-007, REQ-029 |

## Rollout gradual
- Dev → HML → PRD com checkpoints obrigatórios: relatório de QA assinado, validação colaborativa e aprovação da governança (REQ-029; legado `REQ-029`).
- Utilizar feature flags para liberar funcionalidades sensíveis (ex.: crédito verde) apenas após validação humana em HML. Registrar IDs dos tickets colaborativos no changelog (REQ-304; legados `REQ-031`–`REQ-033`).
- Monitorar métricas pós-release durante 48h (tempo de liquidação, erros API, fila colaborativa) e anexar relatório em `docs/checklists/post-release-monitoring.md` (REQ-205; legado `REQ-015`).

## Rollback
- Manter última versão estável referenciada em `docs/checklists/rollback-plan.md` com links para artefatos e instruções IaC (REQ-205; legado `REQ-015`).
- Em caso de rollback, reverter tags, restaurar imagens anteriores e desabilitar feature flags recém-ativadas. Registrar execução e impacto em `docs/checklists/rollback-log.md`, vinculando a [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e legados `REQ-029`, `REQ-030`.
- Após rollback, convocar revisão colaborativa para avaliar inconsistências e atualizar riscos em `riscos-e-mitigacoes-spec.md` (REQ-205; legados `REQ-031`–`REQ-035`).

[Voltar ao índice](README-spec.md)
