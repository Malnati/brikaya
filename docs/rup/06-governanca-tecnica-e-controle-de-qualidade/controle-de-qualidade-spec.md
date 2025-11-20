<!-- docs/rup/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md -->
# Controle de Qualidade

> Base: [./controle-de-qualidade.md](./controle-de-qualidade.md)

## Objetivo
Definir práticas de QA para o App, garantindo que cada entrega climática digital siga o RUP adaptado, mantenha conformidade LGPD/BACEN e preserve a identidade socioambiental do produto. O conteúdo herda a estrutura de requisitos `REQ-001`…`REQ-030` da documentação Yagnostic e os correlaciona com o catálogo App (`REQ-101`…`REQ-404`).

---

## Atualizações quando requisitos alterarem QA
- Atualize `controle-de-qualidade.md` e este espelho sempre que um `REQ-###` (001…030) ou requisito App (`REQ-10X`/`REQ-30X`) definir novos critérios de QA, checklists de auditoria ou métricas ESG.  
- Sincronize ajustes com `../02-planejamento/requisitos-spec.md`, `../02-planejamento/riscos-e-mitigacoes-spec.md`, `auditoria-e-rastreabilidade-spec.md` e `revisoes-com-ia-spec.md` para manter o checklist de encerramento.  
- Registre impactos no `CHANGELOG.md`, em `docs/reports/qa-report-*.md` e nos indicadores do `governance-summary.md`, citando os IDs de requisitos e riscos relevantes.  
- **Requisitos associados:** REQ-015, REQ-016, REQ-018, REQ-019, REQ-022, REQ-023, REQ-028 e REQ-030.  
- **Nota colaborativa:** ao incorporar novos fluxos de validação humana (REQ-031–REQ-035 ↔ `REQ-110`, `REQ-304`, `REQ-305`), garantir que as métricas de SLA sejam adicionadas aos relatórios QA.

---

## Critérios Gerais
- Pipelines `build.yml`, `test.yml`, `review.yml` e `audit.yml` executados sem falhas antes de qualquer merge (`REQ-019`, `REQ-022`).  
- Revisão dupla obrigatória: engenharia (Tech Lead do domínio) + socioambiental/UX.  
- Documentação atualizada (requisitos, riscos, protótipos, changelog, relatórios) para cada entrega climática.  
- **Requisitos associados:** REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-015, REQ-016, REQ-018, REQ-019, REQ-022, REQ-023 e REQ-030.  
- **Nota colaborativa:** confirmar que telas e APIs que suportam aprovação conjunta (REQ-031–REQ-033) possuem estados claros para IA e humanos.

## Auditoria 60-30-10 (Regra Cromática)
1. Medir proporções de cor em telas impactadas (onboarding verde, marketplace, dashboards ESG, fila colaborativa).  
2. Validar tolerância ±5% para primária (60%), secundária (30%) e destaque (10%).  
3. Garantir CTAs com contraste AA e tokens climáticos aprovados pela governança UX.  
4. Registrar resultado como “Conforme 603010” ou “Não conforme 603010” em `docs/reports/`.  
- **Requisitos associados:** REQ-016, REQ-024, REQ-028 e REQ-034.  
- **Nota colaborativa:** considerar personalizações cromáticas para analistas humanos (REQ-031–REQ-033) sem quebrar os tokens padrão.

## Auditoria Tipográfica 4x2
- Limitar a quatro tamanhos e dois pesos tipográficos definidos para o App (Inter/Manrope).  
- Garantir hierarquia clara (headline > subtítulo > corpo > legenda) e frases ≤ 12 palavras quando aplicável.  
- Registrar resultado como “Conforme 4x2” ou “Não conforme 4x2”.  
- **Requisitos associados:** REQ-016, REQ-024, REQ-028 e REQ-034.  
- **Nota colaborativa:** destacar elementos que indiquem claramente ações humanas vs. automatizadas nos fluxos REQ-031–REQ-033.

