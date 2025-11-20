<!-- docs/rup/05-entrega-e-implantacao/empacotamento.md -->
# Empacotamento e Build Final

> Base: [./empacotamento.md](./empacotamento.md)
> Referências correlatas: [Estrutura de Projeto](../03-implementacao/estrutura-de-projeto-spec.md) · [Build e Automação](../03-implementacao/build-e-automacao-spec.md) · [Requisitos do App](../02-planejamento/requisitos-spec.md)

## Objetivo
Definir o fluxo de build e empacotamento dos artefatos do App (core bancário, portais e conectores Open Finance), garantindo entregas determinísticas, compatíveis com as políticas BACEN e com o histórico legado da Chrome extension. Este documento dá suporte direto a [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-108](../02-planejamento/requisitos-spec.md#req-108), [REQ-305](../02-planejamento/requisitos-spec.md#req-305) e [REQ-404](../02-planejamento/requisitos-spec.md#req-404); na rastreabilidade herdada, cobre `REQ-012`, `REQ-018`, `REQ-019`, `REQ-022`, `REQ-030`.

### Rastreabilidade com os anexos
| Requisito | Impacto no empacotamento | Evidência em `docs/rup/99-*` |
| --- | --- | --- |
| [REQ-107](../02-planejamento/requisitos-spec.md#req-107) | Core bancário verde precisa de build determinístico para ledger, extratos e contas virtuais. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) |
| [REQ-108](../02-planejamento/requisitos-spec.md#req-108) | Empacotes devem carregar hash blockchain e parâmetros de escrow definidos no PRD. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e4--pagamentos-e-escrow) |
| [REQ-109](../02-planejamento/requisitos-spec.md#req-109) | Bundles do portal entregam dashboards ESG e saldo APP Coin com exportações assinadas. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#-e6--dominio-coin) |
| [REQ-305](../02-planejamento/requisitos-spec.md#req-305) | Pipelines GitOps e assinatura de imagens devem seguir entregáveis técnicos globais. | [`PRD_Plataforma_App_Completo.md`](../99-anexos/PRD_Plataforma_App_Completo.md#✅-entregáveis-técnicos-globais) |
| [REQ-404](../02-planejamento/requisitos-spec.md#req-404) | Controle de acesso aos artefatos precisa respeitar níveis N0–N5 com trilha de auditoria. | [`sugestoes-controle-por-perfil-de-autorizacoes.md`](../99-anexos/sugestoes-controle-por-perfil-de-autorizacoes.md) |

---

## Quando atualizar
- Novas dependências ou mudanças no processo de build (ex.: atualização de Node, pipeline de container) exigem atualização simultânea deste arquivo e de `build-e-automacao-spec.md`.
- Ajustes regulatórios (BACEN, LGPD) que alterem artefatos distribuídos devem ser registrados aqui e vinculados ao `CHANGELOG`.
- Integração de features colaborativas (REQ-304) deve descrever como os bundles preservam flags e endpoints necessários aos analistas humanos (legados `REQ-031`–`REQ-033`).

---

## Fluxo padrão de build
1. **Preparação do ambiente CI/CD** — executar `npm install` nos diretórios `app/api/` e `app/ui/`, validar versão de Node definida em `.nvmrc` e garantir cache limpo (`npm ci`). Atende [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e legado `REQ-018`.
2. **Lint e testes** — rodar `npm run lint`/`npm run test` (UI) e `npm run test` (API) antes do build final, registrando resultados em `docs/checklists/test-report.md` para cumprir [REQ-205](../02-planejamento/requisitos-spec.md#req-205) e legado `REQ-015`.
3. **Build dos portais** — `npm run build` gera `app/ui/dist/` com bundles versionados, incluindo rotas do marketplace verde e dashboard ESG ([REQ-103](../02-planejamento/requisitos-spec.md#req-103), [REQ-106](../02-planejamento/requisitos-spec.md#req-106); legados `REQ-004`, `REQ-015`).
4. **Build dos serviços** — compilar `app/api/` com `npm run build` e gerar artefatos TypeScript → JavaScript sob `app/api/dist/`, garantindo compatibilidade com pipelines de liquidação e scoring socioambiental (REQ-108, REQ-304; legados `REQ-005`, `REQ-031`).
5. **Empacotamento em imagens** — utilizar `docker build` (ou `make package`) para `core-api`, `open-finance-gateway` e `portal`, assinando imagens e publicando com tag `sha-<commit>-<env>` (REQ-305; legado `REQ-019`).
6. **Geração do bundle estático** — consolidar `app/ui/dist/`, manifestos de infraestrutura (`helm/`) e documentação de release em um artefato `.tar.gz` anexado ao pipeline, preservando rastreabilidade de [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e legado `REQ-022`.

## Checklist pré-upload / pré-deploy
- `package.json` alinhado ao lockfile; builds determinísticos confirmados por `npm ci && npm run build` em ambiente limpo (REQ-019; legado `REQ-019`).
- Manifestos IaC (`helm/`, `terraform/`) atualizados com endpoints e secrets referenciados no changelog, mantendo [REQ-305](../02-planejamento/requisitos-spec.md#req-305) e legado `REQ-020`.
- Variáveis colaborativas (`COLLAB_APPROVAL_ENDPOINT`, `IMPACT_DATASET`) expostas somente via configuração de ambiente; evitar hardcode em bundles para respeitar [REQ-304](../02-planejamento/requisitos-spec.md#req-304) e legados `REQ-031`–`REQ-035`.
- Evidências anexadas em `docs/checklists/build-log.md` com hash do commit, pipeline e resumo de requisitos atendidos (REQ-022; legado `REQ-022`).
- Verificar que políticas de segurança (`Content-Security-Policy`, `permissions`) seguem padrões corporativos descritos em [`auditoria-e-rastreabilidade-spec.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md), reforçando [REQ-404](../02-planejamento/requisitos-spec.md#req-404) e legado `REQ-030`.

## Scripts e automações
```makefile
# Makefile — alvo simplificado
package:
@npm --prefix api ci && npm --prefix api run build
@npm --prefix ui ci && npm --prefix ui run build
@docker build -t dominio.com.br/bancoverde/core-api:$(TAG) api
@docker build -t dominio.com.br/bancoverde/portal:$(TAG) ui
@./scripts/sign-image.sh $(TAG)
```
- `scripts/sign-image.sh` deve registrar assinatura e publicar resumo em `docs/checklists/signature-log.md` para atender [REQ-404](../02-planejamento/requisitos-spec.md#req-404); legado `REQ-021`.
- Pipelines GitHub/GitLab precisam anexar `build-report.json` com referência aos requisitos (REQ-022; legado `REQ-022`).

## Empacotamento para ambientes regulados
| Artefato | Destino | Observações |
| --- | --- | --- |
| `core-api` imagem | Registry privado (DEV/HML/PRD) | Assinatura Notary v2, política de retenção ≥ 90 dias. Referências: REQ-108; legados `REQ-005`, `REQ-007`. |
| `portal` imagem | Registry privado | Inclui dashboards ESG e jornada de onboarding; verificar recursos de acessibilidade (REQ-206; legado `REQ-016`). |
| `open-finance-gateway` | Registry privado | Necessário atualizar certificados em cada tag, alinhado a REQ-302; legado `REQ-012`. |
| Pacote de documentação | `docs/checklists/releases/<versao>.zip` | Contém changelog, relatórios de QA e scripts de rollback (REQ-029; legado `REQ-029`). |

## Considerações colaborativas
- As filas que aguardam aprovação humana devem carregar `collaboration_ticket_id` no payload e no log do build para garantir revisão posterior (REQ-304; legados `REQ-031`–`REQ-033`).
- Ao habilitar novas jornadas conjuntas IA + analista (por exemplo, aprovação de crédito verde), registrar a flag correspondente em `configs/collaboration/` e mencionar no changelog.

[Voltar ao índice](README-spec.md)
