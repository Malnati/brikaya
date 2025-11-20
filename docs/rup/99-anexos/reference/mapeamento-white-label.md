<!-- docs/rup/99-anexos/reference/mapeamento-white-label.md -->
# Mapeamento White Label - Termos do Domínio Anterior

## Propósito
Este documento cataloga todas as ocorrências de termos específicos do domínio anterior (resíduos, créditos de carbono, lotes) encontrados no código e documentação, servindo como referência para a transformação white label.

## Termos Catalogados

### Termos Principais
- **resíduo/resíduos/residuo/residuos** → **produto/produtos** ou **item/itens**
- **lote/lotes** → **produto/produtos** ou **item/itens** ou **oferta/ofertas** (quando aplicável)
- **crédito/créditos/credito/creditos** → **crédito/créditos** (mantido se for crédito financeiro genérico)
- **crédito de carbono** → **crédito ambiental** ou **token** (conforme contexto)
- **carbono** → **ambiental** ou removido conforme contexto

### Contextos Específicos
- **marketplace de resíduos** → **marketplace de produtos** ou **marketplace**
- **lotes de resíduos** → **produtos** ou **ofertas**
- **fornecedor de resíduo** → **fornecedor** ou **vendedor**
- **comprador de resíduo** → **comprador**
- **tokenização de créditos ambientais** → **tokenização de ativos** ou **tokenização**

## Arquivos Identificados

### Código Fonte (app/)
- Módulos de API: `lote-residuo`, `offer`, `transacao`
- Componentes UI: `OfferCard`, `CriarLotePage`, `ListarLotesPage`, `DetalhesLotePage`
- Serviços: `gmail.service.ts`, `mailing.service.ts`
- Migrações SQL: múltiplos arquivos em `app/db/init/migrations/`

### Documentação (docs/rup/)
- Requisitos: `requisitos-spec.md`, `requisitos-banco-digital-spec.md`
- Arquitetura e design: múltiplos arquivos
- Planejamento: `roadmap-spec.md`, `cronograma-spec.md`

### Configuração
- `.env.example`: variáveis de ambiente
- `docker-compose.yml`: configurações de serviços
- `vite.config.ts`: configurações do frontend

## Status da Transformação

- [x] Código fonte atualizado (serviços críticos e componentes React principais)
- [x] Documentação atualizada (READMEs, requisitos e riscos principais)
- [x] Seeds e fixtures atualizados (seed principal atualizado)
- [x] Configurações atualizadas (.env.example, Dockerfiles, vite.config.ts)
- [x] Scripts de validação criados (find-domain-terms.sh, validate-headers.sh, replace-brand.js)
- [x] Tokens de marca criados (branding/tokens.json)
- [x] Componentes React atualizados (tipos TypeScript refatorados, compatibilidade mantida)
- [x] Backend API atualizado (endpoints `/offers` funcionais, compatibilidade retroativa mantida)
- [x] Testes atualizados (testes E2E refatorados para usar `/offers` e terminologia genérica)

## Arquivos Já Transformados

### Configuração
- `app/.env.example` - Comentários atualizados
- `app/ui/vite.config.ts` - Nome e descrição do PWA
- `app/ui/Dockerfile` - Labels atualizados
- `app/api/Dockerfile` - Labels atualizados

### Código Backend
- `app/api/src/modules/gmail/gmail.service.ts` - Textos de email
- `app/api/src/modules/mailing/mailing.service.ts` - Templates de email
- `app/api/src/modules/offer/offer.service.ts` - Queries SQL, mensagens e comentários atualizados
- `app/api/src/modules/transacao/transacao.service.ts` - Códigos de erro atualizados para genéricos
- `app/api/src/constants/index.ts` - Novos códigos de erro `OWN_OFFER_PURCHASE` e `OFFER_ALREADY_SOLD`

### Código Frontend (React)
- `app/ui/src/components/OfferCard.tsx` - Refatorado para usar `Offer`
- `app/ui/src/pages/ListarLotesPage.tsx` - Atualizado para `/offers`
- `app/ui/src/pages/DetalhesLotePage.tsx` - Refatorado para `Offer`
- `app/ui/src/pages/LoginPage.tsx` - Redirecionamentos atualizados
- `app/ui/src/pages/CriarLotePage.tsx` - Endpoint com fallback
- `app/ui/src/components/SelledTab.tsx` - Refatorado para `Offer[]`
- `app/ui/src/components/PurchasedTab.tsx` - Refatorado para `Offer[]`
- `app/ui/src/components/TransacaoCard.tsx` - Compatibilidade com `offer`
- `app/ui/src/components/BottomNavigation.tsx` - Rotas atualizadas
- `app/ui/src/App.tsx` - Rotas principais e legacy configuradas

### Documentação
- `docs/rup/02-planejamento/requisitos-spec.md` - REQ-406 a REQ-409
- `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md` - RISK-017
- `docs/rup/README-spec.md` - Descrição geral

### Tokens e Branding
- `branding/tokens.json` - Arquivo central de tokens de marca criado

### Seeds e Dados
- `app/db/init/seeds/data/009_seed_offers.sql` - Seeds atualizados para produtos genéricos

### Testes
- `app/api/test/test-helpers.ts` - Dados de teste atualizados com `TEST_OFFERS`
- `app/api/test/lote-transacao-restrictions.e2e-spec.ts` - Testes E2E refatorados para `/offers`
- `app/api/src/modules/offer/offer.controller.spec.ts` - Testes unitários atualizados

## Notas de Implementação

- Manter IDs de requisitos (REQ-###) intactos
- Preservar estrutura de dados quando possível
- Atualizar apenas textos e labels visíveis ao usuário
- Documentar decisões de mapeamento neste arquivo

