<!-- docs/rup/04-testes-e-validacao/testes-seguranca-e2e.md -->
# Testes End-to-End Complementares de Segurança

> Base: [./testes-seguranca-e2e.md](./testes-seguranca-e2e.md)
> Plano: [Roadmap integrado](../02-planejamento/roadmap-spec.md#marcos-principais)
> Changelog: [/CHANGELOG/20251120103000.md](/CHANGELOG/20251120103000.md)
> Referências correlatas: [Requisitos de segurança](../02-planejamento/requisitos-spec.md#req-011) · [Capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) · [Auditoria e rastreabilidade](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md)

## Objetivo
Complementar os E2E principais com cenários de segurança que comprovem proteção a credenciais, uploads, logs e colaboração multiorganizacional, mantendo conformidade com LGPD, BACEN e políticas MBRA. 【F:docs/rup/02-planejamento/requisitos-spec.md†L188-L260】

## E2E-SEC-001 — Credenciais e autenticação
- **Escopo:** autenticação multicanal, convites colaborativos e validação de tokens.  
- **Passos:**
  1. Simular login com credenciais vazias, base64 inválido e payload oversized (>10 KB).  
  2. Executar ataques de injeção (SQL, XSS, path traversal) via formulários públicos.  
  3. Confirmar bloqueio de convites colaborativos quando o domínio não é autorizado.  
- **Resultado esperado:** todas as tentativas rejeitadas, mensagens padronizadas e logs com timestamp/ID de operação sem exposição de dados sensíveis.  
- **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## E2E-SEC-002 — Uploads e tokenização segura
- **Escopo:** upload de documentos, geração de passaporte digital e emissão de tokens verdes.  
- **Passos:**
  1. Enviar arquivos acima do limite, tipos não permitidos e com conteúdo malicioso.  
  2. Desligar serviço externo e validar fallback (fila pendente + alerta).  
  3. Confirmar que tokenização só ocorre após parecer colaborativo positivo.  
- **Resultado esperado:** uploads inválidos rejeitados, fallback preserva dados no storage seguro, logs apontam ID do lote e do parecer.  
- **Requisitos:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-038](../02-planejamento/requisitos-spec.md#req-038).

## E2E-SEC-003 — Liquidação, split e auditoria
- **Escopo:** liquidação financeira, distribuição de incentivos e rastreabilidade de eventos.  
- **Passos:**
  1. Tentar manipular valores do split antes da assinatura.  
  2. Validar assinaturas digitais e evidências anexadas nos relatórios.  
  3. Checar logs estruturados em `docs/reports/` com hash do arquivo e ID do requisito.  
- **Resultado esperado:** alterações não autorizadas bloqueadas, comprovantes assinados e logs criptografados conforme política de governança. 【F:docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md†L31-L104】  
- **Requisitos:** [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-040](../02-planejamento/requisitos-spec.md#req-040).

## E2E-SEC-004 — Governança colaborativa e SLA
- **Escopo:** fila `CollabReviewBoard`, métricas de SLA humano vs. IA e integrações externas.  
- **Passos:**
  1. Enfileirar operação marcada pelo motor de scoring (`REQ-021`).  
  2. Forçar expiração de prazo e verificar alertas para analistas.  
  3. Garantir que dados compartilhados permanecem cifrados e acessíveis apenas a perfis autorizados.  
- **Resultado esperado:** alertas emitidos, prazos recontados, métricas atualizadas e logs sem vazamento de dados. 【F:docs/rup/02-planejamento/capacidade-diagnostico-colaborativo-spec.md†L120-L176】  
- **Requisitos:** [REQ-031](../02-planejamento/requisitos-spec.md#req-031), [REQ-034](../02-planejamento/requisitos-spec.md#req-034), [REQ-038](../02-planejamento/requisitos-spec.md#req-038).

## Critérios de aprovação específicos
- 100% dos subcenários acima aprovados em DEV e HML.  
- 0 vulnerabilidades críticas abertas após execução.  
- Mensagens de erro consistentes e sem vazamento de informações.  
- Performance mantida (tempo de resposta < 500 ms para bloqueios).  
- **Métricas monitoradas:** taxa de rejeição, tempo médio de bloqueio, ocorrências de vazamento (deve ser 0).  
- **Requisitos associados:** [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## Integração com CI/CD
- Executar suites de segurança em todo PR que altere autenticação, uploads ou liquidação.  
- Publicar relatórios em `docs/reports/` e anexar ao PR via checklist de governança.  
- Atualizar `audit-history.md` com resultado (`approved`/`blocked`) e ID do requisito.  
- Sincronizar métricas com dashboards colaborativos antes de liberar marcos do roadmap. 【F:docs/rup/02-planejamento/roadmap-spec.md†L40-L120】

[Voltar ao documento principal](./testes-end-to-end-spec.md)
