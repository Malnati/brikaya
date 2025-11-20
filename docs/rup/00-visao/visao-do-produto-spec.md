<!-- docs/rup/00-visao/visao-do-produto.md -->
# Visão do Produto — App — CLImate INvestment

> Base: [./visao-do-produto.md](./visao-do-produto.md)


Para impulsionar a economia circular, o App entrega uma **plataforma bancária digital multicanal** conectada às APIs corporativas da MBRA. O ecossistema registra fluxos de resíduos desde a coleta até a reindustrialização, calcula indicadores de descarbonização e converte resultados socioambientais em valor financeiro compartilhado. Cada módulo foi desenhado a partir dos requisitos de negócio consolidados nos anexos regulatórios.

## Componentes de plataforma
- **Gestão de perfis e acesso:** painel unificado que cadastra fornecedores, compradores, parceiros e investidores, aplica KYC/KYB automatizado ([REQ-111](../02-planejamento/requisitos-spec.md#req-111), [REQ-112](../02-planejamento/requisitos-spec.md#req-112)), oferece autenticação multifatorial e SSO ([REQ-110](../02-planejamento/requisitos-spec.md#req-110)), controla status de verificação e libera permissões específicas por perfil ([REQ-115](../02-planejamento/requisitos-spec.md#req-115)).
- **Marketplace de resíduos:** criação de lotes com dados completos incluindo coordenadas GPS obrigatórias ([REQ-113](../02-planejamento/requisitos-spec.md#req-113)), engine de precificação dinâmica baseada em localização e qualidade ([REQ-116](../02-planejamento/requisitos-spec.md#req-116)), busca geolocalizada com raio até 200km, e negociação assistida com conta de custódia (escrow) avançada ([REQ-117](../02-planejamento/requisitos-spec.md#req-117)).
- **Passaporte digital e rastreabilidade:** histórico imutável de transações com rastreamento GPS em tempo real ([REQ-119](../02-planejamento/requisitos-spec.md#req-119)), evidências documentais, laudos e registros de cadeia logística acessíveis a administradores e usuários autorizados, incluindo certificações ambientais ([REQ-114](../02-planejamento/requisitos-spec.md#req-114)).
- **Motor financeiro e fiscal:** liquidação com split automático, integração com múltiplos gateways ([REQ-118](../02-planejamento/requisitos-spec.md#req-118)), emissão fiscal automática via SEFAZ ([REQ-120](../02-planejamento/requisitos-spec.md#req-120)), cálculo de comissionamento, controle de CFOP e exportação para ERPs e obrigações fiscais.
- **Token APP Coin:** smart contracts e blockchain integrado ([REQ-122](../02-planejamento/requisitos-spec.md#req-122)), recompensa transações sustentáveis com cálculos ESG automáticos ([REQ-121](../02-planejamento/requisitos-spec.md#req-121)), oferece descontos em taxas, integra lastro ambiental auditável e prepara governança futura via DAO.
- **Painel administrativo:** dashboard unificado com métricas em tempo real, gestão de usuários/permissões e KPIs ESG ([REQ-123](../02-planejamento/requisitos-spec.md#req-123)).

## Perfis e jornadas prioritárias
- **Fornecedor de resíduo:** atualiza cadastro, anexa licenças, publica lotes, negocia entregas, acompanha vendas e avalia compradores.
- **Comprador de resíduo ou produto reciclado:** pesquisa ativos por raio de 200 km, fecha pedidos com pagamento seguro, monitora impacto adquirido e qualifica fornecedores.
- **Parceiro logístico ou técnico:** oferece serviços de coleta, transporte, certificação ou mão de obra e é vinculado a transações como prestador homologado.
- **Investidor:** consulta relatórios de mercado, recebe alertas de oportunidades, participa de rodadas de coINvestmento e, quando não verificado, envia intenção via formulário dedicado.
- **Administradores MBRA:** aprovam cadastros, auditam transações, gerem permissões e monitoram indicadores ESG e fiscais.

## Indicadores e transparência
- Relatórios ESG com cálculos padronizados (IPCC, GHG Protocol, ISO 14064) exibindo CO₂ compensado, resíduos desviados, empregos apoiados e certificações vigentes.
- Relatórios fiscais e logs imutáveis com hash/QR-code, exportáveis em PDF, CSV e layouts SPED, garantindo conformidade e rastreabilidade.
- Painéis públicos com emissões evitadas, renda distribuída e participação comunitária, respeitando consentimentos LGPD e agregando dados sensíveis.

Essa visão orienta as fases seguintes do RUP, garantindo que arquitetura, design, testes e implantação mantenham aderência aos requisitos de negócio e ao propósito climático do App.

[Voltar à Visão](./README-spec.md)
