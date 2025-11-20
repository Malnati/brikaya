<!-- docs/checklists/010-ux-brand-checklist.md -->
# Checklist de UX, Branding e Acessibilidade

## Identidade Visual
- [ ] Confirmar aplicação da paleta da organização (primária, secundária, acentos) e respeito à regra 60-30-10 em todas as telas.
- [ ] Garantir que tipografia, espaçamentos e ícones seguem o design system documentado (regra 4x2, Material Symbols Rounded).
- [ ] Verificar que variantes white-label podem ajustar logotipo, cores e contatos via `branding.js` e helpers associados.

## Experiência do Usuário
- [ ] Checar consistência entre protótipos navegáveis (`prototype/`) e componentes implementados na UI/Extensão.
- [ ] Validar microcopy clínica (botões, descrições, toasts) mantendo tom orientado à ação e clareza regulatória.
- [ ] Confirmar que estados vazios, erros e sucesso exibem instruções práticas e acessíveis.

## Acessibilidade
- [ ] Garantir contraste mínimo AA e foco visível em todos os elementos interativos.
- [ ] Verificar suporte completo a navegação por teclado, leitores de tela e descrição de mídias relevantes.
- [ ] Validar feedback auditivo/visual para notificações críticas e controles de player de áudio.

## Conteúdos e Materiais de Suporte
- [ ] Confirmar que e-mails, notificações e materiais educativos refletem identidade visual e diretrizes de UX.
- [ ] Garantir atualização de templates HTML (`prototype/email-*.html`) ao introduzir novas mensagens ou personas.
