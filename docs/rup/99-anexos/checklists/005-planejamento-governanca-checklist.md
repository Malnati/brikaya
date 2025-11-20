<!-- docs/checklists/005-planejamento-governanca-checklist.md -->
# Checklist de Planejamento, Cronograma e Governança

## Gestão de Requisitos
- [ ] Validar que o catálogo `requisitos.md` mantém IDs `REQ-###` com status atualizados e vínculos às fases RUP.
- [ ] Confirmar exportação automática de requisitos para JSON e relatórios em `docs/reports/`.
- [ ] Checar que alterações em requisitos possuem PR exclusivo, aprovação humana e de IA, além de referência cruzada no changelog.
- [ ] Garantir correlação entre requisitos, testes, arquitetura, design, implantação e governança conforme matriz descrita na especificação.

## Cronograma e Roadmap
- [ ] Revisar cronograma oficial para marcos de extensão Chrome, APIs e auditorias, garantindo datas coerentes com a execução.
- [ ] Validar roadmap estratégico com fases RUP e dependências críticas (aprovação, IA, notificações, publicação na Chrome Web Store).
- [ ] Confirmar milestones documentadas, com critérios de conclusão objetivos e responsáveis definidos.
- [ ] Checar que WBS detalha pacotes de trabalho, estimativas e relacionamentos entre tarefas.

## Governança e Capacidade Colaborativa
- [ ] Garantir que o plano de governança descreve ritos, papéis e decisões (comitês, aprovação clínica, auditoria técnica).
- [ ] Verificar aderência à capacidade de diagnóstico colaborativo (`REQ-031` a `REQ-045`), incluindo sincronização com riscos e relatórios.
- [ ] Confirmar que fluxos de aprovação, onboarding e auditoria refletem as diretrizes corporativas da organização.

## Riscos e Mitigações
- [ ] Revisar matriz `riscos-e-mitigacoes.md`, garantindo que cada risco possui ID `RISK-###`, descrição, probabilidade, impacto, plano de mitigação e responsável.
- [ ] Validar que riscos críticos (LGPD, disponibilidade das APIs, políticas Chrome, governança médica) possuem monitoramento ativo.
- [ ] Confirmar que novos riscos ou mudanças são registrados e sincronizados com auditorias e requisitos relacionados.

## Comunicação e Stakeholders
- [ ] Checar que stakeholders estão associados a responsabilidades no planejamento e recebem atualizações conforme cronograma.
- [ ] Garantir que dependências externas (SSO, ElevenLabs, notificações omnicanal) têm canais e SLAs definidos.
