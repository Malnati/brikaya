<!-- docs/rup/07-contribuicao/padroes-de-commit.md -->
# Padrões de Commit

> Base: [./padroes-de-commit.md](./padroes-de-commit.md)
> Plano: [/docs/rup/02-planejamento/roadmap-spec.md](/docs/rup/02-planejamento/roadmap-spec.md)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Arquitetura do App](/docs/rup/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/docs/rup/02-design/design-geral-spec.md) · [Testes end-to-end](/docs/rup/04-testes-e-validacao/testes-end-to-end-spec.md)

Este guia define a estrutura das mensagens de commit para preservar a rastreabilidade dos requisitos legados (`REQ-001` a `REQ-030`), alinhar-se às automações de build (`REQ-019`, `REQ-022`) e registrar impactos na capacidade colaborativa (`REQ-031`–`REQ-035`).

[Voltar ao índice](README-spec.md)

## 1. Estrutura recomendada
1. **Linha de assunto** — `tipo(escopo): resumo curto`
   - `tipo` em minúsculas (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`).
   - `escopo` descreve módulo ou artefato (`landing`, `api`, `docs`, `sql`, `infra`).
   - Inclua o requisito principal ao final da linha entre colchetes, por exemplo `feat(landing): ajusta onboarding cooperativas [REQ-001]`.
2. **Corpo** — frases curtas explicando:
   - Motivo da mudança e relação com protótipos ou código (ex.: `landing/src/pages/Home.tsx`, `docs/inputs/PRD_Plataforma_App_Completo.md`).
   - Evidências ou scripts executados (`npm run build`, `docker compose up -d`) com resultados relevantes para `REQ-015`, `REQ-019` e `REQ-022`.
3. **Rodapé** — use blocos `Refs:` para listar requisitos adicionais e issues.
   - `Refs: REQ-008, REQ-024, Issue #123`
   - Quando houver impacto colaborativo, acrescente `Collab: REQ-031` etc., garantindo convivência com os legados.

## 2. Checklist de conteúdo obrigatório
- [ ] Identificar pelo menos um requisito legado diretamente impactado (`REQ-001`–`REQ-030`).
- [ ] Referenciar artefatos modificados: canais digitais (`landing/src/**`), documentação (`docs/rup/**`, `docs/inputs/**`), infraestrutura (`docker-compose.yml`, `sql/**`).
- [ ] Declarar efeitos em governança ou auditoria (`REQ-022`, `REQ-029`) e anexar evidências geradas em `docs/reports/`.
- [ ] Incluir notas sobre compatibilidade com a capacidade colaborativa sempre que afetar scoring, filas, dashboards ou consentimentos (`REQ-031`–`REQ-035`).
- [ ] Mapear mudanças de acesso ou RBAC explicando impactos na hierarquia N0–N5 e citando o anexo de perfis para manter `REQ-001`, `REQ-011` e `REQ-040` sincronizados.

## 3. Exemplos práticos
```text
feat(api): habilita split climático no ledger [REQ-008]

- cria evento ImpactSplitConfirmed em docs/inputs/PRD_Plataforma_App_Completo.md
- adiciona variáveis de ambiente para climate-banking no docker-compose.yml
- evidência: docker compose up -d • docs/reports/20251201/liquidacao.log

Refs: REQ-003, REQ-011
Collab: REQ-032
```

```text
docs(rup): detalha passaporte digital verde [REQ-005]

- atualiza docs/rup/02-design/fluxos-spec.md com etapas de certificação
- referencia anexos exigidos pelos analistas socioambientais em docs/inputs/PRD_Plataforma_App_Completo.md
- registra mudança em CHANGELOG/20251120103000.md para manter rastreabilidade

Refs: REQ-014, REQ-029, Issue #241
```

```text
fix(docs): sincroniza matriz RBAC corporativa [REQ-011]

- atualiza docs/rup/07-contribuicao/contribuindo-spec.md com níveis N0–N5 e fluxo de MFA
- cruza com docs/inputs/sugestoes-controle-por-perfil-de-autorizacoes.md para manter SoD
- evidencia revisão de permissões em docs/reports/20251210/rbac-auditoria.md

Refs: REQ-001, REQ-040
```

## 4. Integração com pipelines
- `npm run build` (landing) e `docker compose config` devem ser executados e citados sempre que código ou infraestrutura for alterado, reforçando `REQ-019` e `REQ-022`.
- Commits que afetam segurança, consentimento ou privacidade precisam mencionar a atualização correspondente no diretório `CHANGELOG/` e nos relatórios de auditoria (`REQ-026`, `REQ-029`).
- **Nota colaborativa:** quando o commit habilitar funcionalidades de revisão humana ou scoring socioambiental, acrescente link para o capítulo relevante em [`capacidade-diagnostico-colaborativo-spec.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) e declare explicitamente que os critérios legados permanecem válidos.

[Voltar ao índice](README-spec.md)
