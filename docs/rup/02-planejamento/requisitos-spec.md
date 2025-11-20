<!-- docs/rup/02-planejamento/requisitos.md -->
# Catálogo de Requisitos (RUP)

> Base: [./requisitos.md](./requisitos.md)
> Plano: [Roadmap integrado](./roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Arquitetura geral](../01-arquitetura/arquitetura-da-extensao-spec.md) · [Design operacional](../02-design/design-geral-spec.md) · [Testes end-to-end](../04-testes-e-validacao/testes-end-to-end-spec.md)

Este catálogo consolida os requisitos funcionais, não funcionais, técnicos e legais do **Template de Projeto Multiplataforma**. Cada item mantém o identificador `REQ-###`, garantindo rastreabilidade direta com riscos, planos, políticas e changelogs alinhados às fases do RUP.

A especificação completa de contexto, personas e fluxos permanece documentada em [`especificacao-de-requisitos.md`](especificacao-de-requisitos-spec.md) e no inventário de negócios [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md).

---

## Procedimento de atualização contínua

### Quando surgir um requisito funcional
1. **Catálogo:** registre o item aqui e em `requisitos.md`, mantendo o ID sequencial e o status atual.
2. **Visão e planejamento:** atualize `especificacao-de-requisitos.md`/`especificacao-de-requisitos-spec.md`, `cronograma.md`/`cronograma-spec.md` e `riscos-e-mitigacoes.md`/`riscos-e-mitigacoes-spec.md` com impactos de prazo, equipe e riscos.
3. **Arquitetura:** detalhe a mudança em `../01-arquitetura/arquitetura-da-extensao.md`/`arquitetura-da-extensao-spec.md` e nas integrações relevantes (`integracoes-com-apis.md`/`integracoes-com-apis-spec.md`).
4. **Design:** descreva fluxos, estados e componentes em `../02-design/fluxos.md`/`fluxos-spec.md`, `design-geral.md`/`design-geral-spec.md` e `componentes.md`/`componentes-spec.md`.
5. **Implementação:** capture padrões em `../03-implementacao/estrutura-de-projeto.md`/`estrutura-de-projeto-spec.md` e `padroes-de-codigo.md`/`padroes-de-codigo-spec.md`.
6. **Testes:** inclua critérios e cenários em `../04-testes-e-validacao/criterios-de-aceitacao.md`/`criterios-de-aceitacao-spec.md` e `testes-end-to-end.md`/`testes-end-to-end-spec.md`.
7. **Entrega:** alinhe ambientes e pacotes em `../05-entrega-e-implantacao/ambientes-e-configuracoes.md`/`ambientes-e-configuracoes-spec.md` e `empacotamento.md`/`empacotamento-spec.md`.
8. **Governança:** registre validações em `../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`/`revisoes-com-ia-spec.md` e relacione com o `CHANGELOG/` correspondente.

### Quando surgir um requisito não funcional
1. **Catálogo:** registre o RNF neste arquivo e em `requisitos.md`, indicando tipo e métricas planejadas.
2. **Arquitetura:** detalhe restrições em `../01-arquitetura/requisitos-nao-funcionais.md`/`requisitos-nao-funcionais-spec.md` e, se necessário, em `arquitetura-da-extensao.md`/`arquitetura-da-extensao-spec.md`.
3. **Design e UX:** ajuste impactos em `../02-design/design-geral.md`/`design-geral-spec.md` e `componentes.md`/`componentes-spec.md`.
4. **Implementação e automação:** atualize `../03-implementacao/build-e-automacao.md`/`build-e-automacao-spec.md` e `estrutura-de-projeto.md`/`estrutura-de-projeto-spec.md` com requisitos técnicos.
5. **Métricas e testes:** documente indicadores em `../04-qualidade-testes/qualidade-e-metricas.md`/`qualidade-e-metricas-spec.md` e reflita critérios em `../04-testes-e-validacao/criterios-de-aceitacao.md`/`criterios-de-aceitacao-spec.md`.
6. **Entrega e operação:** ajuste `../05-entrega-e-implantacao/ambientes-e-configuracoes.md`/`ambientes-e-configuracoes-spec.md` e `publicacao-e-versionamento.md`/`publicacao-e-versionamento-spec.md`.
7. **Governança e controles:** registre evidências em `../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md`/`controle-de-qualidade-spec.md` e `auditoria-e-rastreabilidade.md`/`auditoria-e-rastreabilidade-spec.md`.

### Referências obrigatórias por requisito

| Obrigação | Documento |
| --- | --- |
| Arquitetura | [`../01-arquitetura/arquitetura-da-extensao.md`](../01-arquitetura/arquitetura-da-extensao-spec.md) |
| Design e fluxos | [`../02-design/fluxos.md`](../02-design/fluxos-spec.md) · [`../02-design/design-geral.md`](../02-design/design-geral-spec.md) |
| Componentização | [`../02-design/componentes.md`](../02-design/componentes-spec.md) |
| Planejamento | [`cronograma.md`](cronograma-spec.md) · [`riscos-e-mitigacoes.md`](riscos-e-mitigacoes-spec.md) |
| Implementação | [`../03-implementacao/estrutura-de-projeto.md`](../03-implementacao/estrutura-de-projeto-spec.md) |
| Testes | [`../04-testes-e-validacao/criterios-de-aceitacao.md`](../04-testes-e-validacao/criterios-de-aceitacao-spec.md) · [`../04-testes-e-validacao/testes-end-to-end.md`](../04-testes-e-validacao/testes-end-to-end-spec.md) |
| Métricas | [`../04-qualidade-testes/qualidade-e-metricas.md`](../04-qualidade-testes/qualidade-e-metricas-spec.md) |
| Entrega | [`../05-entrega-e-implantacao/ambientes-e-configuracoes.md`](../05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md) |
| Governança | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) |