## Auditoria de UX Writing e Simplicidade Visual
- Textos orientados à ação, focados na jornada climática (ex.: “Gerar laudo ESG”, “Enviar análise socioambiental”).  
- Verificar checklist de simplicidade (um foco principal por tela, ausência de ornamentos) conforme `AGENTS.md`.  
- Registrar “Aprovado (sem alucinações)” ou “Reprovado — ajustar microcopy”.  
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.  
- **Nota colaborativa:** instruções que envolvem validação humana (REQ-031–REQ-035) devem deixar explícito quem deve agir e qual o SLA.

## QA Técnico
- **Testes unitários:** helpers climáticos (`services/scoring-socioambiental/helpers/*`, `services/liquidacao-verde/helpers/*`).  
- **Testes E2E:** cenários definidos em `../04-testes-e-validacao/testes-end-to-end-spec.md` (cadastro verde, marketplace, aprovação colaborativa, liquidação, dashboards).  
- **Testes de segurança:** rejeição de credenciais inválidas, payloads oversized, XSS, SQLi, compliance BACEN.  
- **Requisitos associados:** REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-011, REQ-015, REQ-018, REQ-019, REQ-020, REQ-021 e REQ-030.  
- **Nota colaborativa:** adicionar suites que validem filas cooperativas e sinais de IA vs. humano (REQ-031–REQ-035 ↔ `REQ-110`, `REQ-304`).

## QA de cadastros e RBAC
- **Formulários obrigatórios:** validar front-end e APIs para os campos mapeados em [`../02-planejamento/requisitos-banco-digital-spec.md#requisitos-de-usuarios-e-acesso`](../02-planejamento/requisitos-banco-digital-spec.md#requisitos-de-usuarios-e-acesso) (CNAE, contatos autorizados, status de verificação, janelas de coleta, documentação de lotes, passaporte digital).
- **Permissões:** executar testes automatizados e manuais para cada perfil (fornecedor, comprador, parceiro, investidor, administrador) garantindo bloqueio de ações não permitidas (`REQ-010`, `REQ-040`).
- **Compliance fiscal:** simular emissão NF-e/NFS-e, geração de extratos e exportações SPED confirmando hash, CFOP e retenções calculadas (`REQ-002`, `REQ-003`, `REQ-004`, `REQ-005`, `REQ-009`, `REQ-030`).
- **Relatórios restritos:** validar que dashboards ESG e relatórios fiscais só são acessados por perfis autorizados, com logs completos (`REQ-006`, `REQ-008`, `REQ-009`, `REQ-024`, `REQ-029`).
- **Requisitos associados:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-008, REQ-009, REQ-010, REQ-016, REQ-024, REQ-029, REQ-030 e REQ-040.
- **Nota colaborativa:** registrar resultados de cada persona no `qa-report-*.md`, destacando pendências encaminhadas às filas humanas (`REQ-031`…`REQ-035`).

## Relatórios Obrigatórios
- **Relatório QA** — consolida resultados de testes, métricas ESG e auditorias 60-30-10/4x2 (`docs/reports/qa-report-*.md`).  
- **Audit Trail** — lista commits/PRs com links para requisitos, protótipos e dashboards.  
- **Medição Cromática** — planilha ou JSON com cálculo 60-30-10 arquivado em `/docs/reports/`.  
- **Métricas de Governança Técnica** — seguir indicadores em [`governanca-tecnica-spec.md`](governanca-tecnica-spec.md#metricas-de-governanca-tecnica).  
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-024, REQ-028 e REQ-029.  
- **Nota colaborativa:** incluir indicadores de throughput humano vs. IA (REQ-031–REQ-035) e observações de compliance colaborativo.

## Critérios de Bloqueio
- Falhas em testes E2E críticos (onboarding verde, marketplace, liquidação, dashboards ESG, fila colaborativa).  
- Auditoria 60-30-10 ou 4x2 “Não conforme” sem correção registrada.  
- Ausência de logs de consentimento LGPD ou aprovação socioambiental.  
- Vulnerabilidades altas/críticas (LGPD, BACEN, segurança operacional).  
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-024, REQ-028 e REQ-029.  
- **Nota colaborativa:** bloquear merges quando métricas colaborativas (REQ-031–REQ-035) não atingirem SLA definido em `governance-summary.md`.

[Voltar ao índice](README-spec.md)
