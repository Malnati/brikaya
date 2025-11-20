<!-- docs/rup/02-planejamento/requisitos-banco-digital-spec.md -->

> Base: [./requisitos-banco-digital.md](./requisitos-banco-digital.md)

# Inventário de Requisitos de Negócio — App Verde

Este inventário consolida o conteúdo histórico recebido da equipe de negócios ("Requisitos App") em um formato estruturado.
Os tópicos abaixo preservam o escopo original, eliminam redundâncias e criam âncoras para rastrear requisitos no catálogo evolutivo (`requisitos-spec.md`).

---

## 1. Usuários e acesso

<a id="cadastro-de-entidades"></a>
<a id="requisitos-de-usuarios-e-acesso"></a>
### 1.1 Cadastro de entidades e usuários

O onboarding precisa separar dados por entidades, mantendo trilha de auditoria:

- **Organização / Usuário**
  - Perfis contemplados: fornecedor de resíduo (setor público, ONG, agricultor familiar, agricultor, agroindústria, indústria por CNAE), comprador de resíduo (setor público, reciclador, ONG, empresa de valorização, indústria por CNAE), comprador de produto reciclado (setor público), parceiro (logística, cooperativa, ONG, serviços de mão de obra, outros serviços), investidor (cadastrado ou interessado via formulário).
  - Campos obrigatórios: `id (uuid)`, `tipo_pessoa (PJ/PF/MEI/Setor público)`, razão social/nome fantasia/nome completo, CNPJ/CPF e inscrição estadual (quando aplicável), CNAE principal, contato principal (nome, cargo, e-mail, telefones com consentimento WhatsApp), conta bancária verificada (IBAN/BR) e `gateway_id`, regime tributário, rating interno, status de verificação (não verificado / em validação / verificado), datas de cadastro e último acesso.
- **Localização / Unidade operacional**: `unidade_id`, endereço completo, coordenadas GPS obrigatórias, horários e janelas de coleta, capacidade de armazenagem (kg/m³), tipologias manipuladas.
- **Lote de Resíduo (oferta/listing)**<a id="lote-de-residuo-ofertalisting---entidade-principal-do-marketplace"></a>: `lote_id`, `produtor_id`, título curto e descrição detalhada do processo, categoria e subcategoria padronizada de resíduo, quantidade + unidade (kg, t, m³, litros), janela de disponibilidade, condição e percentual de contaminação, granulometria, embalagem, armazenamento, indicadores de qualidade e certificados anexados (PDFs), mídia (fotos e vídeo curto opcional), documentação (laudos, FISPQ, NF), preço unitário + moeda + MOQ, local de coleta e coordenadas redundantes, condições logísticas, contrato/termo de responsabilidade, vínculo com passaporte digital, score de verificação, seguros associados.
- **Veículos / Logística / Transportador**<a id="veiculo--logistica--transportador-para-integracao-tms"></a>: cadastro de frota (placa, capacidade, tipo), seguros, histórico de rotas e disponibilidade; quando o fornecedor não possui transporte, a plataforma indica parceiros.
- **Compliance & Certificados**<a id="compliance--certificados"></a>: identificação do certificado, emissor, validade, digitalização, licenças ambientais, selos de terceiros (Verra, Gold Standard), com recomendações para quem não possuir certificação.

<a id="gestao-de-perfis-e-permissoes"></a>
### 1.2 Gestão de perfis e permissões

- Usuários podem acumular múltiplos perfis (ex.: agroindústria que é fornecedora e compradora).
- Todos os perfis passam por KYC/KYB com status padronizados (não verificado → em validação → verificado).
- Somente administradores aprovam cadastros, auditam transações e gerem permissões.
- Relatórios ESG avançados ficam restritos a compradores, parceiros e investidores autorizados.

<a id="niveis-de-acesso"></a>
### 1.3 Níveis de acesso por persona

