<!-- docs/rup/02-design/design-geral.md -->
# Design Geral da Plataforma App

> Base: [./design-geral.md](./design-geral.md)
> Referências correlatas: [Fluxos operacionais](./fluxos-spec.md) · [Componentes do sistema](./componentes-spec.md) · [Catálogo de requisitos](../02-planejamento/requisitos-spec.md#requisitos-funcionais-rf)

## Objetivo
Descrever a arquitetura de design da plataforma App, garantindo alinhamento entre o site institucional (`landing/`), os protótipos estratégicos documentados em `docs/` e os módulos transacionais previstos no catálogo de requisitos. O foco é suportar jornadas climáticas — onboarding, marketplace, logística, impacto e colaboração — mantendo consistência visual e textual com o design system MBRA e as diretrizes socioambientais do projeto. 【F:landing/src/components/SiteHeader.tsx†L1-L120】【F:landing/src/components/SiteFooter.tsx†L1-L160】

## Escopo
- Páginas e componentes React que comunicam produtos financeiros verdes, soluções para cooperativas e canais de relacionamento. 【F:landing/src/pages/Home.tsx†L1-L192】
- Estruturas de conteúdo que detalham uso de resíduos, créditos climáticos e programas de capacitação colaborativa. 【F:landing/src/pages/NewsPage.tsx†L1-L120】【F:landing/src/pages/VideosPage.tsx†L1-L88】
- Conteúdos transacionais previstos nas especificações RUP (marketplace, logística, dashboards, passaporte digital) conectados às jornadas descritas em `requisitos-spec.md`. 【F:docs/rup/02-planejamento/requisitos-spec.md†L27-L82】
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

---

## Atualizações quando requisitos evoluírem

- **Requisitos funcionais:** ajuste layouts, jornadas e protótipos conforme novos `REQ-###`, atualizando `design-geral.md` e este espelho em sincronia com `fluxos.md`, `componentes.md` e integrações de arquitetura.
- **Requisitos não funcionais:** registre impactos em responsividade, acessibilidade, performance e governança derivados de RNFs, alinhando métricas com `../04-qualidade-testes/qualidade-e-metricas-spec.md` e controles com `../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md`.
- **Checklist de rastreabilidade:** cite o requisito no catálogo, informe o item do `CHANGELOG/`, registre decisões documentadas e aponte o correspondente em `docs/rup/audit-history.md`.

---

## Princípios de Design
- **Hierarquia orientada a impacto** — destaque para KPIs climáticos, incentivos financeiros e chamadas para cadastro colaborativo. 【F:landing/src/components/NewsList.tsx†L1-L120】
- **Clareza socioambiental** — microcopy curto e acionável, valorizando ações de reciclagem e crédito verde; textos seguem a regra de UX Writing definida no `AGENTS.md`. 【F:landing/src/pages/TermsOfUsePage.tsx†L1-L120】【F:AGENTS.md†L1-L120】
- **Escalabilidade multi-stakeholder** — tokens de cor, tipografia e espaçamento reutilizáveis para cooperativas, investidores e parceiros públicos. 【F:AGENTS.md†L604-L626】
- **Resiliência visual** — estados de carregamento, sucesso e alerta previstos nos módulos transacionais, com instruções claras e acessibilidade AA. 【F:landing/src/components/NewsList.tsx†L1-L120】【F:landing/src/components/VideoGallery.tsx†L40-L140】
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## Camadas de Design
- **Cabeçalho institucional** — apresenta logotipo dinâmico, navegação principal e acesso rápido a CTA de abertura de conta verde. 【F:landing/src/components/SiteHeader.tsx†L1-L120】
- **Corpo modular** — organizado em blocos independentes (heróis, métricas de impacto, trilhas educativas, notícias climáticas) que podem ser reorganizados por persona. 【F:landing/src/pages/Home.tsx†L40-L160】
- **Rodapé regulatório** — exibe informações legais, links para políticas de privacidade e canais de suporte, obrigatório para aderência a REQ-028 e REQ-029. 【F:landing/src/components/SiteFooter.tsx†L1-L160】
- **Requisitos associados:** [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-028](../02-planejamento/requisitos-spec.md#req-028), [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- **Integração colaborativa:** a distribuição de blocos deve acomodar painéis adicionais previstos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) sem remover indicadores herdados das jornadas de marketplace.

## RUP-02-DES-001 — Blueprint da Jornada Climática
**Descrição** — Mapear a jornada completa do usuário aprovado: cadastro → verificação KYC/KYB → gestão de lotes → contratação logística → liquidação financeira → acompanhamento de impacto. 【F:landing/src/pages/Home.tsx†L40-L192】【F:docs/rup/02-design/fluxos-spec.md†L20-L120】
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- **Integração colaborativa:** mantém bloqueios de aprovação antes de acionar convites multi-especialistas descritos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e [REQ-032](../02-planejamento/requisitos-spec.md#req-032).

**Critérios de Aceitação**
- Cabeçalho com logo dinâmico e CTA presente em todas as telas autenticadas ou institucionais. 【F:landing/src/components/SiteHeader.tsx†L1-L120】
- Estados `analise`, `aprovado` e `pendente` representados visualmente nas jornadas transacionais documentadas em `fluxos-spec.md`.
- Cards de marketplace, logística e impacto respeitam grid de 8 pt e regra cromática 60-30-10. 【F:landing/src/pages/Home.tsx†L40-L160】

## RUP-02-DES-002 — Estados Operacionais
**Descrição** — Documentar estados de carregamento, sucesso, erro e vazio para cada componente crítico (cadastro, marketplace, logística, passaporte digital, dashboards). 【F:docs/rup/02-design/componentes-spec.md†L200-L270】
- **Requisitos associados:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- **Integração colaborativa:** os mesmos estados alimentam painéis compartilhados exigidos por [REQ-033](../02-planejamento/requisitos-spec.md#req-033) e logs correlacionados em [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

**Critérios de Aceitação**
- Indicadores visuais para processamento (spinners/barras) com mensagens de progresso orientadas à ação.
- Mensagens de erro acionáveis com botões “Tentar novamente”, “Contactar suporte” ou equivalente.
- Layouts vazios com chamadas para ação que direcionam o próximo passo do usuário e mantêm contraste AA.

## RUP-02-DES-003 — Responsividade e Densidade
**Descrição** — Garantir legibilidade entre 320 px e 1440 px, cobrindo desktop, tablet e mobile usados por cooperativas. 【F:landing/src/pages/Home.tsx†L40-L160】【F:landing/src/components/VideoGallery.tsx†L40-L140】
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- **Integração colaborativa:** as mesmas grades suportam dashboards expandidos descritos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e integrações omnicanal de [REQ-043](../02-planejamento/requisitos-spec.md#req-043).

**Critérios de Aceitação**
- Reorganização de cards em duas colunas para resoluções ≥ 1024 px e coluna única abaixo desse limite. 【F:landing/src/pages/Home.tsx†L40-L160】
- Componentes críticos mantêm foco visível e espaçamentos múltiplos de 8 px em qualquer breakpoint.
- Players de vídeo e blocos de notícia permanecem acessíveis por teclado. 【F:landing/src/components/VideoGallery.tsx†L1-L160】

## RUP-02-DES-004 — Regra Cromática 60-30-10
**Descrição** — Aplicar governança cromática em todas as telas entregues, com medições registradas na auditoria de qualidade. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md†L40-L90】
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

**Critérios de Aceitação**
- 60% cor primária (`--color-primary-strong`), 30% cor secundária (`--color-secondary-strong`), 10% acentos (`--color-accent`). 【F:AGENTS.md†L604-L626】
- CTAs e badges críticos utilizam apenas a cor de destaque, com contrastes AA e foco visível.
- Resultados documentados como “Conforme 603010” ou “Não conforme 603010” em relatórios de QA. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md†L53-L90】

## Artefatos Derivados
- Diagramas ou wireflows descrevendo jornadas de onboarding, marketplace, logística, liquidação e auditoria, anexados como Mermaid/PlantUML.
- Checklist de microcopy e tokens atualizados junto ao design system (branding, tipografia, ícones) mantendo alinhamento com `AGENTS.md`. 【F:AGENTS.md†L120-L220】
- Evidências de revisão UX e compliance anexadas aos PRs correspondentes, seguindo políticas do `AGENTS.md`. 【F:AGENTS.md†L200-L333】
- **Requisitos associados:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

[Voltar ao índice](README-spec.md)
