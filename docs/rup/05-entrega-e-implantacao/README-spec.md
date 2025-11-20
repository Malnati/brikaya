<!-- docs/rup/05-entrega-e-implantacao/README.md -->
# Fase 05 — Entrega e Implantação

> Base: [./README.md](./README.md)
> Referências correlatas: [Planejamento](../02-planejamento/requisitos-spec.md) · [Governança Técnica](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md)

A fase de Entrega e Implantação consolida os artefatos necessários para levar o App aos ambientes DEV, HML e PRD com rastreabilidade de requisitos, métricas ESG e obrigações regulatórias. Cada documento abaixo mantém alinhamento com requisitos atuais (REQ-101…REQ-305) e registra equivalências com os legados `REQ-001`…`REQ-035` para preservar a herança do framework Yagnostic.

## Conteúdo da seção
- [Ambientes e Configurações](./ambientes-e-configuracoes-spec.md) — catálogos de domínios, variáveis críticas e integrações de segredos. Atende [REQ-101](../02-planejamento/requisitos-spec.md#req-101), [REQ-201](../02-planejamento/requisitos-spec.md#req-201) e mantém legados `REQ-001`, `REQ-014`.
- [Empacotamento e Build](./empacotamento-spec.md) — descreve pipelines de build, geração de imagens e bundles assinados. Vincula [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-305](../02-planejamento/requisitos-spec.md#req-305) e legados `REQ-018`, `REQ-019`.
- [Publicação e Versionamento](./publicacao-e-versionamento-spec.md) — orienta versionamento, changelog e rollout gradual entre ambientes. Relaciona [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e legados `REQ-022`, `REQ-029`.
- [Operação e Manutenção](./operacao-e-manutencao-spec.md) — reúne rotinas de SRE, compliance e colaboração humana pós-deploy. Garante [REQ-205](../02-planejamento/requisitos-spec.md#req-205), [REQ-404](../02-planejamento/requisitos-spec.md#req-404) e preserva legados `REQ-015`, `REQ-029`, `REQ-033`.

Cada item inclui notas específicas para convivência com a capacidade colaborativa descrita em [`capacidade-diagnostico-colaborativo-spec.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) e aponta evidências obrigatórias em `docs/checklists/` para facilitar auditorias contínuas.

> **Rastreamento com anexos:** os quadros adicionados nos artefatos acima relacionam cada requisito ativo aos documentos de entrada localizados em `docs/rup/99-*` (PRD, requisitos de negócio e matriz de permissões), garantindo que entregas e operação reflitam fielmente o catálogo de necessidades levantado pelo time de negócios.

[Voltar ao índice da documentação](../README-spec.md)
