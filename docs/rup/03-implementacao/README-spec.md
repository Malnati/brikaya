<!-- docs/rup/03-implementacao/README.md -->
# Implementação — Registro Evolutivo

> Base: [./README.md](./README.md)
> Rastreabilidade: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-007](../02-planejamento/requisitos-spec.md#req-007) · Legados: [REQ-001](../02-planejamento/requisitos-spec.md#req-001)–[REQ-030](../02-planejamento/requisitos-spec.md#req-030)
> Referências correlatas: [Arquitetura da Plataforma](../01-arquitetura/arquitetura-da-extensao-spec.md) · [Design de Experiência](../02-design/design-geral-spec.md) · [Planejamento Colaborativo](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)

Esta disciplina consolida como o App organiza seus artefatos de construção, mantendo a herança metodológica trazida do projeto Yagnostic. O conteúdo é mantido como fonte viva: cada atualização precisa refletir tanto as necessidades climáticas (RUP atual) quanto os aprendizados do legado diagnóstico (REQ-001…REQ-030) para preservar rastreabilidade com stakeholders e auditores.

## Documentos ativos
- [Estrutura de Projeto](estrutura-de-projeto-spec.md) — detalha pastas, domínios e contratos de serviços que materializam [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e [REQ-007](../02-planejamento/requisitos-spec.md#req-007), mantendo como referência os fluxos históricos [REQ-001](../02-planejamento/requisitos-spec.md#req-001)–[REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- [Build e Automação](build-e-automacao-spec.md) — descreve pipelines, scripts e políticas de publicação necessários para cumprir [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-045](../02-planejamento/requisitos-spec.md#req-045), relacionando controles herdados de [REQ-011](../02-planejamento/requisitos-spec.md#req-011)–[REQ-020](../02-planejamento/requisitos-spec.md#req-020).
- [Padrões de Código](padroes-de-codigo-spec.md) — consolida convenções de desenvolvimento, segurança e observabilidade associadas a [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023), alinhando-se às práticas legadas [REQ-021](../02-planejamento/requisitos-spec.md#req-021)–[REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- [Testes](testes-spec.md) — orienta as camadas de testes automatizados e colaborativos que evidenciam [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022), espelhando cenários legados [REQ-004](../02-planejamento/requisitos-spec.md#req-004)–[REQ-030](../02-planejamento/requisitos-spec.md#req-030).

Cada documento indica como coexistem automações e checkpoints humanos definidos em [`capacidade-diagnostico-colaborativo-spec.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md), garantindo que decisões de IA socioambiental sigam o mesmo rigor aplicado aos fluxos médicos legados.

[Voltar ao índice](../README-spec.md)
