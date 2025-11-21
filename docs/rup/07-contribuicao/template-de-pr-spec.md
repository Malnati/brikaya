<!-- docs/rup/07-contribuicao/template-de-pr.md -->
# Template de PR

> Base: [./template-de-pr.md](./template-de-pr.md)
> Plano: [/docs/rup/02-planejamento/roadmap-spec.md](/docs/rup/02-planejamento/roadmap-spec.md)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Arquitetura do App](/docs/rup/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/docs/rup/02-design/design-geral-spec.md) · [Testes end-to-end](/docs/rup/04-testes-e-validacao/testes-end-to-end-spec.md)

Use o modelo abaixo para manter rastreabilidade completa entre código, protótipos e requisitos (`REQ-001` a `REQ-030`), além de registrar convivência com a capacidade colaborativa (`REQ-031`–`REQ-035`).

[Voltar ao índice](README-spec.md)

---

```markdown
## Descrição
- [ ] Resumo objetivo da mudança
- [ ] Artefatos atualizados (ex.: `landing/src/pages/Home.tsx`, `docs/inputs/PRD_Plataforma_App_Completo.md`, `docker-compose.yml`)
- [ ] Evidências anexadas em `docs/reports/YYYYMMDD/`

## Requisitos atendidos
- [ ] REQ-___ — descrição do impacto (link para [catálogo](../02-planejamento/requisitos-spec.md#req-___))
- [ ] REQ-___ — descrição do impacto adicional
- [ ] N/A

> Inclua referências adicionais em `Refs:` quando mais de três requisitos forem afetados.

## Validações executadas
- [ ] `npm run build` (landing) — reforça [REQ-019](../02-planejamento/requisitos-spec.md#req-019)
- [ ] `npm run preview`
- [ ] `docker compose config`
- [ ] Outra: ________ (ex.: `npm run test`, `npm run lint` se adicionados)

## Impacto colaborativo
- [ ] Não há mudanças que afetem REQ-031–REQ-035
- [ ] Há impacto e foi documentado:
  - [ ] Revisão de crédito verde ([REQ-031](../02-planejamento/requisitos-spec.md#req-031))
  - [ ] Roteamento de especialistas e filas colaborativas ([REQ-032](../02-planejamento/requisitos-spec.md#req-032))
  - [ ] Interface de validação humana ([REQ-033](../02-planejamento/requisitos-spec.md#req-033))
  - [ ] Métricas e auditoria climática ([REQ-034](../02-planejamento/requisitos-spec.md#req-034))
  - [ ] Integrações regulatórias e HIS/LIS parceiros ([REQ-035](../02-planejamento/requisitos-spec.md#req-035))

## Controles de acesso e cadastros críticos
- [ ] Fluxos de RBAC/multi-perfis verificados conforme níveis N0–N5 e segregação de funções.
- [ ] Campos cadastrais de organização, unidades, lotes, logística e certificações mantidos íntegros.
- [ ] Evidências de auditoria ESG anexadas quando houver novos relatórios ou indicadores.

## Checklist adicional
- [ ] Atualizei `CHANGELOG/` quando aplicável (`REQ-029`)
- [ ] Confirmei conformidade com políticas BACEN/LGPD (`REQ-024`–`REQ-028`) e permissões de infraestrutura (`REQ-030`)
- [ ] Revisei textos conforme `AGENTS.md` e regras de UX Writing (`REQ-016`, `REQ-028`)
- [ ] Anexei prints ou vídeos para mudanças em UI (`landing/src/pages/Home.tsx`, `landing/src/pages/VideosPage.tsx`)
- [ ] Cruzei alterações de RBAC com `docs/inputs/sugestoes-controle-por-perfil-de-autorizacoes.md` para manter rastreabilidade (`REQ-001`, `REQ-011`, `REQ-040`).

## Observações
- Itens pendentes, riscos, dependências ou notas para o revisor.
```

---

**Dicas rápidas**
- Compare o PR com os fluxos descritos em [`docs/rup/02-design/fluxos-spec.md`](../02-design/fluxos-spec.md) e com o inventário de requisitos em [`docs/inputs/PRD_Plataforma_App_Completo.md`](../../docs/inputs/PRD_Plataforma_App_Completo.md) para garantir aderência funcional (`REQ-003`, `REQ-005`).
- Ao alterar pipelines financeiros ou de liquidação, cite explicitamente `REQ-008` e vincule commits relevantes.
- Para atualizações de consentimento, privacidade ou termos legais, inclua capturas das páginas `landing/src/pages/PrivacyPolicyPage.tsx` e `landing/src/pages/TermsOfUsePage.tsx`, destacando o ID da política (`REQ-024`–`REQ-028`).

[Voltar ao índice](README-spec.md)
