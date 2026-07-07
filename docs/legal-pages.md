<!-- docs/legal-pages.md -->
# Brikaya — páginas legais e confiança pública

Última atualização: 2026-07-07.

## Objetivo

Manter URLs públicas, estáveis e rastreáveis para jogadores, buscadores e plataformas que exigem identificação do produto, política de privacidade, termos, suporte, exclusão de dados e licença.

Este pacote prepara Brikaya para cadastros gratuitos e revisões de plataformas sem criar conta paga, campanha, pixel novo, loja paga ou exposição de perfil pessoal.

## Matriz pública

| Página | URL | Objetivo | Plataforma/requisito atendido | Evidência esperada |
|---|---|---|---|---|
| Sobre | `https://brikaya.com/about/` | Explicar o produto, gratuidade e titularidade | Homepage/brand clarity para Google OAuth e revisores | Página 200, linkada de downloads/menu |
| Legal | `https://brikaya.com/legal/` | Centralizar links legais | Hub para plataformas e buscadores | Lista de links oficiais |
| Privacidade | `https://brikaya.com/privacy/` | Dados locais, consentimento, anúncios, contato e controle | Google OAuth privacy policy, Meta privacy policy, anúncios | URL dedicada, HTML, mesmo domínio |
| Termos | `https://brikaya.com/terms/` | Uso, gratuidade, anúncios e restrições | OAuth/App branding, Meta app settings, revisão geral | URL dedicada, HTML, mesmo domínio |
| Contrato de usuário | `https://brikaya.com/user-agreement/` | Aceite pelo uso, conduta e direitos | Preparação para plataformas que pedem user agreement/EULA | Página 200, linkada do hub legal |
| Licença | `https://brikaya.com/license/` | Informar obra proprietária e direitos reservados | Revisão de IP/licenciamento | Titular Ricardo Malnati, direitos reservados |
| Exclusão de dados | `https://brikaya.com/data-deletion/` | Instruir remoção de dados locais e contato | Meta Data Deletion Instructions, Google Play future account-deletion readiness | Página 200, instruções claras |
| Cookies e anúncios | `https://brikaya.com/cookies/` | Explicar escolhas salvas, cookies/armazenamento e anúncios | Consentimento/anúncios e transparência | Página 200, linkada do hub legal |
| Suporte | `https://brikaya.com/support/` | Contato oficial e escopo de suporte | Requisitos de contato de plataformas | `contato@brikaya.com` público |

## Bases oficiais consultadas

- Google OAuth Verification Requirements: homepage em domínio verificado, link de privacidade na homepage, política no mesmo domínio e domínio autorizado verificado.
  - Fonte: <https://support.google.com/cloud/answer/13464321>
- Google App Privacy Policy: política responsiva, HTML dedicado, no domínio do app ou domínio verificado, associada claramente ao app.
  - Fonte: <https://support.google.com/cloud/answer/13806988>
- Google Play account deletion: prontidão futura para explicar exclusão de conta/dados quando houver conta.
  - Fonte: <https://support.google.com/googleplay/android-developer/answer/13327111>
- Google Search sitemap: sitemap XML com URLs canônicas públicas para descoberta.
  - Fonte: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- Meta privacy policy e data deletion: app deve oferecer URL de política e caminho público de exclusão/instrução de dados.
  - Fontes: <https://developers.facebook.com/docs/development/terms-and-policies/privacy-policy/> e <https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback/>

## Conteúdo e guardrails

- Linguagem para usuário final: clara, curta, sem detalhes internos de implementação.
- Identidade pública: Brikaya e Ricardo Malnati; nenhum perfil pessoal público adicional.
- Sem compromisso de pagamento: não ativar campanha, loja paga, cartão, overage, pixel novo ou serviço pago.
- Sem conta de jogador nesta versão: `/data-deletion/` explica remoção local e canal de contato, não exclusão de perfil hospedado.
- Licença pública: proprietária, todos os direitos reservados, sem abertura de código ou assets.
- Revisão jurídica externa: pendente e fora do escopo deste pacote; estas páginas são prontidão operacional para plataformas.

## Validação esperada

1. `npm run build` deve gerar `dist/sitemap.xml` com todas as páginas legais.
2. Cada página deve publicar canonical absoluto `https://brikaya.com/<rota>/`.
3. Cada página deve ter meta description, OG/Twitter básico e JSON-LD `WebPage`.
4. Home/downloads devem manter SEO localizado e links de privacidade/termos.
5. Após deploy, validar HTTP 200 no domínio público e reenviar sitemap no Google Search Console quando possível sem custo.
