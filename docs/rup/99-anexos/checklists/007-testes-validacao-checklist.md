<!-- docs/checklists/007-testes-validacao-checklist.md -->
# Checklist de Testes e Validação

## Estratégia de QA
- [ ] Confirmar que o plano de testes cobre jornadas ponta a ponta (aprovação, onboarding, upload, geração de áudio, notificações).
- [ ] Garantir que suites automatizadas (unit, integration, e2e) estão mapeadas para requisitos `REQ-###` correspondentes.
- [ ] Verificar critérios de aceite definidos por fase RUP e vincular evidências em `docs/reports/`.

## Testes Automatizados
- [ ] Checar que testes unitários do NestJS cobrem controllers, services e DTOs críticos (`diagnostics`, `notifications`, `onboarding`).
- [ ] Validar que testes de integração exercitam fluxos HTTP (`/diagnostics/submit`, `/notifications/*`, `/onboarding/*`).
- [ ] Garantir que testes E2E utilizam Puppeteer conforme política do `AGENTS.md`, executando via `npm run test:e2e`.
- [ ] Confirmar que métricas de cobertura atendem limites definidos e são reportadas.

## Testes Manuais e Auditorias
- [ ] Registrar roteiros manuais para acessibilidade, responsividade e conformidade cromática 60-30-10.
- [ ] Validar checagens de LGPD (consentimento, revogação, armazenamento local) durante a validação manual.
- [ ] Checar execução de auditorias periódicas previstas em `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/` e anexar relatórios.

## Gestão de Defeitos e Regressões
- [ ] Garantir que defeitos críticos abertos sejam rastreados com IDs, plano de correção e status nos relatórios de QA.
- [ ] Confirmar que regressões de performance (>10%) ou acessibilidade geram bloqueio até correção documentada.
