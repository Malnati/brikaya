<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/relatorio-buscas-marcas-20251117.md -->
# Relatório de buscas de marcas, produtos e URLs legados

Varredura realizada com `rg` em todo o repositório para identificar referências herdadas de marcas, produtos e domínios do projeto anterior. Os achados abaixo listam arquivo, linha e contexto imediato para apoiar substituições futuras.

## Termo: dominio.com.br e subdomínios
- `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md` (L73): risco mapeado para indisponibilidade da API `dominio.com.br`.
- `docs/rup/01-arquitetura/integracoes-com-apis-spec.md` (L24–L26): URLs `https://api-dev.dominio.com.br`, `https://api-hml.dominio.com.br` e `https://api.dominio.com.br` listadas como endpoints de integração.
- `docs/rup/99-anexos/checklists/002-visao-estrategica-checklist.md` (L28): checklist confirma domínio operacional `https://dominio.com.br` e variantes.
- `README.md` (L54): referência à `holding-page/` no domínio público `dominio.com.br`.
- `app/db/init/migrations/013_seed_transaction_contacts.sql` (L3–L36): seeds de contatos usando endereços `dominio.com.br` e `user10@dominio.com.br`.
- `app/api/src/modules/mailing/mailing.service.ts` (L10, L247–L276): remetente padrão `noreply@dominio.com.br` e links de acesso `https://dominio.com.br` nos templates de e-mail.
- `app/ui/src/pages/LoginPage.tsx` (L9–L66): logo carregada de `/assets/dominio-logo-transparencia-colors.png` e exibida como marca na tela de login.
- `app/caddy/Caddyfile` (L7, L14–L27): configuração HTTPS apontando para `app.dominio.com.br` com e-mail `admin@dominio.com.br`.

## Termo: APP Coin (produto)
- `docs/rup/02-planejamento/requisitos-spec.md` (L96–L199): requisitos REQ-050, REQ-109 e REQ-122 descrevem token APP Coin, governança e integrações blockchain.
- `docs/rup/02-planejamento/requisitos-banco-digital-spec.md` (L63–L166): seção de monetização e tokenização detalha APP Coin como recompensa ambiental.
- `docs/rup/00-visao/visao-do-produto-spec.md` (L14): visão do produto cita token APP Coin com smart contracts e lastro ambiental.
- `docs/rup/01-arquitetura/integracoes-com-apis-spec.md` (L45): endpoint `/blockchain/dominio` associado a smart contracts APP Coin.
- `docs/rup/04-testes-e-validacao/criterios-de-aceitacao-spec.md` (L54): critérios de aceitação para o épico E6 – APP Coin e Blockchain.

## Termo: Bancoverde (imagens e registros)
- `docs/rup/05-entrega-e-implantacao/empacotamento-spec.md` (L49–L50): comandos de build geram imagens `dominio.com.br/bancoverde/core-api` e `dominio.com.br/bancoverde/portal`.
- `docs/rup/05-entrega-e-implantacao/publicacao-e-versionamento-spec.md` (L42): pipeline de publicação prevê upload para `dominio.com.br/bancoverde/*`.
- `docs/rup/05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md` (L132): variável `VAULT_SECRET_PATH` aponta para `secret/bancoverde/dev`.

## Termo: MBRA (marca institucional)
- `README.md` (L4–L72): descreve o App CLImate INvestment como iniciativa da Millennium Brasil (MBRA).
- `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md` (L74): risco referente a alterações na API MBRA.
- `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/plano-governanca-completa-spec.md` (L2–L134): governança da extensão Chrome nomeada como MBRA (CLImate INvestment).
- `docs/rup/99-anexos/checklists/010-ux-brand-checklist.md` (L5): checklist solicita verificação da paleta MBRA.
