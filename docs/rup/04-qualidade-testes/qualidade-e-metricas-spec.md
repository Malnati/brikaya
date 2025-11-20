<!-- docs/rup/04-qualidade-testes/qualidade-e-metricas.md -->
# Qualidade e Métricas (histórico)

> Base: [./qualidade-e-metricas.md](./qualidade-e-metricas.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Qualidade e Métricas — governança](../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md) · [Testes E2E](../04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Manter o histórico das métricas monitoradas pelo App e orientar onde registrar novos indicadores quando requisitos forem atualizados. A referência vigente está centralizada em `controle-de-qualidade-spec.md` e nos dashboards colaborativos. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md†L1-L120】

## Como atualizar
- Sempre que um requisito (`REQ-###` ou `RNF-###`) definir nova métrica, registre aqui e no arquivo base, atualize `qualidade-e-metricas-spec.md` e sincronize com `docs/reports/`. 【F:docs/rup/02-planejamento/requisitos-spec.md†L140-L220】
- Informe a alteração na `audit-history.md` e vincule o relatório correspondente. 【F:docs/rup/audit-history.md†L1-L80】
- Garanta coerência com `criterios-de-aceitacao-spec.md`, `testes-end-to-end-spec.md` e `capacidade-diagnostico-colaborativo-spec.md`.

## Catálogo de métricas legadas
- **Funcionamento do produto** — tempo médio de onboarding (< 15 min), taxa de aprovação de lotes, tempo de liquidação e satisfação da cooperativa. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-008](../02-planejamento/requisitos-spec.md#req-008).
- **Impacto socioambiental** — toneladas recicladas, emissões evitadas, renda distribuída e engajamento em campanhas. 【F:landing/src/pages/Home.tsx†L33-L160】 **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).
- **Tecnologia e operações** — disponibilidade por serviço (≥ 99,9 %), latência de APIs críticas (< 2 s), taxa de reprocessamento de eventos. **Requisitos:** [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-013](../02-planejamento/requisitos-spec.md#req-013), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Segurança e governança** — incidentes reportados, falsos positivos de antifraude, tempo de resposta a bloqueios, conformidade LGPD/BACEN. **Requisitos:** [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-038](../02-planejamento/requisitos-spec.md#req-038).

## Métricas complementares dos anexos
- **Cobertura cadastral multientidade** — porcentagem de perfis com documentos KYC/KYB aprovados, unidades com geolocalização válida e lotes com score de verificação atualizado. Registrar também o tempo médio entre cadastro e status “verificado”. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L6-L185】
- **Integridade do passaporte digital** — volume de lotes com trilha de auditoria íntegra (hash válido, histórico acessível para usuários e Futura HQ) e tempo máximo para geração do passaporte após certificação. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L221-L226】
- **SLA do escrow e transferência interna** — percentual de transações liquidadas via conta de custódia dentro da janela contratada e incidências de reconciliação manual. Monitorar também transferências entre contas internas (Millenium ↔ Futura). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L204-L219】
- **Relatórios ESG e fiscais** — quantidade de relatórios emitidos por periodicidade (transação/mensal/trimestral/anual), taxa de relatórios com hash validado e exportações em PDF/CSV, além do tempo de geração após solicitação do usuário/investidor. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L245-L399】

## Integração colaborativa
Métricas compartilhadas entre IA e analistas devem seguir os indicadores de SLA definidos em `capacidade-diagnostico-colaborativo-spec.md` (tempo de revisão, taxa de retrabalho, pendências por persona). Sincronize estes valores com o dashboard de governança (`REQ-034`) e com os relatórios armazenados em `docs/reports/`. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】

[Voltar ao arquivo de Qualidade](./README-spec.md)
