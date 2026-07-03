<!-- docs/rup/99-anexos/checklists/006-implementacao-padroes-checklist.md -->
# Checklist de Implementação e Padrões de Código — Brikaya

## Estrutura de Projeto
- [ ] Confirmar que a divisão `src/components/`, `src/logic/`, `src/objects/`, `src/storage/`, `src/utils/`, `src/constants/` e `docs/` segue a estrutura documentada.
- [ ] Garantir que assets e fontes estão versionados localmente e referenciados no manifest/service worker.
- [ ] Verificar que módulos compartilhados evitam duplicação de lógica (ex.: colisões, cálculo de pontuação).

## Padrões de Código
- [ ] Aplicar ESLint/Prettier sem `any` não justificado.
- [ ] Declarar constantes configuráveis no topo dos arquivos ou em `src/constants`.
- [ ] Manter imports organizados no topo e remover código morto após refatorações.

## Build e Automação
- [ ] Scripts de build/test são executados via `npm`/`Makefile` sem ferramentas externas não aprovadas.
- [ ] `sw.js` atualizado quando assets ou rotas mudarem; precache validado.
- [ ] Targets de Capacitor (`make build-all`, `make ios`, `make android`) sincronizados com o build do Vite.

## Testes e Qualidade
- [ ] Suites unitárias/integração/E2E cobrem engine, logging e fluxo offline (#001–#004).
- [ ] Cobertura mínima atingida e relatórios anexados em QA.
- [ ] Evidências de testes E2E armazenadas em `tmp/screenshots/` quando aplicável.

## Dependências e Configuração
- [ ] `package.json`/`package-lock.json` revisados para dependências sem uso.
- [ ] Variáveis de ambiente e constantes documentadas em `src/constants` e `README.md` (quando aplicável).
- [ ] Configurações de IndexedDB e service worker alinhadas ao comportamento offline-first.
