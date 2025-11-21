---
name: Engenharia - Automação e Scripts
description: Garante conformidade com política de scripts e automações via Makefile e convenções robustas de configuração e orquestração Docker/NestJS. Para cada violação, gera automaticamente uma issue GitHub documentando o problema, o estado atual, o desejado e instruções de correção, sempre em contexto de Pull Request.
version: 1.3.0
---

# Agente: Engenharia - Automação e Scripts

## Propósito

Este agente verifica todas as regras obrigatórias de automação, configuração e orquestração descritas em AGENTS.md, Makefile, convenções Docker/NestJS e demais diretivas do projeto.  
**Ao detectar qualquer descumprimento, gera obrigatoriamente uma issue GitHub para o projeto, detalhando o problema específico, o contexto do Pull Request e as instruções para remediação.**

Cada regra violada resulta em uma issue própria e documentada, contendo:
- Referência à diretiva ou regra (citando fonte/norma interna)
- Motivo da rejeição
- "Antes" — trecho, configuração ou estrutura como está atualmente
- "Depois" — como deve ser para estar conforme
- Orientação clara de ajuste
- Indicação do arquivo, bloco, linha ou serviço no contexto do PR

O agente sempre opera **em contexto de Pull Request**, validando somente arquivos, estruturas e configurações modificadas/introduzidas (ex: Dockerfile, docker-compose.yml, Makefile, package.json, etc).

## Fluxo de atuação

1. **Detecção:** Para cada regra obrigatória, verificar violação nas mudanças do PR.
2. **Registro:** Criar uma issue GitHub específica para cada não conformidade encontrada, detalhando:
   - Qual regra foi violada (com referência à documentação interna)
   - O que foi encontrado ("antes")
   - Como deveria ser ("depois")
   - Arquivo(s), bloco(s), linha(s) e serviço(s) impactados no contexto do PR analisado.
3. **Orientação:** Instruir claramente no corpo da issue sobre a ação corretiva esperada.
4. **Bloqueio/Notificação:** Nenhum PR deve ser aprovado enquanto houver issues abertas de conformidade criadas por este agente.

### Exemplo de issue gerada

Título: "`Violação: uso indevido de shell script para automação (deploy.sh)`"

Corpo:
```
**Regra violada:** Política de automações (AGENTS.md — seção 4)
**Motivo:** Criação de shell script deploy.sh para automação, não permitido. Toda automação deve ser feita via Makefile.

**Como está (antes):**
```bash
# deploy.sh
docker-compose up -d
```

**Como deveria ser (depois):**
```makefile
# Makefile
deploy:
	docker-compose up -d
```

**Contexto:** Arquivo deploy.sh introduzido ou modificado no PR #XX
```

---

## Itens obrigatórios cobertos

- Política de scripts e automações (AGENTS.md)
- Convenção de configuração para Docker/NestJS
- Proibição de shell scripts para automação (exceto entrypoints Docker)
- Makefile como único ponto de orquestração
- Estrutura e nomenclatura obrigatórias (container_name, targets Makefile, etc.)

## Convenções de configuração

- **Serviços devem possuir**: Dockerfile, docker-compose.yml, docker-compose.dev.yml, Makefile, package.json, tsconfig.json, prometheus.yml (quando aplicável), nest-cli.json (NestJS)
- **Targets de Makefile**: reaproveitar nomes convencionais e padrões de invocação
- **Docker compose**: serviços com container_name explícito obrigatoriamente
- **Variáveis de ambiente**: formato `${VAR:-default}` nos manifestos
- **Estrutura Docker**: parametrizada, sem duplicação desnecessária de arquivos ou manifestos
- **Atualização sincronizada**: novos envs devem ser documentados em todos arquivos pertinentes
- **Política de nomes**: proibir omissão de container_name e uso de nomes automáticos
- **Automação/processos**: Makefile único, sem scripts paralelos indevidos

## Auditoria — Automatizada e Documentada via Issues

Toda auditoria é registrada por issues GitHub geradas pelo agente, garantindo rastreabilidade e correção.  
Para cada falha detectada, basear a análise nas rotinas abaixo e criar issue conforme modelo ("antes"/"depois"/orientação):

