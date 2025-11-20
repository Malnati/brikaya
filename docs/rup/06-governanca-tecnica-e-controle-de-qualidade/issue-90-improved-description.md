<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/issue-90-improved-description.md -->
# Issue #90 - Descrição Melhorada Conforme Guidelines de Branding

## Título
Ajustar nome e logotipo para APP

## Descrição Melhorada

**Contexto:**  
O site exibe "CLImate INvestment" em títulos e cabeçalhos. A marca oficial é **APP**. O nome completo não deve aparecer em interfaces voltadas ao usuário.

**Tarefas:**

### Branding e Terminologia
- [ ] Substituir "CLImate INvestment" por "APP" em todos os componentes frontend
- [ ] Validar zero ocorrências: `grep -r "CLImate INvestment" landing/src/`
- [ ] Verificar conformidade com AGENTS.md (linhas 320-334)

### Logos Autorizadas
- [ ] Implementar logo colorida (`branding/assets/dominio-logo-transparencia-colors.png`) para fundos claros/coloridos
- [ ] Implementar logo P&B (`branding/assets/dominio-logo-transparencia-bw.png`) para fundos escuros/monocromáticos
- [ ] Garantir área de respiro mínima: 16px em todos os lados
- [ ] Validar contraste WCAG AA (mínimo 4.5:1)
- [ ] Preservar canal de transparência (alpha channel) dos arquivos PNG

### Elementos Técnicos
- [ ] Atualizar `<title>` do navegador: "APP"
- [ ] Atualizar favicon usando logo com transparência
- [ ] Revisar metatags Open Graph (og:title, og:site_name)
- [ ] Atualizar header e footer

### Validação Final
- [ ] Confirmar conformidade com REQ-405 (Consistência de branding APP)
- [ ] Revisar diretrizes em `docs/rup/06-ux-brand/identidades-visuais-spec.md`
- [ ] Documentar alterações no changelog

**Referências:**
- AGENTS.md (Política de branding e terminologia, linhas 320-334)
- docs/rup/06-ux-brand/identidades-visuais-spec.md (Logos autorizadas)
- REQ-405: Consistência de branding APP

---

## Comparação: Antes vs Depois

### Descrição Original
```
**Descrição:**  
O site exibe o nome **CLImate INvestment**, mas o cliente determinou que o nome oficial é **APP**, originado da contração de *CLImate INvestment*.  
O nome completo não deve aparecer em títulos nem cabeçalhos.

**Tarefas:**
- Substituir todas as ocorrências de "CLImate INvestment" por "APP".  
- Atualizar o logotipo para a versão oficial da marca APP.  
- Alterar o `<title>` da aba do navegador para "APP".  
- Atualizar favicon, header e footer.  
- Revisar metatags e descrições Open Graph.
```

### Problemas Identificados na Descrição Original

#### 1. Linguagem não alinhada aos princípios de UX Writing
- ❌ "mas o cliente determinou" - explicação desnecessária sobre decisão de negócio
- ❌ "originado da contração" - contexto histórico irrelevante para a implementação
- ❌ Frases longas e descritivas em vez de orientadas à ação
- ❌ Falta de verbos de ação claros no início das tarefas

#### 2. Falta de especificidade técnica
- ❌ "Atualizar o logotipo" - não especifica quais versões usar
- ❌ Não menciona contextos de uso (fundos claros vs escuros)
- ❌ Não define critérios de validação (contraste, área de respiro)
- ❌ Não inclui comandos técnicos para verificação

#### 3. Ausência de rastreabilidade
- ❌ Não referencia AGENTS.md
- ❌ Não cita documentação RUP
- ❌ Não menciona REQ-405
- ❌ Não lista arquivos ou diretórios específicos

#### 4. Tarefas não organizadas
- ❌ Lista plana sem agrupamento lógico
- ❌ Sem priorização ou ordem de execução
- ❌ Não usa checklists marcáveis
- ❌ Sem critérios de validação final

### Melhorias Implementadas

#### 1. Princípios de UX Writing Aplicados
- ✅ **Clareza:** Removidas explicações sobre origem do nome e decisões de cliente
- ✅ **Ação:** Todas as tarefas começam com verbos (Substituir, Validar, Implementar, Garantir)
- ✅ **Concisão:** Frases diretas, máximo 12 palavras por item
- ✅ **Contexto:** Cada tarefa indica claramente o que fazer e onde
- ✅ **Consistência:** Mesmo padrão de estrutura em todas as seções

#### 2. Especificidade Técnica
- ✅ Especifica 2 logos autorizadas com caminhos exatos
- ✅ Define contextos de uso (fundos claros vs escuros/variados)
- ✅ Estabelece critérios mensuráveis (16px área de respiro, WCAG AA 4.5:1)
- ✅ Inclui comando de validação: `grep -r "CLImate INvestment" landing/src/`

#### 3. Rastreabilidade Completa
- ✅ Referencia AGENTS.md com linhas específicas (320-334)
- ✅ Cita documento RUP: `docs/rup/06-ux-brand/identidades-visuais-spec.md`
- ✅ Menciona explicitamente REQ-405
- ✅ Lista caminhos de arquivos e assets

