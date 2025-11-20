<!-- docs/rup/03-agentes-ia/politicas-e-regras.md -->
# Políticas e Regras

> Base: [./politicas-e-regras.md](./politicas-e-regras.md)
> Rastreabilidade: [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-031](../02-planejamento/requisitos-spec.md#req-031)
> Legados correlatos: [REQ-024](../02-planejamento/requisitos-spec.md#req-024)–[REQ-035](../02-planejamento/requisitos-spec.md#req-035)

As regras abaixo regem o uso de agentes de IA no App, alinhando LGPD, Open Finance e governança socioambiental. Mantemos a equivalência com as políticas criadas no projeto Yagnostic para garantir rastreabilidade histórica.

- **Supervisão humana contínua** — toda execução deve ter owner humano registrado em `docs/reports/agents/`, citando os IDs de requisito atuais e legados atendidos. Sem owner não há autorização para publicação.
- **Ambientes controlados** — agentes operam apenas com dados sintéticos ou mascarados; uso de produção é vedado. Processos que exigem informação sensível devem solicitar revisão humana e registrar consentimentos, conforme [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- **Logs e auditoria** — outputs precisam ser arquivados por 12 meses em `docs/reports/`, vinculando `run_id`, `commit`, `req_ids`, `legados` e `collaboration_ticket_id`. O procedimento atende [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023), além dos legados [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- **Proteção de segredos** — prompts e credenciais ficam em cofres dedicados; é proibido hardcode ou armazenamento em histórico de chat. Alinhamento com [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e com o legado [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- **Convivência colaborativa** — quando a IA sugerir decisões que dependem de especialistas (ex.: liberação de crédito verde), registre a recomendação como `suggestion`, aguarde aprovação humana e documente o desfecho seguindo [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e os legados [REQ-031](../02-planejamento/requisitos-spec.md#req-031)–[REQ-033](../02-planejamento/requisitos-spec.md#req-033).

Políticas detalhadas e checklists atualizados residem em [`../06-governanca-tecnica-e-controle-de-qualidade/`](../06-governanca-tecnica-e-controle-de-qualidade/README-spec.md). Sempre que houver alteração, mantenha toda a documentação sincronizada no diretório `docs/rup/` e registre a evidência no changelog.

[Voltar à seção de agentes](README-spec.md)
