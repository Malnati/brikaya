<!-- docs/adsense-site-readiness.md -->
# Brikaya — prontidão AdSense (conteúdo de baixo valor)

Última atualização: 2026-07-16.

## Fonte verificada

- Painel/e-mail AdSense (2026-07): violação **Conteúdo de baixo valor** em `brikaya.com`; botão “Confirmo que corrigi os problemas”.
- Políticas: [10502938](https://support.google.com/adsense/answer/10502938), [10015918](https://support.google.com/adsense/answer/10015918), [9044175](https://support.google.com/webmasters/answer/9044175), [11035931](https://support.google.com/publisherpolicies/answer/11035931).
- Live + código: landing crawlável em `/`, jogo em `/play/`, páginas legais reforçadas (EN), editoriais EN/PT (`/how-to-play/`, `/faq/`, `/updates/`); SW network-first para HTML; `ads.txt` com `pub-9571619183194136`.

**Veredito operacional:** a rejeição citada é editorial/qualitativa. A remediação estrutural (landing + `/play/` + guias + legais EN densas + recovery de SW) está publicada. Checklist técnico sozinho não aprova o site. Só peça revisão no AdSense **depois** de validar o inventário público e de forma intencional no painel Sites.

Não clique em “Confirmo que corrigi” com o apex ainda só em shell de jogo + legais curtas (histórico). O estado atual já não é esse shell; ainda assim a confirmação no painel continua humana e fora do CI.

---

## O que o Google marcou

| Exigência | Status | Evidência |
|---|---|---|
| Conteúdo suficiente / não “baixo valor” | **EM REMEDIAÇÃO PUBLICADA** — aguarda revisão humana | Landing + `/play/` + guias + legais EN densas |
| Conteúdo exclusivo que explique o assunto | **Remediação publicada** | Landing `/` + `/how-to-play/`, `/faq/`, `/updates/` (EN + PT-BR) + about |
| Motivo para visitar e voltar (além do app) | **Remediação publicada (risco residual)** | Updates com log datado; sem blog massivo multilocalizado |
| Evitar páginas com pouco/nenhum conteúdo | **RISCO residual** | Legais EN reforçadas; demais locales legais ainda podem ser mais curtos via tradução legada |

O AdSense **só citou** conteúdo de baixo valor nesta rejeição. Outros motivos não foram inventados.

---

## Matriz de exigências (links oficiais)

Legenda: **OK** · **FALHA** · **RISCO** · **NV** (não verificável sem conta AdSense/GSC) · **N/A**.

### A) Conteúdo e UX ([10015918](https://support.google.com/adsense/answer/10015918))

| Exigência | Status | Nota |
|---|---|---|
| Bastante conteúdo exclusivo | **Remediação publicada / RISCO residual** | Landing + editoriais EN/PT; legais EN ≥ proxy; locales legais traduzidos podem ficar atrás |
| Atualizar conteúdo regularmente | **RISCO** | `/updates/` com entradas datadas; sem calendário editorial automatizado |
| Sem conteúdo duplicado / scraped | **OK parcial / RISCO** | Texto original; sitemap ainda multiplica locales legais |
| Navegação clara | **OK parcial** | Landing `/` com CTA `/play/` + nav para guias/legais |
| Sem links quebrados / promessas falsas | **NV + amostragem** | Rotas canônicas amostradas; 2.800+ URLs não auditadas uma a uma |
| Layout legível / multi-browser | **NV qualitativo** | Produto jogável ≠ valor editorial |

### B) Valor do inventário ([10502938](https://support.google.com/adsense/answer/10502938))

| Exigência | Status | Nota |
|---|---|---|
| Não monetizar telas sem conteúdo / baixo valor | **FALHA (citada)** | Tema da rejeição |
| Não “em construção” | **OK aparente** | HTTP 200 no domínio público |
| Idioma suportado | **OK aparente** | PT/EN e outros |
| Mais anúncio que conteúdo | **N/A agora** | `__BRIKAYA_GOOGLE_ADS_ENABLED__ = false` |
| Conteúdo ilegal / sexual / perigoso / enganoso | **OK aparente (não citado)** | Sem sinal no painel |
| Declarações desonestas / ads.txt | **OK aparente** | `ads.txt` live correto |

### C) Spam / thin content Search

| Exigência | Status | Nota |
|---|---|---|
| Evitar thin content | **Remediação publicada / RISCO residual** | Landing + editoriais EN/PT + legais EN; fan-out legal multilocalizado permanece |
| Evitar doorway / cookie-cutter | **RISCO** | Muitos locales × templates legais |
| Cloaking / scraped / UGC spam | **OK aparente / N/A** | Sem UGC |
| Manual actions no Search Console | **NV** | Sem acesso GSC nesta documentação |

### D) Painel Sites

| Item | Status | Nota |
|---|---|---|
| Propriedade | **NV no painel** | Snippet em `/play/` + `ads.txt` no apex |
| Site pronto para anúncios | **NÃO** (até nova aprovação) | E-mail + painel |
| Pedir revisão | Humano no painel Sites após inventário público ok | Não confirmar correção via CI; não automatizar o clique |

---

## Estrutura do site (veredito operacional)

| URL | Papel |
|---|---|
| `/` (e `/{locale}/`) | Landing HTML crawlável (prosa + links a guias/legais + CTA) |
| `/play/` (e `/{locale}/play/`) | SPA do jogo; snippet AdSense H5; PWA `start_url` |
| `/how-to-play/`, `/faq/`, `/updates/` | Editoriais EN/PT |
| `/downloads/` | SPA de instalação |

Não usar `app.brikaya.com` para esta remediação: mesmo origin reduz DNS, segundo deploy e SW dual.

---

## Automação a cada deploy

**Não existe ferramenta oficial do Google que aprove “conteúdo valioso” no CI.** A decisão continua humana no painel Sites.

| Capacidade | Automatizável? | Limite |
|---|---|---|
| `ads.txt` + publisher | Sim | Não prova conteúdo |
| Snippet `ca-pub-…` em `/play/` | Sim | Só propriedade/verificação |
| Palavras mínimas em landing + editoriais | Sim (proxy) | Limiar arbitrário do repo |
| CTA landing → `/play/` | Sim | Não substitui revisão |
| Sitemap: editoriais só EN/PT | Sim | Evita thin locale clone |
| [`accounts.policyIssues.list`](https://developers.google.com/adsense/management/reference/rest/v2/accounts.policyIssues) | Sim (OAuth) | Só issues **já** detectadas |
| Aprovação “baixo valor” | **Não** | Só revisão Sites |

Gate local: `npm run verify:adsense-ready-proxy` (documentado como **proxy**, não como aprovação AdSense).

```mermaid
flowchart LR
  deploy[Deploy CI]
  proxy[verify:adsense-ready-proxy]
  api[AdSense API policyIssues]
  human[Revisão Google Sites]
  deploy --> proxy
  proxy --> passFail[Pass ou fail técnico]
  api --> known[Issues conhecidas]
  human --> verdict[Aprovado ou baixo valor]
  passFail -.-> human
  known -.-> human
```

---

## Remediação neste repositório

1. Landing crawlável em `/` + jogo em `/play/` (mesmo domínio).
2. Páginas editoriais crawláveis: `/how-to-play/`, `/faq/`, `/updates/` em **en-US** e **pt-BR** apenas.
3. Legais EN densas (about/privacy/terms/support/cookies) com gate proxy de palavras no default locale.
4. Service Worker network-first para documentos HTML + recovery na landing (PWA standalone → `/play/`).
5. Gate `verify:adsense-ready-proxy` no `build` / CI.
6. Estado operacional em [`docs/monetizacao-google.md`](monetizacao-google.md).

Aprovação AdSense/H5 **nunca é garantida**.