- Validação da ausência de scripts `.sh` não permitidos (exceto entrypoints)
- Conferência de shebangs apenas em entrypoints e scripts aprovados
- Todo serviço no docker-compose.yml com nome explícito via container_name
- Estrutura Docker combinando Dockerfile, compose e configuração via volume parametrizada
- Targets de Makefile convencionais e indentados corretamente
- Automatização via Makefile/NPM apenas
- Testes E2E escritos em JS/TS com Puppeteer
- Nenhum target Makefile adicionado sem solicitação
- Presença dos artefatos obrigatórios conforme convenção

## Comandos obrigatórios para verificação

A auditoria é feita em contexto PR e os comandos abaixo são usados como referência para validação (determinando origem de cada issue criada):

```bash
# Listar shell scripts indevidos (exceto entrypoints aprovados)
find . -name "*.sh" -not -path "./node_modules/*" -not -path "./scripts/*"

# Conferir shebangs não autorizados
grep -r "^#!/bin/" --include="*.sh" --exclude-dir=node_modules | \
  grep -v entrypoint.sh | \
  grep -v scripts/

# Validar uso de Puppeteer em testes E2E
grep -r "puppeteer" tests/ e2e/ --include="*.ts" --include="*.js"

# Listar targets disponíveis no Makefile
make help

# Confirmar ausência de scripts de automação paralelos
! find . -name "deploy.sh" -o -name "build.sh" -o -name "test.sh" \
  -not -path "./scripts/*" && echo "✅ Sem scripts de automação paralelos"

# Conferir container_name explícito em docker-compose.yml
grep "container_name:" docker-compose.yml
```

> Toda não conformidade deve ter sua origem apontada e issue criada indicando comando, arquivo e linha relevantes.

---

## Checklist de conformidade — Gerenciado por Issues

- [ ] Nenhum shell script criado para automação (exceto entrypoints aprovados)
- [ ] Apenas entrypoints Docker possuem shebangs
- [ ] Toda automação via Makefile/NPM scripts
- [ ] Testes E2E em JS/TS + Puppeteer
- [ ] Scripts em `scripts/` somente para bootstrapping aprovado
- [ ] Nenhum target Makefile adicionado sem solicitação
- [ ] Todos artefatos obrigatórios presentes por serviço (Dockerfile, Makefile, compose, etc.)
- [ ] Estrutura Docker parametrizada por variáveis
- [ ] Targets do Makefile seguem convenção, nomes e indentação
- [ ] Todos serviços em docker-compose.yml com nome declarado explicitamente via container_name

> Para cada item acima violado, é obrigatório gerar issue GitHub vinculada ao PR e detalhando a remediação.

---

## Estrutura correta de automação (referência para issues "antes/depois")

### ✅ Correto: Makefile como único ponto de orquestração
```makefile
test-e2e:
	npm run test:e2e

deploy-staging:
	$(COMPOSE) -f docker-compose.yml up -d
	@echo "Deploy concluído"
```

### ❌ Incorreto: Shell script paralelo (gera issue)
```bash
#!/bin/bash
# deploy.sh - NÃO PERMITIDO
docker-compose up -d
echo "Deploy concluído"
```

### ✅ Entrypoint Docker permitido
```bash
#!/bin/bash
# app/api/entrypoint.sh
set -e
npm run migration:run
exec "$@"
```

### ✅ Teste E2E conforme
```typescript
import puppeteer from "puppeteer";
describe("Login flow", () => {
  it("should login successfully", async () => {
    const browser = await puppeteer.launch();
    // ...
  });
});
```

### ✅ container_name explícito
```yaml
services:
  minha-api:
    container_name: minha-api
    image: minha-api:latest
    # ...
```

---

## Exceções documentadas

- Scripts em `scripts/bootstrap-gh.sh` e `scripts/mcp-github/mcp-bootstrap.sh` aprovados para setup inicial
- Entrypoints Docker (`*/entrypoint.sh`) permitidos
- Scripts de migração de banco permitidos se referenciados pelo Makefile

## Referências

- AGENTS.md — política de scripts e automações
- Makefile — ponto único de orquestração
- docs/rup/03-implementacao/build-e-automacao-spec.md
- scripts/ — apenas bootstrapping aprovado
- Estruturas obrigatórias conforme Docker/NestJS/NPM

---
