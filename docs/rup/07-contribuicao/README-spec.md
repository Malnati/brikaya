<!-- docs/rup/07-contribuicao/README.md -->
# Contribuição

> Base: [./README.md](./README.md)
> Plano: [/docs/rup/02-planejamento/roadmap-spec.md](/docs/rup/02-planejamento/roadmap-spec.md)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Arquitetura do App](/docs/rup/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/docs/rup/02-design/design-geral-spec.md) · [Testes integrados](/docs/rup/04-testes-e-validacao/testes-end-to-end-spec.md)

Esta seção organiza como novas contribuições preservam o histórico do App, os requisitos `REQ-001` a `REQ-030` e a convivência com a capacidade colaborativa (`REQ-031` a `REQ-045`). O foco é manter o fluxo RUP do core bancário (waste-ledger, climate banking e impact insights) alinhado aos protótipos, código-fonte e controles de governança publicados no repositório.

- [Contribuindo](contribuindo-spec.md): onboarding, preparação de ambiente e rotinas de revisão para proteger os módulos de onboarding verde, marketplace de resíduos, climate banking e analytics, descrevendo como convivem com a validação colaborativa de crédito. (`REQ-001`–`REQ-030`, `REQ-031`–`REQ-035`).
- [Padrões de Commit](padroes-de-commit-spec.md): convenções de mensagens, exemplos e validações automáticas que reforçam a rastreabilidade com o catálogo de requisitos, os fluxos documentados e os relatórios socioambientais. (`REQ-016`, `REQ-019`, `REQ-022`, `REQ-028`).
- [Template de PR](template-de-pr-spec.md): checklist de revisão cruzando código, documentação e protótipos antes de liberar mudanças, mantendo rastreabilidade com requisitos funcionais, não funcionais e colaborativos. (`REQ-006`, `REQ-010`, `REQ-019`, `REQ-029`, `REQ-033`).

## Requisitos identificados nos anexos
- **Cadastro multientidade e passaporte digital:** os anexos detalham campos obrigatórios para organizações, unidades, lotes, logística e certificações, reforçando a abrangência de `REQ-002`, `REQ-003` e `REQ-005` durante evoluções de dados e marketplace.
- **Perfis acumuláveis e segregação de funções:** as referências indicam multi-perfis com KYC/KYB, níveis de acesso N0–N5 e restrições por papel, vinculando diretamente `REQ-001`, `REQ-011` e `REQ-040` às práticas de governança em contribuições.
- **Auditoria climática e relatórios ESG:** requisitos de rastreabilidade, certificações de terceiros e indicadores ambientais/social/governança sustentam `REQ-008`, `REQ-009`, `REQ-015` e `REQ-034`, exigindo evidências nas entregas documentais e nos relatórios automatizados.

## Rastreabilidade essencial
- Cada contribuição deve citar explicitamente os requisitos atendidos utilizando o formato `[REQ-00x](../02-planejamento/requisitos-spec.md#req-00x)`, garantindo navegação direta para o catálogo oficial.
- Atualizações nos canais digitais (`landing/src/**`, `landing/public/**`), serviços planejados (`docker-compose.yml`, `docs/inputs/PRD_Plataforma_App_Completo.md`) e dados (`sql/**`) devem referenciar os requisitos relacionados para evitar regressões em onboarding, compliance, marketplace e liquidação (`REQ-001`–`REQ-014`).
- Melhorias em automações, pipelines e auditoria (`docs/checklists/**`, `docs/reports/**`, `AGENTS.md`) precisam manter a rastreabilidade com `REQ-019`, `REQ-022` e `REQ-029`, anexando evidências nos PRs e no diretório `docs/reports/YYYYMMDD/`.
- **Nota colaborativa:** ao modificar fluxos compartilhados entre legados e colaboração (scoring de crédito, filas de revisão, dashboards de impacto), documente a compatibilidade com `REQ-031`–`REQ-035` seguindo as instruções em [`docs/rup/02-planejamento/capacidade-diagnostico-colaborativo.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md).

[Voltar ao índice](../README-spec.md)