| Persona | Subtipos principais | Ações permitidas | Restrições |
| --- | --- | --- | --- |
| **Fornecedor de Resíduo** | Setor público, ONG, agricultor familiar, agricultor, agroindústria, indústria por CNAE | Gerir perfil e documentos, publicar/editar/remover lotes, enviar laudos/FISPQ/NF, acompanhar vendas e histórico, acessar relatórios de impacto, avaliar compradores. | Não compra resíduos nem acessa relatórios de mercado avançados. |
| **Comprador de Resíduo** | Setor público, reciclador, ONG, empresa de valorização, indústria por CNAE | Gerir perfil, pesquisar/filtrar resíduos, negociar (chat/proposta/pedido), efetuar pedidos e pagamentos (escrow), acessar relatórios básicos de impacto, avaliar fornecedores. | Não cria anúncios (salvo com perfil de fornecedor vinculado). |
| **Comprador de Produto Reciclado** | Setor público | Cadastrar perfil institucional, comprar produtos reciclados, consultar relatórios de consumo sustentável. | Não compra resíduos brutos, não vende, não acessa relatórios avançados de mercado. |
| **Parceiro** | Logística, cooperativa, ONG, serviços de mão de obra, laboratórios/certificadoras | Cadastrar serviços, ofertar logística/coleta/armazenagem, ser vinculado a transações, receber avaliações. | Não cria ou compra anúncios diretamente. |
| **Investidor** | Cadastrado verificado, interessado (formulário) | Cadastrado: acessar relatórios avançados, oportunidades e rodadas de coINvestmento, criar alertas exclusivos. Interessado: preencher formulário com dados básicos e ticket estimado; administrador recebe notificação. | Interessado não acessa a plataforma completa. |

---

## 2. Marketplace e transações

<a id="listagem-de-ativos"></a>
### 2.1 Listagem de ativos

Produtores listam ativos (resíduos, produtos reciclados, créditos) com todos os dados do cadastro, garantindo rastreabilidade do processo de geração.

<a id="busca-e-filtros"></a>
### 2.2 Busca e filtros avançados

- Filtros por tipo de ativo, preço, localização, certificação, tipologias e demais campos do cadastro.
- Usuário pode restringir o espectro da busca (ex.: raio de 200 km) conforme suas necessidades operacionais.

<a id="operacoes-com-escrow"></a>
### 2.3 Operações de compra e venda com escrow

- Fluxo de transação transparente com conta de custódia (escrow) para resíduos, resíduos valorizados e créditos ambientais (APP Coin).
- Engenharias financeira e tributária definem comissões sobre venda, compra, logística e seguros.
- Necessidade de consulta fiscal para definir percentuais e natureza das taxas.

<a id="transferencia-de-ativos"></a>
### 2.4 Transferência segura de ativos

- Plataforma permite transferir ativos entre contas internas, respeitando regras operacionais entre Millennium e Futura.
- Cada usuário acessa seu histórico completo; a Futura HQ possui acesso total à rastreabilidade (heatmaps, BI, passaporte digital).

<a id="passaporte-digital"></a>
### 2.5 Passaporte digital

- Habilita histórico imutável de transações, certificados, laudos e documentos legais.
- Utilizado para auditorias, compliance e geração de relatórios regulatórios.

---

## 3. Conformidade e auditoria

<a id="validacao-de-ativos-certificados"></a>
### 3.1 Validação de ativos certificados

- Créditos de carbono exigem validação por terceiros reconhecidos (Verra, Gold Standard, CERCARBONO etc.).
- Plataforma requer upload/integração dos certificados e documentos comprobatórios.

<a id="auditoria-de-transacoes"></a>
### 3.2 Auditoria de transações

- Registro obrigatório de data, hora, partes, quantidade e valor para todas as operações.
- Logs suportam cálculos de comissionamento e verificação de compliance.

<a id="relatorios-de-sustentabilidade"></a>
### 3.3 Relatórios de sustentabilidade

- Relatórios por transação, mensais, trimestrais ou anuais conforme necessidade do comprador.
- Estrutura mínima:
  - **Dados da empresa compradora**: razão social, CNPJ, setor, período de referência.
  - **Resumo executivo**: total de créditos (tCO₂e), resíduos compensados (toneladas), percentual de neutralização, principais fornecedores.
  - **Detalhamento das transações**: tabela com ID, data, tipo de ativo, quantidade, origem/certificação, valor (quando permitido), status de certificação.
  - **Indicadores ESG**: ambientais (tCO₂e, toneladas desviadas, recursos preservados), sociais (apoio a cooperativas, empregos, impacto local), governança (certificações, conformidade PNRS, hash de auditoria).
  - **Visualizações**: gráficos de barras/pizza, séries temporais, mapa geográfico.
