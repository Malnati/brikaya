<!-- docs/checklists/006-implementacao-padroes-checklist.md -->
# Checklist de Implementação e Padrões de Código

## Estrutura de Projeto
- [ ] Confirmar que a divisão entre `app/api/`, `app/ui/`, `extension/`, `prototype/`, `docs/` e `docs/rup/` segue a estrutura descrita, sem arquivos fora dos limites previstos.
- [ ] Garantir que módulos compartilhados residem em diretórios documentados (`shared/`, `helpers/`) evitando duplicação.
- [ ] Verificar que extensões Chrome seguem Manifest V3 e utilizam diretórios `background/`, `sidepanel/`, `components/`, `storage/` conforme especificado.

## Padrões de Código
- [ ] Assegurar adesão aos linters e formatadores configurados (ESLint, Prettier, TypeScript) e ausência de `any` não justificado.
- [ ] Validar uso de testes unitários com Jest (API) e Vitest/Testing Library (UI) conforme convenções da pasta `test/`.
- [ ] Checar que convenções de commit e nomes de branches respeitam padrões documentados na fase de contribuição.

## Build e Automação
- [ ] Garantir que pipelines de build utilizam `npm` com scripts versionados, sem dependência de ferramentas externas não aprovadas.
- [ ] Confirmar que `update.sh` e `docker-compose.yml` permanecem alinhados às instruções de build e não introduzem scripts shell proibidos.
- [ ] Verificar que tasks de build/test estão centralizadas no `Makefile` ou nos scripts `npm` oficiais.

## Testes e Qualidade de Código
- [ ] Validar que suites unitárias, integração e E2E cobrem serviços críticos (diagnósticos, onboarding, notificações, extensão).
- [ ] Checar cobertura mínima exigida e documentação de resultados em relatórios de QA.
- [ ] Garantir remoção de código morto após refatorações e atualização dos testes associados.

## Dependências e Configuração
- [ ] Revisar `package.json` e `package-lock.json` para dependências sem uso e atualização dos scripts padronizados.
- [ ] Confirmar que variáveis de ambiente documentadas (`.env.example`, README) estão sincronizadas com implementação.
- [ ] Validar que configurações de IndexedDB, ElevenLabs e notificações correspondem às constantes definidas nos helpers.
