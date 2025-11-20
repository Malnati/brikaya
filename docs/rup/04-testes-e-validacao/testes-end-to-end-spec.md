<!-- docs/rup/04-testes-e-validacao/testes-end-to-end.md -->
# Testes End-to-End (E2E)

> Base: [./testes-end-to-end.md](./testes-end-to-end.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Fluxos operacionais](../02-design/fluxos-spec.md) · [Qualidade e Métricas](../04-qualidade-testes/qualidade-e-metricas-spec.md) · [Capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

## Objetivo
Validar ponta a ponta os fluxos críticos do App reproduzindo jornadas reais de cooperativas, compradores e analistas, garantindo aderência às telas públicas e aos painéis internos antes da liberação de cada release. 【F:docs/rup/02-design/fluxos-spec.md†L33-L160】【F:landing/src/pages/Home.tsx†L33-L160】

## Atualizações quando requisitos forem mapeados
- Adicione cenários aqui e no arquivo base sempre que um `REQ-###` ou `RNF-###` exigir validação ponta a ponta.
- Sincronize critérios em `criterios-de-aceitacao-spec.md`, métricas em `qualidade-e-metricas-spec.md` e automações em `build-e-automacao-spec.md`.
- Registre execuções em `docs/reports/`, referencie o PR e atualize `audit-history.md` com o identificador do requisito. 【F:docs/rup/audit-history.md†L1-L80】

## Cenários obrigatórios
1. **Onboarding com aprovação colaborativa**
   - Simular cadastro multicanal, anexos e validações automáticas.
   - Bloquear acesso ao marketplace até aprovação combinada (analista + jurídico + socioambiental).
   - Validar associação multi-perfil por usuário e painel administrativo com status `não verificado → em validação → verificado`.
   - **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
   - **Integração colaborativa:** deve registrar pareceres e tempos de SLA em `CollabReviewBoard`. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L70-L140】
   - **Referências anexas:** validar campos cadastrais obrigatórios para organizações, unidades, logística e compliance. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L6-L185】
2. **Controle de perfis e permissões**
   - Entrar como fornecedor, comprador, parceiro e investidor verificando ações permitidas/bloqueadas em cada perfil.
   - Confirmar que usuários multi-perfil conseguem alternar funções sem perder restrições individuais.
   - Validar formulários de interesse quando o investidor não estiver cadastrado e notificações para administradores.
   - **Referências anexas:** permissões segmentadas por perfil, subtipos e governança administrativa. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L92-L185】
3. **Certificação e tokenização de lote**
   - Cadastrar lote com campos obrigatórios, agendar inspeção e publicar evento `WasteBatchCertified`.
   - Gerar passaporte digital com anexos, hash verificável e histórico acessível para Futura HQ.
   - **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-033](../02-planejamento/requisitos-spec.md#req-033).
   - **Referências anexas:** campos do lote, score de verificação, seguros e passaporte digital. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L46-L226】
4. **Negociação e logística**
   - Selecionar lote, negociar preço, contratar transporte e seguros.
   - Confirmar rota sugerida e integração com parceiros logísticos.
   - **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-035](../02-planejamento/requisitos-spec.md#req-035).
   - **Referências anexas:** vínculos com transportadores, seguros obrigatórios e recomendações quando inexistentes. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L77-L156】
5. **Liquidação financeira e distribuição de incentivos**
   - Executar split automático (`cooperativa`, `catadores`, `fundo climático`), gerar comprovantes e registrar ledger.
   - Validar notificação de recebimento e atualização de saldo.
   - **Requisitos:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
   - **Referências anexas:** fluxo de escrow e transferências internas entre contas. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L204-L219】
6. **Dashboards e relatórios ESG**
   - Atualizar métricas de impacto, engajamento comunitário e notícias conforme layout público. 【F:landing/src/sections/NewsSection.tsx†L1-L140】【F:landing/src/sections/VideosSection.tsx†L1-L160】
   - Exportar relatórios regulatórios para BACEN/MMA, garantindo hash/verificação digital e idiomas PT/EN.
   - **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
   - **Referências anexas:** blocos de dados, indicadores ESG e formatos de exportação. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L245-L328】
7. **Governança colaborativa e SLA**
   - Disparar alerta do motor de scoring (`REQ-021`), enviar para fila colaborativa e registrar pareceres.
   - Validar métricas de SLA humano vs. IA no dashboard de governança. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】
   - **Requisitos:** [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-034](../02-planejamento/requisitos-spec.md#req-034), [REQ-041](../02-planejamento/requisitos-spec.md#req-041).
8. **Compliance fiscal e auditoria**
   - Simular emissão de NF-e/NFS-e para cada tipo de operação, incluindo cálculo de tributos e CFOP adequado.
   - Baixar extratos consolidados (PDF/CSV), validar hash e registros de log imutáveis.
   - Gerar alertas fiscais automáticos ao atingir limites/regimes especiais e confirmar acesso restrito para administradores/investidores.
   - **Referências anexas:** requisitos de conformidade fiscal, integrações e auditoria. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L343-L399】

## Ferramentas
- **Playwright/Cypress** com storage state para perfis aprovados e pendentes.
- **msw/fake services** para simular integrações externas (SINIR, pagamentos).
- **axe-playwright** para validar acessibilidade durante os cenários.
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

## Normas arquiteturais para E2E
- **React oficial:** cenários devem navegar pelos componentes publicados em `landing` e nos módulos internos, sem wrappers proprietários. 【F:landing/src/layouts/MainLayout.tsx†L1-L120】
- **Feature-Sliced Design:** organize seletores por domínio (onboarding, marketplace, governanca) refletindo diretórios e fluxos. 【F:docs/rup/02-design/fluxos-spec.md†L33-L150】
- **Atomic Design:** evidencie reutilização de átomos/moléculas (cards de notícia, botões de CTA) e documente novos componentes. 【F:landing/src/sections/NewsSection.tsx†L1-L140】
- **Integração colaborativa:** cada caso deve anexar identificador da operação para consumo pelos painéis de SLA e auditorias compartilhadas. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】

## Evidências
- Capturas, vídeos e logs arquivados em `docs/reports/` com timestamp e ID do requisito. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md†L31-L104】
- Relatórios de execução automatizados anexados ao PR e ao changelog.
- Checklist de acessibilidade e de colaboração preenchidos pela equipe.
- **Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

## Critério de sucesso
100% dos cenários obrigatórios devem passar em DEV e HML antes da liberação para PRD. Falhas bloqueiam release até correção registrada com nova execução e atualização do roadmap. 【F:docs/rup/02-planejamento/roadmap-spec.md†L40-L120】
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Integração colaborativa:** apenas sincronize operações com times parceiros após atualizar status nos dashboards de SLA e na fila colaborativa. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】

[Voltar aos Testes](./README-spec.md)
