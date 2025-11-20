<!-- docs/rup/99-anexos/MVP/plano-white-label.md -->
# Plano de Transformação White Label do Aplicativo

## Propósito
Estabelecer um roteiro completo para tornar o aplicativo um template white label, capaz de suportar qualquer operação de venda de produtos ou serviços, eliminando referências ao domínio anterior (resíduos, créditos de carbono ou marcas específicas) e mantendo dados de exemplo neutros.

## Princípios
- **Neutralidade de domínio:** todas as cópias, exemplos e regras de negócio devem ser genéricas e aplicáveis a qualquer vertical.
- **Modularidade:** configurações, assets e textos ficam parametrizados por ambiente ou tema, evitando hardcodes de marca.
- **Traçabilidade RUP:** toda alteração que impacte requisitos (`REQ-###`) e riscos (`RISK-###`) deve ser refletida nos documentos oficiais.
- **Automação segura:** sempre preferir scripts versionados e reproduzíveis para renomear, limpar dados e validar conformidade.

## Inventário de Arquivos Alvo
- `README.md` e `docs/rup/README.md`: ajustar posicionamento do repositório como template white label.
- `docs/rup/02-planejamento/especificacao-de-requisitos.md`: reescrever requisitos para escopo genérico; manter IDs.
- `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md`: recalibrar riscos para contextos multi-vertical.
- `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md` e `revisoes-com-ia.md`: alinhar auditorias e checklists à nova natureza white label.
- `docs/rup/06-ux-brand/*.md` e `docs/rup/99-anexos/reference/`: substituir identidades e logotipos por placeholders neutros (ex.: "APP").
- `branding/` e `app/` (códigos e assets): parametrizar cores, fontes, nomes exibidos e ícones.
- `app/` (configs, seeds e fixtures): trocar cargas de dados para exemplos genéricos de produtos/serviços.
- `.env.example` e `docker-compose.yml`: remover menções de variáveis específicas de domínio e documentar novas chaves white label.
- Pipelines em `.github/` (se existirem) e `Makefile`: validar que targets e checks não dependem de regras do domínio anterior.

## Macroetapas e Dependências
1. **Descoberta e Mapeamento (sequencial):**
   - Rodar inventário de textos/marcas com `rg "resíduo|carbono|crédito|lote" -g"*.{ts,js,tsx,md}"`.
   - Catalogar ocorrências em planilha ou `docs/rup/99-anexos/reference/mapeamento-white-label.md` (novo).
2. **Normalização de Documentação (sequencial após mapeamento):**
   - Atualizar READMEs, requisitos e riscos para linguagem neutra.
   - Revalidar cabeçalhos de caminho e referências cruzadas.
3. **Parametrização de Identidade (paralelo com etapa 2):**
   - Criar design tokens genéricos (cores, tipografia, logos) em `branding/` e `app/`.
   - Substituir assets proprietários por placeholders aprovados.
4. **Refino de Dados e Regras de Negócio (sequencial após 2 e 3):**
   - Ajustar modelos, seeds e mensagens do app para produtos/serviços genéricos.
   - Revisar validações e fluxos para remover casos rígidos do domínio anterior.
5. **Infra e Automação (paralelo com 4):**
   - Atualizar `.env.example`, `docker-compose.yml`, pipelines e Makefile.
   - Adicionar scripts de renomeação e validação.
6. **Qualidade, Auditoria e Release (sequencial final):**
   - Rodar testes, linters e auditorias de cabeçalhos.
   - Registrar mudanças no `CHANGELOG` e citar `REQ-###`/`RISK-###` afetados.

## Tarefas Detalhadas
### 1. Descoberta e Mapeamento
- Executar buscas por palavras-chave do domínio anterior em código e docs (`rg` com lista de termos). Registrar arquivo, linha e contexto.
- Listar variáveis de ambiente, URLs e nomes de buckets/serviços que contenham marca anterior.
- Identificar componentes visuais (logos, ilustrações) em `branding/` e `app/`.