- Metodologias aceitas: IPCC Guidelines, GHG Protocol, ISO 14064 (explicitar em cada relatório).
- Relatórios disponíveis em português e inglês, exportáveis para PDF e Excel/CSV, compatíveis com frameworks SASB, GRI e CDP.
- Cada relatório recebe hash/QR code verificável e assinatura digital ou verificação blockchain para garantir imutabilidade.
- Acesso restrito a empresa compradora, administradores e investidores autorizados; Futura HQ possui visão completa.

---

## 4. Conformidade fiscal

<a id="cadastro-fiscal-obrigatorio"></a>
### 4.1 Cadastro fiscal obrigatório

- Fornecedores e compradores informam CNPJ/CPF, inscrições estadual/municipal, regime tributário e domicílio fiscal durante o onboarding.

<a id="emissao-de-documentos-fiscais"></a>
### 4.2 Emissão de documentos fiscais

- Cada transação gera nota fiscal correspondente:
  - NF-e para venda de resíduos/produtos.
  - NFS-e para prestação de serviços logísticos.
  - NFS-e da plataforma para taxas de intermediação.
- Integração com SEFAZ (NF-e) e sistemas municipais (NFS-e).
- Definição de CFOP por tipo de resíduo/serviço (ex.: 5.102/6.102 para resíduos recicláveis).
- Cálculo e informação de tributos (ICMS, ISS, PIS/COFINS, IRRF) considerando responsabilidade da plataforma.

<a id="relatorios-e-alertas-fiscais"></a>
### 4.3 Relatórios, extratos e alertas fiscais

- Extratos com data, ID da transação, partes, quantidades, valores, impostos destacados e notas vinculadas (PDF/Excel/CSV).
- Resumos periódicos (mensal, trimestral, anual) por tipo de operação, com bases de cálculo e impostos.
- Alertas automáticos para prazos de NF, vencimento de tributos e limites regulatórios (ex.: desenquadramento de MEI).

<a id="integracoes-e-auditoria-fiscal"></a>
### 4.4 Integrações e auditoria fiscal

- Integrações automáticas: SEFAZ, prefeituras, conciliação bancária.
- Logs imutáveis com data/hora, usuário e operação; hash de extratos/notas em blockchain ou sistema interno.
- Exportação para contabilidade (SPED Fiscal, EFD-Contribuições) e APIs com ERPs dos usuários.

---

## 5. Negócios, monetização e token APP Coin

<a id="modelo-de-receita"></a>
### 5.1 Modelo de receita da plataforma

- Cobrança de comissionamento sobre vendas, compras, logística e seguros (percentuais a definir).
- Comercialização de espaços na plataforma para patrocinadores e parceiros mantenedores.

<a id="fundo-garantidor"></a>
### 5.2 Fundo garantidor (Fase 2)

- Arquitetura deve prever módulo de fundo garantidor com análise de risco e liberação de microcrédito.
- Detalhamento ocorrerá em fase específica.

<a id="diversificacao-de-produtos"></a>
### 5.3 Diversificação de produtos (Fase 3)

- Flexibilidade para adicionar produtos financeiros (conta corrente com cartão, seguros, financiamentos) sem grandes reestruturações.

<a id="dominio-coin"></a>
### 5.4 APP Coin — token de recompensa ambiental

- **Conceito**: token digital de utilidade lastreado em iniciativas ambientais (biochar, áreas preservadas, recuperação de solos).
- **Emissão**: smart contract em blockchain com suprimento controlado (máximo fixo ou emissão atrelada ao volume de transações).
- **Distribuição**: fornecedores recebem tokens por vendas, compradores por operar dentro do raio sustentável (≤200 km), investidores podem adquirir tokens para financiar projetos.
- **Uso**: desconto em taxas, troca por créditos ambientais, marketplace de impacto (produtos/serviços verdes), recompensas sociais para ONGs/cooperativas.
- **Burning**: queima de tokens usados em projetos ambientais para gerar escassez e valor.
- **Governança**: critérios definidos pela plataforma, com possibilidade futura de DAO para votação dos detentores.
- **Riscos e cuidados**: alinhamento regulatório (evitar caracterização como valor mobiliário), gestão de volatilidade, seleção de blockchain de baixo custo/energia, transparência total sobre o lastro.
- **Benchmark**: Toucan Protocol (Polygon), Moss.Earth (MCO2), Verra+Celo, SolarCoin, Plastic Bank Token.

---

Este inventário orienta a atualização contínua do catálogo de requisitos, planejamento, arquitetura e governança do App.
