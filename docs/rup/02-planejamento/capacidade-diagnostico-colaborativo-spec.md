<!-- docs/rup/02-planejamento/capacidade-diagnostico-colaborativo.md -->
# Capacidade de Diagnóstico Colaborativo

> Base: [./capacidade-diagnostico-colaborativo.md](./capacidade-diagnostico-colaborativo.md)
> Referências: [Catálogo de Requisitos](./requisitos-spec.md#requisitos-funcionais-rf) · [Riscos e Mitigações](./riscos-e-mitigacoes-spec.md) · [Governança técnica](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md)

**Projeto:** App — CLImate INvestment  \\
**Organização:** Millennium Brasil (MBRA)  \\
**Data:** 2025-10-20 14:40 BRT

Este documento descreve a capacidade de **diagnóstico colaborativo** aplicada ao App. O objetivo é combinar análises automatizadas (score socioambiental, riscos financeiros, conformidade regulatória) com validações humanas especializadas para garantir que cada operação financiada tenha impacto climático positivo, aderência legal e rastreabilidade completa.

---

## 1. Contexto Atual

- A plataforma já dispõe de cadastros completos de fornecedores, cooperativas e compradores de resíduos (`REQ-001` a `REQ-005`).
- Indicadores de impacto e trilhas de auditoria estão definidos nos artefatos de Governança (`../06-governanca-tecnica-e-controle-de-qualidade/`).
- Ainda falta um fluxo formal para conciliar decisões automatizadas do motor de scoring socioambiental (`REQ-021`) com revisões humanas de crédito e sustentabilidade (`REQ-031` a `REQ-035`).

### Principais Lacunas Identificadas

1. **Processo de validação manual disperso:** cada área (crédito, sustentabilidade, jurídico) usa planilhas próprias, sem registro unificado na plataforma.
2. **Ausência de SLA entre IA e especialistas:** decisões automatizadas não possuem tempos de resposta garantidos para análise humana complementar.
3. **Trilha de auditoria fragmentada:** validações realizadas fora da plataforma dificultam a comprovação junto a BACEN, órgãos ambientais e investidores ESG.

---

## 2. Objetivos da Capacidade

1. **Integrar IA e revisão humana:** toda operação de crédito verde deverá passar por score automático e checklist humano antes da liberação (`REQ-031`, `REQ-033`).
2. **Capturar evidências climáticas:** anexar laudos, certificações, fotos de lotes e pareceres de campo diretamente ao passaporte digital do resíduo (`REQ-005`).
3. **Gerar decisões auditáveis:** registrar justificativas, responsáveis e timestamps para inspeções regulatórias ou auditorias independentes (`REQ-044`).
4. **Retroalimentar o motor de scoring:** utilizar feedback dos analistas para melhorar continuamente o modelo de risco climático e social (`REQ-021`).

---

## 3. Personas Envolvidas

| Persona | Responsabilidade | Artefatos Relacionados |
| --- | --- | --- |
| Analista de Crédito Verde | Avalia viabilidade financeira, define limites e autoriza liberações | [`../00-visao/stakeholders.md`](../00-visao/stakeholders-spec.md) · [`roadmap.md`](roadmap-spec.md#epicos-financeiros) |
| Especialista Socioambiental | Verifica conformidade ambiental, certificações e indicadores ESG | [`../99-anexos/referencias.md`](../99-anexos/referencias-spec.md) · [`../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) |
| Jurídico/Compliance | Garante aderência a LGPD, BACEN e PLD/FT | [`../00-visao/lgpd.md`](../00-visao/lgpd-spec.md) · [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) |
| Cooperativa ou Fornecedor | Responde a pendências e fornece evidências complementares | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#compliance--certificados) |

---

## 4. Fluxo Colaborativo Proposto

1. **Detecção Automática:** motor de scoring (`REQ-021`) avalia operação com base em dados cadastrais, histórico de lotes e métricas climáticas.
2. **Fila de Revisão:** operações acima de limites ou com alertas são encaminhadas para analistas via módulo colaborativo (`REQ-032`).
3. **Checklist Configurável:** cada persona recebe uma lista de verificações obrigatórias (financeiro, socioambiental, jurídico) com anexos e comentários (`REQ-033`).
4. **Decisão Integrada:** após aprovação conjunta, o sistema libera pagamentos (`REQ-008`) e atualiza o passaporte digital (`REQ-005`).
5. **Feedback e Aprendizado:** resultados alimentam dashboards de impacto (`REQ-006`) e refinam o motor de scoring (`REQ-021`).

Representação simplificada:

```mermaid
daggraph TD
  A[Entrada da operação no marketplace] --> B[Motor de scoring socioambiental]
  B -->|Aprovada automaticamente| G[Liquidação financeira]
  B -->|Revisão necessária| C[Fila colaborativa]
  C --> D[Checklist de crédito verde]
  C --> E[Checklist socioambiental]
  C --> F[Checklist jurídico/compliance]
  D --> H[Decisão consolidada]
  E --> H
  F --> H
  H --> G
  H --> I[Retroalimentação do motor de scoring]
```

---

## 5. Backlog Incremental

| Iteração | Entregas | Métrica de sucesso |
| --- | --- | --- |
| Sprint 1 | API de filas colaborativas + modelo de dados de auditoria | 100% das operações com pendências registradas na trilha |
| Sprint 2 | Interfaces web/mobile para analistas com checklist configurável | SLA de análise humana < 24h |
| Sprint 3 | Integração com motor de scoring e dashboards de impacto | 90% das decisões com feedback automático aplicado |
| Sprint 4 | Automação de notificações para cooperativas/fornecedores | 80% das pendências resolvidas sem intervenção manual |

---

## 6. Dependências e Riscos

- **Integração de dados:** exige pipelines confiáveis do data lake climático (`REQ-020`).
- **Gestão de consentimento:** revisões humanas devem respeitar privacidade (LGPD) e termos aceitos pelos usuários (`REQ-024` a `REQ-028`).
- **Capacitação das equipes:** requer treinamento para analistas sobre novos fluxos e indicadores climáticos (`REQ-010`).
- **Escalabilidade do motor de scoring:** aumento do volume de operações pode demandar processamento assíncrono adicional (`REQ-014`, `REQ-039`).

Mitigações propostas estão registradas em [`riscos-e-mitigacoes.md`](riscos-e-mitigacoes-spec.md) e nas diretrizes de governança (`../06-governanca-tecnica-e-controle-de-qualidade/`).

---

## 7. Métricas de Sucesso

- Taxa de operações revisadas com evidências completas ≥ 95% (`REQ-034`).
- SLA médio de conclusão de análises humanas ≤ 18 horas (`REQ-037`).
- Acurácia do scoring socioambiental aumentada em 20% após três ciclos de feedback (`REQ-021`).
- Nenhuma não conformidade identificada em auditorias BACEN ou ambientais (`REQ-030`, `REQ-035`).

---

## 8. Próximos Passos

1. Consolidar requisitos técnicos detalhados com a equipe de arquitetura (`../01-arquitetura/`).
2. Atualizar cenários de teste e validação (`../04-testes-e-validacao/estrategia-geral-spec.md`) com os novos fluxos colaborativos.
3. Definir templates de relatórios e notificações para auditorias e investidores ESG (`../06-governanca-tecnica-e-controle-de-qualidade/relatorios-automatizados-spec.md`).
4. Planejar treinamento das personas envolvidas (cooperativas, analistas, compliance) com materiais em [`../06-ux-brand/`](../06-ux-brand/README-spec.md).

[Voltar ao índice](README-spec.md)
