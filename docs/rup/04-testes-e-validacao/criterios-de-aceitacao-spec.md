<!-- docs/rup/04-testes-e-validacao/criterios-de-aceitacao.md -->
# Critérios de Aceitação

> Base: [./criterios-de-aceitacao.md](./criterios-de-aceitacao.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-de-onboarding)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Fluxos operacionais](../02-design/fluxos-spec.md) · [Componentes de UI](../02-design/componentes-spec.md) · [Qualidade e Métricas](../04-qualidade-testes/qualidade-e-metricas-spec.md)

## Objetivo
Estabelecer critérios mensuráveis para homologar entregas do App antes de cada release, cobrindo as jornadas descritas nos fluxos operacionais e garantindo aderência às metas ambientais, financeiras e colaborativas. 【F:docs/rup/02-design/fluxos-spec.md†L33-L160】

## Atualizações quando requisitos forem adicionados
- Registre critérios em `criterios-de-aceitacao.md` e `criterios-de-aceitacao-spec.md` sempre que um `REQ-###` ou `RNF-###` exigir validação formal, mantendo alinhamento com `testes-end-to-end-spec.md`, `qualidade-e-metricas-spec.md` e `build-e-automacao-spec.md`. 【F:docs/rup/03-implementacao/build-e-automacao-spec.md†L1-L160】
- Anote a alteração no changelog e na `audit-history.md`, anexando evidências em `docs/reports/` com o identificador do requisito. 【F:docs/rup/audit-history.md†L1-L80】【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md†L31-L104】
- Garanta que requisitos colaborativos (`REQ-031` a `REQ-035`) recebam parecer humano registrado nos checklists da fila `CollabReviewBoard`. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L70-L176】

## Critérios Funcionais - Épicos M1 Integrados

### E1 - Autenticação e Acesso ([REQ-110](../02-planejamento/requisitos-spec.md#req-110))
- **MFA condicional:** sistema detecta operações sensíveis e solicita segundo fator automaticamente
- **SSO funcional:** login com provedor corporativo (OIDC/SAML) completa em <5s sem erros

> Critérios ajustados para remover marcas legadas e manter microcopy objetiva.
- **Sessão OIDC:** tokens refresh automáticos, logout por inatividade funciona
- **Perfis múltiplos:** usuário alterna entre organizações mantendo permissões específicas
- **Auditoria:** todos os logins registram IP, timestamp, método usado, resultado

### E2 - Cadastros Completos ([REQ-111](../02-planejamento/requisitos-spec.md#req-111) a [REQ-115](../02-planejamento/requisitos-spec.md#req-115))
- **Usuários:** CPF válido, KYC automático, consentimento LGPD obrigatório antes do primeiro uso
- **Organizações:** CNPJ/CNAE válidos, subtipo detectado automaticamente, dados fiscais completos
- **Unidades:** coordenadas GPS validadas (território brasileiro), capacidade numérica, horários consistentes
- **Veículos:** seguros vigentes, certificações com validade, documentos anexados obrigatórios
- **Parceiros:** KYB para logísticos, formulário interesse para investidores não cadastrados

### E3 - Marketplace Inteligente ([REQ-116](../02-planejamento/requisitos-spec.md#req-116))
- **Precificação dinâmica:** algoritmo calcula preço baseado em dados reais (200km raio)
- **Busca geolocalizada:** filtros por distância retornam resultados precisos em <2s
- **Matching automático:** sugestões fornecedor/comprador baseadas em histórico e localização
- **Negociação:** chat integrado, contratos digitais gerados automaticamente após acordo
- **Qualidade:** scoring baseado em certificações, fotos, relatórios de análise