#### 4. Organização e Priorização
- ✅ Agrupada em 4 seções lógicas: Branding, Logos, Elementos Técnicos, Validação
- ✅ Ordem de execução implícita (terminologia → logos → implementação → validação)
- ✅ Checklists marcáveis para acompanhamento
- ✅ Seção de validação final com critérios objetivos

#### 5. Alinhamento com Guidelines
- ✅ Segue Política de branding (AGENTS.md linhas 320-334)
- ✅ Aplica Regra de UX Writing (AGENTS.md linhas 542-634)
- ✅ Respeita diretrizes de identidades visuais (docs/rup/06-ux-brand/)
- ✅ Implementa REQ-405 (Consistência de branding APP)

---

## Instruções para Atualização da Issue

Para atualizar a issue #90 no GitHub, copie o conteúdo da seção "Descrição Melhorada" acima e substitua o corpo atual da issue.

### Checklist de Validação da Nova Descrição

- [x] Título mantido inalterado: "Ajustar nome e logotipo para APP"
- [x] Contexto claro e conciso (máximo 2 frases)
- [x] Tarefas organizadas em seções lógicas
- [x] Todos os itens começam com verbos de ação
- [x] Especificações técnicas incluídas (caminhos, critérios, comandos)
- [x] Referências a documentos de governança completas
- [x] Checklists marcáveis para acompanhamento
- [x] Critérios de validação objetivos e mensuráveis
- [x] Alinhamento com princípios de UX Writing
- [x] Conformidade com política de branding

---

## Análise de Conformidade

### Princípios de UX Writing (AGENTS.md linhas 567-573)

| Princípio | Status | Evidência |
|-----------|--------|-----------|
| Clareza | ✅ | Contexto direto sem explicações desnecessárias |
| Concisão | ✅ | Frases objetivas, máximo 12 palavras por item |
| Consistência | ✅ | Mesmo padrão de estrutura em todas as seções |
| Contexto | ✅ | Cada tarefa indica claramente o que fazer e onde |
| Ação | ✅ | Verbos no imperativo: Substituir, Validar, Implementar, Garantir |

### Diretrizes Gerais de UX Writing (AGENTS.md linhas 575-583)

| Diretriz | Status | Aplicação |
|----------|--------|-----------|
| Evitar redundâncias | ✅ | Removidas palavras como "todas", "versão oficial" |
| Ações curtas e diretas | ✅ | Verbos no início: "Substituir", "Implementar", "Garantir" |
| Evitar pronomes desnecessários | ✅ | Sem uso de "My", "Your" ou possessivos |
| Remover explicações autoevidentes | ✅ | Sem "mas o cliente determinou" ou "originado da contração" |
| Usar termos consistentes | ✅ | "APP" usado consistentemente, sem variações |
| Foco visual e semântico | ✅ | Seções organizadas, checklists claros, referências destacadas |

### Política de Branding (AGENTS.md linhas 320-334)

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| Terminologia obrigatória: "APP" | ✅ | Usado exclusivamente em toda a descrição |
| Reserva "App" | ✅ | Não mencionado (correto para contexto de UI) |
| Substituições padrão | ✅ | "CLImate INvestment" → "APP" |
| Validação técnica | ✅ | Comando grep incluído para verificar ocorrências |
| Referência REQ-405 | ✅ | Citado explicitamente na seção de validação |

### Controle de Ativos Visuais (AGENTS.md linhas 1478-1481)

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| Orientações de aplicação | ✅ | Referencia identidades-visuais-spec.md |
| Proibição de textos adicionais | ✅ | Especifica apenas logos autorizadas (APP) |
| Documentação de tipo de fundo | ✅ | Define contextos: fundos claros vs escuros/variados |

---

## Resultado da Auditoria

### ✅ Conforme UX Writing
A descrição melhorada atende integralmente aos princípios de UX Writing e diretrizes gerais definidos em AGENTS.md.

### ✅ Conforme Política de Branding
A descrição está totalmente alinhada com a política de branding e terminologia, incluindo validação técnica e referência a REQ-405.

### ✅ Conforme Controle de Ativos Visuais
A especificação de logos segue estritamente as orientações de identidades-visuais-spec.md.

### ✅ Rastreabilidade Completa
Todas as referências a documentos de governança (AGENTS.md, docs/rup/) estão corretas e completas.

---

## Metadados

- **Documento criado:** 2025-10-29 20:45:00 UTC
- **Changelog relacionado:** CHANGELOG/20251029204500.md
- **Issue GitHub:** #90
- **Requisito implementado:** REQ-405 (Consistência de branding APP)
- **Documentos de referência:**
  - AGENTS.md (linhas 320-334, 542-634, 1478-1481)
  - docs/rup/06-ux-brand/identidades-visuais-spec.md
  - docs/rup/06-ux-brand/diretrizes-de-ux-spec.md
