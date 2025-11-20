<!-- docs/checklists/004-design-experiencia-checklist.md -->
# Checklist de Design e Experiência do Usuário

## Princípios Gerais
- [ ] Garantir que jornadas críticas (aprovação → onboarding → dashboard → fila → compartilhamento) estejam documentadas e implementadas conforme RUP-02-DES-001.
- [ ] Verificar hierarquia orientada à decisão com destaque para KPIs clínicos, ações de retry e pendências administrativas.
- [ ] Confirmar clareza clínica na microcopy, seguindo diretrizes de UX Writing e compliance.
- [ ] Assegurar escalabilidade white-label aplicando tokens de cor e tipografia derivados de `branding.js`.
- [ ] Validar estados visuais consistentes (loading, sucesso, erro, vazio) com ícones, descrições e ações.

## Responsividade e Regras Cromáticas
- [ ] Checar responsividade entre 320 px e 1280 px, com colunas adequadas e foco visível em todos os breakpoints.
- [ ] Garantir aplicação da regra cromática 60-30-10 e registro da medição nos relatórios de QA.
- [ ] Validar que CTAs utilizam apenas a cor de destaque com contraste AA e feedback ≤ 200 ms.

## Componentes Principais
- [ ] Confirmar que Login (`Login.tsx`) gerencia bloqueios por aprovação pendente com mensagens e suporte adequados.
- [ ] Verificar ApprovalStatus com variantes `PENDING`, `REJECTED`, `APPROVED` alinhadas ao protótipo.
- [ ] Garantir que OnboardingFlow coordena etapas com persistência via helpers compartilhados e Atomic Design aplicado.
- [ ] Checar Upload (`Upload.tsx`) com progresso, opções de áudio, orientações de confidencialidade e fallback `UploadHelper`.
- [ ] Validar DiagnosticQueue com estados e ações (retry, compartilhar, baixar) sincronizadas com protótipo.
- [ ] Revisar DashboardOverview com métricas, insights e integração de branding.
- [ ] Confirmar componentes de compartilhamento com validação de contatos e confirmações de envio.

## Diretrizes Estruturais
- [ ] Assegurar organização em `app/ui/src/components/<feature>` obedecendo ao Feature-Sliced Design.
- [ ] Validar uso de Material Symbols Rounded, tipografia 4x2 (Manrope/Inter) e microinterações ≤ 300 ms.
- [ ] Checar classificação Atomic Design (átomos, moléculas, organismos) para novas features, evitando duplicação.
- [ ] Garantir que fluxos documentados na extensão (`extension/src/`) mantenham paridade com a aplicação web e sincronizem IndexedDB.

## Diagramas e Evidências
- [ ] Confirmar existência de diagramas PlantUML/Mermaid quando fluxos são atualizados.
- [ ] Registrar anexos de revisão UX, análise cromática e tokens sempre que o design sofrer alteração.
