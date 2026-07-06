<!-- docs/monetizacao-google.md -->
# Brikaya — monetização Google H5 sem campanha paga

## Objetivo

Preparar `https://brikaya.com/` para monetização por Google AdSense/H5 Games Ads com anúncios intersticiais apenas entre fases, sem investimento em campanhas, sem banners fixos, sem anúncios durante a jogada e sem bloquear o jogo quando não houver anúncio.

## Estado em 2026-07-06

- Conta/publisher observado no Chrome autenticado: `ca-pub-9571619183194136`.
- Site no AdSense: `brikaya.com` com status superior `Preparando` após verificação e pedido de revisão.
- Propriedade do site: verificada pelo snippet AdSense no `<head>`.
- Revisão do site: solicitada no AdSense.
- CMP: mensagem Google configurada para regulamentações europeias com três opções (`Consentir`, `Não consentir`, `Gerenciar opções`).
- `ads.txt`: publicado na raiz com o publisher público do AdSense; o painel ainda mostrava `Não encontrado` antes do próximo recrawl.
- Central de políticas: sem problemas encontrados no AdSense.
- H5 Games Ads / Ad Placement API ainda depende de liberação/aprovação do Google; aprovação não é garantida.
- Formulário oficial H5 Games Ads exige conta AdSense aprovada e dados adicionais de contato/empresa/telefone; não foi submetido nesta rodada por falta desses dados completos e porque a revisão do site ainda está em andamento.
- Nenhuma campanha Google Ads, orçamento, cartão ou investimento pago faz parte deste escopo.

## Decisão técnica

- O snippet AdSense fica no `<head>` para verificação do site.
- A chamada de anúncio fica atrás de flag runtime desligada por padrão: `window.__BRIKAYA_GOOGLE_ADS_ENABLED__ = false`.
- O jogo chama `adBreak({ type: "next" })` somente na transição entre fases.
- A transição só termina quando a pausa mínima da fase e o retorno do anúncio/no-fill terminam.
- Se a API não estiver disponível, o navegador estiver offline, a flag estiver desligada, o anúncio não preencher ou o consentimento impedir exibição, o jogo segue para a próxima fase.

## Regras legais e produto

- Público padrão: geral, não direcionado a crianças.
- Anúncios personalizados em EEA/Reino Unido/Suíça exigem CMP certificado Google antes da ativação regional.
- Privacidade e termos públicos informam cookies/armazenamento usados por fornecedores de anúncio, inclusive Google.
- QA nunca deve clicar em anúncio real nem incentivar cliques.
- Anúncios não devem aparecer durante movimento da bola, controle do jogador, menus principais, countdown inicial ou modo offline.

## Pendências P0-P20

| P | Item | Status |
|---:|---|---|
| P0 | AdSense aberto e autenticado | feito |
| P1 | Status do site verificado | feito: `Precisa de revisão` |
| P2 | Snippet AdSense adicionado ao `<head>` | feito |
| P3 | Flag runtime desligada por padrão | feito |
| P4 | Interstitial somente entre fases | feito no código |
| P5 | Fallback sem internet/API/no-fill | feito no código |
| P6 | Privacidade/termos atualizados | feito |
| P7 | Documentação operacional criada | feito |
| P8 | CMP certificado Google | feito: CMP Google de 3 opções |
| P9 | H5 Games Ads liberado | pendente de aprovação Google |
| P10 | Verificação AdSense após deploy | feito |
| P11 | Pedir revisão no AdSense | feito |
| P12 | Policy Center sem bloqueios | feito: AdSense mostrou “Não encontramos nenhum problema” |
| P13 | Teste E2E de anúncio/no-fill | feito com anúncio simulado, sem clique real |
| P14 | Teste offline/sem consentimento/no-fill | feito com fallback sem bloqueio de fase e sem pedido de anúncio antes do consentimento |
| P15 | Prova mobile pública | feito em `tmp/screenshots/cloudflare-interlevel-google-ads.png` |
| P16 | Monitorar consent audit | pendente |
| P17 | Monitorar receita por país | pendente após aprovação |
| P18 | Não criar campanha paga | guardrail ativo |
| P19 | Não instalar Clarity/pixel extra | guardrail ativo |
| P20 | Evidência final sanitizada | feito em `tmp/reports/cloudflare-interlevel-google-ads.json` |

## Fontes oficiais

- Ad Placement API: <https://developers.google.com/ad-placement/apis>
- Exemplo de implementação: <https://developers.google.com/ad-placement/docs/example>
- H5 Games Ads: <https://support.google.com/adsense/answer/1705831>
- Primeiros passos H5 Games Ads: <https://support.google.com/adsense/answer/9959170>
- Consentimento EEA/Reino Unido/Suíça: <https://support.google.com/adsense/answer/13554116>
- Guia ads.txt AdSense: <https://support.google.com/adsense/answer/12171612>
- Políticas AdSense: <https://support.google.com/adsense/answer/48182>
