<!-- docs/rup/02-design/fluxos.md -->
# Fluxos Operacionais do App

> Base: [./fluxos.md](./fluxos.md)
> Referências correlatas: [Design geral](./design-geral-spec.md) · [Componentes](./componentes-spec.md) · [Catálogo de requisitos](../02-planejamento/requisitos-spec.md#requisitos-funcionais-rf)

## Objetivo
Documentar, segundo o Rational Unified Process, as sequências de interação entre canais digitais, serviços de negócio e módulos colaborativos do App. Cada fluxo descreve passos, estados visuais e integrações necessárias para manter paridade com o catálogo de requisitos e com a capacidade colaborativa descrita em `capacidade-diagnostico-colaborativo-spec.md`. 【F:docs/rup/02-planejamento/requisitos-spec.md†L27-L134】【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L1-L140】

---

## Atualizações quando novos requisitos forem registrados
- **Requisitos funcionais:** documente aqui os fluxos atualizados, apontando caminhos principais, alternativos e de exceção vinculados aos novos IDs `REQ-###`. Sincronize sempre `fluxos.md` e `fluxos-spec.md`, além de atualizar `design-geral.md`, `componentes.md` e as integrações em `../01-arquitetura/`.
- **Requisitos não funcionais:** registre mudanças de performance, segurança ou usabilidade que afetem sequências, destacando métricas em `../04-qualidade-testes/qualidade-e-metricas-spec.md` e critérios em `../04-testes-e-validacao/criterios-de-aceitacao-spec.md`.
- **Rastreabilidade:** referencie o requisito no catálogo (`../02-planejamento/requisitos-spec.md`), cite o item do `CHANGELOG/` e enlace o registro em `docs/rup/audit-history.md`.

---

## Notas Gerais
- Diagramas de sequência podem ser anexados em PlantUML/Mermaid mantendo texto versionável.
- Todos os fluxos devem registrar pontos de auditoria (logs, banners de erro, checkpoints de consentimento) conforme governança MBRA. 【F:AGENTS.md†L280-L360】【F:AGENTS.md†L880-L940】
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

---

## Fluxo 1 — Autenticação e Onboarding com MFA/SSO ([REQ-110](../02-planejamento/requisitos-spec.md#req-110), [REQ-111](../02-planejamento/requisitos-spec.md#req-111))
1. **Login inicial:** usuário escolhe entre login/senha tradicional ou SSO com provedor corporativo (OIDC/SAML); sistema detecta se MFA é necessário baseado no perfil de risco.

> Passo ajustado para remover marcas legadas e manter microcopy neutra conforme manual de marca.
2. **Verificação multifatorial:** para operações sensíveis, solicita segundo fator (SMS/E-mail/App authenticator); sessões OIDC são mantidas com refresh automático.
3. **Cadastro completo:** coleta CPF, nome completo, telefone, aceita consentimento LGPD; inicia processo KYC automatizado com validação documental.
4. **Múltiplos perfis:** usuário pode associar-se a diferentes organizações (fornecedor, comprador, parceiro) com permissões específicas por contexto.
5. **Aprovação administrativa:** pendências são direcionadas para análise humana via painel colaborativo; logs registram todas as decisões e justificativas.
- **Requisitos associados:** [REQ-110](../02-planejamento/requisitos-spec.md#req-110), [REQ-111](../02-planejamento/requisitos-spec.md#req-111), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

## Fluxo 2 — Cadastro de Organizações e Unidades ([REQ-112](../02-planejamento/requisitos-spec.md#req-112), [REQ-113](../02-planejamento/requisitos-spec.md#req-113))
1. **Dados empresariais:** CNPJ, razão social, nome fantasia, CNAE, regime tributário, inscrição estadual, endereço fiscal completo.
2. **Classificação por subtipo:** sistema identifica automaticamente se é setor público, ONG, agroindústria, indústria, cooperativa baseado no CNAE.
3. **Dados financeiros:** conta bancária, integração com gateway de pagamento, rating interno, limite de crédito, classificação fiscal.
4. **Unidades operacionais:** cada organização cadastra filiais/unidades com coordenadas GPS obrigatórias, capacidade de armazenagem, horário de operação.
5. **Validação geoespacial:** sistema verifica se coordenadas estão dentro do território brasileiro e calcula distâncias para matching posterior.
- **Requisitos associados:** [REQ-112](../02-planejamento/requisitos-spec.md#req-112), [REQ-113](../02-planejamento/requisitos-spec.md#req-113), [REQ-002](../02-planejamento/requisitos-spec.md#req-002).

## Fluxo 3 — Marketplace com Precificação Dinâmica ([REQ-116](../02-planejamento/requisitos-spec.md#req-116))
1. **Cadastro de lote:** fornecedor informa tipologia, quantidade, condição, coordenadas de coleta, fotos, vídeos, documentação anexa.
2. **Engine de precificação:** algoritmo calcula preço sugerido baseado em oferta/demanda regional (raio 200km), qualidade, certificação, histórico de preços.
3. **Busca geolocalizada:** compradores filtram por tipologia, distância, qualidade, preço, condições logísticas; resultados ordenados por relevância.
4. **Negociação assistida:** chat integrado permite negociação de preço, prazo, condições de entrega; contratos digitais são gerados automaticamente.
5. **Match automático:** sistema sugere pares ideais fornecedor/comprador baseado em localização, perfil, histórico de transações.
- **Requisitos associados:** [REQ-116](../02-planejamento/requisitos-spec.md#req-116), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-046](../02-planejamento/requisitos-spec.md#req-046), [REQ-105](../02-planejamento/requisitos-spec.md#req-105).

## Fluxo 4 — Sistema de Escrow e Pagamentos ([REQ-117](../02-planejamento/requisitos-spec.md#req-117), [REQ-118](../02-planejamento/requisitos-spec.md#req-118))
1. **Criação de custódia:** após acordo comercial, sistema cria conta de escrow específica para a transação; comprador deposita valor total.
2. **Múltiplos gateways:** integração com provedores de pagamento homologados permite PIX, cartão, boleto; contas virtuais por usuário facilitam conciliação.
3. **Split configurável:** valor é dividido automaticamente entre fornecedor, plataforma, parceiros logísticos, fundo climático conforme regras pré-definidas.
4. **Liberação automatizada:** mediante comprovante de entrega e aceitação pelo comprador, valores são liberados automaticamente para cada parte.
5. **Conciliação bancária:** webhook de gateways atualiza status em tempo real; relatórios financeiros são gerados automaticamente.
- **Requisitos associados:** [REQ-117](../02-planejamento/requisitos-spec.md#req-117), [REQ-118](../02-planejamento/requisitos-spec.md#req-118), [REQ-107](../02-planejamento/requisitos-spec.md#req-107), [REQ-108](../02-planejamento/requisitos-spec.md#req-108).

## Fluxo 5 — Rastreamento Logístico GPS ([REQ-119](../02-planejamento/requisitos-spec.md#req-119))
1. **Cadastro de veículos:** transportadora registra frota com placa, capacidade, tipo, seguros vigentes, certificações ambientais.
2. **Planejamento de rota:** sistema TMS calcula rota otimizada considerando distância, capacidade, janelas de coleta, restrições de acesso.
3. **Rastreamento em tempo real:** GPS transmite posição a cada 30 minutos; telemetria inclui velocidade, combustível, temperatura da carga.
4. **Atualizações automáticas:** compradores e fornecedores recebem notificações de saída, chegada, atrasos, intercorrências na rota.
5. **Comprovante de entrega:** app móvel permite captura de foto, assinatura digital, coordenadas do local de entrega para validação.
- **Requisitos associados:** [REQ-119](../02-planejamento/requisitos-spec.md#req-119), [REQ-114](../02-planejamento/requisitos-spec.md#req-114), [REQ-004](../02-planejamento/requisitos-spec.md#req-004).

## Fluxo 6 — Emissão Fiscal Automática e Cálculos ESG ([REQ-120](../02-planejamento/requisitos-spec.md#req-120), [REQ-121](../02-planejamento/requisitos-spec.md#req-121))
1. **Integração SEFAZ:** após confirmação de entrega, sistema emite automaticamente NF-e/NFS-e conforme natureza da operação e regime tributário.
2. **Cálculo de tributos:** aplicação de CFOP específico para operações com resíduos, cálculo de ICMS, IPI, ISS conforme legislação aplicável.
3. **Metodologias ESG padrão:** cálculos automáticos de tCO₂ evitado usando IPCC, GHG Protocol; métricas sociais (empregos gerados) e governança.
4. **Exportação XML/PDF:** notas fiscais e relatórios ESG são exportados com assinatura digital, QR Code para validação, layouts SPED.
5. **Status em tempo real:** acompanhamento de autorização SEFAZ, consulta de situação, rejeições e correções necessárias.
- **Requisitos associados:** [REQ-120](../02-planejamento/requisitos-spec.md#req-120), [REQ-121](../02-planejamento/requisitos-spec.md#req-121), [REQ-053](../02-planejamento/requisitos-spec.md#req-053).

## Fluxo 7 — APP Coin e Smart Contracts ([REQ-122](../02-planejamento/requisitos-spec.md#req-122))
1. **Smart contracts Polygon:** contratos inteligentes gerenciam minting, burning, transferências, lastro ambiental do token APP.
2. **Minting controlado:** tokens são emitidos automaticamente após transações sustentáveis validadas, com base em critérios ESG atingidos.
3. **Lastro ambiental verificável:** cada token está vinculado a impacto ambiental mensurável (tCO₂ evitado, área preservada, resíduos desviados).
4. **Burning programável:** tokens podem ser "queimados" para resgatar benefícios, descontos em taxas, participação em fundos climáticos.
5. **APIs públicas:** integração com wallets, exchanges, exploradores blockchain permite transparência total das transações.
- **Requisitos associados:** [REQ-122](../02-planejamento/requisitos-spec.md#req-122), [REQ-050](../02-planejamento/requisitos-spec.md#req-050), [REQ-109](../02-planejamento/requisitos-spec.md#req-109).

## Fluxo 8 — Dashboard Administrativo Unificado ([REQ-123](../02-planejamento/requisitos-spec.md#req-123))
1. **Métricas em tempo real:** volume de transações, usuários ativos, lotes publicados, impacto ESG, receita da plataforma.
2. **Gestão de usuários:** aprovação de cadastros, atribuição de permissões, bloqueio/desbloqueio, auditoria de acessos.
3. **Logs de auditoria:** registro completo de todas as ações críticas com timestamp, usuário, IP, justificativa quando aplicável.
4. **KPIs ESG:** dashboard específico com tCO₂ compensado, resíduos processados, empregos gerados, receita distribuída para comunidades.
5. **Exportações regulatórias:** relatórios para BACEN, órgãos ambientais, Receita Federal com formatos padronizados e assinatura digital.
- **Requisitos associados:** [REQ-123](../02-planejamento/requisitos-spec.md#req-123), [REQ-034](../02-planejamento/requisitos-spec.md#req-034), [REQ-205](../02-planejamento/requisitos-spec.md#req-205).

## Fluxo 4 — Monitoramento de Impacto e Relatórios
1. `impact-insights` consolida dados de transações, sensores IoT e feedbacks comunitários, atualizando indicadores climáticos em tempo quase real.
2. Dashboards mostram CO₂ evitado, renda distribuída e alertas críticos com microcopy orientada à ação. 【F:landing/src/pages/Home.tsx†L80-L160】
3. Relatórios ESG e regulatórios são gerados automaticamente, armazenados em `/docs/reports/` e enviados a BACEN, órgãos ambientais e investidores.
4. Comunidade recebe conteúdos educativos e chamadas para ação via seções de notícias e vídeos. 【F:landing/src/components/NewsList.tsx†L1-L120】【F:landing/src/components/VideoGallery.tsx†L1-L160】
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-023](../02-planejamento/requisitos-spec.md#req-023), [REQ-039](../02-planejamento/requisitos-spec.md#req-039).
- **Integração colaborativa:** indicadores alimentam métricas de SLA humano vs. IA (`REQ-034`) e acionam alertas de risco quando limites são excedidos.

## Fluxo 5 — Governança e Auditoria Colaborativa
1. Fila `CollabReviewBoard` recebe operações marcadas pelo motor de scoring (`REQ-021`) e distribui para analistas conforme especialidade. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L70-L140】
2. Cada analista executa checklist personalizado, anexa evidências e registra parecer com timestamp e assinatura.
3. Decisão consolidada libera operação ou retorna à origem com pendências documentadas.
4. Logs estruturados e relatórios são arquivados em `docs/reports/`, vinculados ao PR ou change request correspondente.
- **Requisitos associados:** [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-032](../02-planejamento/requisitos-spec.md#req-032), [REQ-037](../02-planejamento/requisitos-spec.md#req-037), [REQ-044](../02-planejamento/requisitos-spec.md#req-044).
- **Integração colaborativa:** métricas de SLA, taxa de retrabalho e histórico de decisões alimentam dashboards de governança e auditorias externas (`REQ-035`).

---

## Padrões Estruturais Obrigatórios para Novos Fluxos
### React oficial (Meta)
- **Definição:** adotamos exclusivamente o pacote `react` mantido pela Meta e sua API oficial (hooks, contextos) em todas as jornadas. 【F:AGENTS.md†L120-L220】
- **Impacto:** qualquer fluxo adicional deve ser entregue como componente React funcional, reutilizando hooks de estado/efeito oficiais. Integrações com helpers e armazenamento devem respeitar padrões descritos em `MainLayout` e `NewsList`. 【F:landing/src/layouts/MainLayout.tsx†L1-L120】【F:landing/src/components/NewsList.tsx†L1-L120】
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

### Feature-Sliced Design (FSD)
- **Definição:** a camada de UI deve ser organizada por domínio (`features/`, `entities/`, `shared/`), preservando isolamento de responsabilidades. 【F:AGENTS.md†L604-L626】
- **Impacto:** novos fluxos devem criar diretórios dedicados (ex.: `components/marketplace/`, `components/collaboration/`), documentar fronteiras no RUP e atualizar `AGENTS.md` quando houver dependências cruzadas.
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019).

### Atomic Design
- **Definição:** componentes são classificados como átomos (botões, inputs), moléculas (cards, listas) e organismos (fluxos completos), reforçando reutilização incremental. 【F:AGENTS.md†L120-L220】
- **Impacto:** cada incremento deve mapear quais átomos existentes serão reutilizados e quais organismos precisam ser documentados. Ausência dessa análise bloqueia aprovação de PRs, pois gera inconsistências visuais e viola a governança 60-30-10.
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).

---

## Referências Cruzadas
- `onboarding-compliance` ↔ fluxos de cadastro e aprovação (`Fluxo 1`).
- `waste-orchestrator` ↔ passaporte digital e marketplace (`Fluxo 2`).
- `climate-banking` ↔ liquidação financeira e split (`Fluxo 3`).
- `impact-insights` ↔ dashboards e relatórios (`Fluxo 4`).
- `CollabReviewBoard` ↔ governança e auditoria (`Fluxo 5`).

[Voltar ao índice](README-spec.md)