### Checklist de encerramento

1. Item registrado aqui e no changelog.
2. Todos os arquivos base e `*-spec.md` listados acima atualizados.
3. Métricas e testes vinculados a `audit-history.md` e ao relatório gerado por `audit.yml`.
4. Comentário de auditoria publicado no PR com links para as evidências.

---

## Estrutura de classificação

1. **Requisitos Funcionais (RF)** — descrevem o comportamento esperado da plataforma App nos canais digitais, APIs e integrações climáticas.
2. **Requisitos Não Funcionais (RNF)** — abrangem desempenho, segurança, disponibilidade e experiência.
3. **Requisitos Técnicos (RT)** — tratam da arquitetura, dados, integrações e automações operacionais.
4. **Requisitos Legais e de Conformidade (RL)** — garantem aderência à LGPD, ao Banco Central (BACEN), às políticas socioambientais e aos padrões corporativos MBRA.

---

<a id="requisitos-funcionais-rf"></a>
## Requisitos Funcionais (RF)

| ID | Descrição | Fase RUP | Artefatos de Referência | Status |
| --- | --- | --- | --- | --- |
| <a id="req-001"></a>REQ-001 | Onboarding multicanal para cooperativas, compradores, parceiros logísticos e investidores com KYC/KYB verde integrado. | Elaboração | [`../00-visao/stakeholders.md`](../00-visao/stakeholders-spec.md) · [`./cronograma.md`](cronograma-spec.md#marcos-de-onboarding) | Planejado |
| <a id="req-002"></a>REQ-002 | Captura de dados cadastrais completos (organização, unidades, perfis de negócio) com trilha de auditoria e versionamento. | Construção | [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md#cadastro-de-entidades) | Em elaboração |
| <a id="req-003"></a>REQ-003 | Gestão de ativos digitais e marketplace de negociação com regras de matching, precificação dinâmica e contratos digitais. | Construção | [`../02-design/fluxos.md`](../02-design/fluxos-spec.md#fluxo-3-marketplace-de-ativos) · [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md#listagem-de-ativos) | Em elaboração |
| <a id="req-004"></a>REQ-004 | Orquestração operacional com cadastro de recursos, seguros, fluxos sugeridos e contratação de serviços via plataforma. | Construção | [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md#recurso--operacao--servico-para-integracao-gestao) | Planejado |
| <a id="req-005"></a>REQ-005 | Passaporte digital de ativos consolidando histórico, certificados, medições de qualidade e anexos legais auditáveis. | Construção | [`../99-anexos/referencias.md`](../99-anexos/referencias-spec.md) · [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md#compliance--certificados) | Planejado |
| <a id="req-006"></a>REQ-006 | Dashboards de impacto socioambiental por persona (CO₂ evitado, toneladas recicladas, renda gerada) com atualização em tempo quase real. | Transição | [`../02-design/componentes.md`](../02-design/componentes-spec.md#dashboards-de-impacto) · [`../06-governanca-tecnica-e-controle-de-qualidade/relatorios-automatizados.md`](../06-governanca-tecnica-e-controle-de-qualidade/relatorios-automatizados-spec.md) | Planejado |
| <a id="req-007"></a>REQ-007 | Produtos de negócio digitais (crédito corporativo, antecipação de recebíveis, contas remuneradas) integrados à carteira digital. | Construção | [`../00-visao/visao-do-produto.md`](../00-visao/visao-do-produto-spec.md) · [`./roadmap.md`](roadmap-spec.md#epicos-de-negocio) | Planejado |
| <a id="req-008"></a>REQ-008 | Liquidação de transações com split automático e distribuição de incentivos para parceiros e colaboradores. | Transição | [`../05-entrega-e-implantacao/publicacao-e-versionamento.md`](../05-entrega-e-implantacao/publicacao-e-versionamento-spec.md) · [`../05-entrega-e-implantacao/operacao-e-manutencao.md`](../05-entrega-e-implantacao/operacao-e-manutencao-spec.md) | Planejado |
| <a id="req-009"></a>REQ-009 | Tokenização de créditos ambientais e emissão de relatórios regulatórios (BACEN, MMA, mercados voluntários). | Transição | [`../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) | Planejado |
| <a id="req-010"></a>REQ-010 | Comunidade colaborativa com trilha de capacitação, mensagens e suporte inteligente para equipes e parceiros. | Construção | [`../06-ux-brand/diretrizes-de-ux.md`](../06-ux-brand/diretrizes-de-ux-spec.md) · [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md#niveis-de-acesso) | Planejado |
| <a id="req-031"></a>REQ-031 | Workflow de validação de crédito verde com dupla aprovação (IA + humano) para operações de maior risco. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#fluxo-colaborativo-proposto) | Proposto |
| <a id="req-032"></a>REQ-032 | Roteamento automático para analistas de negócio, financeiros e jurídicos conforme perfil da operação. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#personas-envolvidas) | Proposto |
| <a id="req-033"></a>REQ-033 | Interface colaborativa com checklists auditáveis, comentários e anexos para revisão humana. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#fluxo-colaborativo-proposto) | Proposto |
| <a id="req-034"></a>REQ-034 | Dashboard de governança mostrando SLA IA vs. humanos, pendências e métricas de impacto colaborativo. | Transição | [`../02-design/componentes.md`](../02-design/componentes-spec.md#dashboards-de-impacto) · [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#metricas-de-sucesso) | Proposto |
| <a id="req-035"></a>REQ-035 | Integração com órgãos reguladores e parceiros (BACEN, SINIR, certificadoras) com trilha completa de auditoria. | Transição | [`../01-arquitetura/integracoes-com-apis.md`](../01-arquitetura/integracoes-com-apis-spec.md) · [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#dependencias-e-riscos) | Proposto |
| <a id="req-101"></a>REQ-101 | Onboarding multicanal com login/senha, SSO (provedor corporativo), MFA opcional e aprovação administrativa. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e1--autenticação-e-acesso) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-102"></a>REQ-102 | Cadastros completos de usuários, organizações, unidades, veículos, certificados e investidores com validação documental. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e2--cadastros) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-103"></a>REQ-103 | Marketplace climático com cadastro de lotes, busca geolocalizada, chat de negociação e passaporte digital. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e3--marketplace) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-104"></a>REQ-104 | Orquestração operacional com ordens de serviço, telemetria, seguros e integração com parceiros de gestão/IoT. | Construção | [`../99-anexos/PRD_Plataforma_Template_Completo.md`](../99-anexos/PRD_Plataforma_Template_Completo.md#-e5--operações-esg-e-fiscal) · [`requisitos-plataforma-digital.md`](requisitos-plataforma-digital-spec.md#d-recurso--operações--serviço-para-integração-gestão) | Planejado |
| <a id="req-105"></a>REQ-105 | Engine de matching e precificação climática com contratos digitais e registro de propostas no passaporte digital. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e3--marketplace) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Planejado |
| <a id="req-106"></a>REQ-106 | Dashboards ESG por persona com métricas, mapas e exportação assinada para relatórios. | Transição | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) · [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e7--administração-e-governança) | Planejado |
| <a id="req-107"></a>REQ-107 | Core bancário verde com contas virtuais, ledger ESG, extratos e carteira para cooperativas/investidores. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) · [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e7--administração-e-governança) | Planejado |
| <a id="req-108"></a>REQ-108 | Liquidação financeira com escrow, split automático, hash em blockchain e trilha de auditoria. | Transição | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Planejado |
| <a id="req-109"></a>REQ-109 | Token APP Coin com emissão baseada em impacto validado, saldo em tempo real e relatórios públicos. | Transição | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e6--dominio-coin) · [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#✅-entregáveis-técnicos-globais) | Proposto |
| <a id="req-036"></a>REQ-036 | Gestão multi-perfil com aprovação administrativa, acumulação de papéis e restrição de relatórios conforme persona. | Construção | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#gestao-de-perfis-e-permissoes) · [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#niveis-de-acesso) | Planejado |
| <a id="req-046"></a>REQ-046 | Busca e filtros avançados no marketplace por tipo, preço, localização, certificação e raio sustentável. | Construção | [`../02-design/fluxos.md`](../02-design/fluxos-spec.md#fluxo-3-marketplace-de-residuos) · [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#busca-e-filtros) | Planejado |
| <a id="req-047"></a>REQ-047 | Operações de compra e venda com conta de custódia (escrow) cobrindo resíduos, produtos valorizados e créditos ambientais. | Construção | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#operacoes-com-escrow) · [`../05-entrega-e-implantacao/publicacao-e-versionamento.md`](../05-entrega-e-implantacao/publicacao-e-versionamento-spec.md) | Planejado |
| <a id="req-048"></a>REQ-048 | Transferência interna de ativos com rastreabilidade total para Millennium/Futura e vinculação ao passaporte digital. | Construção | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#transferencia-de-ativos) · [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#passaporte-digital) | Planejado |
| <a id="req-049"></a>REQ-049 | Relatórios ESG parametrizáveis com metodologia declarada, indicadores ambientais/sociais/governança e exportação multilíngue. | Transição | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#relatorios-de-sustentabilidade) · [`../06-governanca-tecnica-e-controle-de-qualidade/relatorios-automatizados.md`](../06-governanca-tecnica-e-controle-de-qualidade/relatorios-automatizados-spec.md) | Planejado |
| <a id="req-050"></a>REQ-050 | Token APP Coin como programa de recompensas ambiental com minting controlado, distribuição por persona e políticas de queima. | Construção | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#dominio-coin) · [`../00-visao/visao-do-produto.md`](../00-visao/visao-do-produto-spec.md) | Planejado |
| <a id="req-051"></a>REQ-051 | Conformidade com padrões de sustentabilidade (GRI, SASB, TCFD) na geração de relatórios ESG. | Transição | [`requisitos-banco-digital.md`](requisitos-banco-digital-spec.md#relatorios-de-sustentabilidade) · [`../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) | Planejado |
| <a id="req-451"></a>REQ-451 | Notificação transacional por e-mail (legado do projeto anterior) mantida apenas para referência histórica; depende de reavaliação de canal e stack de mensageria antes de qualquer retomada. | Construção | [`../99-anexos/MVP/plano-integration-gmail.md`](../99-anexos/MVP/plano-integration-gmail.md) · [`../01-arquitetura/integracoes-com-apis.md`](../01-arquitetura/integracoes-com-apis-spec.md) | Removido (projeto anterior) |
| <a id="req-452"></a>REQ-452 | Conteúdo de e-mail transacional com resumo de lote (nome, quantidade, unidade, valor), contatos e número da transação — mantido apenas como legado do projeto anterior até nova definição de notificações. | Construção | [`../99-anexos/MVP/plano-integration-gmail.md`](../99-anexos/MVP/plano-integration-gmail.md) · [`../06-ux-brand/diretrizes-de-ux.md`](../06-ux-brand/diretrizes-de-ux-spec.md) | Removido (projeto anterior) |
| <a id="req-453"></a>REQ-453 | Campos de e-mail em tb_fornecedor e tb_comprador com validação regex e índices — requisito herdado do projeto anterior, aguardando eventual reaproveitamento via desenho de dados atualizado. | Construção | [`../99-anexos/MVP/MODEL.md`](../99-anexos/MVP/MODEL.md) · [`../03-implementacao/estrutura-de-projeto.md`](../03-implementacao/estrutura-de-projeto-spec.md) | Pendente (revalidação do escopo) |
| <a id="req-454"></a>REQ-454 | Seeds de teste com contatos sequenciais dominio.com.br até user10@dominio.com.br — mantidos apenas para histórico do projeto anterior e desativados do escopo atual. | Construção | [`../99-anexos/MVP/plano-integration-gmail.md`](../99-anexos/MVP/plano-integration-gmail.md) | Removido (projeto anterior) |

---

<a id="requisitos-nao-funcionais-rnf"></a>
## Requisitos Não Funcionais (RNF)

| ID | Descrição | Fase RUP | Tipo | Status |
| --- | --- | --- | --- | --- |
| <a id="req-011"></a>REQ-011 | Segmentação de dados e isolamento lógico por organização, garantindo confidencialidade entre fornecedores e compradores. | Construção | Segurança | Em elaboração |
| <a id="req-012"></a>REQ-012 | Disponibilidade mínima de 99,9% nos módulos de onboarding, marketplace e liquidação financeira. | Transição | Disponibilidade | Planejado |
| <a id="req-013"></a>REQ-013 | Tempo de resposta inferior a 2 segundos para operações críticas de marketplace e consulta de carteira. | Teste | Desempenho | Planejado |
| <a id="req-014"></a>REQ-014 | Escalabilidade horizontal para suportar 50 mil usuários ativos e 10 mil transações simultâneas. | Construção | Escalabilidade | Planejado |
| <a id="req-015"></a>REQ-015 | Observabilidade com métricas ESG, rastreabilidade de lotes e alertas pró-ativos de risco operacional. | Construção | Observabilidade | Planejado |
| <a id="req-016"></a>REQ-016 | Acessibilidade AA (WCAG 2.2) nos canais web e mobile, incluindo suporte a leitores de tela e contraste reforçado. | Design | Usabilidade | Planejado |
| <a id="req-017"></a>REQ-017 | Backup e recuperação de dados com RTO máximo de 4 horas e RPO de 1 hora para dados críticos. | Construção | Continuidade | Planejado |
| <a id="req-037"></a>REQ-037 | SLA colaborativo: revisão humana concluída em até 18 horas para operações sinalizadas pelo motor de scoring. | Construção | Processo | Proposto |
| <a id="req-038"></a>REQ-038 | Proteção de dados compartilhados na revisão colaborativa com criptografia em repouso e em trânsito. | Construção | Segurança | Proposto |
| <a id="req-039"></a>REQ-039 | Latência < 2s para dashboards colaborativos, incluindo atualização de métricas IA vs. humanos. | Construção | Desempenho | Proposto |
| <a id="req-040"></a>REQ-040 | Conformidade com controles de acesso baseados em papel para equipes colaborativas multi-organização. | Governança | Governança | Proposto |
| <a id="req-200"></a>REQ-200 | Criptografia end-to-end para dados sensíveis (PII, dados financeiros) em trânsito e em repouso. | Construção | Segurança | Em elaboração |
| <a id="req-201"></a>REQ-201 | Proteção de dados com segregação por tenant, cofre de segredos, consentimentos LGPD/Open Finance e logging correlacionado. | Construção | Segurança | Em elaboração |
| <a id="req-202"></a>REQ-202 | Disponibilidade ≥ 99,9% para onboarding, marketplace e liquidação, com failover multi-região. | Transição | Disponibilidade | Planejado |
| <a id="req-203"></a>REQ-203 | Monitoramento contínuo de performance com alertas automáticos para degradação de serviços críticos. | Construção | Observabilidade | Planejado |
| <a id="req-204"></a>REQ-204 | Padrões de código, lint, testes e revisão contínua garantindo rastreabilidade e auditoria de mudanças. | Construção | Processo | Em elaboração |
| <a id="req-205"></a>REQ-205 | Observabilidade integrada (logs, métricas ESG, tracing) com alertas pró-ativos para filas colaborativas e liquidação. | Construção | Observabilidade | Em elaboração |
| <a id="req-206"></a>REQ-206 | Experiência responsiva e acessível com microcopy sustentável, suporte offline-first e consistência entre canais. | Design | Usabilidade | Planejado |

---

<a id="requisitos-tecnicos-rt"></a>
## Requisitos Técnicos (RT)

| ID | Descrição | Fase RUP | Relacionamento | Status |
| --- | --- | --- | --- | --- |
| <a id="req-018"></a>REQ-018 | Arquitetura baseada em microsserviços com barramento de eventos para KYC, marketplace e pagamentos verdes. | Elaboração | [`../01-arquitetura/arquitetura-da-extensao.md`](../01-arquitetura/arquitetura-da-extensao-spec.md) · [`../01-arquitetura/integracoes-com-apis.md`](../01-arquitetura/integracoes-com-apis-spec.md) | Em elaboração |
| <a id="req-019"></a>REQ-019 | APIs abertas para cooperativas, registradores de créditos de carbono e sistemas governamentais (SINIR, BACEN). | Construção | [`../03-implementacao/estrutura-de-projeto.md`](../03-implementacao/estrutura-de-projeto-spec.md) | Planejado |
| <a id="req-020"></a>REQ-020 | Data lake climático com pipelines ETL/ELT para consolidar dados operacionais, financeiros e ESG. | Construção | [`../01-arquitetura/requisitos-nao-funcionais.md`](../01-arquitetura/requisitos-nao-funcionais-spec.md) | Planejado |
| <a id="req-021"></a>REQ-021 | Motor de scoring socioambiental utilizando IA supervisionada com explicabilidade das decisões. | Construção | [`../03-agentes-ia/politicas-e-regras.md`](../03-agentes-ia/politicas-e-regras-spec.md) | Planejado |
| <a id="req-022"></a>REQ-022 | Infraestrutura como código (IaC) com pipelines GitOps e monitoramento contínuo em nuvem soberana. | Transição | [`../05-entrega-e-implantacao/empacotamento.md`](../05-entrega-e-implantacao/empacotamento-spec.md) · [`../05-operacao-release/setup-ambiente-codex.md`](../05-operacao-release/setup-ambiente-codex-spec.md) | Planejado |
| <a id="req-023"></a>REQ-023 | Logs e artefatos armazenados em `/docs/reports/`, com metadados de execução IA (run_id, commit, timestamp). | Governança | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md#catalogo-de-relatorios-automatizados) | Em elaboração |
| <a id="req-041"></a>REQ-041 | Camada de microserviços colaborativos para filas de revisão, checklists e notificações compartilhadas. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#backlog-incremental) | Proposto |
| <a id="req-042"></a>REQ-042 | Banco de dados particionado com trilha de auditoria específica para validação colaborativa. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#dependencias-e-riscos) | Proposto |
| <a id="req-043"></a>REQ-043 | APIs com padrão HL7 FHIR/ESG para integrar parceiros climáticos e regulatórios. | Transição | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#fluxo-colaborativo-proposto) | Proposto |
| <a id="req-044"></a>REQ-044 | Observabilidade avançada com logs correlacionados e tracing distribuído para operações colaborativas. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#metricas-de-sucesso) | Proposto |
| <a id="req-045"></a>REQ-045 | Deploy cloud-native com Kubernetes, auto-scaling e governança GitOps multi-tenant. | Transição | [`../05-entrega-e-implantacao/ambientes-e-configuracoes.md`](../05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md) | Proposto |
| <a id="req-300"></a>REQ-300 | Arquitetura de referência para bancos digitais verdes baseada em padrões abertos e cloud-first. | Elaboração | [`../01-arquitetura/arquitetura-da-extensao-spec.md`](../01-arquitetura/arquitetura-da-extensao-spec.md) | Em elaboração |
| <a id="req-301"></a>REQ-301 | Arquitetura modular em microsserviços/eventos cobrindo onboarding, marketplace, logística e liquidação. | Construção | [`../01-arquitetura/arquitetura-da-extensao-spec.md`](../01-arquitetura/arquitetura-da-extensao-spec.md) | Em elaboração |
| <a id="req-302"></a>REQ-302 | Integrações seguras com Open Finance, registradoras, SEFAZ e parceiros ESG via REST/AsyncAPI. | Construção | [`../01-arquitetura/integracoes-com-apis-spec.md`](../01-arquitetura/integracoes-com-apis-spec.md) | Em elaboração |
| <a id="req-303"></a>REQ-303 | Lakehouse climático, ETL/ELT e eventos auditáveis para consolidar dados operacionais, ESG e fiscais. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) | Planejado |
| <a id="req-304"></a>REQ-304 | Capacidade colaborativa com tickets, filas e KPIs IA vs. humanos para revisões socioambientais. | Construção | [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md#fluxo-colaborativo-proposto) · [`../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) | Em elaboração |
| <a id="req-305"></a>REQ-305 | Infraestrutura como código, pipelines GitOps, assinatura de imagens e provisionamento reproduzível. | Transição | [`../05-entrega-e-implantacao/empacotamento-spec.md`](../05-entrega-e-implantacao/empacotamento-spec.md) · [`../05-operacao-release/setup-ambiente-codex-spec.md`](../05-operacao-release/setup-ambiente-codex-spec.md) | Em elaboração |
| <a id="req-455"></a>REQ-455 | Integração com Gmail API usando OAuth2 offline com escopo gmail.send — requisito legado do projeto anterior, mantido apenas para rastreabilidade e futura decisão sobre mensageria. | Construção | [`../99-anexos/MVP/plano-integration-gmail.md`](../99-anexos/MVP/plano-integration-gmail.md) · [`../01-arquitetura/integracoes-com-apis.md`](../01-arquitetura/integracoes-com-apis-spec.md) | Removido (projeto anterior) |
| <a id="req-456"></a>REQ-456 | Logging estruturado de messageId do Gmail para auditoria — herdado do projeto anterior e atualmente fora do escopo ativo. | Construção | [`../99-anexos/MVP/plano-integration-gmail.md`](../99-anexos/MVP/plano-integration-gmail.md) · [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) | Removido (projeto anterior) |
| <a id="req-457"></a>REQ-457 | Tratamento de falhas no envio de e-mail sem bloquear confirmação de transação (REQ-GMAIL-005) — mantido apenas como referência legada até nova estratégia de notificações. | Construção | [`../99-anexos/MVP/plano-integration-gmail.md`](../99-anexos/MVP/plano-integration-gmail.md) | Removido (projeto anterior) |

---

<a id="requisitos-legais-e-de-conformidade-rl"></a>
## Requisitos Legais e de Conformidade (RL)

| ID | Descrição | Fase RUP | Base Legal | Status |
| --- | --- | --- | --- | --- |
| <a id="req-024"></a>REQ-024 | Consentimento explícito e granular para uso de dados pessoais e climáticos, com registro versionado. | Construção | LGPD Art. 7 · [`../00-visao/lgpd.md`](../00-visao/lgpd-spec.md) | Em elaboração |
| <a id="req-025"></a>REQ-025 | Termo de consentimento LGPD apresentado antes da primeira autenticação em qualquer canal. | Transição | LGPD Art. 8 · [`../06-ux-brand/diretrizes-de-ux.md`](../06-ux-brand/diretrizes-de-ux-spec.md#microcopy-de-consentimento) | Em elaboração |
| <a id="req-026"></a>REQ-026 | Proibição de envio de dados pessoais a terceiros sem autorização expressa e registro em auditoria. | Governança | LGPD Art. 9 · [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) | Em elaboração |
| <a id="req-027"></a>REQ-027 | Mecanismo de revogação imediata e exclusão de dados mediante solicitação do titular. | Transição | LGPD Art. 18 · [`../05-operacao-release/politicas-de-operacao.md`](../05-operacao-release/politicas-de-operacao-spec.md) | Planejado |
| <a id="req-028"></a>REQ-028 | Exibição permanente da política de privacidade e termos de uso em todos os canais digitais. | Construção | LGPD · BACEN Res. 4.893/2021 | Em elaboração |
| <a id="req-029"></a>REQ-029 | Definição do App (MBRA) como controlador dos dados e registro de operadores parceiros. | Governança | LGPD Art. 37 · [`../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) | Em elaboração |
| <a id="req-030"></a>REQ-030 | Conformidade com BACEN (Res. CMN 4.557/2017, 4.893/2021) e políticas ESG aplicáveis às operações financeiras. | Implantação | BACEN · PNRS · RenovaBio | Planejado |
| <a id="req-400"></a>REQ-400 | Marco legal completo para operações financeiras climáticas e tokenização de ativos ambientais. | Governança | BACEN · CVM · [`../00-visao/lgpd-spec.md`](../00-visao/lgpd-spec.md) | Planejado |
| <a id="req-401"></a>REQ-401 | Consentimento granular LGPD/Open Finance com retenção de logs e mecanismos de revogação auditáveis. | Construção | LGPD · [`../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) | Em elaboração |
| <a id="req-402"></a>REQ-402 | Conformidade fiscal/regulatória (NF-e 4.0, SEFAZ, BACEN, relatórios ESG) com evidências assinadas. | Construção | BACEN · SEFAZ · [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) | Planejado |
| <a id="req-403"></a>REQ-403 | Política de retenção e exclusão de dados pessoais conforme LGPD com controles automatizados. | Construção | LGPD Art. 16 · [`../00-visao/lgpd-spec.md`](../00-visao/lgpd-spec.md) | Planejado |
| <a id="req-404"></a>REQ-404 | Governança de acesso com RBAC/ABAC, segregação de funções, auditoria contínua e SoD. | Construção | LGPD · BACEN · [`../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) | Em elaboração |
| <a id="req-405"></a>REQ-405 | Consistência de branding APP: usar exclusivamente "APP" ou "plataforma APP" em toda interface frontend, reservando "App" apenas para futura fase Fintech/Moeda. | Implementado | [`../06-ux-brand/identidades-visuais-spec.md`](../06-ux-brand/identidades-visuais-spec.md) · [`AGENTS.md`](../../AGENTS.md#política-de-branding-e-terminologia) | ✅ Concluído |
| <a id="req-052"></a>REQ-052 | Validação de ativos climáticos com certificadoras reconhecidas e anexação obrigatória de documentos comprobatórios. | Construção | Políticas internas MBRA · Verra · Gold Standard | Planejado |
| <a id="req-053"></a>REQ-053 | Conformidade fiscal com emissão integrada de NF-e/NFS-e, cálculo de tributos, extratos auditáveis e exportação SPED/EFD. | Construção | Legislação tributária brasileira · SEFAZ · ISS municipal | Planejado |
| <a id="req-054"></a>REQ-054 | Auditoria contínua de transações financeiras com detecção de fraudes e análise comportamental. | Construção | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) | Planejado |
| <a id="req-055"></a>REQ-055 | Integração com sistemas legados bancários (Core Banking, Swift, TEF) mantendo compatibilidade. | Construção | [`../01-arquitetura/integracoes-com-apis-spec.md`](../01-arquitetura/integracoes-com-apis-spec.md) | Planejado |
| <a id="req-110"></a>REQ-110 | Autenticação multifatorial opcional (SMS/E-mail/App), SSO com provedor de identidade corporativo (OIDC/SAML), gestão de sessões OIDC, logout automático por inatividade. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e1--autenticação-e-acesso) · [`../99-anexos/inventario-requisitos-m1.md`](../99-anexos/inventario-requisitos-m1.md#32-épico-e2---cadastros) | Em elaboração |
| <a id="req-111"></a>REQ-111 | Cadastro completo de usuários com CPF, nome, telefone, perfil múltiplo, consentimento LGPD, validação documental e KYC automatizado. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-cadastro-de-usuário) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-112"></a>REQ-112 | Cadastro de empresas/organizações com CNPJ, razão social, CNAE, regime tributário, endereço fiscal, conta bancária, classificação por subtipo. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-cadastro-de-empresa) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-113"></a>REQ-113 | Cadastro de unidades operacionais com endereço completo, coordenadas GPS obrigatórias, capacidade armazenagem, horário operação, tipologias manipuladas. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-unidade-operacional) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-114"></a>REQ-114 | Cadastro de veículos e certificados com frota (placa, capacidade, tipo), seguros vigentes, certificações ambientais (emissor, validade, documentos). | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-veículos) · [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-certificados) | Em elaboração |
| <a id="req-115"></a>REQ-115 | Cadastro de parceiros e investidores com parceiros logísticos, cooperativas, investidores cadastrados/interessados, formulário de contato, verificação KYB. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-parceiros) · [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-investidores) | Em elaboração |
| <a id="req-116"></a>REQ-116 | Engine de precificação dinâmica com algoritmo baseado em oferta/demanda, localização (raio 200km), qualidade, certificação, histórico de preços. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e3--marketplace) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-117"></a>REQ-117 | Sistema de escrow avançado com conta de custódia por transação, liberação automatizada pós-entrega, split de comissões configurável, conciliação bancária. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-118"></a>REQ-118 | Integração com múltiplos gateways de pagamento homologados, PIX, cartão, boleto, contas virtuais por usuário, webhooks de status. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) · [`../99-anexos/inventario-requisitos-m1.md`](../99-anexos/inventario-requisitos-m1.md#34-épico-e4---pagamentos-e-escrow) | Em elaboração |
| <a id="req-119"></a>REQ-119 | Rastreamento GPS e logística com rastreamento em tempo real, telemetria de veículos, atualizações a cada 30min, comprovantes de entrega, integração TMS. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-120"></a>REQ-120 | Emissão fiscal automática com integração SEFAZ, emissão NF-e/NFS-e automática, cálculo de tributos, exportação XML, status SEFAZ em tempo real. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#fiscal) · [`../99-anexos/inventario-requisitos-m1.md`](../99-anexos/inventario-requisitos-m1.md#35-épico-e5---logística-esg-e-fiscal) | Em elaboração |
| <a id="req-121"></a>REQ-121 | Cálculos ESG e CO₂ com metodologias padrão (IPCC, GHG Protocol), cálculo automático tCO₂ evitado, relatórios de impacto socioambiental, exportação assinada. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#esg) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Em elaboração |
| <a id="req-122"></a>REQ-122 | Smart contracts e blockchain com smart contracts para APP Coin, integração Polygon, minting controlado, burning programável, lastro ambiental verificável, APIs públicas. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e6--dominio-coin) · [`../99-anexos/Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) | Proposto |
| <a id="req-123"></a>REQ-123 | Painel administrativo unificado com dashboard de métricas em tempo real, gestão de usuários/permissões, logs de auditoria, KPIs ESG, exportações regulatórias. | Construção | [`../99-anexos/PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e7--administração-e-governância) · [`../99-anexos/inventario-requisitos-m1.md`](../99-anexos/inventario-requisitos-m1.md#37-épico-e7---administração) | Em elaboração |
| <a id="req-124"></a>REQ-124 | Fluxo legado de onboarding via e-mail (projeto anterior) mantido apenas para rastreabilidade: cadastro inicial com status pendente, envio automático de e-mail transacional HTML com link único parametrizado, expiração de token em 24h, página dedicada de ativação com estados visuais, reenvio controlado (máximo 3 por 24h) e auditoria completa. | Construção | [`../99-anexos/MVP/plano-onboarding-email.md`](../99-anexos/MVP/plano-onboarding-email.md) · [`../06-ux-brand/diretrizes-de-ux.md`](../06-ux-brand/diretrizes-de-ux-spec.md) · [`CHANGELOG/20251109142100.md`](/CHANGELOG/20251109142100.md) | Pendente (revalidação do escopo) |

---

## Requisitos de Geolocalização (serviço de mapas corporativo)

### REQ-406: Cadastro de localização geográfica em produtos
**Tipo:** Funcional  
**Prioridade:** Alta  
**Status:** ✅ Implementado (backend)  
**Descrição:** Usuários devem poder cadastrar a localização geográfica ao publicar produtos, utilizando serviço de mapas corporativo para validação de endereços.
**Critérios de aceite:**
- Campo de endereço com autocomplete integrado ao catálogo de lugares da plataforma de mapas
- Validação server-side de coordenadas via API de geocodificação homologada
- Armazenamento de `formatted_address`, `place_id`, `latitude`, `longitude` e `geocoding_accuracy`
- Compatibilidade retroativa com campo `localizacao` existente  
**Relacionado:** `CHANGELOG/20251105142535.md` · `app/db/init/migrations/004_add_geospatial_fields.sql`

### REQ-407: Filtros geoespaciais em listagem de produtos
**Tipo:** Funcional  
**Prioridade:** Alta  
**Status:** ✅ Implementado (backend)  
**Descrição:** Sistema deve suportar filtros por bounds (viewport do mapa) e busca radial (near + radius) para queries eficientes de localização.  
**Critérios de aceite:**
- Endpoint `GET /offers?bounds=swLat,swLng,neLat,neLng` filtrando por bounding box
- Endpoint `GET /offers?near=lat,lng&radius=5000` filtrando por proximidade em metros
- Performance < 100ms para 10k registros com índices GIST
- Queries usando PostGIS (`ST_MakeEnvelope`, `ST_DWithin`)  
**Relacionado:** `app/apisrc/modules/lote-residuo/lote-residuo.service.ts`

### REQ-408: Mapa interativo com markers de produtos
**Tipo:** Funcional  
**Prioridade:** Alta  
**Status:** ⏳ Pendente (frontend)  
**Descrição:** Interface deve exibir mapa interativo com markers dos produtos disponíveis, permitindo visualização e seleção direta pelo mapa.  
**Critérios de aceite:**
- Integração com SDK JavaScript do serviço de mapas
- Markers clicáveis abrindo detalhes do produto
- Sincronização entre lista e mapa (hover destaca marker)
- Layout responsivo (mapa fixo desktop, colapsável mobile)
- Conformidade com regras UX (603010, 4x2, 8pt Grid)  
**Relacionado:** `docs/rup/06-ux-brand/diretrizes-de-ux.md` · `docs/rup/99-anexos/MVP/plano-integracao-google-maps.md`

### REQ-409: Fluxo de compra integrado ao mapa
**Tipo:** Funcional  
**Prioridade:** Média  
**Status:** ⏳ Pendente (frontend)  
**Descrição:** Seleção de produto pelo mapa deve disparar o mesmo fluxo de compra da listagem, mantendo consistência de estado global.  
**Critérios de aceite:**
- Click em marker abre modal ou card lateral com detalhes
- Botão "Comprar" segue mesmo fluxo da listagem
- Estado global mantido (Zustand/Redux)
- Transição suave entre mapa e checkout  
**Relacionado:** `app/ui/src/features/residues/`

### REQ-410: Auditoria de dados de geolocalização
**Tipo:** Não Funcional (Conformidade)  
**Prioridade:** Alta  
**Status:** ✅ Implementado  
**Descrição:** Sistema deve armazenar `place_id`, `formatted_address` e `geocoding_accuracy` para auditoria e validação futura.  
**Critérios de aceite:**
- Todos os campos geoespaciais persistidos no banco
- Rastreabilidade de fonte dos dados (API de geocodificação corporativa)

> Nomenclatura neutralizada para eliminar marcas legadas e manter linguagem genérica aprovada pelo manual de marca.
- Políticas LGPD para dados de localização documentadas
- Trigger automático para popular `location_geog` a partir de `localizacao`  
**Relacionado:** `docs/rup/00-visao/lgpd.md` (pendente atualização)

### REQ-411: Performance de queries espaciais
**Tipo:** Não Funcional (Performance)  
**Prioridade:** Alta  
**Status:** ✅ Implementado  
**Descrição:** Queries geoespaciais devem executar em menos de 100ms para datasets de até 10k registros.  
**Critérios de aceite:**
- Índice GIST criado em `location_geog`
- Tipo `GEOGRAPHY(POINT, 4326)` para cálculos precisos
- Benchmark validado com 10k registros simulados
- Monitoramento via logs de performance  
**Relacionado:** `app/db/init/migrations/004_add_geospatial_fields.sql`

---

## Rastreabilidade complementar

- Matriz de riscos: [`riscos-e-mitigacoes.md`](riscos-e-mitigacoes-spec.md)
- Governança técnica: [`../06-governanca-tecnica-e-controle-de-qualidade/`](../06-governanca-tecnica-e-controle-de-qualidade/)
- Planos de produto e impacto: [`./roadmap.md`](roadmap-spec.md) · [`../02-design/fluxos.md`](../02-design/fluxos-spec.md)
- Relatórios de auditoria: [`../../docs/reports/`](../../docs/reports/)

---

**Responsável:** Ricardo Malnati — Engenheiro de Software  \\
**Organização:** Millennium Brasil (MBRA)  \\
**Documento:** Catálogo de Requisitos RUP  \\
**Status:** Ativo e sob revisão contínua

[Voltar ao índice](README-spec.md)
