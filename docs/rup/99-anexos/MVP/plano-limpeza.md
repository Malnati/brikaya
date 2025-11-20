<!-- docs/rup/99-anexos/MVP/plano-limpeza.md -->
# Plano de Limpeza do Projeto para Template

## Propósito
Remover vestígios do projeto anterior, padronizar requisitos e deixar o repositório pronto para novos aplicativos de qualquer empresa, mantendo a estrutura agnóstica ao contexto original.

## Premissas
- Preservar a estrutura RUP e os cabeçalhos de caminho em todos os arquivos, removendo apenas referências de regras de negócio específicas.
- Sincronizar referências com [`especificacao-de-requisitos.md`](../../02-planejamento/especificacao-de-requisitos.md) e [`riscos-e-mitigacoes-spec.md`](../../02-planejamento/riscos-e-mitigacoes-spec.md), eliminando conteúdo vinculado ao aplicativo anterior.
- Manter linguagem objetiva, sem conceitos ou fluxos inexistentes, e documentar justificativas para simplificações textuais.

## Inventário de Arquivos Alvo
- `docs/rup/02-planejamento/especificacao-de-requisitos.md`: revisar requisitos para manter somente itens aplicáveis ao template e ajustar identificadores `REQ-###`.
- `docs/rup/02-planejamento/riscos-e-mitigacoes-spec.md`: recalibrar riscos para o contexto de template e alinhar IDs `RISK-###`.
- `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`: garantir que auditorias automáticas reflitam o fluxo neutro do template.
- `docs/rup/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`: validar que referências de revisão não mencionem o aplicativo anterior.
- `docs/rup/99-anexos/reference/`: remover anexos que descrevam regras ou fluxos específicos do projeto anterior ou substituí-los por placeholders aprovados.
- `README.md` e `docs/rup/README.md`: orientar novos times sobre como aplicar o template e registrar evidências do processo de limpeza.

## Sequência de Ações
1. **Mapeamento de legados:** executar busca com `rg` para listar marcas, produtos, URLs e nomes de domínio vinculados ao projeto anterior; registrar ocorrências por arquivo.
2. **Padronização de cabeçalhos:** confirmar que todos os arquivos preservam cabeçalhos de caminho e a estrutura `docs/rup/`, ajustando apenas conteúdos específicos de negócio.
3. **Normalização de requisitos:** atualizar `especificacao-de-requisitos.md` para deixar apenas requisitos genéricos do template, revisando textos e estados (atendido/pendente/removido) com justificativa.
4. **Revisão da matriz de riscos:** editar `riscos-e-mitigacoes-spec.md` para manter apenas riscos gerais do template, atualizando mitigadores e responsáveis de forma neutra.
5. **Limpeza de anexos e referências:** remover ou substituir anexos que contenham fluxos do aplicativo anterior e alinhar checklists e IDs (`REQ-###`, `RISK-###`) conforme os ajustes nos documentos de planejamento.
6. **Atualização de orientações operacionais:** ajustar `README.md` e `docs/rup/README.md` com instruções claras para equipes iniciarem novos MVPs, incluindo como executar a limpeza e onde registrar evidências.
7. **Validação de conformidade:** garantir cabeçalhos de caminho, estrutura `docs/rup/`, ausência de menções ao projeto anterior e consistência com auditorias de IA e governança técnica.
8. **Registro e governança:** documentar alterações relevantes no changelog, citando impactos em auditorias automáticas e vínculos com requisitos e riscos atualizados.

## Saídas Esperadas
- Repositório sem menções ao projeto anterior ou regras de negócio específicas do aplicativo inicial.
- Requisitos e riscos marcados apenas como aplicáveis ao template.
- Documentação pronta para novos times iniciarem MVPs alinhados à governança.
