<!-- docs/rup/06-ux-brand/diretrizes-de-ux.md -->
# Diretrizes de UX

> Base: [./diretrizes-de-ux.md](./diretrizes-de-ux.md)


## Foco por persona
- **Fornecedor de resíduo (`REQ-001`, `REQ-002`, `REQ-003`):** dashboards com lotes em destaque, alertas de documentação pendente e microcopy acionável (“Envie laudo FISPQ”, “Atualize CNAE”).
- **Comprador de resíduo (`REQ-003`, `REQ-006`, `REQ-009`):** filtros rápidos por raio ≤ 200 km, projeção de logística e comparativo de impacto antes da negociação.
- **Parceiro logístico (`REQ-004`, `REQ-010`):** cards com disponibilidade da frota, contratos vigentes e chamadas diretas (“Ofertar transporte”, “Sincronizar rota”).
- **Investidor (`REQ-007`, `REQ-008`, `REQ-009`):** trilha de diligência com resumo ESG, gateways para aporte e acesso controlado a relatórios restritos.
- **Administrador App (`REQ-040`):** visão consolidada de aprovações, exceções e métricas IA vs. humanas para decidir rapidamente.

## Fluxos e formulários críticos
- Padronizar cadastros conforme [`../02-planejamento/requisitos-banco-digital-spec.md#requisitos-de-usuarios-e-acesso`](../02-planejamento/requisitos-banco-digital-spec.md#requisitos-de-usuarios-e-acesso), orientando o usuário campo a campo com microcopy direta (“Informe CNAE principal”, “Adicione janela de coleta”).
- Nas telas fiscais (`REQ-002`, `REQ-004`, `REQ-030`), guiar emissão de NF-e/NFS-e com estados claros: rascunho, em validação, emitido.
- Gatilhos visuais para acessos restritos: banners de aviso e CTA “Solicitar acesso” quando o perfil não possuir permissão (`REQ-024`, `REQ-040`).
- Manter suporte offline e sincronização automática para cooperativas com baixa conectividade (`REQ-010`).

## Gamificação APP COIN
- Exibir ganhos de APP COIN em cada fluxo concluído (cadastro completo, venda verde, transporte certificado) com frases orientadas a ação (“Resgatar APP COIN”, “Converter em desconto”).
- Oferecer hub de recompensas com categorias claras (impacto socioambiental, capacitação, benefícios financeiros) alinhadas a `REQ-007` e `REQ-009`.
- Storytelling curto apresentando casos de sucesso das cooperativas e ONGs, reforçando propósito do token e incentivos sociais.

## Princípios de linguagem e acessibilidade
- Linguagem simples, multilíngue (português, espanhol, libras) e inclusiva, priorizando verbos que instruem o próximo passo (`REQ-016`, `REQ-025`).
- Componentes responsivos e navegáveis por teclado, com contraste AA (Regra 60-30-10 e tipografia 4x2) e suporte a leitores de tela.
- Conteúdo educativo multimídia (vídeo legendado, áudio descritivo) para orientar cooperativas e parceiros durante o onboarding.

## Sistema de Feedback de Mensagens (REQ-405)

Implementado conforme `docs/rup/99-anexos/MVP/plano-ux-ui-menssagens.md` para substituir `alert()` nativos por componentes contextuais, acessíveis e responsivos no MVP mobile.

### Componentes Disponíveis

#### FeedbackBanner (Inline)
**Uso:** Validações de formulário e erros persistentes  
**Localização:** `app/ui/src/components/FeedbackBanner.tsx`  
**Variants:** `error`, `warning`, `success`, `info`  
**Características:**
- Layout inline com ícone Material Symbols (`error`, `warning`, `check_circle`, `info`)
- Padding `p-4` (16px), gap `gap-3` (12px), bordas `rounded-lg`
- Suporte a descrição opcional e ações customizáveis
- Botão de fechar opcional com `aria-label="Fechar mensagem"`
- `role="alert"` (error) ou `role="status"` (warning, success, info)
- `aria-live="polite"` para anúncio em leitores de tela

**Tokens de cor:**
- Error: `bg-red-100 dark:bg-red-900/20`, `border-red-200 dark:border-red-800`, `text-red-700 dark:text-red-400`
- Warning: `bg-amber-100 dark:bg-amber-900/20`, `border-amber-200 dark:border-amber-800`, `text-dark-gray dark:text-amber-300`
- Success: `bg-green-100 dark:bg-green-900/20`, `border-green-200 dark:border-green-800`, `text-primary dark:text-green-400`
- Info: `bg-blue-100 dark:bg-blue-900/20`, `border-blue-200 dark:border-blue-800`, `text-blue-700 dark:text-blue-400`

#### FeedbackToast (Flutuante)
**Uso:** Confirmações rápidas e notificações não bloqueantes  
**Localização:** `app/ui/src/components/FeedbackToast.tsx`  
**Variants:** `error`, `warning`, `success`, `info`  
**Características:**
- Posicionamento fixo inferior: `fixed bottom-6 inset-x-4`
- Shadow: `shadow-lg`, bordas `rounded-xl`
- Animação `fade-in-up` (200ms)
- Auto-dismiss configurável (padrão: 3000ms)
- Título `text-sm font-semibold`, descrição opcional `text-sm opacity-80`
- `role="status"`, `aria-live="polite"`

#### ActionDialog (Modal Leve)
**Uso:** Cenários bloqueantes (sessão expirada, confirmações críticas)  
**Localização:** `app/ui/src/components/ActionDialog.tsx`  
**Características:**
- Bottom sheet responsivo: `fixed inset-x-0 bottom-0 rounded-t-2xl`
- Overlay: `bg-black/40` com fechamento por clique
- Padding `p-6`, espaçamento vertical `space-y-4`
- Ações primária e secundária customizáveis
- Botão primário: `bg-primary text-white`
- Botão secundário: `border border-dark-gray`
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`
- Bloqueio de scroll quando aberto

### Context e Hooks

**FeedbackContext** (`app/ui/src/contexts/FeedbackContext.tsx`):
- Provider global integrado ao `App.tsx`
- Métodos: `showToast(options)`, `showDialog(options)`, `hideDialog()`
- Gerenciamento automático de timers para toasts

**useFeedback** (`app/ui/src/hooks/useFeedback.ts`):
- Hook customizado para acesso ao contexto
- Importação: `import { useFeedback } from '../hooks/useFeedback'`
- Uso: `const { showToast, showDialog, hideDialog } = useFeedback()`

### Diretrizes de Uso

**Quando usar cada componente:**
- **FeedbackBanner:** Erros de validação de formulário, dados incompletos, avisos contextuais que precisam permanecer visíveis
- **FeedbackToast:** Confirmações de sucesso, notificações rápidas, avisos temporários
- **ActionDialog:** Sessão expirada, confirmações destrutivas, decisões que bloqueiam o fluxo, redirecionamentos com contexto

**Microcopy:**
- Títulos curtos (≤12 palavras), imperativos, substantivos primeiro
- Descrições opcionais para contexto adicional
- Sempre incluir ação clara (botão ou próximo passo)
- Vocabulário APP: "lote", "resíduo", "comprador", "fornecedor", "transação"

**Exemplos de uso:**

```tsx
// Toast de sucesso após criar lote
showToast({
  variant: 'success',
  title: 'Lote publicado',
  description: 'Enviamos para revisão',
});

// Banner de validação
<FeedbackBanner
  variant="error"
  message="Selecione um tipo de resíduo"
  onClose={() => setError(null)}
/>

// Dialog de sessão expirada
showDialog({
  title: 'Sessão expirada',
  description: 'Entre novamente para continuar',
  primaryAction: {
    label: 'Fazer login',
    onClick: () => navigate('/login'),
  },
});
```

### Conformidade com Regras de Design

**603010 (Cores):**
- Paleta de 4 variants com contraste WCAG AA
- Modo claro e escuro totalmente suportados
- Tokens reutilizados do design system existente

**4x2 (Tipografia):**
- Títulos: `text-sm font-semibold` / `text-base font-semibold`
- Descrições: `text-sm leading-snug`
- Família Manrope via `font-display`

**8pt Grid (Espaçamento):**
- Padding: `p-4` (16px), `p-6` (24px)
- Gap: `gap-3` (12px)
- Margins: `mt-4` (16px)
- Bordas: `rounded-lg` (12px), `rounded-xl` (16px), `rounded-t-2xl` (24px)

**Acessibilidade:**
- Roles semânticos (`alert`, `status`, `dialog`)
- ARIA labels e live regions
- Navegação por teclado completa
- Indicadores de foco visíveis (`focus:ring-2 focus:ring-primary`)
- Bloqueio de scroll em modais

### Tokens Adicionados

**tailwind.config.js:**
- `feedback-error`: `#dc2626` (vermelho de erro consistente)

**index.css:**
- `@keyframes fade-in-up`: transição suave de entrada (200ms)
- `@keyframes fade-out-down`: transição suave de saída (200ms)
- Classes utilitárias: `.animate-fade-in-up`, `.animate-fade-out-down`

### Referências
- Plano de implementação: `docs/rup/99-anexos/MVP/plano-ux-ui-menssagens.md`
- Changelog: `CHANGELOG/20251107032105.md`
- Requirement: REQ-405 (Consistência de branding APP)

[Voltar à UX & Brand](./README-spec.md)