### E4 - Pagamentos e Escrow ([REQ-117](../02-planejamento/requisitos-spec.md#req-117), [REQ-118](../02-planejamento/requisitos-spec.md#req-118))
- **Custódia:** conta escrow criada automaticamente, valor bloqueado até entrega confirmada
- **Múltiplos gateways:** PIX, cartão, boleto funcionam através de diferentes provedores
- **Split automático:** divisão de valores conforme regras pré-configuradas
- **Contas virtuais:** uma por usuário, conciliação automática, extratos disponíveis
- **Webhooks:** status de pagamento atualizado em tempo real, notificações enviadas

### E5 - Logística e Fiscal/ESG ([REQ-119](../02-planejamento/requisitos-spec.md#req-119) a [REQ-121](../02-planejamento/requisitos-spec.md#req-121))
- **GPS tempo real:** posição atualizada a cada 30min, rotas otimizadas automaticamente
- **Emissão fiscal:** NF-e/NFS-e geradas automaticamente via SEFAZ após entrega
- **Cálculos ESG:** tCO₂ evitado calculado usando metodologias padrão (IPCC, GHG Protocol)
- **Comprovantes:** assinatura digital, QR Code para validação, exportação XML/PDF
- **Integração SEFAZ:** status autorização em tempo real, rejeições tratadas automaticamente

### E6 - APP Coin e Blockchain ([REQ-122](../02-planejamento/requisitos-spec.md#req-122))
- **Smart contracts:** minting/burning automático baseado em transações verificadas
- **Lastro ambiental:** cada token vinculado a impacto mensurável e verificável
- **APIs públicas:** integração com wallets, transparência total de transações
- **Polygon:** transações na rede funcionando, gas otimizado, confirmações <1min
- **Governança:** preparação para DAO, tokenomics documentado, distribuição automática

### E7 - Dashboard Administrativo ([REQ-123](../02-planejamento/requisitos-spec.md#req-123))
- **Métricas tempo real:** volume transações, usuários ativos, impacto ESG atualizados
- **Gestão usuários:** aprovações, permissões RBAC/ABAC, auditoria completa de acessos
- **KPIs ESG:** tCO₂ compensado, resíduos processados, receita distribuída para comunidades
- **Exportações:** relatórios BACEN, órgãos ambientais com assinatura digital automática
- **Logs auditoria:** registro completo de ações críticas com timestamp, usuário, justificativa

