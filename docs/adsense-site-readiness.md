<!-- docs/adsense-site-readiness.md -->
# Brikaya — prontidão AdSense (conteúdo de baixo valor)

Última atualização: 2026-07-29.

## Fonte verificada

- Painel AdSense consultado em 2026-07-29: violação **Conteúdo de baixo valor**, com última atualização do diagnóstico em **2026-07-15 17:08 GMT-3**; botão “Confirmo que corrigi os problemas”.
- Políticas: [10502938](https://support.google.com/adsense/answer/10502938), [10015918](https://support.google.com/adsense/answer/10015918), [9044175](https://support.google.com/webmasters/answer/9044175), [11035931](https://support.google.com/publisherpolicies/answer/11035931).
- Produção v174 em 2026-07-29: landing rastreável em `/`, jogo em `/play/`, sitemap com 33 URLs, editoriais e páginas de confiança EN/PT-BR/ES-419, preview bloqueado e `ads.txt` público com `pub-9571619183194136`.
- Esta entrega amplia a profundidade das 21 páginas de confiança, exige pelo menos 500 palavras nos nove conteúdos editoriais e adiciona uma auditoria pública obrigatória ao deploy. O workflow só conclui a publicação quando o domínio canônico também passa nessa verificação.

**Veredito operacional:** a rejeição citada é editorial/qualitativa e antecede a remediação publicada. A estrutura pública já está controlada, mas checklist técnico sozinho não aprova o site. Esta entrega deve ser integrada, publicada e auditada no domínio canônico antes de confirmar a correção e pedir nova revisão no painel Sites.

Não confirme a correção enquanto o domínio público não comprovar o inventário e a profundidade desta entrega. A solicitação continua sendo uma ação autenticada no painel, fora do CI.

---

## O que o Google marcou

| Exigência | Status | Evidência |
|---|---|---|
| Conteúdo suficiente / não “baixo valor” | **VALIDADO NO BUILD; DEPLOY PROTEGIDO POR AUDITORIA PÚBLICA** | Landing + guias ≥ 500 palavras + páginas de confiança ≥ 280 palavras nas três edições de busca |
| Conteúdo exclusivo que explique o assunto | **Validado no build; publicação atômica** | Landing `/` + `/how-to-play/`, `/faq/`, `/updates/` (EN + PT-BR + ES-419) + páginas de confiança |
| Motivo para visitar e voltar (além do app) | **Validado localmente / RISCO residual** | Updates com log datado; sem blog massivo multilocalizado |
| Evitar páginas com pouco/nenhum conteúdo | **Gate obrigatório local e público** | As 21 páginas de confiança têm mínimo de 280 palavras; locales de jogo fora das edições de busca permanecem `noindex` |

O AdSense **só citou** conteúdo de baixo valor nesta rejeição. Outros motivos não foram inventados.

---

## Matriz de exigências (links oficiais)

Legenda: **OK** · **FALHA** · **RISCO** · **NV** (não verificável sem conta AdSense/GSC) · **N/A**.

### A) Conteúdo e UX ([10015918](https://support.google.com/adsense/answer/10015918))

| Exigência | Status | Nota |
|---|---|---|
| Bastante conteúdo exclusivo | **Gate OK / RISCO residual de decisão externa** | Landing + editoriais EN/PT-BR/ES-419 ≥ 500 palavras; 21 páginas de confiança ≥ 280 palavras |
| Atualizar conteúdo regularmente | **RISCO** | `/updates/` com entradas datadas; sem calendário editorial automatizado |
| Sem conteúdo duplicado / scraped | **Gate local e público** | Sitemap limitado a 33 URLs; auditoria compara o conteúdo principal de todas elas |
| Navegação clara | **OK parcial** | Landing `/` com CTA `/play/` + nav para guias/legais |
| Sem links quebrados / promessas falsas | **Gate local e público** | QA das edições verifica links internos; auditoria pública percorre todas as 33 URLs |
| Layout legível / multi-browser | **NV qualitativo** | Produto jogável ≠ valor editorial |

### B) Valor do inventário ([10502938](https://support.google.com/adsense/answer/10502938))

| Exigência | Status | Nota |
|---|---|---|
| Não monetizar telas sem conteúdo / baixo valor | **FALHA (citada)** | Tema da rejeição |
| Não “em construção” | **Gate público** | As 33 URLs precisam responder 200 com conteúdo completo após o deploy |
| Idioma suportado | **Gate local e público** | Edições de busca EN/PT-BR/ES-419 |
| Mais anúncio que conteúdo | **N/A agora** | Nenhuma unidade, placement ou runtime de publicidade integra a saída local desta fase. |
| Conteúdo ilegal / sexual / perigoso / enganoso | **OK aparente (não citado)** | Sem sinal no painel |
| Declarações desonestas / ads.txt | **OK público em 2026-07-29** | `https://brikaya.com/ads.txt` responde 200 com o publisher correto; o painel ainda mostrava o diagnóstico anterior |

### C) Spam / thin content Search

| Exigência | Status | Nota |
|---|---|---|
| Evitar thin content | **Gate local e público** | 33 URLs indexáveis: 3 landings + 9 editoriais + 21 páginas de confiança |
| Evitar doorway / cookie-cutter | **Gate local OK / risco editorial residual** | 284 locais jogáveis; somente EN/PT-BR/ES-419 têm edição indexável |
| Cloaking / scraped / UGC spam | **OK aparente / N/A** | Sem UGC |
| Manual actions no Search Console | **Sem pendência observada nesta auditoria** | Sitemap reenviado/processado em 2026-07-29 com 33 páginas descobertas; acompanhar cobertura após o recrawl |

### D) Painel Sites

| Item | Status | Nota |
|---|---|---|
| Propriedade | **Gate técnico OK** | Snippet único no `<head>` da landing canônica `/` + `ads.txt` no apex; o jogo e os locales não carregam código de publicidade. |
| Site pronto para anúncios | **NÃO** (até nova aprovação) | E-mail + painel |
| Pedir revisão | Ação autenticada após deploy e auditoria pública | O usuário autorizou a solicitação; CI não realiza o clique |

---

## Estrutura do site (veredito operacional)

| URL | Papel |
|---|---|
| `/` | Landing HTML crawlável e único local do snippet de verificação de propriedade |
| `/{locale}/`, `/play/` (e `/{locale}/play/`) | Edições/localizações sem snippet, loader ou unidades de publicidade; o atalho instalado permanece no jogo |
| `/how-to-play/`, `/faq/`, `/updates/` | Editoriais EN/PT-BR/ES-419 completos |
| `/downloads/` | Opções de instalação, acessíveis e `noindex,follow` |

Não usar `app.brikaya.com` para esta remediação: mesmo origin reduz DNS, segundo deploy e SW dual.

---

## Automação a cada deploy

**Não existe ferramenta oficial do Google que aprove “conteúdo valioso” no CI.** A decisão continua humana no painel Sites.

| Capacidade | Automatizável? | Limite |
|---|---|---|
| `ads.txt` + publisher | Sim | Não prova conteúdo |
| Snippet `ca-pub-…` na landing canônica `/` | Sim | Só propriedade/verificação; não carrega no jogo nem em locales |
| Palavras mínimas em landing + editoriais | Sim (proxy) | Limiar arbitrário do repo |
| CTA landing → `/play/` | Sim | Não substitui revisão |
| Sitemap: apenas edições editoriais completas EN/PT-BR/ES-419 | Sim | Evita clone raso de locale |
| [`accounts.policyIssues.list`](https://developers.google.com/adsense/management/reference/rest/v2/accounts.policyIssues) | Sim (OAuth) | Só issues **já** detectadas |
| Aprovação “baixo valor” | **Não** | Só revisão Sites |

Gates:

- build: `npm run verify:adsense-ready-proxy`;
- produção pós-deploy: `npm run verify:adsense-public-ready`.

Ambos são provas técnicas, não aprovação AdSense.

#### Fluxo de validação e revisão

- Links: [fonte Mermaid](assets/diagrams/adsense-readiness-flow.mmd) / [SVG](assets/diagrams/adsense-readiness-flow.svg) / [JPEG](assets/diagrams/adsense-readiness-flow.jpg)

```mmd
flowchart LR
  deploy["Build e deploy"]
  proxy["Gate técnico local"]
  api["Issues já detectadas"]
  human["Revisão humana do site"]
  deploy --> proxy
  proxy --> passFail["Resultado técnico"]
  api --> known["Issues conhecidas"]
  human --> verdict["Decisão externa"]
  passFail -.-> human
  known -.-> human
```

---

## Remediação neste repositório

1. Landing rastreável em `/` + jogo em `/play/` no mesmo domínio.
2. Páginas editoriais crawláveis: `/how-to-play/`, `/faq/`, `/updates/` em **en-US**, **pt-BR** e **es-419**; as três URLs espanholas são traduções automáticas completas do conteúdo canônico.
3. Sete páginas de confiança em cada edição, totalizando 21 URLs com mínimo de 280 palavras, e gate atômico de tradução.
4. Service Worker network-first para documentos HTML + recovery na landing (PWA standalone → `/play/`).
5. Gate `verify:adsense-ready-proxy` no build/CI e `verify:adsense-public-ready` depois do deploy: snippet único em `/`, `ads.txt`, sitemap com 33 URLs, profundidade, canônicas, `hreflang`, exclusões `noindex`, links e conteúdo principal distinto.
6. Nenhuma unidade, placement, H5 API ou UI de publicidade integra a saída desta fase; o jogo e seus assets continuam independentes de scripts externos.
7. Estado operacional em [`docs/monetizacao-google.md`](monetizacao-google.md).

Aprovação AdSense/H5 **nunca é garantida**.

## Edição editorial em espanhol

As páginas `es-419` são traduções sem revisão jurídica humana. O gate automático exige estrutura completa, mínimo de 280 palavras nas sete páginas de confiança, metadados, links internos, canônica, `hreflang`, `x-default`, idioma e navegação antes de tornar as 11 URLs espanholas indexáveis como um conjunto. Ainda existe risco residual de qualidade linguística, jurídica e de busca; a tradução não deve ser tratada como revisão profissional. O conteúdo continua sendo orientação substantiva do produto para jogadores, não variações de palavras-chave.

A edição espanhola completa também inclui a landing e as sete páginas de confiança indexáveis. Seus textos e navegação são em espanhol latino-americano e apontam diretamente para as guias `es-419`; nenhuma dessas 11 URLs é elegível de forma isolada.
