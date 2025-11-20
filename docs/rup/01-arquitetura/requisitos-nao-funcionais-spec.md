<!-- docs/rup/01-arquitetura/requisitos-nao-funcionais.md -->
# Requisitos Não Funcionais

> Base: [./requisitos-nao-funcionais.md](./requisitos-nao-funcionais.md)
> Rastreabilidade App: [REQ-201](../02-planejamento/requisitos-spec.md#req-201), [REQ-202](../02-planejamento/requisitos-spec.md#req-202), [REQ-205](../02-planejamento/requisitos-spec.md#req-205)
> Legado correspondente: [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022)

Este capítulo consolida metas transversais da arquitetura App utilizando o formato evolutivo do Yagnostic. Cada seção mantém referências a protótipos/código herdados (`app/uisrc/UploadHelper.ts`, `prototype/dashboard-visao-geral.html`, `app/api/src/diagnostics/diagnostics.controller.ts`) e adiciona notas sobre a convivência com a capacidade colaborativa (`REQ-031`…`REQ-035`).

---

## Atualização contínua de RNFs

- Registre novas restrições aqui e em `../02-planejamento/requisitos-spec.md`, citando o ID App e o legado equivalente (`REQ-014`…`REQ-024`).
- Sincronize impactos arquiteturais com `arquitetura-da-extensao-spec.md`, integrações com `integracoes-com-apis-spec.md` e métricas com `../04-qualidade-testes/qualidade-e-metricas-spec.md`.
- Quando um RNF alterar fluxos colaborativos, alinhe a atualização com `capacidade-diagnostico-colaborativo-spec.md` e documente o mapeamento para [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035).

---

## Segurança e Privacidade

- **Criptografia ponta a ponta** — Dados financeiros e climáticos utilizam AES-256 em repouso e TLS 1.3/QUIC em trânsito (`REQ-201`; legado [REQ-014](../02-planejamento/requisitos-spec.md#req-014)).
- **Gestão de segredos** — Vault com rotação automática e segregação por ambiente, auditado trimestralmente (`REQ-201`; legado [REQ-021](../02-planejamento/requisitos-spec.md#req-021)).
- **Consentimentos e Open Finance** — Versionamento obrigatório, logs acessíveis aos especialistas e sincronização com `/config` herdado (`REQ-201`, `REQ-401`; legados [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-028](../02-planejamento/requisitos-spec.md#req-028)).
- **Monitoramento antifraude** — Modelos de detecção acionam filas colaborativas quando detectarem risco elevado (`REQ-404`; legado [REQ-029](../02-planejamento/requisitos-spec.md#req-029)).
- **RBAC + ABAC com SoD** — Níveis N0–N5 exigem segregação de funções, atributos de segmento/CNAE, rating e certificações para liberar operações críticas, alinhando tokens de acesso às políticas colaborativas (`REQ-040`, `REQ-304`; legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).
- **MFA adaptativa e sessões controladas** — Autenticação biométrica + PIN e step-up por risco são mandatórios a partir do nível N2, com tokens OIDC/OAuth2 de curta duração e revogação automática em fluxos sensíveis (`REQ-201`, `REQ-304`; legado [REQ-014](../02-planejamento/requisitos-spec.md#req-014)).

---

## Desempenho e Escalabilidade

- **Latência transacional** — Operações críticas (consulta de saldo, liquidação PIX/SPI) ≤ 300 ms em 95% das requisições (`REQ-203`; legados [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-019](../02-planejamento/requisitos-spec.md#req-019)).
- **Processamento analítico** — Consolidação de indicadores de impacto em janelas ≤ 15 min com tolerância máxima de 5% (`REQ-205`; legado [REQ-017](../02-planejamento/requisitos-spec.md#req-017)).
- **Escalabilidade horizontal** — Suportar 50 mil usuários simultâneos com auto scaling multi-região (`REQ-204`; legado [REQ-020](../02-planejamento/requisitos-spec.md#req-020)).
- **Filas colaborativas** — SLA médio ≤ 18 h para operações de alto risco, alinhado a `REQ-304` e ao legado [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

---

## Disponibilidade e Continuidade

- **SLA mínimo** — 99,5% mensal (meta 99,9%) para APIs públicas e apps mobile (`REQ-202`; legados [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019)).
- **Multi-região ativa/ativa** — Replicação síncrona para ledger financeiro e eventos climáticos com failover < 5 min (`REQ-305`; legados [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020)).
- **Backups e recuperação** — PITR para bancos transacionais e snapshots diários para data lake climático (`REQ-303`; legado [REQ-017](../02-planejamento/requisitos-spec.md#req-017)).
- **Planos de contingência climática** — BCP considera enchentes, queimadas e crises ambientais que afetem cadeias de coleta (`REQ-205`; legado [REQ-022](../02-planejamento/requisitos-spec.md#req-022)).

---

## Observabilidade e Métricas

- **Dashboards integrados** — Indicadores técnicos (CPU, memória, filas) e ESG (toneladas recicladas, emissões evitadas) compartilhados com especialistas (`REQ-205`; legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).
- **Tracing distribuído** — Cada transação gera `correlation_id` e `impact_token`, permitindo seguir do lote à liquidação financeira (`REQ-205`; legados [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022)).
- **Alertas pró-ativos** — Incident response multicanal com playbooks definidos (`REQ-205`, `REQ-404`; legados [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029)).
- **Telemetria colaborativa** — Dashboards indicam estados aguardando validação humana (`REQ-304`; legado [REQ-035](../02-planejamento/requisitos-spec.md#req-035)).
- **Auditoria de acesso** — Logs imutáveis registram concessões, recertificações trimestrais e revogações, com retenção mínima de cinco anos para atender compliance financeiro e socioambiental (`REQ-205`, `REQ-404`; legado [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).

---

## Compliance e Governança

- **Regulatório BACEN e ESG** — Aderência à Resolução CMN 4.658, Lei 13.506 e normas ambientais federais, com relatórios assinados digitalmente (`REQ-402`, `REQ-403`; legados [REQ-029](../02-planejamento/requisitos-spec.md#req-029), [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).
- **Auditorias independentes** — Modelos de scoring e distribuição de renda passam por auditoria semestral, registrando versionamento e explicabilidade (`REQ-304`, `REQ-404`; legados [REQ-029](../02-planejamento/requisitos-spec.md#req-029), [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).
- **Governança de modelos** — Cada versão de IA informa dataset, métricas e responsável humano (`REQ-304`; legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-033](../02-planejamento/requisitos-spec.md#req-033)).
- **Catálogo de relatórios** — Evidências automatizadas arquivadas em `docs/reports/` com referência ao requisito atendido (`REQ-205`, `REQ-404`; legados [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029)).

---

## Acessibilidade e Experiência

- **WCAG 2.2 AA** — Contraste, navegação por teclado e feedback textual alinhados às diretrizes em `prototype/dashboard-visao-geral.html` (`REQ-206`; legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-016](../02-planejamento/requisitos-spec.md#req-016)).
- **UX Writing orientada à ação** — Textos seguem as regras do `AGENTS.md`, destacando instruções claras para especialistas colaborativos (`REQ-206`; legados [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028)).
- **Tempo de resposta percebido** — Dashboards atualizam dados em ≤ 1 s após novas decisões IA/humana (`REQ-205`, `REQ-304`; legados [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-034](../02-planejamento/requisitos-spec.md#req-034)).

---

## Notas de Convivência com a Capacidade Colaborativa

- Declare quais SLAs ou métricas são compartilhadas com especialistas humanos e documente o impacto (`REQ-304`; legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035)).
- Garanta que logs e indicadores contenham `collaboration_ticket_id` sempre que houver revisão humana, mantendo auditoria ponta a ponta.
- Atualize `capacidade-diagnostico-colaborativo-spec.md` e os relatórios em `docs/reports/` sempre que um RNF alterar tempos de resposta, requisitos de segurança ou padrões de auditoria.

[Voltar ao índice](./README-spec.md)
