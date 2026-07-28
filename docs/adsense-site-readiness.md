<!-- docs/adsense-site-readiness.md -->
# Brikaya — prontidão AdSense (conteúdo de baixo valor)

Última atualização: 2026-07-27.

## Fonte verificada

- Painel/e-mail AdSense (2026-07): violação **Conteúdo de baixo valor** em `brikaya.com`; botão “Confirmo que corrigi os problemas”.
- Políticas: [10502938](https://support.google.com/adsense/answer/10502938), [10015918](https://support.google.com/adsense/answer/10015918), [9044175](https://support.google.com/webmasters/answer/9044175), [11035931](https://support.google.com/publisherpolicies/answer/11035931).
- Implementação no worktree: landing crawlável em `/`, jogo em `/play/`, editoriais e páginas de confiança EN/PT-BR/ES-419, SW network-first para HTML e `ads.txt` com `pub-9571619183194136`.
- Validação pública desta revisão: **pendente de merge, deploy de produção e prova no domínio canônico**.

**Veredito operacional:** a rejeição citada é editorial/qualitativa. A remediação estrutural está validada localmente, mas não deve ser tratada como publicada até existir prova pós-deploy no domínio canônico. Checklist técnico sozinho não aprova o site. Só peça revisão no AdSense **depois** dessa validação pública e de forma intencional no painel Sites.

Não clique em “Confirmo que corrigi” enquanto o domínio público não comprovar o inventário controlado desta revisão. A saída local já não é o shell histórico com páginas curtas; a confirmação no painel continua humana e fora do CI.

---

## O que o Google marcou

| Exigência | Status | Evidência |
|---|---|---|
| Conteúdo suficiente / não “baixo valor” | **VALIDADO LOCALMENTE; PUBLICAÇÃO PENDENTE** | Landing + `/play/` + guias + páginas de confiança das três edições de busca |
| Conteúdo exclusivo que explique o assunto | **Validado localmente; publicação pendente** | Landing `/` + `/how-to-play/`, `/faq/`, `/updates/` (EN + PT-BR + ES-419) + about |
| Motivo para visitar e voltar (além do app) | **Validado localmente / RISCO residual** | Updates com log datado; sem blog massivo multilocalizado |
| Evitar páginas com pouco/nenhum conteúdo | **Gate local OK; prova pública pendente** | Sete páginas de confiança ES-419 com mínimo de 280 palavras; locales de jogo fora das edições de busca permanecem `noindex` |

O AdSense **só citou** conteúdo de baixo valor nesta rejeição. Outros motivos não foram inventados.

---

## Matriz de exigências (links oficiais)

Legenda: **OK** · **FALHA** · **RISCO** · **NV** (não verificável sem conta AdSense/GSC) · **N/A**.

### A) Conteúdo e UX ([10015918](https://support.google.com/adsense/answer/10015918))

| Exigência | Status | Nota |
|---|---|---|
| Bastante conteúdo exclusivo | **Validado localmente / RISCO residual** | Landing + editoriais EN/PT-BR/ES-419; sete páginas de confiança ES-419 ≥ proxy |
| Atualizar conteúdo regularmente | **RISCO** | `/updates/` com entradas datadas; sem calendário editorial automatizado |
| Sem conteúdo duplicado / scraped | **Gate local OK / prova pública pendente** | Sitemap local limitado a 33 URLs das três edições completas |
| Navegação clara | **OK parcial** | Landing `/` com CTA `/play/` + nav para guias/legais |
| Sem links quebrados / promessas falsas | **Gate local + NV público** | QA espanhol verifica links internos gerados; domínio público ainda precisa de prova pós-deploy |
| Layout legível / multi-browser | **NV qualitativo** | Produto jogável ≠ valor editorial |

### B) Valor do inventário ([10502938](https://support.google.com/adsense/answer/10502938))

| Exigência | Status | Nota |
|---|---|---|
| Não monetizar telas sem conteúdo / baixo valor | **FALHA (citada)** | Tema da rejeição |
| Não “em construção” | **NV nesta revisão** | Requer HTTP e conteúdo pós-deploy no domínio público |
| Idioma suportado | **Gate local OK; público pendente** | Edições de busca EN/PT-BR/ES-419 |
| Mais anúncio que conteúdo | **N/A agora** | Nenhuma unidade, placement ou runtime de publicidade integra a saída local desta fase. |
| Conteúdo ilegal / sexual / perigoso / enganoso | **OK aparente (não citado)** | Sem sinal no painel |
| Declarações desonestas / ads.txt | **Gate local OK; live pendente** | `dist/ads.txt` é obrigatório e confere com a fonte pública do build |

### C) Spam / thin content Search

| Exigência | Status | Nota |
|---|---|---|
| Evitar thin content | **Gate local OK / prova pública pendente** | 33 URLs indexáveis: 3 landings + 9 editoriais + 21 páginas de confiança |
| Evitar doorway / cookie-cutter | **Gate local OK / risco editorial residual** | 284 locais jogáveis; somente EN/PT-BR/ES-419 têm edição indexável |
| Cloaking / scraped / UGC spam | **OK aparente / N/A** | Sem UGC |
| Manual actions no Search Console | **NV** | Sem acesso GSC nesta documentação |

### D) Painel Sites

| Item | Status | Nota |
|---|---|---|
| Propriedade | **NV no painel** | Snippet único no `<head>` da landing canônica `/` + `ads.txt` no apex; o jogo e os locales não carregam código de publicidade. |
| Site pronto para anúncios | **NÃO** (até nova aprovação) | E-mail + painel |
| Pedir revisão | Humano no painel Sites após inventário público ok | Não confirmar correção via CI; não automatizar o clique |

---

## Estrutura do site (veredito operacional)

| URL | Papel |
|---|---|
| `/` | Landing HTML crawlável e único local do snippet de verificação de propriedade |
| `/{locale}/`, `/play/` (e `/{locale}/play/`) | Edições/localizações sem snippet, loader, unidades ou bootstrap de publicidade; PWA `start_url` permanece no jogo |
| `/how-to-play/`, `/faq/`, `/updates/` | Editoriais EN/PT-BR/ES-419 completos |
| `/downloads/` | SPA de instalação |

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

Gate local: `npm run verify:adsense-ready-proxy` (documentado como **proxy**, não como aprovação AdSense).

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

1. Landing crawlável em `/` + jogo em `/play/` (mesmo domínio), validados no build local.
2. Páginas editoriais crawláveis: `/how-to-play/`, `/faq/`, `/updates/` em **en-US**, **pt-BR** e **es-419**; as três URLs espanholas são traduções automáticas completas do conteúdo canônico.
3. Sete páginas de confiança ES-419 com mínimo de 280 palavras e gate atômico da edição espanhola.
4. Service Worker network-first para documentos HTML + recovery na landing (PWA standalone → `/play/`).
5. Gate `verify:adsense-ready-proxy` no `build` / CI: snippet único em `/`, `dist/ads.txt`, `dist/sitemap.xml` com 33 URLs, edição EN/PT/ES e exclusões `noindex`.
6. Nenhuma unidade, placement, H5 API ou UI de publicidade integra a saída desta fase; o jogo e seus assets continuam independentes de scripts externos.
7. Estado operacional em [`docs/monetizacao-google.md`](monetizacao-google.md).

Aprovação AdSense/H5 **nunca é garantida**.

## Edição editorial em espanhol

As páginas `es-419` são traduções sem revisão jurídica humana. O gate automático exige estrutura completa, mínimo de 280 palavras nas sete páginas de confiança, metadados, links internos, canônica, `hreflang`, `x-default`, idioma e navegação antes de tornar as 11 URLs espanholas indexáveis como um conjunto. Ainda existe risco residual de qualidade linguística, jurídica e de busca; a tradução não deve ser tratada como revisão profissional. O conteúdo continua sendo orientação substantiva do produto para jogadores, não variações de palavras-chave.

A edição espanhola completa também inclui a landing e as sete páginas de confiança indexáveis. Seus textos e navegação são em espanhol latino-americano e apontam diretamente para as guias `es-419`; nenhuma dessas 11 URLs é elegível de forma isolada.
