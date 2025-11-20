<!-- docs/rup/02-design/componentes.md -->
# Componentes do Sistema App

> Base: [./componentes.md](./componentes.md)
> Referências correlatas: [Fluxos operacionais](./fluxos-spec.md) · [Design geral](./design-geral-spec.md) · [Catálogo de requisitos](../02-planejamento/requisitos-spec.md#requisitos-funcionais-rf)

## Objetivo
Mapear componentes React, serviços e elementos de interface que sustentam as jornadas climáticas do App, garantindo que cada peça tenha responsabilidade clara, estados documentados e aderência às especificações RUP. As referências de implementação utilizam o site institucional (`landing/`) como prova de conceito de layout, responsividade e microcopy. 【F:landing/src/App.tsx†L1-L80】【F:landing/src/layouts/MainLayout.tsx†L1-L120】

---

## Atualizações quando requisitos mudarem
- **Requisitos funcionais:** acrescente ou ajuste componentes, estados e interações vinculados aos novos `REQ-###`, atualizando `componentes.md` e este espelho em sincronia com `fluxos.md` e `design-geral.md`.
- **Requisitos não funcionais:** reflita impactos em acessibilidade, performance, responsividade ou microcopy derivados de RNFs, alinhando métricas com `../04-qualidade-testes/qualidade-e-metricas-spec.md` e controles com `../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md`.
- **Rastreabilidade:** cite sempre o requisito correspondente, registre o item do `CHANGELOG/`, aponte ajustes em `../03-implementacao/estrutura-de-projeto-spec.md` e registre a auditoria em `docs/rup/audit-history.md`.

---

## Componentes de Acesso e Cadastro
### Header & Menu (`SiteHeader.tsx`, `MainLayout.tsx`)
- Exibem logotipo, navegação principal, CTAs de abertura de conta e atalhos para políticas obrigatórias. 【F:landing/src/components/SiteHeader.tsx†L1-L120】【F:landing/src/layouts/MainLayout.tsx†L1-L120】
- Responsáveis por manter consistência de marca e disponibilizar links para termos, privacidade e suporte.
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

### Formulários de onboarding (prototipados)
- Estruturas derivadas de `capacidade-diagnostico-colaborativo-spec.md` para coleta de dados KYC/KYB, upload de documentos e consentimento LGPD.
- Devem persistir estado parcial, validar campos obrigatórios e registrar metadados de auditoria.
- **Notas de convivência colaborativa:** compartilham status de aprovação com as filas humanas descritas em [capacidade-diagnostico-colaborativo-spec.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md#fluxo-colaborativo-proposto) sem remover bloqueios automáticos.
- **Requisitos associados:** [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).

---

## Componentes de Marketplace e Logística
### Listagens de lotes (futuro `MarketplaceList`)
- Devem apresentar filtros por categoria, volume, certificações e preço, respeitando o grid responsivo já adotado em `NewsList`. 【F:landing/src/components/NewsList.tsx†L1-L120】
- Estados previstos: `loading`, `empty`, `available`, `in-negotiation`, `closed`, cada um com microcopy orientada à ação.
- **Requisitos associados:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).

### Passaporte digital de resíduos (futuro `WastePassport`)
- Consolida histórico de inspeções, certificados, medições de qualidade e anexos, permitindo exportação para auditoria.
- Deve oferecer abas para visão geral, documentação, compliance e métricas de impacto.
- **Integração colaborativa:** suporta comentários e anexos gerados por analistas humanos (`REQ-033`), registrando assinatura digital das decisões.
- **Requisitos associados:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-035](../02-planejamento/requisitos-spec.md#req-035), [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

### Orquestração logística (futuro `LogisticsPlanner`)
- Interface para cadastrar frota, agendar coletas e acompanhar rotas sugeridas, reutilizando padrões de cards e grids do site. 【F:landing/src/pages/Home.tsx†L40-L160】
- Deve integrar com APIs de transporte (`REQ-004`) e expor status em tempo real para cooperativas e compradores.
- **Requisitos associados:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

---

## Componentes de Impacto e Comunicação
### Dashboards de impacto (`ImpactOverview`, protótipo)
- Blocos para CO₂ evitado, toneladas recicladas, renda distribuída e indicadores colaborativos. Estrutura segue o padrão de cards ilustrado em `Home.tsx`. 【F:landing/src/pages/Home.tsx†L80-L160】
- Devem suportar filtros por período, persona e tipo de operação.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-034](../02-planejamento/requisitos-spec.md#req-034), [REQ-039](../02-planejamento/requisitos-spec.md#req-039).

### Comunidade e capacitação (`VideoGallery.tsx`, `NewsList.tsx`)
- Fornecem conteúdos educativos e atualizações climáticas, servindo de referência para experiência de aprendizado contínuo. 【F:landing/src/components/VideoGallery.tsx†L1-L160】【F:landing/src/components/NewsList.tsx†L1-L120】
- Devem alimentar programas de treinamento previstos em `REQ-010` e notificações colaborativas (`REQ-032`).
- **Requisitos associados:** [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-032](../02-planejamento/requisitos-spec.md#req-032), [REQ-040](../02-planejamento/requisitos-spec.md#req-040).

### Notificações e relatórios
- Templates de e-mail, push e relatórios ESG devem refletir estados do marketplace e das filas colaborativas, sincronizando com `docs/reports/` e `capacidade-diagnostico-colaborativo-spec.md`.
- Devem registrar metadados de envio (`run_id`, timestamp) para atender `REQ-023`.
- **Requisitos associados:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

---

## Componentes de Governança e Auditoria
### Painel colaborativo (futuro `CollabReviewBoard`)
- Apresenta filas de operações pendentes, checklist configurável por persona e histórico de decisões. Interfaces devem herdar padrões de foco e acessibilidade já utilizados nos componentes do site. 【F:landing/src/components/NewsList.tsx†L20-L80】
- Integra com métricas de SLA e logs descritos em `capacidade-diagnostico-colaborativo-spec.md`.
- **Requisitos associados:** [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-033](../02-planejamento/requisitos-spec.md#req-033), [REQ-037](../02-planejamento/requisitos-spec.md#req-037).

### Governança de consentimento
- Módulos responsáveis por armazenar termos LGPD, registros de aceite e revogação imediata. Devem expor APIs para sincronização com canais web/mobile e com o data lake climático.
- **Requisitos associados:** [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-026](../02-planejamento/requisitos-spec.md#req-026), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

### Observabilidade climática
- Componentes de logs, dashboards técnicos e alertas conectados às execuções IA e às decisões colaborativas.
- Devem exportar dados para `docs/reports/` e atender às regras de auditoria do `AGENTS.md` (registro de execuções, metadados obrigatórios, política de 60-30-10). 【F:AGENTS.md†L280-L360】【F:AGENTS.md†L880-L940】
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-044](../02-planejamento/requisitos-spec.md#req-044), [REQ-045](../02-planejamento/requisitos-spec.md#req-045).

---

## Diretrizes de Implementação
- Utilizar React oficial com hooks e contextos aprovados, mantendo FSD e Atomic Design conforme `AGENTS.md`. 【F:AGENTS.md†L120-L220】
- Estruturar componentes em diretórios por feature (`components/<feature>`) e registrar fronteiras no RUP sempre que houver novas jornadas.
- Garantir microcopy aderente às regras de UX Writing (ação direta, texto curto, sem redundâncias). 【F:AGENTS.md†L1-L120】
- Documentar estados `loading`, `success`, `error` e `empty` em cada componente crítico, anexando evidências em PRs.
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019).

[Voltar ao índice](README-spec.md)
