<!-- docs/rup/05-entrega-e-implantacao/operacao-e-manutencao.md -->
# Operação e Manutenção

> Base: [./operacao-e-manutencao.md](./operacao-e-manutencao.md)
> Referências correlatas: [Governança Técnica](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) · [Auditoria e Rastreabilidade](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) · [Capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

## Objetivo
Estabelecer rotinas operacionais para manter o App disponível, auditável e em conformidade com reguladores, parceiros financeiros e especialistas socioambientais. O plano sustenta [REQ-108](../02-planejamento/requisitos-spec.md#req-108), [REQ-205](../02-planejamento/requisitos-spec.md#req-205), [REQ-404](../02-planejamento/requisitos-spec.md#req-404) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029); no legado, cobre `REQ-005`, `REQ-015`, `REQ-017`, `REQ-022`, `REQ-029` e integra a coexistência com `REQ-031`–`REQ-035`.

### Requisitos mapeados aos anexos
| Requisito | Rotina operacional | Referência em `docs/rup/99-*` |
| --- | --- | --- |
| [REQ-103](../02-planejamento/requisitos-spec.md#req-103) | Monitorar marketplace, passaporte digital e chat para garantir SLAs descritos no PRD. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e3--marketplace) |
| [REQ-107](../02-planejamento/requisitos-spec.md#req-107) | Conciliações financeiras e extratos devem seguir regras de conta virtual, split e logs. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) |
| [REQ-109](../02-planejamento/requisitos-spec.md#req-109) | Dashboards ESG e relatórios BACEN precisam ser auditados com base na definição do PRD. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) |
| [REQ-201](../02-planejamento/requisitos-spec.md#req-201) · [REQ-404](../02-planejamento/requisitos-spec.md#req-404) | Revisões de acesso e auditoria devem considerar níveis de autorização N0–N5 e SoD. | [`sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) |
| [REQ-205](../02-planejamento/requisitos-spec.md#req-205) | Alertas e playbooks precisam capturar métricas ESG, filas colaborativas e SLAs de liquidação. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) |

---

## Responsabilidades
- **Squad de Operações Bancárias** — monitora liquidação financeira, reconciliação e integrações Open Finance. Deve registrar incidentes em `docs/checklists/maintenance-log.md`, atendendo [REQ-108](../02-planejamento/requisitos-spec.md#req-108) e legado `REQ-007`.
- **SRE / DevOps** — mantém infraestrutura IaC, pipelines GitOps, backups e observabilidade (REQ-305, legado `REQ-018`).
- **Governança ESG e Compliance** — valida consentimentos LGPD, contratos socioambientais e aprova comunicações com cooperativas, garantindo [REQ-401](../02-planejamento/requisitos-spec.md#req-401) e legado `REQ-024`.
- **Especialistas colaborativos** — aprovam decisões críticas (crédito verde, divergências de passaporte) usando fluxos descritos em [capacidade-diagnostico-colaborativo](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md), mantendo equivalência com legados `REQ-031`–`REQ-033`.

## Rotinas operacionais
- Revisar dashboards de liquidação (`/dashboards/impacto`) e filas de aprovação a cada hora útil, verificando indicadores de [REQ-106](../02-planejamento/requisitos-spec.md#req-106) e legados `REQ-015`, `REQ-034`.
- Executar conciliações automáticas com `scripts/reconcile-ledger.sh`, anexando logs ao relatório semanal em `docs/checklists/ledger-reconcile.md` (REQ-108; legado `REQ-007`).
- Validar consentimentos Open Finance vencidos e cadastros pendentes, acionando fluxos de revalidação conforme REQ-101; legado `REQ-001`.
- Atualizar `docs/checklists/operacao-diaria.md` com status de backup, métricas de SLA e ocorrências de suporte (REQ-022; legado `REQ-022`).

## Manutenção corretiva
1. Abrir issue vinculada ao requisito/serviço afetado, anexar logs e `correlation_id`. Necessário para [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e legado `REQ-022`.
2. Criar branch com hotfix, executar suíte de testes (`npm run test`, `npm run test:e2e`) e obter aprovação de revisão humana quando envolver fluxo colaborativo (REQ-304; legados `REQ-031`–`REQ-033`).
3. Executar pipeline `deploy-hotfix.yml`, registrar entrada no changelog e atualizar `docs/checklists/maintenance-log.md` (REQ-029; legado `REQ-029`).

## Manutenção evolutiva
- Avaliar impacto em arquitetura e dados antes de iniciar desenvolvimento, sincronizando atualizações em [arquitetura-da-extensao-spec.md](../01-arquitetura/arquitetura-da-extensao-spec.md) e [integracoes-com-apis-spec.md](../01-arquitetura/integracoes-com-apis-spec.md) (REQ-301; legados `REQ-011`, `REQ-012`).
- Atualizar requisitos, riscos e matrizes ESG quando novos produtos ou jornadas forem introduzidos (REQ-101, REQ-205; legados `REQ-003`, `REQ-015`).
- Garantir que componentes de UI sigam o design system sustentável descrito em `../06-ux-brand/diretrizes-de-ux-spec.md`, mantendo [REQ-206](../02-planejamento/requisitos-spec.md#req-206) e legado `REQ-016`.

## Monitoramento e alertas
- Health-checks expõem `status`, `version`, `collaboration_ticket_pending`. Alertas > 5 min sem atualização disparam playbook em `docs/checklists/playbooks/liquidacao.md` (REQ-205; legados `REQ-015`, `REQ-034`).
- Métricas chave: tempo de liquidação PIX, filas de aprovação humanas, volume de créditos tokenizados. Alertas configurados no Grafana notificam squads e especialistas colaborativos simultaneamente (REQ-108, REQ-304; legados `REQ-007`, `REQ-033`).
- Monitorar custos e consumo de APIs externas (`Open Finance`, `registradoras climáticas`) através de `scripts/report-integrations.py`, anexando relatório em `docs/checklists/integrations-cost.md` (REQ-302; legado `REQ-012`).

## Cadência de manutenção
| Atividade | Frequência | Responsável | Evidência |
| --- | --- | --- | --- |
| Auditoria operacional completa | Trimestral | Governance Agent + Diretor Técnico | `docs/checklists/governance-summary.md` (REQ-029; legado `REQ-029`). |
| Revalidação de segredos/cofres | Trimestral | SRE | `docs/checklists/vault-rotation.md` (REQ-201; legado `REQ-014`). |
| Testes de contingência PIX/SPI | Trimestral | Squad de Operações | `docs/checklists/contingencia-pix.md` (REQ-108; legados `REQ-005`, `REQ-007`). |
| Revisão de dashboards ESG | Mensal | ESG Analytics | `docs/checklists/impacto-report.md` (REQ-106; legado `REQ-015`). |
| Testes E2E completos | A cada release | QA | `docs/checklists/test-report.md` (REQ-205; legado `REQ-015`). |
| Revisão colaborativa | Semanal | Especialistas socioambientais | `docs/checklists/collaboration-review.md` (REQ-304; legados `REQ-031`–`REQ-033`). |
| Backup e verificação de restauração | Mensal | DevOps | `docs/checklists/backup-restore.md` (REQ-205; legado `REQ-017`). |

## Indicadores chave
| Indicador | Meta | Requisito | Legado |
| --- | --- | --- | --- |
| Disponibilidade API | ≥ 99,8% mensal | REQ-202 | REQ-018 |
| SLA liquidação PIX | ≤ 60 s | REQ-108 | REQ-007 |
| SLA aprovação colaborativa | ≤ 12 h | REQ-304 | REQ-031 |
| Tempo médio de correção de incidentes críticos | ≤ 24 h | REQ-205 | REQ-015 |
| Conformidade LGPD e BACEN | 100% | REQ-401, REQ-402 | REQ-024, REQ-029 |

Indicadores devem ser consolidados no relatório trimestral anexado a `docs/Compliance/` e revisados pelo comitê de governança.

## Contingência e rollback
- Pipeline `rollback.yml` deve estar pronto para restaurar última versão estável em ≤ 15 minutos, com logs armazenados em `docs/checklists/rollback-log.md` (REQ-205; legado `REQ-015`).
- Manter plano de contingência documentado para falhas Open Finance, descrevendo fallback manual e gatilhos colaborativos (REQ-302; legado `REQ-012`).
- Backups do ledger e do data lake climático armazenados em regiões distintas, com teste de restauração semestral (REQ-303; legado `REQ-017`).

## Encerramento de ciclo
- Verificar que DEV, HML e PRD executam a mesma build (`version.txt`) antes de encerrar release (REQ-019; legado `REQ-019`).
- Garantir que todas as evidências e checklists estejam anexadas ao changelog e ao relatório de auditoria (`auditoria-e-rastreabilidade-spec.md`) (REQ-029; legado `REQ-029`).
- Registrar lições aprendidas e indicadores atualizados em `docs/checklists/post-mortem.md`, destacando impactos em fluxos colaborativos (REQ-304; legados `REQ-031`–`REQ-035`).

[Voltar ao índice](README-spec.md)
