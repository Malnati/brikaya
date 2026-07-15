<!-- docs/monetizacao-google.md -->
# Brikaya — monetização Google H5 sem campanha paga

## Objetivo

Preparar `https://brikaya.com/` para monetização por Google AdSense/H5 Games Ads com anúncios intersticiais apenas a cada 3 fases concluídas, sem investimento em campanhas, sem banners fixos, sem anúncios durante a jogada e sem bloquear o jogo quando não houver anúncio.

## Estado em 2026-07-15

- Conta/publisher: `ca-pub-9571619183194136`.
- Site no AdSense: `brikaya.com` **não pronto** — rejeição por **Conteúdo de baixo valor** (e-mail/painel Sites).
- Propriedade: snippet AdSense no `<head>` + `ads.txt` públicos presentes; checkmark exato do painel não revalidado aqui.
- Remediação editorial em curso no repo: landing crawlável em `/`, jogo em `/play/`, páginas `/how-to-play/`, `/faq/`, `/updates/` (en-US + pt-BR apenas). Ver [`docs/adsense-site-readiness.md`](adsense-site-readiness.md).
- **Não** confirmar “corrigi os problemas” no AdSense até o conteúdo editorial estar publicado e a revisão humana for solicitada de propósito.
- CMP: mensagem Google configurada para regulamentações europeias com três opções (`Consentir`, `Não consentir`, `Gerenciar opções`).
- `ads.txt`: `google.com, pub-9571619183194136, DIRECT, f08c47fec0942fa0`.
- H5 Games Ads / Ad Placement API ainda depende de liberação/aprovação do Google; aprovação não é garantida.
- Formulário H5 Games Ads exige conta AdSense aprovada; não submetido enquanto o site estiver rejeitado por conteúdo.
- Nenhuma campanha Google Ads, orçamento, cartão ou investimento pago faz parte deste escopo.
- Gate CI proxy: `npm run verify:adsense-ready-proxy` (higiene técnica; **não** é aprovação AdSense).

## Decisão técnica

- O snippet AdSense fica no `<head>` de `/play/` (shell do jogo) para verificação H5 e property.
- Landing `/` é HTML estático crawlável; não carrega o runtime do jogo.
- A chamada de anúncio fica atrás de flag runtime desligada por padrão: `window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = false`.
- O jogo chama `adBreak({ type: "next" })` somente depois das fases 3, 6, 9...; outras transições seguem sem pedido de anúncio.
- Quando um anúncio real é exibido, a transição só termina depois da pausa mínima, do retorno do anúncio e do clique do jogador na mensagem de volta ao jogo.
- Se a API não estiver disponível, o navegador estiver offline, a flag estiver desligada, o anúncio não preencher ou o consentimento impedir exibição, o jogo segue para a próxima fase sem mensagem extra.

## Regras legais e produto

- Público padrão: geral, não direcionado a crianças.
- Anúncios personalizados em EEA/Reino Unido/Suíça exigem CMP certificado Google antes da ativação regional.
- Privacidade e termos públicos informam cookies/armazenamento usados por fornecedores de anúncio, inclusive Google.
- QA nunca deve clicar em anúncio real nem incentivar cliques.
- Anúncios não devem aparecer durante movimento da bola, controle do jogador, menus principais, countdown inicial, modo offline ou transições que não sejam múltiplas de 3 fases.

## Pendências P0-P20

| P | Item | Status |
|---:|---|---|
| P0 | AdSense aberto e autenticado | feito |
| P1 | Status do site verificado | **rejeitado: conteúdo de baixo valor** |
| P2 | Snippet AdSense adicionado ao `<head>` | feito |
| P3 | Flag runtime desligada por padrão | feito |
| P4 | Interstitial somente a cada 3 fases concluídas | feito no código |
| P5 | Fallback sem internet/API/no-fill | feito no código |
| P6 | Privacidade/termos atualizados | feito |
| P7 | Documentação operacional criada | feito |
| P8 | CMP certificado Google | feito: CMP Google de 3 opções |
| P9 | H5 Games Ads liberado | pendente de aprovação Google |
| P10 | Verificação AdSense após deploy | feito (snippet/`ads.txt`) |
| P11 | Pedir revisão no AdSense | **bloquear até editorial publicado** |
| P12 | Policy Center / Sites | **violação ativa: conteúdo de baixo valor** |
| P13 | Teste E2E de anúncio/no-fill | feito com anúncio simulado na fase 3→4, sem clique real |
| P14 | Teste offline/sem consentimento/no-fill | feito com fallback sem bloqueio de fase e sem pedido de anúncio antes do consentimento |
| P15 | Prova mobile pública | feito em `tmp/screenshots/cloudflare-interlevel-google-ads.png` |
| P16 | Monitorar consent audit | pendente |
| P17 | Monitorar receita por país | pendente após aprovação |
| P18 | Não criar campanha paga | guardrail ativo |
| P19 | Não instalar Clarity/pixel extra | guardrail ativo |
| P20 | Evidência final sanitizada | feito em `tmp/reports/cloudflare-interlevel-google-ads.json` |
| P21 | Conteúdo editorial crawlável EN/PT | feito no código (`/how-to-play/`, `/faq/`, `/updates/`) |
| P22 | Gate `verify:adsense-ready-proxy` | feito (proxy, não aprovação) |

## Fontes oficiais

- Ad Placement API: <https://developers.google.com/ad-placement/apis>
- Exemplo de implementação: <https://developers.google.com/ad-placement/docs/example>
- H5 Games Ads: <https://support.google.com/adsense/answer/1705831>
- Primeiros passos H5 Games Ads: <https://support.google.com/adsense/answer/9959170>
- Consentimento EEA/Reino Unido/Suíça: <https://support.google.com/adsense/answer/13554116>
- Guia ads.txt AdSense: <https://support.google.com/adsense/answer/12171612>
- Políticas AdSense: <https://support.google.com/adsense/answer/48182>
- Prontidão local: [`docs/adsense-site-readiness.md`](adsense-site-readiness.md)
