<!-- docs/legal-pages.md -->
# Brikaya — páginas legais, confiança pública e idiomas principais

Última atualização: 2026-07-07.

## Objetivo

Manter URLs públicas, estáveis, rastreáveis e prontas para revisão de jogadores, buscadores e plataformas que exigem identificação do produto, política de privacidade, termos, suporte, exclusão de dados e licença.

Este pacote prepara Brikaya para cadastros gratuitos e revisões de plataformas sem criar conta paga, campanha, pixel novo, loja paga ou exposição de perfil pessoal.

## Estratégia de idioma

- Padrão das páginas legais: **US English** em URLs raiz, com `html lang="en-US"`.
- O jogo/home/downloads continuam usando a estratégia de idioma existente; esta entrega não altera a jogabilidade nem a rota inicial do jogo.
- Páginas legais localizadas são geradas no build para todos os **idiomas principais** já presentes no jogo.
- Variações regionais duplicadas não são criadas para páginas legais:
  - inglês: raiz `en-US`; sem `/en/`, `/en-AU/`, `/en-GB/`, `/en-CA/` legais.
  - francês: `/fr/`; sem `/fr-CA/`, `/fr-BE/`, `/fr-CH/` legais.
  - alemão: `/de/`; sem `/de-AT/`, `/de-CH/` legais.
  - português: `/pt-BR/` como representante principal.
  - espanhol: `/es-419/` como representante principal.
  - chinês: `/zh-CN/` e `/zh-TW/` mantidos por script.
- Total gerado após build: 284 locales de home/downloads, 254 idiomas legais por página, 9 páginas legais, `public/sitemap.xml` com 2.854 URLs.
- O cache versionado `scripts/legal-page-translations.json` é local e determinístico. Strings que acionam o guard de rastros públicos ou têm placeholder corrompido voltam para a base inglesa para preservar marca, domínio e segurança.

## Matriz pública

| Página | URL padrão | Exemplo localizado | Objetivo | Plataforma/requisito atendido |
|---|---|---|---|---|
| Sobre | `https://brikaya.com/about/` | `https://brikaya.com/pt-BR/about/` | Explicar produto, gratuidade e titularidade | Homepage/brand clarity para Google OAuth e revisores |
| Legal | `https://brikaya.com/legal/` | `https://brikaya.com/fr/legal/` | Centralizar links legais | Hub para plataformas e buscadores |
| Privacidade | `https://brikaya.com/privacy/` | `https://brikaya.com/es-419/privacy/` | Dados locais, consentimento, anúncios, contato e controle | Google OAuth privacy policy, Meta privacy policy, anúncios |
| Termos | `https://brikaya.com/terms/` | `https://brikaya.com/de/terms/` | Uso, gratuidade, anúncios e restrições | OAuth/App branding, Meta app settings, revisão geral |
| Contrato de usuário | `https://brikaya.com/user-agreement/` | `https://brikaya.com/it/user-agreement/` | Aceite pelo uso, conduta e direitos | Plataformas que pedem user agreement/EULA |
| Licença | `https://brikaya.com/license/` | `https://brikaya.com/ja/license/` | Obra proprietária e direitos reservados | Revisão de IP/licenciamento |
| Exclusão de dados | `https://brikaya.com/data-deletion/` | `https://brikaya.com/ar/data-deletion/` | Remoção de dados locais e contato | Meta Data Deletion Instructions, Google Play future readiness |
| Cookies e anúncios | `https://brikaya.com/cookies/` | `https://brikaya.com/zh-CN/cookies/` | Escolhas salvas, cookies/armazenamento e anúncios | Consentimento/anúncios e transparência |
| Suporte | `https://brikaya.com/support/` | `https://brikaya.com/hi-IN/support/` | Contato oficial e escopo de suporte | Requisitos de contato de plataformas |

## Bases oficiais consultadas

- Google Search localized versions / hreflang: <https://developers.google.com/search/docs/specialty/international/localized-versions>
- Google Search sitemap: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- Google OAuth Verification Requirements: <https://support.google.com/cloud/answer/13464321>
- Google App Privacy Policy: <https://support.google.com/cloud/answer/13806988>
- Google Play account deletion: <https://support.google.com/googleplay/android-developer/answer/13327111>
- Bing Webmaster sitemaps: <https://www.bing.com/webmasters/help/Sitemaps-3b5cf6ed>
- IndexNow: <https://www.indexnow.org/documentation>
- Meta privacy policy/data deletion: <https://developers.facebook.com/docs/development/terms-and-policies/privacy-policy/> e <https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback/>

## Guardrails

- Linguagem para usuário final: clara, curta, sem detalhes internos de implementação.
- Identidade pública: Brikaya e Ricardo Malnati; nenhum perfil pessoal público adicional.
- Sem compromisso de pagamento: não ativar campanha, loja paga, cartão, overage, pixel novo ou serviço pago.
- Sem conta de jogador nesta versão: `/data-deletion/` explica remoção local e canal de contato, não exclusão de perfil hospedado.
- Licença pública: proprietária, todos os direitos reservados, sem abertura de código ou assets.
- Revisão jurídica externa: pendente e fora do escopo deste pacote; estas páginas são prontidão operacional para plataformas.

## Validação esperada

1. `npm run build` gera `dist/` com páginas legais localizadas, `public/sitemap.xml` com 2.854 URLs e `robots.txt` canônico.
2. Cada página legal tem canonical absoluto, `hreflang` do conjunto legal principal e `x-default` para a raiz em `en-US`.
3. Variantes legais duplicadas não existem no build nem no sitemap, por exemplo `/en-AU/privacy/` e `/fr-CA/privacy/`.
4. Home/downloads mantêm SEO localizado e links legais apontam para o idioma principal legal correspondente.
5. Após deploy, validar HTTP 200 no domínio público e reenviar sitemap no Google/Bing/IndexNow quando possível sem custo.
