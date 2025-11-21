<!-- docs/rup/04-qualidade-testes/testplan.md -->
# Plano de Testes (histórico)

> Base: [./testplan.md](./testplan.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Estratégia de testes](../04-testes-e-validacao/estrategia-geral-spec.md) · [Testes E2E](../04-testes-e-validacao/testes-end-to-end-spec.md) · [Testes de segurança](../04-testes-e-validacao/testes-seguranca-e2e-spec.md)

Este plano conserva premissas herdadas e serve como ponto de partida para novos projetos. A execução atualizada mora na fase `04-Testes e Validação`; qualquer alteração deve ser sincronizada com os artefatos espec correspondentes. 【F:docs/rup/04-testes-e-validacao/estrategia-geral-spec.md†L1-L120】

## Escopos legados
- **Unitários** — cobertura mínima de 80 % nas regras de negócio dos serviços core (tokenização, split financeiro, scoring colaborativo). **Requisitos:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- **Integração** — cenários envolvendo marketplace, liquidação, relatórios regulatórios e filas colaborativas. **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-035](../02-planejamento/requisitos-spec.md#req-035).
- **Performance** — stress em liquidação PIX, dashboards de impacto e APIs públicas para garantir metas de latência e throughput. **Requisitos:** [REQ-013](../02-planejamento/requisitos-spec.md#req-013), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- **Segurança** — varreduras SAST/DAST, simulação de incidentes e execução dos cenários `E2E-SEC-001` a `E2E-SEC-004`. 【F:docs/rup/04-testes-e-validacao/testes-seguranca-e2e-spec.md†L12-L94】 **Requisitos:** [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-038](../02-planejamento/requisitos-spec.md#req-038).

## Requisitos herdados dos anexos
- **Gestão multientidade e acesso** — garantir cadastros completos para organizações, unidades, lotes, logística e certificados, com validações KYC/KYB, estados de verificação e associação multi-perfil por usuário. Testes devem cobrir bloqueios de perfis incompletos, combinações de papéis e painel administrativo de aprovação. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L6-L185】
- **Marketplace rastreável e escrow** — validar publicação de lotes com campos obrigatórios, filtros por categoria/localização e geração de passaporte digital com trilha imutável. As transações precisam exercitar a conta de custódia, transferências internas e auditoria de heatmaps. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L46-L226】
- **Relatórios ESG e fiscais** — confirmar que relatórios ambientais, sociais e fiscais contemplam hash verificável, metodologias declaradas, exportações PDF/CSV e logs de auditoria imutáveis. Cobrir periodicidade (por transação/mensal/trimestral) e integrações fiscais (NF-e/NFS-e). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L245-L399】

## Integração colaborativa
Para cada onda de testes, registre resultados na `audit-history.md`, compartilhe métricas com a fila colaborativa (`REQ-031` a `REQ-035`) e atualize dashboards de SLA conforme `capacidade-diagnostico-colaborativo-spec.md`. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】

[Voltar ao arquivo de Qualidade](./README-spec.md)