### 2. Normalização de Documentação
- `README.md` e `docs/rup/README.md`: reescrever visão geral, casos de uso e exemplos para qualquer marketplace genérico.
- `especificacao-de-requisitos.md`: substituir requisitos específicos (ex.: "lotes de resíduos") por requisitos genéricos (ex.: catálogo de produtos, carrinho, pagamento opcional). Manter IDs e justificar mudanças.
- `riscos-e-mitigacoes-spec.md`: reavaliar riscos de compliance/segurança para múltiplos domínios e registrar mitigadores neutros.
- Atualizar anexos de governança (`auditoria-e-rastreabilidade.md`, `revisoes-com-ia.md`) para remover checklists que citem o domínio anterior.

### 3. Parametrização de Identidade
- Introduzir tokens de marca em arquivo central (ex.: `branding/tokens.json` ou `.scss` equivalente) com placeholders (`primary`, `secondary`, `font_family`).
- Substituir logos por versões genéricas (SVG "APP") e documentar fundos previstos conforme `identidades-visuais-spec.md`.
- Garantir que telas usem tokens e variáveis, não valores hardcoded.

### 4. Refino de Dados e Regras de Negócio
- Atualizar seeds/fixtures (`app/` ou `branding/` se aplicável) com produtos e serviços genéricos (ex.: "Plano de assinatura", "Curso online", "Produto físico").
- Revisar textos de UI, e-mails e notificações para remover menções a resíduos ou créditos de carbono.
- Generalizar validações de formulário (unidades de medida, categorias, impostos) para campos configuráveis.
- Revisar feature flags ou experimentos que assumam o domínio anterior e torná-los parametrizados.

### 5. Infra e Automação
- `.env.example` e `docker-compose.yml`: renomear variáveis de domínio para termos neutros (`APP_MARKETPLACE_NAME`, `DEFAULT_CURRENCY`, etc.) e alinhar descrições.
- `Makefile`: garantir targets `build/start/stop/clean` livres de dependências específicas e documentar novos targets de white label (ex.: `make seed-generic`).
- Scripts de apoio (sugestões):
  - `scripts/white-label/find-domain-terms.sh`: usa `rg` para gerar relatório CSV de termos proibidos.
  - `scripts/white-label/replace-brand.js`: recebe pares chave/valor e aplica substituições controladas em código e markdown.
  - `scripts/white-label/validate-headers.sh`: garante cabeçalhos `<!-- path -->` em todos os `.md`.
  - `scripts/white-label/reset-assets.sh`: troca logos e favicons por placeholders e limpa caches.
- Pipelines (`.github/workflows/*.yml`): adicionar jobs de validação de cabeçalhos e proibição de termos do domínio anterior.

### 6. Qualidade, Auditoria e Release
- Rodar testes automatizados, linters e checagem de cabeçalhos antes do release.
- Revisar changelog (`CHANGELOG`) com seção descrevendo transição para template white label.
- Validar aderência às regras de UX Writing e simplicidade visual, documentando decisões textuais.
- Confirmar alinhamento de requisitos e riscos com novos textos, registrando IDs impactados.

## Sequenciamento e Paralelismo
- **Pode rodar em paralelo:**
  - Etapa 3 (Parametrização de Identidade) com Etapa 2 (Normalização de Documentação).
  - Etapa 5 (Infra e Automação) com Etapa 4 (Refino de Dados).
- **Sequenciais obrigatórias:**
  - Etapa 1 precede todas as demais.
  - Etapa 6 acontece após 2–5 concluídas.

## Critérios de Conclusão
- Nenhum termo de domínio anterior presente em código, docs, variáveis ou assets.
- Dados de exemplo e mensagens refletem produtos/serviços genéricos.
- Identidade visual configurável por tokens e assets substituíveis.
- Pipelines e scripts automatizam detecção de regressões e cabeçalhos RUP permanecem íntegros.