### Legado - Onboarding Verde e Compliance
- **Aprovações multicanal:** bloqueiam acesso até conclusão conjunta (analista, jurídico, socioambiental) e exibem status conforme fluxo 1.
  **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
  **Integração colaborativa:** pareceres alimentam métricas de SLA previstas em [REQ-037](../02-planejamento/requisitos-spec.md#req-037).
- **Perfis e permissões segmentadas** — cada persona (fornecedor, comprador, parceiro, investidor) acessa apenas funcionalidades autorizadas, incluindo formulários de interesse e alertas administrativos quando necessário. Usuários multi-perfil alternam papéis mantendo restrições específicas. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L92-L185】
- **Marketplace e Passaporte de Resíduos** — cadastro, certificação e publicação de lotes seguem campos e checkpoints descritos no fluxo 2, com histórico auditável disponível para compradores. 【F:docs/rup/02-design/fluxos-spec.md†L74-L110】
  **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-033](../02-planejamento/requisitos-spec.md#req-033).
  **Referências anexas:** campos obrigatórios, score de verificação, seguros e passaporte digital com hash verificável. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L46-L226】
- **Logística e Liquidação** — rotas propostas, contratação de transporte e split financeiro reproduzem o fluxo 3, emitindo comprovantes e atualizando dashboards de impacto. 【F:docs/rup/02-design/fluxos-spec.md†L112-L150】
  **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
  **Referências anexas:** vínculo com transportadores certificados e recomendações quando não houver seguro. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L77-L156】
- **Conteúdo e Engajamento ESG** — seções de notícias e vídeos exibem microcopy acionável, métricas e CTAs conforme páginas públicas. 【F:landing/src/sections/NewsSection.tsx†L1-L140】【F:landing/src/sections/VideosSection.tsx†L1-L160】
  **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Critérios Não Funcionais
- **Desempenho** — onboarding e operações de marketplace respondem em até 2 s, uploads e splits concluídos conforme metas de performance. 【F:docs/rup/04-qualidade-testes/qualidade-e-metricas-spec.md†L9-L20】
  **Requisitos:** [REQ-013](../02-planejamento/requisitos-spec.md#req-013), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- **Disponibilidade** — serviços críticos mantêm uptime ≥ 99,9%, com monitoramento registrado em `docs/reports/`.
  **Requisitos:** [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Acessibilidade** — contraste AA, foco visível e navegação por teclado garantidos nas seções públicas e dashboards. 【F:landing/src/pages/Home.tsx†L33-L120】
  **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- **Observabilidade ESG** — métricas de impacto e logs seguem estrutura do dashboard colaborativo. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】
  **Requisitos:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).
- **Rastreabilidade imutável** — passaporte digital e relatórios ESG exibem hash verificável, metodologias declaradas e exportações em PDF/CSV dentro do SLA previsto. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L245-L328】

## Critérios de Segurança e Conformidade
- Rejeição de credenciais malformadas, payloads inválidos e tentativas de fraude registrada em logs seguros.
  **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- Consentimentos e termos LGPD registrados antes de liberar funcionalidades financeiras ou colaborativas. 【F:docs/rup/02-design/fluxos-spec.md†L33-L72】
  **Requisitos:** [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025).
- Dados compartilhados na revisão colaborativa criptografados em repouso e em trânsito.
  **Requisitos:** [REQ-038](../02-planejamento/requisitos-spec.md#req-038), [REQ-040](../02-planejamento/requisitos-spec.md#req-040).
- Auditorias de ativos e relatórios fiscais registradas com data, hora, partes envolvidas e documentos de certificação de terceiros (Verra, Gold Standard, NF-e/NFS-e). 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L232-L399】

## Critérios Operacionais
- Pipelines descritos em `revisoes-com-ia-spec.md` executados sem falhas (lint, build, testes, auditorias). 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md†L18-L110】
  **Requisitos:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Evidências anexadas em `docs/reports/` com link direto no PR e nos dashboards colaborativos. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md†L31-L104】
  **Requisitos:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- Checklist de UX Writing concluído conforme diretrizes globais. 【F:AGENTS.md†L120-L220】【F:AGENTS.md†L200-L333】
  **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- Logs fiscais e extratos consolidados armazenados com hash/assinatura digital, notificando usuários sobre prazos tributários e limites regulatórios. 【F:docs/rup/99-anexos/Requisitos_Banco_Digital.txt†L343-L388】

## Normas de Aceitação para Arquitetura de UI
- **React oficial** — componentes avaliados devem usar hooks e APIs oficiais, seguindo organização definida no layout principal. 【F:landing/src/layouts/MainLayout.tsx†L1-L120】
- **Feature-Sliced Design** — critérios devem apontar a fatia (`components/<feature>` ou `sections/`) impactada, garantindo isolamento de domínio. 【F:AGENTS.md†L604-L626】
- **Atomic Design** — relatórios citam átomos/moléculas reutilizados, documentando novos componentes quando necessário. 【F:AGENTS.md†L120-L220】
- **Integração colaborativa:** mantenha compatibilidade com componentes usados em dashboards de governança e filas colaborativas descritas em [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Encerramento da homologação
Uma entrega só é liberada quando todos os critérios acima estão verdes, o roadmap atualizado e a governança confirma dupla revisão (técnica + UX). Pendências devem ser registradas no changelog com plano de ação e nova rodada de testes. 【F:docs/rup/02-planejamento/roadmap-spec.md†L40-L120】
- **Requisitos associados:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).
- **Integração colaborativa:** sincronize o status com os marcos da fila colaborativa e com o dashboard de SLA previstos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

[Voltar aos Testes](./README-spec.md)
