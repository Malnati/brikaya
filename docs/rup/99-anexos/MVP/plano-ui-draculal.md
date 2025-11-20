<!-- docs/rup/99-anexos/MVP/plano-ui-draculal.md -->
# Plano para Aplicar Tema Dracula no App

## Propósito
Aplicar o tema Dracula no app. Garantir coerência visual, legibilidade e aderência às regras de simplicidade e grid 8pt.

## Premissas
- Usar tokens de cor e tipografia existentes como base. Evitar valores fora da escala 8pt.
- Manter cabeçalhos de caminho e estrutura RUP. Referenciar requisitos e riscos quando houver impacto.
- Escrever textos curtos e acionáveis, sem fluxos inventados.

## Inventário de Arquivos Alvo
- `app/ui/tailwind.config.js`: registrar a paleta Dracula em `theme.extend.colors` e tokens auxiliares.
- `app/ui/src/index.css` e `app/ui/src/App.tsx`: aplicar variáveis globais, background padrão e estado de layout base.
- `app/ui/src/components/` (botões, inputs, cards): ajustar variantes para uso dos tokens de cor, borda e foco.
- `app/ui/public/` (favicons, manifest): validar contraste de ícones e manifest caso a paleta altere legibilidade.
- `docs/rup/06-ux-brand/identidades-visuais-spec.md`: alinhar referências de uso de cores e fundos do logo quando o tema impactar aplicações visuais.

## Sequência de Ações
1. Mapear a paleta Dracula (foreground, background, seleção, foco). Criar tokens no Tailwind.
2. Atualizar estilos globais em `index.css`. Aplicar fundo, tipografia e estados escuros mantendo espaçamentos 8/4.
3. Revisar componentes chave em `components/`. Garantir contraste AA/AAA e consistência de hover, focus e disabled.
4. Ajustar páginas e layouts em `App.tsx` e `pages/`. Herdar cores via tokens, sem códigos de cor isolados.
5. Validar assets públicos (favicons, manifest). Documentar uso do logo conforme `identidades-visuais-spec.md`.
6. Registrar impactos em requisitos (`REQ-###`) ou riscos (`RISK-###`) quando afetarem acessibilidade ou segurança.
7. Documentar alterações no changelog. Executar auditorias visuais alinhadas às regras de simplicidade e antialucinação.

## Saídas Esperadas
- Paleta Dracula configurada como base do app, com tokens reutilizáveis.
- Componentes e páginas aplicando o tema sem hardcodes de cor.
- Documentação de branding e governança atualizada quando afetada pelo novo tema.
