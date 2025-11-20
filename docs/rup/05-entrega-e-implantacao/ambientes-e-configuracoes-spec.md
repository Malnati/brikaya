<!-- docs/rup/05-entrega-e-implantacao/ambientes-e-configuracoes.md -->
# Ambientes e Configurações

> Base: [./ambientes-e-configuracoes.md](./ambientes-e-configuracoes.md)
> Referências correlatas: [Arquitetura da Plataforma](../01-arquitetura/arquitetura-da-extensao-spec.md) · [Requisitos do App](../02-planejamento/requisitos-spec.md) · [Capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

## Objetivo
Documentar parâmetros de implantação, variáveis sensíveis e políticas de provisionamento dos ambientes do **App — CLImate INvestment**, garantindo continuidade entre onboarding verde, marketplace de resíduos e liquidação financeira. Este artefato mantém a rastreabilidade com [REQ-101](../02-planejamento/requisitos-spec.md#req-101), [REQ-103](../02-planejamento/requisitos-spec.md#req-103), [REQ-108](../02-planejamento/requisitos-spec.md#req-108), [REQ-201](../02-planejamento/requisitos-spec.md#req-201) e [REQ-305](../02-planejamento/requisitos-spec.md#req-305); na herança histórica, cobre os legados `REQ-001`, `REQ-004`, `REQ-007`, `REQ-014`, `REQ-020`.

### Requisitos derivados dos anexos
| Requisito | Cenário operacional | Fonte nos anexos |
| --- | --- | --- |
| [REQ-101](../02-planejamento/requisitos-spec.md#req-101) | Onboarding com SSO e MFA exige separar domínios de autenticação e logs para rastrear aprovações administrativas. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e1--autenticação-e-acesso) |
| [REQ-102](../02-planejamento/requisitos-spec.md#req-102) | Cadastros de organizações, unidades e veículos demandam variáveis específicas por tenant (ex.: `IMPACT_DATASET`, `COLLAB_APPROVAL_ENDPOINT`). | [`Requisitos_Banco_Digital.txt`](../99-anexos/Requisitos_Banco_Digital.txt) |
| [REQ-104](../02-planejamento/requisitos-spec.md#req-104) | Orquestração logística com telemetria obriga provisionar endpoints segregados para rotas e seguros. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e5--logística-esg-e-fiscal) |
| [REQ-108](../02-planejamento/requisitos-spec.md#req-108) | Liquidação com escrow e split requer variáveis de gateway, hash blockchain e isolamento de payloads sensíveis. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) |
| [REQ-201](../02-planejamento/requisitos-spec.md#req-201) · [REQ-404](../02-planejamento/requisitos-spec.md#req-404) | Controles RBAC/ABAC precisam de cofres e registros de auditoria alinhados aos níveis N0–N5. | [`sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) |
| [REQ-305](../02-planejamento/requisitos-spec.md#req-305) | Pipelines GitOps e IaC devem replicar ambientes DEV/HML/PRD com flags colaborativas. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#✅-entregáveis-técnicos-globais) |

---

## Diretrizes de atualização
- Sincronize este arquivo sempre que ambientes, domínios ou variáveis mudarem por força de novos requisitos (`REQ-###`) ou riscos identificados em [`riscos-e-mitigacoes-spec.md`](../02-planejamento/riscos-e-mitigacoes-spec.md).
- Registre alterações relevantes no [`CHANGELOG`](../../CHANGELOG) e anexe evidências em `docs/checklists/` conforme a governança descrita em [`auditoria-e-rastreabilidade-spec.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md).
- Ao introduzir features que dependem de validação humana (colaboração descrita em [capacidade-diagnostico-colaborativo-spec.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)), adicione notas explícitas indicando como os ambientes isolam filas colaborativas e preservam indicadores (legados `REQ-031`–`REQ-035`).

---

## Ambientes oficiais
| Ambiente | Propósito | Domínios/APIs principais | Observações operacionais |
| --- | --- | --- | --- |
| DEV | Desenvolvimento integrado entre squads de produtos, compliance e SRE. | `https://app-dev.dominio.com.br` (web), `https://api-dev.dominio.com.br` (API), `https://hub-dev.dominio.com.br` (Open Finance). | Permite injetar dados sintéticos, mocks de parceiros e feature flags colaborativas. Mantém equivalência com legados `REQ-001`, `REQ-005` ao validar onboarding e uploads de passaportes. |
| HML | Homologação regulatória e testes integrados com parceiros externos. | `https://app-hml.dominio.com.br`, `https://api-hml.dominio.com.br`, `https://hub-hml.dominio.com.br`. | Acesso restrito via VPN/mTLS, dados mascarados e trilha de auditoria para aprovações humanas (legados `REQ-007`, `REQ-033`). Monitora SLAs de [REQ-202](../02-planejamento/requisitos-spec.md#req-202). |
| PRD | Operação com cooperativas, compradores e investidores. | `https://app.dominio.com.br`, `https://api.dominio.com.br`, `https://hub.dominio.com.br`. | Disponibilidade ≥99,9% (REQ-202), com replicação multi-região e coleta de métricas ESG (legados `REQ-015`, `REQ-034`). |

> **Nota colaborativa:** toda fila que exigir revisão humana deve fornecer `collaboration_ticket_id` em payloads e dashboards, garantindo coexistência entre IA socioambiental (REQ-304) e especialistas. Reforçar equivalência com legados `REQ-031`–`REQ-035` ao atualizar pipelines.

## Variáveis críticas - Atualizadas M1

### Autenticação e SSO ([REQ-110](../02-planejamento/requisitos-spec.md#req-110))
- `SSO_CLIENT_ID` / `SSO_CLIENT_SECRET` — credenciais do provedor de identidade corporativo (OIDC/SAML)
- `IDP_DISCOVERY_URL` — endpoint de descoberta OpenID Connect autorizado
- `MFA_SMS_PROVIDER` — provedor SMS homologado para MFA
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — chaves para tokens JWT/OIDC
- `SESSION_TIMEOUT` — tempo de logout automático (padrão: 30min)

### Cadastros e Geolocalização ([REQ-111](../02-planejamento/requisitos-spec.md#req-111) a [REQ-115](../02-planejamento/requisitos-spec.md#req-115))
- `KYC_PROVIDER_URL` — serviço KYC automatizado homologado
- `GEOLOCATION_API_KEY` — serviço corporativo de mapas/geocodificação
- `CNPJ_VALIDATION_URL` — API Receita Federal para validação CNPJ
- `CEP_LOOKUP_URL` — provedor de CEP aprovado
- `DOCUMENT_STORAGE_BUCKET` — bucket de armazenamento para documentos anexados

### Marketplace e Precificação ([REQ-116](../02-planejamento/requisitos-spec.md#req-116))
- `PRICING_ENGINE_URL` — Microserviço de precificação dinâmica
- `SEARCH_RADIUS_KM` — Raio busca geolocalizada (padrão: 200km)
- `MATCHING_ALGORITHM` — Algoritmo matching (cosine, euclidean)
- `NEGOTIATION_WEBHOOK_URL` — Webhook para chat de negociação
- `CONTRACT_TEMPLATE_PATH` — Templates contratos digitais

### Pagamentos e Escrow ([REQ-117](../02-planejamento/requisitos-spec.md#req-117), [REQ-118](../02-planejamento/requisitos-spec.md#req-118))
- `PAYMENT_GATEWAY_KEY` — credencial do gateway de pagamento homologado
- `PIX_KEY_DICT_URL` — SPI/BACEN para chaves PIX
- `ESCROW_BANK_ACCOUNT` — conta bancária para custódia
- `SPLIT_PLATFORM_FEE` — % taxa plataforma (padrão: 2.5%)
- `VIRTUAL_ACCOUNT_PROVIDER` — provedor contas virtuais

### Logística GPS ([REQ-119](../02-planejamento/requisitos-spec.md#req-119))
- `GPS_TRACKING_INTERVAL` — intervalo telemetria (padrão: 30min)
- `TMS_INTEGRATION_URL` — sistema TMS logístico
- `ROUTE_OPTIMIZATION_API` — serviço de rotas e direções aprovado
- `DELIVERY_WEBHOOK_URL` — webhook comprovante entrega
- `VEHICLE_TRACKING_TOKEN` — token rastreamento veículos

> Variáveis e descrições ajustadas para remover marcas legadas e manter vocabulário neutro do manual de marca.

### Fiscal e ESG ([REQ-120](../02-planejamento/requisitos-spec.md#req-120), [REQ-121](../02-planejamento/requisitos-spec.md#req-121))
- `SEFAZ_CERTIFICATE_PATH` — Certificado A1/A3 SEFAZ
- `NFE_AMBIENTE` — Homologação (2) ou Produção (1)
- `ESG_CALCULATION_API` — Microserviço cálculos ESG
- `IPCC_METHODOLOGY_VERSION` — Versão metodologia IPCC (padrão: AR6)
- `GHG_PROTOCOL_API_KEY` — API GHG Protocol oficial

### Blockchain APP ([REQ-122](../02-planejamento/requisitos-spec.md#req-122))
- `POLYGON_RPC_URL` — Endpoint RPC Polygon mainnet/testnet
- `SMART_CONTRACT_ADDRESS` — Endereço contrato APP Coin
- `WALLET_PRIVATE_KEY` — Chave carteira administrativa (cofre)
- `GAS_LIMIT` / `GAS_PRICE` — Parâmetros otimização gas
- `BLOCKCHAIN_EXPLORER_URL` — Polygonscan para transparência

### Dashboard Admin ([REQ-123](../02-planejamento/requisitos-spec.md#req-123))
- `ADMIN_DASHBOARD_SECRET` — Chave acesso dashboard administrativo
- `METRICS_REFRESH_INTERVAL` — Intervalo atualização métricas (padrão: 5min)
- `RBAC_RULES_PATH` — Arquivo regras RBAC/ABAC
- `AUDIT_LOG_RETENTION` — Retenção logs auditoria (padrão: 7 anos)
- `REGULATORY_REPORT_SCHEDULE` — Cronograma relatórios automáticos

### Variáveis Legadas (Preservadas)
- `CORE_API_URL` — Gateway principal para onboarding, marketplace e liquidação. Atende [REQ-101](../02-planejamento/requisitos-spec.md#req-101), [REQ-103](../02-planejamento/requisitos-spec.md#req-103) e mantém legado `REQ-003`.
- `OPEN_FINANCE_GATEWAY` — Endpoint utilizado pelos conectores Open Finance/PIX. Cumpre [REQ-108](../02-planejamento/requisitos-spec.md#req-108) e `REQ-302`; legado `REQ-005`.
- `IMPACT_DATASET` — Nome do dataset analítico em que métricas ESG são persistidas. Sustenta [REQ-106](../02-planejamento/requisitos-spec.md#req-106), [REQ-205](../02-planejamento/requisitos-spec.md#req-205) e legado `REQ-015`.
- `COLLAB_APPROVAL_ENDPOINT` — API interna para sincronizar aprovações humanas, vinculando [REQ-304](../02-planejamento/requisitos-spec.md#req-304) aos legados `REQ-031`–`REQ-033`.
- `VAULT_SECRET_PATH` — Caminho no cofre corporativo responsável por segredos sensíveis (tokens, chaves). Mantém [REQ-201](../02-planejamento/requisitos-spec.md#req-201) e legado `REQ-014`.

### Catálogo por projeto
| Projeto | Variável | Ambiente de execução | Constante exportada |
| --- | --- | --- | --- |
| `app/api/` (core bancário) | `CORE_API_URL`, `VAULT_SECRET_PATH` | Node.js (`process.env`) | `process.env.CORE_API_URL` |
| `app/ui/` (portais React) | `VITE_CORE_API_URL`, `VITE_OPEN_FINANCE_GATEWAY` | Vite (`import.meta.env`) | `import.meta.env.VITE_CORE_API_URL` |
| `landing/` (portal institucional) | `VITE_PUBLIC_URL`, `VITE_OAUTH_CALLBACK_URL`, `VITE_POSTGREST_BASE_URL` | Vite (`import.meta.env`) | `import.meta.env.VITE_PUBLIC_URL` |
| `services/ledger` | `IMPACT_DATASET`, `COLLAB_APPROVAL_ENDPOINT` | Workers/ETL | Config YAML `services/ledger/config.yaml` |

### Convenções
- Variáveis consumidas por aplicações web/mobile devem ser prefixadas com `VITE_` ou `EXPO_PUBLIC_`, mantendo conformidade com [REQ-018](../02-planejamento/requisitos-spec.md#req-018). Legado associado: `REQ-010`.
- Serviços containerizados utilizam `VAULT_SECRET_PATH` para obter segredos, com rotação automática documentada em [`governanca-tecnica-spec.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md). Mantém legados `REQ-014`, `REQ-021`.
- Feature flags colaborativas residem em `configs/collaboration/*.yaml` e devem ser versionadas junto às mudanças de [capacidade-diagnostico-colaborativo](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md), preservando legados `REQ-031`–`REQ-035`.

### Regras de Docker e Containerização
- **Separação de responsabilidades:** Os arquivos `Dockerfile` devem ser utilizados exclusivamente para instalar dependências e executar o processo da aplicação. Variáveis de ambiente, volumes, healthchecks, checagens e execuções de comandos devem ser definidos exclusivamente no `docker-compose.yml` na raiz do repositório.
- **Variáveis de ambiente:** Todas as variáveis de ambiente devem sempre conter um valor padrão no `docker-compose.yml` usando o formato `${VAR:-default}`. Os arquivos `.env` ou `.env.example` devem conter apenas dados sensíveis como chaves, senhas, tokens e outros segredos que não devem ser versionados com valores padrão.
- **Estrutura mínima obrigatória:** A estrutura Docker deve ser sempre composta no mínimo por:
  - `docker-compose.yml` na raiz do repositório
  - `Dockerfile` na raiz do subprojeto
  - `entrypoint.sh` na raiz do subprojeto (quando necessário para inicialização)

## Exemplos de configuração
```yaml
# docker-compose.yml — extrato adaptado
services:
  core-api:
    build: ./api
    environment:
      CORE_API_URL: "${CORE_API_URL:-http://localhost:3333}"
      VAULT_SECRET_PATH: "${VAULT_SECRET_PATH:-secret/bancoverde/dev}"
  portal:
    build: ./ui
    environment:
      VITE_CORE_API_URL: "${VITE_CORE_API_URL:-http://localhost:3333}"
      VITE_OPEN_FINANCE_GATEWAY: "${VITE_OPEN_FINANCE_GATEWAY:-http://localhost:4000}"
  landing:
    build: ./landing
    environment:
      VITE_PUBLIC_URL: "${VITE_PUBLIC_URL:-https://dominio.com.br}"
      VITE_OAUTH_CALLBACK_URL: "${VITE_OAUTH_CALLBACK_URL:-https://dominio.com.br/oauth2/callback}"
      VITE_POSTGREST_BASE_URL: "${VITE_POSTGREST_BASE_URL:-http://localhost:3000}"
```

```bash
# app/api.env.example
CORE_API_URL=
VAULT_SECRET_PATH=

# app/ui.env.example
VITE_CORE_API_URL=
VITE_OPEN_FINANCE_GATEWAY=

# landing/.env.example
VITE_PUBLIC_URL=
VITE_OAUTH_CALLBACK_URL=
VITE_POSTGREST_BASE_URL=
```

Execute o validador abaixo sempre que atualizar templates `.env.example` para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e manter legado `REQ-019`:

```bash
python - <<'PY'
from pathlib import Path

defaults = {}
for line in Path('docker-compose.yml').read_text().splitlines():
    if '${' not in line:
        continue
    key_start = line.index('${') + 2
    key_end = line.find(':-', key_start)
    if key_end == -1:
        continue
    default_start = key_end + 2
    default_end = line.find('}', default_start)
    defaults[line[key_start:key_end]] = line[default_start:default_end]

violations = {}
for template in Path('.').rglob('.env.example'):
    keys = {
        line.split('=', 1)[0]
        for line in template.read_text().splitlines()
        if line and not line.startswith('#')
    }
    invalid = [k for k in sorted(keys) if defaults.get(k, '').strip()]
    if invalid:
        violations[str(template)] = invalid

if violations:
    for file, vars_ in violations.items():
        print(f"❌ Variáveis com default definido no compose: {file} → {vars_}")
else:
    print('✅ Templates .env.example prontos para cofre/CI/CD')
PY
```

## Provisionamento
1. Definir variáveis nos cofres corporativos e replicar via pipelines GitOps, atendendo [REQ-305](../02-planejamento/requisitos-spec.md#req-305) e legado `REQ-018`.
2. Executar `npm install`/`npm run build` (UI) e `npm run build` (API) em agentes CI antes de empacotar imagens, garantindo [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e legado `REQ-019`.
3. Publicar imagens assinadas em registro privado, com tags `env-<dev|hml|prd>` sincronizadas ao changelog (REQ-029, legado `REQ-022`).
4. Atualizar manifests IaC (Terraform/Helm) incluindo endpoints colaborativos quando necessário, preservando alinhamento com [REQ-304](../02-planejamento/requisitos-spec.md#req-304) e legados `REQ-031`–`REQ-033`.

## Monitoramento e alertas
- Disponibilizar endpoints `/health` e `/metrics` em todos os serviços (REQ-205; legado `REQ-015`).
- Configurar dashboards Grafana/Kibana com métricas financeiras e ESG lado a lado, registrando responsáveis humanos por aprovação (REQ-205, REQ-304; legados `REQ-015`, `REQ-034`).
- Ativar alertas para fila de aprovação humana > 12h e falhas de liquidação PIX/SPI, vinculando a [REQ-108](../02-planejamento/requisitos-spec.md#req-108) e legados `REQ-007`, `REQ-032`.

## Segurança e conformidade
- Segredos armazenados exclusivamente em `VAULT_SECRET_PATH`, com rotação automática trimestral (REQ-201; legado `REQ-014`).
- Logs mascarados em conformidade com [REQ-401](../02-planejamento/requisitos-spec.md#req-401) e legado `REQ-024`, replicados para relatórios ESG (`docs/Compliance/`).
- Acessos administrativos requerem MFA e registro de `analyst_id` quando houver intervenção humana, sustentando [REQ-404](../02-planejamento/requisitos-spec.md#req-404) e legados `REQ-029`, `REQ-033`.

## Documentação e auditoria
- Registrar cada deploy em `docs/checklists/deploy-log.md` com hash, ambiente e requisitos atendidos (REQ-022; legado `REQ-022`).
- Atualizar [`audit-history-spec.md`](../audit-history-spec.md) após cada ciclo, anexando evidências geradas por `governance.yml` (REQ-029; legado `REQ-029`).
- Notificar a governança caso haja divergência entre ambientes, documentando plano de ação com links para requisitos impactados (legado `REQ-030`).

[Voltar ao índice](README-spec.md)
