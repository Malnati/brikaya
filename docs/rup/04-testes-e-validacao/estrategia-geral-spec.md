<!-- docs/rup/04-testes-e-validacao/estrategia-geral.md -->
# Estratégia Geral de Testes

> Base: [./estrategia-geral.md](./estrategia-geral.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Fluxos operacionais](../02-design/fluxos-spec.md) · [Capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) · [Qualidade e Métricas](../04-qualidade-testes/qualidade-e-metricas-spec.md)

## Objetivo
Garantir que o App entregue jornadas seguras de onboarding, marketplace, logística e liquidação, preservando métricas climáticas e financeiras. A estratégia cobre canais web, serviços orientados a eventos e integrações com parceiros, alinhando-se aos requisitos mapeados para sustentabilidade e governança colaborativa. 【F:docs/rup/02-design/fluxos-spec.md†L33-L140】【F:docs/rup/02-planejamento/requisitos-spec.md†L73-L188】

## Personas e fluxos prioritários
- **Cooperativa:** conduz o cadastro, certifica lotes e publica ativos verdes. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-005](../02-planejamento/requisitos-spec.md#req-005).
- **Comprador/Indústria:** negocia lotes, contrata logística e acompanha liquidação. **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- **Investidor ESG:** consome dashboards de impacto e relatórios regulatórios. **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- **Fila colaborativa (`CollabReviewBoard`):** distribui análises IA+humanos para operações críticas. **Requisitos:** [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-032](../02-planejamento/requisitos-spec.md#req-032), [REQ-037](../02-planejamento/requisitos-spec.md#req-037).
- **Administrador de Governança:** aprova cadastros multi-perfil, audita passaporte digital e relatórios ESG/fiscais antes de liberar integrações externas. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L177-L399】

## Abordagem multicamadas
1. **Unitário** — cobre regras de negócio, validadores de dados e cálculos de impacto (tokenização, split financeiro), além de validar campos obrigatórios dos cadastros multientidade e status de verificação KYC/KYB. **Requisitos:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-018](../02-planejamento/requisitos-spec.md#req-018). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L6-L185】
2. **Integração** — valida contratos entre microsserviços, filas e APIs externas (SINIR, gateways de pagamento), cobrindo conta de custódia, transferência interna e geração do passaporte digital. **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-020](../02-planejamento/requisitos-spec.md#req-020). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L204-L226】
3. **Sistema** — assegura jornadas completas em ambientes DEV/HML com dados sintéticos, cobrindo onboarding → marketplace → liquidação, incluindo filtros de busca, negociação e registro imutável das transações. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-008](../02-planejamento/requisitos-spec.md#req-008). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L197-L226】
4. **End-to-End** — executa roteiros críticos via Playwright/Cypress incluindo geração de comprovantes, relatórios ESG/fiscais e validação de hash/assinatura digital. **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-016](../02-planejamento/requisitos-spec.md#req-016). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L245-L399】
5. **Acessibilidade e UX** — mede contraste, foco e microcopy nas telas públicas (HomePage, NewsSection, VideosSection). 【F:landing/src/pages/Home.tsx†L1-L160】【F:landing/src/sections/NewsSection.tsx†L1-L140】 **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
6. **Segurança** — garante rejeição de credenciais inválidas, limites de upload e criptografia de dados compartilhados, estendendo testes para logs de auditoria de passaporte digital, relatórios ESG e obrigações fiscais. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-038](../02-planejamento/requisitos-spec.md#req-038). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L221-L399】
- **Integração colaborativa:** cada camada registra identificadores de operação para alimentar painéis de SLA humano vs. IA e relatórios compartilhados. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】

## Ambientes
- **DEV** — mocks de parceiros climáticos e fallback local ativo para testes rápidos.
- **HML** — integrações reais com controles de auditoria, responsável por suites E2E e revisões colaborativas.
- **PRD** — apenas validações não destrutivas, auditorias cromáticas e verificação de relatórios.
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

## Ferramentas
- **Jest/Vitest/Go test** para microsserviços e bibliotecas compartilhadas.
- **Playwright/Cypress** para fluxos web, com storage state representando personas aprovadas ou bloqueadas.
- **K6/Gatling** para metas de performance e resiliência.
- **ZAP/Snyk/Trivy** para varreduras de segurança contínuas.
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

## Evidências esperadas
- Relatórios de testes automatizados e auditorias arquivados em `docs/reports/` com referência ao PR. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md†L31-L104】
- Capturas e vídeos das telas auditadas (hero, métricas, notícias, painéis colaborativos).
- Checklists preenchidos para capacidade colaborativa indicando parecer de cada especialista. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】
- **Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

## Itens complementares dos anexos
- **Rastreabilidade ampliada** — garantir que passaportes digitais e logs fiscais fiquem acessíveis para administradores e investidores autorizados, com hash verificável e exportação em formatos padrão (PDF/CSV). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L221-L328】【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L343-L399】
- **Periodicidade de relatórios** — validar emissão por transação, mensal, trimestral e anual, assegurando comunicação de prazos a usuários e alertas fiscais automáticos. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L272-L388】
- **Integração logística e compliance** — incluir cenários que auditam seguros de transporte, certificados ambientais e recomendações quando inexistentes, reforçando cobertura das permissões de acesso por perfil. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L77-L156】

## Rastreabilidade
Cada caso de teste referencia o `REQ-###` correspondente no catálogo e mantém status atualizado em `audit-history.md`. Auditorias periódicas confirmam cobertura mínima antes de liberar marcos do roadmap, sincronizando resultados com dashboards colaborativos. 【F:docs/rup/02-planejamento/requisitos-spec.md†L27-L200】【F:docs/rup/audit-history.md†L1-L80】
- **Requisitos associados:** [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

[Voltar aos Testes](./README-spec.md)
